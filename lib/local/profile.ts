import { localDb, type LocalProfile } from './db';
import { syncAll } from './sync';
import type { Entry } from '../types';

// Local-first resolvers. The exact flow the product requires:
//   read from local DB → if missing, sync all data from backend → read again.

export async function getLocalProfile(): Promise<LocalProfile | null> {
  let profile = await localDb().profile.get('me');
  if (!profile) {
    await syncAll();
    profile = await localDb().profile.get('me');
  }
  return profile ?? null;
}

export async function getGeminiKey(): Promise<string | null> {
  const profile = await getLocalProfile();
  return profile?.geminiApiKey ?? null;
}

export async function getLocalEntries(): Promise<Entry[]> {
  let entries = await localDb().entries.toArray();
  if (entries.length === 0) {
    await syncAll();
    entries = await localDb().entries.toArray();
  }
  // Newest first — the AI context builders expect this ordering.
  return entries.sort(
    (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
  );
}

// Apply a freshly-saved key to the cache immediately (avoids a re-sync).
export async function setLocalKey(key: string | null): Promise<void> {
  const profile = await localDb().profile.get('me');
  if (profile) {
    await localDb().profile.put({ ...profile, geminiApiKey: key });
  }
}

export async function setLocalProfileFields(
  fields: Partial<Pick<LocalProfile, 'tone' | 'displayName' | 'model'>>,
): Promise<void> {
  const profile = await localDb().profile.get('me');
  if (profile) {
    await localDb().profile.put({ ...profile, ...fields });
  }
}
