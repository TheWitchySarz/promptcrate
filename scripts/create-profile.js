
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

async function createProfile() {
  const email = 'annalealayton@gmail.com';
  const username = 'annalealayton';
  
  try {
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
    
    // First, try to delete any existing profile to start fresh
    await supabase
      .from('profiles')
      .delete()
      .eq('id', authUser.id);
    
    // Create new profile
    const { data, error } = await supabase
      .from('profiles')
      .insert([{
        id: authUser.id,
        email: email,
        username: username,
        full_name: username,
        plan: 'admin'
      }])
      .select();
    
    if (error) {
      console.error('Error creating profile:', error);
      return;
    }
    
    console.log('✅ Successfully created profile:', data[0]);
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

createProfile();
