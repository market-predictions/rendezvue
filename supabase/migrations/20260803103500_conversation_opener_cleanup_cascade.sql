-- WP-057 live-browser cleanup exposed that the conversation opener reference
-- still used ON DELETE RESTRICT. Deleting the Auth user that opened a
-- conversation could therefore fail before the match cascade removed that
-- conversation. Account-owned interaction state is deliberately ephemeral,
-- so both the match participant reference and opener reference must cascade.

alter table public.conversations
  drop constraint if exists conversations_opened_by_user_id_fkey;

alter table public.conversations
  add constraint conversations_opened_by_user_id_fkey
  foreign key (opened_by_user_id)
  references auth.users(id)
  on delete cascade;
