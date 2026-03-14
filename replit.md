# Developer Dashboard

A Next.js 14 developer dashboard application using Supabase for authentication and data storage.

## Architecture

- **Framework**: Next.js 14 (App Router)
- **Auth & Database**: Supabase (SSR-compatible client)
- **Styling**: Tailwind CSS + shadcn/ui components
- **Forms**: React Hook Form + Zod validation
- **Tables**: TanStack React Table
- **Animations**: Framer Motion
- **Package Manager**: npm

## Project Structure

```
src/
  app/        - Next.js App Router pages and layouts
  components/ - Reusable UI components
  lib/        - Utilities, Supabase client setup
  utils/      - Helper functions
  middleware.ts - Auth middleware (Supabase SSR)
public/       - Static assets
scripts/      - Utility scripts
```

## Environment Variables

Required secrets (set in Replit Secrets):
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous/public key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (server-side only)

## Running the App

The app runs on port 5000 via the "Start application" workflow.

- **Dev**: `npm run dev` (next dev -p 5000 -H 0.0.0.0)
- **Build**: `npm run build`
- **Start**: `npm run start` (next start -p 5000 -H 0.0.0.0)

## Replit Migration Notes

- Dev and start scripts updated to bind to `0.0.0.0:5000` for Replit preview pane compatibility
- Configured with "Start application" workflow on port 5000
