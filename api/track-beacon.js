// api/track-beacon.js — Recebe o sendBeacon de tempo no unload
// Atualiza duration_sec da sessão no Supabase

import { createClient } from "@supabase/supabase-js";

export const config = { runtime: "edge" };

export default async function handler(req) {
  if (req.method !== "POST") return new Response(null, { status: 204 });

  try {
    const body       = await req.json();
    const session_id = body.session_id;
    const payload    = JSON.parse(body.payload || "{}");
    const seconds    = payload.seconds || 0;

    if (!session_id) return new Response(null, { status: 204 });

    const sb = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    await sb.from("sessions")
      .update({ duration_sec: seconds, last_seen: new Date().toISOString() })
      .eq("id", session_id);

    await sb.from("events").insert({
      session_id,
      event_type: "time_update",
      payload: JSON.stringify({ seconds, reason: "unload" }),
    });

  } catch {}

  return new Response(null, { status: 204 });
}