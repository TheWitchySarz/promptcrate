"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { useState, useEffect } from 'react';
import { CheckCircle, Mail, Loader2, XCircle } from 'lucide-react';
import Navbar from './(components)/layout/Navbar';
import Footer from './(components)/shared/Footer';
import Link from 'next/link';
import { useAuth } from './(contexts)/AuthContext';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

// Dynamically import large components to improve initial load time
const TrustedBySection = dynamic(() => import('./(components)/TrustedBySection'), {
  loading: () => <div className="py-12 bg-white"><div className="max-w-7xl mx-auto px-6 text-center">Loading...</div></div>,
  ssr: true
});

const FeatureSection = dynamic(() => import('./(components)/FeatureSection'), {
  ssr: true
});

function UIMockupSection() {
  const [activeTab, setActiveTab] = useState("editor");
  const [isMockTesting, setIsMockTesting] = useState(false);
  const [mockOutputContent, setMockOutputContent] = useState('');
  const [showMockOutput, setShowMockOutput] = useState(false);

  // Preload data to avoid layout shifts
  const mockupData = {
    editor: {
      title: "My Awesome Prompt Title",
      prompt: "Generate a marketing email campaign for a new {{product_name}} targeting {{target_audience}}.\\n\\nInclude:\\n- A catchy subject line.\\n- An engaging introduction.\\n- 3 key benefits of the {{product_name}}.\\n- A clear call to action to {{desired_action}}."
    },
    marketplace: {
      prompts: [
        { title: "SEO Blog Post Wizard", author: "AI Enthusiast", price: "$10", model: "ChatGPT-4" },
        { title: "Twitter Thread Generator", author: "SocialNinja", price: "Free", model: "Claude 2" },
        { title: "Code Explanation Pro", author: "DevGuru", price: "$15", model: "Gemini Pro" },
        { title: "Landing Page Copywriter", author: "MarketingMaven", price: "$20", model: "ChatGPT-4" },
      ]
    }
  };

  const handleMockTest = () => {
    setShowMockOutput(false); // Clear previous output first
    setIsMockTesting(true);

    // Simulate API call and AI generation
    setTimeout(() => {
      const productName = "NovaWidget";
      const targetAudience = "Tech Enthusiasts";
      const desiredAction = "Learn More & Pre-order";

      const generatedEmail = `Subject: ✨ Introducing the Revolutionary ${productName} for ${targetAudience}! ✨\n\nHi there,\n\nAre you ready to elevate your experience? We're thrilled to unveil the all-new ${productName}, designed specifically for innovative ${targetAudience} like you!\n\nDiscover how ${productName} can help you:\n1. **Boost Productivity:** Streamline your workflow and achieve more in less time.\n2. **Enhance Quality:** Deliver outstanding results with our cutting-edge features.\n3. **Unlock Potential:** Gain new insights and capabilities to stay ahead of the curve.\n\nReady to ${desiredAction}? Click here to get started: [Your Call to Action Link Here]\n\nBest,\nThe PromptCrate Team`;

      setMockOutputContent(generatedEmail);
      setIsMockTesting(false);
      setShowMockOutput(true);
    }, 1500);
  };

  return (
    <section id="mockup" className="max-w-7xl mx-auto px-6 py-24 text-center bg-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <h2 className="text-3xl sm:text-4xl font-semibold mb-6 text-gray-900">See PromptCrate in Action</h2>
        <p className="text-lg text-gray-600 mb-10 max-w-xl mx-auto">
          Experience the intuitive interface of our prompt editor and the vibrant marketplace.
        </p>

        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setActiveTab("editor")}
            className={`px-6 py-3 rounded-lg font-medium transition-colors duration-150 
                        ${activeTab === "editor" 
                          ? "bg-purple-600 text-white shadow-md"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
          >
            Prompt Editor
          </button>
          <button
            onClick={() => setActiveTab("marketplace")}
            className={`px-6 py-3 rounded-lg font-medium transition-colors duration-150 
                        ${activeTab === "marketplace" 
                          ? "bg-purple-600 text-white shadow-md"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
          >
            Marketplace View
          </button>
        </div>

        <div className="relative w-full min-h-[500px] sm:min-h-[550px] md:min-h-[600px] bg-gray-800 rounded-xl border border-gray-700 shadow-2xl overflow-hidden p-4 flex flex-col">
          {/* Mockup Window Bar */}
          <div className="flex items-center gap-2 mb-3 flex-shrink-0">
            <span className="w-3.5 h-3.5 bg-red-500 rounded-full opacity-80"></span>
            <span className="w-3.5 h-3.5 bg-yellow-400 rounded-full opacity-80"></span>
            <span className="w-3.5 h-3.5 bg-green-500 rounded-full opacity-80"></span>
          </div>

          {/* Mockup Content */}
          {activeTab === "editor" && (
            <motion.div 
              key="editor-view"
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="w-full h-full flex bg-white rounded-md overflow-hidden"
            >
              {/* Sidebar */}
              <div className="w-1/4 bg-gray-50 border-r border-gray-200 p-3">
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-gray-700 mb-2">MY PROMPTS</div>
                  <div className="bg-purple-100 text-purple-800 rounded-lg p-2 text-xs">
                    <div className="font-medium truncate">Marketing Email Gen</div>
                    <div className="text-purple-600">2 hours ago</div>
                  </div>
                  <div className="bg-white rounded-lg p-2 text-xs border border-gray-200">
                    <div className="font-medium truncate">Code Review Assistant</div>
                    <div className="text-gray-500">1 day ago</div>
                  </div>
                  <div className="bg-white rounded-lg p-2 text-xs border border-gray-200">
                    <div className="font-medium truncate">Blog Post Generator</div>
                    <div className="text-gray-500">3 days ago</div>
                  </div>
                </div>
              </div>

              {/* Main Editor */}
              <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="border-b border-gray-200 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <input type="text" defaultValue="Marketing Email Generator" className="text-sm font-semibold text-gray-900 bg-transparent border-none focus:outline-none p-0" />
                    <div className="flex items-center space-x-2">
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">Saved</span>
                      <span className="text-xs text-gray-500">v1</span>
                    </div>
                  </div>
                  <div className="flex space-x-3 text-xs">
                    <button className="text-purple-700 bg-purple-100 px-2 py-1 rounded">Editor</button>
                    <button className="text-gray-600 hover:text-gray-900">Test</button>
                    <button className="text-gray-600 hover:text-gray-900">Settings</button>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-3 overflow-auto">
                  {/* Model Selection */}
                  <div className="bg-white border border-gray-200 rounded-lg p-3 mb-3">
                    <div className="text-xs font-medium text-gray-700 mb-2">AI Model</div>
                    <select className="w-full text-xs border border-gray-300 rounded px-2 py-1">
                      <option>GPT-4 Turbo - $0.01/1K tokens</option>
                      <option>Claude 3 Opus - $0.015/1K tokens</option>
                    </select>
                  </div>

                  {/* Prompt Content */}
                  <div className="bg-white border border-gray-200 rounded-lg p-3 mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs font-medium text-gray-700">Prompt Content</div>
                      <button className="flex items-center space-x-1 text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded">
                        <span>✨</span>
                        <span>AI Optimize</span>
                      </button>
                    </div>
                    <textarea 
                      readOnly 
                      className="w-full h-24 text-xs border border-gray-300 rounded p-2 font-mono resize-none"
                      value="Generate a marketing email campaign for a new {{product_name}} targeting {{target_audience}}.

Include:
- A catchy subject line
- An engaging introduction  
- 3 key benefits of the {{product_name}}
- A clear call to action to {{desired_action}}"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>245 characters</span>
                      <span>~61 tokens</span>
                    </div>
                  </div>

                  {/* Variables */}
                  <div className="bg-white border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs font-medium text-gray-700">Variables</div>
                      <button className="text-xs bg-purple-600 text-white px-2 py-1 rounded">+ Add</button>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                        <div className="flex items-center space-x-2">
                          <code className="bg-purple-100 text-purple-700 px-1 rounded">{{product_name}}</code>
                          <span className="text-gray-600">Product name</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                        <div className="flex items-center space-x-2">
                          <code className="bg-purple-100 text-purple-700 px-1 rounded">{{target_audience}}</code>
                          <span className="text-gray-600">Target audience</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 p-3">
                  <div className="flex items-center justify-end space-x-2">
                    <Link
                      href="/signup"
                      className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                    >
                      Save Draft
                    </Link>
                    <button 
                      onClick={handleMockTest}
                      disabled={isMockTesting}
                      className="px-3 py-1 text-xs font-medium text-white bg-purple-600 rounded hover:bg-purple-700 transition-colors disabled:opacity-70"
                    >
                      {isMockTesting ? 'Testing...' : 'Test Prompt'}
                    </button>
                  </div>
                </div>

                {/* Mock Output */}
                {showMockOutput && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-gray-200 p-3 bg-gray-50"
                  >
                    <div className="text-xs font-semibold text-purple-700 mb-2">AI Output:</div>
                    <div className="bg-white border border-gray-200 rounded p-2 text-xs text-gray-900 max-h-24 overflow-auto">
                      {mockOutputContent}
                    </div>
                    <button 
                      onClick={() => setShowMockOutput(false)}
                      className="text-xs text-purple-600 hover:text-purple-700 mt-2"
                    >
                      Clear Output
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
          {activeTab === "marketplace" && (
            <motion.div 
              key="marketplace-view"
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="w-full h-full flex flex-col bg-gradient-to-br from-purple-600 to-blue-600 rounded-md overflow-hidden"
            >
              {/* Hero Section */}
              <div className="text-center text-white p-4">
                <h3 className="text-lg font-bold mb-1">Discover Amazing AI Prompts</h3>
                <p className="text-xs text-purple-100 mb-3">Browse thousands of expertly crafted prompts</p>
                <div className="bg-white/10 rounded-lg p-2 mb-3">
                  <input 
                    type="text" 
                    placeholder="Search prompts..." 
                    className="w-full bg-white text-gray-900 text-xs rounded px-2 py-1 placeholder-gray-500"
                    readOnly
                  />
                </div>
                <div className="flex justify-center space-x-4 text-center text-xs">
                  <div>
                    <div className="font-bold">1,247</div>
                    <div className="text-purple-200">Prompts</div>
                  </div>
                  <div>
                    <div className="font-bold">15K</div>
                    <div className="text-purple-200">Downloads</div>
                  </div>
                  <div>
                    <div className="font-bold">892</div>
                    <div className="text-purple-200">Creators</div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 bg-white p-3 overflow-auto">
                {/* Filters */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex space-x-2">
                    <select className="text-xs border border-gray-300 rounded px-2 py-1">
                      <option>All Categories</option>
                      <option>Marketing</option>
                      <option>Development</option>
                    </select>
                    <select className="text-xs border border-gray-300 rounded px-2 py-1">
                      <option>All Models</option>
                      <option>GPT-4</option>
                      <option>Claude</option>
                    </select>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button className="p-1 bg-purple-600 text-white rounded">
                      <div className="w-3 h-3 grid grid-cols-2 gap-0.5">
                        <div className="bg-white rounded-sm"></div>
                        <div className="bg-white rounded-sm"></div>
                        <div className="bg-white rounded-sm"></div>
                        <div className="bg-white rounded-sm"></div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Featured Badge */}
                <div className="text-xs font-semibold text-gray-700 mb-2 flex items-center">
                  <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full mr-2">👑 FEATURED</span>
                  Featured Prompts
                </div>

                {/* Prompt Grid */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { 
                      title: "Ultimate SEO Content Generator", 
                      author: "ContentMaster Pro", 
                      price: "$29.99", 
                      originalPrice: "$49.99",
                      rating: "4.9", 
                      downloads: "1.5K",
                      model: "GPT-4",
                      trending: true,
                      verified: true
                    },
                    { 
                      title: "AI Code Reviewer", 
                      author: "DevGuru AI", 
                      price: "$19.99", 
                      rating: "4.8", 
                      downloads: "892",
                      model: "Claude 3.5",
                      trending: false,
                      verified: true
                    },
                    { 
                      title: "Creative Story Builder", 
                      author: "StoryWeaver", 
                      price: "Free", 
                      rating: "4.7", 
                      downloads: "2.8K",
                      model: "GPT-4",
                      trending: true,
                      verified: false
                    },
                    { 
                      title: "Email Marketing Pro", 
                      author: "MarketingGuru", 
                      price: "$15.99", 
                      rating: "4.6", 
                      downloads: "567",
                      model: "GPT-4",
                      trending: false,
                      verified: true
                    }
                  ].map((prompt, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-lg p-2 hover:shadow-md transition-shadow relative">
                      {prompt.trending && (
                        <div className="absolute -top-1 -right-1 bg-green-100 text-green-700 text-xs px-1 rounded-full flex items-center">
                          📈
                        </div>
                      )}
                      
                      {/* Header */}
                      <div className="flex items-center space-x-1 mb-2">
                        <div className="w-4 h-4 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                          {prompt.author.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-900 truncate flex items-center">
                            {prompt.author}
                            {prompt.verified && <span className="ml-1 text-blue-500">✓</span>}
                          </p>
                          <p className="text-xs text-gray-500">{prompt.model}</p>
                        </div>
                      </div>

                      {/* Content */}
                      <h4 className="text-xs font-bold text-gray-900 mb-1 line-clamp-2 leading-tight">{prompt.title}</h4>
                      
                      {/* Tags */}
                      <div className="flex gap-1 mb-2">
                        <span className="bg-gray-100 text-gray-700 px-1 rounded text-xs">SEO</span>
                        <span className="bg-gray-100 text-gray-700 px-1 rounded text-xs">Content</span>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                        <span className="flex items-center">
                          ⭐ {prompt.rating}
                        </span>
                        <span className="flex items-center">
                          📥 {prompt.downloads}
                        </span>
                      </div>

                      {/* Price & Action */}
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-bold text-gray-900">{prompt.price}</span>
                          {prompt.originalPrice && (
                            <span className="text-xs text-gray-400 line-through ml-1">{prompt.originalPrice}</span>
                          )}
                        </div>
                        <Link 
                          href="/signup"
                          className="px-2 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 transition-colors"
                        >
                          Use
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="text-center mt-3">
                  <button className="text-xs text-purple-600 font-medium">View All Prompts →</button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </section>
  );
}

function WhyPromptCrateSection() {
  const painPoints = [
    "Scattered prompts across docs & notes",
    "No easy way to test or version control",
    "Difficulty finding quality, reliable prompts",
    "Time wasted adapting prompts for different AI models",
  ];

  const solutions = [
    "Centralized library for all your AI prompts",
    "Built-in editor with versioning & testing sandbox",
    "Curated marketplace with quality & community ratings",
    "Multi-model support & easy prompt adaptation",
  ];

  return (
    <section id="why" className="max-w-7xl mx-auto px-6 py-24 bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h2 className="text-3xl sm:text-4xl font-semibold mb-16 text-gray-900 text-center">
          Stop Juggling Tools. Start Crafting Excellence.
        </h2>
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
            <h3 className="text-2xl font-semibold text-gray-500 mb-6">The Old Way...</h3>
            <ul className="space-y-4">
              {painPoints.map((point, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-red-400 mr-3 mt-1">✕</span> 
                  <span className="text-gray-600">{point}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-xl border border-purple-200 ring-2 ring-purple-500">
            <h3 className="text-2xl font-semibold text-purple-600 mb-6">The PromptCrate Way!</h3>
            <ul className="space-y-4">
              {solutions.map((solution, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="text-green-500 mr-3 mt-1 flex-shrink-0" size={20} />
                  <span className="text-gray-700 font-medium">{solution}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

export default function Home() {
  const { isLoggedIn, userRole, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  // State for logged-in user upgrade flow
  const [isUpgradingUser, setIsUpgradingUser] = useState(false);
  const [upgradeUserError, setUpgradeUserError] = useState<string | null>(null);

  // State for unauthenticated user direct to checkout flow
  const [isRedirectingDirect, setIsRedirectingDirect] = useState(false);
  const [directCheckoutError, setDirectCheckoutError] = useState<string | null>(null);

  // Handler for logged-in free users to upgrade
  const handleUpgradeLoggedInUserToPro = async () => {
    if (!isLoggedIn || userRole !== 'free') return; // Safety check

    setIsUpgradingUser(true);
    setUpgradeUserError(null);
    try {
      console.log('Creating checkout session for Pro upgrade...');
      const response = await fetch('/api/stripe/checkout-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session for upgrade.');
      }

      if (data.url) {
        console.log('Redirecting to Stripe checkout...');
        // Important: We need to reset isUpgradingUser if the page is reloaded without completing checkout
        // This is a safeguard to prevent the button being permanently disabled
        setTimeout(() => setIsUpgradingUser(false), 30000); // Reset after 30 seconds
        window.location.href = data.url; // Use window.location instead of router.push for more reliable redirect
        return;
      } else {
        throw new Error('No checkout URL received for upgrade.');
      }
    } catch (error) {
      console.error("Error upgrading logged-in user to Pro:", error);
      setUpgradeUserError((error as Error).message);
      setIsUpgradingUser(false);
    }
  };

  // Handler for unauthenticated users going directly to Pro checkout
  const handleDirectToProCheckout = async () => {
    if (isLoggedIn) return; // Should only be called if not logged in

    setIsRedirectingDirect(true);
    setDirectCheckoutError(null);
    try {
      console.log('Creating direct checkout session...');
      const response = await fetch('/api/stripe/unauth-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create direct checkout session.');
      }

      if (data.url) {
        console.log('Redirecting to direct checkout...');
        // Safety timeout to reset the button state if page reloads without completing checkout
        setTimeout(() => setIsRedirectingDirect(false), 30000);
        window.location.href = data.url; // More reliable than router.push
        return; 
      } else {
        throw new Error('No direct checkout URL received.');
      }
    } catch (error) {
      console.error("Error in direct to Pro checkout flow:", error);
      setDirectCheckoutError((error as Error).message);
      setIsRedirectingDirect(false);
    }
  };

  // Determine button text and action based on auth state
  let proButtonText = 'Choose Pro';
  let proButtonAction = () => {};
  let proButtonDisabled = false;
  let currentProButtonError = directCheckoutError; // Default to direct checkout error

  if (isAuthLoading) {
    proButtonText = 'Loading...';
    proButtonDisabled = true;
  } else if (isLoggedIn) {
    if (userRole === 'free') {
      proButtonText = isUpgradingUser ? 'Processing...' : 'Upgrade to Pro';
      proButtonAction = handleUpgradeLoggedInUserToPro;
      proButtonDisabled = isUpgradingUser;
      currentProButtonError = upgradeUserError;
    } else if (userRole === 'pro' || userRole === 'enterprise') {
      proButtonText = 'Manage Plan';
      proButtonAction = () => router.push('/account/settings');
    }
  } else {
    // Not logged in
    proButtonText = isRedirectingDirect ? 'Redirecting...' : 'Choose Pro';
    proButtonAction = handleDirectToProCheckout;
    proButtonDisabled = isRedirectingDirect;
    currentProButtonError = directCheckoutError;
  }

  return (
    <div className="bg-white min-h-screen w-full font-sans text-gray-900">
      <Navbar />
      <main>
        <section className="max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[calc(90vh-68px)] py-20 px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="flex flex-col items-center"
          >
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-4 text-purple-600 tracking-normal">
              PromptCrate
            </h1>
            <span className="inline-block text-base sm:text-lg font-semibold tracking-wide text-gray-700 mb-6">Create. Refine. Monetize.</span>
            <p className="max-w-2xl text-base sm:text-lg text-gray-600 mb-10">
              The ultimate platform for prompt engineers to build, manage, test, and sell their AI prompts. 
              Unlock your creativity and join a thriving community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <Link 
                href="/signup" 
                prefetch={true}
                className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold text-white bg-purple-600 rounded-lg shadow-md hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              >
                Get Started for Free
              </Link>
              <Link 
                href="/#mockup" 
                className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold text-gray-700 bg-gray-100 rounded-lg shadow-sm hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
              >
                How It Works
              </Link>
            </div>
          </motion.div>
        </section>

        <TrustedBySection />

        <UIMockupSection />

        <WhyPromptCrateSection />

        {/* Blog Section */}
        <section className="max-w-7xl mx-auto px-6 py-24 bg-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl sm:text-4xl font-semibold mb-6 text-gray-900 text-center">
              Latest from Our Blog
            </h2>
            <p className="text-lg text-gray-600 mb-12 max-w-xl mx-auto text-center">
              Stay ahead with expert insights on AI prompt engineering, best practices, and industry trends.
            </p>
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {[
                {
                  title: "Mastering ChatGPT Prompts: A Complete Guide for 2024",
                  excerpt: "Learn the essential techniques for creating effective ChatGPT prompts that deliver consistent results.",
                  author: "Sarah Chen",
                  date: "Jan 15, 2024",
                  slug: "mastering-chatgpt-prompts"
                },
                {
                  title: "Claude vs ChatGPT: Optimizing Prompts for Different AI Models", 
                  excerpt: "Discover the key differences between prompting strategies for Claude and ChatGPT.",
                  author: "Marcus Rodriguez",
                  date: "Jan 12, 2024",
                  slug: "claude-vs-chatgpt-prompting"
                },
                {
                  title: "10 Prompt Engineering Best Practices Every Developer Should Know",
                  excerpt: "Essential best practices and common pitfalls to avoid when designing AI prompts.",
                  author: "Dr. Alex Thompson", 
                  date: "Jan 10, 2024",
                  slug: "prompt-engineering-best-practices"
                }
              ].map((post, index) => (
                <Link key={index} href={`/blog/${post.slug}`}>
                  <motion.article
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow group"
                  >
                    <div className="h-32 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg mb-4"></div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">{post.excerpt}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{post.author}</span>
                      <span>{post.date}</span>
                    </div>
                  </motion.article>
                </Link>
              ))}
            </div>
            <div className="text-center">
              <Link 
                href="/blog"
                className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                View All Articles
              </Link>
            </div>
          </motion.div>
        </section>

        <section id="pricing" className="max-w-7xl mx-auto px-6 py-24 bg-gray-50">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h2 className="text-3xl sm:text-4xl font-semibold mb-6 text-gray-900 text-center">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-gray-600 mb-16 max-w-xl mx-auto text-center">
              Choose the plan that's right for you and your team.
            </p>
            <div className="grid md:grid-cols-3 gap-8 items-stretch">
              {/* Free Plan */}
              <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 flex flex-col">
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">Free</h3>
                <p className="text-gray-500 mb-6">For individuals starting out</p>
                <p className="text-4xl font-bold text-gray-900 mb-1">
                  $0 <span className="text-xl font-normal text-gray-500">/ month</span>
                </p>
                <ul className="space-y-3 text-gray-600 mt-6 mb-8 flex-grow">
                  <li className="flex items-center"><CheckCircle className="text-green-500 mr-2 flex-shrink-0" size={18}/> Access to prompt editor</li>
                  <li className="flex items-center"><CheckCircle className="text-green-500 mr-2 flex-shrink-0" size={18}/> Save prompts to your library</li>
                  <li className="flex items-center"><CheckCircle className="text-green-500 mr-2 flex-shrink-0" size={18}/> Community marketplace access</li>
                  <li className="flex items-center"><XCircle className="text-red-400 mr-2 flex-shrink-0" size={18}/> <span className="text-gray-400">AI refinement features</span></li>
                  <li className="flex items-center"><XCircle className="text-red-400 mr-2 flex-shrink-0" size={18}/> <span className="text-gray-400">Team collaboration</span></li>
                </ul>
                <Link href="/signup?plan=free" prefetch={true} className="w-full mt-auto px-6 py-3 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition text-center"> 
                  Get Started
                </Link>
              </div>

              {/* Pro Plan */}
              <div className="bg-white p-8 rounded-xl shadow-xl border border-purple-300 flex flex-col ring-2 ring-purple-500">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-semibold text-purple-600 mb-2">Pro</h3>
                  <span className="text-xs font-semibold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">POPULAR</span>
                </div>
                <p className="text-purple-500 mb-6">For power users & small teams</p>
                <p className="text-4xl font-bold text-gray-900 mb-1">
                  $29 <span className="text-xl font-normal text-gray-500">/ month</span>
                </p>
                <ul className="space-y-3 text-gray-600 mt-6 mb-8 flex-grow">
                  <li className="flex items-center"><CheckCircle className="text-green-500 mr-2 flex-shrink-0" size={18}/> Unlimited personal prompts</li>
                  <li className="flex items-center"><CheckCircle className="text-green-500 mr-2 flex-shrink-0" size={18}/> <strong>AI refinement & optimization</strong></li>
                  <li className="flex items-center"><CheckCircle className="text-green-500 mr-2 flex-shrink-0" size={18}/> Create team libraries (up to 5 users)</li>
                  <li className="flex items-center"><CheckCircle className="text-green-500 mr-2 flex-shrink-0" size={18}/> Sell on Marketplace (20% commission)</li>
                  <li className="flex items-center"><CheckCircle className="text-green-500 mr-2 flex-shrink-0" size={18}/> Priority support</li>
                </ul>
                <button 
                  onClick={proButtonAction}
                  disabled={proButtonDisabled || isAuthLoading}
                  className="w-full mt-auto px-6 py-3 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 transition text-center disabled:opacity-70"
                >
                  {(isUpgradingUser && isLoggedIn && userRole === 'free') || (isRedirectingDirect && !isLoggedIn) ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin inline-block" />{proButtonText}</>
                  ) : (
                    proButtonText
                  )}
                </button>
                {currentProButtonError && <p className="text-xs text-red-600 mt-1 text-center">{`Error: ${currentProButtonError}`}</p>}
              </div>

              {/* Enterprise Plan */}
              <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 flex flex-col">
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">Enterprise</h3>
                <p className="text-gray-500 mb-6">For large organizations</p>
                <p className="text-4xl font-bold text-gray-900 mb-1">
                  Custom
                </p>
                <ul className="space-y-3 text-gray-600 mt-6 mb-8 flex-grow">
                  <li className="flex items-center"><CheckCircle className="text-green-500 mr-2 flex-shrink-0" size={18}/> All Pro features, plus:</li>
                  <li className="flex items-center"><CheckCircle className="text-green-500 mr-2 flex-shrink-0" size={18}/> Unlimited team members & libraries</li>
                  <li className="flex items-center"><CheckCircle className="text-green-500 mr-2 flex-shrink-0" size={18}/> Custom model integration</li>
                  <li className="flex items-center"><CheckCircle className="text-green-500 mr-2 flex-shrink-0" size={18}/> Dedicated support & SLA</li>
                  <li className="flex items-center"><CheckCircle className="text-green-500 mr-2 flex-shrink-0" size={18}/> Advanced security & compliance</li>
                </ul>
                <Link 
                  href="/contact?subject=Enterprise%20Inquiry" 
                  className="w-full mt-auto px-6 py-3 rounded-lg bg-gray-800 text-white font-medium hover:bg-gray-900 transition text-center"
                >
                  Contact Sales
                </Link>
              </div>
            </div>
          </motion.div>
        </section>
      </main>
      <Footer />
    </div>
  );
}