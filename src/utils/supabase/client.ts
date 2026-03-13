import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    // During build time on Vercel, these might be missing.
    // Return a dummy client or handle gracefully
    return createBrowserClient(
      supabaseUrl || 'https://placeholder.supabase.co',
      supabaseAnonKey || 'placeholder'
    )
  }

  // Create a supabase client on the browser with project's credentials
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
