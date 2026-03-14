import { createClient } from "@supabase/supabase-js"

/**
 * Creates a Supabase client connected to the external MINT database.
 * Uses MINT_SUPABASE_URL and MINT_SUPABASE_ANON_KEY environment variables.
 */
export function createMintClient() {
  const url = process.env.MINT_SUPABASE_URL?.trim()
  const key = process.env.MINT_SUPABASE_ANON_KEY?.trim()

  if (!url || !/^https?:\/\/.+/.test(url)) {
    throw new Error("MINT_SUPABASE_URL is not configured or invalid")
  }
  if (!key) {
    throw new Error("MINT_SUPABASE_ANON_KEY is not configured")
  }

  return createClient(url, key)
}
