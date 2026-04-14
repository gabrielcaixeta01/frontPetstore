import { useEffect, useState } from "react";
import EditOrderForm from "../components/order/EditOrderForm";
import OrderForm from "../components/order/OrderForm";
import OrderList from "../components/order/OrderList";
import { apexTheme } from "../lib/theme";
import {
  createAppointment,
  deleteAppointment,
  getAppointments,
  updateAppointment,
} from "../services/atendimentoService";
import type { Appointment, CreateAppointmentDTO, UpdateAppointmentDTO } from "../types/atendimento";

export default function OrdersPage() {
  const c = apexTheme.colors;
  const [orders, setOrders] = useState<Appointment[]>([]);
  const [orderBeingEdited, setOrderBeingEdited] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  async function loadOrders() {
    try {
      setLoading(true);
      const data = await getAppointments();
      setOrders(data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Erro ao carregar pedidos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  async function handleCreateOrder(data: CreateAppointmentDTO) {
    try {
      await createAppointment(data);
      setFeedback("Pedido cadastrado com sucesso.");
      setOrderBeingEdited(null);
      await loadOrders();
    } catch (err) {
      console.error(err);
      setError("Erro ao cadastrar pedido.");
    }
  }

  async function handleUpdateOrder(id: number, data: UpdateAppointmentDTO) {
    try {
      await updateAppointment(id, data);
      setFeedback("Pedido atualizado com sucesso.");
      setOrderBeingEdited(null);
      await loadOrders();
    } catch (err) {
      console.error(err);
      setError("Erro ao atualizar pedido.");
    }
  }

  async function handleDeleteOrder(id: number) {
    if (!window.confirm("Tem certeza que deseja excluir este pedido?")) return;

    try {
      await deleteAppointment(id);
      setFeedback("Pedido excluído com sucesso.");
      if (orderBeingEdited?.id === id) setOrderBeingEdited(null);
      await loadOrders();
    } catch (err) {
      console.error(err);
      setError("Erro ao excluir pedido.");
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

        <OrderForm
          orderBeingEdited={null}
          onCreate={handleCreateOrder}
          onUpdate={handleUpdateOrder}
          onCancelEdit={() => setOrderBeingEdited(null)}
        />

        {orderBeingEdited && (
          <EditOrderForm
            order={orderBeingEdited}
            onUpdate={handleUpdateOrder}
            onCancel={() => setOrderBeingEdited(null)}
          />
        )}

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Lista de atendimentos</h2>
            <button
              onClick={loadOrders}
              className={`rounded-2xl px-4 py-2 font-medium transition ${c.outlineButton}`}
            >
              Atualizar
            </button>
          </div>

          {loading ? (
            <div className={`rounded-2xl border ${c.border} ${c.card} p-6 ${c.textSoft}`}>
              Carregando pedidos...
            </div>
          ) : (
            <OrderList
              orders={orders}
              onEdit={setOrderBeingEdited}
              onDelete={handleDeleteOrder}
            />
          )}
        </section>
      </div>
    </div>
  );
}