import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function PUT(request: NextRequest) {
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
          // If the cookie is updated, update the cookies for the request and response
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          // If the cookie is removed, update the cookies for the request and response
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );

  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('Error getting session:', sessionError);
      return NextResponse.json({ error: 'Failed to get session', details: sessionError.message }, { status: 500 });
    }

    if (!session?.user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    const { user } = session;
    let requestBody;
    try {
      requestBody = await request.json();
    } catch (e) {
      return NextResponse.json({ error: 'Invalid request body: Not JSON' }, { status: 400 });
    }
    
    const { username: newUsername } = requestBody;

    if (!newUsername || typeof newUsername !== 'string') {
      return NextResponse.json({ error: 'Username is required and must be a string' }, { status: 400 });
    }

    // Basic validation for username (matches signup page - should be kept in sync or centralized)
    if (newUsername.length < 3 || newUsername.length > 20) {
      return NextResponse.json({ error: 'Username must be between 3 and 20 characters' }, { status: 400 });
    }
    if (!/^[a-zA-Z0-9_]+$/.test(newUsername)) {
      return NextResponse.json({ error: 'Username can only contain alphanumeric characters and underscores' }, { status: 400 });
    }

    // Update the username in the profiles table
    const { data: updateData, error: updateError } = await supabase
      .from('profiles')
      .update({ username: newUsername })
      .eq('id', user.id)
      .select('id, username, plan') // Optionally return the updated profile
      .single(); // Use single if you expect only one row to be updated and want it back

    if (updateError) {
      console.error('Error updating profile:', updateError);
      // Check for unique constraint violation (e.g., username already taken)
      if (updateError.code === '23505') { // PostgreSQL unique violation error code
         return NextResponse.json({ error: 'Username already taken. Please choose another one.' }, { status: 409 }); // 409 Conflict
      }
      return NextResponse.json({ error: 'Failed to update profile', details: updateError.message }, { status: 500 });
    }

    if (!updateData) {
        return NextResponse.json({ error: 'Profile not found or failed to update (no data returned)' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Profile updated successfully', profile: updateData }, { status: 200 });

  } catch (error) {
    console.error('Unexpected error in PUT /api/profile:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ error: 'An unexpected server error occurred', details: errorMessage }, { status: 500 });
  }
} 