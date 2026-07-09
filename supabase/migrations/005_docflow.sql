-- DocFlow MVP: fee_schedules, budgets, engagements, invoices, invoice_sequences
-- Idempotent: safe to run multiple times

-- ── FEE SCHEDULES ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fee_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  case_area TEXT NOT NULL,
  case_type TEXT NOT NULL,
  label TEXT NOT NULL,
  base_amount_cents INT NOT NULL DEFAULT 0,
  hourly_rate_cents INT DEFAULT 0,
  success_fee_pct NUMERIC(5,2) DEFAULT 0,
  iva_pct NUMERIC(4,2) DEFAULT 21.00,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE fee_schedules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "fees_manage_own" ON fee_schedules;
CREATE POLICY "fees_manage_own" ON fee_schedules
  FOR ALL USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE INDEX IF NOT EXISTS idx_fees_user_active ON fee_schedules(user_id) WHERE active = TRUE;

-- ── BUDGETS ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  budget_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','sent','accepted','rejected','expired')),
  total_cents INT NOT NULL,
  iva_cents INT NOT NULL,
  grand_total_cents INT NOT NULL,
  line_items JSONB NOT NULL DEFAULT '[]',
  pdf_storage_path TEXT,
  sent_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "budgets_manage_own" ON budgets;
CREATE POLICY "budgets_manage_own" ON budgets
  FOR ALL USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user_case ON budgets(user_id, case_id);
CREATE INDEX IF NOT EXISTS idx_budgets_status ON budgets(status);

-- ── ENGAGEMENTS (Hojas de encargo) ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS engagements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  budget_id UUID REFERENCES budgets(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending_sign' CHECK (status IN ('pending_sign','sent','signed','cancelled')),
  content_markdown TEXT NOT NULL,
  pdf_storage_path TEXT,
  signaturit_request_id TEXT,
  sign_url TEXT,
  signed_at TIMESTAMPTZ,
  signed_ip TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE engagements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "engagements_manage_own" ON engagements;
CREATE POLICY "engagements_manage_own" ON engagements
  FOR ALL USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE INDEX IF NOT EXISTS idx_engagements_user_case ON engagements(user_id, case_id);

-- ── INVOICES ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  invoice_number TEXT NOT NULL,
  series TEXT NOT NULL DEFAULT 'F',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','issued','paid','cancelled','overdue')),
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  paid_date DATE,
  base_cents INT NOT NULL,
  iva_cents INT NOT NULL,
  irpf_cents INT DEFAULT 0,
  total_cents INT NOT NULL,
  line_items JSONB NOT NULL DEFAULT '[]',
  notes TEXT,
  pdf_storage_path TEXT,
  facturae_xml_path TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, invoice_number)
);
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "invoices_manage_own" ON invoices;
CREATE POLICY "invoices_manage_own" ON invoices
  FOR ALL USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user_case ON invoices(user_id, case_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(user_id, status);
CREATE INDEX IF NOT EXISTS idx_invoices_client ON invoices(client_id);

-- ── INVOICE SEQUENCES ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS invoice_sequences (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  series TEXT NOT NULL,
  year INT NOT NULL,
  next_number INT NOT NULL DEFAULT 1,
  PRIMARY KEY (user_id, series, year)
);
ALTER TABLE invoice_sequences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "seq_manage_own" ON invoice_sequences;
CREATE POLICY "seq_manage_own" ON invoice_sequences
  FOR ALL USING ((SELECT auth.uid()) = user_id);

-- ── ATOMIC INVOICE NUMBER FUNCTION ────────────────────────────────────────────
CREATE OR REPLACE FUNCTION next_invoice_number(p_user_id UUID, p_series TEXT, p_year INT)
RETURNS INT AS $$
DECLARE n INT;
BEGIN
  INSERT INTO invoice_sequences (user_id, series, year, next_number)
  VALUES (p_user_id, p_series, p_year, 2)
  ON CONFLICT (user_id, series, year) DO UPDATE
    SET next_number = invoice_sequences.next_number + 1
  RETURNING next_number - 1 INTO n;
  IF n IS NULL THEN
    SELECT next_number - 1 INTO n FROM invoice_sequences
    WHERE user_id = p_user_id AND series = p_series AND year = p_year;
  END IF;
  RETURN n;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
