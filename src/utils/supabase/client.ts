import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  console.log('Environment variables:', { supabaseUrl, supabaseAnonKey })

  if (!supabaseUrl || !supabaseAnonKey || !supabaseUrl.startsWith('http')) {
    console.warn('Missing or invalid Supabase environment variables, using placeholder')
    // During build time on Vercel, these might be missing or placeholder.
    // Return a dummy client or handle gracefully to prevent "Invalid supabaseUrl" error
    return createBrowserClient(
      'https://placeholder.supabase.co',
      'placeholder'
    )
  }

  // Create a supabase client on the browser with project's credentials
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
