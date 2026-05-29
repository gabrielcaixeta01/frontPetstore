import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, Store, Phone, Mail, MapPin, FileText,
  Users, Clock, ExternalLink,
} from "lucide-react";
import { getLojaById } from "../../services/lojaService";
import type { Loja } from "../../types/loja";

const BLUE  = "#1A3CB8";
const BORD  = "#E0E0E0";
const MUTED = "#6B6B6B";

function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

function getCargoBadge(cargo: string): string {
  const n = cargo.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  if (/gerente|gestor|diretor|coordenador/.test(n)) return "border-purple-200 bg-purple-50 text-purple-700";
  if (/veterinario|vet|medico|doutor/.test(n))       return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (/tosador|groomer|esteticista|banho/.test(n))   return "border-amber-200 bg-amber-50 text-amber-700";
  if (/atendente|recepcionist/.test(n))              return "border-blue-200 bg-blue-50 text-blue-700";
  return "border-slate-200 bg-slate-50 text-slate-600";
}

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-violet-100 text-violet-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-cyan-100 text-cyan-700",
];

function InfoField({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest" style={{ color: MUTED }}>
        {icon} {label}
      </p>
      <p className="text-sm font-semibold" style={{ color: "#1a1a1a" }}>{value || "—"}</p>
    </div>
  );
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white p-5 shadow-sm" style={{ border: `1px solid ${BORD}`, borderRadius: "8px" }}>
      {children}
    </div>
  );
}

function SectionTitle({ icon, children, badge }: { icon: React.ReactNode; children: React.ReactNode; badge?: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <span style={{ color: BLUE }}>{icon}</span>
      <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: MUTED }}>{children}</h2>
      {badge && <span className="ml-auto">{badge}</span>}
    </div>
  );
}

export default function ClienteLojaPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loja, setLoja]     = useState<Loja | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState("");

  useEffect(() => {
    if (!id) { setError("ID da loja não informado."); setLoading(false); return; }
    getLojaById(Number(id))
      .then(setLoja)
      .catch(() => setError("Erro ao carregar dados da loja."))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">

      {/* Back */}
      <button
        onClick={() => navigate("/lojas")}
        className="mb-6 flex items-center gap-2 text-sm font-medium transition hover:opacity-70"
        style={{ color: BLUE }}
      >
        <ArrowLeft size={15} /> Voltar para lojas
      </button>

      {loading && (
        <div className="p-8 text-center text-sm"
          style={{ border: `1px solid ${BORD}`, borderRadius: "8px", background: "#fff", color: MUTED }}>
          Carregando loja...
        </div>
      )}
      {error && (
        <div className="px-4 py-3 text-sm"
          style={{ borderRadius: "4px", border: "1px solid #FECACA", background: "rgba(254,202,202,0.25)", color: "#DC2626" }}>
          {error}
        </div>
      )}

      {!loading && !error && loja && (
        <div className="space-y-5">

          {/* Hero banner */}
          <div className="overflow-hidden shadow-sm" style={{ borderRadius: "8px", border: `1px solid ${BORD}` }}>
            <div className="px-6 py-5" style={{ background: BLUE }}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center"
                    style={{ background: "rgba(255,255,255,0.15)", borderRadius: "8px" }}>
                    <Store size={22} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.55)" }}>
                      Unidade
                    </p>
                    <p className="text-xl font-extrabold text-white">{loja.nome}</p>
                  </div>
                </div>
                <div className="px-4 py-2.5 text-white"
                  style={{ background: "rgba(255,255,255,0.15)", borderRadius: "6px" }}>
                  <p className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.70)" }}>Equipe</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold">{loja.funcionarios.length}</span>
                    <Users size={13} className="mb-0.5 opacity-70" />
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-3" style={{ background: "#F4F4F4", borderTop: `1px solid ${BORD}` }}>
              <p className="flex items-center gap-1.5 text-sm" style={{ color: MUTED }}>
                <MapPin size={13} className="shrink-0" style={{ color: BLUE }} />
                {loja.street}, {loja.number} — {loja.neighborhood}, {loja.city}/{loja.state}
              </p>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {/* Contato */}
            <SectionCard>
              <SectionTitle icon={<Phone size={15} />}>Contato</SectionTitle>
              <div className="space-y-4">
                <InfoField icon={<Phone size={12} />}    label="Telefone" value={loja.telefone} />
                <InfoField icon={<Mail size={12} />}     label="E-mail"   value={loja.email}    />
                <InfoField icon={<FileText size={12} />} label="CNPJ"     value={loja.cnpj}     />
              </div>
            </SectionCard>

            {/* Endereço */}
            <SectionCard>
              <SectionTitle icon={<MapPin size={15} />}>Endereço</SectionTitle>
              <div className="grid gap-4 sm:grid-cols-2">
                <InfoField icon={<MapPin size={12} />} label="Logradouro" value={`${loja.street}, ${loja.number}`} />
                <InfoField icon={<MapPin size={12} />} label="Bairro"     value={loja.neighborhood}               />
                <InfoField icon={<MapPin size={12} />} label="Cidade/UF"  value={`${loja.city} / ${loja.state}`}  />
                <InfoField icon={<MapPin size={12} />} label="CEP"        value={loja.cep}                        />
              </div>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${loja.street} ${loja.number}, ${loja.neighborhood}, ${loja.city}, ${loja.state}, Brasil`)}`}
                target="_blank" rel="noopener noreferrer"
                className="mt-4 flex items-center gap-2 px-4 py-2 text-sm font-medium transition hover:opacity-80"
                style={{ border: `1px solid rgba(26,60,184,0.25)`, borderRadius: "4px", color: BLUE }}
              >
                <MapPin size={14} /> Ver no Google Maps
                <ExternalLink size={12} className="ml-auto opacity-50" />
              </a>
            </SectionCard>
          </div>

          {/* Horário */}
          <SectionCard>
            <SectionTitle icon={<Clock size={15} />}>Horário de Funcionamento</SectionTitle>
            {loja.horario_funcionamento ? (
              <p className="text-sm" style={{ color: "#374151" }}>{loja.horario_funcionamento}</p>
            ) : (
              <p className="text-sm italic" style={{ color: MUTED }}>Não informado.</p>
            )}
          </SectionCard>

          {/* Equipe — cards compactos para cliente */}
          <SectionCard>
            <SectionTitle
              icon={<Users size={16} />}
              badge={
                <span className="px-2.5 py-0.5 text-xs font-bold"
                  style={{ background: "rgba(26,60,184,0.10)", borderRadius: "20px", color: BLUE }}>
                  {loja.funcionarios.length}
                </span>
              }
            >
              Nossa Equipe
            </SectionTitle>

            {loja.funcionarios.length === 0 ? (
              <p className="text-sm" style={{ color: MUTED }}>Nenhum funcionário vinculado a esta loja.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {loja.funcionarios.map((func, i) => (
                  <div key={`${func.usuario_id}-${func.matricula}`}
                    className="flex items-center gap-3 p-3"
                    style={{ border: `1px solid ${BORD}`, borderRadius: "8px" }}>
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}>
                      {getInitials(func.nome)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold" style={{ color: "#1a1a1a" }}>{func.nome}</p>
                      <span className={`inline-flex items-center border px-2 py-0.5 text-xs font-semibold capitalize ${getCargoBadge(func.cargo)}`}
                        style={{ borderRadius: "20px" }}>
                        {func.cargo}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

        </div>
      )}
    </div>
  );
}
