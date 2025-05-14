"use client";
import React from 'react';
import Navbar from '../(components)/layout/Navbar'; // Import the main Navbar
import Footer from '../(components)/shared/Footer';
import FeatureSection from "../(components)/FeatureSection"; // Adjusted path
import { motion } from "framer-motion";
import { Edit3, Zap, ShoppingBag, Users, ArrowRight, CheckCircle } from 'lucide-react'; // Example icons

const features = [
  {
    title: "Prompt Editor",
    description: "Multi-model support for ChatGPT, Claude, Midjourney, DALL·E, and more.",
    icon: Edit3,
    color: "text-purple-500",
  },
  {
    title: "AI-Powered Refinement",
    description: "Get suggestions and improvements for your prompts, powered by AI.",
    icon: Zap,
    color: "text-blue-500",
  },
  {
    title: "Prompt Marketplace",
    description: "Buy and sell high-performance prompts. Monetize your expertise.",
    icon: ShoppingBag,
    color: "text-green-500",
  },
  {
    title: "Team Libraries & Version Control",
    description: "Organize prompts, manage teams, and track changes with full version history.",
    icon: Users,
    color: "text-yellow-500",
  },
];

export default function FeaturesPage() {
  return (
    <div className="bg-white min-h-screen w-full font-sans text-gray-900">
      <Navbar /> {/* Use the main Navbar component */}

      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16"
      >
        <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center mb-12 md:mb-16"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-gray-900 mb-4">
            Unlock the Full Potential of <span className="text-purple-600">Prompt Engineering</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            PromptCrate provides a comprehensive suite of tools to help you create, refine, organize, and monetize your AI prompts efficiently.
          </p>
        </motion.div>

        <FeatureSection showTitle={true} /> {/* Using the reusable component */}

        <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-16 md:mt-24"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-10 md:mb-12">
            More Reasons to Choose PromptCrate
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            {[
              { title: "Version Control & History", description: "Track changes to your prompts, revert to previous versions, and collaborate with ease.", icon: <CheckCircle className="text-green-500" /> },
              { title: "Team Collaboration", description: "Share prompts with your team, manage access permissions, and work together on projects.", icon: <CheckCircle className="text-green-500" /> },
              { title: "Advanced Analytics", description: "Gain insights into prompt performance, usage statistics, and identify areas for improvement.", icon: <CheckCircle className="text-green-500" /> },
              { title: "Multi-Model Support", description: "Seamlessly switch between different AI models (OpenAI, Anthropic, etc.) for your prompts.", icon: <CheckCircle className="text-green-500" /> },
              { title: "Secure Storage", description: "Your prompts are stored securely with robust access controls and encryption.", icon: <CheckCircle className="text-green-500" /> },
              { title: "Bulk Import/Export", description: "Easily migrate your existing prompt libraries to and from PromptCrate.", icon: <CheckCircle className="text-green-500" /> },
            ].map((feature, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center gap-3 mb-3">
                  {feature.icon}
                  <h3 className="text-xl font-semibold text-gray-800">{feature.title}</h3>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          className="text-center py-12 bg-gray-100 rounded-xl shadow-inner border border-gray-200 max-w-7xl mx-auto px-6 mb-24"
          initial={{ opacity: 0}}
          whileInView={{ opacity: 1}}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }} // Adjusted delay
        >
          <h2 className="text-3xl font-semibold mb-4 text-gray-900">Ready to Supercharge Your Prompts?</h2>
          <p className="text-gray-600 mb-8 max-w-xl mx-auto">
            Join PromptCrate today and take your AI interactions to the next level.
          </p>
          <a
            href="/" // Point to landing page waitlist section, or a signup page
            className="bg-purple-600 text-white px-8 py-4 rounded-xl shadow hover:bg-purple-700 transition text-lg font-semibold inline-flex items-center gap-2"
          >
            Start for Free <ArrowRight size={20}/>
          </a>
        </motion.div>
      </motion.main>

      <Footer />
    </div>
  );
} 