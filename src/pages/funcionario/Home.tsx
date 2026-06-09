import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  PawPrint, CalendarCheck, Users, Store,
  Clock, CheckCircle2, TrendingUp,
  ArrowUp, ArrowDown, Scissors, Calendar,
  AlertTriangle, XCircle, Stethoscope,
} from "lucide-react";
import { getPets } from "../../services/petService";
import { getAppointments } from "../../services/atendimentoService";
import { getLojas } from "../../services/lojaService";
import { getServicos } from "../../services/servicoService";
import type { Atendimento } from "../../types/atendimento";
import type { Loja } from "../../types/loja";
import { useFuncionarioStore } from "../../hooks/useFuncionarioStore";

const TEAL  = "#0D7377";
const AMBER = "#F59E0B";
const MINT  = "#10B981";
const COAL  = "#1E293B";
const MUTED = "#64748B";

/* ─── helpers ─────────────────────────────────────────────── */
function getStoredUser() {
  try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; }
}
function sameYM(d: Date, y: number, m: number) { return d.getFullYear() === y && d.getMonth() === m; }
function pct(cur: number, prev: number): number | null { return prev === 0 ? null : ((cur - prev) / prev) * 100; }
function fmtMoney(v: number) {
  if (v >= 1_000_000) return `R$ ${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000)     return `R$ ${(v / 1_000).toFixed(1)}k`;
  return `R$ ${Math.round(v).toLocaleString("pt-BR")}`;
}
function getServCat(nome: string) {
  const n = nome.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  if (/banho|higien|shampoo|hidrat|tosa|corte|pelos|unhas/.test(n)) return "tosa";
  if (/vacin|vermifug|castrac|cirurgi|consult|exame|fisio|veterinar/.test(n)) return "saude";
  if (/adestramento|treino|comportamento/.test(n)) return "comportamento";
  if (/hospedagem|hotel|creche/.test(n)) return "hospedagem";
  return "outros";
}
function getServIcon(nome: string) {
  const cat = getServCat(nome);
  if (cat === "tosa")         return { Icon: Scissors,    bg: "bg-[#e6f5f5]", cls: "text-[#0D7377]" };
  if (cat === "saude")        return { Icon: Stethoscope, bg: "bg-emerald-50", cls: "text-[#10B981]" };
  if (cat === "comportamento")return { Icon: PawPrint,    bg: "bg-amber-50",   cls: "text-[#F59E0B]" };
  if (cat === "hospedagem")   return { Icon: Store,       bg: "bg-red-50",     cls: "text-red-500"   };
  return { Icon: CalendarCheck, bg: "bg-[#e6f5f5]", cls: "text-[#0D7377]" };
}

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
    return <div className="flex h-[180px] items-center justify-center text-sm text-gray-300">Sem faturamento registrado</div>;
  }
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "180px" }}>
      <defs>
        <linearGradient id="funcLg" x1="0" y1="0" x2="0" y2="1">
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
      <path d={area} fill="url(#funcLg)" />
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

/* ─── SVG Donut Chart ────────────────────────────────────── */
function DonutChart({ slices }: { slices: { label: string; value: number; color: string }[] }) {
  const total = slices.reduce((s, sl) => s + sl.value, 0) || 1;
  const r = 50, cx = 70, cy = 70, circ = 2 * Math.PI * r;
  let cum = 0;
  const paths = slices.map((sl) => {
    const len = (sl.value / total) * circ;
    const off = -(cum * circ);
    cum += sl.value / total;
    return { ...sl, len, off };
  });
  return (
    <svg viewBox="0 0 140 140" style={{ width: "100%", height: "148px" }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F3F4F6" strokeWidth="18" />
      {paths.map((p, i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={p.color} strokeWidth="18"
          strokeDasharray={`${p.len.toFixed(2)} ${(circ - p.len).toFixed(2)}`}
          strokeDashoffset={p.off.toFixed(2)}
          style={{ transform: "rotate(-90deg)", transformOrigin: `${cx}px ${cy}px` }}
        />
      ))}
      <text x={cx} y={cy - 5} textAnchor="middle" fontSize="17" fontWeight="700" fill="#111827">{total}</text>
      <text x={cx} y={cy + 12} textAnchor="middle" fontSize="10" fill="#9CA3AF">atendimentos</text>
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
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  const lojaInfo = useMemo(
    () => lojaId != null ? lojas.find((l) => l.id === lojaId) ?? null : null,
    [lojas, lojaId],
  );

  const filteredAtend = useMemo(
    () => lojaId != null ? atendimentos.filter((a) => a.loja_id === lojaId) : atendimentos,
    [atendimentos, lojaId],
  );

  const atendMes    = useMemo(() => filteredAtend.filter((a) => sameYM(new Date(a.data_atendimento), thisYear, thisMonth)),      [filteredAtend]);
  const atendMesAnt = useMemo(() => filteredAtend.filter((a) => sameYM(new Date(a.data_atendimento), lastMonthYear, lastMonth)), [filteredAtend]);
  const revenueMes    = useMemo(() => atendMes.filter((a) => a.status === "concluido").reduce((s, a) => s + Number(a.valor_final), 0), [atendMes]);
  const revenueMesAnt = useMemo(() => atendMesAnt.filter((a) => a.status === "concluido").reduce((s, a) => s + Number(a.valor_final), 0), [atendMesAnt]);
  const atendDelta   = useMemo(() => pct(atendMes.length, atendMesAnt.length), [atendMes, atendMesAnt]);
  const revenueDelta = useMemo(() => pct(revenueMes, revenueMesAnt),            [revenueMes, revenueMesAnt]);

  const clientesNaLoja = useMemo(() => new Set(filteredAtend.map((a) => a.cliente_id)).size, [filteredAtend]);
  const petsNaLoja     = useMemo(() => new Set(filteredAtend.map((a) => a.pet_id)).size,     [filteredAtend]);
  const clientesNovosMes = useMemo(() => {
    const anteriores = new Set(filteredAtend.filter((a) => !sameYM(new Date(a.data_atendimento), thisYear, thisMonth)).map((a) => a.cliente_id));
    return atendMes.reduce((n, a) => (!anteriores.has(a.cliente_id) ? n + 1 : n), 0);
  }, [filteredAtend, atendMes]);

  const atendHoje = useMemo(() => filteredAtend.filter((a) => {
    const d = new Date(a.data_atendimento);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
  }).sort((a, b) => new Date(a.data_atendimento).getTime() - new Date(b.data_atendimento).getTime()), [filteredAtend]);

  const agendadosAtrasados = useMemo(() => { const h = new Date(); h.setHours(0,0,0,0); return filteredAtend.filter((a) => a.status === "agendado" && new Date(a.data_atendimento) < h).length; }, [filteredAtend]);
  const canceladosMes      = useMemo(() => atendMes.filter((a) => a.status === "cancelado").length, [atendMes]);
  const hasAlerts = agendadosAtrasados > 0 || canceladosMes > 0;

  const monthlyRevenue = useMemo(() => {
    const map: Record<string, number> = {};
    filteredAtend.forEach((a) => {
      if (a.status !== "concluido") return;
      const d = new Date(a.data_atendimento);
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      map[k] = (map[k] ?? 0) + Number(a.valor_final);
    });
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - (5 - i));
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      return { label: d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""), value: map[k] ?? 0 };
    });
  }, [filteredAtend]);

  const serviceDistribution = useMemo(() => {
    const cats: Record<string, number> = { tosa: 0, saude: 0, comportamento: 0, hospedagem: 0, outros: 0 };
    filteredAtend.forEach((a) => (a.items ?? []).forEach((item) => { cats[getServCat(servicosById[item.service_id] ?? "")]++; }));
    const total = Object.values(cats).reduce((s, v) => s + v, 0);
    if (total === 0) return [];
    return [
      { label: "Banho/Tosa",    value: cats.tosa,          color: TEAL    },
      { label: "Saúde",         value: cats.saude,         color: AMBER   },
      { label: "Comportamento", value: cats.comportamento, color: MINT    },
      { label: "Hospedagem",    value: cats.hospedagem,    color: "#7c3aed" },
      { label: "Outros",        value: cats.outros,        color: "#6B7280" },
    ].filter((s) => s.value > 0);
  }, [filteredAtend, servicosById]);

  function serviceNames(at: Atendimento) {
    if (!at.items?.length) return "—";
    return at.items.slice(0, 2).map((item) => servicosById[item.service_id] ?? `Serviço #${item.service_id}`).join(", ");
  }

  const monthLabel = now.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  const dateLabel  = now.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const kpis = [
    { label: "Receita do Mês",     value: loading ? "—" : fmtMoney(revenueMes),    delta: revenueDelta,          badge: null as string | null,                                                          iconBg: "bg-[#e6f5f5]",  iconCls: "text-[#0D7377]", Icon: TrendingUp,    to: "/atendimentos" },
    { label: "Atendimentos / Mês", value: loading ? "—" : String(atendMes.length), delta: atendDelta,            badge: null as string | null,                                                          iconBg: "bg-emerald-50", iconCls: "text-[#10B981]", Icon: CalendarCheck, to: "/atendimentos" },
    { label: "Clientes na Loja",   value: loading ? "—" : String(clientesNaLoja),  delta: null as number | null, badge: clientesNovosMes > 0 ? `+${clientesNovosMes} este mês` : null, iconBg: "bg-violet-50", iconCls: "text-violet-600", Icon: Users, to: null },
    { label: "Pets Atendidos",     value: loading ? "—" : String(petsNaLoja),      delta: null as number | null, badge: null as string | null,                                                          iconBg: "bg-amber-50",   iconCls: "text-[#F59E0B]", Icon: PawPrint,      to: "/pets"         },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">

      {/* ── Hero Banner ─────────────────────────────────────── */}
      <div className="relative mb-6 overflow-hidden rounded-md px-8 py-10" style={{ background: TEAL }}>
        <HeroDecor />
        <div className="relative z-10 max-w-md">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest" style={{ color: AMBER }}>
            {lojaInfo ? lojaInfo.nome : "Minha Loja"}
          </p>
          <h1 className="text-3xl font-extrabold leading-tight text-white">
            {greeting}, <span style={{ color: AMBER }}>{firstName}</span>!
          </h1>
          <p className="mt-1.5 text-[15px] text-white/75">
            {lojaInfo?.city
              ? `${lojaInfo.city}${lojaInfo.state ? `, ${lojaInfo.state}` : ""} — resumo da sua unidade`
              : "Bem-vindo ao painel da sua loja"}
          </p>
          <p className="mt-3 flex items-center gap-1.5 text-xs capitalize text-white/50">
            <Calendar size={13} />
            {dateLabel} — Dados em tempo real
          </p>
        </div>
      </div>

      {/* ── Alerts strip ─────────────────────────────────────── */}
      {!loading && hasAlerts && (
        <div className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-md border border-amber-200 bg-amber-50 px-4 py-2.5">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-600">
            <AlertTriangle size={13} /> Alertas:
          </span>
          {agendadosAtrasados > 0 && (
            <Link to="/atendimentos" className="flex items-center gap-1 text-xs text-amber-700 hover:underline">
              <Clock size={11} /> {agendadosAtrasados} em atraso
            </Link>
          )}
          {canceladosMes > 0 && (
            <Link to="/atendimentos" className="flex items-center gap-1 text-xs text-amber-700 hover:underline">
              <XCircle size={11} /> {canceladosMes} cancelado{canceladosMes > 1 ? "s" : ""} este mês
            </Link>
          )}
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
        {kpis.map((k) => {
          const cardCls = "group flex flex-col gap-3 rounded-md border border-gray-200 bg-white p-4 transition" + (k.to ? " hover:shadow-[0_2px_12px_rgba(13,115,119,0.10)]" : "");
          const inner = (
            <>
              <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${k.iconBg}`}>
                <k.Icon size={17} className={k.iconCls} />
              </div>
              <div>
                <p className="text-xs" style={{ color: MUTED }}>{k.label}</p>
                <p className="mt-0.5 text-2xl font-extrabold leading-none" style={{ color: COAL }}>{k.value}</p>
                {k.delta !== null && k.delta !== undefined && <Delta value={k.delta} />}
                {k.badge && <span className="mt-0.5 block text-xs font-medium" style={{ color: TEAL }}>{k.badge}</span>}
              </div>
            </>
          );
          return k.to
            ? <Link key={k.label} to={k.to} className={cardCls}>{inner}</Link>
            : <div key={k.label} className={cardCls}>{inner}</div>;
        })}
      </div>

      {/* ── Charts Row ─────────────────────────────────────── */}
      <div className="mb-7 grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="rounded-md border border-gray-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp size={14} style={{ color: TEAL }} />
              <span className="text-sm font-semibold" style={{ color: COAL }}>Faturamento — Últimos 6 Meses</span>
            </div>
            <span className="rounded px-2 py-0.5 text-[10px] font-bold text-white" style={{ background: TEAL }}>
              {now.getFullYear()}
            </span>
          </div>
          {loading
            ? <div className="flex h-[180px] items-center justify-center text-sm text-gray-300">Carregando...</div>
            : <LineChart data={monthlyRevenue} />
          }
        </div>

        <div className="rounded-md border border-gray-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PawPrint size={14} style={{ color: AMBER }} />
              <span className="text-sm font-semibold" style={{ color: COAL }}>Serviços por Atendimento</span>
            </div>
            <span className="rounded border px-2 py-0.5 text-[10px] font-semibold capitalize"
              style={{ borderColor: TEAL, color: TEAL }}>
              {now.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "")}
            </span>
          </div>
          {loading ? (
            <div className="flex h-[148px] items-center justify-center text-sm text-gray-300">Carregando...</div>
          ) : serviceDistribution.length === 0 ? (
            <div className="flex h-[148px] items-center justify-center text-sm text-gray-300">Sem dados</div>
          ) : (
            <>
              <DonutChart slices={serviceDistribution} />
              <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5">
                {serviceDistribution.map((s) => {
                  const total = serviceDistribution.reduce((a, b) => a + b.value, 0) || 1;
                  return (
                    <span key={s.label} className="flex items-center gap-1.5 text-[11px] text-gray-600">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: s.color }} />
                      {s.label} {Math.round((s.value / total) * 100)}%
                    </span>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Bottom Row ─────────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-2">

        <div className="overflow-hidden rounded-md border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3.5">
            <div className="flex items-center gap-2">
              <CalendarCheck size={14} style={{ color: TEAL }} />
              <span className="text-sm font-semibold" style={{ color: COAL }}>Atendimentos Recentes</span>
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
          ) : filteredAtend.length === 0 ? (
            <div className="flex flex-col items-center py-10">
              <CalendarCheck size={32} className="mb-2 text-gray-200" />
              <p className="text-sm text-gray-300">Nenhum atendimento registrado.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/70">
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">Pet / Serviço</th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">Data</th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredAtend.slice(0, 6).map((at) => (
                    <tr key={at.id} className="transition hover:bg-gray-50/60">
                      <td className="px-4 py-3">
                        <p className="font-semibold" style={{ color: COAL }}>{petsById[at.pet_id] ?? `Pet #${at.pet_id}`}</p>
                        <p className="text-xs text-gray-400">{serviceNames(at)}</p>
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: MUTED }}>
                        {new Date(at.data_atendimento).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={at.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="overflow-hidden rounded-md border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3.5">
            <div className="flex items-center gap-2">
              <Calendar size={14} style={{ color: TEAL }} />
              <span className="text-sm font-semibold" style={{ color: COAL }}>Agenda de Hoje</span>
            </div>
            <span className="rounded px-2 py-0.5 text-[10px] font-bold capitalize text-white" style={{ background: MINT }}>
              {now.toLocaleDateString("pt-BR", { day: "numeric", month: "short" }).replace(".", "")}
            </span>
          </div>
          {loading ? (
            <p className="px-5 py-6 text-sm text-gray-400">Carregando...</p>
          ) : atendHoje.length === 0 ? (
            <div className="flex flex-col items-center py-10">
              <CheckCircle2 size={32} className="mb-2 text-gray-200" />
              <p className="text-sm text-gray-300">Nenhum atendimento hoje.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {atendHoje.slice(0, 6).map((at) => {
                const firstNome = at.items?.[0] ? (servicosById[at.items[0].service_id] ?? "") : "";
                const { Icon: SIcon, bg: sBg, cls: sCls } = getServIcon(firstNome);
                const time = new Date(at.data_atendimento).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
                return (
                  <div key={at.id} className="flex items-center gap-3 px-5 py-3">
                    <span className="min-w-[40px] text-xs font-bold" style={{ color: TEAL }}>{time}</span>
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${sBg}`}>
                      <SIcon size={14} className={sCls} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold" style={{ color: COAL }}>{firstNome || "Atendimento"}</p>
                      <p className="truncate text-xs text-gray-400">{petsById[at.pet_id] ?? `Pet #${at.pet_id}`}</p>
                    </div>
                    <StatusBadge status={at.status} />
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
