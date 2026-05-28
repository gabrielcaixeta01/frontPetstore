import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  PawPrint, CalendarCheck, Users, Store,
  Clock, CheckCircle2, TrendingUp,
  ArrowUp, ArrowDown, Scissors, Calendar,
  AlertTriangle, AlertCircle, Stethoscope,
} from "lucide-react";
import { getPets } from "../../services/petService";
import { getAppointments } from "../../services/atendimentoService";
import { getUsuarios } from "../../services/usuarioService";
import { getLojas } from "../../services/lojaService";
import { getServicos } from "../../services/servicoService";
import type { Atendimento } from "../../types/atendimento";
import type { Loja } from "../../types/loja";
import type { Usuario } from "../../types/usuario";

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
  if (cat === "tosa")         return { Icon: Scissors,    bg: "bg-blue-50",    cls: "text-[#1c46f3]" };
  if (cat === "saude")        return { Icon: Stethoscope, bg: "bg-emerald-50", cls: "text-[#00A651]" };
  if (cat === "comportamento")return { Icon: PawPrint,    bg: "bg-amber-50",   cls: "text-[#F5A800]" };
  if (cat === "hospedagem")   return { Icon: Store,       bg: "bg-red-50",     cls: "text-red-500"   };
  return { Icon: CalendarCheck, bg: "bg-[#1c46f3]/10", cls: "text-[#1c46f3]" };
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
    value: d.value,
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
        <linearGradient id="lg1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#1c46f3" stopOpacity="0.13" />
          <stop offset="100%" stopColor="#1c46f3" stopOpacity="0.01" />
        </linearGradient>
      </defs>
      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={pL} y1={t.y} x2={pL + iW} y2={t.y} stroke="#E5E7EB" strokeWidth="1" />
          <text x={pL - 5} y={t.y + 3.5} textAnchor="end" fontSize="10" fill="#9CA3AF">{t.label}</text>
        </g>
      ))}
      <path d={area} fill="url(#lg1)" />
      <path d={line} fill="none" stroke="#1c46f3" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="4.5" fill="#1c46f3" stroke="white" strokeWidth="2" />
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
    <span className={`mt-0.5 flex items-center gap-0.5 text-[11px] font-medium ${pos ? "text-[#00A651]" : "text-red-500"}`}>
      {pos ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
      {pos ? "+" : ""}{Math.abs(value).toFixed(0)}% vs mês ant.
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    agendado:  "bg-amber-50  text-amber-700",
    concluido: "bg-blue-50   text-blue-700",
    cancelado: "bg-red-50    text-red-600",
    atrasado:  "bg-red-50    text-red-600",
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

/* ─── Main component ─────────────────────────────────────── */
export default function AdminHome() {
  const user = getStoredUser();
  const firstName = user.name?.split(" ")[0] ?? "Admin";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

  const now = new Date();
  const thisYear = now.getFullYear();
  const thisMonth = now.getMonth();
  const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
  const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;

  const [totalPets, setTotalPets] = useState(0);
  const [atendimentos, setAtendimentos] = useState<Atendimento[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [petsById, setPetsById] = useState<Record<number, string>>({});
  const [servicosById, setServicosById] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [pets, allAtend, allUsers, allLojas, allServicos] = await Promise.all([
          getPets(),
          getAppointments(),
          getUsuarios(),
          getLojas(),
          getServicos().catch(() => []),
        ]);
        setTotalPets(pets.length);
        setAtendimentos(allAtend.sort((a, b) => new Date(b.data_atendimento).getTime() - new Date(a.data_atendimento).getTime()));
        setUsuarios(allUsers);
        setLojas(allLojas);
        setPetsById(Object.fromEntries(pets.map((p) => [p.id, p.nome])));
        setServicosById(Object.fromEntries(allServicos.map((s) => [s.id, s.nome])));
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  /* derived data */
  const atendMes    = useMemo(() => atendimentos.filter((a) => sameYM(new Date(a.data_atendimento), thisYear, thisMonth)),       [atendimentos]);
  const atendMesAnt = useMemo(() => atendimentos.filter((a) => sameYM(new Date(a.data_atendimento), lastMonthYear, lastMonth)),  [atendimentos]);
  const revenueMes    = useMemo(() => atendMes.filter((a) => a.status === "concluido").reduce((s, a) => s + Number(a.valor_final), 0), [atendMes]);
  const revenueMesAnt = useMemo(() => atendMesAnt.filter((a) => a.status === "concluido").reduce((s, a) => s + Number(a.valor_final), 0), [atendMesAnt]);
  const atendDelta   = useMemo(() => pct(atendMes.length, atendMesAnt.length),  [atendMes, atendMesAnt]);
  const revenueDelta = useMemo(() => pct(revenueMes, revenueMesAnt),             [revenueMes, revenueMesAnt]);

  const clientesAtivos  = useMemo(() => usuarios.filter((u) => u.tipo_perfil === "cliente" && u.ativo).length,                                                             [usuarios]);
  const newClientesMes  = useMemo(() => usuarios.filter((u) => u.tipo_perfil === "cliente" && sameYM(new Date(u.data_cadastro), thisYear, thisMonth)).length,              [usuarios]);
  const lojasAtivas     = useMemo(() => lojas.filter((l) => l.ativo).length,                                                                                               [lojas]);
  const servicosConcluidos = useMemo(() => atendMes.filter((a) => a.status === "concluido").length,                                                                        [atendMes]);

  const atendHoje = useMemo(() => atendimentos.filter((a) => {
    const d = new Date(a.data_atendimento);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
  }).sort((a, b) => new Date(a.data_atendimento).getTime() - new Date(b.data_atendimento).getTime()), [atendimentos]);

  /* alerts */
  const agendadosAtrasados = useMemo(() => { const h = new Date(); h.setHours(0,0,0,0); return atendimentos.filter((a) => a.status === "agendado" && new Date(a.data_atendimento) < h).length; }, [atendimentos]);
  const lojasSemEquipe     = useMemo(() => lojas.filter((l) => l.funcionarios.length === 0).length,                       [lojas]);
  const clientesInativos   = useMemo(() => usuarios.filter((u) => u.tipo_perfil === "cliente" && !u.ativo).length,        [usuarios]);
  const hasAlerts = agendadosAtrasados > 0 || lojasSemEquipe > 0 || clientesInativos > 0;

  /* monthly revenue chart */
  const monthlyRevenue = useMemo(() => {
    const map: Record<string, number> = {};
    atendimentos.forEach((a) => {
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
  }, [atendimentos]);

  /* service distribution donut */
  const serviceDistribution = useMemo(() => {
    const cats: Record<string, number> = { tosa: 0, saude: 0, comportamento: 0, hospedagem: 0, outros: 0 };
    atendimentos.forEach((a) => (a.items ?? []).forEach((item) => { cats[getServCat(servicosById[item.service_id] ?? "")]++; }));
    const total = Object.values(cats).reduce((s, v) => s + v, 0);
    if (total === 0) return [];
    return [
      { label: "Banho/Tosa",    value: cats.tosa,          color: "#1c46f3" },
      { label: "Saúde",         value: cats.saude,         color: "#F5A800" },
      { label: "Comportamento", value: cats.comportamento, color: "#00A651" },
      { label: "Hospedagem",    value: cats.hospedagem,    color: "#7c3aed" },
      { label: "Outros",        value: cats.outros,        color: "#6B7280" },
    ].filter((s) => s.value > 0);
  }, [atendimentos, servicosById]);

  function serviceNames(at: Atendimento) {
    if (!at.items?.length) return "—";
    return at.items.slice(0, 2).map((item) => servicosById[item.service_id] ?? `Serviço #${item.service_id}`).join(", ");
  }

  const monthLabel = now.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  const dateLabel  = now.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  const kpis = [
    { label: "Receita do Mês",        value: loading ? "—" : fmtMoney(revenueMes),       delta: revenueDelta,     badge: null as string | null,                              iconBg: "bg-[#1c46f3]/10",  iconCls: "text-[#1c46f3]", Icon: TrendingUp,    to: "/atendimentos" },
    { label: "Clientes Ativos",        value: loading ? "—" : String(clientesAtivos),      delta: null as number | null, badge: newClientesMes > 0 ? `+${newClientesMes} este mês` : null, iconBg: "bg-emerald-50",    iconCls: "text-[#00A651]", Icon: Users,         to: "/usuarios"     },
    { label: "Pets Cadastrados",       value: loading ? "—" : String(totalPets),           delta: null as number | null, badge: null as string | null,                              iconBg: "bg-amber-50",      iconCls: "text-[#F5A800]", Icon: PawPrint,      to: "/pets"         },
    { label: "Atendimentos Hoje",      value: loading ? "—" : String(atendHoje.length),    delta: null as number | null, badge: null as string | null,                              iconBg: "bg-red-50",        iconCls: "text-red-500",   Icon: CalendarCheck, to: "/atendimentos" },
    { label: "Atendimentos Concluídos",    value: loading ? "—" : String(servicosConcluidos),  delta: atendDelta,       badge: null as string | null,                              iconBg: "bg-emerald-50",    iconCls: "text-[#00A651]", Icon: Scissors,      to: "/atendimentos" },
    { label: "Lojas Ativas",           value: loading ? "—" : String(lojasAtivas),         delta: null as number | null, badge: null as string | null,                              iconBg: "bg-[#1c46f3]/10",  iconCls: "text-[#1c46f3]", Icon: Store,         to: "/lojas"        },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">

      {/* ── Hero Banner ─────────────────────────────────────── */}
      <div className="relative mb-6 overflow-hidden rounded-md bg-[#1c46f3] px-8 py-10">
        <div className="relative z-10 max-w-md">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-[#F5A800]">
            Visão Geral do Negócio
          </p>
          <h1 className="text-3xl font-extrabold leading-tight text-white">
            {greeting}, <span className="text-[#F5A800]">{firstName}</span>!
          </h1>
          <p className="mt-1.5 text-[15px] text-white/75">
            Bem-vindo ao painel de gestão
          </p>
          <p className="mt-3 flex items-center gap-1.5 text-xs capitalize text-white/50">
            <Calendar size={13} />
            {dateLabel} — Dados em tempo real
          </p>
        </div>
        {/* decorative shapes */}
        <div className="absolute right-8 top-1/2 hidden -translate-y-1/2 items-center gap-3 lg:flex" aria-hidden="true">
          <div className="flex flex-col items-center gap-2">
            <div className="h-4 w-4 rotate-45 rounded bg-[#F5A800]" />
            <div className="h-6 w-6 rounded-full border-2 border-[#00A651]" />
            <div className="h-3 w-3 rounded bg-[#00A651]" />
          </div>
          <div className="mt-5 flex flex-col items-center gap-2">
            <div style={{ width: 0, height: 0, borderLeft: "12px solid transparent", borderRight: "12px solid transparent", borderBottom: "20px solid #F5A800" }} />
            <div className="h-8 w-8 rounded bg-white/15" />
            <div className="h-5 w-5 rounded-full bg-[#00A651]" />
          </div>
          <div className="-mt-2 flex flex-col items-center gap-2">
            <div className="h-5 w-5 rotate-45 rounded border-2 border-[#F5A800]" />
            <div className="h-10 w-10 rounded-full bg-white/10" />
            <div style={{ width: 0, height: 0, borderLeft: "8px solid transparent", borderRight: "8px solid transparent", borderTop: "15px solid rgba(255,255,255,0.35)" }} />
          </div>
        </div>
      </div>

      {/* ── Alerts (compact strip) ───────────────────────────── */}
      {!loading && hasAlerts && (
        <div className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-md border border-amber-200 bg-amber-50 px-4 py-2.5">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-600">
            <AlertTriangle size={13} /> Alertas operacionais:
          </span>
          {agendadosAtrasados > 0 && (
            <Link to="/atendimentos" className="flex items-center gap-1 text-xs text-amber-700 hover:underline">
              <Clock size={11} /> {agendadosAtrasados} em atraso
            </Link>
          )}
          {lojasSemEquipe > 0 && (
            <Link to="/lojas" className="flex items-center gap-1 text-xs text-amber-700 hover:underline">
              <Store size={11} /> {lojasSemEquipe} {lojasSemEquipe === 1 ? "loja" : "lojas"} sem equipe
            </Link>
          )}
          {clientesInativos > 0 && (
            <Link to="/usuarios" className="flex items-center gap-1 text-xs text-amber-700 hover:underline">
              <AlertCircle size={11} /> {clientesInativos} clientes inativos
            </Link>
          )}
        </div>
      )}

      {/* ── Section title ─────────────────────────────────────── */}
      <div className="mb-4 flex items-center gap-2">
        <TrendingUp size={16} className="text-[#1c46f3]" />
        <h2 className="text-[15px] font-semibold text-gray-800">Resumo do Mês</h2>
        <span className="text-xs capitalize text-gray-400">{monthLabel}</span>
      </div>

      {/* ── KPI Grid ─────────────────────────────────────────── */}
      <div className="mb-7 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {kpis.map((k) => (
          <Link
            key={k.label}
            to={k.to}
            className="group flex flex-col gap-3 rounded-md border border-gray-200 bg-white p-4 transition hover:shadow-[0_2px_12px_rgba(28,70,243,0.1)]"
          >
            <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${k.iconBg}`}>
              <k.Icon size={17} className={k.iconCls} />
            </div>
            <div>
              <p className="text-xs text-gray-500">{k.label}</p>
              <p className="mt-0.5 text-2xl font-extrabold leading-none text-gray-900">{k.value}</p>
              {k.delta !== null && k.delta !== undefined && <Delta value={k.delta} />}
              {k.badge && <span className="mt-0.5 block text-xs font-medium text-[#1c46f3]">{k.badge}</span>}
            </div>
          </Link>
        ))}
      </div>

      {/* ── Charts Row ─────────────────────────────────────── */}
      <div className="mb-7 grid gap-4 lg:grid-cols-[2fr_1fr]">
        {/* Line chart — revenue */}
        <div className="rounded-md border border-gray-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp size={14} className="text-[#1c46f3]" />
              <span className="text-sm font-semibold text-gray-800">Faturamento — Últimos 6 Meses</span>
            </div>
            <span className="rounded bg-[#1c46f3] px-2 py-0.5 text-[10px] font-bold text-white">
              {now.getFullYear()}
            </span>
          </div>
          {loading
            ? <div className="flex h-[180px] items-center justify-center text-sm text-gray-300">Carregando...</div>
            : <LineChart data={monthlyRevenue} />
          }
        </div>

        {/* Donut chart — service distribution */}
        <div className="rounded-md border border-gray-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PawPrint size={14} className="text-[#F5A800]" />
              <span className="text-sm font-semibold text-gray-800">Serviço por Atendimento</span>
            </div>
            <span className="rounded border border-[#1c46f3] px-2 py-0.5 text-[10px] font-semibold capitalize text-[#1c46f3]">
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

        {/* Recent atendimentos table */}
        <div className="overflow-hidden rounded-md border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3.5">
            <div className="flex items-center gap-2">
              <Users size={14} className="text-[#1c46f3]" />
              <span className="text-sm font-semibold text-gray-800">Atendimentos Recentes</span>
            </div>
            <Link to="/atendimentos" className="rounded border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-500 transition hover:border-[#1c46f3] hover:text-[#1c46f3]">
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
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">Pet / Serviço</th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">Data</th>
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {atendimentos.slice(0, 6).map((at) => (
                    <tr key={at.id} className="transition hover:bg-gray-50/60">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-800">{petsById[at.pet_id] ?? `Pet #${at.pet_id}`}</p>
                        <p className="text-xs text-gray-400">{serviceNames(at)}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
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

        {/* Today's agenda */}
        <div className="overflow-hidden rounded-md border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3.5">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-[#1c46f3]" />
              <span className="text-sm font-semibold text-gray-800">Agenda de Hoje</span>
            </div>
            <span className="rounded bg-[#00A651] px-2 py-0.5 text-[10px] font-bold capitalize text-white">
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
                    <span className="min-w-[40px] text-xs font-bold text-[#1c46f3]">{time}</span>
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${sBg}`}>
                      <SIcon size={14} className={sCls} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-gray-800">{firstNome || "Atendimento"}</p>
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
