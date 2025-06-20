
-- Ensure prompts table has all the columns needed by the editor
ALTER TABLE public.prompts 
ADD COLUMN IF NOT EXISTS prompt_content TEXT,
ADD COLUMN IF NOT EXISTS model TEXT DEFAULT 'gpt-4-turbo',
ADD COLUMN IF NOT EXISTS variables JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;

-- Update existing prompts that might have NULL values
UPDATE public.prompts 
SET 
  prompt_content = COALESCE(prompt_content, content, ''),
  model = COALESCE(model, 'gpt-4-turbo'),
  variables = COALESCE(variables, '[]'::jsonb),
  description = COALESCE(description, ''),
  tags = COALESCE(tags, '{}'),
  is_public = COALESCE(is_public, false),
  version = COALESCE(version, 1)
WHERE prompt_content IS NULL OR model IS NULL OR variables IS NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_prompts_user_id ON public.prompts(user_id);
CREATE INDEX IF NOT EXISTS idx_prompts_created_at ON public.prompts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prompts_is_public ON public.prompts(is_public) WHERE is_public = true;
