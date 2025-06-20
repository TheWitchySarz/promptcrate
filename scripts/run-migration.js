
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration() {
  try {
    console.log('Running the latest migration...');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20240322_fix_prompts_table.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('Migration SQL loaded, applying...');
    
    // Execute the migration SQL via RPC call
    const { data, error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      console.error('Error running migration:', error);
      console.log('\nPlease run this SQL manually in your Supabase SQL Editor:');
      console.log(migrationSQL);
      return;
    }
    
    console.log('✅ Migration applied successfully');
    
    // Now run the admin script
    console.log('Running make-admin script...');
    require('./make-admin.js');
    
  } catch (error) {
    console.error('Error:', error);
    console.log('\nIf the RPC method failed, please manually run the migration SQL in your Supabase SQL Editor.');
  }
}

runMigration();
