import type { Order } from "../types/order";

interface OrderListProps {
  orders: Order[];
  onEdit: (order: Order) => void;
  onDelete: (id: number) => Promise<void>;
}

export default function OrderList({ orders, onEdit, onDelete }: OrderListProps) {
  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-zinc-400">
        Nenhuma order encontrada.
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {orders.map((order) => (
        <div
          key={order.id}
          className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-lg"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white">Order #{order.id}</h3>
              <p className="text-sm text-zinc-300">Pet ID: {order.petId}</p>
              <p className="text-sm text-zinc-300">
                Quantity: {order.quantity ?? "-"}
              </p>
              <p className="text-sm text-zinc-300">
                Ship Date: {order.shipDate ?? "-"}
              </p>
              <p className="text-sm text-zinc-300">Status: {order.status ?? "-"}</p>
              <p className="text-sm text-zinc-300">
                Complete: {order.complete ? "Sim" : "Não"}
              </p>
              <p className="text-sm text-zinc-300">Owner ID: {order.owner_id}</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => onEdit(order)}
                className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800"
              >
                Editar
              </button>
              <button
                onClick={() => onDelete(order.id)}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-500"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}