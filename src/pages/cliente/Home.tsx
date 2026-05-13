import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  PawPrint, CalendarCheck, Scissors, Store, ArrowRight,
  Clock, CheckCircle2, XCircle, Lightbulb, Wallet,
  TrendingUp, Star, Sparkles,
} from "lucide-react";
import { getPets } from "../../services/petService";
import { getAppointments } from "../../services/atendimentoService";
import type { Pet } from "../../types/pet";
import type { Appointment } from "../../types/atendimento";

function getStoredUser() {
  try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; }
}

const statusConfig: Record<string, { label: string; icon: typeof Clock; cls: string }> = {
  agendado: { label: "Agendado",  icon: Clock,        cls: "text-yellow-600 bg-yellow-50 border-yellow-200" },
  concluido:{ label: "Concluído", icon: CheckCircle2, cls: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  cancelado:{ label: "Cancelado", icon: XCircle,      cls: "text-red-500 bg-red-50 border-red-200" },
};

const pgmtLabel: Record<string, string> = {
  pix: "Pix", cartao_credito: "Cartão Crédito",
  cartao_debito: "Cartão Débito", dinheiro: "Dinheiro",
};

const TIPS = [
  "Água fresca e limpa é fundamental — troque o recipiente diariamente.",
  "Passeios regulares reduzem ansiedade e mantêm o pet saudável.",
  "Escovação semanal previne nós e ajuda a detectar parasitas precocemente.",
  "Consulte o veterinário a cada 6 meses para manter as vacinas em dia.",
  "Brinquedos de estimulação mental previnem comportamentos destrutivos.",
  "Evite banhos muito frequentes — uma vez por semana costuma ser suficiente.",
  "Identifique seu pet com microchip ou plaquinha para mais segurança.",
];

export default function ClienteHome() {
  const user = getStoredUser();
  const userId: number = user.id;

  const [pets, setPets] = useState<Pet[]>([]);
  const [atendimentos, setAtendimentos] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [allPets, allAtendimentos] = await Promise.all([getPets(), getAppointments()]);
        setPets(allPets.filter((p) => p.dono_id === userId));
        setAtendimentos(
          allAtendimentos
            .filter((a) => a.cliente_id === userId)
            .sort((a, b) => new Date(b.data_atendimento).getTime() - new Date(a.data_atendimento).getTime())
        );
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    load();
  }, [userId]);

  const petsById = useMemo(() => Object.fromEntries(pets.map(p => [p.id, p])), [pets]);

  const agendados = atendimentos.filter((a) => a.status === "agendado");
  const concluidos = atendimentos.filter((a) => a.status === "concluido");

  const nextAgendado = useMemo(() =>
    [...agendados].sort((a, b) =>
      new Date(a.data_atendimento).getTime() - new Date(b.data_atendimento).getTime()
    )[0] ?? null,
    [agendados]
  );

  const gastoTotal = useMemo(() =>
    concluidos.reduce((sum, a) => sum + Number(a.valor_final), 0), [concluidos]
  );
  const mediaPorVisita = concluidos.length > 0 ? gastoTotal / concluidos.length : 0;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";
  const firstName = user.name?.split(" ")[0] ?? "Cliente";
  const tip = TIPS[new Date().getDay()];

  const quickLinks = [
    { to: "/pets",        label: "Meus Pets",    icon: PawPrint,      bg: "from-[#1c46f3]/10 to-[#1c46f3]/5",  iconCls: "text-[#1c46f3]",  count: pets.length },
    { to: "/atendimentos",label: "Agendamentos", icon: CalendarCheck, bg: "from-[#00bb69]/10 to-[#00bb69]/5",  iconCls: "text-[#00bb69]",  count: agendados.length },
    { to: "/servicos",    label: "Serviços",     icon: Scissors,      bg: "from-yellow-100 to-yellow-50",       iconCls: "text-yellow-600", count: null },
    { to: "/lojas",       label: "Lojas",        icon: Store,         bg: "from-purple-100 to-purple-50",       iconCls: "text-purple-600", count: null },
  ];

  const financialStats = [
    {
      label: "Gasto total",
      value: loading ? "—" : `R$ ${gastoTotal.toFixed(2)}`,
      icon: Wallet,
      iconCls: "text-[#1c46f3]",
      bg: "bg-[#1c46f3]/8",
    },
    {
      label: "Visitas realizadas",
      value: loading ? "—" : String(concluidos.length),
      icon: CheckCircle2,
      iconCls: "text-[#00bb69]",
      bg: "bg-[#00bb69]/8",
    },
    {
      label: "Média por visita",
      value: loading ? "—" : concluidos.length > 0 ? `R$ ${mediaPorVisita.toFixed(2)}` : "—",
      icon: TrendingUp,
      iconCls: "text-purple-600",
      bg: "bg-purple-100",
    },
    {
      label: "Total de pets",
      value: loading ? "—" : String(pets.length),
      icon: PawPrint,
      iconCls: "text-orange-500",
      bg: "bg-orange-100",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">

      {/* ── Greeting + tip ── */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm text-gray-400">
            {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
          </p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">{greeting}, {firstName}!</h1>
          <p className="mt-1 text-sm text-gray-500">
            {agendados.length > 0
              ? `Você tem ${agendados.length} atendimento${agendados.length > 1 ? "s" : ""} agendado${agendados.length > 1 ? "s" : ""}.`
              : "Nenhum atendimento agendado no momento."}
          </p>
        </div>

        {/* Tip of the day */}
        <div className="flex max-w-xs items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
          <Lightbulb size={16} className="mt-0.5 shrink-0 text-amber-500" />
          <div>
            <p className="text-xs font-semibold text-amber-700">Dica do dia</p>
            <p className="mt-0.5 text-xs leading-relaxed text-amber-600">{tip}</p>
          </div>
        </div>
      </div>

      {/* ── Próximo agendamento ── */}
      {!loading && nextAgendado && (
        <Link
          to="/atendimentos"
          className="group mb-6 flex items-center gap-4 rounded-2xl bg-gradient-to-r from-[#1c46f3] to-[#1840e0] p-5 shadow-md shadow-[#1c46f3]/20 transition hover:shadow-lg hover:shadow-[#1c46f3]/25"
        >
          <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-white/15 text-white">
            <span className="text-base font-bold leading-none">
              {new Date(nextAgendado.data_atendimento).getDate().toString().padStart(2, "0")}
            </span>
            <span className="text-xs">
              {new Date(nextAgendado.data_atendimento).toLocaleDateString("pt-BR", { month: "short" }).replace(".", "")}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/60">Próximo agendamento</p>
            <p className="mt-0.5 text-base font-bold text-white">
              {new Date(nextAgendado.data_atendimento).toLocaleDateString("pt-BR", {
                weekday: "long", day: "numeric", month: "long",
              })}
            </p>
            <p className="text-xs text-white/70">
              {petsById[nextAgendado.pet_id]?.nome
                ? `${petsById[nextAgendado.pet_id].nome} · `
                : ""}
              R$ {Number(nextAgendado.valor_final).toFixed(2)} · {pgmtLabel[nextAgendado.forma_pagamento] ?? nextAgendado.forma_pagamento}
            </p>
          </div>
          <ArrowRight size={18} className="shrink-0 text-white/60 transition group-hover:translate-x-0.5 group-hover:text-white" />
        </Link>
      )}

      {/* ── Quick links ── */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {quickLinks.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`group flex flex-col gap-3 rounded-2xl border border-gray-100 bg-gradient-to-br ${item.bg} p-5 transition hover:shadow-md`}
          >
            <div className="flex items-center justify-between">
              <item.icon size={22} className={item.iconCls} />
              {item.count !== null && (
                <span className="text-2xl font-bold text-gray-800">{loading ? "—" : item.count}</span>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">{item.label}</span>
              <ArrowRight size={14} className="text-gray-400 transition group-hover:translate-x-0.5" />
            </div>
          </Link>
        ))}
      </div>

      {/* ── Estatísticas financeiras ── */}
      <div className="mb-8 grid gap-3 grid-cols-2 lg:grid-cols-4">
        {financialStats.map((s) => (
          <div key={s.label} className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${s.bg}`}>
              <s.icon size={16} className={s.iconCls} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs text-gray-400">{s.label}</p>
              <p className="text-sm font-bold text-gray-900">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Bottom grid ── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Meus Pets */}
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-50 px-5 py-4">
            <h2 className="font-semibold text-gray-800">Meus Pets</h2>
            <Link to="/pets" className="text-xs font-medium text-[#1c46f3] hover:underline">Ver todos</Link>
          </div>
          {loading ? (
            <p className="px-5 py-6 text-sm text-gray-400">Carregando...</p>
          ) : pets.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <PawPrint size={32} className="mx-auto mb-2 text-gray-200" />
              <p className="text-sm text-gray-400">Nenhum pet cadastrado ainda.</p>
              <Link to="/pets" className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-[#1c46f3] hover:underline">
                Cadastrar pet <ArrowRight size={12} />
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {pets.slice(0, 4).map((pet) => {
                const hasObs = Boolean(pet.observacoes_saude);
                const tagsCount = pet.tags?.length ?? 0;
                return (
                  <div key={pet.id} className="flex items-center gap-3 px-5 py-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#1c46f3]/10 text-sm font-bold text-[#1c46f3]">
                      {pet.nome[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-800">{pet.nome}</p>
                      <p className="text-xs text-gray-400">
                        {[pet.raca, pet.porte].filter(Boolean).join(" · ") || "Sem detalhes"}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      {hasObs && (
                        <span className="rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-xs font-medium text-amber-600">
                          Obs.
                        </span>
                      )}
                      {tagsCount > 0 && (
                        <span className="rounded-full bg-[#1c46f3]/8 border border-[#1c46f3]/20 px-2 py-0.5 text-xs font-medium text-[#1c46f3]">
                          {tagsCount} {tagsCount === 1 ? "tag" : "tags"}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Atendimentos + Banner */}
        <div className="flex flex-col gap-4">
          {/* Atendimentos recentes */}
          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-50 px-5 py-4">
              <h2 className="font-semibold text-gray-800">Histórico recente</h2>
              <Link to="/atendimentos" className="text-xs font-medium text-[#1c46f3] hover:underline">Ver todos</Link>
            </div>
            {loading ? (
              <p className="px-5 py-6 text-sm text-gray-400">Carregando...</p>
            ) : atendimentos.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <CalendarCheck size={32} className="mx-auto mb-2 text-gray-200" />
                <p className="text-sm text-gray-400">Nenhum atendimento registrado.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {atendimentos.slice(0, 3).map((at) => {
                  const cfg = statusConfig[at.status] ?? statusConfig.agendado;
                  const petName = petsById[at.pet_id]?.nome;
                  return (
                    <div key={at.id} className="flex items-center gap-3 px-5 py-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#00bb69]/10">
                        <CalendarCheck size={15} className="text-[#00bb69]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-800">
                          {new Date(at.data_atendimento).toLocaleDateString("pt-BR")}
                          {petName && <span className="ml-1.5 font-normal text-gray-500">· {petName}</span>}
                        </p>
                        <p className="text-xs text-gray-400">
                          R$ {Number(at.valor_final).toFixed(2)} · {pgmtLabel[at.forma_pagamento] ?? at.forma_pagamento}
                        </p>
                      </div>
                      <span className={`flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cfg.cls}`}>
                        <cfg.icon size={11} />
                        {cfg.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Banner promocional */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500 to-purple-700 p-5 text-white">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/5" />
              <div className="absolute -bottom-6 left-8 h-24 w-24 rounded-full bg-white/5" />
            </div>
            <div className="relative flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-1.5">
                  <Sparkles size={14} className="text-yellow-300" />
                  <span className="text-xs font-bold uppercase tracking-widest text-white/70">Apex Petstore</span>
                </div>
                <h3 className="mt-2 text-base font-bold leading-snug">
                  Conheça nossos serviços de banho e tosa
                </h3>
                <p className="mt-1 text-xs text-white/70">
                  Cuide do seu pet com profissionais especializados.
                </p>
                <Link
                  to="/servicos"
                  className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-white/15 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/25"
                >
                  Ver serviços <ArrowRight size={12} />
                </Link>
              </div>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15">
                <Star size={22} className="text-yellow-300" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
