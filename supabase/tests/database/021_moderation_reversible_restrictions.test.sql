begin;

select no_plan();

select has_table('public', 'moderation_enforcement_policies', 'moderation enforcement policy table exists');
select has_table('public', 'moderation_restrictions', 'moderation restriction ledger exists');
select has_function('public', 'has_active_moderation_restriction', array['uuid','text'], 'active restriction helper exists');
select has_function('public', 'execute_approved_moderation_restriction', array['uuid','text','integer','text'], 'controlled reversible restriction executor exists');

select ok((select relrowsecurity from pg_class where oid='public.moderation_enforcement_policies'::regclass), 'moderation enforcement policy table has RLS enabled');
select ok((select relrowsecurity from pg_class where oid='public.moderation_restrictions'::regclass), 'moderation restriction ledger has RLS enabled');
select is((select count(*) from public.moderation_enforcement_policies), 2::bigint, 'repository seeds exactly two bounded WP-070C synthetic policy templates');
select is((select count(*) from public.moderation_enforcement_policies where active), 0::bigint, 'WP-070C ships with zero active enforcement policies');
select is((select count(*) from public.moderation_enforcement_policies where scope <> 'synthetic_only'), 0::bigint, 'WP-070C policy scope is synthetic-only');
select is((select array_agg(distinct action_code order by action_code) from public.moderation_enforcement_policies), array['restrict_contact','restrict_discovery']::text[], 'WP-070C policy templates contain only reversible discovery/contact actions');
select ok(has_table_privilege('service_role','public.moderation_enforcement_policies','SELECT'), 'service role can read bounded moderation policies');
select ok(
  not has_table_privilege('service_role','public.moderation_enforcement_policies','INSERT')
  and not has_table_privilege('service_role','public.moderation_enforcement_policies','UPDATE')
  and not has_table_privilege('service_role','public.moderation_enforcement_policies','DELETE'),
  'service role cannot directly activate or mutate moderation policies'
);
select ok(has_table_privilege('service_role','public.moderation_restrictions','SELECT'), 'service role can read bounded moderation restrictions');
select ok(
  not has_table_privilege('service_role','public.moderation_restrictions','INSERT')
  and not has_table_privilege('service_role','public.moderation_restrictions','UPDATE')
  and not has_table_privilege('service_role','public.moderation_restrictions','DELETE'),
  'service role cannot forge or mutate restriction rows directly'
);
select ok(
  not has_table_privilege('authenticated','public.moderation_enforcement_policies','SELECT')
  and not has_table_privilege('authenticated','public.moderation_restrictions','SELECT')
  and not has_table_privilege('anon','public.moderation_enforcement_policies','SELECT')
  and not has_table_privilege('anon','public.moderation_restrictions','SELECT'),
  'participants cannot inspect moderation policies or restrictions'
);
select ok(has_function_privilege('service_role','public.execute_approved_moderation_restriction(uuid,text,integer,text)','EXECUTE'), 'service role can use controlled reversible restriction executor');
select ok(
  not has_function_privilege('authenticated','public.execute_approved_moderation_restriction(uuid,text,integer,text)','EXECUTE')
  and not has_function_privilege('anon','public.execute_approved_moderation_restriction(uuid,text,integer,text)','EXECUTE'),
  'participants cannot execute moderation restrictions'
);
select ok(
  not has_function_privilege('service_role','public.has_active_moderation_restriction(uuid,text)','EXECUTE')
  and not has_function_privilege('authenticated','public.has_active_moderation_restriction(uuid,text)','EXECUTE'),
  'private restriction helper cannot be invoked directly by service or participant callers'
);
select ok(has_function_privilege('authenticated','public.can_discover_profile(uuid,public.sex_type)','EXECUTE'), 'authenticated profile RLS retains the can_discover_profile execution contract');

