import { type NextRequest } from 'next/server';
import { authUserId, ok, handleError } from '@/lib/api/http';
import { repositories } from '@/lib/repositories';
import { createEntrySchema } from '@/lib/validation/schemas';
import type {
  EntryListFilters,
  EntrySort,
} from '@/lib/repositories/interfaces';
import type { EntryStatus } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const auth = await authUserId();
    if ('response' in auth) return auth.response;
    const sp = req.nextUrl.searchParams;
    const filters: EntryListFilters = {};
    const status = sp.get('status');
    if (status) filters.status = status as EntryStatus;
    const search = sp.get('search');
    if (search) filters.search = search;
    const emotion = sp.get('emotion');
    if (emotion) filters.emotion = emotion;
    const theme = sp.get('theme');
    if (theme) filters.theme = theme;
    const from = sp.get('from');
    if (from) filters.from = new Date(from);
    const to = sp.get('to');
    if (to) filters.to = new Date(to);
    if (sp.get('concernOnly') === '1') filters.concernOnly = true;
    const sort = sp.get('sort');
    if (sort) filters.sort = sort as EntrySort;
    const entries = await repositories.entries.list(auth.userId, filters);
    return ok({ entries });
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await authUserId();
    if ('response' in auth) return auth.response;
    const body = createEntrySchema.parse(await req.json());
    const user = await repositories.users.findById(auth.userId);
    const entry = await repositories.entries.create(auth.userId, {
      rawDump: body.rawDump,
      toneUsed: user?.tone ?? 'warm',
    });
    return ok({ entry }, 201);
  } catch (err) {
    return handleError(err);
  }
}
