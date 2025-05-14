'use client';

import React, { useState } from 'react';
// import MarketplaceHeader from '../(components)/marketplace/MarketplaceHeader'; // Removed
import Navbar from '../(components)/layout/Navbar'; // Added
import Footer from '../(components)/shared/Footer';
// import { AI_MODELS as availableModels } from '../marketplace/page'; // Old import - to be removed
import { AI_MODELS as availableModelsConstant } from '../../lib/constants/marketplaceConstants'; // New import
import { UploadCloud, Info, CheckCircle } from 'lucide-react'; // Added CheckCircle for success
// import { z } from 'zod'; // No longer needed here
import { promptSchema, PromptFormValues } from '../../lib/validators/promptValidator'; // Import shared schema
import { ZodError } from 'zod'; // Explicitly import ZodError for type annotation

interface ModelOption {
    id: string;
    name: string;
}

export default function UploadPromptPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  // Use the imported constant and filter out 'all' for the dropdown
  const modelsForDropdown: ModelOption[] = availableModelsConstant.filter((m: ModelOption) => m.id !== 'all');
  const [model, setModel] = useState(modelsForDropdown.find((m: ModelOption) => m.name === 'ChatGPT-4') ? 'ChatGPT-4' : (modelsForDropdown.length > 0 ? modelsForDropdown[0].name : ''));
  const [tagsString, setTagsString] = useState('');
  const [priceInput, setPriceInput] = useState<string>('');
  const [promptContent, setPromptContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<ZodError<PromptFormValues> | null>(null); // Type annotation for ZodError
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null); // For success state

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormErrors(null);
    setSubmissionError(null);
    setSuccessMessage(null);

    const currentTags = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag);
    let currentPrice: number | 'Free';
    if (priceInput.trim().toLowerCase() === 'free') {
      currentPrice = 'Free';
    } else {
      const parsedPrice = parseFloat(priceInput);
      currentPrice = isNaN(parsedPrice) ? -1 : parsedPrice; // Zod schema will catch -1 as invalid
    }

    const validationResult = promptSchema.safeParse({
      title,
      description,
      model, // model state now holds the name string
      tags: currentTags,
      price: currentPrice,
      promptContent
    });

    if (!validationResult.success) {
      setFormErrors(validationResult.error);
      setIsSubmitting(false);
      return;
    }

    const validatedData = validationResult.data;

    try {
      const response = await fetch('/api/prompts/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validatedData),
      });

      const responseData = await response.json();

      if (!response.ok) {
        if (responseData.errors) { // Handle Zod errors from server if any
            // This is a basic way to show server-side Zod errors. 
            // You might want a more sophisticated way to map these to fields.
            const serverFieldErrors = Object.entries(responseData.errors)
                .map(([field, messages]) => `${field}: ${(messages as string[]).join(', ')}`)
                .join('; ');
            setSubmissionError(`Validation failed on server: ${serverFieldErrors}`)
        } else {
            setSubmissionError(responseData.message || 'Failed to upload prompt. Please try again.');
        }
      } else {
        setSuccessMessage(responseData.message || 'Prompt uploaded successfully!');
        // Reset form fields
        setTitle('');
        setDescription('');
        setModel(modelsForDropdown.find((m: ModelOption) => m.name === 'ChatGPT-4') ? 'ChatGPT-4' : (modelsForDropdown.length > 0 ? modelsForDropdown[0].name : ''));
        setTagsString('');
        setPriceInput('');
        setPromptContent('');
        // Optionally, redirect user: router.push('/marketplace');
      }
    } catch (err: any) {
      console.error('Submission fetch error:', err);
      setSubmissionError('An unexpected error occurred during submission. Please check your connection and try again.');
    }

    setIsSubmitting(false);
  };
  
  // modelsToSelect is effectively modelsForDropdown now

  const getFieldError = (fieldName: keyof PromptFormValues) => {
    return formErrors?.errors.find(err => err.path.includes(fieldName))?.message;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* <MarketplaceHeader pageType="upload" /> */}
      <Navbar /> {/* Replaced MarketplaceHeader with Navbar */} 
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-3xl mx-auto bg-white p-8 sm:p-10 rounded-xl shadow-xl border border-gray-200">
          <div className="text-center mb-10">
            <UploadCloud className="mx-auto h-12 w-12 text-purple-600 mb-3" />
            <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900">Share Your Prompt</h1>
            <p className="text-gray-600 mt-2">Contribute to the community and earn by selling your high-quality prompts.</p>
          </div>

          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md text-green-700 flex items-center">
              <CheckCircle size={20} className="mr-3 flex-shrink-0" />
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Prompt Title</label>
              <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required className={`w-full px-4 py-2.5 rounded-lg border ${getFieldError('title') ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-purple-500 focus:border-purple-500 shadow-sm text-gray-900 placeholder-gray-400`} placeholder="e.g., High-Converting Email Subject Lines" />
              {getFieldError('title') && <p className="text-xs text-red-600 mt-1">{getFieldError('title')}</p>}
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
              <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} required className={`w-full px-4 py-2.5 rounded-lg border ${getFieldError('description') ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-purple-500 focus:border-purple-500 shadow-sm text-gray-900 placeholder-gray-400`} placeholder="Briefly describe what your prompt does and its benefits (max 2-3 lines for card preview)" />
              {getFieldError('description') && <p className="text-xs text-red-600 mt-1">{getFieldError('description')}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">AI Model</label>
                <select id="model" value={model} onChange={(e) => setModel(e.target.value)} required className={`w-full px-4 py-2.5 rounded-lg border ${getFieldError('model') ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-purple-500 focus:border-purple-500 shadow-sm bg-white appearance-none text-gray-900`}>
                  {modelsForDropdown.map((m: ModelOption) => <option key={m.id} value={m.name}>{m.name}</option>)}
                </select>
                {getFieldError('model') && <p className="text-xs text-red-600 mt-1">{getFieldError('model')}</p>}
              </div>
              <div>
                <label htmlFor="tagsString" className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
                <input type="text" id="tagsString" value={tagsString} onChange={(e) => setTagsString(e.target.value)} className={`w-full px-4 py-2.5 rounded-lg border ${getFieldError('tags') ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-purple-500 focus:border-purple-500 shadow-sm text-gray-900 placeholder-gray-400`} placeholder="e.g., marketing, writing, code" />
                {getFieldError('tags') && <p className="text-xs text-red-600 mt-1">{getFieldError('tags')}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="priceInput" className="block text-sm font-medium text-gray-700 mb-1">Price (USD)</label>
              <input type="text" id="priceInput" value={priceInput} onChange={(e) => setPriceInput(e.target.value)} required className={`w-full px-4 py-2.5 rounded-lg border ${getFieldError('price') ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-purple-500 focus:border-purple-500 shadow-sm text-gray-900 placeholder-gray-400`} placeholder="e.g., 4.99 or type 'Free'" />
              {getFieldError('price') && <p className="text-xs text-red-600 mt-1">{getFieldError('price')}</p>}
              {!getFieldError('price') && <p className="mt-1.5 text-xs text-gray-500">Enter a numeric value or type 'Free'. Prompts priced at $0.00 will be listed as Free.</p>}
            </div>

            <div>
              <label htmlFor="promptContent" className="block text-sm font-medium text-gray-700 mb-1">Prompt Content</label>
              <textarea id="promptContent" value={promptContent} onChange={(e) => setPromptContent(e.target.value)} rows={8} required className={`w-full px-4 py-2.5 rounded-lg border ${getFieldError('promptContent') ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-purple-500 focus:border-purple-500 shadow-sm font-mono text-sm text-gray-900 placeholder-gray-400`} placeholder="Paste or write your detailed prompt here. Include any instructions, variables, or examples needed for optimal use." />
              {getFieldError('promptContent') && <p className="text-xs text-red-600 mt-1">{getFieldError('promptContent')}</p>}
            </div>
            
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg flex items-start">
              <Info size={20} className="text-purple-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-purple-700">Marketplace Commission</h4>
                <p className="text-xs text-purple-600">
                  PromptCrate applies a <span className="font-bold">20% commission</span> on all successful sales made through the marketplace. 
                  This helps us maintain and improve the platform for everyone.
                </p>
              </div>
            </div>

            {submissionError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
                {submissionError}
              </div>
            )}
            {formErrors && !submissionError && !successMessage && (
                 <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
                     Please correct the errors in the form before submitting.
                 </div>
            )}

            <div className="pt-2 text-right">
              <button type="submit" disabled={isSubmitting} className="px-8 py-3 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed">
                {isSubmitting ? 'Submitting...' : 'Submit Prompt'}
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
} 