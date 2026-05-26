// src/lib/supabase.js
// Cliente Supabase compartilhado por todo o frontend
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON) {
  console.warn("[VERT4] Supabase não configurado. Adicione VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env");
}

export const supabase = createClient(SUPABASE_URL || "", SUPABASE_ANON || "");