import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User, Mail, Phone, Lock, Eye, EyeOff,
  ArrowRight, CreditCard, Store, Shield, ShieldOff,
  LayoutDashboard, Users, Briefcase, Hash, Banknote, Calendar,
  PawPrint, ChevronLeft,
} from "lucide-react";
import { api } from "../services/api";
import { getLojas } from "../services/lojaService";
import type { Loja } from "../types/loja";

const TEAL  = "#0D7377";
const TDARK = "#085C60";
const AMBER = "#F59E0B";
const COAL  = "#1E293B";
const BG    = "#F8FAFC";
const BORD  = "#E2E8F0";
const MUTED = "#64748B";

const features = [
  { icon: LayoutDashboard, text: "Acesse o painel de gestão da loja" },
  { icon: Users,           text: "Gerencie clientes, pets e atendimentos" },
  { icon: Briefcase,       text: "Controle serviços e categorias" },
];

function maskCPF(v: string) {
  return v.replace(/\D/g, "").slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

const inputBase: React.CSSProperties = {
  display: "block",
  width: "100%",
  padding: "10px 16px 10px 40px",
  fontSize: "14px",
  border: `1px solid ${BORD}`,
  borderRadius: "6px",
  background: "#FFFFFF",
  outline: "none",
  transition: "border-color 0.15s, box-shadow 0.15s",
};

function focusStyle(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
  e.target.style.borderColor = TEAL;
  e.target.style.boxShadow   = "0 0 0 3px rgba(13,115,119,0.12)";
}
function blurStyle(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
  e.target.style.borderColor = BORD;
  e.target.style.boxShadow   = "none";
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium" style={{ color: COAL }}>{label}</label>
      {children}
    </div>
  );
}

function PanelDecor() {
  return (
    <div className="pointer-events-none absolute inset-0 select-none overflow-hidden">
      <div className="absolute right-8 top-8 h-40 w-40 rounded-full"
        style={{ border: "1.5px solid rgba(255,255,255,0.10)" }} />
      <div className="absolute right-20 top-16 h-64 w-64 rounded-full"
        style={{ border: "1px solid rgba(255,255,255,0.06)" }} />
      <div className="absolute -right-12 -top-12 h-72 w-72 rounded-full"
        style={{ background: "rgba(255,255,255,0.04)" }} />
      <div className="absolute bottom-12 left-8 h-20 w-20 rounded-full"
        style={{ border: "1.5px solid rgba(255,255,255,0.08)" }} />
      <div className="absolute bottom-24 left-24 h-8 w-8 rounded-full"
        style={{ background: "rgba(255,255,255,0.06)" }} />
    </div>
  );
}

