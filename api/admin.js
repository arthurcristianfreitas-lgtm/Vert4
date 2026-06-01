// api/admin.js — Vercel Serverless Function
// Substitui as rotas /api/admin/login e /api/admin/stats do Flask
// Usa a SERVICE_ROLE key do Supabase (lê tudo, ignora RLS)

import { createClient } from "@supabase/supabase-js";

export const config = { runtime: "edge" };

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "VERT4@2025";
const SUPABASE_URL   = process.env.SUPABASE_URL;
const SERVICE_KEY    = process.env.SUPABASE_SERVICE_ROLE_KEY;

function cors(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type":                "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

export default async function handler(req) {
  if (req.method === "OPTIONS") return new Response(null, { status: 200 });
  if (req.method !== "POST")    return cors({ error: "Método não permitido" }, 405);

  let body;
  try { body = await req.json(); }
  catch { return cors({ error: "JSON inválido" }, 400); }

  const { action, password } = body;

  if (password !== ADMIN_PASSWORD) {
    return cors({ error: "Senha incorreta" }, 401);
  }

  // ── Login apenas verifica a senha ────────────────────────────────────────
  if (action === "login") {
    return cors({ ok: true });
  }

  // ── Stats ─────────────────────────────────────────────────────────────────
  if (action === "stats") {
    const sb = createClient(SUPABASE_URL, SERVICE_KEY);

    // Sessões com consentimento
    const { data: sessions = [] } = await sb
      .from("sessions")
      .select("*")
      .eq("consented", true)
      .order("started_at", { ascending: false })
      .limit(200);

    const total     = sessions.length;
    const intents   = sessions.filter(s => s.purchase_intent).length;
    const completed = sessions.filter(s => s.completed_diag).length;
    const avg_dur   = total ? Math.round(sessions.reduce((a, s) => a + (s.duration_sec || 0), 0) / total) : 0;

    // Abas mais visitadas
    const { data: tabEvents = [] } = await sb
      .from("events")
      .select("payload")
      .eq("event_type", "tab_view")
      .limit(2000);

    const tab_count = {};
    for (const ev of tabEvents) {
      try {
        const parsed  = JSON.parse(ev.payload);
        const tabName = parsed.tab || ev.payload;
        tab_count[tabName] = (tab_count[tabName] || 0) + 1;
      } catch {
        tab_count[ev.payload] = (tab_count[ev.payload] || 0) + 1;
      }
    }

    // Cliques de CTA
    const { data: ctaEvents = [] } = await sb
      .from("events")
      .select("payload")
      .eq("event_type", "cta_click")
      .limit(2000);

    let fase2_views    = 0;
    let whatsapp_clicks = 0;
    const channels = {};
    for (const ev of ctaEvents) {
      try {
        const p = JSON.parse(ev.payload);
        if ((p.phase || "").includes("fase2") || (p.label || "").includes("fase2")) fase2_views++;
        if ((p.channel || "") === "whatsapp") whatsapp_clicks++;
        const ch = p.channel || "outro";
        channels[ch] = (channels[ch] || 0) + 1;
      } catch {}
    }

    // Sessões recentes (últimas 50)
    const sessions_list = sessions.slice(0, 50).map(s => ({
      id:        s.id?.slice(0, 8),
      started:   s.started_at ? new Date(s.started_at).toLocaleString("pt-BR") : "",
      duration:  s.duration_sec || 0,
      completed: s.completed_diag,
      intent:    s.purchase_intent,
    }));

    // Leads de tráfego pago (média dos diagnósticos completos)
    const { data: formCompletes = [] } = await sb
      .from("events")
      .select("payload")
      .eq("event_type", "form_complete")
      .limit(500);

    let paidLeadsSum = 0, paidLeadsCount = 0;
    for (const ev of formCompletes) {
      try {
        const p = JSON.parse(ev.payload);
        const paid = parseFloat(p?.lead?.paidLeads);
        if (!isNaN(paid)) { paidLeadsSum += paid; paidLeadsCount++; }
      } catch {}
    }
    const avg_paid_leads = paidLeadsCount ? +(paidLeadsSum / paidLeadsCount).toFixed(1) : 0;

    return cors({
      total_visitors:    total,
      purchase_intent:   intents,
      completed_diag:    completed,
      avg_duration_sec:  avg_dur,
      tab_counts:        tab_count,
      fase2_views,
      whatsapp_clicks,
      avg_paid_leads,
      channels,
      sessions:          sessions_list,
    });
  }

  // ── Export simples (JSON — sem openpyxl no JS) ──────────────────────────────
  if (action === "export") {
    const sb = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: sessions = [] } = await sb
      .from("sessions").select("*").eq("consented", true)
      .order("started_at", { ascending: false });
    const { data: events = [] } = await sb
      .from("events").select("*")
      .order("created_at", { ascending: false }).limit(2000);
    return cors({ sessions, events });
  }

  return cors({ error: "Ação desconhecida" }, 400);
}
