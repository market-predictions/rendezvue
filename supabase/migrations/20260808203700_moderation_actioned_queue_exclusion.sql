-- WP-070C queue follow-up.
--
-- WP-070C is the first package that legitimately transitions a moderation case
-- and source report to `actioned`. The WP-070A queue predates that executor and
-- originally excluded only dismissed/closed state. Treat actioned as terminal
-- for active queue display while preserving the historical case/report rows.

create or replace function public.list_moderation_queue(p_limit integer default 100)
returns table (
  report_id uuid,
  case_id uuid,
  subject_user_id uuid,
  category text,
  severity public.report_severity,
  report_status public.moderation_state,
  case_status public.moderation_state,
  priority smallint,
  assigned_operator_ref text,
  case_version integer,
  report_created_at timestamptz,
  triage_due_at timestamptz,
  overdue boolean,
  description_preview text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_limit is null or p_limit < 1 or p_limit > 200 then
    raise exception 'moderation queue limit must be between 1 and 200';
  end if;

  return query
  select
    r.id,
    c.id,
    r.subject_user_id,
    r.category,
    r.severity,
    r.status,
    c.status,
    coalesce(c.priority, public.moderation_priority_for_severity(r.severity)),
    c.assigned_operator_ref,
    coalesce(c.version, 0),
    r.created_at,
    coalesce(c.triage_due_at, r.created_at + public.moderation_triage_target_for_severity(r.severity)),
    timezone('utc', now()) > coalesce(c.triage_due_at, r.created_at + public.moderation_triage_target_for_severity(r.severity)),
    case when r.description is null then null else left(r.description, 500) end
  from public.safety_reports r
  left join public.moderation_cases c on c.source_report_id = r.id
  where r.status not in ('actioned', 'dismissed', 'closed')
    and (c.id is null or c.status not in ('actioned', 'dismissed', 'closed'))
  order by
    coalesce(c.priority, public.moderation_priority_for_severity(r.severity)) asc,
    coalesce(c.triage_due_at, r.created_at + public.moderation_triage_target_for_severity(r.severity)) asc,
    r.created_at asc,
    r.id asc
  limit p_limit;
end;
$$;

revoke all on function public.list_moderation_queue(integer) from public, anon, authenticated;
grant execute on function public.list_moderation_queue(integer) to service_role;
