import TagForm from "./TagForm";
import type { Etiqueta, UpdateEtiquetaDTO } from "../../types/tag";

interface EditTagFormProps {
  tag: Etiqueta;
  onUpdate: (id: number, data: UpdateEtiquetaDTO) => Promise<void>;
  onCancel: () => void;
}

export default function EditTagForm({ tag, onUpdate, onCancel }: EditTagFormProps) {
  async function unusedCreate() {
    throw new Error("EditTagForm nao suporta criacao");
  }

  return (
    <TagForm
      tagBeingEdited={tag}
      onCreate={unusedCreate}
      onUpdate={onUpdate}
      onCancelEdit={onCancel}
    />
  );
}
