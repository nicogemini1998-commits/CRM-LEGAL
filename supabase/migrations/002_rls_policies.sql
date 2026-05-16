-- ================================================================
-- IURALEX — Row Level Security Policies
-- Ejecutar DESPUÉS de 001_init_schema.sql
-- ================================================================

-- ── USERS ────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "users_select_own" ON users;
CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

DROP POLICY IF EXISTS "users_update_own" ON users;
CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- ── CLIENTS ──────────────────────────────────────────────────────
DROP POLICY IF EXISTS "clients_all_own" ON clients;
CREATE POLICY "clients_all_own" ON clients
  FOR ALL USING (auth.uid()::text = user_id::text);

-- ── CASES ────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "cases_all_own" ON cases;
CREATE POLICY "cases_all_own" ON cases
  FOR ALL USING (auth.uid()::text = user_id::text);

-- ── DOCUMENTS ────────────────────────────────────────────────────
DROP POLICY IF EXISTS "documents_all_own" ON documents;
CREATE POLICY "documents_all_own" ON documents
  FOR ALL USING (auth.uid()::text = user_id::text);

-- ── DOCUMENT ANALYSES ────────────────────────────────────────────
DROP POLICY IF EXISTS "analyses_all_own" ON document_analyses;
CREATE POLICY "analyses_all_own" ON document_analyses
  FOR ALL USING (auth.uid()::text = user_id::text);

-- ── CHAT CONVERSATIONS ───────────────────────────────────────────
DROP POLICY IF EXISTS "conversations_all_own" ON chat_conversations;
CREATE POLICY "conversations_all_own" ON chat_conversations
  FOR ALL USING (auth.uid()::text = user_id::text);

-- ── CHAT MESSAGES (via conversation ownership) ───────────────────
DROP POLICY IF EXISTS "messages_all_own" ON chat_messages;
CREATE POLICY "messages_all_own" ON chat_messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM chat_conversations c
      WHERE c.id = conversation_id
      AND auth.uid()::text = c.user_id::text
    )
  );

-- ── GENERATED CONTRACTS ──────────────────────────────────────────
DROP POLICY IF EXISTS "contracts_all_own" ON generated_contracts;
CREATE POLICY "contracts_all_own" ON generated_contracts
  FOR ALL USING (auth.uid()::text = user_id::text);

-- ── CONTRACT TEMPLATES (todos pueden leer, solo admin escribe) ───
DROP POLICY IF EXISTS "templates_select_all" ON contract_templates;
CREATE POLICY "templates_select_all" ON contract_templates
  FOR SELECT USING (is_active = true);

-- ── AUDIT LOGS (solo lectura propia) ─────────────────────────────
DROP POLICY IF EXISTS "audit_select_own" ON audit_logs;
CREATE POLICY "audit_select_own" ON audit_logs
  FOR SELECT USING (auth.uid()::text = user_id::text);

DROP POLICY IF EXISTS "audit_insert_own" ON audit_logs;
CREATE POLICY "audit_insert_own" ON audit_logs
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

SELECT 'Políticas RLS 002 aplicadas correctamente' AS status;
