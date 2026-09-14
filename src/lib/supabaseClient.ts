import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** True once real Supabase credentials are configured. When false, the app falls back to
 * local guest/demo mode instead of throwing — see AuthContext. */
export const supabaseConfigured = Boolean(url && anonKey);

if (!supabaseConfigured) {
  console.warn(
    '[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are not set — running in local guest mode only. See .env.example.',
  );
}

// Cast so the rest of the app can import a single client without null-checking everywhere;
// every call site is gated behind `supabaseConfigured` (see AuthContext) so this is only ever
// actually invoked once real credentials are present.
export const supabase = createClient(url || 'https://placeholder.supabase.co', anonKey || 'placeholder-anon-key', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
