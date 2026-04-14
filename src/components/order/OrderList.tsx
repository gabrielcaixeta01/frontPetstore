import { apexTheme } from "../../lib/theme";
import type { Order } from "../../types/order";

interface OrderListProps {
  orders: Order[];
  onEdit: (order: Order) => void;
  onDelete: (id: number) => Promise<void>;
}

export default function OrderList({ orders, onEdit, onDelete }: OrderListProps) {
  const c = apexTheme.colors;
  if (orders.length === 0) {
    return (
      <div className={`rounded-2xl border p-6 ${c.border} ${c.card} ${c.textMuted}`}>
        Nenhum atendimento encontrado.
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {orders.map((order) => (
        <div
          key={order.id}
          className={`rounded-2xl border p-5 shadow-lg ${c.border} ${c.card}`}
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-1">
              <h3 className={`text-xl font-bold ${c.text}`}>Atendimento #{order.id}</h3>
              <p className={`text-sm ${c.textSoft}`}>
                Valor final: R$ {Number(order.valor_final).toFixed(2)}
              </p>
              <p className={`text-sm ${c.textSoft}`}>Data: {order.data_atendimento}</p>
              <p className={`text-sm ${c.textSoft}`}>
                Forma pagamento: {order.forma_pagamento}
              </p>
              <p className={`text-sm ${c.textSoft}`}>Status: {order.status}</p>
              <p className={`text-sm ${c.textSoft}`}>
                Online: {order.online ? "Sim" : "Não"}
              </p>
              <p className={`text-sm ${c.textSoft}`}>Loja ID: {order.loja_id}</p>
              <p className={`text-sm ${c.textSoft}`}>Cliente ID: {order.cliente_id}</p>
              <p className={`text-sm ${c.textSoft}`}>Funcionário ID: {order.funcionario_id}</p>
              <p className={`text-sm ${c.textSoft}`}>{order.observacoes ?? "Sem observações"}</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => onEdit(order)}
                className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${c.border} ${c.text} hover:${c.bgSoft}`}
              >
                Editar
              </button>
              <button
                onClick={() => onDelete(order.id)}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition ${c.danger}`}
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