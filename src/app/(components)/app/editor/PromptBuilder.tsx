'use client';

import React, { useState, ChangeEvent } from 'react';
import { Save, Info, Brain, Loader2 } from 'lucide-react';
// Import AI_MODELS from the new constants file
import { AI_MODELS as availableEditorModelsConstant } from '@/lib/constants/marketplaceConstants';
import type { Prompt as PromptDataType } from '@/app/app/editor/page'; // Import the Prompt type

interface ModelOption {
    id: string;
    name: string;
}

// Type for the prompt data that PromptBuilder can work with
// It can be a full Prompt (from DB) or a new prompt yet to be saved (id: null)
export type EditablePromptData = PromptDataType | (Omit<PromptDataType, 'id' | 'user_id' | 'created_at' | 'updated_at'> & { id: null });

interface PromptBuilderProps {
  promptData: EditablePromptData | null; // Can be null if no prompt is active, though editor page initializes one
  onPromptDataChange: (updatedData: EditablePromptData) => void;
  onSavePrompt: () => void; // No longer takes arguments
  isSaving?: boolean;
  userRole?: string; // Add userRole prop to check if user is free or premium
  // isNewPrompt is now derived from !promptData?.id
}

const PromptBuilder: React.FC<PromptBuilderProps> = ({
  promptData,
  onPromptDataChange,
  onSavePrompt,
  isSaving,
  userRole = 'free', // Default to free if not provided
}) => {
  const editorModels: ModelOption[] = availableEditorModelsConstant.filter(m => m.id !== 'all');
  const [isRefining, setIsRefining] = useState(false);
  const [refineError, setRefineError] = useState<string | null>(null);

  // If promptData is null, we shouldn't render much of the builder or use defaults.
  // However, PromptEditorPage currently ensures promptData is always an object (defaultNewPrompt).
  // For robustness, let's handle potential null, though it might be an edge case based on current parent logic.
  if (!promptData) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-800 rounded-xl p-6 text-gray-400">
        Select a prompt or create a new one to start editing.
      </div>
    );
  }

  const { title, content: prompt_content, model } = promptData;
  const isNewPrompt = promptData.id === null;

  const isPremiumUser = userRole === 'pro' || userRole === 'enterprise';

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onPromptDataChange({
      ...promptData,
      [name]: value,
    });
    if (name === 'content' && refineError) {
        setRefineError(null); // Clear error on manual edit of prompt content
    }
  };

  const handleModelChange = (e: ChangeEvent<HTMLSelectElement>) => {
    onPromptDataChange({
      ...promptData,
      model: e.target.value,
    });
  };

  const handlePromptContentChange = (newContent: string) => {
    onPromptDataChange({
        ...promptData,
        content: newContent,
    });
  };

  const handleRefineWithAI = async () => {
    if (!isPremiumUser) {
      setRefineError("AI refinement is a premium feature. Please upgrade to Pro.");
      return;
    }

    if (!prompt_content || !prompt_content.trim()) {
      setRefineError("Please enter some prompt text to refine.");
      return;
    }
    setIsRefining(true);
    setRefineError(null);
    handlePromptContentChange(''); // Clear existing prompt content

    try {
      const response = await fetch('/api/refine-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt_content, model: model }), // Use model from promptData
      });

      if (!response.ok) {
        let errorData = { error: `API request failed with status ${response.status}` };
        try { errorData = await response.json(); } catch (parseError) { /* ignore */ }
        throw new Error(errorData.error || `API request failed with status ${response.status}`);
      }
      if (!response.body) throw new Error("Response body is null.");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedResponse = "";
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        accumulatedResponse += chunk;
        handlePromptContentChange(accumulatedResponse); // Update UI incrementally
      }
    } catch (error) {
      console.error("Error refining prompt:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during refinement.";
      setRefineError(errorMessage);
      // Optionally restore original prompt_content here if refinement fails significantly
    } finally {
      setIsRefining(false);
    }
  };

  return (
    <section className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 p-4 sm:p-6 flex flex-col space-y-4 h-full">
      {/* Title Input - dark background, light text */}
      <input 
        type="text" 
        name="title"
        value={title} 
        onChange={handleInputChange} 
        placeholder="Untitled Prompt" 
        className="w-full text-xl font-semibold bg-gray-700 text-gray-100 placeholder-gray-400 border border-gray-600 rounded-md px-3 py-2 focus:ring-1 focus:ring-purple-500 focus:border-purple-600 outline-none disabled:opacity-50"
        disabled={isSaving || isRefining}
      />

      {/* Model Selector Row - dark background for select, light text */}
      <div className="flex items-center gap-3">
        <label htmlFor="model-select" className="text-sm font-medium text-gray-300 whitespace-nowrap">AI Model:</label>
        <select 
          id="model-select"
          name="model"
          value={model || ''}
          onChange={handleModelChange}
          className="flex-grow appearance-none text-sm bg-gray-700 text-gray-100 border border-gray-600 rounded-md px-3 py-1.5 focus:ring-1 focus:ring-purple-500 focus:border-purple-600 shadow-sm cursor-pointer outline-none disabled:opacity-50"
          disabled={isSaving || isRefining}
        >
          {editorModels.map(m => (
            <option key={m.id} value={m.id} className="bg-gray-700 text-gray-100">{m.name}</option>
          ))}
        </select>
      </div>

      {/* Prompt Textarea - dark background, light text */}
      <div className="flex flex-col flex-grow min-h-[300px]">
        <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="prompt-content" className="text-sm font-medium text-gray-300">Prompt Content</label>
            <span title="Use {{curly_braces}} for variables. E.g., 'Translate {{text}} into {{language}}.'">
              <Info size={16} className="text-gray-400 hover:text-gray-300 cursor-help" />
            </span>
        </div>
        <textarea 
            id="prompt-content"
            name="content"
            value={prompt_content || ''} 
            onChange={handleInputChange}
            placeholder="Enter your AI prompt here…\nExample: Summarize the following text for a 5th grader: {{text_to_summarize}}"
            className="flex-grow w-full p-3 bg-gray-700 text-gray-100 placeholder-gray-400 rounded-md border border-gray-600 focus:ring-1 focus:ring-purple-500 focus:border-purple-600 shadow-sm font-mono text-sm leading-relaxed resize-none outline-none disabled:opacity-50"
            disabled={isSaving || isRefining}
        />
        {refineError && <p className="text-red-400 text-xs mt-1 px-1">Error: {refineError}</p>}
      </div>

      {/* Action Bar */}
      <div className="border-t border-gray-700 pt-4 mt-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <button
            type="button"
            onClick={handleRefineWithAI}
            disabled={isRefining || isSaving || !prompt_content || !prompt_content.trim() || !isPremiumUser}
            className="relative px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-purple-500 disabled:opacity-60 disabled:cursor-not-allowed flex items-center whitespace-nowrap group"
        >
            {isRefining ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Brain className="mr-2 h-4 w-4" />
            )}
            Refine with AI
            {!isPremiumUser && (
              <span className="absolute -top-2 -right-2 bg-yellow-500 text-xs px-1.5 py-0.5 rounded-full text-gray-900 font-bold">
                PRO
              </span>
            )}
        </button>
        <div className="flex gap-2 w-full sm:w-auto">
          <button 
            onClick={onSavePrompt}
            disabled={isSaving || isRefining || !title || !title.trim() || !prompt_content || !prompt_content.trim()}
            className={`flex-grow sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-gray-800 disabled:opacity-60
                        ${isNewPrompt ? 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-400' : 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-400'}`}
          >
            <Save size={16} /> {isSaving ? 'Saving...' : (isNewPrompt ? 'Save New' : 'Update')}
          </button>
        </div>
      </div>
    </section>
  );
}

export default PromptBuilder; 