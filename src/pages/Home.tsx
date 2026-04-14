import { Link } from "react-router-dom";
import { apexTheme } from "../lib/theme";

export default function Home() {
  const c = apexTheme.colors;

  const modules = [
    { title: "Pets", to: "/pets", description: "Cadastro de animais, raça, porte e dono." },
    { title: "Categorias", to: "/categorias", description: "Organização e classificação dos tipos de pet." },
    { title: "Serviços", to: "/servicos", description: "Catálogo com nome, descrição e preço." },
    { title: "Lojas", to: "/lojas", description: "Unidades com endereço e contato." },
    { title: "Usuários", to: "/usuarios", description: "Pessoas do sistema com perfil e status." },
    { title: "Tags", to: "/tags", description: "Classificação e organização de pets." },
    { title: "Atendimentos", to: "/atendimentos", description: "Pagamento, loja, cliente e funcionário." },
  ];

  return (
    <div className={`min-h-screen ${c.bg} ${c.text}`}>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(28,70,243,0.12),transparent_35%),radial-gradient(circle_at_left,rgba(0,187,105,0.12),transparent_28%)]" />
        <div className="relative mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-28">
          <div className="space-y-12">
            <div className="space-y-6">
              <div className="inline-flex items-center rounded-full border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 shadow-sm">
                Petstore da ApexBrasil
              </div>

              <div className="space-y-5">
                <h1 className="max-w-4xl text-5xl font-bold leading-tight md:text-6xl">
                  Gestão completa para o petshop
                </h1>
                <p className={`max-w-3xl text-lg ${c.textSoft}`}>
                  Uma interface clara para testar e operar os principais CRUDs do sistema,
                  com foco em usuários, pets, tags e atendimentos.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <Link
                  to="/pets"
                  className={`rounded-2xl px-6 py-3 font-semibold transition ${c.primary} ${c.primaryText}`}
                >
                  Acessar pets
                </Link>
                <Link
                  to="/atendimentos"
                  className={`rounded-2xl px-6 py-3 font-semibold transition ${c.secondary} ${c.secondaryText}`}
                >
                  Ver atendimentos
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {modules.map((module) => (
                <Link
                  key={module.to}
                  to={module.to}
                  className={`rounded-2xl border ${c.border} ${c.card} p-5 transition hover:-translate-y-1 hover:shadow-md`}
                >
                  <p className={`text-sm ${c.textMuted}`}>{module.title}</p>
                  <p className={`mt-2 text-sm ${c.textSoft}`}>{module.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}