-- WP-070C privilege follow-up.
--
-- The profile RLS policy calls can_discover_profile() while executing under the
-- authenticated role. Keep the helper unavailable to anon/public, but preserve
-- the existing authenticated EXECUTE contract required by that RLS path.

revoke all on function public.can_discover_profile(uuid, public.sex_type) from public, anon;
grant execute on function public.can_discover_profile(uuid, public.sex_type) to authenticated;
