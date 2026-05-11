import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Store, Phone, Mail, MapPin, FileText, Users } from "lucide-react";
import { getLojaById } from "../../services/lojaService";
import type { Loja } from "../../types/loja";

function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

function InfoField({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="flex items-center gap-2 text-xs font-medium text-gray-400">{icon} {label}</p>
      <p className="text-sm font-semibold text-gray-800">{value || "—"}</p>
    </div>
  );
}

export default function ClienteLojaPage() {
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
    <div className="px-8 py-8">
      <button
        onClick={() => navigate("/lojas")}
        className="mb-6 flex items-center gap-2 text-sm text-gray-500 transition hover:text-gray-800"
      >
        <ArrowLeft size={15} /> Voltar para lojas
      </button>

      {loading && <p className="text-sm text-gray-400">Carregando loja...</p>}
      {error && <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error}</p>}

      {!loading && !error && loja && (
        <div className="space-y-5">
          {/* Banner + nome */}
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="h-24 bg-gradient-to-r from-purple-500 to-[#1c46f3]" />
            <div className="px-6 pb-6">
              <div className="-mt-9 mb-3 flex items-end gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-4 border-white bg-purple-600 shadow-md">
                  <Store size={24} className="text-white" />
                </div>
              </div>
              <h1 className="text-xl font-bold text-gray-900">{loja.nome}</h1>
              <p className="mt-0.5 text-sm text-gray-500">
                {loja.street}, {loja.number} — {loja.neighborhood}, {loja.city}/{loja.state}
              </p>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {/* Contato */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">Contato</h2>
              <div className="space-y-3">
                <InfoField icon={<Phone size={13} />} label="Telefone" value={loja.telefone} />
                <InfoField icon={<Mail size={13} />} label="E-mail" value={loja.email} />
                <InfoField icon={<FileText size={13} />} label="CNPJ" value={loja.cnpj} />
              </div>
            </div>

            {/* Endereço */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">Endereço</h2>
              <div className="space-y-3">
                <InfoField icon={<MapPin size={13} />} label="Logradouro" value={`${loja.street}, ${loja.number}`} />
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
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Nossa Equipe</h2>
              <span className="ml-auto rounded-full bg-[#1c46f3]/10 px-2 py-0.5 text-xs font-semibold text-[#1c46f3]">
                {loja.funcionarios.length}
              </span>
            </div>
            {loja.funcionarios.length === 0 ? (
              <p className="text-sm text-gray-400">Nenhum funcionário vinculado a esta loja.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {loja.funcionarios.map((func) => (
                  <div key={`${func.usuario_id}-${func.matricula}`} className="flex items-center gap-3 rounded-xl border border-gray-100 p-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1c46f3]/10 text-sm font-bold text-[#1c46f3]">
                      {getInitials(func.nome)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-900">{func.nome}</p>
                      <span className="inline-block rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                        {func.cargo}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
