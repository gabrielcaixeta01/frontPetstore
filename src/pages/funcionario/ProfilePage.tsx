import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User, Mail, Phone, Calendar, Briefcase, Building2,
  CalendarCheck, Shield, LogOut, Key, Lock,
  Eye, EyeOff, ChevronDown, Pencil, Save, X,
  AlertTriangle,
} from "lucide-react";
import { api } from "../../services/api";
import { getUsuarioById } from "../../services/usuarioService";
import { getAppointments } from "../../services/atendimentoService";
import { getLojas } from "../../services/lojaService";
import type { FuncionarioPerfil } from "../../types/usuario";
import type { Atendimento } from "../../types/atendimento";

const TEAL  = "#0D7377";
const TDARK = "#085C60";
const AMBER = "#F59E0B";
const MINT  = "#10B981";
const COAL  = "#1E293B";
const BORD  = "#E2E8F0";
const MUTED = "#64748B";

type UserData = {
  id: number; name: string; email: string; phone?: string;
  role?: string; profile_type?: string; active: boolean; created_at: string;
};

const inputCls = "w-full rounded border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none transition focus:border-[#0D7377] focus:bg-white";

function getInitials(name: string) { return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase(); }
function formatDateLong(d?: string) { if (!d) return "—"; const dt = new Date(d); return Number.isNaN(dt.getTime()) ? d : dt.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" }); }
function formatDateShort(d: string) { return new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }); }
function formatMoney(v: number) { return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v); }
function calcTempoCasa(d?: string): string {
  if (!d) return "—";
  const m = (new Date().getFullYear() - new Date(d).getFullYear()) * 12 + (new Date().getMonth() - new Date(d).getMonth());
  if (m < 1) return "< 1 mês";
  if (m < 12) return `${m} mês${m > 1 ? "es" : ""}`;
  const a = Math.floor(m / 12), r = m % 12;
  return r === 0 ? `${a} ano${a > 1 ? "s" : ""}` : `${a} ano${a > 1 ? "s" : ""} e ${r} mês${r > 1 ? "es" : ""}`;
}

function HeroDecor() {
  return (
    <div className="pointer-events-none absolute inset-0 select-none overflow-hidden" aria-hidden="true">
      <div className="absolute right-8 top-8 h-40 w-40 rounded-full"
        style={{ border: "1.5px solid rgba(255,255,255,0.10)" }} />
      <div className="absolute right-20 top-16 h-64 w-64 rounded-full"
        style={{ border: "1px solid rgba(255,255,255,0.06)" }} />
      <div className="absolute -right-12 -top-12 h-72 w-72 rounded-full"
        style={{ background: "rgba(255,255,255,0.04)" }} />
      <div className="absolute bottom-12 left-8 h-20 w-20 rounded-full"
        style={{ border: "1.5px solid rgba(255,255,255,0.08)" }} />
    </div>
  );
}

