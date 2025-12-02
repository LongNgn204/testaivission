#!/usr/bin/env node
/**
 * ============================================================
 * 🚀 Quick Setup Script for Cloudflare Workers + D1
 * ============================================================
 */

const { execSync } = require('child_process');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function exec(command, silent = false) {
  try {
    return execSync(command, { 
      encoding: 'utf-8',
      stdio: silent ? 'pipe' : 'inherit'
    });
  } catch (error) {
    if (!silent) {
      log(`❌ Command failed: ${command}`, colors.red);
    }
    throw error;
  }
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(`${colors.cyan}${prompt}${colors.reset}`, resolve);
  });
}

async function setup() {
  log('\n🚀 Vision Coach - Cloudflare Workers Setup\n', colors.blue);
  log('This script will help you set up your Cloudflare Workers backend.\n', colors.yellow);

  // Step 1: Check if logged in
  log('📝 Step 1: Checking Cloudflare authentication...', colors.blue);
  try {
    exec('npx wrangler whoami', true);
    log('✅ Already logged in to Cloudflare', colors.green);
  } catch {
    log('⚠️  Not logged in to Cloudflare', colors.yellow);
    const shouldLogin = await question('Would you like to login now? (y/n): ');
    
    if (shouldLogin.toLowerCase() === 'y') {
      log('Opening browser for authentication...', colors.cyan);
      exec('npx wrangler login');
      log('✅ Login successful!', colors.green);
    } else {
      log('❌ Cannot continue without authentication', colors.red);
      process.exit(1);
    }
  }

  // Step 2: Create D1 Database
  log('\n📝 Step 2: Setting up D1 Database...', colors.blue);
  const createDb = await question('Create new D1 database? (y/n): ');
  
  let dbId, previewDbId;
  
  if (createDb.toLowerCase() === 'y') {
    log('Creating production database...', colors.cyan);
    const prodOutput = exec('npx wrangler d1 create vision-coach-db', true);
    const prodMatch = prodOutput.match(/database_id = "([^"]+)"/);
    dbId = prodMatch ? prodMatch[1] : null;
    
    log('Creating preview database...', colors.cyan);
    const previewOutput = exec('npx wrangler d1 create vision-coach-db-preview', true);
    const previewMatch = previewOutput.match(/database_id = "([^"]+)"/);
    previewDbId = previewMatch ? previewMatch[1] : null;
    
    if (dbId && previewDbId) {
      log('✅ Databases created successfully!', colors.green);
      log(`   Production ID: ${dbId}`, colors.cyan);
      log(`   Preview ID: ${previewDbId}`, colors.cyan);
      
      // Update wrangler.toml
      const wranglerPath = path.join(__dirname, '..', 'wrangler.toml');
      let wranglerContent = fs.readFileSync(wranglerPath, 'utf-8');
      wranglerContent = wranglerContent
        .replace(/database_id = "your-d1-database-id-here"/, `database_id = "${dbId}"`)
        .replace(/preview_database_id = "your-preview-d1-database-id-here"/, `preview_database_id = "${previewDbId}"`);
      fs.writeFileSync(wranglerPath, wranglerContent);
      log('✅ Updated wrangler.toml with database IDs', colors.green);
    }
  } else {
    dbId = await question('Enter your D1 production database ID: ');
    previewDbId = await question('Enter your D1 preview database ID: ');
  }

  // Step 3: Apply Schema
  log('\n📝 Step 3: Applying database schema...', colors.blue);
  const applySchema = await question('Apply schema to databases? (y/n): ');
  
  if (applySchema.toLowerCase() === 'y') {
    const schemaPath = path.join(__dirname, '..', 'schema.sql');
    
    if (fs.existsSync(schemaPath)) {
      log('Applying schema to production...', colors.cyan);
      exec('npm run db:schema');
      
      log('Applying schema to preview...', colors.cyan);
      exec('npm run db:schema:preview');
      
      log('✅ Schema applied successfully!', colors.green);
    } else {
      log('❌ schema.sql not found', colors.red);
    }
  }

  // Step 4: Setup KV Namespace
  log('\n📝 Step 4: Setting up KV Namespace (for caching)...', colors.blue);
  const createKv = await question('Create new KV namespace? (y/n): ');
  
  if (createKv.toLowerCase() === 'y') {
    log('Creating KV namespace...', colors.cyan);
    const kvOutput = exec('npx wrangler kv:namespace create "CACHE"', true);
    const kvMatch = kvOutput.match(/id = "([^"]+)"/);
    const kvId = kvMatch ? kvMatch[1] : null;
    
    const kvPreviewOutput = exec('npx wrangler kv:namespace create "CACHE" --preview', true);
    const kvPreviewMatch = kvPreviewOutput.match(/id = "([^"]+)"/);
    const kvPreviewId = kvPreviewMatch ? kvPreviewMatch[1] : null;
    
    if (kvId && kvPreviewId) {
      log('✅ KV namespace created!', colors.green);
      log(`   Production ID: ${kvId}`, colors.cyan);
      log(`   Preview ID: ${kvPreviewId}`, colors.cyan);
      
      const wranglerPath = path.join(__dirname, '..', 'wrangler.toml');
      let wranglerContent = fs.readFileSync(wranglerPath, 'utf-8');
      wranglerContent = wranglerContent
        .replace(/id = "942c339bec2e43969167aa507c723f97"/, `id = "${kvId}"`)
        .replace(/preview_id = "80b0ee1abfbd4b28b401ab6094fedfa6"/, `preview_id = "${kvPreviewId}"`);
      fs.writeFileSync(wranglerPath, wranglerContent);
      log('✅ Updated wrangler.toml with KV IDs', colors.green);
    }
  }

  // Step 5: Setup Secrets
  log('\n📝 Step 5: Setting up secrets...', colors.blue);
  const setupSecrets = await question('Setup secrets now? (y/n): ');
  
  if (setupSecrets.toLowerCase() === 'y') {
    const geminiKey = await question('Enter your Gemini API Key (or press Enter to skip): ');
    if (geminiKey.trim()) {
      log('Setting GEMINI_API_KEY...', colors.cyan);
      try {
        execSync(`echo ${geminiKey} | npx wrangler secret put GEMINI_API_KEY`, { stdio: 'inherit' });
        log('✅ GEMINI_API_KEY set', colors.green);
      } catch (error) {
        log('⚠️  Failed to set GEMINI_API_KEY (you can do this manually later)', colors.yellow);
      }
    }
    
    const jwtSecret = await question('Enter JWT Secret (or press Enter to skip): ');
    if (jwtSecret.trim()) {
      log('Setting JWT_SECRET...', colors.cyan);
      try {
        execSync(`echo ${jwtSecret} | npx wrangler secret put JWT_SECRET`, { stdio: 'inherit' });
        log('✅ JWT_SECRET set', colors.green);
      } catch (error) {
        log('⚠️  Failed to set JWT_SECRET (you can do this manually later)', colors.yellow);
      }
    }
  }

  // Step 6: Test Setup
  log('\n📝 Step 6: Testing setup...', colors.blue);
  const testSetup = await question('Test local development server? (y/n): ');
  
  if (testSetup.toLowerCase() === 'y') {
    log('\n🚀 Starting development server...', colors.cyan);
    log('   Press Ctrl+C to stop the server\n', colors.yellow);
    log('   Visit: http://localhost:8787/health\n', colors.cyan);
    
    try {
      exec('npm run dev');
    } catch {
      log('\n✅ Server stopped', colors.green);
    }
  }

  // Final Summary
  log('\n' + '='.repeat(60), colors.blue);
  log('🎉 Setup Complete!', colors.green);
  log('='.repeat(60), colors.blue);
  log('\n📋 Next Steps:', colors.cyan);
  log('  1. Review wrangler.toml configuration');
  log('  2. Set any missing secrets: npx wrangler secret put <SECRET_NAME>');
  log('  3. Test locally: npm run dev');
  log('  4. Deploy: npm run deploy');
  log('\n📚 Documentation:', colors.cyan);
  log('  - DEPLOYMENT_GUIDE.md - Full deployment guide');
  log('  - README.md - API documentation');
  log('\n🔍 Useful Commands:', colors.cyan);
  log('  npm run dev              - Start development server');
  log('  npm run deploy           - Deploy to production');
  log('  npm run db:query         - Query database');
  log('  npm run db:info          - Show database info');
  log('  node scripts/migrate.js  - Database migration helper');
  log('');

  rl.close();
}

// Run setup
setup().catch(error => {
  log(`\n❌ Setup failed: ${error.message}`, colors.red);
  rl.close();
  process.exit(1);
});
