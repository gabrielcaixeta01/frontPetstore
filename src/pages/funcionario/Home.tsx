import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  PawPrint, CalendarCheck, Users, Store,
  Clock, CheckCircle2, XCircle, TrendingUp,
  ArrowRight, ArrowUp, ArrowDown,
  AlertTriangle,
} from "lucide-react";
import { getPets } from "../../services/petService";
import { getAppointments } from "../../services/atendimentoService";
import { getLojas } from "../../services/lojaService";
import { getServicos } from "../../services/servicoService";
import type { Atendimento } from "../../types/atendimento";
import type { Loja } from "../../types/loja";
import { useFuncionarioStore } from "../../hooks/useFuncionarioStore";

function getStoredUser() {
  try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; }
}

const statusConfig: Record<string, { label: string; icon: typeof Clock; cls: string }> = {
  agendado:  { label: "Agendado",  icon: Clock,        cls: "text-yellow-700 bg-yellow-50 border-yellow-200"   },
  concluido: { label: "Concluído", icon: CheckCircle2, cls: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  cancelado: { label: "Cancelado", icon: XCircle,      cls: "text-red-600 bg-red-50 border-red-200"             },
};

function formatKPIMoney(v: number) {
  if (v >= 10_000) return `R$ ${(v / 1000).toFixed(1)}k`;
  return `R$ ${Math.round(v).toLocaleString("pt-BR")}`;
}

function pct(current: number, prev: number): number | null {
  if (prev === 0) return null;
  return ((current - prev) / prev) * 100;
}

function sameYM(date: Date, year: number, month: number) {
  return date.getFullYear() === year && date.getMonth() === month;
}

function Delta({ value }: { value: number | null }) {
  if (value === null) return <span className="text-xs text-gray-300">—</span>;
  const pos = value >= 0;
  return (
    <span className={`flex items-center gap-0.5 text-xs font-semibold ${pos ? "text-emerald-600" : "text-red-500"}`}>
      {pos ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
      {Math.abs(value).toFixed(0)}% vs mês ant.
    </span>
  );
}

export default function FuncionarioHome() {
  const { lojaId } = useFuncionarioStore();
  const user = getStoredUser();
  const firstName = user.name?.split(" ")[0] ?? "Funcionário";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

  const now = new Date();
  const thisYear = now.getFullYear();
  const thisMonth = now.getMonth();
  const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
  const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;

  const [atendimentos, setAtendimentos] = useState<Atendimento[]>([]);
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [petsById, setPetsById] = useState<Record<number, string>>({});
  const [servicosById, setServicosById] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [pets, allAtend, allLojas, allServicos] = await Promise.all([
          getPets(),
          getAppointments(),
          getLojas(),
          getServicos().catch(() => []),
        ]);
        setAtendimentos(allAtend.sort((a, b) => new Date(b.data_atendimento).getTime() - new Date(a.data_atendimento).getTime()));
        setLojas(allLojas);
        setPetsById(Object.fromEntries(pets.map((p) => [p.id, p.nome])));
        setServicosById(Object.fromEntries(allServicos.map((s) => [s.id, s.nome])));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // ── Current store ───────────────────────────────────────────
  const lojaInfo = useMemo(
    () => lojaId != null ? lojas.find((l) => l.id === lojaId) ?? null : null,
    [lojas, lojaId],
  );

  // ── Filter by employee's store ──────────────────────────────
  const filteredAtend = useMemo(
    () => lojaId != null ? atendimentos.filter((a) => a.loja_id === lojaId) : atendimentos,
    [atendimentos, lojaId],
  );

  // ── Monthly splits ──────────────────────────────────────────
  const atendMes = useMemo(
    () => filteredAtend.filter((a) => sameYM(new Date(a.data_atendimento), thisYear, thisMonth)),
    [filteredAtend],
  );
  const atendMesAnt = useMemo(
    () => filteredAtend.filter((a) => sameYM(new Date(a.data_atendimento), lastMonthYear, lastMonth)),
    [filteredAtend],
  );
  const revenueMes    = useMemo(() => atendMes.filter((a) => a.status === "concluido").reduce((s, a) => s + Number(a.valor_final), 0), [atendMes]);
  const revenueMesAnt = useMemo(() => atendMesAnt.filter((a) => a.status === "concluido").reduce((s, a) => s + Number(a.valor_final), 0), [atendMesAnt]);
  const atendDelta    = useMemo(() => pct(atendMes.length, atendMesAnt.length),   [atendMes, atendMesAnt]);
  const revenueDelta  = useMemo(() => pct(revenueMes, revenueMesAnt),              [revenueMes, revenueMesAnt]);

  // ── Store-specific client & pet counts ──────────────────────
  const clientesNaLoja = useMemo(
    () => new Set(filteredAtend.map((a) => a.cliente_id)).size,
    [filteredAtend],
  );
  const petsNaLoja = useMemo(
    () => new Set(filteredAtend.map((a) => a.pet_id)).size,
    [filteredAtend],
  );
  const clientesNovosMes = useMemo(() => {
    const anteriores = new Set(
      filteredAtend
        .filter((a) => !sameYM(new Date(a.data_atendimento), thisYear, thisMonth))
        .map((a) => a.cliente_id),
    );
    return atendMes.reduce((count, a) => (!anteriores.has(a.cliente_id) ? count + 1 : count), 0);
  }, [filteredAtend, atendMes]);

  // ── Operational alerts ──────────────────────────────────────
  const agendadosAtrasados = useMemo(() => {
    const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
    return filteredAtend.filter((a) => a.status === "agendado" && new Date(a.data_atendimento) < hoje).length;
  }, [filteredAtend]);
  const canceladosMes = useMemo(
    () => atendMes.filter((a) => a.status === "cancelado").length,
    [atendMes],
  );
  const hasAlerts = agendadosAtrasados > 0 || canceladosMes > 0;

  // ── Monthly volume chart ────────────────────────────────────
  const monthlyChart = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredAtend.forEach((a) => {
      const d = new Date(a.data_atendimento);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      counts[key] = (counts[key] ?? 0) + 1;
    });
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(); d.setDate(1);
      d.setMonth(d.getMonth() - (5 - i));
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      return { label: d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""), value: counts[key] ?? 0 };
    });
  }, [filteredAtend]);
  const chartMax = Math.max(...monthlyChart.map((m) => m.value), 1);

  function serviceNames(at: Atendimento): string {
    if (!at.items?.length) return "";
    return at.items.map((item) => servicosById[item.service_id] ?? `Serviço #${item.service_id}`).join(", ");
  }

  // ── KPI config ───────────────────────────────────────────────
  const kpis = [
    {
      label: "Atendimentos / mês",
      value: loading ? "—" : String(atendMes.length),
      delta: atendDelta,
      badge: null,
      badgeCls: "",
      icon: CalendarCheck, bg: "bg-[#1c46f3]/10", iconCls: "text-[#1c46f3]", to: "/atendimentos",
    },
    {
      label: "Receita / mês",
      value: loading ? "—" : formatKPIMoney(revenueMes),
      delta: revenueDelta,
      badge: null,
      badgeCls: "",
      icon: TrendingUp, bg: "bg-[#00bb69]/10", iconCls: "text-[#00bb69]", to: "/atendimentos",
    },
    {
      label: "Clientes na loja",
      value: loading ? "—" : String(clientesNaLoja),
      delta: null,
      badge: clientesNovosMes > 0 ? `+${clientesNovosMes} este mês` : null,
      badgeCls: "text-[#1c46f3]",
      icon: Users, bg: "bg-violet-100", iconCls: "text-violet-600", to: "/usuarios",
    },
    {
      label: "Pets atendidos",
      value: loading ? "—" : String(petsNaLoja),
      delta: null,
      badge: null,
      badgeCls: "text-gray-500",
      icon: PawPrint, bg: "bg-gray-100", iconCls: "text-gray-600", to: "/pets",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">

      {/* Greeting */}
      <div className="mb-8">
        <p className="text-sm text-gray-400">
          {now.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
        </p>
        <h1 className="mt-1 text-2xl font-bold text-gray-900">{greeting}, {firstName}!</h1>
        <p className="mt-1 flex flex-wrap items-center gap-x-1 text-sm text-gray-500">
          {lojaInfo && (
            <>
              <Store size={12} className="text-gray-400" />
              <span className="font-medium text-gray-700">{lojaInfo.nome}</span>
              <span className="text-gray-300">·</span>
            </>
          )}
          {filteredAtend.filter((a) => a.status === "agendado").length > 0
            ? `${filteredAtend.filter((a) => a.status === "agendado").length} agendado(s) · ${filteredAtend.filter((a) => a.status === "concluido").length} concluído(s).`
            : "Nenhum atendimento agendado no momento."}
        </p>
      </div>

      {/* KPIs */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <Link
            key={k.to + k.label}
            to={k.to}
            className="group flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${k.bg}`}>
                <k.icon size={18} className={k.iconCls} />
              </div>
              <div className="flex flex-col items-end gap-0.5">
                <span className="text-2xl font-bold text-gray-800">{k.value}</span>
                {k.delta !== undefined && <Delta value={k.delta} />}
                {k.badge && (
                  <span className={`text-xs font-semibold ${k.badgeCls}`}>{k.badge}</span>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">{k.label}</span>
              <ArrowRight size={14} className="text-gray-300 transition group-hover:translate-x-0.5 group-hover:text-[#1c46f3]" />
            </div>
          </Link>
        ))}
      </div>

      {/* Operational alerts */}
      <div className={`mb-8 rounded-2xl border p-5 ${hasAlerts ? "border-amber-200 bg-amber-50/40" : "border-emerald-200 bg-emerald-50/30"}`}>
        <div className="mb-3 flex items-center gap-2">
          {hasAlerts
            ? <AlertTriangle size={16} className="text-amber-500" />
            : <CheckCircle2 size={16} className="text-emerald-500" />}
          <h2 className="text-sm font-semibold text-gray-800">Alertas operacionais</h2>
        </div>
        {!hasAlerts ? (
          <p className="text-sm text-emerald-700">Tudo em ordem — nenhuma pendência encontrada.</p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {agendadosAtrasados > 0 && (
              <Link to="/atendimentos" className="flex items-center gap-3 rounded-xl border border-amber-200 bg-white px-4 py-3 transition hover:border-amber-300 hover:shadow-sm">
                <Clock size={16} className="shrink-0 text-amber-500" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-800">{agendadosAtrasados} em atraso</p>
                  <p className="text-xs text-gray-500">Agendamentos com data passada</p>
                </div>
                <ArrowRight size={13} className="shrink-0 text-gray-300" />
              </Link>
            )}
            {canceladosMes > 0 && (
              <Link to="/atendimentos" className="flex items-center gap-3 rounded-xl border border-red-200 bg-white px-4 py-3 transition hover:border-red-300 hover:shadow-sm">
                <XCircle size={16} className="shrink-0 text-red-500" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-800">{canceladosMes} cancelado{canceladosMes > 1 ? "s" : ""} este mês</p>
                  <p className="text-xs text-gray-500">Cancelamentos na sua loja</p>
                </div>
                <ArrowRight size={13} className="shrink-0 text-gray-300" />
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Main grid */}
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">

        {/* Chart + Recent appointments */}
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-50 px-5 py-4">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-[#1c46f3]" />
              <h2 className="font-semibold text-gray-800">Atendimentos recentes</h2>
            </div>
            <Link to="/atendimentos" className="text-xs font-medium text-[#1c46f3] hover:underline">
              Ver todos
            </Link>
          </div>

          {/* Mini bar chart */}
          {!loading && (
            <div className="border-b border-gray-50 px-5 py-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">Volume mensal</p>
              <div className="flex h-16 items-end gap-2">
                {monthlyChart.map((m, i) => {
                  const pctH = chartMax > 0 ? (m.value / chartMax) * 100 : 0;
                  const isCurrentMonth = i === 5;
                  return (
                    <div key={m.label} className="group flex flex-1 flex-col items-center gap-1">
                      <div className="relative w-full" style={{ height: "44px" }}>
                        <div
                          className={`absolute bottom-0 w-full rounded-t-md transition-all ${isCurrentMonth ? "bg-[#1c46f3]/60 group-hover:bg-[#1c46f3]" : "bg-[#1c46f3]/15 group-hover:bg-[#1c46f3]/30"}`}
                          style={{ height: `${Math.max(pctH, pctH > 0 ? 8 : 0)}%` }}
                          title={`${m.value} atend.`}
                        />
                        {pctH === 0 && <div className="absolute bottom-0 w-full rounded-t-md bg-gray-100" style={{ height: "3px" }} />}
                      </div>
                      <span className={`text-[10px] capitalize ${isCurrentMonth ? "font-semibold text-[#1c46f3]" : "text-gray-400"}`}>{m.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {loading ? (
            <p className="px-5 py-6 text-sm text-gray-400">Carregando...</p>
          ) : filteredAtend.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <CalendarCheck size={32} className="mx-auto mb-2 text-gray-200" />
              <p className="text-sm text-gray-400">Nenhum atendimento registrado.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filteredAtend.slice(0, 6).map((at) => {
                const cfg = statusConfig[at.status] ?? statusConfig.agendado;
                const services = serviceNames(at);
                const petName = petsById[at.pet_id];
                return (
                  <div key={at.id} className="flex items-center gap-2 px-3 py-3 sm:gap-4 sm:px-5">
                    <div className="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-xl bg-[#1c46f3]/8 text-[#1c46f3] sm:h-10 sm:w-10">
                      <span className="text-sm font-bold leading-none">
                        {new Date(at.data_atendimento).getDate().toString().padStart(2, "0")}
                      </span>
                      <span className="text-[10px]">
                        {new Date(at.data_atendimento).toLocaleDateString("pt-BR", { month: "short" }).replace(".", "")}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-800">
                        {services || <span className="italic text-gray-400">Sem serviços</span>}
                      </p>
                      <p className="truncate text-xs text-gray-400">
                        {petName ? `${petName} · ` : ""}R$ {Number(at.valor_final).toFixed(2)}
                      </p>
                    </div>
                    <span className={`flex h-2 w-2 shrink-0 rounded-full sm:hidden ${cfg.cls.includes("yellow") ? "bg-yellow-400" : cfg.cls.includes("emerald") ? "bg-emerald-400" : "bg-red-400"}`} />
                    <span className={`hidden shrink-0 items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold sm:flex ${cfg.cls}`}>
                      <cfg.icon size={11} /> {cfg.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Minha Loja */}
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-50 px-5 py-4">
            <div className="flex items-center gap-2">
              <Store size={16} className="text-[#1c46f3]" />
              <h2 className="font-semibold text-gray-800">Minha loja</h2>
            </div>
            <Link to="/lojas" className="text-xs font-medium text-[#1c46f3] hover:underline">
              Ver detalhes
            </Link>
          </div>

          {loading ? (
            <p className="px-5 py-6 text-sm text-gray-400">Carregando...</p>
          ) : (
            <div className="space-y-3 p-5">
              {lojaInfo && (
                <div className="border-b border-gray-50 pb-3">
                  <p className="font-semibold text-gray-800">{lojaInfo.nome}</p>
                  {lojaInfo.city && (
                    <p className="text-xs text-gray-400">
                      {lojaInfo.city}{lojaInfo.state ? `, ${lojaInfo.state}` : ""}
                    </p>
                  )}
                </div>
              )}
              <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                <span className="text-xs text-gray-500">Atendimentos este mês</span>
                <span className="text-sm font-bold text-gray-900">{atendMes.length}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                <span className="text-xs text-gray-500">Receita este mês</span>
                <span className="text-sm font-bold text-gray-900">{formatKPIMoney(revenueMes)}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                <span className="text-xs text-gray-500">Agendados</span>
                <span className="text-sm font-bold text-gray-900">
                  {filteredAtend.filter((a) => a.status === "agendado").length}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3">
                <span className="text-xs text-gray-500">Concluídos</span>
                <span className="text-sm font-bold text-emerald-700">
                  {filteredAtend.filter((a) => a.status === "concluido").length}
                </span>
              </div>
              <Link
                to="/lojas"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#1c46f3]/20 bg-[#1c46f3]/5 py-2.5 text-sm font-semibold text-[#1c46f3] transition hover:bg-[#1c46f3]/10"
              >
                <Store size={14} /> Acessar minha loja
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
