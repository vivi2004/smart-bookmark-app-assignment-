# Supabase Setup Guide

## 1. Database Setup

### Create the bookmarks table:
1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Copy and run the SQL from `supabase/schema.sql`

Or run this SQL directly:

```sql
-- Create bookmarks table
CREATE TABLE bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX idx_bookmarks_category ON bookmarks(category);
CREATE INDEX idx_bookmarks_created_at ON bookmarks(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- Create policy for users to manage their own bookmarks
CREATE POLICY "Users can manage their own bookmarks" ON bookmarks
  FOR ALL USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_bookmarks_updated_at 
  BEFORE UPDATE ON bookmarks 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## 2. Google OAuth Configuration

### Step 1: Get Google OAuth Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Go to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client IDs**
5. Select **Web application**
6. Add authorized redirect URI: `https://[YOUR-SUPABASE-PROJECT].supabase.co/auth/v1/callback`
7. Copy the **Client ID** and **Client Secret**

### Step 2: Configure Supabase
1. Go to your Supabase dashboard
2. Navigate to **Authentication** → **Providers**
3. Enable **Google** provider
4. Add your Google **Client ID** and **Client Secret**
5. Set the redirect URL to: `https://[YOUR-SUPABASE-PROJECT].supabase.co/auth/v1/callback`

### Step 3: Update Environment Variables
Make sure your `.env.local` file has:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 3. Test the Setup

1. Restart your development server: `npm run dev`
2. Visit http://localhost:3001
3. Click "Sign in with Google"
4. Complete the OAuth flow
5. You should be redirected to the dashboard
6. Try adding a bookmark to test the database connection

## 4. Troubleshooting

### Common Issues:
- **"Invalid redirect_uri"**: Make sure the redirect URI in Google Console matches your Supabase project URL
- **"Database relation does not exist"**: Run the SQL schema in Supabase SQL Editor
- **"Permission denied"**: Make sure RLS policies are correctly set up

### Check Connection:
```sql
-- Test if table exists
SELECT * FROM bookmarks LIMIT 1;

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'bookmarks';
```

## 5. Environment Variables Reference

Get these from your Supabase dashboard → **Settings** → **API**:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```
