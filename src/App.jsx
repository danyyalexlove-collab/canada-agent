import { useState, useEffect, useRef } from "react";

/* ─── CONSTANTS ─────────────────────────────────────────── */
const PRICE = 29;
const TRIAL_DAYS = 7;

const SECTIONS = {
  migration: {
    id: "migration", icon: "🍁", label: "Migración", color: "#D4192C",
    title: "Asesoría Migratoria",
    disclaimer: "Este agente NO ofrece asesoría legal ni migratoria personalizada. La información es de carácter general y orientativo. Para tu caso específico, consulta siempre con un consultor certificado RCIC o un abogado de inmigración.",
    questions: [
      { id: "status", text: "¿Cuál es tu situación migratoria actual?", options: ["Residente permanente", "Visa de trabajo", "Visa de estudiante", "En proceso de solicitud", "Ciudadano canadiense", "Otra situación"] },
      { id: "goal", text: "¿Qué objetivo tienes?", options: ["Obtener residencia permanente", "Traer a mi familia", "Renovar mi estatus", "Solicitar ciudadanía", "Entender mis derechos", "Otro"] },
      { id: "time", text: "¿Cuánto tiempo llevas en Canadá?", options: ["Aún no he llegado", "Menos de 1 año", "1–2 años", "2–5 años", "Más de 5 años"] },
    ],
    systemPrompt: `Eres un asistente de información migratoria para Canadá. Solo ofreces información general basada en fuentes oficiales del gobierno canadiense (IRCC).
REGLAS: 
1. Siempre termina con un enlace a canada.ca relevante.
2. Incluye: "⚠️ Esta información es general. Consulta un RCIC certificado o abogado para tu caso específico."
3. No tomes decisiones ni des asesoría personalizada.
4. Responde en español claro y organizado.`,
    links: [
      { label: "Portal IRCC", url: "https://www.canada.ca/en/immigration-refugees-citizenship.html" },
      { label: "Express Entry", url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry.html" },
      { label: "Directorio RCIC Certificados", url: "https://college-ic.ca/protecting-the-public/find-an-immigration-consultant" },
      { label: "Mi cuenta IRCC", url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/application/account.html" },
      { label: "Reunificación familiar", url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/family-sponsorship.html" },
    ],
  },
  finances: {
    id: "finances", icon: "💵", label: "Finanzas", color: "#1A6B3C",
    title: "Guía Financiera",
    disclaimer: "Este agente NO ofrece asesoría financiera ni fiscal personalizada. Para decisiones importantes, consulta con un asesor financiero certificado (CFP) o contador público (CPA).",
    questions: [
      { id: "situation", text: "¿Cuál es tu situación financiera en Canadá?", options: ["Recién llegado, sin historial crediticio", "Tengo cuenta bancaria, quiero mejorar mi crédito", "Busco información sobre impuestos", "Quiero ahorrar e invertir", "Necesito entender beneficios gubernamentales"] },
      { id: "income", text: "¿Cuál es tu situación laboral?", options: ["Empleado tiempo completo", "Empleado tiempo parcial", "Trabajador independiente", "Sin empleo actualmente", "Estudiante"] },
      { id: "priority", text: "¿Qué tema es tu prioridad ahora?", options: ["Historial crediticio", "Declaración de impuestos", "Beneficios GST/HST, CCB", "RRSP y TFSA", "Enviar dinero a México/Latinoamérica", "Créditos y préstamos"] },
    ],
    systemPrompt: `Eres un asistente de información financiera para inmigrantes en Canadá.
REGLAS:
1. Proporciona información general sobre finanzas personales, impuestos y beneficios gubernamentales.
2. Siempre incluye enlace a canada.ca o CRA relevante.
3. Termina con: "⚠️ Para asesoría personalizada, consulta con un CFP o CPA certificado."
4. Si hablas de impuestos, remite siempre a la CRA oficial.
5. Responde en español, práctico y ordenado.`,
    links: [
      { label: "CRA – Agencia de Ingresos", url: "https://www.canada.ca/en/revenue-agency.html" },
      { label: "Declarar impuestos", url: "https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/about-your-tax-return.html" },
      { label: "Beneficios y créditos", url: "https://www.canada.ca/en/revenue-agency/services/child-family-benefits.html" },
      { label: "FCAC – Educación financiera", url: "https://www.canada.ca/en/financial-consumer-agency.html" },
      { label: "TFSA y RRSP", url: "https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/rrsps-related-plans.html" },
    ],
  },
  tramites: {
    id: "tramites", icon: "📋", label: "Trámites", color: "#1A3A6B",
    title: "Guía de Trámites",
    disclaimer: "Los requisitos varían por provincia y pueden cambiar. Verifica siempre en los sitios oficiales provinciales y federales antes de iniciar cualquier trámite.",
    questions: [
      { id: "province", text: "¿En qué provincia vives?", options: ["Ontario", "British Columbia", "Quebec", "Alberta", "Manitoba", "Saskatchewan", "Nueva Escocia", "Otra"] },
      { id: "tramite", text: "¿Qué trámite necesitas?", options: ["Abrir cuenta bancaria", "Licencia de conducir", "Registrar vehículo / placas", "Seguro médico provincial", "Registrar un negocio", "Obtener SIN (número social)", "Otro trámite"] },
      { id: "urgency", text: "¿Con qué urgencia?", options: ["Esta semana", "Este mes", "Próximos 3 meses", "Solo quiero informarme"] },
    ],
    systemPrompt: `Eres un asistente de información sobre trámites gubernamentales en Canadá para inmigrantes.
REGLAS:
1. Da guías paso a paso basadas en información oficial del gobierno.
2. Incluye documentos requeridos generalmente.
3. Agrega el enlace oficial donde completar el trámite.
4. Menciona el costo aproximado si aplica (indicando que puede variar).
5. Termina con: "⚠️ Los requisitos pueden cambiar. Verifica en el sitio oficial antes de presentarte."
6. Responde en español, práctico y paso a paso.`,
    links: [
      { label: "ServiceOntario", url: "https://www.ontario.ca/page/serviceontario" },
      { label: "Service Canada", url: "https://www.canada.ca/en/employment-social-development/corporate/portfolio/service-canada.html" },
      { label: "SIN – Número Social", url: "https://www.canada.ca/en/employment-social-development/services/sin.html" },
      { label: "Licencia de conducir Ontario", url: "https://www.ontario.ca/page/drivers-licence" },
      { label: "Registrar negocio", url: "https://www.canada.ca/en/services/business/start.html" },
    ],
  },
  refugio: {
    id: "refugio", icon: "⛺", label: "Refugio", color: "#5C3A8B",
    title: "Solicitud de Refugio",
    disclaimer: "AVISO IMPORTANTE: El proceso de refugio tiene consecuencias legales serias y plazos estrictos. Este agente SOLO ofrece información general. Errores en este proceso pueden resultar en deportación. Busca asesoría legal especializada de inmediato con un abogado de refugio certificado o una organización de apoyo gratuita.",
    questions: [
      { id: "location", text: "¿Dónde te encuentras actualmente?", options: ["Ya estoy en Canadá", "En la frontera entre EE.UU. y Canadá", "Aún en mi país de origen", "En tránsito en otro país"] },
      { id: "origin", text: "¿De qué región vienes?", options: ["México", "Centroamérica (Guatemala, Honduras, El Salvador)", "Sudamérica", "El Caribe", "Otro país"] },
      { id: "situation", text: "¿Cuál describe mejor tu situación?", options: ["Persecución por motivos políticos", "Violencia de pandillas o crimen organizado", "Violencia doméstica o familiar", "Persecución por religión o etnia", "Otra situación de riesgo", "Prefiero no especificar"] },
      { id: "status", text: "¿Has solicitado refugio antes en algún país?", options: ["No, es mi primera solicitud", "Sí, en EE.UU.", "Sí, en otro país", "No estoy seguro/a"] },
    ],
    systemPrompt: `Eres un asistente de información sobre el proceso de refugio en Canadá. Este es un tema MUY sensible con consecuencias legales graves.
REGLAS ESTRICTAS:
1. SIEMPRE comienza recordando que deben buscar un abogado o clínica legal gratuita de inmediato.
2. Proporciona SOLO información general del proceso oficial (IRB - Immigration and Refugee Board of Canada).
3. Explica los pasos generales: llegar, declararse, formulario C11, audiencia ante IRB, decisión.
4. Menciona el plazo de 15 días para presentar el Basis of Claim (BOC) form.
5. SIEMPRE incluye organizaciones de ayuda gratuita al final.
6. Termina con: "⚠️ URGENTE: Busca un abogado de refugio o clínica legal gratuita lo antes posible. Los plazos en este proceso son estrictos y los errores pueden ser irreversibles."
7. Responde en español, con empatía, claridad y sin minimizar la gravedad del proceso.
8. Nunca evalúes si el caso "califica" para refugio — eso solo lo puede determinar el IRB.`,
    links: [
      { label: "IRB – Junta de Refugio de Canadá", url: "https://www.irb-cisr.gc.ca/en/Pages/index.aspx" },
      { label: "IRCC – Protección de Refugiados", url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/refugees.html" },
      { label: "Basis of Claim (BOC) Form", url: "https://www.irb-cisr.gc.ca/en/forms/Pages/RpdSpr0201.aspx" },
      { label: "UNHCR Canadá – ACNUR", url: "https://www.unhcr.org/ca/" },
      { label: "Ayuda legal gratuita – Legal Aid", url: "https://www.legalaid.on.ca/services/refugee-law/" },
    ],
  },
};

const LAWYERS = [
  { rank: 1, badge: "🏛️ Oficial", name: "Directorio CICC – RCIC Certificados", desc: "Consejo regulador oficial. Único directorio gubernamental de consultores certificados.", url: "https://college-ic.ca/protecting-the-public/find-an-immigration-consultant", color: "#D4192C" },
  { rank: 2, badge: "⚖️ Oficial", name: "Law Society of Ontario", desc: "Colegio de abogados de Ontario. Busca abogados de inmigración certificados.", url: "https://lso.ca/public-resources/finding-a-lawyer-or-paralegal", color: "#D4192C" },
  { rank: 3, badge: "🇨🇦 Nacional", name: "Canadian Bar Association (CBA)", desc: "Directorio nacional de abogados de inmigración en todas las provincias.", url: "https://www.cba.org/For-The-Public/Find-a-Lawyer", color: "#1A6B3C" },
  { rank: 4, badge: "🆓 Gratuito", name: "Legal Aid Ontario", desc: "Ayuda legal gratuita o bajo costo para quienes califican por ingresos.", url: "https://www.legalaid.on.ca/", color: "#1A6B3C" },
  { rank: 5, badge: "📞 Gobierno", name: "IRCC – Contacto Oficial", desc: "Canal directo del gobierno federal para consultas sobre tu caso de inmigración.", url: "https://www.canada.ca/en/immigration-refugees-citizenship/corporate/contact-ircc.html", color: "#1A3A6B" },
];

const REFUGE_ORGS = [
  { rank: 1, badge: "🆓 Gratuito", name: "Legal Aid Ontario – Refugio", desc: "Representación legal gratuita para solicitantes de refugio en Ontario que califican por ingresos.", url: "https://www.legalaid.on.ca/services/refugee-law/", color: "#5C3A8B", urgent: true },
  { rank: 2, badge: "🏛️ Oficial", name: "IRB – Junta de Inmigración y Refugio", desc: "Tribunal independiente que toma decisiones sobre casos de refugio. Aquí se tramita tu audiencia.", url: "https://www.irb-cisr.gc.ca/en/Pages/index.aspx", color: "#5C3A8B" },
  { rank: 3, badge: "🌍 ACNUR", name: "UNHCR Canadá – Alto Comisionado de la ONU", desc: "Organización de la ONU para refugiados. Ofrece orientación y puede conectarte con apoyo legal.", url: "https://www.unhcr.org/ca/", color: "#1A6B3C" },
  { rank: 4, badge: "⚖️ Oficial", name: "Law Society of Ontario – Abogados de Refugio", desc: "Directorio de abogados especializados en ley de refugio certificados en Ontario.", url: "https://lso.ca/public-resources/finding-a-lawyer-or-paralegal", color: "#1A3A6B" },
  { rank: 5, badge: "🆓 Clínica", name: "Refugee Law Office (Toronto)", desc: "Clínica especializada exclusivamente en refugio. Parte del sistema de Legal Aid Ontario.", url: "https://www.legalaid.on.ca/offices/refugee-law-office/", color: "#1A6B3C" },
];

const MOCK_NEWS = [
  { date: "May 19, 2026", tag: "Migración", title: "IRCC actualiza tiempos de procesamiento para Express Entry", summary: "El gobierno canadiense anunció cambios en los criterios de puntuación CRS para el sistema Express Entry, afectando perfiles de trabajadores calificados.", url: "https://www.canada.ca/en/immigration-refugees-citizenship/news.html" },
  { date: "May 17, 2026", tag: "Finanzas", title: "CRA extiende plazo para declaraciones de impuestos de autónomos", summary: "La Agencia de Ingresos de Canadá confirmó una extensión para trabajadores independientes con ingresos de negocio.", url: "https://www.canada.ca/en/revenue-agency/news.html" },
  { date: "May 15, 2026", tag: "Trámites", title: "Ontario actualiza requisitos para transferencia de licencia extranjera", summary: "ServiceOntario modificó el proceso de reconocimiento de licencias de conducir de México y otros países latinoamericanos.", url: "https://www.ontario.ca/page/exchange-out-province-or-country-drivers-licence" },
  { date: "May 12, 2026", tag: "Migración", title: "Nuevas rutas para trabajadores agrícolas temporales 2026", summary: "Se amplían cupos del programa de trabajadores agrícolas estacionales con énfasis en regiones de Ontario y Quebec.", url: "https://www.canada.ca/en/employment-social-development/services/foreign-workers/agricultural.html" },
  { date: "May 10, 2026", tag: "Finanzas", title: "Aumento en el monto del beneficio CCB para familias 2026", summary: "El Canada Child Benefit incrementa montos para familias con ingresos medios-bajos, reflejo del ajuste por inflación.", url: "https://www.canada.ca/en/revenue-agency/services/child-family-benefits/canada-child-benefit-overview.html" },
  { date: "May 8, 2026", tag: "Refugio", title: "IRB reduce tiempos de espera para audiencias de refugio en Ontario", summary: "La Junta de Inmigración y Refugio anunció medidas para acelerar el procesamiento de solicitudes acumuladas, especialmente en Toronto y Ottawa.", url: "https://www.irb-cisr.gc.ca/en/news/Pages/index.aspx" },
];

/* ─── SUB-COMPONENTS ─────────────────────────────────────── */

function TypingDots({ color }) {
  return (
    <div style={{ display: "flex", gap: 5, padding: "10px 14px", alignItems: "center" }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: color || "#aaa", display: "inline-block", animation: `typebounce 1.2s ${i * 0.2}s infinite ease-in-out` }} />
      ))}
    </div>
  );
}

