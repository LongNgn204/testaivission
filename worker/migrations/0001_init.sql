/**
 * ========================================
 * VISION COACH DATABASE SCHEMA
 * ========================================
 * D1 SQLite Database initialization
 * Version: 1.0.0
 */

-- ============================================================
-- USERS TABLE
-- ============================================================
-- Lưu thông tin người dùng
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  age INTEGER NOT NULL CHECK (age >= 5 AND age <= 120),
  email TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME,
  is_active BOOLEAN DEFAULT 1
);

-- Index cho phone (unique lookup)
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_phone ON users(phone);

-- ============================================================
-- TEST RESULTS TABLE
-- ============================================================
-- Lưu kết quả các bài test
CREATE TABLE IF NOT EXISTS test_results (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  test_type TEXT NOT NULL CHECK (test_type IN ('snellen', 'colorblind', 'astigmatism', 'amsler', 'duochrome')),
  test_data JSON NOT NULL,
  score TEXT,
  accuracy REAL,
  severity TEXT CHECK (severity IN ('NONE', 'LOW', 'MEDIUM', 'HIGH')),
  duration_seconds INTEGER,
  device_info TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes cho test results
CREATE INDEX IF NOT EXISTS idx_test_results_user_id ON test_results(user_id);
CREATE INDEX IF NOT EXISTS idx_test_results_test_type ON test_results(test_type);
CREATE INDEX IF NOT EXISTS idx_test_results_created_at ON test_results(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_test_results_user_date ON test_results(user_id, created_at DESC);

-- ============================================================
-- AI REPORTS TABLE
-- ============================================================
-- Lưu báo cáo AI cho mỗi test
CREATE TABLE IF NOT EXISTS ai_reports (
  id TEXT PRIMARY KEY,
  test_result_id TEXT NOT NULL UNIQUE,
  user_id TEXT NOT NULL,
  test_type TEXT NOT NULL,
  summary TEXT NOT NULL,
  recommendations JSON NOT NULL,
  confidence REAL CHECK (confidence >= 0 AND confidence <= 100),
  severity TEXT CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH')),
  model_name TEXT DEFAULT 'llama-3.1-8b',
  model_version TEXT DEFAULT '1.0',
  tokens_input INTEGER,
  tokens_output INTEGER,
  cost_usd REAL,
  response_time_ms INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (test_result_id) REFERENCES test_results(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes cho AI reports
CREATE INDEX IF NOT EXISTS idx_ai_reports_user_id ON ai_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_reports_test_result_id ON ai_reports(test_result_id);
CREATE INDEX IF NOT EXISTS idx_ai_reports_created_at ON ai_reports(created_at DESC);

-- ============================================================
-- CHAT HISTORY TABLE
-- ============================================================
-- Lưu lịch sử chat với Dr. Eva
CREATE TABLE IF NOT EXISTS chat_history (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  message_text TEXT NOT NULL,
  response_text TEXT NOT NULL,
  tokens_input INTEGER,
  tokens_output INTEGER,
  cost_usd REAL,
  response_time_ms INTEGER,
  model_name TEXT DEFAULT 'llama-3.1-8b',
  language TEXT DEFAULT 'vi' CHECK (language IN ('vi', 'en')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes cho chat history
CREATE INDEX IF NOT EXISTS idx_chat_history_user_id ON chat_history(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_history_created_at ON chat_history(created_at DESC);

-- ============================================================
-- USER ROUTINES TABLE
-- ============================================================
-- Lưu lịch trình hàng tuần cá nhân hóa
CREATE TABLE IF NOT EXISTS user_routines (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  routine_data JSON NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index cho user routines
CREATE INDEX IF NOT EXISTS idx_user_routines_user_id ON user_routines(user_id);

-- ============================================================
-- USER PREFERENCES TABLE
-- ============================================================
-- Lưu cài đặt người dùng
CREATE TABLE IF NOT EXISTS user_preferences (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  language TEXT DEFAULT 'vi' CHECK (language IN ('vi', 'en')),
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
  notifications_enabled BOOLEAN DEFAULT 1,
  reminder_time TEXT DEFAULT '09:00',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index cho user preferences
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- ============================================================
-- AUDIT LOG TABLE
-- ============================================================
-- Lưu audit trail cho compliance
CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  details JSON,
  ip_address TEXT,
  user_agent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes cho audit logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ============================================================
-- COST TRACKING TABLE
-- ========================================================== 
-- Theo dõi chi phí API/LLM
CREATE TABLE IF NOT EXISTS cost_tracking (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  service TEXT NOT NULL CHECK (service IN ('llm', 'embedding', 'tts', 'stt')),
  endpoint TEXT,
  tokens_input INTEGER,
  tokens_output INTEGER,
  cost_usd REAL NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes cho cost tracking
CREATE INDEX IF NOT EXISTS idx_cost_tracking_user_id ON cost_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_cost_tracking_service ON cost_tracking(service);
CREATE INDEX IF NOT EXISTS idx_cost_tracking_created_at ON cost_tracking(created_at DESC);

-- ============================================================
-- VIEWS (for common queries)
-- ============================================================

-- View: User test statistics
CREATE VIEW IF NOT EXISTS user_test_stats AS
SELECT
  u.id,
  u.name,
  COUNT(DISTINCT tr.id) as total_tests,
  COUNT(DISTINCT CASE WHEN tr.test_type = 'snellen' THEN tr.id END) as snellen_tests,
  COUNT(DISTINCT CASE WHEN tr.test_type = 'colorblind' THEN tr.id END) as colorblind_tests,
  COUNT(DISTINCT CASE WHEN tr.test_type = 'astigmatism' THEN tr.id END) as astigmatism_tests,
  COUNT(DISTINCT CASE WHEN tr.test_type = 'amsler' THEN tr.id END) as amsler_tests,
  COUNT(DISTINCT CASE WHEN tr.test_type = 'duochrome' THEN tr.id END) as duochrome_tests,
  MAX(tr.created_at) as last_test_date
FROM users u
LEFT JOIN test_results tr ON u.id = tr.user_id
GROUP BY u.id;

-- View: Cost summary
CREATE VIEW IF NOT EXISTS cost_summary AS
SELECT
  DATE(created_at) as date,
  service,
  COUNT(*) as request_count,
  SUM(tokens_input) as total_tokens_input,
  SUM(tokens_output) as total_tokens_output,
  SUM(cost_usd) as total_cost_usd
FROM cost_tracking
GROUP BY DATE(created_at), service;

