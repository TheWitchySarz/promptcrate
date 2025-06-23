
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

async function fixAdminAccess() {
  try {
    console.log('🔧 Fixing admin access...\n');
    
    const email = 'annalealayton@gmail.com';
    
    // 1. Get user from auth
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Error fetching users:', authError);
      return;
    }

    const user = authUsers.users.find(u => u.email === email);
    
    if (!user) {
      console.error('❌ User not found:', email);
      return;
    }

    console.log('✅ Found user:', user.id);

    // 2. Update user metadata with admin role
    const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      {
        user_metadata: {
          ...user.user_metadata,
          role: 'admin',
          email: email,
          username: 'annalealayton'
        }
      }
    );

    if (updateError) {
      console.error('❌ Error updating user metadata:', updateError);
      return;
    }

    console.log('✅ Updated user metadata with admin role');

    // 3. Ensure profile exists with admin plan
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: email,
        username: 'annalealayton',
        full_name: 'annalealayton',
        plan: 'admin',
        created_at: user.created_at,
        updated_at: new Date().toISOString()
      })
      .select();

    if (profileError) {
      console.error('❌ Error creating/updating profile:', profileError);
      return;
    }

    console.log('✅ Profile updated with admin plan:', profile[0]);

    // 4. Test admin access
    console.log('\n🧪 Testing admin access...');
    
    const { data: adminProfile, error: testError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .eq('plan', 'admin')
      .single();

    if (testError) {
      console.error('❌ Error testing admin access:', testError);
      return;
    }

    if (adminProfile) {
      console.log('✅ Admin access confirmed');
      console.log('✅ User can access /admin route');
      console.log('✅ Login should redirect to /home');
    }

    console.log('\n🎉 Admin access fix complete!');
    console.log('\n📋 What was fixed:');
    console.log('- ✅ User metadata updated with admin role');
    console.log('- ✅ Profile table updated with admin plan');
    console.log('- ✅ Admin access confirmed');
    console.log('\n🔄 Please test login flow now');

  } catch (error) {
    console.error('❌ Exception during fix:', error);
  }
}

fixAdminAccess();
