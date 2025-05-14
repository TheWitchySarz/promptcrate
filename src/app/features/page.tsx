"use client";
import React from 'react';
import Link from 'next/link';
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

const FeaturesPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      <main className="flex-grow">
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

          {/* Call to Action Button */}
          <section className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-6 text-center">
              <h2 className="text-3xl sm:text-4xl font-semibold text-gray-900 mb-6">
                Ready to Elevate Your Prompts?
              </h2>
              <p className="text-lg text-gray-600 mb-10 max-w-xl mx-auto">
                Join PromptCrate today and transform your AI interactions.
              </p>
              <Link
                href="/signup"
                className="px-10 py-4 text-lg font-semibold text-white bg-purple-600 rounded-lg shadow-md hover:bg-purple-700 transition-colors duration-150 ease-in-out"
              >
                Start for Free
              </Link>
            </div>
          </section>
        </motion.main>
      </main>
      <Footer />
    </div>
  );
};

export default FeaturesPage; 