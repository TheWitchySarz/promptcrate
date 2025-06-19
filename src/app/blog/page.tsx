
"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, Search, Tag } from 'lucide-react';
import Navbar from '../(components)/layout/Navbar';
import Footer from '../(components)/shared/Footer';

// Sample blog posts data - in a real app, this would come from your database
const blogPosts = [
  {
    id: 'mastering-chatgpt-prompts',
    title: 'Mastering ChatGPT Prompts: A Complete Guide for 2024',
    excerpt: 'Learn the essential techniques for creating effective ChatGPT prompts that deliver consistent, high-quality results for your specific needs.',
    content: 'Full blog post content would go here...',
    author: 'Sarah Chen',
    date: '2024-01-15',
    readTime: '8 min',
    category: 'Tutorials',
    tags: ['ChatGPT', 'Prompt Engineering', 'AI'],
    image: '/blog/chatgpt-guide.jpg',
    featured: true
  },
  {
    id: 'claude-vs-chatgpt-prompting',
    title: 'Claude vs ChatGPT: Optimizing Prompts for Different AI Models',
    excerpt: 'Discover the key differences between prompting strategies for Claude and ChatGPT, and how to adapt your prompts for maximum effectiveness.',
    content: 'Full blog post content would go here...',
    author: 'Marcus Rodriguez',
    date: '2024-01-12',
    readTime: '6 min',
    category: 'Comparisons',
    tags: ['Claude', 'ChatGPT', 'AI Models'],
    image: '/blog/claude-vs-chatgpt.jpg',
    featured: false
  },
  {
    id: 'prompt-engineering-best-practices',
    title: '10 Prompt Engineering Best Practices Every Developer Should Know',
    excerpt: 'Essential best practices and common pitfalls to avoid when designing AI prompts for production applications.',
    content: 'Full blog post content would go here...',
    author: 'Dr. Alex Thompson',
    date: '2024-01-10',
    readTime: '12 min',
    category: 'Best Practices',
    tags: ['Best Practices', 'Development', 'AI'],
    image: '/blog/best-practices.jpg',
    featured: true
  },
  {
    id: 'monetizing-ai-prompts',
    title: 'How to Monetize Your AI Prompts: A Creator\'s Guide',
    excerpt: 'Learn proven strategies for turning your prompt engineering skills into a profitable business through marketplaces and direct sales.',
    content: 'Full blog post content would go here...',
    author: 'Emily Foster',
    date: '2024-01-08',
    readTime: '10 min',
    category: 'Business',
    tags: ['Monetization', 'Business', 'Marketplace'],
    image: '/blog/monetizing-prompts.jpg',
    featured: false
  },
  {
    id: 'future-of-prompt-engineering',
    title: 'The Future of Prompt Engineering: Trends to Watch in 2024',
    excerpt: 'Explore emerging trends in prompt engineering and how they\'ll shape the AI landscape in the coming year.',
    content: 'Full blog post content would go here...',
    author: 'David Kim',
    date: '2024-01-05',
    readTime: '7 min',
    category: 'Industry',
    tags: ['Future', 'Trends', 'AI Industry'],
    image: '/blog/future-trends.jpg',
    featured: false
  },
  {
    id: 'prompt-templates-guide',
    title: 'Building Reusable Prompt Templates: A Step-by-Step Guide',
    excerpt: 'Create flexible, reusable prompt templates that can be adapted for multiple use cases and AI models.',
    content: 'Full blog post content would go here...',
    author: 'Lisa Wang',
    date: '2024-01-03',
    readTime: '9 min',
    category: 'Tutorials',
    tags: ['Templates', 'Reusability', 'Design'],
    image: '/blog/prompt-templates.jpg',
    featured: false
  }
];

const categories = ['All', 'Tutorials', 'Best Practices', 'Comparisons', 'Business', 'Industry'];

export default function BlogPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredPosts = filteredPosts.filter(post => post.featured);
  const regularPosts = filteredPosts.filter(post => !post.featured);

  return (
    <div className="bg-white min-h-screen">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            PromptCrate Blog
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Expert insights, tutorials, and best practices for AI prompt engineering
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Featured Posts */}
        {featuredPosts.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-16"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Featured Articles</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {featuredPosts.map((post, index) => (
                <Link key={post.id} href={`/blog/${post.id}`}>
                  <motion.article
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 * index }}
                    className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow group"
                  >
                    <div className="h-48 bg-gradient-to-br from-purple-600 to-blue-600"></div>
                    <div className="p-6">
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                        <span className="inline-flex items-center gap-1">
                          <Calendar size={16} />
                          {new Date(post.date).toLocaleDateString()}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock size={16} />
                          {post.readTime}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Tag size={16} />
                          {post.category}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-gray-600 mb-4">{post.excerpt}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <User size={16} className="text-gray-400" />
                          <span className="text-sm text-gray-600">{post.author}</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {post.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.article>
                </Link>
              ))}
            </div>
          </motion.section>
        )}

        {/* Regular Posts */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Latest Articles</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {regularPosts.map((post, index) => (
              <Link key={post.id} href={`/blog/${post.id}`}>
                <motion.article
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow group"
                >
                  <div className="h-40 bg-gradient-to-br from-purple-500 to-pink-500"></div>
                  <div className="p-6">
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <span className="inline-flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(post.date).toLocaleDateString()}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock size={14} />
                        {post.readTime}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">{post.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-gray-400" />
                        <span className="text-sm text-gray-600">{post.author}</span>
                      </div>
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                        {post.category}
                      </span>
                    </div>
                  </div>
                </motion.article>
              </Link>
            ))}
          </div>
        </motion.section>

        {/* Newsletter Signup */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-center text-white"
        >
          <h3 className="text-2xl font-bold mb-4">Stay Updated</h3>
          <p className="text-lg mb-6 max-w-2xl mx-auto">
            Get the latest AI prompt engineering insights, tutorials, and industry news delivered to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button className="px-6 py-2 bg-white text-purple-600 rounded-lg font-medium hover:bg-gray-100 transition-colors">
              Subscribe
            </button>
          </div>
        </motion.section>
      </main>

      <Footer />
    </div>
  );
}
