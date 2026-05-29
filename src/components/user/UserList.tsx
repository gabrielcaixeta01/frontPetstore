import { useEffect, useMemo, useState } from "react";
import {
  Pencil, Trash2, CheckCircle, XCircle,
  Search, ChevronDown, PawPrint, Banknote,
  Calendar, Briefcase, Building2, MapPin, Users,
  UserCheck, UserX, ChevronLeft, ChevronRight,
} from "lucide-react";

const BLUE  = "#1A3CB8";
const BORD  = "#E0E0E0";
const MUTED = "#6B6B6B";
const PAGE_SIZE = 8;

import type { Usuario } from "../../types/usuario";
import type { Pet } from "../../types/pet";

interface UserListProps {
  users: Usuario[];
  onEdit: (user: Usuario) => void;
  onDelete: (id: number) => Promise<void>;
  petsByUser: Record<number, Pet[]>;
  lojaById: Record<number, string>;
  gastoByUser: Record<number, number>;
}

const perfilCfg = {
  cliente:     { label: "Cliente",     badge: "bg-blue-50 text-blue-700 border-blue-200",       avatar: "bg-blue-100 text-blue-700"     },
  funcionario: { label: "Funcionário", badge: "bg-violet-50 text-violet-700 border-violet-200", avatar: "bg-violet-100 text-violet-700" },
} as const;

