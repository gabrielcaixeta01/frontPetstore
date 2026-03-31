import UserForm from "./UserForm";
import type { UpdateUserDTO, User } from "../../types/user";

interface EditUserFormProps {
  user: User;
  onUpdate: (id: number, data: UpdateUserDTO) => Promise<void>;
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
