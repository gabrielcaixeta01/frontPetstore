import { Link } from "react-router-dom";
import {
  PawPrint, CalendarCheck, Store, Scissors, ShieldCheck,
  ArrowRight, Dog, Star, Zap, Quote,
} from "lucide-react";

const features = [
  { icon: Dog,           title: "Gestão de Pets",      desc: "Cadastre e acompanhe o histórico completo de saúde, vacinas e tags de cada animal.",   bg: "bg-blue-50",    iconCls: "text-blue-600",    border: "border-blue-100"   },
  { icon: CalendarCheck, title: "Agendamentos",         desc: "Visualize e gerencie atendimentos em tempo real com status e histórico por pet.",       bg: "bg-emerald-50", iconCls: "text-emerald-600", border: "border-emerald-100"},
  { icon: Store,         title: "Múltiplas Unidades",   desc: "Controle todas as suas lojas em um único painel com ranking de performance.",           bg: "bg-amber-50",   iconCls: "text-amber-600",   border: "border-amber-100"  },
  { icon: Scissors,      title: "Catálogo de Serviços", desc: "Organize banho, tosa, consultas e mais com precificação por categoria.",               bg: "bg-violet-50",  iconCls: "text-violet-600",  border: "border-violet-100" },
  { icon: ShieldCheck,   title: "Controle de Acesso",   desc: "Perfis separados para clientes e funcionários com permissões granulares.",              bg: "bg-rose-50",    iconCls: "text-rose-600",    border: "border-rose-100"   },
  { icon: Zap,           title: "Pronto em minutos",    desc: "Interface projetada para o dia a dia — sem treinamento, sem curva de aprendizado.",     bg: "bg-orange-50",  iconCls: "text-orange-500",  border: "border-orange-100" },
];

