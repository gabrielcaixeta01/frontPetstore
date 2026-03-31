import { Link } from "react-router-dom";
import { apexTheme } from "../lib/theme";

export default function Home() {
  const c = apexTheme.colors;

  return (
    <div className={`min-h-screen ${c.bg} ${c.text}`}>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,168,137,0.22),transparent_35%),radial-gradient(circle_at_left,rgba(242,201,76,0.12),transparent_28%)]" />
        <div className="relative mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="space-y-8">
              <div className="inline-flex items-center rounded-full border border-[#2d726b] bg-[#0f2f2d]/80 px-4 py-2 text-sm text-[#cfe6e2] backdrop-blur">
                Petstore da ApexBrasil
              </div>

              <div className="space-y-5">
                <h1 className="max-w-3xl text-5xl font-bold leading-tight md:text-6xl">
                  Gestão moderna para pets, usuários, pedidos e categorias.
                </h1>
                <p className={`max-w-2xl text-lg ${c.textSoft}`}>
                  Um painel limpo, rápido e pronto para integrar com FastAPI,
                  organizado para administrar o ecossistema completo da
                  Petstore da ApexBrasil.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <Link
                  to="/pets"
                  className={`rounded-2xl px-6 py-3 font-semibold transition ${c.primary} ${c.primaryText} ${c.primaryHover}`}
                >
                  Acessar pets
                </Link>
                <Link
                  to="/orders"
                  className={`rounded-2xl px-6 py-3 font-semibold transition ${c.secondary} ${c.secondaryText} ${c.secondaryHover}`}
                >
                  Ver pedidos
                </Link>
              </div>

              <div className="grid gap-4 pt-4 sm:grid-cols-3">
                <div className={`rounded-2xl border ${c.border} ${c.card} p-5`}>
                  <p className={`text-sm ${c.textMuted}`}>Módulos</p>
                  <p className="mt-2 text-2xl font-bold">5 páginas</p>
                </div>
                <div className={`rounded-2xl border ${c.border} ${c.card} p-5`}>
                  <p className={`text-sm ${c.textMuted}`}>Integração</p>
                  <p className="mt-2 text-2xl font-bold">FastAPI REST</p>
                </div>
                <div className={`rounded-2xl border ${c.border} ${c.card} p-5`}>
                  <p className={`text-sm ${c.textMuted}`}>Frontend</p>
                  <p className="mt-2 text-2xl font-bold">React + Vite</p>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              <div className={`rounded-3xl border ${c.border} ${c.card} p-6`}>
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className={`text-sm ${c.textMuted}`}>Visão geral</p>
                    <h2 className="text-2xl font-semibold">Painel central</h2>
                  </div>
                  <div className="rounded-xl bg-[#0b2725] px-3 py-2 text-sm text-[#9ed4cb]">
                    Online
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Link
                    to="/pets"
                    className={`rounded-2xl border ${c.border} ${c.cardSoft} p-5 transition hover:scale-[1.01]`}
                  >
                    <p className={`text-sm ${c.textMuted}`}>Cadastro</p>
                    <h3 className="mt-1 text-xl font-semibold">Pets</h3>
                    <p className={`mt-2 text-sm ${c.textSoft}`}>
                      Gerencie pets, status e categoria.
                    </p>
                  </Link>

                  <Link
                    to="/users"
                    className={`rounded-2xl border ${c.border} ${c.cardSoft} p-5 transition hover:scale-[1.01]`}
                  >
                    <p className={`text-sm ${c.textMuted}`}>Cadastro</p>
                    <h3 className="mt-1 text-xl font-semibold">Usuários</h3>
                    <p className={`mt-2 text-sm ${c.textSoft}`}>
                      Controle perfis e permissões.
                    </p>
                  </Link>

                  <Link
                    to="/orders"
                    className={`rounded-2xl border ${c.border} ${c.cardSoft} p-5 transition hover:scale-[1.01]`}
                  >
                    <p className={`text-sm ${c.textMuted}`}>Operação</p>
                    <h3 className="mt-1 text-xl font-semibold">Pedidos</h3>
                    <p className={`mt-2 text-sm ${c.textSoft}`}>
                      Acompanhe compras e entregas.
                    </p>
                  </Link>

                  <Link
                    to="/tags"
                    className={`rounded-2xl border ${c.border} ${c.cardSoft} p-5 transition hover:scale-[1.01]`}
                  >
                    <p className={`text-sm ${c.textMuted}`}>Organização</p>
                    <h3 className="mt-1 text-xl font-semibold">Tags</h3>
                    <p className={`mt-2 text-sm ${c.textSoft}`}>
                      Classifique pets com mais flexibilidade.
                    </p>
                  </Link>
                </div>
              </div>

              <div className={`rounded-3xl border ${c.border} ${c.card} p-6`}>
                <p className={`text-sm ${c.textMuted}`}>Proposta visual</p>
                <p className={`mt-2 text-base ${c.textSoft}`}>
                  Interface escura, limpa e institucional, com contraste forte,
                  cartões bem definidos e destaques em verde e amarelo.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}