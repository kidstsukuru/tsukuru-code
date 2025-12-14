import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://zbvxkcbpvpbskceogcic.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpidnhrY2JwdnBic2tjZW9nY2ljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ2ODAxMjIsImV4cCI6MjA4MDI1NjEyMn0.tEHkUWjAsRFz5eErUK_wND8NDocEg9gsHgEWNnsPGvE"; // anon または service_role
const supabase = createClient(supabaseUrl, supabaseKey);

// テーブル users を取得してみる
async function main() {
    const { data, error } = await supabase
        .from('users')

        .select('*');

    if (error) console.error("Error:", error);
    else console.log("Users:", data);
}

main();
