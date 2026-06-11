import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Search, ChevronDown } from "lucide-react";
import { getPets } from "../../services/petService";
import { getLojas } from "../../services/lojaService";
import { getServicos } from "../../services/servicoService";
import { getUsuarios } from "../../services/usuarioService";
import type {
  Appointment,
  CreateAppointmentDTO,
  UpdateAppointmentDTO,
} from "../../types/atendimento";
import type { Pet } from "../../types/pet";
import type { Loja } from "../../types/loja";
import type { Servico } from "../../types/servico";
import type { Usuario } from "../../types/usuario";

type AppointmentFormProps = {
  appointmentBeingEdited: Appointment | null;
  onCreate: (data: CreateAppointmentDTO, servicoIds: number[]) => Promise<void>;
  onUpdate: (id: number, data: UpdateAppointmentDTO, servicoIds: number[]) => Promise<void>;
  onCancelEdit: () => void;
  fixedLojaId?: number;
};

const selectCls = "w-full rounded border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none transition focus:border-[#1c46f3] focus:bg-white disabled:opacity-60 appearance-none";
const inputCls  = "w-full rounded border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none transition focus:border-[#1c46f3] focus:bg-white";
const labelCls  = "mb-1 block text-xs font-medium text-gray-500";

interface SelectOption { value: string; label: string }

