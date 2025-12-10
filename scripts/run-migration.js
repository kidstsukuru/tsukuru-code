import pg from 'pg';
import { readFileSync } from 'fs';
import { config } from 'dotenv';

const { Client } = pg;

// Load environment variables
config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Error: Missing Supabase credentials');
  console.error('Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_SERVICE_ROLE_KEY are set in .env');
  process.exit(1);
}

// Extract project reference from Supabase URL
const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

if (!projectRef) {
  console.error('Error: Could not parse project reference from Supabase URL');
  process.exit(1);
}

// Construct PostgreSQL connection string
const connectionString = `postgresql://postgres:${supabaseServiceRoleKey}@db.${projectRef}.supabase.co:5432/postgres`;

async function runMigration(filePath) {
  const client = new Client({ connectionString });

  try {
    console.log(`\nConnecting to database...`);
    await client.connect();
    console.log('✓ Connected');

    console.log(`\nExecuting migration: ${filePath}`);
    const sql = readFileSync(filePath, 'utf8');

    await client.query(sql);

    console.log('✓ Migration executed successfully');
    return true;
  } catch (error) {
    console.error('✗ Migration failed:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

// Get migration file path from command line argument
const migrationFile = process.argv[2];

if (!migrationFile) {
  console.error('Usage: node scripts/run-migration.js <migration-file-path>');
  process.exit(1);
}

runMigration(migrationFile)
  .then(() => {
    console.log('\n✓ Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n✗ Migration failed');
    process.exit(1);
  });
