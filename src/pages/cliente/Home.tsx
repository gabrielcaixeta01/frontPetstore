import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  PawPrint, CalendarCheck, Wallet, TrendingUp,
  CheckCircle2, Clock, Calendar,
  ArrowUp, ArrowDown, Lightbulb, ArrowRight, Scissors,
} from "lucide-react";
import { getPets } from "../../services/petService";
import { getAppointments } from "../../services/atendimentoService";
import type { Pet } from "../../types/pet";
import type { Appointment } from "../../types/atendimento";

const TEAL  = "#0D7377";
const TDARK = "#085C60";
const AMBER = "#F59E0B";
const COAL  = "#1E293B";
const MUTED = "#64748B";
const BORD  = "#E2E8F0";

/* ─── helpers ─────────────────────────────────────────────── */
function getStoredUser() { try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; } }

function fmtMoney(v: number) {
  if (v >= 1_000) return `R$ ${(v / 1_000).toFixed(1)}k`;
  return `R$ ${v.toFixed(2)}`;
}
function pct(cur: number, prev: number): number | null { return prev === 0 ? null : ((cur - prev) / prev) * 100; }
function sameYM(d: Date, y: number, m: number) { return d.getFullYear() === y && d.getMonth() === m; }

const pgmtLabel: Record<string, string> = {
  pix: "Pix", cartao_credito: "Cartão Crédito",
  cartao_debito: "Cartão Débito", dinheiro: "Dinheiro",
};

const TIPS = [
  "Água fresca e limpa é fundamental — troque o recipiente diariamente.",
  "Passeios regulares reduzem ansiedade e mantêm o pet saudável.",
  "Escovação semanal previne nós e ajuda a detectar parasitas cedo.",
  "Consulte o veterinário a cada 6 meses para manter as vacinas em dia.",
  "Brinquedos de estimulação mental previnem comportamentos destrutivos.",
  "Evite banhos muito frequentes — uma vez por semana costuma ser suficiente.",
  "Identifique seu pet com microchip ou plaquinha para mais segurança.",
];

/* ─── SVG Line Chart ─────────────────────────────────────── */
function LineChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const W = 480, H = 180, pL = 58, pR = 12, pT = 14, pB = 28;
  const iW = W - pL - pR, iH = H - pT - pB;
  const pts = data.map((d, i) => ({
    x: pL + (data.length > 1 ? (i / (data.length - 1)) * iW : iW / 2),
    y: pT + (1 - d.value / max) * iH,
    label: d.label,
  }));
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const area = `${line} L ${pts[pts.length - 1].x.toFixed(1)},${(pT + iH).toFixed(1)} L ${pts[0].x.toFixed(1)},${(pT + iH).toFixed(1)} Z`;
  const ticks = [0.25, 0.5, 0.75, 1].map((f) => ({ y: pT + (1 - f) * iH, label: fmtMoney(max * f) }));

  if (data.every((d) => d.value === 0)) {
    return <div className="flex h-[180px] items-center justify-center text-sm text-gray-300">Nenhum gasto registrado ainda</div>;
  }
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "180px" }}>
      <defs>
        <linearGradient id="cliGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={TEAL} stopOpacity="0.13" />
          <stop offset="100%" stopColor={TEAL} stopOpacity="0.01" />
        </linearGradient>
      </defs>
      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={pL} y1={t.y} x2={pL + iW} y2={t.y} stroke="#E5E7EB" strokeWidth="1" />
          <text x={pL - 5} y={t.y + 3.5} textAnchor="end" fontSize="10" fill="#9CA3AF">{t.label}</text>
        </g>
      ))}
      <path d={area} fill="url(#cliGrad)" />
      <path d={line} fill="none" stroke={TEAL} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="4.5" fill={TEAL} stroke="white" strokeWidth="2" />
          <text x={p.x} y={H - 5} textAnchor="middle" fontSize="11" fill="#6B7280" style={{ textTransform: "capitalize" }}>{p.label}</text>
        </g>
      ))}
    </svg>
  );
}

