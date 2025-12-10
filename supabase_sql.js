import pg from 'pg';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const { Pool } = pg;

// Load .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const dbPassword = process.env.SUPABASE_DB_PASSWORD;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('[ERROR] Missing Supabase credentials in .env.local');
  console.error('Required: VITE_SUPABASE_URL, VITE_SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Extract project ref from URL (e.g., https://zbvxkcbpvpbskceogcic.supabase.co)
const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

if (!projectRef) {
  console.error('[ERROR] Could not extract project ref from Supabase URL');
  process.exit(1);
}

console.log('[INFO] Project Ref:', projectRef);
console.log('[INFO] Supabase URL:', supabaseUrl);

// Database connection string
// Try different connection formats
let connectionString;

if (!dbPassword) {
  console.log('[WARNING] SUPABASE_DB_PASSWORD not found in .env.local');
  console.log('[INFO] Please add your database password to .env.local:');
  console.log('');
  console.log('To get your database password:');
  console.log('1. Go to https://app.supabase.com/');
  console.log('2. Select your project');
  console.log('3. Go to Settings > Database');
  console.log('4. Under "Connection string", select "URI" tab');
  console.log('5. Click "Reset database password" if you don\'t have it');
  console.log('6. Copy the password and add to .env.local:');
  console.log('   SUPABASE_DB_PASSWORD=your-password-here');
  console.log('');
  process.exit(1);
}

// Check if user provided custom connection string
const customConnectionString = process.env.SUPABASE_CONNECTION_STRING;

if (customConnectionString) {
  connectionString = customConnectionString.replace('[YOUR-PASSWORD]', dbPassword);
  console.log('[INFO] Using custom connection string from .env.local');
} else {
  // Try direct connection
  connectionString = `postgresql://postgres:${dbPassword}@db.${projectRef}.supabase.co:5432/postgres`;
  console.log('[INFO] Using direct connection');
  console.log('[INFO] Connection string format: postgresql://postgres:***@db.' + projectRef + '.supabase.co:5432/postgres');
}

// Create connection pool
const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

// ====================
// SQL Execution Functions
// ====================

async function executeSQL(sql) {
  const client = await pool.connect();
  try {
    console.log('[SQL] Executing query...');
    console.log('---');
    console.log(sql);
    console.log('---');

    const result = await client.query(sql);

    console.log('[SUCCESS] Query executed successfully');

    if (result.rows && result.rows.length > 0) {
      console.log(`[INFO] Returned ${result.rows.length} rows`);
      console.table(result.rows);
    } else if (result.rowCount !== null) {
      console.log(`[INFO] Affected ${result.rowCount} rows`);
    }

    return result;
  } catch (error) {
    console.error('[ERROR] SQL execution failed:');
    console.error(error.message);
    if (error.detail) console.error('[DETAIL]', error.detail);
    if (error.hint) console.error('[HINT]', error.hint);
    throw error;
  } finally {
    client.release();
  }
}

async function executeSQLFile(filePath) {
  console.log(`[INFO] Reading SQL file: ${filePath}`);

  try {
    const sql = readFileSync(filePath, 'utf-8');
    console.log(`[INFO] File loaded (${sql.length} characters)`);

    return await executeSQL(sql);
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error('[ERROR] File not found:', filePath);
    } else {
      throw error;
    }
  }
}

async function showTables() {
  const sql = `
    SELECT
      schemaname,
      tablename,
      tableowner
    FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY tablename;
  `;

  return await executeSQL(sql);
}

async function describeTable(tableName) {
  const sql = `
    SELECT
      column_name,
      data_type,
      character_maximum_length,
      is_nullable,
      column_default
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = '${tableName}'
    ORDER BY ordinal_position;
  `;

  return await executeSQL(sql);
}

async function showPolicies(tableName) {
  const sql = tableName
    ? `SELECT * FROM pg_policies WHERE tablename = '${tableName}';`
    : `SELECT * FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename, policyname;`;

  return await executeSQL(sql);
}

