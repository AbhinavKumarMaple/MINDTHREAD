import type { Repositories } from './interfaces';
import { prismaRepositories } from './prisma';

// The single place the app gets its data layer. To migrate the local SQLite
// store to Supabase/Postgres later, implement `Repositories` against the
// Supabase client in `./supabase` and swap the line below — nothing else
// in the app imports Prisma or knows which backend is in use.
export const repositories: Repositories = prismaRepositories;

export type { Repositories } from './interfaces';