function Disclaimer({ text }) {
  return (
    <div style={{ background: "rgba(212,25,44,0.06)", border: "1px solid rgba(212,25,44,0.2)", borderLeft: "4px solid #D4192C", borderRadius: "0 8px 8px 0", padding: "12px 16px", marginBottom: 18, fontSize: 13, color: "#5a2228", fontFamily: "'Spectral', serif", lineHeight: 1.6 }}>
      ⚠️ <strong>Aviso Legal:</strong> {text}
    </div>
  );
}

function QuizFlow({ section, onComplete }) {
  const sec = SECTIONS[section];
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selected, setSelected] = useState(null);

  const advance = () => {
    if (!selected) return;
    const newAnswers = { ...answers, [sec.questions[step].id]: selected };
    if (step < sec.questions.length - 1) {
      setAnswers(newAnswers);
      setSelected(null);
      setStep(step + 1);
    } else {
      onComplete(newAnswers);
    }
  };

  const q = sec.questions[step];
  const progress = ((step) / sec.questions.length) * 100;

  return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #ececec", padding: 28, boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <span style={{ fontFamily: "'Spectral', serif", fontSize: 13, color: "#999" }}>Paso {step + 1} de {sec.questions.length}</span>
        <div style={{ background: "#f5f5f5", borderRadius: 20, height: 6, width: "60%", overflow: "hidden" }}>
          <div style={{ height: "100%", borderRadius: 20, background: sec.color, width: `${progress}%`, transition: "width 0.5s cubic-bezier(.4,0,.2,1)" }} />
        </div>
      </div>
      <p style={{ fontFamily: "'Spectral', serif", fontSize: 17, color: "#1a1a1a", marginBottom: 20, lineHeight: 1.5, fontWeight: 600 }}>{q.text}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
        {q.options.map(opt => (
          <button key={opt} onClick={() => setSelected(opt)} style={{
            textAlign: "left", padding: "11px 16px", border: `2px solid ${selected === opt ? sec.color : "#e8e8e8"}`,
            borderRadius: 10, background: selected === opt ? `${sec.color}0f` : "#fafafa",
            color: selected === opt ? sec.color : "#444", fontFamily: "'DM Sans', sans-serif",
            fontSize: 14, cursor: "pointer", fontWeight: selected === opt ? 700 : 400,
            transition: "all 0.15s",
          }}>
            {selected === opt ? "● " : "○ "}{opt}
          </button>
        ))}
      </div>
      <button onClick={advance} disabled={!selected} style={{
        width: "100%", padding: "13px", border: "none", borderRadius: 10,
        background: selected ? sec.color : "#e0e0e0", color: "#fff",
        fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 15,
        cursor: selected ? "pointer" : "not-allowed", transition: "background 0.2s",
      }}>
        {step < sec.questions.length - 1 ? "Siguiente →" : "Ver mi guía personalizada →"}
      </button>
    </div>
  );
}

