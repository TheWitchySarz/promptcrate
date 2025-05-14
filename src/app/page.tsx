"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import FeatureSection from "./(components)/FeatureSection";
import { useState } from 'react';
import { CheckCircle, Mail } from 'lucide-react';
import Navbar from './(components)/layout/Navbar';
import Footer from './(components)/shared/Footer';
import Link from 'next/link';

function UIMockupSection() {
  const [activeTab, setActiveTab] = useState("editor");
  const [isMockTesting, setIsMockTesting] = useState(false);
  const [mockOutputContent, setMockOutputContent] = useState('');
  const [showMockOutput, setShowMockOutput] = useState(false);

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
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h2 className="text-3xl sm:text-4xl font-semibold mb-6 text-gray-900">See PromptCrate in Action</h2>
        <p className="text-lg text-gray-600 mb-12 max-w-xl mx-auto">
          Experience the intuitive interface of our prompt editor and the vibrant marketplace.
        </p>
        <div className="flex justify-center gap-4 mb-10">
          <button
            onClick={() => setActiveTab("editor")}
            className={`px-6 py-3 rounded-lg font-medium transition-colors duration-200 ease-in-out 
                        ${activeTab === "editor" 
                          ? "bg-purple-600 text-white shadow-md"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
          >
            Prompt Editor
          </button>
          <button
            onClick={() => setActiveTab("marketplace")}
            className={`px-6 py-3 rounded-lg font-medium transition-colors duration-200 ease-in-out 
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
              className="w-full h-full flex flex-col bg-gray-50 rounded-md p-4 md:p-6 text-left overflow-auto"
            >
              {/* Editor Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <input type="text" defaultValue="My Awesome Prompt Title" className="w-full sm:w-2/3 bg-white border border-gray-300 rounded-md px-3 py-2 text-sm font-medium text-gray-700 focus:ring-1 focus:ring-purple-500 focus:border-purple-500" />
                <select className="w-full sm:w-auto bg-white border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-600 focus:ring-1 focus:ring-purple-500 focus:border-purple-500">
                  <option>ChatGPT-4 Turbo</option>
                  <option>Claude 3 Opus</option>
                  <option>Gemini Pro</option>
                </select>
              </div>
              {/* Editor Text Area */}
              <textarea 
                readOnly 
                className="flex-grow w-full bg-gray-800 text-gray-200 font-mono text-xs sm:text-sm p-4 rounded-md resize-none border border-gray-700 shadow-inner leading-relaxed focus:outline-none"
                value="Generate a marketing email campaign for a new {{product_name}} targeting {{target_audience}}.\\n\\nInclude:\\n- A catchy subject line.\\n- An engaging introduction.\\n- 3 key benefits of the {{product_name}}.\\n- A clear call to action to {{desired_action}}."
              />
              {/* Editor Footer/Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 mt-4">
                <Link
                  href="/signup"
                  className="px-4 py-2 text-xs sm:text-sm font-medium text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors text-center w-full sm:w-auto"
                >
                  Save Draft
                </Link>
                <button 
                  onClick={handleMockTest}
                  disabled={isMockTesting}
                  className="px-4 py-2 text-xs sm:text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed w-full sm:w-auto"
                >
                  {isMockTesting ? 'Testing...' : 'Test Prompt'}
                </button>
              </div>

              {/* Mock AI Output Section */}
              {showMockOutput && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: '1rem' }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="bg-gray-800 border border-gray-700 rounded-md p-4 text-left mt-4 shadow-inner"
                >
                  <h4 className="text-sm font-semibold text-purple-400 mb-2">Mock AI Output:</h4>
                  <pre className="whitespace-pre-wrap text-xs sm:text-sm text-gray-200 font-sans leading-relaxed select-text">
                    {mockOutputContent}
                  </pre>
                  <button 
                    onClick={() => setShowMockOutput(false)}
                    className="text-xs text-purple-400 hover:text-purple-300 mt-3 underline"
                  >
                    Clear Output
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}
          {activeTab === "marketplace" && (
            <motion.div 
              key="marketplace-view"
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="w-full h-full flex flex-col bg-gray-100 rounded-md p-4 md:p-6 text-left overflow-auto"
            >
              <h3 className="text-xl font-semibold text-gray-700 mb-4">Explore Prompts</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { title: "SEO Blog Post Wizard", author: "AI Enthusiast", price: "$10", model: "ChatGPT-4" },
                  { title: "Twitter Thread Generator", author: "SocialNinja", price: "Free", model: "Claude 2" },
                  { title: "Code Explanation Pro", author: "DevGuru", price: "$15", model: "Gemini Pro" },
                  { title: "Landing Page Copywriter", author: "MarketingMaven", price: "$20", model: "ChatGPT-4" },
                ].map((prompt, index) => (
                  <div key={index} className="bg-white rounded-lg shadow border border-gray-200 p-4 flex flex-col text-sm">
                    <h4 className="text-base font-semibold text-purple-700 mb-1 truncate">{prompt.title}</h4>
                    <p className="text-gray-500 mb-1 text-xs">By: {prompt.author}</p>
                    <p className="text-xs text-gray-400 mb-2">Model: <span className="font-medium text-gray-600">{prompt.model}</span></p>
                    <p className="text-lg font-bold text-gray-800 mb-3">{prompt.price}</p>
                    <Link 
                      href="/signup"
                      className="mt-auto w-full px-3 py-1.5 text-xs font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 transition-colors text-center"
                    >
                      View Prompt
                    </Link>
                  </div>
                ))}
              </div>
               <p className="text-sm text-gray-500 mt-6 text-center">...and many more!</p>
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
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleWaitlistSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsSubmitted(false);

    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    if (!/\\S+@\\S+\\.\\S+/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    console.log('Waitlist submitted:', email);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSubmitted(true);
    setEmail('');
  };

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
          >
            <span className="inline-block text-lg font-semibold tracking-wide text-purple-600 mb-4">Create. Refine. Monetize.</span>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-semibold mb-12 leading-tight">
              Your AI prompt command center.
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl mx-auto font-normal">
              Create, refine, and monetize prompts across any AI model — ChatGPT, Claude, Midjourney, and more.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <a
                href="/#waitlist"
                className="bg-purple-600 text-white px-6 py-3 rounded-xl shadow hover:bg-purple-700 transition font-medium text-base"
              >
                Join the Waitlist
              </a>
              <a
                href="/#features"
                className="text-purple-600 px-6 py-3 rounded-xl font-medium hover:underline transition text-base"
              >
                How it Works
              </a>
            </div>
            <div className="mt-12 flex justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="w-full max-w-md md:max-w-lg lg:max-w-xl h-auto bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 rounded-2xl p-4 shadow-xl border border-gray-200"
              >
                <div className="w-full h-full bg-white rounded-lg shadow-inner p-3 flex flex-col aspect-[16/9]">
                  {/* Top bar */}
                  <div className="flex items-center gap-1.5 mb-2 flex-shrink-0">
                    <span className="w-3 h-3 bg-red-400 rounded-full opacity-70"></span>
                    <span className="w-3 h-3 bg-yellow-400 rounded-full opacity-70"></span>
                    <span className="w-3 h-3 bg-green-400 rounded-full opacity-70"></span>
                  </div>
                  {/* Content Area - Made more generic */}
                  <div className="flex-grow bg-gray-50 rounded p-3 opacity-80 flex flex-col justify-center items-center">
                    <div className="h-3 bg-purple-200 rounded w-3/4 mb-1.5"></div>
                    <div className="h-3 bg-purple-100 rounded w-1/2 mb-1.5"></div>
                    <div className="h-3 bg-purple-100 rounded w-2/3"></div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </section>

        <FeatureSection id="features" showTitle={false} />

        <UIMockupSection />

        <WhyPromptCrateSection />

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
                  <li className="flex items-center"><CheckCircle className="text-green-500 mr-2 flex-shrink-0" size={18}/> Limited prompt library</li>
                  <li className="flex items-center"><CheckCircle className="text-green-500 mr-2 flex-shrink-0" size={18}/> Basic editor features</li>
                  <li className="flex items-center"><CheckCircle className="text-green-500 mr-2 flex-shrink-0" size={18}/> Community access</li>
                </ul>
                <a href="/signup?plan=free" className="w-full mt-auto px-6 py-3 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition text-center"> 
                  Get Started
                </a>
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
                  <li className="flex items-center"><CheckCircle className="text-green-500 mr-2 flex-shrink-0" size={18}/> Advanced editor & AI Refinement</li>
                  <li className="flex items-center"><CheckCircle className="text-green-500 mr-2 flex-shrink-0" size={18}/> Create team libraries (up to 5 users)</li>
                  <li className="flex items-center"><CheckCircle className="text-green-500 mr-2 flex-shrink-0" size={18}/> Sell on Marketplace (10% commission)</li>
                  <li className="flex items-center"><CheckCircle className="text-green-500 mr-2 flex-shrink-0" size={18}/> Priority support</li>
                </ul>
                <a href="/signup?plan=pro" className="w-full mt-auto px-6 py-3 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 transition text-center">
                  Choose Pro
                </a>
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
                <a href="/contact?plan=enterprise" className="w-full mt-auto px-6 py-3 rounded-lg bg-gray-800 text-white font-medium hover:bg-gray-900 transition text-center">
                  Contact Sales
                </a>
              </div>
            </div>
          </motion.div>
        </section>

        <section id="waitlist" className="max-w-3xl mx-auto px-6 py-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-3xl sm:text-4xl font-semibold mb-6 text-gray-900">Be the First to Experience PromptCrate</h2>
            <p className="text-lg text-gray-600 mb-10 max-w-xl mx-auto">
              Join our waitlist to get early access, exclusive updates, and a special launch day offer.
            </p>
            
            {isSubmitted ? (
              <div className="bg-green-50 border border-green-300 text-green-700 px-6 py-4 rounded-lg text-center">
                <CheckCircle className="inline-block mr-2 mb-1" size={22}/>
                <span className="font-semibold">Thanks for joining!</span> We'll be in touch soon.
              </div>
            ) : (
              <form onSubmit={handleWaitlistSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
                <div className="relative flex-grow">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input 
                    type="email" 
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com" 
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 shadow-sm text-gray-800" 
                    required 
                  />
                </div>
                <button 
                  type="submit"
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg shadow hover:bg-purple-700 transition font-medium text-base whitespace-nowrap"
                >
                  Join Waitlist
                </button>
              </form>
            )}
            {error && <p className="text-red-500 text-sm mt-3">{error}</p>}

            <p className="text-xs text-gray-500 mt-6">
              We respect your privacy. No spam, unsubscribe anytime.
            </p>
          </motion.div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
