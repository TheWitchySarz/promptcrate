
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixProfileRLS() {
  try {
    console.log('🔧 Fixing RLS policies for profiles table...');
    
    // Drop existing policies
    const dropPoliciesSQL = `
      DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
      DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
      DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
      DROP POLICY IF EXISTS "Allow authenticated users to insert their own profile" ON profiles;
      DROP POLICY IF EXISTS "Allow users to view their own profile" ON profiles;
      DROP POLICY IF EXISTS "Allow users to update their own profile" ON profiles;
      DROP POLICY IF EXISTS "Allow admins to view all profiles" ON profiles;
      DROP POLICY IF EXISTS "Allow admins to update all profiles" ON profiles;
    `;

    // Create new policies that allow profile creation
    const createPoliciesSQL = `
      -- Allow users to insert their own profile
      CREATE POLICY "profiles_insert_policy" ON profiles
        FOR INSERT 
        TO authenticated
        WITH CHECK (auth.uid() = id);
      
      -- Allow users to view their own profile
      CREATE POLICY "profiles_select_policy" ON profiles
        FOR SELECT 
        TO authenticated
        USING (auth.uid() = id);
      
      -- Allow users to update their own profile
      CREATE POLICY "profiles_update_policy" ON profiles
        FOR UPDATE 
        TO authenticated
        USING (auth.uid() = id);
      
      -- Allow service role to do everything (for scripts)
      CREATE POLICY "profiles_service_role_policy" ON profiles
        FOR ALL 
        TO service_role
        USING (true)
        WITH CHECK (true);
    `;

    console.log('Dropping existing policies...');
    const { error: dropError } = await supabase.rpc('exec_sql', { 
      sql: dropPoliciesSQL 
    });
    
    if (dropError) {
      console.log('Note about dropping policies:', dropError.message);
    }

    console.log('Creating new policies...');
    const { error: createError } = await supabase.rpc('exec_sql', { 
      sql: createPoliciesSQL 
    });
    
    if (createError) {
      console.error('❌ Error creating policies:', createError);
      console.log('\nPlease run this SQL manually in your Supabase SQL Editor:');
      console.log(dropPoliciesSQL);
      console.log(createPoliciesSQL);
      return;
    }

    console.log('✅ Successfully updated RLS policies');

    // Now ensure the admin profile exists
    const email = 'annalealayton@gmail.com';
    
    // Get the user from auth
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Error fetching auth users:', authError);
      return;
    }
    
    const authUser = authUsers.users.find(user => user.email === email);
    
    if (!authUser) {
      console.error(`❌ User with email ${email} not found`);
      return;
    }

    console.log(`Found user: ${authUser.id} - ${authUser.email}`);

    // Use service role to ensure admin profile exists
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
      console.error('❌ Error ensuring admin profile:', error);
      return;
    }

    console.log('✅ Admin profile ensured:', data[0]);
    console.log('\n🎉 Profile RLS fix complete!');
    console.log('You should now be able to login successfully.');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

fixProfileRLS();
