import { Link } from "react-router-dom";
import {
  PawPrint, CalendarCheck, Store, Scissors, ShieldCheck,
  ArrowRight, Dog, Star, Zap, Quote,
} from "lucide-react";

const BLUE  = "#1A3CB8";
const BDARK = "#0D2580";
const YELL  = "#F5A800";
const GREEN = "#00A651";
const BG    = "#F4F4F4";
const BORD  = "#E0E0E0";
const MUTED = "#6B6B6B";

const features = [
  { icon: Dog,           title: "Gestão de Pets",      desc: "Cadastre e acompanhe o histórico completo de saúde, vacinas e tags de cada animal.",  bg: BLUE,  },
  { icon: CalendarCheck, title: "Agendamentos",         desc: "Visualize e gerencie atendimentos em tempo real com status e histórico por pet.",      bg: GREEN, },
  { icon: Store,         title: "Múltiplas Unidades",   desc: "Controle todas as suas lojas em um único painel com ranking de performance.",          bg: YELL,  },
  { icon: Scissors,      title: "Catálogo de Serviços", desc: "Organize banho, tosa, consultas e mais com precificação por categoria.",              bg: BLUE,  },
  { icon: ShieldCheck,   title: "Controle de Acesso",   desc: "Perfis separados para clientes e funcionários com permissões granulares.",             bg: BDARK, },
  { icon: Zap,           title: "Pronto em minutos",    desc: "Interface projetada para o dia a dia — sem treinamento, sem curva de aprendizado.",    bg: GREEN, },
];

const testimonials = [
  {
    name: "Ana Claudia Santos",
    role: "Dona — PetAmigo Banho & Tosa",
    city: "São Paulo, SP",
    quote: "Antes eu controlava tudo em planilha. Hoje vejo os agendamentos do dia assim que chego, sem estresse. O retorno de clientes aumentou 30% em 4 meses.",
    initials: "AC",
  },
  {
    name: "Carlos Henrique Lima",
    role: "Gestor — Rede PetCare (3 unidades)",
    city: "Curitiba, PR",
    quote: "Gerencio 3 lojas sem precisar estar presente em todas. O ranking de performance por unidade mudou completamente como eu tomo decisões.",
    initials: "CH",
  },
  {
    name: "Mariana Ferreira",
    role: "Veterinária — Clínica PetVida",
    city: "Belo Horizonte, MG",
    quote: "O histórico de saúde por pet salvou situações sérias. Com um clique sei tudo sobre alergias e medicamentos antes de qualquer atendimento.",
    initials: "MF",
  },
];

function GeometricDecor() {
  return (
    <div className="pointer-events-none absolute inset-0 select-none overflow-hidden">
      {/* yellow triangle */}
      <div className="absolute right-16 top-10 h-16 w-16 opacity-90"
        style={{ background: YELL, clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }} />
      {/* green diamond */}
      <div className="absolute right-4 top-[38%] h-12 w-12 rotate-45 opacity-80"
        style={{ background: GREEN }} />
      {/* white circle outline */}
      <div className="absolute right-32 top-[16%] h-20 w-20 rounded-full"
        style={{ border: "3px solid rgba(255,255,255,0.2)" }} />
      {/* yellow small square */}
      <div className="absolute bottom-14 right-10 h-8 w-8 opacity-65"
        style={{ background: YELL }} />
      {/* white triangle faint */}
      <div className="absolute right-52 bottom-10 h-12 w-12 opacity-12"
        style={{ background: "#FFFFFF", clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }} />
      {/* large circle outline */}
      <div className="absolute -right-8 -bottom-4 h-44 w-44 rounded-full"
        style={{ border: "3px solid rgba(255,255,255,0.07)" }} />
      {/* green half-strip */}
      <div className="absolute right-0 top-[58%] h-28 w-14 rounded-l-full opacity-12"
        style={{ background: GREEN }} />
    </div>
  );
}

