import { useState } from "react";
import { User, Mail, Phone, Lock, Building2, CreditCard, Eye, EyeOff, Plus, MapPin } from "lucide-react";
import type { CreateUsuarioDTO, UpdateUsuarioDTO, Usuario } from "../../types/usuario";

interface UserFormProps {
  userBeingEdited: Usuario | null;
  onCreate: (data: CreateUsuarioDTO) => Promise<void>;
  onUpdate: (id: number, data: UpdateUsuarioDTO) => Promise<void>;
  onCancelEdit: () => void;
}

const inputCls = "w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none transition focus:border-[#1c46f3] focus:bg-white focus:ring-2 focus:ring-[#1c46f3]/15";

function maskCPF(v: string) {
  return v.replace(/\D/g, "").slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function maskCNPJ(v: string) {
  return v.replace(/\D/g, "").slice(0, 14)
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
}

function maskCEP(v: string) {
  return v.replace(/\D/g, "").slice(0, 8).replace(/(\d{5})(\d)/, "$1-$2");
}

export default function UserForm({ userBeingEdited, onCreate, onUpdate, onCancelEdit }: UserFormProps) {
  const [tipoPerfil, setTipoPerfil] = useState<"cliente" | "funcionario">(
    userBeingEdited?.tipo_perfil ?? "cliente"
  );
  const [nome, setNome] = useState(userBeingEdited?.nome ?? "");
  const [email, setEmail] = useState(userBeingEdited?.email ?? "");
  const [telefone, setTelefone] = useState(userBeingEdited?.telefone ?? "");
  const [senha, setSenha] = useState("");
  const [showSenha, setShowSenha] = useState(false);
  const [cpf, setCpf] = useState(userBeingEdited?.cpf ?? "");
  const [cnpj, setCnpj] = useState(userBeingEdited?.cnpj ?? "");
  const [ativo, setAtivo] = useState(userBeingEdited?.ativo ?? true);

  // Client-specific fields (create only)
  const [clientType, setClientType] = useState<"pessoa_fisica" | "pessoa_juridica">("pessoa_fisica");
  const [cep, setCep] = useState("");
  const [estado, setEstado] = useState("");
  const [cidade, setCidade] = useState("");

  const [localError, setLocalError] = useState("");

  const isEditing = Boolean(userBeingEdited);
  const isCliente = tipoPerfil === "cliente";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLocalError("");

    // Client-specific validation (create only)
    if (!isEditing && isCliente) {
      if (!cep.trim()) { setLocalError("CEP é obrigatório para clientes."); return; }
      if (!estado.trim()) { setLocalError("Estado é obrigatório para clientes."); return; }
      if (!cidade.trim()) { setLocalError("Cidade é obrigatória para clientes."); return; }
    }

    if (isEditing && userBeingEdited) {
      const payload: UpdateUsuarioDTO = {
        nome: nome.trim(),
        email: email.trim(),
        telefone: telefone.trim(),
        tipo_perfil: tipoPerfil,
        cpf: cpf || undefined,
        cnpj: cnpj || undefined,
        ativo,
      };
      await onUpdate(userBeingEdited.id, payload);
    } else {
      const payload: CreateUsuarioDTO = {
        nome: nome.trim(),
        email: email.trim(),
        senha_hash: senha,
        telefone: telefone.trim(),
        tipo_perfil: tipoPerfil,
        cpf: cpf || undefined,
        cnpj: cnpj || undefined,
        ...(isCliente && {
          client_type: clientType,
          cep: cep.trim(),
          state: estado.trim().toUpperCase(),
          city: cidade.trim(),
        }),
      };
      await onCreate(payload);
      setNome(""); setEmail(""); setSenha(""); setTelefone("");
      setTipoPerfil("cliente"); setCpf(""); setCnpj(""); setAtivo(true);
      setClientType("pessoa_fisica"); setCep(""); setEstado(""); setCidade("");
    }
  }

  return (
    <form key={userBeingEdited?.id ?? "new"} onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-gray-700">
        {isEditing ? "Editar Usuário" : "Novo Usuário"}
      </h2>
      {/* Tipo de perfil */}
      {!isEditing && (
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-gray-500">Tipo de cadastro</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => { setTipoPerfil("cliente"); setCnpj(""); }}
              className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium transition ${
                isCliente ? "border-[#1c46f3] bg-[#1c46f3]/8 text-[#1c46f3]" : "border-gray-200 text-gray-500 hover:border-gray-300"
              }`}
            >
              <User size={14} /> Cliente
            </button>
            <button
              type="button"
              onClick={() => { setTipoPerfil("funcionario"); setCpf(""); }}
              className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-medium transition ${
                tipoPerfil === "funcionario" ? "border-[#1c46f3] bg-[#1c46f3]/8 text-[#1c46f3]" : "border-gray-200 text-gray-500 hover:border-gray-300"
              }`}
            >
              <Building2 size={14} /> Funcionário
            </button>
          </div>
        </div>
      )}

      {/* Nome + Email */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-gray-500">
            {isCliente ? "Nome / Razão social" : "Nome completo"} *
          </label>
          <div className="relative">
            <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" required className={inputCls + " pl-9"} placeholder="Nome completo" value={nome} onChange={(e) => setNome(e.target.value)} />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-gray-500">E-mail *</label>
          <div className="relative">
            <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="email" required className={inputCls + " pl-9"} placeholder="email@exemplo.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Telefone + CPF/CNPJ */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-gray-500">Telefone *</label>
          <div className="relative">
            <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="tel" required className={inputCls + " pl-9"} placeholder="(61) 99999-9999" value={telefone} onChange={(e) => setTelefone(e.target.value)} />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-gray-500">
            {tipoPerfil === "funcionario" ? "CPF" : "CPF (PF) / CNPJ (PJ)"}
          </label>
          <div className="relative">
            <CreditCard size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            {tipoPerfil === "funcionario" ? (
              <input type="text" className={inputCls + " pl-9"} placeholder="000.000.000-00" value={cpf} onChange={(e) => setCpf(maskCPF(e.target.value))} />
            ) : (
              <input type="text" className={inputCls + " pl-9"} placeholder="CPF ou CNPJ" value={cpf || cnpj}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, "");
                  if (raw.length <= 11) { setCpf(maskCPF(e.target.value)); setCnpj(""); }
                  else { setCnpj(maskCNPJ(e.target.value)); setCpf(""); }
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Campos de endereço — somente clientes novos */}
      {!isEditing && isCliente && (
        <div className="space-y-4 rounded-2xl border border-gray-100 bg-gray-50/60 p-4">
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-[#1c46f3]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Endereço do cliente</span>
          </div>

          {/* Tipo de cliente */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-gray-500">Tipo de cliente *</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setClientType("pessoa_fisica")}
                className={`rounded-xl border py-2 text-sm font-medium transition ${
                  clientType === "pessoa_fisica" ? "border-[#1c46f3] bg-[#1c46f3]/8 text-[#1c46f3]" : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                }`}
              >
                Pessoa Física
              </button>
              <button
                type="button"
                onClick={() => setClientType("pessoa_juridica")}
                className={`rounded-xl border py-2 text-sm font-medium transition ${
                  clientType === "pessoa_juridica" ? "border-[#1c46f3] bg-[#1c46f3]/8 text-[#1c46f3]" : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                }`}
              >
                Pessoa Jurídica
              </button>
            </div>
          </div>

          {/* CEP + Estado + Cidade */}
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-gray-500">CEP *</label>
              <input
                type="text"
                className={inputCls}
                placeholder="00000-000"
                value={cep}
                onChange={(e) => setCep(maskCEP(e.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-gray-500">Estado *</label>
              <input
                type="text"
                className={inputCls}
                placeholder="SP"
                maxLength={2}
                value={estado}
                onChange={(e) => setEstado(e.target.value.toUpperCase())}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-gray-500">Cidade *</label>
              <input
                type="text"
                className={inputCls}
                placeholder="São Paulo"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Senha (só criação) */}
      {!isEditing && (
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-gray-500">Senha *</label>
          <div className="relative">
            <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type={showSenha ? "text" : "password"}
              required
              minLength={6}
              className={inputCls + " pl-9 pr-10"}
              placeholder="Mínimo 6 caracteres"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
            <button type="button" tabIndex={-1} onClick={() => setShowSenha((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showSenha ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>
      )}

      {/* Ativo (só edição) */}
      {isEditing && (
        <label className="flex cursor-pointer items-center gap-3">
          <div
            onClick={() => setAtivo((v) => !v)}
            className={`relative h-5 w-9 rounded-full transition-colors ${ativo ? "bg-[#1c46f3]" : "bg-gray-200"}`}
          >
            <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${ativo ? "translate-x-4" : "translate-x-0.5"}`} />
          </div>
          <span className="text-sm text-gray-600">{ativo ? "Usuário ativo" : "Usuário inativo"}</span>
        </label>
      )}

      {/* Local error */}
      {localError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {localError}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#1c46f3] to-[#1840e0] px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-[#1c46f3]/20 transition hover:opacity-90"
        >
          <Plus size={14} />
          {isEditing ? "Salvar alterações" : "Cadastrar"}
        </button>
        {isEditing && (
          <button type="button" onClick={onCancelEdit} className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm text-gray-500 transition hover:bg-gray-50">
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
