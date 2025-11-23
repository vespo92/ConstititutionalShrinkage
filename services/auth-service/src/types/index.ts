/**
 * Auth Service Types
 *
 * Type definitions for authentication, authorization, and user management.
 */

// ============================================================================
// ENUMS
// ============================================================================

export enum Role {
  CITIZEN = 'citizen',
  DELEGATE = 'delegate',
  LEGISLATOR = 'legislator',
  JUDGE = 'judge',
  ADMINISTRATOR = 'administrator',
  SUPER_ADMIN = 'super_admin',
}

export enum Permission {
  // Voting
  VOTE_CAST = 'vote:cast',
  VOTE_DELEGATE = 'vote:delegate',
  VOTE_VIEW = 'vote:view',

  // Bills
  BILL_CREATE = 'bill:create',
  BILL_EDIT = 'bill:edit',
  BILL_DELETE = 'bill:delete',
  BILL_REVIEW = 'bill:review',
  BILL_SPONSOR = 'bill:sponsor',

  // Users
  USER_VIEW = 'user:view',
  USER_EDIT = 'user:edit',
  USER_MANAGE = 'user:manage',
  USER_VERIFY = 'user:verify',

  // Admin
  ADMIN_ACCESS = 'admin:access',
  ADMIN_MANAGE_USERS = 'admin:manage_users',
  ADMIN_MANAGE_ROLES = 'admin:manage_roles',
  ADMIN_SYSTEM_CONFIG = 'admin:system_config',

  // Judicial
  JUDICIAL_REVIEW = 'judicial:review',
  JUDICIAL_DECIDE = 'judicial:decide',

  // Committees
  COMMITTEE_CREATE = 'committee:create',
  COMMITTEE_MANAGE = 'committee:manage',
  COMMITTEE_JOIN = 'committee:join',
}

export enum VerificationLevel {
  UNVERIFIED = 'UNVERIFIED',
  EMAIL_VERIFIED = 'EMAIL_VERIFIED',
  ID_VERIFIED = 'ID_VERIFIED',
  BIOMETRIC = 'BIOMETRIC',
  FULL_KYC = 'FULL_KYC',
}

export enum OAuthProvider {
  GOOGLE = 'google',
  GITHUB = 'github',
}

// ============================================================================
// ROLE-PERMISSION MAPPING
// ============================================================================

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.CITIZEN]: [
    Permission.VOTE_CAST,
    Permission.VOTE_DELEGATE,
    Permission.VOTE_VIEW,
    Permission.USER_VIEW,
    Permission.USER_EDIT,
  ],
  [Role.DELEGATE]: [
    Permission.VOTE_CAST,
    Permission.VOTE_DELEGATE,
    Permission.VOTE_VIEW,
    Permission.USER_VIEW,
    Permission.USER_EDIT,
    Permission.BILL_SPONSOR,
  ],
  [Role.LEGISLATOR]: [
    Permission.VOTE_CAST,
    Permission.VOTE_DELEGATE,
    Permission.VOTE_VIEW,
    Permission.USER_VIEW,
    Permission.USER_EDIT,
    Permission.BILL_CREATE,
    Permission.BILL_EDIT,
    Permission.BILL_SPONSOR,
    Permission.COMMITTEE_JOIN,
  ],
  [Role.JUDGE]: [
    Permission.VOTE_VIEW,
    Permission.USER_VIEW,
    Permission.BILL_REVIEW,
    Permission.JUDICIAL_REVIEW,
    Permission.JUDICIAL_DECIDE,
  ],
  [Role.ADMINISTRATOR]: [
    Permission.VOTE_VIEW,
    Permission.USER_VIEW,
    Permission.USER_MANAGE,
    Permission.ADMIN_ACCESS,
    Permission.ADMIN_MANAGE_USERS,
    Permission.COMMITTEE_CREATE,
    Permission.COMMITTEE_MANAGE,
  ],
  [Role.SUPER_ADMIN]: Object.values(Permission),
};

// ============================================================================
// TOKEN TYPES
// ============================================================================

export interface TokenPayload {
  userId: string;
  personId: string;
  email: string;
  roles: Role[];
  permissions: Permission[];
  verificationLevel: VerificationLevel;
  votingPower: number;
  regions: string[];
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload extends TokenPayload {
  tokenId: string;
  type: 'refresh';
  deviceInfo?: string;
  ipAddress?: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// ============================================================================
// SESSION TYPES
// ============================================================================

export interface Session {
  userId: string;
  personId: string;
  tokenId: string;
  deviceInfo: string;
  ipAddress: string;
  userAgent?: string;
  createdAt: Date;
  expiresAt: Date;
  lastActivity: Date;
}

// ============================================================================
// USER TYPES
// ============================================================================

export interface AuthUser {
  id: string;
  personId: string;
  email: string;
  passwordHash?: string;
  roles: Role[];
  permissions: Permission[];
  verificationLevel: VerificationLevel;
  votingPower: number;
  regions: string[];
  isActive: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  id: string;
  email: string;
  legalName: string;
  preferredName?: string;
  primaryRegionId: string;
  verificationLevel: VerificationLevel;
  votingPower: number;
  reputation: number;
  createdAt: Date;
}

export interface UserPreferences {
  userId: string;
  theme: 'light' | 'dark' | 'system';
  language: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  twoFactorEnabled: boolean;
  publicProfile: boolean;
  showVotingHistory: boolean;
}

// ============================================================================
// OAUTH TYPES
// ============================================================================

export interface OAuthUserInfo {
  provider: OAuthProvider;
  providerId: string;
  email: string;
  name?: string;
  picture?: string;
  emailVerified?: boolean;
}

export interface OAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  tokenType: string;
  scope?: string;
}

export interface OAuthState {
  provider: OAuthProvider;
  returnUrl?: string;
  nonce: string;
  createdAt: number;
}

// ============================================================================
// REQUEST TYPES
// ============================================================================

export interface RegisterRequest {
  email: string;
  password: string;
  legalName: string;
  preferredName?: string;
  dateOfBirth: string;
  primaryRegionId: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  deviceInfo?: string;
}

export interface PasswordResetRequest {
  token: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// ============================================================================
// RESPONSE TYPES
// ============================================================================

export interface AuthResponse {
  user: UserProfile;
  accessToken: string;
  expiresIn: number;
}

export interface MessageResponse {
  message: string;
  success: boolean;
}

// ============================================================================
// FASTIFY AUGMENTATION
// ============================================================================

declare module 'fastify' {
  interface FastifyRequest {
    user?: TokenPayload;
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: TokenPayload;
    user: TokenPayload;
  }
}