const testimonials = [
  {
    name: "Ana Claudia Santos",
    role: "Dona — PetAmigo Banho & Tosa",
    city: "São Paulo, SP",
    quote: "Antes eu controlava tudo em planilha. Hoje vejo os agendamentos do dia assim que chego, sem estresse. O retorno de clientes aumentou 30% em 4 meses.",
    initials: "AC",
    avatarBg: "bg-blue-600",
    accent: "border-t-blue-500",
  },
  {
    name: "Carlos Henrique Lima",
    role: "Gestor — Rede PetCare (3 unidades)",
    city: "Curitiba, PR",
    quote: "Gerencio 3 lojas sem precisar estar presente em todas. O ranking de performance por unidade mudou completamente como eu tomo decisões.",
    initials: "CH",
    avatarBg: "bg-violet-600",
    accent: "border-t-violet-500",
  },
  {
    name: "Mariana Ferreira",
    role: "Veterinária — Clínica PetVida",
    city: "Belo Horizonte, MG",
    quote: "O histórico de saúde por pet salvou situações sérias. Com um clique sei tudo sobre alergias e medicamentos antes de qualquer atendimento.",
    initials: "MF",
    avatarBg: "bg-emerald-600",
    accent: "border-t-emerald-500",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen" style={{ background: "#f0f2f8", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>

      {/* ── Hero ── */}
      <section
        className="relative overflow-hidden px-6 pb-20 pt-20 text-white"
        style={{ background: "linear-gradient(135deg, #1230d4 0%, #1840e0 40%, #0a5fd8 70%, #0b9e6e 100%)" }}
      >
        {/* Background orbs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full opacity-20" style={{ background: "radial-gradient(circle, #ffd200 0%, transparent 70%)" }} />
          <div className="absolute top-1/2 -left-32 h-80 w-80 rounded-full opacity-10" style={{ background: "radial-gradient(circle, white 0%, transparent 70%)" }} />
          <div className="absolute bottom-0 right-1/3 h-60 w-60 rounded-full opacity-15" style={{ background: "radial-gradient(circle, #00e57a 0%, transparent 70%)" }} />
        </div>

        <div className="relative mx-auto max-w-6xl">
          <div className="grid items-center gap-14 lg:grid-cols-2">

            {/* Left: copy */}
            <div>
              <div
                className="mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5"
                style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)" }}
              >
                <PawPrint size={13} style={{ color: "#ffd200" }} />
                <span className="text-xs font-semibold uppercase tracking-widest">Apex Petstore</span>
              </div>

              <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl" style={{ letterSpacing: "-0.02em" }}>
                Chega de planilha<br />
                <span style={{ color: "#7df5b8" }}>para seu petshop.</span>
              </h1>
              <p className="mt-5 text-lg" style={{ color: "rgba(255,255,255,0.75)", lineHeight: 1.6 }}>
                Pets, agendamentos, equipe e lojas — tudo em um único painel.
                Você foca no que importa, a gente cuida da gestão.
              </p>

              {/* Social proof numbers */}
              <div className="mt-8 flex flex-wrap gap-8">
                {[
                  { num: "500+", label: "petshops ativos" },
                  { num: "12k",  label: "pets gerenciados" },
                  { num: "98%",  label: "satisfação" },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="text-3xl font-extrabold" style={{ color: "#7df5b8" }}>{s.num}</div>
                    <div className="mt-0.5 text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/register"
                  className="flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold transition hover:opacity-90"
                  style={{ background: "#ffffff", color: "#1230d4", boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}
                >
                  Criar conta grátis <ArrowRight size={15} />
                </Link>
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition hover:opacity-90"
                  style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)", color: "#fff" }}
                >
                  Entrar na conta
                </Link>
              </div>
            </div>

            {/* Right: UI mockup */}
            <div className="hidden lg:block">
              <div className="relative">
                <div
                  className="overflow-hidden rounded-2xl shadow-2xl"
                  style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.18)", backdropFilter: "blur(12px)" }}
                >
                  {/* Window chrome */}
                  <div
                    className="flex items-center gap-1.5 px-4 py-3"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)" }}
                  >
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: "rgba(255,100,100,0.7)" }} />
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: "rgba(255,200,60,0.7)" }} />
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: "rgba(80,220,120,0.7)" }} />
                    <div className="mx-auto h-5 w-48 rounded-full" style={{ background: "rgba(255,255,255,0.1)" }} />
                  </div>
                  {/* Dashboard preview */}
                  <div className="flex">
                    {/* Sidebar */}
                    <div className="w-12 shrink-0 px-2 py-4" style={{ borderRight: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)" }}>
                      {[0,1,2,3,4,5].map(i => (
                        <div key={i} className="mb-3 mx-auto h-7 w-7 rounded-xl" style={{ background: i === 0 ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.07)" }} />
                      ))}
                    </div>
                    {/* Main */}
                    <div className="flex-1 p-4">
                      <div className="mb-4 h-5 w-48 rounded-full" style={{ background: "rgba(255,255,255,0.2)" }} />
                      <div className="mb-4 grid grid-cols-3 gap-2">
                        {[
                          { val: "48",     label: "Atend./Mês", bg: "rgba(99,179,237,0.25)"   },
                          { val: "R$ 8k",  label: "Receita",    bg: "rgba(72,212,143,0.25)"   },
                          { val: "127",    label: "Pets",       bg: "rgba(255,210,0,0.25)"     },
                        ].map((kpi) => (
                          <div key={kpi.label} className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.1)" }}>
                            <div className="mb-2 h-6 w-6 rounded-lg" style={{ background: kpi.bg }} />
                            <div className="text-base font-bold text-white">{kpi.val}</div>
                            <div className="text-[10px]" style={{ color: "rgba(255,255,255,0.5)" }}>{kpi.label}</div>
                          </div>
                        ))}
                      </div>
                      {[
                        { status: "rgba(72,212,143,0.45)", w: "w-32" },
                        { status: "rgba(255,210,0,0.45)",  w: "w-28" },
                        { status: "rgba(99,179,237,0.45)", w: "w-24" },
                      ].map((row, i) => (
                        <div key={i} className="mb-2 flex items-center gap-2 rounded-xl px-3 py-2" style={{ background: "rgba(255,255,255,0.07)" }}>
                          <div className="h-8 w-8 shrink-0 rounded-xl" style={{ background: "rgba(255,255,255,0.15)" }} />
                          <div className="flex-1">
                            <div className={`mb-1 h-2.5 rounded-full ${row.w}`} style={{ background: "rgba(255,255,255,0.3)" }} />
                            <div className="h-2 w-16 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
                          </div>
                          <div className="h-5 w-16 rounded-full" style={{ background: row.status }} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Glow */}
                <div className="absolute inset-0 -z-10 scale-95 rounded-2xl blur-2xl" style={{ background: "rgba(0,185,105,0.2)" }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="mb-12 text-center">
          <h2 className="text-2xl font-bold" style={{ color: "#0f1a3d" }}>Tudo que você precisa</h2>
          <p className="mt-2 text-sm" style={{ color: "#6b7280" }}>Uma plataforma completa para petshops de todos os tamanhos.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className={`rounded-2xl bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-lg ${f.border}`}
              style={{ border: "1px solid", borderColor: "inherit", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
            >
              <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${f.bg}`}>
                <f.icon size={20} className={f.iconCls} />
              </div>
              <h3 className="font-semibold" style={{ color: "#0f1a3d" }}>{f.title}</h3>
              <p className="mt-1.5 text-sm" style={{ color: "#6b7280", lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="px-6 py-20" style={{ background: "#fff" }}>
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold" style={{ color: "#0f1a3d" }}>Quem já usa, aprova</h2>
            <p className="mt-2 text-sm" style={{ color: "#6b7280" }}>Donos de petshop reais, resultados reais.</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className={`flex flex-col gap-4 rounded-2xl p-6 border-t-4 ${t.accent}`}
                style={{ background: "#f8f9fc", border: "1px solid #e9ecf4", borderTopWidth: "4px" }}
              >
                <Quote size={20} style={{ color: "#d1d8f0" }} />
                <p className="flex-1 text-sm leading-relaxed" style={{ color: "#374151" }}>"{t.quote}"</p>
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} size={13} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <div className="flex items-center gap-3 pt-4" style={{ borderTop: "1px solid #e5e7eb" }}>
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${t.avatarBg}`}>
                    {t.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold" style={{ color: "#0f1a3d" }}>{t.name}</p>
                    <p className="truncate text-xs" style={{ color: "#9ca3af" }}>{t.role}</p>
                    <p className="text-xs" style={{ color: "#9ca3af" }}>{t.city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Final ── */}
      <section className="px-6 py-20" style={{ background: "#f0f2f8" }}>
        <div
          className="mx-auto max-w-2xl rounded-3xl px-8 py-14 text-center text-white"
          style={{ background: "linear-gradient(135deg, #1230d4 0%, #0b9e6e 100%)", boxShadow: "0 20px 60px rgba(18,48,212,0.25)" }}
        >
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
              className="flex items-center gap-2 rounded-xl px-7 py-3 text-sm font-bold transition hover:opacity-90"
              style={{ background: "#ffffff", color: "#1230d4", boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}
            >
              Criar conta gratuita <ArrowRight size={15} />
            </Link>
            <Link
              to="/login"
              className="flex items-center gap-2 rounded-xl px-7 py-3 text-sm font-semibold transition hover:opacity-90"
              style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.3)", color: "#fff" }}
            >
              Já tenho conta
            </Link>
          </div>
          <p className="mt-5 text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
            Sem cartão de crédito · Cancele quando quiser
          </p>
        </div>
      </section>

      <footer className="bg-white px-6 py-6 text-center text-xs" style={{ borderTop: "1px solid #e9ecf4", color: "#9ca3af" }}>
        © {new Date().getFullYear()} Apex Petstore. Todos os direitos reservados.
      </footer>
    </div>
  );
}