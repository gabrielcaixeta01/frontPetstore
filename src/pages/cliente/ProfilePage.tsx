import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User, Mail, Phone, Calendar, MapPin, FileText,
  PawPrint, CalendarCheck, Shield, LogOut, Key, Lock,
  Eye, EyeOff, ChevronDown, Pencil, Save, X,
  AlertTriangle,
} from "lucide-react";
import { api } from "../../services/api";
import { getPets } from "../../services/petService";
import { getAppointments } from "../../services/atendimentoService";
import { getUsuarios, updateUsuario } from "../../services/usuarioService";
import type { Atendimento } from "../../types/atendimento";

type UserProfile = {
  id: number; name: string; email: string; phone?: string;
  cpf?: string; cnpj?: string; role: string; active: boolean; created_at: string;
  client_profile?: { client_type: string; cep: string; state: string; city: string; cpf?: string; cnpj?: string; } | null;
};

const inputCls = "w-full rounded border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none transition focus:border-[#1c46f3] focus:bg-white";

function getInitials(name: string) { return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase(); }
function formatDateLong(d?: string) { if (!d) return "—"; const dt = new Date(d); return Number.isNaN(dt.getTime()) ? d : dt.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" }); }
function formatDateShort(d: string) { return new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }); }
function formatMoney(v: number) { return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v); }