function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = "Selecionar...",
  disabled = false,
  emptyText = "Nenhuma opção",
  loadingText,
}: {
  value: string;
  onChange: (v: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  emptyText?: string;
  loadingText?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const selectedLabel = options.find((o) => o.value === value)?.label;
  const filtered = useMemo(
    () => options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase())),
    [options, search],
  );

  useEffect(() => { if (!open) setSearch(""); }, [open]);

  useEffect(() => {
    if (!open) return;
    function onMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
        className={`${selectCls} flex items-center justify-between gap-2 text-left`}
        style={{ cursor: disabled ? "not-allowed" : "pointer" }}
      >
        <span className={selectedLabel ? "text-gray-700" : "text-gray-400"} style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {loadingText ?? selectedLabel ?? placeholder}
        </span>
        <ChevronDown size={14} className={`shrink-0 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && !disabled && (
        <div className="absolute z-50 mt-1 w-full rounded border border-gray-200 bg-white shadow-lg" style={{ minWidth: "100%" }}>
          <div className="relative p-1.5">
            <Search size={13} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              autoFocus
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar..."
              className="w-full rounded border border-gray-200 bg-gray-50 py-1.5 pl-7 pr-2 text-sm outline-none focus:border-[#1c46f3] focus:bg-white"
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-400">{emptyText}</div>
            ) : (
              filtered.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => { onChange(o.value); setOpen(false); }}
                  className={`w-full px-3 py-2 text-left text-sm transition hover:bg-gray-50 ${o.value === value ? "font-medium text-[#1c46f3]" : "text-gray-700"}`}
                  style={{ background: o.value === value ? "rgba(28,70,243,0.06)" : undefined }}
                >
                  {o.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AppointmentForm({
  appointmentBeingEdited,
  onCreate,
  onUpdate,
  onCancelEdit,
  fixedLojaId,
}: AppointmentFormProps) {
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [clientes, setClientes] = useState<Usuario[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loadingRelacionamentos, setLoadingRelacionamentos] = useState(true);

  const [formaPagamento, setFormaPagamento] = useState<Appointment["forma_pagamento"]>(
    appointmentBeingEdited?.forma_pagamento ?? "pix"
  );
  const [status, setStatus] = useState<Appointment["status"]>(
    appointmentBeingEdited?.status ?? "agendado"
  );
  const [online, setOnline] = useState(appointmentBeingEdited?.online ?? false);
  const [observacoes, setObservacoes] = useState(appointmentBeingEdited?.observacoes ?? "");
  const [lojaId, setLojaId] = useState(
    fixedLojaId != null ? String(fixedLojaId) :
    appointmentBeingEdited?.loja_id != null ? String(appointmentBeingEdited.loja_id) : ""
  );
  const [clienteId, setClienteId] = useState(
    appointmentBeingEdited?.cliente_id != null ? String(appointmentBeingEdited.cliente_id) : ""
  );
  const [funcionarioId, setFuncionarioId] = useState(
    appointmentBeingEdited?.funcionario_id != null ? String(appointmentBeingEdited.funcionario_id) : ""
  );
  const [petId, setPetId] = useState(
    appointmentBeingEdited?.pet_id != null ? String(appointmentBeingEdited.pet_id) : ""
  );
  const [servicoIdsSelecionados, setServicoIdsSelecionados] = useState<number[]>([]);
  const [data, setData] = useState(() => {
    const dt = appointmentBeingEdited?.data_atendimento;
    return dt ? dt.slice(0, 10) : "";
  });
  const [hora, setHora] = useState(() => {
    const dt = appointmentBeingEdited?.data_atendimento;
    return dt && dt.includes("T") ? dt.slice(11, 16) : "";
  });

  const dateTime = data && hora ? new Date(`${data}T${hora}:00`) : null;
  const isPastDateTime = dateTime ? dateTime < new Date() : false;
  const isFutureDateTime = dateTime ? dateTime > new Date() : false;

  const lojaSelecionada = useMemo(() => lojas.find((l) => String(l.id) === lojaId), [lojas, lojaId]);
  const funcionariosDaLoja = useMemo(() => lojaSelecionada?.funcionarios ?? [], [lojaSelecionada]);

  const lojasSorted    = useMemo(() => [...lojas].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")), [lojas]);
  const clientesSorted = useMemo(() => [...clientes].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")), [clientes]);
  const funcSorted     = useMemo(() => [...funcionariosDaLoja].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")), [funcionariosDaLoja]);
  const servicosSorted = useMemo(() => [...servicos].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")), [servicos]);

  const petsDoCliente    = useMemo(() => clienteId ? pets.filter((p) => String(p.dono_id) === clienteId) : [], [clienteId, pets]);
  const petsSorted       = useMemo(() => [...petsDoCliente].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")), [petsDoCliente]);

  function getPrecoSeguro(preco: number): number {
    const valor = Number(preco);
    return Number.isFinite(valor) ? valor : 0;
  }

  useEffect(() => {
    async function loadRelacionamentos() {
      try {
        setLoadingRelacionamentos(true);
        const [lojasData, usuariosData, petsData, servicosData] = await Promise.all([
          getLojas(), getUsuarios(), getPets(), getServicos(),
        ]);
        setLojas(lojasData);
        setClientes(usuariosData.filter((u) => u.tipo_perfil === "cliente"));
        setPets(petsData);
        setServicos(servicosData);
      } catch (error) {
        console.error("Erro ao carregar relacionamentos:", error);
      } finally {
        setLoadingRelacionamentos(false);
      }
    }
    loadRelacionamentos();
  }, []);

  useEffect(() => {
    if (!appointmentBeingEdited) return;
    setFormaPagamento(appointmentBeingEdited.forma_pagamento ?? "pix");
    setStatus(appointmentBeingEdited.status ?? "agendado");
    setOnline(Boolean(appointmentBeingEdited.online));
    setObservacoes(appointmentBeingEdited.observacoes ?? "");
    setLojaId(String(appointmentBeingEdited.loja_id ?? ""));
    setClienteId(String(appointmentBeingEdited.cliente_id ?? ""));
    setFuncionarioId(String(appointmentBeingEdited.funcionario_id ?? ""));
    setPetId(String(appointmentBeingEdited.pet_id ?? ""));
    setServicoIdsSelecionados(appointmentBeingEdited.items?.map((i) => i.service_id) ?? []);
    const dt = appointmentBeingEdited.data_atendimento;
    setData(dt ? dt.slice(0, 10) : "");
    setHora(dt && dt.includes("T") ? dt.slice(11, 16) : "");
  }, [appointmentBeingEdited]);

  useEffect(() => {
    if (appointmentBeingEdited) return;
    if (!lojaId && lojas.length > 0) setLojaId(fixedLojaId != null ? String(fixedLojaId) : String(lojas[0].id));
    if (!clienteId && clientes.length > 0) setClienteId(String(clientes[0].id));
  }, [appointmentBeingEdited, lojas, clientes, lojaId, clienteId, fixedLojaId]);

  useEffect(() => {
    if (petsDoCliente.length === 0) { setPetId(""); return; }
    if (!petId || !petsDoCliente.some((p) => String(p.id) === petId)) {
      setPetId(String(petsDoCliente[0].id));
    }
  }, [clienteId, pets, petId]);

  useEffect(() => {
    if (funcionariosDaLoja.length === 0) { setFuncionarioId(""); return; }
    if (!funcionarioId || !funcionariosDaLoja.some((f) => String(f.usuario_id) === funcionarioId)) {
      setFuncionarioId(String(funcionariosDaLoja[0].usuario_id));
    }
  }, [funcionariosDaLoja, funcionarioId]);

  useEffect(() => {
    if (isPastDateTime && status === "agendado") setStatus("atrasado");
    if (isFutureDateTime && status === "atrasado") setStatus("agendado");
  }, [isPastDateTime, isFutureDateTime, status]);

  const valorTotal = servicoIdsSelecionados.reduce((total, id) => {
    const s = servicos.find((sv) => sv.id === id);
    return total + getPrecoSeguro(s?.preco ?? 0);
  }, 0);

  function toggleServico(servicoId: number) {
    setServicoIdsSelecionados((prev) =>
      prev.includes(servicoId) ? prev.filter((id) => id !== servicoId) : [...prev, servicoId]
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!lojaId || !clienteId || !funcionarioId || !petId) {
      alert("Informe loja, cliente, funcionário e pet.");
      return;
    }
    if (!data || !hora) {
      alert("Informe a data e o horário do atendimento.");
      return;
    }
    if (isPastDateTime && status === "agendado") {
      alert("Atendimentos com data/hora passada não podem ter status 'Agendado'.");
      return;
    }
    if (isFutureDateTime && status === "atrasado") {
      alert("Atendimentos com data/hora futura não podem ter status 'Atrasado'.");
      return;
    }
    if (servicoIdsSelecionados.length === 0) {
      alert("Selecione pelo menos um serviço.");
      return;
    }
    if (petsDoCliente.length === 0) {
      alert("O cliente selecionado não possui pets cadastrados.");
      return;
    }
    if (!petsDoCliente.some((p) => String(p.id) === petId)) {
      alert("Selecione um pet pertencente ao cliente informado.");
      return;
    }

    if (appointmentBeingEdited) {
      const payload: UpdateAppointmentDTO = {
        forma_pagamento: formaPagamento, status, online,
        observacoes: observacoes.trim(),
        loja_id: Number(lojaId), cliente_id: Number(clienteId),
        funcionario_id: Number(funcionarioId), pet_id: Number(petId),
        data_atendimento: data && hora ? new Date(`${data}T${hora}:00`).toISOString() : undefined,
      };
      await onUpdate(appointmentBeingEdited.id, payload, servicoIdsSelecionados);
      return;
    }

    const payload: CreateAppointmentDTO = {
      forma_pagamento: formaPagamento, status, online,
      observacoes: observacoes.trim() || undefined,
      loja_id: Number(lojaId), cliente_id: Number(clienteId),
      funcionario_id: Number(funcionarioId), pet_id: Number(petId),
      data_atendimento: new Date(`${data}T${hora}:00`).toISOString(),
    };
    await onCreate(payload, servicoIdsSelecionados);
    setFormaPagamento("pix"); setStatus("agendado"); setOnline(false); setObservacoes("");
    setLojaId(fixedLojaId != null ? String(fixedLojaId) : lojas.length > 0 ? String(lojas[0].id) : "");
    setClienteId(clientes.length > 0 ? String(clientes[0].id) : "");
    setPetId(""); setServicoIdsSelecionados([]);
    setData(""); setHora("");
  }

  return (
    <form
      key={appointmentBeingEdited?.id ?? "new"}
      onSubmit={handleSubmit}
      className="space-y-5 rounded-md border border-gray-200 bg-white p-5 shadow-sm"
    >
      <h2 className="text-sm font-semibold text-gray-700">
        {appointmentBeingEdited ? "Editar Atendimento" : "Novo Atendimento"}
      </h2>

      {/* Row 1 — Loja + Cliente */}
      <div className="grid gap-3 sm:grid-cols-2">
        {fixedLojaId == null && (
          <div>
            <label className={labelCls}>Loja *</label>
            <SearchableSelect
              value={lojaId}
              onChange={setLojaId}
              disabled={loadingRelacionamentos}
              loadingText={loadingRelacionamentos ? "Carregando..." : undefined}
              placeholder="Selecione uma loja"
              emptyText="Nenhuma loja encontrada"
              options={lojasSorted.map((l) => ({ value: String(l.id), label: l.nome }))}
            />
          </div>
        )}
        <div>
          <label className={labelCls}>Cliente *</label>
          <SearchableSelect
            value={clienteId}
            onChange={setClienteId}
            disabled={loadingRelacionamentos}
            loadingText={loadingRelacionamentos ? "Carregando..." : undefined}
            placeholder="Selecione um cliente"
            emptyText="Nenhum cliente encontrado"
            options={clientesSorted.map((c) => ({ value: String(c.id), label: c.nome }))}
          />
        </div>
      </div>

      {/* Row 2 — Funcionário + Pet */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Funcionário *</label>
          <SearchableSelect
            value={funcionarioId}
            onChange={setFuncionarioId}
            disabled={loadingRelacionamentos || !lojaSelecionada}
            loadingText={loadingRelacionamentos ? "Carregando..." : undefined}
            placeholder={!lojaSelecionada ? "Selecione uma loja primeiro" : "Selecione um funcionário"}
            emptyText="Nenhum funcionário encontrado"
            options={funcSorted.map((f) => ({
              value: String(f.usuario_id),
              label: f.nome + (f.cargo ? ` — ${f.cargo}` : ""),
            }))}
          />
        </div>
        <div>
          <label className={labelCls}>Pet *</label>
          <SearchableSelect
            value={petId}
            onChange={setPetId}
            disabled={loadingRelacionamentos || !clienteId}
            loadingText={loadingRelacionamentos ? "Carregando..." : undefined}
            placeholder={!clienteId ? "Selecione um cliente primeiro" : "Selecione um pet"}
            emptyText="Nenhum pet neste cliente"
            options={petsSorted.map((p) => ({ value: String(p.id), label: p.nome }))}
          />
        </div>
      </div>

      {/* Row 3 — Data + Hora */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Data *</label>
          <input
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            required
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Horário *</label>
          <input
            type="time"
            value={hora}
            onChange={(e) => setHora(e.target.value)}
            required
            className={inputCls}
          />
        </div>
      </div>

      {/* Row 4 — Pagamento + Status */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Forma de pagamento *</label>
          <select value={formaPagamento}
            onChange={(e) => setFormaPagamento(e.target.value as Appointment["forma_pagamento"])}
            className={selectCls}>
            <option value="pix">Pix</option>
            <option value="cartão de crédito">Cartão de Crédito</option>
            <option value="cartão de débito">Cartão de Débito</option>
            <option value="dinheiro">Dinheiro</option>
            <option value="transferência bancária">Transferência Bancária</option>
          </select>
        </div>
        <div>
          <label className={labelCls}>Status *</label>
          <select value={status}
            onChange={(e) => setStatus(e.target.value as Appointment["status"])}
            className={selectCls}>
            <option value="agendado" disabled={isPastDateTime}>Agendado{isPastDateTime ? " (data passada)" : ""}</option>
            <option value="atrasado" disabled={isFutureDateTime}>Atrasado{isFutureDateTime ? " (data futura)" : ""}</option>
            <option value="concluido">Concluído</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
      </div>

      {/* Observações + Online */}
      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <div>
          <label className={labelCls}>Observações</label>
          <input
            type="text"
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            maxLength={200}
            placeholder="Observações opcionais..."
            className={inputCls}
          />
        </div>
        <div className="flex items-end pb-0.5">
          <label className="flex cursor-pointer items-center gap-2 rounded border border-gray-200 px-4 py-2 text-sm text-gray-600 transition hover:bg-gray-50">
            <input
              type="checkbox"
              checked={online}
              onChange={(e) => setOnline(e.target.checked)}
              className="h-4 w-4 accent-[#1c46f3]"
            />
            Online
          </label>
        </div>
      </div>

      {/* Serviços */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className={labelCls}>Serviços *</label>
          {servicoIdsSelecionados.length > 0 && (
            <span className="text-xs font-semibold text-[#1c46f3]">
              Total: R$ {valorTotal.toFixed(2)}
            </span>
          )}
        </div>

        {loadingRelacionamentos ? (
          <p className="rounded border border-gray-100 bg-gray-50 px-3 py-3 text-sm text-gray-400">
            Carregando serviços...
          </p>
        ) : servicosSorted.length === 0 ? (
          <p className="rounded border border-dashed border-gray-200 px-3 py-3 text-sm text-gray-400">
            Nenhum serviço cadastrado.
          </p>
        ) : (
          <div className="grid gap-1.5 sm:grid-cols-2">
            {servicosSorted.map((s) => {
              const checked = servicoIdsSelecionados.includes(s.id);
              return (
                <label
                  key={s.id}
                  className={`flex cursor-pointer items-center justify-between rounded border px-3 py-2 text-sm transition ${
                    checked
                      ? "border-[#1c46f3] bg-[#1c46f3]/8 text-[#1c46f3]"
                      : "border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleServico(s.id)}
                      className="h-4 w-4 accent-[#1c46f3]"
                    />
                    <span className="font-medium">{s.nome}</span>
                  </div>
                  <span className={`text-xs font-semibold ${checked ? "text-[#1c46f3]" : "text-gray-400"}`}>
                    R$ {getPrecoSeguro(s.preco).toFixed(2)}
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          className="flex items-center gap-2 rounded bg-gradient-to-r from-[#1c46f3] to-[#1840e0] px-5 py-2 text-sm font-semibold text-white shadow-sm shadow-[#1c46f3]/20 transition hover:opacity-90"
        >
          <Plus size={14} />
          {appointmentBeingEdited ? "Salvar alterações" : "Cadastrar"}
        </button>
        {appointmentBeingEdited && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="rounded border border-gray-200 px-5 py-2 text-sm font-medium text-gray-500 transition hover:bg-gray-50"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
