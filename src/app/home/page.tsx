'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, TrendingUp, Users, Star, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Navbar from '../(components)/layout/Navbar';
import Footer from '../(components)/shared/Footer';
import { useAuth } from '../(contexts)/AuthContext';

export default function HomePage() {
  const { user, userRole } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const stats = [
    { label: 'Prompts Created', value: '12', icon: <Plus className="w-6 h-6" /> },
    { label: 'Total Views', value: '1,247', icon: <TrendingUp className="w-6 h-6" /> },
    { label: 'Community Likes', value: '89', icon: <Star className="w-6 h-6" /> },
    { label: 'Followers', value: '34', icon: <Users className="w-6 h-6" /> }
  ];

  const recentPrompts = [
    {
      title: 'Marketing Copy Generator',
      category: 'Marketing',
      views: 234,
      likes: 12,
      created: '2 days ago'
    },
    {
      title: 'Code Review Assistant',
      category: 'Development',
      views: 189,
      likes: 8,
      created: '5 days ago'
    },
    {
      title: 'Creative Writing Helper',
      category: 'Writing',
      views: 156,
      likes: 15,
      created: '1 week ago'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.email?.split('@')[0] || 'Creator'}!
          </h1>
          <p className="text-gray-600">
            Here's what's happening with your prompts today.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {stats.map((stat, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className="text-purple-600">{stat.icon}</div>
              </div>
            </div>
          ))}
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Prompts */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Recent Prompts</h2>
                <Link href="/upload" className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                  Create New
                </Link>
              </div>

              <div className="space-y-4">
                {recentPrompts.map((prompt, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{prompt.title}</h3>
                      <p className="text-sm text-gray-500">{prompt.category} • {prompt.created}</p>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>{prompt.views} views</span>
                      <span>{prompt.likes} likes</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-6"
          >
            {/* Create New Prompt */}
            <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">Create New Prompt</h3>
              <p className="text-purple-100 mb-4 text-sm">
                Share your expertise with the community
              </p>
              <Link href="/upload">
                <button className="bg-white text-purple-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                  Get Started
                </button>
              </Link>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Actions</h3>
              <p className="text-gray-600 mb-4 text-sm">
                Jump right into creating your next prompt
              </p>
              <Link href="/app/editor">
                <button className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">
                  Create New Prompt
                </button>
              </Link>
            </div>

            {/* Marketplace */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Explore Marketplace</h3>
              <p className="text-gray-600 mb-4 text-sm">
                Discover amazing prompts from other creators
              </p>
              <Link href="/marketplace">
                <button className="w-full bg-gray-100 text-gray-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                  Browse Prompts
                </button>
              </Link>
            </div>

            {/* Upgrade Prompt */}
            {userRole === 'free' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Upgrade to Pro</h3>
                <p className="text-gray-600 mb-4 text-sm">
                  Unlock unlimited prompts and advanced features
                </p>
                <Link href="/#pricing">
                  <button className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">
                    View Plans
                  </button>
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}