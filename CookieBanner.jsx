import { useState } from "react";

const V = {
  bg: "#071512",
  panel: "#10241d",
  panel2: "#173126",
  border: "#2b4c3e",
  gold: "#d7b56d",
  goldLight: "#ead394",
  text: "#f7f2e9",
  muted: "#c9c0b3",
  soft: "#9b8f80",
  green: "#44a276",
};

function MiniIcon({ type }) {
  const common = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  const paths = {
    shield: (
      <>
        <path d="M12 3l7 3v5c0 4.4-2.8 8-7 10-4.2-2-7-5.6-7-10V6l7-3z" />
        <path d="M9 12l2 2 4-5" />
      </>
    ),
    chart: (
      <>
        <path d="M4 19V5" />
        <path d="M4 19h16" />
        <path d="M8 15l3-4 3 2 4-7" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v5l3 2" />
      </>
    ),
    lock: (
      <>
        <rect x="5" y="10" width="14" height="9" rx="2" />
        <path d="M8 10V8a4 4 0 018 0v2" />
      </>
    ),
  };

  return <svg {...common}>{paths[type]}</svg>;
}

export default function CookieBanner({ onConsent }) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <>
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(3, 9, 7, .62)",
          zIndex: 9998,
          backdropFilter: "blur(5px)",
        }}
      />

      <section
        className="cookie-panel"
        style={{
          position: "fixed",
          left: 16,
          right: 16,
          bottom: 16,
          zIndex: 9999,
          maxWidth: 980,
          margin: "0 auto",
          background: `linear-gradient(145deg, ${V.panel}, ${V.panel2})`,
          border: `1px solid ${V.border}`,
          borderTop: `3px solid ${V.gold}`,
          borderRadius: 18,
          boxShadow: "0 28px 80px rgba(0,0,0,.48)",
          padding: "24px",
          color: V.text,
          fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        }}
      >
        <div className="cookie-grid" style={{ display: "grid", gridTemplateColumns: "1.1fr .9fr", gap: 22 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <div
                className="cookie-detail-grid"
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 12,
                  display: "grid",
                  placeItems: "center",
                  color: V.gold,
                  background: "rgba(215,181,109,.12)",
                  border: "1px solid rgba(215,181,109,.28)",
                }}
              >
                <MiniIcon type="shield" />
              </div>
              <div>
                <div style={{ fontSize: 12, color: V.gold, textTransform: "uppercase", letterSpacing: 1.8, fontWeight: 800 }}>
                  Privacidade e melhoria da experiência
                </div>
                <h2 style={{ fontSize: 18, lineHeight: 1.25, margin: "4px 0 0", fontWeight: 800 }}>
                  Podemos medir sua jornada no diagnóstico?
                </h2>
              </div>
            </div>

            <p style={{ color: V.muted, fontSize: 14, lineHeight: 1.7, margin: "0 0 14px" }}>
              Utilizamos cookies para melhorar a experiência de navegação e apoiar
              pesquisas internas sobre o diagnóstico. Suas respostas ajudam a aprimorar
              os resultados para todos os usuários.{" "}
              <button
                onClick={() => setShowDetails((value) => !value)}
                style={{
                  border: 0,
                  background: "transparent",
                  color: "#5d9ed6",
                  cursor: "pointer",
                  padding: 0,
                  fontSize: 14,
                  fontWeight: 600,
                  textDecoration: "underline",
                  textUnderlineOffset: 3,
                  fontFamily: "inherit",
                }}
              >
                {showDetails ? "Ocultar detalhes" : "Saiba mais"}
              </button>
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
              alignContent: "start",
            }}
          >
            {[
              ["chart", "Eventos", "Cliques, abas visitadas e conclusão do formulario."],
              ["clock", "Tempo", "Duração de sessão e tempo antes de cada clique."],
              ["shield", "Origem", "UTMs, referência e fonte de tráfego quando disponíveis."],
              ["lock", "Controle", "Você pode recusar sem perder acesso ao diagnóstico."],
            ].map(([icon, title, text]) => (
              <div
                key={title}
                style={{
                  padding: 12,
                  borderRadius: 14,
                  border: "1px solid rgba(255,255,255,.08)",
                  background: "rgba(255,255,255,.035)",
                }}
              >
                <div style={{ color: V.gold, marginBottom: 8 }}>
                  <MiniIcon type={icon} />
                </div>
                <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 4 }}>{title}</div>
                <div style={{ fontSize: 11, lineHeight: 1.5, color: V.soft }}>{text}</div>
              </div>
            ))}
          </div>
        </div>

        {showDetails && (
          <div
            style={{
              marginTop: 16,
              padding: "16px 18px",
              borderRadius: 14,
              background: "rgba(0,0,0,.22)",
              border: "1px solid rgba(93,158,214,.2)",
              color: V.muted,
              fontSize: 12,
              lineHeight: 1.8,
            }}
          >
            <strong style={{ color: V.text, display: "block", marginBottom: 8 }}>
              O que coletamos de verdade:
            </strong>
            <ul style={{ paddingLeft: 18, margin: 0 }}>
              <li><strong style={{ color: V.muted }}>Identificador anônimo de sessão</strong> — nenhum dado pessoal associado, gerado apenas para esta visita.</li>
              <li style={{ marginTop: 6 }}><strong style={{ color: V.muted }}>Origem do tráfego</strong> — de onde você veio (Instagram, Google, WhatsApp, link direto), via parâmetros UTM.</li>
              <li style={{ marginTop: 6 }}><strong style={{ color: V.muted }}>Tempo de permanência</strong> — quanto tempo ficou no diagnóstico e em cada seção.</li>
              <li style={{ marginTop: 6 }}><strong style={{ color: V.muted }}>Abas visitadas</strong> — quais partes do resultado geraram mais interesse.</li>
              <li style={{ marginTop: 6 }}><strong style={{ color: V.muted }}>Canais acionados</strong> — se clicou em WhatsApp, Instagram ou LinkedIn e quanto tempo levou até o clique.</li>
            </ul>
            <p style={{ marginTop: 10, marginBottom: 0 }}>
              Nenhum dado é vendido ou compartilhado. Usamos exclusivamente para melhorar a ferramenta, conforme a{" "}
              <strong style={{ color: V.text }}>LGPD (Lei 13.709/2018)</strong>.
              Recusar não afeta o acesso ao diagnóstico.
            </p>
          </div>
        )}

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginTop: 18 }}>
          <button
            onClick={() => onConsent(true)}
            style={{
              border: 0,
              borderRadius: 12,
              padding: "12px 22px",
              background: V.gold,
              color: V.bg,
              fontSize: 13,
              fontWeight: 900,
              cursor: "pointer",
              boxShadow: "0 14px 32px rgba(215,181,109,.22)",
            }}
          >
            Aceitar analytics
          </button>
          <button
            onClick={() => onConsent(false)}
            style={{
              border: `1px solid ${V.border}`,
              borderRadius: 12,
              padding: "12px 18px",
              background: "transparent",
              color: V.muted,
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Continuar sem analytics
          </button>
          <span style={{ marginLeft: "auto", color: V.soft, fontSize: 11 }}>VERT4 Analytics privado</span>
        </div>

        <style>{`
          @media (max-width: 760px) {
            .cookie-grid {
              grid-template-columns: 1fr !important;
            }
          }
          @media (max-width: 520px) {
            .cookie-panel {
              left: 10px !important;
              right: 10px !important;
              bottom: 10px !important;
              padding: 18px !important;
            }
            .cookie-detail-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>
      </section>
    </>
  );
}