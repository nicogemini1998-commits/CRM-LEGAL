-- Deadlines activos por usuario: plazos procesales con alertas cron
-- Idempotent: safe to run multiple times

CREATE TABLE IF NOT EXISTS case_deadlines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id),
  action TEXT NOT NULL,
  law_ref TEXT,
  category TEXT NOT NULL,
  deadline_date TIMESTAMPTZ NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low','medium','high','critical')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','completed','expired','cancelled')),
  notify_15d BOOLEAN DEFAULT TRUE,
  notify_5d BOOLEAN DEFAULT TRUE,
  notify_1d BOOLEAN DEFAULT TRUE,
  notified_15d_at TIMESTAMPTZ,
  notified_5d_at TIMESTAMPTZ,
  notified_1d_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE case_deadlines ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "deadlines_manage_own" ON case_deadlines;
CREATE POLICY "deadlines_manage_own" ON case_deadlines
  FOR ALL USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE INDEX IF NOT EXISTS idx_deadlines_user_status_date ON case_deadlines(user_id, status, deadline_date);
CREATE INDEX IF NOT EXISTS idx_deadlines_notify ON case_deadlines(deadline_date) WHERE status = 'pending';
