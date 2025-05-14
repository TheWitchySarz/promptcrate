import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

// Define a type for the expected prompt data
interface PromptData {
  title: string;
  prompt_content: string;
  model?: string;
  variables?: any; // Consider a more specific type if possible
  description?: string;
  tags?: string[];
  is_public?: boolean;
  version?: number;
}

export async function POST(request: Request) {
  const cookieStore = cookies();
  const supabase = createServerClient({ cookies: () => cookieStore });

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('Error fetching user or no user:', userError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      title, 
      prompt_content, 
      model, 
      variables, 
      description, 
      tags, 
      is_public = false, // Default to false if not provided
      version = 1        // Default to 1 if not provided
    } = body as PromptData;

    // Basic validation
    if (!title || !prompt_content) {
      return NextResponse.json({ error: 'Title and prompt content are required' }, { status: 400 });
    }

    const { data: newPrompt, error: insertError } = await supabase
      .from('prompts')
      .insert([{ 
        user_id: user.id, 
        title, 
        prompt_content, 
        model, 
        variables, 
        description, 
        tags, 
        is_public, 
        version 
      }])
      .select()
      .single(); // Assuming you want the created prompt back

    if (insertError) {
      console.error('Error inserting prompt:', insertError);
      return NextResponse.json({ error: 'Failed to create prompt', details: insertError.message }, { status: 500 });
    }

    return NextResponse.json(newPrompt, { status: 201 });

  } catch (error: any) {
    console.error('Error in POST /api/prompts:', error);
    // Check if it's a JSON parsing error
    if (error instanceof SyntaxError) {
        return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }
    return NextResponse.json({ error: 'An unexpected error occurred', details: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const cookieStore = cookies();
  const supabase = createServerClient({ cookies: () => cookieStore });

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('Error fetching user or no user for GET:', userError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: prompts, error: selectError } = await supabase
      .from('prompts')
      .select('*') // Select all columns for now
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (selectError) {
      console.error('Error fetching prompts:', selectError);
      return NextResponse.json({ error: 'Failed to fetch prompts', details: selectError.message }, { status: 500 });
    }

    return NextResponse.json(prompts, { status: 200 });

  } catch (error: any) {
    console.error('Error in GET /api/prompts:', error);
    return NextResponse.json({ error: 'An unexpected error occurred', details: error.message }, { status: 500 });
  }
} 