-- User-owned relational records cascade from auth.users. Audit events may be
-- retained for security evidence, but direct user identifiers are anonymised
-- before the Auth row disappears.

create or replace function public.anonymise_deleted_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.audit_events
  set actor_user_id = null
  where actor_user_id = old.id;

  update public.audit_events
  set subject_user_id = null
  where subject_user_id = old.id;

  update public.audit_events
  set entity_id = null
  where entity_type = 'account'
    and entity_id = old.id::text;

  return old;
end;
$$;

drop trigger if exists before_auth_user_deleted on auth.users;
create trigger before_auth_user_deleted
before delete on auth.users
for each row execute function public.anonymise_deleted_auth_user();

revoke all on function public.anonymise_deleted_auth_user() from public, anon, authenticated;
