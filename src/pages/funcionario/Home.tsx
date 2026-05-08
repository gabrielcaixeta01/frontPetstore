import { useNavigate } from "react-router-dom";
import {
  PawPrint,
  CalendarCheck,
  Zap,
  ArrowRight,
  Shield,
  Store,
  LayoutGrid,
  Tag,
  Users,
  CheckCircle,
  Scissors,
} from "lucide-react";

export default function Home() {
  const navigate = useNavigate();
  const isLogged = !!localStorage.getItem("token");

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden">

      {/* ─────────── HERO ─────────── */}
      <section className="relative overflow-hidden pb-0 pt-20 md:pt-28">
        {/* Blobs decorativos */}
        <div className="pointer-events-none absolute inset-0 -z-0">
          <div className="absolute right-0 top-0 h-[600px] w-[600px] -translate-y-1/3 translate-x-1/3 rounded-full bg-[#1c46f3]/6 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-[500px] w-[500px] translate-y-1/3 -translate-x-1/3 rounded-full bg-[#00bb69]/6 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-5xl px-6 text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#1c46f3]/20 bg-[#1c46f3]/5 px-4 py-1.5 text-sm font-semibold text-[#1c46f3]">
            <Shield size={13} />
            Gestão inteligente para petshops
          </div>

          {/* Headline */}
          <h1 className="text-5xl font-bold leading-tight tracking-tight md:text-7xl">
            O sistema que seu{" "}
            <span className="bg-gradient-to-r from-[#1c46f3] to-[#00bb69] bg-clip-text text-transparent">
              petshop merecia.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-500">
            Apex Petstore reúne pets, clientes, lojas, serviços e atendimentos
            em um único sistema — simples de usar, poderoso o suficiente para crescer com você.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => navigate(isLogged ? "/pets" : "/login")}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#1c46f3] to-[#1840e0] px-7 py-3.5 font-semibold text-white shadow-lg shadow-[#1c46f3]/30 transition hover:opacity-90"
            >
              {isLogged ? "Acessar sistema" : "Começar agora"}
              <ArrowRight size={16} />
            </button>

            {!isLogged && (
              <button
                onClick={() => navigate("/register")}
                className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-7 py-3.5 font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Criar conta grátis
              </button>
            )}
          </div>

          {/* Social proof mini */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
            {["Gestão de pets", "Controle de lojas", "Histórico completo", "Fácil de usar"].map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <CheckCircle size={14} className="text-[#00bb69]" />
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* ── Dashboard mock ── */}
        <div className="relative z-10 mx-auto mt-16 max-w-6xl px-6">
          <div className="overflow-hidden rounded-t-3xl border border-b-0 border-gray-200 bg-white shadow-2xl shadow-gray-200/80">
            {/* Barra do navegador */}
            <div className="flex items-center gap-3 border-b border-gray-100 bg-gray-50/80 px-5 py-3">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-400/80" />
                <div className="h-3 w-3 rounded-full bg-yellow-400/80" />
                <div className="h-3 w-3 rounded-full bg-green-400/80" />
              </div>
              <div className="flex flex-1 items-center gap-2 rounded-lg bg-white border border-gray-200 px-3 py-1.5 mx-4">
                <div className="h-2 w-2 rounded-full bg-[#1c46f3]/40" />
                <div className="h-2 w-40 rounded-full bg-gray-200" />
              </div>
            </div>

            {/* Conteúdo do mock */}
            <div className="grid lg:grid-cols-[220px_1fr]">
              {/* Sidebar mock */}
              <div className="hidden border-r border-gray-100 bg-gray-50/60 p-4 lg:block">
                <div className="mb-4 flex items-center gap-2">
                  <PawPrint size={16} className="text-[#1c46f3]" />
                  <span className="text-sm font-bold text-gray-800">Apex Petstore</span>
                </div>
                <div className="space-y-1">
                  {[
                    { icon: PawPrint, label: "Pets", active: true },
                    { icon: CalendarCheck, label: "Atendimentos", active: false },
                    { icon: Scissors, label: "Serviços", active: false },
                    { icon: Store, label: "Lojas", active: false },
                    { icon: Users, label: "Usuários", active: false },
                    { icon: Tag, label: "Tags", active: false },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm ${
                        item.active
                          ? "bg-[#1c46f3] text-white font-semibold"
                          : "text-gray-500"
                      }`}
                    >
                      <item.icon size={14} />
                      {item.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Main content mock */}
              <div className="bg-gray-50/40 p-5">
                {/* Stats row */}
                <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                  {[
                    { label: "Pets", value: "247", color: "text-[#1c46f3]", bg: "bg-[#1c46f3]/8", icon: PawPrint },
                    { label: "Atendimentos", value: "1.2k", color: "text-[#00bb69]", bg: "bg-[#00bb69]/8", icon: CalendarCheck },
                    { label: "Clientes", value: "183", color: "text-purple-600", bg: "bg-purple-50", icon: Users },
                    { label: "Lojas", value: "12", color: "text-yellow-600", bg: "bg-yellow-50", icon: Store },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                      <div className={`mb-2 inline-flex rounded-xl p-2 ${stat.bg}`}>
                        <stat.icon size={14} className={stat.color} />
                      </div>
                      <p className="text-xs text-gray-400">{stat.label}</p>
                      <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                    </div>
                  ))}
                </div>

                {/* Two column mock */}
                <div className="grid gap-3 md:grid-cols-[1fr_300px]">
                  {/* Lista de pets */}
                  <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                      <span className="text-sm font-semibold text-gray-700">Pets recentes</span>
                      <span className="text-xs font-medium text-[#1c46f3]">Ver todos</span>
                    </div>
                    <div className="divide-y divide-gray-50">
                      {[
                        { name: "Rex", breed: "Golden Retriever", status: "Ativo", badge: "text-emerald-600 bg-emerald-50", initial: "R", size: "Grande" },
                        { name: "Mia", breed: "Siamês", status: "Ativo", badge: "text-emerald-600 bg-emerald-50", initial: "M", size: "Pequeno" },
                        { name: "Bolinha", breed: "Poodle Toy", status: "Aguardando", badge: "text-yellow-600 bg-yellow-50", initial: "B", size: "Pequeno" },
                        { name: "Thor", breed: "Labrador", status: "Ativo", badge: "text-emerald-600 bg-emerald-50", initial: "T", size: "Grande" },
                      ].map((pet) => (
                        <div key={pet.name} className="flex items-center gap-3 px-4 py-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#1c46f3]/10 text-xs font-bold text-[#1c46f3]">
                            {pet.initial}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800">{pet.name}</p>
                            <p className="text-xs text-gray-400">{pet.breed} • {pet.size}</p>
                          </div>
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${pet.badge}`}>
                            {pet.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sidebar cards */}
                  <div className="hidden space-y-3 md:block">
                    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Próximo atendimento
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#00bb69]/10">
                          <CalendarCheck size={16} className="text-[#00bb69]" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">Banho — Rex</p>
                          <p className="text-xs text-gray-400">Hoje, 14h00 • Loja Centro</p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                        Serviços populares
                      </p>
                      <div className="space-y-2">
                        {[
                          { name: "Banho e Tosa", pct: 72 },
                          { name: "Consulta Vet.", pct: 48 },
                          { name: "Pet Hotel", pct: 31 },
                        ].map((s) => (
                          <div key={s.name}>
                            <div className="mb-1 flex justify-between text-xs">
                              <span className="text-gray-600">{s.name}</span>
                              <span className="font-semibold text-[#1c46f3]">{s.pct}%</span>
                            </div>
                            <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-[#1c46f3] to-[#00bb69]"
                                style={{ width: `${s.pct}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────── STATS ─────────── */}
      <section className="border-y border-gray-100 bg-gray-50 py-14">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { value: "100%", label: "Web — acesso de qualquer lugar", color: "text-[#1c46f3]" },
              { value: "7+", label: "Módulos de gestão integrados", color: "text-[#00bb69]" },
              { value: "∞", label: "Pets e clientes cadastráveis", color: "text-purple-600" },
              { value: "1", label: "Sistema, tudo centralizado", color: "text-yellow-500" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className={`text-4xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="mt-2 text-sm text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────── FEATURES BENTO ─────────── */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          {/* Título da seção */}
          <div className="mb-12 text-center">
            <span className="inline-block rounded-full bg-[#00bb69]/10 px-4 py-1.5 text-sm font-semibold text-[#00bb69]">
              Funcionalidades
            </span>
            <h2 className="mt-4 text-3xl font-bold md:text-4xl">
              Tudo que você precisa,{" "}
              <span className="bg-gradient-to-r from-[#1c46f3] to-[#00bb69] bg-clip-text text-transparent">
                sem o que não precisa.
              </span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-gray-500">
              Módulos pensados para a rotina real de um petshop, sem complexidade desnecessária.
            </p>
          </div>

          {/* Bento grid */}
          <div className="grid gap-4 md:grid-cols-3">
            {/* Card grande — Pets */}
            <div className="group relative overflow-hidden rounded-3xl border border-gray-200 bg-gradient-to-br from-[#1c46f3]/5 to-white p-8 md:col-span-2">
              <div className="mb-4 inline-flex rounded-2xl bg-[#1c46f3]/10 p-3">
                <PawPrint size={26} className="text-[#1c46f3]" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Gestão de Pets</h3>
              <p className="mt-3 text-gray-500 leading-relaxed">
                Cadastre animais com raça, porte, peso, observações de saúde e
                vincule cada pet ao seu dono. Filtre por categoria e acompanhe
                o histórico de atendimentos de cada um.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {["Raça", "Porte", "Peso", "Dono", "Categoria", "Tags", "Histórico"].map((tag) => (
                  <span key={tag} className="rounded-full border border-[#1c46f3]/20 bg-[#1c46f3]/5 px-3 py-1 text-xs font-medium text-[#1c46f3]">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Card pequeno — Categorias */}
            <div className="rounded-3xl border border-gray-200 bg-gradient-to-br from-[#00bb69]/5 to-white p-7">
              <div className="mb-4 inline-flex rounded-2xl bg-[#00bb69]/10 p-3">
                <LayoutGrid size={22} className="text-[#00bb69]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Categorias & Tags</h3>
              <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                Classifique pets com categorias personalizadas e tags reutilizáveis para facilitar filtros e buscas.
              </p>
            </div>

            {/* Card pequeno — Serviços */}
            <div className="rounded-3xl border border-gray-200 bg-gradient-to-br from-yellow-50 to-white p-7">
              <div className="mb-4 inline-flex rounded-2xl bg-yellow-100 p-3">
                <Scissors size={22} className="text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Serviços</h3>
              <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                Gerencie o catálogo de serviços com nome, descrição e preço. Vincule diretamente aos atendimentos.
              </p>
            </div>

            {/* Card grande — Atendimentos */}
            <div className="group relative overflow-hidden rounded-3xl border border-gray-200 bg-gradient-to-br from-purple-50 to-white p-8 md:col-span-2">
              <div className="mb-4 inline-flex rounded-2xl bg-purple-100 p-3">
                <CalendarCheck size={26} className="text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Atendimentos Integrados</h3>
              <p className="mt-3 text-gray-500 leading-relaxed">
                Registre atendimentos com vínculo entre loja, cliente, funcionário, pet e serviços realizados.
                Controle pagamentos, status e observações em um único lugar.
              </p>
              <div className="mt-6 grid grid-cols-3 gap-3">
                {[
                  { label: "Status", value: "Pendente / Concluído" },
                  { label: "Pagamento", value: "Forma registrada" },
                  { label: "Serviços", value: "Múltiplos por atend." },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-purple-100 bg-white px-3 py-3">
                    <p className="text-xs text-gray-400">{item.label}</p>
                    <p className="mt-0.5 text-xs font-semibold text-purple-700">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Card pequeno — Lojas */}
            <div className="rounded-3xl border border-gray-200 bg-gradient-to-br from-[#1c46f3]/5 to-white p-7">
              <div className="mb-4 inline-flex rounded-2xl bg-purple-100 p-3">
                <Store size={22} className="text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Lojas & Equipes</h3>
              <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                Cadastre unidades com endereço completo e visualize os funcionários vinculados a cada loja.
              </p>
            </div>

            {/* Card pequeno — Usuários */}
            <div className="rounded-3xl border border-gray-200 bg-gradient-to-br from-emerald-50 to-white p-7">
              <div className="mb-4 inline-flex rounded-2xl bg-emerald-100 p-3">
                <Users size={22} className="text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Usuários</h3>
              <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                Clientes e funcionários com perfis distintos, dados de contato e controle de acesso ao sistema.
              </p>
            </div>

            {/* Card pequeno — Operação */}
            <div className="rounded-3xl border border-gray-200 bg-gradient-to-br from-orange-50 to-white p-7">
              <div className="mb-4 inline-flex rounded-2xl bg-orange-100 p-3">
                <Zap size={22} className="text-orange-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Rápido e direto</h3>
              <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                Interface pensada para uso diário — sem curva de aprendizado, sem telas desnecessárias.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────── CTA BANNER ─────────── */}
      <section className="mx-6 mb-20 overflow-hidden rounded-3xl bg-gradient-to-br from-[#1c46f3] via-[#1840e0] to-[#00bb69] md:mx-10">
        {/* Decoração */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/5" />
          <div className="absolute -bottom-16 left-1/3 h-48 w-48 rounded-full bg-[#ffd200]/10" />
        </div>

        <div className="relative px-10 py-16 text-center text-white">
          <span className="inline-block rounded-full bg-[#ffd200] px-4 py-1 text-xs font-bold uppercase tracking-widest text-gray-900">
            Comece agora
          </span>
          <h2 className="mx-auto mt-5 max-w-2xl text-3xl font-bold leading-tight md:text-4xl">
            Seu petshop organizado e eficiente a partir de hoje.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-white/70">
            Crie sua conta gratuitamente e tenha acesso imediato a todos os módulos da plataforma.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => navigate(isLogged ? "/pets" : "/register")}
              className="flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 font-bold text-[#1c46f3] shadow-xl transition hover:bg-gray-50"
            >
              {isLogged ? "Acessar sistema" : "Criar conta grátis"}
              <ArrowRight size={16} />
            </button>
            {isLogged && (
              <button
                onClick={() => navigate("/login")}
                className="flex items-center gap-2 rounded-xl border border-white/30 px-8 py-3.5 font-semibold text-white transition hover:bg-white/10"
              >
                Já tenho conta
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
