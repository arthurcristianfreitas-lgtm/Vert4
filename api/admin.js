// api/admin.js — Vercel Serverless Function (Node.js runtime)
import { createClient } from "@supabase/supabase-js";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "VERT4@2025";
const SUPABASE_URL   = process.env.SUPABASE_URL;
const SERVICE_KEY    = process.env.SUPABASE_SERVICE_ROLE_KEY;

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export default async function handler(req) {
  if (req.method === "OPTIONS") return new Response(null, { status: 200 });
  if (req.method !== "POST") return json({ error: "Método não permitido" }, 405);

  let body;
  try { body = await req.json(); } catch { return json({ error: "JSON inválido" }, 400); }

  const { action, password } = body || {};

  if (!SUPABASE_URL || !SERVICE_KEY) {
    return json({ error: "SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY não configuradas no Vercel." }, 500);
  }

  if (password !== ADMIN_PASSWORD) {
    return json({ error: "Senha incorreta" }, 401);
  }

  if (action === "login") {
    return json({ ok: true });
  }

  if (action === "stats") {
    try {
      const sb = createClient(SUPABASE_URL, SERVICE_KEY);

      const { data: sessions = [] } = await sb
        .from("sessions").select("*").eq("consented", true)
        .order("started_at", { ascending: false }).limit(200);

      const total     = sessions.length;
      const intents   = sessions.filter(s => s.purchase_intent).length;
      const completed = sessions.filter(s => s.completed_diag).length;
      const avg_dur   = total ? Math.round(sessions.reduce((a,s) => a+(s.duration_sec||0),0)/total) : 0;

      const { data: tabEvents = [] } = await sb
        .from("events").select("payload").eq("event_type","tab_view").limit(2000);

      const tab_count = {};
      for (const ev of tabEvents) {
        try { const p=JSON.parse(ev.payload); const n=p.tab||ev.payload; tab_count[n]=(tab_count[n]||0)+1; }
        catch { tab_count[ev.payload]=(tab_count[ev.payload]||0)+1; }
      }

      const { data: ctaEvents = [] } = await sb
        .from("events").select("payload").eq("event_type","cta_click").limit(2000);

      let fase2_views=0, whatsapp_clicks=0;
      const channels = {};
      for (const ev of ctaEvents) {
        try {
          const p = JSON.parse(ev.payload);
          if ((p.phase||"").includes("fase2")||(p.label||"").includes("fase2")) fase2_views++;
          if ((p.channel||"")==="whatsapp") whatsapp_clicks++;
          const ch=p.channel||"outro"; channels[ch]=(channels[ch]||0)+1;
        } catch {}
      }

      const { data: formCompletes = [] } = await sb
        .from("events").select("payload").eq("event_type","form_complete").limit(500);

      let paidSum=0, paidCount=0;
      for (const ev of formCompletes) {
        try { const p=JSON.parse(ev.payload); const paid=parseFloat(p?.lead?.paidLeads); if(!isNaN(paid)){paidSum+=paid;paidCount++;} } catch {}
      }

      return json({
        total_visitors:         total,
        purchase_intent:        intents,
        completed_diag:         completed,
        avg_duration_sec:       avg_dur,
        tab_counts:             tab_count,
        fase2_views,
        whatsapp_clicks,
        avg_paid_leads:         paidCount ? +(paidSum/paidCount).toFixed(1) : 0,
        channels,
        phase1_to_phase2_rate:  total>0 ? +((fase2_views/total)*100).toFixed(1) : 0,
        sessions:               sessions.slice(0,50).map(s=>({
          id:       (s.id||"").slice(0,8),
          started:  s.started_at ? new Date(s.started_at).toLocaleString("pt-BR") : "",
          duration: s.duration_sec||0,
          completed:s.completed_diag,
          intent:   s.purchase_intent,
        })),
      });
    } catch (err) {
      return json({ error: "Erro Supabase: " + err.message }, 500);
    }
  }

  if (action === "export") {
    try {
      const sb = createClient(SUPABASE_URL, SERVICE_KEY);
      const { data: sessions=[] } = await sb.from("sessions").select("*").eq("consented",true).order("started_at",{ascending:false});
      const { data: events=[]   } = await sb.from("events").select("*").order("created_at",{ascending:false}).limit(2000);
      return json({ sessions, events });
    } catch (err) { return json({ error: err.message }, 500); }
  }

  return json({ error: "Ação desconhecida" }, 400);
}