export default function RegisterFuncionarioPage() {
  const navigate = useNavigate();

  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [phone, setPhone]       = useState("");
  const [cpf, setCpf]           = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSuperuser, setIsSuperuser]   = useState(false);
  const [storeId, setStoreId]           = useState<number | "">("");
  const [employeeCode, setEmployeeCode] = useState("");
  const [jobTitle, setJobTitle]         = useState("");
  const [salary, setSalary]             = useState("");
  const [hiredAt, setHiredAt]           = useState("");

  const [lojas, setLojas]               = useState<Loja[]>([]);
  const [loadingLojas, setLoadingLojas] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");

  useEffect(() => {
    if (isSuperuser) return;
    setLoadingLojas(true);
    getLojas()
      .then(setLojas)
      .catch(() => setLojas([]))
      .finally(() => setLoadingLojas(false));
  }, [isSuperuser]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!isSuperuser && !storeId) {
      setError("Selecione a loja do funcionário.");
      return;
    }

    setLoading(true);
    try {
      const payload: Record<string, any> = {
        name, email, phone, password,
        profile_type: "funcionario",
        cpf,
        is_superuser: isSuperuser,
      };
      if (!isSuperuser) {
        payload.store_id      = storeId;
        payload.employee_code = employeeCode;
        payload.job_title     = jobTitle;
        payload.salary        = salary ? Number(salary) : undefined;
        payload.hired_at      = hiredAt || undefined;
      }

      const data = await api.post("/auth/register", payload).then((r) => r.data);
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/");
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setError(
        Array.isArray(detail) ? detail.map((d: any) => d?.msg ?? String(d)).join(", ")
        : typeof detail === "string" ? detail
        : err?.message || "Erro ao criar conta.",
      );
    } finally {
      setLoading(false);
    }
  }

  const roleBtn = (active: boolean): React.CSSProperties => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    padding: "10px 0",
    fontSize: "14px",
    fontWeight: 500,
    borderRadius: "6px",
    transition: "all 0.15s",
    border: active ? `1.5px solid ${TEAL}` : `1px solid ${BORD}`,
    background: active ? "rgba(13,115,119,0.08)" : "#FFFFFF",
    color: active ? TEAL : MUTED,
    cursor: "pointer",
    width: "100%",
  });

  return (
    <main className="flex min-h-screen">
      {/* ── Left panel ── */}
      <div
        className="relative hidden lg:flex lg:w-[460px] flex-col justify-between overflow-hidden p-12 text-white lg:pt-20"
        style={{ background: TDARK }}
      >
        <PanelDecor />

        <div className="relative flex items-center gap-2">
          <PawPrint size={22} style={{ color: AMBER }} />
          <span className="text-xl font-black tracking-tight">Pet Club</span>
        </div>

        <div className="relative space-y-6">
          <div>
            <span className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-widest"
              style={{ background: AMBER, color: TDARK, borderRadius: "999px" }}>
              Acesso interno
            </span>
            <h1 className="mt-5 text-4xl font-black leading-tight">
              Área de<br />funcionários.
            </h1>
            <p className="mt-4 text-base" style={{ color: "rgba(255,255,255,0.75)" }}>
              Crie sua conta de funcionário e acesse as ferramentas de gestão do petshop.
            </p>
          </div>
          <ul className="space-y-4">
            {features.map((f) => (
              <li key={f.text} className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center"
                  style={{ background: "rgba(255,255,255,0.15)", borderRadius: "8px" }}>
                  <f.icon size={15} />
                </div>
                <span className="text-sm" style={{ color: "rgba(255,255,255,0.88)" }}>{f.text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative pt-6 text-sm" style={{ borderTop: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.55)" }}>
          Já tem uma conta?{" "}
          <Link to="/login" className="font-semibold text-white transition hover:opacity-75">
            Entrar
          </Link>
        </div>
      </div>

      {/* ── Right panel (form) ── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12" style={{ background: BG }}>
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <PawPrint size={20} style={{ color: TEAL }} />
            <span className="text-lg font-black tracking-tight" style={{ color: COAL }}>Pet Club</span>
          </div>

          <div className="mb-6">
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="mb-4 flex items-center gap-1.5 text-sm transition hover:opacity-70"
              style={{ color: MUTED }}
            >
              <ChevronLeft size={15} /> Voltar
            </button>
            <h2 className="text-2xl font-bold" style={{ color: COAL }}>Cadastro de funcionário</h2>
            <p className="mt-1 text-sm" style={{ color: MUTED }}>Preencha os dados para criar a conta.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Nível de acesso">
              <div className="grid grid-cols-2 gap-2">
                <button type="button" style={roleBtn(!isSuperuser)}
                  onClick={() => setIsSuperuser(false)}>
                  <ShieldOff size={15} /> Funcionário
                </button>
                <button type="button" style={roleBtn(isSuperuser)}
                  onClick={() => { setIsSuperuser(true); setStoreId(""); setEmployeeCode(""); setJobTitle(""); setSalary(""); setHiredAt(""); }}>
                  <Shield size={15} /> Super usuário
                </button>
              </div>
              <p className="text-xs mt-1" style={{ color: MUTED }}>
                {isSuperuser
                  ? "Acesso administrativo completo a todas as lojas."
                  : "Acesso restrito à loja vinculada."}
              </p>
            </Field>

            <Field label="Nome completo">
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: MUTED }} />
                <input
                  type="text" required autoComplete="name"
                  placeholder="Seu nome completo"
                  value={name} onChange={(e) => setName(e.target.value)}
                  style={inputBase} onFocus={focusStyle} onBlur={blurStyle}
                />
              </div>
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="E-mail">
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: MUTED }} />
                  <input
                    type="email" required autoComplete="email"
                    placeholder="seuemail@exemplo.com"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    style={inputBase} onFocus={focusStyle} onBlur={blurStyle}
                  />
                </div>
              </Field>
              <Field label="Telefone">
                <div className="relative">
                  <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: MUTED }} />
                  <input
                    type="tel" required autoComplete="tel"
                    placeholder="(61) 99999-9999"
                    value={phone} onChange={(e) => setPhone(e.target.value)}
                    style={inputBase} onFocus={focusStyle} onBlur={blurStyle}
                  />
                </div>
              </Field>
            </div>

            <Field label="CPF">
              <div className="relative">
                <CreditCard size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: MUTED }} />
                <input
                  type="text" required placeholder="000.000.000-00"
                  value={cpf} onChange={(e) => setCpf(maskCPF(e.target.value))}
                  style={inputBase} onFocus={focusStyle} onBlur={blurStyle}
                />
              </div>
            </Field>

            {!isSuperuser && (
              <>
                <Field label="Loja">
                  <div className="relative">
                    <Store size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: MUTED }} />
                    <select
                      required
                      value={storeId}
                      onChange={(e) => setStoreId(e.target.value ? Number(e.target.value) : "")}
                      style={{ ...inputBase, appearance: "none" as const }}
                      onFocus={focusStyle as any} onBlur={blurStyle as any}
                      disabled={loadingLojas}
                    >
                      <option value="">
                        {loadingLojas ? "Carregando lojas..." : "Selecione uma loja"}
                      </option>
                      {lojas.map((loja) => (
                        <option key={loja.id} value={loja.id}>{loja.nome}</option>
                      ))}
                    </select>
                  </div>
                  {!loadingLojas && lojas.length === 0 && (
                    <p className="text-xs" style={{ color: "#DC2626" }}>
                      Nenhuma loja encontrada. Verifique se o servidor está acessível.
                    </p>
                  )}
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Matrícula">
                    <div className="relative">
                      <Hash size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: MUTED }} />
                      <input
                        type="text" required placeholder="EMP001"
                        value={employeeCode} onChange={(e) => setEmployeeCode(e.target.value)}
                        style={inputBase} onFocus={focusStyle} onBlur={blurStyle}
                      />
                    </div>
                  </Field>
                  <Field label="Cargo">
                    <div className="relative">
                      <Briefcase size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: MUTED }} />
                      <input
                        type="text" required placeholder="Veterinário"
                        value={jobTitle} onChange={(e) => setJobTitle(e.target.value)}
                        style={inputBase} onFocus={focusStyle} onBlur={blurStyle}
                      />
                    </div>
                  </Field>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Salário (R$)">
                    <div className="relative">
                      <Banknote size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: MUTED }} />
                      <input
                        type="number" required min="0" step="0.01" placeholder="2500.00"
                        value={salary} onChange={(e) => setSalary(e.target.value)}
                        style={inputBase} onFocus={focusStyle} onBlur={blurStyle}
                      />
                    </div>
                  </Field>
                  <Field label="Data de contratação">
                    <div className="relative">
                      <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: MUTED }} />
                      <input
                        type="date" required
                        value={hiredAt} onChange={(e) => setHiredAt(e.target.value)}
                        style={inputBase} onFocus={focusStyle} onBlur={blurStyle}
                      />
                    </div>
                  </Field>
                </div>
              </>
            )}

            <Field label="Senha">
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: MUTED }} />
                <input
                  type={showPassword ? "text" : "password"}
                  required minLength={6} autoComplete="new-password"
                  placeholder="Mínimo 6 caracteres"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  style={{ ...inputBase, paddingRight: "44px" }}
                  onFocus={focusStyle} onBlur={blurStyle}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition hover:opacity-70"
                  style={{ color: MUTED }} tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </Field>

            {error && (
              <div className="px-4 py-3 text-sm"
                style={{ borderRadius: "6px", border: "1px solid #FECACA", background: "rgba(254,202,202,0.3)", color: "#DC2626" }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || loadingLojas}
              className="flex w-full items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
              style={{ background: TEAL, borderRadius: "6px" }}
              onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = TDARK; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = TEAL; }}
            >
              {loading ? "Criando conta..." : <><span>Criar conta</span><ArrowRight size={15} /></>}
            </button>
          </form>

          <p className="mt-6 text-center text-sm lg:hidden" style={{ color: MUTED }}>
            Já tem conta?{" "}
            <Link to="/login" className="font-semibold hover:underline" style={{ color: TEAL }}>
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
