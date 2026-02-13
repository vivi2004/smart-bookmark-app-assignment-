<<<<<<< HEAD

=======
>>>>>>> 541370f (docs: update README to reflect application features, development challenges, and solutions)

# Smart Bookmark App

A modern, real-time bookmark management application built with Next.js and Supabase. This application demonstrates secure user authentication, private data management, and real-time synchronization across multiple browser tabs.

##   Live Demo

[https://smart-bookmark-app.vercel.app](https://smart-bookmark-app-assignment.vercel.app/)

##  Tech Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL Database, Authentication, Realtime)
- **Authentication**: Google OAuth (exclusive)
- **Deployment**: Vercel
- **State Management**: React Hooks, Real-time Subscriptions

##  Key Features

###  Secure Authentication
- **Google OAuth Only**: No email/password authentication
- **Session Management**: Persistent user sessions with automatic token refresh
- **Protected Routes**: Middleware-based route protection

###  Bookmark Management
- **CRUD Operations**: Create, read, update, and delete bookmarks
- **Private Data**: Each user sees only their own bookmarks
- **Metadata Support**: Title, URL, description, and category tags
- **Search & Filter**: Real-time search and category-based filtering

###  Real-time Features
- **Live Synchronization**: Changes appear instantly across all open tabs
- **Conflict Resolution**: Optimistic updates with automatic rollback on errors
- **Real-time Subscriptions**: PostgreSQL change notifications via Supabase

###  Modern UI/UX
- **Responsive Design**: Mobile-first approach with desktop optimization
- **Dark Mode Support**: System preference detection with manual toggle
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support
- **Micro-interactions**: Smooth animations and loading states

##  Architecture

### Database Schema
```sql
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

-- Row Level Security (RLS) Policies
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bookmarks" ON bookmarks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bookmarks" ON bookmarks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookmarks" ON bookmarks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks" ON bookmarks
  FOR DELETE USING (auth.uid() = user_id);
```

### Real-time Implementation
The application uses Supabase's real-time subscriptions to listen for database changes:

```typescript
const channel = supabase
  .channel('bookmarks')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'bookmarks',
    filter: `user_id=eq.${user.id}`
  }, (payload) => {
    // Handle INSERT, UPDATE, DELETE events
    updateBookmarks(payload)
  })
  .subscribe()
```

##  Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/smart-bookmark-app.git
   cd smart-bookmark-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Run the SQL schema from `supabase/schema.sql`
   - Enable Google OAuth in Authentication → Providers
   - Configure Google Cloud Console with Supabase redirect URL

4. **Environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Run development server**
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000)

##  Testing

### Manual Testing Checklist

#### Authentication
- [ ] Google OAuth login works correctly
- [ ] User session persists after page refresh
- [ ] Logout redirects to home page
- [ ] Protected routes redirect unauthenticated users

#### Bookmark Management
- [ ] Create new bookmark with all fields
- [ ] Edit existing bookmark
- [ ] Delete bookmark with confirmation
- [ ] Bookmarks are user-specific (privacy test)

#### Real-time Features
- [ ] Open app in two tabs with same user
- [ ] Add bookmark in one tab → appears in other
- [ ] Edit bookmark in one tab → updates in other
- [ ] Delete bookmark in one tab → removes from other

#### UI/UX
- [ ] Responsive design on mobile/tablet/desktop
- [ ] Dark mode toggle works correctly
- [ ] Loading states and error handling
- [ ] Accessibility features (keyboard navigation, screen readers)

##  Development

