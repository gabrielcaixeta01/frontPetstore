import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
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
};

const selectCls = "w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none transition focus:border-[#1c46f3] focus:bg-white focus:ring-2 focus:ring-[#1c46f3]/15 disabled:opacity-60 appearance-none";
const inputCls  = "w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none transition focus:border-[#1c46f3] focus:bg-white focus:ring-2 focus:ring-[#1c46f3]/15";
const labelCls  = "mb-1 block text-xs font-medium text-gray-500";

export default function AppointmentForm({
  appointmentBeingEdited,
  onCreate,
  onUpdate,
  onCancelEdit,
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
    if (!lojaId && lojas.length > 0) setLojaId(String(lojas[0].id));
    if (!clienteId && clientes.length > 0) setClienteId(String(clientes[0].id));
  }, [appointmentBeingEdited, lojas, clientes, lojaId, clienteId]);

  useEffect(() => {
    const petsDoCliente = clienteId ? pets.filter((p) => String(p.dono_id) === clienteId) : [];
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
    const petsDoCliente = pets.filter((p) => String(p.dono_id) === clienteId);
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
        data_atendimento: data && hora ? `${data}T${hora}:00` : undefined,
      };
      await onUpdate(appointmentBeingEdited.id, payload, servicoIdsSelecionados);
      return;
    }

    const payload: CreateAppointmentDTO = {
      forma_pagamento: formaPagamento, status, online,
      observacoes: observacoes.trim() || undefined,
      loja_id: Number(lojaId), cliente_id: Number(clienteId),
      funcionario_id: Number(funcionarioId), pet_id: Number(petId),
      data_atendimento: `${data}T${hora}:00`,
    };
    await onCreate(payload, servicoIdsSelecionados);
    setFormaPagamento("pix"); setStatus("agendado"); setOnline(false); setObservacoes("");
    setLojaId(lojas.length > 0 ? String(lojas[0].id) : "");
    setClienteId(clientes.length > 0 ? String(clientes[0].id) : "");
    setPetId(""); setServicoIdsSelecionados([]);
    setData(""); setHora("");
  }

  const petsDoCliente = clienteId ? pets.filter((p) => String(p.dono_id) === clienteId) : [];

  return (
    <form
      key={appointmentBeingEdited?.id ?? "new"}
      onSubmit={handleSubmit}
      className="space-y-5 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
    >
      <h2 className="text-sm font-semibold text-gray-700">
        {appointmentBeingEdited ? "Editar Atendimento" : "Novo Atendimento"}
      </h2>

      {/* Row 1 — Loja + Cliente */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Loja *</label>
          <select value={lojaId} onChange={(e) => setLojaId(e.target.value)}
            disabled={loadingRelacionamentos || lojas.length === 0} className={selectCls}>
            {loadingRelacionamentos ? <option value="">Carregando...</option>
              : lojas.length === 0 ? <option value="">Nenhuma loja</option>
              : lojas.map((l) => <option key={l.id} value={String(l.id)}>{l.nome}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Cliente *</label>
          <select value={clienteId} onChange={(e) => setClienteId(e.target.value)}
            disabled={loadingRelacionamentos || clientes.length === 0} className={selectCls}>
            {loadingRelacionamentos ? <option value="">Carregando...</option>
              : clientes.length === 0 ? <option value="">Nenhum cliente</option>
              : clientes.map((c) => <option key={c.id} value={String(c.id)}>{c.nome}</option>)}
          </select>
        </div>
      </div>

      {/* Row 2 — Funcionário + Pet */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Funcionário *</label>
          <select value={funcionarioId} onChange={(e) => setFuncionarioId(e.target.value)}
            disabled={loadingRelacionamentos || funcionariosDaLoja.length === 0} className={selectCls}>
            {loadingRelacionamentos ? <option value="">Carregando...</option>
              : !lojaSelecionada ? <option value="">Selecione uma loja primeiro</option>
              : funcionariosDaLoja.length === 0 ? <option value="">Nenhum funcionário</option>
              : funcionariosDaLoja.map((f) => (
                  <option key={f.usuario_id} value={String(f.usuario_id)}>
                    {f.nome}{f.cargo ? ` — ${f.cargo}` : ""}
                  </option>
                ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Pet *</label>
          <select value={petId} onChange={(e) => setPetId(e.target.value)}
            disabled={loadingRelacionamentos || petsDoCliente.length === 0} className={selectCls}>
            {loadingRelacionamentos ? <option value="">Carregando...</option>
              : !clienteId ? <option value="">Selecione um cliente primeiro</option>
              : petsDoCliente.length === 0 ? <option value="">Nenhum pet neste cliente</option>
              : <>
                  <option value="">Selecionar...</option>
                  {petsDoCliente.map((p) => <option key={p.id} value={String(p.id)}>{p.nome}</option>)}
                </>}
          </select>
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
          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-600 transition hover:bg-gray-50">
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
          <p className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-3 text-sm text-gray-400">
            Carregando serviços...
          </p>
        ) : servicos.length === 0 ? (
          <p className="rounded-xl border border-dashed border-gray-200 px-3 py-3 text-sm text-gray-400">
            Nenhum serviço cadastrado.
          </p>
        ) : (
          <div className="grid gap-1.5 sm:grid-cols-2">
            {servicos.map((s) => {
              const checked = servicoIdsSelecionados.includes(s.id);
              return (
                <label
                  key={s.id}
                  className={`flex cursor-pointer items-center justify-between rounded-xl border px-3 py-2.5 text-sm transition ${
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
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#1c46f3] to-[#1840e0] px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-[#1c46f3]/20 transition hover:opacity-90"
        >
          <Plus size={14} />
          {appointmentBeingEdited ? "Salvar alterações" : "Cadastrar"}
        </button>
        {appointmentBeingEdited && (
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
