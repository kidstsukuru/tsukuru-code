import pg from 'pg';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { writeFileSync } from 'fs';

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '.env.local') });

const dbPassword = process.env.SUPABASE_DB_PASSWORD;
const customConnectionString = process.env.SUPABASE_CONNECTION_STRING;
const connectionString = customConnectionString.replace('[YOUR-PASSWORD]', dbPassword);

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function exportSchema() {
  const client = await pool.connect();

  try {
    let output = `-- ============================================
-- Current Database Schema
-- Generated: ${new Date().toISOString().split('T')[0]}
-- Description: Complete schema after cleanup (6 tables)
-- ============================================

`;

    // Get all tables
    const tablesResult = await client.query(`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);

    for (const table of tablesResult.rows) {
      const tableName = table.tablename;

      output += `\n-- ============================================\n`;
      output += `-- Table: ${tableName}\n`;
      output += `-- ============================================\n\n`;

      // Get table definition
      const createTableResult = await client.query(`
        SELECT
          'CREATE TABLE ' || quote_ident(table_name) || ' (' ||
          string_agg(
            quote_ident(column_name) || ' ' ||
            UPPER(data_type) ||
            CASE
              WHEN character_maximum_length IS NOT NULL
              THEN '(' || character_maximum_length || ')'
              ELSE ''
            END ||
            CASE WHEN is_nullable = 'NO' THEN ' NOT NULL' ELSE '' END ||
            CASE
              WHEN column_default IS NOT NULL
              THEN ' DEFAULT ' || column_default
              ELSE ''
            END,
            ', '
          ) ||
          ');' AS create_statement
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
        GROUP BY table_name
      `, [tableName]);

      if (createTableResult.rows[0]) {
        output += createTableResult.rows[0].create_statement + '\n\n';
      }

      // Get constraints
      const constraintsResult = await client.query(`
        SELECT
          'ALTER TABLE ' || quote_ident(tc.table_name) ||
          ' ADD CONSTRAINT ' || quote_ident(tc.constraint_name) ||
          ' ' || tc.constraint_type ||
          CASE
            WHEN tc.constraint_type = 'FOREIGN KEY' THEN
              ' (' || kcu.column_name || ') REFERENCES ' ||
              ccu.table_name || '(' || ccu.column_name || ')' ||
              CASE WHEN rc.delete_rule != 'NO ACTION'
                THEN ' ON DELETE ' || rc.delete_rule
                ELSE ''
              END
            WHEN tc.constraint_type = 'PRIMARY KEY' THEN
              ' (' || kcu.column_name || ')'
            ELSE ''
          END || ';' AS constraint_def
        FROM information_schema.table_constraints tc
        LEFT JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
        LEFT JOIN information_schema.constraint_column_usage ccu
          ON tc.constraint_name = ccu.constraint_name
        LEFT JOIN information_schema.referential_constraints rc
          ON tc.constraint_name = rc.constraint_name
        WHERE tc.table_schema = 'public'
          AND tc.table_name = $1
          AND tc.constraint_type IN ('PRIMARY KEY', 'FOREIGN KEY', 'UNIQUE')
        ORDER BY tc.constraint_type
      `, [tableName]);

      if (constraintsResult.rows.length > 0) {
        output += '-- Constraints\n';
        constraintsResult.rows.forEach(row => {
          output += row.constraint_def + '\n';
        });
        output += '\n';
      }

      // Get indexes
      const indexesResult = await client.query(`
        SELECT indexdef || ';' as index_def
        FROM pg_indexes
        WHERE schemaname = 'public'
          AND tablename = $1
          AND indexname NOT LIKE '%_pkey'
        ORDER BY indexname
      `, [tableName]);

      if (indexesResult.rows.length > 0) {
        output += '-- Indexes\n';
        indexesResult.rows.forEach(row => {
          output += row.index_def + '\n';
        });
        output += '\n';
      }

      // Enable RLS
      output += `-- Enable RLS\nALTER TABLE ${tableName} ENABLE ROW LEVEL SECURITY;\n\n`;

      // Get RLS policies
      const policiesResult = await client.query(`
        SELECT
          'CREATE POLICY ' || quote_ident(policyname) ||
          ' ON ' || quote_ident(tablename) ||
          ' FOR ' || cmd ||
          CASE WHEN roles::text != '{public}'
            THEN ' TO ' || array_to_string(roles, ', ')
            ELSE ''
          END ||
          CASE WHEN qual IS NOT NULL
            THEN ' USING (' || qual || ')'
            ELSE ''
          END ||
          CASE WHEN with_check IS NOT NULL
            THEN ' WITH CHECK (' || with_check || ')'
            ELSE ''
          END || ';' AS policy_def
        FROM pg_policies
        WHERE schemaname = 'public' AND tablename = $1
        ORDER BY policyname
      `, [tableName]);

      if (policiesResult.rows.length > 0) {
        output += '-- RLS Policies\n';
        policiesResult.rows.forEach(row => {
          output += row.policy_def + '\n';
        });
        output += '\n';
      }
    }

    // Get functions
    output += `\n-- ============================================\n`;
    output += `-- Functions\n`;
    output += `-- ============================================\n\n`;

    const functionsResult = await client.query(`
      SELECT pg_get_functiondef(oid) || ';' as function_def
      FROM pg_proc
      WHERE pronamespace = 'public'::regnamespace
      ORDER BY proname
    `);

    functionsResult.rows.forEach(row => {
      output += row.function_def + '\n\n';
    });

    // Get triggers
    output += `-- ============================================\n`;
    output += `-- Triggers\n`;
    output += `-- ============================================\n\n`;

    const triggersResult = await client.query(`
      SELECT
        'CREATE TRIGGER ' || trigger_name ||
        ' ' || action_timing || ' ' || event_manipulation ||
        ' ON ' || event_object_table ||
        ' FOR EACH ' || action_orientation ||
        ' EXECUTE FUNCTION ' || action_statement || ';' as trigger_def
      FROM information_schema.triggers
      WHERE trigger_schema = 'public'
      ORDER BY event_object_table, trigger_name
    `);

    triggersResult.rows.forEach(row => {
      output += row.trigger_def + '\n';
    });

    // Write to file
    writeFileSync('supabase/schema_current.sql', output);
    console.log('✅ Schema exported to supabase/schema_current.sql');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

exportSchema();
