// api/admin.js — Vercel Serverless Node.js
import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST")    return res.status(405).json({ error: "Método não permitido" });

  // Parse body manualmente (compatível com todas as versões do Vercel)
  let body = {};
  try {
    if (typeof req.body === "string") {
      body = JSON.parse(req.body);
    } else if (req.body && typeof req.body === "object") {
      body = req.body;
    } else {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      body = JSON.parse(Buffer.concat(chunks).toString());
    }
  } catch {
    return res.status(400).json({ error: "Body inválido" });
  }

  const { action, password } = body;
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "VERT4@2025";

  // Aceita tanto SUPABASE_URL quanto NEXT_PUBLIC_SUPABASE_URL (integração Vercel)
  const SUPABASE_URL = process.env.SUPABASE_URL
    || process.env.NEXT_PUBLIC_SUPABASE_URL
    || process.env.VITE_SUPABASE_URL;

  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Senha incorreta" });
  }

  if (action === "login") {
    return res.status(200).json({ ok: true });
  }

  if (!SUPABASE_URL || !SERVICE_KEY) {
    return res.status(500).json({
      error: "Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no Vercel → Environment Variables."
    });
  }

  const sb = createClient(SUPABASE_URL, SERVICE_KEY);

  if (action === "stats") {
    try {
      const { data: sessions = [] } = await sb
        .from("sessions").select("*").eq("consented", true)
        .order("started_at", { ascending: false }).limit(200);

      const total     = sessions.length;
      const intents   = sessions.filter(s => s.purchase_intent).length;
      const completed = sessions.filter(s => s.completed_diag).length;
      const avg_dur   = total
        ? Math.round(sessions.reduce((a,s) => a+(s.duration_sec||0), 0) / total)
        : 0;

      const { data: tabEvts = [] } = await sb
        .from("events").select("payload").eq("event_type","tab_view").limit(2000);
      const tab_count = {};
      for (const ev of tabEvts) {
        try { const p=JSON.parse(ev.payload); const n=p.tab||ev.payload; tab_count[n]=(tab_count[n]||0)+1; }
        catch { tab_count[ev.payload]=(tab_count[ev.payload]||0)+1; }
      }

      const { data: ctaEvts = [] } = await sb
        .from("events").select("payload").eq("event_type","cta_click").limit(2000);
      let fase2_views=0, whatsapp_clicks=0;
      const channels={};
      for (const ev of ctaEvts) {
        try {
          const p=JSON.parse(ev.payload);
          if((p.phase||"").includes("fase2")||(p.label||"").includes("fase2")) fase2_views++;
          if((p.channel||"")==="whatsapp") whatsapp_clicks++;
          const ch=p.channel||"outro"; channels[ch]=(channels[ch]||0)+1;
        } catch {}
      }

      const { data: completes=[] } = await sb
        .from("events").select("payload").eq("event_type","form_complete").limit(500);
      let paidSum=0, paidCount=0;
      for (const ev of completes) {
        try { const p=JSON.parse(ev.payload); const v=parseFloat(p?.lead?.paidLeads); if(!isNaN(v)){paidSum+=v;paidCount++;} } catch {}
      }

      return res.status(200).json({
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
        sessions: sessions.slice(0,50).map(s=>({
          id:        (s.id||"").slice(0,8),
          started:   s.started_at ? new Date(s.started_at).toLocaleString("pt-BR") : "",
          duration:  s.duration_sec||0,
          completed: s.completed_diag,
          intent:    s.purchase_intent,
        })),
      });
    } catch (err) {
      return res.status(500).json({ error: "Erro Supabase: " + err.message });
    }
  }

  if (action === "export") {
    try {
      const { data: sessions=[] } = await sb.from("sessions").select("*").eq("consented",true);
      const { data: events=[]   } = await sb.from("events").select("*").limit(2000);
      return res.status(200).json({ sessions, events });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(400).json({ error: "Ação desconhecida" });
}
