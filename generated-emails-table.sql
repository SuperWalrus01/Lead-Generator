-- Create table for saved generated emails
CREATE TABLE public.generated_emails (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    company_id UUID REFERENCES public.saved_companies(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    company_number TEXT,
    director_name TEXT,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    custom_instructions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.generated_emails ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "generated_emails_select_policy"
    ON public.generated_emails
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "generated_emails_insert_policy"
    ON public.generated_emails
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "generated_emails_delete_policy"
    ON public.generated_emails
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX generated_emails_user_id_idx ON public.generated_emails(user_id);
CREATE INDEX generated_emails_created_at_idx ON public.generated_emails(created_at DESC);
CREATE INDEX generated_emails_company_id_idx ON public.generated_emails(company_id);

SELECT 'Generated emails table created successfully!' as status;
