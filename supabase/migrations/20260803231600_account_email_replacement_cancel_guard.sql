-- WP-065F hardening: avoid NULL-sensitive NOT IN semantics for cancellation.

create or replace function public.cancel_account_email_replacement(
  p_action_id uuid,
  p_expected_state public.account_email_replacement_state,
  p_operator_reference text
)
returns public.account_email_replacement_state
language plpgsql
security definer
set search_path = public
as $$
declare
  v_action public.account_email_replacement_actions%rowtype;
begin
  select * into v_action
  from public.account_email_replacement_actions
  where id = p_action_id
  for update;

  if not found then raise exception 'email replacement action not found'; end if;
  if v_action.state <> p_expected_state then raise exception 'stale email replacement state'; end if;
  if v_action.state not in ('requested', 'approved') then raise exception 'email replacement cannot be cancelled'; end if;
  if p_operator_reference <> v_action.requested_by
     and (v_action.approved_by is null or p_operator_reference <> v_action.approved_by) then
    raise exception 'email replacement cancellation operator not authorized';
  end if;

  update public.account_email_replacement_actions
  set state = 'cancelled',
      last_failure_code = 'cancelled_by_support'
  where id = p_action_id;

  insert into public.account_email_replacement_events (
    action_id, event_type, from_state, to_state, operator_reference, failure_code
  ) values (
    p_action_id, 'cancelled', v_action.state, 'cancelled', p_operator_reference, 'cancelled_by_support'
  );

  return 'cancelled';
end;
$$;

revoke all on function public.cancel_account_email_replacement(uuid, public.account_email_replacement_state, text) from public, anon, authenticated, service_role;
grant execute on function public.cancel_account_email_replacement(uuid, public.account_email_replacement_state, text) to service_role;
