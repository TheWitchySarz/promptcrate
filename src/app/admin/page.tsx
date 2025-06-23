
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/(contexts)/AuthContext";
import Navbar from "@/app/(components)/layout/Navbar";
import Footer from "@/app/(components)/shared/Footer";
import { 
  Users, 
  CreditCard, 
  MessageSquare, 
  AlertTriangle, 
  TrendingUp,
  DollarSign,
  FileText,
  Settings
} from "lucide-react";

interface AdminStats {
  totalUsers: number;
  activeSubscriptions: number;
  pendingIssues: number;
  monthlyRevenue: number;
  recentContacts: number;
}

export default function AdminDashboard() {
  const { isLoggedIn, isLoading, userRole } = useAuth();
  const router = useRouter();

  // Redirect non-admin users
  useEffect(() => {
    if (!isLoading && (!isLoggedIn || userRole !== 'admin')) {
      router.push('/home');
      return;
    }
  }, [isLoggedIn, isLoading, userRole, router]);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeSubscriptions: 0,
    pendingIssues: 0,
    monthlyRevenue: 0,
    recentContacts: 0
  });

  useEffect(() => {
    if (!isLoading && (!isLoggedIn || userRole !== 'admin')) {
      router.push("/login?message=Admin access required.");
    }
  }, [isLoggedIn, isLoading, userRole, router]);

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

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow flex items-center justify-center bg-gray-50">
          <p className="text-gray-700">Loading admin dashboard...</p>
        </main>
        <Footer />
      </div>
    );
  }

  // Debug: Log current user role
  console.log('Current user role:', userRole);
  console.log('Is logged in:', isLoggedIn);

  if (!isLoggedIn || userRole !== 'admin') {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <p className="text-gray-700 mb-4">Access Denied</p>
            <p className="text-sm text-gray-500">Current role: {userRole || 'null'}</p>
            <p className="text-sm text-gray-500">Logged in: {isLoggedIn ? 'Yes' : 'No'}</p>
            <p className="text-sm text-gray-500">Required: admin</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const adminCards = [
    {
      title: "User Management",
      description: "Manage users, subscriptions, and permissions",
      icon: Users,
      href: "/admin/users",
      color: "bg-blue-500",
      stat: stats.totalUsers,
      statLabel: "Total Users"
    },
    {
      title: "Payment Issues",
      description: "Handle billing problems and payment disputes",
      icon: CreditCard,
      href: "/admin/payments",
      color: "bg-green-500",
      stat: stats.activeSubscriptions,
      statLabel: "Active Subscriptions"
    },
    {
      title: "Customer Support",
      description: "View and respond to customer inquiries",
      icon: MessageSquare,
      href: "/admin/support",
      color: "bg-purple-500",
      stat: stats.recentContacts,
      statLabel: "Recent Contacts"
    },
    {
      title: "Issue Tracker",
      description: "Monitor and resolve system issues",
      icon: AlertTriangle,
      href: "/admin/issues",
      color: "bg-red-500",
      stat: stats.pendingIssues,
      statLabel: "Pending Issues"
    },
    {
      title: "Analytics",
      description: "View platform performance and metrics",
      icon: TrendingUp,
      href: "/admin/analytics",
      color: "bg-indigo-500",
      stat: `$${stats.monthlyRevenue.toLocaleString()}`,
      statLabel: "Monthly Revenue"
    },
    {
      title: "Content Management",
      description: "Manage prompts, blog posts, and content",
      icon: FileText,
      href: "/admin/content",
      color: "bg-orange-500",
      stat: "24",
      statLabel: "Pending Reviews"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage your platform and support customers</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Monthly Revenue</p>
                <p className="text-2xl font-semibold text-gray-900">${stats.monthlyRevenue.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CreditCard className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Subscriptions</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.activeSubscriptions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Issues</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.pendingIssues}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminCards.map((card) => (
            <div
              key={card.title}
              onClick={() => router.push(card.href)}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer p-6"
            >
              <div className="flex items-center mb-4">
                <div className={`p-3 rounded-lg ${card.color}`}>
                  <card.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{card.title}</h3>
                  <p className="text-sm text-gray-600">{card.description}</p>
                </div>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-gray-900">{card.stat}</span>
                  <span className="text-sm text-gray-500">{card.statLabel}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