/* ─── Sub-components ─────────────────────────────────────── */
function Delta({ value }: { value: number | null }) {
  if (value === null) return <span className="text-xs text-gray-300">—</span>;
  const pos = value >= 0;
  return (
    <span className={`mt-0.5 flex items-center gap-0.5 text-[11px] font-medium ${pos ? "text-[#10B981]" : "text-red-500"}`}>
      {pos ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
      {pos ? "+" : ""}{Math.abs(value).toFixed(0)}% vs mês ant.
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    agendado:  "bg-amber-50 text-amber-700",
    concluido: "bg-teal-50  text-teal-700",
    cancelado: "bg-red-50   text-red-600",
    atrasado:  "bg-red-50   text-red-600",
  };
  const labels: Record<string, string> = {
    agendado: "Agendado", concluido: "Concluído", cancelado: "Cancelado", atrasado: "Atrasado",
  };
  return (
    <span className={`whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${map[status] ?? map.agendado}`}>
      {labels[status] ?? status}
    </span>
  );
}

function HeroDecor() {
  return (
    <div className="pointer-events-none absolute inset-0 select-none overflow-hidden" aria-hidden="true">
      <div className="absolute right-8 top-8 h-48 w-48 rounded-full"
        style={{ border: "1.5px solid rgba(255,255,255,0.10)" }} />
      <div className="absolute right-24 top-20 h-72 w-72 rounded-full"
        style={{ border: "1px solid rgba(255,255,255,0.06)" }} />
      <div className="absolute -right-16 -top-16 h-80 w-80 rounded-full"
        style={{ background: "rgba(255,255,255,0.04)" }} />
      <div className="absolute bottom-8 left-8 h-24 w-24 rounded-full"
        style={{ border: "1.5px solid rgba(255,255,255,0.08)" }} />
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────── */
export default function ClienteHome() {
  const user = getStoredUser();
  const userId: number = user.id;
  const firstName = user.name?.split(" ")[0] ?? "Cliente";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

  const now = new Date();
  const thisYear = now.getFullYear();
  const thisMonth = now.getMonth();
  const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
  const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;

  const [pets, setPets] = useState<Pet[]>([]);
  const [atendimentos, setAtendimentos] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [allPets, allAtend] = await Promise.all([getPets(), getAppointments()]);
        setPets(allPets.filter((p) => p.dono_id === userId));
        setAtendimentos(
          allAtend
            .filter((a) => a.cliente_id === userId)
            .sort((a, b) => new Date(b.data_atendimento).getTime() - new Date(a.data_atendimento).getTime()),
        );
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    load();
  }, [userId]);

  const petsById = useMemo(() => Object.fromEntries(pets.map((p) => [p.id, p])), [pets]);

  const agendados  = useMemo(() => atendimentos.filter((a) => a.status === "agendado"),  [atendimentos]);
  const concluidos = useMemo(() => atendimentos.filter((a) => a.status === "concluido"), [atendimentos]);

  const concMes    = useMemo(() => concluidos.filter((a) => sameYM(new Date(a.data_atendimento), thisYear, thisMonth)),      [concluidos]);
  const concMesAnt = useMemo(() => concluidos.filter((a) => sameYM(new Date(a.data_atendimento), lastMonthYear, lastMonth)), [concluidos]);
  const gastoMes    = useMemo(() => concMes.reduce((s, a) => s + Number(a.valor_final), 0),    [concMes]);
  const gastoMesAnt = useMemo(() => concMesAnt.reduce((s, a) => s + Number(a.valor_final), 0), [concMesAnt]);
  const gastoDelta  = useMemo(() => pct(gastoMes, gastoMesAnt), [gastoMes, gastoMesAnt]);
  const visitasDelta = useMemo(() => pct(concMes.length, concMesAnt.length), [concMes, concMesAnt]);

  const gastoTotal = useMemo(() => concluidos.reduce((s, a) => s + Number(a.valor_final), 0), [concluidos]);

  const nextAgendado = useMemo(() =>
    [...agendados]
      .filter((a) => new Date(a.data_atendimento) >= now)
      .sort((a, b) => new Date(a.data_atendimento).getTime() - new Date(b.data_atendimento).getTime())[0] ?? null,
    [agendados],
  );

  const atrasados = useMemo(() => {
    const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
    return agendados.filter((a) => new Date(a.data_atendimento) < hoje).length;
  }, [agendados]);

  const monthlySpending = useMemo(() => {
    const map: Record<string, number> = {};
    concluidos.forEach((a) => {
      const d = new Date(a.data_atendimento);
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      map[k] = (map[k] ?? 0) + Number(a.valor_final);
    });
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - (5 - i));
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      return { label: d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""), value: map[k] ?? 0 };
    });
  }, [concluidos]);

  const monthLabel = now.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  const dateLabel  = now.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const tip = TIPS[now.getDay()];

  const kpis = [
    { label: "Gasto este mês",   value: loading ? "—" : fmtMoney(gastoMes),        delta: gastoDelta,            badge: null as string | null,                                                            iconBg: "bg-[#e6f5f5]",  iconCls: "text-[#0D7377]", Icon: Wallet,       to: "/atendimentos" },
    { label: "Visitas este mês", value: loading ? "—" : String(concMes.length),     delta: visitasDelta,          badge: null as string | null,                                                            iconBg: "bg-emerald-50", iconCls: "text-[#10B981]", Icon: CheckCircle2, to: "/atendimentos" },
    { label: "Gasto total",      value: loading ? "—" : fmtMoney(gastoTotal),       delta: null as number | null, badge: concluidos.length > 0 ? `${concluidos.length} visitas` : null, iconBg: "bg-violet-50", iconCls: "text-violet-600", Icon: TrendingUp, to: "/atendimentos" },
    { label: "Meus pets",        value: loading ? "—" : String(pets.length),        delta: null as number | null, badge: null as string | null,                                                            iconBg: "bg-amber-50",   iconCls: "text-[#F59E0B]", Icon: PawPrint,     to: "/pets"         },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">

      {/* ── Hero Banner ─────────────────────────────────────── */}
      <div className="relative mb-6 overflow-hidden rounded-md px-8 py-10" style={{ background: TEAL }}>
        <HeroDecor />
        <div className="relative z-10 max-w-md">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest" style={{ color: AMBER }}>
            Portal do Cliente
          </p>
          <h1 className="text-3xl font-extrabold leading-tight text-white">
            {greeting}, <span style={{ color: AMBER }}>{firstName}</span>!
          </h1>
          <p className="mt-1.5 text-[15px] text-white/75">
            {agendados.length > 0
              ? `Você tem ${agendados.length} agendamento${agendados.length > 1 ? "s" : ""} pendente${agendados.length > 1 ? "s" : ""}.`
              : "Bem-vindo ao seu painel de acompanhamento."}
          </p>
          <p className="mt-3 flex items-center gap-1.5 text-xs capitalize text-white/50">
            <Calendar size={13} />
            {dateLabel}
          </p>
        </div>
      </div>

      {/* ── Alert strip ─────────────────────────────────────── */}
      {!loading && atrasados > 0 && (
        <div className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-md border border-amber-200 bg-amber-50 px-4 py-2.5">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-600">
            <Clock size={13} /> Atenção:
          </span>
          <Link to="/atendimentos" className="text-xs text-amber-700 hover:underline">
            {atrasados} agendamento{atrasados > 1 ? "s" : ""} com data passada — verifique seu histórico
          </Link>
        </div>
      )}

      {/* ── Section title ─────────────────────────────────────── */}
      <div className="mb-4 flex items-center gap-2">
        <TrendingUp size={16} style={{ color: TEAL }} />
        <h2 className="text-[15px] font-semibold" style={{ color: COAL }}>Resumo do Mês</h2>
        <span className="text-xs capitalize" style={{ color: MUTED }}>{monthLabel}</span>
      </div>

      {/* ── KPI Grid ─────────────────────────────────────────── */}
      <div className="mb-7 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((k) => (
          <Link
            key={k.label}
            to={k.to}
            className="group flex flex-col gap-3 rounded-md border border-gray-200 bg-white p-4 transition hover:shadow-[0_2px_12px_rgba(13,115,119,0.10)]"
          >
            <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${k.iconBg}`}>
              <k.Icon size={17} className={k.iconCls} />
            </div>
            <div>
              <p className="text-xs" style={{ color: MUTED }}>{k.label}</p>
              <p className="mt-0.5 text-2xl font-extrabold leading-none" style={{ color: COAL }}>{k.value}</p>
              {k.delta !== null && k.delta !== undefined && <Delta value={k.delta} />}
              {k.badge && <span className="mt-0.5 block text-xs font-medium" style={{ color: TEAL }}>{k.badge}</span>}
            </div>
          </Link>
        ))}
      </div>

      {/* ── Charts Row ─────────────────────────────────────── */}
      <div className="mb-7 grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-md border border-gray-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet size={14} style={{ color: TEAL }} />
              <span className="text-sm font-semibold" style={{ color: COAL }}>Meus Gastos — Últimos 6 Meses</span>
            </div>
            <span className="rounded px-2 py-0.5 text-[10px] font-bold text-white" style={{ background: TEAL }}>{now.getFullYear()}</span>
          </div>
          {loading
            ? <div className="flex h-[180px] items-center justify-center text-sm text-gray-300">Carregando...</div>
            : <LineChart data={monthlySpending} />
          }
        </div>

        <div className="flex flex-col gap-4">
          {/* Próximo agendamento */}
          <div className="rounded-md border border-gray-200 bg-white p-5">
            <div className="mb-3 flex items-center gap-2">
              <CalendarCheck size={14} style={{ color: TEAL }} />
              <span className="text-sm font-semibold" style={{ color: COAL }}>Próximo Agendamento</span>
            </div>
            {loading ? (
              <p className="text-sm text-gray-400">Carregando...</p>
            ) : nextAgendado ? (
              <Link to="/atendimentos" className="group block">
                <div className="flex items-center gap-3 rounded-md border px-4 py-3 transition"
                  style={{ borderColor: `${TEAL}33`, background: "#e6f5f5" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = `${TEAL}66`; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = `${TEAL}33`; }}>
                  <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded text-white"
                    style={{ background: TEAL }}>
                    <span className="text-sm font-extrabold leading-none">
                      {new Date(nextAgendado.data_atendimento).getDate().toString().padStart(2, "0")}
                    </span>
                    <span className="text-[10px] capitalize">
                      {new Date(nextAgendado.data_atendimento).toLocaleDateString("pt-BR", { month: "short" }).replace(".", "")}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold" style={{ color: TEAL }}>
                      {new Date(nextAgendado.data_atendimento).toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "short" })}
                    </p>
                    <p className="text-xs" style={{ color: MUTED }}>
                      {petsById[nextAgendado.pet_id]?.nome ?? "—"} · R$ {Number(nextAgendado.valor_final).toFixed(2)}
                    </p>
                  </div>
                  <ArrowRight size={14} className="shrink-0 transition group-hover:translate-x-0.5" style={{ color: `${TEAL}80` }} />
                </div>
              </Link>
            ) : (
              <div className="flex flex-col items-center py-4 text-center">
                <CalendarCheck size={28} className="mb-1.5 text-gray-200" />
                <p className="text-xs text-gray-400">Nenhum agendamento futuro.</p>
                <Link to="/atendimentos" className="mt-1 text-xs font-semibold hover:underline" style={{ color: TEAL }}>Agendar serviço</Link>
              </div>
            )}
          </div>

          {/* Dica do dia */}
          <div className="flex items-start gap-3 rounded-md border border-amber-200 bg-amber-50 p-4">
            <Lightbulb size={16} className="mt-0.5 shrink-0 text-amber-500" />
            <div>
              <p className="mb-0.5 text-xs font-semibold text-amber-700">Dica do dia</p>
              <p className="text-[11px] leading-relaxed text-amber-600">{tip}</p>
            </div>
          </div>

          {/* Serviços link */}
          <Link to="/servicos"
            className="group flex items-center justify-between rounded-md border px-4 py-3 transition bg-white"
            style={{ borderColor: BORD }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = `${TEAL}4D`; (e.currentTarget as HTMLAnchorElement).style.background = "#e6f5f5"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = BORD; (e.currentTarget as HTMLAnchorElement).style.background = "white"; }}>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e6f5f5]">
                <Scissors size={14} style={{ color: TEAL }} />
              </div>
              <span className="text-sm font-semibold" style={{ color: COAL }}>Ver serviços disponíveis</span>
            </div>
            <ArrowRight size={14} className="transition group-hover:translate-x-0.5" style={{ color: MUTED }} />
          </Link>
        </div>
      </div>

      {/* ── Bottom Row ─────────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-2">

        <div className="overflow-hidden rounded-md border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3.5">
            <div className="flex items-center gap-2">
              <CalendarCheck size={14} style={{ color: TEAL }} />
              <span className="text-sm font-semibold" style={{ color: COAL }}>Histórico Recente</span>
            </div>
            <Link to="/atendimentos"
              className="rounded border border-gray-200 px-2.5 py-1 text-xs font-medium transition"
              style={{ color: MUTED }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = TEAL; (e.currentTarget as HTMLAnchorElement).style.borderColor = TEAL; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = MUTED; (e.currentTarget as HTMLAnchorElement).style.borderColor = "#E5E7EB"; }}>
              Ver todos
            </Link>
          </div>
          {loading ? (
            <p className="px-5 py-6 text-sm text-gray-400">Carregando...</p>
          ) : atendimentos.length === 0 ? (
            <div className="flex flex-col items-center py-10">
              <CalendarCheck size={32} className="mb-2 text-gray-200" />
              <p className="text-sm text-gray-300">Nenhum atendimento registrado.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/70">
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">Data / Pet</th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">Valor</th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {atendimentos.slice(0, 6).map((at) => {
                    const petName = petsById[at.pet_id]?.nome;
                    return (
                      <tr key={at.id} className="transition hover:bg-gray-50/60">
                        <td className="px-4 py-3">
                          <p className="font-semibold" style={{ color: COAL }}>{new Date(at.data_atendimento).toLocaleDateString("pt-BR")}</p>
                          {petName && <p className="text-xs text-gray-400">{petName}</p>}
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-bold" style={{ color: COAL }}>R$ {Number(at.valor_final).toFixed(2)}</p>
                          <p className="text-xs text-gray-400">{pgmtLabel[at.forma_pagamento] ?? at.forma_pagamento}</p>
                        </td>
                        <td className="px-4 py-3"><StatusBadge status={at.status} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="overflow-hidden rounded-md border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3.5">
            <div className="flex items-center gap-2">
              <PawPrint size={14} style={{ color: TEAL }} />
              <span className="text-sm font-semibold" style={{ color: COAL }}>Meus Pets</span>
            </div>
            <Link to="/pets"
              className="rounded border border-gray-200 px-2.5 py-1 text-xs font-medium transition"
              style={{ color: MUTED }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = TEAL; (e.currentTarget as HTMLAnchorElement).style.borderColor = TEAL; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = MUTED; (e.currentTarget as HTMLAnchorElement).style.borderColor = "#E5E7EB"; }}>
              Ver todos
            </Link>
          </div>
          {loading ? (
            <p className="px-5 py-6 text-sm text-gray-400">Carregando...</p>
          ) : pets.length === 0 ? (
            <div className="flex flex-col items-center py-10">
              <PawPrint size={32} className="mb-2 text-gray-200" />
              <p className="text-sm text-gray-300">Nenhum pet cadastrado ainda.</p>
              <Link to="/pets" className="mt-1.5 text-xs font-semibold hover:underline" style={{ color: TEAL }}>Cadastrar pet</Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {pets.slice(0, 6).map((pet) => {
                const petAts = atendimentos.filter((a) => a.pet_id === pet.id);
                const lastAt = petAts[0];
                return (
                  <div key={pet.id} className="flex items-center gap-3 px-5 py-3 transition hover:bg-gray-50/60">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e6f5f5] text-sm font-extrabold"
                      style={{ color: TEAL }}>
                      {pet.nome[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold" style={{ color: COAL }}>{pet.nome}</p>
                      <p className="truncate text-xs text-gray-400">
                        {[pet.raca, pet.porte].filter(Boolean).join(" · ") || "Sem detalhes"}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      {lastAt ? (
                        <>
                          <p className="text-xs font-medium" style={{ color: TDARK }}>{new Date(lastAt.data_atendimento).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}</p>
                          <p className="text-[10px] text-gray-400">última visita</p>
                        </>
                      ) : (
                        <p className="text-xs text-gray-300">Sem visitas</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
