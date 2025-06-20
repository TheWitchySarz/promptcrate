'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Copy, Download, Wand2, Settings, Sparkles, FileText, Trash2 } from 'lucide-react';
import { AI_MODELS } from '@/lib/constants/marketplaceConstants';

interface PromptBuilderProps {
  onPromptChange?: (prompt: string) => void;
  onTitleChange?: (title: string) => void;
  initialPrompt?: string;
  initialTitle?: string;
}

const PromptBuilder: React.FC<PromptBuilderProps> = ({
  onPromptChange,
  onTitleChange,
  initialPrompt = '',
  initialTitle = ''
}) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [title, setTitle] = useState(initialTitle);
  const [selectedModel, setSelectedModel] = useState('gpt-4');
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [variables, setVariables] = useState<string[]>([]);

  // Extract variables from prompt text
  useEffect(() => {
    const variableRegex = /\{([^}]+)\}/g;
    const matches = prompt.match(variableRegex);
    const extractedVars = matches ? matches.map(match => match.slice(1, -1)) : [];
    setVariables([...new Set(extractedVars)]);
  }, [prompt]);

  const handlePromptChange = (value: string) => {
    setPrompt(value);
    onPromptChange?.(value);
    setSaveStatus('idle');
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    onTitleChange?.(value);
    setSaveStatus('idle');
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('saving');

    try {
      // Simulate save operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt);
  };

  const handleClear = () => {
    if (confirm('Are you sure you want to clear the prompt?')) {
      setPrompt('');
      setTitle('');
      onPromptChange?.('');
      onTitleChange?.('');
    }
  };

  const getSaveButtonText = () => {
    switch (saveStatus) {
      case 'saving': return 'Saving...';
      case 'saved': return 'Saved!';
      case 'error': return 'Error';
      default: return 'Save Prompt';
    }
  };

  const getSaveButtonColor = () => {
    switch (saveStatus) {
      case 'saved': return 'bg-green-600 hover:bg-green-700';
      case 'error': return 'bg-red-600 hover:bg-red-700';
      default: return 'bg-purple-600 hover:bg-purple-700';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">Prompt Builder</h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Advanced Settings"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Title Input */}
        <div className="mb-4">
          <label htmlFor="prompt-title" className="block text-sm font-medium text-gray-700 mb-2">
            Prompt Title
          </label>
          <input
            id="prompt-title"
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Enter a descriptive title for your prompt..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* Model Selection */}
        <div className="mb-4">
          <label htmlFor="model-select" className="block text-sm font-medium text-gray-700 mb-2">
            AI Model
          </label>
          <select
            id="model-select"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {AI_MODELS.filter(model => model.id !== 'all').map((model) => (
              <option key={model.id} value={model.id}>
                {model.name} {model.provider && `(${model.provider})`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Prompt Editor */}
      <div className="p-6">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="prompt-text" className="block text-sm font-medium text-gray-700">
              Prompt Content
            </label>
            <div className="text-xs text-gray-500">
              Use {'{variable}'} for dynamic content
            </div>
          </div>
          <textarea
            id="prompt-text"
            value={prompt}
            onChange={(e) => handlePromptChange(e.target.value)}
            placeholder="Write your prompt here... Use {variable_name} to add dynamic variables."
            className="w-full h-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none font-mono text-sm"
          />
        </div>

        {/* Variables Display */}
        {variables.length > 0 && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-sm font-medium text-blue-900 mb-2 flex items-center">
              <FileText className="h-4 w-4 mr-1" />
              Detected Variables
            </h4>
            <div className="flex flex-wrap gap-2">
              {variables.map((variable, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md font-mono"
                >
                  {'{' + variable + '}'}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleSave}
            disabled={isSaving || !prompt.trim() || !title.trim()}
            className={`flex items-center px-4 py-2 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${getSaveButtonColor()}`}
          >
            <Save className="h-4 w-4 mr-2" />
            {getSaveButtonText()}
          </button>

          <button
            onClick={handleCopy}
            disabled={!prompt.trim()}
            className="flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy
          </button>

          <button
            onClick={handleClear}
            disabled={!prompt.trim() && !title.trim()}
            className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear
          </button>
        </div>

        {/* Character Count */}
        <div className="mt-4 text-xs text-gray-500 text-right">
          {prompt.length} characters
        </div>
      </div>
    </div>
  );
};

export default PromptBuilder;