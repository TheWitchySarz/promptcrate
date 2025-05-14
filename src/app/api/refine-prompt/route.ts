import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { NextRequest } from 'next/server';

// Optional: Set the runtime to edge for best performance
export const runtime = 'edge';

// Ensure your OpenAI API key is set in your .env.local file
// OPENAI_API_KEY=your_key_here

// Initialize the OpenAI provider
const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  console.log('Refine API route hit (AI SDK streamText)');
  try {
    const body = await req.json();
    const { prompt: userPrompt, model: modelId } = body; // Renamed prompt to userPrompt to avoid conflict with streamText's prompt arg
    console.log('Received for refinement (AI SDK streamText):', { userPrompt, modelId });

    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY not configured');
      return new Response(JSON.stringify({ error: 'OpenAI API key not configured.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!userPrompt) {
      console.log('User prompt is missing');
      return new Response(JSON.stringify({ error: 'Prompt is required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const selectedModel = modelId || 'gpt-3.5-turbo';
    console.log('Using model (AI SDK streamText):', selectedModel);
    console.log('Constructing instruction for OpenAI (AI SDK streamText)');

    const systemInstruction = `You are an expert prompt engineer. Refine the following prompt to be more effective, clear, and concise.
The user is trying to use it with the ${selectedModel} model.
Do not add any preamble or explanation, just provide the refined prompt.`;

    console.log('Calling OpenAI API via streamText (AI SDK)...');

    const result = await streamText({
      model: openai(selectedModel), // Pass the modelId to the provider
      system: systemInstruction,
      prompt: userPrompt, // The user's actual prompt content
      temperature: 0.7,
      maxTokens: 500, 
    });
    console.log('OpenAI API call initiated via streamText (AI SDK).');

    // Respond with the raw text stream
    return new Response(result.textStream, { 
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });

  } catch (error: any) {
    console.error('Error in refine-prompt (AI SDK streamText):', error);
    let errorMessage = 'An unknown error occurred.';
    let errorStack = '';
    if (error instanceof Error) {
      errorMessage = error.message;
      errorStack = error.stack || '';
    }
    // Ensure that even in error cases, we're sending a JSON response if not streaming
    return new Response(JSON.stringify({ error: 'Failed to refine prompt.', details: errorMessage, stack: errorStack }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 