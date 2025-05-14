'use client';

import React from 'react';
import { FilePlus2, History, MessageSquareText } from 'lucide-react'; // Updated icons

// Mock data for prompts - will be removed or replaced by props
// const mockUserPrompts = []; // Example of empty state

interface PromptSidebarProps {
  prompts: Array<{ id: string; title: string; }>; // Expecting prompts as a prop
  onNewPrompt: () => void;
  onSelectPrompt: (promptId: string) => void;
  activePromptId?: string | null;
}

const PromptSidebar: React.FC<PromptSidebarProps> = ({
  prompts,
  onNewPrompt,
  onSelectPrompt,
  activePromptId,
}) => {
  return (
    <aside className="w-64 md:w-72 bg-white border-r border-gray-200 flex flex-col h-full p-0">
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
        {prompts.length > 0 ? (
          prompts.map(prompt => (
            <li key={prompt.id} className="list-none">
              <button 
                onClick={() => onSelectPrompt(prompt.id)}
                title={prompt.title}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-md text-left transition-colors 
                            ${activePromptId === prompt.id 
                              ? 'bg-purple-100 text-purple-700 font-medium' 
                              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}`}
              >
                <MessageSquareText size={16} className={`${activePromptId === prompt.id ? 'text-purple-600' : 'text-gray-400'}`} />
                <span className="truncate flex-grow">{prompt.title}</span>
                {/* Optional: Add a history icon or other indicators here */}
                {/* <History size={14} className="text-gray-400 hover:text-gray-600 ml-auto flex-shrink-0" /> */}
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