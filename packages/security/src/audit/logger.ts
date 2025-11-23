/**
 * Audit Logger
 *
 * Lightweight audit logging utilities for use in applications.
 */

import crypto from 'node:crypto';

export interface AuditEntry {
  id: string;
  timestamp: Date;
  action: string;
  userId?: string;
  resourceType: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  outcome: 'success' | 'failure';
  details?: Record<string, unknown>;
  hash: string;
}

export interface AuditLoggerConfig {
  serviceName: string;
  includeCallStack?: boolean;
  hashSecret?: string;
}

/**
 * Create an audit logger instance
 */
export function createAuditLogger(config: AuditLoggerConfig) {
  const hashSecret = config.hashSecret || 'default-audit-secret';

  /**
   * Create audit log entry
   */
  function log(params: {
    action: string;
    userId?: string;
    resourceType: string;
    resourceId?: string;
    ipAddress?: string;
    userAgent?: string;
    outcome: 'success' | 'failure';
    details?: Record<string, unknown>;
  }): AuditEntry {
    const id = crypto.randomBytes(16).toString('hex');
    const timestamp = new Date();

    const entry: Omit<AuditEntry, 'hash'> = {
      id,
      timestamp,
      ...params,
    };

    // Create tamper-proof hash
    const hashContent = JSON.stringify({
      ...entry,
      service: config.serviceName,
    });
    const hash = crypto
      .createHmac('sha256', hashSecret)
      .update(hashContent)
      .digest('hex');

    return { ...entry, hash };
  }

  /**
   * Verify audit log entry integrity
   */
  function verify(entry: AuditEntry): boolean {
    const { hash, ...rest } = entry;
    const hashContent = JSON.stringify({
      ...rest,
      service: config.serviceName,
    });
    const expectedHash = crypto
      .createHmac('sha256', hashSecret)
      .update(hashContent)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(hash),
      Buffer.from(expectedHash)
    );
  }

  /**
   * Create structured log message
   */
  function format(entry: AuditEntry): string {
    return JSON.stringify({
      type: 'audit',
      service: config.serviceName,
      ...entry,
      timestamp: entry.timestamp.toISOString(),
    });
  }

  return {
    log,
    verify,
    format,

    // Convenience methods
    logSuccess: (params: Omit<Parameters<typeof log>[0], 'outcome'>) =>
      log({ ...params, outcome: 'success' }),

    logFailure: (params: Omit<Parameters<typeof log>[0], 'outcome'>) =>
      log({ ...params, outcome: 'failure' }),

    // Common actions
    logLogin: (userId: string, ipAddress: string, success: boolean) =>
      log({
        action: 'login',
        userId,
        resourceType: 'auth',
        ipAddress,
        outcome: success ? 'success' : 'failure',
      }),

    logLogout: (userId: string, ipAddress: string) =>
      log({
        action: 'logout',
        userId,
        resourceType: 'auth',
        ipAddress,
        outcome: 'success',
      }),

    logCreate: (
      userId: string,
      resourceType: string,
      resourceId: string,
      success: boolean
    ) =>
      log({
        action: 'create',
        userId,
        resourceType,
        resourceId,
        outcome: success ? 'success' : 'failure',
      }),

    logUpdate: (
      userId: string,
      resourceType: string,
      resourceId: string,
      changes: Record<string, unknown>,
      success: boolean
    ) =>
      log({
        action: 'update',
        userId,
        resourceType,
        resourceId,
        details: { changes },
        outcome: success ? 'success' : 'failure',
      }),

    logDelete: (
      userId: string,
      resourceType: string,
      resourceId: string,
      success: boolean
    ) =>
      log({
        action: 'delete',
        userId,
        resourceType,
        resourceId,
        outcome: success ? 'success' : 'failure',
      }),

    logAccess: (
      userId: string,
      resourceType: string,
      resourceId: string,
      ipAddress?: string
    ) =>
      log({
        action: 'access',
        userId,
        resourceType,
        resourceId,
        ipAddress,
        outcome: 'success',
      }),

    logAdminAction: (
      userId: string,
      action: string,
      target: string,
      details?: Record<string, unknown>
    ) =>
      log({
        action: `admin:${action}`,
        userId,
        resourceType: 'admin',
        resourceId: target,
        details,
        outcome: 'success',
      }),
  };
}

/**
 * Create request context for audit logging
 */
export function createRequestContext(request: {
  ip?: string;
  headers?: Record<string, string | string[] | undefined>;
  userId?: string;
}): {
  ipAddress?: string;
  userAgent?: string;
  userId?: string;
} {
  return {
    ipAddress: request.ip,
    userAgent: request.headers?.['user-agent'] as string | undefined,
    userId: request.userId,
  };
}
