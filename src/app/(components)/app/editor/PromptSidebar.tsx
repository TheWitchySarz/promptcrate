'use client';

import React from 'react';
import { FilePlus2, History, MessageSquareText, Trash2, Loader2 } from 'lucide-react'; // Updated icons
import type { Prompt } from '@/app/app/editor/page'; // Adjusted import path using @ alias

// Mock data for prompts - will be removed or replaced by props
// const mockUserPrompts = []; // Example of empty state

interface PromptSidebarProps {
  prompts: Prompt[]; // Use the full Prompt type
  onNewPrompt: () => void;
  onSelectPrompt: (promptId: string) => void;
  selectedPromptId?: string | null; // Updated from activePromptId
  onDeletePrompt?: (promptId: string) => void; // Made optional
  isLoading?: boolean;
  className?: string; // Added for styling flexibility
}

const PromptSidebar: React.FC<PromptSidebarProps> = ({
  prompts,
  onNewPrompt,
  onSelectPrompt,
  selectedPromptId, // Updated from activePromptId
  onDeletePrompt,
  isLoading = false,
  className = '',
}) => {
  // Handle delete button click
  const handleDeleteClick = (e: React.MouseEvent, promptId: string) => {
    e.stopPropagation(); // Prevent onSelectPrompt from firing
    if (onDeletePrompt) {
      onDeletePrompt(promptId);
    }
  };

  return (
    <aside className={`bg-white border-r border-gray-200 flex flex-col h-full p-0 ${className}`}>
      {/* Header and New Prompt Button */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">My Prompts</h2>
        <button 
          onClick={onNewPrompt}
          title="Create new prompt"
          className="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <FilePlus2 size={20} />
        </button>
      </div>

      {/* Prompt List */}
      <div className="flex-grow overflow-y-auto p-3 space-y-1">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 size={24} className="text-gray-400 animate-spin" />
            <p className="ml-2 text-sm text-gray-500">Loading prompts...</p>
          </div>
        ) : prompts.length > 0 ? (
          prompts.map(prompt => (
            <li key={prompt.id} className="list-none group">
              <button 
                onClick={() => onSelectPrompt(prompt.id)}
                title={prompt.title}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-md text-left transition-colors 
                            ${selectedPromptId === prompt.id 
                              ? 'bg-purple-100 text-purple-700 font-medium' 
                              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}`}
              >
                <MessageSquareText size={16} className={`${selectedPromptId === prompt.id ? 'text-purple-600' : 'text-gray-400'}`} />
                <span className="truncate flex-grow">{prompt.title}</span>
                {onDeletePrompt && (
                  <button 
                    type="button" 
                    onClick={(e) => handleDeleteClick(e, prompt.id)}
                    title="Delete prompt"
                    className="p-1 -mr-1 text-gray-400 hover:text-red-500 rounded-md focus:outline-none focus:ring-1 focus:ring-red-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </button>
            </li>
          ))
        ) : (
          <div className="text-center py-10 px-4 h-full flex flex-col items-center justify-center">
            <MessageSquareText size={32} className="text-gray-300 mb-3" />
            <p className="text-sm font-medium text-gray-600">No saved prompts yet.</p>
            <p className="text-xs text-gray-400 mt-1">Click "+ New Prompt" to get started.</p>
          </div>
        )}
      </div>
      
      {/* Future: Toggle for Personal/Team Library can go here or in header */}
      {/* <div className="p-3 border-t border-gray-200">
        <p className="text-xs text-gray-400">Future: Library Toggle</p>
      </div> */}
    </aside>
  );
}

export default PromptSidebar; 