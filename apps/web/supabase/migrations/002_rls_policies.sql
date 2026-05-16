-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_contracts ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users see own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- User profiles policies
CREATE POLICY "Users see own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Cases policies
CREATE POLICY "Users see own cases" ON cases
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users create cases" ON cases
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own cases" ON cases
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users delete own cases" ON cases
  FOR DELETE USING (auth.uid() = user_id);

-- Clients policies
CREATE POLICY "Users see own clients" ON clients
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users create clients" ON clients
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own clients" ON clients
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users delete own clients" ON clients
  FOR DELETE USING (auth.uid() = user_id);

-- Documents policies
CREATE POLICY "Users see own documents" ON documents
  FOR SELECT USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM document_shares
      WHERE document_shares.document_id = documents.id
      AND document_shares.shared_with_user_id = auth.uid()
    )
  );

CREATE POLICY "Users create documents" ON documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own documents" ON documents
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users delete own documents" ON documents
  FOR DELETE USING (auth.uid() = user_id);

-- Document analyses policies
CREATE POLICY "Users see analyses of accessible documents" ON document_analyses
  FOR SELECT USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = document_analyses.document_id
      AND documents.user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM document_shares
      WHERE document_shares.document_id = document_analyses.document_id
      AND document_shares.shared_with_user_id = auth.uid()
    )
  );

CREATE POLICY "Users create analyses" ON document_analyses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Document shares policies
CREATE POLICY "Only owner shares documents" ON document_shares
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = document_id
      AND documents.user_id = auth.uid()
    )
  );

CREATE POLICY "Share recipients see shares" ON document_shares
  FOR SELECT USING (
    shared_with_user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = document_id
      AND documents.user_id = auth.uid()
    )
  );

-- Chat conversations policies
CREATE POLICY "Users see own conversations" ON chat_conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users create conversations" ON chat_conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Chat messages policies
CREATE POLICY "Users see messages of own conversations" ON chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_conversations
      WHERE chat_conversations.id = conversation_id
      AND chat_conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users create messages" ON chat_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_conversations
      WHERE chat_conversations.id = conversation_id
      AND chat_conversations.user_id = auth.uid()
    )
  );

-- Audit logs policies
CREATE POLICY "Users see own audit logs" ON audit_logs
  FOR SELECT USING (
    auth.uid() = user_id
    OR (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
  );

-- Generated contracts policies
CREATE POLICY "Users see own contracts" ON generated_contracts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users create contracts" ON generated_contracts
  FOR INSERT WITH CHECK (auth.uid() = user_id);