export default function Home() {
  return (
    <div style={{ background: BG, fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden px-6 pb-20 pt-20 text-white" style={{ background: BLUE }}>
        <GeometricDecor />

        <div className="relative mx-auto max-w-6xl">
          <div className="grid items-center gap-14 lg:grid-cols-2">

            {/* Left: copy */}
            <div>
              <div
                className="mb-6 inline-flex items-center gap-2 px-4 py-1.5"
                style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "20px" }}
              >
                <PawPrint size={13} style={{ color: YELL }} />
                <span className="text-xs font-semibold uppercase tracking-widest">Apex Petstore</span>
              </div>

              <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl" style={{ letterSpacing: "-0.02em" }}>
                Chega de planilha<br />
                <span style={{ color: YELL }}>para seu petshop.</span>
              </h1>
              <p className="mt-5 text-lg" style={{ color: "rgba(255,255,255,0.75)", lineHeight: 1.6 }}>
                Pets, agendamentos, equipe e lojas — tudo em um único painel.
                Você foca no que importa, a gente cuida da gestão.
              </p>

              <div className="mt-8 flex flex-wrap gap-8">
                {[
                  { num: "500+", label: "petshops ativos" },
                  { num: "12k",  label: "pets gerenciados" },
                  { num: "98%",  label: "satisfação" },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="text-3xl font-extrabold" style={{ color: YELL }}>{s.num}</div>
                    <div className="mt-0.5 text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/register"
                  className="flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold transition hover:opacity-90"
                  style={{ background: "#FFFFFF", color: BLUE, borderRadius: "4px", boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}
                >
                  Criar conta grátis <ArrowRight size={15} />
                </Link>
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold transition hover:opacity-90"
                  style={{ background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.25)", color: "#fff", borderRadius: "4px" }}
                >
                  Entrar na conta
                </Link>
              </div>
            </div>

            {/* Right: UI mockup */}
            <div className="hidden lg:block">
              <div className="relative">
                <div
                  className="overflow-hidden shadow-2xl"
                  style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", backdropFilter: "blur(12px)", borderRadius: "8px" }}
                >
                  <div className="flex items-center gap-1.5 px-4 py-3"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)" }}>
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: "rgba(255,100,100,0.7)" }} />
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: "rgba(255,200,60,0.7)" }} />
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: "rgba(80,220,120,0.7)" }} />
                    <div className="mx-auto h-5 w-48 rounded-full" style={{ background: "rgba(255,255,255,0.1)" }} />
                  </div>
                  <div className="flex">
                    <div className="w-12 shrink-0 px-2 py-4"
                      style={{ borderRight: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)" }}>
                      {[0,1,2,3,4,5].map((i) => (
                        <div key={i} className="mb-3 mx-auto h-7 w-7"
                          style={{ background: i === 0 ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.07)", borderRadius: "4px" }} />
                      ))}
                    </div>
                    <div className="flex-1 p-4">
                      <div className="mb-4 h-5 w-48 rounded-full" style={{ background: "rgba(255,255,255,0.2)" }} />
                      <div className="mb-4 grid grid-cols-3 gap-2">
                        {[
                          { val: "48",    label: "Atend./Mês", accent: "rgba(26,60,184,0.5)"  },
                          { val: "R$ 8k", label: "Receita",    accent: "rgba(0,166,81,0.5)"   },
                          { val: "127",   label: "Pets",       accent: "rgba(245,168,0,0.5)"  },
                        ].map((kpi) => (
                          <div key={kpi.label} className="p-3" style={{ background: "rgba(255,255,255,0.10)", borderRadius: "4px" }}>
                            <div className="mb-2 h-6 w-6" style={{ background: kpi.accent, borderRadius: "4px" }} />
                            <div className="text-base font-bold text-white">{kpi.val}</div>
                            <div className="text-[10px]" style={{ color: "rgba(255,255,255,0.5)" }}>{kpi.label}</div>
                          </div>
                        ))}
                      </div>
                      {[
                        { dot: "rgba(0,166,81,0.55)",   w: "w-32" },
                        { dot: "rgba(245,168,0,0.55)",  w: "w-28" },
                        { dot: "rgba(26,60,184,0.55)",  w: "w-24" },
                      ].map((row, i) => (
                        <div key={i} className="mb-2 flex items-center gap-2 px-3 py-2"
                          style={{ background: "rgba(255,255,255,0.07)", borderRadius: "4px" }}>
                          <div className="h-8 w-8 shrink-0" style={{ background: "rgba(255,255,255,0.15)", borderRadius: "4px" }} />
                          <div className="flex-1">
                            <div className={`mb-1 h-2.5 rounded-full ${row.w}`} style={{ background: "rgba(255,255,255,0.3)" }} />
                            <div className="h-2 w-16 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
                          </div>
                          <div className="h-5 w-16 rounded-full" style={{ background: row.dot }} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="absolute inset-0 -z-10 scale-95 blur-2xl"
                  style={{ background: "rgba(13,37,128,0.3)", borderRadius: "8px" }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="px-6 py-20" style={{ background: BG }}>
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-widest" style={{ color: BLUE }}>
              Plataforma completa
            </span>
            <h2 className="text-2xl font-bold" style={{ color: "#222222" }}>Tudo que você precisa</h2>
            <p className="mt-2 text-sm" style={{ color: MUTED }}>Uma plataforma para petshops de todos os tamanhos.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-white transition hover:-translate-y-0.5 hover:shadow-md"
                style={{ border: `1px solid ${BORD}`, borderRadius: "4px", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center" style={{ background: f.bg, borderRadius: "4px" }}>
                  <f.icon size={20} color="#FFFFFF" />
                </div>
                <h3 className="font-semibold" style={{ color: "#222222" }}>{f.title}</h3>
                <p className="mt-1.5 text-sm" style={{ color: MUTED, lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="px-6 py-20" style={{ background: "#FFFFFF" }}>
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-widest" style={{ color: BLUE }}>
              Depoimentos
            </span>
            <h2 className="text-2xl font-bold" style={{ color: "#222222" }}>Quem já usa, aprova</h2>
            <p className="mt-2 text-sm" style={{ color: MUTED }}>Donos de petshop reais, resultados reais.</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="flex flex-col gap-4"
                style={{
                  background: BG, border: `1px solid ${BORD}`,
                  borderTop: `4px solid ${BLUE}`, borderRadius: "4px", padding: "24px",
                }}
              >
                <Quote size={20} style={{ color: "#C5CDE8" }} />
                <p className="flex-1 text-sm leading-relaxed" style={{ color: "#374151" }}>"{t.quote}"</p>
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} size={13} style={{ fill: YELL, color: YELL }} />
                  ))}
                </div>
                <div className="flex items-center gap-3 pt-4" style={{ borderTop: `1px solid ${BORD}` }}>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ background: BLUE }}>
                    {t.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold" style={{ color: "#222222" }}>{t.name}</p>
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
      <section className="px-6 py-20" style={{ background: BG }}>
        <div
          className="relative mx-auto max-w-2xl overflow-hidden px-8 py-14 text-center text-white"
          style={{ background: BLUE, boxShadow: "0 20px 60px rgba(26,60,184,0.22)", borderRadius: "4px" }}
        >
          <GeometricDecor />
          <div className="relative">
            <PawPrint size={32} className="mx-auto mb-5 opacity-70" />
            <h2 className="text-2xl font-extrabold" style={{ letterSpacing: "-0.02em" }}>
              Pronto para começar?
            </h2>
            <p className="mt-3 text-sm" style={{ color: "rgba(255,255,255,0.75)" }}>
              Crie sua conta em menos de 2 minutos e gerencie seu petshop hoje mesmo.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                to="/register"
                className="flex items-center gap-2 px-7 py-3 text-sm font-bold transition hover:opacity-90"
                style={{ background: "#FFFFFF", color: BLUE, borderRadius: "4px", boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}
              >
                Criar conta gratuita <ArrowRight size={15} />
              </Link>
              <Link
                to="/login"
                className="flex items-center gap-2 px-7 py-3 text-sm font-semibold transition hover:opacity-90"
                style={{ background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.25)", color: "#fff", borderRadius: "4px" }}
              >
                Já tenho conta
              </Link>
            </div>
            <p className="mt-5 text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
              Sem cartão de crédito · Cancele quando quiser
            </p>
          </div>
        </div>
      </section>

      <footer className="px-6 py-6 text-center text-xs"
        style={{ background: "#FFFFFF", borderTop: `1px solid ${BORD}`, color: MUTED }}>
        © {new Date().getFullYear()} Apex Petstore · ApexBrasil. Todos os direitos reservados.
      </footer>
    </div>
  );
}
