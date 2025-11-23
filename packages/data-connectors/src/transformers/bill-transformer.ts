import { CongressBill } from '../sources/congress-gov/types.js';
import { StateBill } from '../sources/openstates/types.js';

export interface TransformedBill {
  id: string;
  externalId: string;
  source: 'congress.gov' | 'openstates' | 'other';
  sourceUrl?: string;
  title: string;
  shortTitle?: string;
  type: string;
  status: string;
  category: string;
  jurisdiction: {
    type: 'federal' | 'state' | 'local';
    code: string;
    name: string;
  };
  session: {
    congress?: number;
    session?: string;
    year?: number;
  };
  sponsor?: {
    id: string;
    name: string;
    party?: string;
    state?: string;
  };
  cosponsorsCount: number;
  introducedDate: Date;
  lastActionDate?: Date;
  lastActionText?: string;
  subjects: string[];
  summary?: string;
  textVersions: {
    version: string;
    date?: Date;
    url?: string;
  }[];
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export class BillTransformer {
  transformCongressBill(bill: CongressBill): TransformedBill {
    const id = `congress-${bill.congress}-${bill.type}-${bill.number}`;

    return {
      id,
      externalId: `${bill.type}${bill.number}`,
      source: 'congress.gov',
      sourceUrl: bill.url,
      title: bill.title,
      type: bill.type,
      status: this.parseCongressStatus(bill.latestAction?.text),
      category: this.mapPolicyArea(bill.policyArea?.name),
      jurisdiction: {
        type: 'federal',
        code: 'US',
        name: 'United States',
      },
      session: {
        congress: bill.congress,
      },
      sponsor: bill.sponsors?.[0]
        ? {
            id: bill.sponsors[0].bioguideId,
            name: bill.sponsors[0].fullName,
            party: bill.sponsors[0].party,
            state: bill.sponsors[0].state,
          }
        : undefined,
      cosponsorsCount: bill.cosponsors?.count ?? 0,
      introducedDate: new Date(bill.introducedDate),
      lastActionDate: bill.latestAction?.actionDate
        ? new Date(bill.latestAction.actionDate)
        : undefined,
      lastActionText: bill.latestAction?.text,
      subjects: [],
      metadata: {
        originChamber: bill.originChamber,
        originChamberCode: bill.originChamberCode,
        constitutionalAuthority: bill.constitutionalAuthorityStatementText,
        summariesCount: bill.summaries?.count ?? 0,
        subjectsCount: bill.subjects?.count ?? 0,
      },
      createdAt: new Date(bill.introducedDate),
      updatedAt: bill.updateDate ? new Date(bill.updateDate) : new Date(),
    };
  }

  transformStateBill(bill: StateBill, stateCode: string, stateName: string): TransformedBill {
    const id = `state-${stateCode}-${bill.session}-${bill.identifier}`;

    return {
      id,
      externalId: bill.identifier,
      source: 'openstates',
      title: bill.title,
      type: bill.classification?.[0] ?? 'bill',
      status: this.parseStateStatus(bill.latest_action_description),
      category: bill.subject?.[0] ?? 'other',
      jurisdiction: {
        type: 'state',
        code: stateCode,
        name: stateName,
      },
      session: {
        session: bill.session,
      },
      sponsor: bill.sponsorships?.find((s) => s.primary)
        ? {
            id: bill.sponsorships.find((s) => s.primary)!.person?.id ?? '',
            name: bill.sponsorships.find((s) => s.primary)!.name,
          }
        : undefined,
      cosponsorsCount: bill.sponsorships?.filter((s) => !s.primary).length ?? 0,
      introducedDate: new Date(bill.first_action_date ?? bill.created_at),
      lastActionDate: bill.latest_action_date
        ? new Date(bill.latest_action_date)
        : undefined,
      lastActionText: bill.latest_action_description,
      subjects: bill.subject ?? [],
      summary: bill.abstracts?.[0]?.abstract,
      textVersions:
        bill.versions?.map((v) => ({
          version: v.note,
          date: v.date ? new Date(v.date) : undefined,
          url: v.url ?? v.links?.[0]?.url,
        })) ?? [],
      metadata: {
        classification: bill.classification,
        extras: bill.extras,
        fromOrganization: bill.from_organization,
        actionsCount: bill.actions?.length ?? 0,
        votesCount: bill.votes?.length ?? 0,
      },
      createdAt: new Date(bill.created_at),
      updatedAt: new Date(bill.updated_at),
    };
  }

  private parseCongressStatus(actionText?: string): string {
    if (!actionText) return 'unknown';

    const text = actionText.toLowerCase();

    if (text.includes('became public law') || text.includes('signed by president')) {
      return 'enacted';
    }
    if (text.includes('passed house') && text.includes('passed senate')) {
      return 'passed_both_chambers';
    }
    if (text.includes('passed house') || text.includes('passed senate')) {
      return 'passed_one_chamber';
    }
    if (text.includes('reported') || text.includes('ordered to be reported')) {
      return 'in_committee';
    }
    if (text.includes('referred to')) {
      return 'referred';
    }
    if (text.includes('vetoed')) {
      return 'vetoed';
    }
    if (text.includes('failed')) {
      return 'failed';
    }

    return 'introduced';
  }

  private parseStateStatus(actionText?: string): string {
    if (!actionText) return 'unknown';

    const text = actionText.toLowerCase();

    if (text.includes('signed by governor') || text.includes('became law')) {
      return 'enacted';
    }
    if (text.includes('passed') && text.includes('senate') && text.includes('assembly')) {
      return 'passed_both_chambers';
    }
    if (text.includes('passed')) {
      return 'passed_one_chamber';
    }
    if (text.includes('vetoed')) {
      return 'vetoed';
    }
    if (text.includes('referred')) {
      return 'referred';
    }

    return 'introduced';
  }

  private mapPolicyArea(policyArea?: string): string {
    if (!policyArea) return 'other';

    const mappings: Record<string, string> = {
      'agriculture and food': 'agriculture',
      'armed forces and national security': 'defense',
      'civil rights and liberties, minority issues': 'civil_rights',
      commerce: 'commerce',
      'crime and law enforcement': 'law_enforcement',
      'economics and public finance': 'economy',
      education: 'education',
      'emergency management': 'emergency',
      energy: 'energy',
      'environmental protection': 'environment',
      families: 'social_services',
      'finance and financial sector': 'finance',
      'foreign trade and international finance': 'trade',
      'government operations and politics': 'government',
      health: 'health',
      'housing and community development': 'housing',
      immigration: 'immigration',
      'international affairs': 'foreign_affairs',
      'labor and employment': 'labor',
      law: 'law',
      'native americans': 'native_affairs',
      'public lands and natural resources': 'public_lands',
      'science, technology, communications': 'technology',
      'social welfare': 'social_services',
      'sports and recreation': 'recreation',
      taxation: 'taxation',
      'transportation and public works': 'transportation',
      'water resources development': 'infrastructure',
    };

    const normalized = policyArea.toLowerCase();
    return mappings[normalized] ?? 'other';
  }
}

export function createBillTransformer(): BillTransformer {
  return new BillTransformer();
}
