import { Link } from "react-router-dom";
import {
  PawPrint, CalendarCheck, Store, Scissors, ShieldCheck,
  ArrowRight, Zap, Star, Quote,
} from "lucide-react";

const BLUE  = "#1A3CB8";
const BDARK = "#0D2580";
const YELL  = "#F5A800";
const GREEN = "#00A651";
const BG    = "#F4F4F4";
const BORD  = "#E0E0E0";
const MUTED = "#6B6B6B";

const features = [
  { icon: PawPrint,     title: "Gestão de Pets",      desc: "Cadastre e acompanhe o histórico completo de saúde, vacinas e tags de cada animal.",  color: BLUE,  bg: "#e8eeff" },
  { icon: CalendarCheck, title: "Agendamentos",        desc: "Visualize e gerencie atendimentos em tempo real com status e histórico por pet.",      color: GREEN, bg: "#e6f4ed" },
  { icon: Store,        title: "Múltiplas Unidades",   desc: "Controle todas as suas lojas em um único painel com ranking de performance.",          color: YELL,  bg: "#fff8e6" },
  { icon: Scissors,     title: "Catálogo de Serviços", desc: "Organize banho, tosa, consultas e mais com precificação por categoria.",              color: BDARK, bg: "#e8eeff" },
  { icon: ShieldCheck,  title: "Controle de Acesso",   desc: "Perfis separados para clientes e funcionários com permissões granulares.",             color: GREEN, bg: "#e6f4ed" },
  { icon: Zap,          title: "Pronto em minutos",    desc: "Interface projetada para o dia a dia — sem treinamento, sem curva de aprendizado.",    color: YELL,  bg: "#fff8e6" },
];

const testimonials = [
  {
    name: "Ana Claudia Santos",
    role: "Dona — PetAmigo Banho & Tosa",
    city: "São Paulo, SP",
    quote: "Antes eu controlava tudo em planilha. Hoje vejo os agendamentos do dia assim que chego, sem estresse. O retorno de clientes aumentou 30% em 4 meses.",
    initials: "AC",
    avBg: "#e8eeff",
    avColor: BLUE,
  },
  {
    name: "Carlos Henrique Lima",
    role: "Gestor — Rede PetCare (3 unidades)",
    city: "Curitiba, PR",
    quote: "Gerencio 3 lojas sem precisar estar presente em todas. O ranking de performance por unidade mudou completamente como eu tomo decisões.",
    initials: "CH",
    avBg: "#e6f4ed",
    avColor: GREEN,
  },
  {
    name: "Mariana Ferreira",
    role: "Veterinária — Clínica PetVida",
    city: "Belo Horizonte, MG",
    quote: "O histórico de saúde por pet salvou situações sérias. Com um clique sei tudo sobre alergias e medicamentos antes de qualquer atendimento.",
    initials: "MF",
    avBg: "#fff8e6",
    avColor: "#b07800",
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
      <div className="absolute right-16 top-10 h-14 w-14 opacity-80"
        style={{ background: YELL, clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }} />
      <div className="absolute right-6 top-[42%] h-10 w-10 rotate-45 opacity-70"
        style={{ background: GREEN }} />
      <div className="absolute right-36 top-[18%] h-20 w-20 rounded-full"
        style={{ border: "2px solid rgba(255,255,255,0.2)" }} />
      <div className="absolute bottom-12 left-6 h-8 w-8 rotate-12 opacity-60"
        style={{ background: YELL }} />
      <div className="absolute bottom-10 left-20 h-10 w-10 rounded-full"
        style={{ border: "2px solid rgba(255,255,255,0.15)" }} />
      <div className="absolute -right-8 -bottom-4 h-44 w-44 rounded-full"
        style={{ border: "3px solid rgba(255,255,255,0.06)" }} />
    </div>
  );
}