### Project Structure
```
src/
├── app/                 # Next.js App Router
│   ├── dashboard/       # Main dashboard page
│   ├── auth/           # Authentication pages
│   └── globals.css     # Global styles
├── components/         # Reusable React components
│   ├── ui/            # Base UI components
│   ├── BookmarkList.tsx
│   ├── AddBookmarkModal.tsx
│   └── ...
├── hooks/             # Custom React hooks
│   ├── useAuth.ts
│   ├── useBookmarks.ts
│   └── useToast.ts
├── lib/               # Utility libraries
│   ├── supabase.ts
│   └── utils.ts
└── types/             # TypeScript type definitions
```

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler
```

##  Deployment

### Vercel (Recommended)
1. Push code to GitHub repository
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push to main branch

### Environment Variables for Production
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Post-Deployment Configuration
1. Update Supabase Auth → URL Configuration with your Vercel domain
2. Add Vercel URL to Google OAuth redirect URIs
3. Test live application functionality

##   Troubleshooting





##  OAuth Callback Configuration Issues

### Problem

Initially used a custom `/auth/callback` route with `exchangeCodeForSession`, which caused **Authentication Error pages** and session inconsistencies.

### Solution

Simplified the authentication flow by letting Supabase handle the entire OAuth exchange automatically.

* Removed custom callback route
* Allowed Supabase to redirect directly to the dashboard
* Eliminated session management complexity
* Reduced authentication errors completely

---

## 2️⃣ Row Level Security (RLS) Not Working

### Problem

Users could see each other's bookmarks despite implementing RLS policies.
Policies were written correctly but were not being enforced.

### Solution

Discovered that RLS was not enabled on the `bookmarks` table.

```sql
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
```

Also learned that RLS policies must be explicitly defined for each operation:

* `SELECT`
* `INSERT`
* `UPDATE`
* `DELETE`

A single policy does **not** cover all operations.

---

##  Real-time Subscriptions Not Firing

### Problem

Database changes were not triggering real-time updates across browser tabs.
No console errors, but subscriptions remained silent.

### Solution

Two root causes were identified:

#### 1. Replication Not Enabled

Realtime must be enabled explicitly for each table.

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE bookmarks;
```

#### 2. RLS Filter Missing

Realtime subscriptions must respect RLS policies.

```ts
filter: `user_id=eq.${user.id}`
```

---

##  TypeScript Build Errors with React Components

### Problem

Custom hooks returning JSX components caused TypeScript build failures.

### Solution

* Separated component logic from hooks
* Moved JSX to dedicated component files
* Kept hooks focused only on state management

This improved code organization and resolved compilation errors.

---

##   Environment Variables Not Loading in Production

### Problem

App worked locally but failed in production with `"undefined" Supabase client` errors.

### Solution

* Verified environment variables in the Vercel dashboard
* Ensured all client-side variables had the `NEXT_PUBLIC_` prefix
* Added environment variable validation during Supabase client initialization

---

##  Mobile Responsiveness Issues

### Problem

Dashboard layout broke on mobile devices:

* Horizontal scrolling
* Overlapping elements

### Solution

Implemented mobile-first responsive design:

* Added proper viewport meta tag
* Used Tailwind responsive utilities (`sm:`, `md:`, `lg:`)
* Converted fixed widths to responsive containers
* Implemented mobile-friendly navigation

---

## 7️⃣ Performance Issues with Large Bookmark Lists

### Problem

App became slow when users had 50+ bookmarks due to excessive re-renders.

### Solution

Implemented performance optimizations:

* Added `React.memo()` to bookmark items
* Used `useCallback()` for handlers
* Implemented virtual scrolling
* Added debounced search functionality

---

## 8️⃣ Session Persistence Issues

### Problem

Users were logged out after refreshing or reopening the browser.

### Solution

Configured Supabase session persistence correctly:

```ts

---


- **RLS is Critical**: Security policies must be thoroughly tested with different user scenarios
- **Realtime Requires Setup**: Unlike basic CRUD operations, real-time features need explicit configuration
- **Environment Management**: Production deployments require careful environment variable handling
- **Mobile-First Approach**: Responsive design should be considered from the start, not added as an afterthought
- **Performance Monitoring**: Regular performance testing prevents user experience degradation


- **Code Splitting**: Automatic route-based code splitting
- **Image Optimization**: Next.js Image component for lazy loading
- **Database Indexing**: Optimized queries with proper indexes
- **Caching**: Supabase edge caching for frequently accessed data
- **Bundle Analysis**: Regular bundle size monitoring

##  Security Features

- **Row Level Security**: Database-level access control
- **JWT Authentication**: Secure token-based authentication
- **HTTPS Only**: Enforced secure connections in production
- **CSRF Protection**: Built-in Next.js CSRF protection
- **Input Validation**: Client and server-side validation
- **SQL Injection Prevention**: Parameterized queries via Supabase

##  Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

##  License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

##  Acknowledgments

- [Supabase](https://supabase.com) for the amazing backend-as-a-service platform
- [Next.js](https://nextjs.org) for the React framework
- [Tailwind CSS](https://tailwindcss.com) for the utility-first CSS framework
- [Vercel](https://vercel.com) for the seamless deployment platform

---

**Built with me for the full-stack development assignment**