function ChatArea({ section, answers }) {
  const sec = SECTIONS[section];
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);
  const initialized = useRef(false);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      const ctx = Object.entries(answers).map(([k, v]) => `${k}: ${v}`).join(", ");
      callAPI(`Hola. Mi perfil: ${ctx}. Dame una guía clara sobre mis próximos pasos y recursos clave.`);
    }
  }, []);

  const callAPI = async (text) => {
    const userMsg = { role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const ctx = Object.entries(answers).map(([k, v]) => `${k}: ${v}`).join(", ");
      const history = [...messages, userMsg].slice(-10).map(m => ({ role: m.role, content: m.content }));
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `${sec.systemPrompt}\n\nContexto del usuario: ${ctx}`,
          messages: history,
          tools: [{ type: "web_search_20250305", name: "web_search" }],
        }),
      });
      const data = await res.json();
      let text = "";
      if (data.content) for (const b of data.content) if (b.type === "text") text += b.text;
      if (!text) text = "No pude obtener respuesta. Intenta de nuevo.";
      setMessages(prev => [...prev, { role: "assistant", content: text }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Error de conexión. Por favor intenta de nuevo." }]);
    }
    setLoading(false);
  };

  return (
    <div>
      <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #ececec", minHeight: 320, maxHeight: 420, overflowY: "auto", padding: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.06)", marginBottom: 12 }}>
        {messages.length === 0 && !loading && (
          <div style={{ textAlign: "center", padding: "50px 20px", color: "#ccc" }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>{sec.icon}</div>
            <p style={{ fontFamily: "'Spectral', serif", fontSize: 15 }}>Cargando tu guía personalizada…</p>
          </div>
        )}
        {messages.map((m, i) => {
          const isUser = m.role === "user";
          return (
            <div key={i} style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", marginBottom: 14, animation: "fadein 0.3s ease" }}>
              {!isUser && <div style={{ width: 30, height: 30, borderRadius: "50%", background: sec.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, marginRight: 8, flexShrink: 0 }}>{sec.icon}</div>}
              <div style={{ maxWidth: "82%", padding: "12px 16px", background: isUser ? sec.color : "#f7f7f7", color: isUser ? "#fff" : "#222", borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px", fontSize: 14, lineHeight: 1.65, fontFamily: "'DM Sans', sans-serif", whiteSpace: "pre-wrap", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                {m.content}
              </div>
            </div>
          );
        })}
        {loading && (
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: sec.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, marginRight: 8 }}>{sec.icon}</div>
            <div style={{ background: "#f7f7f7", borderRadius: "18px 18px 18px 4px" }}><TypingDots color={sec.color} /></div>
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && input.trim() && !loading && callAPI(input.trim())}
          placeholder="Escribe tu pregunta…" disabled={loading}
          style={{ flex: 1, padding: "12px 16px", border: `2px solid ${input ? sec.color : "#e0e0e0"}`, borderRadius: 10, fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: "none", transition: "border-color 0.2s", background: loading ? "#f9f9f9" : "#fff" }} />
        <button onClick={() => input.trim() && !loading && callAPI(input.trim())} disabled={loading || !input.trim()} style={{ background: input.trim() && !loading ? sec.color : "#e0e0e0", color: "#fff", border: "none", borderRadius: 10, padding: "12px 18px", cursor: input.trim() && !loading ? "pointer" : "not-allowed", fontSize: 18, transition: "background 0.2s" }}>➤</button>
      </div>
    </div>
  );
}

function LinksPanel({ section }) {
  const sec = SECTIONS[section];
  return (
    <div>
      <p style={{ fontSize: 12, color: "#aaa", fontFamily: "'DM Sans', sans-serif", marginBottom: 14 }}>Solo fuentes .canada.ca y .gc.ca — verificadas</p>
      {sec.links.map((l, i) => (
        <a key={i} href={l.url} target="_blank" rel="noopener noreferrer"
          style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 16px", background: "#fff", border: "1px solid #ececec", borderRadius: 10, textDecoration: "none", marginBottom: 8, transition: "box-shadow 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.1)"}
          onMouseLeave={e => e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)"}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: `${sec.color}14`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🇨🇦</div>
          <div>
            <div style={{ fontFamily: "'Spectral', serif", fontWeight: 700, fontSize: 14, color: sec.color }}>{l.label}</div>
            <div style={{ fontSize: 11, color: "#bbb", fontFamily: "'DM Sans', sans-serif", marginTop: 2 }}>canada.ca · Fuente oficial</div>
          </div>
          <span style={{ marginLeft: "auto", color: "#ccc" }}>→</span>
        </a>
      ))}
    </div>
  );
}

function OrgCard({ l }) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "14px 16px", background: l.urgent ? "#faf5ff" : "#fff", border: `1px solid ${l.urgent ? "#c4a0e8" : "#ececec"}`, borderRadius: 12, marginBottom: 8, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
      <div style={{ width: 36, height: 36, borderRadius: "50%", background: l.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Spectral', serif", fontWeight: 700, fontSize: 15, flexShrink: 0 }}>#{l.rank}</div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4, flexWrap: "wrap" }}>
          <span style={{ fontFamily: "'Spectral', serif", fontWeight: 700, fontSize: 14, color: "#1a1a1a" }}>{l.name}</span>
          <span style={{ fontSize: 11, background: "#f0f0f0", padding: "2px 8px", borderRadius: 20, color: "#666" }}>{l.badge}</span>
          {l.urgent && <span style={{ fontSize: 11, background: "#5C3A8B", color: "#fff", padding: "2px 8px", borderRadius: 20, fontWeight: 700 }}>⚡ Contactar primero</span>}
        </div>
        <p style={{ fontSize: 13, color: "#888", fontFamily: "'DM Sans', sans-serif", margin: "0 0 8px", lineHeight: 1.4 }}>{l.desc}</p>
        <a href={l.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: l.color, fontFamily: "'DM Sans', sans-serif", fontWeight: 700, textDecoration: "none", background: `${l.color}12`, padding: "4px 10px", borderRadius: 6, display: "inline-block" }}>🔗 Ir al directorio →</a>
      </div>
    </div>
  );
}

