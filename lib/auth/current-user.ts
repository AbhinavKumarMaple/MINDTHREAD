import { getSessionToken } from './cookies';
import { verifySessionToken, type SessionPayload } from './jwt';
import { repositories } from '../repositories';
import { toPublicUser } from '../repositories/serialize';
import type { UserRecord } from '../repositories/interfaces';
import type { PublicUser } from '../types';

export class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const token = getSessionToken();
  if (!token) return null;
  return verifySessionToken(token);
}

export async function getCurrentUserRecord(): Promise<UserRecord | null> {
  const session = await getSession();
  if (!session) return null;
  return repositories.users.findById(session.userId);
}

export async function getCurrentUser(): Promise<PublicUser | null> {
  const record = await getCurrentUserRecord();
  return record ? toPublicUser(record as never) : null;
}

export async function requireUserId(): Promise<string> {
  const session = await getSession();
  if (!session) throw new UnauthorizedError();
  return session.userId;
}
