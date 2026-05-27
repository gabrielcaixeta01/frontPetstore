import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle, XCircle, Pencil, Save, X,
  LogOut, Key, Lock, Eye, EyeOff, ChevronDown,
  PawPrint, CalendarCheck,
} from "lucide-react";
import EditModal from "../../components/EditModal";
import { getUsuarios, updateUsuario } from "../../services/usuarioService";
import { getPets } from "../../services/petService";
import { getAppointments } from "../../services/atendimentoService";
import { api } from "../../services/api";
import type { Atendimento } from "../../types/atendimento";

type UserProfile = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  cpf?: string;
  cnpj?: string;
  role: string;
  active: boolean;
  created_at: string;
  client_profile?: {
    client_type: string;
    cep: string;
    state: string;
    city: string;
    cpf?: string;
    cnpj?: string;
  } | null;
};

const STATUS_CFG: Record<string, { label: string; cls: string }> = {
  concluido: { label: "Concluído", cls: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  agendado:  { label: "Agendado",  cls: "border-blue-200 bg-blue-50 text-blue-700"          },
  cancelado: { label: "Cancelado", cls: "border-red-200 bg-red-50 text-red-600"             },
};

const inputCls = "w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none transition focus:border-[#1c46f3] focus:bg-white focus:ring-2 focus:ring-[#1c46f3]/15";

function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

function formatDateLong(dateStr?: string) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return Number.isNaN(d.getTime()) ? dateStr : d.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

function formatDateShort(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function InfoField({ label, value }: { label: string; value?: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-medium text-gray-400">{label}</p>
      <p className="mt-0.5 truncate text-sm font-semibold text-gray-800" title={value || "—"}>{value || "—"}</p>
    </div>
  );
}

export default function ClienteProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [petCount, setPetCount] = useState(0);
  const [recentAtend, setRecentAtend] = useState<Atendimento[]>([]);
  const [totalAtend, setTotalAtend] = useState(0);
  const [loading, setLoading] = useState(true);

  // Edit profile
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editCep, setEditCep] = useState("");
  const [editState, setEditState] = useState("");
  const [editCity, setEditCity] = useState("");

  // Change password
  const [showPwdForm, setShowPwdForm] = useState(false);
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdError, setPwdError] = useState("");
  const [pwdSaving, setPwdSaving] = useState(false);
  const [showCurPwd, setShowCurPwd] = useState(false);
  const [showNewPwdVis, setShowNewPwdVis] = useState(false);

  // Logout modal
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        const userData = await api.get<UserProfile>("/auth/me").then((r) => r.data);
        setProfile(userData);
        setEditName(userData.name);
        setEditEmail(userData.email);
        setEditPhone(userData.phone ?? "");
        setEditCep(userData.client_profile?.cep ?? "");
        setEditState(userData.client_profile?.state ?? "");
        setEditCity(userData.client_profile?.city ?? "");

        const [petData, atendData] = await Promise.all([
          getPets().catch(() => []),
          getAppointments().catch(() => [] as Atendimento[]),
        ]);

        setPetCount(petData.filter((p) => p.dono_id === userData.id).length);

        const myAtend = atendData
          .filter((a) => a.cliente_id === userData.id)
          .sort((a, b) => new Date(b.data_atendimento).getTime() - new Date(a.data_atendimento).getTime());
        setTotalAtend(myAtend.length);
        setRecentAtend(myAtend.slice(0, 5));
      } catch {
        const stored = localStorage.getItem("user");
        if (stored) setProfile(JSON.parse(stored));
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  function startEditing() {
    if (!profile) return;
    setEditError("");
    setEditName(profile.name);
    setEditEmail(profile.email);
    setEditPhone(profile.phone ?? "");
    setEditCep(profile.client_profile?.cep ?? "");
    setEditState(profile.client_profile?.state ?? "");
    setEditCity(profile.client_profile?.city ?? "");
    setIsEditing(true);
  }

  function cancelEditing() {
    setEditError("");
    setIsEditing(false);
  }

  async function saveProfile() {
    if (!profile) return;
    const normalizedName = editName.trim();
    const normalizedEmail = editEmail.trim();
    if (!normalizedName) { setEditError("Informe o nome."); return; }
    if (!normalizedEmail) { setEditError("Informe o e-mail."); return; }

    setSaving(true);
    setEditError("");
    try {
      const existingUsers = await getUsuarios();
      if (existingUsers.some((u) => u.id !== profile.id && u.email.trim().toLowerCase() === normalizedEmail.toLowerCase())) {
        setEditError("Este e-mail já está em uso por outro usuário.");
        return;
      }
      await updateUsuario(profile.id, {
        nome: normalizedName, email: normalizedEmail, telefone: editPhone.trim(),
        cep: editCep.trim(), state: editState.trim().toUpperCase(), city: editCity.trim(),
      });
      const refreshed = await api.get<UserProfile>("/auth/me").then((r) => r.data);
      setProfile(refreshed);
      localStorage.setItem("user", JSON.stringify(refreshed));
      setIsEditing(false);
    } catch {
      setEditError("Não foi possível salvar as alterações.");
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwdError("");
    if (!newPwd.trim()) { setPwdError("Informe a nova senha."); return; }
    if (newPwd.length < 6) { setPwdError("A nova senha deve ter no mínimo 6 caracteres."); return; }
    if (newPwd !== confirmPwd) { setPwdError("As senhas não coincidem."); return; }
    if (!profile) return;
    setPwdSaving(true);
    try {
      await api.put(`/user/${profile.id}`, null, { params: { password: newPwd } });
      setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
      setShowPwdForm(false);
    } catch {
      setPwdError("Não foi possível alterar a senha.");
    } finally {
      setPwdSaving(false);
    }
  }

  if (loading) return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 text-sm text-gray-400 sm:px-6 sm:py-8">
      Carregando perfil...
    </div>
  );
  if (!profile) return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
      <p className="text-sm text-red-500">Não foi possível carregar o perfil.</p>
    </div>
  );

  const cp = profile.client_profile;
  const clientTypeLabel = cp?.client_type === "pessoa_juridica" ? "Pessoa Jurídica" : "Pessoa Física";
  const hasCnpj = Boolean(profile.cnpj ?? cp?.cnpj);
  const docLabel = hasCnpj ? "CNPJ" : "CPF";
  const docValue = profile.cnpj ?? cp?.cnpj ?? profile.cpf ?? cp?.cpf;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="space-y-5">

        {/* Hero banner */}
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-[#1c46f3] to-[#00bb69] px-6 py-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-xl font-bold text-white">
                  {getInitials(profile.name)}
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-white/60">Cliente</p>
                  <h2 className="text-xl font-bold leading-tight text-white">{profile.name}</h2>
                  {cp && <p className="mt-0.5 text-xs text-white/60">{clientTypeLabel}</p>}
                </div>
              </div>
              <div className="flex gap-3">
                <div className="rounded-xl bg-white/15 px-4 py-2.5 text-white">
                  <p className="text-xs font-medium text-white/70">Meus Pets</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold">{petCount}</span>
                    <PawPrint size={13} className="mb-0.5 opacity-70" />
                  </div>
                </div>
                <div className="rounded-xl bg-white/15 px-4 py-2.5 text-white">
                  <p className="text-xs font-medium text-white/70">Atendimentos</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold">{totalAtend}</span>
                    <CalendarCheck size={13} className="mb-0.5 opacity-70" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between px-6 py-3">
            <span className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${profile.active ? "bg-[#00bb69]/10 text-[#00bb69]" : "bg-red-100 text-red-600"}`}>
              {profile.active ? <><CheckCircle size={11} /> Ativo</> : <><XCircle size={11} /> Inativo</>}
            </span>
            {!isEditing && (
              <button
                onClick={startEditing}
                className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50 sm:px-4"
              >
                <Pencil size={13} /> <span className="hidden sm:inline">Editar perfil</span>
              </button>
            )}
          </div>
        </div>

        {editError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{editError}</div>
        )}

        {/* Dados pessoais + Segurança */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">Dados pessoais</h3>
          {isEditing ? (
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-gray-500">Nome completo</label>
                  <input className={inputCls} value={editName} onChange={(e) => setEditName(e.target.value)} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-500">E-mail</label>
                  <input type="email" className={inputCls} value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-500">Telefone</label>
                  <input className={inputCls} value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-500">CEP</label>
                  <input className={inputCls} value={editCep} onChange={(e) => setEditCep(e.target.value)} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-500">Estado</label>
                  <input className={inputCls} value={editState} onChange={(e) => setEditState(e.target.value.toUpperCase().slice(0, 2))} maxLength={2} />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-gray-500">Cidade</label>
                  <input className={inputCls} value={editCity} onChange={(e) => setEditCity(e.target.value)} />
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={saveProfile} disabled={saving}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#1c46f3] to-[#1840e0] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-60">
                  <Save size={13} /> {saving ? "Salvando…" : "Salvar"}
                </button>
                <button onClick={cancelEditing}
                  className="flex items-center gap-2 rounded-xl border border-gray-200 px-5 py-2.5 text-sm text-gray-500 transition hover:bg-gray-50">
                  <X size={13} /> Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-3">
              <InfoField label="Nome completo" value={profile.name} />
              <InfoField label="E-mail" value={profile.email} />
              <InfoField label="Telefone" value={profile.phone} />
              <InfoField label={docLabel} value={docValue} />
              <InfoField label="Membro desde" value={formatDateLong(profile.created_at)} />
              {cp?.city && <InfoField label="Cidade / Estado" value={`${cp.city} / ${cp.state}`} />}
            </div>
          )}

          <div className="my-5 border-t border-gray-100" />

          <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">Segurança</h3>

          <button
            onClick={() => { setShowPwdForm((v) => !v); setPwdError(""); }}
            className="flex w-full items-center justify-between rounded-xl px-1 py-2 text-sm font-medium text-gray-700 transition hover:text-gray-900"
          >
            <span className="flex items-center gap-2.5"><Key size={14} className="text-gray-400" /> Trocar senha</span>
            <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${showPwdForm ? "rotate-180" : ""}`} />
          </button>

          {showPwdForm && (
            <form onSubmit={handleChangePassword} className="mt-3 space-y-2.5">
              <div className="relative">
                <input type={showCurPwd ? "text" : "password"} placeholder="Senha atual" value={currentPwd} onChange={(e) => setCurrentPwd(e.target.value)} className={inputCls} />
                <button type="button" onClick={() => setShowCurPwd((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showCurPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <div className="relative">
                <input type={showNewPwdVis ? "text" : "password"} placeholder="Nova senha (mín. 6 caracteres)" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} className={inputCls} />
                <button type="button" onClick={() => setShowNewPwdVis((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showNewPwdVis ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <input type="password" placeholder="Confirmar nova senha" value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} className={inputCls} />
              {pwdError && <p className="text-xs text-red-500">{pwdError}</p>}
              <button type="submit" disabled={pwdSaving}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#1c46f3] to-[#1840e0] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60">
                <Lock size={13} /> {pwdSaving ? "Atualizando…" : "Atualizar senha"}
              </button>
            </form>
          )}
        </div>

        {/* Atividade recente */}
        {recentAtend.length > 0 && (
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">Atividade recente</h3>
            <div className="divide-y divide-gray-50">
              {recentAtend.map((at) => {
                const cfg = STATUS_CFG[at.status] ?? { label: at.status, cls: "border-gray-200 bg-gray-50 text-gray-600" };
                return (
                  <div key={at.id} className="flex items-center gap-4 py-3">
                    <span className="w-16 shrink-0 text-xs text-gray-400">{formatDateShort(at.data_atendimento)}</span>
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${cfg.cls}`}>{cfg.label}</span>
                    <span className="ml-auto text-xs font-medium text-gray-600">{formatMoney(at.valor_final)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Logout discreto */}
        <div className="flex justify-end">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            <LogOut size={14} /> Sair da conta
          </button>
        </div>
      </div>

      {/* EditModal para edição de perfil (mantido para compatibilidade) */}
      <EditModal isOpen={false} title="" onClose={() => {}}>{null}</EditModal>

      {/* Modal de confirmação de logout */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50">
              <LogOut size={20} className="text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Sair da conta?</h3>
            <p className="mt-1 text-sm text-gray-500">Você precisará fazer login novamente para acessar o sistema.</p>
            <div className="mt-5 flex gap-3">
              <button onClick={logout}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700">
                Sim, sair
              </button>
              <button onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 transition hover:bg-gray-50">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
