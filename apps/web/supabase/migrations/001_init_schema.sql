-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'lawyer',
  organization_id UUID,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- User profiles (GDPR)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  full_name VARCHAR(255),
  organization VARCHAR(255),
  phone VARCHAR(20),
  gdpr_consent BOOLEAN DEFAULT false,
  gdpr_consent_date TIMESTAMP,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Cases (expedientes)
CREATE TABLE cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'open',
  client_id UUID,
  case_number VARCHAR(100),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Clients (CRM)
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  nif_cif VARCHAR(20),
  type VARCHAR(50) DEFAULT 'individual',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Documents
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  document_type VARCHAR(50),
  storage_path VARCHAR(500),
  file_hash VARCHAR(64),
  confidential BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  deleted_at TIMESTAMP
);

-- Document analyses (caché Claude)
CREATE TABLE document_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  case_id UUID REFERENCES cases(id),
  analysis_type VARCHAR(50),
  content JSONB NOT NULL,
  tokens_input INT DEFAULT 0,
  tokens_output INT DEFAULT 0,
  tokens_cache INT DEFAULT 0,
  cache_expiration TIMESTAMP,
  claude_request_id VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Document shares (permissions)
CREATE TABLE document_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  shared_with_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  permission VARCHAR(50) DEFAULT 'view',
  created_at TIMESTAMP DEFAULT now()
);

-- Chat conversations
CREATE TABLE chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  case_id UUID REFERENCES cases(id),
  title VARCHAR(255),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Chat messages
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  role VARCHAR(50),
  content TEXT NOT NULL,
  tokens_output INT DEFAULT 0,
  tokens_cache INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT now()
);

-- Audit logs (GDPR)
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  action VARCHAR(100),
  resource_type VARCHAR(50),
  resource_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- Contract templates
CREATE TABLE contract_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  prompt_template TEXT NOT NULL,
  fields JSONB,
  category VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Generated contracts
CREATE TABLE generated_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  case_id UUID REFERENCES cases(id),
  template_id UUID REFERENCES contract_templates(id),
  contract_type VARCHAR(100),
  content TEXT NOT NULL,
  field_values JSONB,
  tokens_used INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Create indices for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_user_profiles_id ON user_profiles(id);
CREATE INDEX idx_cases_user_id ON cases(user_id);
CREATE INDEX idx_cases_client_id ON cases(client_id);
CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_case_id ON documents(case_id);
CREATE INDEX idx_document_analyses_document_id ON document_analyses(document_id);
CREATE INDEX idx_document_analyses_user_id ON document_analyses(user_id);
CREATE INDEX idx_document_shares_document_id ON document_shares(document_id);
CREATE INDEX idx_document_shares_user_id ON document_shares(shared_with_user_id);
CREATE INDEX idx_chat_conversations_user_id ON chat_conversations(user_id);
CREATE INDEX idx_chat_messages_conversation_id ON chat_messages(conversation_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);
CREATE INDEX idx_generated_contracts_user_id ON generated_contracts(user_id);
