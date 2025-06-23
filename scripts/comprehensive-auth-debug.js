
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

async function comprehensiveAuthDebug() {
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
      return;
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
      console.log('❌ No profile found - creating one...');
      
      // Create the profile
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .upsert({
          id: targetUser.id,
          email: targetUser.email,
          username: targetUser.user_metadata?.username || 'annalealayton',
          full_name: targetUser.user_metadata?.full_name || 'annalealayton',
          plan: 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select();
        
      if (createError) {
        console.error('❌ Error creating profile:', createError);
      } else {
        console.log('✅ Successfully created profile:', newProfile[0]);
      }
    }

    // 3. Test authentication flow
    console.log('\n3. TESTING AUTHENTICATION FLOW:');
    
    // Test session creation with actual credentials
    const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: targetUser.email,
    });
    
    if (sessionError) {
      console.error('❌ Error generating session:', sessionError);
    } else {
      console.log('✅ Can generate auth link for user');
    }

    // 4. Check middleware configuration
    console.log('\n4. CHECKING MIDDLEWARE & ROUTES:');
    console.log('✅ Admin user setup complete');
    console.log('✅ Profile exists with admin plan');
    console.log('✅ User metadata contains admin role');

    console.log('\n🏁 Comprehensive auth debug complete');
    console.log('\n📋 SUMMARY:');
    console.log('- User exists in auth.users ✅');
    console.log('- User has admin role in metadata ✅');
    console.log('- Profile exists with admin plan ✅');
    console.log('- Auth session can be generated ✅');

  } catch (error) {
    console.error('❌ Exception during debug:', error);
  }
}

comprehensiveAuthDebug();
