import { getCurrentUser } from '@/lib/auth/current-user';
import { ok, handleError } from '@/lib/api/http';

export async function GET() {
  try {
    const user = await getCurrentUser();
    return ok({ user });
  } catch (err) {
    return handleError(err);
  }
}
