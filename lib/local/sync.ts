import { api } from '../api/client';
import { localDb, type LocalProfile } from './db';
import type { Entry, Task } from '../types';

interface SyncResponse {
  profile: Omit<LocalProfile, 'pk'> | null;
  entries: Entry[];
  tasks: Task[];
}

let inflight: Promise<void> | null = null;

// Pull the full snapshot from the cloud DB into the local IndexedDB cache.
// De-duplicated: concurrent callers share one network round-trip.
export async function syncAll(): Promise<void> {
  if (inflight) return inflight;
  inflight = (async () => {
    const data = await api.get<SyncResponse>('/api/sync');
    const db = localDb();
    await db.transaction('rw', db.profile, db.entries, db.tasks, async () => {
      if (data.profile) {
        await db.profile.put({ ...data.profile, pk: 'me' });
      }
      await db.entries.clear();
      await db.entries.bulkPut(data.entries);
      await db.tasks.clear();
      await db.tasks.bulkPut(data.tasks);
    });
  })().finally(() => {
    inflight = null;
  });
  return inflight;
}

export async function clearLocal(): Promise<void> {
  if (typeof window === 'undefined') return;
  const db = localDb();
  await db.transaction('rw', db.profile, db.entries, db.tasks, async () => {
    await db.profile.clear();
    await db.entries.clear();
    await db.tasks.clear();
  });
}
