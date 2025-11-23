import { z } from 'zod';

export const StateSchema = z.object({
  id: z.string(),
  name: z.string(),
  abbreviation: z.string(),
  classification: z.string(),
  division_id: z.string().optional(),
  url: z.string().url().optional(),
  legislature_name: z.string().optional(),
  legislature_url: z.string().url().optional(),
  capitol_timezone: z.string().optional(),
  latest_update: z.string().optional(),
});

export type State = z.infer<typeof StateSchema>;

export const StateBillSchema = z.object({
  id: z.string(),
  session: z.string(),
  identifier: z.string(),
  title: z.string(),
  classification: z.array(z.string()),
  subject: z.array(z.string()).optional(),
  extras: z.record(z.unknown()).optional(),
  created_at: z.string(),
  updated_at: z.string(),
  first_action_date: z.string().optional(),
  latest_action_date: z.string().optional(),
  latest_action_description: z.string().optional(),
  latest_passage_date: z.string().optional(),
  abstracts: z.array(z.object({
    abstract: z.string(),
    note: z.string().optional(),
  })).optional(),
  from_organization: z.object({
    name: z.string(),
    classification: z.string(),
  }).optional(),
  sponsorships: z.array(z.object({
    name: z.string(),
    entity_type: z.string(),
    primary: z.boolean(),
    classification: z.string(),
    person: z.object({
      id: z.string(),
      name: z.string(),
    }).optional(),
  })).optional(),
  actions: z.array(z.object({
    organization: z.object({
      name: z.string(),
      classification: z.string(),
    }),
    description: z.string(),
    date: z.string(),
    classification: z.array(z.string()),
  })).optional(),
  versions: z.array(z.object({
    note: z.string(),
    date: z.string().optional(),
    url: z.string().url().optional(),
    links: z.array(z.object({
      url: z.string().url(),
      media_type: z.string(),
    })).optional(),
  })).optional(),
  votes: z.array(z.object({
    id: z.string(),
    motion_text: z.string(),
    start_date: z.string(),
    result: z.enum(['pass', 'fail']),
    counts: z.array(z.object({
      option: z.string(),
      value: z.number(),
    })),
  })).optional(),
});

export type StateBill = z.infer<typeof StateBillSchema>;

export const StateLegislatorSchema = z.object({
  id: z.string(),
  name: z.string(),
  given_name: z.string().optional(),
  family_name: z.string().optional(),
  image: z.string().url().optional(),
  email: z.string().email().optional(),
  party: z.object({
    name: z.string(),
  }).optional(),
  current_role: z.object({
    title: z.string(),
    org_classification: z.string(),
    district: z.string(),
    division_id: z.string().optional(),
  }).optional(),
  jurisdiction: z.object({
    id: z.string(),
    name: z.string(),
  }).optional(),
  extras: z.record(z.unknown()).optional(),
});

export type StateLegislator = z.infer<typeof StateLegislatorSchema>;

export const SessionSchema = z.object({
  identifier: z.string(),
  name: z.string(),
  classification: z.string(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
});

export type Session = z.infer<typeof SessionSchema>;

export interface OpenStatesSearchParams {
  jurisdiction?: string;
  session?: string;
  chamber?: 'upper' | 'lower';
  classification?: string | string[];
  subject?: string | string[];
  updated_since?: string;
  created_since?: string;
  action_since?: string;
  q?: string;
  page?: number;
  per_page?: number;
}
