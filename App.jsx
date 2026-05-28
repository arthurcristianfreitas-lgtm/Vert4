import { useEffect, useRef, useState } from "react";
import CookieBanner from "./CookieBanner.jsx";
import { useTracker } from "./useTracker.js";

const V = {
  bg: "#071512",
  bg2: "#0b1d17",
  panel: "#10241d",
  panel2: "#152d23",
  panel3: "#1b372b",
  border: "#2b4c3e",
  border2: "#3d6754",
  gold: "#d7b56d",
  gold2: "#ead394",
  green: "#44a276",
  green2: "#69c08f",
  red: "#a33a46",
  blue: "#5d9ed6",
  ink: "#f7f2e9",
  muted: "#c9c0b3",
  soft: "#978b7c",
  dark: "#06110e",
};

const PROFILE = {
  P1: {
    name: "Operacional",
    disc: "CS",
    color: "#5d9ed6",
    tag: "Precisão e organização",
    promise: "mantém a casa em ordem, mas raramente transforma interesse em compromisso.",
  },
  P2: {
    name: "Atendente Passiva",
    disc: "SI",
    color: "#44a276",
    tag: "Empatia e vinculo",
    promise: "acolhe bem, cria confiança, mas tende a recuar quando precisa conduzir a decisão.",
  },
  P3: {
    name: "Consultiva de Desejo",
    disc: "IC",
    color: "#d7b56d",
    tag: "Expertise e persuasao",
    promise: "explica com autoridade, mas pode confundir informação com fechamento.",
  },
  P4: {
    name: "Elite Comercial / SDR",
    disc: "DI",
    color: "#a33a46",
    tag: "Resultado e conversão",
    promise: "entra no lead com intenção clara, qualifica rapido e protege a agenda.",
  },
};

const VERDICTS = {
  "VE-01": { label: "Manter e escalar", color: V.green },
  "VE-02": { label: "Calibrar e escalar", color: V.blue },
  "VE-03": { label: "Manter e lapidar", color: V.blue },
  "VE-04": { label: "Desenvolver com estrutura", color: V.green },
  "VE-05": { label: "Avaliar remanejamento", color: V.soft },
  "VE-06": { label: "Desenvolvimento consultivo", color: V.gold },
  "VE-07": { label: "Resultado acima do benchmark", color: V.green },
};

const QUESTIONS = [
  {
    id: "DA1",
    dim: "Padrão de energia",
    q: "Qual comportamento sua secretária demonstra com mais frequência e naturalidade durante o expediente?",
    opts: [
      { t: "Agenda atualizada, sistema em ordem, processos com exatidão. Ela garante que nada falhe.", p: 1 },
      { t: "Cria ambiente caloroso, conversa com as pacientes e ? lembrada pelo acolhimento genuino.", p: 2 },
      { t: "Explica protocolos com segurança e demonstra domínio clínico nas interações.", p: 3 },
      { t: "De olho em leads, tenta fechar agendamentos e demonstra inquietação quando uma oportunidade escapa.", p: 4 },
    ],
  },
  {
    id: "DA2",
    dim: "Resposta ao lead",
    q: "Quando um lead entra pelo WhatsApp pedindo valores, o que você observa que sua secretária faz?",
    opts: [
      { t: "Envia as informações e o preço de forma clara e objetiva, depois aguarda o retorno.", p: 1 },
      { t: "Responde com cuidado, conversa bastante, mas raramente converte em agendamento.", p: 2 },
      { t: "Explica o tratamento antes de falar em preço e conduz para uma consulta de avaliação.", p: 3 },
      { t: "Qualifica o lead, evita dar preço direto, conduz a conversa e insiste no agendamento.", p: 4 },
    ],
  },
  {
    id: "DA3",
    dim: "Gestão de objeção",
    q: "Como ela se comporta quando uma paciente diz que está caro ou que vai pensar?",
    opts: [
      { t: "Encerra educadamente, diz que pode entrar em contato se mudar de ideia e não retoma.", p: 1 },
      { t: "Fica desconfortavel e pode até concordar com a paciente para evitar conflito.", p: 2 },
      { t: "Argumenta técnicamente sobre qualidade e diferencial clínico do tratamento.", p: 3 },
      { t: "Faz perguntas para reposicionar o valor e insiste até esgotar as possibilidades.", p: 4 },
    ],
  },
  {
    id: "DA4",
    dim: "Resultado comercial",
    q: "Sendo completamente honesto: como você descreveria o resultado comercial da sua secretária?",
    opts: [
      { t: "Mantém a operação funcionando, mas não gera agendamentos de forma proativa.", p: 1 },
      { t: "É adorada pelas pacientes, mas os números de conversão de leads novos são fracos.", p: 2 },
      { t: "Converte bem quando a paciente já tem interesse claro, mas raramente vende de verdade.", p: 3 },
      { t: "Maquina de agendamentos. Quando um lead entra, a probabilidade de fechar ? alta.", p: 4 },
    ],
  },
  {
    id: "DA5",
    dim: "Inicio do dia",
    q: "Quando a secretária chega para trabalhar, qual tarefa ela faz com satisfação genuína?",
    opts: [
      { t: "Organizar a agenda, checar fichas técnicas e garantir que tudo esta atualizado.", p: 1 },
      { t: "Responder mensagens, dar bom dia e saber como as pacientes estão após os procedimentos.", p: 2 },
      { t: "Estudar novos protocolos e estar pronta para tirar duvidas técnicas com profundidade.", p: 3 },
      { t: "Olhar a lista de leads novos e acionar cada um para converter agendamentos.", p: 4 },
    ],
  },
];

const CHANNELS = [
  {
    id: "whatsapp",
    label: "WhatsApp",
    handle: "+55 69 9983-5337",
    url: "https://wa.me/556999835337?text=Ol%C3%A1%20Aline!%20Acabei%20de%20fazer%20o%20Diagn%C3%B3stico%20VERT4%20e%20quero%20liberar%20a%20Fase%202.",
  },
  {
    id: "instagram",
    label: "Instagram",
    handle: "@alinedayanesanches",
    url: "https://www.instagram.com/alinedayanesanches/",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    handle: "Aline Sanches",
    url: "https://www.linkedin.com/in/aline-sanches-a46224a0/",
  },
];