-- Reusable test helper: create a medium report, claim it, move the case from
-- triage v1 to investigating v2, create a WP-070B proposal and independently
-- approve it. This helper is test-only and rolls back with this transaction.
create or replace function pg_temp.make_approved_proposal(
  p_subject uuid,
  p_description text,
  p_operator text,
  p_reviewer text,
  p_action text
)
returns uuid
language plpgsql
as $$
declare
  v_report uuid;
  v_case uuid;
  v_proposal uuid;
begin
  insert into public.safety_reports (reporter_user_id,subject_user_id,category,description,severity,status)
  values ('73000000-0000-0000-0000-000000000001',p_subject,'harassment',p_description,'medium','open')
  returning id into v_report;

  perform public.claim_moderation_report(v_report,p_operator,null);
  select id into v_case from public.moderation_cases where source_report_id=v_report;
  perform public.transition_moderation_case(v_case,1,'triage','investigating',p_operator,null,'prepare WP-070C execution proof');
  v_proposal := public.propose_moderation_action(v_case,2,p_operator,p_action,'wp070c_reversible_test');
  perform public.review_moderation_action_proposal(v_proposal,p_reviewer,'approved','wp070c_approved');
  return v_proposal;
end;
$$;

-- Actor, reversible-action subjects, one non-synthetic subject, one unsupported
-- action subject, one stale subject and one critical-defense subject.
insert into auth.users (
  instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,
  raw_app_meta_data,raw_user_meta_data,created_at,updated_at
) values
  ('00000000-0000-0000-0000-000000000000','73000000-0000-0000-0000-000000000001','authenticated','authenticated','wp070c-actor@rendezvue.test',crypt('test',gen_salt('bf')),now(),'{"provider":"email","providers":["email"]}','{}',now(),now()),
  ('00000000-0000-0000-0000-000000000000','73000000-0000-0000-0000-000000000002','authenticated','authenticated','wp070c-discovery@rendezvue.test',crypt('test',gen_salt('bf')),now(),'{"provider":"email","providers":["email"]}','{}',now(),now()),
  ('00000000-0000-0000-0000-000000000000','73000000-0000-0000-0000-000000000003','authenticated','authenticated','wp070c-contact@rendezvue.test',crypt('test',gen_salt('bf')),now(),'{"provider":"email","providers":["email"]}','{}',now(),now()),
  ('00000000-0000-0000-0000-000000000000','73000000-0000-0000-0000-000000000004','authenticated','authenticated','wp070c-real-scope@rendezvue.test',crypt('test',gen_salt('bf')),now(),'{"provider":"email","providers":["email"]}','{}',now(),now()),
  ('00000000-0000-0000-0000-000000000000','73000000-0000-0000-0000-000000000005','authenticated','authenticated','wp070c-unsupported@rendezvue.test',crypt('test',gen_salt('bf')),now(),'{"provider":"email","providers":["email"]}','{}',now(),now()),
  ('00000000-0000-0000-0000-000000000000','73000000-0000-0000-0000-000000000006','authenticated','authenticated','wp070c-stale@rendezvue.test',crypt('test',gen_salt('bf')),now(),'{"provider":"email","providers":["email"]}','{}',now(),now()),
  ('00000000-0000-0000-0000-000000000000','73000000-0000-0000-0000-000000000007','authenticated','authenticated','wp070c-critical@rendezvue.test',crypt('test',gen_salt('bf')),now(),'{"provider":"email","providers":["email"]}','{}',now(),now());

