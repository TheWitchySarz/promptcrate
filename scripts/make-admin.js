
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
    console.log('Refreshing schema cache...');
    // Force schema refresh by making a simple query
    await supabase.rpc('version');
    
    // Wait a moment for schema to refresh
    await new Promise(resolve => setTimeout(resolve, 2000));
    
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
    
    // Extract username and full_name from user metadata or derive from email
    const username = authUser.user_metadata?.username || authUser.email?.split('@')[0] || 'admin';
    const fullName = authUser.user_metadata?.full_name || authUser.user_metadata?.username || authUser.email?.split('@')[0];
    
    console.log(`Using username: ${username}, full_name: ${fullName}`);
    
    // Check if user exists in profiles table
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle();
    
    if (fetchError) {
      console.error('Error fetching user from profiles table:', fetchError);
      return;
    }
    
    if (existingProfile) {
      // Update existing profile to admin plan
      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          plan: 'admin',
          email: email,
          username: username,
          full_name: fullName,
          updated_at: new Date().toISOString()
        })
        .eq('id', authUser.id)
        .select();
      
      if (error) {
        console.error('Error updating user to admin:', error);
        return;
      }
      
      console.log('✅ Successfully updated user to admin plan:', data[0]);
    } else {
      // Create new profile record with admin plan
      const { data, error } = await supabase
        .from('profiles')
        .insert([{
          id: authUser.id,
          email: email,
          username: username,
          full_name: fullName,
          plan: 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select();
      
      if (error) {
        console.error('Error creating admin user profile:', error);
        console.log('Attempting upsert instead...');
        
        // Try upsert as fallback
        const { data: upsertData, error: upsertError } = await supabase
          .from('profiles')
          .upsert({
            id: authUser.id,
            email: email,
            username: username,
            full_name: fullName,
            plan: 'admin',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select();
          
        if (upsertError) {
          console.error('Error upserting admin user profile:', upsertError);
          return;
        }
        
        console.log('✅ Successfully upserted admin user profile:', upsertData[0]);
        return;
      }
      
      console.log('✅ Successfully created admin user profile:', data[0]);
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

makeAdmin();
