import UserForm from "./UserForm";
import type { UpdateUsuarioDTO, Usuario } from "../../types/usuario";
import type { Loja } from "../../types/loja";

interface EditUserFormProps {
  user: Usuario;
  onUpdate: (id: number, data: UpdateUsuarioDTO) => Promise<void>;
  onCancel: () => void;
  lojas?: Loja[];
}

export default function EditUserForm({ user, onUpdate, onCancel, lojas }: EditUserFormProps) {
  async function unusedCreate() {
    throw new Error("EditUserForm nao suporta criacao");
  }

  return (
    <UserForm
      userBeingEdited={user}
      onCreate={unusedCreate}
      onUpdate={onUpdate}
      onCancelEdit={onCancel}
      lojas={lojas}
    />
  );
}
