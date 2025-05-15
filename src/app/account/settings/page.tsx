'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/(contexts)/AuthContext';
import Navbar from '@/app/(components)/layout/Navbar';
import Footer from '@/app/(components)/shared/Footer';
import { ChevronRight, AlertTriangle, UserCircle, CreditCard, ShieldOff, Edit, Users, PlusCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

// Define Team interface based on API response
interface TeamOwner {
  id: string;
  email: string;
  username: string | null;
}

interface Team {
  id: string;
  name: string;
  created_at: string;
  plan: string; // Plan of the team itself
  owner_id: string;
  users: TeamOwner; // Renamed from 'owner' in previous thoughts to match Supabase relation name from API
  user_team_role: string | null; // User's role in this specific team
}

// Helper component to use useSearchParams
function AccountSettingsContent() {
  const { user, username, userRole, isLoading: authLoading, isLoggedIn, signOut, refreshAuthStatus } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Real user email from context, or fallback
  const displayEmail = user?.email || 'Loading...';
  const displayUsername = username || (user ? 'Not set' : 'Loading...');

  // State for Team Creation
  const [teamName, setTeamName] = useState('');
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [teamCreationError, setTeamCreationError] = useState<string | null>(null);
  const [teamCreationSuccess, setTeamCreationSuccess] = useState<string | null>(null);

  // State for Teams List
  const [teams, setTeams] = useState<Team[]>([]); // Use the new Team interface
  const [isLoadingTeams, setIsLoadingTeams] = useState(false);
  const [fetchTeamsError, setFetchTeamsError] = useState<string | null>(null);

  // State for Stripe Checkout
  const [isRedirectingToCheckout, setIsRedirectingToCheckout] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Fetch teams function
  const fetchTeams = async () => {
    if (!user || !(userRole === 'pro' || userRole === 'enterprise')) {
      setTeams([]);
      return;
    }
    setIsLoadingTeams(true);
    setFetchTeamsError(null);
    try {
      const response = await fetch('/api/teams');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch teams');
      }
      const data = await response.json();
      setTeams(data || []); // API returns array directly
    } catch (error) {
      setFetchTeamsError((error as Error).message);
      setTeams([]);
    } finally {
      setIsLoadingTeams(false);
    }
  };

  const handleUpgradeToProClick = async () => {
    setIsRedirectingToCheckout(true);
    setCheckoutError(null);
    try {
      const response = await fetch('/api/stripe/checkout-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create checkout session.');
      if (data.url) router.push(data.url);
      else throw new Error('No checkout URL received.');
    } catch (error) {
      console.error("Error redirecting to Stripe Checkout:", error);
      setCheckoutError((error as Error).message);
      setIsRedirectingToCheckout(false);
    }
  };

  // Placeholder actions (will be expanded)
  const handleCancelSubscription = async () => {
    if (window.confirm('Are you sure you want to cancel your subscription? This will downgrade you to the Free plan at the end of your current billing cycle.')) {
      alert('Subscription cancellation requested. Actual cancellation API to be implemented.');
      // Example: await cancelSubscriptionAPI(); 
      // refreshAuthStatus(); // After backend confirms cancellation and plan update via webhook
    }
  };

  const handlePauseSubscription = () => {
    alert('To pause your subscription, please contact support at support@promptcrate.com');
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action is irreversible and will remove all your data.')) {
      if (window.confirm('FINAL CONFIRMATION: Delete account? This cannot be undone.')) {
        // Placeholder: Actual account deletion will involve backend API calls
        // For now, sign out the user and redirect.
        try {
          // await deleteAccountAPI(); // Call to backend to delete user data from DB
          await signOut();
          router.push('/?message=Account+deleted+successfully');
          // alert('Your account has been deleted.'); // Alert after redirect might not be ideal
        } catch (error) {
          console.error("Error deleting account or signing out:", error);
          alert("There was an error deleting your account. Please try again.");
        }
      }
    }
  };

  const handleCreateTeam = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!teamName.trim()) {
      setTeamCreationError('Team name cannot be empty.');
      setTeamCreationSuccess(null);
      return;
    }
    setIsCreatingTeam(true);
    setTeamCreationError(null);
    setTeamCreationSuccess(null);

    try {
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: teamName.trim() }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create team');
      }
      setTeamCreationSuccess(`Team '${result.team.name}' created successfully!`);
      setTeamName(''); // Clear input
      // TODO: Optionally, refresh a list of teams displayed on this page (e.g., by fetching teams again)
      fetchTeams(); // Refresh teams list
    } catch (error) {
      setTeamCreationError((error as Error).message);
    } finally {
      setIsCreatingTeam(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.push('/login?message=Please+log+in+to+view+account+settings.');
    } else if (isLoggedIn) {
      if (userRole === 'pro' || userRole === 'enterprise') {
        fetchTeams();
      }
      // Handle Stripe checkout success notification
      if (searchParams.get('stripe_checkout') === 'success') {
        toast.success("Upgrade successful! Pro features are now unlocked.", { duration: 6000 });
        if (typeof refreshAuthStatus === 'function') {
            refreshAuthStatus(); // Refresh context to get new userRole
        } else {
            console.warn("AuthContext does not have refreshAuthStatus, attempting router.refresh() as fallback.")
            router.refresh(); // Next.js router function to re-fetch data for the current route
        }
        // Clean the URL
        router.replace('/account/settings', { scroll: false }); 
      }
    }
  }, [authLoading, isLoggedIn, router, userRole, searchParams, refreshAuthStatus]); // Added dependencies

  if (authLoading || !isLoggedIn) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow flex items-center justify-center bg-gray-100">
          <p className="text-gray-700">Loading account settings...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navbar />
      <main className="flex-grow py-8 sm:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-8 sm:mb-10">Account Settings</h1>

          {/* Profile Information Section */}
          <section className="bg-white shadow-lg rounded-xl p-6 sm:p-8 mb-8">
            <h2 className="text-xl font-semibold text-gray-700 mb-6 flex items-center">
              <UserCircle className="mr-3 text-purple-600" size={28} /> Profile Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Username</label>
                <p className="text-lg text-gray-800">{displayUsername}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Email Address</label>
                <p className="text-lg text-gray-800">{displayEmail}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Current Plan</label>
                <p className="text-lg text-gray-800 font-semibold capitalize">{userRole || 'N/A'}</p>
              </div>
               <Link href="/account/edit-profile" 
                  className="mt-2 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Edit size={16} className="mr-2"/> Edit Profile
                </Link>
            </div>
          </section>

          {/* Subscription Management Section */}
          <section className="bg-white shadow-lg rounded-xl p-6 sm:p-8 mb-8">
            <h2 className="text-xl font-semibold text-gray-700 mb-6 flex items-center">
              <CreditCard className="mr-3 text-purple-600" size={28} /> Subscription Management
            </h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-500">Your Current Plan</label>
                <p className="text-lg text-gray-800 font-semibold capitalize">{userRole || 'N/A'}</p>
              </div>
              
              {checkoutError && (
                <div className="rounded-md bg-red-50 p-4 my-3">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertTriangle className="h-5 w-5 text-red-400" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Checkout Error</h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>{checkoutError}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                {(userRole === 'free' || userRole === null ) && (
                  <button
                    onClick={handleUpgradeToProClick}
                    disabled={isRedirectingToCheckout}
                    className="w-full sm:w-auto justify-center inline-flex items-center px-5 py-2.5 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-70"
                  >
                    {isRedirectingToCheckout ? (
                      <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Processing...</>
                    ) : (
                       'Upgrade to Pro'
                    )}
                  </button>
                )}
                {(userRole === 'pro' || userRole === 'enterprise') && (
                  <>
                    <button
                      onClick={handleCancelSubscription} 
                      className="w-full sm:w-auto justify-center inline-flex items-center px-5 py-2.5 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Cancel Subscription
                    </button>
                    {/* <button 
                      onClick={() => router.push('/#pricing')} 
                      className="w-full sm:w-auto justify-center inline-flex items-center px-5 py-2.5 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Change Plan (to #pricing)
                    </button> */}
                     <button 
                        onClick={handlePauseSubscription}
                        className="w-full sm:w-auto justify-center inline-flex items-center px-5 py-2.5 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                        >
                        Pause Subscription
                    </button>
                  </>
                )}
              </div>
              {userRole === 'pro' && (
                <p className="text-sm text-gray-500 mt-2"></p>
              )}
              {userRole === 'enterprise' && (
                <p className="text-sm text-gray-500 mt-2">You are on the Enterprise plan. Contact your account manager for changes.</p>
              )}
            </div>
          </section>

          {/* Team Management Section - Only for Pro and Enterprise users */}
          {(userRole === 'pro' || userRole === 'enterprise') && (
            <section className="bg-white shadow-lg rounded-xl p-6 sm:p-8 mb-8">
              <h2 className="text-xl font-semibold text-gray-700 mb-6 flex items-center">
                <Users className="mr-3 text-purple-600" size={28} /> Team Management
              </h2>
              {/* TODO: Display list of existing teams here */}
              {isLoadingTeams && <p className="text-gray-600">Loading your teams...</p>}
              {fetchTeamsError && <p className="text-sm text-red-600">Error loading teams: {fetchTeamsError}</p>}
              {!isLoadingTeams && !fetchTeamsError && teams.length === 0 && (userRole === 'pro' || userRole === 'enterprise') && (
                <p className="text-gray-600 mb-6">You are not part of any teams yet. Create one below!</p>
              )}
              {!isLoadingTeams && !fetchTeamsError && teams.length > 0 && (
                <div className="mb-8 space-y-4">
                  <h3 className="text-lg font-medium text-gray-800">Your Teams:</h3>
                  <ul className="divide-y divide-gray-200 rounded-md border border-gray-200">
                    {teams.map((team) => (
                      <li key={team.id} className="p-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-md font-semibold text-purple-700">{team.name}</p>
                            <p className="text-sm text-gray-600">
                              Your role: <span className="font-medium capitalize">{team.user_team_role || 'Member'}</span>
                            </p>
                          </div>
                          <div className="text-right">
                             <p className="text-sm text-gray-500">Owner: {team.users?.email || 'N/A'}</p>
                             <p className="text-xs text-gray-400">Plan: <span className="capitalize">{team.plan}</span></p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-800 mb-3">Create New Team</h3>
                <form onSubmit={handleCreateTeam} className="space-y-4">
                  <div>
                    <label htmlFor="teamName" className="block text-sm font-medium text-gray-700">Team Name</label>
                    <input 
                      type="text" 
                      id="teamName" 
                      value={teamName}
                      onChange={(e) => {
                        setTeamName(e.target.value);
                        setTeamCreationError(null); // Clear error when user types
                        setTeamCreationSuccess(null); // Clear success when user types
                      }}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm text-gray-800"
                      placeholder="Enter new team name"
                      disabled={isCreatingTeam}
                    />
                  </div>
                  {teamCreationError && <p className="text-sm text-red-600">{teamCreationError}</p>}
                  {teamCreationSuccess && <p className="text-sm text-green-600">{teamCreationSuccess}</p>}
                  <button 
                    type="submit" 
                    disabled={isCreatingTeam || !teamName.trim()}
                    className="inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCreatingTeam ? (
                      <><Loader2 className="mr-2 h-5 w-5 animate-spin" />Creating...</>
                    ) : (
                      <><PlusCircle size={18} className="mr-2" /> Create Team</>
                    )}
                  </button>
                </form>
              </div>
            </section>
          )}

          {/* Account Actions Section */}
          <section className="bg-white shadow-lg rounded-xl p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-gray-700 mb-6 flex items-center">
              <ShieldOff className="mr-3 text-red-500" size={28} /> Account Actions
            </h2>
            <div className="space-y-4">
                <Link href="/account/change-password" 
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mb-4"
                >
                  Change Password
                </Link>
              <div>
                <h3 className="text-md font-medium text-gray-800 mb-1">Delete Your Account</h3>
                <p className="text-sm text-gray-500 mb-3">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
                <button
                  onClick={handleDeleteAccount}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  <AlertTriangle size={16} className="mr-2" /> Delete Account
                </button>
              </div>
            </div>
          </section>

        </div>
      </main>
      <Footer />
    </div>
  );
}

// Wrap AccountSettingsContent with Suspense for useSearchParams
const AccountSettingsPage = () => {
  return (
    <Suspense fallback={ <div className="flex flex-col min-h-screen"><Navbar /><main className="flex-grow flex items-center justify-center bg-gray-100"><p className="text-gray-700">Loading account settings...</p></main><Footer /></div> }>
      <AccountSettingsContent />
    </Suspense>
  );
};

export default AccountSettingsPage; 