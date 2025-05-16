"use client";

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/app/(contexts)/AuthContext';
import Navbar from '@/app/(components)/layout/Navbar';
import PromptSidebar from '@/app/(components)/app/editor/PromptSidebar';
import PromptBuilder from '@/app/(components)/app/editor/PromptBuilder';
import { Loader2 } from 'lucide-react'; // Removed Copy, RefreshCw

// Define the comprehensive Prompt interface based on DB schema
export interface Prompt {
  id: string; // UUID
  user_id: string; // UUID, links to auth.users
  created_at: string; // TIMESTAMPTZ
  updated_at: string; // TIMESTAMPTZ
  title: string;
  prompt_content: string;
  model?: string | null;
  variables?: Record<string, any> | null; // JSONB
  description?: string | null;
  tags?: string[] | null; // TEXT[]
  is_public: boolean;
  version?: number | null;
}

// Default new prompt
const defaultNewPrompt: Omit<Prompt, 'id' | 'user_id' | 'created_at' | 'updated_at'> & { id: null } = {
  id: null, // Signifies a new, unsaved prompt
  title: 'Untitled Prompt',
  prompt_content: '',
  model: 'gpt-3.5-turbo',
  variables: {},
  description: '',
  tags: [],
  is_public: false,
  version: 1,
};

function SearchParamsHandler({ onParams }: { onParams: (params: URLSearchParams) => void }) {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    onParams(searchParams);
  }, [searchParams, onParams]);
  
  return null;
}

