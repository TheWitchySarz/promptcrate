"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '../(components)/layout/Navbar';
import PromptCard from '../(components)/marketplace/PromptCard';
import SearchAndFilters from '../(components)/marketplace/SearchAndFilters';
import { AlertTriangle, Search, X, Filter, ChevronDown, Info, UploadCloud, Users, Building, Sparkles } from 'lucide-react';
import Footer from '../(components)/shared/Footer';
import { AI_MODELS, PRICE_RANGES, SORT_OPTIONS } from '../../lib/constants/marketplaceConstants';
import { motion } from 'framer-motion';
import { useAuth } from '@/app/(contexts)/AuthContext';
import { v4 as uuidv4 } from 'uuid';
import PromptModal from '../(components)/marketplace/PromptModal';

// Define a unified type for all prompts in the marketplace
export interface MarketplacePrompt {
  id: string;
  title: string;
  promptBody: string; // Standardized field
  model: string;
  source: 'community' | 'user' | string;
  // Optional fields, mainly for user prompts
  author?: string;
  price?: number | string;
  rating?: number;
  sales?: number;
  tags?: string[];
  // Fields specific to raw community data if needed, but mostly covered by above
  // act?: string; // raw field from community prompts, mapped to title
  // prompt?: string; // raw field from community prompts, mapped to promptBody
}

const mockPrompts = [
  { id: '1', title: 'High-Converting Email Subject Lines', description: 'Generate compelling email subject lines that boost open rates. Tested with marketing campaigns.', model: 'ChatGPT-4', creator: 'MarketingGuru', price: 4.99, rating: 4.5, downloads: 120, createdAt: '2023-10-26T10:00:00Z' },
  { id: '2', title: 'Realistic Character Portraits', description: 'Create stunningly realistic character portraits for your game or novel. Various styles available.', model: 'Midjourney', creator: 'ArtisanAI', price: 'Free', rating: 4.8, downloads: 350, createdAt: '2023-11-15T14:30:00Z' },
  { id: '3', title: 'Summarize Legal Documents', description: 'Quickly summarize complex legal documents into easy-to-understand points. Saves hours of reading.', model: 'Claude 2', creator: 'LegalEagle', price: 19.99, rating: 4.2, downloads: 50, createdAt: '2023-09-01T09:00:00Z' },
  { id: '4', title: 'Generate Python Code Snippets', description: 'Get useful Python code snippets for common tasks, including data analysis and web scraping.', model: 'ChatGPT-3.5', creator: 'CodeWizard', price: 'Free', rating: 4.0, downloads: 200, createdAt: '2023-11-01T11:00:00Z' },
  { id: '5', title: 'Whimsical Children\'s Story Illustrations', description: 'Generate charming and whimsical illustrations for children\'s stories in a consistent style.', model: 'DALL·E 3', creator: 'StorySpark', price: 9.99, rating: 4.9, downloads: 180, createdAt: '2023-10-05T16:45:00Z' },
  { id: '6', title: 'SEO-Optimized Blog Post Outlines', description: 'Create comprehensive, SEO-friendly outlines for blog posts on any topic.', model: 'ChatGPT-4', creator: 'ContentKing', price: 7.50, rating: 4.6, downloads: 90, createdAt: '2023-11-20T08:20:00Z' },
];

