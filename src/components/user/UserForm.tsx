import { useState } from "react";
import {
  User, Mail, Phone, Lock, Building2, CreditCard,
  Eye, EyeOff, Plus, MapPin, Briefcase, Banknote, Calendar, Store,
} from "lucide-react";
import type { CreateUsuarioDTO, UpdateUsuarioDTO, Usuario } from "../../types/usuario";
import type { Loja } from "../../types/loja";

const TEAL  = "#0D7377";
const BORD  = "#E2E8F0";
const MUTED = "#64748B";
const COAL  = "#1E293B";

interface UserFormProps {
  userBeingEdited: Usuario | null;
  onCreate: (data: CreateUsuarioDTO) => Promise<void>;
  onUpdate: (id: number, data: UpdateUsuarioDTO) => Promise<void>;
  onCancelEdit: () => void;
  lojas?: Loja[];
}

const inputStyle: React.CSSProperties = {
  display: "block", width: "100%",
  padding: "10px 12px 10px 36px",
  fontSize: "14px",
  border: `1px solid ${BORD}`, borderRadius: "6px",
  background: "#F8FAFC", outline: "none",
  transition: "border-color 0.15s, box-shadow 0.15s",
};
const inputStyleNoIcon: React.CSSProperties = { ...inputStyle, paddingLeft: "12px" };

function onFocus(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
  e.target.style.borderColor = TEAL;
  e.target.style.boxShadow = "0 0 0 3px rgba(13,115,119,0.12)";
  e.target.style.background = "#fff";
}
function onBlur(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
  e.target.style.borderColor = BORD;
  e.target.style.boxShadow = "none";
  e.target.style.background = "#F8FAFC";
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-medium" style={{ color: MUTED }}>{children}</label>;
}

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

function typeBtn(active: boolean): React.CSSProperties {
  return {
    display: "flex", alignItems: "center", justifyContent: "center",
    gap: "8px", padding: "10px 0", fontSize: "14px", fontWeight: 500,
    borderRadius: "6px", width: "100%", cursor: "pointer", transition: "all 0.15s",
    border: active ? `1.5px solid ${TEAL}` : `1px solid ${BORD}`,
    background: active ? "rgba(13,115,119,0.07)" : "#fff",
    color: active ? TEAL : MUTED,
  };
}