function LawyersPanel({ section }) {
  const isRefugio = section === "refugio";
  const list = isRefugio ? REFUGE_ORGS : LAWYERS;
  return (
    <div>
      {isRefugio && (
        <div style={{ background: "#2D1554", border: "1px solid #5C3A8B", borderRadius: 12, padding: "14px 16px", marginBottom: 16, fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#e2d4f5", lineHeight: 1.6 }}>
          🚨 <strong style={{ color: "#fff" }}>URGENTE:</strong> Si acabas de llegar o estás en la frontera, <strong style={{ color: "#f0c0ff" }}>contacta Legal Aid de inmediato</strong>. Tienes <strong style={{ color: "#f0c0ff" }}>15 días</strong> para presentar el formulario Basis of Claim (BOC).
        </div>
      )}
      <div style={{ background: "#fff8f0", border: "1px solid #f0c070", borderRadius: 10, padding: "12px 14px", marginBottom: 16, fontSize: 13, color: "#7a5000", fontFamily: "'DM Sans', sans-serif", lineHeight: 1.5 }}>
        ⚠️ Este agente <strong>no avala ni recomienda</strong> a ningún profesional individual. Los directorios listados son <strong>fuentes gubernamentales oficiales</strong>.
      </div>
      {list.map(l => <OrgCard key={l.rank} l={l} />)}
    </div>
  );
}

function NewsPanel() {
  return (
    <div>
      {MOCK_NEWS.map((n, i) => (
        <a key={i} href={n.url} target="_blank" rel="noopener noreferrer" style={{ display: "block", textDecoration: "none", marginBottom: 12 }}>
          <div style={{ background: "#fff", border: "1px solid #ececec", borderRadius: 12, padding: "14px 18px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", transition: "box-shadow 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.1)"}
            onMouseLeave={e => e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.05)"}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 7 }}>
              <span style={{ fontSize: 11, padding: "3px 9px", borderRadius: 20, background: n.tag === "Migración" ? "#D4192C18" : n.tag === "Finanzas" ? "#1A6B3C18" : n.tag === "Refugio" ? "#5C3A8B18" : "#1A3A6B18", color: n.tag === "Migración" ? "#D4192C" : n.tag === "Finanzas" ? "#1A6B3C" : n.tag === "Refugio" ? "#5C3A8B" : "#1A3A6B", fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>{n.tag}</span>
              <span style={{ fontSize: 11, color: "#bbb", fontFamily: "'DM Sans', sans-serif" }}>{n.date}</span>
            </div>
            <h4 style={{ fontFamily: "'Spectral', serif", fontSize: 15, color: "#1a1a1a", margin: "0 0 6px", lineHeight: 1.4 }}>{n.title}</h4>
            <p style={{ fontSize: 13, color: "#888", fontFamily: "'DM Sans', sans-serif", margin: 0, lineHeight: 1.5 }}>{n.summary}</p>
          </div>
        </a>
      ))}
      <div style={{ background: "#f8f8f8", borderRadius: 10, padding: "12px 14px", fontSize: 12, color: "#aaa", fontFamily: "'DM Sans', sans-serif", textAlign: "center" }}>
        📰 Noticias obtenidas de fuentes oficiales del gobierno canadiense · Actualización semanal
      </div>
    </div>
  );
}

function SubscribeModal({ onClose, onSubscribe }) {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState("form"); // form | confirm | success
  const [agreed, setAgreed] = useState(false);

  const handleSubmit = () => {
    if (!email.includes("@") || !agreed) return;
    setStep("confirm");
  };

  const handleConfirm = () => {
    setStep("success");
    setTimeout(() => { onSubscribe(email); onClose(); }, 2500);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16, backdropFilter: "blur(4px)" }}>
      <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 440, padding: 32, boxShadow: "0 20px 60px rgba(0,0,0,0.25)", animation: "fadein 0.25s ease" }}>
        {step === "form" && (
          <>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>📬</div>
              <h2 style={{ fontFamily: "'Spectral', serif", fontSize: 22, color: "#1a1a1a", margin: "0 0 6px" }}>Boletín Semanal</h2>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#888", margin: 0 }}>Recibe las últimas actualizaciones de migración, finanzas y trámites directamente en tu correo.</p>
            </div>
            <div style={{ background: "linear-gradient(135deg, #D4192C08, #1A6B3C08)", border: "1px solid #e8e8e8", borderRadius: 12, padding: "14px 16px", marginBottom: 20 }}>
              <div style={{ fontFamily: "'Spectral', serif", fontWeight: 700, fontSize: 15, color: "#1a1a1a", marginBottom: 8 }}>✅ Lo que incluye:</div>
              {["Noticias migratorias de IRCC", "Cambios en impuestos y beneficios CRA", "Nuevos trámites y fechas clave", "Alertas de cambios de política"].map((item, i) => (
                <div key={i} style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#555", marginBottom: 4 }}>• {item}</div>
              ))}
            </div>
            <div style={{ background: "#FFF8DC", border: "1px solid #F0C040", borderRadius: 10, padding: "12px 14px", marginBottom: 20, fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#7a6000" }}>
              🎁 <strong>{TRIAL_DAYS} días gratis</strong> — sin cargo. Después, <strong>${PRICE} CAD/mes</strong>. Cancela antes del día 7 y no pagas nada.
            </div>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="tucorreo@email.com" type="email"
              style={{ width: "100%", padding: "12px 14px", border: "2px solid #e0e0e0", borderRadius: 10, fontSize: 14, fontFamily: "'DM Sans', sans-serif", outline: "none", marginBottom: 14, boxSizing: "border-box", transition: "border-color 0.2s" }}
              onFocus={e => e.target.style.borderColor = "#D4192C"} onBlur={e => e.target.style.borderColor = "#e0e0e0"} />
            <label style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 20, cursor: "pointer" }}>
              <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ marginTop: 2, flexShrink: 0 }} />
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#888", lineHeight: 1.5 }}>
                Acepto que comenzará una prueba gratuita de 7 días. Al cabo, se cobrará <strong>${PRICE} CAD/mes</strong> automáticamente. Puedo cancelar en cualquier momento antes del cobro. Este servicio es informativo y <strong>no constituye asesoría legal ni financiera</strong>.
              </span>
            </label>
            <button onClick={handleSubmit} disabled={!email.includes("@") || !agreed} style={{ width: "100%", padding: 14, background: email.includes("@") && agreed ? "#D4192C" : "#e0e0e0", color: "#fff", border: "none", borderRadius: 10, fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 15, cursor: email.includes("@") && agreed ? "pointer" : "not-allowed", transition: "background 0.2s" }}>
              Iniciar prueba gratuita de {TRIAL_DAYS} días →
            </button>
            <button onClick={onClose} style={{ width: "100%", marginTop: 10, padding: 10, background: "none", border: "none", color: "#bbb", fontFamily: "'DM Sans', sans-serif", fontSize: 13, cursor: "pointer" }}>Cancelar</button>
          </>
        )}
        {step === "confirm" && (
          <>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <div style={{ fontSize: 40, marginBottom: 8 }}>📋</div>
              <h2 style={{ fontFamily: "'Spectral', serif", fontSize: 20, color: "#1a1a1a", margin: "0 0 8px" }}>Confirma tu suscripción</h2>
            </div>
            <div style={{ background: "#f9f9f9", borderRadius: 12, padding: "16px 18px", marginBottom: 20 }}>
              {[["Correo", email], ["Prueba gratuita", `${TRIAL_DAYS} días`], ["Precio después", `$${PRICE} CAD / mes`], ["Cancelación", "Gratuita antes del día 7"]].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #eee", fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}>
                  <span style={{ color: "#888" }}>{k}</span>
                  <span style={{ fontWeight: 700, color: "#1a1a1a" }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ background: "#FFF3CD", border: "1px solid #FFC107", borderRadius: 10, padding: "12px 14px", marginBottom: 20, fontSize: 13, color: "#856404", fontFamily: "'DM Sans', sans-serif" }}>
              ⚠️ Si no cancelas antes del día 7, se cargará automáticamente ${PRICE} CAD a tu método de pago.
            </div>
            <button onClick={handleConfirm} style={{ width: "100%", padding: 14, background: "#D4192C", color: "#fff", border: "none", borderRadius: 10, fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
              ✅ Confirmar y comenzar prueba gratis
            </button>
            <button onClick={() => setStep("form")} style={{ width: "100%", marginTop: 10, padding: 10, background: "none", border: "none", color: "#bbb", fontFamily: "'DM Sans', sans-serif", fontSize: 13, cursor: "pointer" }}>← Volver</button>
          </>
        )}
        {step === "success" && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 50, marginBottom: 12, animation: "pulse 0.5s ease" }}>🎉</div>
            <h2 style={{ fontFamily: "'Spectral', serif", fontSize: 22, color: "#1A6B3C", marginBottom: 8 }}>¡Suscripción activa!</h2>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#888", lineHeight: 1.6 }}>
              Tu prueba de <strong>{TRIAL_DAYS} días</strong> comienza ahora.<br />
              Recibirás tu primer boletín en <strong>{email}</strong>.<br />
              Recuerda: cancela antes del día 7 si no deseas continuar.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── SECTION VIEW ───────────────────────────────────────── */
function SectionView({ section }) {
  const sec = SECTIONS[section];
  const [phase, setPhase] = useState("quiz");
  const [answers, setAnswers] = useState({});
  const [innerTab, setInnerTab] = useState("chat");

  const handleComplete = (ans) => { setAnswers(ans); setPhase("chat"); setInnerTab("chat"); };
  const handleReset = () => { setPhase("quiz"); setAnswers({}); setInnerTab("chat"); };

  const tabs = [
    { id: "chat", label: "💬 Consulta" },
    { id: "links", label: "🔗 Recursos" },
    { id: "lawyers", label: "👨‍⚖️ Consultores" },
  ];

  return (
    <div>
      <Disclaimer text={sec.disclaimer} />
      {phase === "chat" && (
        <div style={{ display: "flex", background: "#f4f4f4", borderRadius: 12, padding: 4, gap: 2, marginBottom: 18 }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setInnerTab(t.id)} style={{ flex: 1, padding: "9px 6px", border: "none", borderRadius: 9, cursor: "pointer", background: innerTab === t.id ? "#fff" : "transparent", color: innerTab === t.id ? sec.color : "#888", fontFamily: "'DM Sans', sans-serif", fontWeight: innerTab === t.id ? 700 : 400, fontSize: 13, boxShadow: innerTab === t.id ? "0 2px 8px rgba(0,0,0,0.08)" : "none", transition: "all 0.2s" }}>
              {t.label}
            </button>
          ))}
        </div>
      )}
      {phase === "quiz" && <QuizFlow section={section} onComplete={handleComplete} />}
      {phase === "chat" && (
        <>
          {innerTab === "chat" && (
            <div>
              <ChatArea key={section + JSON.stringify(answers)} section={section} answers={answers} />
              <button onClick={handleReset} style={{ marginTop: 10, background: "none", border: "none", color: "#bbb", cursor: "pointer", fontSize: 12, fontFamily: "'DM Sans', sans-serif", textDecoration: "underline" }}>↺ Reiniciar cuestionario</button>
            </div>
          )}
          {innerTab === "links" && <LinksPanel section={section} />}
          {innerTab === "lawyers" && <LawyersPanel section={section} />}
        </>
      )}
    </div>
  );
}

