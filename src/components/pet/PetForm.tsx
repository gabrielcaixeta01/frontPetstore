import { useEffect, useRef, useState } from "react";
import { Search, Plus } from "lucide-react";
import { getCategories } from "../../services/categoriaService";
import { getUsuarios } from "../../services/usuarioService";
import { getTags } from "../../services/tagService";
import type { Categoria } from "../../types/categoria";
import type { CreatePetDTO, Pet, UpdatePetDTO } from "../../types/pet";
import type { Etiqueta } from "../../types/tag";
import type { Usuario } from "../../types/usuario";

function getStoredUserId(): number | null {
  try {
    const stored = localStorage.getItem("user");
    if (!stored) return null;
    const user = JSON.parse(stored);
    const rawId = user.id ?? user.user_id ?? user.usuario_id;
    const parsedId = Number(rawId);
    return Number.isFinite(parsedId) ? parsedId : null;
  } catch { return null; }
}

function getStoredRole(): string | null {
  try {
    const stored = localStorage.getItem("user");
    if (!stored) return null;
    const user = JSON.parse(stored);
    return user.role ?? user.profile_type ?? user.tipo_perfil ?? null;
  } catch { return null; }
}

interface PetFormProps {
  petBeingEdited: Pet | null;
  onCreate: (data: CreatePetDTO) => Promise<void>;
  onUpdate: (id: number, data: UpdatePetDTO) => Promise<void>;
  onCancelEdit: () => void;
}

const inputCls = "w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none transition focus:border-[#1c46f3] focus:bg-white focus:ring-2 focus:ring-[#1c46f3]/15";
const selectCls = inputCls + " appearance-none";
const MAX_OBSERVACOES_SAUDE = 50;

