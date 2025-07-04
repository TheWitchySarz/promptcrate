
-- Create prompts table
CREATE TABLE IF NOT EXISTS public.prompts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    prompt_content TEXT NOT NULL,
    description TEXT,
    model TEXT,
    variables JSONB DEFAULT '[]'::jsonb,
    tags TEXT[] DEFAULT '{}',
    is_public BOOLEAN DEFAULT false,
    version INTEGER DEFAULT 1,
    temperature DECIMAL DEFAULT 0.7,
    max_tokens INTEGER DEFAULT 2048,
    top_p DECIMAL DEFAULT 1.0,
    frequency_penalty DECIMAL DEFAULT 0.0,
    presence_penalty DECIMAL DEFAULT 0.0,
    visibility TEXT DEFAULT 'private' CHECK (visibility IN ('private', 'team', 'public')),
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up RLS
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own prompts" ON public.prompts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own prompts" ON public.prompts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own prompts" ON public.prompts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own prompts" ON public.prompts
    FOR DELETE USING (auth.uid() = user_id);

-- Create updated_at trigger for prompts
CREATE TRIGGER prompts_updated_at
    BEFORE UPDATE ON public.prompts
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
