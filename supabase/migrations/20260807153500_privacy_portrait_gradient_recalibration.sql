-- WP-074A: recalibrate the participant portrait presentation ladder toward recognisability.
-- `unfiltered` means an un-obscured, metadata-free prepared card/avatar derivative.
-- The original normalized source remains private and can never be the selected portrait.

alter table public.privacy_portraits
  drop constraint if exists privacy_portraits_filter_id_check,
  add constraint privacy_portraits_filter_id_check check (
    privacy_filter_id is null
    or privacy_filter_id in (
      'unfiltered', 'natural', 'softFocus', 'warmVeil',
      -- Historical WP-074 values remain readable for existing preparations only.
      'monoMist', 'privacyMax'
    )
  );

create or replace function public.register_prepared_portrait(
  p_preparation_id uuid,
  p_source_object_path text,
  p_card_object_path text,
  p_avatar_object_path text,
  p_focal_x numeric,
  p_focal_y numeric,
  p_zoom numeric,
  p_source_width integer,
  p_source_height integer,
  p_privacy_filter_id text,
  p_quality_flags text[] default '{}'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_card_id uuid;
  v_filter text := nullif(trim(coalesce(p_privacy_filter_id, '')), '');
begin
  if v_user_id is null then raise exception 'authentication required'; end if;
  if v_filter is null or v_filter not in ('unfiltered', 'natural', 'softFocus', 'warmVeil') then
    raise exception 'supported privacy presentation required';
  end if;

  v_card_id := public.register_prepared_portrait(
    p_preparation_id,
    p_source_object_path,
    p_card_object_path,
    p_avatar_object_path,
    p_focal_x,
    p_focal_y,
    p_zoom,
    p_source_width,
    p_source_height,
    p_quality_flags
  );

  update public.privacy_portraits
  set privacy_filter_id = v_filter,
      treatment = case asset_role
        when 'source' then 'normalized-source-webp'
        when 'card' then 'privacy-' || v_filter || '-card-4x5-webp'
        when 'avatar' then 'privacy-' || v_filter || '-avatar-square-webp'
        else treatment
      end,
      updated_at = timezone('utc', now())
  where user_id = v_user_id
    and preparation_id = p_preparation_id;

  insert into public.audit_events (
    actor_user_id, actor_type, event_type, subject_user_id, entity_type, entity_id, payload
  ) values (
    v_user_id,
    'user',
    'privacy_portrait_filter_selected',
    v_user_id,
    'privacy_portrait_preparation',
    p_preparation_id::text,
    jsonb_build_object(
      'privacy_filter_id', v_filter,
      'public_derivatives_filtered', v_filter <> 'unfiltered',
      'unfiltered_derivative_selected', v_filter = 'unfiltered',
      'raw_public_portrait_allowed', false
    )
  );

  return v_card_id;
end;
$$;

revoke all on function public.register_prepared_portrait(
  uuid, text, text, text, numeric, numeric, numeric, integer, integer, text, text[]
) from public, anon;
grant execute on function public.register_prepared_portrait(
  uuid, text, text, text, numeric, numeric, numeric, integer, integer, text, text[]
) to authenticated;
