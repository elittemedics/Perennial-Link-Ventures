import { Role } from '@prisma/client';
import { getSessionUser, UserSessionData } from './better-auth';

export type PermissionCode =
  | 'manage:all'
  | 'manage:users'
  | 'manage:businesses'
  | 'manage:categories'
  | 'manage:subscriptions'
  | 'manage:ads'
  | 'create:business'
  | 'edit:business'
  | 'delete:business'
  | 'view:analytics'
  | 'create:review'
  | 'send:inquiry';

const RolePermissionsMap: Record<Role, PermissionCode[]> = {
  ADMINISTRATOR: [
    'manage:all',
    'manage:users',
    'manage:businesses',
    'manage:categories',
    'manage:subscriptions',
    'manage:ads',
    'create:business',
    'edit:business',
    'delete:business',
    'view:analytics',
    'create:review',
    'send:inquiry',
  ],
  MODERATOR: [
    'manage:businesses',
    'manage:categories',
    'edit:business',
    'view:analytics',
    'create:review',
    'send:inquiry',
  ],
  BUSINESS_OWNER: [
    'create:business',
    'edit:business',
    'delete:business',
    'view:analytics',
    'create:review',
    'send:inquiry',
  ],
  VISITOR: ['create:review', 'send:inquiry'],
};

/**
 * Check if a role possesses a specific permission
 */
export function hasPermission(role: Role, permission: PermissionCode): boolean {
  const permissions = RolePermissionsMap[role] || [];
  return permissions.includes('manage:all') || permissions.includes(permission);
}

/**
 * Authorize current request session against minimum role requirement
 */
export async function requireUserRole(allowedRoles: Role[]): Promise<UserSessionData> {
  const user = await getSessionUser();
  if (!user) {
    throw new Error('Unauthorized access. Session expired or missing.');
  }

  if (!allowedRoles.includes(user.role)) {
    throw new Error('Forbidden. Insufficient security role authorization.');
  }

  return user;
}
