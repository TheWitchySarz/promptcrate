import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

interface PromptUpdateData {
  title?: string;
  prompt_content?: string;
  model?: string;
  variables?: any; 
  description?: string;
  tags?: string[];
  is_public?: boolean;
  version?: number;
}

// GET a specific prompt
export async function GET(request: Request, { params }: { params: { promptId: string } }) {
  const { promptId } = params;
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set(name, value, options);
          } catch (error) {
            // Server Components might not be able to set cookies. Middleware handles session refresh.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set(name, '', options); // Or cookieStore.delete(name, options) if available and preferred
          } catch (error) {
            // Server Components might not be able to delete cookies. Middleware handles session refresh.
          }
        },
      },
    }
  );

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: prompt, error: selectError } = await supabase
      .from('prompts')
      .select('*')
      .eq('id', promptId)
      .eq('user_id', user.id)
      .single();

    if (selectError) {
      if (selectError.code === 'PGRST116') { // PostgREST error code for no rows found
        return NextResponse.json({ error: 'Prompt not found or access denied' }, { status: 404 });
      }
      console.error('Error fetching prompt:', selectError);
      return NextResponse.json({ error: 'Failed to fetch prompt', details: selectError.message }, { status: 500 });
    }

    if (!prompt) {
        return NextResponse.json({ error: 'Prompt not found or access denied' }, { status: 404 });
    }

    return NextResponse.json(prompt, { status: 200 });

  } catch (error: any) {
    console.error(`Error in GET /api/prompts/${promptId}:`, error);
    return NextResponse.json({ error: 'An unexpected error occurred', details: error.message }, { status: 500 });
  }
}

// UPDATE a specific prompt
export async function PUT(request: Request, { params }: { params: { promptId: string } }) {
  const { promptId } = params;
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set(name, value, options);
          } catch (error) {
            // Server Components might not be able to set cookies. Middleware handles session refresh.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set(name, '', options);
          } catch (error) {
            // Server Components might not be able to delete cookies. Middleware handles session refresh.
          }
        },
      },
    }
  );

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json() as PromptUpdateData;

    // Construct an update object with only the fields present in the body
    const updateData: { [key: string]: any } = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.prompt_content !== undefined) updateData.prompt_content = body.prompt_content;
    if (body.model !== undefined) updateData.model = body.model;
    if (body.variables !== undefined) updateData.variables = body.variables;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.tags !== undefined) updateData.tags = body.tags;
    if (body.is_public !== undefined) updateData.is_public = body.is_public;
    if (body.version !== undefined) updateData.version = body.version;
    
    // Ensure at least one field is being updated
    if (Object.keys(updateData).length === 0) {
        return NextResponse.json({ error: 'No update data provided' }, { status: 400 });
    }
    
    // Add updated_at manually for PUT requests
    updateData.updated_at = new Date().toISOString();

    const { data: updatedPrompt, error: updateError } = await supabase
      .from('prompts')
      .update(updateData)
      .eq('id', promptId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      if (updateError.code === 'PGRST116') { // Not found or no rows updated
        return NextResponse.json({ error: 'Prompt not found, access denied, or no changes made' }, { status: 404 });
      }
      console.error('Error updating prompt:', updateError);
      return NextResponse.json({ error: 'Failed to update prompt', details: updateError.message }, { status: 500 });
    }
    
    if (!updatedPrompt) { // Should be caught by PGRST116, but as a safeguard
        return NextResponse.json({ error: 'Prompt not found or access denied after update attempt' }, { status: 404 });
    }

    return NextResponse.json(updatedPrompt, { status: 200 });

  } catch (error: any) {
    console.error(`Error in PUT /api/prompts/${promptId}:`, error);
    if (error instanceof SyntaxError) {
        return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }
    return NextResponse.json({ error: 'An unexpected error occurred', details: error.message }, { status: 500 });
  }
}

// DELETE a specific prompt
export async function DELETE(request: Request, { params }: { params: { promptId: string } }) {
  const { promptId } = params;
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set(name, value, options);
          } catch (error) {
            // Server Components might not be able to set cookies. Middleware handles session refresh.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set(name, '', options);
          } catch (error) {
            // Server Components might not be able to delete cookies. Middleware handles session refresh.
          }
        },
      },
    }
  );

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error: deleteError, count } = await supabase
      .from('prompts')
      .delete({ count: 'exact' })
      .eq('id', promptId)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Error deleting prompt:', deleteError);
      return NextResponse.json({ error: 'Failed to delete prompt', details: deleteError.message }, { status: 500 });
    }

    if (count === 0) {
      return NextResponse.json({ error: 'Prompt not found or access denied' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Prompt deleted successfully' }, { status: 200 }); // Or 204 No Content

  } catch (error: any) {
    console.error(`Error in DELETE /api/prompts/${promptId}:`, error);
    return NextResponse.json({ error: 'An unexpected error occurred', details: error.message }, { status: 500 });
  }
} 