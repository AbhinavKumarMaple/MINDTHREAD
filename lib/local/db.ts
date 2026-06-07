import Dexie, { type Table } from 'dexie';
import type { Entry, Task, Tone } from '../types';

// The browser-local cache. Populated from /api/sync (the cloud DB is the source
// of truth). AI requests read the Gemini key from here first.

export interface LocalProfile {
  pk: 'me';
  id: string;
  email: string;
  displayName: string;
  tone: Tone;
  onboarded: boolean;
  geminiApiKey: string | null;
}

class MindThreadLocalDB extends Dexie {
  profile!: Table<LocalProfile, string>;
  entries!: Table<Entry, string>;
  tasks!: Table<Task, string>;

  constructor() {
    super('mindthread');
    this.version(1).stores({
      profile: 'pk',
      entries: 'id',
      tasks: 'id',
    });
  }
}

// Lazy singleton — only constructed in the browser (never during SSR).
let _db: MindThreadLocalDB | null = null;
export function localDb(): MindThreadLocalDB {
  if (typeof window === 'undefined') {
    throw new Error('Local DB is only available in the browser');
  }
  if (!_db) _db = new MindThreadLocalDB();
  return _db;
}
