/**
 * RBAC Tests
 */

import { describe, it, expect } from 'vitest';
import {
  Role,
  Permission,
  ROLE_PERMISSIONS,
} from '../src/types/index.js';
import {
  hasRole,
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
  getPermissionsForRoles,
} from '../src/middleware/rbac.js';
import type { TokenPayload } from '../src/types/index.js';

describe('RBAC', () => {
  const createMockUser = (roles: Role[], permissions: Permission[]): TokenPayload => ({
    userId: 'user-123',
    personId: 'person-123',
    email: 'test@example.com',
    roles,
    permissions,
    verificationLevel: 'EMAIL_VERIFIED' as const,
    votingPower: 1,
    regions: ['region-1'],
  });

  describe('Role Definitions', () => {
    it('should have all roles defined', () => {
      expect(Role.CITIZEN).toBe('citizen');
      expect(Role.DELEGATE).toBe('delegate');
      expect(Role.LEGISLATOR).toBe('legislator');
      expect(Role.JUDGE).toBe('judge');
      expect(Role.ADMINISTRATOR).toBe('administrator');
      expect(Role.SUPER_ADMIN).toBe('super_admin');
    });

    it('should have permissions for each role', () => {
      Object.values(Role).forEach((role) => {
        expect(ROLE_PERMISSIONS[role]).toBeDefined();
        expect(Array.isArray(ROLE_PERMISSIONS[role])).toBe(true);
      });
    });

    it('should give SUPER_ADMIN all permissions', () => {
      const allPermissions = Object.values(Permission);
      const superAdminPermissions = ROLE_PERMISSIONS[Role.SUPER_ADMIN];

      expect(superAdminPermissions).toEqual(allPermissions);
    });
  });

  describe('hasRole', () => {
    it('should return true if user has role', () => {
      const user = createMockUser([Role.CITIZEN], []);
      expect(hasRole(user, Role.CITIZEN)).toBe(true);
    });

    it('should return false if user does not have role', () => {
      const user = createMockUser([Role.CITIZEN], []);
      expect(hasRole(user, Role.ADMINISTRATOR)).toBe(false);
    });

    it('should return false for undefined user', () => {
      expect(hasRole(undefined, Role.CITIZEN)).toBe(false);
    });
  });

  describe('hasPermission', () => {
    it('should return true if user has permission', () => {
      const user = createMockUser([], [Permission.VOTE_CAST]);
      expect(hasPermission(user, Permission.VOTE_CAST)).toBe(true);
    });

    it('should return false if user does not have permission', () => {
      const user = createMockUser([], [Permission.VOTE_CAST]);
      expect(hasPermission(user, Permission.BILL_CREATE)).toBe(false);
    });

    it('should return false for undefined user', () => {
      expect(hasPermission(undefined, Permission.VOTE_CAST)).toBe(false);
    });
  });

  describe('hasAllPermissions', () => {
    it('should return true if user has all permissions', () => {
      const user = createMockUser([], [
        Permission.VOTE_CAST,
        Permission.VOTE_DELEGATE,
        Permission.VOTE_VIEW,
      ]);

      expect(
        hasAllPermissions(user, [Permission.VOTE_CAST, Permission.VOTE_VIEW])
      ).toBe(true);
    });

    it('should return false if user missing any permission', () => {
      const user = createMockUser([], [Permission.VOTE_CAST]);

      expect(
        hasAllPermissions(user, [Permission.VOTE_CAST, Permission.VOTE_VIEW])
      ).toBe(false);
    });

    it('should return false for undefined user', () => {
      expect(hasAllPermissions(undefined, [Permission.VOTE_CAST])).toBe(false);
    });
  });

  describe('hasAnyPermission', () => {
    it('should return true if user has any permission', () => {
      const user = createMockUser([], [Permission.VOTE_CAST]);

      expect(
        hasAnyPermission(user, [Permission.VOTE_CAST, Permission.BILL_CREATE])
      ).toBe(true);
    });

    it('should return false if user has none of the permissions', () => {
      const user = createMockUser([], [Permission.VOTE_CAST]);

      expect(
        hasAnyPermission(user, [Permission.BILL_CREATE, Permission.BILL_EDIT])
      ).toBe(false);
    });

    it('should return false for undefined user', () => {
      expect(hasAnyPermission(undefined, [Permission.VOTE_CAST])).toBe(false);
    });
  });

  describe('getPermissionsForRoles', () => {
    it('should return all permissions for given roles', () => {
      const permissions = getPermissionsForRoles([Role.CITIZEN]);

      expect(permissions).toContain(Permission.VOTE_CAST);
      expect(permissions).toContain(Permission.VOTE_DELEGATE);
    });

    it('should merge permissions for multiple roles', () => {
      const permissions = getPermissionsForRoles([Role.CITIZEN, Role.LEGISLATOR]);

      expect(permissions).toContain(Permission.VOTE_CAST);
      expect(permissions).toContain(Permission.BILL_CREATE);
    });

    it('should deduplicate permissions', () => {
      const permissions = getPermissionsForRoles([Role.CITIZEN, Role.DELEGATE]);

      // Both roles have VOTE_CAST, should only appear once
      const voteCastCount = permissions.filter((p) => p === Permission.VOTE_CAST).length;
      expect(voteCastCount).toBe(1);
    });

    it('should return empty array for empty roles', () => {
      const permissions = getPermissionsForRoles([]);
      expect(permissions).toEqual([]);
    });
  });
});
