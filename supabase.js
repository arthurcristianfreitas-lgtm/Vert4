// src/lib/supabase.js
import { createClient } from "@supabase/supabase-js";

const URL  = import.meta.env.VITE_SUPABASE_URL;
const ANON = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase  = (URL && ANON) ? createClient(URL, ANON) : null;
export const canTrack  = () => supabase !== null;
