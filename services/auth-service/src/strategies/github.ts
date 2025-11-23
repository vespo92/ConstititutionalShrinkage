/**
 * GitHub OAuth2 Strategy
 *
 * Handles GitHub OAuth2 authentication flow.
 */

import { OAuthProvider, type OAuthUserInfo, type OAuthTokens } from '../types/index.js';

// Configuration
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || '';
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || '';
const GITHUB_REDIRECT_URI =
  process.env.GITHUB_REDIRECT_URI ||
  `${process.env.BASE_URL || 'http://localhost:3002'}/auth/github/callback`;

// GitHub OAuth2 endpoints
const GITHUB_AUTH_URL = 'https://github.com/login/oauth/authorize';
const GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token';
const GITHUB_USER_URL = 'https://api.github.com/user';
const GITHUB_EMAILS_URL = 'https://api.github.com/user/emails';

// OAuth2 scopes
const GITHUB_SCOPES = ['read:user', 'user:email'];

/**
 * Check if GitHub OAuth is configured
 */
export function isGitHubConfigured(): boolean {
  return Boolean(GITHUB_CLIENT_ID && GITHUB_CLIENT_SECRET);
}

/**
 * Generate GitHub OAuth2 authorization URL
 */
export function getGitHubAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: GITHUB_REDIRECT_URI,
    scope: GITHUB_SCOPES.join(' '),
    state,
    allow_signup: 'true',
  });

  return `${GITHUB_AUTH_URL}?${params.toString()}`;
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeGitHubCode(code: string): Promise<OAuthTokens> {
  const response = await fetch(GITHUB_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      client_id: GITHUB_CLIENT_ID,
      client_secret: GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: GITHUB_REDIRECT_URI,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('GitHub token exchange failed:', error);
    throw new Error('Failed to exchange authorization code');
  }

  const data = await response.json() as any;

  if (data.error) {
    console.error('GitHub OAuth error:', data.error_description || data.error);
    throw new Error(data.error_description || 'GitHub authentication failed');
  }

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in || 28800, // GitHub tokens don't expire by default
    tokenType: data.token_type || 'bearer',
    scope: data.scope,
  };
}

/**
 * Get user info from GitHub
 */
export async function getGitHubUserInfo(
  accessToken: string
): Promise<OAuthUserInfo> {
  // Get user profile
  const userResponse = await fetch(GITHUB_USER_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'Constitutional-Shrinkage-Auth',
    },
  });

  if (!userResponse.ok) {
    const error = await userResponse.text();
    console.error('GitHub user request failed:', error);
    throw new Error('Failed to get user information from GitHub');
  }

  const userData = await userResponse.json();

  // Get primary verified email
  let email = userData.email;
  let emailVerified = false;

  if (!email) {
    // Fetch emails if not public
    const emailsResponse = await fetch(GITHUB_EMAILS_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'Constitutional-Shrinkage-Auth',
      },
    });

    if (emailsResponse.ok) {
      const emails = await emailsResponse.json();
      // Find primary verified email
      const primaryEmail = emails.find(
        (e: { primary: boolean; verified: boolean; email: string }) =>
          e.primary && e.verified
      );
      if (primaryEmail) {
        email = primaryEmail.email;
        emailVerified = primaryEmail.verified;
      } else {
        // Fallback to first verified email
        const verifiedEmail = emails.find(
          (e: { verified: boolean; email: string }) => e.verified
        );
        if (verifiedEmail) {
          email = verifiedEmail.email;
          emailVerified = verifiedEmail.verified;
        }
      }
    }
  } else {
    // If email is public, assume it's verified (GitHub shows verified badge)
    emailVerified = true;
  }

  if (!email) {
    throw new Error('Could not get email from GitHub. Please ensure you have a verified email.');
  }

  return {
    provider: OAuthProvider.GITHUB as const,
    providerId: userData.id.toString(),
    email,
    name: userData.name || userData.login,
    picture: userData.avatar_url,
    emailVerified,
  };
}

/**
 * Revoke GitHub OAuth application authorization
 * Note: GitHub doesn't have a standard token revocation endpoint.
 * Users must revoke access from their GitHub settings.
 */
export async function revokeGitHubToken(accessToken: string): Promise<void> {
  // GitHub requires app authentication to revoke tokens
  // This endpoint deletes the app authorization for the user
  try {
    const credentials = Buffer.from(
      `${GITHUB_CLIENT_ID}:${GITHUB_CLIENT_SECRET}`
    ).toString('base64');

    const response = await fetch(
      `https://api.github.com/applications/${GITHUB_CLIENT_ID}/token`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Basic ${credentials}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'Constitutional-Shrinkage-Auth',
        },
        body: JSON.stringify({ access_token: accessToken }),
      }
    );

    if (!response.ok && response.status !== 404) {
      console.error('GitHub token revocation failed:', response.status);
    }
  } catch (error) {
    console.error('GitHub token revocation error:', error);
    // Don't throw - revocation failure shouldn't block the logout flow
  }
}

/**
 * Check if GitHub token is still valid
 */
export async function checkGitHubToken(accessToken: string): Promise<boolean> {
  try {
    const response = await fetch(GITHUB_USER_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'Constitutional-Shrinkage-Auth',
      },
    });

    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Get rate limit info for GitHub API
 */
export async function getGitHubRateLimit(
  accessToken: string
): Promise<{ limit: number; remaining: number; reset: Date } | null> {
  try {
    const response = await fetch('https://api.github.com/rate_limit', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'Constitutional-Shrinkage-Auth',
      },
    });

    if (!response.ok) return null;

    const data = await response.json() as any;
    return {
      limit: data.rate.limit,
      remaining: data.rate.remaining,
      reset: new Date(data.rate.reset * 1000),
    };
  } catch {
    return null;
  }
}
