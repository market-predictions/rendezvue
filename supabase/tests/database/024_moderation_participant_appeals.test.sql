begin;

select no_plan();

select has_table('public','moderation_appeals','moderation appeal operational table exists');
select has_function('public','list_my_moderation_notices',array[]::text[],'participant notice projection exists');
select has_function('public','submit_moderation_appeal',array['uuid','text','text'],'participant appeal submission RPC exists');
select has_function('public','list_pending_moderation_appeals',array['integer'],'private appeal queue exists');
select has_function('public','review_moderation_appeal',array['uuid','text','text','text'],'controlled appeal review RPC exists');
select ok((select relrowsecurity from pg_class where oid='public.moderation_appeals'::regclass),'moderation appeals have RLS enabled');
select ok(has_table_privilege('service_role','public.moderation_appeals','SELECT'),'service role can read appeal operations');
select ok(
  not has_table_privilege('service_role','public.moderation_appeals','INSERT')
  and not has_table_privilege('service_role','public.moderation_appeals','UPDATE')
  and not has_table_privilege('service_role','public.moderation_appeals','DELETE'),
  'service role cannot bypass controlled appeal mutation'
);
select ok(
  not has_table_privilege('authenticated','public.moderation_appeals','SELECT')
  and not has_table_privilege('anon','public.moderation_appeals','SELECT'),
  'participants cannot inspect raw appeal operational state'
);
select ok(has_function_privilege('authenticated','public.list_my_moderation_notices()','EXECUTE'),'authenticated participant can read own bounded notices');
select ok(has_function_privilege('authenticated','public.submit_moderation_appeal(uuid,text,text)','EXECUTE'),'authenticated participant can submit own appeal');
select ok(
  not has_function_privilege('authenticated','public.list_pending_moderation_appeals(integer)','EXECUTE')
  and not has_function_privilege('authenticated','public.review_moderation_appeal(uuid,text,text,text)','EXECUTE'),
  'participant cannot inspect service queue or review appeals'
);
select ok(
  has_function_privilege('service_role','public.list_pending_moderation_appeals(integer)','EXECUTE')
  and has_function_privilege('service_role','public.review_moderation_appeal(uuid,text,text,text)','EXECUTE'),
  'service role can use controlled appeal queue and review RPC'
);

insert into auth.users (
  instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,
  raw_app_meta_data,raw_user_meta_data,created_at,updated_at
) values
  ('00000000-0000-0000-0000-000000000000','74000000-0000-0000-0000-000000000001','authenticated','authenticated','wp070d-reporter@rendezvue.test',crypt('test',gen_salt('bf')),now(),'{"provider":"email","providers":["email"]}','{}',now(),now()),
  ('00000000-0000-0000-0000-000000000000','74000000-0000-0000-0000-000000000002','authenticated','authenticated','wp070d-subject@rendezvue.test',crypt('test',gen_salt('bf')),now(),'{"provider":"email","providers":["email"]}','{}',now(),now()),
  ('00000000-0000-0000-0000-000000000000','74000000-0000-0000-0000-000000000003','authenticated','authenticated','wp070d-other@rendezvue.test',crypt('test',gen_salt('bf')),now(),'{"provider":"email","providers":["email"]}','{}',now(),now());

update public.profiles set nickname='Reporter',sex='man',city_region='Utrecht',relationship_intent='serious_relationship',publication_status='published'
where user_id='74000000-0000-0000-0000-000000000001';
update public.profiles set nickname='Appeal subject',sex='woman',city_region='Utrecht',relationship_intent='serious_relationship',publication_status='published',is_synthetic=true,synthetic_id='wp070d-subject'
where user_id='74000000-0000-0000-0000-000000000002';
update public.profiles set nickname='Other',sex='woman',city_region='Utrecht',relationship_intent='serious_relationship',publication_status='published'
where user_id='74000000-0000-0000-0000-000000000003';

insert into public.eligibility (
  user_id,date_of_birth,current_relationship_state,adult_confirmed,
  serious_intent_confirmed,community_fit_confirmed,terms_version,confirmed_at
)
select id,date '1995-01-01','single',true,true,true,'wp070d-test',now()
from auth.users
where id between '74000000-0000-0000-0000-000000000001' and '74000000-0000-0000-0000-000000000003';

insert into public.safety_reports (
  reporter_user_id,subject_user_id,category,description,severity,status
) values (
  '74000000-0000-0000-0000-000000000001',
  '74000000-0000-0000-0000-000000000002',
  'harassment',
  'private reporter narrative must never enter participant notice',
  'medium',
  'open'
);

