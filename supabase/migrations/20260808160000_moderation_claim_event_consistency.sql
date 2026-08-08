-- WP-070A follow-up: a re-claim of an unclaimed investigating case preserves
-- the investigating state. The append-only claim event must describe that
-- preserved state rather than incorrectly claiming a transition back to triage.

create or replace function public.claim_moderation_report(
  p_report_id uuid,
  p_operator_ref text,
  p_expected_case_version integer default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_report public.safety_reports%rowtype;
  v_case public.moderation_cases%rowtype;
  v_case_id uuid;
  v_new_version integer;
  v_claim_to_status public.moderation_state;
  v_now timestamptz := timezone('utc', now());
begin
  if p_operator_ref is null or p_operator_ref !~ '^[A-Za-z0-9][A-Za-z0-9:_-]{2,95}$' then
    raise exception 'invalid moderation operator reference';
  end if;
  if p_expected_case_version is not null and p_expected_case_version < 1 then
    raise exception 'invalid expected moderation case version';
  end if;

  select * into v_report
  from public.safety_reports
  where id = p_report_id
  for update;
  if not found then raise exception 'moderation report not found'; end if;
  if v_report.status in ('dismissed', 'closed') then
    raise exception 'moderation report already resolved';
  end if;

  select * into v_case
  from public.moderation_cases
  where source_report_id = p_report_id
  for update;

  if found then
    if p_expected_case_version is not null and v_case.version <> p_expected_case_version then
      raise exception 'stale moderation case version';
    end if;
    if v_case.status not in ('open', 'triage', 'investigating') then
      raise exception 'moderation case is not claimable';
    end if;
    if v_case.assigned_operator_ref is not null and v_case.assigned_operator_ref <> p_operator_ref then
      raise exception 'moderation case already claimed';
    end if;
    if v_case.assigned_operator_ref = p_operator_ref then
      return v_case.id;
    end if;

    v_claim_to_status := case
      when v_case.status = 'open' then 'triage'::public.moderation_state
      else v_case.status
    end;

    update public.moderation_cases
    set
      assigned_operator_ref = p_operator_ref,
      claimed_at = v_now,
      status = v_claim_to_status,
      last_activity_at = v_now,
      version = version + 1
    where id = v_case.id
    returning id, version into v_case_id, v_new_version;
  else
    if p_expected_case_version is not null then
      raise exception 'stale moderation case version';
    end if;

    v_claim_to_status := 'triage'::public.moderation_state;

    insert into public.moderation_cases (
      subject_user_id,
      source_report_id,
      status,
      priority,
      assigned_operator_ref,
      claimed_at,
      triage_due_at,
      last_activity_at
    ) values (
      v_report.subject_user_id,
      v_report.id,
      v_claim_to_status,
      public.moderation_priority_for_severity(v_report.severity),
      p_operator_ref,
      v_now,
      v_report.created_at + public.moderation_triage_target_for_severity(v_report.severity),
      v_now
    ) returning id, version into v_case_id, v_new_version;
  end if;

  update public.safety_reports
  set status = v_claim_to_status
  where id = p_report_id and status = 'open';

  insert into public.moderation_case_events (
    case_id, case_version, event_type, actor_ref, from_status, to_status, metadata
  ) values (
    v_case_id,
    v_new_version,
    'claimed',
    p_operator_ref,
    coalesce(v_case.status, 'open'::public.moderation_state),
    v_claim_to_status,
    jsonb_build_object('severity', v_report.severity, 'priority', public.moderation_priority_for_severity(v_report.severity))
  );

  insert into public.audit_events (
    actor_user_id, actor_type, event_type, subject_user_id, entity_type, entity_id, payload
  ) values (
    null,
    'service',
    'moderation_case_claimed',
    v_report.subject_user_id,
    'moderation_case',
    v_case_id::text,
    jsonb_build_object('severity', v_report.severity, 'priority', public.moderation_priority_for_severity(v_report.severity), 'case_version', v_new_version)
  );

  return v_case_id;
end;
$$;

revoke all on function public.claim_moderation_report(uuid, text, integer) from public, anon, authenticated;
grant execute on function public.claim_moderation_report(uuid, text, integer) to service_role;
