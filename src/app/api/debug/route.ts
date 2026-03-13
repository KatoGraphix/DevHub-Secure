import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '***present***' : 'missing',
    node_env: process.env.NODE_ENV,
    has_env_local: process.env.NEXT_PUBLIC_SUPABASE_URL?.startsWith('https://'),
  })
}