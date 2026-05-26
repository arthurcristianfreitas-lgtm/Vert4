// src/useTracker.js
// Tracking direto no Supabase — sem Flask, sem servidor Python
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
  const params = new URLSearchParams(window.location.search);
  let referrerHost = "";
  try { referrerHost = document.referrer ? new URL(document.referrer).hostname.replace(/^www\./, "") : ""; } catch {}
  return {
    source:       params.get("utm_source")   || referrerHost || "direto",
    medium:       params.get("utm_medium")   || (referrerHost ? "referral" : "direct"),
    campaign:     params.get("utm_campaign") || "",
    referrer:     document.referrer,
    landing_url:  window.location.href,
    timezone:     Intl.DateTimeFormat().resolvedOptions().timeZone || "",
    language:     navigator.language || "",
  };
}

function normalizeChannel(label = "") {
  const v = String(label).toLowerCase();
  if (v.includes("whatsapp")) return "whatsapp";
  if (v.includes("instagram")) return "instagram";
  if (v.includes("linkedin"))  return "linkedin";
  if (v.includes("fase2") || v.includes("fase 2")) return "fase2";
  return "outro";
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

  // Insere ou atualiza sessão no Supabase
  const upsertSession = useCallback(async (fields = {}) => {
    if (!sessionId.current) return;
    await supabase.from("sessions").upsert({
      id: sessionId.current,
      ...fields,
      last_seen: new Date().toISOString(),
    }, { onConflict: "id" });
  }, []);

  // Insere evento no Supabase
  const insertEvent = useCallback(async (event_type, payload = {}) => {
    if (!consented.current || !sessionId.current) return;
    const payloadStr = typeof payload === "object"
      ? JSON.stringify(buildPayload(payload))
      : String(payload);
    await supabase.from("events").insert({
      session_id: sessionId.current,
      event_type,
      payload:    payloadStr,
    });
  }, [buildPayload]);

  // Sincroniza tempo (heartbeat + unload)
  const syncTime = useCallback(async (beacon = false) => {
    if (!consented.current || !sessionId.current) return;
    const now = Date.now();
    if (!beacon && now - lastSync.current < 10000) return;
    lastSync.current = now;
    const seconds = Math.round((now - startTime.current) / 1000);
    if (beacon && navigator.sendBeacon) {
      const data = JSON.stringify({
        session_id: sessionId.current,
        event_type: "time_update",
        payload:    JSON.stringify({ seconds, reason: "unload" }),
      });
      // Beacon direto para edge function do Vercel
      navigator.sendBeacon("/api/track-beacon", data);
      return;
    }
    await upsertSession({ duration_sec: seconds });
    await insertEvent("time_update", { seconds, reason: "heartbeat" });
  }, [insertEvent, upsertSession]);

  // Chamado quando usuário aceita/rejeita cookies
  const initConsent = useCallback(async (accepted) => {
    const sid = getSessionId();
    sessionId.current = sid;
    consented.current = Boolean(accepted);

    await supabase.from("sessions").upsert({
      id:           sid,
      ip:           "",  // IP não disponível no frontend por privacidade
      user_agent:   navigator.userAgent.slice(0, 256),
      consented:    Boolean(accepted),
      started_at:   new Date().toISOString(),
      last_seen:    new Date().toISOString(),
    }, { onConflict: "id" });

    if (accepted) {
      await insertEvent("page_view", { page: "diagnostico", title: document.title });
    }
  }, [insertEvent]);

  // Listeners globais
  useEffect(() => {
    const countInt  = () => { if (consented.current) interactions.current += 1; };
    const onScroll  = () => {
      if (!consented.current) return;
      const doc = document.documentElement;
      const pct = Math.min(100, Math.round((window.scrollY / Math.max(1, doc.scrollHeight - window.innerHeight)) * 100));
      if (pct > maxScroll.current) maxScroll.current = pct;
    };
    const onHide   = () => { if (document.visibilityState === "hidden") syncTime(true); };
    const onUnload = () => syncTime(true);
    const interval = window.setInterval(() => syncTime(false), 15000);

    window.addEventListener("click",     countInt, true);
    window.addEventListener("keydown",   countInt, true);
    window.addEventListener("scroll",    onScroll, { passive: true });
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

  const track = useCallback((type, payload = {}) => {
    insertEvent(type, typeof payload === "object" ? payload : { label: payload });
  }, [insertEvent]);

  const trackTab = useCallback(async (tabName) => {
    await insertEvent("tab_view", { tab: tabName, phase: tabName.toLowerCase().includes("fase 2") ? "fase2" : "report" });
    // Marca intenção se for Fase 2
    if (tabName.toLowerCase().includes("fase 2")) {
      await upsertSession({ purchase_intent: true });
    }
  }, [insertEvent, upsertSession]);

  const trackCTA = useCallback(async (label, extra = {}) => {
    const channel = extra.channel || normalizeChannel(label);
    const payload = {
      label, channel,
      destination:              extra.destination || "",
      phase:                    extra.phase || (label.toLowerCase().includes("fase2") ? "fase2" : "geral"),
      seconds_before_click:     Math.round((Date.now() - startTime.current) / 1000),
      interactions_before_click: interactions.current,
      ...extra,
    };
    await insertEvent("cta_click", payload);
    if (channel === "whatsapp" || label.toLowerCase().includes("fase2")) {
      await upsertSession({ purchase_intent: true });
    }
  }, [insertEvent, upsertSession]);

  const trackFormStart = useCallback((p = {}) => insertEvent("form_start", { stage: "identificacao", ...p }), [insertEvent]);
  const trackQuestion  = useCallback((p = {}) => insertEvent("question_answer", p), [insertEvent]);

  const trackComplete = useCallback(async (p = {}) => {
    setLeadContext(p);
    await upsertSession({ completed_diag: true });
    await insertEvent("form_complete", p);
    await syncTime(true);
  }, [setLeadContext, upsertSession, insertEvent, syncTime]);

  return { initConsent, setLeadContext, track, trackTab, trackCTA, trackFormStart, trackQuestion, trackComplete };
}