-- Migration 004: Security hardening
-- C10 audit_logs inmutable + RLS pattern fix + indexes + constraints + admin policies

-- 1. AUDIT LOGS INMUTABLE
DROP POLICY IF EXISTS "audit_no_update" ON audit_logs;
CREATE POLICY "audit_no_update" ON audit_logs
  FOR UPDATE USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "audit_no_delete" ON audit_logs;
CREATE POLICY "audit_no_delete" ON audit_logs
  FOR DELETE USING (false);

-- Admin puede leer audit logs (RGPD Art. 30)
DROP POLICY IF EXISTS "audit_admin_select" ON audit_logs;
CREATE POLICY "audit_admin_select" ON audit_logs
  FOR SELECT USING (
    (SELECT auth.uid()) = user_id
    OR EXISTS (
      SELECT 1 FROM users WHERE id = (SELECT auth.uid()) AND role = 'admin'
    )
  );

-- 2. CONTRACT TEMPLATES
DROP POLICY IF EXISTS "templates_select_all" ON contract_templates;
CREATE POLICY "templates_select_authenticated" ON contract_templates
  FOR SELECT USING (
    (SELECT auth.uid()) IS NOT NULL AND is_active = true
  );

DROP POLICY IF EXISTS "templates_admin_write" ON contract_templates;
CREATE POLICY "templates_admin_write" ON contract_templates
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = (SELECT auth.uid()) AND role = 'admin')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = (SELECT auth.uid()) AND role = 'admin')
  );

-- 3. INDEXES FALTANTES
CREATE INDEX IF NOT EXISTS idx_clients_user_active   ON clients(user_id)   WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_cases_user_active     ON cases(user_id)     WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_documents_user_active ON documents(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_documents_client      ON documents(client_id);
CREATE INDEX IF NOT EXISTS idx_documents_case        ON documents(case_id);
CREATE INDEX IF NOT EXISTS idx_audit_resource        ON audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_user_created    ON audit_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_cases_user_status     ON cases(user_id, status) WHERE deleted_at IS NULL;

-- 4. CHECK CONSTRAINTS
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'cases_status_check') THEN
    ALTER TABLE cases ADD CONSTRAINT cases_status_check
      CHECK (status IN ('open', 'closed', 'archived', 'pending'));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'clients_type_check') THEN
    ALTER TABLE clients ADD CONSTRAINT clients_type_check
      CHECK (type IN ('individual', 'company'));
  END IF;
END $$;

-- 5. UNIQUE NIF/CIF por usuario
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'clients_nif_user_unique') THEN
    ALTER TABLE clients ADD CONSTRAINT clients_nif_user_unique
      UNIQUE (user_id, nif_cif);
  END IF;
END $$;

-- 6. NIF/CIF format check
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'clients_nif_format') THEN
    ALTER TABLE clients ADD CONSTRAINT clients_nif_format
      CHECK (nif_cif IS NULL OR nif_cif ~ '^[A-Z0-9]{8,9}$');
  END IF;
END $$;
