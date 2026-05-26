import { useCallback, useEffect, useRef } from "react";

const API = "/api/track";

function createId() {
  if (crypto?.randomUUID) return crypto.randomUUID();
  return `${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

function getSessionId() {
  try {
    let id = sessionStorage.getItem("vert4_sid");
    if (!id) {
      id = createId();
      sessionStorage.setItem("vert4_sid", id);
    }
    return id;
  } catch {
    return createId();
  }
}

function detectOrigin() {
  const params = new URLSearchParams(window.location.search);
  const referrer = document.referrer || "";
  let referrerHost = "";

  try {
    referrerHost = referrer ? new URL(referrer).hostname.replace(/^www\./, "") : "";
  } catch {
    referrerHost = "";
  }

  const source = params.get("utm_source") || referrerHost || "direto";

  return {
    source,
    medium: params.get("utm_medium") || (referrerHost ? "referral" : "direct"),
    campaign: params.get("utm_campaign") || "",
    content: params.get("utm_content") || "",
    term: params.get("utm_term") || "",
    referrer,
    landing_path: window.location.pathname,
    landing_url: window.location.href,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
    language: navigator.language || "",
  };
}

async function send(endpoint, body, { beacon = false } = {}) {
  const url = `${API}/${endpoint}`;
  const json = JSON.stringify(body);

  try {
    if (beacon && navigator.sendBeacon) {
      const blob = new Blob([json], { type: "application/json" });
      if (navigator.sendBeacon(url, blob)) return;
    }

    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: json,
      keepalive: beacon,
    });
  } catch {
    // O tracking nunca deve bloquear a experiencia do visitante.
  }
}

function normalizeChannel(label = "") {
  const value = String(label).toLowerCase();
  if (value.includes("whatsapp") || value.includes("wa.me")) return "whatsapp";
  if (value.includes("instagram")) return "instagram";
  if (value.includes("linkedin")) return "linkedin";
  if (value.includes("fase2") || value.includes("fase 2")) return "fase2";
  return "outro";
}

export function useTracker() {
  const startTime = useRef(Date.now());
  const sessionId = useRef(null);
  const consented = useRef(false);
  const origin = useRef(detectOrigin());
  const interactions = useRef(0);
  const maxScroll = useRef(0);
  const leadContext = useRef({});
  const lastTimeSync = useRef(0);

  const buildSessionPayload = useCallback((extra = {}) => {
    const milliseconds = Date.now() - startTime.current;
    return {
      ...extra,
      seconds: Math.round(milliseconds / 1000),
      milliseconds,
      interactions: interactions.current,
      max_scroll: maxScroll.current,
      origin: origin.current,
      client_time: new Date().toISOString(),
      lead: leadContext.current,
    };
  }, []);

  const track = useCallback(
    (event_type, payload = {}, options = {}) => {
      if (!consented.current || !sessionId.current) return;

      send(
        "event",
        {
          session_id: sessionId.current,
          event_type,
          payload: typeof payload === "object" && payload !== null
            ? buildSessionPayload(payload)
            : buildSessionPayload({ label: payload }),
        },
        options,
      );
    },
    [buildSessionPayload],
  );

  const syncTime = useCallback(
    (beacon = false) => {
      if (!consented.current || !sessionId.current) return;
      const now = Date.now();
      if (!beacon && now - lastTimeSync.current < 10000) return;
      lastTimeSync.current = now;

      send(
        "event",
        {
          session_id: sessionId.current,
          event_type: "time_update",
          payload: buildSessionPayload({ reason: beacon ? "unload" : "heartbeat" }),
        },
        { beacon },
      );
    },
    [buildSessionPayload],
  );

  const initConsent = useCallback(
    async (accepted) => {
      const sid = getSessionId();
      sessionId.current = sid;
      consented.current = Boolean(accepted);

      await send("consent", {
        session_id: sid,
        consented: Boolean(accepted),
        origin: origin.current,
        client_time: new Date().toISOString(),
      });

      if (accepted) {
        track("page_view", { page: "diagnostico", title: document.title });
        syncTime();
      }
    },
    [syncTime, track],
  );

  useEffect(() => {
    const countInteraction = () => {
      if (consented.current) interactions.current += 1;
    };

    const onScroll = () => {
      if (!consented.current) return;
      const doc = document.documentElement;
      const scrollable = Math.max(1, doc.scrollHeight - window.innerHeight);
      const pct = Math.min(100, Math.round((window.scrollY / scrollable) * 100));
      if (pct > maxScroll.current) maxScroll.current = pct;
    };

    const onVisibility = () => {
      if (document.visibilityState === "hidden") syncTime(true);
    };

    const onUnload = () => syncTime(true);
    const interval = window.setInterval(() => syncTime(false), 15000);

    window.addEventListener("click", countInteraction, true);
    window.addEventListener("keydown", countInteraction, true);
    window.addEventListener("input", countInteraction, true);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("beforeunload", onUnload);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("click", countInteraction, true);
      window.removeEventListener("keydown", countInteraction, true);
      window.removeEventListener("input", countInteraction, true);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("beforeunload", onUnload);
    };
  }, [syncTime]);

  const setLeadContext = useCallback((context = {}) => {
    leadContext.current = {
      ...leadContext.current,
      ...context,
    };
  }, []);

  const trackTab = useCallback(
    (tabName) => {
      track("tab_view", {
        tab: tabName,
        phase: String(tabName).toLowerCase().includes("fase 2") ? "fase2" : "report",
      });
    },
    [track],
  );

  const trackCTA = useCallback(
    (label, extra = {}) => {
      const channel = extra.channel || normalizeChannel(label);
      track(
        "cta_click",
        {
          label,
          channel,
          destination: extra.destination || "",
          phase: extra.phase || (String(label).toLowerCase().includes("fase2") ? "fase2" : "geral"),
          seconds_before_click: Math.round((Date.now() - startTime.current) / 1000),
          milliseconds_before_click: Date.now() - startTime.current,
          interactions_before_click: interactions.current,
          ...extra,
        },
        { beacon: true },
      );
    },
    [track],
  );

  const trackFormStart = useCallback(
    (payload = {}) => track("form_start", { stage: "identificacao", ...payload }),
    [track],
  );

  const trackQuestion = useCallback(
    (payload = {}) => track("question_answer", payload),
    [track],
  );

  const trackComplete = useCallback(
    (payload = {}) => {
      setLeadContext(payload);
      track("form_complete", payload, { beacon: true });
      syncTime(true);
    },
    [setLeadContext, syncTime, track],
  );

  return {
    initConsent,
    setLeadContext,
    track,
    trackTab,
    trackCTA,
    trackFormStart,
    trackQuestion,
    trackComplete,
  };
}
