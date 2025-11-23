import { CongressMember } from '../sources/congress-gov/types.js';
import { StateLegislator } from '../sources/openstates/types.js';
import { FecCandidate } from '../sources/fec/types.js';

export interface TransformedPerson {
  id: string;
  externalIds: {
    bioguideId?: string;
    fecId?: string;
    openstatesId?: string;
  };
  source: 'congress.gov' | 'openstates' | 'fec' | 'other';
  name: {
    full: string;
    first?: string;
    last?: string;
    nickname?: string;
  };
  party?: string;
  imageUrl?: string;
  email?: string;
  currentRole?: {
    title: string;
    chamber?: 'house' | 'senate' | 'upper' | 'lower';
    state: string;
    district?: string | number;
    startDate?: Date;
  };
  jurisdiction: {
    type: 'federal' | 'state' | 'local';
    code: string;
    name: string;
  };
  terms?: {
    congress?: number;
    chamber: string;
    startYear: number;
    endYear?: number;
  }[];
  contact?: {
    office?: string;
    phone?: string;
    website?: string;
  };
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export class PersonTransformer {
  transformCongressMember(member: CongressMember): TransformedPerson {
    const id = `congress-${member.bioguideId}`;

    return {
      id,
      externalIds: {
        bioguideId: member.bioguideId,
      },
      source: 'congress.gov',
      name: {
        full: member.fullName ?? `${member.firstName} ${member.lastName}`,
        first: member.firstName,
        last: member.lastName,
      },
      party: member.party,
      imageUrl: member.depiction?.imageUrl,
      currentRole: member.chamber
        ? {
            title: member.chamber === 'House' ? 'Representative' : 'Senator',
            chamber: member.chamber.toLowerCase() as 'house' | 'senate',
            state: member.state,
            district: member.district,
          }
        : undefined,
      jurisdiction: {
        type: 'federal',
        code: 'US',
        name: 'United States',
      },
      terms: member.terms?.map((t) => ({
        congress: t.congress,
        chamber: t.chamber,
        startYear: t.startYear,
        endYear: t.endYear,
      })),
      metadata: {
        depiction: member.depiction,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  transformStateLegislator(
    legislator: StateLegislator,
    stateCode: string,
    stateName: string
  ): TransformedPerson {
    const id = `state-${stateCode}-${legislator.id}`;

    return {
      id,
      externalIds: {
        openstatesId: legislator.id,
      },
      source: 'openstates',
      name: {
        full: legislator.name,
        first: legislator.given_name,
        last: legislator.family_name,
      },
      party: legislator.party?.name,
      imageUrl: legislator.image,
      email: legislator.email,
      currentRole: legislator.current_role
        ? {
            title: legislator.current_role.title,
            chamber: legislator.current_role.org_classification as 'upper' | 'lower',
            state: stateCode,
            district: legislator.current_role.district,
          }
        : undefined,
      jurisdiction: {
        type: 'state',
        code: stateCode,
        name: stateName,
      },
      metadata: {
        extras: legislator.extras,
        divisionId: legislator.current_role?.division_id,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  transformFecCandidate(candidate: FecCandidate): TransformedPerson {
    const id = `fec-${candidate.candidateId}`;

    const officeMap: Record<string, string> = {
      H: 'Representative',
      S: 'Senator',
      P: 'President',
    };

    return {
      id,
      externalIds: {
        fecId: candidate.candidateId,
      },
      source: 'fec',
      name: {
        full: candidate.name,
      },
      party: candidate.partyFull ?? candidate.party,
      currentRole: candidate.office
        ? {
            title: officeMap[candidate.office] ?? 'Candidate',
            chamber:
              candidate.office === 'H'
                ? 'house'
                : candidate.office === 'S'
                  ? 'senate'
                  : undefined,
            state: candidate.state ?? '',
            district: candidate.district,
          }
        : undefined,
      jurisdiction: {
        type: 'federal',
        code: 'US',
        name: 'United States',
      },
      metadata: {
        incumbentChallenge: candidate.incumbentChallenge,
        electionYears: candidate.electionYears,
        cycles: candidate.cycles,
        principalCommittees: candidate.principalCommittees,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  mergePersonRecords(records: TransformedPerson[]): TransformedPerson {
    if (records.length === 0) {
      throw new Error('Cannot merge empty records');
    }

    if (records.length === 1) {
      return records[0];
    }

    const primary = records[0];
    const merged: TransformedPerson = { ...primary };

    merged.externalIds = records.reduce(
      (ids, r) => ({ ...ids, ...r.externalIds }),
      {}
    );

    merged.metadata = records.reduce(
      (meta, r) => ({
        ...meta,
        ...r.metadata,
        sources: [...((meta.sources as string[]) ?? []), r.source],
      }),
      { sources: [] as string[] }
    );

    for (const record of records.slice(1)) {
      if (!merged.imageUrl && record.imageUrl) {
        merged.imageUrl = record.imageUrl;
      }
      if (!merged.email && record.email) {
        merged.email = record.email;
      }
      if (!merged.party && record.party) {
        merged.party = record.party;
      }
    }

    return merged;
  }

  normalizeParty(party?: string): string | undefined {
    if (!party) return undefined;

    const lower = party.toLowerCase();
    if (lower.includes('democrat')) return 'Democratic';
    if (lower.includes('republican')) return 'Republican';
    if (lower.includes('independent')) return 'Independent';
    if (lower.includes('libertarian')) return 'Libertarian';
    if (lower.includes('green')) return 'Green';

    return party;
  }
}

export function createPersonTransformer(): PersonTransformer {
  return new PersonTransformer();
}
