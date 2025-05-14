'use client';

import React from 'react';
import { Eye, Cpu, Tag } from 'lucide-react'; // Added Tag icon for price
import { useRouter } from 'next/navigation'; // For client-side navigation

interface PromptCardProps {
  id: string; // Unique ID for the prompt
  title: string;
  promptBody: string; // Full prompt content
  model?: string; // Optional, will default
  source?: 'community' | 'user' | string; // For badge and differentiation
  author?: string; // Added for user-uploaded prompts
  onViewFullPrompt: (promptId: string) => void; // Callback to open modal
  price?: number | string; // Added price prop
  // We might add more props later, like tags, upvotes, etc.
}

const PromptCard: React.FC<PromptCardProps> = ({
  id,
  title,
  promptBody,
  model = 'GPT-3.5', // Default model for community prompts
  source,
  author,
  onViewFullPrompt,
  price,
}) => {
  // const router = useRouter(); // No longer directly navigating from card

  const snippetMaxLength = 80; // Adjusted for approx 1-2 lines
  const snippet = promptBody.length > snippetMaxLength 
    ? promptBody.substring(0, snippetMaxLength).trim() + '...' 
    : promptBody;

  // Removed handleOpenInEditor as navigation is now handled by the modal trigger

  const getBadgeTextAndStyles = () => {
    if (source === 'community') {
      return { text: 'Community', style: 'bg-purple-100 text-purple-700 border-purple-200' };
    }
    if (source === 'user') {
      const userText = author ? `Uploaded by: @${author}` : 'User Uploaded';
      return { text: userText, style: 'bg-blue-100 text-blue-700 border-blue-200' };
    }
    const defaultText = source ? source.charAt(0).toUpperCase() + source.slice(1) : 'Unknown Source';
    return { text: defaultText, style: 'bg-gray-100 text-gray-700 border-gray-200' };
  };

  const { text: badgeText, style: badgeStyle } = getBadgeTextAndStyles();

  const displayPrice = typeof price === 'number' ? `$${price.toFixed(2)}` : (price || 'Free');

  return (
    <div className="bg-white shadow-lg rounded-xl border border-gray-200 p-5 flex flex-col h-full transition-shadow hover:shadow-xl">
      <div className="flex-grow">
        {source && (
          <span 
            className={`inline-block px-2.5 py-0.5 text-xs font-medium rounded-full mb-2 border ${badgeStyle}`}
          >
            {badgeText}
          </span>
        )}
        <h3 className="text-lg font-semibold text-gray-800 mb-1.5 truncate" title={title}>
          {title}
        </h3>
        {/* Ensure this paragraph has a fixed height that accommodates 1-2 lines and uses overflow for truncation if snippet is still too long */}
        <p className="text-sm text-gray-600 mb-3 leading-relaxed h-12 overflow-hidden">
          {snippet}
        </p>
      </div>
      
      <div className="mt-auto">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <div className="flex items-center">
            <Cpu size={14} className="mr-1.5 text-gray-400" />
            <span>{model}</span>
          </div>
          {source === 'user' && (
            <div className="flex items-center font-medium text-green-600">
              <Tag size={14} className="mr-1 text-green-500" />
              <span>{displayPrice}</span>
            </div>
          )}
        </div>
        <button
          onClick={() => onViewFullPrompt(id)} // Updated onClick handler
          className="w-full flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors group"
        >
          View Full Prompt 
          <Eye size={16} className="ml-2 transition-transform group-hover:scale-110" /> {/* Changed icon */}
        </button>
      </div>
    </div>
  );
};

export default PromptCard; 