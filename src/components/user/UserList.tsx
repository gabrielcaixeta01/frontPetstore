import { useEffect, useMemo, useState } from "react";
import {
  Pencil, Trash2, CheckCircle, XCircle,
  Search, ChevronDown, PawPrint, Banknote,
  Calendar, Briefcase, Building2, MapPin, Users,
  UserCheck, UserX, ChevronLeft, ChevronRight,
} from "lucide-react";

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
  cliente:     { label: "Cliente",     badge: "bg-blue-50 text-blue-700 border-blue-200",     avatar: "bg-blue-100 text-blue-700"     },
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
      <p className="text-xs font-medium text-gray-400">{label}</p>
      <p className="mt-0.5 flex items-center gap-1 text-sm font-medium text-gray-700">{icon}{value}</p>
    </div>
  );
}

export default function UserList({ users, onEdit, onDelete, petsByUser, lojaById, gastoByUser }: UserListProps) {
  const [search, setSearch] = useState("");
  const [filterTipo, setFilterTipo] = useState<"all" | "cliente" | "funcionario">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "ativo" | "inativo">("all");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [page, setPage] = useState(1);

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
      <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center text-sm text-gray-400">
        Nenhum usuário encontrado.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
            <Users size={12} /> Total
          </div>
          <p className="mt-1.5 text-3xl font-bold text-gray-900">{summary.total}</p>
        </div>
        <div className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-blue-400">
            <UserCheck size={12} /> Clientes
          </div>
          <p className="mt-1.5 text-3xl font-bold text-blue-700">{summary.clientes}</p>
        </div>
        <div className="rounded-2xl border border-violet-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-violet-400">
            <Briefcase size={12} /> Funcionários
          </div>
          <p className="mt-1.5 text-3xl font-bold text-violet-700">{summary.funcionarios}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
            <UserX size={12} /> Inativos
          </div>
          <p className="mt-1.5 text-3xl font-bold text-gray-500">{summary.inativos}</p>
        </div>
      </div>

      {/* Search + filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative min-w-48 flex-1">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome ou e-mail…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-[#1c46f3] focus:ring-2 focus:ring-[#1c46f3]/15"
          />
        </div>
        <select
          value={filterTipo}
          onChange={(e) => setFilterTipo(e.target.value as typeof filterTipo)}
          className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-600 outline-none transition focus:border-[#1c46f3]"
        >
          <option value="all">Todos os tipos</option>
          <option value="cliente">Clientes</option>
          <option value="funcionario">Funcionários</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
          className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-600 outline-none transition focus:border-[#1c46f3]"
        >
          <option value="all">Qualquer status</option>
          <option value="ativo">Ativos</option>
          <option value="inativo">Inativos</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="hidden border-b border-gray-100 bg-gray-50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400 sm:grid sm:grid-cols-[1fr_185px_90px_80px] sm:gap-4">
          <span>Usuário</span>
          <span>Tipo</span>
          <span>Status</span>
          <span className="text-right">Ações</span>
        </div>

        {filtered.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-gray-400">
            Nenhum resultado.{" "}
            <button
              onClick={() => { setSearch(""); setFilterTipo("all"); setFilterStatus("all"); }}
              className="font-semibold text-[#1c46f3] hover:underline"
            >
              Limpar filtros
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {paginated.map((user) => {
              const cfg = perfilCfg[user.tipo_perfil] ?? { label: user.tipo_perfil, badge: "bg-gray-100 text-gray-700 border-gray-200", avatar: "bg-gray-100 text-gray-600" };
              const isExpanded = expandedId === user.id;
              const pets = petsByUser[user.id] ?? [];
              const gasto = gastoByUser[user.id] ?? 0;
              const ep = user.employee_profile;
              const cp = user.client_profile;

              return (
                <div key={user.id}>
                  {/* Main row */}
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : user.id)}
                    className={`cursor-pointer flex items-center gap-3 px-4 py-3.5 transition sm:grid sm:grid-cols-[1fr_185px_90px_80px] sm:gap-4 sm:px-5 ${isExpanded ? "bg-gray-50/70" : "hover:bg-gray-50/60"}`}
                  >
                    {/* Col 1 — Avatar + name + email */}
                    <div className="flex min-w-0 flex-1 items-center gap-3 sm:flex-none">
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${cfg.avatar}`}>
                        {getInitials(user.nome)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-semibold text-gray-900">{user.nome}</p>
                          <ChevronDown
                            size={13}
                            className={`shrink-0 text-gray-300 transition-transform duration-200 ${isExpanded ? "rotate-180 text-[#1c46f3]" : ""}`}
                          />
                        </div>
                        <p className="truncate text-xs text-gray-400">{user.email}</p>
                        {/* Mobile-only badges */}
                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5 sm:hidden">
                          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${cfg.badge}`}>
                            {cfg.label}
                          </span>
                          <span className="text-xs text-gray-400">
                            {user.tipo_perfil === "cliente"
                              ? `${pets.length} pet${pets.length !== 1 ? "s" : ""}`
                              : lojaById[ep?.loja_id ?? 0] ?? "—"}
                          </span>
                          {user.ativo ? (
                            <span className="flex items-center gap-1 text-xs font-medium text-emerald-600"><CheckCircle size={11} /> Ativo</span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs font-medium text-red-500"><XCircle size={11} /> Inativo</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Col 2 — Tipo + contextual (desktop) */}
                    <div className="hidden sm:block">
                      <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cfg.badge}`}>
                        {cfg.label}
                      </span>
                      <p className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                        {user.tipo_perfil === "cliente" ? (
                          <><PawPrint size={10} /> {pets.length} pet{pets.length !== 1 ? "s" : ""}</>
                        ) : (
                          <><Building2 size={10} /> {lojaById[ep?.loja_id ?? 0] ?? "Sem loja"}</>
                        )}
                      </p>
                    </div>

                    {/* Col 3 — Status (desktop) */}
                    <div className="hidden sm:flex sm:items-center">
                      {user.ativo ? (
                        <span className="flex items-center gap-1 text-xs font-medium text-emerald-600"><CheckCircle size={12} /> Ativo</span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-medium text-red-500"><XCircle size={12} /> Inativo</span>
                      )}
                    </div>

                    {/* Col 4 — Actions */}
                    <div className="flex shrink-0 gap-1.5 sm:justify-end" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onEdit(user)}
                        title="Editar"
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:bg-gray-100"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => onDelete(user.id)}
                        title="Excluir"
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-100 text-red-400 transition hover:bg-red-50"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Expanded row */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 bg-gray-50/60 px-5 py-4">
                      {user.tipo_perfil === "cliente" ? (
                        <div className="space-y-4">
                          <div className="grid gap-4 sm:grid-cols-3">
                            <InfoChip
                              label="Cadastro"
                              value={formatDate(user.data_cadastro)}
                              icon={<Calendar size={12} className="text-gray-400" />}
                            />
                            <InfoChip
                              label="Documento"
                              value={user.cpf ?? user.cnpj ?? "—"}
                            />
                            <InfoChip
                              label="Cidade / Estado"
                              value={cp ? `${cp.end_cidade || "—"} / ${cp.end_estado || "—"}` : "—"}
                              icon={<MapPin size={12} className="text-gray-400" />}
                            />
                          </div>
                          <div>
                            <p className="mb-1.5 text-xs font-medium text-gray-400">
                              <PawPrint size={11} className="mr-1 inline" />
                              Pets
                            </p>
                            {pets.length > 0 ? (
                              <div className="flex flex-wrap gap-1.5">
                                {pets.map((p) => (
                                  <span key={p.id} className="flex items-center gap-1 rounded-lg bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                                    <PawPrint size={10} /> {p.nome}
                                    {p.raca && <span className="opacity-60">· {p.raca}</span>}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-400">Nenhum pet cadastrado.</p>
                            )}
                          </div>
                          <InfoChip
                            label="Gasto total (atendimentos concluídos)"
                            value={formatMoney(gasto)}
                            icon={<Banknote size={12} className="text-gray-400" />}
                          />
                        </div>
                      ) : (
                        <div className="grid gap-4 sm:grid-cols-3">
                          <InfoChip
                            label="Cadastro"
                            value={formatDate(user.data_cadastro)}
                            icon={<Calendar size={12} className="text-gray-400" />}
                          />
                          <InfoChip
                            label="Matrícula"
                            value={ep?.matricula ?? "—"}
                            icon={<Briefcase size={12} className="text-gray-400" />}
                          />
                          <InfoChip
                            label="Contratado em"
                            value={formatDate(ep?.data_contratacao)}
                            icon={<Calendar size={12} className="text-gray-400" />}
                          />
                          <InfoChip
                            label="Cargo"
                            value={ep?.cargo ?? "—"}
                            icon={<Briefcase size={12} className="text-gray-400" />}
                          />
                          <InfoChip
                            label="Loja"
                            value={lojaById[ep?.loja_id ?? 0] ?? "Sem loja"}
                            icon={<Building2 size={12} className="text-gray-400" />}
                          />
                          <InfoChip
                            label="Salário"
                            value={ep ? formatMoney(ep.salario) : "—"}
                            icon={<Banknote size={12} className="text-gray-400" />}
                          />
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

      {totalPages > 1 && (
        <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
          <p className="text-xs text-gray-400">
            {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
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
                  <span key={`ellipsis-${i}`} className="px-1 text-xs text-gray-300">…</span>
                ) : (
                  <button
                    key={n}
                    onClick={() => setPage(n as number)}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg border text-xs font-semibold transition ${
                      page === n
                        ? "border-[#1c46f3] bg-[#1c46f3] text-white"
                        : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {n}
                  </button>
                )
              )}
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page === totalPages}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
