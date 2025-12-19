# Vercel Deployment Guide

## Required Environment Variables

Add these in Vercel Dashboard → Settings → Environment Variables:

1. `VITE_SUPABASE_URL` - Your Supabase project URL
2. `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key
3. `COMPANIES_HOUSE_API_KEY` - Your Companies House API key
4. `OPENAI_API_KEY` - Your OpenAI API key
5. `VITE_API_URL` - Leave this EMPTY (blank)

**Important**: Select Production, Preview, and Development for all variables!

## How It Works

- Frontend: Built from `/frontend` folder, deployed to root
- API Functions: Serverless functions in `/api` folder
- Routes: `/api/*` routes to serverless functions, everything else to frontend

## Local Development

```bash
# Install dependencies
npm run install:all

# Run frontend (in one terminal)
npm run dev:frontend

# Run backend (in another terminal)
npm run dev:backend
```
