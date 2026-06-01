import { useState } from "react";
import { Plus } from "lucide-react";
import type { CreateEtiquetaDTO, Etiqueta, UpdateEtiquetaDTO } from "../../types/tag";

const BLUE = "#1A3CB8";
const BORD = "#E0E0E0";
const MUTED = "#6B6B6B";

interface TagFormProps {
  tagBeingEdited: Etiqueta | null;
  onCreate: (data: CreateEtiquetaDTO) => Promise<void>;
  onUpdate: (id: number, data: UpdateEtiquetaDTO) => Promise<void>;
  onCancelEdit?: () => void;
}

const MAX_NOME = 25;

const inputStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  padding: "10px 12px",
  fontSize: "14px",
  border: `1px solid ${BORD}`,
  borderRadius: "4px",
  background: "#fff",
  outline: "none",
  transition: "border-color 0.15s, box-shadow 0.15s",
};

function onFocus(e: React.FocusEvent<HTMLInputElement>) {
  e.target.style.borderColor = BLUE;
  e.target.style.boxShadow = "0 0 0 3px rgba(26,60,184,0.10)";
}
function onBlur(e: React.FocusEvent<HTMLInputElement>) {
  e.target.style.borderColor = BORD;
  e.target.style.boxShadow = "none";
}

export default function TagForm({ tagBeingEdited, onCreate, onUpdate, onCancelEdit }: TagFormProps) {
  const [nome, setNome]         = useState(tagBeingEdited?.nome ?? "");
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
    <form
      key={tagBeingEdited?.id ?? "new"}
      onSubmit={handleSubmit}
      className="bg-white p-5 shadow-sm"
      style={{ border: `1px solid ${BORD}`, borderRadius: "8px" }}
    >
      <h2 className="mb-4 text-sm font-bold" style={{ color: "#1a1a1a" }}>
        {tagBeingEdited ? "Editar Tag" : "Nova Tag"}
      </h2>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-medium" style={{ color: MUTED }}>Nome *</label>
            <span className="text-xs" style={{ color: nome.length >= MAX_NOME ? "#EF4444" : "#CBD5E1" }}>
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
            style={inputStyle}
            onFocus={onFocus}
            onBlur={onBlur}
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-medium" style={{ color: MUTED }}>Descrição</label>
          <input
            type="text"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            maxLength={80}
            placeholder="Descrição opcional"
            style={inputStyle}
            onFocus={onFocus}
            onBlur={onBlur}
          />
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          type="submit"
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white transition hover:opacity-90"
          style={{ background: BLUE, borderRadius: "4px" }}
        >
          <Plus size={14} />
          {tagBeingEdited ? "Salvar" : "Cadastrar"}
        </button>
        {(tagBeingEdited || onCancelEdit) && (
          <button
            type="button"
            onClick={() => onCancelEdit?.()}
            className="px-5 py-2.5 text-sm font-medium transition hover:bg-gray-50"
            style={{ border: `1px solid ${BORD}`, borderRadius: "4px", color: MUTED }}
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
