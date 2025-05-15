'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client'; // Corrected path based on where we created it

// Type for user plan, e.g., 'free', 'pro'. Could be extended.
type UserPlan = 'free' | 'pro' | 'enterprise' | null; // Refined to specific plan strings

interface AuthContextType {
  isLoading: boolean;
  isLoggedIn: boolean;
  user: SupabaseUser | null;
  username: string | null;
  userRole: UserPlan; // Changed from UserRole to UserPlan for clarity, stores the plan string
  signUpWithEmail: (email: string, password: string, username: string) => Promise<any>; // Added username to signature
  signInWithEmail: (email: string, password: string) => Promise<any>;
  signInWithGoogle: () => Promise<any>;
  signOut: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userRole, setUserRole] = useState<UserPlan>(null); // Stores the user's plan
  const [username, setUsername] = useState<string | null>(null); // Added username state

  useEffect(() => {
    const fetchUserProfileAndSetState = async (currentUser: SupabaseUser | null) => {
      // Ensure isLoading is true if we are about to fetch profile data
      // This is important if this function is called directly or by an event
      // and we need to show a loading state.
      // However, the main setIsLoading(true) should be at the start of an auth flow.
      // setIsLoading(true); // Consider if needed here or if callers handle it.

      if (currentUser) {
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('plan, username') // Fetch username along with plan
            .eq('id', currentUser.id)
            .single();

          if (error) {
            console.error('Error fetching user profile:', error);
            setUserRole('free'); // Default to 'free' on error or if profile not found
            setUsername(null);
          } else if (profile && profile.plan) {
            setUserRole(profile.plan as UserPlan); // Cast to UserPlan
            setUsername(profile.username as string | null);
          } else {
            console.warn('User profile not found or plan is missing, defaulting to free plan and null username.');
            setUserRole('free'); // Default if profile somehow doesn't exist or plan is null
            setUsername(null);
          }
        } catch (e) {
          console.error('Exception fetching user profile:', e);
          setUserRole('free');
          setUsername(null);
        }
      } else {
        setUserRole(null);
        setUsername(null);
      }
      // This is the most reliable place to set isLoading to false,
      // after user state and profile are processed.
      setIsLoading(false); 
    };

    const getSessionAndProfile = async () => {
      setIsLoading(true); // Start loading
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      // fetchUserProfileAndSetState will set isLoading to false
      await fetchUserProfileAndSetState(session?.user ?? null);
    };

    getSessionAndProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      const newSupabaseUser = session?.user ?? null;
      const oldSupabaseUser = user; // Capture user state before updating

      setUser(newSupabaseUser); // Update user state immediately

      // Determine if a full loading cycle (including profile fetch) is needed
      let needsProfileFetchAndLoadingCycle = false;

      if (event === 'SIGNED_IN') {
        needsProfileFetchAndLoadingCycle = true;
      } else if (event === 'SIGNED_OUT') {
        setUserRole(null);
        setUsername(null);
        setIsLoading(false); // Definitely not loading, and no profile to fetch
      } else if (event === 'USER_UPDATED') {
        needsProfileFetchAndLoadingCycle = true; // User data changed, refresh profile
      } else if (event === 'INITIAL_SESSION') {
        // For initial session, getSessionAndProfile has already run or is running.
        // This event mainly confirms the initial state.
        if (!newSupabaseUser) {
          setUserRole(null);
          setUsername(null);
          setIsLoading(false);
        } else {
          // If there is a user from INITIAL_SESSION, getSessionAndProfile covers it.
          // If user state changes from null to an actual user here (e.g. race condition with getSessionAndProfile),
          // ensure profile is fetched and loading state is handled.
          if (!oldSupabaseUser && newSupabaseUser) {
            needsProfileFetchAndLoadingCycle = true;
          }
          // If user already existed or no change, getSessionAndProfile's call to 
          // fetchUserProfileAndSetState will handle setting isLoading to false.
          // If it's already false, this event doesn't need to change it unless a load is triggered.
        }
      }
      // Other events like TOKEN_REFRESHED, PASSWORD_RECOVERY are not explicitly handled here for isLoading cycles
      // unless they trigger a USER_UPDATED or SIGNED_IN/OUT implicitly.
      // If they change the user object, USER_UPDATED should ideally fire.

      if (needsProfileFetchAndLoadingCycle && newSupabaseUser) {
        setIsLoading(true);
        await fetchUserProfileAndSetState(newSupabaseUser); // This will set isLoading(false)
      } else if (needsProfileFetchAndLoadingCycle && !newSupabaseUser) {
        // This case (e.g. SIGNED_IN event but session.user is null) should be rare.
        // Or if USER_UPDATED results in a null user.
        setUserRole(null);
        setUsername(null);
        setIsLoading(false);
      }
      // If no specific loading cycle was explicitly started by this event handler, 
      // the isLoading state relies on the completion of getSessionAndProfile or 
      // a previous event's fetchUserProfileAndSetState.
    });

    return () => {
      authListener.subscription?.unsubscribe();
    };
  }, [supabase]); // supabase is stable, so this effect runs once on mount and cleans up on unmount.

  const isLoggedIn = !!user;

  const signUpWithEmail = async (email: string, password: string, username: string) => {
    setIsLoading(true); // Indicate loading has started
    const response = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
        }
      }
    });
    // onAuthStateChange listener will handle setting user, profile, and ultimately setIsLoading(false)
    if (response.error) { 
        console.error("Sign up error:", response.error);
        setIsLoading(false); // If sign-up itself errors, stop loading
    }
    return response;
  };

  const signInWithEmail = async (email: string, password: string) => {
    setIsLoading(true); // Indicate loading has started
    const response = await supabase.auth.signInWithPassword({ email, password });
    // onAuthStateChange listener will handle setting user, profile, and ultimately setIsLoading(false)
    if (response.error) {
        console.error("Sign in error:", response.error);
        setIsLoading(false); // If sign-in itself errors, stop loading
    }
    return response;
  };

  const signInWithGoogle = async () => {
    setIsLoading(true); // Indicate loading has started
    const response = await supabase.auth.signInWithOAuth({ provider: 'google' });
    // After redirection, onAuthStateChange will handle session and profile, then set isLoading(false).
    // If there's an immediate error before redirect:
    if (response.error) {
        console.error("Google sign in error:", response.error);
        setIsLoading(false);
    }
    return response;
  };

  const signOut = async () => {
    setIsLoading(true); // Indicate loading has started
    const response = await supabase.auth.signOut();
    // onAuthStateChange listener will handle clearing user, profile, and setting setIsLoading(false) for SIGNED_OUT event
    if (response.error) {
        console.error("Sign out error:", response.error);
        setIsLoading(false); // If sign-out itself errors, stop loading
    }
    return response;
  };

  return (
    <AuthContext.Provider value={{
      isLoading,
      isLoggedIn,
      user,
      username,
      userRole,
      signUpWithEmail,
      signInWithEmail,
      signInWithGoogle,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 