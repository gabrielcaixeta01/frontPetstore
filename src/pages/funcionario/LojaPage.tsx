import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Store,
  Phone,
  Mail,
  MapPin,
  FileText,
  Users,
  Briefcase,
  Banknote,
  Calendar,
} from "lucide-react";
import { apexTheme } from "../../lib/theme";
import { getLojaById } from "../../services/lojaService";
import type { Loja } from "../../types/loja";

function formatMoney(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("pt-BR");
}

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export default function LojaPage() {
  const c = apexTheme.colors;
  const { id } = useParams();
  const navigate = useNavigate();

  const [loja, setLoja] = useState<Loja | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadLoja() {
      if (!id) {
        setError("ID da loja não informado.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await getLojaById(Number(id));
        setLoja(data);
        setError("");
      } catch (err) {
        console.error(err);
        setError("Erro ao carregar os dados da loja.");
      } finally {
        setLoading(false);
      }
    }
    loadLoja();
  }, [id]);

  return (
    <main className={`min-h-screen ${c.bgSoft} px-4 py-10`}>
      <div className="mx-auto max-w-3xl space-y-6">

        {/* Voltar */}
        <button
          onClick={() => navigate("/lojas")}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition"
        >
          <ArrowLeft size={16} />
          Voltar para lojas
        </button>

        {/* Estados */}
        {loading && (
          <div className={`rounded-2xl border ${c.border} ${c.card} p-6 text-sm ${c.textSoft}`}>
            Carregando loja...
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {!loading && !error && loja && (
          <>
            {/* Card principal — banner + nome */}
            <div className={`rounded-3xl border ${c.border} bg-white shadow-sm overflow-hidden`}>
              <div className="h-24 bg-gradient-to-r from-purple-600 to-[#1c46f3]" />

              <div className="px-8 pb-8">
                <div className="-mt-10 mb-4 flex items-end gap-4">
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white bg-purple-600 shadow-md">
                    <Store size={32} className="text-white" />
                  </div>
                </div>

                <h1 className="text-2xl font-bold text-gray-900">{loja.nome}</h1>
                <p className="mt-1 text-sm text-gray-500">
                  {loja.end_rua}, {loja.end_numero} — {loja.end_bairro}, {loja.end_cidade}/{loja.end_estado}
                </p>
              </div>
            </div>

            {/* Contato */}
            <div className={`rounded-3xl border ${c.border} bg-white shadow-sm p-8 space-y-5`}>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
                Contato
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <InfoField icon={<Phone size={15} />} label="Telefone" value={loja.telefone} />
                <InfoField icon={<Mail size={15} />} label="E-mail" value={loja.email} />
                <InfoField icon={<FileText size={15} />} label="CNPJ" value={loja.cnpj} />
              </div>
            </div>

            {/* Endereço */}
            <div className={`rounded-3xl border ${c.border} bg-white shadow-sm p-8 space-y-5`}>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
                Endereço
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <InfoField icon={<MapPin size={15} />} label="Rua" value={loja.end_rua} />
                <InfoField icon={<MapPin size={15} />} label="Número" value={loja.end_numero} />
                <InfoField icon={<MapPin size={15} />} label="Bairro" value={loja.end_bairro} />
                <InfoField icon={<MapPin size={15} />} label="Cidade / UF" value={`${loja.end_cidade} / ${loja.end_estado}`} />
                <InfoField icon={<MapPin size={15} />} label="CEP" value={loja.end_cep} />
              </div>
            </div>

            {/* Funcionários */}
            <div className={`rounded-3xl border ${c.border} bg-white shadow-sm p-8 space-y-5`}>
              <div className="flex items-center gap-3">
                <Users size={18} className="text-[#1c46f3]" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
                  Funcionários
                </h2>
                <span className="ml-auto rounded-full bg-[#1c46f3]/10 px-2.5 py-0.5 text-xs font-semibold text-[#1c46f3]">
                  {loja.funcionarios.length}
                </span>
              </div>

              {loja.funcionarios.length === 0 ? (
                <p className="text-sm text-gray-400">Nenhum funcionário vinculado a esta loja.</p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {loja.funcionarios.map((func) => (
                    <div
                      key={`${func.usuario_id}-${func.matricula}`}
                      className={`rounded-2xl border ${c.border} p-4 space-y-3`}
                    >
                      {/* Avatar + nome */}
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1c46f3]/10 text-sm font-bold text-[#1c46f3]">
                          {getInitials(func.nome)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 leading-tight">{func.nome}</p>
                          <span className="inline-block rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                            {func.cargo}
                          </span>
                        </div>
                      </div>

                      {/* Detalhes */}
                      <div className="space-y-1.5">
                        <p className="flex items-center gap-2 text-xs text-gray-500">
                          <Briefcase size={12} />
                          Mat. {func.matricula}
                        </p>
                        <p className="flex items-center gap-2 text-xs text-gray-500">
                          <Banknote size={12} />
                          {formatMoney(func.salario)}
                        </p>
                        <p className="flex items-center gap-2 text-xs text-gray-500">
                          <Calendar size={12} />
                          Desde {formatDate(func.data_contratacao)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function InfoField({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="flex items-center gap-2 text-xs font-medium text-gray-400">
        {icon}
        {label}
      </p>
      <p className="text-sm font-semibold text-gray-800">{value || "—"}</p>
    </div>
  );
}
