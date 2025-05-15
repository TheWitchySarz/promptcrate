import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getServiceSupabase } from '@/lib/supabase'; // Assuming you have this for service role

// Define a type for the expected request body (e.g., team name)
interface CreateTeamRequestBody {
  name: string;
}

export async function POST(request: NextRequest) {
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
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );

  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      return NextResponse.json({ error: 'Failed to get session', details: sessionError.message }, { status: 500 });
    }
    if (!session?.user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    const { user } = session;

    // Fetch user's profile to check their plan
    const { data: profile, error: profileError } = await supabase
      .from('users') // Assuming your public user data is in 'users' table and has a 'plan' column
      .select('plan')
      .eq('id', user.id)
      .single();

    if (profileError) {
      return NextResponse.json({ error: 'Failed to fetch user profile', details: profileError.message }, { status: 500 });
    }
    if (!profile || (profile.plan !== 'pro' && profile.plan !== 'enterprise')) {
      return NextResponse.json({ error: 'User must have a Pro or Enterprise plan to create teams.' }, { status: 403 });
    }

    let requestBody: CreateTeamRequestBody;
    try {
      requestBody = await request.json();
    } catch (e) {
      return NextResponse.json({ error: 'Invalid request body: Not JSON' }, { status: 400 });
    }
    
    const { name: teamName } = requestBody;

    if (!teamName || typeof teamName !== 'string' || teamName.trim().length === 0) {
      return NextResponse.json({ error: 'Team name is required and must be a non-empty string' }, { status: 400 });
    }

    // Use a service role client for operations that bypass RLS or require elevated privileges if necessary
    // For creating a team and linking the owner, the user's own session *should* be sufficient if RLS is set up correctly.
    // However, if inserting into team_users for the owner needs to bypass RLS that might prevent it, use service client.
    // For now, let's try with the user's client and see if RLS allows it.

    // Create the team
    const { data: newTeam, error: createTeamError } = await supabase
      .from('teams')
      .insert({
        name: teamName.trim(),
        owner_id: user.id,
        plan: profile.plan // Assign the owner's plan to the team, or a default like 'free' if teams have their own independent plans
      })
      .select()
      .single();

    if (createTeamError) {
      return NextResponse.json({ error: 'Failed to create team', details: createTeamError.message }, { status: 500 });
    }
    if (!newTeam) {
      return NextResponse.json({ error: 'Failed to create team, no data returned.' }, { status: 500 });
    }

    // Add the creator as the owner in team_users table
    const { error: addOwnerError } = await supabase
      .from('team_users')
      .insert({
        team_id: newTeam.id,
        user_id: user.id,
        role: 'owner' // from team_role enum
      });

    if (addOwnerError) {
      // Attempt to clean up: delete the team if adding owner fails
      // This requires a service client or specific RLS to allow user to delete team they just created if this step fails.
      console.warn(`Failed to add owner to team_users for team ${newTeam.id}. Attempting to delete team. Error: ${addOwnerError.message}`);
      const serviceSupabase = getServiceSupabase();
      await serviceSupabase.from('teams').delete().eq('id', newTeam.id);
      return NextResponse.json({ error: 'Failed to set team owner, team creation rolled back.', details: addOwnerError.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Team created successfully', team: newTeam }, { status: 201 });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ error: 'An unexpected server error occurred', details: errorMessage }, { status: 500 });
  }
} 