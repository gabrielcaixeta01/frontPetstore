import PetForm from "./PetForm";
import type { Pet, UpdatePetDTO } from "../../types/pet";

interface EditPetFormProps {
  pet: Pet;
  onUpdate: (id: number, data: UpdatePetDTO) => Promise<void>;
  onCancel: () => void;
}

export default function EditPetForm({ pet, onUpdate, onCancel }: EditPetFormProps) {
  async function unusedCreate() {
    throw new Error("EditPetForm nao suporta criacao");
  }

  return (
    <PetForm
      petBeingEdited={pet}
      onCreate={unusedCreate}
      onUpdate={onUpdate}
      onCancelEdit={onCancel}
    />
  );
}
