// src/useTracker.js — Tracking direto no Supabase (sem Flask)
import { useCallback, useEffect, useRef } from "react";
import { supabase } from "./lib/supabase.js";

function createId() {
  if (crypto?.randomUUID) return crypto.randomUUID();
  return `${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

function getSessionId() {
  try {
    let id = sessionStorage.getItem("vert4_sid");
    if (!id) { id = createId(); sessionStorage.setItem("vert4_sid", id); }
    return id;
  } catch { return createId(); }
}

function detectOrigin() {
  try {
    const params = new URLSearchParams(window.location.search);
    let referrerHost = "";
    try { referrerHost = document.referrer ? new URL(document.referrer).hostname.replace(/^www\./, "") : ""; } catch {}
    return {
      source:      params.get("utm_source")   || referrerHost || "direto",
      medium:      params.get("utm_medium")   || (referrerHost ? "referral" : "direct"),
      campaign:    params.get("utm_campaign") || "",
      referrer:    document.referrer || "",
      landing_url: window.location.href,
    };
  } catch { return {}; }
}

// Salva/atualiza sessão no Supabase
async function sbUpsertSession(id, fields) {
  if (!supabase || !id) return;
  try {
    await supabase.from("sessions").upsert(
      { id, ...fields, last_seen: new Date().toISOString() },
      { onConflict: "id" }
    );
  } catch {}
}

// Insere evento no Supabase
async function sbInsertEvent(session_id, event_type, payload) {
  if (!supabase || !session_id) return;
  try {
    await supabase.from("events").insert({
      session_id,
      event_type,
      payload: typeof payload === "object" ? JSON.stringify(payload) : String(payload || ""),
    });
  } catch {}
}

export function useTracker() {
  const startTime    = useRef(Date.now());
  const sessionId    = useRef(null);
  const consented    = useRef(false);
  const origin       = useRef(detectOrigin());
  const interactions = useRef(0);
  const maxScroll    = useRef(0);
  const leadCtx      = useRef({});
  const lastSync     = useRef(0);

  const buildPayload = useCallback((extra = {}) => ({
    ...extra,
    seconds:      Math.round((Date.now() - startTime.current) / 1000),
    interactions: interactions.current,
    max_scroll:   maxScroll.current,
    origin:       origin.current,
    client_time:  new Date().toISOString(),
    lead:         leadCtx.current,
  }), []);

  // Sincroniza tempo com Supabase
  const syncTime = useCallback(async (beacon = false) => {
    if (!consented.current || !sessionId.current) return;
    const now = Date.now();
    if (!beacon && now - lastSync.current < 10000) return;
    lastSync.current = now;
    const seconds = Math.round((now - startTime.current) / 1000);

    if (beacon && navigator.sendBeacon) {
      try {
        const data = JSON.stringify({ session_id: sessionId.current, payload: JSON.stringify({ seconds }) });
        navigator.sendBeacon("/api/track-beacon", data);
        return;
      } catch {}
    }

    await sbUpsertSession(sessionId.current, { duration_sec: seconds });
  }, []);

  // Inicializa consentimento
  const initConsent = useCallback(async (accepted) => {
    try {
      const sid = getSessionId();
      sessionId.current  = sid;
      consented.current  = Boolean(accepted);

      await sbUpsertSession(sid, {
        user_agent:  navigator.userAgent.slice(0, 256),
        consented:   Boolean(accepted),
        started_at:  new Date().toISOString(),
      });

      if (accepted) {
        await sbInsertEvent(sid, "page_view", buildPayload({ page: "diagnostico" }));
      }
    } catch {}
  }, [buildPayload]);

  // Listeners globais
  useEffect(() => {
    const countInt = () => { if (consented.current) interactions.current += 1; };
    const onScroll = () => {
      if (!consented.current) return;
      const doc = document.documentElement;
      const pct = Math.min(100, Math.round((window.scrollY / Math.max(1, doc.scrollHeight - window.innerHeight)) * 100));
      if (pct > maxScroll.current) maxScroll.current = pct;
    };
    const onHide   = () => { if (document.visibilityState === "hidden") syncTime(true); };
    const onUnload = () => syncTime(true);
    const interval = window.setInterval(() => syncTime(false), 15000);

    window.addEventListener("click",    countInt,  true);
    window.addEventListener("keydown",  countInt,  true);
    window.addEventListener("scroll",   onScroll,  { passive: true });
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("beforeunload", onUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener("click",   countInt, true);
      window.removeEventListener("keydown", countInt, true);
      window.removeEventListener("scroll",  onScroll);
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("beforeunload", onUnload);
    };
  }, [syncTime]);

  const setLeadContext = useCallback((ctx = {}) => {
    leadCtx.current = { ...leadCtx.current, ...ctx };
  }, []);

  const track = useCallback(async (event_type, payload = {}) => {
    if (!consented.current || !sessionId.current) return;
    await sbInsertEvent(sessionId.current, event_type,
      typeof payload === "object" ? buildPayload(payload) : { label: payload });
  }, [buildPayload]);

  const trackTab = useCallback(async (tabName) => {
    await track("tab_view", { tab: tabName });
    if (String(tabName).toLowerCase().includes("fase 2")) {
      await sbUpsertSession(sessionId.current, { purchase_intent: true });
    }
  }, [track]);

  const trackCTA = useCallback(async (label, extra = {}) => {
    const channel = String(label).toLowerCase().includes("whatsapp") ? "whatsapp"
      : String(label).toLowerCase().includes("instagram") ? "instagram"
      : String(label).toLowerCase().includes("linkedin")  ? "linkedin"
      : String(label).toLowerCase().includes("fase2")     ? "fase2" : "outro";

    await track("cta_click", {
      label, channel,
      seconds_before_click:      Math.round((Date.now() - startTime.current) / 1000),
      interactions_before_click: interactions.current,
      ...extra,
    });
    if (channel === "whatsapp" || label.toLowerCase().includes("fase2")) {
      await sbUpsertSession(sessionId.current, { purchase_intent: true });
    }
  }, [track]);

  const trackFormStart = useCallback((p = {}) => {
    track("form_start", { stage: "identificacao", ...p }).catch(() => {});
  }, [track]);

  const trackQuestion = useCallback((p = {}) => {
    track("question_answer", p).catch(() => {});
  }, [track]);

  const trackComplete = useCallback(async (p = {}) => {
    try {
      setLeadContext(p);
      await sbUpsertSession(sessionId.current, { completed_diag: true });
      await track("form_complete", p);
      await syncTime(true);
    } catch {}
  }, [setLeadContext, track, syncTime]);

  return { initConsent, setLeadContext, track, trackTab, trackCTA, trackFormStart, trackQuestion, trackComplete };
}