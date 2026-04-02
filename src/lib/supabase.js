import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: "pkce", // ← MÁS SEGURO
  },
});

// Clean up stale sessions on init
supabase.auth.onAuthStateChange((event, session) => {
  if (event === "TOKEN_REFRESHED") {
    console.log("[Supabase] Token refreshed successfully");
  }

  if (event === "SIGNED_OUT") {
    console.log("[Supabase] User signed out");
  }
});
