import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import { prisma } from './prisma';

const AUTH_SECRET = process.env.AUTH_SECRET || 'matchmaker_super_secret_jwt_key_change_in_production_2026';
export const SESSION_COOKIE_NAME = 'matchmaker_session';

export interface UserSessionPayload {
  userId: string;
  email: string;
  name: string;
  role: Role;
  customerId?: string | null;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: UserSessionPayload): string {
  return jwt.sign(payload, AUTH_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): UserSessionPayload | null {
  try {
    return jwt.verify(token, AUTH_SECRET) as UserSessionPayload;
  } catch {
    return null;
  }
}

export async function getSessionUser(): Promise<UserSessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;
    
    const payload = verifyToken(token);
    if (!payload) return null;
    
    // Optionally double check user exists in DB
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { customer: { select: { id: true } } },
    });
    
    if (!user) return null;
    
    return {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      customerId: user.customer?.id || null,
    };
  } catch (error) {
    console.error('Error fetching session user:', error);
    return null;
  }
}

export async function requireAdmin(): Promise<UserSessionPayload> {
  const session = await getSessionUser();
  if (!session || session.role !== 'ADMIN') {
    throw new Error('UNAUTHORIZED_ADMIN');
  }
  return session;
}

export async function requireUser(): Promise<UserSessionPayload> {
  const session = await getSessionUser();
  if (!session) {
    throw new Error('UNAUTHORIZED');
  }
  return session;
}

export async function requireOwnerOrAdmin(targetCustomerId: string): Promise<UserSessionPayload> {
  const session = await getSessionUser();
  if (!session) {
    throw new Error('UNAUTHORIZED');
  }
  if (session.role === 'ADMIN') {
    return session;
  }
  if (session.customerId === targetCustomerId) {
    return session;
  }
  throw new Error('FORBIDDEN');
}
