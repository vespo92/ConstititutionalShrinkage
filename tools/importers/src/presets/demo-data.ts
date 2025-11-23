export interface DemoDataPreset {
  name: string;
  description: string;
  recordCounts: {
    bills: number;
    legislators: number;
    votes: number;
    regions: number;
  };
  options: {
    randomize: boolean;
    includeSampleVotes: boolean;
  };
}

export function getDemoDataPreset(scale: 'small' | 'medium' | 'large' = 'medium'): DemoDataPreset {
  const scales = {
    small: { bills: 50, legislators: 20, votes: 30, regions: 10 },
    medium: { bills: 200, legislators: 100, votes: 150, regions: 50 },
    large: { bills: 1000, legislators: 535, votes: 500, regions: 100 },
  };

  return {
    name: `Demo Data (${scale})`,
    description: `Generate ${scale} demo dataset for testing and development`,
    recordCounts: scales[scale],
    options: {
      randomize: true,
      includeSampleVotes: true,
    },
  };
}

export const demoDataConfig = {
  billTemplates: [
    {
      prefix: 'HR',
      title: 'To provide for the improvement of',
      categories: ['economy', 'education', 'health', 'environment'],
    },
    {
      prefix: 'S',
      title: 'An Act to amend the',
      categories: ['defense', 'finance', 'transportation', 'technology'],
    },
  ],
  parties: ['Democratic', 'Republican', 'Independent'],
  states: [
    'CA', 'TX', 'FL', 'NY', 'PA', 'IL', 'OH', 'GA', 'NC', 'MI',
    'NJ', 'VA', 'WA', 'AZ', 'MA', 'TN', 'IN', 'MD', 'MO', 'WI',
  ],
  statuses: [
    { status: 'introduced', weight: 40 },
    { status: 'referred', weight: 25 },
    { status: 'in_committee', weight: 15 },
    { status: 'passed_one_chamber', weight: 10 },
    { status: 'passed_both_chambers', weight: 5 },
    { status: 'enacted', weight: 3 },
    { status: 'vetoed', weight: 2 },
  ],
};

export function generateDemoBill(index: number): Record<string, unknown> {
  const template = demoDataConfig.billTemplates[index % 2];
  const state = demoDataConfig.states[index % demoDataConfig.states.length];
  const party = demoDataConfig.parties[index % 3];
  const category = template.categories[index % template.categories.length];

  return {
    id: `demo-${template.prefix.toLowerCase()}-${1000 + index}`,
    externalId: `${template.prefix}${1000 + index}`,
    title: `${template.title} ${category} services in the United States`,
    type: template.prefix.toLowerCase(),
    status: selectWeightedStatus(),
    category,
    sponsor: {
      id: `demo-sponsor-${index}`,
      name: `Demo Legislator ${index}`,
      party,
      state,
    },
    introducedDate: randomDate(2023, 2024),
    cosponsorsCount: Math.floor(Math.random() * 50),
  };
}

export function generateDemoLegislator(index: number): Record<string, unknown> {
  const state = demoDataConfig.states[index % demoDataConfig.states.length];
  const party = demoDataConfig.parties[index % 3];
  const chamber = index % 5 === 0 ? 'senate' : 'house';

  return {
    id: `demo-legislator-${index}`,
    externalId: `DL${String(index).padStart(6, '0')}`,
    name: `Demo Legislator ${index}`,
    party,
    state,
    chamber,
    district: chamber === 'house' ? (index % 53) + 1 : undefined,
  };
}

function selectWeightedStatus(): string {
  const rand = Math.random() * 100;
  let cumulative = 0;

  for (const { status, weight } of demoDataConfig.statuses) {
    cumulative += weight;
    if (rand < cumulative) return status;
  }

  return 'introduced';
}

function randomDate(startYear: number, endYear: number): string {
  const start = new Date(startYear, 0, 1).getTime();
  const end = new Date(endYear, 11, 31).getTime();
  const date = new Date(start + Math.random() * (end - start));
  return date.toISOString().split('T')[0];
}
