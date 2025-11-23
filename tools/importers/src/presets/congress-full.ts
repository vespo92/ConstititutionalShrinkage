export interface CongressFullPreset {
  name: string;
  description: string;
  congress: number;
  types: string[];
  options: {
    batchSize: number;
    concurrency: number;
    retryAttempts: number;
    checkpoint: boolean;
  };
}

export function getCongressFullPreset(congress: number): CongressFullPreset {
  return {
    name: `Congress ${congress} Full Import`,
    description: `Complete import of all bills, votes, and members from the ${congress}th Congress`,
    congress,
    types: ['bills', 'votes', 'members', 'committees', 'amendments'],
    options: {
      batchSize: 100,
      concurrency: 5,
      retryAttempts: 3,
      checkpoint: true,
    },
  };
}

export const congressFullConfig = {
  sources: [
    {
      name: 'bills',
      endpoint: '/bill',
      estimatedRecords: 15000,
      transformers: ['billTransformer'],
    },
    {
      name: 'votes',
      endpoint: '/rollcall',
      estimatedRecords: 2000,
      transformers: ['voteTransformer'],
    },
    {
      name: 'members',
      endpoint: '/member',
      estimatedRecords: 600,
      transformers: ['personTransformer'],
    },
    {
      name: 'committees',
      endpoint: '/committee',
      estimatedRecords: 200,
      transformers: ['committeeTransformer'],
    },
  ],
  mappings: {
    bills: [
      { source: 'number', target: 'externalId' },
      { source: 'title', target: 'title' },
      { source: 'introducedDate', target: 'createdAt' },
      { source: 'originChamber', target: 'metadata.chamber' },
      { source: 'policyArea.name', target: 'category' },
      { source: 'latestAction.text', target: 'status' },
    ],
    members: [
      { source: 'bioguideId', target: 'externalId' },
      { source: 'fullName', target: 'name' },
      { source: 'party', target: 'party' },
      { source: 'state', target: 'state' },
    ],
  },
};
