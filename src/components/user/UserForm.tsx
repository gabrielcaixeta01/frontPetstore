import { useState } from "react";
import { apexTheme } from "../../lib/theme";
import type { CreateUsuarioDTO, UpdateUsuarioDTO, Usuario } from "../../types/usuario";

interface UserFormProps {
  userBeingEdited: Usuario | null;
  onCreate: (data: CreateUsuarioDTO) => Promise<void>;
  onUpdate: (id: number, data: UpdateUsuarioDTO) => Promise<void>;
  onCancelEdit: () => void;
}

export default function UserForm({
  userBeingEdited,
  onCreate,
  onUpdate,
  onCancelEdit,
}: UserFormProps) {
  const c = apexTheme.colors;
  const [nome, setNome] = useState(userBeingEdited?.nome ?? "");
  const [email, setEmail] = useState(userBeingEdited?.email ?? "");
  const [senhaHash, setSenhaHash] = useState("");
  const [telefone, setTelefone] = useState(userBeingEdited?.telefone ?? "");
  const [tipoPerfil, setTipoPerfil] = useState<"cliente" | "funcionario">(
    userBeingEdited?.tipo_perfil ?? "cliente"
  );
  const [cpf, setCpf] = useState(userBeingEdited?.cpf ?? "");
  const [cnpj, setCnpj] = useState(userBeingEdited?.cnpj ?? "");
  const [ativo, setAtivo] = useState(userBeingEdited?.ativo ?? true);
  const [isSuperuser, setIsSuperuser] = useState(
    userBeingEdited?.is_superuser ?? false
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!nome.trim()) {
      alert("Informe o nome.");
      return;
    }

    if (userBeingEdited) {
      const payload: UpdateUsuarioDTO = {
        nome: nome.trim(),
        email: email.trim(),
        telefone: telefone.trim(),
        tipo_perfil: tipoPerfil,
        cpf: cpf.trim() || undefined,
        cnpj: cnpj.trim() || undefined,
        ativo,
        is_superuser: isSuperuser,
      };

      await onUpdate(userBeingEdited.id, payload);
    } else {
      if (!senhaHash.trim()) {
        alert("Informe a senha.");
        return;
      }

      const payload: CreateUsuarioDTO = {
        nome: nome.trim(),
        email: email.trim(),
        senha_hash: senhaHash.trim(),
        telefone: telefone.trim(),
        tipo_perfil: tipoPerfil,
        cpf: cpf.trim() || undefined,
        cnpj: cnpj.trim() || undefined,
      };

      await onCreate(payload);
      setNome("");
      setEmail("");
      setSenhaHash("");
      setTelefone("");
      setTipoPerfil("cliente");
      setCpf("");
      setCnpj("");
      setAtivo(true);
      setIsSuperuser(false);
    }
  }

  return (
    <form
      key={userBeingEdited?.id ?? "new"}
      onSubmit={handleSubmit}
      className={`space-y-4 rounded-2xl border p-6 shadow-lg ${c.border} ${c.card}`}
    >
      <div>
        <h2 className={`text-2xl font-bold ${c.text}`}>
          {userBeingEdited ? "Editar Usuário" : "Cadastrar Usuário"}
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="nome" className={`mb-1 block text-sm ${c.textSoft}`}>
            Nome
          </label>
          <input
            id="nome"
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
            className={`w-full rounded-xl border px-4 py-3 outline-none ${c.border} ${c.cardSoft} ${c.text} focus:ring-2 focus:ring-[#1c46f3]`}
          />
        </div>

        <div>
          <label htmlFor="email" className={`mb-1 block text-sm ${c.textSoft}`}>
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full rounded-xl border px-4 py-3 outline-none ${c.border} ${c.cardSoft} ${c.text} focus:ring-2 focus:ring-[#1c46f3]`}
          />
        </div>

        <div>
          <label htmlFor="telefone" className={`mb-1 block text-sm ${c.textSoft}`}>
            Telefone
          </label>
          <input
            id="telefone"
            type="text"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            className={`w-full rounded-xl border px-4 py-3 outline-none ${c.border} ${c.cardSoft} ${c.text} focus:ring-2 focus:ring-[#1c46f3]`}
          />
        </div>

        <div>
          <label htmlFor="tipo_perfil" className={`mb-1 block text-sm ${c.textSoft}`}>
            Tipo de perfil
          </label>
          <select
            id="tipo_perfil"
            value={tipoPerfil}
            onChange={(e) =>
              setTipoPerfil(e.target.value as "cliente" | "funcionario")
            }
            className={`w-full rounded-xl border px-4 py-3 outline-none ${c.border} ${c.cardSoft} ${c.text} focus:ring-2 focus:ring-[#1c46f3]`}
          >
            <option value="cliente">cliente</option>
            <option value="funcionario">funcionario</option>
          </select>
        </div>

        <div>
          <label htmlFor="cpf" className={`mb-1 block text-sm ${c.textSoft}`}>
            CPF
          </label>
          <input
            id="cpf"
            type="text"
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
            className={`w-full rounded-xl border px-4 py-3 outline-none ${c.border} ${c.cardSoft} ${c.text} focus:ring-2 focus:ring-[#1c46f3]`}
          />
        </div>

        <div>
          <label htmlFor="cnpj" className={`mb-1 block text-sm ${c.textSoft}`}>
            CNPJ
          </label>
          <input
            id="cnpj"
            type="text"
            value={cnpj}
            onChange={(e) => setCnpj(e.target.value)}
            className={`w-full rounded-xl border px-4 py-3 outline-none ${c.border} ${c.cardSoft} ${c.text} focus:ring-2 focus:ring-[#1c46f3]`}
          />
        </div>

        <div>
          <label htmlFor="senha" className={`mb-1 block text-sm ${c.textSoft}`}>
            Senha hash
          </label>
          <input
            id="senha"
            type="password"
            value={senhaHash}
            onChange={(e) => setSenhaHash(e.target.value)}
            className={`w-full rounded-xl border px-4 py-3 outline-none ${c.border} ${c.cardSoft} ${c.text} focus:ring-2 focus:ring-[#1c46f3]`}
          />
        </div>

        <div className="flex items-center gap-3 pt-8">
          <input
            id="ativo"
            type="checkbox"
            checked={ativo}
            onChange={(e) => setAtivo(e.target.checked)}
            className="h-4 w-4"
          />
          <label htmlFor="ativo" className={`text-sm ${c.textSoft}`}>
            Usuário ativo
          </label>
        </div>

        <div className="flex items-center gap-3 pt-8">
          <input
            id="superuser"
            type="checkbox"
            checked={isSuperuser}
            onChange={(e) => setIsSuperuser(e.target.checked)}
            className="h-4 w-4"
          />
          <label htmlFor="superuser" className={`text-sm ${c.textSoft}`}>
            Superuser
          </label>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          className={`rounded-xl px-5 py-3 font-semibold transition hover:opacity-90 ${c.primary} ${c.primaryText}`}
        >
          {userBeingEdited ? "Salvar alterações" : "Cadastrar"}
        </button>

        {userBeingEdited && (
          <button
            type="button"
            onClick={onCancelEdit}
            className={`rounded-xl border px-5 py-3 font-semibold transition ${c.border} ${c.text} hover:${c.bgSoft}`}
          >
            Cancelar edição
          </button>
        )}
      </div>
    </form>
  );
}