import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Log configuration status (without exposing sensitive data)
console.log('Supabase Configuration:', {
  url: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'MISSING',
  key: supabaseAnonKey ? 'Present' : 'MISSING',
  env: import.meta.env.MODE
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? 'Set' : 'MISSING');
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Set' : 'MISSING');
}

if (!supabaseUrl || supabaseUrl === 'your_supabase_project_url_here') {
  throw new Error('VITE_SUPABASE_URL is not configured. Please set it in Vercel environment variables.');
}

if (!supabaseAnonKey || supabaseAnonKey === 'your_supabase_anon_key_here') {
  throw new Error('VITE_SUPABASE_ANON_KEY is not configured. Please set it in Vercel environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
