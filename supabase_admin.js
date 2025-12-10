import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('[ERROR] Missing Supabase credentials in .env.local');
  console.error('Required: VITE_SUPABASE_URL, VITE_SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create admin client with service role key (bypasses RLS)
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log('[INFO] Connected to Supabase with service role key');
console.log('[INFO] URL:', supabaseUrl);

// ====================
// Utility Functions
// ====================

async function getTableData(tableName, limit = 5) {
  console.log(`\n[INFO] Fetching data from table: ${tableName}`);

  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .limit(limit);

  if (error) {
    console.error('[ERROR]', error.message);
    return null;
  }

  return data;
}

async function showLessonsSchema() {
  console.log('\n[INFO] Checking lessons table structure...');

  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .limit(1);

  if (error) {
    console.error('[ERROR]', error);
    return;
  }

  if (data && data.length > 0) {
    console.log('\n[SUCCESS] Sample lesson:');
    console.log(JSON.stringify(data[0], null, 2));
    console.log('\nColumns present:', Object.keys(data[0]));
  } else {
    console.log('[WARNING] No lessons found in table');
  }
}

async function testLessonUpdate() {
  console.log('\n[TEST] Testing lesson update with service role key...');

  // Get first lesson
  const { data: lessons, error: fetchError } = await supabase
    .from('lessons')
    .select('*')
    .limit(1);

  if (fetchError) {
    console.error('[ERROR] Fetch failed:', fetchError);
    return false;
  }

  if (!lessons || lessons.length === 0) {
    console.error('[ERROR] No lessons found');
    return false;
  }

  const lesson = lessons[0];
  console.log('[INFO] Found lesson:', lesson.id);
  console.log('  Title:', lesson.title);
  console.log('  Current columns:', Object.keys(lesson));

  // Check if duration_minutes exists
  if (!('duration_minutes' in lesson)) {
    console.error('[ERROR] Column duration_minutes does not exist!');
    console.log('[INFO] You need to add this column via Supabase Dashboard SQL Editor');
    return false;
  }

  // Try to update with service role (bypasses RLS)
  console.log('\n[INFO] Attempting update...');
  const updateData = {
    xp_reward: lesson.xp_reward || 10,
    duration_minutes: lesson.duration_minutes || 15
  };

  console.log('[INFO] Update data:', updateData);

  const { data: updateResult, error: updateError } = await supabase
    .from('lessons')
    .update(updateData)
    .eq('id', lesson.id)
    .select();

  if (updateError) {
    console.error('[ERROR] Update failed:', updateError);
    return false;
  }

  if (!updateResult || updateResult.length === 0) {
    console.error('[ERROR] Update returned 0 rows');
    console.error('[INFO] This might be an RLS or trigger issue');
    return false;
  }

  console.log('[SUCCESS] Update successful!');
  console.log('[SUCCESS] Updated lesson:', updateResult[0].id);
  return true;
}

async function listAllLessons() {
  console.log('\n[INFO] Listing all lessons...');

  const { data, error } = await supabase
    .from('lessons')
    .select('id, title, xp_reward, is_published, order_index')
    .order('order_index', { ascending: true });

  if (error) {
    console.error('[ERROR]', error);
    return;
  }

  console.log(`\n[SUCCESS] Found ${data.length} lessons:\n`);
  console.table(data);
}

async function addLesson(courseId, lessonData) {
  console.log('\n[INFO] Adding new lesson...');

  const { data, error } = await supabase
    .from('lessons')
    .insert([{
      ...lessonData,
      course_id: courseId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }])
    .select();

  if (error) {
    console.error('[ERROR]', error);
    return null;
  }

  console.log('[SUCCESS] Lesson created:', data[0].id);
  return data[0];
}

async function updateLesson(lessonId, updates) {
  console.log('\n[INFO] Updating lesson:', lessonId);
  console.log('[INFO] Updates:', updates);

  const { data, error } = await supabase
    .from('lessons')
    .update(updates)
    .eq('id', lessonId)
    .select();

  if (error) {
    console.error('[ERROR]', error);
    return null;
  }

  if (!data || data.length === 0) {
    console.error('[ERROR] Update returned 0 rows');
    return null;
  }

  console.log('[SUCCESS] Lesson updated:', data[0].id);
  return data[0];
}

async function deleteLesson(lessonId) {
  console.log('\n[INFO] Deleting lesson:', lessonId);

  const { error } = await supabase
    .from('lessons')
    .delete()
    .eq('id', lessonId);

  if (error) {
    console.error('[ERROR]', error);
    return false;
  }

  console.log('[SUCCESS] Lesson deleted');
  return true;
}

async function listUsers() {
  console.log('\n[INFO] Listing all users...');

  // Note: auth.users table can only be queried with service role key
  const { data, error } = await supabase.auth.admin.listUsers();

  if (error) {
    console.error('[ERROR]', error);
    return;
  }

  console.log(`\n[SUCCESS] Found ${data.users.length} users:\n`);

  const usersTable = data.users.map(user => ({
    id: user.id.substring(0, 8) + '...',
    email: user.email,
    role: user.user_metadata?.role || 'user',
    created: new Date(user.created_at).toLocaleDateString()
  }));

  console.table(usersTable);
}

async function updateUserRole(email, role) {
  console.log(`\n[INFO] Updating user role: ${email} -> ${role}`);

  // Get user by email
  const { data: users, error: listError } = await supabase.auth.admin.listUsers();

  if (listError) {
    console.error('[ERROR]', listError);
    return;
  }

  const user = users.users.find(u => u.email === email);

  if (!user) {
    console.error('[ERROR] User not found:', email);
    return;
  }

  // Update user metadata
  const { data, error } = await supabase.auth.admin.updateUserById(
    user.id,
    {
      user_metadata: {
        ...user.user_metadata,
        role: role
      }
    }
  );

  if (error) {
    console.error('[ERROR]', error);
    return;
  }

  console.log('[SUCCESS] User role updated');
  console.log('User:', data.user.email);
  console.log('New role:', data.user.user_metadata.role);
}

async function generateMigrationSQL() {
  console.log('\n[SQL] Run this SQL in Supabase Dashboard > SQL Editor:');
  console.log('======================================\n');

  const sql = `
-- Add missing columns to lessons table
ALTER TABLE lessons
ADD COLUMN IF NOT EXISTS title_en TEXT,
ADD COLUMN IF NOT EXISTS lesson_type TEXT CHECK (lesson_type IN ('video', 'text', 'interactive', 'quiz')) DEFAULT 'text',
ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 15,
ADD COLUMN IF NOT EXISTS required_completion BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS youtube_url TEXT;

-- Drop audit triggers (if they cause issues)
DROP TRIGGER IF EXISTS audit_lessons_changes ON lessons;
DROP TRIGGER IF EXISTS audit_courses_changes ON courses;
DROP TRIGGER IF EXISTS audit_quizzes_changes ON quizzes;

-- Verify columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'lessons'
ORDER BY ordinal_position;
`;

  console.log(sql);
  console.log('\n======================================');
}

// ====================
// Main Menu
// ====================

async function main() {
  const command = process.argv[2];

  console.log('=======================================');
  console.log('  Supabase Admin Tool');
  console.log('  (Using Service Role Key - Bypasses RLS)');
  console.log('=======================================\n');

  if (!command) {
    console.log('Usage: node supabase_admin.js <command> [args]');
    console.log('\nAvailable commands:');
    console.log('  schema              - Show lessons table structure');
    console.log('  list                - List all lessons');
    console.log('  test-update         - Test lesson update');
    console.log('  update <id> <json>  - Update a lesson (e.g., update lesson-1 \'{"title":"New Title"}\')');
    console.log('  users               - List all users');
    console.log('  set-role <email> <role>  - Set user role (admin/super_admin/user)');
    console.log('  migration-sql       - Generate SQL for adding missing columns');
    console.log('');
    return;
  }

  switch (command) {
    case 'schema':
      await showLessonsSchema();
      break;

    case 'list':
      await listAllLessons();
      break;

    case 'test-update':
      await testLessonUpdate();
      break;

    case 'update':
      const lessonId = process.argv[3];
      const updates = JSON.parse(process.argv[4] || '{}');
      if (!lessonId) {
        console.error('[ERROR] Missing lesson ID');
        console.log('Usage: node supabase_admin.js update <lesson-id> \'{"title":"New Title"}\'');
        break;
      }
      await updateLesson(lessonId, updates);
      break;

    case 'users':
      await listUsers();
      break;

    case 'set-role':
      const email = process.argv[3];
      const role = process.argv[4];
      if (!email || !role) {
        console.error('[ERROR] Missing email or role');
        console.log('Usage: node supabase_admin.js set-role <email> <role>');
        console.log('Roles: admin, super_admin, user');
        break;
      }
      await updateUserRole(email, role);
      break;

    case 'migration-sql':
      await generateMigrationSQL();
      break;

    default:
      console.log('[ERROR] Unknown command:', command);
      console.log('Run without arguments to see available commands');
  }

  console.log('\n=======================================');
  console.log('  Done');
  console.log('=======================================\n');
}

main().catch(console.error);
