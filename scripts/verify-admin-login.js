
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyAdminLogin() {
  try {
    console.log('🔍 Verifying admin login setup...\n');
    
    const email = 'annalealayton@gmail.com';
    
    // 1. Check auth user
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Error fetching auth users:', authError);
      return;
    }

    const authUser = authUsers.users.find(u => u.email === email);
    
    if (!authUser) {
      console.error('❌ Auth user not found:', email);
      return;
    }

    console.log('✅ Auth user found:', authUser.id);
    console.log('📋 User metadata:', authUser.user_metadata);
    
    // 2. Check profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle();
    
    if (profileError) {
      console.error('❌ Error fetching profile:', profileError);
    } else if (profile) {
      console.log('✅ Profile found:', profile);
    } else {
      console.log('⚠️  No profile found, creating one...');
      
      // Create profile using service role
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: authUser.id,
          email: email,
          username: 'annalealayton',
          full_name: 'annalealayton',
          plan: 'admin'
        })
        .select()
        .single();
        
      if (createError) {
        console.error('❌ Error creating profile:', createError);
      } else {
        console.log('✅ Profile created:', newProfile);
      }
    }
    
    // 3. Test admin role detection
    const hasAdminRole = authUser.user_metadata?.role === 'admin' || 
                        profile?.plan === 'admin' ||
                        email === 'annalealayton@gmail.com';
    
    console.log('\n🎯 Admin Role Check:');
    console.log('- User metadata role:', authUser.user_metadata?.role);
    console.log('- Profile plan:', profile?.plan);
    console.log('- Email match:', email === 'annalealayton@gmail.com');
    console.log('- Has admin access:', hasAdminRole ? '✅' : '❌');
    
    if (hasAdminRole) {
      console.log('\n🎉 Admin setup verified! You should be able to:');
      console.log('- ✅ Login successfully');
      console.log('- ✅ Access /admin page');
      console.log('- ✅ See admin role in console');
    } else {
      console.log('\n❌ Admin setup incomplete. Check the issues above.');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

verifyAdminLogin();
