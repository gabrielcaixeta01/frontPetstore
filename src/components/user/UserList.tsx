import { Pencil, Trash2, CheckCircle, XCircle, Mail, Phone, MapPin, Briefcase } from "lucide-react";
import { apexTheme } from "../../lib/theme";
import type { Usuario } from "../../types/usuario";

interface UserListProps {
  users: Usuario[];
  onEdit: (user: Usuario) => void;
  onDelete: (id: number) => Promise<void>;
}

const perfilColors: Record<string, string> = {
  cliente: "bg-emerald-100 text-emerald-700",
  funcionario: "bg-blue-100 text-blue-700",
  admin: "bg-purple-100 text-purple-700",
};

const perfilLabels: Record<string, string> = {
  cliente: "Cliente",
  funcionario: "Funcionário",
  admin: "Administrador",
};

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
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

export default function UserList({ users, onEdit, onDelete }: UserListProps) {
  const c = apexTheme.colors;

  if (users.length === 0) {
    return (
      <div className={`rounded-2xl border p-6 ${c.border} ${c.card} ${c.textMuted}`}>
        Nenhum usuário encontrado.
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {users.map((user) => (
        <div
          key={user.id}
          className={`rounded-2xl border p-5 shadow-sm transition hover:shadow-md ${c.border} ${c.card}`}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            {/* Lado esquerdo */}
            <div className="flex gap-4">
              {/* Avatar */}
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#1c46f3]/10 text-sm font-bold text-[#1c46f3]">
                {getInitials(user.nome)}
              </div>

              <div className="space-y-2 min-w-0">
                {/* Nome + badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className={`font-bold ${c.text}`}>{user.nome}</h3>

                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${perfilColors[user.tipo_perfil] ?? "bg-gray-100 text-gray-700"}`}>
                    {perfilLabels[user.tipo_perfil] ?? user.tipo_perfil}
                  </span>

                  {user.ativo ? (
                    <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                      <CheckCircle size={11} /> Ativo
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-600">
                      <XCircle size={11} /> Inativo
                    </span>
                  )}
                </div>

                {/* Info básica */}
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  <span className={`flex items-center gap-1.5 text-sm ${c.textSoft}`}>
                    <Mail size={13} />
                    {user.email}
                  </span>
                  {user.telefone && (
                    <span className={`flex items-center gap-1.5 text-sm ${c.textSoft}`}>
                      <Phone size={13} />
                      {user.telefone}
                    </span>
                  )}
                </div>

                {/* Dados de cliente */}
                {user.tipo_perfil === "cliente" && user.client_profile && (
                  <div className={`flex flex-wrap gap-x-4 gap-y-1 rounded-xl border ${c.border} bg-gray-50 px-3 py-2`}>
                    <span className={`flex items-center gap-1.5 text-xs ${c.textSoft}`}>
                      <MapPin size={12} />
                      {user.client_profile.end_cidade} — {user.client_profile.end_estado}
                    </span>
                    <span className={`text-xs ${c.textMuted}`}>CEP: {user.client_profile.end_cep}</span>
                    <span className={`text-xs ${c.textMuted}`}>{user.client_profile.tipo_cliente}</span>
                  </div>
                )}

                {/* Dados de funcionário */}
                {user.tipo_perfil === "funcionario" && user.employee_profile && (
                  <div className={`flex flex-wrap gap-x-4 gap-y-1 rounded-xl border ${c.border} bg-gray-50 px-3 py-2`}>
                    <span className={`flex items-center gap-1.5 text-xs ${c.textSoft}`}>
                      <Briefcase size={12} />
                      {user.employee_profile.cargo}
                    </span>
                    <span className={`text-xs ${c.textMuted}`}>
                      {formatMoney(user.employee_profile.salario)}
                    </span>
                    <span className={`text-xs ${c.textMuted}`}>
                      Desde {formatDate(user.employee_profile.data_contratacao)}
                    </span>
                    <span className={`text-xs ${c.textMuted}`}>
                      Mat. {user.employee_profile.matricula}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Botões */}
            <div className="flex shrink-0 gap-2">
              <button
                onClick={() => onEdit(user)}
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-medium transition ${c.border} ${c.text} hover:bg-gray-50`}
              >
                <Pencil size={13} />
                Editar
              </button>
              <button
                onClick={() => onDelete(user.id)}
                className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
              >
                <Trash2 size={13} />
                Excluir
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
