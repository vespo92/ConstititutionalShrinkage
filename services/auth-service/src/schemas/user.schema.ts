/**
 * User Schemas - Zod Validation
 *
 * Request/response validation schemas for user management endpoints.
 */

import { z } from 'zod';

// ============================================================================
// PROFILE MANAGEMENT
// ============================================================================

export const updateProfileSchema = z.object({
  preferredName: z
    .string()
    .max(100, 'Preferred name must be at most 100 characters')
    .optional(),
  contactPhone: z
    .string()
    .max(50, 'Phone number must be at most 50 characters')
    .regex(/^[+]?[\d\s()-]+$/, 'Invalid phone number format')
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

// ============================================================================
// PREFERENCES
// ============================================================================

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

// ============================================================================
// VERIFICATION
// ============================================================================

export const startVerificationSchema = z.object({
  type: z.enum(['email', 'phone', 'id', 'biometric']),
  data: z.record(z.string()).optional(),
});

export type StartVerificationInput = z.infer<typeof startVerificationSchema>;

export const confirmVerificationSchema = z.object({
  type: z.enum(['email', 'phone', 'id', 'biometric']),
  code: z.string().min(1, 'Verification code is required'),
});

export type ConfirmVerificationInput = z.infer<typeof confirmVerificationSchema>;

// ============================================================================
// USER LOOKUP
// ============================================================================

export const getUserByIdSchema = z.object({
  id: z.string().uuid('Invalid user ID'),
});

export type GetUserByIdInput = z.infer<typeof getUserByIdSchema>;

export const searchUsersSchema = z.object({
  query: z.string().min(2, 'Search query must be at least 2 characters').max(100),
  limit: z.coerce.number().min(1).max(50).optional().default(20),
  offset: z.coerce.number().min(0).optional().default(0),
});

export type SearchUsersInput = z.infer<typeof searchUsersSchema>;

// ============================================================================
// RESPONSE SCHEMAS
// ============================================================================

export const userProfileResponseSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  legalName: z.string(),
  preferredName: z.string().optional(),
  primaryRegionId: z.string().uuid(),
  verificationLevel: z.string(),
  votingPower: z.number(),
  reputation: z.number(),
  createdAt: z.string().datetime(),
});

export const publicUserProfileSchema = z.object({
  id: z.string().uuid(),
  preferredName: z.string().optional(),
  verificationLevel: z.string(),
  votingPower: z.number(),
  reputation: z.number(),
  createdAt: z.string().datetime(),
});

export const userPreferencesResponseSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
  language: z.string(),
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  publicProfile: z.boolean(),
  showVotingHistory: z.boolean(),
});

export const verificationStatusResponseSchema = z.object({
  emailVerified: z.boolean(),
  phoneVerified: z.boolean(),
  idVerified: z.boolean(),
  biometricVerified: z.boolean(),
  currentLevel: z.string(),
  nextLevel: z.string().optional(),
  requirements: z.array(z.string()).optional(),
});
