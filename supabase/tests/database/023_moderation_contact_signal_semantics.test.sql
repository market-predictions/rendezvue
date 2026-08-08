begin;

select plan(8);

insert into auth.users (
  instance_id,id,aud,role,email,encrypted_password,email_confirmed_at,
  raw_app_meta_data,raw_user_meta_data,created_at,updated_at
) values
  ('00000000-0000-0000-0000-000000000000','74800000-0000-0000-0000-000000000001','authenticated','authenticated','wp070c-signal-actor@rendezvue.test',crypt('test',gen_salt('bf')),now(),'{"provider":"email","providers":["email"]}','{}',now(),now()),
  ('00000000-0000-0000-0000-000000000000','74800000-0000-0000-0000-000000000002','authenticated','authenticated','wp070c-signal-subject@rendezvue.test',crypt('test',gen_salt('bf')),now(),'{"provider":"email","providers":["email"]}','{}',now(),now());

update public.profiles set nickname='Signal actor',sex='man',city_region='Utrecht',relationship_intent='serious_relationship',publication_status='published'
where user_id='74800000-0000-0000-0000-000000000001';
update public.profiles set nickname='Signal subject',sex='woman',city_region='Utrecht',relationship_intent='serious_relationship',publication_status='published',is_synthetic=true,synthetic_id='wp070c-signal-subject'
where user_id='74800000-0000-0000-0000-000000000002';

insert into public.eligibility (
  user_id,date_of_birth,current_relationship_state,adult_confirmed,
  serious_intent_confirmed,community_fit_confirmed,terms_version,confirmed_at
) values
  ('74800000-0000-0000-0000-000000000001',date '1995-01-01','single',true,true,true,'wp070c-test',now()),
  ('74800000-0000-0000-0000-000000000002',date '1995-01-01','single',true,true,true,'wp070c-test',now());

-- Direct test fixture restriction; operational service callers cannot write the ledger.
insert into public.moderation_enforcement_policies (
  policy_key,policy_version,scope,action_code,duration_minutes,active
) values ('wp070c.signal.test',1,'synthetic_only','restrict_contact',60,true);

-- Minimal approved authorization objects are required by the restriction FK model.
insert into public.safety_reports (
  id,reporter_user_id,subject_user_id,category,severity,status
) values ('74900000-0000-0000-0000-000000000001','74800000-0000-0000-0000-000000000001','74800000-0000-0000-0000-000000000002','harassment','medium','actioned');
insert into public.moderation_cases (
  id,subject_user_id,source_report_id,status,priority,version,assigned_operator_ref
) values ('74900000-0000-0000-0000-000000000002','74800000-0000-0000-0000-000000000002','74900000-0000-0000-0000-000000000001','actioned',3,3,'operator:signal-proposer');
insert into public.moderation_action_proposals (
  id,case_id,subject_user_id,source_report_id,case_version,case_status,
  source_category,source_severity,review_lane,action_code,rationale_code,
  proposed_by_ref,critical_escalation_required,status,decided_at
) values (
  '74900000-0000-0000-0000-000000000003','74900000-0000-0000-0000-000000000002','74800000-0000-0000-0000-000000000002','74900000-0000-0000-0000-000000000001',
  2,'investigating','harassment','medium','general','restrict_contact','signal_test','operator:signal-proposer',false,'approved',now()
);
insert into public.moderation_action_reviews (
  id,proposal_id,reviewer_ref,decision,review_code
) values ('74900000-0000-0000-0000-000000000004','74900000-0000-0000-0000-000000000003','operator:signal-reviewer','approved','signal_test');
insert into public.moderation_restrictions (
  proposal_id,review_id,case_id,subject_user_id,policy_id,action_code,executed_by_ref,starts_at,expires_at
) select
  '74900000-0000-0000-0000-000000000003','74900000-0000-0000-0000-000000000004','74900000-0000-0000-0000-000000000002','74800000-0000-0000-0000-000000000002',
  id,'restrict_contact','operator:signal-executor',timezone('utc',now()),timezone('utc',now())+interval '60 minutes'
from public.moderation_enforcement_policies where policy_key='wp070c.signal.test';

set local "request.jwt.claims"='{"sub":"74800000-0000-0000-0000-000000000001","role":"authenticated"}';
set local role authenticated;
select ok(public.can_discover_profile('74800000-0000-0000-0000-000000000002','woman'),'contact-only restriction does not hide an otherwise discoverable profile');
select lives_ok(
  $$select * from public.record_attraction_signal('74800000-0000-0000-0000-000000000002','pass',null,null)$$,
  'Pass remains available under contact-only restriction'
);
select is(
  (select signal_type::text from public.attraction_signals where actor_user_id='74800000-0000-0000-0000-000000000001' and target_user_id='74800000-0000-0000-0000-000000000002'),
  'pass',
  'Pass is persisted as a non-contact signal under contact restriction'
);
select throws_ok(
  $$select * from public.record_attraction_signal('74800000-0000-0000-0000-000000000002','like',null,null)$$,
  'P0001','interaction unavailable','direct Like remains blocked by contact restriction'
);
select throws_ok(
  $$select * from public.record_attraction_signal('74800000-0000-0000-0000-000000000002','contextual_like','bio','hello')$$,
  'P0001','interaction unavailable','contextual Like remains blocked by contact restriction'
);
reset role;

select is((select count(*) from public.matches where user_a_id='74800000-0000-0000-0000-000000000001' or user_b_id='74800000-0000-0000-0000-000000000001'),0::bigint,'contact restriction creates no match through blocked attraction');
select is((select count(*) from public.attraction_signals where actor_user_id='74800000-0000-0000-0000-000000000001'),1::bigint,'blocked likes do not overwrite the allowed Pass signal');
select is((select count(*) from public.blocks where blocker_user_id='74800000-0000-0000-0000-000000000002' or blocked_user_id='74800000-0000-0000-0000-000000000002'),0::bigint,'contact restriction still does not fabricate participant blocks');

select * from finish();
rollback;
