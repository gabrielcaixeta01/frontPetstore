import { useState } from "react";
import { Plus } from "lucide-react";
import type { CreateEtiquetaDTO, Etiqueta, UpdateEtiquetaDTO } from "../../types/tag";

interface TagFormProps {
  tagBeingEdited: Etiqueta | null;
  onCreate: (data: CreateEtiquetaDTO) => Promise<void>;
  onUpdate: (id: number, data: UpdateEtiquetaDTO) => Promise<void>;
  onCancelEdit: () => void;
}

const inputCls = "w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none transition focus:border-[#1c46f3] focus:bg-white focus:ring-2 focus:ring-[#1c46f3]/15";

const MAX_NOME = 25;

export default function TagForm({ tagBeingEdited, onCreate, onUpdate, onCancelEdit }: TagFormProps) {
  const [nome, setNome] = useState(tagBeingEdited?.nome ?? "");
  const [descricao, setDescricao] = useState(tagBeingEdited?.descricao ?? "");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const normalizedNome = nome.trim();
    if (normalizedNome.length < 2) {
      alert("O nome da tag deve ter no mínimo 2 caracteres.");
      return;
    }

    const payload = { nome: normalizedNome, descricao: descricao.trim() };

    if (tagBeingEdited) {
      await onUpdate(tagBeingEdited.id, payload);
    } else {
      await onCreate(payload);
      setNome("");
      setDescricao("");
    }
  }

  return (
    <form key={tagBeingEdited?.id ?? "new"} onSubmit={handleSubmit} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold text-gray-700">
        {tagBeingEdited ? "Editar Tag" : "Nova Tag"}
      </h2>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-medium text-gray-500">Nome *</label>
            <span className={`text-xs ${nome.length >= MAX_NOME ? "text-red-400" : "text-gray-300"}`}>
              {nome.length}/{MAX_NOME}
            </span>
          </div>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            maxLength={MAX_NOME}
            minLength={2}
            required
            placeholder="Ex: Vacinado"
            className={inputCls}
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-gray-500">Descrição</label>
          <input
            type="text"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            maxLength={80}
            placeholder="Descrição opcional"
            className={inputCls}
          />
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          type="submit"
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#1c46f3] to-[#1840e0] px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-[#1c46f3]/20 transition hover:opacity-90"
        >
          <Plus size={14} />
          {tagBeingEdited ? "Salvar" : "Cadastrar"}
        </button>
        {tagBeingEdited && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-500 transition hover:bg-gray-50"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
