import React, { useState, useEffect } from 'react';
import { Sparkles, Info, Save, PlusCircle, Brain, Loader2 } from 'lucide-react';
import { AI_MODELS } from '@/lib/constants/marketplaceConstants';

interface Model {
  id: string;
  name: string;
}

interface PromptBuilderProps {
  title: string;
  onTitleChange: (newTitle: string) => void;
  model: string;
  onModelChange: (newModel: string) => void;
  promptContent: string;
  onPromptContentChange: (newText: string) => void;
  onSavePrompt: (promptData: { title: string; promptText: string; model: string }) => void;
  isNewPrompt?: boolean;
  initialPrompt?: { // Used to set initial values if provided and parent isn't fully controlling from the start
    title: string;
    promptText: string;
    model: string;
  };
  isSaving?: boolean; // Added to reflect parent's saving state
  // onTest is no longer needed as testing is handled by parent page
  // onRefine is no longer needed as this component won't refine for input update anymore
}

const PromptBuilder: React.FC<PromptBuilderProps> = ({
  title,
  onTitleChange,
  model,
  onModelChange,
  promptContent,
  onPromptContentChange,
  onSavePrompt,
  isNewPrompt = false,
  initialPrompt,
  isSaving = false,
}) => {
  const [availableModels, setAvailableModels] = useState<Model[]>([]);

  useEffect(() => {
    setAvailableModels(AI_MODELS);
    // If initialPrompt is provided, parent should ideally set these values via props.
    // This effect is a fallback or for a scenario where initialPrompt dictates initial state once.
    if (initialPrompt) {
      onTitleChange(initialPrompt.title);
      onModelChange(initialPrompt.model);
      onPromptContentChange(initialPrompt.promptText);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPrompt]); // Dependencies narrowed to initialPrompt only, parent controls the rest.

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onTitleChange(e.target.value);
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onModelChange(e.target.value);
  };

  const handlePromptTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onPromptContentChange(e.target.value);
  };

  const handleSave = () => {
    if (!title.trim()) {
      alert('Please enter a title for your prompt.');
      return;
    }
    if (!promptContent.trim()) {
      alert('Please enter the prompt text.');
      return;
    }
    onSavePrompt({ title, promptText: promptContent, model });
  };

  return (
    <div className="bg-gray-800 p-4 sm:p-6 rounded-xl shadow-2xl w-full flex flex-col h-full border border-gray-700">
      <div className="mb-4">
        {/* <label htmlFor="promptTitle" className="block text-sm font-medium text-gray-300 mb-1">Title</label> */}
        <input
          id="promptTitle"
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="Untitled Prompt"
          className="w-full p-3 bg-gray-750 border border-gray-600 rounded-md focus:ring-1 focus:ring-purple-500 focus:border-purple-500 text-xl font-semibold text-white placeholder-gray-400"
          disabled={isSaving}
        />
      </div>

      <div className="mb-4">
        <label htmlFor="modelSelect" className="block text-sm font-medium text-gray-300 mb-1">Model</label>
        <select
          id="modelSelect"
          value={model}
          onChange={handleModelChange}
          className="w-full p-3 bg-gray-750 border border-gray-600 rounded-md focus:ring-1 focus:ring-purple-500 focus:border-purple-500 text-gray-200 disabled:opacity-70"
          disabled={isSaving}
        >
          {availableModels.map(m => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
      </div>
      
      <div className="mb-4 flex-grow flex flex-col">
        <label htmlFor="promptText" className="block text-sm font-medium text-gray-300 mb-1">
          Prompt
        </label>
        <textarea
          id="promptText"
          value={promptContent}
          onChange={handlePromptTextChange}
          placeholder="Enter your detailed prompt here. You can include variables using {{curly_braces}}."
          className="w-full flex-grow p-3 bg-gray-750 border border-gray-600 rounded-md focus:ring-1 focus:ring-purple-500 focus:border-purple-500 text-gray-200 placeholder-gray-500 resize-none min-h-[150px] sm:min-h-[200px] disabled:opacity-70"
          rows={10}
          disabled={isSaving}
        />
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-gray-700">
        <div className="flex items-center space-x-2">
          {/* Placeholder to keep flex structure if needed, or remove div if empty */}
          <div className="w-[140px]">&nbsp;</div> {/* Adjust width or content as needed or remove */}
        </div>
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || !promptContent.trim() || !title.trim()}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 flex items-center whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed
              ${isNewPrompt ? 'bg-green-500 hover:bg-green-600 focus:ring-green-400' : 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-400'}`}
          >
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (isNewPrompt ? <PlusCircle size={18} className="mr-2" /> : <Save size={18} className="mr-2" />)}
            {isSaving ? (isNewPrompt ? 'Creating...' : 'Saving...') : (isNewPrompt ? 'Create Prompt' : 'Save Changes')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromptBuilder;
