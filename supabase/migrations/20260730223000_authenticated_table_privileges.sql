-- RLS is evaluated only after PostgreSQL table privileges. Grant the minimum
-- operations needed by the browser role; sensitive mutations stay RPC-only.

grant select, insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.eligibility to authenticated;
grant select, insert, update, delete on public.life_stages to authenticated;
grant select, insert, update, delete on public.family_contexts to authenticated;
grant select, insert, update, delete on public.faith_profiles to authenticated;

grant select on public.student_verifications to authenticated;
grant select, insert, update, delete on public.privacy_portraits to authenticated;

grant select on public.attraction_signals to authenticated;
grant select on public.matches to authenticated;
grant select on public.contact_entitlements to authenticated;
grant select on public.conversations to authenticated;
grant select, insert on public.messages to authenticated;
grant select on public.blocks to authenticated;
grant select on public.interaction_feedback to authenticated;
grant select on public.safety_reports to authenticated;
grant select on public.discovery_profiles to authenticated;

revoke all on public.moderation_cases from anon, authenticated;
revoke all on public.audit_events from anon, authenticated;

-- Explicitly prevent direct browser writes to RPC-owned domains even if future
-- default privileges change.
revoke insert, update, delete on public.attraction_signals from authenticated;
revoke insert, update, delete on public.matches from authenticated;
revoke insert, update, delete on public.contact_entitlements from authenticated;
revoke insert, update, delete on public.conversations from authenticated;
revoke insert, update, delete on public.blocks from authenticated;
revoke insert, update, delete on public.interaction_feedback from authenticated;
revoke insert, update, delete on public.safety_reports from authenticated;