update public.profiles set nickname='Actor',sex='man',city_region='Utrecht',relationship_intent='serious_relationship',publication_status='published'
where user_id='73000000-0000-0000-0000-000000000001';
update public.profiles set nickname='Discovery subject',sex='woman',city_region='Utrecht',relationship_intent='serious_relationship',publication_status='published',is_synthetic=true,synthetic_id='wp070c-discovery'
where user_id='73000000-0000-0000-0000-000000000002';
update public.profiles set nickname='Contact subject',sex='woman',city_region='Utrecht',relationship_intent='serious_relationship',publication_status='published',is_synthetic=true,synthetic_id='wp070c-contact'
where user_id='73000000-0000-0000-0000-000000000003';
update public.profiles set nickname='Non synthetic subject',sex='woman',city_region='Utrecht',relationship_intent='serious_relationship',publication_status='published',is_synthetic=false
where user_id='73000000-0000-0000-0000-000000000004';
update public.profiles set nickname='Unsupported subject',sex='woman',city_region='Utrecht',relationship_intent='serious_relationship',publication_status='published',is_synthetic=true,synthetic_id='wp070c-unsupported'
where user_id='73000000-0000-0000-0000-000000000005';
update public.profiles set nickname='Stale subject',sex='woman',city_region='Utrecht',relationship_intent='serious_relationship',publication_status='published',is_synthetic=true,synthetic_id='wp070c-stale'
where user_id='73000000-0000-0000-0000-000000000006';
update public.profiles set nickname='Critical subject',sex='woman',city_region='Utrecht',relationship_intent='serious_relationship',publication_status='published',is_synthetic=true,synthetic_id='wp070c-critical'
where user_id='73000000-0000-0000-0000-000000000007';

insert into public.eligibility (
  user_id,date_of_birth,current_relationship_state,adult_confirmed,
  serious_intent_confirmed,community_fit_confirmed,terms_version,confirmed_at
)
select id,date '1995-01-01','single',true,true,true,'wp070c-test',now()
from auth.users
where id between '73000000-0000-0000-0000-000000000001' and '73000000-0000-0000-0000-000000000007';

insert into public.privacy_portraits (
  id,user_id,object_path,treatment,status,is_public_profile_portrait,
  preparation_id,asset_role,source_object_path,focal_x,focal_y,zoom,
  crop_aspect,metadata_stripped,privacy_filter_id,profile_media_slot,
  capture_origin,is_profile_media_visible
) values
  ('73100000-0000-0000-0000-000000000002','73000000-0000-0000-0000-000000000002','73000000-0000-0000-0000-000000000002/prepared/73200000-0000-0000-0000-000000000002/card-4x5.webp','privacy-softFocus-card-4x5-webp','verified',true,'73200000-0000-0000-0000-000000000002','card','73000000-0000-0000-0000-000000000002/prepared/73200000-0000-0000-0000-000000000002/source.webp',.5,.5,1,'4:5',true,'softFocus','profile_photo_1','legacy',true),
  ('73100000-0000-0000-0000-000000000003','73000000-0000-0000-0000-000000000003','73000000-0000-0000-0000-000000000003/prepared/73200000-0000-0000-0000-000000000003/card-4x5.webp','privacy-softFocus-card-4x5-webp','verified',true,'73200000-0000-0000-0000-000000000003','card','73000000-0000-0000-0000-000000000003/prepared/73200000-0000-0000-0000-000000000003/source.webp',.5,.5,1,'4:5',true,'softFocus','profile_photo_1','legacy',true);

insert into public.matches (id,user_a_id,user_b_id,status)
values ('73300000-0000-0000-0000-000000000001','73000000-0000-0000-0000-000000000001','73000000-0000-0000-0000-000000000003','active');
insert into public.conversations (id,match_id,opened_by_user_id,status)
values ('73400000-0000-0000-0000-000000000001','73300000-0000-0000-0000-000000000001','73000000-0000-0000-0000-000000000001','open');
insert into public.messages (id,conversation_id,sender_user_id,body)
values ('73500000-0000-0000-0000-000000000001','73400000-0000-0000-0000-000000000001','73000000-0000-0000-0000-000000000001','historical message survives restriction');

set local "request.jwt.claims"='{"sub":"73000000-0000-0000-0000-000000000001","role":"authenticated"}';
set local role authenticated;
select ok(public.can_discover_profile('73000000-0000-0000-0000-000000000002','woman'), 'baseline synthetic subject is discoverable before a restriction');
select is(public.get_discovery_portrait_path('73000000-0000-0000-0000-000000000002'), '73000000-0000-0000-0000-000000000002/prepared/73200000-0000-0000-0000-000000000002/card-4x5.webp', 'baseline discovery portrait path is available before restriction');
select ok(public.is_conversation_available('73400000-0000-0000-0000-000000000001','73000000-0000-0000-0000-000000000001'), 'baseline conversation is available before contact restriction');
reset role;