function PromptEditorContent() {
  const { isLoggedIn, userRole, isLoading: authLoading, user } = useAuth();
  const router = useRouter();
  const [searchParams, setSearchParams] = useState<URLSearchParams | null>(null);

  const [promptsList, setPromptsList] = useState<Prompt[]>([]);
  const [currentPrompt, setCurrentPrompt] = useState<Prompt | (Omit<Prompt, 'id' | 'user_id' | 'created_at' | 'updated_at'> & { id: null })>(defaultNewPrompt);
  
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingPrompts, setIsLoadingPrompts] = useState(false);
  
  // Removed: activePromptId, currentPromptTitle, currentPromptContent, currentModel, isNewPrompt (can be derived)

  // Access Control Effect
  useEffect(() => {
    if (!authLoading) {
      if (!isLoggedIn) {
        router.push('/login?message=Please log in to access the Prompt Editor.');
      }
    }
  }, [isLoggedIn, authLoading, router]);

  // Effect to load prompt from query parameters (e.g., from marketplace)
  useEffect(() => {
    if (!searchParams) return;
    
    const queryTitle = searchParams.get('title');
    const queryPrompt = searchParams.get('prompt');
    const queryModel = searchParams.get('model');

    if (queryTitle && queryPrompt) {
      setCurrentPrompt({
        ...defaultNewPrompt,
        title: queryTitle,
        prompt_content: queryPrompt,
        model: queryModel || 'gpt-3.5-turbo',
      });
      console.log('Loaded prompt from query params:', { title: queryTitle, model: queryModel });
    }
  }, [searchParams]);

  // Fetch user's prompts
  useEffect(() => {
    if (isLoggedIn && user && userRole) {
      const fetchPrompts = async () => {
        setIsLoadingPrompts(true);
        try {
          const response = await fetch('/api/prompts');
          if (!response.ok) {
            throw new Error('Failed to fetch prompts');
          }
          const data = await response.json();
          setPromptsList(data as Prompt[]);
        } catch (error) {
          console.error("Error fetching prompts:", error);
          // Handle error (e.g., show a toast message)
        } finally {
          setIsLoadingPrompts(false);
        }
      };
      fetchPrompts();
    }
  }, [isLoggedIn, user, userRole]);

  const handleNewPrompt = useCallback(() => {
    setCurrentPrompt(defaultNewPrompt);
  }, []);

  const handleSelectPrompt = useCallback((promptId: string) => {
    const selected = promptsList.find(p => p.id === promptId);
    if (selected) {
      setCurrentPrompt(selected);
    }
  }, [promptsList]);

  const handleSavePrompt = useCallback(async () => {
    if (!currentPrompt || !currentPrompt.title.trim() || !currentPrompt.prompt_content.trim()) {
      alert("Prompt title and content cannot be empty.");
      return;
    }
    setIsSaving(true);

    try {
      let savedPromptData: Prompt;
      if (currentPrompt.id === null) { // New prompt
        // Prepare data for POST, user_id will be set by API route from session
        const newPromptPayload: Omit<Prompt, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
          title: currentPrompt.title,
          prompt_content: currentPrompt.prompt_content,
          model: currentPrompt.model,
          variables: currentPrompt.variables,
          description: currentPrompt.description,
          tags: currentPrompt.tags,
          is_public: currentPrompt.is_public,
          version: currentPrompt.version,
        };
        const response = await fetch('/api/prompts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newPromptPayload),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create prompt');
        }
        savedPromptData = await response.json();
        setPromptsList(prev => [...prev, savedPromptData]);
      } else { // Existing prompt
        const updatePayload: Partial<Omit<Prompt, 'id' | 'user_id' | 'created_at'>> = {
          title: currentPrompt.title,
          prompt_content: currentPrompt.prompt_content,
          model: currentPrompt.model,
          variables: currentPrompt.variables,
          description: currentPrompt.description,
          tags: currentPrompt.tags,
          is_public: currentPrompt.is_public,
          version: currentPrompt.version,
          // updated_at will be handled by DB trigger or API
        };
        const response = await fetch(`/api/prompts/${currentPrompt.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatePayload),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update prompt');
        }
        savedPromptData = await response.json();
        setPromptsList(prev => prev.map(p => p.id === savedPromptData.id ? savedPromptData : p));
      }
      setCurrentPrompt(savedPromptData); // Update current prompt with data from server (e.g. id, timestamps)
      console.log("Prompt saved/updated:", savedPromptData);
    } catch (error) {
      console.error("Error saving prompt:", error);
      alert(`Error saving prompt: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsSaving(false);
    }
  }, [currentPrompt, user]); // Added user dependency for user_id in new prompts if it were to be set client-side

  const handleDeletePrompt = useCallback(async (promptId: string) => {
    if (!confirm("Are you sure you want to delete this prompt?")) return;

    try {
      const response = await fetch(`/api/prompts/${promptId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete prompt');
      }
      setPromptsList(prev => prev.filter(p => p.id !== promptId));
      if (currentPrompt && currentPrompt.id === promptId) {
        handleNewPrompt(); // Reset to a new prompt if the active one was deleted
      }
      console.log("Prompt deleted:", promptId);
    } catch (error) {
      console.error("Error deleting prompt:", error);
      alert(`Error deleting prompt: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, [currentPrompt, handleNewPrompt]);

  // Removed handleTestPrompt function

  // Render loading state or access denied message
  if (authLoading || isLoadingPrompts) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
        <p className="ml-4 text-lg">Loading editor...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    // Show login message, but don't block free users
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-8">
        <Navbar />
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-500 mb-4">Access Denied</h1>
          <p className="text-lg mb-6">
            Please log in to access the Prompt Editor.
          </p>
          <button 
            onClick={() => router.push('/login')}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-md text-lg font-semibold transition-colors"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  // Main Editor UI - Simplified layout
  return (
    <main className="min-h-screen bg-gray-900 pb-12">
      <Navbar />
      <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8 max-w-screen-xl">
        {userRole === 'free' && (
          <div className="mb-6 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-4 shadow-lg text-white">
            <div className="flex flex-col sm:flex-row items-center justify-between">
              <div className="mb-4 sm:mb-0">
                <h3 className="text-lg font-bold">You're using the free version of PromptCrate</h3>
                <p className="text-sm text-purple-100">Upgrade to Pro to unlock AI refinement, advanced tools, and more!</p>
              </div>
              <button 
                onClick={() => router.push('/#pricing')}
                className="px-6 py-2 bg-white text-purple-700 rounded-md font-semibold text-sm shadow-sm hover:bg-purple-50 transition-colors"
              >
                Upgrade to Pro
              </button>
            </div>
          </div>
        )}
        <div className="flex flex-col xl:flex-row gap-6 min-h-[calc(100vh-200px)]">
          {/* Sidebar with prompts list */}
          <aside className="w-full xl:w-1/4 bg-gray-800 rounded-xl shadow-lg border border-gray-700 overflow-hidden flex flex-col">
            <PromptSidebar 
              prompts={promptsList} 
              selectedPromptId={currentPrompt?.id || null} 
              onSelectPrompt={handleSelectPrompt}
              onNewPrompt={handleNewPrompt}
              onDeletePrompt={handleDeletePrompt}
              isLoading={isLoadingPrompts}
              className="flex-grow"
            />
          </aside>

          {/* Main editor area */}
          <div className="w-full xl:w-3/4 flex-grow">
            <PromptBuilder 
              promptData={currentPrompt}
              onPromptDataChange={setCurrentPrompt}
              onSavePrompt={handleSavePrompt}
              isSaving={isSaving}
              userRole={userRole || 'free'} 
            />
          </div>
        </div>
      </div>
    </main>
  );
}

export default function PromptEditorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </main>
      </div>
    }>
      <PromptEditorContent />
    </Suspense>
  );
} 