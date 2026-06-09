import { Link } from "react-router-dom";
import {
  PawPrint, CalendarCheck, Store, Scissors, ShieldCheck,
  ArrowRight, Zap, Star, Quote,
} from "lucide-react";

const TEAL   = "#0D7377";
const TDARK  = "#085C60";
const AMBER  = "#F59E0B";
const MINT   = "#10B981";
const CORAL  = "#F97316";
const COAL   = "#1E293B";
const BG     = "#F8FAFC";
const BORD   = "#E2E8F0";
const MUTED  = "#64748B";

const features = [
  { icon: PawPrint,      title: "Gestão de Pets",      desc: "Cadastre e acompanhe o histórico completo de saúde, vacinas e tags de cada animal.",  color: TEAL,  bg: "#D4F0F0" },
  { icon: CalendarCheck, title: "Agendamentos",         desc: "Visualize e gerencie atendimentos em tempo real com status e histórico por pet.",      color: MINT,  bg: "#D1FAE5" },
  { icon: Store,         title: "Múltiplas Unidades",   desc: "Controle todas as suas lojas em um único painel com ranking de performance.",          color: CORAL, bg: "#FEE2CC" },
  { icon: Scissors,      title: "Catálogo de Serviços", desc: "Organize banho, tosa, consultas e mais com precificação por categoria.",              color: TDARK, bg: "#CCEFEF" },
  { icon: ShieldCheck,   title: "Controle de Acesso",   desc: "Perfis separados para clientes e funcionários com permissões granulares.",             color: MINT,  bg: "#D1FAE5" },
  { icon: Zap,           title: "Pronto em minutos",    desc: "Interface projetada para o dia a dia — sem treinamento, sem curva de aprendizado.",    color: AMBER, bg: "#FEF3C7" },
];

const testimonials = [
  {
    name: "Ana Claudia Santos",
    role: "Dona — PetAmigo Banho & Tosa",
    city: "São Paulo, SP",
    quote: "Antes eu controlava tudo em planilha. Hoje vejo os agendamentos do dia assim que chego, sem estresse. O retorno de clientes aumentou 30% em 4 meses.",
    initials: "AC",
    avBg: "#D4F0F0",
    avColor: TDARK,
  },
  {
    name: "Carlos Henrique Lima",
    role: "Gestor — Rede PetCare (3 unidades)",
    city: "Curitiba, PR",
    quote: "Gerencio 3 lojas sem precisar estar presente em todas. O ranking de performance por unidade mudou completamente como eu tomo decisões.",
    initials: "CH",
    avBg: "#D1FAE5",
    avColor: "#065F46",
  },
  {
    name: "Mariana Ferreira",
    role: "Veterinária — Clínica PetVida",
    city: "Belo Horizonte, MG",
    quote: "O histórico de saúde por pet salvou situações sérias. Com um clique sei tudo sobre alergias e medicamentos antes de qualquer atendimento.",
    initials: "MF",
    avBg: "#FEF3C7",
    avColor: "#92400E",
  },
];

const stats = [
  { num: "500+", label: "Petshops ativos",  sub: "em todo o Brasil" },
  { num: "12k",  label: "Pets gerenciados", sub: "e crescendo"       },
  { num: "98%",  label: "Satisfação",       sub: "NPS de clientes"   },
  { num: "2min", label: "Para começar",     sub: "sem treinamento"   },
];

function HeroGeo() {
  return (
    <div className="pointer-events-none absolute inset-0 select-none overflow-hidden">
      <div className="absolute right-10 top-10 h-40 w-40 rounded-full"
        style={{ border: "1.5px solid rgba(255,255,255,0.10)" }} />
      <div className="absolute right-24 top-20 h-64 w-64 rounded-full"
        style={{ border: "1px solid rgba(255,255,255,0.06)" }} />
      <div className="absolute -right-16 -top-16 h-80 w-80 rounded-full"
        style={{ background: "rgba(255,255,255,0.04)" }} />
      <div className="absolute bottom-8 left-10 h-24 w-24 rounded-full"
        style={{ border: "1.5px solid rgba(255,255,255,0.08)" }} />
      <div className="absolute bottom-16 left-32 h-10 w-10 rounded-full"
        style={{ background: "rgba(255,255,255,0.06)" }} />
      <div className="absolute top-1/2 right-1/3 h-5 w-5 rounded-full"
        style={{ background: "rgba(255,255,255,0.08)" }} />
    </div>
  );
}

