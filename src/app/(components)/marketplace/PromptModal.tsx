"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon, ClipboardCopy, Code, ShoppingCart, AlertTriangle, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation'; // For "Open in Editor"

// Using the full MarketplacePrompt type from the page
import { type MarketplacePrompt } from '@/app/marketplace/page'; // Assuming this path and type export

interface PromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  prompt: MarketplacePrompt | null; // Use the full type
  userPlan?: 'free' | 'pro' | 'enterprise' | null;
  isOwned?: boolean; // Example: if the user has purchased this specific paid prompt
  // TODO: Add a function prop for triggering an upgrade modal for free users
  // onUpgradeRequired: () => void; 
}

const PromptModal: React.FC<PromptModalProps> = ({ 
  isOpen, 
  onClose, 
  prompt, 
  userPlan = null, 
  isOwned = false,
  // onUpgradeRequired 
}) => {
  const router = useRouter();

  if (!isOpen || !prompt) {
    return null;
  }

  const isPaidPrompt = typeof prompt.price === 'number' && prompt.price > 0;

  // Access Rules
  const canViewFullPrompt = !isPaidPrompt || isOwned || userPlan === 'pro' || userPlan === 'enterprise';
  const canCopy = !isPaidPrompt || isOwned || userPlan === 'pro' || userPlan === 'enterprise';
  
  const canOpenInEditor = (userPlan === 'pro' || userPlan === 'enterprise') || (isPaidPrompt && isOwned);
  // Free users can't open in editor directly from here, even if they own a paid prompt.
  // They'd typically use it if it was saved to their library after purchase.
  // OR, if we allow free users to *test* even community/paid prompts (but not save), this logic might change.
  // For now, sticking to: Pro/Enterprise for direct open.

  const showUpgradeForEditor = userPlan === 'free' && (!isPaidPrompt || (isPaidPrompt && !isOwned)); // Show if free and tries to open non-owned/free prompt
  const showBuyButton = isPaidPrompt && !isOwned;

  const handleCopy = async () => {
    if (!prompt.promptBody || !canCopy) return;
    try {
      await navigator.clipboard.writeText(prompt.promptBody);
      console.log('Prompt copied to clipboard!'); // Placeholder for toast
      // TODO: Show toast notification: "Prompt copied!"
    } catch (err) {
      console.error('Failed to copy text: ', err);
      // TODO: Show error toast
    }
  };

  const handleOpenInEditor = () => {
    if (!canOpenInEditor || !prompt) return;
    
    // if (userPlan === 'free') {
    //   // onUpgradeRequired(); // Call a function to show an "Upgrade to Pro" modal
    //   console.log("Upgrade to Pro to open in editor."); // Placeholder
    //   return;
    // }

    const queryParams = new URLSearchParams({
      title: prompt.title,
      prompt: prompt.promptBody,
      model: prompt.model || '',
      source: prompt.source || '',
      id: prompt.id,
    });
    router.push(`/app/editor?${queryParams.toString()}`);
  };

  const handleBuy = () => {
    if (!showBuyButton || !prompt) return;
    console.log(`Buy prompt: ${prompt.id}, Price: ${prompt.price}`); // Placeholder
    // TODO: Integrate with Stripe or redirect to checkout page
    // router.push(`/checkout?promptId=${prompt.id}`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "circOut" }}
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between p-5 sm:p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900" title={prompt.title}>
                  {prompt.title}
                </h2>
                {prompt.model && (
                  <div className="mt-1 text-xs sm:text-sm text-gray-500">
                    Model: <span className="font-medium text-gray-700">{prompt.model}</span>
                    {prompt.source === 'community' && <span className="ml-2 inline-block px-2 py-0.5 text-xs font-semibold text-purple-700 bg-purple-100 rounded-full">Community</span>}
                    {prompt.source === 'user' && prompt.author && <span className="ml-2 inline-block px-2 py-0.5 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full">@{prompt.author}</span>}
                  </div>
                )}
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 -m-1"
                aria-label="Close modal"
              >
                <XIcon size={22} />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-grow" style={{ maxHeight: 'calc(100vh - 230px)' }}>
              {canViewFullPrompt ? (
                <div className="font-mono text-sm bg-gray-50 rounded-md p-3.5 sm:p-4 max-h-[300px] sm:max-h-[400px] overflow-y-scroll border border-gray-200 focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-purple-500">
                  <pre className="whitespace-pre-wrap break-words text-gray-800">{prompt.promptBody}</pre>
                </div>
              ) : (
                <div className="relative font-mono text-sm bg-gray-100 rounded-md p-4 h-[200px] overflow-hidden border border-gray-200">
                  <div className="absolute inset-0 backdrop-blur-md flex flex-col items-center justify-center text-center p-4 z-10">
                    <AlertTriangle size={28} className="text-yellow-500 mb-2" />
                    <p className="font-semibold text-gray-700 text-base">Full prompt is protected</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {userPlan === 'free' && isPaidPrompt ? 
                       "Upgrade to Pro or purchase this prompt to view its full content." : 
                       "This content is currently unavailable."}
                    </p>
                  </div>
                  {/* Blurred content */}
                  <pre className="whitespace-pre-wrap break-words text-transparent blur select-none">
                    {prompt.promptBody.substring(0, 500)} {/* Show a portion for blur effect */}
                  </pre>
                </div>
              )}
            </div>

            {/* Footer - Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 sm:gap-3 p-4 sm:p-5 border-t border-gray-200 bg-gray-50">
              <button 
                onClick={handleCopy}
                disabled={!canCopy}
                className="w-full sm:w-auto px-4 py-2.5 text-sm font-medium rounded-lg transition-colors shadow-sm flex items-center justify-center
                           text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 
                           disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                <ClipboardCopy size={16} className="mr-2" />
                Copy
              </button>
              
              {showBuyButton ? (
                <button 
                  onClick={handleBuy}
                  className="w-full sm:w-auto px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center"
                >
                  <ShoppingCart size={16} className="mr-2" />
                  Buy Prompt {prompt.price && typeof prompt.price === 'number' ? `($${prompt.price.toFixed(2)})` : ''}
                </button>
              ) : ( // Only show "Open in Editor" if not a buyable prompt currently
                <button 
                  onClick={handleOpenInEditor}
                  disabled={!canOpenInEditor || showUpgradeForEditor}
                  title={showUpgradeForEditor ? "Upgrade to Pro to open in editor" : "Open in PromptCrate Editor"}
                  className="w-full sm:w-auto px-5 py-2.5 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors shadow-sm flex items-center justify-center
                             disabled:bg-purple-300 disabled:cursor-not-allowed"
                >
                  {showUpgradeForEditor ? <AlertTriangle size={16} className="mr-2" /> : <Code size={16} className="mr-2" />}
                  {showUpgradeForEditor ? 'Upgrade to Use' : 'Open in Editor'}
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PromptModal; 