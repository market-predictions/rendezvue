-- WP-070: non-destructive profile image preparation.
-- Raw browser uploads are replaced by a normalized private source plus explicit
-- 4:5 card and square avatar derivatives linked by one preparation identifier.

alter table public.privacy_portraits
  add column if not exists preparation_id uuid,
  add column if not exists asset_role text not null default 'card',
  add column if not exists source_object_path text,
  add column if not exists focal_x numeric(7,6),
  add column if not exists focal_y numeric(7,6),
  add column if not exists zoom numeric(7,4),
  add column if not exists crop_aspect text,
  add column if not exists source_width integer,
  add column if not exists source_height integer,
  add column if not exists output_width integer,
  add column if not exists output_height integer,
  add column if not exists metadata_stripped boolean not null default false,
  add column if not exists quality_flags text[] not null default '{}';

update public.privacy_portraits
set preparation_id = coalesce(preparation_id, id),
    asset_role = coalesce(asset_role, 'card'),
    source_object_path = coalesce(source_object_path, object_path),
    focal_x = coalesce(focal_x, 0.5),
    focal_y = coalesce(focal_y, 0.5),
    zoom = coalesce(zoom, 1),
    crop_aspect = coalesce(crop_aspect, 'legacy')
where preparation_id is null
   or source_object_path is null
   or focal_x is null
   or focal_y is null
   or zoom is null
   or crop_aspect is null;

alter table public.privacy_portraits
  alter column preparation_id set not null,
  alter column focal_x set default 0.5,
  alter column focal_x set not null,
  alter column focal_y set default 0.5,
  alter column focal_y set not null,
  alter column zoom set default 1,
  alter column zoom set not null,
  alter column crop_aspect set default 'legacy',
  alter column crop_aspect set not null;

alter table public.privacy_portraits
  drop constraint if exists privacy_portraits_asset_role_check,
  add constraint privacy_portraits_asset_role_check
    check (asset_role in ('source', 'card', 'avatar')),
  drop constraint if exists privacy_portraits_public_role_check,
  add constraint privacy_portraits_public_role_check
    check (not is_public_profile_portrait or asset_role = 'card'),
  drop constraint if exists privacy_portraits_focal_x_check,
  add constraint privacy_portraits_focal_x_check check (focal_x between 0 and 1),
  drop constraint if exists privacy_portraits_focal_y_check,
  add constraint privacy_portraits_focal_y_check check (focal_y between 0 and 1),
  drop constraint if exists privacy_portraits_zoom_check,
  add constraint privacy_portraits_zoom_check check (zoom between 1 and 3),
  drop constraint if exists privacy_portraits_crop_aspect_check,
  add constraint privacy_portraits_crop_aspect_check check (crop_aspect in ('legacy', 'source', '4:5', '1:1')),
  drop constraint if exists privacy_portraits_source_dimensions_check,
  add constraint privacy_portraits_source_dimensions_check check (
    (source_width is null and source_height is null)
    or (source_width between 1 and 20000 and source_height between 1 and 20000)
  ),
  drop constraint if exists privacy_portraits_output_dimensions_check,
  add constraint privacy_portraits_output_dimensions_check check (
    (output_width is null and output_height is null)
    or (output_width between 1 and 4096 and output_height between 1 and 4096)
  ),
  drop constraint if exists privacy_portraits_quality_flags_check,
  add constraint privacy_portraits_quality_flags_check check (
    quality_flags <@ array['low-resolution', 'landscape-source', 'very-tall-source']::text[]
  );

create unique index if not exists privacy_portraits_preparation_role_unique
  on public.privacy_portraits (user_id, preparation_id, asset_role);

create unique index if not exists privacy_portraits_one_selected_card
  on public.privacy_portraits (user_id)
  where is_public_profile_portrait;

create index if not exists privacy_portraits_preparation_lookup
  on public.privacy_portraits (user_id, preparation_id, asset_role);

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
  p_quality_flags text[] default '{}'
)
returns uuid
language plpgsql
security definer
set search_path = public, storage
as $$
declare
  v_user_id uuid := auth.uid();
  v_prefix text;
  v_card_id uuid;
  v_flags text[] := coalesce(p_quality_flags, '{}');
