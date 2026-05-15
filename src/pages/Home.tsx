import { Link } from "react-router-dom";
import {
  PawPrint, CalendarCheck, Store, Scissors, ShieldCheck,
  ArrowRight, Users, Dog, Check, Star, Zap, TrendingUp,
  CheckCircle2, Quote,
} from "lucide-react";

const features = [
  { icon: Dog,          title: "Gestão de Pets",      desc: "Cadastre e acompanhe o histórico completo de saúde, vacinas e tags de cada animal.",   bg: "bg-[#1c46f3]/10", iconCls: "text-[#1c46f3]" },
  { icon: CalendarCheck,title: "Agendamentos",         desc: "Visualize e gerencie atendimentos em tempo real com status e histórico por pet.",       bg: "bg-[#00bb69]/10", iconCls: "text-[#00bb69]" },
  { icon: Store,        title: "Múltiplas Unidades",   desc: "Controle todas as suas lojas em um único painel com ranking de performance.",           bg: "bg-[#ffd200]/20", iconCls: "text-yellow-600" },
  { icon: Scissors,     title: "Catálogo de Serviços", desc: "Organize banho, tosa, consultas e mais com precificação por categoria.",               bg: "bg-purple-100",   iconCls: "text-purple-600" },
  { icon: ShieldCheck,  title: "Controle de Acesso",   desc: "Perfis separados para clientes e funcionários com permissões granulares.",              bg: "bg-rose-100",     iconCls: "text-rose-600"   },
  { icon: Zap,          title: "Pronto em minutos",    desc: "Interface projetada para o dia a dia — sem treinamento, sem curva de aprendizado.",     bg: "bg-orange-100",   iconCls: "text-orange-500" },
];

const testimonials = [
  {
    name: "Ana Claudia Santos",
    role: "Dona — PetAmigo Banho & Tosa",
    city: "São Paulo, SP",
    quote: "Antes eu controlava tudo em planilha. Hoje vejo os agendamentos do dia assim que chego, sem estresse. O retorno de clientes aumentou 30% em 4 meses.",
    initials: "AC",
    avatarCls: "bg-blue-100 text-blue-700",
  },
  {
    name: "Carlos Henrique Lima",
    role: "Gestor — Rede PetCare (3 unidades)",
    city: "Curitiba, PR",
    quote: "Gerencio 3 lojas sem precisar estar presente em todas. O ranking de performance por unidade mudou completamente como eu tomo decisões.",
    initials: "CH",
    avatarCls: "bg-violet-100 text-violet-700",
  },
  {
    name: "Mariana Ferreira",
    role: "Veterinária — Clínica PetVida",
    city: "Belo Horizonte, MG",
    quote: "O histórico de saúde por pet salvou situações sérias. Com um clique sei tudo sobre alergias e medicamentos antes de qualquer atendimento.",
    initials: "MF",
    avatarCls: "bg-emerald-100 text-emerald-700",
  },
];

