import { authUserId, ok, handleError } from '@/lib/api/http';
import { repositories } from '@/lib/repositories';
import { decryptSecret } from '@/lib/crypto';

// Returns the full snapshot for a user so the browser can populate its local
// (IndexedDB) cache in a single call: profile (incl. the DECRYPTED Gemini key,
// for client-side AI calls), plus all entries and tasks.
export async function GET() {
  try {
    const auth = await authUserId();
    if ('response' in auth) return auth.response;
    const user = await repositories.users.findById(auth.userId);
    if (!user) return ok({ profile: null, entries: [], tasks: [] });

    const [entries, tasks] = await Promise.all([
      repositories.entries.listAll(auth.userId),
      repositories.tasks.list(auth.userId, {}),
    ]);

    const geminiApiKey = user.geminiApiKeyEnc
      ? decryptSecret(user.geminiApiKeyEnc)
      : null;

    return ok({
      profile: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        tone: user.tone,
        model: user.model,
        onboarded: !!user.onboardedAt,
        geminiApiKey,
      },
      entries,
      tasks,
    });
  } catch (err) {
    return handleError(err);
  }
}
