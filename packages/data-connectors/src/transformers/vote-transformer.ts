import { CongressVote } from '../sources/congress-gov/types.js';
import { StateBill } from '../sources/openstates/types.js';

export interface TransformedVote {
  id: string;
  externalId: string;
  source: 'congress.gov' | 'openstates' | 'other';
  sourceUrl?: string;
  billId?: string;
  chamber: 'house' | 'senate' | 'upper' | 'lower';
  jurisdiction: {
    type: 'federal' | 'state' | 'local';
    code: string;
    name: string;
  };
  session: {
    congress?: number;
    session?: number | string;
    year?: number;
  };
  rollNumber?: number;
  question: string;
  result: 'passed' | 'failed' | 'unknown';
  date: Date;
  counts: {
    yea: number;
    nay: number;
    present: number;
    notVoting: number;
  };
  threshold?: string;
  memberVotes?: MemberVote[];
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface MemberVote {
  memberId: string;
  memberName: string;
  party?: string;
  state?: string;
  vote: 'yea' | 'nay' | 'present' | 'not_voting';
}

export class VoteTransformer {
  transformCongressVote(vote: CongressVote): TransformedVote {
    const id = `congress-vote-${vote.congress}-${vote.chamber}-${vote.session}-${vote.rollNumber}`;

    return {
      id,
      externalId: `${vote.congress}-${vote.chamber}-${vote.session}-${vote.rollNumber}`,
      source: 'congress.gov',
      sourceUrl: vote.url,
      chamber: vote.chamber.toLowerCase() as 'house' | 'senate',
      jurisdiction: {
        type: 'federal',
        code: 'US',
        name: 'United States',
      },
      session: {
        congress: vote.congress,
        session: vote.session,
      },
      rollNumber: vote.rollNumber,
      question: vote.question,
      result: this.parseResult(vote.result),
      date: new Date(vote.date),
      counts: {
        yea: vote.yeas ?? 0,
        nay: vote.nays ?? 0,
        present: vote.present ?? 0,
        notVoting: vote.notVoting ?? 0,
      },
      metadata: {},
      createdAt: new Date(vote.date),
      updatedAt: new Date(vote.date),
    };
  }

  transformStateVote(
    vote: NonNullable<StateBill['votes']>[number],
    bill: StateBill,
    stateCode: string,
    stateName: string
  ): TransformedVote {
    const id = `state-vote-${stateCode}-${vote.id}`;

    const counts = vote.counts.reduce(
      (acc, c) => {
        const option = c.option.toLowerCase();
        if (option === 'yes' || option === 'yea' || option === 'aye') {
          acc.yea = c.value;
        } else if (option === 'no' || option === 'nay') {
          acc.nay = c.value;
        } else if (option === 'present' || option === 'abstain') {
          acc.present = c.value;
        } else if (option.includes('not voting') || option === 'absent') {
          acc.notVoting = c.value;
        }
        return acc;
      },
      { yea: 0, nay: 0, present: 0, notVoting: 0 }
    );

    return {
      id,
      externalId: vote.id,
      source: 'openstates',
      billId: bill.id,
      chamber: 'lower', // Would need to determine from context
      jurisdiction: {
        type: 'state',
        code: stateCode,
        name: stateName,
      },
      session: {
        session: bill.session,
      },
      question: vote.motion_text,
      result: vote.result === 'pass' ? 'passed' : 'failed',
      date: new Date(vote.start_date),
      counts,
      metadata: {
        billIdentifier: bill.identifier,
        billTitle: bill.title,
      },
      createdAt: new Date(vote.start_date),
      updatedAt: new Date(vote.start_date),
    };
  }

  private parseResult(result: string): 'passed' | 'failed' | 'unknown' {
    const lower = result.toLowerCase();
    if (
      lower.includes('passed') ||
      lower.includes('agreed') ||
      lower.includes('adopted')
    ) {
      return 'passed';
    }
    if (
      lower.includes('failed') ||
      lower.includes('rejected') ||
      lower.includes('not agreed')
    ) {
      return 'failed';
    }
    return 'unknown';
  }

  aggregateVotes(votes: TransformedVote[]): {
    totalVotes: number;
    passed: number;
    failed: number;
    averageYea: number;
    averageNay: number;
    averageParticipation: number;
  } {
    if (votes.length === 0) {
      return {
        totalVotes: 0,
        passed: 0,
        failed: 0,
        averageYea: 0,
        averageNay: 0,
        averageParticipation: 0,
      };
    }

    const passed = votes.filter((v) => v.result === 'passed').length;
    const failed = votes.filter((v) => v.result === 'failed').length;

    const totalYea = votes.reduce((sum, v) => sum + v.counts.yea, 0);
    const totalNay = votes.reduce((sum, v) => sum + v.counts.nay, 0);
    const totalVoting = votes.reduce(
      (sum, v) => sum + v.counts.yea + v.counts.nay + v.counts.present,
      0
    );
    const totalEligible = votes.reduce(
      (sum, v) =>
        sum + v.counts.yea + v.counts.nay + v.counts.present + v.counts.notVoting,
      0
    );

    return {
      totalVotes: votes.length,
      passed,
      failed,
      averageYea: totalYea / votes.length,
      averageNay: totalNay / votes.length,
      averageParticipation: totalEligible > 0 ? (totalVoting / totalEligible) * 100 : 0,
    };
  }
}

export function createVoteTransformer(): VoteTransformer {
  return new VoteTransformer();
}
