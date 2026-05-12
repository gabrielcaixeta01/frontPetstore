import { Pencil, Trash2, CheckCircle, XCircle } from "lucide-react";
import type { Usuario } from "../../types/usuario";

interface UserListProps {
  users: Usuario[];
  onEdit: (user: Usuario) => void;
  onDelete: (id: number) => Promise<void>;
}

const perfilCfg: Record<string, { label: string; cls: string }> = {
  cliente:     { label: "Cliente",       cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  funcionario: { label: "Funcionário",   cls: "bg-blue-50 text-blue-700 border-blue-200" },
  admin:       { label: "Administrador", cls: "bg-purple-50 text-purple-700 border-purple-200" },
};

function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

export default function UserList({ users, onEdit, onDelete }: UserListProps) {
  if (users.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center text-sm text-gray-400">
        Nenhum usuário encontrado.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      {/* Desktop header — hidden on mobile */}
      <div className="hidden border-b border-gray-100 bg-gray-50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400 sm:grid sm:grid-cols-[1fr_160px_90px_88px] sm:gap-4">
        <span>Usuário</span>
        <span>Tipo</span>
        <span>Status</span>
        <span className="text-right">Ações</span>
      </div>

      <div className="divide-y divide-gray-50">
        {users.map((user) => {
          const cfg = perfilCfg[user.tipo_perfil] ?? { label: user.tipo_perfil, cls: "bg-gray-100 text-gray-700 border-gray-200" };

          return (
            <div
              key={user.id}
              className="flex items-center gap-3 px-4 py-3.5 transition hover:bg-gray-50/60 sm:grid sm:grid-cols-[1fr_160px_90px_88px] sm:gap-4 sm:px-5"
            >
              {/* Col 1 — Avatar + name + email (+ mobile badges) */}
              <div className="flex min-w-0 flex-1 items-center gap-3 sm:flex-none">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#1c46f3]/15 to-[#00bb69]/15 text-xs font-bold text-[#1c46f3]">
                  {getInitials(user.nome)}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-900">{user.nome}</p>
                  <p className="truncate text-xs text-gray-400">{user.email}</p>
                  {/* Mobile-only badges */}
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5 sm:hidden">
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${cfg.cls}`}>
                      {cfg.label}
                    </span>
                    {user.ativo ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                        <CheckCircle size={11} /> Ativo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-red-500">
                        <XCircle size={11} /> Inativo
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Col 2 — Tipo (desktop only) */}
              <div className="hidden sm:block">
                <span className={`inline-flex w-fit items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cfg.cls}`}>
                  {cfg.label}
                </span>
              </div>

              {/* Col 3 — Status (desktop only) */}
              <div className="hidden sm:flex sm:items-center">
                {user.ativo ? (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
                    <CheckCircle size={12} /> Ativo
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-red-500">
                    <XCircle size={12} /> Inativo
                  </span>
                )}
              </div>

              {/* Col 4 — Actions (always visible) */}
              <div className="flex shrink-0 gap-1.5 sm:justify-end">
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
          );
        })}
      </div>
    </div>
  );
}
