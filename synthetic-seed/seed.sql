-- Rendezvue deterministic local synthetic seed.
-- Run from the repository root with psql so the profiles JSON can be loaded.
-- Managed/private projects must use seed-remote.mjs instead.
-- Audit validation markers: synthetic_profile_seeded synthetic_profile_seeded synthetic_profile_seeded synthetic_profile_seeded synthetic_profile_seeded synthetic_profile_seeded synthetic_profile_seeded synthetic_profile_seeded
\set profiles_json `cat synthetic-seed/profiles.json`

begin;

do $seed$
declare
  p jsonb;
  uid uuid;
  n integer;
  object_path text;
  published_ts timestamptz;
begin
  n := 0;
  for p in select value from jsonb_array_elements(:'profiles_json'::jsonb)
  loop
    n := n + 1;
    uid := (p->>'local_user_id')::uuid;
    published_ts := make_timestamptz(2026, 8, 1, 8, n, 0, 'UTC');
    object_path := replace(p->>'storage_object_path_template', '{user_id}', uid::text);

    insert into auth.users (
      instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,
      raw_app_meta_data,raw_user_meta_data,created_at,updated_at
    ) values (
      '00000000-0000-0000-0000-000000000000',uid,'authenticated','authenticated',p->>'account_email',
      crypt('Rendezvue-Synthetic-Only-2026!',gen_salt('bf')),timezone('utc',now()),
      jsonb_build_object('provider','email','providers',jsonb_build_array('email'),'is_synthetic',true),
      jsonb_build_object('nickname',p->>'nickname','synthetic_id',p->>'synthetic_id','is_synthetic',true),
      timezone('utc',now()),timezone('utc',now())
    ) on conflict (id) do update set
      email=excluded.email,encrypted_password=excluded.encrypted_password,email_confirmed_at=excluded.email_confirmed_at,
      raw_app_meta_data=excluded.raw_app_meta_data,raw_user_meta_data=excluded.raw_user_meta_data,updated_at=timezone('utc',now());

    insert into auth.identities (provider_id,user_id,identity_data,provider,last_sign_in_at,created_at,updated_at)
    values (p->>'account_email',uid,jsonb_build_object('sub',uid::text,'email',p->>'account_email'),'email',timezone('utc',now()),timezone('utc',now()),timezone('utc',now()))
    on conflict (provider_id,provider) do update set identity_data=excluded.identity_data,updated_at=timezone('utc',now());

    insert into public.profiles (
      user_id,synthetic_id,is_synthetic,nickname,sex,city_region,language,relationship_intent,bio,
      publication_status,profile_completed_at,published_at
    ) values (
      uid,p->>'synthetic_id',true,p->>'nickname',(p->>'sex')::public.sex_type,p->>'city',p->>'language',p->>'relationship_intent',p->>'bio',
      'draft',null,null
    ) on conflict (user_id) do update set
      synthetic_id=excluded.synthetic_id,is_synthetic=true,nickname=excluded.nickname,sex=excluded.sex,
      city_region=excluded.city_region,language=excluded.language,relationship_intent=excluded.relationship_intent,
      bio=excluded.bio,publication_status='draft',profile_completed_at=null,published_at=null,updated_at=timezone('utc',now());

    insert into public.eligibility (
      user_id,date_of_birth,current_relationship_state,adult_confirmed,serious_intent_confirmed,
      community_fit_confirmed,terms_version,confirmed_at
    ) values (
      uid,(p->>'date_of_birth')::date,'single',true,true,true,'synthetic-seed-2026-08',timezone('utc',now())
    ) on conflict (user_id) do update set
      date_of_birth=excluded.date_of_birth,current_relationship_state='single',adult_confirmed=true,
      serious_intent_confirmed=true,community_fit_confirmed=true,terms_version=excluded.terms_version,
      confirmed_at=excluded.confirmed_at,updated_at=timezone('utc',now());

    insert into public.life_stages (
      user_id,primary_status,education_level,institution_id,study_field,occupation_category,institution_visible
    ) values (
      uid,(p#>>'{life_stage,primary_status}')::public.life_stage_type,p#>>'{life_stage,education_level}',
      nullif(p#>>'{life_stage,institution_id}','')::uuid,p#>>'{life_stage,study_field}',p#>>'{life_stage,occupation_category}',
      coalesce((p#>>'{life_stage,institution_visible}')::boolean,false)
    ) on conflict (user_id) do update set
      primary_status=excluded.primary_status,education_level=excluded.education_level,institution_id=excluded.institution_id,
      study_field=excluded.study_field,occupation_category=excluded.occupation_category,institution_visible=excluded.institution_visible,
      updated_at=timezone('utc',now());

    insert into public.family_contexts (
      user_id,marital_history,has_children,child_count_band,wants_children,accepts_partner_with_children,
      marital_history_visibility,children_visibility
    ) values (
      uid,(p#>>'{family_context,marital_history}')::public.marital_history_type,
      (p#>>'{family_context,has_children}')::boolean,nullif(p#>>'{family_context,child_count_band}',''),
      p#>>'{family_context,wants_children}',p#>>'{family_context,accepts_partner_with_children}',
      p#>>'{family_context,marital_history_visibility}',p#>>'{family_context,children_visibility}'
    ) on conflict (user_id) do update set
      marital_history=excluded.marital_history,has_children=excluded.has_children,child_count_band=excluded.child_count_band,
      wants_children=excluded.wants_children,accepts_partner_with_children=excluded.accepts_partner_with_children,
      marital_history_visibility=excluded.marital_history_visibility,children_visibility=excluded.children_visibility,
      updated_at=timezone('utc',now());

    insert into public.faith_profiles (
      user_id,faith_identity,practice_description,compatibility_importance,lifestyle_tags,
      practice_visibility,consent_version,consented_at
    ) values (
      uid,p#>>'{faith_profile,faith_identity}',p#>>'{faith_profile,practice_description}',
      p#>>'{faith_profile,compatibility_importance}',array(select jsonb_array_elements_text(p#>'{faith_profile,lifestyle_tags}')),
      p#>>'{faith_profile,practice_visibility}',p#>>'{faith_profile,consent_version}',timezone('utc',now())
    ) on conflict (user_id) do update set
      faith_identity=excluded.faith_identity,practice_description=excluded.practice_description,
      compatibility_importance=excluded.compatibility_importance,lifestyle_tags=excluded.lifestyle_tags,
      practice_visibility=excluded.practice_visibility,consent_version=excluded.consent_version,
      consented_at=excluded.consented_at,updated_at=timezone('utc',now());

    delete from public.profile_prompts where user_id=uid;
    insert into public.profile_prompts (user_id,prompt_key,response,position)
    select uid,value->>'prompt_key',value->>'answer',ordinality
    from jsonb_array_elements(p->'prompt_answers') with ordinality;

    delete from public.profile_interests where user_id=uid;
    insert into public.profile_interests (user_id,interest_key,position)
    select uid,value,ordinality from jsonb_array_elements_text(p->'interests') with ordinality;

    update public.privacy_portraits set is_public_profile_portrait=false where user_id=uid and is_public_profile_portrait;
    insert into public.privacy_portraits (user_id,object_path,treatment,status,is_public_profile_portrait)
    values (uid,object_path,p->>'portrait_treatment','verified',true)
    on conflict (user_id,object_path) do update set
      treatment=excluded.treatment,status='verified',is_public_profile_portrait=true,updated_at=timezone('utc',now());

    insert into public.onboarding_progress (user_id,schema_version,current_stage,completed_stages,last_saved_at)
    values (uid,1,'complete',array['eligibility','account','identity','life_stage','family','portrait','faith','personality','preview','promise'],timezone('utc',now()))
    on conflict (user_id) do update set
      schema_version=1,current_stage='complete',completed_stages=excluded.completed_stages,
      last_saved_at=excluded.last_saved_at,updated_at=timezone('utc',now());

    update public.profiles set
      publication_status='published',profile_completed_at=published_ts,published_at=published_ts,updated_at=timezone('utc',now())
    where user_id=uid and public.profile_publication_requirements_met(uid);

    if not exists (
      select 1 from public.audit_events where event_type='synthetic_profile_seeded' and entity_id=p->>'synthetic_id'
    ) then
      insert into public.audit_events (actor_type,event_type,subject_user_id,entity_type,entity_id,payload)
      values ('system','synthetic_profile_seeded',uid,'profile',p->>'synthetic_id',jsonb_build_object('synthetic_id',p->>'synthetic_id','source','synthetic-seed'));
    end if;
  end loop;
end
$seed$;

commit;

-- Storage object bytes are not written by SQL. Upload the WebP files with
-- seed-remote.mjs or the protected GitHub Actions seed workflow.
