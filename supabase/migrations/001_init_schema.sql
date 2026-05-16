-- ================================================================
-- IURALEX — Schema inicial
-- Ejecutar en: Supabase SQL Editor → Run
-- ================================================================

-- Extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── USERS ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           VARCHAR(255) UNIQUE NOT NULL,
  password_hash   VARCHAR(255) NOT NULL,
  role            VARCHAR(50) DEFAULT 'lawyer',
  full_name       VARCHAR(255),
  organization    VARCHAR(255),
  phone           VARCHAR(20),
  gdpr_consent    BOOLEAN DEFAULT false,
  gdpr_consent_date TIMESTAMP WITH TIME ZONE,
  last_login      TIMESTAMP WITH TIME ZONE,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ── CLIENTS ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clients (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        VARCHAR(255) NOT NULL,
  email       VARCHAR(255),
  phone       VARCHAR(20),
  address     TEXT,
  city        VARCHAR(100),
  nif_cif     VARCHAR(20),
  type        VARCHAR(50) DEFAULT 'individual',  -- individual | company
  notes       TEXT,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at  TIMESTAMP WITH TIME ZONE DEFAULT now(),
  deleted_at  TIMESTAMP WITH TIME ZONE
);

-- ── CASES ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cases (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  client_id    UUID REFERENCES clients(id) ON DELETE SET NULL,
  title        VARCHAR(255) NOT NULL,
  description  TEXT,
  status       VARCHAR(50) DEFAULT 'open',  -- open | closed | archived
  case_number  VARCHAR(100),
  area         VARCHAR(100),  -- penal | civil | laboral | mercantil | familia | administrativo | inmobiliario
  amount       NUMERIC(15,2),  -- importe en liza
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at   TIMESTAMP WITH TIME ZONE DEFAULT now(),
  deleted_at   TIMESTAMP WITH TIME ZONE
);

-- ── DOCUMENTS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS documents (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  case_id        UUID REFERENCES cases(id) ON DELETE SET NULL,
  client_id      UUID REFERENCES clients(id) ON DELETE SET NULL,
  title          VARCHAR(255) NOT NULL,
  content        TEXT,
  document_type  VARCHAR(50),  -- contract | brief | motion | analysis | other
  storage_path   VARCHAR(500),
  file_size      INTEGER,
  file_hash      VARCHAR(64),
  mime_type      VARCHAR(100),
  confidential   BOOLEAN DEFAULT false,
  created_at     TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at     TIMESTAMP WITH TIME ZONE DEFAULT now(),
  deleted_at     TIMESTAMP WITH TIME ZONE
);

-- ── DOCUMENT ANALYSES ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS document_analyses (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id       UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  case_id           UUID REFERENCES cases(id),
  skill_id          VARCHAR(100),
  analysis_type     VARCHAR(50) DEFAULT 'FULL',
  content           JSONB NOT NULL DEFAULT '{}',
  tokens_input      INTEGER DEFAULT 0,
  tokens_output     INTEGER DEFAULT 0,
  tokens_cache      INTEGER DEFAULT 0,
  cost_eur_cents    INTEGER DEFAULT 0,
  claude_request_id VARCHAR(255) UNIQUE,
  created_at        TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ── CHAT CONVERSATIONS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_conversations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  case_id     UUID REFERENCES cases(id),
  title       VARCHAR(255),
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at  TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ── CHAT MESSAGES ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_messages (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id   UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  role              VARCHAR(50) NOT NULL,  -- user | assistant
  content           TEXT NOT NULL,
  tokens_output     INTEGER DEFAULT 0,
  tokens_cache      INTEGER DEFAULT 0,
  created_at        TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ── GENERATED CONTRACTS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS generated_contracts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  case_id         UUID REFERENCES cases(id),
  client_id       UUID REFERENCES clients(id),
  contract_type   VARCHAR(100) NOT NULL,
  content         TEXT NOT NULL,
  field_values    JSONB DEFAULT '{}',
  tokens_used     INTEGER DEFAULT 0,
  cost_eur_cents  INTEGER DEFAULT 0,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ── CONTRACT TEMPLATES ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contract_templates (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             VARCHAR(255) NOT NULL UNIQUE,
  description      TEXT,
  prompt_template  TEXT NOT NULL,
  fields           JSONB DEFAULT '[]',
  category         VARCHAR(100),
  complexity       VARCHAR(50) DEFAULT 'Básico',
  is_active        BOOLEAN DEFAULT true,
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at       TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ── AUDIT LOGS (RGPD) ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES users(id),
  action         VARCHAR(100) NOT NULL,
  resource_type  VARCHAR(50),
  resource_id    UUID,
  old_values     JSONB,
  new_values     JSONB,
  ip_address     VARCHAR(45),
  user_agent     TEXT,
  created_at     TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ── ÍNDICES ──────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_cases_user_id       ON cases(user_id);
CREATE INDEX IF NOT EXISTS idx_cases_client_id     ON cases(client_id);
CREATE INDEX IF NOT EXISTS idx_cases_status        ON cases(status);
CREATE INDEX IF NOT EXISTS idx_clients_user_id     ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_user_id   ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_case_id   ON documents(case_id);
CREATE INDEX IF NOT EXISTS idx_chat_conv_user_id   ON chat_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_msgs_conv_id   ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_contracts_user_id   ON generated_contracts(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_user_id       ON audit_logs(user_id);

-- ── ENABLE RLS ───────────────────────────────────────────────────
ALTER TABLE users                ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients              ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases                ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents            ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_analyses    ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_conversations   ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages        ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_contracts  ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_templates   ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs           ENABLE ROW LEVEL SECURITY;

SELECT 'Schema 001 creado correctamente' AS status;
