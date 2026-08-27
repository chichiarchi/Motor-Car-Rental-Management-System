import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient as createSupabaseJsClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

/**
 * Creates a Supabase client for use in React Server Components,
 * Server Actions, and Route Handlers.
 * Uses the user's session cookies.
 */
export async function createClient() {
  const cookieStore = await cookies();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return createServerClient<any>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // no-op in RSC context — middleware handles session refresh
          }
        },
      },
    }
  );
}

/**
 * Creates a true Admin Supabase client using the Service Role key.
 * Uses standard @supabase/supabase-js client without cookie overrides
 * to guarantee that requests send the service-role Authorization header
 * and bypass RLS for server actions & storage uploads.
 *
 * Use ONLY on the server — never expose to client components.
 */
export async function createAdminClient() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return createSupabaseJsClient<any>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}
