-- ============================================================
-- 🗄️ D1 Database Schema - Vision Coach
-- ============================================================
-- Created: 2025-11-27
-- Database: Cloudflare D1
-- ============================================================

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  email TEXT,
  avatar_url TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  last_login INTEGER,
  profile_data TEXT -- JSON string for additional profile data
);

CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  device_info TEXT, -- JSON string
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);

-- Test results table
CREATE TABLE IF NOT EXISTS test_results (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  test_type TEXT NOT NULL,
  test_data TEXT NOT NULL, -- JSON string
  score REAL,
  result TEXT,
  notes TEXT,
  created_at INTEGER NOT NULL,
  duration INTEGER, -- test duration in seconds
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_test_results_user_id ON test_results(user_id);
CREATE INDEX idx_test_results_test_type ON test_results(test_type);
CREATE INDEX idx_test_results_created_at ON test_results(created_at);
CREATE INDEX idx_test_results_user_test_type ON test_results(user_id, test_type);

-- AI Reports table (cached reports)
CREATE TABLE IF NOT EXISTS ai_reports (
  id TEXT PRIMARY KEY,
  test_result_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  report_type TEXT NOT NULL, -- 'test_report', 'dashboard', 'routine', etc.
  report_data TEXT NOT NULL, -- JSON string
  language TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (test_result_id) REFERENCES test_results(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_ai_reports_test_result_id ON ai_reports(test_result_id);
CREATE INDEX idx_ai_reports_user_id ON ai_reports(user_id);
CREATE INDEX idx_ai_reports_created_at ON ai_reports(created_at);

-- Routines table
CREATE TABLE IF NOT EXISTS routines (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  routine_data TEXT NOT NULL, -- JSON string
  language TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  is_active INTEGER DEFAULT 1,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_routines_user_id ON routines(user_id);
CREATE INDEX idx_routines_is_active ON routines(is_active);

-- Reminders table
CREATE TABLE IF NOT EXISTS reminders (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  routine_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  schedule_time TEXT NOT NULL, -- Format: "HH:MM"
  days TEXT NOT NULL, -- JSON array of days: ["mon", "tue", "wed"]
  is_enabled INTEGER DEFAULT 1,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (routine_id) REFERENCES routines(id) ON DELETE SET NULL
);

CREATE INDEX idx_reminders_user_id ON reminders(user_id);
CREATE INDEX idx_reminders_is_enabled ON reminders(is_enabled);

-- Chat history table
CREATE TABLE IF NOT EXISTS chat_history (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  context_data TEXT, -- JSON string with test results, etc.
  language TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_chat_history_user_id ON chat_history(user_id);
CREATE INDEX idx_chat_history_created_at ON chat_history(created_at);

-- Analytics table (optional)
CREATE TABLE IF NOT EXISTS analytics (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  event_type TEXT NOT NULL, -- 'test_completed', 'login', 'chat', etc.
  event_data TEXT, -- JSON string
  created_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_analytics_event_type ON analytics(event_type);
CREATE INDEX idx_analytics_created_at ON analytics(created_at);
CREATE INDEX idx_analytics_user_id ON analytics(user_id);

-- Settings table (user preferences)
CREATE TABLE IF NOT EXISTS user_settings (
  user_id TEXT PRIMARY KEY,
  language TEXT DEFAULT 'vi',
  theme TEXT DEFAULT 'light',
  notifications_enabled INTEGER DEFAULT 1,
  voice_enabled INTEGER DEFAULT 1,
  settings_data TEXT, -- JSON string for additional settings
  updated_at INTEGER NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================
-- Initial data (optional)
-- ============================================================

-- Add sample admin user (optional, for testing)
-- INSERT INTO users (id, name, age, phone, created_at, updated_at) 
-- VALUES ('user_admin', 'Admin User', 30, '0123456789', strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000);
