import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

// Ensure your OpenAI API key is set in your .env.local file
// OPENAI_API_KEY=your_key_here

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  console.log("[/api/refine-prompt] Received POST request");
  try {
    const body = await req.json();
    const userPrompt = body.prompt;
    const targetModel = body.model || 'the specified AI model';
    console.log("[/api/refine-prompt] User Prompt:", userPrompt);
    console.log("[/api/refine-prompt] Target Model:", targetModel);

    if (!userPrompt) {
      console.log("[/api/refine-prompt] Error: Prompt is required");
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      console.error('[/api/refine-prompt] Error: OpenAI API key not configured.');
      return NextResponse.json({ error: 'AI service not configured.' }, { status: 500 });
    }
    console.log("[/api/refine-prompt] OpenAI API key found.");

    // You can customize the model and the instruction to the AI
    const instruction = 
`You are an expert AI prompt engineer. 
Review the following user-submitted prompt and rewrite it to be more effective, clear, and comprehensive. This prompt is intended for use with the ${targetModel}. 
Consider common pitfalls like vagueness, lack of context, or overly complex phrasing. 
Aim to enhance clarity, specificity, and potential for generating high-quality responses tailored for ${targetModel}. 
Do not add any conversational fluff or explanations, just return the refined prompt text.

Original Prompt:
---
${userPrompt}
---
Refined Prompt:`;
    console.log("[/api/refine-prompt] Instruction for OpenAI:", instruction);

    console.log("[/api/refine-prompt] Calling OpenAI API...");
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Or your preferred model, e.g., "gpt-4"
      messages: [
        {
          role: "user", 
          content: instruction,
        }
      ],
      temperature: 0.5, // Adjust for creativity vs. determinism
      max_tokens: 1024, // Adjust as needed for expected prompt length
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });
    console.log("[/api/refine-prompt] OpenAI API call completed.");

    const rawResponseContent = completion.choices[0]?.message?.content;
    console.log("[/api/refine-prompt] Raw response content from OpenAI:", rawResponseContent);

    const refinedPrompt = rawResponseContent?.trim();

    if (!refinedPrompt) {
      console.log("[/api/refine-prompt] Error: Failed to get a refined prompt from AI. Raw content was:", rawResponseContent);
      return NextResponse.json({ error: 'Failed to get a refined prompt from AI' }, { status: 500 });
    }
    console.log("[/api/refine-prompt] Refined prompt:", refinedPrompt);

    return NextResponse.json({ refinedPrompt });

  } catch (error) {
    console.error('[/api/refine-prompt] Error in POST handler:', error);
    let errorMessage = 'An unexpected error occurred';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    // More specific error handling can be added here based on OpenAI error types
    return NextResponse.json({ error: 'Failed to refine prompt', details: errorMessage }, { status: 500 });
  }
} 