export default function Home() {
  return (
    <div style={{ background: BG, fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden px-6 pb-20 pt-16 text-white" style={{ background: BLUE }}>
        <HeroGeo />
        <div className="relative mx-auto max-w-6xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">

            {/* Left: copy */}
            <div>
              <div
                className="mb-5 inline-flex items-center gap-2 px-4 py-1.5"
                style={{
                  background: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,255,255,0.22)",
                  borderRadius: "20px",
                }}
              >
                <PawPrint size={13} style={{ color: YELL }} />
                <span className="text-xs font-semibold uppercase tracking-widest">Jon Petstore</span>
              </div>

              <h1 className="text-4xl font-black leading-tight sm:text-5xl" style={{ letterSpacing: "-0.02em" }}>
                Chega de planilha<br />
                <span style={{ color: YELL }}>para seu petshop.</span>
              </h1>
              <p className="mt-5 text-base" style={{ color: "rgba(255,255,255,0.75)", lineHeight: 1.7 }}>
                Pets, agendamentos, equipe e lojas — tudo em um único painel.
                Você foca no que importa, a gente cuida da gestão.
              </p>

              <div className="mt-8 flex flex-wrap gap-8">
                {[
                  { num: "500+", label: "petshops ativos" },
                  { num: "12k",  label: "pets gerenciados" },
                  { num: "98%",  label: "satisfação" },
                ].map((s) => (
                  <div key={s.label} style={{ borderLeft: `3px solid ${YELL}`, paddingLeft: "12px" }}>
                    <div className="text-2xl font-black" style={{ color: YELL }}>{s.num}</div>
                    <div className="mt-0.5 text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/register"
                  className="flex items-center justify-center gap-2 px-7 py-3 text-sm font-bold transition hover:opacity-90"
                  style={{ background: YELL, color: BDARK, borderRadius: "4px", boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}
                >
                  <ArrowRight size={15} /> Criar conta grátis
                </Link>
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 px-7 py-3 text-sm font-semibold transition hover:opacity-90"
                  style={{ background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", borderRadius: "4px" }}
                >
                  Entrar na conta
                </Link>
              </div>
            </div>

            {/* Right: apex1 image */}
            <div className="hidden lg:block">
              <div className="relative">
                <img
                  src="/apex1.png"
                  alt="Jon Petstore em ação"
                  className="w-full shadow-2xl"
                  style={{ borderRadius: "10px", border: "2px solid rgba(255,255,255,0.18)" }}
                />
                {/* Floating badge: Atendimentos */}
                <div
                  className="absolute -bottom-5 -left-5 flex items-center gap-3 px-4 py-3 shadow-xl"
                  style={{ background: "#fff", borderRadius: "8px", minWidth: "180px" }}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                    style={{ background: "#e6f4ed" }}>
                    <CalendarCheck size={18} style={{ color: GREEN }} />
                  </div>
                  <div>
                    <div className="text-base font-black" style={{ color: GREEN }}>+48</div>
                    <div className="text-xs" style={{ color: MUTED }}>atend. este mês</div>
                  </div>
                </div>
                {/* Floating badge: Receita */}
                <div
                  className="absolute -top-5 -right-4 flex items-center gap-3 px-4 py-3 shadow-xl"
                  style={{ background: "#fff", borderRadius: "8px" }}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                    style={{ background: "#fff8e6" }}>
                    <Store size={18} style={{ color: YELL }} />
                  </div>
                  <div>
                    <div className="text-base font-black" style={{ color: "#b07800" }}>R$ 8k</div>
                    <div className="text-xs" style={{ color: MUTED }}>receita/mês</div>
                  </div>
                </div>
                {/* glow */}
                <div className="absolute inset-0 -z-10 scale-95 blur-2xl"
                  style={{ background: "rgba(13,37,128,0.3)", borderRadius: "10px" }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stripe de confiança ── */}
      <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3 px-6 py-4"
        style={{ background: BDARK }}>
        {["Sem cartão de crédito", "Cancele quando quiser", "Suporte incluído", "Dados seguros", "Configuração em 2 min"].map((item) => (
          <div key={item} className="flex items-center gap-2 text-xs font-medium" style={{ color: "rgba(255,255,255,0.75)" }}>
            <span className="flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold"
              style={{ background: GREEN, color: "#fff" }}>✓</span>
            {item}
          </div>
        ))}
      </div>

      {/* ── Galeria de imagens Apex ── */}
      <section className="px-6 py-16" style={{ background: "#fff" }}>
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <span className="mb-2 inline-block text-xs font-bold uppercase tracking-widest" style={{ color: BLUE }}>
              Nossa plataforma
            </span>
            <h2 className="text-2xl font-extrabold" style={{ color: "#1a1a1a" }}>Veja na prática</h2>
            <p className="mt-2 text-sm" style={{ color: MUTED }}>Mais de 500 petshops já confiam na Jon para gerenciar seu negócio.</p>
          </div>

          {/* Asymmetric gallery: apex1 large left, apex2 + apex3 stacked right */}
          <div className="grid gap-4 md:grid-cols-3">
            {/* apex2 - tall card left */}
            <div className="md:col-span-2 overflow-hidden shadow-md group"
              style={{ borderRadius: "10px", border: `1px solid ${BORD}` }}>
              <img
                src="/apex2.png"
                alt="Equipe Jon"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                style={{ minHeight: "260px", maxHeight: "420px" }}
              />
            </div>

            {/* apex3 + apex1 stacked right */}
            <div className="flex flex-col gap-4">
              <div className="overflow-hidden shadow-md group flex-1"
                style={{ borderRadius: "10px", border: `1px solid ${BORD}` }}>
                <img
                  src="/apex3.png"
                  alt="Jon Petstore"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  style={{ minHeight: "120px" }}
                />
              </div>
              <div className="overflow-hidden shadow-md group flex-1"
                style={{ borderRadius: "10px", border: `1px solid ${BORD}` }}>
                <img
                  src="/apex1.png"
                  alt="Jon Petstore"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  style={{ minHeight: "120px" }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="px-6 py-16" style={{ background: BG }}>
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <span className="mb-2 inline-block text-xs font-bold uppercase tracking-widest" style={{ color: BLUE }}>
              Plataforma completa
            </span>
            <h2 className="text-2xl font-extrabold" style={{ color: "#1a1a1a" }}>Tudo que você precisa</h2>
            <p className="mt-2 text-sm" style={{ color: MUTED }}>
              Uma plataforma para petshops de todos os tamanhos. Da primeira tosa ao controle de múltiplas unidades.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="relative overflow-hidden bg-white transition hover:-translate-y-1 hover:shadow-lg"
                style={{ border: `1px solid ${BORD}`, borderRadius: "8px", padding: "24px" }}
              >
                {/* top accent bar */}
                <div className="absolute left-0 right-0 top-0 h-[3px]"
                  style={{ background: [BLUE, GREEN, YELL, BDARK, GREEN, YELL][i] }} />
                <div className="mb-4 flex h-11 w-11 items-center justify-center"
                  style={{ background: f.bg, borderRadius: "10px" }}>
                  <f.icon size={20} style={{ color: f.color }} />
                </div>
                <h3 className="font-bold" style={{ color: "#1a1a1a" }}>{f.title}</h3>
                <p className="mt-1.5 text-sm" style={{ color: MUTED, lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Números ── */}
      <section className="relative overflow-hidden px-6 py-16 text-white" style={{ background: BLUE }}>
        {/* geo shapes */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-16 top-4 h-12 w-12 opacity-70"
            style={{ background: YELL, clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }} />
          <div className="absolute left-8 bottom-6 h-8 w-8 rotate-45 opacity-50"
            style={{ background: GREEN }} />
          <div className="absolute left-20 top-4 h-16 w-16 rounded-full"
            style={{ border: "2px solid rgba(255,255,255,0.15)" }} />
        </div>
        <div className="relative mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: YELL }}>
              Resultados reais
            </span>
          </div>
          <div className="grid grid-cols-2 gap-0 sm:grid-cols-4">
            {stats.map((s, i) => (
              <div
                key={s.label}
                className="px-4 py-6 text-center"
                style={{ borderRight: i < stats.length - 1 ? "1px solid rgba(255,255,255,0.15)" : "none" }}
              >
                <div className="text-4xl font-black leading-none" style={{ color: YELL }}>{s.num}</div>
                <div className="mt-2 text-sm font-medium" style={{ color: "rgba(255,255,255,0.85)" }}>{s.label}</div>
                <div className="mt-0.5 text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="px-6 py-16" style={{ background: "#fff" }}>
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <span className="mb-2 inline-block text-xs font-bold uppercase tracking-widest" style={{ color: BLUE }}>
              Depoimentos
            </span>
            <h2 className="text-2xl font-extrabold" style={{ color: "#1a1a1a" }}>Quem já usa, aprova</h2>
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
                  borderTop: `3px solid ${BLUE}`,
                  borderRadius: "8px",
                  padding: "24px",
                }}
              >
                <div className="flex items-center justify-between">
                  <Quote size={22} style={{ color: "#C5CDE8" }} />
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map((s) => (
                      <Star key={s} size={12} style={{ fill: YELL, color: YELL }} />
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
                    <p className="truncate text-sm font-bold" style={{ color: "#1a1a1a" }}>{t.name}</p>
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
          style={{ background: BLUE, borderRadius: "12px", boxShadow: "0 20px 60px rgba(26,60,184,0.22)" }}
        >
          {/* geo */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute right-12 top-6 h-16 w-16 opacity-75"
              style={{ background: YELL, clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }} />
            <div className="absolute right-24 top-8 h-24 w-24 rounded-full"
              style={{ border: "2px solid rgba(255,255,255,0.12)" }} />
            <div className="absolute right-6 bottom-6 h-10 w-10 rotate-45 opacity-60"
              style={{ background: GREEN }} />
          </div>

          <div className="relative flex flex-wrap items-center justify-between gap-10">
            <div className="max-w-lg">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
                style={{ background: "rgba(255,255,255,0.15)" }}>
                <Zap size={24} style={{ color: YELL }} />
              </div>
              <h2 className="text-3xl font-black leading-tight" style={{ letterSpacing: "-0.02em" }}>
                Pronto para <span style={{ color: YELL }}>começar?</span>
              </h2>
              <p className="mt-3 text-sm" style={{ color: "rgba(255,255,255,0.72)", lineHeight: 1.7 }}>
                Crie sua conta em menos de 2 minutos e gerencie seu petshop hoje mesmo. Sem cartão de crédito.
              </p>
            </div>
            <div className="flex flex-col items-start gap-3">
              <Link
                to="/register"
                className="flex items-center gap-2 px-7 py-3.5 text-sm font-extrabold transition hover:opacity-90"
                style={{ background: YELL, color: BDARK, borderRadius: "4px", boxShadow: "0 4px 16px rgba(0,0,0,0.15)", whiteSpace: "nowrap" }}
              >
                <ArrowRight size={16} /> Criar conta gratuita
              </Link>
              <Link
                to="/login"
                className="flex items-center gap-2 px-7 py-3.5 text-sm font-semibold transition hover:opacity-90"
                style={{ background: "rgba(255,255,255,0.10)", border: "1.5px solid rgba(255,255,255,0.35)", color: "#fff", borderRadius: "4px", whiteSpace: "nowrap" }}
              >
                Já tenho conta
              </Link>
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                Sem cartão de crédito · Cancele quando quiser
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="flex flex-wrap items-center justify-between gap-4 px-6 py-5"
        style={{ background: BDARK }}>
        <div className="flex items-center gap-2">
          <img src="/logo_apex.png" alt="Jon Petstore" className="h-7 w-auto" style={{ filter: "brightness(0) invert(1)" }} />
        </div>
        <span className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
          © {new Date().getFullYear()} Jon. Todos os direitos reservados.
        </span>
        <div className="flex gap-5">
          {["Suporte", "Privacidade", "Termos"].map((l) => (
            <span key={l} className="cursor-pointer text-xs transition hover:text-white"
              style={{ color: "rgba(255,255,255,0.45)" }}>
              {l}
            </span>
          ))}
        </div>
      </footer>
    </div>
  );
}
