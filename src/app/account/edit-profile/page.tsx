'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/(contexts)/AuthContext';
import Navbar from '@/app/(components)/layout/Navbar';
import Footer from '@/app/(components)/shared/Footer';
import { UserCircle, Save } from 'lucide-react';

const EditProfilePage = () => {
  const { user, username, userRole, isLoggedIn, isLoading: authLoading, signOut } = useAuth();
  const router = useRouter();

  const [editableUsername, setEditableUsername] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  
  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.push('/login?message=Please+log+in+to+edit+your+profile.');
    }
    if (username) {
      setEditableUsername(username);
    }
  }, [authLoading, isLoggedIn, router, username]);

  const displayEmail = user?.email || 'Loading...';

  if (authLoading || !isLoggedIn || !user) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow flex items-center justify-center bg-gray-100">
          <p>Loading user profile...</p>
        </main>
        <Footer />
      </div>
    );
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    setSaveSuccess(null);

    if (editableUsername.trim() === '') {
      setSaveError('Username cannot be empty.');
      return;
    }
    if (editableUsername === username) {
      setSaveError('No changes made to username.');
      return;
    }

    if (editableUsername.length < 3 || editableUsername.length > 20) {
      setSaveError('Username must be between 3 and 20 characters');
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(editableUsername)) {
      setSaveError('Username can only contain alphanumeric characters and underscores');
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: editableUsername })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update profile. Status: ' + response.status);
      }
      
      setSaveSuccess('Username updated successfully! The change will be reflected in your context soon.');
      console.log('Updated profile from API:', result.profile);

    } catch (error) {
      console.error('Error saving profile:', error);
      setSaveError((error as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navbar />
      <main className="flex-grow py-8 sm:py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-8 flex items-center">
              <UserCircle className="mr-3 text-purple-600" size={32} /> Edit Profile
            </h1>
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                <input 
                  type="email" 
                  id="email" 
                  value={displayEmail} 
                  disabled 
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-500 cursor-not-allowed sm:text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">Email address cannot be changed.</p>
              </div>
              <div>
                <label htmlFor="usernameEdit" className="block text-sm font-medium text-gray-700">Username</label>
                <input 
                  type="text" 
                  id="usernameEdit"
                  value={editableUsername}
                  onChange={(e) => {
                    setEditableUsername(e.target.value);
                    setSaveError(null);
                    setSaveSuccess(null);
                  }}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm text-gray-800"
                  placeholder="Enter your username"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Current Plan</label>
                <p className="mt-1 text-gray-800 capitalize sm:text-sm p-2 border border-gray-300 rounded-md bg-gray-50">
                  {userRole || 'N/A'}
                </p>
              </div>
              {saveError && (
                <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-md text-sm">
                  <p>{saveError}</p>
                </div>
              )}
              {saveSuccess && (
                <div className="p-3 bg-green-100 border border-green-300 text-green-700 rounded-md text-sm">
                  <p>{saveSuccess}</p>
                </div>
              )}
              <div className="flex justify-end pt-2">
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save size={18} className="mr-2" /> 
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EditProfilePage; 