set local role service_role;
select pg_temp.make_approved_proposal('73000000-0000-0000-0000-000000000002','wp070c discovery execution proof','operator:wp070c-discovery','operator:wp070c-reviewer-a','restrict_discovery');
select throws_ok(
  format($$select public.execute_approved_moderation_restriction(%L::uuid,'wp070c.synthetic.reversible',1,'operator:wp070c-executor')$$,
    (select p.id from public.moderation_action_proposals p join public.safety_reports r on r.id=p.source_report_id where r.description='wp070c discovery execution proof')),
  'P0001','moderation enforcement policy is inactive','default-off enforcement policy blocks execution even after independent approval'
);
reset role;

-- Test-only activation inside this transaction; rollback restores repository state.
update public.moderation_enforcement_policies set active=true where policy_key='wp070c.synthetic.reversible' and policy_version=1;

set local role service_role;
select ok(
  public.execute_approved_moderation_restriction(
    (select p.id from public.moderation_action_proposals p join public.safety_reports r on r.id=p.source_report_id where r.description='wp070c discovery execution proof'),
    'wp070c.synthetic.reversible',1,'operator:wp070c-executor'
  ) is not null,
  'approved synthetic discovery proposal executes through active bounded test policy'
);
select is(
  public.execute_approved_moderation_restriction(
    (select p.id from public.moderation_action_proposals p join public.safety_reports r on r.id=p.source_report_id where r.description='wp070c discovery execution proof'),
    'wp070c.synthetic.reversible',1,'operator:wp070c-executor-retry'
  ),
  (select id from public.moderation_restrictions where subject_user_id='73000000-0000-0000-0000-000000000002'),
  'same policy/version retry is idempotent and returns the existing restriction'
);
reset role;

select is((select count(*) from public.moderation_restrictions where subject_user_id='73000000-0000-0000-0000-000000000002'),1::bigint,'discovery proposal creates exactly one restriction row');
select is((select expires_at-starts_at from public.moderation_restrictions where subject_user_id='73000000-0000-0000-0000-000000000002'),interval '60 minutes','restriction duration is supplied by policy rather than caller input');
select is((select c.status::text from public.moderation_cases c join public.safety_reports r on r.id=c.source_report_id where r.description='wp070c discovery execution proof'),'actioned','executed restriction records moderation case as actioned');
select is((select status::text from public.safety_reports where description='wp070c discovery execution proof'),'actioned','executed restriction records source report as actioned');
select is((select publication_status::text from public.profiles where user_id='73000000-0000-0000-0000-000000000002'),'published','discovery restriction does not rewrite participant publication state');
select is((select count(*) from public.blocks where blocker_user_id='73000000-0000-0000-0000-000000000002' or blocked_user_id='73000000-0000-0000-0000-000000000002'),0::bigint,'moderation restriction does not fabricate participant blocks');
select is((select count(*) from public.audit_events where event_type='moderation_restriction_executed' and subject_user_id='73000000-0000-0000-0000-000000000002'),1::bigint,'execution creates exactly one durable service audit event');
select ok(
  exists(select 1 from public.audit_events where event_type='moderation_restriction_executed' and subject_user_id='73000000-0000-0000-0000-000000000002' and payload ? 'proposed_by_ref' and payload ? 'reviewer_ref' and payload ? 'executor_ref' and payload ? 'policy_key' and payload ? 'expires_at'),
  'restriction audit retains bounded four-eyes and executor evidence'
);
select ok(
  not exists(select 1 from public.audit_events where event_type='moderation_restriction_executed' and subject_user_id='73000000-0000-0000-0000-000000000002' and (payload ? 'reporter_user_id' or payload ? 'description' or payload::text like '%wp070c discovery execution proof%')),
  'restriction audit omits reporter identity and report free text'
);

