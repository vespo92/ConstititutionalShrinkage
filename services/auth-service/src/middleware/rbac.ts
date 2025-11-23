/**
 * RBAC Middleware
 *
 * Role-Based Access Control for route protection.
 */

import type { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import { Role, Permission, ROLE_PERMISSIONS, type TokenPayload } from '../types/index.js';

export interface RBACOptions {
  /** Required roles (any of these) */
  roles?: Role[];
  /** Required permissions (all of these) */
  permissions?: Permission[];
  /** Required permissions (any of these) */
  anyPermissions?: Permission[];
  /** Custom authorization function */
  custom?: (user: TokenPayload, request: FastifyRequest) => boolean | Promise<boolean>;
}

/**
 * Create RBAC middleware with options
 */
export function createRBAC(options: RBACOptions) {
  return async function rbacMiddleware(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const user = request.user as TokenPayload | undefined;

    if (!user) {
      reply.status(401).send({
        error: 'Unauthorized',
        message: 'Authentication required',
        code: 'NOT_AUTHENTICATED',
      });
      return;
    }

    // Check roles
    if (options.roles && options.roles.length > 0) {
      const hasRole = options.roles.some((role) =>
        user.roles.includes(role)
      );

      if (!hasRole) {
        reply.status(403).send({
          error: 'Forbidden',
          message: 'Insufficient role permissions',
          code: 'INSUFFICIENT_ROLE',
          required: options.roles,
        });
        return;
      }
    }

    // Check all required permissions
    if (options.permissions && options.permissions.length > 0) {
      const hasAllPermissions = options.permissions.every((perm) =>
        user.permissions.includes(perm)
      );

      if (!hasAllPermissions) {
        reply.status(403).send({
          error: 'Forbidden',
          message: 'Insufficient permissions',
          code: 'INSUFFICIENT_PERMISSIONS',
          required: options.permissions,
        });
        return;
      }
    }

    // Check any of the required permissions
    if (options.anyPermissions && options.anyPermissions.length > 0) {
      const hasAnyPermission = options.anyPermissions.some((perm) =>
        user.permissions.includes(perm)
      );

      if (!hasAnyPermission) {
        reply.status(403).send({
          error: 'Forbidden',
          message: 'Insufficient permissions',
          code: 'INSUFFICIENT_PERMISSIONS',
          required: options.anyPermissions,
        });
        return;
      }
    }

    // Custom authorization
    if (options.custom) {
      const authorized = await options.custom(user, request);
      if (!authorized) {
        reply.status(403).send({
          error: 'Forbidden',
          message: 'Access denied',
          code: 'CUSTOM_AUTHORIZATION_FAILED',
        });
        return;
      }
    }
  };
}

/**
 * Shorthand for permission-based RBAC
 */
export function rbac(...permissions: Permission[]) {
  return createRBAC({ permissions });
}

/**
 * Shorthand for any-permission RBAC
 */
export function rbacAny(...permissions: Permission[]) {
  return createRBAC({ anyPermissions: permissions });
}

/**
 * Shorthand for role-based RBAC
 */
export function requireRole(...roles: Role[]) {
  return createRBAC({ roles });
}

/**
 * Check if user has a specific role
 */
export function hasRole(user: TokenPayload | undefined, role: Role): boolean {
  return user?.roles.includes(role) ?? false;
}

/**
 * Check if user has a specific permission
 */
export function hasPermission(
  user: TokenPayload | undefined,
  permission: Permission
): boolean {
  return user?.permissions.includes(permission) ?? false;
}

/**
 * Check if user has all specified permissions
 */
export function hasAllPermissions(
  user: TokenPayload | undefined,
  permissions: Permission[]
): boolean {
  if (!user) return false;
  return permissions.every((p) => user.permissions.includes(p));
}

/**
 * Check if user has any of the specified permissions
 */
export function hasAnyPermission(
  user: TokenPayload | undefined,
  permissions: Permission[]
): boolean {
  if (!user) return false;
  return permissions.some((p) => user.permissions.includes(p));
}

/**
 * Get all permissions for a set of roles
 */
export function getPermissionsForRoles(roles: Role[]): Permission[] {
  const permissions = new Set<Permission>();

  for (const role of roles) {
    const rolePerms = ROLE_PERMISSIONS[role];
    if (rolePerms) {
      rolePerms.forEach((p) => permissions.add(p));
    }
  }

  return Array.from(permissions);
}

/**
 * Pre-built middleware for common use cases
 */
export const requireAdmin = requireRole(Role.ADMINISTRATOR, Role.SUPER_ADMIN);
export const requireSuperAdmin = requireRole(Role.SUPER_ADMIN);
export const requireLegislator = requireRole(Role.LEGISLATOR, Role.SUPER_ADMIN);
export const requireJudge = requireRole(Role.JUDGE, Role.SUPER_ADMIN);
export const requireCitizen = requireRole(
  Role.CITIZEN,
  Role.DELEGATE,
  Role.LEGISLATOR,
  Role.ADMINISTRATOR,
  Role.SUPER_ADMIN
);

/**
 * Register RBAC helpers as Fastify decorators
 */
export function registerRBAC(fastify: FastifyInstance): void {
  fastify.decorate('rbac', rbac);
  fastify.decorate('rbacAny', rbacAny);
  fastify.decorate('requireRole', requireRole);
  fastify.decorate('requireAdmin', requireAdmin);
  fastify.decorate('requireSuperAdmin', requireSuperAdmin);
}

// Type augmentation for Fastify
declare module 'fastify' {
  interface FastifyInstance {
    rbac: typeof rbac;
    rbacAny: typeof rbacAny;
    requireRole: typeof requireRole;
    requireAdmin: ReturnType<typeof requireRole>;
    requireSuperAdmin: ReturnType<typeof requireRole>;
  }
}
