/**
 * Sync with production: foreign keys of the tables created above
 *
 * Part of the production schema sync. Generated from a read-only schema dump of the shared
 * dev/production database (2026-10-17) and compared with a database built from master.
 * Every statement is guarded: on production (where these objects already exist) it does nothing;
 * on a fresh database it recreates what production has.
 * down() is intentionally a no-op so that migrate:down can never drop live tables or data.
 */

exports.up = (pgm) => {
  pgm.sql(String.raw`
DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'audience_rules_promotion_id_fkey' AND conrelid = to_regclass('public.audience_rules')) THEN
ALTER TABLE ONLY public.audience_rules
    ADD CONSTRAINT audience_rules_promotion_id_fkey FOREIGN KEY (promotion_id) REFERENCES public.promotions(id) ON DELETE CASCADE;
  END IF;
END
$sync$;

DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'audience_rules_staging_audience_rule_id_fkey' AND conrelid = to_regclass('public.audience_rules_staging')) THEN
ALTER TABLE ONLY public.audience_rules_staging
    ADD CONSTRAINT audience_rules_staging_audience_rule_id_fkey FOREIGN KEY (audience_rule_id) REFERENCES public.audience_rules(id) ON DELETE CASCADE;
  END IF;
END
$sync$;

DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'audience_rules_staging_promotion_id_fkey' AND conrelid = to_regclass('public.audience_rules_staging')) THEN
ALTER TABLE ONLY public.audience_rules_staging
    ADD CONSTRAINT audience_rules_staging_promotion_id_fkey FOREIGN KEY (promotion_id) REFERENCES public.promotions(id) ON DELETE CASCADE;
  END IF;
END
$sync$;

DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_addresses_branch' AND conrelid = to_regclass('public.company_addresses')) THEN
ALTER TABLE ONLY public.company_addresses
    ADD CONSTRAINT fk_addresses_branch FOREIGN KEY (branch_id) REFERENCES public.company_branches(id);
  END IF;
END
$sync$;

DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_addresses_company' AND conrelid = to_regclass('public.company_addresses')) THEN
ALTER TABLE ONLY public.company_addresses
    ADD CONSTRAINT fk_addresses_company FOREIGN KEY (company_id) REFERENCES public.companies(id);
  END IF;
END
$sync$;

DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_bwh_branch' AND conrelid = to_regclass('public.company_branch_working_hours')) THEN
ALTER TABLE ONLY public.company_branch_working_hours
    ADD CONSTRAINT fk_bwh_branch FOREIGN KEY (branch_id) REFERENCES public.company_branches(id);
  END IF;
END
$sync$;

DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_bwh_company' AND conrelid = to_regclass('public.company_branch_working_hours')) THEN
ALTER TABLE ONLY public.company_branch_working_hours
    ADD CONSTRAINT fk_bwh_company FOREIGN KEY (company_id) REFERENCES public.companies(id);
  END IF;
END
$sync$;

DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_branches_company' AND conrelid = to_regclass('public.company_branches')) THEN
ALTER TABLE ONLY public.company_branches
    ADD CONSTRAINT fk_branches_company FOREIGN KEY (company_id) REFERENCES public.companies(id);
  END IF;
END
$sync$;

DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_bij_company' AND conrelid = to_regclass('public.company_bulk_import_jobs')) THEN
ALTER TABLE ONLY public.company_bulk_import_jobs
    ADD CONSTRAINT fk_bij_company FOREIGN KEY (company_id) REFERENCES public.companies(id);
  END IF;
END
$sync$;

DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_bij_created_by' AND conrelid = to_regclass('public.company_bulk_import_jobs')) THEN
ALTER TABLE ONLY public.company_bulk_import_jobs
    ADD CONSTRAINT fk_bij_created_by FOREIGN KEY (created_by) REFERENCES public.company_user(id);
  END IF;
END
$sync$;

DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_eca_company' AND conrelid = to_regclass('public.company_employee_consumption_analytics')) THEN
ALTER TABLE ONLY public.company_employee_consumption_analytics
    ADD CONSTRAINT fk_eca_company FOREIGN KEY (company_id) REFERENCES public.companies(id);
  END IF;
END
$sync$;

DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_eca_employee' AND conrelid = to_regclass('public.company_employee_consumption_analytics')) THEN
ALTER TABLE ONLY public.company_employee_consumption_analytics
    ADD CONSTRAINT fk_eca_employee FOREIGN KEY (employee_id) REFERENCES public.company_employees(id);
  END IF;
END
$sync$;

DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_eca_plan' AND conrelid = to_regclass('public.company_employee_consumption_analytics')) THEN
ALTER TABLE ONLY public.company_employee_consumption_analytics
    ADD CONSTRAINT fk_eca_plan FOREIGN KEY (plan_id) REFERENCES public.company_plans(id);
  END IF;
END
$sync$;

DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_ec_employee' AND conrelid = to_regclass('public.company_employee_consumptions')) THEN
ALTER TABLE ONLY public.company_employee_consumptions
    ADD CONSTRAINT fk_ec_employee FOREIGN KEY (employee_id) REFERENCES public.company_employees(id);
  END IF;
END
$sync$;

DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_ec_mapping' AND conrelid = to_regclass('public.company_employee_consumptions')) THEN
ALTER TABLE ONLY public.company_employee_consumptions
    ADD CONSTRAINT fk_ec_mapping FOREIGN KEY (employee_plan_mapping_id) REFERENCES public.company_employee_plan_mappings(id);
  END IF;
END
$sync$;

DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_ecm_employee' AND conrelid = to_regclass('public.company_employee_customer_maps')) THEN
ALTER TABLE ONLY public.company_employee_customer_maps
    ADD CONSTRAINT fk_ecm_employee FOREIGN KEY (employee_id) REFERENCES public.company_employees(id);
  END IF;
END
$sync$;

DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_emca_company' AND conrelid = to_regclass('public.company_employee_monthly_consumption_analytics')) THEN
ALTER TABLE ONLY public.company_employee_monthly_consumption_analytics
    ADD CONSTRAINT fk_emca_company FOREIGN KEY (company_id) REFERENCES public.companies(id);
  END IF;
END
$sync$;

DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_emca_employee' AND conrelid = to_regclass('public.company_employee_monthly_consumption_analytics')) THEN
ALTER TABLE ONLY public.company_employee_monthly_consumption_analytics
    ADD CONSTRAINT fk_emca_employee FOREIGN KEY (employee_id) REFERENCES public.company_employees(id);
  END IF;
END
$sync$;

DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_emca_plan' AND conrelid = to_regclass('public.company_employee_monthly_consumption_analytics')) THEN
ALTER TABLE ONLY public.company_employee_monthly_consumption_analytics
    ADD CONSTRAINT fk_emca_plan FOREIGN KEY (plan_id) REFERENCES public.company_plans(id);
  END IF;
END
$sync$;

DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_epm_employee' AND conrelid = to_regclass('public.company_employee_plan_mappings')) THEN
ALTER TABLE ONLY public.company_employee_plan_mappings
    ADD CONSTRAINT fk_epm_employee FOREIGN KEY (employee_id) REFERENCES public.company_employees(id);
  END IF;
END
$sync$;

DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_epm_plan' AND conrelid = to_regclass('public.company_employee_plan_mappings')) THEN
ALTER TABLE ONLY public.company_employee_plan_mappings
    ADD CONSTRAINT fk_epm_plan FOREIGN KEY (plan_id) REFERENCES public.company_plans(id);
  END IF;
END
$sync$;

DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_employees_branch' AND conrelid = to_regclass('public.company_employees')) THEN
ALTER TABLE ONLY public.company_employees
    ADD CONSTRAINT fk_employees_branch FOREIGN KEY (branch_id) REFERENCES public.company_branches(id);
  END IF;
END
$sync$;

DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_employees_bulk_import' AND conrelid = to_regclass('public.company_employees')) THEN
ALTER TABLE ONLY public.company_employees
    ADD CONSTRAINT fk_employees_bulk_import FOREIGN KEY (bulk_import_job_id) REFERENCES public.company_bulk_import_jobs(id);
  END IF;
END
$sync$;

DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_employees_company' AND conrelid = to_regclass('public.company_employees')) THEN
ALTER TABLE ONLY public.company_employees
    ADD CONSTRAINT fk_employees_company FOREIGN KEY (company_id) REFERENCES public.companies(id);
  END IF;
END
$sync$;

DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_holidays_branch' AND conrelid = to_regclass('public.company_holidays')) THEN
ALTER TABLE ONLY public.company_holidays
    ADD CONSTRAINT fk_holidays_branch FOREIGN KEY (branch_id) REFERENCES public.company_branches(id);
  END IF;
END
$sync$;

DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_holidays_company' AND conrelid = to_regclass('public.company_holidays')) THEN
ALTER TABLE ONLY public.company_holidays
    ADD CONSTRAINT fk_holidays_company FOREIGN KEY (company_id) REFERENCES public.companies(id);
  END IF;
END
$sync$;

DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_pbe_branch' AND conrelid = to_regclass('public.company_plan_branch_eligibilities')) THEN
ALTER TABLE ONLY public.company_plan_branch_eligibilities
    ADD CONSTRAINT fk_pbe_branch FOREIGN KEY (branch_id) REFERENCES public.company_branches(id);
  END IF;
END
$sync$;

DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_pbe_plan' AND conrelid = to_regclass('public.company_plan_branch_eligibilities')) THEN
ALTER TABLE ONLY public.company_plan_branch_eligibilities
    ADD CONSTRAINT fk_pbe_plan FOREIGN KEY (plan_id) REFERENCES public.company_plans(id);
  END IF;
END
$sync$;

DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_cpca_company' AND conrelid = to_regclass('public.company_plan_consumption_analytics')) THEN
ALTER TABLE ONLY public.company_plan_consumption_analytics
    ADD CONSTRAINT fk_cpca_company FOREIGN KEY (company_id) REFERENCES public.companies(id);
  END IF;
END
$sync$;

DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_cpca_plan' AND conrelid = to_regclass('public.company_plan_consumption_analytics')) THEN
ALTER TABLE ONLY public.company_plan_consumption_analytics
    ADD CONSTRAINT fk_cpca_plan FOREIGN KEY (plan_id) REFERENCES public.company_plans(id);
  END IF;
END
$sync$;

DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_plans_company' AND conrelid = to_regclass('public.company_plans')) THEN
ALTER TABLE ONLY public.company_plans
    ADD CONSTRAINT fk_plans_company FOREIGN KEY (company_id) REFERENCES public.companies(id);
  END IF;
END
$sync$;

DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_plans_parent' AND conrelid = to_regclass('public.company_plans')) THEN
ALTER TABLE ONLY public.company_plans
    ADD CONSTRAINT fk_plans_parent FOREIGN KEY (parent_plan_id) REFERENCES public.company_plans(id);
  END IF;
END
$sync$;

DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_cr_company' AND conrelid = to_regclass('public.company_requests')) THEN
ALTER TABLE ONLY public.company_requests
    ADD CONSTRAINT fk_cr_company FOREIGN KEY (company_id) REFERENCES public.companies(id);
  END IF;
END
$sync$;

DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_cr_requested_by' AND conrelid = to_regclass('public.company_requests')) THEN
ALTER TABLE ONLY public.company_requests
    ADD CONSTRAINT fk_cr_requested_by FOREIGN KEY (requested_by) REFERENCES public.company_user(id);
  END IF;
END
$sync$;

DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'dl_cod_receipt_delivery_company_id_fkey' AND conrelid = to_regclass('public.dl_cod_receipt')) THEN
ALTER TABLE ONLY public.dl_cod_receipt
    ADD CONSTRAINT dl_cod_receipt_delivery_company_id_fkey FOREIGN KEY (delivery_company_id) REFERENCES public.dl_company(delivery_company_id);
  END IF;
END
$sync$;

DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'dl_cod_receipt_rider_id_fkey' AND conrelid = to_regclass('public.dl_cod_receipt')) THEN
ALTER TABLE ONLY public.dl_cod_receipt
    ADD CONSTRAINT dl_cod_receipt_rider_id_fkey FOREIGN KEY (rider_id) REFERENCES public.dl_rider(rider_id);
  END IF;
END
$sync$;

DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'dl_company_document_company_id_fkey' AND conrelid = to_regclass('public.dl_company_document')) THEN
ALTER TABLE ONLY public.dl_company_document
    ADD CONSTRAINT dl_company_document_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.dl_company(delivery_company_id);
  END IF;
END
$sync$;

DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'dl_company_document_uploaded_by_fkey' AND conrelid = to_regclass('public.dl_company_document')) THEN
ALTER TABLE ONLY public.dl_company_document
    ADD CONSTRAINT dl_company_document_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.dl_company_user(id);
  END IF;
END
$sync$;

DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'dl_company_finance_transaction_delivery_company_id_fkey' AND conrelid = to_regclass('public.dl_company_finance_transaction')) THEN
ALTER TABLE ONLY public.dl_company_finance_transaction
    ADD CONSTRAINT dl_company_finance_transaction_delivery_company_id_fkey FOREIGN KEY (delivery_company_id) REFERENCES public.dl_company(delivery_company_id);
  END IF;
END
$sync$;

DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'dl_company_role_permissions_permission_id_fkey' AND conrelid = to_regclass('public.dl_company_role_permissions')) THEN
ALTER TABLE ONLY public.dl_company_role_permissions
    ADD CONSTRAINT dl_company_role_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.dl_company_user_permissions(id);
  END IF;
END
$sync$;

DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'dl_company_role_permissions_role_id_fkey' AND conrelid = to_regclass('public.dl_company_role_permissions')) THEN
ALTER TABLE ONLY public.dl_company_role_permissions
    ADD CONSTRAINT dl_company_role_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.dl_company_roles(id);
  END IF;
END
$sync$;

DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'dl_company_user_company_id_fkey' AND conrelid = to_regclass('public.dl_company_user')) THEN
ALTER TABLE ONLY public.dl_company_user
    ADD CONSTRAINT dl_company_user_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.dl_company(delivery_company_id);
  END IF;
END
$sync$;

DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'dl_company_user_role_mappings_company_user_id_fkey' AND conrelid = to_regclass('public.dl_company_user_role_mappings')) THEN
ALTER TABLE ONLY public.dl_company_user_role_mappings
    ADD CONSTRAINT dl_company_user_role_mappings_company_user_id_fkey FOREIGN KEY (company_user_id) REFERENCES public.dl_company_user(id);
  END IF;
END
$sync$;

DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'dl_company_user_role_mappings_role_id_fkey' AND conrelid = to_regclass('public.dl_company_user_role_mappings')) THEN
ALTER TABLE ONLY public.dl_company_user_role_mappings
    ADD CONSTRAINT dl_company_user_role_mappings_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.dl_company_roles(id);
  END IF;
END
$sync$;

DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'dl_delivery_delivery_company_id_fkey' AND conrelid = to_regclass('public.dl_delivery')) THEN
ALTER TABLE ONLY public.dl_delivery
    ADD CONSTRAINT dl_delivery_delivery_company_id_fkey FOREIGN KEY (delivery_company_id) REFERENCES public.dl_company(delivery_company_id);
  END IF;
END
$sync$;

DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'dl_delivery_ride_id_fkey' AND conrelid = to_regclass('public.dl_delivery')) THEN
ALTER TABLE ONLY public.dl_delivery
    ADD CONSTRAINT dl_delivery_ride_id_fkey FOREIGN KEY (ride_id) REFERENCES public.dl_ride(ride_id);
  END IF;
END
$sync$;

DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'dl_delivery_rider_id_fkey' AND conrelid = to_regclass('public.dl_delivery')) THEN
ALTER TABLE ONLY public.dl_delivery
    ADD CONSTRAINT dl_delivery_rider_id_fkey FOREIGN KEY (rider_id) REFERENCES public.dl_rider(rider_id);
  END IF;
END
$sync$;

DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'dl_delivery_offer_delivery_id_fkey' AND conrelid = to_regclass('public.dl_delivery_offer')) THEN
ALTER TABLE ONLY public.dl_delivery_offer
    ADD CONSTRAINT dl_delivery_offer_delivery_id_fkey FOREIGN KEY (delivery_id) REFERENCES public.dl_delivery(delivery_id);
  END IF;
END
$sync$;

DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'dl_delivery_offer_ride_id_fkey' AND conrelid = to_regclass('public.dl_delivery_offer')) THEN
ALTER TABLE ONLY public.dl_delivery_offer
    ADD CONSTRAINT dl_delivery_offer_ride_id_fkey FOREIGN KEY (ride_id) REFERENCES public.dl_ride(ride_id);
  END IF;
END
$sync$;

DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'dl_delivery_offer_ride_offer_id_fkey' AND conrelid = to_regclass('public.dl_delivery_offer')) THEN
ALTER TABLE ONLY public.dl_delivery_offer
    ADD CONSTRAINT dl_delivery_offer_ride_offer_id_fkey FOREIGN KEY (ride_offer_id) REFERENCES public.dl_ride_offer(ride_offer_id);
  END IF;
END
$sync$;

DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'dl_delivery_offer_rider_id_fkey' AND conrelid = to_regclass('public.dl_delivery_offer')) THEN
ALTER TABLE ONLY public.dl_delivery_offer
    ADD CONSTRAINT dl_delivery_offer_rider_id_fkey FOREIGN KEY (rider_id) REFERENCES public.dl_rider(rider_id);
  END IF;
END
$sync$;

DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'dl_delivery_payout_delivery_company_id_fkey' AND conrelid = to_regclass('public.dl_delivery_payout')) THEN
ALTER TABLE ONLY public.dl_delivery_payout
    ADD CONSTRAINT dl_delivery_payout_delivery_company_id_fkey FOREIGN KEY (delivery_company_id) REFERENCES public.dl_company(delivery_company_id);
  END IF;
END
$sync$;

DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'dl_delivery_payout_delivery_id_fkey' AND conrelid = to_regclass('public.dl_delivery_payout')) THEN
ALTER TABLE ONLY public.dl_delivery_payout
    ADD CONSTRAINT dl_delivery_payout_delivery_id_fkey FOREIGN KEY (delivery_id) REFERENCES public.dl_delivery(delivery_id);
  END IF;
END
$sync$;

DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'dl_delivery_payout_ride_id_fkey' AND conrelid = to_regclass('public.dl_delivery_payout')) THEN
ALTER TABLE ONLY public.dl_delivery_payout
    ADD CONSTRAINT dl_delivery_payout_ride_id_fkey FOREIGN KEY (ride_id) REFERENCES public.dl_ride(ride_id);
  END IF;
END
$sync$;

DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'dl_delivery_payout_rider_id_fkey' AND conrelid = to_regclass('public.dl_delivery_payout')) THEN
ALTER TABLE ONLY public.dl_delivery_payout
    ADD CONSTRAINT dl_delivery_payout_rider_id_fkey FOREIGN KEY (rider_id) REFERENCES public.dl_rider(rider_id);
  END IF;
END
$sync$;

DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'dl_media_rider_id_fkey' AND conrelid = to_regclass('public.dl_media')) THEN
ALTER TABLE ONLY public.dl_media
    ADD CONSTRAINT dl_media_rider_id_fkey FOREIGN KEY (rider_id) REFERENCES public.dl_rider(rider_id);
  END IF;
END
$sync$;

DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'dl_ride_delivery_company_id_fkey' AND conrelid = to_regclass('public.dl_ride')) THEN
ALTER TABLE ONLY public.dl_ride
    ADD CONSTRAINT dl_ride_delivery_company_id_fkey FOREIGN KEY (delivery_company_id) REFERENCES public.dl_company(delivery_company_id);
  END IF;
END
$sync$;

DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'dl_ride_rider_id_fkey' AND conrelid = to_regclass('public.dl_ride')) THEN
ALTER TABLE ONLY public.dl_ride
    ADD CONSTRAINT dl_ride_rider_id_fkey FOREIGN KEY (rider_id) REFERENCES public.dl_rider(rider_id);
  END IF;
END
$sync$;

DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'dl_ride_offer_ride_id_fkey' AND conrelid = to_regclass('public.dl_ride_offer')) THEN
ALTER TABLE ONLY public.dl_ride_offer
    ADD CONSTRAINT dl_ride_offer_ride_id_fkey FOREIGN KEY (ride_id) REFERENCES public.dl_ride(ride_id);
  END IF;
END
$sync$;

DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'dl_ride_offer_rider_id_fkey' AND conrelid = to_regclass('public.dl_ride_offer')) THEN
ALTER TABLE ONLY public.dl_ride_offer
    ADD CONSTRAINT dl_ride_offer_rider_id_fkey FOREIGN KEY (rider_id) REFERENCES public.dl_rider(rider_id);
  END IF;
END
$sync$;

DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'dl_ride_payout_delivery_company_id_fkey' AND conrelid = to_regclass('public.dl_ride_payout')) THEN
ALTER TABLE ONLY public.dl_ride_payout
    ADD CONSTRAINT dl_ride_payout_delivery_company_id_fkey FOREIGN KEY (delivery_company_id) REFERENCES public.dl_company(delivery_company_id);
  END IF;
END
$sync$;

DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'dl_ride_payout_ride_id_fkey' AND conrelid = to_regclass('public.dl_ride_payout')) THEN
ALTER TABLE ONLY public.dl_ride_payout
    ADD CONSTRAINT dl_ride_payout_ride_id_fkey FOREIGN KEY (ride_id) REFERENCES public.dl_ride(ride_id);
  END IF;
END
$sync$;

DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'dl_ride_payout_rider_id_fkey' AND conrelid = to_regclass('public.dl_ride_payout')) THEN
ALTER TABLE ONLY public.dl_ride_payout
    ADD CONSTRAINT dl_ride_payout_rider_id_fkey FOREIGN KEY (rider_id) REFERENCES public.dl_rider(rider_id);
  END IF;
END
$sync$;

DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'dl_rider_delivery_company_id_fkey' AND conrelid = to_regclass('public.dl_rider')) THEN
ALTER TABLE ONLY public.dl_rider
    ADD CONSTRAINT dl_rider_delivery_company_id_fkey FOREIGN KEY (delivery_company_id) REFERENCES public.dl_company(delivery_company_id);
  END IF;
END
$sync$;

DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'dl_rider_auth_rider_id_fkey' AND conrelid = to_regclass('public.dl_rider_auth')) THEN
ALTER TABLE ONLY public.dl_rider_auth
    ADD CONSTRAINT dl_rider_auth_rider_id_fkey FOREIGN KEY (rider_id) REFERENCES public.dl_rider(rider_id);
  END IF;
END
$sync$;

DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'dl_rider_cod_wallet_delivery_company_id_fkey' AND conrelid = to_regclass('public.dl_rider_cod_wallet')) THEN
ALTER TABLE ONLY public.dl_rider_cod_wallet
    ADD CONSTRAINT dl_rider_cod_wallet_delivery_company_id_fkey FOREIGN KEY (delivery_company_id) REFERENCES public.dl_company(delivery_company_id);
  END IF;
END
$sync$;

DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'dl_rider_cod_wallet_rider_id_fkey' AND conrelid = to_regclass('public.dl_rider_cod_wallet')) THEN
ALTER TABLE ONLY public.dl_rider_cod_wallet
    ADD CONSTRAINT dl_rider_cod_wallet_rider_id_fkey FOREIGN KEY (rider_id) REFERENCES public.dl_rider(rider_id);
  END IF;
END
$sync$;

DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'dl_rider_document_rider_id_fkey' AND conrelid = to_regclass('public.dl_rider_document')) THEN
ALTER TABLE ONLY public.dl_rider_document
    ADD CONSTRAINT dl_rider_document_rider_id_fkey FOREIGN KEY (rider_id) REFERENCES public.dl_rider(rider_id);
  END IF;
END
$sync$;

DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'dl_rider_presence_rider_id_fkey' AND conrelid = to_regclass('public.dl_rider_presence')) THEN
ALTER TABLE ONLY public.dl_rider_presence
    ADD CONSTRAINT dl_rider_presence_rider_id_fkey FOREIGN KEY (rider_id) REFERENCES public.dl_rider(rider_id);
  END IF;
END
$sync$;

DO $sync$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'dl_rider_vehicle_rider_id_fkey' AND conrelid = to_regclass('public.dl_rider_vehicle')) THEN
ALTER TABLE ONLY public.dl_rider_vehicle
    ADD CONSTRAINT dl_rider_vehicle_rider_id_fkey FOREIGN KEY (rider_id) REFERENCES public.dl_rider(rider_id);
  END IF;
END
$sync$;

DO $sync$
BEGIN
  -- wallet_ledger is obsolete and dropped by 1779900000005; only add the key if a leftover table exists.
  IF to_regclass('public.wallet_ledger') IS NOT NULL
     AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'wallet_ledger_award_id_fkey' AND conrelid = to_regclass('public.wallet_ledger')) THEN
ALTER TABLE ONLY public.wallet_ledger
    ADD CONSTRAINT wallet_ledger_award_id_fkey FOREIGN KEY (award_id) REFERENCES public.loyalty_awards(award_id);
  END IF;
END
$sync$;
`);
};

exports.down = () => {
  // Intentionally empty. See header.
};
