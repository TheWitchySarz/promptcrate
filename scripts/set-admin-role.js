
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

async function setAdminRole() {
  try {
    const email = 'annalealayton@gmail.com';
    
    // First, find the user
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('Error fetching users:', authError);
      return;
    }

    const user = authUsers.users.find(u => u.email === email);
    
    if (!user) {
      console.error('User not found:', email);
      return;
    }

    console.log('Found user:', user.id, '-', user.email);

    // Update user metadata to include admin role
    const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      {
        user_metadata: {
          ...user.user_metadata,
          role: 'admin'
        }
      }
    );

    if (updateError) {
      console.error('Error updating user metadata:', updateError);
      return;
    }

    console.log('✅ Successfully updated user metadata with admin role');
    console.log('Updated user:', updatedUser.user.user_metadata);

    // Also update the profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email,
        username: user.user_metadata?.username || user.email.split('@')[0],
        full_name: user.user_metadata?.full_name || user.user_metadata?.username || user.email.split('@')[0],
        plan: 'admin',
        created_at: user.created_at,
        updated_at: new Date().toISOString()
      });

    if (profileError) {
      console.error('Error updating profile:', profileError);
    } else {
      console.log('✅ Successfully updated profile with admin plan');
    }

  } catch (error) {
    console.error('Exception:', error);
  }
}

setAdminRole();
