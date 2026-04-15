import { apexTheme } from "../../lib/theme";
import type { Usuario } from "../../types/usuario";

interface UserListProps {
  users: Usuario[];
  onEdit: (user: Usuario) => void;
  onDelete: (id: number) => Promise<void>;
}

export default function UserList({ users, onEdit, onDelete }: UserListProps) {
  const c = apexTheme.colors;

  function formatDateTime(dateValue?: string) {
    if (!dateValue) return "Nao informado";

    const parsed = new Date(dateValue);
    if (Number.isNaN(parsed.getTime())) return dateValue;

    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(parsed);
  }

  function formatMoney(value: number) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  }

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
          className={`rounded-2xl border p-5 shadow-lg ${c.border} ${c.card}`}
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-1">
              <h3 className={`text-xl font-bold ${c.text}`}>{user.nome}</h3>
              <p className={`text-sm ${c.textSoft}`}>ID: {user.id}</p>
              <p className={`text-sm ${c.textSoft}`}>
                Email: {user.email}
              </p>
              <p className={`text-sm ${c.textSoft}`}>Telefone: {user.telefone}</p>
              <p className={`text-sm ${c.textSoft}`}>
                Perfil: {user.tipo_perfil}
              </p>
              <p className={`text-sm ${c.textSoft}`}>
                CPF: {user.cpf ?? "-"}
              </p>
              <p className={`text-sm ${c.textSoft}`}>
                CNPJ: {user.cnpj ?? "-"}
              </p>

              {user.tipo_perfil === "cliente" && user.client_profile && (
                <>
                  <p className={`text-sm ${c.textSoft}`}>
                    Tipo cliente: {user.client_profile.tipo_cliente}
                  </p>
                  <p className={`text-sm ${c.textSoft}`}>
                    CEP: {user.client_profile.end_cep}
                  </p>
                  <p className={`text-sm ${c.textSoft}`}>
                    Cidade/UF: {user.client_profile.end_cidade} - {user.client_profile.end_estado}
                  </p>
                </>
              )}

              {user.tipo_perfil === "funcionario" && user.employee_profile && (
                <>
                  <p className={`text-sm ${c.textSoft}`}>
                    Matrícula: {user.employee_profile.matricula}
                  </p>
                  <p className={`text-sm ${c.textSoft}`}>
                    Cargo: {user.employee_profile.cargo}
                  </p>
                  <p className={`text-sm ${c.textSoft}`}>
                    Salário: {formatMoney(user.employee_profile.salario)}
                  </p>
                  <p className={`text-sm ${c.textSoft}`}>
                    Contratação: {user.employee_profile.data_contratacao}
                  </p>
                  <p className={`text-sm ${c.textSoft}`}>
                    Loja ID: {user.employee_profile.loja_id}
                  </p>
                </>
              )}

              <p className={`text-sm ${c.textSoft}`}>
                Ativo: {user.ativo ? "Sim" : "Não"}
              </p>
              <p className={`text-sm ${c.textSoft}`}>
                Superuser: {user.is_superuser ? "Sim" : "Não"}
              </p>
              <p className={`text-sm ${c.textSoft}`}>
                Cadastro: {formatDateTime(user.data_cadastro)}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => onEdit(user)}
                className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${c.border} ${c.text} hover:${c.bgSoft}`}
              >
                Editar
              </button>
              <button
                onClick={() => onDelete(user.id)}
                className="rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 hover:text-red-700"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}