begin
  if v_user_id is null then raise exception 'authentication required'; end if;
  if p_preparation_id is null then raise exception 'preparation id required'; end if;
  if p_source_width not between 1 and 20000 or p_source_height not between 1 and 20000 then
    raise exception 'invalid source dimensions';
  end if;
  if p_focal_x not between 0 and 1 or p_focal_y not between 0 and 1 then
    raise exception 'invalid focal point';
  end if;
  if p_zoom not between 1 and 3 then raise exception 'invalid zoom'; end if;
  if not (v_flags <@ array['low-resolution', 'landscape-source', 'very-tall-source']::text[]) then
    raise exception 'invalid quality flags';
  end if;

  v_prefix := v_user_id::text || '/prepared/' || p_preparation_id::text || '/';
  if p_source_object_path <> v_prefix || 'source.webp'
     or p_card_object_path <> v_prefix || 'card-4x5.webp'
     or p_avatar_object_path <> v_prefix || 'avatar-square.webp' then
    raise exception 'prepared portrait paths do not match the authenticated account';
  end if;

  if (
    select count(*)
    from storage.objects object
    where object.bucket_id = 'privacy-portraits'
      and object.name in (p_source_object_path, p_card_object_path, p_avatar_object_path)
  ) <> 3 then
    raise exception 'all prepared portrait objects must exist before registration';
  end if;

  update public.privacy_portraits
  set is_public_profile_portrait = false,
      updated_at = timezone('utc', now())
  where user_id = v_user_id
    and is_public_profile_portrait;

  insert into public.privacy_portraits (
    user_id, preparation_id, asset_role, object_path, source_object_path,
    treatment, status, is_public_profile_portrait,
    focal_x, focal_y, zoom, crop_aspect,
    source_width, source_height, output_width, output_height,
    metadata_stripped, quality_flags
  ) values (
    v_user_id, p_preparation_id, 'source', p_source_object_path, p_source_object_path,
    'normalized-source-webp', 'pending', false,
    p_focal_x, p_focal_y, p_zoom, 'source',
    p_source_width, p_source_height, null, null,
    true, v_flags
  )
  on conflict (user_id, preparation_id, asset_role) do update set
    object_path = excluded.object_path,
    source_object_path = excluded.source_object_path,
    treatment = excluded.treatment,
    status = excluded.status,
    is_public_profile_portrait = false,
    focal_x = excluded.focal_x,
    focal_y = excluded.focal_y,
    zoom = excluded.zoom,
    crop_aspect = excluded.crop_aspect,
    source_width = excluded.source_width,
    source_height = excluded.source_height,
    output_width = excluded.output_width,
    output_height = excluded.output_height,
    metadata_stripped = excluded.metadata_stripped,
    quality_flags = excluded.quality_flags,
    updated_at = timezone('utc', now());

  insert into public.privacy_portraits (
    user_id, preparation_id, asset_role, object_path, source_object_path,
    treatment, status, is_public_profile_portrait,
    focal_x, focal_y, zoom, crop_aspect,
    source_width, source_height, output_width, output_height,
    metadata_stripped, quality_flags
  ) values (
    v_user_id, p_preparation_id, 'avatar', p_avatar_object_path, p_source_object_path,
    'prepared-avatar-square-webp', 'pending', false,
    p_focal_x, p_focal_y, p_zoom, '1:1',
    p_source_width, p_source_height, 384, 384,
    true, v_flags
  )
  on conflict (user_id, preparation_id, asset_role) do update set
    object_path = excluded.object_path,
    source_object_path = excluded.source_object_path,
    treatment = excluded.treatment,
    status = excluded.status,
    is_public_profile_portrait = false,
    focal_x = excluded.focal_x,
    focal_y = excluded.focal_y,
    zoom = excluded.zoom,
    crop_aspect = excluded.crop_aspect,
    source_width = excluded.source_width,
    source_height = excluded.source_height,
    output_width = excluded.output_width,
    output_height = excluded.output_height,
    metadata_stripped = excluded.metadata_stripped,
    quality_flags = excluded.quality_flags,
    updated_at = timezone('utc', now());

  insert into public.privacy_portraits (
    user_id, preparation_id, asset_role, object_path, source_object_path,
    treatment, status, is_public_profile_portrait,
    focal_x, focal_y, zoom, crop_aspect,
    source_width, source_height, output_width, output_height,
    metadata_stripped, quality_flags
  ) values (
    v_user_id, p_preparation_id, 'card', p_card_object_path, p_source_object_path,
    'prepared-card-4x5-webp', 'pending', true,
    p_focal_x, p_focal_y, p_zoom, '4:5',
    p_source_width, p_source_height, 960, 1200,
    true, v_flags
  )
  on conflict (user_id, preparation_id, asset_role) do update set
    object_path = excluded.object_path,
    source_object_path = excluded.source_object_path,
    treatment = excluded.treatment,
    status = excluded.status,
    is_public_profile_portrait = true,
    focal_x = excluded.focal_x,
    focal_y = excluded.focal_y,
    zoom = excluded.zoom,
    crop_aspect = excluded.crop_aspect,
    source_width = excluded.source_width,
    source_height = excluded.source_height,
    output_width = excluded.output_width,
    output_height = excluded.output_height,
    metadata_stripped = excluded.metadata_stripped,
    quality_flags = excluded.quality_flags,
    updated_at = timezone('utc', now())
  returning id into v_card_id;

  insert into public.audit_events (
    actor_user_id, actor_type, event_type, subject_user_id, entity_type, entity_id, payload
  ) values (
    v_user_id,
    'user',
    'prepared_portrait_registered',
    v_user_id,
    'privacy_portrait_preparation',
    p_preparation_id::text,
    jsonb_build_object(
      'asset_roles', array['source', 'card', 'avatar'],
      'source_dimensions', jsonb_build_array(p_source_width, p_source_height),
      'quality_flags', to_jsonb(v_flags),
      'metadata_stripped', true
    )
  );

  return v_card_id;
end;
$$;

revoke all on function public.register_prepared_portrait(uuid, text, text, text, numeric, numeric, numeric, integer, integer, text[]) from public, anon;
grant execute on function public.register_prepared_portrait(uuid, text, text, text, numeric, numeric, numeric, integer, integer, text[]) to authenticated;