function SectionCard({ iconBg, iconCls, IconEl, title, sub, children }: {
  iconBg: string; iconCls: string; IconEl: React.ElementType;
  title: string; sub: string; children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-md border bg-white" style={{ borderColor: BORD }}>
      <div className="flex items-center gap-3 px-5 py-3.5" style={{ borderBottom: `1px solid ${BORD}` }}>
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconBg}`}>
          <IconEl size={15} className={iconCls} />
        </div>
        <div>
          <p className="text-[13px] font-bold" style={{ color: COAL }}>{title}</p>
          <p className="text-[11px]" style={{ color: MUTED }}>{sub}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function FieldCell({ label, value, IconEl }: { label: string; value?: string; IconEl?: React.ElementType }) {
  return (
    <div className="px-5 py-3.5">
      <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: MUTED }}>{label}</p>
      <p className="mt-1.5 flex items-center gap-1.5 text-[13px] font-medium" style={{ color: COAL }}>
        {IconEl && <IconEl size={12} className="shrink-0" style={{ color: TEAL }} />}
        {value || "—"}
      </p>
    </div>
  );
}

const STATUS_CFG: Record<string, { label: string; cls: string }> = {
  concluido: { label: "Concluído", cls: "bg-teal-50 text-teal-700" },
  agendado:  { label: "Agendado",  cls: "bg-amber-50 text-amber-700" },
  cancelado: { label: "Cancelado", cls: "bg-red-50 text-red-600" },
};

export default function FuncionarioProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserData | null>(null);
  const [ep, setEp] = useState<FuncionarioPerfil | null>(null);
  const [lojaName, setLojaName] = useState("");
  const [recentAtend, setRecentAtend] = useState<Atendimento[]>([]);
  const [totalAtend, setTotalAtend] = useState(0);
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");

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
        const userData = await api.get<UserData>("/auth/me").then((r) => r.data);
        setProfile(userData);
        setEditName(userData.name); setEditEmail(userData.email); setEditPhone(userData.phone ?? "");
        const [fullUser, atendData, lojaData] = await Promise.all([
          getUsuarioById(userData.id).catch(() => null),
          getAppointments().catch(() => [] as Atendimento[]),
          getLojas().catch(() => []),
        ]);
        if (fullUser?.employee_profile) {
          setEp(fullUser.employee_profile);
          setLojaName(lojaData.find((l) => l.id === fullUser.employee_profile!.loja_id)?.nome ?? "");
        }
        const my = atendData.filter((a) => a.funcionario_id === userData.id)
          .sort((a, b) => new Date(b.data_atendimento).getTime() - new Date(a.data_atendimento).getTime());
        setTotalAtend(my.length); setRecentAtend(my.slice(0, 5));
      } catch {
        const stored = localStorage.getItem("user");
        if (stored) setProfile(JSON.parse(stored)); else navigate("/login");
      } finally { setLoading(false); }
    }
    init();
  }, [navigate]);

  function logout() { localStorage.removeItem("token"); localStorage.removeItem("user"); navigate("/login"); }

  async function saveProfile() {
    if (!profile) return;
    setSaving(true); setEditError("");
    try {
      const data = await api.put<UserData>(`/user/${profile.id}`, null, { params: { name: editName.trim(), email: editEmail.trim(), phone: editPhone.trim() } }).then((r) => r.data);
      localStorage.setItem("user", JSON.stringify(data));
      setProfile(data); setIsEditing(false);
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

  if (loading) return <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-8 text-sm" style={{ color: MUTED }}>Carregando perfil...</div>;
  if (!profile) return null;

  const initials = getInitials(profile.name);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="space-y-5">

        {/* ── Hero ──────────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-md px-6 py-8 sm:px-8" style={{ background: TEAL }}>
          <HeroDecor />
          <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <div className="relative shrink-0">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-white/30 text-2xl font-extrabold"
                  style={{ background: AMBER, color: COAL }}>
                  {initials}
                </div>
                {profile.active && (
                  <div className="absolute bottom-0.5 right-0.5 h-3.5 w-3.5 rounded-full border-2"
                    style={{ borderColor: TEAL, background: MINT }} />
                )}
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-white/55">Funcionário</p>
                <h1 className="text-2xl font-extrabold leading-tight text-white">{profile.name}</h1>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  {lojaName && (
                    <span className="flex items-center gap-1 text-xs text-white/70">
                      <Building2 size={11} /> {lojaName}
                    </span>
                  )}
                  {ep?.cargo && (
                    <span className="rounded-full border border-white/25 bg-white/15 px-2 py-0.5 text-[11px] text-white">{ep.cargo}</span>
                  )}
                  <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                    profile.active ? "border border-white/25 bg-white/15 text-white" : "bg-red-500/20 text-white"
                  }`}>
                    {profile.active
                      ? <><span className="h-1.5 w-1.5 rounded-full" style={{ background: MINT }} /> Ativo</>
                      : "Inativo"}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-start gap-3 sm:items-end">
              {!isEditing && (
                <button
                  onClick={() => { setEditName(profile.name); setEditEmail(profile.email); setEditPhone(profile.phone ?? ""); setEditError(""); setIsEditing(true); }}
                  className="flex items-center gap-1.5 rounded border border-white/30 bg-white/15 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/25">
                  <Pencil size={12} /> Editar perfil
                </button>
              )}
              <div className="flex gap-2.5">
                <div className="rounded border border-white/15 bg-white/10 px-4 py-2.5">
                  <p className="text-[10px] uppercase tracking-wide text-white/65">Atendimentos</p>
                  <p className="mt-0.5 text-xl font-extrabold leading-none" style={{ color: AMBER }}>{totalAtend}</p>
                </div>
                <div className="rounded border border-white/15 bg-white/10 px-4 py-2.5">
                  <p className="text-[10px] uppercase tracking-wide text-white/65">Tempo de casa</p>
                  <p className="mt-0.5 text-base font-extrabold leading-none" style={{ color: AMBER }}>{calcTempoCasa(ep?.data_contratacao)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {editError && (
          <div className="rounded border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600">{editError}</div>
        )}

        {/* ── Dados Pessoais ─────────────────────────────── */}
        <SectionCard iconBg="bg-[#e6f5f5]" iconCls="text-[#0D7377]" IconEl={User} title="Dados Pessoais" sub="Informações cadastrais do funcionário">
          {isEditing ? (
            <div className="p-5 space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-medium" style={{ color: MUTED }}>Nome completo</label>
                  <input className={inputCls} value={editName} onChange={(e) => setEditName(e.target.value)} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium" style={{ color: MUTED }}>E-mail</label>
                  <input type="email" className={inputCls} value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium" style={{ color: MUTED }}>Telefone</label>
                  <input className={inputCls} value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <button onClick={saveProfile} disabled={saving}
                  className="flex items-center gap-2 rounded px-5 py-2 text-sm font-semibold text-white transition disabled:opacity-60"
                  style={{ background: TEAL }}
                  onMouseEnter={(e) => { if (!saving) (e.currentTarget as HTMLButtonElement).style.background = TDARK; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = TEAL; }}>
                  <Save size={13} /> {saving ? "Salvando…" : "Salvar"}
                </button>
                <button onClick={() => setIsEditing(false)}
                  className="flex items-center gap-2 rounded border border-gray-200 px-5 py-2 text-sm transition hover:bg-gray-50"
                  style={{ color: MUTED }}>
                  <X size={13} /> Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              <div className="grid sm:grid-cols-3 sm:divide-x divide-gray-100">
                <FieldCell label="Nome completo" value={profile.name} IconEl={User} />
                <FieldCell label="E-mail" value={profile.email} IconEl={Mail} />
                <FieldCell label="Telefone" value={profile.phone || "—"} IconEl={Phone} />
              </div>
              <div className="grid sm:grid-cols-3 sm:divide-x divide-gray-100">
                <FieldCell label="Membro desde" value={formatDateLong(profile.created_at)} IconEl={Calendar} />
                <FieldCell label="Cargo" value={ep?.cargo} IconEl={Briefcase} />
                <FieldCell label="Contratado em" value={formatDateLong(ep?.data_contratacao)} IconEl={CalendarCheck} />
              </div>
            </div>
          )}
        </SectionCard>

        {/* ── Loja Vinculada ─────────────────────────────── */}
        {lojaName && (
          <SectionCard iconBg="bg-[#e6f5f0]" iconCls="text-[#10B981]" IconEl={Building2} title="Loja Vinculada" sub="Unidade de trabalho do funcionário">
            <div className="grid sm:grid-cols-3 sm:divide-x divide-gray-100">
              <FieldCell label="Nome da loja" value={lojaName} IconEl={Building2} />
              <div className="px-5 py-3.5">
                <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: MUTED }}>Status</p>
                <p className="mt-1.5">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-[#10B981]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" /> Ativo
                  </span>
                </p>
              </div>
              <FieldCell label="Função" value={ep?.cargo} IconEl={Briefcase} />
            </div>
          </SectionCard>
        )}

        {/* ── Segurança ──────────────────────────────────── */}
        <SectionCard iconBg="bg-amber-50" iconCls="text-[#F59E0B]" IconEl={Shield} title="Segurança" sub="Gerencie o acesso à sua conta">
          <div className="p-5">
            <button
              onClick={() => { setShowPwdForm((v) => !v); setPwdError(""); }}
              className="flex w-full items-center gap-3 rounded border px-4 py-3 transition hover:bg-gray-50"
              style={{ borderColor: BORD }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = `${TEAL}4D`; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = BORD; }}>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#e6f5f5]">
                <Key size={15} style={{ color: TEAL }} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-semibold" style={{ color: COAL }}>Trocar senha</p>
                <p className="text-xs" style={{ color: MUTED }}>Atualize sua senha de acesso</p>
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
                  <button type="button" onClick={() => setShowPwdForm(false)}
                    className="rounded border border-gray-200 px-4 py-2 text-xs font-medium hover:bg-white" style={{ color: MUTED }}>
                    Cancelar
                  </button>
                  <button type="submit" disabled={pwdSaving}
                    className="flex items-center gap-1.5 rounded px-4 py-2 text-xs font-semibold text-white transition disabled:opacity-60"
                    style={{ background: TEAL }}
                    onMouseEnter={(e) => { if (!pwdSaving) (e.currentTarget as HTMLButtonElement).style.background = TDARK; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = TEAL; }}>
                    <Lock size={12} /> {pwdSaving ? "Atualizando…" : "Salvar senha"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </SectionCard>

        {/* ── Atividade recente ──────────────────────────── */}
        {recentAtend.length > 0 && (
          <SectionCard iconBg="bg-[#e6f5f5]" iconCls="text-[#0D7377]" IconEl={CalendarCheck} title="Atividade Recente" sub="Últimos atendimentos realizados">
            <div className="divide-y divide-gray-100">
              {recentAtend.map((at) => {
                const cfg = STATUS_CFG[at.status] ?? { label: at.status, cls: "bg-gray-50 text-gray-600" };
                return (
                  <div key={at.id} className="flex items-center gap-4 px-5 py-3">
                    <span className="w-14 shrink-0 text-xs" style={{ color: MUTED }}>{formatDateShort(at.data_atendimento)}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${cfg.cls}`}>{cfg.label}</span>
                    <span className="ml-auto text-xs font-medium" style={{ color: COAL }}>{formatMoney(at.valor_final)}</span>
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
              <p className="text-[11px]" style={{ color: MUTED }}>Ações irreversíveis da conta</p>
            </div>
          </div>
          <div className="divide-y divide-gray-100 px-5">
            <div className="flex items-center gap-4 py-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50">
                <LogOut size={15} className="text-red-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold" style={{ color: COAL }}>Sair da conta</p>
                <p className="text-xs" style={{ color: MUTED }}>Encerrar a sessão atual neste dispositivo</p>
              </div>
              <button onClick={() => setShowLogoutConfirm(true)}
                className="rounded border border-red-200 px-3 py-1.5 text-xs font-medium text-red-500 transition hover:bg-red-50">
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
            <h3 className="text-base font-bold" style={{ color: COAL }}>Sair da conta?</h3>
            <p className="mt-1 text-sm" style={{ color: MUTED }}>Você precisará fazer login novamente para acessar o sistema.</p>
            <div className="mt-5 flex gap-3">
              <button onClick={logout} className="flex-1 rounded bg-red-600 py-2 text-sm font-semibold text-white transition hover:bg-red-700">Sim, sair</button>
              <button onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 rounded border border-gray-200 py-2 text-sm font-medium transition hover:bg-gray-50" style={{ color: MUTED }}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