export default function UserForm({ userBeingEdited, onCreate, onUpdate, onCancelEdit, lojas }: UserFormProps) {
  const [tipoPerfil, setTipoPerfil]     = useState<"cliente" | "funcionario">(userBeingEdited?.tipo_perfil ?? "cliente");
  const [nome, setNome]                 = useState(userBeingEdited?.nome ?? "");
  const [email, setEmail]               = useState(userBeingEdited?.email ?? "");
  const [telefone, setTelefone]         = useState(userBeingEdited?.telefone ?? "");
  const [senha, setSenha]               = useState("");
  const [showSenha, setShowSenha]       = useState(false);
  const [cpf, setCpf]                   = useState(userBeingEdited?.cpf ?? "");
  const [cnpj, setCnpj]                 = useState(userBeingEdited?.cnpj ?? "");
  const [ativo, setAtivo]               = useState(userBeingEdited?.ativo ?? true);
  const [clientType, setClientType]     = useState<"pessoa_fisica" | "pessoa_juridica">("pessoa_fisica");
  const [cep, setCep]                   = useState("");
  const [estado, setEstado]             = useState("");
  const [cidade, setCidade]             = useState("");
  const [employeeCode, setEmployeeCode] = useState("");
  const [jobTitle, setJobTitle]         = useState("");
  const [salary, setSalary]             = useState("");
  const [hiredAt, setHiredAt]           = useState("");
  const [storeId, setStoreId]           = useState<number | "">("");
  const [localError, setLocalError]     = useState("");

  const isEditing = Boolean(userBeingEdited);
  const isCliente = tipoPerfil === "cliente";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLocalError("");
    if (!isEditing && isCliente) {
      if (!cep.trim())    { setLocalError("CEP é obrigatório para clientes."); return; }
      if (!estado.trim()) { setLocalError("Estado é obrigatório para clientes."); return; }
      if (!cidade.trim()) { setLocalError("Cidade é obrigatória para clientes."); return; }
    }
    if (!isEditing && !isCliente) {
      if (!employeeCode.trim()) { setLocalError("Matrícula é obrigatória para funcionários."); return; }
      if (!jobTitle.trim())     { setLocalError("Cargo é obrigatório para funcionários."); return; }
      if (!salary || isNaN(Number(salary)) || Number(salary) < 0) { setLocalError("Salário válido é obrigatório para funcionários."); return; }
      if (!hiredAt)  { setLocalError("Data de contratação é obrigatória para funcionários."); return; }
      if (!storeId)  { setLocalError("Loja é obrigatória para funcionários."); return; }
    }

    if (isEditing && userBeingEdited) {
      await onUpdate(userBeingEdited.id, {
        nome: nome.trim(), email: email.trim(), telefone: telefone.trim(),
        tipo_perfil: tipoPerfil, cpf: cpf || undefined, cnpj: cnpj || undefined, ativo,
      });
    } else {
      await onCreate({
        nome: nome.trim(), email: email.trim(), senha_hash: senha,
        telefone: telefone.trim(), tipo_perfil: tipoPerfil,
        cpf: cpf || undefined, cnpj: cnpj || undefined,
        ...(isCliente && { client_type: clientType, cep: cep.trim(), state: estado.trim().toUpperCase(), city: cidade.trim() }),
        ...(!isCliente && { employee_code: employeeCode.trim(), job_title: jobTitle.trim(), salary: Number(salary), hired_at: hiredAt, store_id: Number(storeId) }),
      });
      setNome(""); setEmail(""); setSenha(""); setTelefone("");
      setTipoPerfil("cliente"); setCpf(""); setCnpj(""); setAtivo(true);
      setClientType("pessoa_fisica"); setCep(""); setEstado(""); setCidade("");
      setEmployeeCode(""); setJobTitle(""); setSalary(""); setHiredAt(""); setStoreId("");
    }
  }

  return (
    <form key={userBeingEdited?.id ?? "new"} onSubmit={handleSubmit}
      className="space-y-5 bg-white p-5"
      style={{ border: `1px solid ${BORD}`, borderRadius: "10px" }}>

      <div className="flex items-center gap-2">
        <User size={15} style={{ color: TEAL }} />
        <h2 className="text-sm font-bold" style={{ color: COAL }}>
          {isEditing ? "Editar Usuário" : "Novo Usuário"}
        </h2>
      </div>

      {/* Tipo de perfil */}
      {!isEditing && (
        <div className="space-y-1.5">
          <Label>Tipo de cadastro</Label>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" style={typeBtn(isCliente)}
              onClick={() => { setTipoPerfil("cliente"); setCnpj(""); }}>
              <User size={14} /> Cliente
            </button>
            <button type="button" style={typeBtn(!isCliente)}
              onClick={() => { setTipoPerfil("funcionario"); setCpf(""); }}>
              <Building2 size={14} /> Funcionário
            </button>
          </div>
        </div>
      )}

      {/* Nome + Email */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>{isCliente ? "Nome / Razão social" : "Nome completo"} *</Label>
          <div className="relative">
            <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: MUTED }} />
            <input type="text" required placeholder="Nome completo"
              value={nome} onChange={(e) => setNome(e.target.value)}
              style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>E-mail *</Label>
          <div className="relative">
            <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: MUTED }} />
            <input type="email" required placeholder="email@exemplo.com"
              value={email} onChange={(e) => setEmail(e.target.value)}
              style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
          </div>
        </div>
      </div>

      {/* Telefone + CPF/CNPJ */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Telefone *</Label>
          <div className="relative">
            <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: MUTED }} />
            <input type="tel" required placeholder="(61) 99999-9999"
              value={telefone} onChange={(e) => setTelefone(e.target.value)}
              style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>{tipoPerfil === "funcionario" ? "CPF" : "CPF (PF) / CNPJ (PJ)"}</Label>
          <div className="relative">
            <CreditCard size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: MUTED }} />
            {tipoPerfil === "funcionario" ? (
              <input type="text" placeholder="000.000.000-00"
                value={cpf} onChange={(e) => setCpf(maskCPF(e.target.value))}
                style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
            ) : (
              <input type="text" placeholder="CPF ou CNPJ"
                value={cpf || cnpj}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, "");
                  if (raw.length <= 11) { setCpf(maskCPF(e.target.value)); setCnpj(""); }
                  else { setCnpj(maskCNPJ(e.target.value)); setCpf(""); }
                }}
                style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
            )}
          </div>
        </div>
      </div>

      {/* Endereço cliente — só criação */}
      {!isEditing && isCliente && (
        <div className="space-y-4 p-4" style={{ border: `1px solid ${BORD}`, borderRadius: "8px", background: "#F9FAFB" }}>
          <div className="flex items-center gap-2">
            <MapPin size={14} style={{ color: TEAL }} />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: MUTED }}>
              Endereço do cliente
            </span>
          </div>
          <div className="space-y-1.5">
            <Label>Tipo de cliente *</Label>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" style={typeBtn(clientType === "pessoa_fisica")} onClick={() => setClientType("pessoa_fisica")}>
                Pessoa Física
              </button>
              <button type="button" style={typeBtn(clientType === "pessoa_juridica")} onClick={() => setClientType("pessoa_juridica")}>
                Pessoa Jurídica
              </button>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>CEP *</Label>
              <input type="text" placeholder="00000-000"
                value={cep} onChange={(e) => setCep(maskCEP(e.target.value))}
                style={inputStyleNoIcon} onFocus={onFocus} onBlur={onBlur} />
            </div>
            <div className="space-y-1.5">
              <Label>Estado *</Label>
              <input type="text" placeholder="SP" maxLength={2}
                value={estado} onChange={(e) => setEstado(e.target.value.toUpperCase())}
                style={inputStyleNoIcon} onFocus={onFocus} onBlur={onBlur} />
            </div>
            <div className="space-y-1.5">
              <Label>Cidade *</Label>
              <input type="text" placeholder="São Paulo"
                value={cidade} onChange={(e) => setCidade(e.target.value)}
                style={inputStyleNoIcon} onFocus={onFocus} onBlur={onBlur} />
            </div>
          </div>
        </div>
      )}

      {/* Dados funcionário — só criação */}
      {!isEditing && !isCliente && (
        <div className="space-y-4 p-4" style={{ border: `1px solid ${BORD}`, borderRadius: "8px", background: "#F9FAFB" }}>
          <div className="flex items-center gap-2">
            <Briefcase size={14} style={{ color: TEAL }} />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: MUTED }}>
              Dados do funcionário
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Matrícula *</Label>
              <div className="relative">
                <Briefcase size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: MUTED }} />
                <input type="text" placeholder="EMP001"
                  value={employeeCode} onChange={(e) => setEmployeeCode(e.target.value)}
                  style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Cargo *</Label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: MUTED }} />
                <input type="text" placeholder="Tosador, Veterinário..."
                  value={jobTitle} onChange={(e) => setJobTitle(e.target.value)}
                  style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Salário (R$) *</Label>
              <div className="relative">
                <Banknote size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: MUTED }} />
                <input type="number" min="0" step="0.01" placeholder="2500.00"
                  value={salary} onChange={(e) => setSalary(e.target.value)}
                  style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Data de contratação *</Label>
              <div className="relative">
                <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: MUTED }} />
                <input type="date"
                  value={hiredAt} onChange={(e) => setHiredAt(e.target.value)}
                  style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
              </div>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Loja *</Label>
              <div className="relative">
                <Store size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: MUTED }} />
                <select value={storeId} onChange={(e) => setStoreId(e.target.value === "" ? "" : Number(e.target.value))}
                  style={{ ...inputStyle, appearance: "none" as const }}
                  onFocus={onFocus as any} onBlur={onBlur as any}>
                  <option value="">Selecione uma loja</option>
                  {(lojas ?? []).map((l) => <option key={l.id} value={l.id}>{l.nome}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Senha — só criação */}
      {!isEditing && (
        <div className="space-y-1.5">
          <Label>Senha *</Label>
          <div className="relative">
            <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: MUTED }} />
            <input
              type={showSenha ? "text" : "password"}
              required minLength={6} placeholder="Mínimo 6 caracteres"
              value={senha} onChange={(e) => setSenha(e.target.value)}
              style={{ ...inputStyle, paddingRight: "44px" }}
              onFocus={onFocus} onBlur={onBlur}
            />
            <button type="button" tabIndex={-1} onClick={() => setShowSenha((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 transition hover:opacity-70"
              style={{ color: MUTED }}>
              {showSenha ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>
      )}

      {/* Toggle ativo — só edição */}
      {isEditing && (
        <label className="flex cursor-pointer items-center gap-3">
          <div onClick={() => setAtivo((v) => !v)}
            className="relative h-5 w-9 rounded-full transition-colors"
            style={{ background: ativo ? TEAL : "#D1D5DB" }}>
            <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${ativo ? "translate-x-4" : "translate-x-0.5"}`} />
          </div>
          <span className="text-sm" style={{ color: "#374151" }}>{ativo ? "Usuário ativo" : "Usuário inativo"}</span>
        </label>
      )}

      {localError && (
        <div className="px-4 py-3 text-sm font-medium"
          style={{ borderRadius: "6px", border: "1px solid #FECACA", background: "rgba(254,202,202,0.25)", color: "#DC2626" }}>
          {localError}
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <button type="submit"
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
          style={{ background: TEAL, borderRadius: "6px" }}>
          <Plus size={14} />
          {isEditing ? "Salvar alterações" : "Cadastrar"}
        </button>
        {isEditing && (
          <button type="button" onClick={onCancelEdit}
            className="px-5 py-2.5 text-sm font-medium transition hover:bg-gray-50"
            style={{ border: `1px solid ${BORD}`, borderRadius: "6px", color: MUTED }}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
