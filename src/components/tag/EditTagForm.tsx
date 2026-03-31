import TagForm from "./TagForm";
import type { Tag, UpdateTagDTO } from "../../types/tag";

interface EditTagFormProps {
  tag: Tag;
  onUpdate: (id: number, data: UpdateTagDTO) => Promise<void>;
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
