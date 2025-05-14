'use client';

import React from 'react';
import { Save, Sparkles, Play, Settings2, Info } from 'lucide-react';
// Import AI_MODELS from the new constants file
import { AI_MODELS as availableEditorModelsConstant } from '../../../../lib/constants/marketplaceConstants';

interface ModelOption {
    id: string;
    name: string;
}

interface PromptBuilderProps {
  title: string;
  onTitleChange: (newTitle: string) => void;
  model: string;
  onModelChange: (newModel: string) => void;
  promptContent: string;
  onPromptContentChange: (newContent: string) => void;
  onSave: () => void;
  onRefine: () => void;
  onTest: () => void;
  isSaving?: boolean;
  isTesting?: boolean;
  isNewPrompt?: boolean; // Added prop
}

const PromptBuilder: React.FC<PromptBuilderProps> = ({
  title,
  onTitleChange,
  model,
  onModelChange,
  promptContent,
  onPromptContentChange,
  onSave,
  onRefine,
  onTest,
  isSaving,
  isTesting,
  isNewPrompt,
}) => {
  const editorModels: ModelOption[] = availableEditorModelsConstant.filter(m => m.id !== 'all');

  return (
    <section className="flex-grow lg:w-1/2 bg-white rounded-lg shadow border border-gray-200 p-4 md:p-6 flex flex-col space-y-4 h-full">
      {/* Title Input */}
      <input 
        type="text" 
        value={title} 
        onChange={(e) => onTitleChange(e.target.value)} 
        placeholder="Untitled Prompt" 
        className="w-full text-xl font-semibold text-gray-900 placeholder-gray-400 border-0 border-b-2 border-gray-200 focus:ring-0 focus:border-purple-600 pb-2 outline-none"
      />

      {/* Model Selector Row */}
      <div className="flex items-center gap-3">
        <label htmlFor="model-select" className="text-sm font-medium text-gray-700 whitespace-nowrap">AI Model:</label>
        <select 
          id="model-select"
          value={model} 
          onChange={(e) => onModelChange(e.target.value)} 
          className="flex-grow appearance-none text-sm bg-gray-50 border border-gray-300 rounded-md px-3 py-1.5 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 shadow-sm cursor-pointer outline-none"
        >
          {editorModels.map(m => (
            <option key={m.id} value={m.name}>{m.name}</option> // Using m.name for value to match current state management
          ))}
        </select>
      </div>

      {/* Prompt Textarea with Label and Info Tooltip */}
      <div className="flex flex-col flex-grow min-h-[200px]">
        <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="prompt-content" className="text-sm font-medium text-gray-700">Prompt Content</label>
            <span title="Use {{curly_braces}} for variables. E.g., 'Translate {{text}} into {{language}}.'">
              <Info size={16} className="text-gray-400 hover:text-gray-600 cursor-help" />
            </span>
        </div>
        <textarea 
            id="prompt-content"
            value={promptContent} 
            onChange={(e) => onPromptContentChange(e.target.value)} 
            placeholder="Enter your AI prompt here…\nExample: Summarize the following text for a 5th grader: {{text_to_summarize}}"
            className="flex-grow w-full p-3 rounded-md border border-gray-300 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 shadow-sm font-mono text-sm leading-relaxed resize-none outline-none"
        />
      </div>

      {/* Action Bar - pushed to bottom by flex-grow on textarea container */}
      <div className="border-t border-gray-200 pt-4 mt-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <button 
          onClick={onRefine}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-purple-700 bg-purple-50 rounded-md hover:bg-purple-100 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:opacity-50 w-full sm:w-auto justify-center"
          title="Refine with AI (Coming Soon)"
          disabled // Feature not implemented yet
        >
          <Sparkles size={14} /> Refine with AI
        </button>
        <div className="flex gap-2 w-full sm:w-auto">
          <button 
            onClick={onSave}
            disabled={isSaving || !title.trim()} // Disable if no title
            className={`flex-grow sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-60
                        ${isNewPrompt || !title.trim() ? 'bg-purple-600 text-white hover:bg-purple-700 focus:ring-purple-500' : 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400'}`}
          >
            <Save size={16} /> {isSaving ? 'Saving...' : (isNewPrompt ? 'Save New' : 'Update')}
          </button>
          <button 
            onClick={onTest}
            disabled={isTesting || !promptContent.trim()} // Disable if no content
            className="flex-grow sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 disabled:opacity-60"
          >
            <Play size={16} /> {isTesting ? 'Testing...' : 'Test'}
          </button>
        </div>
      </div>
    </section>
  );
}

export default PromptBuilder; 