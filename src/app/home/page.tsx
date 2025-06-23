
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../(contexts)/AuthContext';
import Navbar from '../(components)/layout/Navbar';
import Footer from '../(components)/shared/Footer';
import { 
  User, 
  Mail, 
  Calendar, 
  Settings, 
  CreditCard, 
  FileText, 
  Edit,
  Shield,
  Crown
} from 'lucide-react';

interface ActivityItem {
  action: string;
  name: string;
  date: string;
}

interface UserStats {
  totalPrompts: number;
  favoritePrompts: number;
  recentActivity: ActivityItem[];
}

export default function HomePage() {
  const { user, userRole, username, isLoading, isLoggedIn } = useAuth();
  const router = useRouter();
  const [userStats, setUserStats] = useState<UserStats>({
    totalPrompts: 0,
    favoritePrompts: 0,
    recentActivity: []
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push('/login');
    }
  }, [isLoading, isLoggedIn, router]);

  // Fetch user stats
  useEffect(() => {
    if (isLoggedIn) {
      fetchUserStats();
    }
  }, [isLoggedIn]);

  const fetchUserStats = async () => {
    try {
      // You can implement this API endpoint to get user-specific stats
      // For now, we'll use placeholder data
      setUserStats({
        totalPrompts: 12,
        favoritePrompts: 5,
        recentActivity: [
          { action: 'Created prompt', name: 'Marketing Copy Generator', date: '2 hours ago' },
          { action: 'Favorited prompt', name: 'Code Review Assistant', date: '1 day ago' },
          { action: 'Updated profile', name: 'Profile settings', date: '3 days ago' }
        ]
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const getPlanBadge = () => {
    const plans = {
      free: { text: 'Free', color: 'bg-gray-100 text-gray-800', icon: User },
      pro: { text: 'Pro', color: 'bg-blue-100 text-blue-800', icon: Crown },
      enterprise: { text: 'Enterprise', color: 'bg-purple-100 text-purple-800', icon: Crown },
      admin: { text: 'Admin', color: 'bg-red-100 text-red-800', icon: Shield }
    };
    
    const plan = plans[userRole as keyof typeof plans] || plans.free;
    const IconComponent = plan.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${plan.color}`}>
        <IconComponent className="h-3 w-3 mr-1" />
        {plan.text}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your dashboard...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isLoggedIn) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Header */}
          <div className="mb-8">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Welcome back, {username || user?.email?.split('@')[0] || 'User'}!
                  </h1>
                  <p className="mt-1 text-gray-600">Here's what's happening with your account</p>
                </div>
                <div>
                  {getPlanBadge()}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Account Information */}
            <div className="lg:col-span-2">
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Account Information</h2>
                </div>
                <div className="p-6">
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <dt className="text-sm font-medium text-gray-500 flex items-center">
                        <Mail className="h-4 w-4 mr-2" />
                        Email
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">{user?.email}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Username
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">{username || 'Not set'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 flex items-center">
                        <Crown className="h-4 w-4 mr-2" />
                        Plan
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 capitalize">{userRole || 'Free'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        Member since
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Recently'}
                      </dd>
                    </div>
                  </dl>
                  
                  <div className="mt-6 flex space-x-3">
                    <button
                      onClick={() => router.push('/account/edit-profile')}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </button>
                    <button
                      onClick={() => router.push('/account/settings')}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Account Settings
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-8 bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={() => router.push('/app/editor')}
                      className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left"
                    >
                      <FileText className="h-8 w-8 text-purple-600 mb-2" />
                      <h3 className="font-medium text-gray-900">Create Prompt</h3>
                      <p className="text-sm text-gray-600">Start building a new AI prompt</p>
                    </button>

                    <button
                      onClick={() => router.push('/marketplace')}
                      className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left"
                    >
                      <User className="h-8 w-8 text-purple-600 mb-2" />
                      <h3 className="font-medium text-gray-900">Browse Marketplace</h3>
                      <p className="text-sm text-gray-600">Discover community prompts</p>
                    </button>

                    {userRole === 'admin' && (
                      <button
                        onClick={() => router.push('/admin')}
                        className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left"
                      >
                        <Shield className="h-8 w-8 text-red-600 mb-2" />
                        <h3 className="font-medium text-gray-900">Admin Dashboard</h3>
                        <p className="text-sm text-gray-600">Manage platform settings</p>
                      </button>
                    )}

                    <button
                      onClick={() => router.push('/account/billing')}
                      className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-left"
                    >
                      <CreditCard className="h-8 w-8 text-purple-600 mb-2" />
                      <h3 className="font-medium text-gray-900">Billing</h3>
                      <p className="text-sm text-gray-600">Manage your subscription</p>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Sidebar */}
            <div className="space-y-8">
              {/* Account Stats */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Your Stats</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Prompts</span>
                      <span className="text-sm font-medium text-gray-900">{userStats.totalPrompts}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Favorites</span>
                      <span className="text-sm font-medium text-gray-900">{userStats.favoritePrompts}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {userStats.recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className="h-2 w-2 bg-purple-400 rounded-full mt-2"></div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                          <p className="text-sm text-gray-600">{activity.name}</p>
                          <p className="text-xs text-gray-500">{activity.date}</p>
                        </div>
                      </div>
                    ))}
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
