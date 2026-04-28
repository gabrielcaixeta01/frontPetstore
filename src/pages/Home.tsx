import { apexTheme } from "../lib/theme";

export default function Home() {
  const c = apexTheme.colors;

  const features = [
    {
      title: "Gestão de pets",
      description:
        "Organize informações dos animais, responsáveis, categorias, tags e histórico de atendimentos.",
    },
    {
      title: "Atendimentos integrados",
      description:
        "Acompanhe serviços prestados, pagamentos, unidades, clientes e funcionários em um só lugar.",
    },
    {
      title: "Operação simples",
      description:
        "Uma interface clara, moderna e objetiva para facilitar o uso diário do sistema.",
    },
  ];

  const highlights = [
    "Cadastro de clientes e pets",
    "Controle de lojas e serviços",
    "Histórico de atendimentos",
    "Organização por categorias e tags",
  ];

  return (
    <div className={`min-h-screen ${c.bg} ${c.text}`}>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(28,70,243,0.14),transparent_35%),radial-gradient(circle_at_left,rgba(0,187,105,0.14),transparent_30%)]" />

        <div className="relative mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-28">
          <div className="grid items-center gap-14 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-8">
              <div className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold shadow-sm ${c.secondary} ${c.secondaryText}`}>
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
                    className={`rounded-2xl border ${c.border} ${c.card} px-5 py-4 text-sm font-medium shadow-sm`}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className={`rounded-4xl border ${c.border} ${c.card} p-6 shadow-xl`}>
              <div className="rounded-3xl bg-linear-to-br from-[#1c46f3] via-[#1840e0] to-[#00bb69] p-8 text-white">
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#ffd200]">
                  Apex Petstore
                </p>

                <h2 className="mt-6 text-3xl font-bold leading-tight">
                  Uma experiência mais organizada para sua operação.
                </h2>

                <p className="mt-4 text-white/75">
                  Centralize dados, reduza tarefas manuais e acompanhe os
                  principais fluxos do petshop com mais clareza.
                </p>

                <div className="mt-8 grid gap-4">
                  <div className="rounded-2xl bg-white/10 p-4">
                    <p className="text-sm text-white/60">Foco</p>
                    <p className="mt-1 font-semibold">Gestão eficiente</p>
                  </div>

                  <div className="rounded-2xl bg-white/10 p-4">
                    <p className="text-sm text-white/60">Interface</p>
                    <p className="mt-1 font-semibold">Clara e profissional</p>
                  </div>

                  <div className="rounded-2xl bg-white/10 p-4">
                    <p className="text-sm text-white/60">Sistema</p>
                    <p className="mt-1 font-semibold">Integrado e escalável</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-20 grid gap-5 md:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className={`rounded-3xl border ${c.border} ${c.card} p-6 shadow-sm`}
              >
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