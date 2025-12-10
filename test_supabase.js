import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zbvxkcbpvpbskceogcic.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpidnhrY2JwdnBic2tjZW9nY2ljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2ODAxMjIsImV4cCI6MjA4MDI1NjEyMn0.tEHkUWjAsRFz5eErUK_wND8NDocEg9gsHgEWNnsPGvE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSupabase() {
  console.log('[TEST] Supabase connection test started\n');

  try {
    const email = process.argv[2] || 'admin@example.com';
    const password = process.argv[3] || 'Admin123!';

    console.log(`[INFO] Email: ${email}`);
    console.log('[INFO] Password: ********\n');

    // Login
    console.log('[STEP 1] Logging in...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      console.error('[ERROR] Login failed:', authError.message);
      return;
    }

    console.log('[SUCCESS] Login successful');
    console.log('User ID:', authData.user.id);
    console.log('Email:', authData.user.email);
    console.log('Role:', authData.user.user_metadata?.role || 'none');
    console.log('');

    // Fetch a lesson
    console.log('[STEP 2] Fetching a lesson...');
    const { data: lessons, error: fetchError } = await supabase
      .from('lessons')
      .select('*')
      .limit(1);

    if (fetchError) {
      console.error('[ERROR] Fetch failed:', fetchError.message);
      return;
    }

    if (!lessons || lessons.length === 0) {
      console.error('[ERROR] No lessons found');
      return;
    }

    const lesson = lessons[0];
    console.log('[SUCCESS] Lesson fetched:', lesson.id);
    console.log('Title:', lesson.title);
    console.log('XP Reward:', lesson.xp_reward);
    console.log('Duration:', lesson.duration_minutes, 'minutes');
    console.log('');

    // Update the lesson
    console.log('[STEP 3] Updating lesson...');
    const updateData = {
      title: lesson.title + ' (TEST)',
      xp_reward: lesson.xp_reward || 10,
      duration_minutes: lesson.duration_minutes || 15
    };

    console.log('Update data:', JSON.stringify(updateData, null, 2));
    console.log('');

    const { data: updateResult, error: updateError } = await supabase
      .from('lessons')
      .update(updateData)
      .eq('id', lesson.id)
      .select();

    if (updateError) {
      console.error('[ERROR] Update failed:', updateError);
      console.error('Code:', updateError.code);
      console.error('Message:', updateError.message);
      console.error('Details:', updateError.details);
      console.error('Hint:', updateError.hint);
      return;
    }

    if (!updateResult || updateResult.length === 0) {
      console.error('[ERROR] Update failed: 0 rows returned');
      console.error('This is likely an RLS policy issue');
      console.error('User does not have permission to update, or policy is incorrectly configured');
      return;
    }

    console.log('[SUCCESS] Update successful!');
    console.log('Result:', JSON.stringify(updateResult[0], null, 2));
    console.log('');

    // Revert
    console.log('[STEP 4] Reverting to original title...');
    const { error: revertError } = await supabase
      .from('lessons')
      .update({ title: lesson.title })
      .eq('id', lesson.id);

    if (revertError) {
      console.error('[WARNING] Could not revert:', revertError.message);
    } else {
      console.log('[SUCCESS] Reverted');
    }

    console.log('\n[COMPLETE] All tests passed!');

  } catch (error) {
    console.error('[ERROR] Unexpected error:', error);
  }
}

console.log('Usage: node test_supabase.js [email] [password]');
console.log('Example: node test_supabase.js admin@example.com Admin123!\n');
testSupabase();