set local role service_role;
select public.claim_moderation_report(
  (select id from public.safety_reports where subject_user_id='74000000-0000-0000-0000-000000000002'),
  'operator:wp070d-proposer',null
);
select public.transition_moderation_case(
  (select id from public.moderation_cases where subject_user_id='74000000-0000-0000-0000-000000000002'),
  1,'triage','investigating','operator:wp070d-proposer',null,'prepare appeal proof'
);
select public.propose_moderation_action(
  (select id from public.moderation_cases where subject_user_id='74000000-0000-0000-0000-000000000002'),
  2,'operator:wp070d-proposer','restrict_contact','community_conduct_review'
);
select public.review_moderation_action_proposal(
  (select id from public.moderation_action_proposals where subject_user_id='74000000-0000-0000-0000-000000000002'),
  'operator:wp070d-original-reviewer','approved','wp070d_original_approved'
);
reset role;

-- Test-only policy activation is transaction-local and rolls back.
update public.moderation_enforcement_policies
set active=true
where policy_key='wp070c.synthetic.reversible' and policy_version=1 and action_code='restrict_contact';

set local role service_role;
select public.execute_approved_moderation_restriction(
  (select id from public.moderation_action_proposals where subject_user_id='74000000-0000-0000-0000-000000000002'),
  'wp070c.synthetic.reversible',1,'operator:wp070d-executor'
);
reset role;

select is((select count(*) from public.moderation_restrictions where subject_user_id='74000000-0000-0000-0000-000000000002'),1::bigint,'appeal proof uses one actually executed reversible restriction');
select is((select status::text from public.moderation_cases where subject_user_id='74000000-0000-0000-0000-000000000002'),'actioned','executed restriction has historical actioned case state');

set local "request.jwt.claims"='{"sub":"74000000-0000-0000-0000-000000000002","role":"authenticated"}';
set local role authenticated;
select is((select count(*) from public.list_my_moderation_notices()),1::bigint,'affected participant sees exactly one own restriction notice');
select is((select action_code from public.list_my_moderation_notices()),'restrict_contact','notice exposes bounded action class');
select is((select reason_key from public.list_my_moderation_notices()),'moderation.reason.community_conduct_concern','notice exposes customer-safe high-level reason key');
select is((select appeal_status from public.list_my_moderation_notices()),'not_submitted','notice reports appeal availability before submission');
select ok((select appeal_available from public.list_my_moderation_notices()),'appeal is available before first submission');
select ok(
  not (
    (select to_jsonb(n) from public.list_my_moderation_notices() n limit 1)
    ?| array['proposal_id','case_id','reporter_user_id','description','severity','priority','proposed_by_ref','reviewer_ref','executed_by_ref','participant_statement']
  ),
  'participant notice projection contains none of the prohibited internal/reporter/free-text fields'
);
select ok(
  public.submit_moderation_appeal(
    (select restriction_id from public.list_my_moderation_notices()),
    'context_missing',
    'Relevant context from the participant.'
  ) is not null,
  'affected participant can submit bounded appeal for own restriction'
);
select ok(
  public.submit_moderation_appeal(
    (select restriction_id from public.list_my_moderation_notices()),
    'other',
    'Retry must return the existing appeal rather than create another.'
  ) is not null,
  'appeal retry is idempotent through the participant RPC without raw-table access'
);
select is((select appeal_status from public.list_my_moderation_notices()),'pending','participant projection shows pending appeal after submission');
select ok(not (select appeal_available from public.list_my_moderation_notices()),'second appeal is not offered for same restriction');
reset role;

select is((select count(*) from public.moderation_appeals where subject_user_id='74000000-0000-0000-0000-000000000002'),1::bigint,'one restriction has exactly one appeal row');
select is((select participant_statement from public.moderation_appeals where subject_user_id='74000000-0000-0000-0000-000000000002'),'Relevant context from the participant.','private service appeal record retains participant-provided review context');
select ok(
  not exists(
    select 1 from public.audit_events
    where event_type='moderation_appeal_submitted'
      and payload::text like '%Relevant context from the participant%'
  ),
  'appeal submission audit omits participant free-text statement'
);

select set_config(
  'test.wp070d_restriction_id',
  (select id::text from public.moderation_restrictions where subject_user_id='74000000-0000-0000-0000-000000000002'),
  true
);

set local "request.jwt.claims"='{"sub":"74000000-0000-0000-0000-000000000003","role":"authenticated"}';
set local role authenticated;
select is((select count(*) from public.list_my_moderation_notices()),0::bigint,'unaffected participant cannot see another participant notice');
select throws_ok(
  format($$select public.submit_moderation_appeal(%L::uuid,'other','not mine')$$,
    current_setting('test.wp070d_restriction_id')),
  'P0001','moderation restriction unavailable','participant cannot appeal another user restriction'
);
reset role;

