import { useState } from "react";
import type { CreateOrderDTO, Order, UpdateOrderDTO } from "../types/order";

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
  const [petId, setPetId] = useState(
    orderBeingEdited?.petId !== undefined && orderBeingEdited?.petId !== null
      ? String(orderBeingEdited.petId)
      : ""
  );
  const [quantity, setQuantity] = useState(
    orderBeingEdited?.quantity !== undefined &&
      orderBeingEdited?.quantity !== null
      ? String(orderBeingEdited.quantity)
      : ""
  );
  const [shipDate, setShipDate] = useState(orderBeingEdited?.shipDate ?? "");
  const [status, setStatus] = useState(orderBeingEdited?.status ?? "");
  const [complete, setComplete] = useState(orderBeingEdited?.complete ?? false);
  const [ownerId, setOwnerId] = useState(
    orderBeingEdited?.owner_id !== undefined &&
      orderBeingEdited?.owner_id !== null
      ? String(orderBeingEdited.owner_id)
      : ""
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!petId.trim()) {
      alert("Informe o petId.");
      return;
    }

    if (!ownerId.trim()) {
      alert("Informe o owner_id.");
      return;
    }

    const payload: CreateOrderDTO | UpdateOrderDTO = {
      petId: Number(petId),
      quantity: quantity.trim() ? Number(quantity) : undefined,
      shipDate: shipDate.trim() || undefined,
      status: status.trim() || undefined,
      complete,
      owner_id: Number(ownerId),
    };

    if (orderBeingEdited) {
      await onUpdate(orderBeingEdited.id, payload);
    } else {
      await onCreate(payload as CreateOrderDTO);
      setPetId("");
      setQuantity("");
      setShipDate("");
      setStatus("");
      setComplete(false);
      setOwnerId("");
    }
  }

  return (
    <form
      key={orderBeingEdited?.id ?? "new"}
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-lg"
    >
      <h2 className="text-2xl font-bold text-white">
        {orderBeingEdited ? "Editar Order" : "Cadastrar Order"}
      </h2>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="petId" className="mb-1 block text-sm text-zinc-300">
            Pet ID
          </label>
          <input
            id="petId"
            type="number"
            value={petId}
            onChange={(e) => setPetId(e.target.value)}
            required
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-zinc-500"
          />
        </div>

        <div>
          <label htmlFor="ownerId" className="mb-1 block text-sm text-zinc-300">
            Owner ID
          </label>
          <input
            id="ownerId"
            type="number"
            value={ownerId}
            onChange={(e) => setOwnerId(e.target.value)}
            required
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-zinc-500"
          />
        </div>

        <div>
          <label htmlFor="quantity" className="mb-1 block text-sm text-zinc-300">
            Quantity
          </label>
          <input
            id="quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-zinc-500"
          />
        </div>

        <div>
          <label htmlFor="shipDate" className="mb-1 block text-sm text-zinc-300">
            Ship Date
          </label>
          <input
            id="shipDate"
            type="datetime-local"
            value={shipDate}
            onChange={(e) => setShipDate(e.target.value)}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-zinc-500"
          />
        </div>

        <div>
          <label htmlFor="status" className="mb-1 block text-sm text-zinc-300">
            Status
          </label>
          <input
            id="status"
            type="text"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-zinc-500"
          />
        </div>

        <div className="flex items-center gap-3 pt-8">
          <input
            id="complete"
            type="checkbox"
            checked={complete}
            onChange={(e) => setComplete(e.target.checked)}
            className="h-4 w-4"
          />
          <label htmlFor="complete" className="text-sm text-zinc-300">
            Complete
          </label>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          className="rounded-xl bg-white px-5 py-3 font-semibold text-black transition hover:opacity-90"
        >
          {orderBeingEdited ? "Salvar alterações" : "Cadastrar"}
        </button>

        {orderBeingEdited && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="rounded-xl border border-zinc-700 px-5 py-3 font-semibold text-white transition hover:bg-zinc-800"
          >
            Cancelar edição
          </button>
        )}
      </div>
    </form>
  );
}