import { useEffect, useState } from "react";
import { Plus, X, RefreshCw, Users } from "lucide-react";
import EditModal from "../../components/EditModal";
import EditUserForm from "../../components/user/EditUserForm";
import UserForm from "../../components/user/UserForm";
import UserList from "../../components/user/UserList";
import { createUsuario, deleteUsuario, getUsuarios, updateUsuario } from "../../services/usuarioService";
import { getPets } from "../../services/petService";
import { getLojas } from "../../services/lojaService";
import { getAppointments } from "../../services/atendimentoService";
import type { CreateUsuarioDTO, UpdateUsuarioDTO, Usuario } from "../../types/usuario";
import type { Pet } from "../../types/pet";
import type { Loja } from "../../types/loja";

const TEAL  = "#0D7377";
const AMBER = "#F59E0B";
const BORD  = "#E2E8F0";
const MUTED = "#64748B";
const COAL  = "#1E293B";

function HeroDecor() {
  return (
    <>
      <div className="absolute -right-8 -top-8 h-44 w-44 rounded-full bg-white/10" />
      <div className="absolute -bottom-6 right-28 h-28 w-28 rounded-full bg-white/10" />
      <div className="absolute right-16 top-6 h-16 w-16 rounded-full bg-white/10" />
    </>
  );
}

