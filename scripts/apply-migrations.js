
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

async function createTables() {
  try {
    console.log('Creating profiles table...');
    
    // Create profiles table
    const createProfilesTable = `
      CREATE TABLE IF NOT EXISTS public.profiles (
          id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          full_name TEXT,
          plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'admin')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    
    const { error: createError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (createError && createError.code === '42P01') {
      console.log('Profiles table does not exist, creating it...');
      // Use a direct SQL query via RPC or raw SQL
      console.log('Please run this SQL in your Supabase SQL Editor:');
      console.log(createProfilesTable);
      console.log('\nAnd also run this for RLS policies:');
      console.log(`
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can view own profile" ON public.profiles
            FOR SELECT USING (auth.uid() = id);
        
        CREATE POLICY "Users can update own profile" ON public.profiles
            FOR UPDATE USING (auth.uid() = id);
        
        CREATE POLICY "Users can insert own profile" ON public.profiles
            FOR INSERT WITH CHECK (auth.uid() = id);
      `);
    } else {
      console.log('✅ Profiles table already exists');
    }
    
  } catch (error) {
    console.error('Error:', error);
    console.log('\nPlease manually create the tables using the Supabase dashboard SQL editor.');
  }
}

createTables();
