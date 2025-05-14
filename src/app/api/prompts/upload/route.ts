import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
// import { z } from 'zod'; // No longer needed here
import { promptSchema } from '../../../../lib/validators/promptValidator'; // Import shared schema

// Remove local promptSchema and AI_MODELS_FOR_API definitions

export async function POST(req: NextRequest) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        // We might need set and remove if the session needs refreshing during the request,
        // but for a simple POST, get should be sufficient if auth is already handled by middleware.
      },
    }
  );

  try {
    // 1. Get Authenticated User
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ message: 'Unauthorized: You must be logged in to upload a prompt.' }, { status: 401 });
    }

    // 2. Parse and Validate Request Body
    const body = await req.json();
    const validationResult = promptSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ message: 'Invalid request data', errors: validationResult.error.flatten().fieldErrors }, { status: 400 });
    }

    const { title, description, model, tags, price, promptContent } = validationResult.data;

    // 3. Prepare data for Supabase insertion
    // Assuming your 'prompts' table has columns: title, description, model, tags (jsonb or text[]), price (numeric), content, user_id
    // Adjust according to your actual schema. For `price`, store 0 if 'Free'.
    const priceInDb = price === 'Free' ? 0 : price;

    // We need to decide how to handle the `prompt_versions` and `marketplace_prompts` tables based on your schema.
    // For a first step, let's insert into a main `prompts` table.
    // We might also want to set `is_public` or `status` fields if they exist.

    const { data: promptData, error: insertError } = await supabase
      .from('prompts') // Make sure 'prompts' is your table name
      .insert({
        user_id: user.id,
        title,
        description,
        model_name: model, // Assuming your DB column is model_name
        tags, // Assuming Supabase can handle array of strings for a text[] or jsonb column
        price: priceInDb,
        content: promptContent, // Assuming your DB column for prompt text is content
        // team_id: null, // Or fetch user's default team if applicable
        // is_public: true, // Or based on user choice / default
        // status: 'active', // Or 'pending_review' etc.
      })
      .select() // Optionally select the inserted row to return it
      .single(); // Assuming you want to insert one and get it back

    if (insertError) {
      console.error('Supabase insert error:', insertError);
      return NextResponse.json({ message: 'Failed to save prompt to database.', error: insertError.message }, { status: 500 });
    }

    // TODO: Potentially insert into prompt_versions table here as well.
    // For example:
    // await supabase.from('prompt_versions').insert({ prompt_id: promptData.id, version_number: 1, content: promptContent, user_id: user.id });

    // TODO: Potentially insert into marketplace_prompts if it's immediately listed.
    // For example:
    // await supabase.from('marketplace_prompts').insert({ prompt_id: promptData.id, user_id: user.id, price: priceInDb, status: 'available' });

    return NextResponse.json({ message: 'Prompt uploaded successfully!', data: promptData }, { status: 201 });

  } catch (error: any) {
    console.error('API Route error:', error);
    // Check if it's a Zod error for a more specific message if parsing req.json() itself failed before Zod validation
    if (error.name === 'SyntaxError') { // Often occurs if req.json() fails
        return NextResponse.json({ message: 'Invalid JSON in request body' }, { status: 400 });
    }
    return NextResponse.json({ message: 'An unexpected error occurred.', error: error.message }, { status: 500 });
  }
} 