import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()

  if (!supabaseUrl || !supabaseAnonKey || !/^https?:\/\/.+/.test(supabaseUrl)) {
    console.warn('Missing or invalid Supabase environment variables — check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
    return createBrowserClient(
      'https://placeholder.supabase.co',
      'placeholder'
    )
  }

  // Create a supabase client on the browser with project's credentials
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
