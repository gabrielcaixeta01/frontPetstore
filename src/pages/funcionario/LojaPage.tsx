import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, Store, Phone, Mail, MapPin, FileText,
  Users, Briefcase, Banknote, Calendar,
} from "lucide-react";
import { getLojaById } from "../../services/lojaService";
import type { Loja } from "../../types/loja";

function formatMoney(value: number) {
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) { setError("ID da loja não informado."); setLoading(false); return; }
    getLojaById(Number(id))
      .then(setLoja)
      .catch(() => setError("Erro ao carregar dados da loja."))
      .finally(() => setLoading(false));
  }, [id]);

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
          {/* Banner + nome */}
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="h-24 bg-gradient-to-r from-purple-500 via-purple-600 to-[#1c46f3]" />
            <div className="px-6 pb-6">
              <div className="-mt-9 mb-4 flex items-end justify-between gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-4 border-white bg-purple-600 shadow-md">
                  <Store size={26} className="text-white" />
                </div>
                {loja.funcionarios?.length > 0 && (
                  <span className="mb-1 flex items-center gap-1.5 rounded-full bg-[#1c46f3]/10 px-3 py-1 text-xs font-semibold text-[#1c46f3]">
                    <Users size={12} /> {loja.funcionarios.length} funcionário{loja.funcionarios.length > 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <h1 className="text-xl font-bold text-gray-900">{loja.nome}</h1>
              <p className="mt-0.5 flex items-center gap-1.5 text-sm text-gray-400">
                <MapPin size={13} className="shrink-0" />
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

            {/* Endereço */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">Endereço</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <InfoField icon={<MapPin size={13} />} label="Rua" value={loja.street} />
                <InfoField icon={<MapPin size={13} />} label="Número" value={loja.number} />
                <InfoField icon={<MapPin size={13} />} label="Bairro" value={loja.neighborhood} />
                <InfoField icon={<MapPin size={13} />} label="Cidade / UF" value={`${loja.city} / ${loja.state}`} />
                <InfoField icon={<MapPin size={13} />} label="CEP" value={loja.cep} />
              </div>
            </div>
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
                <div className="grid grid-cols-[1fr_110px_110px_100px] gap-4 border-b border-gray-100 bg-gray-50 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  <span>Funcionário</span>
                  <span>Cargo</span>
                  <span>Salário</span>
                  <span>Desde</span>
                </div>
                <div className="divide-y divide-gray-50">
                  {loja.funcionarios.map((func) => (
                    <div
                      key={`${func.usuario_id}-${func.matricula}`}
                      className="grid grid-cols-[1fr_110px_110px_100px] items-center gap-4 px-4 py-3 transition hover:bg-gray-50/60"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1c46f3]/10 text-xs font-bold text-[#1c46f3]">
                          {getInitials(func.nome)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-gray-900">{func.nome}</p>
                          <p className="flex items-center gap-1 text-xs text-gray-400">
                            <Briefcase size={10} /> Mat. {func.matricula}
                          </p>
                        </div>
                      </div>
                      <span className="inline-flex w-fit items-center rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 capitalize">
                        {func.cargo}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-600">
                        <Banknote size={11} className="text-gray-400" />
                        {formatMoney(func.salario)}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-500">
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
