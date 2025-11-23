/**
 * User Service Schemas - Zod Validation
 */

import { z } from 'zod';

export const updateProfileSchema = z.object({
  preferredName: z
    .string()
    .max(100, 'Preferred name must be at most 100 characters')
    .optional(),
  contactPhone: z
    .string()
    .max(50, 'Phone number must be at most 50 characters')
    .regex(/^[+]?[\d\s()-]*$/, 'Invalid phone number format')
    .optional()
    .nullable(),
  primaryRegionId: z.string().uuid('Invalid region ID').optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const deleteAccountSchema = z.object({
  password: z.string().min(1, 'Password is required for account deletion'),
  confirmation: z.literal('DELETE MY ACCOUNT', {
    errorMap: () => ({ message: 'You must type "DELETE MY ACCOUNT" to confirm' }),
  }),
});

export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;

export const updatePreferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).optional(),
  language: z
    .string()
    .min(2)
    .max(10)
    .regex(/^[a-z]{2}(-[A-Z]{2})?$/, 'Invalid language code')
    .optional(),
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  publicProfile: z.boolean().optional(),
  showVotingHistory: z.boolean().optional(),
});

export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;

export const searchUsersSchema = z.object({
  query: z.string().min(2, 'Search query must be at least 2 characters').max(100),
  limit: z.coerce.number().min(1).max(50).optional().default(20),
  offset: z.coerce.number().min(0).optional().default(0),
});

export type SearchUsersInput = z.infer<typeof searchUsersSchema>;
