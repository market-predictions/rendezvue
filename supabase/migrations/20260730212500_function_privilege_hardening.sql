-- SECURITY DEFINER functions must not retain PostgreSQL's default PUBLIC
-- execute privilege. Only the minimum application role receives access.

revoke all on function public.touch_updated_at() from public, anon, authenticated;
revoke all on function public.handle_new_auth_user() from public, anon, authenticated;

revoke all on function public.is_match_participant(uuid, uuid) from public, anon;
revoke all on function public.is_conversation_participant(uuid, uuid) from public, anon;
revoke all on function public.is_conversation_available(uuid, uuid) from public, anon;

grant execute on function public.is_match_participant(uuid, uuid) to authenticated;
grant execute on function public.is_conversation_participant(uuid, uuid) to authenticated;
grant execute on function public.is_conversation_available(uuid, uuid) to authenticated;

revoke all on function public.record_attraction_signal(uuid, public.attraction_signal_type, text, text) from public, anon;
revoke all on function public.open_match_conversation(uuid, text) from public, anon;
revoke all on function public.block_user(uuid, text) from public, anon;

grant execute on function public.record_attraction_signal(uuid, public.attraction_signal_type, text, text) to authenticated;
grant execute on function public.open_match_conversation(uuid, text) to authenticated;
grant execute on function public.block_user(uuid, text) to authenticated;
