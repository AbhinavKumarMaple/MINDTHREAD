// Fetches the user's available Gemini models directly from Google
// (browser -> generativelanguage API), so the model picker is always current.

const BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

export interface AvailableModel {
  id: string; // e.g. "gemini-2.5-flash-lite" (the "models/" prefix stripped)
  displayName: string;
}

export async function fetchAvailableModels(
  apiKey: string,
): Promise<AvailableModel[]> {
  const out: AvailableModel[] = [];
  let pageToken: string | undefined;

  do {
    const url = new URL(BASE);
    url.searchParams.set('key', apiKey);
    url.searchParams.set('pageSize', '1000');
    if (pageToken) url.searchParams.set('pageToken', pageToken);

    const res = await fetch(url.toString());
    if (!res.ok) {
      throw new Error(`listModels failed (${res.status})`);
    }
    const data = (await res.json()) as {
      models?: {
        name?: string;
        displayName?: string;
        supportedGenerationMethods?: string[];
      }[];
      nextPageToken?: string;
    };

    for (const m of data.models ?? []) {
      // Keep only text-generation models.
      if (!(m.supportedGenerationMethods ?? []).includes('generateContent')) {
        continue;
      }
      const id = (m.name ?? '').replace(/^models\//, '');
      if (id) out.push({ id, displayName: m.displayName ?? id });
    }
    pageToken = data.nextPageToken;
  } while (pageToken);

  // Newest Gemini families first, then alphabetical.
  return out.sort((a, b) => {
    const rank = (id: string) =>
      id.startsWith('gemini-2.5') ? 0 : id.startsWith('gemini-2') ? 1 : 2;
    return rank(a.id) - rank(b.id) || a.id.localeCompare(b.id);
  });
}