set local role service_role;
select is((select count(*) from public.list_pending_moderation_appeals(10)),1::bigint,'service queue sees one pending appeal');
select throws_ok(
  format($$select public.review_moderation_appeal(%L::uuid,'operator:wp070d-proposer','upheld','conflict_test')$$,
    (select id from public.moderation_appeals where subject_user_id='74000000-0000-0000-0000-000000000002')),
  'P0001','moderation appeal requires an independent reviewer','original proposer cannot review appeal'
);
select throws_ok(
  format($$select public.review_moderation_appeal(%L::uuid,'operator:wp070d-original-reviewer','upheld','conflict_test')$$,
    (select id from public.moderation_appeals where subject_user_id='74000000-0000-0000-0000-000000000002')),
  'P0001','moderation appeal requires an independent reviewer','original WP-070B reviewer cannot review appeal'
);
select throws_ok(
  format($$select public.review_moderation_appeal(%L::uuid,'operator:wp070d-executor','upheld','conflict_test')$$,
    (select id from public.moderation_appeals where subject_user_id='74000000-0000-0000-0000-000000000002')),
  'P0001','moderation appeal requires an independent reviewer','WP-070C executor cannot review appeal'
);
reset role;

create temporary table wp070d_before_effect as
select r.id,r.starts_at,r.expires_at,c.status as case_status,c.version as case_version
from public.moderation_restrictions r
join public.moderation_cases c on c.id=r.case_id
where r.subject_user_id='74000000-0000-0000-0000-000000000002';

set local role service_role;
select is(
  public.review_moderation_appeal(
    (select id from public.moderation_appeals where subject_user_id='74000000-0000-0000-0000-000000000002'),
    'operator:wp070d-independent-appeal-reviewer',
    'recommend_early_release',
    'participant_context_warrants_release_review'
  ),
  (select id from public.moderation_appeals where subject_user_id='74000000-0000-0000-0000-000000000002'),
  'independent reviewer can record bounded non-effectful appeal outcome'
);
reset role;

select is((select status from public.moderation_appeals where subject_user_id='74000000-0000-0000-0000-000000000002'),'recommend_early_release','terminal appeal recommendation is recorded');
select is((select starts_at from public.moderation_restrictions where subject_user_id='74000000-0000-0000-0000-000000000002'),(select starts_at from wp070d_before_effect),'appeal review cannot change restriction start');
select is((select expires_at from public.moderation_restrictions where subject_user_id='74000000-0000-0000-0000-000000000002'),(select expires_at from wp070d_before_effect),'recommend early release does not shorten restriction');
select is((select status from public.moderation_cases where subject_user_id='74000000-0000-0000-0000-000000000002'),(select case_status from wp070d_before_effect),'appeal review does not mutate moderation case outcome');
select is((select version from public.moderation_cases where subject_user_id='74000000-0000-0000-0000-000000000002'),(select case_version from wp070d_before_effect),'appeal review does not mutate moderation case version');
select is((select count(*) from public.moderation_restrictions where subject_user_id='74000000-0000-0000-0000-000000000002'),1::bigint,'appeal review creates no new or replacement restriction');
select ok(
  exists(
    select 1 from public.audit_events
    where event_type='moderation_appeal_reviewed'
      and subject_user_id='74000000-0000-0000-0000-000000000002'
      and payload->>'reviewer_ref'='operator:wp070d-independent-appeal-reviewer'
      and payload->>'decision'='recommend_early_release'
  ),
  'service audit retains opaque independent appeal reviewer and bounded decision evidence'
);
select ok(
  not exists(
    select 1 from public.audit_events
    where event_type='moderation_appeal_reviewed'
      and (payload ? 'description' or payload ? 'reporter_user_id' or payload ? 'participant_statement')
  ),
  'appeal review audit omits reporter and free-text evidence'
);

set local "request.jwt.claims"='{"sub":"74000000-0000-0000-0000-000000000002","role":"authenticated"}';
set local role authenticated;
select is((select appeal_status from public.list_my_moderation_notices()),'recommend_early_release','participant sees bounded terminal appeal status');
select is((select appeal_outcome_key from public.list_my_moderation_notices()),'moderation.appeal.outcome.early_release_recommended','participant sees customer-safe terminal outcome key');
select ok(
  not (
    (select to_jsonb(n) from public.list_my_moderation_notices() n limit 1)
    ?| array['reviewer_ref','review_code','participant_statement','proposal_id','case_id']
  ),
  'final participant projection still excludes internal appeal review evidence'
);
reset role;

set local role service_role;
select throws_ok(
  format($$select public.review_moderation_appeal(%L::uuid,'operator:another-reviewer','upheld','second_decision')$$,
    (select id from public.moderation_appeals where subject_user_id='74000000-0000-0000-0000-000000000002')),
  'P0001','moderation appeal already decided','terminal appeal cannot be decided twice sequentially'
);
reset role;

select * from finish();
rollback;