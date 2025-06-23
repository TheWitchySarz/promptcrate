
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixRLSPolicies() {
  try {
    console.log('Fixing RLS policies for profiles table...');
    
    // Drop existing policies that might be causing issues
    const dropPolicies = `
      DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
      DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
      DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
      DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
      DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
    `;
    
    const { error: dropError } = await supabase.rpc('exec_sql', { sql: dropPolicies });
    
    if (dropError) {
      console.log('Note: Some policies may not have existed:', dropError.message);
    }
    
    // Create new policies that allow proper access
    const createPolicies = `
      -- Allow users to read their own profile
      CREATE POLICY "Users can read own profile" ON profiles
        FOR SELECT USING (auth.uid() = id);
      
      -- Allow users to insert their own profile
      CREATE POLICY "Users can insert own profile" ON profiles
        FOR INSERT WITH CHECK (auth.uid() = id);
      
      -- Allow users to update their own profile
      CREATE POLICY "Users can update own profile" ON profiles
        FOR UPDATE USING (auth.uid() = id);
      
      -- Allow admins to read all profiles
      CREATE POLICY "Admins can read all profiles" ON profiles
        FOR SELECT USING (
          EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND plan = 'admin'
          )
        );
      
      -- Allow admins to update all profiles
      CREATE POLICY "Admins can update all profiles" ON profiles
        FOR UPDATE USING (
          EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND plan = 'admin'
          )
        );
    `;
    
    const { error: createError } = await supabase.rpc('exec_sql', { sql: createPolicies });
    
    if (createError) {
      console.error('Error creating policies:', createError);
      return;
    }
    
    console.log('✅ Successfully fixed RLS policies');
    
    // Now ensure the admin user profile exists
    const email = 'annalealayton@gmail.com';
    
    // Get the user ID from auth.users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('Error fetching auth users:', authError);
      return;
    }
    
    const authUser = authUsers.users.find(user => user.email === email);
    
    if (!authUser) {
      console.error(`User with email ${email} not found`);
      return;
    }
    
    console.log(`Found user: ${authUser.id} - ${authUser.email}`);
    
    // Use service role to upsert the admin profile
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: authUser.id,
        email: email,
        username: 'annalealayton',
        full_name: 'annalealayton',
        plan: 'admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select();
    
    if (error) {
      console.error('Error creating admin profile:', error);
      return;
    }
    
    console.log('✅ Successfully created/updated admin profile:', data[0]);
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

fixRLSPolicies();
