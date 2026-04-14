import OrderForm from "./OrderForm";
import type { Appointment, UpdateAppointmentDTO } from "../../types/atendimento";

interface EditOrderFormProps {
  order: Appointment;
  onUpdate: (id: number, data: UpdateAppointmentDTO) => Promise<void>;
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
