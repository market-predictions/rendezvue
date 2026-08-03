-- WP-065D follow-up: account references must be able to become NULL when an
-- Auth user is deleted. Case-opening invariants remain enforced by the
-- service-only open_account_support_case function; direct table writes are not
-- granted to service_role, authenticated or anon.

alter table public.account_support_cases
  drop constraint if exists account_support_kind_accounts;
