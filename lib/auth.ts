import { getSessionUser, UserSessionData } from './auth/better-auth';
import { requireUserRole } from './auth/rbac';
import { Role } from '@prisma/client';

/**
 * Retain getServerSession / getCurrentUser signature for existing App Router components
 */
export async function getCurrentUser(): Promise<{
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: Role;
} | undefined> {
  const user = await getSessionUser();
  if (!user) return undefined;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    role: user.role,
  };
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) throw new Error('Unauthorized access. Please login first.');
  return user;
}

export async function requireAdmin() {
  return await requireUserRole([Role.ADMINISTRATOR]);
}

export async function requireBusinessOwner() {
  return await requireUserRole([Role.BUSINESS_OWNER, Role.ADMINISTRATOR]);
}

export async function requireModerator() {
  return await requireUserRole([Role.MODERATOR, Role.ADMINISTRATOR]);
}
