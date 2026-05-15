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

function getCargoBadge(cargo: string): string {
  const n = strip(cargo);
  if (/gerente|gestor|diretor|coordenador/.test(n))
    return "border-purple-200 bg-purple-50 text-purple-700";
  if (/veterinario|vet|medico|doutor/.test(n))
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (/tosador|groomer|esteticista|banho/.test(n))
    return "border-amber-200 bg-amber-50 text-amber-700";
  if (/atendente|recepcionist|vendedor|caixa/.test(n))
    return "border-blue-200 bg-blue-50 text-blue-700";
  return "border-gray-200 bg-gray-50 text-gray-600";
}

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-violet-100 text-violet-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-cyan-100 text-cyan-700",
];

function InfoField({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <p className="flex items-center gap-1.5 text-xs font-medium text-gray-400">{icon} {label}</p>
      <p className="text-sm font-semibold text-gray-800">{value || "—"}</p>
    </div>
  );
}

export default function LojaPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loja, setLoja] = useState<Loja | null>(null);
  const [atendimentos, setAtendimentos] = useState<Atendimento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
    let count = 0;
    let fatur = 0;
    atendimentos.forEach((at) => {
      if (at.loja_id !== loja.id) return;
      const d = new Date(at.data_atendimento);
      if (d.getFullYear() === thisYear && d.getMonth() === thisMonth) {
        count++;
        if (at.status === "concluido") fatur += at.valor_final;
      }
    });
    return { atendMes: count, faturMes: fatur };
  }, [atendimentos, loja, thisYear, thisMonth]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <button
        onClick={() => navigate("/lojas")}
        className="mb-6 flex items-center gap-2 text-sm text-gray-500 transition hover:text-gray-800"
      >
        <ArrowLeft size={15} /> Voltar para lojas
      </button>

      {loading && <p className="text-sm text-gray-400">Carregando loja...</p>}
      {error && <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

      {!loading && !error && loja && (
        <div className="space-y-5">
          {/* Banner — stats inside */}
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="bg-gradient-to-r from-purple-500 via-purple-600 to-[#1c46f3] px-6 py-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/20">
                    <Store size={22} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-white/60">Unidade</p>
                    <p className="text-xl font-bold text-white">{loja.nome}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="rounded-xl bg-white/15 px-4 py-2.5 text-white">
                    <p className="text-xs font-medium text-white/70">Equipe</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold">{loja.funcionarios.length}</span>
                      <Users size={13} className="mb-0.5 opacity-70" />
                    </div>
                  </div>
                  <div className="rounded-xl bg-white/15 px-4 py-2.5 text-white">
                    <p className="text-xs font-medium text-white/70">Atend. / Mês</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold">{atendMes}</span>
                      <CalendarCheck size={13} className="mb-0.5 opacity-70" />
                    </div>
                  </div>
                  <div className="rounded-xl bg-white/15 px-4 py-2.5 text-white">
                    <p className="text-xs font-medium text-white/70">Fat. / Mês</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold">{formatMoneyShort(faturMes)}</span>
                      <TrendingUp size={13} className="mb-0.5 opacity-70" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-4">
              <p className="flex items-center gap-1.5 text-sm text-gray-500">
                <MapPin size={13} className="shrink-0 text-gray-400" />
                {loja.street}, {loja.number} — {loja.neighborhood}, {loja.city}/{loja.state}
              </p>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {/* Contato */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">Contato</h2>
              <div className="space-y-4">
                <InfoField icon={<Phone size={13} />} label="Telefone" value={loja.telefone} />
                <InfoField icon={<Mail size={13} />} label="E-mail" value={loja.email} />
                <InfoField icon={<FileText size={13} />} label="CNPJ" value={loja.cnpj} />
              </div>
            </div>

            {/* Endereço + link mapa */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">Endereço</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <InfoField icon={<MapPin size={13} />} label="Rua" value={loja.street} />
                <InfoField icon={<MapPin size={13} />} label="Número" value={loja.number} />
                <InfoField icon={<MapPin size={13} />} label="Bairro" value={loja.neighborhood} />
                <InfoField icon={<MapPin size={13} />} label="Cidade / UF" value={`${loja.city} / ${loja.state}`} />
                <InfoField icon={<MapPin size={13} />} label="CEP" value={loja.cep} />
              </div>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${loja.street} ${loja.number}, ${loja.neighborhood}, ${loja.city}, ${loja.state}, Brasil`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex items-center gap-2 rounded-xl border border-[#1c46f3]/20 px-4 py-2 text-sm font-medium text-[#1c46f3] transition hover:bg-[#1c46f3]/5"
              >
                <MapPin size={14} /> Ver no Google Maps <ExternalLink size={12} className="ml-auto opacity-50" />
              </a>
            </div>
          </div>

          {/* Horário de funcionamento */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <Clock size={15} className="text-[#1c46f3]" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Horário de Funcionamento</h2>
            </div>
            {loja.horario_funcionamento ? (
              <p className="text-sm text-gray-700">{loja.horario_funcionamento}</p>
            ) : (
              <p className="text-sm text-gray-400">Não informado — edite o cadastro da loja para configurar.</p>
            )}
          </div>

          {/* Equipe */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Users size={16} className="text-[#1c46f3]" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Equipe</h2>
              <span className="ml-auto rounded-full bg-[#1c46f3]/10 px-2.5 py-0.5 text-xs font-semibold text-[#1c46f3]">
                {loja.funcionarios.length}
              </span>
            </div>

            {loja.funcionarios.length === 0 ? (
              <p className="text-sm text-gray-400">Nenhum funcionário vinculado a esta loja.</p>
            ) : (
              <div className="overflow-hidden rounded-xl border border-gray-100">
                {/* Desktop header */}
                <div className="hidden grid-cols-[1fr_120px_110px_100px] gap-4 border-b border-gray-100 bg-gray-50 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-gray-400 sm:grid">
                  <span>Funcionário</span>
                  <span>Cargo</span>
                  <span>Salário</span>
                  <span>Desde</span>
                </div>
                <div className="divide-y divide-gray-50">
                  {loja.funcionarios.map((func, i) => (
                    <div
                      key={`${func.usuario_id}-${func.matricula}`}
                      className="px-4 py-3 transition hover:bg-gray-50/60 sm:grid sm:grid-cols-[1fr_120px_110px_100px] sm:items-center sm:gap-4"
                    >
                      {/* Avatar + nome — sempre visível */}
                      <div className="flex min-w-0 items-center gap-3">
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}>
                          {getInitials(func.nome)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate text-sm font-semibold text-gray-900">{func.nome}</p>
                            {/* Badge visível inline em mobile */}
                            <span className={`inline-flex sm:hidden items-center rounded-full border px-2 py-0.5 text-xs font-semibold capitalize ${getCargoBadge(func.cargo)}`}>
                              {func.cargo}
                            </span>
                          </div>
                          <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-400">
                            <span className="flex items-center gap-1"><Briefcase size={10} /> Mat. {func.matricula}</span>
                            {/* Salary + date inline em mobile */}
                            <span className="flex items-center gap-1 sm:hidden"><Banknote size={10} /> {formatMoney(func.salario)}</span>
                            <span className="flex items-center gap-1 sm:hidden"><Calendar size={10} /> {formatDate(func.data_contratacao)}</span>
                          </p>
                        </div>
                      </div>
                      {/* Colunas adicionais — só visíveis em sm+ */}
                      <span className={`hidden sm:inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${getCargoBadge(func.cargo)}`}>
                        {func.cargo}
                      </span>
                      <span className="hidden sm:flex items-center gap-1 text-xs text-gray-600">
                        <Banknote size={11} className="text-gray-400" />
                        {formatMoney(func.salario)}
                      </span>
                      <span className="hidden sm:flex items-center gap-1 text-xs text-gray-500">
                        <Calendar size={11} className="text-gray-400" />
                        {formatDate(func.data_contratacao)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
