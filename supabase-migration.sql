-- Supabase Database Migration Script
-- This script safely updates your database for the new features
-- Run this in your Supabase SQL Editor

-- Step 1: Create lists table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.lists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    list_name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Step 2: Add list_id column to company_lists if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'company_lists' 
        AND column_name = 'list_id'
    ) THEN
        ALTER TABLE public.company_lists 
        ADD COLUMN list_id UUID REFERENCES public.lists(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Step 3: Add notes column to company_lists if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'company_lists' 
        AND column_name = 'notes'
    ) THEN
        ALTER TABLE public.company_lists 
        ADD COLUMN notes TEXT;
    END IF;
END $$;

-- Step 4: Enable Row Level Security
ALTER TABLE public.lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_lists ENABLE ROW LEVEL SECURITY;

-- Step 5: Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Users can view their own lists" ON public.lists;
DROP POLICY IF EXISTS "Users can insert their own lists" ON public.lists;
DROP POLICY IF EXISTS "Users can update their own lists" ON public.lists;
DROP POLICY IF EXISTS "Users can delete their own lists" ON public.lists;

DROP POLICY IF EXISTS "Users can view their own company lists" ON public.company_lists;
DROP POLICY IF EXISTS "Users can insert their own company lists" ON public.company_lists;
DROP POLICY IF EXISTS "Users can update their own company lists" ON public.company_lists;
DROP POLICY IF EXISTS "Users can delete their own company lists" ON public.company_lists;

-- Step 6: Create fresh policies for lists table
CREATE POLICY "Users can view their own lists"
    ON public.lists
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own lists"
    ON public.lists
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lists"
    ON public.lists
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lists"
    ON public.lists
    FOR DELETE
    USING (auth.uid() = user_id);

-- Step 7: Create fresh policies for company_lists table
CREATE POLICY "Users can view their own company lists"
    ON public.company_lists
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own company lists"
    ON public.company_lists
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own company lists"
    ON public.company_lists
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own company lists"
    ON public.company_lists
    FOR DELETE
    USING (auth.uid() = user_id);

-- Step 8: Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS lists_user_id_idx ON public.lists(user_id);
CREATE INDEX IF NOT EXISTS lists_created_at_idx ON public.lists(created_at DESC);
CREATE INDEX IF NOT EXISTS company_lists_user_id_idx ON public.company_lists(user_id);
CREATE INDEX IF NOT EXISTS company_lists_list_id_idx ON public.company_lists(list_id);
CREATE INDEX IF NOT EXISTS company_lists_created_at_idx ON public.company_lists(created_at DESC);

-- Step 9: Create or replace the update function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 10: Drop and recreate triggers
DROP TRIGGER IF EXISTS update_lists_updated_at ON public.lists;
DROP TRIGGER IF EXISTS update_company_lists_updated_at ON public.company_lists;

CREATE TRIGGER update_lists_updated_at
    BEFORE UPDATE ON public.lists
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_lists_updated_at
    BEFORE UPDATE ON public.company_lists
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Step 11: Migrate existing data
-- Create a default list for users who have companies but no lists
INSERT INTO public.lists (user_id, list_name, description)
SELECT DISTINCT 
    cl.user_id, 
    'My Companies', 
    'Default list - automatically created'
FROM public.company_lists cl
WHERE cl.user_id NOT IN (SELECT user_id FROM public.lists)
ON CONFLICT DO NOTHING;

-- Step 12: Link existing companies to their user's first list
UPDATE public.company_lists cl
SET list_id = (
    SELECT l.id 
    FROM public.lists l 
    WHERE l.user_id = cl.user_id 
    ORDER BY l.created_at ASC 
    LIMIT 1
)
WHERE cl.list_id IS NULL;

-- Done! Check results
SELECT 'Migration completed successfully!' as status;
SELECT COUNT(*) as total_lists FROM public.lists;
SELECT COUNT(*) as total_companies FROM public.company_lists;
SELECT COUNT(*) as companies_with_list_id FROM public.company_lists WHERE list_id IS NOT NULL;
