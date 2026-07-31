import db from '@/lib/db';
import { hashPassword, verifyPassword } from './argon2';
import { Role, UserStatus } from '@prisma/client';
import crypto from 'crypto';
import { cookies } from 'next/headers';

export const SESSION_COOKIE_NAME = 'plv_session';
const SESSION_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds

export interface UserSessionData {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  image: string | null;
  status: UserStatus;
}

/**
 * Generate a cryptographically secure random token
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Generate a 6-digit OTP code for 2FA / Verification
 */
export function generateNumericOTP(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

/**
 * Create a new user session and set HTTP-only cookie
 */
export async function createSession(userId: string, userAgent?: string, ipAddress?: string): Promise<string> {
  const sessionToken = generateSecureToken(32);
  const expires = new Date(Date.now() + SESSION_MAX_AGE * 1000);

  await db.session.create({
    data: {
      userId,
      sessionToken,
      expires,
      userAgent: userAgent || null,
      ipAddress: ipAddress || null,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires,
    path: '/',
  });

  return sessionToken;
}

/**
 * Validate session token from cookie or request header
 */
export async function getSessionUser(): Promise<UserSessionData | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!token) return null;

    const session = await db.session.findUnique({
      where: { sessionToken: token },
      include: { user: true },
    });

    if (!session || new Date() > session.expires) {
      if (session) {
        await db.session.delete({ where: { id: session.id } }).catch(() => null);
      }
      return null;
    }

    if (session.user.status !== UserStatus.ACTIVE || session.user.deletedAt !== null) {
      return null;
    }

    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role,
      image: session.user.image,
      status: session.user.status,
    };
  } catch (error) {
    console.error('getSessionUser error:', error);
    return null;
  }
}

/**
 * Destroy current user session
 */
export async function destroySession(): Promise<void> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (token) {
      await db.session.delete({ where: { sessionToken: token } }).catch(() => null);
      cookieStore.delete(SESSION_COOKIE_NAME);
    }
  } catch (error) {
    console.error('destroySession error:', error);
  }
}

/**
 * Issue Email Verification Token
 */
export async function createEmailVerificationToken(email: string): Promise<string> {
  const token = generateSecureToken(24);
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await db.emailVerificationToken.create({
    data: {
      email,
      token,
      expires,
    },
  });

  return token;
}

/**
 * Verify Email Token
 */
export async function verifyEmailToken(token: string): Promise<boolean> {
  const record = await db.emailVerificationToken.findUnique({
    where: { token },
  });

  if (!record || new Date() > record.expires) {
    return false;
  }

  await db.user.updateMany({
    where: { email: record.email },
    data: { emailVerified: new Date() },
  });

  await db.emailVerificationToken.delete({ where: { token } }).catch(() => null);
  return true;
}

/**
 * Issue Password Reset Token
 */
export async function createPasswordResetToken(email: string): Promise<string> {
  const token = generateSecureToken(32);
  const expires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

  await db.passwordResetToken.create({
    data: {
      email,
      token,
      expires,
    },
  });

  return token;
}
