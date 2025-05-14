"use client";
import { motion } from "framer-motion";
import { Edit3, Zap, ShoppingBag, Users } from 'lucide-react';

const featuresData = [
  {
    title: "Prompt Editor",
    description: "Multi-model support for ChatGPT, Claude, Midjourney, DALL·E, and more.",
    icon: Edit3,
    color: "text-purple-500",
    bgColor: "bg-purple-100",
  },
  {
    title: "AI-Powered Refinement",
    description: "Get suggestions and improvements for your prompts, powered by AI.",
    icon: Zap,
    color: "text-blue-500",
    bgColor: "bg-blue-100",
  },
  {
    title: "Prompt Marketplace",
    description: "Buy and sell high-performance prompts. Monetize your expertise.",
    icon: ShoppingBag,
    color: "text-green-500",
    bgColor: "bg-green-100",
  },
  {
    title: "Team Libraries & Version Control",
    description: "Organize prompts, manage teams, and track changes with full version history.",
    icon: Users,
    color: "text-yellow-500",
    bgColor: "bg-yellow-100",
  },
];

interface FeatureSectionProps {
  id?: string;
  showTitle?: boolean;
}

export default function FeatureSection({ id, showTitle = true }: FeatureSectionProps) {
  return (
    <section id={id} className="max-w-7xl mx-auto px-6 py-20 sm:py-24">
      {showTitle && (
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-semibold mb-4 text-gray-900">
            Core Features of PromptCrate
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover the powerful tools that make PromptCrate the ultimate workspace for AI prompt engineering.
          </p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {featuresData.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-gray-50 p-8 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300"
          >
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-6 ${feature.bgColor} ${feature.color}`}>
              <feature.icon size={28} />
            </div>
            <h3 className="text-2xl font-semibold mb-3 text-gray-900">{feature.title}</h3>
            <p className="text-gray-600 leading-relaxed">{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
} 