import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, Store, Phone, Mail, MapPin, FileText,
  Users, Briefcase, Banknote, Calendar, CalendarCheck,
  TrendingUp, Clock, ExternalLink,
} from "lucide-react";
import { getLojaById } from "../../services/lojaService";
import { getAppointments } from "../../services/atendimentoService";
import type { Loja } from "../../types/loja";
import type { Atendimento } from "../../types/atendimento";

const TEAL  = "#0D7377";
const TDARK = "#085C60";
const BORD  = "#E2E8F0";
const MUTED = "#64748B";
const COAL  = "#1E293B";

function formatMoney(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}
function formatMoneyShort(value: number) {
  if (value >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1000) return `R$ ${(value / 1000).toFixed(1)}k`;
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}
function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return Number.isNaN(d.getTime()) ? dateStr : d.toLocaleDateString("pt-BR");
}
function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}
function strip(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function getAvatarStyle(cargo: string): React.CSSProperties {
  const n = strip(cargo);
  const isLeadership = /gerente|gestor|diretor|coordenador/.test(n);
  return {
    background: "#e6f5f5",
    color: "#085C60",
    ...(isLeadership && { boxShadow: "0 0 0 2px #fff, 0 0 0 4px #F59E0B" }),
  };
}

function getCargoBadge(_cargo: string): string {
  return "border-teal-200 bg-teal-50 text-teal-700";
}

const DEFAULT_SCHEDULE = [
  { day: "Segunda-feira", open: "08:00", close: "18:00" },
  { day: "Terça-feira",   open: "08:00", close: "18:00" },
  { day: "Quarta-feira",  open: "08:00", close: "18:00" },
  { day: "Quinta-feira",  open: "08:00", close: "18:00" },
  { day: "Sexta-feira",   open: "08:00", close: "18:00" },
  { day: "Sábado",        open: "08:00", close: "14:00" },
  { day: "Domingo",       open: null,    close: null     },
];

function getTodayIdx() {
  const d = new Date().getDay();
  return d === 0 ? 6 : d - 1;
}
function isOpenNow() {
  const idx = getTodayIdx();
  const today = DEFAULT_SCHEDULE[idx];
  if (!today.open || !today.close) return false;
  const now = new Date();
  const mins = now.getHours() * 60 + now.getMinutes();
  const [oh, om] = today.open.split(":").map(Number);
  const [ch, cm] = today.close.split(":").map(Number);
  return mins >= oh * 60 + om && mins < ch * 60 + cm;
}

function InfoField({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest" style={{ color: MUTED }}>
        {icon} {label}
      </p>
      <p className="text-sm font-semibold" style={{ color: COAL }}>{value || "—"}</p>
    </div>
  );
}

function SectionCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white p-5 ${className}`} style={{ border: `1px solid ${BORD}`, borderRadius: "10px" }}>
      {children}
    </div>
  );
}

function SectionTitle({ icon, children, badge }: { icon: React.ReactNode; children: React.ReactNode; badge?: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <span style={{ color: TEAL }}>{icon}</span>
      <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: MUTED }}>{children}</h2>
      {badge && <span className="ml-auto">{badge}</span>}
    </div>
  );
}

export default function LojaPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loja, setLoja]                 = useState<Loja | null>(null);
  const [atendimentos, setAtendimentos] = useState<Atendimento[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");

  useEffect(() => {
    if (!id) { setError("ID da loja não informado."); setLoading(false); return; }
    Promise.all([
      getLojaById(Number(id)),
      getAppointments().catch(() => [] as Atendimento[]),
    ])
      .then(([lojaData, atendData]) => { setLoja(lojaData); setAtendimentos(atendData); })
      .catch(() => setError("Erro ao carregar dados da loja."))
      .finally(() => setLoading(false));
  }, [id]);

  const now = new Date();
  const thisYear = now.getFullYear();
  const thisMonth = now.getMonth();

  const { atendMes, faturMes } = useMemo(() => {
    if (!loja) return { atendMes: 0, faturMes: 0 };
    let count = 0; let fatur = 0;
    atendimentos.forEach((at) => {
      if (at.loja_id !== loja.id) return;
      const d = new Date(at.data_atendimento);
      if (d.getFullYear() === thisYear && d.getMonth() === thisMonth) {
        count++;
        if (at.status === "concluido") fatur += Number(at.valor_final) || 0;
      }
    });
    return { atendMes: count, faturMes: fatur };
  }, [atendimentos, loja, thisYear, thisMonth]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">

      <button onClick={() => navigate("/lojas")}
        className="mb-6 flex items-center gap-2 text-sm font-medium transition hover:opacity-70"
        style={{ color: TEAL }}>
        <ArrowLeft size={15} /> Voltar para lojas
      </button>

      {loading && (
        <div className="p-8 text-center text-sm"
          style={{ border: `1px solid ${BORD}`, borderRadius: "10px", background: "#fff", color: MUTED }}>
          Carregando loja...
        </div>
      )}
      {error && (
        <div className="px-4 py-3 text-sm"
          style={{ borderRadius: "6px", border: "1px solid #FECACA", background: "rgba(254,202,202,0.25)", color: "#DC2626" }}>
          {error}
        </div>
      )}

      {!loading && !error && loja && (
        <div className="space-y-5">

          {/* Hero banner */}
          <div className="overflow-hidden" style={{ borderRadius: "10px", border: `1px solid ${BORD}` }}>
            <div className="px-6 py-5" style={{ background: TEAL }}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center"
                    style={{ background: "rgba(255,255,255,0.15)", borderRadius: "8px" }}>
                    <Store size={22} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.55)" }}>
                      Unidade
                    </p>
                    <p className="text-xl font-extrabold text-white">{loja.nome}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  {[
                    { label: "Equipe",       value: String(loja.funcionarios.length), icon: <Users size={13} className="mb-0.5 opacity-70" />,        accent: "rgba(255,255,255,0.15)" },
                    { label: "Atend. / Mês", value: String(atendMes),                 icon: <CalendarCheck size={13} className="mb-0.5 opacity-70" />, accent: "rgba(255,255,255,0.15)" },
                    { label: "Fat. / Mês",   value: formatMoneyShort(faturMes),       icon: <TrendingUp size={13} className="mb-0.5 opacity-70" />,    accent: "rgba(255,255,255,0.15)" },
                  ].map(({ label, value, icon, accent }) => (
                    <div key={label} className="px-4 py-2.5 text-white" style={{ background: accent, borderRadius: "6px" }}>
                      <p className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.70)" }}>{label}</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-extrabold">{value}</span>
                        {icon}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-6 py-3" style={{ background: "#F8FAFC", borderTop: `1px solid ${BORD}` }}>
              <p className="flex items-center gap-1.5 text-sm" style={{ color: MUTED }}>
                <MapPin size={13} className="shrink-0" style={{ color: TEAL }} />
                {loja.street}, {loja.number} — {loja.neighborhood}, {loja.city}/{loja.state}
              </p>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {/* Contato */}
            <SectionCard>
              <SectionTitle icon={<Phone size={15} />}>Contato</SectionTitle>
              <div className="space-y-4">
                <InfoField icon={<Phone size={12} />}    label="Telefone" value={loja.telefone} />
                <InfoField icon={<Mail size={12} />}     label="E-mail"   value={loja.email}    />
                <InfoField icon={<FileText size={12} />} label="CNPJ"     value={loja.cnpj}     />
              </div>
            </SectionCard>

            {/* Endereço */}
            <SectionCard>
              <SectionTitle icon={<MapPin size={15} />}>Endereço</SectionTitle>
              <div className="grid gap-4 sm:grid-cols-2">
                <InfoField icon={<MapPin size={12} />} label="Rua"       value={loja.street}       />
                <InfoField icon={<MapPin size={12} />} label="Número"    value={loja.number}        />
                <InfoField icon={<MapPin size={12} />} label="Bairro"    value={loja.neighborhood}  />
                <InfoField icon={<MapPin size={12} />} label="Cidade/UF" value={`${loja.city} / ${loja.state}`} />
                <InfoField icon={<MapPin size={12} />} label="CEP"       value={loja.cep}           />
              </div>
              <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${loja.street} ${loja.number}, ${loja.neighborhood}, ${loja.city}, ${loja.state}, Brasil`)}`}
                target="_blank" rel="noopener noreferrer"
                className="mt-4 flex items-center gap-2 px-4 py-2 text-sm font-medium transition hover:opacity-80"
                style={{ border: `1px solid rgba(13,115,119,0.25)`, borderRadius: "6px", color: TEAL }}>
                <MapPin size={14} /> Ver no Google Maps
                <ExternalLink size={12} className="ml-auto opacity-50" />
              </a>
            </SectionCard>
          </div>

          {/* Horário */}
          <SectionCard>
            <SectionTitle
              icon={<Clock size={15} />}
              badge={
                isOpenNow()
                  ? <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Aberto agora</span>
                  : <span className="flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-bold text-gray-500"><span className="h-1.5 w-1.5 rounded-full bg-gray-400" />Fechado agora</span>
              }
            >
              Horário de Funcionamento
            </SectionTitle>
            <div className="overflow-hidden rounded-lg border" style={{ borderColor: BORD }}>
              {DEFAULT_SCHEDULE.map((row, i) => {
                const isToday = i === getTodayIdx();
                return (
                  <div key={row.day}
                    className="flex items-center justify-between px-4 py-2.5"
                    style={{
                      background: isToday ? "rgba(13,115,119,0.05)" : i % 2 === 0 ? "#FAFAFA" : "#fff",
                      borderTop: i > 0 ? `1px solid ${BORD}` : undefined,
                    }}>
                    <span className="text-sm" style={{ color: isToday ? TEAL : "#374151", fontWeight: isToday ? 700 : 500 }}>
                      {row.day}
                      {isToday && <span className="ml-2 text-[10px] font-bold uppercase tracking-wide" style={{ color: TEAL }}>(hoje)</span>}
                    </span>
                    {row.open && row.close ? (
                      <span className="text-sm font-semibold tabular-nums" style={{ color: isToday ? TEAL : "#374151" }}>
                        {row.open} – {row.close}
                      </span>
                    ) : (
                      <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-[11px] font-bold text-red-500">Fechado</span>
                    )}
                  </div>
                );
              })}
            </div>
          </SectionCard>

          {/* Equipe */}
          <SectionCard>
            <SectionTitle
              icon={<Users size={16} />}
              badge={
                <span className="px-2.5 py-0.5 text-xs font-bold"
                  style={{ background: "#e6f5f5", borderRadius: "20px", color: TDARK }}>
                  {loja.funcionarios.length}
                </span>
              }
            >
              Equipe
            </SectionTitle>

            {loja.funcionarios.length === 0 ? (
              <p className="text-sm" style={{ color: MUTED }}>Nenhum funcionário vinculado a esta loja.</p>
            ) : (
              <div className="overflow-hidden" style={{ border: `1px solid ${BORD}`, borderRadius: "6px" }}>
                <div className="hidden grid-cols-[1fr_120px_110px_100px] gap-4 border-b px-4 py-2.5 text-xs font-bold uppercase tracking-widest sm:grid"
                  style={{ borderColor: BORD, background: "#F8FAFC", color: MUTED }}>
                  <span>Funcionário</span>
                  <span>Cargo</span>
                  <span>Salário</span>
                  <span>Desde</span>
                </div>
                <div className="divide-y" style={{ borderColor: BORD }}>
                  {loja.funcionarios.map((func) => (
                    <div key={`${func.usuario_id}-${func.matricula}`}
                      className="px-4 py-3 transition hover:bg-gray-50/60 sm:grid sm:grid-cols-[1fr_120px_110px_100px] sm:items-center sm:gap-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                          style={getAvatarStyle(func.cargo)}>
                          {getInitials(func.nome)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate text-sm font-bold" style={{ color: COAL }}>{func.nome}</p>
                            <span className={`inline-flex sm:hidden items-center border px-2 py-0.5 text-xs font-semibold capitalize ${getCargoBadge(func.cargo)}`}>
                              {func.cargo.trim()}
                            </span>
                          </div>
                          <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs" style={{ color: MUTED }}>
                            <span className="flex items-center gap-1"><Briefcase size={10} /> Mat. {func.matricula}</span>
                            <span className="flex items-center gap-1 sm:hidden"><Banknote size={10} /> {formatMoney(func.salario)}</span>
                            <span className="flex items-center gap-1 sm:hidden"><Calendar size={10} /> {formatDate(func.data_contratacao)}</span>
                          </p>
                        </div>
                      </div>
                      <span className={`hidden sm:inline-flex items-center border px-2 py-0.5 text-xs font-semibold capitalize ${getCargoBadge(func.cargo)}`}
                        style={{ borderRadius: "20px" }}>
                        {func.cargo.trim()}
                      </span>
                      <span className="hidden sm:flex items-center gap-1 text-xs" style={{ color: "#374151" }}>
                        <Banknote size={11} style={{ color: MUTED }} />
                        {formatMoney(func.salario)}
                      </span>
                      <span className="hidden sm:flex items-center gap-1 text-xs" style={{ color: MUTED }}>
                        <Calendar size={11} style={{ color: MUTED }} />
                        {formatDate(func.data_contratacao)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </SectionCard>

          {/* KPIs */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {[
              { label: "Atendimentos este mês", value: atendMes,                   icon: CalendarCheck },
              { label: "Faturamento este mês",  value: formatMoneyShort(faturMes), icon: TrendingUp    },
              { label: "Funcionários",          value: loja.funcionarios.length,    icon: Users         },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="bg-white p-4"
                style={{ border: `1px solid ${BORD}`, borderRadius: "10px" }}>
                <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg"
                  style={{ background: "#e6f5f5" }}>
                  <Icon size={16} style={{ color: TEAL }} />
                </div>
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: MUTED }}>{label}</p>
                <p className="mt-1 text-2xl font-extrabold" style={{ color: COAL }}>{value}</p>
              </div>
            ))}
          </div>

        </div>
      )}
    </div>
  );
}
