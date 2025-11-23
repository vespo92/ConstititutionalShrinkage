/**
 * User Service Types
 */

export interface UserProfile {
  id: string;
  email: string;
  legalName: string;
  preferredName?: string;
  primaryRegionId: string;
  verificationLevel: string;
  votingPower: number;
  reputation: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PublicUserProfile {
  id: string;
  preferredName?: string;
  verificationLevel: string;
  votingPower: number;
  reputation: number;
  regions: Array<{ id: string; name: string }>;
  createdAt: Date;
}

export interface UserPreferences {
  userId: string;
  theme: 'light' | 'dark' | 'system';
  language: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  publicProfile: boolean;
  showVotingHistory: boolean;
}

export interface VerificationStatus {
  currentLevel: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  idVerified: boolean;
  biometricVerified: boolean;
  nextLevel?: string;
  requirements?: string[];
}

// JWT payload from auth service
export interface TokenPayload {
  userId: string;
  personId: string;
  email: string;
  roles: string[];
  permissions: string[];
  verificationLevel: string;
  votingPower: number;
  regions: string[];
  iat?: number;
  exp?: number;
}

declare module 'fastify' {
  interface FastifySchema {
    tags?: string[];
    summary?: string;
    security?: Array<Record<string, string[]>>;
  }
}
