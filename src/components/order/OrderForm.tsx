import { useState } from "react";
import { apexTheme } from "../../lib/theme";
import type { CreateOrderDTO, Order, UpdateOrderDTO } from "../../types/order";

interface OrderFormProps {
  orderBeingEdited: Order | null;
  onCreate: (data: CreateOrderDTO) => Promise<void>;
  onUpdate: (id: number, data: UpdateOrderDTO) => Promise<void>;
  onCancelEdit: () => void;
}

export default function OrderForm({
  orderBeingEdited,
  onCreate,
  onUpdate,
  onCancelEdit,
}: OrderFormProps) {
  const c = apexTheme.colors;
  const [formaPagamento, setFormaPagamento] = useState<Order["forma_pagamento"]>(
    orderBeingEdited?.forma_pagamento ?? "pix"
  );
  const [status, setStatus] = useState<Order["status"]>(
    orderBeingEdited?.status ?? "agendado"
  );
  const [online, setOnline] = useState(orderBeingEdited?.online ?? false);
  const [observacoes, setObservacoes] = useState(
    orderBeingEdited?.observacoes ?? ""
  );
  const [lojaId, setLojaId] = useState(
    orderBeingEdited?.loja_id !== undefined && orderBeingEdited?.loja_id !== null
      ? String(orderBeingEdited.loja_id)
      : ""
  );
  const [clienteId, setClienteId] = useState(
    orderBeingEdited?.cliente_id !== undefined &&
      orderBeingEdited?.cliente_id !== null
      ? String(orderBeingEdited.cliente_id)
      : ""
  );
  const [funcionarioId, setFuncionarioId] = useState(
    orderBeingEdited?.funcionario_id !== undefined &&
      orderBeingEdited?.funcionario_id !== null
      ? String(orderBeingEdited.funcionario_id)
      : ""
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!lojaId.trim() || !clienteId.trim() || !funcionarioId.trim()) {
      alert("Informe loja, cliente e funcionário.");
      return;
    }

    if (orderBeingEdited) {
      const payload: UpdateOrderDTO = {
        forma_pagamento: formaPagamento,
        status,
        online,
        observacoes: observacoes.trim() || undefined,
        loja_id: Number(lojaId),
        cliente_id: Number(clienteId),
        funcionario_id: Number(funcionarioId),
      };

      await onUpdate(orderBeingEdited.id, payload);
    } else {
      const payload: CreateOrderDTO = {
        forma_pagamento: formaPagamento,
        status,
        online,
        observacoes: observacoes.trim() || undefined,
        loja_id: Number(lojaId),
        cliente_id: Number(clienteId),
        funcionario_id: Number(funcionarioId),
      };

      await onCreate(payload);
      setFormaPagamento("pix");
      setStatus("agendado");
      setOnline(false);
      setObservacoes("");
      setLojaId("");
      setClienteId("");
      setFuncionarioId("");
    }
  }

  return (
    <form
      key={orderBeingEdited?.id ?? "new"}
      onSubmit={handleSubmit}
      className={`space-y-4 rounded-2xl border p-6 shadow-lg ${c.border} ${c.card}`}
    >
      <h2 className={`text-2xl font-bold ${c.text}`}>
        {orderBeingEdited ? "Editar Atendimento" : "Cadastrar Atendimento"}
      </h2>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="formaPagamento" className={`mb-1 block text-sm ${c.textSoft}`}>
            Forma de pagamento
          </label>
          <select
            id="formaPagamento"
            value={formaPagamento}
            onChange={(e) => setFormaPagamento(e.target.value as Order["forma_pagamento"])}
            className={`w-full rounded-xl border px-4 py-3 outline-none ${c.border} ${c.cardSoft} ${c.text} focus:ring-2 focus:ring-[#1c46f3]`}
          >
            <option value="pix">pix</option>
            <option value="cartao_credito">cartao_credito</option>
            <option value="cartao_debito">cartao_debito</option>
            <option value="dinheiro">dinheiro</option>
          </select>
        </div>

        <div>
          <label htmlFor="status" className={`mb-1 block text-sm ${c.textSoft}`}>
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as Order["status"])}
            className={`w-full rounded-xl border px-4 py-3 outline-none ${c.border} ${c.cardSoft} ${c.text} focus:ring-2 focus:ring-[#1c46f3]`}
          >
            <option value="agendado">agendado</option>
            <option value="concluido">concluido</option>
            <option value="cancelado">cancelado</option>
          </select>
        </div>

        <div>
          <label htmlFor="lojaId" className={`mb-1 block text-sm ${c.textSoft}`}>
            Loja ID
          </label>
          <input
            id="lojaId"
            type="number"
            value={lojaId}
            onChange={(e) => setLojaId(e.target.value)}
            required
            className={`w-full rounded-xl border px-4 py-3 outline-none ${c.border} ${c.cardSoft} ${c.text} focus:ring-2 focus:ring-[#1c46f3]`}
          />
        </div>

        <div>
          <label htmlFor="clienteId" className={`mb-1 block text-sm ${c.textSoft}`}>
            Cliente ID
          </label>
          <input
            id="clienteId"
            type="number"
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
            required
            className={`w-full rounded-xl border px-4 py-3 outline-none ${c.border} ${c.cardSoft} ${c.text} focus:ring-2 focus:ring-[#1c46f3]`}
          />
        </div>

        <div>
          <label htmlFor="funcionarioId" className={`mb-1 block text-sm ${c.textSoft}`}>
            Funcionário ID
          </label>
          <input
            id="funcionarioId"
            type="number"
            value={funcionarioId}
            onChange={(e) => setFuncionarioId(e.target.value)}
            required
            className={`w-full rounded-xl border px-4 py-3 outline-none ${c.border} ${c.cardSoft} ${c.text} focus:ring-2 focus:ring-[#1c46f3]`}
          />
        </div>

        <div>
          <label htmlFor="observacoes" className={`mb-1 block text-sm ${c.textSoft}`}>
            Observações
          </label>
          <textarea
            id="observacoes"
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            rows={3}
            className={`w-full rounded-xl border px-4 py-3 outline-none ${c.border} ${c.cardSoft} ${c.text} focus:ring-2 focus:ring-[#1c46f3]`}
          />
        </div>

        <div className="flex items-center gap-3 pt-8">
          <input
            id="online"
            type="checkbox"
            checked={online}
            onChange={(e) => setOnline(e.target.checked)}
            className="h-4 w-4"
          />
          <label htmlFor="online" className={`text-sm ${c.textSoft}`}>
            Online
          </label>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          className={`rounded-xl px-5 py-3 font-semibold transition hover:opacity-90 ${c.primary} ${c.primaryText}`}
        >
          {orderBeingEdited ? "Salvar alterações" : "Cadastrar"}
        </button>

        {orderBeingEdited && (
          <button
            type="button"
            onClick={onCancelEdit}
            className={`rounded-xl border px-5 py-3 font-semibold transition ${c.border} ${c.text} hover:${c.bgSoft}`}
          >
            Cancelar edição
          </button>
        )}
      </div>
    </form>
  );
}