set local "request.jwt.claims"='{"sub":"73000000-0000-0000-0000-000000000001","role":"authenticated"}';
set local role authenticated;
select ok(not public.can_discover_profile('73000000-0000-0000-0000-000000000002','woman'), 'active discovery restriction hides subject from another participant');
select is(public.get_discovery_portrait_path('73000000-0000-0000-0000-000000000002'),null::text,'active discovery restriction removes discovery portrait path');
select ok(not public.can_read_discovery_portrait_object('73000000-0000-0000-0000-000000000002/prepared/73200000-0000-0000-0000-000000000002/card-4x5.webp'), 'active discovery restriction closes discovery portrait read guard');
select throws_ok($$select * from public.record_attraction_signal('73000000-0000-0000-0000-000000000002','like',null,null)$$,'P0001','target is not discoverable','active discovery restriction prevents attraction progression');
reset role;

update public.moderation_restrictions
set starts_at=timezone('utc',now())-interval '2 hours', expires_at=timezone('utc',now())-interval '1 hour'
where subject_user_id='73000000-0000-0000-0000-000000000002';
set local "request.jwt.claims"='{"sub":"73000000-0000-0000-0000-000000000001","role":"authenticated"}';
set local role authenticated;
select ok(public.can_discover_profile('73000000-0000-0000-0000-000000000002','woman'), 'expired discovery restriction automatically restores discovery authorization');
select is(public.get_discovery_portrait_path('73000000-0000-0000-0000-000000000002'),'73000000-0000-0000-0000-000000000002/prepared/73200000-0000-0000-0000-000000000002/card-4x5.webp','expired discovery restriction automatically restores discovery portrait access');
reset role;
select is((select c.status::text from public.moderation_cases c join public.safety_reports r on r.id=c.source_report_id where r.description='wp070c discovery execution proof'),'actioned','restriction expiry does not rewrite historical moderation case outcome');

-- Contact restriction: underlying relationship history remains intact while write
-- and matched-media authorization is temporarily closed.
set local role service_role;
select pg_temp.make_approved_proposal('73000000-0000-0000-0000-000000000003','wp070c contact execution proof','operator:wp070c-contact','operator:wp070c-reviewer-b','restrict_contact');
select ok(
  public.execute_approved_moderation_restriction(
    (select p.id from public.moderation_action_proposals p join public.safety_reports r on r.id=p.source_report_id where r.description='wp070c contact execution proof'),
    'wp070c.synthetic.reversible',1,'operator:wp070c-executor-b'
  ) is not null,
  'approved synthetic contact proposal executes'
);
reset role;
select is((select status::text from public.matches where id='73300000-0000-0000-0000-000000000001'),'active','contact restriction does not rewrite match state');
select is((select status::text from public.conversations where id='73400000-0000-0000-0000-000000000001'),'open','contact restriction does not rewrite conversation state');
select is((select count(*) from public.messages where conversation_id='73400000-0000-0000-0000-000000000001'),1::bigint,'contact restriction does not delete historical messages');
select is((select count(*) from public.blocks where blocker_user_id='73000000-0000-0000-0000-000000000003' or blocked_user_id='73000000-0000-0000-0000-000000000003'),0::bigint,'contact restriction does not create participant block rows');

