
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

async function makeAdmin() {
  const email = 'annalealayton@gmail.com';
  
  try {
    // First, check if user exists in auth.users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('Error fetching auth users:', authError);
      return;
    }
    
    const authUser = authUsers.users.find(user => user.email === email);
    
    if (!authUser) {
      console.error(`User with email ${email} not found in auth.users`);
      console.log('Available users:', authUsers.users.map(u => u.email));
      return;
    }
    
    console.log(`Found auth user: ${authUser.id} - ${authUser.email}`);
    
    // Check if user exists in users table
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle();
    
    if (fetchError) {
      console.error('Error fetching user from users table:', fetchError);
      return;
    }
    
    if (existingUser) {
      // Update existing user to admin
      const { data, error } = await supabase
        .from('users')
        .update({ 
          role: 'admin',
          email: email // Ensure email is set
        })
        .eq('id', authUser.id)
        .select();
      
      if (error) {
        console.error('Error updating user to admin:', error);
        return;
      }
      
      console.log('✅ Successfully updated user to admin:', data[0]);
    } else {
      // Create new user record with admin role
      const { data, error } = await supabase
        .from('users')
        .insert([{
          id: authUser.id,
          email: email,
          name: authUser.user_metadata?.name || authUser.email?.split('@')[0],
          role: 'admin',
          plan: 'pro' // Give admin a pro plan
        }])
        .select();
      
      if (error) {
        console.error('Error creating admin user:', error);
        return;
      }
      
      console.log('✅ Successfully created admin user:', data[0]);
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

makeAdmin();
