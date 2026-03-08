import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Defer validation until runtime, not build time
let supabase: ReturnType<typeof createClient>;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  // Create a dummy client that will fail gracefully if called
  supabase = createClient('https://placeholder.supabase.co', 'placeholder-key');
}

export { supabase };

// Helper function to get session
export async function getSession() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

// Helper function to sign in with email and password
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

// Helper function to sign up with email and password
export async function signUp(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
}

// Helper function to sign out
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

// Helper function to reset password
export async function resetPassword(email: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email);
  return { data, error };
}
