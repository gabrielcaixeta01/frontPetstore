import OrderForm from "./OrderForm";
import type { Order, UpdateOrderDTO } from "../../types/order";

interface EditOrderFormProps {
  order: Order;
  onUpdate: (id: number, data: UpdateOrderDTO) => Promise<void>;
  onCancel: () => void;
}

export default function EditOrderForm({ order, onUpdate, onCancel }: EditOrderFormProps) {
  async function unusedCreate() {
    throw new Error("EditOrderForm nao suporta criacao");
  }

  return (
    <OrderForm
      orderBeingEdited={order}
      onCreate={unusedCreate}
      onUpdate={onUpdate}
      onCancelEdit={onCancel}
    />
  );
}
