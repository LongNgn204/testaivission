#!/usr/bin/env node
/**
 * ============================================================
 * 🗄️ Database Migration Helper
 * ============================================================
 * 
 * Script to help with D1 database migrations
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const DB_NAME = 'vision-coach-db';
const DB_PREVIEW_NAME = 'vision-coach-db-preview';
const MIGRATIONS_DIR = path.join(__dirname, '..', 'migrations');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function exec(command, silent = false) {
  try {
    const output = execSync(command, { 
      encoding: 'utf-8',
      stdio: silent ? 'pipe' : 'inherit'
    });
    return output;
  } catch (error) {
    log(`❌ Command failed: ${command}`, colors.red);
    throw error;
  }
}

// Create migrations directory if it doesn't exist
if (!fs.existsSync(MIGRATIONS_DIR)) {
  fs.mkdirSync(MIGRATIONS_DIR, { recursive: true });
  log('✅ Created migrations directory', colors.green);
}

// Main commands
const commands = {
  // Create a new migration file
  create: (name) => {
    if (!name) {
      log('❌ Please provide a migration name', colors.red);
      log('Usage: node migrate.js create <migration-name>', colors.yellow);
      process.exit(1);
    }

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${timestamp}-${name.replace(/\s+/g, '-').toLowerCase()}.sql`;
    const filepath = path.join(MIGRATIONS_DIR, filename);

    const template = `-- Migration: ${name}
-- Created: ${new Date().toISOString()}

-- Write your SQL migration here
-- Example:
-- ALTER TABLE users ADD COLUMN new_field TEXT;
-- CREATE INDEX idx_users_new_field ON users(new_field);

-- Rollback instructions (for documentation):
-- DROP INDEX IF EXISTS idx_users_new_field;
-- ALTER TABLE users DROP COLUMN new_field;
`;

    fs.writeFileSync(filepath, template);
    log(`✅ Created migration: ${filename}`, colors.green);
    log(`📝 Edit: ${filepath}`, colors.blue);
  },

  // List all migrations
  list: () => {
    const files = fs.readdirSync(MIGRATIONS_DIR)
      .filter(f => f.endsWith('.sql'))
      .sort();

    if (files.length === 0) {
      log('📋 No migrations found', colors.yellow);
      return;
    }

    log('\n📋 Available migrations:', colors.blue);
    files.forEach((file, index) => {
      log(`  ${index + 1}. ${file}`);
    });
    log('');
  },

  // Apply schema to production
  schema: () => {
    const schemaPath = path.join(__dirname, '..', 'schema.sql');
    
    if (!fs.existsSync(schemaPath)) {
      log('❌ schema.sql not found', colors.red);
      process.exit(1);
    }

    log('🚀 Applying schema to production database...', colors.blue);
    exec(`npx wrangler d1 execute ${DB_NAME} --file="${schemaPath}"`);
    log('✅ Schema applied successfully', colors.green);
  },

  // Apply schema to preview/dev
  'schema:preview': () => {
    const schemaPath = path.join(__dirname, '..', 'schema.sql');
    
    if (!fs.existsSync(schemaPath)) {
      log('❌ schema.sql not found', colors.red);
      process.exit(1);
    }

    log('🚀 Applying schema to preview database...', colors.blue);
    exec(`npx wrangler d1 execute ${DB_PREVIEW_NAME} --file="${schemaPath}"`);
    log('✅ Schema applied to preview database', colors.green);
  },

  // Apply specific migration
  up: (filename) => {
    if (!filename) {
      log('❌ Please provide a migration filename', colors.red);
      log('Usage: node migrate.js up <migration-file.sql>', colors.yellow);
      process.exit(1);
    }

    const filepath = path.join(MIGRATIONS_DIR, filename);
    if (!fs.existsSync(filepath)) {
      log(`❌ Migration not found: ${filename}`, colors.red);
      process.exit(1);
    }

    log(`🚀 Applying migration: ${filename}`, colors.blue);
    exec(`npx wrangler d1 execute ${DB_NAME} --file="${filepath}"`);
    log('✅ Migration applied successfully', colors.green);
  },

  // Apply migration to preview
  'up:preview': (filename) => {
    if (!filename) {
      log('❌ Please provide a migration filename', colors.red);
      log('Usage: node migrate.js up:preview <migration-file.sql>', colors.yellow);
      process.exit(1);
    }

    const filepath = path.join(MIGRATIONS_DIR, filename);
    if (!fs.existsSync(filepath)) {
      log(`❌ Migration not found: ${filename}`, colors.red);
      process.exit(1);
    }

    log(`🚀 Applying migration to preview: ${filename}`, colors.blue);
    exec(`npx wrangler d1 execute ${DB_PREVIEW_NAME} --file="${filepath}"`);
    log('✅ Migration applied to preview', colors.green);
  },

  // Query production database
  query: (sql) => {
    if (!sql) {
      log('❌ Please provide SQL query', colors.red);
      log('Usage: node migrate.js query "SELECT * FROM users LIMIT 10"', colors.yellow);
      process.exit(1);
    }

    log('🔍 Executing query...', colors.blue);
    exec(`npx wrangler d1 execute ${DB_NAME} --command="${sql}"`);
  },

  // Query local/preview database
  'query:local': (sql) => {
    if (!sql) {
      log('❌ Please provide SQL query', colors.red);
      log('Usage: node migrate.js query:local "SELECT * FROM users LIMIT 10"', colors.yellow);
      process.exit(1);
    }

    log('🔍 Executing local query...', colors.blue);
    exec(`npx wrangler d1 execute ${DB_NAME} --local --command="${sql}"`);
  },

  // Show database info
  info: () => {
    log('📊 Database Information:', colors.blue);
    log('\nProduction Database:', colors.green);
    exec(`npx wrangler d1 info ${DB_NAME}`);
    
    log('\nPreview Database:', colors.green);
    exec(`npx wrangler d1 info ${DB_PREVIEW_NAME}`);
  },

  // Backup database (export)
  backup: () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup-${timestamp}.sql`;
    const backupDir = path.join(__dirname, '..', 'backups');
    
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    log('💾 Creating backup...', colors.blue);
    log('⚠️  Note: D1 backup must be done via Cloudflare Dashboard', colors.yellow);
    log('   or by querying all tables and saving results.', colors.yellow);
    
    // Export schema
    const output = exec(`npx wrangler d1 execute ${DB_NAME} --command="SELECT sql FROM sqlite_master WHERE type='table';"`, true);
    const backupPath = path.join(backupDir, filename);
    fs.writeFileSync(backupPath, output);
    
    log(`✅ Schema exported to: ${backupPath}`, colors.green);
  },

  // Show help
  help: () => {
    log('\n🗄️  D1 Database Migration Helper\n', colors.blue);
    log('Commands:', colors.green);
    log('  create <name>           Create a new migration file');
    log('  list                    List all migrations');
    log('  schema                  Apply schema.sql to production');
    log('  schema:preview          Apply schema.sql to preview');
    log('  up <file>               Apply migration to production');
    log('  up:preview <file>       Apply migration to preview');
    log('  query "<sql>"           Execute SQL query on production');
    log('  query:local "<sql>"     Execute SQL query on local/preview');
    log('  info                    Show database information');
    log('  backup                  Export database schema');
    log('  help                    Show this help message');
    log('\nExamples:', colors.yellow);
    log('  node migrate.js create add-user-preferences');
    log('  node migrate.js schema');
    log('  node migrate.js up 2025-11-27-add-user-preferences.sql');
    log('  node migrate.js query "SELECT COUNT(*) FROM users"');
    log('');
  },
};

// Parse command line arguments
const [,, command, ...args] = process.argv;

if (!command || !commands[command]) {
  commands.help();
  if (command) {
    log(`\n❌ Unknown command: ${command}`, colors.red);
  }
  process.exit(command ? 1 : 0);
}

// Execute command
try {
  commands[command](...args);
} catch (error) {
  log(`\n❌ Error: ${error.message}`, colors.red);
  process.exit(1);
}
