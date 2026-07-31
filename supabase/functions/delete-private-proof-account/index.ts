import { createSupabaseContext } from 'npm:@supabase/server';

const BUCKET = 'privacy-portraits';
const CONFIRMATION = 'DELETE_SYNTHETIC_ACCOUNT';
const PAGE_SIZE = 100;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200): Response {
  return Response.json(body, {
    status,
    headers: {
      ...corsHeaders,
      'Cache-Control': 'no-store',
    },
  });
}

async function listOwnedPortraits(
  // deno-lint-ignore no-explicit-any
  supabaseAdmin: any,
  userId: string,
): Promise<string[]> {
  const paths: string[] = [];
  let offset = 0;

  while (true) {
    const { data, error } = await supabaseAdmin.storage
      .from(BUCKET)
      .list(userId, {
        limit: PAGE_SIZE,
        offset,
        sortBy: { column: 'name', order: 'asc' },
      });

    if (error) throw new Error(`private object listing failed: ${error.message}`);

    const entries = data ?? [];
    for (const entry of entries) {
      if (!entry?.name || entry.id === null) {
        throw new Error('nested or unresolved private object entry requires manual containment');
      }
      paths.push(`${userId}/${entry.name}`);
    }

    if (entries.length < PAGE_SIZE) break;
    offset += entries.length;
  }

  return paths;
}

export default {
  fetch: async (request: Request): Promise<Response> => {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }
    if (request.method !== 'POST') {
      return json({ error: 'method_not_allowed' }, 405);
    }

    const { data: context, error: authError } = await createSupabaseContext(request, { auth: 'user' });
    if (authError || !context) {
      return json({
        error: 'authenticated_user_required',
        code: authError?.code ?? null,
      }, authError?.status ?? 401);
    }

    const userId = String(context.jwtClaims?.sub ?? '');
    if (!userId) return json({ error: 'authenticated_user_required' }, 401);

    let payload: { confirmation?: string };
    try {
      payload = await request.json();
    } catch {
      return json({ error: 'invalid_json' }, 400);
    }

    if (payload.confirmation !== CONFIRMATION) {
      return json({ error: 'confirmation_required' }, 400);
    }

    try {
      const objectPaths = await listOwnedPortraits(context.supabaseAdmin, userId);

      // Object bytes are removed first. If this fails, the Auth account and
      // relational profile remain intact and the operation is safely retryable.
      if (objectPaths.length > 0) {
        const { error: removeError } = await context.supabaseAdmin.storage
          .from(BUCKET)
          .remove(objectPaths);
        if (removeError) throw new Error(`private object deletion failed: ${removeError.message}`);
      }

      const { error: deleteError } = await context.supabaseAdmin.auth.admin.deleteUser(userId, false);
      if (deleteError) throw new Error(`Auth account deletion failed: ${deleteError.message}`);

      return json({
        deleted: true,
        removedPrivateObjects: objectPaths.length,
        retainedAuditIdentifiersAnonymised: true,
      });
    } catch (error) {
      console.error('private proof account cleanup failed', {
        userId,
        message: error instanceof Error ? error.message : String(error),
      });
      return json({ error: 'account_cleanup_failed' }, 500);
    }
  },
};
