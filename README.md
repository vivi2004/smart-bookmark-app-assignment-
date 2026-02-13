# Smart Bookmark App

A simple personal bookmark manager built with **Next.js (App Router)**, **Supabase**, and **Tailwind CSS**.  
Users sign in with Google, manage their own private bookmarks, and see updates in real time across multiple tabs.

---

## Live Demo & Repository

- **Live app:** `https://smart-bookmark-app-assignment.vercel.app/`  
- **GitHub repo:** `https://github.com/vivi2004/smart-bookmark-app-assignment-` 

---

## Features (Assignment Requirements)

- **Google sign‑in only**
  - Uses `supabase.auth.signInWithOAuth({ provider: "google" })`.
  - No email/password flow in the UI.

- **Private bookmarks per user**
  - Each row in the `bookmarks` table has a `user_id` column.
  - Row Level Security (RLS) ensures users can only access their own data.

- **Bookmark management**
  - Add bookmarks with **title**, **URL**, optional **description**, and **category**.
  - Edit and delete existing bookmarks.
  - Search by text and filter by category.

- **Realtime updates**
  - Supabase **Postgres Changes** channel on `bookmarks` filtered by `user_id`.
  - Changes made in one tab appear in other tabs for the same user without refresh.

---

## Tech Stack

- **Framework:** Next.js (App Router, TypeScript)
- **Backend as a service:** Supabase (Auth, Database, Realtime)
- **Database:** PostgreSQL (managed by Supabase)
- **Styling:** Tailwind CSS (utility classes via `globals.css`)
- **Deployment:** Vercel

---

## Data Model & Security

### `bookmarks` table

```sql
CREATE TABLE bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own bookmarks" ON bookmarks
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

This guarantees that all CRUD operations are automatically scoped to the authenticated user.

---

## Getting Started (Local Development)

### 1. Prerequisites

- Node.js 18+
- npm (or pnpm / yarn)
- Supabase account

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Supabase

1. Create a new Supabase project.  
2. In the **SQL Editor**, run the contents of `supabase/schema.sql`.  
3. In **Authentication → Providers**, enable **Google** and configure:
   - Client ID and Client Secret from Google Cloud Console.
   - Redirect URL: `https://<your-project-ref>.supabase.co/auth/v1/callback`.

### 4. Environment variables

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

### 5. Start the dev server

```bash
npm run dev
```

Open `http://localhost:3000` and sign in with Google to start using the app.

---

## Deployment (Vercel + Supabase)

1. Push the project to a **public GitHub repository**.
2. Create a new project on **Vercel** and import the repo.
3. In Vercel project settings, add:

   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. In the Supabase dashboard → **Authentication → URL Configuration**:

   - **Site URL:** `https://smart-bookmark-app.vercel.app`  
   - **Redirect URLs:** include both  
     - `http://localhost:3000`  
     - `https://smart-bookmark-app.vercel.app`

5. Redeploy on Vercel. Google sign‑in should now return to the Vercel domain rather than `localhost`.

---

## What I Ran Into & How I Solved It

**1. OAuth callback / authentication errors**  
- *Problem:* Using a custom `/auth/callback` route with `exchangeCodeForSession` led to an “Authentication Error” page and unreliable sessions.  
- *Solution:* Simplified the flow by removing the custom callback route and letting Supabase handle the code exchange. The client now uses `signInWithOAuth` with `redirectTo: ${window.location.origin}/dashboard`, which works both locally and on Vercel.

**2. Redirecting to `http://localhost:3000` after deployment**  
- *Problem:* After Google sign‑in on Vercel, the app redirected back to `localhost` instead of the production URL.  
- *Cause:* Supabase Auth **Site URL** and **Redirect URLs** still pointed to `http://localhost:3000`.  
- *Solution:* Updated Supabase Auth configuration to use the Vercel URL as Site URL and added both localhost and the Vercel URL as allowed redirects.

**3. `404` / 403 errors from Supabase REST and Auth**  
- *Problem:* `rest/v1/bookmarks` returned `404`, and `/auth/v1/user` sometimes returned `403`.  
- *Cause:* The `bookmarks` table did not exist yet, and I was calling `getUser()` before any session existed.  
- *Solution:* Created the table and RLS policy by running `supabase/schema.sql`, and treated initial `getUser()` failures as “not logged in” instead of an error condition.

**4. Realtime not updating across tabs**  
- *Problem:* Adding or deleting bookmarks in one browser tab did not update other tabs.  
- *Solution:* Added a Supabase **channel** listening on `postgres_changes` for the `bookmarks` table and enabled Realtime for that table in the Supabase dashboard. The client merges `INSERT`, `UPDATE`, and `DELETE` events into local React state.

**5. Faded UI elements**  
- *Problem:* The search bar, category select, and some badge text were too light and hard to read.  
- *Solution:* Adjusted Tailwind classes (`text-gray-*`, `bg-white`, better placeholders, higher‑contrast badges) to improve readability while keeping the overall design simple.

---

## How to Manually Test

1. **Authentication**
   - Open the app and click **“Sign in with Google”**.
   - Refresh the page to confirm the session persists.
   - Use the profile icon menu to sign out and verify it returns to the home page.

2. **Bookmark CRUD**
   - Add a bookmark (title + URL are required).
   - Edit its title or category.
   - Delete it and confirm it disappears from the list.

3. **Realtime**
   - Open the app in two tabs with the same logged‑in account.
   - Add, edit, and delete bookmarks in one tab and verify the other tab updates automatically.

4. **Per‑user privacy**
   - Log out and log back in with a different Google account.
   - Confirm that bookmarks from one account are not visible in the other.

---

## Scripts

```bash
npm run dev    # Start development server
npm run build  # Production build (used by Vercel)
npm run start  # Run production build locally
npm run lint   # Run ESLint
```

---

**Built for the “Smart Bookmark App” assignment, with a focus on correctness, real‑time behavior, and clear explanation of decisions and trade‑offs.**

