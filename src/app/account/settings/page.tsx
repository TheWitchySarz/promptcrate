'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../(contexts)/AuthContext';
import Navbar from '../../(components)/layout/Navbar';
import Footer from '../../(components)/shared/Footer';
import { Badge } from '@/components/ui/badge';
import { User, Mail, CreditCard, Settings, Save, Loader2 } from 'lucide-react';

export default function AccountSettingsPage() {
  const { user, userRole, username, refreshAuthStatus } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [fullName, setFullName] = useState('');
  const [usernameInput, setUsernameInput] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile');
      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
        setFullName(data.profile.full_name || '');
        setUsernameInput(data.profile.username || '');
      } else {
        setError('Failed to load profile');
      }
    } catch (err) {
      setError('Error loading profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          full_name: fullName,
          username: usernameInput,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setProfile(data.profile);
        setSuccess('Profile updated successfully!');
        // Refresh auth context to update username
        await refreshAuthStatus();
      } else {
        setError(data.error || 'Failed to update profile');
      }
    } catch (err) {
      setError('Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading your settings...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Settings className="mr-3 h-6 w-6" />
                  Account Settings
                </h1>
                {userRole && (
                  <Badge variant={userRole === 'admin' ? 'default' : userRole === 'pro' ? 'secondary' : 'outline'}>
                    {userRole.charAt(0).toUpperCase() + userRole.slice(1)} Plan
                  </Badge>
                )}
              </div>

              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {success && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-green-600 text-sm">{success}</p>
                </div>
              )}

              <div className="space-y-6">
                {/* Profile Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <User className="mr-2 h-5 w-5" />
                    Profile Information
                  </h3>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div>
                      <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                        Username
                      </label>
                      <input
                        type="text"
                        id="username"
                        value={usernameInput}
                        onChange={(e) => setUsernameInput(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
                        placeholder="Enter your username"
                        pattern="[a-zA-Z0-9_]{3,20}"
                        title="Username must be 3-20 characters long and can only contain letters, numbers, and underscores"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        3-20 characters, letters, numbers, and underscores only
                      </p>
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={user?.email || ''}
                        disabled
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Email cannot be changed from this page
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Current Plan
                      </label>
                      <div className="mt-1">
                        <Badge variant={userRole === 'admin' ? 'default' : userRole === 'pro' ? 'secondary' : 'outline'}>
                          {userRole?.charAt(0).toUpperCase()}{userRole?.slice(1)} Plan
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Quick Actions */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <a
                      href="/account/change-password"
                      className="inline-flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Settings className="mr-3 h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Change Password</p>
                        <p className="text-sm text-gray-500">Update your password</p>
                      </div>
                    </a>

                    <a
                      href="/account/billing"
                      className="inline-flex items-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <CreditCard className="mr-3 h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Billing & Subscription</p>
                        <p className="text-sm text-gray-500">Manage your plan and billing</p>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}