const SAMPLE_PROMPTS = [
  { id: '1', title: 'Ultimate SEO Blog Post Generator', author: 'AIContentPro', model: 'ChatGPT-4', price: 9.99, rating: 4.8, sales: 120, description: 'Generate fully optimized SEO blog posts.', tags: ['SEO', 'Blog', 'Content Creation'] },
  { id: '2', title: 'Photorealistic Image Prompts', author: 'ArtifyAI', model: 'DALL-E 3', price: 0, rating: 4.5, sales: 300, description: 'Create stunning photorealistic images.', tags: ['Image Generation', 'Art', 'DALL-E'] },
  { id: '3', title: 'Product Description Wizard', author: 'EcommerceGuru', model: 'Claude 3', price: 14.50, rating: 4.9, sales: 85, description: 'Craft compelling product descriptions.', tags: ['Ecommerce', 'Marketing', 'Copywriting'] },
  { id: '4', title: 'Code Review Assistant', author: 'DevTools', model: 'Gemini Pro', price: 4.99, rating: 4.2, sales: 45, description: 'Get AI-powered code reviews.', tags: ['Development', 'Code', 'Productivity'] },
  { id: '5', title: 'Social Media Campaign Planner', author: 'SocialStar', model: 'ChatGPT-4', price: 19.99, rating: 4.7, sales: 210, description: 'Plan and generate content for social media.', tags: ['Social Media', 'Marketing', 'Campaign'] },
  { id: '6', title: 'Creative Story Writing Prompts', author: 'StoryWeaver', model: 'Claude 3', price: 0, rating: 4.6, sales: 500, description: 'Spark your imagination with creative story prompts.', tags: ['Writing', 'Creative', 'Fiction'] },
];