async function quickFix() {
  console.log('[INFO] Running quick fix SQL...');

  const sql = `
-- Drop problematic triggers
DROP TRIGGER IF EXISTS audit_lessons_changes ON lessons;
DROP TRIGGER IF EXISTS audit_courses_changes ON courses;
DROP TRIGGER IF EXISTS audit_quizzes_changes ON quizzes;

-- Add missing columns
ALTER TABLE lessons
ADD COLUMN IF NOT EXISTS title_en TEXT,
ADD COLUMN IF NOT EXISTS lesson_type TEXT CHECK (lesson_type IN ('video', 'text', 'interactive', 'quiz')) DEFAULT 'text',
ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 15,
ADD COLUMN IF NOT EXISTS required_completion BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS youtube_url TEXT;

-- Fix RLS policies for lessons
DROP POLICY IF EXISTS "Admins can view all lessons" ON lessons;
DROP POLICY IF EXISTS "Admins can update lessons" ON lessons;

CREATE POLICY "Admins can view all lessons"
  ON lessons FOR SELECT
  USING (
    (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid())
    IN ('admin', 'super_admin')
  );

CREATE POLICY "Admins can update lessons"
  ON lessons FOR UPDATE
  USING (
    (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid())
    IN ('admin', 'super_admin')
  );

-- Verify
SELECT 'Quick fix completed!' AS status;
  `;

  return await executeSQL(sql);
}

// ====================
// Main Menu
// ====================

async function main() {
  const command = process.argv[2];

  console.log('=======================================');
  console.log('  Supabase SQL Tool');
  console.log('  Direct PostgreSQL Connection');
  console.log('=======================================\n');

  if (!command) {
    console.log('Usage: node supabase_sql.js <command> [args]');
    console.log('\nAvailable commands:');
    console.log('  tables              - List all tables');
    console.log('  describe <table>    - Show table schema');
    console.log('  policies [table]    - Show RLS policies');
    console.log('  exec "<sql>"        - Execute SQL query');
    console.log('  file <path>         - Execute SQL file');
    console.log('  quick-fix           - Run quick fix SQL');
    console.log('');
    console.log('Examples:');
    console.log('  node supabase_sql.js tables');
    console.log('  node supabase_sql.js describe lessons');
    console.log('  node supabase_sql.js exec "SELECT * FROM courses LIMIT 5"');
    console.log('  node supabase_sql.js file supabase/migrations/004_cleanup_and_fix.sql');
    console.log('  node supabase_sql.js quick-fix');
    console.log('');
    await pool.end();
    return;
  }

  try {
    switch (command) {
      case 'tables':
        await showTables();
        break;

      case 'describe':
        const tableName = process.argv[3];
        if (!tableName) {
          console.error('[ERROR] Missing table name');
          console.log('Usage: node supabase_sql.js describe <table-name>');
          break;
        }
        await describeTable(tableName);
        break;

      case 'policies':
        const policyTable = process.argv[3];
        await showPolicies(policyTable);
        break;

      case 'exec':
        const sql = process.argv[3];
        if (!sql) {
          console.error('[ERROR] Missing SQL query');
          console.log('Usage: node supabase_sql.js exec "SELECT * FROM table"');
          break;
        }
        await executeSQL(sql);
        break;

      case 'file':
        const filePath = process.argv[3];
        if (!filePath) {
          console.error('[ERROR] Missing file path');
          console.log('Usage: node supabase_sql.js file path/to/file.sql');
          break;
        }
        await executeSQLFile(filePath);
        break;

      case 'quick-fix':
        await quickFix();
        break;

      default:
        console.log('[ERROR] Unknown command:', command);
        console.log('Run without arguments to see available commands');
    }
  } catch (error) {
    console.error('[FATAL]', error.message);
    process.exit(1);
  } finally {
    await pool.end();
    console.log('\n=======================================');
    console.log('  Connection closed');
    console.log('=======================================\n');
  }
}

main().catch(console.error);
