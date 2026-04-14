import { useEffect, useState } from "react";
import EditModal from "../components/EditModal";
import AppointmentForm from "../components/appointment/AppointmentForm";
import AppointmentList from "../components/appointment/AppointmentList";
import EditAppointmentForm from "../components/appointment/EditAppointmentForm";
import { apexTheme } from "../lib/theme";
import { getLojas } from "../services/lojaService";
import {
  createAppointment,
  deleteAppointment,
  getAppointments,
  updateAppointment,
} from "../services/atendimentoService";
import { getUsuarios } from "../services/usuarioService";
import type { Appointment, CreateAppointmentDTO, UpdateAppointmentDTO } from "../types/atendimento";

export default function AppointmentsPage() {
  const c = apexTheme.colors;
  const [atendimentos, setAtendimentos] = useState<Appointment[]>([]);
  const [atendimentoBeingEdited, setAtendimentoBeingEdited] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [lojasById, setLojasById] = useState<Record<number, string>>({});
  const [clientesById, setClientesById] = useState<Record<number, string>>({});
  const [funcionariosById, setFuncionariosById] = useState<Record<number, string>>({});

  async function loadAtendimentos() {
    try {
      setLoading(true);
      const data = await getAppointments();
      setAtendimentos(data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Erro ao carregar atendimentos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAtendimentos();
  }, []);

  useEffect(() => {
    async function loadRelacionamentos() {
      try {
        const [lojas, usuarios] = await Promise.all([getLojas(), getUsuarios()]);

        const lojasMap: Record<number, string> = {};
        lojas.forEach((loja) => {
          lojasMap[loja.id] = loja.nome;
        });

        const clientesMap: Record<number, string> = {};
        const funcionariosMap: Record<number, string> = {};
        usuarios.forEach((usuario) => {
          if (usuario.tipo_perfil === "cliente") {
            clientesMap[usuario.id] = usuario.nome;
          }
          if (usuario.tipo_perfil === "funcionario") {
            funcionariosMap[usuario.id] = usuario.nome;
          }
        });

        setLojasById(lojasMap);
        setClientesById(clientesMap);
        setFuncionariosById(funcionariosMap);
      } catch (err) {
        console.error("Erro ao carregar relacionamentos de atendimento:", err);
      }
    }

    loadRelacionamentos();
  }, []);

  async function handleCreateAtendimento(data: CreateAppointmentDTO) {
    try {
      await createAppointment(data);
      setFeedback("Atendimento cadastrado com sucesso.");
      setAtendimentoBeingEdited(null);
      await loadAtendimentos();
    } catch (err) {
      console.error(err);
      setError("Erro ao cadastrar atendimento.");
    }
  }

  async function handleUpdateAtendimento(id: number, data: UpdateAppointmentDTO) {
    try {
      await updateAppointment(id, data);
      setFeedback("Atendimento atualizado com sucesso.");
      setAtendimentoBeingEdited(null);
      await loadAtendimentos();
    } catch (err) {
      console.error(err);
      setError("Erro ao atualizar atendimento.");
    }
  }

  async function handleDeleteAtendimento(id: number) {
    if (!window.confirm("Tem certeza que deseja excluir este atendimento?")) return;

    try {
      await deleteAppointment(id);
      setFeedback("Atendimento excluído com sucesso.");
      if (atendimentoBeingEdited?.id === id) setAtendimentoBeingEdited(null);
      await loadAtendimentos();
    } catch (err) {
      console.error(err);
      setError("Erro ao excluir atendimento.");
    }
  }

  return (
    <div className={`min-h-screen ${c.bg} px-4 py-10 ${c.text}`}>
      <div className="mx-auto max-w-6xl space-y-8">
        <header className={`rounded-3xl border ${c.border} ${c.card} p-8`}>
          <p className={`text-sm ${c.textMuted}`}>Módulo</p>
          <h1 className="mt-2 text-4xl font-bold">Atendimentos</h1>
          <p className={`mt-3 ${c.textSoft}`}>
            Controle atendimentos, pagamento, status e vínculos com loja, cliente e funcionário.
          </p>
        </header>

        {feedback && (
          <div className="rounded-2xl border border-emerald-800 bg-emerald-950 px-4 py-3 text-emerald-300">
            {feedback}
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-800 bg-red-950 px-4 py-3 text-red-300">
            {error}
          </div>
        )}

        <AppointmentForm
          appointmentBeingEdited={null}
          onCreate={handleCreateAtendimento}
          onUpdate={handleUpdateAtendimento}
          onCancelEdit={() => setAtendimentoBeingEdited(null)}
        />

        <EditModal
          isOpen={Boolean(atendimentoBeingEdited)}
          title="Editar Atendimento"
          onClose={() => setAtendimentoBeingEdited(null)}
        >
          {atendimentoBeingEdited && (
            <EditAppointmentForm
              appointment={atendimentoBeingEdited}
              onUpdate={handleUpdateAtendimento}
              onCancel={() => setAtendimentoBeingEdited(null)}
            />
          )}
        </EditModal>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Lista de atendimentos</h2>
            <button
              onClick={loadAtendimentos}
              className={`rounded-2xl px-4 py-2 font-medium transition ${c.outlineButton}`}
            >
              Atualizar
            </button>
          </div>

          {loading ? (
            <div className={`rounded-2xl border ${c.border} ${c.card} p-6 ${c.textSoft}`}>
              Carregando atendimentos...
            </div>
          ) : (
            <AppointmentList
              appointments={atendimentos}
              onEdit={setAtendimentoBeingEdited}
              onDelete={handleDeleteAtendimento}
              lojasById={lojasById}
              clientesById={clientesById}
              funcionariosById={funcionariosById}
            />
          )}
        </section>
      </div>
    </div>
  );
}