export default function MarketplacePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModel, setSelectedModel] = useState(AI_MODELS[0].id);
  const [selectedPrice, setSelectedPrice] = useState(PRICE_RANGES[0].id);
  const [selectedSort, setSelectedSort] = useState(SORT_OPTIONS[0].id);
  const { userRole } = useAuth(); // Get user plan from AuthContext
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<MarketplacePrompt | null>(null);
  
  // Initialize userUploadPrompts with the new MarketplacePrompt type, mapping description to promptBody
  const [userUploadPrompts] = useState<MarketplacePrompt[]>(SAMPLE_PROMPTS.map(p => ({
    ...p,
    promptBody: p.description, // Map description to promptBody
    source: 'user' as 'user', // Explicitly set source for user prompts
  })));
  
  const [filteredPrompts, setFilteredPrompts] = useState<MarketplacePrompt[]>(userUploadPrompts);

  // State for community prompts and tabs
  const [activeTab, setActiveTab] = useState<'all' | 'community' | 'userUploads'>('all');
  const [communityPrompts, setCommunityPrompts] = useState<MarketplacePrompt[]>([]); // Use MarketplacePrompt type
  const [isLoadingCommunity, setIsLoadingCommunity] = useState(true);
  const [fetchErrorCommunity, setFetchErrorCommunity] = useState<string | null>(null);

  // Fetch community prompts
  useEffect(() => {
    const parseCsvLine = (line: string): string[] => {
      const result: string[] = [];
      let currentField = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          if (inQuotes && i + 1 < line.length && line[i+1] === '"') {
            // Handle escaped quote: "" inside a quoted field
            currentField += '"';
            i++; // Skip next quote
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === ',' && !inQuotes) {
          result.push(currentField);
          currentField = '';
        } else {
          currentField += char;
        }
      }
      result.push(currentField); // Add the last field
      return result;
    };

    const fetchCommunityPrompts = async () => {
      setIsLoadingCommunity(true);
      setFetchErrorCommunity(null);
      try {
        const response = await fetch('https://raw.githubusercontent.com/f/awesome-chatgpt-prompts/main/prompts.csv');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const csvText = await response.text();
        const lines = csvText.split('\n').filter(line => line.trim() !== ''); // Filter out empty lines

        if (lines.length < 2) {
          console.warn("CSV file is empty or has no data rows after trimming.");
          setCommunityPrompts([]);
          setIsLoadingCommunity(false);
          return;
        }

        const headerLine = lines[0];
        console.log("CSV Header:", headerLine); // DEBUG
        const header = parseCsvLine(headerLine).map(h => h.trim().toLowerCase());
        console.log("Parsed Header:", header); // DEBUG
        
        const actIndex = header.indexOf('act');
        const promptIndex = header.indexOf('prompt');

        console.log("Act Index:", actIndex, "Prompt Index:", promptIndex); // DEBUG

        if (actIndex === -1 || promptIndex === -1) {
          console.error("CSV header after parsing:", header);
          throw new Error("CSV header is missing 'act' or 'prompt' columns. Check logs for parsed header.");
        }

        const parsedPrompts: MarketplacePrompt[] = lines.slice(1) // Skip header row
          .map((line, index) => {
            if (!line.trim()) return null; // Skip any potentially empty lines again
            console.log(`Raw line ${index + 1}:`, line); // DEBUG
            const values = parseCsvLine(line);
            console.log(`Parsed values for line ${index + 1}:`, values); // DEBUG
            
            const actValue = values[actIndex] ? values[actIndex].trim() : '';
            const promptValue = values[promptIndex] ? values[promptIndex].trim() : '';

            if (!actValue && !promptValue) {
                console.warn(`Skipping line ${index + 1} due to empty act/prompt after parsing:`, line); // DEBUG
                return null;
            }
            
            const title = actValue;
            const body = promptValue;

            if (!title && !body) {
                console.warn(`Skipping line ${index + 1} due to empty title/body:`, line); // DEBUG
                return null;
            }

            return {
              id: uuidv4(),
              title: title || "Untitled Prompt",
              promptBody: body || "No content.",
              model: 'GPT-3.5',
              source: 'community',
            };
          })
          .filter((prompt): prompt is MarketplacePrompt => prompt !== null);

        console.log("Final Parsed Prompts:", parsedPrompts); // DEBUG
        setCommunityPrompts(parsedPrompts);
      } catch (error) {
        console.error("Failed to fetch or parse community prompts:", error);
        if (error instanceof Error) {
          setFetchErrorCommunity(error.message);
        } else {
          setFetchErrorCommunity("An unknown error occurred while fetching community prompts.");
        }
        setCommunityPrompts([]); // Ensure it's an empty array on error
      } finally {
        setIsLoadingCommunity(false);
      }
    };

    fetchCommunityPrompts();
  }, []);

  useEffect(() => {
    let promptsToFilter = [];
    if (activeTab === 'userUploads') {
      promptsToFilter = userUploadPrompts;
    } else if (activeTab === 'community') {
      promptsToFilter = communityPrompts;
    } else { // 'all'
      // Ensure IDs are unique if concatenating. For now, assumes distinct or handles in PromptCard key
      promptsToFilter = [...userUploadPrompts, ...communityPrompts];
    }

    let prompts = promptsToFilter;
    if (searchTerm) {
      // Use promptBody for searching, as it's standardized
      prompts = prompts.filter(p => 
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.promptBody.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (selectedModel !== 'all') {
      prompts = prompts.filter(p => p.model.toLowerCase().replace(' ', '-') === selectedModel);
    }
    setFilteredPrompts(prompts);
  }, [searchTerm, selectedModel, selectedPrice, selectedSort, activeTab, userUploadPrompts, communityPrompts]);

  const handleViewFullPrompt = (promptId: string) => {
    const allPrompts = [...userUploadPrompts, ...communityPrompts];
    const promptToView = allPrompts.find(p => p.id === promptId);
    if (promptToView) {
      setSelectedPrompt(promptToView);
      setIsModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 to-indigo-600 py-16 sm:py-20 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Explore the PromptCrate Marketplace
          </h1>
          <p className="text-lg sm:text-xl text-purple-200 max-w-2xl mx-auto">
            Discover and purchase high-performance prompts crafted by top creators and the community.
          </p>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex border-b border-gray-300">
          {[
            { id: 'all', label: 'All Prompts' },
            { id: 'community', label: 'Community Prompts' },
            { id: 'userUploads', label: 'User Uploads' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'all' | 'community' | 'userUploads')}
              className={`px-4 py-3 text-sm font-medium focus:outline-none 
                          ${activeTab === tab.id 
                            ? 'border-b-2 border-purple-600 text-purple-600' 
                            : 'text-gray-500 hover:text-gray-700'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {/* Community Prompts Source Attribution */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2 text-center sm:text-left">
        <p className="text-xs text-gray-500">
          Community prompts are imported from the 
          <a 
            href="https://github.com/f/awesome-chatgpt-prompts" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-purple-600 hover:text-purple-700 underline transition-colors mx-1"
          >
            Awesome ChatGPT Prompts
          </a>
           repository on GitHub.
        </p>
      </section>

      <SearchAndFilters 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm}
        aiModels={AI_MODELS}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        priceRanges={PRICE_RANGES}
        selectedPrice={selectedPrice}
        setSelectedPrice={setSelectedPrice}
        sortOptions={SORT_OPTIONS}
        selectedSort={selectedSort}
        setSelectedSort={setSelectedSort}
      />

      {/* Prompt Grid and Pagination/Empty State */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow">
        {isLoadingCommunity && (activeTab === 'community' || activeTab === 'all') && (
          <div className="text-center py-16">
            <svg className="animate-spin h-8 w-8 text-purple-600 mx-auto mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-gray-600">Loading Community Prompts...</p>
          </div>
        )}
        {!isLoadingCommunity && fetchErrorCommunity && (activeTab === 'community' || activeTab === 'all') && (
          <div className="text-center py-16 bg-red-50 p-6 rounded-lg border border-red-200">
            <AlertTriangle size={48} className="mx-auto text-red-500 mb-4" />
            <h2 className="text-2xl font-semibold text-red-700 mb-2">Error Loading Prompts</h2>
            <p className="text-red-600">{fetchErrorCommunity}</p>
            <p className="text-sm text-gray-500 mt-2">User uploaded prompts are still available under the "User Uploads" tab.</p>
          </div>
        )}
        
        {((!isLoadingCommunity && !fetchErrorCommunity) || activeTab === 'userUploads') && (
          <>
            {filteredPrompts.length > 0 ? (
              <>
                <div className="text-sm text-gray-600 mb-4">
                  Showing {filteredPrompts.length} of {
                    activeTab === 'userUploads' ? userUploadPrompts.length :
                    activeTab === 'community' ? communityPrompts.length :
                    (userUploadPrompts.length + communityPrompts.length)
                  } prompts (filtered)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
                  {filteredPrompts.map(prompt => (
                    <PromptCard 
                      key={prompt.id}
                      id={prompt.id} 
                      title={prompt.title}
                      promptBody={prompt.promptBody} 
                      model={prompt.model}
                      source={prompt.source} 
                      author={prompt.author}
                      price={prompt.price}
                      onViewFullPrompt={handleViewFullPrompt}
                    />
                  ))}
                </div>
                {/* Basic Pagination/Load More Placeholder */} 
                {filteredPrompts.length < 
                  (activeTab === 'userUploads' ? userUploadPrompts.length : 
                  activeTab === 'community' ? communityPrompts.length : 
                  (userUploadPrompts.length + communityPrompts.length)) 
                  && searchTerm === '' && selectedModel === 'all' && selectedPrice === 'all' && (
                  <div className="mt-12 text-center">
                    <button className="px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors shadow-md">
                        Load More Prompts
                    </button>
                  </div>
                )}
              </>
            ) : (
              // Empty State for when filters result in no prompts, or initial state for community if fetch was successful but empty
              <div className="text-center py-16">
                <AlertTriangle size={48} className="mx-auto text-yellow-500 mb-4" />
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">No Prompts Found</h2>
                <p className="text-gray-600">
                  {/* Tailor message based on context */}
                  {activeTab === 'community' && !fetchErrorCommunity && communityPrompts.length === 0 && !isLoadingCommunity ?
                    'No community prompts are available at the moment.' :
                  'Try adjusting your search or filters!'
                  }
                </p>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />

      {selectedPrompt && (
        <PromptModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          prompt={selectedPrompt}
          userPlan={userRole}
          isOwned={false}
        />
      )}
    </div>
  );
} 