set local "request.jwt.claims"='{"sub":"73000000-0000-0000-0000-000000000001","role":"authenticated"}';
set local role authenticated;
select ok(not public.is_conversation_available('73400000-0000-0000-0000-000000000001','73000000-0000-0000-0000-000000000001'), 'active contact restriction closes message-write availability');
select is(public.get_matched_portrait_path('73000000-0000-0000-0000-000000000003'),null::text,'active contact restriction closes matched portrait path');
select ok(not public.can_read_matched_portrait_object('73000000-0000-0000-0000-000000000003/prepared/73200000-0000-0000-0000-000000000003/card-4x5.webp'), 'active contact restriction closes matched portrait read guard');
select throws_ok($$insert into public.messages (conversation_id,sender_user_id,body) values ('73400000-0000-0000-0000-000000000001','73000000-0000-0000-0000-000000000001','must fail during contact restriction')$$,'42501',null,'active contact restriction prevents new message writes through RLS');
select throws_ok($$select public.open_match_conversation('73300000-0000-0000-0000-000000000001','wp070c-reopen')$$,'P0001','interaction unavailable','active contact restriction prevents conversation opening/retry');
select throws_ok($$select * from public.record_attraction_signal('73000000-0000-0000-0000-000000000003','like',null,null)$$,'P0001','interaction unavailable','active contact restriction prevents attraction/contact progression');
select is((select count(*) from public.messages where conversation_id='73400000-0000-0000-0000-000000000001'),1::bigint,'participant can still read historical conversation content while writes are restricted');
reset role;

update public.moderation_restrictions
set starts_at=timezone('utc',now())-interval '2 hours', expires_at=timezone('utc',now())-interval '1 hour'
where subject_user_id='73000000-0000-0000-0000-000000000003';
set local "request.jwt.claims"='{"sub":"73000000-0000-0000-0000-000000000001","role":"authenticated"}';
set local role authenticated;
select ok(public.is_conversation_available('73400000-0000-0000-0000-000000000001','73000000-0000-0000-0000-000000000001'), 'expired contact restriction automatically restores message-write authorization');
select lives_ok($$insert into public.messages (conversation_id,sender_user_id,body) values ('73400000-0000-0000-0000-000000000001','73000000-0000-0000-0000-000000000001','write restored after expiry')$$,'message write succeeds again after automatic restriction expiry');
reset role;
select is((select count(*) from public.messages where conversation_id='73400000-0000-0000-0000-000000000001'),2::bigint,'automatic expiry restores writes without rewriting conversation history');

-- Synthetic-only scope: authorization can exist, but execution remains denied.
set local role service_role;
select pg_temp.make_approved_proposal('73000000-0000-0000-0000-000000000004','wp070c non synthetic proof','operator:wp070c-real-scope','operator:wp070c-reviewer-c','restrict_contact');
select throws_ok(
  format($$select public.execute_approved_moderation_restriction(%L::uuid,'wp070c.synthetic.reversible',1,'operator:wp070c-executor-c')$$,
    (select p.id from public.moderation_action_proposals p join public.safety_reports r on r.id=p.source_report_id where r.description='wp070c non synthetic proof')),
  'P0001','WP-070C executor is restricted to synthetic profiles','executor rejects non-synthetic target even under active test policy'
);
reset role;
select is((select count(*) from public.moderation_restrictions where subject_user_id='73000000-0000-0000-0000-000000000004'),0::bigint,'non-synthetic target receives no restriction row');
select is((select publication_status::text from public.profiles where user_id='73000000-0000-0000-0000-000000000004'),'published','non-synthetic target state remains untouched');

-- Unsupported irreversible action: WP-070B may represent it, WP-070C cannot execute it.
set local role service_role;
select pg_temp.make_approved_proposal('73000000-0000-0000-0000-000000000005','wp070c unsupported action proof','operator:wp070c-unsupported','operator:wp070c-reviewer-d','suspend_account');
select throws_ok(
  format($$select public.execute_approved_moderation_restriction(%L::uuid,'wp070c.synthetic.reversible',1,'operator:wp070c-executor-d')$$,
    (select p.id from public.moderation_action_proposals p join public.safety_reports r on r.id=p.source_report_id where r.description='wp070c unsupported action proof')),
  'P0001','moderation action is not executable by WP-070C','WP-070C cannot execute suspend_account'
);
reset role;
select is((select count(*) from auth.users where id='73000000-0000-0000-0000-000000000005'),1::bigint,'unsupported irreversible action does not delete or alter Auth presence');
select is((select count(*) from public.moderation_restrictions where subject_user_id='73000000-0000-0000-0000-000000000005'),0::bigint,'unsupported irreversible action creates no restriction');

