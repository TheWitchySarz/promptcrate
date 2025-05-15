'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/(contexts)/AuthContext';
import Navbar from '@/app/(components)/layout/Navbar';
import Footer from '@/app/(components)/shared/Footer';
import { ChevronRight, AlertTriangle, UserCircle, CreditCard, ShieldOff, Edit, Users, PlusCircle, Loader2 } from 'lucide-react';

const AccountSettingsPage = () => {
  const { user, username, userRole, isLoading: authLoading, isLoggedIn, signOut } = useAuth();
  const router = useRouter();

  // Real user email from context, or fallback
  const displayEmail = user?.email || 'Loading...';
  const displayUsername = username || (user ? 'Not set' : 'Loading...');

  // State for Team Creation
  const [teamName, setTeamName] = useState('');
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [teamCreationError, setTeamCreationError] = useState<string | null>(null);
  const [teamCreationSuccess, setTeamCreationSuccess] = useState<string | null>(null);

  // Placeholder actions (will be expanded)
  const handleCancelSubscription = async () => {
    if (window.confirm('Are you sure you want to cancel your subscription? This will downgrade you to the Free plan at the end of your current billing cycle.')) {
      // Placeholder: Actual cancellation logic will involve API call to backend/Stripe
      // and then updating user's plan in Supabase.
      // For now, just an alert. The user is NOT actually downgraded by this mock.
      alert('Subscription cancellation requested. Changes will reflect at the end of your billing cycle.');
      // Example: await cancelSubscriptionAPI(); // This would then trigger AuthContext update via onAuthStateChange or profile refresh
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
    } catch (error) {
      setTeamCreationError((error as Error).message);
    } finally {
      setIsCreatingTeam(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.push('/login?message=Please+log+in+to+view+account+settings.');
    }
  }, [authLoading, isLoggedIn, router]);

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
              
              <div className="flex flex-col sm:flex-row gap-3">
                {(userRole === 'free' || userRole === 'pro') && (
                  <Link
                    href="/#pricing"
                    className="w-full sm:w-auto justify-center inline-flex items-center px-5 py-2.5 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    {userRole === 'free' ? 'Upgrade to Pro' : 'Change Plan'}
                  </Link>
                )}
                {(userRole === 'pro' || userRole === 'enterprise') && (
                  <button
                    onClick={handleCancelSubscription}
                    className="w-full sm:w-auto justify-center inline-flex items-center px-5 py-2.5 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel Subscription
                  </button>
                )}
              </div>
              <button
                  onClick={handlePauseSubscription}
                  className="w-full sm:w-auto justify-center inline-flex items-center px-5 py-2.5 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Pause Subscription
              </button>
               <div>
                <Link href="/account/billing" className="text-sm text-purple-600 hover:text-purple-800 font-medium">
                    View Billing History
                </Link>
              </div>
            </div>
          </section>

          {/* Team Management Section - Only for Pro and Enterprise users */}
          {(userRole === 'pro' || userRole === 'enterprise') && (
            <section className="bg-white shadow-lg rounded-xl p-6 sm:p-8 mb-8">
              <h2 className="text-xl font-semibold text-gray-700 mb-6 flex items-center">
                <Users className="mr-3 text-purple-600" size={28} /> Team Management
              </h2>
              {/* TODO: Display list of existing teams here */}
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
};

export default AccountSettingsPage; 