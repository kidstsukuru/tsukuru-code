import { readFileSync, writeFileSync } from 'fs';

// Migration files to combine
const migrations = [
  'supabase/migrations/010_create_levels_table.sql',
  'supabase/migrations/011_add_level_to_lessons.sql',
  'supabase/migrations/012_create_initial_levels.sql'
];

console.log('Combining migrations...\n');

let combinedSQL = `-- Combined Migrations for Level System\n`;
combinedSQL += `-- Generated at: ${new Date().toISOString()}\n`;
combinedSQL += `-- Execute this in Supabase SQL Editor\n\n`;

for (const migration of migrations) {
  console.log(`Adding: ${migration}`);
  const sql = readFileSync(migration, 'utf8');
  combinedSQL += `\n-- ===== ${migration} =====\n\n`;
  combinedSQL += sql;
  combinedSQL += `\n\n`;
}

const outputFile = 'supabase/migrations/combined_level_system.sql';
writeFileSync(outputFile, combinedSQL);

console.log(`\n✓ Combined migration saved to: ${outputFile}`);
console.log('\nTo apply these migrations:');
console.log('1. Open your Supabase project dashboard');
console.log('2. Navigate to SQL Editor');
console.log('3. Create a new query');
console.log(`4. Copy and paste the contents of ${outputFile}`);
console.log('5. Run the query');
