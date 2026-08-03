import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': 'null',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const EXECUTOR_REFERENCE = 'edge-email-replacement-v1';
const MAX_LIST_PAGES = 100;
const USERS_PER_PAGE = 1000;

function json(body: unknown, status = 200): Response {
  return Response.json(body, {
    status,
    headers: {
      ...corsHeaders,
      'Cache-Control': 'no-store',
    },
  });
}

function constantTimeEqual(left: string, right: string): boolean {
  const encoder = new TextEncoder();
  const leftBytes = encoder.encode(left);
  const rightBytes = encoder.encode(right);
  if (leftBytes.length !== rightBytes.length) return false;
  let result = 0;
  for (let index = 0; index < leftBytes.length; index += 1) {
    result |= leftBytes[index] ^ rightBytes[index];
  }
  return result === 0;
}

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function validEmail(value: string): boolean {
  return value.length >= 3
    && value.length <= 254
    && !/[\s\u0000-\u001f\u007f]/.test(value)
    && /^[^@]+@[^@]+\.[^@]+$/.test(value);
}

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function serviceAuthorized(request: Request, serviceRoleKey: string): boolean {
  const authorization = request.headers.get('authorization') ?? '';
  const expected = `Bearer ${serviceRoleKey}`;
  return constantTimeEqual(authorization, expected);
}

// deno-lint-ignore no-explicit-any
async function targetEmailInUse(admin: any, normalizedTargetEmail: string, userId: string): Promise<boolean> {
  for (let page = 1; page <= MAX_LIST_PAGES; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: USERS_PER_PAGE });
    if (error) throw new Error('target_email_uniqueness_check_failed');
    const users = data?.users ?? [];
    for (const user of users) {
      if (user.id !== userId && normalizeEmail(String(user.email ?? '')) === normalizedTargetEmail) {
        return true;
      }
    }
    if (users.length < USERS_PER_PAGE) return false;
  }
  throw new Error('target_email_uniqueness_check_incomplete');
}

