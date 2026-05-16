-- Tabla de contratos generados por IA
CREATE TABLE IF NOT EXISTS generated_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
  contract_type VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  field_values JSONB DEFAULT '{}',
  tokens_used INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

ALTER TABLE generated_contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own contracts" ON generated_contracts
  FOR ALL USING (auth.uid() = user_id);

-- Bucket de Supabase Storage para documentos legales
-- Ejecutar en dashboard: Storage > Create bucket "legal-documents" (private)
-- Política de Storage (ejecutar en SQL Editor):

-- Permitir a usuarios autenticados subir a su carpeta
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'legal-documents',
  'legal-documents',
  false,
  10485760, -- 10MB
  ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users upload own documents" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'legal-documents' AND
    auth.uid()::text = (string_to_array(name, '/'))[1]
  );

CREATE POLICY "Users read own documents" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'legal-documents' AND
    auth.uid()::text = (string_to_array(name, '/'))[1]
  );

CREATE POLICY "Users delete own documents" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'legal-documents' AND
    auth.uid()::text = (string_to_array(name, '/'))[1]
  );
