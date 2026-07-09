-- Migration 003: generated_contracts (idempotente) + storage bucket + RLS
-- Reescrita para ser idempotente y arreglar conflictos con migration 001.

CREATE TABLE IF NOT EXISTS generated_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  contract_type TEXT NOT NULL,
  content TEXT NOT NULL,
  field_values JSONB DEFAULT '{}',
  tokens_used INT DEFAULT 0,
  cost_eur_cents INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Si la tabla ya existia con schema viejo, añadir columnas faltantes
ALTER TABLE generated_contracts ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES clients(id) ON DELETE SET NULL;
ALTER TABLE generated_contracts ADD COLUMN IF NOT EXISTS cost_eur_cents INT DEFAULT 0;

-- Forzar timestamptz si vino como TIMESTAMP de migration vieja
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'generated_contracts' AND column_name = 'created_at'
    AND data_type = 'timestamp without time zone'
  ) THEN
    ALTER TABLE generated_contracts
      ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'UTC',
      ALTER COLUMN updated_at TYPE TIMESTAMPTZ USING updated_at AT TIME ZONE 'UTC';
  END IF;
END $$;

ALTER TABLE generated_contracts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own contracts" ON generated_contracts;
DROP POLICY IF EXISTS "contracts_manage_own" ON generated_contracts;
CREATE POLICY "contracts_manage_own" ON generated_contracts
  FOR ALL USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE INDEX IF NOT EXISTS idx_generated_contracts_user ON generated_contracts(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_contracts_case ON generated_contracts(case_id);
CREATE INDEX IF NOT EXISTS idx_generated_contracts_client ON generated_contracts(client_id);

-- Storage bucket alineado a limite real de la API parse (25MB)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'legal-documents',
  'legal-documents',
  false,
  26214400,
  ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword', 'text/plain']
) ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- RLS Storage (idempotentes)
DROP POLICY IF EXISTS "Users upload own documents" ON storage.objects;
CREATE POLICY "Users upload own documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'legal-documents' AND
    (SELECT auth.uid())::text = (string_to_array(name, '/'))[1]
  );

DROP POLICY IF EXISTS "Users read own documents" ON storage.objects;
CREATE POLICY "Users read own documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'legal-documents' AND
    (SELECT auth.uid())::text = (string_to_array(name, '/'))[1]
  );

DROP POLICY IF EXISTS "Users update own documents" ON storage.objects;
CREATE POLICY "Users update own documents" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'legal-documents' AND
    (SELECT auth.uid())::text = (string_to_array(name, '/'))[1]
  );

DROP POLICY IF EXISTS "Users delete own documents" ON storage.objects;
CREATE POLICY "Users delete own documents" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'legal-documents' AND
    (SELECT auth.uid())::text = (string_to_array(name, '/'))[1]
  );