function SectionCard({ iconBg, iconCls, IconEl, title, sub, children }: {
  iconBg: string; iconCls: string; IconEl: React.ElementType;
  title: string; sub: string; children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-md border border-gray-200 bg-white">
      <div className="flex items-center gap-3 border-b border-gray-200 px-5 py-3.5">
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconBg}`}>
          <IconEl size={15} className={iconCls} />
        </div>
        <div>
          <p className="text-[13px] font-bold text-gray-800">{title}</p>
          <p className="text-[11px] text-gray-400">{sub}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function FieldCell({ label, value, IconEl }: { label: string; value?: string; IconEl?: React.ElementType }) {
  return (
    <div className="px-5 py-3.5">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-1.5 flex items-center gap-1.5 text-[13px] font-medium text-gray-800">
        {IconEl && <IconEl size={12} className="shrink-0 text-[#1c46f3]" />}
        {value || "—"}
      </p>
    </div>
  );
}

const STATUS_CFG: Record<string, { label: string; cls: string }> = {
  concluido: { label: "Concluído", cls: "bg-blue-50 text-blue-700" },
  agendado:  { label: "Agendado",  cls: "bg-amber-50 text-amber-700" },
  cancelado: { label: "Cancelado", cls: "bg-red-50 text-red-600" },
};

export default function ClienteProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [petCount, setPetCount] = useState(0);
  const [recentAtend, setRecentAtend] = useState<Atendimento[]>([]);
  const [totalAtend, setTotalAtend] = useState(0);
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editCep, setEditCep] = useState("");
  const [editState, setEditState] = useState("");
  const [editCity, setEditCity] = useState("");

  const [showPwdForm, setShowPwdForm] = useState(false);
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdError, setPwdError] = useState("");
  const [pwdSaving, setPwdSaving] = useState(false);
  const [showCurPwd, setShowCurPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        const userData = await api.get<UserProfile>("/auth/me").then((r) => r.data);
        setProfile(userData);
        setEditName(userData.name); setEditEmail(userData.email); setEditPhone(userData.phone ?? "");
        setEditCep(userData.client_profile?.cep ?? "");
        setEditState(userData.client_profile?.state ?? "");
        setEditCity(userData.client_profile?.city ?? "");
        const [petData, atendData] = await Promise.all([
          getPets().catch(() => []),
          getAppointments().catch(() => [] as Atendimento[]),
        ]);
        setPetCount(petData.filter((p) => p.dono_id === userData.id).length);
        const my = atendData.filter((a) => a.cliente_id === userData.id)
          .sort((a, b) => new Date(b.data_atendimento).getTime() - new Date(a.data_atendimento).getTime());
        setTotalAtend(my.length); setRecentAtend(my.slice(0, 5));
      } catch {
        const stored = localStorage.getItem("user");
        if (stored) setProfile(JSON.parse(stored));
      } finally { setLoading(false); }
    }
    init();
  }, []);

  function logout() { localStorage.removeItem("token"); localStorage.removeItem("user"); navigate("/login"); }

  async function saveProfile() {
    if (!profile) return;
    const n = editName.trim(), e = editEmail.trim();
    if (!n) { setEditError("Informe o nome."); return; }
    if (!e) { setEditError("Informe o e-mail."); return; }
    setSaving(true); setEditError("");
    try {
      const existing = await getUsuarios();
      if (existing.some((u) => u.id !== profile.id && u.email.trim().toLowerCase() === e.toLowerCase())) {
        setEditError("Este e-mail já está em uso."); return;
      }
      await updateUsuario(profile.id, { nome: n, email: e, telefone: editPhone.trim(), cep: editCep.trim(), state: editState.trim().toUpperCase(), city: editCity.trim() });
      const refreshed = await api.get<UserProfile>("/auth/me").then((r) => r.data);
      setProfile(refreshed); localStorage.setItem("user", JSON.stringify(refreshed)); setIsEditing(false);
    } catch { setEditError("Não foi possível salvar as alterações."); }
    finally { setSaving(false); }
  }

  async function handleChangePassword(e: React.SyntheticEvent) {
    e.preventDefault(); setPwdError("");
    if (!newPwd.trim()) { setPwdError("Informe a nova senha."); return; }
    if (newPwd.length < 6) { setPwdError("A nova senha deve ter no mínimo 6 caracteres."); return; }
    if (newPwd !== confirmPwd) { setPwdError("As senhas não coincidem."); return; }
    if (!profile) return;
    setPwdSaving(true);
    try {
      await api.put(`/user/${profile.id}`, null, { params: { password: newPwd } });
      setCurrentPwd(""); setNewPwd(""); setConfirmPwd(""); setShowPwdForm(false);
    } catch { setPwdError("Não foi possível alterar a senha."); }
    finally { setPwdSaving(false); }
  }

  if (loading) return <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-8 text-sm text-gray-400">Carregando perfil...</div>;
  if (!profile) return <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-8"><p className="text-sm text-red-500">Não foi possível carregar o perfil.</p></div>;

  const cp = profile.client_profile;
  const hasCnpj = Boolean(profile.cnpj ?? cp?.cnpj);
  const docLabel = hasCnpj ? "CNPJ" : "CPF";
  const docValue = profile.cnpj ?? cp?.cnpj ?? profile.cpf ?? cp?.cpf;
  const initials = getInitials(profile.name);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="space-y-5">

        {/* ── Hero ──────────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-md bg-[#1c46f3] px-6 py-8 sm:px-8">
          <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <div className="relative shrink-0">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-white/30 bg-[#F5A800] text-2xl font-extrabold text-[#0D2580]">
                  {initials}
                </div>
                {profile.active && <div className="absolute bottom-0.5 right-0.5 h-3.5 w-3.5 rounded-full border-2 border-[#1c46f3] bg-[#00A651]" />}
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-white/55">
                  {cp?.client_type === "pessoa_juridica" ? "Pessoa Jurídica" : "Cliente"}
                </p>
                <h1 className="text-2xl font-extrabold leading-tight text-white">{profile.name}</h1>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  {cp?.city && <span className="flex items-center gap-1 text-xs text-white/70"><MapPin size={11} /> {cp.city}{cp.state ? `, ${cp.state}` : ""}</span>}
                  <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${profile.active ? "border border-[#00A651]/40 bg-[#00A651]/20 text-white" : "bg-red-500/20 text-white"}`}>
                    {profile.active ? <><span className="h-1.5 w-1.5 rounded-full bg-[#00A651]" /> Ativo</> : "Inativo"}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-start gap-3 sm:items-end">
              {!isEditing && (
                <button onClick={() => { setEditName(profile.name); setEditEmail(profile.email); setEditPhone(profile.phone ?? ""); setEditCep(cp?.cep ?? ""); setEditState(cp?.state ?? ""); setEditCity(cp?.city ?? ""); setEditError(""); setIsEditing(true); }}
                  className="flex items-center gap-1.5 rounded border border-white/30 bg-white/15 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/25">
                  <Pencil size={12} /> Editar perfil
                </button>
              )}
              <div className="flex gap-2.5">
                <div className="rounded border border-white/15 bg-white/10 px-4 py-2.5">
                  <p className="text-[10px] uppercase tracking-wide text-white/65">Meus Pets</p>
                  <p className="mt-0.5 text-xl font-extrabold leading-none text-[#F5A800]">{petCount}</p>
                </div>
                <div className="rounded border border-white/15 bg-white/10 px-4 py-2.5">
                  <p className="text-[10px] uppercase tracking-wide text-white/65">Atendimentos</p>
                  <p className="mt-0.5 text-xl font-extrabold leading-none text-[#F5A800]">{totalAtend}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute right-6 top-1/2 hidden -translate-y-1/2 items-center gap-2 lg:flex" aria-hidden="true">
            <div className="flex flex-col items-center gap-2">
              <div className="h-3 w-3 rotate-45 rounded bg-[#F5A800]" />
              <div className="h-5 w-5 rounded-full border-2 border-[#00A651]" />
              <div className="h-2 w-2 rounded bg-[#00A651]" />
            </div>
            <div className="mt-3 flex flex-col items-center gap-2">
              <div style={{ width:0, height:0, borderLeft:"9px solid transparent", borderRight:"9px solid transparent", borderBottom:"16px solid #F5A800" }} />
              <div className="h-6 w-6 rounded bg-white/10" />
              <div className="h-3.5 w-3.5 rounded-full bg-[#00A651]" />
            </div>
            <div className="-mt-2 flex flex-col items-center gap-2">
              <div className="h-3.5 w-3.5 rotate-45 rounded border-2 border-[#F5A800]" />
              <div className="h-8 w-8 rounded-full bg-white/10" />
              <div style={{ width:0, height:0, borderLeft:"6px solid transparent", borderRight:"6px solid transparent", borderTop:"11px solid rgba(255,255,255,0.3)" }} />
            </div>
          </div>
        </div>

        {editError && <div className="rounded border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">{editError}</div>}

        {/* ── Dados Pessoais ─────────────────────────────── */}
        <SectionCard iconBg="bg-[#e8eeff]" iconCls="text-[#1c46f3]" IconEl={User} title="Dados Pessoais" sub="Informações cadastrais da conta">
          {isEditing ? (
            <div className="space-y-3 p-5">
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
                  <label className="mb-1 block text-xs font-medium text-gray-500">Estado (UF)</label>
                  <input className={inputCls} value={editState} maxLength={2} onChange={(e) => setEditState(e.target.value.toUpperCase().slice(0, 2))} />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-gray-500">Cidade</label>
                  <input className={inputCls} value={editCity} onChange={(e) => setEditCity(e.target.value)} />
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={saveProfile} disabled={saving}
                  className="flex items-center gap-2 rounded bg-[#1c46f3] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#1840e0] disabled:opacity-60">
                  <Save size={13} /> {saving ? "Salvando…" : "Salvar"}
                </button>
                <button onClick={() => setIsEditing(false)}
                  className="flex items-center gap-2 rounded border border-gray-200 px-5 py-2 text-sm text-gray-500 transition hover:bg-gray-50">
                  <X size={13} /> Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              <div className="grid divide-gray-100 sm:grid-cols-3 sm:divide-x">
                <FieldCell label="Nome completo" value={profile.name} IconEl={User} />
                <FieldCell label="E-mail" value={profile.email} IconEl={Mail} />
                <FieldCell label="Telefone" value={profile.phone || "—"} IconEl={Phone} />
              </div>
              <div className="grid divide-gray-100 sm:grid-cols-3 sm:divide-x">
                <FieldCell label={docLabel} value={docValue} IconEl={FileText} />
                <FieldCell label="Membro desde" value={formatDateLong(profile.created_at)} IconEl={Calendar} />
                <FieldCell label="Cidade / Estado" value={cp?.city ? `${cp.city}${cp.state ? ` / ${cp.state}` : ""}` : undefined} IconEl={MapPin} />
              </div>
            </div>
          )}
        </SectionCard>

        {/* ── Resumo da conta ────────────────────────────── */}
        <SectionCard iconBg="bg-amber-50" iconCls="text-[#F5A800]" IconEl={PawPrint} title="Resumo da Conta" sub="Visão geral de pets e atendimentos">
          <div className="grid divide-gray-100 sm:grid-cols-2 sm:divide-x">
            <FieldCell label="Pets cadastrados" value={String(petCount)} IconEl={PawPrint} />
            <FieldCell label="Total de atendimentos" value={String(totalAtend)} IconEl={CalendarCheck} />
          </div>
        </SectionCard>

        {/* ── Segurança ──────────────────────────────────── */}
        <SectionCard iconBg="bg-[#fff8e6]" iconCls="text-[#F5A800]" IconEl={Shield} title="Segurança" sub="Gerencie o acesso à sua conta">
          <div className="p-5">
            <button onClick={() => { setShowPwdForm((v) => !v); setPwdError(""); }}
              className="flex w-full items-center gap-3 rounded border border-gray-200 px-4 py-3 transition hover:border-[#1c46f3]/30 hover:bg-gray-50">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#e8eeff]">
                <Key size={15} className="text-[#1c46f3]" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold text-gray-800">Trocar senha</p>
                <p className="text-xs text-gray-400">Atualize sua senha de acesso</p>
              </div>
              <ChevronDown size={15} className={`shrink-0 text-gray-400 transition-transform ${showPwdForm ? "rotate-180" : ""}`} />
            </button>
            {showPwdForm && (
              <form onSubmit={handleChangePassword} className="mt-3 space-y-2.5 rounded border border-gray-200 bg-gray-50 p-4">
                <div className="relative">
                  <input type={showCurPwd ? "text" : "password"} placeholder="Senha atual" value={currentPwd} onChange={(e) => setCurrentPwd(e.target.value)} className={inputCls} />
                  <button type="button" onClick={() => setShowCurPwd((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showCurPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <div className="relative">
                  <input type={showNewPwd ? "text" : "password"} placeholder="Nova senha (mín. 6 caracteres)" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} className={inputCls} />
                  <button type="button" onClick={() => setShowNewPwd((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showNewPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <input type="password" placeholder="Confirmar nova senha" value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} className={inputCls} />
                {pwdError && <p className="text-xs text-red-500">{pwdError}</p>}
                <div className="flex justify-end gap-2 pt-1">
                  <button type="button" onClick={() => setShowPwdForm(false)} className="rounded border border-gray-200 px-4 py-2 text-xs font-medium text-gray-500 hover:bg-white">Cancelar</button>
                  <button type="submit" disabled={pwdSaving}
                    className="flex items-center gap-1.5 rounded bg-[#1c46f3] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#1840e0] disabled:opacity-60">
                    <Lock size={12} /> {pwdSaving ? "Atualizando…" : "Salvar senha"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </SectionCard>

        {/* ── Atividade recente ──────────────────────────── */}
        {recentAtend.length > 0 && (
          <SectionCard iconBg="bg-[#e8eeff]" iconCls="text-[#1c46f3]" IconEl={CalendarCheck} title="Atividade Recente" sub="Seus últimos atendimentos">
            <div className="divide-y divide-gray-100">
              {recentAtend.map((at) => {
                const cfg = STATUS_CFG[at.status] ?? { label: at.status, cls: "bg-gray-50 text-gray-600" };
                return (
                  <div key={at.id} className="flex items-center gap-4 px-5 py-3">
                    <span className="w-14 shrink-0 text-xs text-gray-400">{formatDateShort(at.data_atendimento)}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${cfg.cls}`}>{cfg.label}</span>
                    <span className="ml-auto text-xs font-medium text-gray-600">{formatMoney(at.valor_final)}</span>
                  </div>
                );
              })}
            </div>
          </SectionCard>
        )}

        {/* ── Zona de Perigo ─────────────────────────────── */}
        <div className="overflow-hidden rounded-md border border-red-200 bg-white">
          <div className="flex items-center gap-3 border-b border-red-100 px-5 py-3.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50">
              <AlertTriangle size={15} className="text-red-500" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-red-600">Zona de Perigo</p>
              <p className="text-[11px] text-gray-400">Ações irreversíveis da conta</p>
            </div>
          </div>
          <div className="divide-y divide-gray-100 px-5">
            <div className="flex items-center gap-4 py-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50">
                <LogOut size={15} className="text-red-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">Sair da conta</p>
                <p className="text-xs text-gray-400">Encerrar a sessão atual neste dispositivo</p>
              </div>
              <button onClick={() => setShowLogoutConfirm(true)} className="rounded border border-red-200 px-3 py-1.5 text-xs font-medium text-red-500 transition hover:bg-red-50">
                Sair
              </button>
            </div>
          </div>
        </div>

      </div>

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-md border border-gray-200 bg-white p-6 shadow-xl">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-red-50">
              <LogOut size={18} className="text-red-500" />
            </div>
            <h3 className="text-base font-bold text-gray-900">Sair da conta?</h3>
            <p className="mt-1 text-sm text-gray-500">Você precisará fazer login novamente para acessar o sistema.</p>
            <div className="mt-5 flex gap-3">
              <button onClick={logout} className="flex-1 rounded bg-red-600 py-2 text-sm font-semibold text-white transition hover:bg-red-700">Sim, sair</button>
              <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 rounded border border-gray-200 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
