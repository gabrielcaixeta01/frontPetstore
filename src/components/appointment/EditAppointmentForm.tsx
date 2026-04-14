import AppointmentForm from "./AppointmentForm";
import type { Appointment, UpdateAppointmentDTO } from "../../types/atendimento";

type EditAppointmentFormProps = {
  appointment: Appointment;
  onUpdate: (id: number, data: UpdateAppointmentDTO, servicoIds: number[]) => Promise<void>;
  onCancel: () => void;
};

export default function EditAppointmentForm({ appointment, onUpdate, onCancel }: EditAppointmentFormProps) {
  async function unusedCreate() {
    throw new Error("EditAppointmentForm nao suporta criacao");
  }

  return (
    <AppointmentForm
      appointmentBeingEdited={appointment}
      onCreate={unusedCreate}
      onUpdate={onUpdate}
      onCancelEdit={onCancel}
    />
  );
}