-- Stale approved authorization: advance case after independent approval.
set local role service_role;
select pg_temp.make_approved_proposal('73000000-0000-0000-0000-000000000006','wp070c stale execution proof','operator:wp070c-stale','operator:wp070c-reviewer-e','restrict_contact');
select is(
  public.unclaim_moderation_case(
    (select c.id from public.moderation_cases c join public.safety_reports r on r.id=c.source_report_id where r.description='wp070c stale execution proof'),
    2,'operator:wp070c-stale','make approved proposal stale before execution'
  ),
  3,
  'case version advances after approval'
);
select throws_ok(
  format($$select public.execute_approved_moderation_restriction(%L::uuid,'wp070c.synthetic.reversible',1,'operator:wp070c-executor-e')$$,
    (select p.id from public.moderation_action_proposals p join public.safety_reports r on r.id=p.source_report_id where r.description='wp070c stale execution proof')),
  'P0001','stale moderation restriction case version','executor independently rejects stale approved authorization'
);
reset role;
select is((select count(*) from public.moderation_restrictions where subject_user_id='73000000-0000-0000-0000-000000000006'),0::bigint,'stale approved authorization creates no restriction');

-- Critical defense in depth. A direct critical report creates no case by itself;
-- claim creates triage v1, then the normal transition produces investigating v2.
-- WP-070B would refuse ordinary approval, so database-owner fixture setup below
-- fabricates one only to prove the WP-070C executor independently refuses it.
insert into public.safety_reports (reporter_user_id,subject_user_id,category,description,severity,status)
values ('73000000-0000-0000-0000-000000000001','73000000-0000-0000-0000-000000000007','threat','wp070c critical executor defense proof','critical','open');
set local role service_role;
select ok(public.claim_moderation_report((select id from public.safety_reports where description='wp070c critical executor defense proof'),'operator:wp070c-critical',null) is not null,'critical proof report can be claimed for defense-in-depth test');
select is(
  public.transition_moderation_case(
    (select c.id from public.moderation_cases c join public.safety_reports r on r.id=c.source_report_id where r.description='wp070c critical executor defense proof'),
    1,'triage','investigating','operator:wp070c-critical',null,'prepare critical defense proof'
  ),
  2,
  'critical case reaches investigating version 2'
);
select ok(
  public.propose_moderation_action(
    (select c.id from public.moderation_cases c join public.safety_reports r on r.id=c.source_report_id where r.description='wp070c critical executor defense proof'),
    2,'operator:wp070c-critical','restrict_contact','wp070c_critical'
  ) is not null,
  'critical proposal is represented for specialist path'
);
reset role;

update public.moderation_action_proposals
set status='approved',decided_at=timezone('utc',now())
where source_report_id=(select id from public.safety_reports where description='wp070c critical executor defense proof');
insert into public.moderation_action_reviews (proposal_id,reviewer_ref,decision,review_code)
select p.id,'operator:wp070c-critical-reviewer','approved','fabricated_defense_test'
from public.moderation_action_proposals p
join public.safety_reports r on r.id=p.source_report_id
where r.description='wp070c critical executor defense proof';

set local role service_role;
select throws_ok(
  format($$select public.execute_approved_moderation_restriction(%L::uuid,'wp070c.synthetic.reversible',1,'operator:wp070c-critical-executor')$$,
    (select p.id from public.moderation_action_proposals p join public.safety_reports r on r.id=p.source_report_id where r.description='wp070c critical executor defense proof')),
  'P0001','critical moderation proposal cannot use reversible executor','executor independently rejects a fabricated approved critical proposal'
);
reset role;
select is((select count(*) from public.moderation_restrictions where subject_user_id='73000000-0000-0000-0000-000000000007'),0::bigint,'critical proposal creates no reversible restriction');

select * from finish();
rollback;
