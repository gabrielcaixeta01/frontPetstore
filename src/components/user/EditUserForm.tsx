import UserForm from "./UserForm";
import type { UpdateUsuarioDTO, Usuario } from "../../types/usuario";

interface EditUserFormProps {
  user: Usuario;
  onUpdate: (id: number, data: UpdateUsuarioDTO) => Promise<void>;
  onCancel: () => void;
}

export default function EditUserForm({ user, onUpdate, onCancel }: EditUserFormProps) {
  async function unusedCreate() {
    throw new Error("EditUserForm nao suporta criacao");
  }

  return (
    <UserForm
      userBeingEdited={user}
      onCreate={unusedCreate}
      onUpdate={onUpdate}
      onCancelEdit={onCancel}
    />
  );
}
