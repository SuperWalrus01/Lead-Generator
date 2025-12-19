-- Supabase Database Setup Script - Safe Migration
-- Run this in your Supabase SQL Editor
-- This will safely clean up old structure and create new simplified version

-- Step 1: Drop old tables if they exist (CASCADE will handle policies and triggers)
DROP TABLE IF EXISTS public.saved_companies CASCADE;
DROP TABLE IF EXISTS public.company_lists CASCADE;
DROP TABLE IF EXISTS public.lists CASCADE;

-- Step 2: Drop old function if exists
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Step 3: Create new saved_companies table
CREATE TABLE public.saved_companies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    company_number TEXT NOT NULL,
    company_name TEXT NOT NULL,
    company_status TEXT,
    company_address TEXT,
    company_postcode TEXT,
    director_name TEXT,
    director_age INTEGER,
    is_elderly BOOLEAN DEFAULT false,
    link TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT saved_companies_unique_per_user UNIQUE(user_id, company_number)
);

-- Step 4: Enable Row Level Security (RLS)
ALTER TABLE public.saved_companies ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS Policies
CREATE POLICY "saved_companies_select_policy"
    ON public.saved_companies
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "saved_companies_insert_policy"
    ON public.saved_companies
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "saved_companies_update_policy"
    ON public.saved_companies
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "saved_companies_delete_policy"
    ON public.saved_companies
    FOR DELETE
    USING (auth.uid() = user_id);

-- Step 6: Create indexes for faster queries
CREATE INDEX saved_companies_user_id_idx ON public.saved_companies(user_id);
CREATE INDEX saved_companies_created_at_idx ON public.saved_companies(created_at DESC);
CREATE INDEX saved_companies_company_number_idx ON public.saved_companies(company_number);

-- Step 7: Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 8: Create trigger to automatically update updated_at
CREATE TRIGGER update_saved_companies_updated_at
    BEFORE UPDATE ON public.saved_companies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Done! You should see a success message
SELECT 'Database setup completed successfully!' as status;
