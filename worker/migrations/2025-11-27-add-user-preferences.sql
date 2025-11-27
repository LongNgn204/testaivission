-- Migration: Add user preferences and notification settings
-- Created: 2025-11-27

-- Add preferences column to users table
-- This will store JSON data for user preferences
ALTER TABLE users ADD COLUMN preferences TEXT;

-- Add notification settings
ALTER TABLE users ADD COLUMN notification_enabled INTEGER DEFAULT 1;
ALTER TABLE users ADD COLUMN email_verified INTEGER DEFAULT 0;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_users_notification ON users(notification_enabled);

-- Add language preference to user_settings if not exists
-- Note: This is an example migration
-- In production, check if column exists before adding

-- Rollback instructions (for documentation):
-- To rollback this migration:
-- DROP INDEX IF EXISTS idx_users_notification;
-- ALTER TABLE users DROP COLUMN preferences;
-- ALTER TABLE users DROP COLUMN notification_enabled;
-- ALTER TABLE users DROP COLUMN email_verified;