export default function UsersPage() {
  const [users, setUsers]                     = useState<Usuario[]>([]);
  const [petsByUser, setPetsByUser]           = useState<Record<number, Pet[]>>({});
  const [lojas, setLojas]                     = useState<Loja[]>([]);
  const [lojaById, setLojaById]               = useState<Record<number, string>>({});
  const [gastoByUser, setGastoByUser]         = useState<Record<number, number>>({});
  const [userBeingEdited, setUserBeingEdited] = useState<Usuario | null>(null);
  const [loading, setLoading]                 = useState(true);
  const [showForm, setShowForm]               = useState(false);
  const [feedback, setFeedback]               = useState("");
  const [error, setError]                     = useState("");

  async function loadAll() {
    try {
      setLoading(true);
      const [userData, petData, lojaData, atendData] = await Promise.all([
        getUsuarios(),
        getPets().catch(() => [] as Pet[]),
        getLojas().catch(() => []),
        getAppointments().catch(() => []),
      ]);
      setUsers(userData);

      const petMap: Record<number, Pet[]> = {};
      petData.forEach((p) => { if (!petMap[p.dono_id]) petMap[p.dono_id] = []; petMap[p.dono_id].push(p); });
      setPetsByUser(petMap);

      setLojas(lojaData);
      const lojaMap: Record<number, string> = {};
      lojaData.forEach((l) => { lojaMap[l.id] = l.nome; });
      setLojaById(lojaMap);

      const gastoMap: Record<number, number> = {};
      atendData.forEach((at) => {
        if (at.status === "concluido") {
          gastoMap[at.cliente_id] = (gastoMap[at.cliente_id] ?? 0) + (Number(at.valor_final) || 0);
        }
      });
      setGastoByUser(gastoMap);
      setError("");
    } catch {
      setError("Erro ao carregar usuários.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadAll(); }, []);

  function extractApiError(err: unknown, fallback: string): string {
    const detail = (err as { response?: { data?: { detail?: unknown } } })?.response?.data?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) return detail.map((d: { msg?: string }) => d.msg ?? String(d)).join(" · ");
    return fallback;
  }

  async function handleCreateUser(data: CreateUsuarioDTO) {
    try {
      await createUsuario(data);
      setFeedback("Usuário cadastrado com sucesso.");
      setShowForm(false);
      await loadAll();
    } catch (err) {
      setError(extractApiError(err, "Erro ao cadastrar usuário. Verifique os dados e tente novamente."));
    }
  }

  async function handleUpdateUser(id: number, data: UpdateUsuarioDTO) {
    try {
      await updateUsuario(id, data);
      setFeedback("Usuário atualizado com sucesso.");
      setUserBeingEdited(null);
      await loadAll();
    } catch (err) {
      setError(extractApiError(err, "Erro ao atualizar usuário."));
    }
  }

  async function handleDeleteUser(id: number) {
    if (!window.confirm("Tem certeza que deseja excluir este usuário?")) return;
    try {
      await deleteUsuario(id);
      setFeedback("Usuário excluído com sucesso.");
      if (userBeingEdited?.id === id) setUserBeingEdited(null);
      await loadAll();
    } catch (err) {
      setError(extractApiError(err, "Erro ao excluir usuário."));
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">

      {/* Hero */}
      <div className="relative mb-5 overflow-hidden px-8 py-9" style={{ background: TEAL, borderRadius: "10px" }}>
        <HeroDecor />
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="mb-1.5 text-xs font-bold uppercase tracking-widest" style={{ color: AMBER }}>Gerenciamento</p>
            <div className="flex items-center gap-2">
              <Users size={22} className="text-white/80" />
              <h1 className="text-2xl font-extrabold text-white">Usuários</h1>
            </div>
            <p className="mt-0.5 text-sm text-white/70">Gerencie clientes e funcionários do sistema.</p>
          </div>
          <button onClick={() => { setShowForm((v) => !v); setError(""); }}
            className="flex shrink-0 items-center gap-2 px-4 py-2 text-sm font-bold transition"
            style={{ background: showForm ? "rgba(255,255,255,0.15)" : AMBER, color: showForm ? "#fff" : COAL, borderRadius: "6px" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "0.9"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}>
            {showForm ? <><X size={14} /> Cancelar</> : <><Plus size={14} /> Novo usuário</>}
          </button>
        </div>

        {!loading && users.length > 0 && (
          <div className="relative z-10 mt-6 flex flex-wrap gap-3">
            {[
              { label: "Total",       value: users.length },
              { label: "Clientes",    value: users.filter((u) => u.tipo_perfil === "cliente").length },
              { label: "Funcionários",value: users.filter((u) => u.tipo_perfil === "funcionario").length },
            ].map(({ label, value }) => (
              <div key={label} className="px-4 py-2.5" style={{ background: "rgba(255,255,255,0.12)", borderRadius: "8px" }}>
                <div className="text-lg font-extrabold text-white leading-none">{value}</div>
                <div className="text-[10px] text-white/60">{label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {feedback && (
        <div className="mb-4 px-4 py-2.5 text-sm" style={{ borderRadius: "6px", border: "1px solid #A7F3D0", background: "rgba(167,243,208,0.25)", color: "#065F46" }}>
          {feedback}
        </div>
      )}
      {error && (
        <div className="mb-4 px-4 py-2.5 text-sm" style={{ borderRadius: "6px", border: "1px solid #FECACA", background: "rgba(254,202,202,0.25)", color: "#DC2626" }}>
          {error}
        </div>
      )}

      {showForm && (
        <div className="mb-5">
          <UserForm
            userBeingEdited={null}
            onCreate={handleCreateUser}
            onUpdate={handleUpdateUser}
            onCancelEdit={() => { setUserBeingEdited(null); setShowForm(false); }}
            lojas={lojas}
          />
        </div>
      )}

      <EditModal isOpen={Boolean(userBeingEdited)} title="Editar Usuário" onClose={() => setUserBeingEdited(null)}>
        {userBeingEdited && (
          <EditUserForm user={userBeingEdited} onUpdate={handleUpdateUser} onCancel={() => setUserBeingEdited(null)} />
        )}
      </EditModal>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold" style={{ color: COAL }}>
            Base de usuários {!loading && <span className="font-normal" style={{ color: MUTED }}>({users.length})</span>}
          </h2>
          <button onClick={loadAll}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium transition hover:bg-gray-50"
            style={{ border: `1px solid ${BORD}`, borderRadius: "6px", color: MUTED }}>
            <RefreshCw size={12} /> Atualizar
          </button>
        </div>

        {loading ? (
          <div className="p-6 text-center text-sm"
            style={{ border: `1px solid ${BORD}`, borderRadius: "10px", background: "#fff", color: MUTED }}>
            Carregando usuários...
          </div>
        ) : (
          <UserList
            users={users}
            onEdit={setUserBeingEdited}
            onDelete={handleDeleteUser}
            petsByUser={petsByUser}
            lojaById={lojaById}
            gastoByUser={gastoByUser}
          />
        )}
      </section>
    </div>
  );
}
