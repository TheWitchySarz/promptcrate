import { z } from 'zod';

// Define AI models specifically for validation consistency
// This should be kept in sync with frontend lists, excluding 'All' type options if any.
export const AI_MODELS_FOR_VALIDATION = ['ChatGPT-4', 'ChatGPT-3.5', 'Midjourney', 'DALL·E 3', 'Claude 2', 'Other'];

export const promptSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters long').max(100, 'Title must be 100 characters or less'),
  description: z.string().min(20, 'Description must be at least 20 characters long').max(300, 'Description must be 300 characters or less'),
  model: z.string().refine(value => AI_MODELS_FOR_VALIDATION.includes(value), { message: 'Invalid AI model selected' }),
  tags: z.array(z.string().min(1, { message: 'Tag cannot be empty' }).max(20, { message: 'Tag can be max 20 chars' }))
    .min(1, { message: 'At least one tag is required' })
    .max(5, { message: 'You can add up to 5 tags' }),
  price: z.union([
    z.literal('Free'),
    z.number()
      .min(0, { message: 'Price must be $0 or a positive number. For free, type \'Free\'.' })
      .max(999, { message: 'Price cannot exceed $999' })
  ]),
  promptContent: z.string().min(50, 'Prompt content must be at least 50 characters long').max(5000, 'Prompt content must be 5000 characters or less'),
});

export type PromptFormValues = z.infer<typeof promptSchema>; 