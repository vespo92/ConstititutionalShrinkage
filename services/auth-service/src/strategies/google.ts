/**
 * Google OAuth2 Strategy
 *
 * Handles Google OAuth2 authentication flow.
 */

import { OAuthProvider, type OAuthUserInfo, type OAuthTokens } from '../types/index.js';

// Configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const GOOGLE_REDIRECT_URI =
  process.env.GOOGLE_REDIRECT_URI ||
  `${process.env.BASE_URL || 'http://localhost:3002'}/auth/google/callback`;

// Google OAuth2 endpoints
const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';

// OAuth2 scopes
const GOOGLE_SCOPES = ['openid', 'email', 'profile'];

/**
 * Check if Google OAuth is configured
 */
export function isGoogleConfigured(): boolean {
  return Boolean(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET);
}

/**
 * Generate Google OAuth2 authorization URL
 */
export function getGoogleAuthUrl(state: string, nonce?: string): string {
  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: GOOGLE_SCOPES.join(' '),
    state,
    access_type: 'offline',
    prompt: 'consent',
  });

  if (nonce) {
    params.set('nonce', nonce);
  }

  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeGoogleCode(code: string): Promise<OAuthTokens> {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Google token exchange failed:', error);
    throw new Error('Failed to exchange authorization code');
  }

  const data = await response.json() as any;

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
    tokenType: data.token_type,
    scope: data.scope,
  };
}

/**
 * Get user info from Google
 */
export async function getGoogleUserInfo(
  accessToken: string
): Promise<OAuthUserInfo> {
  const response = await fetch(GOOGLE_USERINFO_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Google userinfo request failed:', error);
    throw new Error('Failed to get user information from Google');
  }

  const data = await response.json() as any;

  return {
    provider: OAuthProvider.GOOGLE,
    providerId: data.id,
    email: data.email,
    name: data.name,
    picture: data.picture,
    emailVerified: data.verified_email,
  };
}

/**
 * Revoke Google OAuth tokens
 */
export async function revokeGoogleToken(token: string): Promise<void> {
  const response = await fetch(
    `https://oauth2.googleapis.com/revoke?token=${token}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );

  if (!response.ok) {
    const error = await response.text();
    console.error('Google token revocation failed:', error);
    // Don't throw - revocation failure shouldn't block the logout flow
  }
}

/**
 * Refresh Google access token
 */
export async function refreshGoogleToken(
  refreshToken: string
): Promise<OAuthTokens> {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Google token refresh failed:', error);
    throw new Error('Failed to refresh Google token');
  }

  const data = await response.json() as any;

  return {
    accessToken: data.access_token,
    refreshToken: refreshToken, // Google doesn't return new refresh token
    expiresIn: data.expires_in,
    tokenType: data.token_type,
    scope: data.scope,
  };
}

/**
 * Validate Google ID token (for Sign In with Google)
 */
export async function validateGoogleIdToken(
  idToken: string
): Promise<OAuthUserInfo | null> {
  try {
    const response = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json() as any;

    // Verify the token is for our app
    if (data.aud !== GOOGLE_CLIENT_ID) {
      console.error('Google ID token audience mismatch');
      return null;
    }

    // Verify email is verified
    if (data.email_verified !== 'true') {
      console.error('Google email not verified');
      return null;
    }

    return {
      provider: OAuthProvider.GOOGLE,
      providerId: data.sub,
      email: data.email,
      name: data.name,
      picture: data.picture,
      emailVerified: true,
    };
  } catch (error) {
    console.error('Google ID token validation failed:', error);
    return null;
  }
}
