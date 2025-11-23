/**
 * Auth Service - Main Entry Point
 *
 * Handles authentication, authorization, and user verification
 * for the Constitutional Shrinkage platform.
 *
 * Exports middleware and utilities for use by other services (e.g., API Gateway).
 */

// ============================================================================
// SERVER START
// ============================================================================

import { startServer } from './app.js';

// Start server if this is the main module
startServer();

// ============================================================================
// EXPORTS FOR API GATEWAY & OTHER SERVICES
// ============================================================================

// Types
export type {
  TokenPayload,
  RefreshTokenPayload,
  TokenPair,
  Session,
  AuthUser,
  UserProfile,
  UserPreferences,
  OAuthUserInfo,
  OAuthTokens,
} from './types/index.js';

export {
  Role,
  Permission,
  VerificationLevel,
  ROLE_PERMISSIONS,
  OAuthProvider,
} from './types/index.js';

// Middleware
export {
  authGuard,
  optionalAuthGuard,
  emailVerifiedGuard,
  idVerifiedGuard,
  fullKycGuard,
  createAuthGuard,
} from './middleware/auth-guard.js';

export {
  rbac,
  rbacAny,
  requireRole,
  requireAdmin,
  requireSuperAdmin,
  requireLegislator,
  requireJudge,
  requireCitizen,
  hasRole,
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
  getPermissionsForRoles,
} from './middleware/rbac.js';

export {
  createRateLimit,
  loginRateLimit,
  registerRateLimit,
  passwordResetRateLimit,
  oauthRateLimit,
  refreshRateLimit,
  generalApiRateLimit,
} from './middleware/rate-limit.js';

// Token utilities
export {
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
  extractBearerToken,
} from './lib/tokens.js';

// Password utilities
export {
  hashPassword,
  verifyPassword,
  validatePasswordStrength,
} from './lib/password.js';

// App builder (for testing or custom deployments)
export { buildApp, startServer } from './app.js';
