import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

/**
 * Creates a Supabase admin client with service role privileges.
 * 
 * ⚠️ WARNING: This client bypasses Row Level Security (RLS) policies.
 * Use ONLY in server-side code (Server Actions, API routes) for admin operations.
 * NEVER expose the service role key in client-side code.
 * 
 * @returns Supabase admin client instance with full database access
 * 
 * @example
 * ```typescript
 * // In a Server Action
 * 'use server'
 * const adminClient = createAdminClient()
 * // Can perform admin operations like approving sellers, managing all products
 * const { data } = await adminClient.from('sellers').update({ status: 'active' }).eq('id', sellerId)
 * ```
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
      'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env.local file. See docs/supabase-setup.md for instructions.'
    )
  }

  return createSupabaseClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
