
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

async function debugAuth() {
  try {
    console.log('🔍 Starting comprehensive auth debug...\n');
    
    // 1. Check user auth data
    console.log('1. CHECKING AUTH USERS:');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Error fetching users:', authError);
      return;
    }

    const targetUser = authUsers.users.find(u => u.email === 'annalealayton@gmail.com');
    
    if (targetUser) {
      console.log('✅ Found user in auth.users:');
      console.log('   ID:', targetUser.id);
      console.log('   Email:', targetUser.email);
      console.log('   User Metadata:', JSON.stringify(targetUser.user_metadata, null, 2));
      console.log('   App Metadata:', JSON.stringify(targetUser.app_metadata, null, 2));
    } else {
      console.log('❌ User not found in auth.users');
    }

    // 2. Check profiles table
    console.log('\n2. CHECKING PROFILES TABLE:');
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'annalealayton@gmail.com');

    if (profileError) {
      console.error('❌ Error fetching profile:', profileError);
    } else if (profiles && profiles.length > 0) {
      console.log('✅ Found profile:');
      console.log(JSON.stringify(profiles[0], null, 2));
    } else {
      console.log('❌ No profile found');
    }

    // 3. Check RLS policies
    console.log('\n3. CHECKING RLS POLICIES:');
    const { data: policies, error: policyError } = await supabase
      .rpc('get_policies', { table_name: 'profiles' });

    if (policyError) {
      console.error('❌ Error fetching RLS policies:', policyError);
    } else {
      console.log('✅ RLS Policies for profiles table:');
      policies.forEach(policy => {
        console.log(`   ${policy.policyname}: ${policy.cmd} - ${policy.qual}`);
      });
    }

    // 4. Test session creation
    console.log('\n4. TESTING SESSION CREATION:');
    if (targetUser) {
      try {
        const { data: session, error: sessionError } = await supabase.auth.admin.generateLink({
          type: 'magiclink',
          email: targetUser.email,
        });
        
        if (sessionError) {
          console.error('❌ Error generating session:', sessionError);
        } else {
          console.log('✅ Can generate session for user');
        }
      } catch (e) {
        console.error('❌ Exception generating session:', e.message);
      }
    }

    console.log('\n🏁 Auth debug complete');

  } catch (error) {
    console.error('❌ Exception during debug:', error);
  }
}

debugAuth();
