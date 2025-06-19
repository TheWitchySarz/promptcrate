
"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '../(components)/layout/Navbar';
import Footer from '../(components)/shared/Footer';
import { Search, Filter, Star, Download, Eye, TrendingUp, Clock, Grid, List, ChevronDown, SlidersHorizontal, Zap, Crown, Users, Heart, ExternalLink, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/app/(contexts)/AuthContext';
import Link from 'next/link';
import Image from 'next/image';

export interface MarketplacePrompt {
  id: string;
  title: string;
  description: string;
  promptBody: string;
  model: string;
  author: string;
  authorAvatar?: string;
  price: number | 'free';
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  downloads: number;
  views: number;
  tags: string[];
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  lastUpdated: string;
  featured: boolean;
  trending: boolean;
  verified: boolean;
  preview?: string;
  source?: string;
}

const FEATURED_PROMPTS: MarketplacePrompt[] = [
  {
    id: '1',
    title: 'Ultimate SEO Content Generator',
    description: 'Generate complete SEO-optimized blog posts with meta descriptions, headers, and keyword integration.',
    promptBody: 'You are an expert SEO content writer...',
    model: 'ChatGPT-4',
    author: 'ContentMaster Pro',
    authorAvatar: '/api/placeholder/32/32',
    price: 29.99,
    originalPrice: 49.99,
    rating: 4.9,
    reviewCount: 247,
    downloads: 1520,
    views: 5420,
    tags: ['SEO', 'Content', 'Marketing', 'Blog'],
    category: 'Marketing',
    difficulty: 'Intermediate',
    lastUpdated: '2024-01-15',
    featured: true,
    trending: true,
    verified: true,
    preview: 'Create compelling, search-engine optimized content that ranks on the first page...',
    source: 'marketplace'
  },
  {
    id: '2',
    title: 'AI Code Reviewer & Optimizer',
    description: 'Advanced code analysis, bug detection, and optimization suggestions for any programming language.',
    promptBody: 'Act as a senior software engineer...',
    model: 'Claude 3.5',
    author: 'DevGuru AI',
    price: 19.99,
    rating: 4.8,
    reviewCount: 183,
    downloads: 892,
    views: 3210,
    tags: ['Programming', 'Code Review', 'Debugging', 'Optimization'],
    category: 'Development',
    difficulty: 'Advanced',
    lastUpdated: '2024-01-18',
    featured: true,
    trending: false,
    verified: true,
    source: 'marketplace'
  },
  {
    id: '3',
    title: 'Creative Story & Character Builder',
    description: 'Craft compelling narratives, develop rich characters, and build immersive fictional worlds.',
    promptBody: 'You are a master storyteller...',
    model: 'ChatGPT-4',
    author: 'StoryWeaver',
    price: 'free',
    rating: 4.7,
    reviewCount: 456,
    downloads: 2840,
    views: 8960,
    tags: ['Creative Writing', 'Fiction', 'Characters', 'Storytelling'],
    category: 'Creative',
    difficulty: 'Beginner',
    lastUpdated: '2024-01-20',
    featured: true,
    trending: true,
    verified: false,
    source: 'community'
  }
];

const CATEGORIES = [
  { id: 'all', name: 'All Categories', count: 1247 },
  { id: 'marketing', name: 'Marketing & Sales', count: 324 },
  { id: 'development', name: 'Development & Tech', count: 287 },
  { id: 'creative', name: 'Creative Writing', count: 198 },
  { id: 'business', name: 'Business & Finance', count: 156 },
  { id: 'education', name: 'Education & Training', count: 142 },
  { id: 'design', name: 'Design & Media', count: 98 },
  { id: 'productivity', name: 'Productivity', count: 42 }
];

const MODELS = ['All Models', 'ChatGPT-4', 'Claude 3.5', 'Gemini Pro', 'ChatGPT-3.5'];
const SORT_OPTIONS = ['Most Popular', 'Newest', 'Price: Low to High', 'Price: High to Low', 'Best Rated'];
const PRICE_FILTERS = ['All Prices', 'Free', 'Under $10', '$10-$25', '$25-$50', '$50+'];

export default function MarketplacePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedModel, setSelectedModel] = useState('All Models');
  const [selectedSort, setSelectedSort] = useState('Most Popular');
  const [selectedPrice, setSelectedPrice] = useState('All Prices');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);
  
  const { userRole } = useAuth();

  const handleCopyPrompt = async (promptId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedPrompt(promptId);
      setTimeout(() => setCopiedPrompt(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const PromptCard = ({ prompt }: { prompt: MarketplacePrompt }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 group ${
        viewMode === 'list' ? 'flex p-4 space-x-4' : 'p-6'
      }`}
    >
      {/* Featured Badge */}
      {prompt.featured && (
        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center">
          <Crown size={12} className="mr-1" />
          Featured
        </div>
      )}

      {viewMode === 'grid' ? (
        <>
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {prompt.author.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 flex items-center">
                  {prompt.author}
                  {prompt.verified && <Check size={14} className="ml-1 text-blue-500" />}
                </p>
                <p className="text-xs text-gray-500">{prompt.model}</p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              {prompt.trending && (
                <div className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs flex items-center">
                  <TrendingUp size={10} className="mr-1" />
                  Trending
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
              {prompt.title}
            </h3>
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{prompt.description}</p>
            
            {/* Tags */}
            <div className="flex flex-wrap gap-1 mb-3">
              {prompt.tags.slice(0, 3).map(tag => (
                <span key={tag} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs">
                  {tag}
                </span>
              ))}
              {prompt.tags.length > 3 && (
                <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded-md text-xs">
                  +{prompt.tags.length - 3}
                </span>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
            <div className="flex items-center space-x-3">
              <span className="flex items-center">
                <Star size={12} className="mr-1 text-yellow-400 fill-current" />
                {prompt.rating} ({prompt.reviewCount})
              </span>
              <span className="flex items-center">
                <Download size={12} className="mr-1" />
                {prompt.downloads}
              </span>
              <span className="flex items-center">
                <Eye size={12} className="mr-1" />
                {prompt.views}
              </span>
            </div>
            <span className="flex items-center">
              <Clock size={12} className="mr-1" />
              {new Date(prompt.lastUpdated).toLocaleDateString()}
            </span>
          </div>

          {/* Price & Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-gray-900">
                {prompt.price === 'free' ? 'Free' : `$${prompt.price}`}
              </span>
              {prompt.originalPrice && (
                <span className="text-sm text-gray-400 line-through">
                  ${prompt.originalPrice}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleCopyPrompt(prompt.id, prompt.promptBody)}
                className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                title="Copy prompt"
              >
                {copiedPrompt === prompt.id ? (
                  <Check size={16} className="text-green-500" />
                ) : (
                  <Copy size={16} />
                )}
              </button>
              <Link href={`/app/editor?title=${encodeURIComponent(prompt.title)}&prompt=${encodeURIComponent(prompt.promptBody)}&model=${encodeURIComponent(prompt.model)}`}>
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">
                  Use Prompt
                </button>
              </Link>
            </div>
          </div>
        </>
      ) : (
        // List view layout
        <>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                {prompt.title}
              </h3>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold text-gray-900">
                  {prompt.price === 'free' ? 'Free' : `$${prompt.price}`}
                </span>
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-2">{prompt.description}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <span className="flex items-center">
                  <Star size={12} className="mr-1 text-yellow-400 fill-current" />
                  {prompt.rating} ({prompt.reviewCount})
                </span>
                <span>by {prompt.author}</span>
                <span>{prompt.model}</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleCopyPrompt(prompt.id, prompt.promptBody)}
                  className="p-1 text-gray-500 hover:text-purple-600 rounded"
                >
                  {copiedPrompt === prompt.id ? <Check size={14} /> : <Copy size={14} />}
                </button>
                <Link href={`/app/editor?title=${encodeURIComponent(prompt.title)}&prompt=${encodeURIComponent(prompt.promptBody)}&model=${encodeURIComponent(prompt.model)}`}>
                  <button className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 transition-colors">
                    Use
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-600 via-blue-600 to-purple-800 py-20">
        <div className="container mx-auto px-6 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Discover Amazing
              <span className="bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent"> AI Prompts</span>
            </h1>
            <p className="text-xl text-purple-100 mb-8 max-w-3xl mx-auto">
              Browse thousands of expertly crafted prompts, from marketing copy to code generation. 
              Find the perfect prompt to supercharge your AI workflows.
            </p>
            
            {/* Hero Search */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search for prompts, creators, or categories..."
                  className="w-full pl-12 pr-4 py-4 rounded-xl border-0 shadow-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex justify-center space-x-8 text-center">
              <div>
                <div className="text-2xl font-bold">1,247</div>
                <div className="text-purple-200 text-sm">Total Prompts</div>
              </div>
              <div>
                <div className="text-2xl font-bold">15,420</div>
                <div className="text-purple-200 text-sm">Downloads</div>
              </div>
              <div>
                <div className="text-2xl font-bold">892</div>
                <div className="text-purple-200 text-sm">Creators</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-6 py-12">
        {/* Filters Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap items-center gap-4">
            {/* Category Filter */}
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name} ({cat.count})</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            </div>

            {/* Model Filter */}
            <div className="relative">
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {MODELS.map(model => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            </div>

            {/* Price Filter */}
            <div className="relative">
              <select
                value={selectedPrice}
                onChange={(e) => setSelectedPrice(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {PRICE_FILTERS.map(price => (
                  <option key={price} value={price}>{price}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <SlidersHorizontal size={16} />
              <span>More Filters</span>
            </button>
          </div>

          <div className="flex items-center space-x-4">
            {/* Sort */}
            <div className="relative">
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {SORT_OPTIONS.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            </div>

            {/* View Toggle */}
            <div className="flex border border-gray-300 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-purple-600 text-white' : 'text-gray-500 hover:text-gray-700'} rounded-l-lg transition-colors`}
              >
                <Grid size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-gray-500 hover:text-gray-700'} rounded-r-lg transition-colors`}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Featured Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Featured Prompts</h2>
            <Link href="/marketplace?featured=true" className="text-purple-600 hover:text-purple-700 font-medium">
              View All Featured
            </Link>
          </div>
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {FEATURED_PROMPTS.map(prompt => (
              <div key={prompt.id} className="relative">
                <PromptCard prompt={prompt} />
              </div>
            ))}
          </div>
        </section>

        {/* All Prompts */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">All Prompts</h2>
            <div className="text-sm text-gray-500">
              Showing 1-12 of 1,247 results
            </div>
          </div>
          
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
            {FEATURED_PROMPTS.map(prompt => (
              <PromptCard key={prompt.id + 'all'} prompt={prompt} />
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-12">
            <button className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">
              Load More Prompts
            </button>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
