'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client'; // Corrected path based on where we created it

// Type for user plan, e.g., 'free', 'pro'. Could be extended.
type UserPlan = 'free' | 'pro' | 'enterprise' | 'admin' | null; // Refined to specific plan strings

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
  refreshAuthStatus: () => Promise<void>; // Add this method to the interface
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userRole, setUserRole] = useState<UserPlan>(null); // Stores the user's plan
  const [username, setUsername] = useState<string | null>(null); // Added username state

  const getUserRole = (user: any, profile: any): UserPlan => {
    console.log('Getting user role for:', user?.id);
    console.log('User metadata:', user?.user_metadata);
    console.log('Profile data:', profile);

    // For annalealayton@gmail.com, always return admin (highest priority)
    if (user?.email === 'annalealayton@gmail.com') {
      console.log('Force admin role for annalealayton@gmail.com');
      return 'admin';
    }

    // Check user metadata first (most reliable)
    if (user?.user_metadata?.role === 'admin') {
      console.log('Using admin role from user metadata');
      return 'admin';
    }

    // Check profile plan as backup
    if (profile?.plan === 'admin') {
      console.log('Using admin role from profile plan');
      return 'admin';
    }

    console.log('Defaulting to free role');
    return 'free';
  };

  const createUserProfile = async (user: any) => {
    try {
      console.log('Creating profile for user:', user.id, user.email);

      // Determine user plan based on email and metadata
      let userPlan = 'basic';
      if (user.email === 'annalealayton@gmail.com' || user.user_metadata?.role === 'admin') {
        userPlan = 'admin';
      }

      const profileData = {
        id: user.id,
        email: user.email,
        username: user.user_metadata?.username || user.email?.split('@')[0] || 'user',
        full_name: user.user_metadata?.full_name || user.user_metadata?.username || user.email?.split('@')[0] || 'User',
        plan: userPlan,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('Creating profile with data:', profileData);

      const { data, error } = await supabase
        .from('profiles')
        .upsert(profileData, {
          onConflict: 'id'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        // Don't throw error, return basic profile data
        return {
          id: user.id,
          email: user.email,
          username: user.email?.split('@')[0] || 'user',
          full_name: user.email?.split('@')[0] || 'User',
          plan: userPlan
        };
      }

      console.log('Profile created successfully:', data);
      return data;
    } catch (error) {
      console.error('Failed to create profile:', error);
      // Return basic profile data even if creation fails
      return {
        id: user.id,
        email: user.email,
        username: user.email?.split('@')[0] || 'user',
        full_name: user.email?.split('@')[0] || 'User',
        plan: user.email === 'annalealayton@gmail.com' ? 'admin' : 'basic'
      };
    }
  };

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);

      // First try to get the profile with proper error handling
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle(); // Use maybeSingle instead of single to avoid throwing on no results

      if (error) {
        console.error('Error fetching profile:', error);
        // Don't set role to null - determine from user metadata
        const currentUser = user || (await supabase.auth.getUser()).data.user;
        if (currentUser) {
          const adminRole = getUserRole(currentUser, null);
          console.log('Using fallback role after profile error:', adminRole);
          setUserRole(adminRole);
          setUsername(currentUser.email?.split('@')[0] || null);
        }
        return;
      }

      if (!profile) {
        console.log('No profile found for user:', userId);
        // Get current user and determine role from metadata
        const currentUser = user || (await supabase.auth.getUser()).data.user;
        if (currentUser) {
          const adminRole = getUserRole(currentUser, null);
          console.log('Using role from user metadata (no profile):', adminRole);
          setUserRole(adminRole);
          setUsername(currentUser.email?.split('@')[0] || null);
          
          // Try to create profile for future use
          try {
            const profileData = {
              id: currentUser.id,
              email: currentUser.email,
              username: currentUser.email?.split('@')[0] || 'user',
              full_name: currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || 'User',
              plan: adminRole,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            
            console.log('Creating missing profile:', profileData);
            await supabase.from('profiles').upsert(profileData, { onConflict: 'id' });
          } catch (createError) {
            console.error('Failed to create profile:', createError);
          }
        }
        return;
      }

      console.log('Profile fetched successfully:', profile);
      setUserRole(profile.plan as UserPlan);
      setUsername(profile.username as string | null);

    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      // Don't set role to null - determine from user metadata as fallback
      const currentUser = user || (await supabase.auth.getUser()).data.user;
      if (currentUser) {
        const adminRole = getUserRole(currentUser, null);
        console.log('Using fallback role after fetch error:', adminRole);
        setUserRole(adminRole);
        setUsername(currentUser.email?.split('@')[0] || null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Add refreshAuthStatus function to allow refreshing profile data
  const refreshAuthStatus = async () => {
    console.log('Refreshing auth status...');
    setIsLoading(true);
    // Get the current session and user
    const { data: { session } } = await supabase.auth.getSession();
    const currentUser = session?.user ?? null;

    // If there's a user, fetch their updated profile information
    if (currentUser) {
      await fetchUserProfile(currentUser.id);
      console.log('Auth status refreshed.');
    } else {
      setUserRole(null);
      setUsername(null);
      setIsLoading(false);
      console.log('No user found during refresh.');
    }
  };

  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!mounted) return;

        if (user) {
          console.log('User found:', user.id, user.email);

          // Get or create profile
          // let userProfile = null;

          // try {
          //   const { data: profile, error: profileError } = await supabase
          //     .from('profiles')
          //     .select('*')
          //     .eq('id', user.id)
          //     .maybeSingle();

          //   if (profileError && profileError.code !== 'PGRST116') {
          //     console.error('Error fetching profile:', profileError);
          //     userProfile = await createUserProfile(user);
          //   } else if (!profile) {
          //     console.log('No profile found, creating...');
          //     userProfile = await createUserProfile(user);
          //   } else {
          //     userProfile = profile;
          //   }
          // } catch (error) {
          //   console.error('Error with profile:', error);
          //   userProfile = await createUserProfile(user);
          // }

          // const role = getUserRole(user, userProfile);
          // console.log('Current user role:', role);
          // console.log('Is logged in:', true);
          // console.log('User:', user.email);

          setUser(user);
          // setUserRole(role);
          // setUsername(userProfile?.username || user.email?.split('@')[0] || null);
          await fetchUserProfile(user.id);
        } else {
          console.log('Current user role:', null);
          console.log('Is logged in:', false);
          setUser(null);
          setUserRole(null);
          setUsername(null);
        }
      } catch (error) {
        console.error('Error loading user:', error);
        setUser(null);
        setUserRole(null);
        setUsername(null);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log('Auth state changed:', event, session?.user?.email);

      if (event === 'SIGNED_IN' && session?.user) {
        console.log('User signed in:', session?.user?.id, session?.user?.email);
        setUser(session.user);

        // Determine role immediately using getUserRole function
        const immediateRole = getUserRole(session.user, null);
        console.log('Setting immediate role:', immediateRole);
        setUserRole(immediateRole);

        // Fetch profile to update with any additional data, but don't let it override admin role
        await fetchUserProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
        setUser(null);
        setUserRole(null);
        setUsername(null);
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

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
      signOut,
      refreshAuthStatus
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