export default function PetForm({ petBeingEdited, onCreate, onUpdate, onCancelEdit }: PetFormProps) {
  const isCliente = getStoredRole() === "cliente";
  const currentUserId = getStoredUserId();

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [clientes, setClientes] = useState<Usuario[]>([]);
  const [tagsDisponiveis, setTagsDisponiveis] = useState<Etiqueta[]>([]);

  const [nome, setNome] = useState("");
  const [raca, setRaca] = useState("");
  const [sexo, setSexo] = useState<CreatePetDTO["sexo"] | "">("");
  const [porte, setPorte] = useState<CreatePetDTO["porte"] | "">("");
  const [peso, setPeso] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [tagIdsSelecionados, setTagIdsSelecionados] = useState<number[]>([]);

  // Owner search (funcionario only)
  const [ownerSearch, setOwnerSearch] = useState("");
  const [ownerId, setOwnerId] = useState<number | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredClientes = clientes.filter((u) =>
    u.nome.toLowerCase().includes(ownerSearch.toLowerCase())
  ).slice(0, 8);

  useEffect(() => {
    getCategories().then(setCategorias).catch(console.error);
    getTags().then(setTagsDisponiveis).catch(console.error);
    if (!isCliente) {
      getUsuarios()
        .then((all) => setClientes(all.filter((u) => u.tipo_perfil === "cliente")))
        .catch(console.error);
    }
  }, [isCliente]);

  useEffect(() => {
    if (petBeingEdited) {
      setNome(petBeingEdited.nome ?? "");
      setRaca(petBeingEdited.raca ?? "");
      setSexo(petBeingEdited.sexo ?? "");
      setPorte(petBeingEdited.porte ?? "");
      setPeso(petBeingEdited.peso !== undefined ? String(petBeingEdited.peso) : "");
      setObservacoes(petBeingEdited.observacoes_saude ?? "");
      setCategoriaId(String(petBeingEdited.categoria_id ?? ""));
      setTagIdsSelecionados(petBeingEdited.tags?.map((t) => t.id) ?? []);
      if (!isCliente) {
        setOwnerId(petBeingEdited.dono_id);
        const dono = clientes.find((c) => c.id === petBeingEdited.dono_id);
        setOwnerSearch(dono?.nome ?? `ID ${petBeingEdited.dono_id}`);
      }
    } else {
      setNome(""); setRaca(""); setSexo(""); setPorte(""); setPeso(""); setObservacoes("");
      setCategoriaId(categorias[0] ? String(categorias[0].id) : "");
      setTagIdsSelecionados([]);
      if (!isCliente) { setOwnerId(null); setOwnerSearch(""); }
    }
  }, [petBeingEdited, categorias, clientes, isCliente]);

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const ownerValue = isCliente ? currentUserId! : ownerId;
    if (!ownerValue) { alert(isCliente ? "Não foi possível identificar o cliente." : "Selecione o dono do pet."); return; }

    const normalizedNome = nome.trim();
    const normalizedRaca = raca.trim();
    let normalizedObservacoes = observacoes.trim();
    const normalizedPeso = peso.trim() ? Number(peso) : undefined;

    if (normalizedNome.length < 2) {
      alert("O nome do pet deve ter no mínimo 2 caracteres.");
      return;
    }

    if (!normalizedRaca) {
      alert("A raça do pet é obrigatória.");
      return;
    }

    if (!sexo) {
      alert("O sexo do pet é obrigatório.");
      return;
    }

    if (!porte) {
      alert("O porte do pet é obrigatório.");
      return;
    }

    if (normalizedPeso !== undefined && (!Number.isFinite(normalizedPeso) || normalizedPeso <= 0)) {
      alert("O peso do pet deve ser maior que 0.");
      return;
    }

    if (normalizedObservacoes.length > MAX_OBSERVACOES_SAUDE) {
      normalizedObservacoes = normalizedObservacoes.slice(0, MAX_OBSERVACOES_SAUDE);
      setObservacoes(normalizedObservacoes);
      alert(`Observações muito longas — truncadas para ${MAX_OBSERVACOES_SAUDE} caracteres.`);
    }

    const payload = {
      nome: normalizedNome,
      raca: normalizedRaca || undefined,
      sexo: (sexo || undefined) as CreatePetDTO["sexo"],
      porte: (porte || undefined) as CreatePetDTO["porte"],
      peso: normalizedPeso,
      observacoes_saude: normalizedObservacoes,
      categoria_id: Number(categoriaId),
      dono_id: ownerValue,
      tag_ids: tagIdsSelecionados.length > 0 ? tagIdsSelecionados : undefined,
    };

    if (petBeingEdited) {
      await onUpdate(petBeingEdited.id, { ...payload, tag_ids: tagIdsSelecionados });
    } else {
      await onCreate(payload);
      setNome(""); setRaca(""); setSexo(""); setPorte(""); setPeso(""); setObservacoes("");
      setCategoriaId(categorias[0] ? String(categorias[0].id) : "");
      setTagIdsSelecionados([]);
      if (!isCliente) { setOwnerId(null); setOwnerSearch(""); }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-gray-700">
        {petBeingEdited ? "Editar Pet" : "Novo Pet"}
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {/* Nome */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-gray-500">Nome *</label>
          <input maxLength={60} className={inputCls} placeholder="Nome do pet" value={nome} onChange={(e) => setNome(e.target.value)} required />
        </div>

        {/* Raça */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-gray-500">Raça *</label>
          <input maxLength={80} className={inputCls} placeholder="Ex: Golden Retriever" value={raca} onChange={(e) => setRaca(e.target.value)} required />
        </div>

        {/* Categoria */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-gray-500">Categoria *</label>
          <select className={selectCls} value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)} required>
            <option value="">Selecionar...</option>
            {categorias.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {/* Sexo */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-gray-500">Sexo *</label>
          <select className={selectCls} value={sexo} onChange={(e) => setSexo(e.target.value as CreatePetDTO["sexo"] | "")} required>
            <option value="">Selecionar...</option>
            <option value="macho">Macho</option>
            <option value="femea">Fêmea</option>
          </select>
        </div>

        {/* Porte */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-gray-500">Porte *</label>
          <select className={selectCls} value={porte} onChange={(e) => setPorte(e.target.value as CreatePetDTO["porte"] | "")} required>
            <option value="">Selecionar...</option>
            <option value="pequeno">Pequeno</option>
            <option value="medio">Médio</option>
            <option value="grande">Grande</option>
          </select>
        </div>

        {/* Peso */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-gray-500">Peso (kg)</label>
          <input type="number" step="0.1" min="0" className={inputCls} placeholder="Ex: 8.5" value={peso} onChange={(e) => setPeso(e.target.value)} />
        </div>

        {/* Dono — busca por nome (somente funcionário) */}
        {!isCliente && (
          <div className="relative space-y-1.5 sm:col-span-2 lg:col-span-2" ref={dropdownRef}>
            <label className="block text-xs font-medium text-gray-500">
              Dono (cliente) *
              {ownerId && <span className="ml-2 text-[#1c46f3]">✓ selecionado</span>}
            </label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                className={inputCls + " pl-9"}
                placeholder="Buscar cliente pelo nome..."
                value={ownerSearch}
                onChange={(e) => { setOwnerSearch(e.target.value); setOwnerId(null); setShowDropdown(true); }}
                onFocus={() => setShowDropdown(true)}
                autoComplete="off"
              />
            </div>
            {showDropdown && ownerSearch.length > 0 && (
              <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                {filteredClientes.length === 0 ? (
                  <p className="px-4 py-3 text-xs text-gray-400">Nenhum cliente encontrado.</p>
                ) : (
                  filteredClientes.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setOwnerId(c.id);
                        setOwnerSearch(c.nome);
                        setShowDropdown(false);
                      }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition hover:bg-gray-50"
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1c46f3]/10 text-xs font-bold text-[#1c46f3]">
                        {c.nome[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{c.nome}</p>
                        <p className="text-xs text-gray-400">{c.email}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Observações */}
        <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
          <label className="block text-xs font-medium text-gray-500">Observações de saúde</label>
          <input maxLength={MAX_OBSERVACOES_SAUDE} className={inputCls} placeholder="Alergias, medicamentos..." value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />
        </div>

        {/* Tags */}
        {tagsDisponiveis.length > 0 && (
          <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
            <label className="block text-xs font-medium text-gray-500">Tags</label>
            <div className="flex flex-wrap gap-2">
              {tagsDisponiveis.map((tag) => {
                const selecionada = tagIdsSelecionados.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => setTagIdsSelecionados((ids) =>
                      ids.includes(tag.id) ? ids.filter((id) => id !== tag.id) : [...ids, tag.id]
                    )}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                      selecionada
                        ? "border-[#1c46f3] bg-[#1c46f3] text-white"
                        : "border-gray-200 bg-gray-50 text-gray-600 hover:border-[#1c46f3]/50 hover:text-[#1c46f3]"
                    }`}
                  >
                    {tag.nome}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={categorias.length === 0}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#1c46f3] to-[#1840e0] px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-[#1c46f3]/20 transition hover:opacity-90 disabled:opacity-50"
        >
          <Plus size={14} />
          {petBeingEdited ? "Salvar alterações" : "Cadastrar"}
        </button>
        {petBeingEdited && (
          <button type="button" onClick={onCancelEdit} className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm text-gray-500 transition hover:bg-gray-50">
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
