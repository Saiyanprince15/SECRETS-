import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!url || !anonKey) {
  console.warn(
    'Supabase env vars missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
  );
}

export const supabase = createClient(url ?? '', anonKey ?? '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/** Fetch the profile row for a user, creating it on first login. */
export async function ensureProfile(userId: string, email: string) {
  const { data: existing } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (existing) return existing;

  const { data, error } = await supabase
    .from('user_profiles')
    .insert({
      id: userId,
      email,
      explorer_name: email.split('@')[0] || 'The Wanderer',
      logged_in: true,
    })
    .select()
    .single();

  if (error) {
    console.error('Could not create profile:', error.message);
    return null;
  }
  return data;
}
