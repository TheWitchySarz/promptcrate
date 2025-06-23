
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
    
    // First, let's make sure the profiles table has the username column
    const { error: alterError } = await supabase.rpc('exec_sql', { 
      sql: `
        DO $$ 
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='username') THEN
            ALTER TABLE profiles ADD COLUMN username TEXT;
          END IF;
        END $$;
      `
    });
    
    if (alterError) {
      console.log('Note: Could not check/add username column:', alterError.message);
    }
    
    // Drop existing policies to start fresh
    const dropPolicies = `
      DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
      DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
      DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
      DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
      DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
      DROP POLICY IF EXISTS "Allow authenticated users to insert their own profile" ON profiles;
      DROP POLICY IF EXISTS "Allow users to view their own profile" ON profiles;
      DROP POLICY IF EXISTS "Allow users to update their own profile" ON profiles;
    `;
    
    const { error: dropError } = await supabase.rpc('exec_sql', { sql: dropPolicies });
    
    if (dropError) {
      console.log('Note: Some policies may not have existed:', dropError.message);
    }
    
    // Create new, more permissive policies
    const createPolicies = `
      -- Allow authenticated users to insert their own profile
      CREATE POLICY "Allow authenticated users to insert their own profile" ON profiles
        FOR INSERT 
        TO authenticated
        WITH CHECK (auth.uid() = id);
      
      -- Allow users to view their own profile
      CREATE POLICY "Allow users to view their own profile" ON profiles
        FOR SELECT 
        TO authenticated
        USING (auth.uid() = id);
      
      -- Allow users to update their own profile
      CREATE POLICY "Allow users to update their own profile" ON profiles
        FOR UPDATE 
        TO authenticated
        USING (auth.uid() = id);
      
      -- Allow admins to view all profiles
      CREATE POLICY "Allow admins to view all profiles" ON profiles
        FOR SELECT 
        TO authenticated
        USING (
          EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND plan = 'admin'
          )
        );
      
      -- Allow admins to update all profiles
      CREATE POLICY "Allow admins to update all profiles" ON profiles
        FOR UPDATE 
        TO authenticated
        USING (
          EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND plan = 'admin'
          )
        );
    `;
    
    const { error: createError } = await supabase.rpc('exec_sql', { sql: createPolicies });
    
    if (createError) {
      console.error('Error creating policies:', createError);
      
      // If RPC doesn't work, show the SQL to run manually
      console.log('\nPlease run this SQL manually in your Supabase SQL Editor:');
      console.log(dropPolicies);
      console.log(createPolicies);
      return;
    }
    
    console.log('✅ Successfully fixed RLS policies');
    
    // Now ensure the admin user profile exists using service role (bypasses RLS)
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
    
    // Use service role to upsert the admin profile (this bypasses RLS)
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
      console.error('Error creating admin user profile:', error);
      return;
    }
    
    console.log('✅ Successfully created/updated admin user profile:', data[0]);
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

fixRLSPolicies();
