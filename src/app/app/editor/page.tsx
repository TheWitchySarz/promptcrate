"use client";

import React, { useState, useEffect, useCallback } from 'react';
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

export default function PromptEditorPage() {
  const { isLoggedIn, userRole, isLoading: authLoading, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

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
      } else if (userRole === 'free') {
        router.push('/#pricing');
      }
    }
  }, [isLoggedIn, userRole, authLoading, router]);

  // Effect to load prompt from query parameters (e.g., from marketplace)
  useEffect(() => {
    const queryTitle = searchParams.get('title');
    const queryPrompt = searchParams.get('prompt');
    const queryModel = searchParams.get('model');

    if (queryTitle && queryPrompt) {
      // When loading from query params, it's a new unsaved prompt inspired by marketplace/shared link
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
    if (isLoggedIn && user && userRole && userRole !== 'free') {
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

  if (!isLoggedIn || userRole === 'free') {
    // This part is usually handled by the useEffect redirect, 
    // but as a fallback or if redirect hasn't happened yet:
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-8">
        <Navbar />
        <div className="text-center">
          <h1 className="text-3xl font-bold text-red-500 mb-4">Access Denied</h1>
          <p className="text-lg mb-6">
            {isLoggedIn ? "The Prompt Editor is available for Pro and Enterprise users. Please upgrade your plan." : "Please log in to access the Prompt Editor."}
          </p>
          <button 
            onClick={() => router.push(isLoggedIn ? '/#pricing' : '/login')}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-md text-lg font-semibold transition-colors"
          >
            {isLoggedIn ? "Upgrade to Pro" : "Login"}
          </button>
        </div>
      </div>
    );
  }

  // Main Editor UI - Simplified layout
  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      <Navbar />
      <div className="flex-grow flex flex-row overflow-hidden h-[calc(100vh-var(--navbar-height,4rem))]">
        <PromptSidebar 
          prompts={promptsList}
          onNewPrompt={handleNewPrompt}
          onSelectPrompt={handleSelectPrompt}
          activePromptId={currentPrompt?.id === null ? null : currentPrompt?.id || null}
          onDeletePrompt={handleDeletePrompt}
          isLoading={isLoadingPrompts}
        />
        {/* Main content area now primarily for PromptBuilder */}
        <main className="flex-grow flex flex-col p-4 md:p-6 overflow-y-auto custom-scrollbar">
          {/* PromptBuilder will take up the main space in this column */}
          <div className="flex-grow flex flex-col h-full">
             <PromptBuilder
                promptData={currentPrompt}
                onPromptDataChange={setCurrentPrompt}
                onSavePrompt={handleSavePrompt}
                isSaving={isSaving}
              />
          </div>
        </main>
      </div>
    </div>
  );
} 