export default function Home() {
  return (
    <div style={{ background: BG, fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden px-6 pb-24 pt-20 text-white" style={{ background: TEAL }}>
        <HeroGeo />
        <div className="relative mx-auto max-w-2xl text-center">
          <div
            className="mb-6 inline-flex items-center gap-2 px-4 py-1.5"
            style={{
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.20)",
              borderRadius: "999px",
            }}
          >
            <PawPrint size={13} style={{ color: AMBER }} />
            <span className="text-xs font-semibold uppercase tracking-widest">Pet Club</span>
          </div>

          <h1 className="text-4xl font-black leading-tight sm:text-5xl" style={{ letterSpacing: "-0.02em" }}>
            Chega de planilha<br />
            <span style={{ color: AMBER }}>para seu petshop.</span>
          </h1>
          <p className="mt-5 text-base mx-auto max-w-lg" style={{ color: "rgba(255,255,255,0.78)", lineHeight: 1.75 }}>
            Pets, agendamentos, equipe e lojas — tudo em um único painel.
            Você foca no que importa, a gente cuida da gestão.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-8">
            {[
              { num: "500+", label: "petshops ativos" },
              { num: "12k",  label: "pets gerenciados" },
              { num: "98%",  label: "satisfação" },
            ].map((s) => (
              <div key={s.label} style={{ borderLeft: `3px solid ${AMBER}`, paddingLeft: "12px", textAlign: "left" }}>
                <div className="text-2xl font-black" style={{ color: AMBER }}>{s.num}</div>
                <div className="mt-0.5 text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/register"
              className="flex items-center justify-center gap-2 px-8 py-3 text-sm font-bold transition hover:opacity-90"
              style={{ background: CORAL, color: "#fff", borderRadius: "6px", boxShadow: "0 4px 20px rgba(249,115,22,0.35)" }}
            >
              <ArrowRight size={15} /> Criar conta grátis
            </Link>
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 px-8 py-3 text-sm font-semibold transition hover:bg-white/10"
              style={{ border: "1.5px solid rgba(255,255,255,0.35)", color: "#fff", borderRadius: "6px" }}
            >
              Entrar na conta
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stripe de confiança ── */}
      <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3 px-6 py-4"
        style={{ background: TDARK }}>
        {["Sem cartão de crédito", "Cancele quando quiser", "Suporte incluído", "Dados seguros", "Configuração em 2 min"].map((item) => (
          <div key={item} className="flex items-center gap-2 text-xs font-medium" style={{ color: "rgba(255,255,255,0.78)" }}>
            <span className="flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold"
              style={{ background: MINT, color: "#fff" }}>✓</span>
            {item}
          </div>
        ))}
      </div>

      {/* ── Features ── */}
      <section className="px-6 py-16" style={{ background: BG }}>
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <span className="mb-2 inline-block text-xs font-bold uppercase tracking-widest" style={{ color: TEAL }}>
              Plataforma completa
            </span>
            <h2 className="text-2xl font-extrabold" style={{ color: COAL }}>Tudo que você precisa</h2>
            <p className="mt-2 text-sm" style={{ color: MUTED }}>
              Uma plataforma para petshops de todos os tamanhos. Da primeira tosa ao controle de múltiplas unidades.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="relative overflow-hidden bg-white transition hover:-translate-y-1"
                style={{
                  border: `1px solid ${BORD}`,
                  borderRadius: "10px",
                  padding: "24px",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 16px rgba(13,115,119,0.12)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)";
                }}
              >
                <div className="absolute left-0 right-0 top-0 h-[3px]" style={{ background: f.color }} />
                <div className="mb-4 flex h-11 w-11 items-center justify-center"
                  style={{ background: f.bg, borderRadius: "10px" }}>
                  <f.icon size={20} style={{ color: f.color }} />
                </div>
                <h3 className="font-bold" style={{ color: COAL }}>{f.title}</h3>
                <p className="mt-1.5 text-sm" style={{ color: MUTED, lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Números ── */}
      <section className="relative overflow-hidden px-6 py-16 text-white" style={{ background: COAL }}>
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-10 top-6 h-32 w-32 rounded-full"
            style={{ border: "1px solid rgba(255,255,255,0.06)" }} />
          <div className="absolute left-6 bottom-4 h-20 w-20 rounded-full"
            style={{ border: "1px solid rgba(255,255,255,0.05)" }} />
          <div className="absolute left-1/2 top-0 h-48 w-48 -translate-x-1/2 rounded-full"
            style={{ background: "rgba(13,115,119,0.15)" }} />
        </div>
        <div className="relative mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: AMBER }}>
              Resultados reais
            </span>
          </div>
          <div className="grid grid-cols-2 gap-0 sm:grid-cols-4">
            {stats.map((s, i) => (
              <div
                key={s.label}
                className="px-4 py-6 text-center"
                style={{ borderRight: i < stats.length - 1 ? "1px solid rgba(255,255,255,0.08)" : "none" }}
              >
                <div className="text-4xl font-black leading-none" style={{ color: AMBER }}>{s.num}</div>
                <div className="mt-2 text-sm font-medium" style={{ color: "rgba(255,255,255,0.85)" }}>{s.label}</div>
                <div className="mt-0.5 text-xs" style={{ color: "rgba(255,255,255,0.40)" }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Depoimentos ── */}
      <section className="px-6 py-16" style={{ background: "#fff" }}>
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <span className="mb-2 inline-block text-xs font-bold uppercase tracking-widest" style={{ color: TEAL }}>
              Depoimentos
            </span>
            <h2 className="text-2xl font-extrabold" style={{ color: COAL }}>Quem já usa, aprova</h2>
            <p className="mt-2 text-sm" style={{ color: MUTED }}>Donos de petshop reais, resultados reais.</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="flex flex-col gap-4 transition hover:-translate-y-0.5 hover:shadow-md"
                style={{
                  background: BG,
                  border: `1px solid ${BORD}`,
                  borderTop: `3px solid ${TEAL}`,
                  borderRadius: "10px",
                  padding: "24px",
                }}
              >
                <div className="flex items-center justify-between">
                  <Quote size={22} style={{ color: "#CBD5E1" }} />
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map((s) => (
                      <Star key={s} size={12} style={{ fill: AMBER, color: AMBER }} />
                    ))}
                  </div>
                </div>
                <p className="flex-1 text-sm italic leading-relaxed" style={{ color: "#374151" }}>"{t.quote}"</p>
                <div className="flex items-center gap-3 pt-4" style={{ borderTop: `1px solid ${BORD}` }}>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                    style={{ background: t.avBg, color: t.avColor }}>
                    {t.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold" style={{ color: COAL }}>{t.name}</p>
                    <p className="truncate text-xs" style={{ color: MUTED }}>{t.role}</p>
                    <p className="text-xs" style={{ color: MUTED }}>{t.city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Final ── */}
      <section className="px-6 pb-16 pt-4" style={{ background: BG }}>
        <div
          className="relative mx-auto max-w-6xl overflow-hidden px-8 py-14 text-white"
          style={{ background: COAL, borderRadius: "14px", boxShadow: "0 20px 60px rgba(30,41,59,0.18)" }}
        >
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute right-0 top-0 h-64 w-64 rounded-full -translate-y-1/2 translate-x-1/3"
              style={{ background: "rgba(13,115,119,0.20)" }} />
            <div className="absolute left-0 bottom-0 h-40 w-40 rounded-full translate-y-1/3 -translate-x-1/4"
              style={{ background: "rgba(13,115,119,0.12)" }} />
          </div>

          <div className="relative flex flex-wrap items-center justify-between gap-10">
            <div className="max-w-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
                style={{ background: "rgba(13,115,119,0.35)" }}>
                <Zap size={24} style={{ color: AMBER }} />
              </div>
              <h2 className="text-3xl font-black leading-tight" style={{ letterSpacing: "-0.02em" }}>
                Pronto para <span style={{ color: AMBER }}>começar?</span>
              </h2>
              <p className="mt-3 text-sm" style={{ color: "rgba(255,255,255,0.65)", lineHeight: 1.75 }}>
                Crie sua conta em menos de 2 minutos e gerencie seu petshop hoje mesmo. Sem cartão de crédito.
              </p>
            </div>
            <div className="flex flex-col items-start gap-3">
              <Link
                to="/register"
                className="flex items-center gap-2 px-7 py-3.5 text-sm font-extrabold transition hover:opacity-90"
                style={{ background: CORAL, color: "#fff", borderRadius: "6px", boxShadow: "0 4px 16px rgba(249,115,22,0.35)", whiteSpace: "nowrap" }}
              >
                <ArrowRight size={16} /> Criar conta gratuita
              </Link>
              <Link
                to="/login"
                className="flex items-center gap-2 px-7 py-3.5 text-sm font-semibold transition hover:bg-white/10"
                style={{ border: "1.5px solid rgba(255,255,255,0.25)", color: "#fff", borderRadius: "6px", whiteSpace: "nowrap" }}
              >
                Já tenho conta
              </Link>
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                Sem cartão de crédito · Cancele quando quiser
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="flex flex-wrap items-center justify-between gap-4 px-8 py-5"
        style={{ background: COAL }}>
        <div className="flex items-center gap-2">
          <PawPrint size={18} style={{ color: TEAL }} />
          <span className="text-base font-black tracking-tight text-white">Pet Club</span>
        </div>
        <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
          © {new Date().getFullYear()} Pet Club. Todos os direitos reservados.
        </span>
        <div className="flex gap-5">
          {["Suporte", "Privacidade", "Termos"].map((l) => (
            <span key={l} className="cursor-pointer text-xs transition hover:text-white"
              style={{ color: "rgba(255,255,255,0.40)" }}>
              {l}
            </span>
          ))}
        </div>
      </footer>
    </div>
  );
}
