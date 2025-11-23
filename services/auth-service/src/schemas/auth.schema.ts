/**
 * Auth Schemas - Zod Validation
 *
 * Request/response validation schemas for authentication endpoints.
 */

import { z } from 'zod';

// ============================================================================
// COMMON VALIDATORS
// ============================================================================

const passwordSchema = z
  .string()
  .min(12, 'Password must be at least 12 characters')
  .max(128, 'Password must be at most 128 characters')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

const emailSchema = z
  .string()
  .email('Invalid email address')
  .max(255, 'Email must be at most 255 characters')
  .toLowerCase();

// ============================================================================
// REGISTRATION
// ============================================================================

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  legalName: z
    .string()
    .min(2, 'Legal name must be at least 2 characters')
    .max(200, 'Legal name must be at most 200 characters'),
  preferredName: z
    .string()
    .max(100, 'Preferred name must be at most 100 characters')
    .optional(),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .refine((date) => {
      const dob = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      return age >= 18;
    }, 'Must be at least 18 years old'),
  primaryRegionId: z.string().uuid('Invalid region ID'),
});

export type RegisterInput = z.infer<typeof registerSchema>;

// ============================================================================
// LOGIN
// ============================================================================

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  deviceInfo: z.string().max(500).optional(),
  rememberMe: z.boolean().optional().default(false),
});

export type LoginInput = z.infer<typeof loginSchema>;

// ============================================================================
// PASSWORD MANAGEMENT
// ============================================================================

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: passwordSchema,
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

// ============================================================================
// EMAIL VERIFICATION
// ============================================================================

export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
});

export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;

export const resendVerificationSchema = z.object({
  email: emailSchema,
});

export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>;

// ============================================================================
// TOKEN MANAGEMENT
// ============================================================================

export const revokeTokenSchema = z.object({
  tokenId: z.string().min(1, 'Token ID is required'),
});

export type RevokeTokenInput = z.infer<typeof revokeTokenSchema>;

// ============================================================================
// OAUTH
// ============================================================================

export const oauthCallbackSchema = z.object({
  code: z.string().min(1, 'Authorization code is required'),
  state: z.string().min(1, 'State parameter is required'),
});

export type OAuthCallbackInput = z.infer<typeof oauthCallbackSchema>;

export const oauthInitSchema = z.object({
  returnUrl: z.string().url().optional(),
});

export type OAuthInitInput = z.infer<typeof oauthInitSchema>;

// ============================================================================
// TWO-FACTOR AUTHENTICATION
// ============================================================================

export const enable2FASchema = z.object({
  password: z.string().min(1, 'Password is required'),
});

export type Enable2FAInput = z.infer<typeof enable2FASchema>;

export const verify2FASchema = z.object({
  code: z
    .string()
    .length(6, 'Code must be 6 digits')
    .regex(/^\d+$/, 'Code must contain only digits'),
});

export type Verify2FAInput = z.infer<typeof verify2FASchema>;

// ============================================================================
// RESPONSE SCHEMAS (for documentation)
// ============================================================================

export const authResponseSchema = z.object({
  user: z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    legalName: z.string(),
    preferredName: z.string().optional(),
    verificationLevel: z.string(),
    votingPower: z.number(),
  }),
  accessToken: z.string(),
  expiresIn: z.number(),
});

export const messageResponseSchema = z.object({
  message: z.string(),
  success: z.boolean(),
});

export const errorResponseSchema = z.object({
  error: z.string(),
  code: z.string().optional(),
  details: z.record(z.string()).optional(),
});
