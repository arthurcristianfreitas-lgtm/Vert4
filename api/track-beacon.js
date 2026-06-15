// api/track-beacon.js — recebe sendBeacon no unload
import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(204).end();
  try {
    let body = req.body || {};
    if (typeof body === "string") body = JSON.parse(body);
    const { session_id, payload } = body;
    const seconds = JSON.parse(payload || "{}").seconds || 0;
    if (!session_id) return res.status(204).end();
    const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (SUPABASE_URL && SERVICE_KEY) {
      const sb = createClient(SUPABASE_URL, SERVICE_KEY);
      await sb.from("sessions").update({ duration_sec: seconds, last_seen: new Date().toISOString() }).eq("id", session_id);
    }
  } catch {}
  return res.status(204).end();
}