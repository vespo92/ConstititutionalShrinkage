export interface StateCAPreset {
  name: string;
  description: string;
  state: string;
  stateName: string;
  sessions: string[];
  types: string[];
  options: {
    batchSize: number;
    concurrency: number;
    retryAttempts: number;
  };
}

export function getStateCAPreset(session?: string): StateCAPreset {
  return {
    name: 'California Legislation Import',
    description: 'Import bills and legislators from California State Legislature',
    state: 'CA',
    stateName: 'California',
    sessions: session ? [session] : ['2023-2024', '2021-2022'],
    types: ['bills', 'legislators'],
    options: {
      batchSize: 50,
      concurrency: 3,
      retryAttempts: 3,
    },
  };
}

export const stateCAConfig = {
  jurisdictionId: 'ocd-jurisdiction/country:us/state:ca/government',
  chambers: ['upper', 'lower'],
  billTypes: ['bill', 'resolution', 'concurrent_resolution', 'constitutional_amendment'],
  mappings: {
    bills: [
      { source: 'identifier', target: 'externalId' },
      { source: 'title', target: 'title' },
      { source: 'classification[0]', target: 'type' },
      { source: 'subject', target: 'subjects' },
      { source: 'first_action_date', target: 'createdAt' },
      { source: 'latest_action_description', target: 'status' },
    ],
    legislators: [
      { source: 'id', target: 'externalId' },
      { source: 'name', target: 'name' },
      { source: 'party.name', target: 'party' },
      { source: 'current_role.district', target: 'district' },
    ],
  },
  expectedRecords: {
    bills: 5000,
    legislators: 120,
  },
};
