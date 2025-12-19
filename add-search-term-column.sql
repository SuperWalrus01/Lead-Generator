-- Migration: Add search_term column to saved_companies table
-- Run this in your Supabase SQL Editor

-- Add search_term column to saved_companies table
ALTER TABLE public.saved_companies 
ADD COLUMN IF NOT EXISTS search_term TEXT;

-- Create index for faster grouping queries
CREATE INDEX IF NOT EXISTS saved_companies_search_term_idx 
ON public.saved_companies(search_term);

-- Verify the change
SELECT 'search_term column added successfully!' as status;
