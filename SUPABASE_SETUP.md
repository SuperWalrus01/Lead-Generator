# Supabase Integration Setup Guide

## 🎯 Features Added

1. **Supabase Authentication** - Email/password sign up and login
2. **My List** - Save companies you've looked at
3. **User-specific Lists** - Each user has their own private list stored in Supabase
4. **Add/Remove Companies** - Easily manage your company list

---

## 🚀 Setup Instructions

### Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click **"New Project"**
4. Fill in:
   - **Project Name**: `IFAs-Companies`
   - **Database Password**: (choose a strong password)
   - **Region**: Choose closest to you
5. Click **"Create new project"** and wait for it to initialize (~2 minutes)

---

### Step 2: Get Your Supabase Credentials

Once your project is created:

1. Go to **Settings** → **API** in your Supabase dashboard
2. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public key** (starts with `eyJhbGciOi...`)
   - **service_role key** (starts with `eyJhbGciOi...`) - ⚠️ Keep this secret!

---

### Step 3: Configure Environment Variables

#### Backend (.env in root):
Edit `/Users/keenan/Desktop/IFAs-main/api_keys.env`:
```env
COMPANIES_HOUSE_API_KEY=75e895b7-602c-4b55-8a0a-cadfa6a42c0f
FCA_API_KEY=463e367a439cf754144adafde44561b2

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

#### Frontend (.env in frontend folder):
Edit `/Users/keenan/Desktop/IFAs-main/frontend/.env`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

**Replace the placeholder values with your actual Supabase credentials!**

---

### Step 4: Set Up Database Tables

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **"New Query"**
3. Copy the entire contents of `supabase-schema.sql`
4. Paste it into the SQL editor
5. Click **"Run"** or press `Ctrl+Enter`

This creates:
- `company_lists` table to store user lists
- Row Level Security (RLS) policies so users can only see their own data
- Indexes for better performance
- Automatic timestamp updates

---

### Step 5: Enable Email Authentication

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Make sure **Email** is enabled (it should be by default)
3. Optionally configure:
   - **Email templates** (Authentication → Email Templates)
   - **Site URL** (Authentication → URL Configuration) - set to `http://localhost:5173` for development

---

### Step 6: Start Your Application

#### Terminal 1 - Backend:
```bash
cd /Users/keenan/Desktop/IFAs-main
npm start
```

#### Terminal 2 - Frontend:
```bash
cd /Users/keenan/Desktop/IFAs-main/frontend
npm run dev
```

Open **http://localhost:5173**

---

## 🎉 How to Use

### 1. Sign Up
- Click "Don't have an account? Sign Up"
- Enter your email and password (min 6 characters)
- Check your email for confirmation link
- Click the confirmation link
- Return to the app and sign in

### 2. Sign In
- Enter your confirmed email and password
- Click "Sign In"

### 3. Search for Companies
- Select a predefined search term OR enter custom term
- Click "Search Companies"
- View results with elderly directors (60+)

### 4. Add to Your List
- Click **"+ Add to List"** button on any company card
- The button changes to **"✓ In List"** when added
- Company is saved to your personal list in Supabase

### 5. View Your List
- Click the **"My List"** button in the top right
- See the count badge showing number of saved companies
- View all your saved companies
- Click **"Remove"** to delete from your list

---

## 🔒 Security Features

✅ **Row Level Security (RLS)** - Users can only access their own data  
✅ **Email Verification** - New users must verify email  
✅ **Secure Passwords** - Minimum 6 characters, hashed by Supabase  
✅ **Session Management** - Automatic token refresh  
✅ **Service Role Key** - Kept secret on backend only  

---

## 📊 Database Schema

**Table: `company_lists`**

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to auth.users |
| company_number | TEXT | UK company number |
| company_name | TEXT | Company name |
| company_status | TEXT | Active/Dissolved etc |
| company_address | TEXT | Company address |
| company_postcode | TEXT | Postcode |
| director_name | TEXT | Youngest director name |
| director_age | INTEGER | Director's age |
| is_elderly | BOOLEAN | True if 60+ |
| link | TEXT | Companies House URL |
| created_at | TIMESTAMP | When added |
| updated_at | TIMESTAMP | Last updated |

---

## 🐛 Troubleshooting

### "Missing Supabase credentials" error
- Make sure you've updated both `.env` files with your actual credentials
- Restart both backend and frontend servers

### "Invalid login credentials" error
- Make sure you've verified your email
- Check that you're using the correct password
- Try signing up with a new account

### "Failed to add company to list"
- Make sure you ran the SQL schema in Supabase
- Check that RLS policies are enabled
- Verify you're logged in

### Frontend can't connect to Supabase
- Check `frontend/.env` has correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart the frontend dev server: `npm run dev`

---

## 🎨 New UI Features

- **"My List" button** with badge counter in header
- **"+ Add to List"** button on each company card
- **"✓ In List"** disabled state when already added
- **Collapsible "My List" panel** showing all saved companies
- **Remove button** for each list item
- **Sign Up/Sign In toggle** on login page

---

## 🔧 Files Modified

- ✅ `frontend/src/App.jsx` - Supabase session management
- ✅ `frontend/src/components/Login.jsx` - Email authentication
- ✅ `frontend/src/components/Dashboard.jsx` - My List functionality
- ✅ `frontend/src/components/CompanyCard.jsx` - Add to List button
- ✅ `frontend/src/supabaseClient.js` - Frontend Supabase config
- ✅ `supabaseClient.js` - Backend Supabase config (if needed)
- ✅ `supabase-schema.sql` - Database setup script
- ✅ `api_keys.env` - Added Supabase credentials
- ✅ `frontend/.env` - Frontend environment variables

---

## 🚀 Next Steps (Optional Enhancements)

- Add notes field to saved companies
- Export list to CSV
- Share lists between users
- Add tags/categories to companies
- Email notifications for new elderly director companies
- Analytics dashboard

---

Enjoy your new Supabase-powered company list feature! 🎉
