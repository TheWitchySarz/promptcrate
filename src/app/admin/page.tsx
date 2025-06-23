"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/(contexts)/AuthContext";
import Navbar from "@/app/(components)/layout/Navbar";
import Footer from "@/app/(components)/shared/Footer";
import { 
  Users, 
  DollarSign, 
  MessageSquare, 
  TrendingUp,
  ArrowLeft,
  Settings,
  Shield,
  Database
} from "lucide-react";

export default function AdminDashboard() {
  const { user, userRole, isLoading, isLoggedIn } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRevenue: 0,
    supportTickets: 0,
    activePrompts: 0
  });

  // Debug logging
  useEffect(() => {
    console.log('Current user role:', userRole);
    console.log('Is logged in:', isLoggedIn);
    console.log('User:', user);
  }, [userRole, isLoggedIn, user]);

  // Redirect non-admin users
  useEffect(() => {
    console.log('Admin page useEffect - User role:', userRole, 'Loading:', isLoading, 'User:', user?.email);

    if (!isLoading) {
      if (!user) {
        console.log('No user found, redirecting to login');
        router.push('/login');
        return;
      }

      // Check if user is admin by email, role, or user metadata - be more permissive
      const isAdmin = userRole === 'admin' || 
                     user?.email === 'annalealayton@gmail.com' || 
                     user?.user_metadata?.role === 'admin';

      console.log('Admin check:', {
        userRole,
        email: user?.email,
        userMetadataRole: user?.user_metadata?.role,
        isAdmin
      });

      // Only redirect if we're sure the user is NOT admin
      // Don't redirect if userRole is still loading (null) for admin emails
      if (!isAdmin && userRole !== null) {
        console.log('Redirecting non-admin user. Role:', userRole, 'Logged in:', !!user);
        router.push('/home');
        return;
      }

      if (isAdmin) {
        console.log('Admin access granted for:', user.email);
      }
    }
  }, [user, userRole, isLoading, router]);

  // Fetch admin stats
  useEffect(() => {
    if (userRole === 'admin') {
      fetchAdminStats();
    }
  }, [userRole]);

  const fetchAdminStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    }
  };

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Show unauthorized if not admin - but be permissive during loading
  const isAdmin = userRole === 'admin' || 
                 user?.email === 'annalealayton@gmail.com' || 
                 user?.user_metadata?.role === 'admin';
                 
  // Don't show unauthorized if we're still loading or if user is admin by email
  if (!isLoggedIn || (!isAdmin && userRole !== null && user?.email !== 'annalealayton@gmail.com')) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
            <button
              onClick={() => router.push('/home')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go to Dashboard
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="mt-2 text-gray-600">Manage your platform and monitor key metrics</p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => router.push('/admin/users')}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Manage Users
                </button>
                <button
                  onClick={() => router.push('/admin/support')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Support Tickets
                </button>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.totalUsers}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <DollarSign className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                      <dd className="text-lg font-medium text-gray-900">${stats.totalRevenue}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <MessageSquare className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Support Tickets</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.supportTickets}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TrendingUp className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Active Prompts</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.activePrompts}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Admin Actions */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Admin Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <button
                  onClick={() => router.push('/admin/users')}
                  className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Users className="h-8 w-8 text-purple-600 mb-2" />
                  <h4 className="font-medium text-gray-900">User Management</h4>
                  <p className="text-sm text-gray-600">View and manage user accounts</p>
                </button>

                <button
                  onClick={() => router.push('/admin/support')}
                  className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <MessageSquare className="h-8 w-8 text-purple-600 mb-2" />
                  <h4 className="font-medium text-gray-900">Support Center</h4>
                  <p className="text-sm text-gray-600">Handle support tickets and issues</p>
                </button>

                <button
                  onClick={() => window.open('/api/health', '_blank')}
                  className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Database className="h-8 w-8 text-purple-600 mb-2" />
                  <h4 className="font-medium text-gray-900">System Health</h4>
                  <p className="text-sm text-gray-600">Check system status and health</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}