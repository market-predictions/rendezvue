-- Server-authoritative, participant-scoped WP-057 revocation evidence.
-- Returns only terminal state booleans; no IDs, object paths or signed URLs.

create or replace function public.get_contact_revocation_state()
returns table (
  terminal_match_found boolean,
  match_status text,
  conversation_closed boolean,
  new_portrait_access_revoked boolean,
  message_write_revoked boolean
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
  v_match public.matches%rowtype;
  v_other_user_id uuid;
  v_conversation_id uuid;
  v_conversation_status public.conversation_state;
  v_portrait_path text;
begin
  if v_actor is null then
    raise exception 'authentication required';
  end if;

  select m.*
  into v_match
  from public.matches m
  where v_actor in (m.user_a_id, m.user_b_id)
    and m.status in ('ended', 'blocked')
  order by coalesce(m.ended_at, m.updated_at, m.matched_at) desc
  limit 1;

  if not found then
    return query select false, null::text, false, false, false;
    return;
  end if;

  v_other_user_id := case
    when v_match.user_a_id = v_actor then v_match.user_b_id
    else v_match.user_a_id
  end;

  select c.id, c.status
  into v_conversation_id, v_conversation_status
  from public.conversations c
  where c.match_id = v_match.id;

  v_portrait_path := public.get_matched_portrait_path(v_other_user_id);

  return query
  select
    true,
    v_match.status::text,
    v_conversation_status is null or v_conversation_status <> 'open',
    v_portrait_path is null,
    v_conversation_id is null or not public.is_conversation_available(v_conversation_id, v_actor);
end;
$$;

revoke all on function public.get_contact_revocation_state() from public, anon;
grant execute on function public.get_contact_revocation_state() to authenticated;
