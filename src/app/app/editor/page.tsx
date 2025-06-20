
"use client";

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '../../(components)/layout/Navbar';
import Footer from '../../(components)/shared/Footer';
import { Save, Play, Share2, History, Settings, Zap, Brain, Copy, Download, Eye, EyeOff, Plus, X, ChevronDown, Loader2, Sparkles, MessageSquare, Users, FileText, Clock, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/app/(contexts)/AuthContext';
import Link from 'next/link';

// Types
export interface Prompt {
  id: string | null;
  title: string;
  content: string;
  model: string;
  tags: string[];
  variables: Array<{ name: string; type: string; description: string; defaultValue?: string }>;
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
  visibility: 'private' | 'team' | 'public';
  version: number;
  description: string;
  category: string;
}

interface PromptVersion {
  id: string;
  version: number;
  content: string;
  timestamp: string;
  changes: string;
}

interface TestResult {
  id: string;
  input: string;
  output: string;
  timestamp: string;
  model: string;
  tokens: number;
  cost: number;
}

const AI_MODELS = [
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'OpenAI', cost: '$0.01/1K tokens' },
  { id: 'gpt-4', name: 'GPT-4', provider: 'OpenAI', cost: '$0.03/1K tokens' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'OpenAI', cost: '$0.0015/1K tokens' },
  { id: 'claude-3-opus', name: 'Claude 3 Opus', provider: 'Anthropic', cost: '$0.015/1K tokens' },
  { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', provider: 'Anthropic', cost: '$0.003/1K tokens' },
  { id: 'gemini-pro', name: 'Gemini Pro', provider: 'Google', cost: '$0.0005/1K tokens' }
];

const CATEGORIES = ['Marketing', 'Development', 'Creative Writing', 'Business', 'Education', 'Data Analysis', 'Customer Support', 'Content Creation'];

const defaultPrompt: Prompt = {
  id: null,
  title: 'Untitled Prompt',
  content: '',
  model: 'gpt-4-turbo',
  tags: [],
  variables: [],
  temperature: 0.7,
  maxTokens: 2048,
  topP: 1.0,
  frequencyPenalty: 0,
  presencePenalty: 0,
  visibility: 'private',
  version: 1,
  description: '',
  category: 'Marketing'
};

function PromptEditorContent() {
  const { isLoggedIn, userRole, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Main state
  const [currentPrompt, setCurrentPrompt] = useState<Prompt>(defaultPrompt);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [versions, setVersions] = useState<PromptVersion[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'test' | 'versions' | 'settings'>('editor');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showVariableModal, setShowVariableModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // Test state
  const [testInput, setTestInput] = useState('');
  const [testOutput, setTestOutput] = useState('');
  const [selectedTestModel, setSelectedTestModel] = useState('gpt-4-turbo');

  // Variable state
  const [newVariable, setNewVariable] = useState({ name: '', type: 'text', description: '', defaultValue: '' });

  // Load from URL params
  useEffect(() => {
    if (!searchParams) return;
    
    const title = searchParams.get('title');
    const content = searchParams.get('content') || searchParams.get('prompt'); // Support both parameter names
    const model = searchParams.get('model');
    
    if (title || content || model) {
      setCurrentPrompt(prev => ({
        ...prev,
        title: title || prev.title,
        content: content || prev.content,
        model: model || prev.model
      }));
    }
  }, [searchParams]);

  // Auth check
  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      router.push('/login?message=Please log in to access the Prompt Editor.');
    }
  }, [isLoggedIn, authLoading, router]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Saving prompt:', currentPrompt);
      setIsSaving(false);
    } catch (error) {
      console.error('Error saving prompt:', error);
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    if (!testInput.trim()) return;
    
    setIsTesting(true);
    try {
      // Simulate AI API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockOutput = `This is a simulated AI response for the prompt: "${currentPrompt.content}"\n\nInput variables:\n${testInput}\n\nGenerated response with ${selectedTestModel}...`;
      
      const newResult: TestResult = {
        id: Date.now().toString(),
        input: testInput,
        output: mockOutput,
        timestamp: new Date().toISOString(),
        model: selectedTestModel,
        tokens: 150,
        cost: 0.003
      };
      
      setTestResults(prev => [newResult, ...prev]);
      setTestOutput(mockOutput);
      setIsTesting(false);
    } catch (error) {
      console.error('Error testing prompt:', error);
      setIsTesting(false);
    }
  };

  const handleAIOptimize = async () => {
    if (!currentPrompt.content.trim()) {
      alert('Please enter some prompt content to optimize.');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/refine-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: currentPrompt.content,
          model: currentPrompt.model,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let optimizedContent = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          optimizedContent += decoder.decode(value);
        }
      }

      if (optimizedContent.trim()) {
        setCurrentPrompt(prev => ({ ...prev, content: optimizedContent.trim() }));
      } else {
        throw new Error('No optimized content received');
      }
      
      setIsGenerating(false);
    } catch (error) {
      console.error('Error optimizing prompt:', error);
      alert(`Failed to optimize prompt: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsGenerating(false);
    }
  };

  const addVariable = () => {
    if (!newVariable.name.trim()) return;
    
    setCurrentPrompt(prev => ({
      ...prev,
      variables: [...prev.variables, { ...newVariable }]
    }));
    
    setNewVariable({ name: '', type: 'text', description: '', defaultValue: '' });
    setShowVariableModal(false);
  };

  const removeVariable = (index: number) => {
    setCurrentPrompt(prev => ({
      ...prev,
      variables: prev.variables.filter((_, i) => i !== index)
    }));
  };

  const insertVariableIntoPrompt = (variableName: string) => {
    const variable = `{{${variableName}}}`;
    setCurrentPrompt(prev => ({
      ...prev,
      content: prev.content + variable
    }));
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="flex h-[calc(100vh-64px)]">
        {/* Sidebar */}
        <div className={`bg-gray-50 border-r border-gray-200 transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-80'} flex-shrink-0`}>
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              {!sidebarCollapsed && (
                <h2 className="text-lg font-semibold text-gray-900">My Prompts</h2>
              )}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              >
                <ChevronDown className={`transition-transform ${sidebarCollapsed ? 'rotate-90' : '-rotate-90'}`} size={16} />
              </button>
            </div>
          </div>
          
          {!sidebarCollapsed && (
            <div className="p-4 space-y-3">
              <button className="w-full flex items-center space-x-3 p-3 text-left bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                <Plus size={16} />
                <span>New Prompt</span>
              </button>
              
              {/* Recent Prompts - Empty state for now */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Recent</p>
                <div className="text-center py-8 px-4">
                  <p className="text-sm text-gray-500">No recent prompts yet.</p>
                  <p className="text-xs text-gray-400 mt-1">Create your first prompt to get started.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <input
                  type="text"
                  value={currentPrompt.title}
                  onChange={(e) => setCurrentPrompt(prev => ({ ...prev, title: e.target.value }))}
                  className="text-xl font-semibold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-0 p-0"
                  placeholder="Enter prompt title..."
                />
                <div className="flex items-center space-x-2">
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">Saved</span>
                  <span className="text-xs text-gray-500">v{currentPrompt.version}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Link 
                  href="/marketplace"
                  className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span className="text-sm">← Marketplace</span>
                </Link>
                
                <button
                  onClick={() => setPreviewMode(!previewMode)}
                  className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {previewMode ? <EyeOff size={16} /> : <Eye size={16} />}
                  <span className="text-sm">{previewMode ? 'Edit' : 'Preview'}</span>
                </button>
                
                <button
                  onClick={() => setShowShareModal(true)}
                  className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Share2 size={16} />
                  <span className="text-sm">Share</span>
                </button>
                
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  <span className="text-sm">{isSaving ? 'Saving...' : 'Save'}</span>
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-6 mt-4">
              {[
                { id: 'editor', name: 'Editor', icon: FileText },
                { id: 'test', name: 'Test & Debug', icon: Play },
                { id: 'versions', name: 'Version History', icon: History },
                { id: 'settings', name: 'Settings', icon: Settings }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon size={16} />
                  <span className="text-sm">{tab.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'editor' && (
              <div className="h-full flex">
                {/* Editor */}
                <div className="flex-1 p-6 overflow-auto">
                  <div className="max-w-4xl mx-auto space-y-6">
                    {/* Model Selection */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Model Configuration</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">AI Model</label>
                          <select
                            value={currentPrompt.model}
                            onChange={(e) => setCurrentPrompt(prev => ({ ...prev, model: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          >
                            {AI_MODELS.map(model => (
                              <option key={model.id} value={model.id}>
                                {model.name} - {model.cost}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                          <select
                            value={currentPrompt.category}
                            onChange={(e) => setCurrentPrompt(prev => ({ ...prev, category: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          >
                            {CATEGORIES.map(category => (
                              <option key={category} value={category}>{category}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Prompt Content */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Prompt Content</h3>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={handleAIOptimize}
                            disabled={isGenerating}
                            className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors disabled:opacity-50"
                          >
                            {isGenerating ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <Sparkles size={16} />
                            )}
                            <span className="text-sm">{isGenerating ? 'Optimizing...' : 'AI Optimize'}</span>
                          </button>
                        </div>
                      </div>
                      
                      <textarea
                        value={currentPrompt.content}
                        onChange={(e) => setCurrentPrompt(prev => ({ ...prev, content: e.target.value }))}
                        placeholder="Enter your prompt here... Use {{variable_name}} for dynamic variables."
                        className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none font-mono text-sm"
                      />
                      
                      <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
                        <span>{currentPrompt.content.length} characters</span>
                        {userRole === 'free' && (
                          <span>~{Math.ceil(currentPrompt.content.length / 4)} tokens</span>
                        )}
                      </div>
                    </div>

                    {/* Variables */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Variables</h3>
                        <button
                          onClick={() => setShowVariableModal(true)}
                          className="flex items-center space-x-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                          <Plus size={16} />
                          <span className="text-sm">Add Variable</span>
                        </button>
                      </div>
                      
                      {currentPrompt.variables.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <MessageSquare size={32} className="mx-auto mb-3 text-gray-300" />
                          <p>No variables defined yet.</p>
                          <p className="text-sm">Variables make your prompts dynamic and reusable.</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {currentPrompt.variables.map((variable, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3">
                                  <code className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-sm font-mono">
                                    {`{{${variable.name}}}`}
                                  </code>
                                  <span className="text-sm text-gray-600">{variable.description}</span>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => insertVariableIntoPrompt(variable.name)}
                                  className="p-1 text-purple-600 hover:text-purple-700"
                                  title="Insert into prompt"
                                >
                                  <Copy size={16} />
                                </button>
                                <button
                                  onClick={() => removeVariable(index)}
                                  className="p-1 text-red-600 hover:text-red-700"
                                  title="Remove variable"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
                      <textarea
                        value={currentPrompt.description}
                        onChange={(e) => setCurrentPrompt(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe what this prompt does and how to use it..."
                        className="w-full h-24 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'test' && (
              <div className="h-full p-6 overflow-auto">
                <div className="max-w-6xl mx-auto">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                    {/* Test Input */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Input</h3>
                      
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Test Model</label>
                        <select
                          value={selectedTestModel}
                          onChange={(e) => setSelectedTestModel(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          {AI_MODELS.map(model => (
                            <option key={model.id} value={model.id}>{model.name}</option>
                          ))}
                        </select>
                      </div>
                      
                      <textarea
                        value={testInput}
                        onChange={(e) => setTestInput(e.target.value)}
                        placeholder="Enter test input values for your variables..."
                        className="w-full h-48 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none font-mono text-sm mb-4"
                      />
                      
                      <button
                        onClick={handleTest}
                        disabled={isTesting || !testInput.trim()}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                      >
                        {isTesting ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Play size={16} />
                        )}
                        <span>{isTesting ? 'Testing...' : 'Run Test'}</span>
                      </button>
                    </div>

                    {/* Test Output */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Output</h3>
                      
                      {testOutput ? (
                        <div className="space-y-4">
                          <div className="bg-gray-50 rounded-lg p-4 h-48 overflow-auto">
                            <pre className="text-sm text-gray-900 whitespace-pre-wrap">{testOutput}</pre>
                          </div>
                          
                          <div className="flex justify-between items-center text-sm text-gray-500">
                            <span>Model: {selectedTestModel}</span>
                            {userRole === 'free' && (
                              <span>Tokens: ~150 | Cost: ~$0.003</span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="h-48 flex items-center justify-center text-gray-500">
                          <div className="text-center">
                            <Brain size={32} className="mx-auto mb-3 text-gray-300" />
                            <p>Run a test to see results</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Test History */}
                  {testResults.length > 0 && (
                    <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Test History</h3>
                      <div className="space-y-4">
                        {testResults.map(result => (
                          <div key={result.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium text-gray-900">{result.model}</span>
                              <span className="text-xs text-gray-500">{new Date(result.timestamp).toLocaleString()}</span>
                            </div>
                            <div className="text-sm text-gray-600 truncate">{result.output.substring(0, 100)}...</div>
                            <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                              {userRole === 'free' && (
                                <>
                                  <span>{result.tokens} tokens</span>
                                  <span>${result.cost.toFixed(4)}</span>
                                </>
                              )}
                              {userRole !== 'free' && (
                                <span>Model: {result.model}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="h-full p-6 overflow-auto">
                <div className="max-w-2xl mx-auto space-y-6">
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Model Parameters</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Temperature: {currentPrompt.temperature}
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="2"
                          step="0.1"
                          value={currentPrompt.temperature}
                          onChange={(e) => setCurrentPrompt(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                          className="w-full"
                        />
                        <p className="text-xs text-gray-500 mt-1">Controls randomness. Higher = more creative, Lower = more focused</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Max Tokens: {currentPrompt.maxTokens}
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="4096"
                          step="1"
                          value={currentPrompt.maxTokens}
                          onChange={(e) => setCurrentPrompt(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
                          className="w-full"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Top P: {currentPrompt.topP}
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={currentPrompt.topP}
                          onChange={(e) => setCurrentPrompt(prev => ({ ...prev, topP: parseFloat(e.target.value) }))}
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Sharing & Visibility</h3>
                    <div className="space-y-3">
                      {[
                        { value: 'private', label: 'Private', description: 'Only you can see this prompt' },
                        { value: 'team', label: 'Team', description: 'Your team members can view and edit' },
                        { value: 'public', label: 'Public', description: 'Anyone can view this prompt' }
                      ].map(option => (
                        <label key={option.value} className="flex items-start space-x-3 cursor-pointer">
                          <input
                            type="radio"
                            name="visibility"
                            value={option.value}
                            checked={currentPrompt.visibility === option.value}
                            onChange={(e) => setCurrentPrompt(prev => ({ ...prev, visibility: e.target.value as any }))}
                            className="mt-1"
                          />
                          <div>
                            <div className="font-medium text-gray-900">{option.label}</div>
                            <div className="text-sm text-gray-500">{option.description}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Variable Modal */}
      <AnimatePresence>
        {showVariableModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-md"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Variable</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={newVariable.name}
                    onChange={(e) => setNewVariable(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., user_name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    value={newVariable.type}
                    onChange={(e) => setNewVariable(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="email">Email</option>
                    <option value="url">URL</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <input
                    type="text"
                    value={newVariable.description}
                    onChange={(e) => setNewVariable(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of this variable"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Default Value (Optional)</label>
                  <input
                    type="text"
                    value={newVariable.defaultValue}
                    onChange={(e) => setNewVariable(prev => ({ ...prev, defaultValue: e.target.value }))}
                    placeholder="Default value"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowVariableModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={addVariable}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Add Variable
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function PromptEditorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    }>
      <PromptEditorContent />
    </Suspense>
  );
}