const starterFeatures = [
  "1 unidade",
  "Até 50 pets cadastrados",
  "Agendamentos ilimitados",
  "App para clientes",
  "Suporte por e-mail",
];
const proFeatures = [
  "Unidades ilimitadas",
  "Pets ilimitados",
  "Relatórios e KPIs avançados",
  "Ranking de lojas e serviços",
  "Equipe ilimitada",
  "Suporte prioritário",
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1c46f3] via-[#1840e0] to-[#0f2fa8] px-6 pb-16 pt-20 text-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-white/5" />
          <div className="absolute top-1/2 -left-24 h-72 w-72 rounded-full bg-white/5" />
          <div className="absolute -bottom-20 right-1/4 h-64 w-64 rounded-full bg-[#00bb69]/10" />
        </div>

        <div className="relative mx-auto max-w-6xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">

            {/* Left: copy */}
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5">
                <PawPrint size={14} className="text-[#ffd200]" />
                <span className="text-xs font-semibold uppercase tracking-widest">Apex Petstore</span>
              </div>

              <h1 className="text-4xl font-extrabold leading-tight sm:text-5xl">
                Chega de planilha<br />para seu petshop.
              </h1>
              <p className="mt-5 text-lg text-white/75">
                Pets, agendamentos, equipe e lojas — tudo em um único painel.
                Você foca no que importa, a gente cuida da gestão.
              </p>

              {/* Social proof numbers */}
              <div className="mt-8 flex flex-wrap gap-6">
                {[
                  { num: "500+", label: "petshops ativos" },
                  { num: "12k",  label: "pets gerenciados" },
                  { num: "98%",  label: "satisfação" },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <div className="text-3xl font-extrabold">{s.num}</div>
                    <div className="mt-0.5 text-xs text-white/60">{s.label}</div>
                  </div>
                ))}
              </div>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/register"
                  className="flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-[#1c46f3] shadow-lg transition hover:opacity-95 hover:shadow-xl"
                >
                  Criar conta <ArrowRight size={15} />
                </Link>
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
                >
                  Entrar na conta
                </Link>
              </div>
            </div>

            {/* Right: UI mockup */}
            <div className="hidden lg:block">
              <div className="relative">
                <div className="overflow-hidden rounded-2xl border border-white/15 bg-white/8 shadow-2xl backdrop-blur-sm">
                  {/* Window chrome */}
                  <div className="flex items-center gap-1.5 border-b border-white/10 bg-white/5 px-4 py-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
                    <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
                    <div className="mx-auto h-5 w-48 rounded-full bg-white/10" />
                  </div>
                  {/* Dashboard preview */}
                  <div className="flex">
                    {/* Sidebar */}
                    <div className="w-12 shrink-0 border-r border-white/10 bg-white/5 px-2 py-4">
                      {[0,1,2,3,4,5].map(i => (
                        <div key={i} className={`mb-3 mx-auto h-7 w-7 rounded-xl ${i === 0 ? "bg-white/30" : "bg-white/8"}`} />
                      ))}
                    </div>
                    {/* Main */}
                    <div className="flex-1 p-4">
                      {/* Greeting bar */}
                      <div className="mb-4 h-5 w-48 rounded-full bg-white/20" />
                      {/* KPI cards */}
                      <div className="mb-4 grid grid-cols-3 gap-2">
                        {[
                          { val: "48",     label: "Atend./Mês", color: "bg-blue-400/25"    },
                          { val: "R$ 8k",  label: "Receita",    color: "bg-emerald-400/25" },
                          { val: "127",    label: "Pets",       color: "bg-amber-400/25"   },
                        ].map((kpi) => (
                          <div key={kpi.label} className="rounded-xl bg-white/10 p-3">
                            <div className={`mb-2 h-6 w-6 rounded-lg ${kpi.color}`} />
                            <div className="text-base font-bold text-white">{kpi.val}</div>
                            <div className="text-[10px] text-white/50">{kpi.label}</div>
                          </div>
                        ))}
                      </div>
                      {/* Appointment rows */}
                      {[
                        { status: "bg-emerald-400/40", w: "w-32" },
                        { status: "bg-yellow-400/40",  w: "w-28" },
                        { status: "bg-blue-400/40",    w: "w-24" },
                      ].map((row, i) => (
                        <div key={i} className="mb-2 flex items-center gap-2 rounded-xl bg-white/8 px-3 py-2">
                          <div className="h-8 w-8 shrink-0 rounded-xl bg-white/15" />
                          <div className="flex-1">
                            <div className={`mb-1 h-2.5 rounded-full bg-white/30 ${row.w}`} />
                            <div className="h-2 w-16 rounded-full bg-white/15" />
                          </div>
                          <div className={`h-5 w-16 rounded-full ${row.status}`} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Glow */}
                <div className="absolute inset-0 -z-10 scale-95 rounded-2xl bg-[#00bb69]/20 blur-2xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="mb-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900">Tudo que você precisa</h2>
          <p className="mt-2 text-sm text-gray-500">Uma plataforma completa para petshops de todos os tamanhos.</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:shadow-md">
              <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${f.bg}`}>
                <f.icon size={20} className={f.iconCls} />
              </div>
              <h3 className="font-semibold text-gray-900">{f.title}</h3>
              <p className="mt-1.5 text-sm text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="bg-white px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-bold text-gray-900">Quem já usa, aprova</h2>
            <p className="mt-2 text-sm text-gray-500">Donos de petshop reais, resultados reais.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {testimonials.map((t) => (
              <div key={t.name} className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-6">
                <Quote size={20} className="text-[#1c46f3]/30" />
                <p className="flex-1 text-sm leading-relaxed text-gray-700">"{t.quote}"</p>
                {/* Stars */}
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} size={13} className="fill-[#ffd200] text-[#ffd200]" />
                  ))}
                </div>
                <div className="flex items-center gap-3 border-t border-gray-200 pt-4">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${t.avatarCls}`}>
                    {t.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900">{t.name}</p>
                    <p className="truncate text-xs text-gray-400">{t.role}</p>
                    <p className="text-xs text-gray-400">{t.city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      

      {/* ── Final CTA ── */}
      <section className="bg-gradient-to-br from-gray-900 to-[#0f1a3a] px-6 py-20 text-white">
        <div className="mx-auto max-w-xl text-center">
          {/* Social proof */}
          <div className="mb-6 flex flex-col items-center gap-2">
            <div className="flex -space-x-2">
              {["AC", "CH", "MF", "RB", "LS"].map((ini, i) => (
                <div key={ini} className={`flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#0f1a3a] text-xs font-bold ${
                  i % 3 === 0 ? "bg-blue-400" : i % 3 === 1 ? "bg-violet-400" : "bg-emerald-400"
                } text-white`}>
                  {ini}
                </div>
              ))}
              <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#0f1a3a] bg-white/10 text-xs font-bold text-white">
                +495
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map((s) => <Star key={s} size={13} className="fill-[#ffd200] text-[#ffd200]" />)}
              </div>
              <span className="text-xs text-white/60">500+ petshops confiam no Apex</span>
            </div>
          </div>

          <h2 className="text-3xl font-extrabold leading-tight">
            Cresça com confiança.
          </h2>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/register"
              className="flex items-center gap-2 rounded-xl bg-white px-8 py-3 text-sm font-bold text-[#1c46f3] shadow-lg transition hover:opacity-95"
            >
              Criar conta <ArrowRight size={15} />
            </Link>
            <Link
              to="/login"
              className="flex items-center gap-2 rounded-xl border border-white/20 px-6 py-3 text-sm font-medium text-white/70 transition hover:border-white/40 hover:text-white"
            >
              Já tenho conta
            </Link>
          </div>

          
        </div>
      </section>

      <footer className="border-t border-gray-100 bg-white px-6 py-6 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} Apex Petstore. Todos os direitos reservados.
      </footer>
    </div>
  );
}