const money = (value) =>
  Number(value || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

const pct = (value) => `${Number(value || 0).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;

const cleanNumber = (value) => Number(String(value || "").replace(/\./g, "").replace(",", ".")) || 0;

function formatDuration(seconds = 0) {
  const s = Math.max(0, Math.round(Number(seconds) || 0));
  if (s < 60) return `${s}s`;
  const min = Math.floor(s / 60);
  const sec = s % 60;
  if (min < 60) return `${min}min ${sec}s`;
  const h = Math.floor(min / 60);
  return `${h}h ${min % 60}min`;
}

function scoreAnswers(ans) {
  const score = { P1: 0, P2: 0, P3: 0, P4: 0 };
  Object.values(ans).forEach((value) => {
    if (value) score[`P${value}`] += 3;
  });
  return score;
}

function getDom(score) {
  const max = Math.max(...Object.values(score));
  return ["P1", "P2", "P3", "P4"].find((profile) => score[profile] === max) || "P1";
}

function isMixed(score) {
  const values = Object.values(score).sort((a, b) => b - a);
  return values[0] - values[1] <= 3;
}

function getMixed(score) {
  return Object.entries(score)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([key]) => key)
    .join("/");
}

function calcDISC(score) {
  const D = (score.P4 / 15) * 100;
  const I = ((score.P3 + score.P4) / 30) * 100;
  const S = ((score.P2 + score.P1 * 0.5) / 22.5) * 100;
  const C = ((score.P1 + score.P3 * 0.5) / 22.5) * 100;
  const label = (value) => (value > 60 ? "Alta" : value >= 40 ? "Moderada" : "Em desenvolvimento");

  return {
    D: { value: Math.round(D), label: label(D), name: "Dominancia" },
    I: { value: Math.round(I), label: label(I), name: "Influencia" },
    S: { value: Math.round(S), label: label(S), name: "Estabilidade" },
    C: { value: Math.round(C), label: label(C), name: "Conformidade" },
  };
}

function calcFin(form) {
  const org = cleanNumber(form.orgLeads);
  const paid = cleanNumber(form.paidLeads);
  const appointments = cleanNumber(form.appointments);
  const ticket = cleanNumber(form.ticket);
  const total = org + paid;

  if (!total) return { error: "no_leads" };
  if (appointments > total) return { error: "inconsistent" };

  const conversion = Number(((appointments / total) * 100).toFixed(1));
  const benchmarkAppointments = total * 0.5;
  const lost = Math.max(0, Number((benchmarkAppointments - appointments).toFixed(1)));
  const weeklyRevenue = appointments * ticket;
  const monthlyRevenue = weeklyRevenue * 4.33;
  const weeklyLoss = lost * ticket;
  const monthlyLoss = weeklyLoss * 4.33;

  return {
    org,
    paid,
    total,
    appointments,
    ticket,
    conversion,
    potentialUsed: Number(((conversion / 50) * 100).toFixed(1)),
    benchmarkAppointments,
    lost,
    weeklyRevenue,
    monthlyRevenue,
    weeklyLoss,
    monthlyLoss,
    roiAlert: paid > org && conversion < 25,
    above: conversion >= 50,
  };
}

function getVerdict(profile, fin) {
  if (fin.above) return "VE-07";
  if (profile === "P4") return fin.conversion >= 50 ? "VE-01" : "VE-02";
  if (profile === "P3") return "VE-03";
  if (profile === "P2") return "VE-04";
  if (profile === "P1") return "VE-05";
  return "VE-06";
}

function calcPotential(profile, fin, mixed) {
  const leadScore = Math.min(24, fin.total * 0.7);
  const ticketScore = Math.min(20, fin.ticket / 450);
  const gapScore = Math.min(28, Math.max(0, 50 - fin.conversion) * 0.75);
  const profileScore = { P1: 9, P2: 12, P3: 16, P4: 19 }[profile] || 12;
  const paidScore = fin.roiAlert ? 10 : fin.paid > 0 ? 6 : 3;
  const mixedScore = mixed ? 4 : 0;
  const score = Math.min(98, Math.round(leadScore + ticketScore + gapScore + profileScore + paidScore + mixedScore));

  if (score >= 82) return { score, label: "Potencial muito alto", tone: "ha volume, dor economica e margem clara para capturar receita rapidamente." };
  if (score >= 66) return { score, label: "Potencial alto", tone: "existem sinais fortes de ganho comercial com ajustes de processo e postura." };
  if (score >= 48) return { score, label: "Potencial em expansao", tone: "a base é boa, mas a conversão ainda depende de mais consistencia." };
  return { score, label: "Potencial controlado", tone: "o maior valor esta em proteger qualidade, rotina e previsibilidade." };
}

function buildIntelligence(result) {
  const { profile, mixed, mixedStr, fin, form, potential } = result;
  const name = form.secretary || "sua secretária";
  const clinic = form.clinic || "a clínica";
  const profileData = PROFILE[profile];
  const conversionGap = Math.max(0, 50 - fin.conversion);

  const map = {
    P1: {
      executive: `${name} demonstra um eixo operacional forte: tende a proteger agenda, rotina e previsibilidade. O ponto critico e que esse mêsmo padrão pode reduzir movimento comercial quando o lead exige conducao, reposicionamento de valor e convite claro para a consulta.`,
      strengths: ["Organização e baixa tolerancia a erro", "Boa sustentação de rotina", "Capacidade de manter a operação previsível"],
      weaknesses: ["Pode responder em vez de conduzir", "Baixa iniciativa em follow-up comercial", "Dificuldade para reposicionar objecoes de preço"],
      opportunity: "Transformar organização em sistema comercial: roteiro, cadencia de retorno e critério de qualificação.",
      owner: "Dono deve comunicar com clareza, dados e processo. Evite cobrar carisma; cobre rotina de conversão mensurável.",
      script: "Antes de informar preço, use: 'Para te orientar com responsabilidade, posso entender seu objetivo principal e o prazo que você imagina para iniciar?'",
    },
    P2: {
      executive: `${name} provavelmente cria segurança emocional no primeiro contato, o que é valioso em saúde e estética. O risco é confundir acolhimento com ausencia de direção: o lead se sente bem atendido, mas não necessariamente avançado.`,
      strengths: ["Vinculo e cuidado no atendimento", "Boa leitura emocional da paciente", "Ambiente de confiança"],
      weaknesses: ["Tendencia a evitar pressão comercial", "Pode concordar com objecoes cedo demais", "Follow-up menos assertivo"],
      opportunity: "Adicionar estrutura de decisão sem perder acolhimento: perguntas, compromisso de retorno e fechamento consultivo.",
      owner: "Dono deve elogiar o cuidado e pedir mais direção. O comando precisa soar como protecao da paciente, não como venda agressiva.",
      script: "Use: 'Faz sentido você pensar. Para eu não te deixar sem direção, qual ponto ainda precisa ficar claro para você decidir com segurança?'",
    },
    P3: {
      executive: `${name} tende a vender pela autoridade: explica, contextualiza e valoriza o tratamento. O risco aparece quando a explicação fica maior que o fechamento e o lead sai informado, mas sem agenda marcada.`,
      strengths: ["Autoridade técnica e argumentação", "Capacidade de educar o lead", "Boa ponte entre desejo e solucao"],
      weaknesses: ["Pode sobre-explicar e alongar a decisão", "Nem sempre pede o compromisso no momento certo", "Risco de transform conversa em aula"],
      opportunity: "Encapsular a explicação em uma proposta simples: problema, caminho, próximo passo e reserva de horário.",
      owner: "Dono deve pedir síntese e fechamento. A melhoria não e estudar mais; é converter conhecimento em decisão.",
      script: "Use: 'Pelo que você me contou, faz sentido avaliarmos pessoalmente. Tenho dois horários bons esta semana; prefere manhã ou tarde?'",
    },
    P4: {
      executive: `${name} apresenta tração comercial e provavelmente enxerga o lead como oportunidade. O foco agora é calibrar intensidade, consistencia e qualidade da qualificação para que a conversão não dependa apenas de energia individual.`,
      strengths: ["Proatividade e foco em resultado", "Maior tolerancia a objeção", "Conducao clara para agenda"],
      weaknesses: ["Pode acelerar leads que precisam de mais contexto", "Risco de prometer demais se não houver critério", "Pode cansar em rotinas muito repetitivas"],
      opportunity: "Criar playbook de elite: qualificação, follow-up e controle de qualidade para escalar sem perder experiência premium.",
      owner: "Dono deve trabalhar meta, critério e refinamento. O desafio não e motivar; e transformar performance em método replicável.",
      script: "Use: 'Consigo reservar um horário estratégico para sua avaliação. Se fizer sentido após a consulta, você decide o próximo passo com segurança.'",
    },
  };

  const base = map[profile];
  const insights = [
    conversionGap > 0
      ? `A taxa atual esta ${pct(conversionGap)} abaixo do benchmark VERT4 de 50%. Isso representa cerca de ${fin.lost.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} agendamentos por semana que poderiam estar entrando na agenda.`
      : `A taxa atual supera o benchmark de 50%. O desafio deixa de ser apenas conversão e passa a ser previsibilidade, qualidade do lead e escala sem queda de experiência.`,
    fin.monthlyLoss > 0
      ? `O vazamento estimado e de ${money(fin.monthlyLoss)} por mês. Esse número não e uma promêssa de ganho; é uma fotografia do valor que deixa de ser capturado quando lead e agenda não se encontram.`
      : `Não há vazamento contra o benchmark neste cenario. Mesmo assim, vale investigar se o resultado depende de uma pessoa especifica ou de um processo replicável.`,
    fin.roiAlert
      ? `Há um alerta de ROI: o volume pago supera o orgânico e a conversão esta abaixo de 25%. Antes de aumentar tráfego, a clínica deveria proteger a etapa de atendimento.`
      : `O equilibrio entre origem organica e paga não indica risco extremo de ROI, mas a eficiencia comercial ainda pode melhorar com cadencia e abordagem.`,
    mixed
      ? `O perfil aparece misto (${mixedStr}), o que sugere comportamento adaptativo. A Fase 2 ajuda a separar estilo natural, pressão do ambiente e habilidade treinada.`
      : `O perfil dominante esta consistente. Isso facilita criar um plano direto, com menos dispersão e metas mais claras.`,
  ];

  const nextSteps = [
    "Mapear as últimas 20 conversas de WhatsApp e classificar: respondeu, conduziu, contornou objeção ou perdeu contato.",
    "Criar um roteiro de três etapas: qualificação, proposta de valor e convite objetivo para avaliação.",
    "Medir diariamente leads recebidos, respostas em até 5 minutos, agendamentos e motivos de perda.",
    "Usar a Fase 2 para validar se o comportamento observado e estilo natural, treino, pressão do ambiente ou desalinhamento de função.",
  ];

  return {
    executive: base.executive,
    cost: `${clinic} não perde apenas consultas; perde previsibilidade. Quando o atendimento não conduz o lead até a avaliação, o investimento em marketing, reputação e indicação fica parcialmente desperdicado.`,
    strengths: base.strengths,
    weaknesses: base.weaknesses,
    opportunity: base.opportunity,
    owner: base.owner,
    script: base.script,
    insights,
    nextSteps,
    potentialText: `${potential.label}: ${potential.tone}`,
    ctaAngle: `${profileData.name} com ${pct(fin.conversion)} de conversão pede uma investigação mais precisa antes de qualquer decisão sobre troca, treinamento ou escala.`,
  };
}

async function genNarrative(payload) {
  const { profile, mixed, mixedStr, fin, form, potential } = payload;
  const profileData = PROFILE[profile];
  const prompt = `Você ? o motor analitico premium da VERT4 para clínicas de saúde, estética ? alta performance comercial.

Gere uma análise em JSON puro, sem markdown, com comentarios humanos, precisos e persuasivos.

Dados:
Clínica: ${form.clinic || "Não informado"}
Dono(a): ${form.owner || "Não informado"}
Secretária: ${form.secretary || "Secretária"}
Perfil observado: ${profile} - ${profileData.name} (${profileData.disc})${mixed ? `, misto ${mixedStr}` : ""}
Leads semanais: ${fin.total}
Consultas semanais: ${fin.appointments}
Taxa de conversão: ${fin.conversion}%
Ticket médio: ${money(fin.ticket)}
Vazamento mensal estimado: ${money(fin.monthlyLoss)}
Potencial: ${potential.label} (${potential.score}/100)
Alerta ROI de tráfego: ${fin.roiAlert ? "SIM" : "NAO"}

Regras:
- Evite frases genericas.
- Explique com simplicidade para dono de clínica entender.
- Traga ponto forte, ponto fraco e oportunidade.
- Posicione a Fase 2 como próximo passo logico, sem promêssa exagerada.
- Responda somente com JSON valido:
{
  "executive":"4 frases de leitura executiva",
  "hiddenRisk":"3 frases sobre risco invisivel",
  "commercialInsight":"3 frases conectando comportamento e dinheiro",
  "nextMove":"2 frases de próximo passo"
}`;

  try {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    const data = await response.json();
    const text = data.content?.find((item) => item.type === "text")?.text || "{}";
    return JSON.parse(text.replace(/```json|```/g, "").trim());
  } catch {
    return null;
  }
}

function saveLead(data) {
  try {
    const existing = JSON.parse(localStorage.getItem("vert4_leads") || "[]");
    existing.push({ ...data, ts: new Date().toISOString() });
    localStorage.setItem("vert4_leads", JSON.stringify(existing));
  } catch {
    // localStorage indisponível não deve quebrar o diagnóstico.
  }
}

function loadLeads() {
  try {
    return JSON.parse(localStorage.getItem("vert4_leads") || "[]").sort((a, b) => new Date(b.ts) - new Date(a.ts));
  } catch {
    return [];
  }
}

function Icon({ name, size = 22 }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  const paths = {
    instagram: (
      <>
        <rect x="4" y="4" width="16" height="16" rx="5" />
        <circle cx="12" cy="12" r="3.4" />
        <path d="M16.9 7.1h.01" />
      </>
    ),
    whatsapp: (
      <>
        <path d="M5.5 19.2l1-3.2a7.4 7.4 0 112.2 2.1l-3.2 1.1z" />
        <path d="M9.6 8.6c.3-.3.8-.2 1 .2l.5 1c.1.3.1.6-.1.8l-.4.5c.6 1.1 1.4 1.9 2.5 2.5l.5-.4c.2-.2.6-.2.8-.1l1 .5c.4.2.5.7.2 1-.4.5-.9.8-1.5.8-2.7 0-5.4-2.7-5.4-5.4 0-.6.3-1.1.9-1.4z" />
      </>
    ),
    linkedin: (
      <>
        <rect x="4" y="4" width="16" height="16" rx="3" />
        <path d="M8.2 10.5v5.3" />
        <path d="M8.2 8.1h.01" />
        <path d="M12 15.8v-3c0-1.4.9-2.3 2.1-2.3s1.9.8 1.9 2.4v2.9" />
        <path d="M12 10.7v5.1" />
      </>
    ),
    analytics: (
      <>
        <path d="M4 19V5" />
        <path d="M4 19h16" />
        <path d="M8 15l3-4 3 2 4-7" />
      </>
    ),
    conversion: (
      <>
        <path d="M4 5h16l-6 7v5l-4 2v-7L4 5z" />
        <path d="M15.5 5l-7 14" />
      </>
    ),
    growth: (
      <>
        <path d="M4 17l5-5 4 3 7-8" />
        <path d="M15 7h5v5" />
      </>
    ),
    diagnosis: (
      <>
        <rect x="6" y="4" width="12" height="16" rx="2" />
        <path d="M9 8h6" />
        <path d="M9 12h6" />
        <path d="M9 16h3" />
      </>
    ),
    strategy: (
      <>
        <circle cx="12" cy="12" r="8" />
        <circle cx="12" cy="12" r="3" />
        <path d="M12 4v3" />
        <path d="M20 12h-3" />
        <path d="M12 20v-3" />
        <path d="M4 12h3" />
      </>
    ),
    result: (
      <>
        <path d="M8 20h8" />
        <path d="M12 16v4" />
        <path d="M7 4h10v5a5 5 0 01-10 0V4z" />
        <path d="M7 7H4a3 3 0 003 3" />
        <path d="M17 7h3a3 3 0 01-3 3" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v5l3 2" />
      </>
    ),
    users: (
      <>
        <path d="M16 19c0-2.2-1.8-4-4-4s-4 1.8-4 4" />
        <circle cx="12" cy="9" r="3" />
        <path d="M20 18c0-1.6-1-3-2.4-3.6" />
        <path d="M4 18c0-1.6 1-3 2.4-3.6" />
      </>
    ),
    money: (
      <>
        <rect x="4" y="7" width="16" height="10" rx="2" />
        <circle cx="12" cy="12" r="2.2" />
        <path d="M7 10v.01" />
        <path d="M17 14v.01" />
      </>
    ),
    arrow: (
      <>
        <path d="M5 12h14" />
        <path d="M13 6l6 6-6 6" />
      </>
    ),
    check: (
      <>
        <path d="M5 12l4 4L19 6" />
      </>
    ),
    refresh: (
      <>
        <path d="M20 12a8 8 0 01-14.9 4" />
        <path d="M4 12A8 8 0 0118.9 8" />
        <path d="M18 4v4h-4" />
        <path d="M6 20v-4h4" />
      </>
    ),
    export: (
      <>
        <path d="M12 4v10" />
        <path d="M8 10l4 4 4-4" />
        <path d="M5 18h14" />
      </>
    ),
    lock: (
      <>
        <rect x="5" y="10" width="14" height="9" rx="2" />
        <path d="M8 10V8a4 4 0 018 0v2" />
      </>
    ),
  };

  return <svg {...common}>{paths[name] || paths.analytics}</svg>;
}

function AppStyles() {
  return (
    <style>{`
      :root { color-scheme: dark; }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        background: ${V.bg};
        color: ${V.ink};
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      button, input { font: inherit; }
      button { -webkit-tap-highlight-color: transparent; }
      .app-shell {
        min-height: 100vh;
        background:
          radial-gradient(circle at 18% 0%, rgba(215,181,109,.13), transparent 28rem),
          radial-gradient(circle at 86% 8%, rgba(68,162,118,.12), transparent 24rem),
          linear-gradient(145deg, ${V.bg}, ${V.bg2} 52%, #08130f);
      }
      .topbar {
        position: sticky;
        top: 0;
        z-index: 20;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        padding: 18px clamp(18px, 4vw, 42px);
        border-bottom: 1px solid rgba(255,255,255,.06);
        backdrop-filter: blur(18px);
        background: rgba(7,21,18,.78);
      }
      .brand { display: flex; align-items: center; gap: 12px; border: 0; background: transparent; color: inherit; cursor: pointer; padding: 0; text-align: left; }
      .brand-mark { position: relative; width: 52px; height: 52px; border-radius: 16px; font-size: 14px; display: grid; place-items: center; color: ${V.gold}; border: 1px solid rgba(215,181,109,.38); background: linear-gradient(145deg, rgba(215,181,109,.18), rgba(68,162,118,.08)); font-weight: 950; letter-spacing: -.03em; box-shadow: inset 0 1px 0 rgba(255,255,255,.08), 0 12px 28px rgba(0,0,0,.18); }
      .brand-mark::after { content: ""; position: absolute; inset: 7px; border-radius: 10px; border: 1px solid rgba(255,255,255,.08); pointer-events: none; }
      .brand-title { font-weight: 900; letter-spacing: .12em; font-size: 13px; }
      .brand-four { display: inline-block; transform: translateY(5px); color: ${V.gold}; }
      .brand-sub { color: ${V.soft}; font-size: 11px; margin-top: 2px; }
      .container { width: min(1180px, calc(100% - 32px)); margin: 0 auto; padding: 32px 0 56px; }
      .hero { display: grid; grid-template-columns: minmax(0, 1.08fr) minmax(320px, .92fr); gap: clamp(22px, 4vw, 44px); align-items: center; padding: clamp(18px, 4vw, 48px) 0 24px; }
      .eyebrow { color: ${V.gold}; text-transform: uppercase; letter-spacing: .18em; font-size: 11px; font-weight: 900; }
      .title { font-size: clamp(48px, 7vw, 84px); line-height: .94; letter-spacing: 0; margin: 16px 0 18px; max-width: 850px; }
      .subtitle { color: ${V.muted}; font-size: clamp(18px, 2vw, 22px); line-height: 1.7; max-width: 700px; }
      .actions { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; margin-top: 28px; }
      .btn { border: 0; border-radius: 14px; padding: 14px 18px; display: inline-flex; align-items: center; justify-content: center; gap: 10px; cursor: pointer; font-weight: 900; transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease, background .2s ease; text-decoration: none; min-height: 48px; }
      .btn:hover { transform: translateY(-2px); }
      .btn-primary { background: ${V.gold}; color: ${V.dark}; box-shadow: 0 18px 42px rgba(215,181,109,.22); }
      .btn-primary:hover { background: ${V.gold2}; box-shadow: 0 22px 56px rgba(215,181,109,.28); }
      .btn-ghost { background: rgba(255,255,255,.035); color: ${V.ink}; border: 1px solid rgba(255,255,255,.1); }
      .btn-ghost:hover { border-color: rgba(215,181,109,.45); }
      .btn-green { background: ${V.green}; color: white; box-shadow: 0 18px 42px rgba(68,162,118,.2); }
      .micro { color: ${V.soft}; font-size: 12px; line-height: 1.6; }
      .panel { border: 1px solid rgba(255,255,255,.08); border-radius: 20px; background: linear-gradient(145deg, rgba(16,36,29,.94), rgba(12,28,22,.92)); box-shadow: 0 26px 90px rgba(0,0,0,.28); }
      .panel-pad { padding: clamp(18px, 3vw, 28px); }
      .glass { background: rgba(255,255,255,.045); border: 1px solid rgba(255,255,255,.08); border-radius: 18px; }
      .grid-2 { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
      .grid-3 { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
      .grid-4 { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; }
      .metric { padding: 18px; border-radius: 18px; background: rgba(255,255,255,.045); border: 1px solid rgba(255,255,255,.08); min-height: 118px; }
      .metric-icon { width: 40px; height: 40px; border-radius: 14px; display: grid; place-items: center; margin-bottom: 16px; color: ${V.gold}; background: rgba(215,181,109,.1); border: 1px solid rgba(215,181,109,.18); }
      .metric-label { color: ${V.soft}; text-transform: uppercase; letter-spacing: .12em; font-size: 10px; font-weight: 900; }
      .metric-value { font-size: clamp(24px, 3vw, 34px); font-weight: 950; margin-top: 6px; line-height: 1; }
      .metric-sub { color: ${V.muted}; font-size: 12px; line-height: 1.5; margin-top: 9px; }
      .stepper { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 22px; }
      .step-pill { height: 8px; border-radius: 99px; background: rgba(255,255,255,.08); overflow: hidden; }
      .step-pill span { display: block; height: 100%; background: linear-gradient(90deg, ${V.gold}, ${V.green}); border-radius: inherit; }
      .field label { display: block; color: ${V.soft}; text-transform: uppercase; letter-spacing: .12em; font-size: 10px; font-weight: 900; margin-bottom: 8px; }
      .field input { width: 100%; min-height: 48px; border: 1px solid rgba(255,255,255,.1); border-radius: 14px; color: ${V.ink}; background: rgba(0,0,0,.18); outline: none; padding: 0 14px; transition: border-color .2s ease, box-shadow .2s ease; }
      .field input:focus { border-color: rgba(215,181,109,.62); box-shadow: 0 0 0 4px rgba(215,181,109,.08); }
      .field input.error { border-color: rgba(220,80,94,.75); }
      .error-msg { color: #ff9aa4; font-size: 12px; margin-top: 6px; }
      .question-card { padding: clamp(20px, 4vw, 34px); border-radius: 24px; background: linear-gradient(145deg, rgba(18,42,33,.95), rgba(10,24,19,.95)); border: 1px solid rgba(255,255,255,.08); }
      .option { width: 100%; text-align: left; border: 1px solid rgba(255,255,255,.1); background: rgba(255,255,255,.035); color: ${V.ink}; border-radius: 16px; padding: 16px; display: flex; gap: 14px; cursor: pointer; transition: transform .2s ease, border-color .2s ease, background .2s ease; }
      .option:hover, .option.selected { border-color: rgba(215,181,109,.55); background: rgba(215,181,109,.09); transform: translateY(-1px); }
      .option-index { width: 28px; height: 28px; border-radius: 10px; display: grid; place-items: center; color: ${V.gold}; border: 1px solid rgba(215,181,109,.25); flex: 0 0 auto; font-size: 12px; font-weight: 900; }
      .tabs { display: flex; gap: 8px; overflow-x: auto; padding: 8px; border: 1px solid rgba(255,255,255,.08); border-radius: 16px; background: rgba(255,255,255,.035); margin: 22px 0; }
      .tab { border: 0; background: transparent; color: ${V.muted}; border-radius: 12px; padding: 12px 14px; cursor: pointer; white-space: nowrap; font-weight: 850; transition: background .2s ease, color .2s ease; }
      .tab.active { background: ${V.gold}; color: ${V.dark}; }
      .tab.fase2:not(.active) { color: ${V.gold2}; background: rgba(215,181,109,.08); }
      .section-title { font-size: clamp(24px, 3vw, 36px); line-height: 1.1; margin: 0 0 10px; }
      .section-copy { color: ${V.muted}; line-height: 1.75; margin: 0; }
      .disc-row { display: grid; grid-template-columns: 46px 1fr 84px; gap: 12px; align-items: center; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,.07); }
      .disc-track { height: 10px; border-radius: 999px; background: rgba(255,255,255,.08); overflow: hidden; }
      .disc-fill { height: 100%; border-radius: inherit; background: linear-gradient(90deg, ${V.gold}, ${V.green}); }
      .list { display: grid; gap: 10px; }
      .list-item { display: flex; gap: 12px; align-items: flex-start; color: ${V.muted}; line-height: 1.6; }
      .list-dot { width: 24px; height: 24px; border-radius: 9px; display: grid; place-items: center; flex: 0 0 auto; color: ${V.green2}; background: rgba(68,162,118,.1); margin-top: 1px; }
      .phase-card { position: relative; overflow: hidden; padding: clamp(24px, 5vw, 44px); border-radius: 28px; border: 1px solid rgba(215,181,109,.24); background: linear-gradient(145deg, rgba(24,50,39,.98), rgba(8,19,15,.98)); box-shadow: 0 28px 100px rgba(0,0,0,.3); }
      .phase-card::before { content: ""; position: absolute; inset: 0; background: linear-gradient(120deg, rgba(215,181,109,.14), transparent 36%, rgba(68,162,118,.1)); pointer-events: none; }
      .phase-content { position: relative; z-index: 1; }
      .channel-card { border: 1px solid rgba(255,255,255,.1); background: rgba(255,255,255,.045); color: ${V.ink}; border-radius: 18px; padding: 16px; cursor: pointer; display: flex; align-items: center; gap: 14px; text-align: left; transition: transform .2s ease, border-color .2s ease, background .2s ease; }
      .channel-card:hover { transform: translateY(-3px); border-color: rgba(215,181,109,.5); background: rgba(215,181,109,.075); }
      .channel-icon { width: 46px; height: 46px; border-radius: 16px; display: grid; place-items: center; color: ${V.gold}; border: 1px solid rgba(215,181,109,.22); background: rgba(215,181,109,.1); flex: 0 0 auto; }
      .admin-table { width: 100%; border-collapse: collapse; min-width: 780px; }
      .admin-table th, .admin-table td { padding: 13px 12px; border-bottom: 1px solid rgba(255,255,255,.08); text-align: left; font-size: 13px; }
      .admin-table th { color: ${V.soft}; text-transform: uppercase; letter-spacing: .11em; font-size: 10px; }
      .table-wrap { overflow-x: auto; border-radius: 18px; border: 1px solid rgba(255,255,255,.08); }
      .bar-row { display: grid; grid-template-columns: 130px 1fr 48px; gap: 12px; align-items: center; margin: 10px 0; }
      .bar-track { height: 10px; border-radius: 999px; background: rgba(255,255,255,.08); overflow: hidden; }
      .bar-fill { height: 100%; border-radius: inherit; background: linear-gradient(90deg, ${V.gold}, ${V.green}); }
      .fade-up { animation: fadeUp .45s ease both; }
      @keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes spin { to { transform: rotate(360deg); } }
      .spinner { width: 42px; height: 42px; border: 3px solid rgba(255,255,255,.12); border-top-color: ${V.gold}; border-radius: 999px; animation: spin .9s linear infinite; }
      @media (max-width: 940px) {
        .hero, .grid-2, .grid-3, .grid-4 { grid-template-columns: 1fr; }
        .topbar { position: relative; }
      }
      @media (max-width: 640px) {
        .container { width: min(100% - 22px, 1180px); padding-top: 20px; }
        .actions, .topbar { align-items: stretch; }
        .topbar { flex-direction: column; }
        .btn { width: 100%; }
        .metric { min-height: auto; }
        .disc-row { grid-template-columns: 38px 1fr 58px; }
      }
    `}</style>
  );
}

function Header({ onSecretAdmin, onHome }) {
  // Logo (VT4) → home
  // Texto "Analytics" → admin (com senha)
  return (
    <header className="topbar">
      <div className="brand" style={{ display:"flex", alignItems:"center", gap:0, cursor:"default" }}>
        {/* Clique no ícone VT4 = volta para home */}
        <button
          onClick={onHome}
          aria-label="Voltar ao início"
          style={{ background:"transparent", border:"none", cursor:"pointer",
            display:"flex", alignItems:"center", padding:0, marginRight:10 }}
        >
          <span className="brand-mark">VT4</span>
        </button>

        {/* Clique em VERT4 = home também */}
        <button
          onClick={onHome}
          aria-label="Voltar ao início"
          style={{ background:"transparent", border:"none", cursor:"pointer",
            display:"flex", flexDirection:"column", alignItems:"flex-start", padding:0 }}
        >
          <span className="brand-title">VERT<span className="brand-four">4</span></span>
          {/* 5 cliques em "Analytics" = abre admin */}
          <span
            onClick={(e) => {
              e.stopPropagation();
              const el = e.currentTarget;
              el._count = (el._count || 0) + 1;
              clearTimeout(el._timer);
              if (el._count >= 5) {
                el._count = 0;
                onSecretAdmin();
              } else {
                el._timer = setTimeout(() => { el._count = 0; }, 1200);
              }
            }}
            style={{ fontSize:11, color:"#978b7c", letterSpacing:1, cursor:"pointer",
              textDecoration:"none", transition:"color .2s", userSelect:"none" }}
            onMouseEnter={e => e.currentTarget.style.color="#d7b56d"}
            onMouseLeave={e => e.currentTarget.style.color="#978b7c"}
          >
            Concierge Clínico
          </span>
        </button>
      </div>
    </header>
  );
}

function Stepper({ step }) {
  return (
    <div className="stepper" aria-hidden>
      {[0, 1, 2].map((index) => (
        <div className="step-pill" key={index}>
          <span style={{ width: index < step ? "100%" : index === step ? "58%" : "0%" }} />
        </div>
      ))}
    </div>
  );
}

function Field({ label, value, onChange, error, type = "text", placeholder, noNumbers = false, hint }) {
  const handleChange = (event) => {
    let v = event.target.value;
    if (noNumbers) v = v.replace(/[0-9]/g, "");
    onChange(v);
  };
  return (
    <div className="field">
      <label>{label}</label>
      <input
        className={error ? "error" : ""}
        value={value}
        onChange={handleChange}
        type={type}
        placeholder={placeholder}
        inputMode={type === "number" ? "decimal" : undefined}
      />
      {hint && !error && <div style={{ fontSize: 11, color: "#978b7c", marginTop: 4, lineHeight: 1.4 }}>{hint}</div>}
      {error && <div className="error-msg">{error}</div>}
    </div>
  );
}

function MetricCard({ icon, label, value, sub, color = V.gold }) {
  return (
    <div className="metric">
      <div className="metric-icon" style={{ color }}>
        <Icon name={icon} />
      </div>
      <div className="metric-label">{label}</div>
      <div className="metric-value" style={{ color }}>
        {value}
      </div>
      {sub && <div className="metric-sub">{sub}</div>}
    </div>
  );
}

function List({ items }) {
  return (
    <div className="list">
      {items.map((item) => (
        <div className="list-item" key={item}>
          <span className="list-dot">
            <Icon name="check" size={15} />
          </span>
          <span>{item}</span>
        </div>
      ))}
    </div>
  );
}

function Panel({ children, className = "", style }) {
  return (
    <div className={`panel panel-pad ${className}`} style={style}>
      {children}
    </div>
  );
}

function MiniDonut({ value, label }) {
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.max(0, Math.min(100, value)) / 100) * circumference;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
      <svg width="124" height="124" viewBox="0 0 124 124" role="img" aria-label={label}>
        <circle cx="62" cy="62" r={radius} fill="none" stroke="rgba(255,255,255,.09)" strokeWidth="12" />
        <circle
          cx="62"
          cy="62"
          r={radius}
          fill="none"
          stroke={V.gold}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 62 62)"
        />
        <text x="62" y="58" textAnchor="middle" fill={V.ink} fontSize="22" fontWeight="900">
          {Math.round(value)}
        </text>
        <text x="62" y="76" textAnchor="middle" fill={V.soft} fontSize="10" fontWeight="800">
          /100
        </text>
      </svg>
      <div>
        <div className="metric-label">Nivel de potencial</div>
        <div style={{ fontWeight: 950, fontSize: 22, marginTop: 6 }}>{label}</div>
      </div>
    </div>
  );
}

function BarRows({ data }) {
  const max = Math.max(1, ...data.map((item) => item.value));
  return (
    <div>
      {data.map((item) => (
        <div className="bar-row" key={item.label}>
          <div style={{ color: V.muted, fontSize: 12, fontWeight: 800 }}>{item.label}</div>
          <div className="bar-track">
            <div className="bar-fill" style={{ width: `${(item.value / max) * 100}%`, background: item.color || undefined }} />
          </div>
          <div style={{ color: V.ink, fontWeight: 900, textAlign: "right" }}>{item.value}</div>
        </div>
      ))}
    </div>
  );
}

function Funnel({ steps }) {
  const max = Math.max(1, ...steps.map((item) => item.value));
  return (
    <div style={{ display: "grid", gap: 12 }}>
      {steps.map((step, index) => (
        <div key={step.label}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 7 }}>
            <span style={{ color: V.muted, fontWeight: 850, fontSize: 13 }}>{step.label}</span>
            <span style={{ color: V.ink, fontWeight: 950 }}>{step.value}</span>
          </div>
          <div className="bar-track" style={{ height: 14 }}>
            <div
              className="bar-fill"
              style={{
                width: `${Math.max(4, (step.value / max) * 100)}%`,
                background: index === steps.length - 1 ? V.green : `linear-gradient(90deg, ${V.gold}, ${V.green})`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function DiscBars({ disc }) {
  const colors = { D: V.red, I: V.gold, S: V.green, C: V.blue };
  return (
    <div>
      {Object.entries(disc).map(([key, item]) => (
        <div className="disc-row" key={key}>
          <div style={{ fontWeight: 950, color: colors[key] }}>{key}</div>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
              <span style={{ color: V.muted, fontSize: 12 }}>{item.name}</span>
              <span style={{ color: V.soft, fontSize: 12 }}>{item.label}</span>
            </div>
            <div className="disc-track">
              <div className="disc-fill" style={{ width: `${item.value}%`, background: colors[key] }} />
            </div>
          </div>
          <div style={{ textAlign: "right", fontWeight: 950 }}>{item.value}%</div>
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const topRef = useRef(null);
  const { initConsent, setLeadContext, track, trackTab, trackCTA, trackFormStart, trackQuestion, trackComplete } = useTracker();

  const [cookieConsent, setCookieConsent] = useState(() => localStorage.getItem("vert4_cookie_consent"));
  const [step, setStep] = useState("intro");
  const [form, setForm] = useState({
    owner: "",
    clinic: "",
    instagram: "",
    whatsapp: "",
    secretary: "",
    orgLeads: "",
    paidLeads: "",
    appointments: "",
    ticket: "",
  });
  const [errors, setErrors] = useState({});
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [narrative, setNarrative] = useState(null);
  const [tab, setTab] = useState(0);
  const [leads, setLeads] = useState([]);
  const [adminOk, setAdminOk] = useState(false);
  const [adminPw, setAdminPw] = useState("");
  const [adminError, setAdminError] = useState("");
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const secretAdminTap = useRef({ count: 0, last: 0 });

  useEffect(() => {
    if (cookieConsent !== null) initConsent(cookieConsent === "true");
  }, [cookieConsent, initConsent]);

  useEffect(() => {
    setLeads(loadLeads());
  }, []);

  const scrollTop = () => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const updateForm = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
    if (["owner", "clinic", "instagram", "whatsapp", "secretary"].includes(key)) {
      setLeadContext({ [key]: value });
    }
  };

  const handleConsent = (accepted) => {
    localStorage.setItem("vert4_cookie_consent", String(Boolean(accepted)));
    setCookieConsent(String(Boolean(accepted)));
  };

  const validateIdentity = () => {
    const next = {};
    if (!form.owner.trim()) next.owner = "Informe o nome do responsável.";
    if (!form.clinic.trim()) next.clinic = "Informe o nome da clínica.";

    // WhatsApp: precisa ter pelo menos 10 dígitos (DDD + número)
    const waDigits = (form.whatsapp || "").replace(/\D/g, "");
    if (!form.whatsapp.trim()) {
      next.whatsapp = "Informe um WhatsApp para retorno.";
    } else if (waDigits.length < 10) {
      next.whatsapp = "WhatsApp inválido. Informe DDD + número (ex: 11 99999-9999).";
    }

    // Instagram: se preenchido, precisa ter ao menos 3 caracteres e nenhum espaço
    const ig = (form.instagram || "").trim();
    if (ig && (ig.length < 3 || /\s/.test(ig))) {
      next.instagram = "Instagram inválido. Use @perfil sem espaços (ex: @clinicaexemplo).";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const validateData = () => {
    const next = {};
    ["orgLeads", "paidLeads", "appointments", "ticket"].forEach((key) => {
      if (form[key] === "") next[key] = "Campo obrigatorio.";
    });

    const fin = calcFin(form);
    if (fin.error === "no_leads") next.orgLeads = "Informe pelo menos um lead semanal.";
    if (fin.error === "inconsistent") next.appointments = "Agendamentos não podem superar o total de leads.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const go = (nextStep) => {
    setStep(nextStep);
    setTimeout(scrollTop, 20);
  };

  const openSecretAdmin = () => {
    const now = Date.now();
    const sequence = secretAdminTap.current;
    sequence.count = now - sequence.last > 1800 ? 1 : sequence.count + 1;
    sequence.last = now;
    if (sequence.count >= 5) {
      sequence.count = 0;
      go("admin");
    }
  };

  const answerQuestion = (value) => {
    const question = QUESTIONS[qIndex];
    const next = { ...answers, [question.id]: value };
    setAnswers(next);
    trackQuestion({
      question_id: question.id,
      dimension: question.dim,
      selected_profile: `P${value}`,
      question_index: qIndex + 1,
    });
  };

  const finish = async () => {
    if (Object.keys(answers).length < QUESTIONS.length) return;

    const scores = scoreAnswers(answers);
    const profile = getDom(scores);
    const mixed = isMixed(scores);
    const mixedStr = mixed ? getMixed(scores) : "";
    const disc = calcDISC(scores);
    const fin = calcFin(form);
    const verdict = getVerdict(profile, fin);
    const potential = calcPotential(profile, fin, mixed);
    const baseResult = {
      form,
      answers,
      scores,
      profile,
      mixed,
      mixedStr,
      disc,
      fin,
      verdict,
      potential,
    };
    const intelligence = buildIntelligence(baseResult);
    const completeResult = { ...baseResult, intelligence };
    const leadPayload = {
      owner: form.owner,
      clinic: form.clinic,
      instagram: form.instagram,
      whatsapp: form.whatsapp,
      secretary: form.secretary,
      profile,
      profile_name: PROFILE[profile].name,
      mixed,
      mixedStr,
      conversion_rate: fin.conversion,
      total_leads: fin.total,
      appointments: fin.appointments,
      ticket: fin.ticket,
      monthly_loss: fin.monthlyLoss,
      potential_score: potential.score,
      potential_label: potential.label,
      verdict,
    };

    setResult(completeResult);
    saveLead(leadPayload);
    setLeads(loadLeads());
    trackComplete(leadPayload);
    go("processing");

    const ai = await genNarrative(completeResult);
    setNarrative(ai);
    go("report");
  };

  const loadStats = async (password = adminPw) => {
    setLoadingStats(true);
    setAdminError("");
    try {
      const response = await fetch("/api/admin/stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Não foi possível carregar o painel.");
      setStats(data);
    } catch (error) {
      setAdminError(error.mêssage || "Falha ao carregar analytics.");
    } finally {
      setLoadingStats(false);
    }
  };

  const loginAdmin = async () => {
    setAdminError("");
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: adminPw }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Senha incorreta.");
      setAdminOk(true);
      await loadStats(adminPw);
    } catch (error) {
      setAdminError(error.mêssage || "Senha incorreta.");
    }
  };

  const openTracked = (channel, label, url) => {
    trackCTA(label, { channel, destination: url, phase: "fase2" });
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const shell = (children) => (
    <div className="app-shell" ref={topRef}>
      <AppStyles />
      {cookieConsent === null && <CookieBanner onConsent={handleConsent} />}
      <Header onSecretAdmin={openSecretAdmin} onHome={() => go("intro")} />
      <main className="container fade-up">{children}</main>
    </div>
  );

  if (step === "intro") {
    return shell(
      <>
        <section className="hero">
          <div>
            <div className="eyebrow">Diagnóstico comercial para clínicas premium</div>
            <h1 className="title" style={{ fontSize: "clamp(46px, 7vw, 84px)" }}>Uma secretária estratégica pode aumentar o faturamento<br/><span style={{color:"#d7b56d"}}>sem aumentar o tráfego.</span></h1>
            <p className="subtitle">
              Seu atendimento na cadeira é impecável. Descubra se a sua recepção está vendendo na mesma altura!
            </p>
            <div className="actions">
              <button
                className="btn btn-primary"
                style={{ fontSize:18, padding:"18px 36px", letterSpacing:.5,
                  boxShadow:`0 12px 40px rgba(215,181,109,.45)`, minHeight:62 }}
                onClick={() => go("form_id")}
              >
                Iniciar diagnóstico
                <Icon name="arrow" size={22} />
              </button>
              <span className="micro" style={{ fontSize: 11, fontWeight: 800, color: V.gold, textTransform: "uppercase", letterSpacing: 1 }}>Leva cerca de 4 minutos. Resultado imediato.</span>
            </div>
          </div>

          <Panel>
            <div className="grid-2">
              <MetricCard icon="diagnosis" label="Método" value="DISC + Receita" sub="Perfil observado conectado ao impacto financeiro." />
              <MetricCard icon="conversion" label="Benchmark" value="50%" sub="Referência de conversão semanal para comparação." color={V.green} />
              <MetricCard icon="analytics" label="Inteligência" value="Visão Clara" sub="Identifique gargalos e converta mais pacientes." color={V.blue} />
              <MetricCard icon="strategy" label="Resultado" value="Plano de 30 dias" sub="Já com resultados práticos e metas mensuráveis." color={V.gold2} />
            </div>
          </Panel>
        </section>

        <section className="grid-3" style={{ marginTop: 22 }}>
          {[
            ["growth",  "Crescimento com critério",  "Mostra onde a clínica pode ganhar receita antes de aumentar tráfego.", false],
            ["result",  "Decisão menos emocional",   "Ajuda a separar simpatia, esforço e performance comercial real.",     false],
            ["result",  "Plano de 30 dias já com resultados", "Receba um laudo comportamental completo com plano de desenvolvimento individual e ação imediata.", true],
          ].map(([icon, title, text, highlight]) => (
            <div
              className="glass panel-pad"
              key={title}
              style={highlight ? {
                border:"1.5px solid rgba(215,181,109,.55)",
                background:"linear-gradient(145deg, rgba(215,181,109,.1), rgba(7,21,18,.6))",
                boxShadow:"0 8px 32px rgba(215,181,109,.14)",
              } : {}}
            >
              <div className="metric-icon" style={highlight ? { color:"#d7b56d" } : {}}>
                <Icon name={icon} />
              </div>
              <h3 style={{ margin:"0 0 8px", fontSize: highlight ? 20 : 18, color: highlight ? "#d7b56d" : undefined }}>{title}</h3>
              <p className="section-copy" style={{ fontSize: highlight ? 15 : 14, color: highlight ? "#c9c0b3" : undefined }}>{text}</p>
            </div>
          ))}
        </section>
      </>,
    );
  }

  if (step === "form_id") {
    return shell(
      <Panel style={{ maxWidth: 860, margin: "28px auto" }}>
        <Stepper step={0} />
        <div className="eyebrow">Etapa 1 de 3</div>
        <h2 className="section-title">Identificação da clínica</h2>
        <p className="section-copy">Esses dados personalizam o laudo e permitem gerar um diagnóstico comercial preciso para a sua clínica.</p>

        <div className="grid-2" style={{ marginTop: 24 }}>
          <Field label="Responsável" value={form.owner} onChange={(value) => updateForm("owner", value)} error={errors.owner} placeholder="Nome do dono ou gestor" noNumbers />
          <Field label="Clínica" value={form.clinic} onChange={(value) => updateForm("clinic", value)} error={errors.clinic} placeholder="Nome da clínica" />
          <Field label="WhatsApp" value={form.whatsapp} onChange={(value) => updateForm("whatsapp", value)} error={errors.whatsapp} placeholder="(00) 00000-0000" />
          <Field label="Instagram" value={form.instagram} onChange={(value) => updateForm("instagram", value)} placeholder="@perfil" />
          <Field label="Secretária avaliada" value={form.secretary} onChange={(value) => updateForm("secretary", value)} placeholder="Opcional" noNumbers />
        </div>

        <div className="actions">
          <button className="btn btn-ghost" onClick={() => go("intro")}>Voltar</button>
          <button
            className="btn btn-primary"
            onClick={() => {
              if (validateIdentity()) {
                trackFormStart({ clinic: form.clinic, owner: form.owner });
                go("form_data");
              }
            }}
          >
            Continuar
            <Icon name="arrow" size={18} />
          </button>
        </div>
      </Panel>,
    );
  }

  if (step === "form_data") {
    return shell(
      <Panel style={{ maxWidth: 860, margin: "28px auto" }}>
        <Stepper step={1} />
        <div className="eyebrow">Etapa 2 de 3</div>
        <h2 className="section-title">Dados comerciais da semana</h2>
        <p className="section-copy">Use números médios. O objetivo e estimar o tamanho da oportunidade, não criar uma auditoria contábil.</p>

        <div className="grid-2" style={{ marginTop: 24 }}>
          <Field label="Leads orgânicos por semana" type="number" value={form.orgLeads} onChange={(value) => updateForm("orgLeads", value)} error={errors.orgLeads} placeholder="Ex.: 18" />
          <Field label="Leads por tráfego pago por semana" type="number" value={form.paidLeads} onChange={(value) => updateForm("paidLeads", value)} error={errors.paidLeads} placeholder="Ex.: 32" hint="Contatos vindos de anúncios pagos (Meta Ads, Google Ads etc.)" />
          <Field label="Consultas agendadas por semana" type="number" value={form.appointments} onChange={(value) => updateForm("appointments", value)} error={errors.appointments} placeholder="Ex.: 14" />
          <Field label="Ticket médio por paciente" type="number" value={form.ticket} onChange={(value) => updateForm("ticket", value)} error={errors.ticket} placeholder="Ex.: 1200" />
        </div>

        <div className="actions">
          <button className="btn btn-ghost" onClick={() => go("form_id")}>Voltar</button>
          <button
            className="btn btn-primary"
            onClick={() => {
              if (validateData()) go("questions");
            }}
          >
            Ir para questionario
            <Icon name="arrow" size={18} />
          </button>
        </div>
      </Panel>,
    );
  }

  if (step === "questions") {
    const question = QUESTIONS[qIndex];
    const selected = answers[question.id];
    const progress = ((qIndex + 1) / QUESTIONS.length) * 100;

    return shell(
      <div style={{ maxWidth: 900, margin: "24px auto" }}>
        <Stepper step={2} />
        <div className="question-card">
          <div style={{ display: "flex", justifyContent: "space-between", gap: 14, alignItems: "center", marginBottom: 18 }}>
            <div>
              <div className="eyebrow">Pergunta {qIndex + 1} de {QUESTIONS.length}</div>
              <div style={{ color: V.soft, fontWeight: 800, marginTop: 6 }}>{question.dim}</div>
            </div>
            <div style={{ color: V.gold, fontWeight: 950 }}>{Math.round(progress)}%</div>
          </div>
          <div className="bar-track" style={{ height: 10, marginBottom: 26 }}>
            <div className="bar-fill" style={{ width: `${progress}%` }} />
          </div>
          <h2 className="section-title">{question.q}</h2>
          <div style={{ display: "grid", gap: 10, marginTop: 24 }}>
            {question.opts.map((option, index) => (
              <button
                className={`option ${selected === option.p ? "selected" : ""}`}
                key={option.t}
                onClick={() => answerQuestion(option.p)}
              >
                <span className="option-index">{index + 1}</span>
                <span style={{ lineHeight: 1.6 }}>{option.t}</span>
              </button>
            ))}
          </div>
          <div className="actions" style={{ justifyContent: "space-between" }}>
            <button className="btn btn-ghost" onClick={() => (qIndex === 0 ? go("form_data") : setQIndex((current) => current - 1))}>Voltar</button>
            {qIndex < QUESTIONS.length - 1 ? (
              <button className="btn btn-primary" disabled={!selected} onClick={() => selected && setQIndex((current) => current + 1)}>
                Próxima
                <Icon name="arrow" size={18} />
              </button>
            ) : (
              <button className="btn btn-primary" disabled={!selected} onClick={finish}>
                Gerar análise premium
                <Icon name="result" size={18} />
              </button>
            )}
          </div>
        </div>
      </div>,
    );
  }

  if (step === "processing") {
    return shell(
      <Panel style={{ maxWidth: 620, margin: "80px auto", textAlign: "center" }}>
        <div style={{ display: "grid", placeItems: "center", marginBottom: 22 }}>
          <div className="spinner" />
        </div>
        <div className="eyebrow">Motor VERT4 em processamento</div>
        <h2 className="section-title">Cruzando perfil, conversão, vazamento e potencial.</h2>
        <p className="section-copy">A análise local já foi gerada. Se a IA estiver configurada no backend, ela adiciona uma camada extra de leitura consultiva.</p>
      </Panel>,
    );
  }

  if (step === "report" && result) {
    return shell(<Report result={result} narrative={narrative} tab={tab} setTab={setTab} trackTab={trackTab} openTracked={openTracked} reset={() => {
      setForm({ owner: "", clinic: "", instagram: "", whatsapp: "", secretary: "", orgLeads: "", paidLeads: "", appointments: "", ticket: "" });
      setAnswers({});
      setQIndex(0);
      setResult(null);
      setNarrative(null);
      setTab(0);
      go("intro");
    }} />);
  }

  if (step === "admin") {
    return shell(
      <AdminPanel
        adminOk={adminOk}
        adminPw={adminPw}
        setAdminPw={setAdminPw}
        adminError={adminError}
        loginAdmin={loginAdmin}
        loadingStats={loadingStats}
        stats={stats}
        leads={leads}
        refresh={() => loadStats(adminPw)}
        logout={() => {
          setAdminOk(false);
          setStats(null);
          setAdminPw("");
        }}
      />,
    );
  }

  return shell(null);
}

function Report({ result, narrative, tab, setTab, trackTab, openTracked, reset }) {
  const { profile, mixed, mixedStr, fin, disc, verdict, potential, intelligence, form } = result;
  const profileData = PROFILE[profile];
  const tabs = ["Diagnóstico", "Financeiro", "Análise", "Plano 30 dias", "Fase 2"];
  const aiBlocks = narrative ? [narrative.executive, narrative.hiddenRisk, narrative.commercialInsight, narrative.nextMove].filter(Boolean) : [];

  const changeTab = (index) => {
    setTab(index);
    trackTab(tabs[index]);
  };

  return (
    <>
      <Panel>
        <div className="grid-2" style={{ alignItems: "center" }}>
          <div>
            <div className="eyebrow">Laudo VERT4 gerado</div>
            <h1 className="section-title" style={{ fontSize: "clamp(34px, 5vw, 58px)" }}>
              {PROFILE[profile].name}: o atendimento mostra {PROFILE[profile].tag.toLowerCase()}.
            </h1>
            <p className="section-copy">
              Perfil {profile} ({profileData.disc}) para {form.secretary || "a secretária"} em {form.clinic || "sua clínica"}.
              {mixed ? ` Há sinal de perfil misto entre ${mixedStr.split("/").map(p => PROFILE[p]?.name || p).join(" e ")}, o que aumenta a importancia da Fase 2.` : " O padrão dominante apareceu com boa consistencia."}
            </p>
          </div>
          <MiniDonut value={potential.score} label={potential.label} />
        </div>

        <div className="grid-4" style={{ marginTop: 24 }}>
          <MetricCard icon="conversion" label="Conversão atual" value={pct(fin.conversion)} sub="Agendamentos sobre leads semanais." color={fin.above ? V.green : V.gold} />
          <MetricCard icon="money" label="Vazamento mensal" value={fin.monthlyLoss ? money(fin.monthlyLoss) : "Zero"} sub="Comparado ao benchmark de 50%." color={fin.monthlyLoss ? V.red : V.green} />
          <MetricCard icon="users" label="Leads semanais" value={fin.total} sub={`${fin.org} orgânicos + ${fin.paid} pagos.`} color={V.blue} />
          <MetricCard icon="result" label="Veredito" value={VERDICTS[verdict].label} sub="Direcao estratégica recomendada." color={VERDICTS[verdict].color} />
        </div>
      </Panel>

      <div className="tabs">
        {tabs.map((item, index) => (
          <button className={`tab ${tab === index ? "active" : ""} ${item === "Fase 2" ? "fase2" : ""}`} key={item} onClick={() => changeTab(index)}>
            {item}
          </button>
        ))}
      </div>

      {tab === 0 && (
        <div className="grid-2">
          <Panel>
            <div className="eyebrow">Diagnóstico comportamental</div>
            <h2 className="section-title">{profileData.name}</h2>
            <p className="section-copy">
              Este perfil {profileData.promise} O objetivo não é rotular a pessoa, mas entender qual tipo de estrutura aumenta desempenho sem destruir a experiência do paciente.
            </p>
            <div className="glass panel-pad" style={{ marginTop: 18 }}>
              <DiscBars disc={disc} />
            </div>
          </Panel>
          <Panel>
            <div className="eyebrow">Forcas e atenções</div>
            <h2 className="section-title">Onde existe vantagem e onde há perda silenciosa.</h2>
            <div className="grid-2" style={{ marginTop: 20 }}>
              <div>
                <h3 style={{ marginTop: 0 }}>Pontos fortes</h3>
                <List items={intelligence.strengths} />
              </div>
              <div>
                <h3 style={{ marginTop: 0 }}>Pontos fracos</h3>
                <List items={intelligence.weaknesses} />
              </div>
            </div>
          </Panel>
        </div>
      )}

      {tab === 1 && (
        <div className="grid-2">
          <Panel>
            <div className="eyebrow">Leitura financeira</div>
            <h2 className="section-title">O impacto comercial ficou mensurável.</h2>
            <p className="section-copy">
              A clínica recebe {fin.total} leads por semana e agenda {fin.appointments}. No benchmark VERT4, esse volume deveria gerar cerca de {fin.benchmarkAppointments.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} consultas semanais.
            </p>
            <div className="grid-2" style={{ marginTop: 22 }}>
              <MetricCard icon="growth" label="Receita mensal atual" value={money(fin.monthlyRevenue)} sub="Estimativa com ticket informado." color={V.green} />
              <MetricCard icon="money" label="Receita não capturada" value={money(fin.monthlyLoss)} sub="Oportunidade mensal estimada." color={fin.monthlyLoss ? V.red : V.green} />
            </div>
          </Panel>
          <Panel>
            <div className="eyebrow">Benchmark de conversão</div>
            <h2 className="section-title">{pct(fin.potentialUsed)} do potencial de referência usado.</h2>
            <Funnel
              steps={[
                { label: "Leads recebidos", value: fin.total },
                { label: "Consultas atuais", value: fin.appointments },
                { label: "Consultas no benchmark", value: Math.round(fin.benchmarkAppointments) },
              ]}
            />
            {fin.roiAlert && (
              <div className="glass panel-pad" style={{ marginTop: 18, borderColor: "rgba(220,80,94,.35)" }}>
                <strong style={{ color: "#ff9aa4" }}>Alerta de ROI:</strong>{" "}
                <span style={{ color: V.muted }}>antes de aumentar tráfego pago, a etapa de atendimento precisa ser protegida.</span>
              </div>
            )}
          </Panel>
        </div>
      )}

      {tab === 2 && (
        <div className="grid-2">
          <Panel>
            <div className="eyebrow">Análise premium</div>
            <h2 className="section-title">Interpretação executiva para decisão.</h2>
            <p className="section-copy">{intelligence.executive}</p>
            <p className="section-copy" style={{ marginTop: 14 }}>{intelligence.cost}</p>
            <div className="glass panel-pad" style={{ marginTop: 18 }}>
              <MiniDonut value={potential.score} label={potential.label} />
              <p className="section-copy" style={{ marginTop: 12 }}>{intelligence.potentialText}</p>
            </div>
          </Panel>

          <Panel>
            <div className="eyebrow">Insights e pontos de atenção</div>
            <h2 className="section-title">O que os dados estão sinalizando.</h2>
            <List items={intelligence.insights} />
            <div className="glass panel-pad" style={{ marginTop: 18 }}>
              <strong style={{ color: V.gold2 }}>Pontos fortes identificados:</strong>
              <ul style={{ paddingLeft: 18, marginTop: 8 }}>
                {intelligence.strengths.map((s) => (
                  <li key={s} className="section-copy" style={{ marginBottom: 4 }}>{s}</li>
                ))}
              </ul>
            </div>
            <div className="glass panel-pad" style={{ marginTop: 12 }}>
              <strong style={{ color: V.red }}>Pontos de atenção:</strong>
              <ul style={{ paddingLeft: 18, marginTop: 8 }}>
                {intelligence.weaknesses.map((w) => (
                  <li key={w} className="section-copy" style={{ marginBottom: 4 }}>{w}</li>
                ))}
              </ul>
            </div>
            <div className="glass panel-pad" style={{ marginTop: 12, borderLeft: `3px solid ${V.green}` }}>
              <strong style={{ color: V.green }}>Oportunidade de desenvolvimento:</strong>
              <p className="section-copy" style={{ marginTop: 8 }}>{intelligence.opportunity}</p>
            </div>
          </Panel>

          <Panel>
            <div className="eyebrow">Direcao pratica</div>
            <h2 className="section-title">Como agir sem improviso.</h2>
            <div className="glass panel-pad" style={{ marginBottom: 14 }}>
              <strong style={{ color: V.gold }}>Para o dono:</strong>
              <p className="section-copy" style={{ marginTop: 8 }}>{intelligence.owner}</p>
            </div>
            <div className="glass panel-pad">
              <strong style={{ color: V.green2 }}>Script para WhatsApp:</strong>
              <p className="section-copy" style={{ marginTop: 8 }}>{intelligence.script}</p>
            </div>
          </Panel>

          <Panel>
            <div className="eyebrow">Camada IA</div>
            <h2 className="section-title">Comentario adaptativo.</h2>
            {aiBlocks.length ? (
              <div className="list">
                {aiBlocks.map((block) => (
                  <p className="section-copy glass panel-pad" key={block}>{block}</p>
                ))}
              </div>
            ) : (
              <p className="section-copy">
                A leitura local já foi gerada com base nas respostas. Para comentarios adicionais por IA, configure a chave do provedor no backend.
              </p>
            )}
          </Panel>
        </div>
      )}

      {tab === 3 && (
        <div className="grid-2">
          <Panel>
            <div className="eyebrow">Plano de 30 dias</div>
            <h2 className="section-title">Para cobrar resultados, você precisa de processos. Descubra como transformar a percepção do atendimento em uma rotina métrica, clara e lucrativa.</h2>
            <List items={intelligence.nextSteps} />
          </Panel>
          <Panel>
            <div className="eyebrow">Cadencia sugerida</div>
            <h2 className="section-title">Quatro semanas de ganho operacional.</h2>
            <div className="list">
              {[
                ["Semana 1", "Auditar conversas e classificar perdas."],
                ["Semana 2", "Implantar roteiro de qualificação e convite."],
                ["Semana 3", "Treinar contorno de objeções reais e medir follow-up."],
                ["Semana 4", "Comparar taxa, ajustar playbook e decidir Fase 2."],
              ].map(([week, text]) => (
                <div className="glass panel-pad" key={week}>
                  <strong style={{ color: V.gold }}>{week}</strong>
                  <p className="section-copy" style={{ marginTop: 6 }}>{text}</p>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      )}

      {tab === 4 && (
        <div className="phase-card">
          <div className="phase-content">
            <div className="grid-2" style={{ alignItems: "center" }}>
              <div>
                <div className="eyebrow">Convite para Fase 2</div>
                <h2 className="section-title" style={{ fontSize: "clamp(34px, 5vw, 62px)" }}>
                  O diagnóstico limpou o terreno. A Fase 2 é para analisar o perfil comportamental de sua secretária e ativar o lado comercial dela.
                </h2>
                <p className="section-copy" style={{ fontSize: 17 }}>
                  {intelligence.ctaAngle} A Fase 2 aprofunda o estilo natural, pressão comportamental, aderência comercial e recomendação de desenvolvimento.
                </p>
                <div className="actions">
                  <button className="btn btn-primary" onClick={() => openTracked("whatsapp", "whatsapp_fase2_primary", CHANNELS[0].url)}>
                    Liberar Fase 2 pelo WhatsApp
                    <Icon name="whatsapp" size={19} />
                  </button>
                  <span className="micro">Análise prioritária para diagnósticos com alto potencial.</span>
                </div>
              </div>
              <Panel style={{ background: "rgba(0,0,0,.18)" }}>
                <div className="eyebrow">O que a Fase 2 revela</div>
                <List
                  items={[
                    "Estilo natural vs. comportamento sob pressão.",
                    "Aderencia da secretária ao papel comercial da clínica.",
                    "Risco de treinamento errado para o perfil observado.",
                    "Plano de ação com linguagem, rotina e meta por perfil.",
                  ]}
                />
              </Panel>
            </div>

            <div className="grid-3" style={{ marginTop: 22 }}>
              {CHANNELS.map((channel) => (
                <button
                  className="channel-card"
                  key={channel.id}
                  onClick={() => openTracked(channel.id, `${channel.id}_fase2_contact`, channel.url)}
                >
                  <span className="channel-icon">
                    <Icon name={channel.id} />
                  </span>
                  <span>
                    <strong>{channel.label}</strong>
                    <span style={{ display: "block", color: V.soft, fontSize: 12, marginTop: 3 }}>{channel.handle}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div style={{ marginTop: 24 }}>
        {tab !== 4 && (
          <div style={{
            background: `linear-gradient(135deg, rgba(215,181,109,.12), rgba(163,58,70,.1))`,
            border: "1.5px solid rgba(215,181,109,.45)",
            borderRadius: 14,
            padding: "22px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 14,
            marginBottom: 12,
          }}>
            <div>
              <div className="eyebrow" style={{ color: V.gold }}>Este diagnóstico está incompleto</div>
              <p className="section-copy" style={{ margin: 0, maxWidth: 440 }}>
                A Fase 2 revela o estilo natural, o risco de burnout silencioso e o PDI cirúrgico para {result?.form?.secretary || "sua secretária"}.
              </p>
            </div>
            <button
              className="btn btn-primary"
              style={{ fontSize: 15, padding: "14px 28px", boxShadow: `0 6px 24px rgba(215,181,109,.35)` }}
              onClick={() => changeTab(4)}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{display:"inline",verticalAlign:"middle",marginRight:4}}><path d="M8 1L10.2 6.2L16 8L10.2 9.8L8 15L5.8 9.8L0 8L5.8 6.2L8 1Z" fill="#d7b56d" stroke="none"/></svg> Liberar Fase 2 Agora
              <Icon name="arrow" size={18} />
            </button>
          </div>
        )}
        <div className="actions" style={{ justifyContent: "space-between" }}>
          <button className="btn btn-ghost" onClick={reset}>Novo diagnóstico</button>
          {tab === 4 && (
            <button className="btn btn-ghost" onClick={() => changeTab(0)}>
              ← Voltar ao diagnóstico
            </button>
          )}
        </div>
      </div>
    </>
  );
}

function AdminPanel({ adminOk, adminPw, setAdminPw, adminError, loginAdmin, loadingStats, stats, leads, refresh, logout }) {
  const diagnostics = stats?.diagnostics?.length ? stats.diagnostics : leads;
  const channelSummary = stats?.channel_summary || {};
  const clicks = stats?.channel_clicks || [];
  const originData = stats?.origin_summary
    ? Object.entries(stats.origin_summary).map(([label, value]) => ({ label, value }))
    : [];

  if (!adminOk) {
    return (
      <Panel style={{ maxWidth: 460, margin: "70px auto" }}>
        <div className="metric-icon">
          <Icon name="lock" />
        </div>
        <div className="eyebrow">Painel administrador</div>
        <h1 className="section-title">Analytics VERT4</h1>
        <p className="section-copy">Acesse o painel avançado de Fase 2, cliques por canal, origem e funil de conversão.</p>
        <div style={{ marginTop: 22 }}>
          <Field label="Senha" type="password" value={adminPw} onChange={setAdminPw} error={adminError} placeholder="Digite a senha" />
        </div>
        <div className="actions">
          <button className="btn btn-primary" onClick={loginAdmin}>
            Entrar
            <Icon name="arrow" size={18} />
          </button>
        </div>
      </Panel>
    );
  }

  const avgPaidLeads = stats?.avg_paid_leads != null
    ? Number(stats.avg_paid_leads).toLocaleString("pt-BR", { maximumFractionDigits: 1 })
    : "—";

  const kpis = [
    ["users",     "Visitantes",           stats?.total_visitors || 0,                 "Sessões com consentimento.",             V.gold   ],
    ["diagnosis", "Fase 1 completa",       stats?.completed_diag || 0,                 "Diagnósticos concluídos.",               V.green  ],
    ["analytics", "Leads por tráfego",     avgPaidLeads,                               "Média de leads pagos informados.",       V.blue   ],
    ["conversion","Fase 1 → Fase 2",       pct(stats?.phase1_to_phase2_rate || 0),     "Taxa de avanço para a segunda fase.",    V.gold2  ],
    ["whatsapp",  "WhatsApp",              channelSummary.whatsapp?.count || 0,        "Cliques registrados no canal.",          V.green2 ],
    ["clock",     "Tempo médio",           formatDuration(stats?.avg_duration_sec||0), "Duração média de sessão.",               V.blue   ],
  ];

  const funnel = [
    { label: "Visitantes com consentimento", value: stats?.total_visitors || 0 },
    { label: "Concluíram Fase 1", value: stats?.completed_diag || 0 },
    { label: "Abriram Fase 2", value: stats?.fase2_views || 0 },
    { label: "Clicaram em canal", value: stats?.total_channel_clicks || 0 },
  ];

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", marginBottom: 20, flexWrap: "wrap" }}>
        <div>
          <div className="eyebrow">Painel administrador</div>
          <h1 className="section-title">Analytics avançado da Fase 2</h1>
          <p className="section-copy">Leitura limpa de origem, comportamento, tempo antes do clique e conversão.</p>
        </div>
        <div className="actions" style={{ marginTop: 0 }}>
          <button className="btn btn-ghost" onClick={refresh} disabled={loadingStats}>
            <Icon name="refresh" size={18} />
            Atualizar
          </button>
          <button
            className="btn btn-ghost"
            onClick={async () => {
              const response = await fetch("/api/admin/export", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password: adminPw }),
              });
              const blob = await response.blob();
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "vert4_analytics.xlsx";
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            <Icon name="export" size={18} />
            Exportar
          </button>
          <button className="btn btn-ghost" onClick={logout}>Sair</button>
        </div>
      </div>

      {adminError && <div className="glass panel-pad" style={{ color: "#ff9aa4", marginBottom: 16 }}>{adminError}</div>}

      <div className="grid-3">
        {kpis.map(([icon, label, value, sub, color]) => (
          <MetricCard key={label} icon={icon} label={label} value={value} sub={sub} color={color} />
        ))}
      </div>

      <div className="grid-2" style={{ marginTop: 16 }}>
        <Panel>
          <div className="eyebrow">Funil de conversão</div>
          <h2 className="section-title">Fase 1 para Fase 2</h2>
          <Funnel steps={funnel} />
        </Panel>
        <Panel>
          <div className="eyebrow">Origem do usuario</div>
          <h2 className="section-title">Fontes mais frequentes</h2>
          {originData.length ? <BarRows data={originData} /> : <p className="section-copy">Sem origem registrada ainda.</p>}
        </Panel>
      </div>

      <div className="grid-3" style={{ marginTop: 16 }}>
        {CHANNELS.map((channel) => {
          const data = channelSummary[channel.id] || {};
          return (
            <Panel key={channel.id}>
              <div className="metric-icon">
                <Icon name={channel.id} />
              </div>
              <div className="eyebrow">{channel.label}</div>
              <div className="metric-value">{data.count || 0}</div>
              <p className="section-copy">Tempo médio antes do clique: {formatDuration(data.avg_seconds_before_click || 0)}.</p>
            </Panel>
          );
        })}
      </div>

      <Panel style={{ marginTop: 16 }}>
        <div className="eyebrow">Quem clicou nos canais</div>
        <h2 className="section-title">Cliques com tempo, origem e interações</h2>
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Quem</th>
                <th>Canal</th>
                <th>Tempo até clique</th>
                <th>Sessão total</th>
                <th>Horário</th>
                <th>Origem</th>
                <th>Interações</th>
              </tr>
            </thead>
            <tbody>
              {clicks.length ? (
                clicks.map((click, index) => (
                  <tr key={`${click.session_id}-${index}`}>
                    <td>
                      <strong>{click.clinic || click.owner || "Visitante anonimo"}</strong>
                      <div style={{ color: V.soft, fontSize: 12 }}>{click.owner || click.secretary || click.session_id}</div>
                    </td>
                    <td style={{ color: V.gold, fontWeight: 900 }}>{click.channel}</td>
                    <td>{formatDuration(click.seconds_before_click)}</td>
                    <td>{formatDuration(click.total_session_sec)}</td>
                    <td>{click.clicked_at}</td>
                    <td>{click.origin || "direto"}</td>
                    <td>{click.interactions_before_click ?? 0}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ color: V.soft, textAlign: "center", padding: 28 }}>Nenhum clique de canal registrado ainda.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel style={{ marginTop: 16 }}>
        <div className="eyebrow">Diagnósticos</div>
        <h2 className="section-title">{diagnostics.length} diagnóstico{diagnostics.length === 1 ? "" : "s"} registrado{diagnostics.length === 1 ? "" : "s"}</h2>
        <div className="table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Clínica</th>
                <th>Perfil</th>
                <th>Conversão</th>
                <th>Potencial</th>
                <th>Vazamento</th>
                <th>Contato</th>
              </tr>
            </thead>
            <tbody>
              {diagnostics.length ? (
                diagnostics.map((lead, index) => (
                  <tr key={`${lead.clinic}-${index}`}>
                    <td>
                      <strong>{lead.clinic || "Sem clínica"}</strong>
                      <div style={{ color: V.soft, fontSize: 12 }}>{lead.owner || ""}</div>
                    </td>
                    <td style={{ color: PROFILE[lead.profile]?.color || V.gold, fontWeight: 900 }}>{lead.profile || "-"} {lead.profile_name || ""}</td>
                    <td>{pct(lead.conversion_rate ?? lead.tc ?? 0)}</td>
                    <td>{lead.potential_score ? `${lead.potential_score}/100` : "-"}</td>
                    <td>{money(lead.monthly_loss ?? lead.mLoss ?? 0)}</td>
                    <td>{lead.whatsapp || "-"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ color: V.soft, textAlign: "center", padding: 28 }}>Nenhum diagnóstico concluido ainda.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}
