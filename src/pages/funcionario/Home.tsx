import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  PawPrint,
  CalendarCheck,
  Users,
  Store,
  Scissors,
  LayoutGrid,
  Tag,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
} from "lucide-react";
import { getPets } from "../../services/petService";
import { getAppointments } from "../../services/atendimentoService";
import { getUsuarios } from "../../services/usuarioService";
import { getLojas } from "../../services/lojaService";
import type { Atendimento } from "../../types/atendimento";

function getStoredUser() {
  try { return JSON.parse(localStorage.getItem("user") || "{}"); } catch { return {}; }
}

const statusConfig: Record<string, { label: string; icon: typeof Clock; cls: string; dot: string }> = {
  agendado: { label: "Agendado", icon: Clock, cls: "text-yellow-700 bg-yellow-50 border-yellow-200", dot: "bg-yellow-400" },
  concluido: { label: "Concluído", icon: CheckCircle2, cls: "text-emerald-700 bg-emerald-50 border-emerald-200", dot: "bg-emerald-400" },
  cancelado: { label: "Cancelado", icon: XCircle, cls: "text-red-600 bg-red-50 border-red-200", dot: "bg-red-400" },
};

const pgmtLabel: Record<string, string> = {
  pix: "Pix",
  cartao_credito: "Cartão Crédito",
  cartao_debito: "Cartão Débito",
  dinheiro: "Dinheiro",
};

export default function FuncionarioHome() {
  const user = getStoredUser();
  const firstName = user.name?.split(" ")[0] ?? "Funcionário";

  const [totalPets, setTotalPets] = useState<number | null>(null);
  const [totalClientes, setTotalClientes] = useState<number | null>(null);
  const [totalLojas, setTotalLojas] = useState<number | null>(null);
  const [atendimentos, setAtendimentos] = useState<Atendimento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [pets, all, usuarios, lojas] = await Promise.all([
          getPets(),
          getAppointments(),
          getUsuarios(),
          getLojas(),
        ]);
        setTotalPets(pets.length);
        setTotalClientes(usuarios.filter((u) => u.tipo_perfil === "cliente").length);
        setTotalLojas(lojas.length);
        setAtendimentos(
          all.sort((a, b) => new Date(b.data_atendimento).getTime() - new Date(a.data_atendimento).getTime())
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const agendados = atendimentos.filter((a) => a.status === "agendado").length;
  const concluidos = atendimentos.filter((a) => a.status === "concluido").length;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";

  const stats = [
    { label: "Pets cadastrados", value: totalPets, icon: PawPrint, bg: "bg-[#1c46f3]/10", iconCls: "text-[#1c46f3]", to: "/pets" },
    { label: "Atendimentos", value: atendimentos.length, icon: CalendarCheck, bg: "bg-[#00bb69]/10", iconCls: "text-[#00bb69]", to: "/atendimentos" },
    { label: "Clientes", value: totalClientes, icon: Users, bg: "bg-purple-100", iconCls: "text-purple-600", to: "/usuarios" },
    { label: "Lojas", value: totalLojas, icon: Store, bg: "bg-yellow-100", iconCls: "text-yellow-600", to: "/lojas" },
  ];

  const quickLinks = [
    { to: "/atendimentos", label: "Atendimentos", icon: CalendarCheck, desc: "Gerenciar agendamentos" },
    { to: "/pets", label: "Pets", icon: PawPrint, desc: "Ver todos os pets" },
    { to: "/usuarios", label: "Usuários", icon: Users, desc: "Clientes e funcionários" },
    { to: "/servicos", label: "Serviços", icon: Scissors, desc: "Catálogo de serviços" },
    { to: "/categorias", label: "Categorias", icon: LayoutGrid, desc: "Categorias de pets" },
    { to: "/tags", label: "Tags", icon: Tag, desc: "Etiquetas do sistema" },
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
          {agendados > 0
            ? `${agendados} atendimento${agendados > 1 ? "s" : ""} agendado${agendados > 1 ? "s" : ""} · ${concluidos} concluído${concluidos > 1 ? "s" : ""}.`
            : "Nenhum atendimento agendado no momento."}
        </p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.to}
            to={s.to}
            className="group flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.bg}`}>
                <s.icon size={18} className={s.iconCls} />
              </div>
              <span className="text-2xl font-bold text-gray-800">
                {loading ? "—" : (s.value ?? "—")}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">{s.label}</span>
              <ArrowRight size={14} className="text-gray-300 transition group-hover:text-[#1c46f3] group-hover:translate-x-0.5" />
            </div>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* Atendimentos recentes */}
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
          {loading ? (
            <p className="px-5 py-6 text-sm text-gray-400">Carregando...</p>
          ) : atendimentos.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <CalendarCheck size={32} className="mx-auto mb-2 text-gray-200" />
              <p className="text-sm text-gray-400">Nenhum atendimento registrado.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {atendimentos.slice(0, 6).map((at) => {
                const cfg = statusConfig[at.status] ?? statusConfig.agendado;
                return (
                  <div key={at.id} className="flex items-center gap-4 px-5 py-3">
                    <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-xl bg-[#1c46f3]/8 text-[#1c46f3]">
                      <span className="text-sm font-bold leading-none">
                        {new Date(at.data_atendimento).getDate().toString().padStart(2, "0")}
                      </span>
                      <span className="text-xs">
                        {new Date(at.data_atendimento).toLocaleDateString("pt-BR", { month: "short" }).replace(".", "")}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-800">
                        {pgmtLabel[at.forma_pagamento] ?? at.forma_pagamento}
                      </p>
                      <p className="text-xs text-gray-400">
                        R$ {Number(at.valor_final).toFixed(2)} · Loja #{at.loja_id}
                      </p>
                    </div>
                    <span className={`flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cfg.cls}`}>
                      <cfg.icon size={11} />
                      {cfg.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick links */}
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-50 px-5 py-4">
            <h2 className="font-semibold text-gray-800">Acesso rápido</h2>
          </div>
          <div className="p-3">
            {quickLinks.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-gray-50"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 transition group-hover:bg-[#1c46f3]/10">
                  <item.icon size={15} className="text-gray-500 transition group-hover:text-[#1c46f3]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-800">{item.label}</p>
                  <p className="text-xs text-gray-400">{item.desc}</p>
                </div>
                <ArrowRight size={13} className="shrink-0 text-gray-300 transition group-hover:text-[#1c46f3]" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
