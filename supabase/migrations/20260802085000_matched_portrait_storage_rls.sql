-- Authorize matched portrait Storage reads without depending on owner-scoped
-- privacy_portraits RLS. The previous storage.objects policy queried
-- privacy_portraits directly as the authenticated caller, so it could never
-- see the selected portrait row owned by the other match participant.

create or replace function public.can_read_matched_portrait_object(
  p_object_name text
)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
begin
  if v_actor is null or p_object_name is null or btrim(p_object_name) = '' then
    return false;
  end if;

  return exists (
    select 1
    from public.privacy_portraits pp
    join public.matches m
      on m.user_a_id = least(v_actor, pp.user_id)
     and m.user_b_id = greatest(v_actor, pp.user_id)
     and m.status = 'active'
    where pp.object_path = p_object_name
      and pp.user_id <> v_actor
      and pp.is_public_profile_portrait
      and pp.status in ('pending', 'verified')
      and not exists (
        select 1
        from public.blocks b
        where (b.blocker_user_id = v_actor and b.blocked_user_id = pp.user_id)
           or (b.blocker_user_id = pp.user_id and b.blocked_user_id = v_actor)
      )
  );
end;
$$;

revoke all on function public.can_read_matched_portrait_object(text) from public, anon;
grant execute on function public.can_read_matched_portrait_object(text) to authenticated;

-- Keep the bucket private. A signed URL may only be created when this SELECT
-- policy succeeds for the exact selected object of an active, unblocked match.
drop policy if exists portrait_objects_read_matched on storage.objects;
create policy portrait_objects_read_matched
on storage.objects
for select
to authenticated
using (
  bucket_id = 'privacy-portraits'
  and public.can_read_matched_portrait_object(name)
);
