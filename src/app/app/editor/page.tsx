"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation'; // Import useSearchParams
// import AppHeader from '../../(components)/app/AppHeader'; // Removed AppHeader
import Navbar from '../../(components)/layout/Navbar'; // Added Navbar
import PromptSidebar from '../../(components)/app/editor/PromptSidebar';
import PromptBuilder from '../../(components)/app/editor/PromptBuilder'; // Import new builder
// import OutputViewer from '../../(components)/app/editor/OutputViewer';

interface SavedPrompt {
  id: string;
  title: string;
  content: string;
  model: string;
  // Add other relevant fields like tags, createdAt, updatedAt etc. later
}

export default function PromptEditorPage() {
  const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>([]); // Manage list of saved prompts
  const [activePromptId, setActivePromptId] = useState<string | null>(null);
  const [currentPromptTitle, setCurrentPromptTitle] = useState('Untitled Prompt');
  const [currentPromptContent, setCurrentPromptContent] = useState('');
  const [currentModel, setCurrentModel] = useState('ChatGPT-4'); // Default model, ensure it's in AI_MODELS_FOR_VALIDATION
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isNewPrompt, setIsNewPrompt] = useState(true); // Track if current prompt is new or an existing one
  const [outputContent, setOutputContent] = useState(''); // State for the output viewer

  const searchParams = useSearchParams(); // Get search params

  // Effect to load initial prompts (e.g., from localStorage or API in future)
  // For now, it can be empty or have some mock data for testing UI
  useEffect(() => {
    // const initialMockPrompts: SavedPrompt[] = [
    //   { id: 'mock1', title: 'My First Real Prompt', content: 'Content for my first prompt', model: 'ChatGPT-4' },
    //   { id: 'mock2', title: 'Another Cool Idea', content: 'This is a test.', model: 'Claude 3' },
    // ];
    // setSavedPrompts(initialMockPrompts);
    // if (initialMockPrompts.length > 0) {
    //   // handleSelectPrompt(initialMockPrompts[0].id); // Optionally select the first one
    // }
  }, []);

  // Effect to load prompt from query parameters (e.g., from marketplace)
  useEffect(() => {
    const queryTitle = searchParams.get('title');
    const queryPrompt = searchParams.get('prompt');
    const queryModel = searchParams.get('model');
    // const querySource = searchParams.get('source'); // Source can be used later for specific logic
    // const queryId = searchParams.get('id'); // ID can be used later

    if (queryTitle && queryPrompt) {
      setCurrentPromptTitle(queryTitle);
      setCurrentPromptContent(queryPrompt);
      if (queryModel) {
        setCurrentModel(queryModel);
      }
      setIsNewPrompt(true); // Treat as a new prompt for saving purposes
      setActivePromptId(null); // Not one of the user's saved prompts yet
      setOutputContent(''); // Clear any previous output
      // Potentially log that a prompt was loaded via query params
      console.log('Loaded prompt from query params:', { title: queryTitle, model: queryModel });
    }
  }, [searchParams]); // Re-run if searchParams change

  const handleNewPrompt = () => {
    console.log('New Prompt clicked');
    setActivePromptId(null);
    setCurrentPromptTitle('Untitled Prompt');
    setCurrentPromptContent('');
    setCurrentModel('ChatGPT-4'); // Reset to default model
    setIsNewPrompt(true); // Set flag for new prompt
    setOutputContent(''); // Clear output when starting a new prompt
  };

  const handleSelectPrompt = (promptId: string) => {
    const selected = savedPrompts.find(p => p.id === promptId);
    if (selected) {
      setActivePromptId(selected.id);
      setCurrentPromptTitle(selected.title);
      setCurrentPromptContent(selected.content);
      setCurrentModel(selected.model);
      setIsNewPrompt(false); // It's an existing prompt
      setOutputContent(''); // Clear output when selecting an existing prompt
      console.log('Selected prompt:', selected.id);
    } else {
        console.warn("Selected prompt not found in savedPrompts");
    }
  };

  const handleSavePrompt = async () => {
    if (!currentPromptTitle.trim()) {
        // Basic validation: title is required
        alert("Prompt title cannot be empty."); // Replace with a proper notification later
        return;
    }
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 700)); // Simulate API call

    let newId = activePromptId;
    if (isNewPrompt || !activePromptId) { // If it's a new prompt or no ID (safety for new)
      newId = `prompt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    }
    
    const promptToSave: SavedPrompt = {
        id: newId!,
        title: currentPromptTitle,
        content: currentPromptContent,
        model: currentModel,
    };

    if (isNewPrompt || !savedPrompts.find(p => p.id === newId)) {
      setSavedPrompts(prev => [...prev, promptToSave]);
      console.log('Saved new prompt:', promptToSave.id);
    } else {
      setSavedPrompts(prev => prev.map(p => p.id === newId ? promptToSave : p));
      console.log('Updated prompt:', promptToSave.id);
    }
    
    setActivePromptId(promptToSave.id); // Set the newly saved/updated prompt as active
    setIsNewPrompt(false); // It's no longer a "new" unsaved prompt
    setIsSaving(false);
    // console.log('Saved/Updated prompt:', promptToSave);
  };

  const handleTestPrompt = async () => {
    if (!currentPromptContent.trim()) {
      setOutputContent("Please enter a prompt to test.");
      return;
    }
    console.log('Testing prompt:', { content: currentPromptContent, model: currentModel });
    setIsTesting(true);
    setOutputContent(''); 

    try {
      const response = await fetch('/api/refine-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: currentPromptContent, model: currentModel }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API request failed with status ${response.status}`);
      }

      const data = await response.json();
      if (data.refinedPrompt) {
        setOutputContent(data.refinedPrompt);
      } else {
        throw new Error("No refined prompt received from API.");
      }
    } catch (error) {
      console.error("Error testing/refining prompt:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      setOutputContent(`Error: ${errorMessage}`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* <AppHeader /> */}
      <Navbar /> {/* Replaced AppHeader with Navbar */} 
      <div className="flex-grow flex flex-row overflow-hidden h-[calc(100vh-4rem)]"> {/* Adjusted height if Navbar has different height than AppHeader */} 
        <PromptSidebar 
          prompts={savedPrompts} // Pass the list of saved prompts
          onNewPrompt={handleNewPrompt}
          onSelectPrompt={handleSelectPrompt}
          activePromptId={activePromptId}
        />
        <main className="flex-grow flex flex-col p-4 md:p-6 overflow-y-auto">
          <div className="flex-grow flex flex-col lg:flex-row gap-4 md:gap-6">
            <PromptBuilder
              title={currentPromptTitle}
              onTitleChange={setCurrentPromptTitle}
              model={currentModel}
              onModelChange={setCurrentModel}
              promptContent={currentPromptContent}
              onPromptContentChange={setCurrentPromptContent}
              onSave={handleSavePrompt}
              isSaving={isSaving}
              isNewPrompt={isNewPrompt}
            />

            {/* Output Viewer Panel */}
            <section className="flex-grow lg:w-1/2 bg-white rounded-xl shadow-lg border border-gray-200 p-6 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  Output Viewer <span className="text-sm text-gray-500 ml-1">— {currentModel}</span>
                </h2>
                {/* Add any top-right controls for output viewer here if needed later */}
              </div>
              
              <div className="flex-grow bg-gray-50 rounded-md border border-gray-200 p-4 overflow-y-auto min-h-[200px] custom-scrollbar">
                {isTesting ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <svg className="animate-spin h-8 w-8 text-purple-600 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-gray-500 text-sm">Generating output...</p>
                  </div>
                ) : outputContent ? (
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap break-words font-sans">
                    {outputContent}
                  </pre>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-400 italic">Output will appear here after testing a prompt.</p>
                  </div>
                )}
              </div>
              
              {!isTesting && (
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => navigator.clipboard.writeText(outputContent)}
                    disabled={!outputContent}
                    className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    Copy Output
                  </button>
                  <button
                    onClick={handleTestPrompt}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md border border-gray-300 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
                  >
                    Regenerate
                  </button>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
} 