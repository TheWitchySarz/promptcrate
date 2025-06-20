import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

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
    // Create Supabase client for authentication check
    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('Authentication error:', authError);
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check if user has a premium subscription
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return new Response(JSON.stringify({ error: 'Error verifying subscription status' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const userPlan = profile?.plan || 'free';
    const isPremiumUser = userPlan === 'pro' || userPlan === 'enterprise';

    if (!isPremiumUser) {
      console.log('Free user attempted to use AI feature:', { userId: user.id, plan: userPlan });
      return new Response(JSON.stringify({ 
        error: 'This feature requires a premium subscription',
        details: { currentPlan: userPlan, userId: user.id }
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

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

    const systemInstruction = `You are an expert prompt engineer with deep knowledge of ${selectedModel}. 

Your task: Transform the user's prompt to be significantly more effective by:

1. Adding specific instructions for clarity
2. Including relevant context and constraints  
3. Optimizing for ${selectedModel}'s strengths
4. Adding structured output formatting when beneficial
5. Including examples if they would improve results

Guidelines:
- Preserve the user's core intent
- Make concrete improvements, not just cosmetic changes
- Add specific details that will improve AI output quality
- Use proven prompt engineering techniques (chain-of-thought, few-shot examples, role specification)
- Structure the prompt for better parsing by ${selectedModel}

Return only the refined prompt with no explanatory text.`;

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