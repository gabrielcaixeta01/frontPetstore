import { useNavigate } from "react-router-dom";
import { PawPrint, CalendarCheck, Zap, CheckCircle, ArrowRight, Star, Clock, Shield } from "lucide-react";
import { apexTheme } from "../lib/theme";

export default function Home() {
  const c = apexTheme.colors;
  const navigate = useNavigate();

  const isLogged = !!localStorage.getItem("token");

  const features = [
    {
      icon: PawPrint,
      title: "Gestão de pets",
      description:
        "Organize informações dos animais, responsáveis, categorias, tags e histórico de atendimentos.",
      accent: "bg-[#1c46f3]/10 text-[#1c46f3]",
    },
    {
      icon: CalendarCheck,
      title: "Atendimentos integrados",
      description:
        "Acompanhe serviços prestados, pagamentos, unidades, clientes e funcionários em um só lugar.",
      accent: "bg-[#00bb69]/10 text-[#00bb69]",
    },
    {
      icon: Zap,
      title: "Operação simples",
      description:
        "Uma interface clara, moderna e objetiva para facilitar o uso diário do sistema.",
      accent: "bg-[#ffd200]/20 text-yellow-600",
    },
  ];

  const highlights = [
    "Cadastro de clientes e pets",
    "Controle de lojas e serviços",
    "Histórico de atendimentos",
    "Organização por categorias e tags",
  ];

  const stats = [
    { icon: PawPrint, label: "Pets", value: "Gestão completa", color: "text-[#1c46f3]", bg: "bg-white" },
    { icon: CalendarCheck, label: "Atendimentos", value: "Histórico detalhado", color: "text-[#00bb69]", bg: "bg-[#00bb69]/10" },
    { icon: Star, label: "Serviços", value: "Catálogo de preços", color: "text-yellow-600", bg: "bg-yellow-100" },
    { icon: Clock, label: "Tempo real", value: "Dados atualizados", color: "text-purple-600", bg: "bg-purple-100" },
  ];

  return (
    <div className={`min-h-screen ${c.bg} ${c.text}`}>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(28,70,243,0.14),transparent_35%),radial-gradient(circle_at_left,rgba(0,187,105,0.14),transparent_30%)]" />

        <div className="relative mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-28">
          <div className="grid items-center gap-14 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-8">
              <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-sm ${c.secondary} ${c.secondaryText}`}>
                <Shield size={14} />
                Apex Petstore • Gestão inteligente para petshops
              </div>

              <div className="space-y-5">
                <h1 className="max-w-4xl text-5xl font-bold leading-tight md:text-6xl">
                  Tecnologia para cuidar melhor de cada pet.
                </h1>

                <p className={`max-w-3xl text-lg leading-8 ${c.textSoft}`}>
                  A Apex Petstore é uma plataforma pensada para simplificar a
                  rotina de petshops, reunindo em um só sistema o cadastro de
                  pets, clientes, serviços, lojas e atendimentos.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {highlights.map((item) => (
                  <div
                    key={item}
                    className={`flex items-center gap-3 rounded-2xl border ${c.border} ${c.card} px-5 py-4 text-sm font-medium shadow-sm`}
                  >
                    <CheckCircle size={16} className="shrink-0 text-[#00bb69]" />
                    {item}
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => navigate(isLogged ? "/pets" : "/login")}
                  className="flex items-center gap-2 rounded-xl bg-[#1c46f3] px-6 py-3 font-semibold text-white transition hover:bg-[#1538c9]"
                >
                  {isLogged ? "Acessar sistema" : "Começar agora"}
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>

            {/* Painel lateral com stats */}
            <div className={`rounded-4xl border ${c.border} ${c.card} p-6 shadow-xl`}>
              <div className="rounded-3xl bg-gradient-to-br from-[#1c46f3] via-[#1840e0] to-[#00bb69] p-8 text-white">
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#ffd200]">
                  Apex Petstore
                </p>

                <h2 className="mt-4 text-2xl font-bold leading-tight">
                  Tudo que seu petshop precisa em um único lugar.
                </h2>

                <div className="mt-8 grid grid-cols-2 gap-3">
                  {stats.map((stat) => (
                    <div key={stat.label} className="rounded-2xl bg-white/10 p-4">
                      <div className={`mb-2 inline-flex rounded-lg ${stat.bg} p-2`}>
                        <stat.icon size={16} className={stat.color} />
                      </div>
                      <p className="text-xs text-white/60">{stat.label}</p>
                      <p className="mt-0.5 text-sm font-semibold">{stat.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Feature cards */}
          <div className="mt-20 grid gap-5 md:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className={`rounded-3xl border ${c.border} ${c.card} p-6 shadow-sm`}
              >
                <div className={`mb-4 inline-flex rounded-2xl p-3 ${feature.accent}`}>
                  <feature.icon size={22} />
                </div>

                <h3 className={`text-xl font-bold ${c.text}`}>
                  {feature.title}
                </h3>

                <p className={`mt-3 text-sm leading-6 ${c.textSoft}`}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
