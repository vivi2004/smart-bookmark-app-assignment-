## Smart Bookmark App

This is a simple personal bookmark manager built with:

- Next.js App Router
- Supabase (Auth, Database, Realtime)
- Tailwind CSS (via `globals.css`)

It is designed for the assignment requirements:

- Google sign-in only (no email/password)
- User-specific, private bookmarks
- Real-time bookmark list updates across tabs
- Ability to add and delete bookmarks

## Getting Started

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the app.

### Supabase Setup

Follow `SETUP.md` for:

- Creating the `bookmarks` table and RLS policy (schema in `supabase/schema.sql`)
- Enabling Google OAuth in Supabase
- Configuring `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`

### What I Ran Into / How I Solved It

- **OAuth callback errors** – Initially I used a custom `/auth/callback` route with `exchangeCodeForSession`, which caused an “Authentication Error” page. I simplified the flow by letting Supabase handle the code exchange and redirecting directly back to `/dashboard`.
- **Missing bookmarks table (404 from REST API)** – Supabase returned `404` for `rest/v1/bookmarks` because the table didn’t exist yet. Running the SQL in `supabase/schema.sql` in Supabase’s SQL Editor created the table and fixed the issue.
- **UI contrast issues** – Some category chips and modal inputs were hard to see on the dashboard background. I adjusted Tailwind classes (card badges, inputs, selects) to use higher-contrast colors so labels and fields are clearly visible.