function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}
function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return Number.isNaN(d.getTime()) ? dateStr : d.toLocaleDateString("pt-BR");
}
function formatMoney(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function InfoChip({ label, value, icon }: { label: string; value: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-widest" style={{ color: MUTED }}>{label}</p>
      <p className="mt-0.5 flex items-center gap-1 text-sm font-medium" style={{ color: "#374151" }}>{icon}{value}</p>
    </div>
  );
}

export default function UserList({ users, onEdit, onDelete, petsByUser, lojaById, gastoByUser }: UserListProps) {
  const [search, setSearch]           = useState("");
  const [filterTipo, setFilterTipo]   = useState<"all" | "cliente" | "funcionario">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "ativo" | "inativo">("all");
  const [expandedId, setExpandedId]   = useState<number | null>(null);
  const [page, setPage]               = useState(1);

  const summary = useMemo(() => ({
    total:        users.length,
    clientes:     users.filter((u) => u.tipo_perfil === "cliente").length,
    funcionarios: users.filter((u) => u.tipo_perfil === "funcionario").length,
    inativos:     users.filter((u) => !u.ativo).length,
  }), [users]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter((u) => {
      if (q && !u.nome.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q)) return false;
      if (filterTipo !== "all" && u.tipo_perfil !== filterTipo) return false;
      if (filterStatus === "ativo" && !u.ativo) return false;
      if (filterStatus === "inativo" && u.ativo) return false;
      return true;
    });
  }, [users, search, filterTipo, filterStatus]);

  useEffect(() => { setPage(1); }, [search, filterTipo, filterStatus]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (users.length === 0) {
    return (
      <div className="p-10 text-center text-sm"
        style={{ border: `1px dashed ${BORD}`, borderRadius: "8px", background: "#fff", color: MUTED }}>
        Nenhum usuário encontrado.
      </div>
    );
  }

  const summaryCards = [
    { icon: Users,     label: "Total",        value: summary.total,        accent: BLUE,      textColor: "#1a1a1a"  },
    { icon: UserCheck, label: "Clientes",      value: summary.clientes,     accent: "#3B82F6", textColor: "#1D4ED8"  },
    { icon: Briefcase, label: "Funcionários",  value: summary.funcionarios, accent: "#7C3AED", textColor: "#5B21B6"  },
    { icon: UserX,     label: "Inativos",      value: summary.inativos,     accent: MUTED,     textColor: "#374151"  },
  ];

  const inputStyle: React.CSSProperties = {
    border: `1px solid ${BORD}`,
    borderRadius: "4px",
    background: "#fff",
    fontSize: "14px",
    outline: "none",
    transition: "border-color 0.15s, box-shadow 0.15s",
  };

  return (
    <div className="space-y-4">

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {summaryCards.map(({ icon: Icon, label, value, accent, textColor }) => (
          <div key={label} className="relative overflow-hidden bg-white p-4 shadow-sm"
            style={{ border: `1px solid ${BORD}`, borderRadius: "8px" }}>
            <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ background: accent }} />
            <div className="flex items-center gap-1.5 pl-2 text-xs font-bold uppercase tracking-widest" style={{ color: MUTED }}>
              <Icon size={12} style={{ color: accent }} /> {label}
            </div>
            <p className="mt-1.5 pl-2 text-3xl font-extrabold" style={{ color: textColor }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Search + filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative min-w-48 flex-1">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" style={{ color: MUTED }} />
          <input
            type="text"
            placeholder="Buscar por nome ou e-mail…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full py-2.5 pl-9 pr-3"
            style={inputStyle}
            onFocus={(e) => { e.target.style.borderColor = BLUE; e.target.style.boxShadow = "0 0 0 3px rgba(26,60,184,0.10)"; }}
            onBlur={(e)  => { e.target.style.borderColor = BORD; e.target.style.boxShadow = "none"; }}
          />
        </div>
        <select value={filterTipo} onChange={(e) => setFilterTipo(e.target.value as typeof filterTipo)}
          className="px-3 py-2.5" style={{ ...inputStyle, color: "#374151" }}>
          <option value="all">Todos os tipos</option>
          <option value="cliente">Clientes</option>
          <option value="funcionario">Funcionários</option>
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
          className="px-3 py-2.5" style={{ ...inputStyle, color: "#374151" }}>
          <option value="all">Qualquer status</option>
          <option value="ativo">Ativos</option>
          <option value="inativo">Inativos</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden bg-white shadow-sm" style={{ border: `1px solid ${BORD}`, borderRadius: "8px" }}>
        <div className="hidden border-b px-5 py-3 text-xs font-bold uppercase tracking-widest sm:grid sm:grid-cols-[1fr_185px_90px_80px] sm:gap-4"
          style={{ borderColor: BORD, background: "#F4F4F4", color: MUTED }}>
          <span>Usuário</span>
          <span>Tipo</span>
          <span>Status</span>
          <span className="text-right">Ações</span>
        </div>

        {filtered.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm" style={{ color: MUTED }}>
            Nenhum resultado.{" "}
            <button
              onClick={() => { setSearch(""); setFilterTipo("all"); setFilterStatus("all"); }}
              className="font-bold transition hover:opacity-70" style={{ color: BLUE }}>
              Limpar filtros
            </button>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: BORD }}>
            {paginated.map((user) => {
              const cfg = perfilCfg[user.tipo_perfil] ?? { label: user.tipo_perfil, badge: "bg-gray-100 text-gray-700 border-gray-200", avatar: "bg-gray-100 text-gray-600" };
              const isExpanded = expandedId === user.id;
              const pets  = petsByUser[user.id] ?? [];
              const gasto = gastoByUser[user.id] ?? 0;
              const ep = user.employee_profile;
              const cp = user.client_profile;

              return (
                <div key={user.id}>
                  {/* Main row */}
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : user.id)}
                    className={`flex cursor-pointer items-center gap-3 px-4 py-3.5 transition sm:grid sm:grid-cols-[1fr_185px_90px_80px] sm:gap-4 sm:px-5 ${isExpanded ? "bg-gray-50/70" : "hover:bg-gray-50/60"}`}
                  >
                    {/* Col 1 — Avatar + name + email */}
                    <div className="flex min-w-0 flex-1 items-center gap-3 sm:flex-none">
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${cfg.avatar}`}>
                        {getInitials(user.nome)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-bold" style={{ color: "#1a1a1a" }}>{user.nome}</p>
                          <ChevronDown size={13}
                            className={`shrink-0 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                            style={{ color: isExpanded ? BLUE : "#D1D5DB" }}
                          />
                        </div>
                        <p className="truncate text-xs" style={{ color: MUTED }}>{user.email}</p>
                        {/* Mobile-only badges */}
                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5 sm:hidden">
                          <span className={`inline-flex items-center border px-2 py-0.5 text-xs font-semibold ${cfg.badge}`}
                            style={{ borderRadius: "20px" }}>
                            {cfg.label}
                          </span>
                          <span className="text-xs" style={{ color: MUTED }}>
                            {user.tipo_perfil === "cliente"
                              ? `${pets.length} pet${pets.length !== 1 ? "s" : ""}`
                              : lojaById[ep?.loja_id ?? 0] ?? "—"}
                          </span>
                          {user.ativo
                            ? <span className="flex items-center gap-1 text-xs font-medium text-emerald-600"><CheckCircle size={11} /> Ativo</span>
                            : <span className="flex items-center gap-1 text-xs font-medium text-red-500"><XCircle size={11} /> Inativo</span>}
                        </div>
                      </div>
                    </div>

                    {/* Col 2 — Tipo */}
                    <div className="hidden sm:block">
                      <span className={`inline-flex items-center border px-2.5 py-0.5 text-xs font-semibold ${cfg.badge}`}
                        style={{ borderRadius: "20px" }}>
                        {cfg.label}
                      </span>
                      <p className="mt-1 flex items-center gap-1 text-xs" style={{ color: MUTED }}>
                        {user.tipo_perfil === "cliente"
                          ? <><PawPrint size={10} /> {pets.length} pet{pets.length !== 1 ? "s" : ""}</>
                          : <><Building2 size={10} /> {lojaById[ep?.loja_id ?? 0] ?? "Sem loja"}</>}
                      </p>
                    </div>

                    {/* Col 3 — Status */}
                    <div className="hidden sm:flex sm:items-center">
                      {user.ativo
                        ? <span className="flex items-center gap-1 text-xs font-medium text-emerald-600"><CheckCircle size={12} /> Ativo</span>
                        : <span className="flex items-center gap-1 text-xs font-medium text-red-500"><XCircle size={12} /> Inativo</span>}
                    </div>

                    {/* Col 4 — Actions */}
                    <div className="flex shrink-0 gap-1.5 sm:justify-end" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => onEdit(user)} title="Editar"
                        className="flex h-8 w-8 items-center justify-center transition hover:bg-gray-100"
                        style={{ border: `1px solid ${BORD}`, borderRadius: "4px", color: MUTED }}>
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => onDelete(user.id)} title="Excluir"
                        className="flex h-8 w-8 items-center justify-center transition hover:bg-red-50"
                        style={{ border: "1px solid #FECACA", borderRadius: "4px", color: "#EF4444" }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Expanded row */}
                  {isExpanded && (
                    <div className="border-t px-5 py-4" style={{ borderColor: BORD, background: "#F9FAFB" }}>
                      {user.tipo_perfil === "cliente" ? (
                        <div className="space-y-4">
                          <div className="grid gap-4 sm:grid-cols-3">
                            <InfoChip label="Cadastro" value={formatDate(user.data_cadastro)} icon={<Calendar size={12} style={{ color: MUTED }} />} />
                            <InfoChip label="Documento" value={user.cpf ?? user.cnpj ?? "—"} />
                            <InfoChip label="Cidade / Estado"
                              value={cp ? `${cp.end_cidade || "—"} / ${cp.end_estado || "—"}` : "—"}
                              icon={<MapPin size={12} style={{ color: MUTED }} />} />
                          </div>
                          <div>
                            <p className="mb-1.5 text-xs font-bold uppercase tracking-widest" style={{ color: MUTED }}>
                              <PawPrint size={11} className="mr-1 inline" /> Pets
                            </p>
                            {pets.length > 0 ? (
                              <div className="flex flex-wrap gap-1.5">
                                {pets.map((p) => (
                                  <span key={p.id} className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium"
                                    style={{ background: "rgba(26,60,184,0.08)", borderRadius: "20px", color: BLUE }}>
                                    <PawPrint size={10} /> {p.nome}
                                    {p.raca && <span className="opacity-60">· {p.raca}</span>}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm" style={{ color: MUTED }}>Nenhum pet cadastrado.</p>
                            )}
                          </div>
                          <InfoChip label="Gasto total (atendimentos concluídos)"
                            value={formatMoney(gasto)}
                            icon={<Banknote size={12} style={{ color: MUTED }} />} />
                        </div>
                      ) : (
                        <div className="grid gap-4 sm:grid-cols-3">
                          <InfoChip label="Cadastro"      value={formatDate(user.data_cadastro)}         icon={<Calendar size={12} style={{ color: MUTED }} />} />
                          <InfoChip label="Matrícula"     value={ep?.matricula ?? "—"}                  icon={<Briefcase size={12} style={{ color: MUTED }} />} />
                          <InfoChip label="Contratado em" value={formatDate(ep?.data_contratacao)}       icon={<Calendar size={12} style={{ color: MUTED }} />} />
                          <InfoChip label="Cargo"         value={ep?.cargo ?? "—"}                      icon={<Briefcase size={12} style={{ color: MUTED }} />} />
                          <InfoChip label="Loja"          value={lojaById[ep?.loja_id ?? 0] ?? "Sem loja"} icon={<Building2 size={12} style={{ color: MUTED }} />} />
                          <InfoChip label="Salário"       value={ep ? formatMoney(ep.salario) : "—"}    icon={<Banknote size={12} style={{ color: MUTED }} />} />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 shadow-sm"
          style={{ border: `1px solid ${BORD}`, borderRadius: "8px" }}>
          <p className="text-xs" style={{ color: MUTED }}>
            {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage((p) => p - 1)} disabled={page === 1}
              className="flex h-8 w-8 items-center justify-center transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              style={{ border: `1px solid ${BORD}`, borderRadius: "4px", color: MUTED }}>
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((n) => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
              .reduce<(number | "…")[]>((acc, n, i, arr) => {
                if (i > 0 && n - (arr[i - 1] as number) > 1) acc.push("…");
                acc.push(n);
                return acc;
              }, [])
              .map((n, i) =>
                n === "…" ? (
                  <span key={`ellipsis-${i}`} className="px-1 text-xs" style={{ color: "#D1D5DB" }}>…</span>
                ) : (
                  <button key={n} onClick={() => setPage(n as number)}
                    className="flex h-8 w-8 items-center justify-center text-xs font-bold transition"
                    style={{
                      border: `1px solid ${page === n ? BLUE : BORD}`,
                      borderRadius: "4px",
                      background: page === n ? BLUE : "#fff",
                      color: page === n ? "#fff" : "#374151",
                    }}>
                    {n}
                  </button>
                )
              )}
            <button onClick={() => setPage((p) => p + 1)} disabled={page === totalPages}
              className="flex h-8 w-8 items-center justify-center transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              style={{ border: `1px solid ${BORD}`, borderRadius: "4px", color: MUTED }}>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
