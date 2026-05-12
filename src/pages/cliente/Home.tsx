import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  PawPrint,
  CalendarCheck,
  Scissors,
  Store,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { getPets } from "../../services/petService";
import { getAppointments } from "../../services/atendimentoService";
import type { Pet } from "../../types/pet";
import type { Appointment } from "../../types/atendimento";

function getStoredUser() {
  try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; }
}

const statusConfig: Record<string, { label: string; icon: typeof Clock; cls: string }> = {
  agendado: { label: "Agendado", icon: Clock, cls: "text-yellow-600 bg-yellow-50 border-yellow-200" },
  concluido: { label: "Concluído", icon: CheckCircle2, cls: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  cancelado: { label: "Cancelado", icon: XCircle, cls: "text-red-500 bg-red-50 border-red-200" },
};

const pgmtLabel: Record<string, string> = {
  pix: "Pix",
  cartao_credito: "Cartão Crédito",
  cartao_debito: "Cartão Débito",
  dinheiro: "Dinheiro",
};

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
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userId]);

  const agendados = atendimentos.filter((a) => a.status === "agendado");
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";
  const firstName = user.name?.split(" ")[0] ?? "Cliente";

  const quickLinks = [
    { to: "/pets", label: "Meus Pets", icon: PawPrint, bg: "from-[#1c46f3]/10 to-[#1c46f3]/5", iconCls: "text-[#1c46f3]", count: pets.length },
    { to: "/atendimentos", label: "Atendimentos", icon: CalendarCheck, bg: "from-[#00bb69]/10 to-[#00bb69]/5", iconCls: "text-[#00bb69]", count: agendados.length },
    { to: "/servicos", label: "Serviços", icon: Scissors, bg: "from-yellow-100 to-yellow-50", iconCls: "text-yellow-600", count: null },
    { to: "/lojas", label: "Lojas", icon: Store, bg: "from-purple-100 to-purple-50", iconCls: "text-purple-600", count: null },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      {/* Greeting */}
      <div className="mb-8">
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

      {/* Quick stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
              {pets.slice(0, 4).map((pet) => (
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
                  {pet.sexo && <span className="text-xs capitalize text-gray-400">{pet.sexo}</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Atendimentos recentes */}
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-50 px-5 py-4">
            <h2 className="font-semibold text-gray-800">Atendimentos recentes</h2>
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
              {atendimentos.slice(0, 4).map((at) => {
                const cfg = statusConfig[at.status] ?? statusConfig.agendado;
                return (
                  <div key={at.id} className="flex items-center gap-3 px-5 py-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#00bb69]/10">
                      <CalendarCheck size={15} className="text-[#00bb69]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-800">
                        {new Date(at.data_atendimento).toLocaleDateString("pt-BR")}
                      </p>
                      <p className="text-xs text-gray-400">
                        {pgmtLabel[at.forma_pagamento] ?? at.forma_pagamento} · R${" "}
                        {Number(at.valor_final).toFixed(2)}
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
      </div>
    </div>
  );
}
