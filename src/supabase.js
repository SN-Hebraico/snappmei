// src/supabase.js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Ajuda MUITO a diagnosticar quando as env vars não estão chegando no Vercel
  console.error("❌ Variáveis do Supabase ausentes:");
  console.error("VITE_SUPABASE_URL:", supabaseUrl);
  console.error("VITE_SUPABASE_ANON_KEY:", supabaseAnonKey);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true, // essencial para recovery
    flowType: "pkce",         // essencial para links com ?code=...
  },
});