/* ─── MAIN APP ───────────────────────────────────────────── */
export default function App() {
  const [activeTab, setActiveTab] = useState("migration");
  const [showSubscribe, setShowSubscribe] = useState(false);
  const [subscriber, setSubscriber] = useState(null);

  const mainTabs = [
    ...Object.values(SECTIONS).map(s => ({ id: s.id, label: s.icon + " " + s.label, color: s.color })),
    { id: "news", label: "📰 Noticias", color: "#444" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#F6F5F0", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Spectral:ital,wght@0,400;0,600;0,700;1,400&family=DM+Sans:wght@300;400;500;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        @keyframes fadein{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes typebounce{0%,80%,100%{transform:scale(0)}40%{transform:scale(1)}}
        @keyframes pulse{0%{transform:scale(0.8)}50%{transform:scale(1.15)}100%{transform:scale(1)}}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:#f0f0f0}::-webkit-scrollbar-thumb{background:#ccc;border-radius:10px}
      `}</style>

      {showSubscribe && <SubscribeModal onClose={() => setShowSubscribe(false)} onSubscribe={(email) => setSubscriber(email)} />}

      {/* HERO HEADER */}
      <div style={{ background: "#0D0D0D", padding: "28px 20px 0", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -30, right: -30, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(212,25,44,0.3) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: 0, left: "20%", width: 160, height: 160, borderRadius: "50%", background: "radial-gradient(circle, rgba(26,107,60,0.2) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 760, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 28 }}>🍁</span>
                <span style={{ fontFamily: "'Spectral', serif", color: "#fff", fontSize: "clamp(18px,5vw,26px)", fontWeight: 700, letterSpacing: "-0.5px" }}>Agente Virtual Canadá</span>
              </div>
              <p style={{ fontFamily: "'DM Sans', sans-serif", color: "rgba(255,255,255,0.5)", fontSize: 13, lineHeight: 1.5 }}>
                Información oficial · Migración · Finanzas · Trámites · Refugio
              </p>
              <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                <span style={{ fontSize: 11, background: "rgba(26,107,60,0.3)", color: "#4ade80", padding: "3px 10px", borderRadius: 20, fontFamily: "'DM Sans', sans-serif" }}>● Actualizado semanalmente</span>
                <span style={{ fontSize: 11, background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)", padding: "3px 10px", borderRadius: 20, fontFamily: "'DM Sans', sans-serif" }}>Solo fuentes .canada.ca</span>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              {subscriber ? (
                <div style={{ background: "rgba(26,107,60,0.25)", border: "1px solid rgba(74,222,128,0.3)", borderRadius: 12, padding: "10px 14px", textAlign: "center" }}>
                  <div style={{ fontSize: 18, marginBottom: 2 }}>📬</div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#4ade80", fontWeight: 700 }}>Suscrito</div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>Boletín activo</div>
                </div>
              ) : (
                <button onClick={() => setShowSubscribe(true)} style={{ background: "#D4192C", color: "#fff", border: "none", borderRadius: 12, padding: "12px 18px", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer", transition: "transform 0.15s", lineHeight: 1.3 }}
                  onMouseEnter={e => e.currentTarget.style.transform = "scale(1.03)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
                  📬 Boletín semanal<br /><span style={{ fontSize: 11, opacity: 0.85, fontWeight: 400 }}>7 días gratis · $29/mes</span>
                </button>
              )}
            </div>
          </div>

          {/* MAIN TABS */}
          <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            {mainTabs.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                flex: 1, padding: "13px 4px", border: "none", background: "transparent", cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif", fontSize: "clamp(10px,2vw,13px)",
                color: activeTab === t.id ? "#fff" : "rgba(255,255,255,0.4)",
                fontWeight: activeTab === t.id ? 700 : 400,
                borderBottom: activeTab === t.id ? `2px solid ${t.color}` : "2px solid transparent",
                transition: "all 0.2s", marginBottom: -1,
              }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "24px 16px 40px" }}>
        {activeTab !== "news" && (
          <div style={{ animation: "fadein 0.3s ease" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <span style={{ fontSize: 26 }}>{SECTIONS[activeTab].icon}</span>
              <div>
                <h2 style={{ fontFamily: "'Spectral', serif", fontSize: 20, color: "#1a1a1a", marginBottom: 2 }}>{SECTIONS[activeTab].title}</h2>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#aaa" }}>Información general basada en fuentes oficiales del gobierno de Canadá</p>
              </div>
            </div>
            <SectionView key={activeTab} section={activeTab} />
          </div>
        )}

        {activeTab === "news" && (
          <div style={{ animation: "fadein 0.3s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                <h2 style={{ fontFamily: "'Spectral', serif", fontSize: 20, color: "#1a1a1a", marginBottom: 4 }}>📰 Últimas Noticias</h2>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#aaa" }}>Fuentes oficiales del gobierno canadiense · Actualización semanal</p>
              </div>
              {!subscriber && (
                <button onClick={() => setShowSubscribe(true)} style={{ background: "#1a1a1a", color: "#fff", border: "none", borderRadius: 10, padding: "10px 14px", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 12, cursor: "pointer", lineHeight: 1.4, textAlign: "center" }}>
                  📬 Recibir por correo<br /><span style={{ fontWeight: 400, fontSize: 11, opacity: 0.7 }}>7 días gratis</span>
                </button>
              )}
            </div>
            {subscriber && (
              <div style={{ background: "#F0FFF4", border: "1px solid #9AE6B4", borderRadius: 12, padding: "12px 16px", marginBottom: 18, fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: "#276749" }}>
                ✅ Boletín activo para <strong>{subscriber}</strong> — recibirás estas noticias cada semana. Cancela cuando quieras antes del día 7.
              </div>
            )}
            <div style={{ background: "#fff8e8", border: "1px solid #f0d080", borderRadius: 10, padding: "12px 14px", marginBottom: 18, fontSize: 13, color: "#7a6000", fontFamily: "'DM Sans', sans-serif" }}>
              ⚠️ Las noticias son de carácter informativo general. No constituyen asesoría legal, migratoria ni financiera. Verifica siempre en los sitios oficiales de Canadá.
            </div>
            <NewsPanel />
          </div>
        )}

        {/* FOOTER */}
        <div style={{ marginTop: 40, paddingTop: 24, borderTop: "1px solid #e8e8e8", textAlign: "center" }}>
          <div style={{ fontFamily: "'Spectral', serif", fontSize: 14, color: "#999", marginBottom: 6 }}>🍁 Agente Virtual Canadá</div>
          <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#ccc", lineHeight: 1.8 }}>
            Solo información general. No asesoría legal, migratoria ni financiera.<br />
            Para casos específicos: <strong>IRCC</strong> · <strong>CRA</strong> · <strong>Service Canada</strong> · <strong>RCIC/CICC</strong><br />
            Suscripción: {TRIAL_DAYS} días gratis, luego ${PRICE} CAD/mes. Cancela en cualquier momento.
          </div>
        </div>
      </div>
    </div>
  );
}