export default {
  fetch: async (request: Request): Promise<Response> => {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }
    if (request.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const publishableKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const canonicalUrl = Deno.env.get('RENDEZVUE_CANONICAL_URL')
      ?? 'https://rendezvue-private-preview.pages.dev/';

    if (!supabaseUrl || !serviceRoleKey || !publishableKey) {
      return json({ error: 'executor_not_configured' }, 503);
    }
    if (!serviceAuthorized(request, serviceRoleKey)) {
      return json({ error: 'service_authorization_required' }, 401);
    }

    let payload: {
      actionId?: string;
      idempotencyKey?: string;
      targetEmail?: string;
    };
    try {
      payload = await request.json();
    } catch {
      return json({ error: 'invalid_json' }, 400);
    }

    const actionId = String(payload.actionId ?? '');
    const idempotencyKey = String(payload.idempotencyKey ?? '');
    const targetEmail = normalizeEmail(String(payload.targetEmail ?? ''));

    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(actionId)) {
      return json({ error: 'invalid_action_id' }, 400);
    }
    if (!/^[A-Za-z0-9][A-Za-z0-9._:-]{15,159}$/.test(idempotencyKey)) {
      return json({ error: 'invalid_idempotency_key' }, 400);
    }
    if (!validEmail(targetEmail)) {
      return json({ error: 'invalid_target_email' }, 400);
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
    });
    const targetFingerprint = await sha256(targetEmail);

    const { data: contextRows, error: contextError } = await admin.rpc(
      'get_account_email_replacement_execution_context',
      { p_action_id: actionId, p_idempotency_key: idempotencyKey },
    );
    if (contextError || !Array.isArray(contextRows) || contextRows.length !== 1) {
      return json({ error: 'approved_action_not_found' }, 404);
    }

    const context = contextRows[0] as {
      user_id: string | null;
      current_email_fingerprint: string;
      target_email_fingerprint: string;
      state: string;
      expires_at: string;
      attempt_count: number;
      executor_reference: string | null;
      post_change_magic_link_requested: boolean;
    };

    if (!context.user_id) return json({ error: 'action_account_reference_unavailable' }, 409);
    if (!constantTimeEqual(targetFingerprint, context.target_email_fingerprint)) {
      return json({ error: 'target_email_not_approved' }, 409);
    }

    if (context.state === 'completed') {
      return json({ completed: true, reconciled: true, magicLinkRequested: context.post_change_magic_link_requested });
    }
    if (!['approved', 'executing'].includes(context.state)) {
      return json({ error: 'action_not_executable', state: context.state }, 409);
    }

    const { data: claimState, error: claimError } = await admin.rpc(
      'claim_account_email_replacement_execution',
      {
        p_action_id: actionId,
        p_idempotency_key: idempotencyKey,
        p_executor_reference: EXECUTOR_REFERENCE,
      },
    );
    if (claimError || !['executing', 'completed'].includes(String(claimState))) {
      return json({ error: 'action_claim_failed' }, 409);
    }
    if (claimState === 'completed') {
      return json({ completed: true, reconciled: true, magicLinkRequested: context.post_change_magic_link_requested });
    }

    let failureCode = 'email_replacement_failed';
    let retryable = true;

    try {
      const { data: userResponse, error: userError } = await admin.auth.admin.getUserById(context.user_id);
      const user = userResponse?.user;
      if (userError || !user?.email) {
        failureCode = 'auth_user_unavailable';
        retryable = false;
        throw new Error(failureCode);
      }

      const currentAuthFingerprint = await sha256(normalizeEmail(user.email));

      if (constantTimeEqual(currentAuthFingerprint, context.target_email_fingerprint)) {
        const publishable = createClient(supabaseUrl, publishableKey, {
          auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
        });
        const { error: magicError } = await publishable.auth.signInWithOtp({
          email: targetEmail,
          options: { shouldCreateUser: false, emailRedirectTo: canonicalUrl },
        });
        const magicLinkRequested = !magicError;

        const { error: completionError } = await admin.rpc('complete_account_email_replacement', {
          p_action_id: actionId,
          p_idempotency_key: idempotencyKey,
          p_executor_reference: EXECUTOR_REFERENCE,
          p_magic_link_requested: magicLinkRequested,
        });
        if (completionError) throw new Error('action_reconciliation_failed');

        return json({ completed: true, reconciled: true, magicLinkRequested });
      }

      if (!constantTimeEqual(currentAuthFingerprint, context.current_email_fingerprint)) {
        failureCode = 'current_email_changed';
        retryable = false;
        throw new Error(failureCode);
      }

      if (await targetEmailInUse(admin, targetEmail, context.user_id)) {
        failureCode = 'target_email_in_use';
        retryable = false;
        throw new Error(failureCode);
      }

      const { error: updateError } = await admin.auth.admin.updateUserById(context.user_id, {
        email: targetEmail,
        email_confirm: true,
      });
      if (updateError) {
        failureCode = 'auth_email_update_failed';
        throw new Error(failureCode);
      }

      const publishable = createClient(supabaseUrl, publishableKey, {
        auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
      });
      const { error: magicError } = await publishable.auth.signInWithOtp({
        email: targetEmail,
        options: { shouldCreateUser: false, emailRedirectTo: canonicalUrl },
      });
      const magicLinkRequested = !magicError;

      const { error: completionError } = await admin.rpc('complete_account_email_replacement', {
        p_action_id: actionId,
        p_idempotency_key: idempotencyKey,
        p_executor_reference: EXECUTOR_REFERENCE,
        p_magic_link_requested: magicLinkRequested,
      });
      if (completionError) {
        // Auth has already changed. The action deliberately remains `executing`;
        // the same idempotent request will reconcile and finalize on retry.
        return json({ error: 'action_finalization_pending', retryable: true }, 503);
      }

      return json({ completed: true, reconciled: false, magicLinkRequested });
    } catch {
      const { error: failError } = await admin.rpc('fail_account_email_replacement', {
        p_action_id: actionId,
        p_idempotency_key: idempotencyKey,
        p_executor_reference: EXECUTOR_REFERENCE,
        p_failure_code: failureCode,
        p_retryable: retryable,
      });
      if (failError) {
        console.error('email replacement containment failed', { actionId, failureCode: 'containment_failed' });
      }
      return json({ error: failureCode, retryable }, retryable ? 503 : 409);
    }
  },
};
