import { useEffect, useState } from "react";
import { apexTheme } from "../../lib/theme";
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

export default function AppointmentForm({
  appointmentBeingEdited,
  onCreate,
  onUpdate,
  onCancelEdit,
}: AppointmentFormProps) {
  const c = apexTheme.colors;
  const [lojas, setLojas] = useState<Loja[]>([]);
  const [clientes, setClientes] = useState<Usuario[]>([]);
  const [funcionarios, setFuncionarios] = useState<Usuario[]>([]);
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
  const [observacoes, setObservacoes] = useState(
    appointmentBeingEdited?.observacoes ?? ""
  );
  const [lojaId, setLojaId] = useState(
    appointmentBeingEdited?.loja_id !== undefined && appointmentBeingEdited?.loja_id !== null
      ? String(appointmentBeingEdited.loja_id)
      : ""
  );
  const [clienteId, setClienteId] = useState(
    appointmentBeingEdited?.cliente_id !== undefined &&
      appointmentBeingEdited?.cliente_id !== null
      ? String(appointmentBeingEdited.cliente_id)
      : ""
  );
  const [funcionarioId, setFuncionarioId] = useState(
    appointmentBeingEdited?.funcionario_id !== undefined &&
      appointmentBeingEdited?.funcionario_id !== null
      ? String(appointmentBeingEdited.funcionario_id)
      : ""
  );
  const [petId, setPetId] = useState(
    appointmentBeingEdited?.pet_id !== undefined && appointmentBeingEdited?.pet_id !== null
      ? String(appointmentBeingEdited.pet_id)
      : ""
  );
  const [servicoIdsSelecionados, setServicoIdsSelecionados] = useState<number[]>([]);

  function getPrecoSeguro(preco: number): number {
    const valor = Number(preco);
    return Number.isFinite(valor) ? valor : 0;
  }

  useEffect(() => {
    async function loadRelacionamentos() {
      try {
        setLoadingRelacionamentos(true);

        const [lojasData, usuariosData, petsData, servicosData] = await Promise.all([
          getLojas(),
          getUsuarios(),
          getPets(),
          getServicos(),
        ]);

        setLojas(lojasData);
        setClientes(usuariosData.filter((u) => u.tipo_perfil === "cliente"));
        setFuncionarios(usuariosData.filter((u) => u.tipo_perfil === "funcionario"));
        setPets(petsData);
        setServicos(servicosData);
      } catch (error) {
        console.error("Erro ao carregar relacionamentos e servicos:", error);
      } finally {
        setLoadingRelacionamentos(false);
      }
    }

    loadRelacionamentos();
  }, []);

  useEffect(() => {
    if (appointmentBeingEdited) {
      setLojaId(String(appointmentBeingEdited.loja_id ?? ""));
      setClienteId(String(appointmentBeingEdited.cliente_id ?? ""));
      setFuncionarioId(String(appointmentBeingEdited.funcionario_id ?? ""));
      setPetId(String(appointmentBeingEdited.pet_id ?? ""));
      setServicoIdsSelecionados(appointmentBeingEdited.items?.map((item) => item.service_id) ?? []);
    } else {
      if (!lojaId && lojas.length > 0) setLojaId(String(lojas[0].id));
      if (!clienteId && clientes.length > 0) setClienteId(String(clientes[0].id));
      if (!funcionarioId && funcionarios.length > 0) {
        setFuncionarioId(String(funcionarios[0].id));
      }
      setServicoIdsSelecionados([]);
    }
  }, [appointmentBeingEdited, lojas, clientes, funcionarios, lojaId, clienteId, funcionarioId]);

  useEffect(() => {
    if (appointmentBeingEdited) return;

    const petsDoCliente = clienteId
      ? pets.filter((pet) => String(pet.dono_id) === clienteId)
      : [];

    if (petsDoCliente.length === 0) {
      setPetId("");
      return;
    }

    if (!petId || !petsDoCliente.some((pet) => String(pet.id) === petId)) {
      setPetId(String(petsDoCliente[0].id));
    }
  }, [appointmentBeingEdited, clienteId, pets, petId]);

  const valorTotalSelecionado = servicoIdsSelecionados.reduce((total, servicoId) => {
    const servico = servicos.find((item) => item.id === servicoId);
    return total + getPrecoSeguro(servico?.preco ?? 0);
  }, 0);

  function toggleServico(servicoId: number) {
    setServicoIdsSelecionados((atual) => {
      if (atual.includes(servicoId)) {
        return atual.filter((id) => id !== servicoId);
      }

      return [...atual, servicoId];
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!lojaId.trim() || !clienteId.trim() || !funcionarioId.trim() || !petId.trim()) {
      alert("Informe loja, cliente, funcionario e pet.");
      return;
    }

    if (servicoIdsSelecionados.length === 0) {
      alert("Selecione pelo menos um servico para o atendimento.");
      return;
    }

    const petsDoCliente = pets.filter((pet) => String(pet.dono_id) === clienteId);
    if (petsDoCliente.length === 0) {
      alert("O cliente selecionado nao possui pets cadastrados.");
      return;
    }

    if (!petsDoCliente.some((pet) => String(pet.id) === petId)) {
      alert("Selecione um pet pertencente ao cliente informado.");
      return;
    }

    if (appointmentBeingEdited) {
      const payload: UpdateAppointmentDTO = {
        forma_pagamento: formaPagamento,
        status,
        online,
        observacoes: observacoes.trim() || undefined,
        loja_id: Number(lojaId),
        cliente_id: Number(clienteId),
        funcionario_id: Number(funcionarioId),
        pet_id: Number(petId),
      };
      await onUpdate(appointmentBeingEdited.id, payload, servicoIdsSelecionados);
      return;
    }

    const payload: CreateAppointmentDTO = {
      forma_pagamento: formaPagamento,
      status,
      online,
      observacoes: observacoes.trim() || undefined,
      loja_id: Number(lojaId),
      cliente_id: Number(clienteId),
      funcionario_id: Number(funcionarioId),
      pet_id: Number(petId),
    };

    await onCreate(payload, servicoIdsSelecionados);
    setFormaPagamento("pix");
    setStatus("agendado");
    setOnline(false);
    setObservacoes("");
    setLojaId(lojas.length > 0 ? String(lojas[0].id) : "");
    setClienteId(clientes.length > 0 ? String(clientes[0].id) : "");
    setFuncionarioId(funcionarios.length > 0 ? String(funcionarios[0].id) : "");
    setPetId("");
    setServicoIdsSelecionados([]);
  }

  const petsDoCliente = clienteId
    ? pets.filter((pet) => String(pet.dono_id) === clienteId)
    : [];

  return (
    <form
      key={appointmentBeingEdited?.id ?? "new"}
      onSubmit={handleSubmit}
      className={`space-y-4 rounded-2xl border p-6 shadow-lg ${c.border} ${c.card}`}
    >
      <h2 className={`text-2xl font-bold ${c.text}`}>
        {appointmentBeingEdited ? "Editar Atendimento" : "Cadastrar Atendimento"}
      </h2>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="formaPagamento" className={`mb-1 block text-sm ${c.textSoft}`}>
            Forma de pagamento
          </label>
          <select
            id="formaPagamento"
            value={formaPagamento}
            onChange={(e) => setFormaPagamento(e.target.value as Appointment["forma_pagamento"])}
            className={`w-full rounded-xl border px-4 py-3 outline-none ${c.border} ${c.cardSoft} ${c.text} focus:ring-2 focus:ring-[#1c46f3]`}
          >
            <option value="pix">pix</option>
            <option value="cartao_credito">cartao_credito</option>
            <option value="cartao_debito">cartao_debito</option>
            <option value="dinheiro">dinheiro</option>
          </select>
        </div>

        <div>
          <label htmlFor="status" className={`mb-1 block text-sm ${c.textSoft}`}>
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as Appointment["status"])}
            className={`w-full rounded-xl border px-4 py-3 outline-none ${c.border} ${c.cardSoft} ${c.text} focus:ring-2 focus:ring-[#1c46f3]`}
          >
            <option value="agendado">agendado</option>
            <option value="concluido">concluido</option>
            <option value="cancelado">cancelado</option>
          </select>
        </div>

        <div>
          <label htmlFor="lojaId" className={`mb-1 block text-sm ${c.textSoft}`}>
            Loja
          </label>
          <select
            id="lojaId"
            value={lojaId}
            onChange={(e) => setLojaId(e.target.value)}
            disabled={loadingRelacionamentos || lojas.length === 0}
            required
            className={`w-full rounded-xl border px-4 py-3 outline-none ${c.border} ${c.cardSoft} ${c.text} focus:ring-2 focus:ring-[#1c46f3] disabled:opacity-60`}
          >
            {loadingRelacionamentos ? (
              <option value="">Carregando lojas...</option>
            ) : lojas.length === 0 ? (
              <option value="">Nenhuma loja encontrada</option>
            ) : (
              lojas.map((loja) => (
                <option key={loja.id} value={String(loja.id)}>
                  {loja.nome}
                </option>
              ))
            )}
          </select>
        </div>

        <div>
          <label htmlFor="clienteId" className={`mb-1 block text-sm ${c.textSoft}`}>
            Cliente
          </label>
          <select
            id="clienteId"
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
            disabled={loadingRelacionamentos || clientes.length === 0}
            required
            className={`w-full rounded-xl border px-4 py-3 outline-none ${c.border} ${c.cardSoft} ${c.text} focus:ring-2 focus:ring-[#1c46f3] disabled:opacity-60`}
          >
            {loadingRelacionamentos ? (
              <option value="">Carregando clientes...</option>
            ) : clientes.length === 0 ? (
              <option value="">Nenhum cliente encontrado</option>
            ) : (
              clientes.map((cliente) => (
                <option key={cliente.id} value={String(cliente.id)}>
                  {cliente.nome}
                </option>
              ))
            )}
          </select>
        </div>

        <div>
          <label htmlFor="funcionarioId" className={`mb-1 block text-sm ${c.textSoft}`}>
            Funcionario
          </label>
          <select
            id="funcionarioId"
            value={funcionarioId}
            onChange={(e) => setFuncionarioId(e.target.value)}
            disabled={loadingRelacionamentos || funcionarios.length === 0}
            required
            className={`w-full rounded-xl border px-4 py-3 outline-none ${c.border} ${c.cardSoft} ${c.text} focus:ring-2 focus:ring-[#1c46f3] disabled:opacity-60`}
          >
            {loadingRelacionamentos ? (
              <option value="">Carregando funcionarios...</option>
            ) : funcionarios.length === 0 ? (
              <option value="">Nenhum funcionario encontrado</option>
            ) : (
              funcionarios.map((funcionario) => (
                <option key={funcionario.id} value={String(funcionario.id)}>
                  {funcionario.nome}
                </option>
              ))
            )}
          </select>
        </div>

        <div>
          <label htmlFor="petId" className={`mb-1 block text-sm ${c.textSoft}`}>
            Pet
          </label>
          <select
            id="petId"
            value={petId}
            onChange={(e) => setPetId(e.target.value)}
            disabled={loadingRelacionamentos || petsDoCliente.length === 0}
            required
            className={`w-full rounded-xl border px-4 py-3 outline-none ${c.border} ${c.cardSoft} ${c.text} focus:ring-2 focus:ring-[#1c46f3] disabled:opacity-60`}
          >
            {loadingRelacionamentos ? (
              <option value="">Carregando pets...</option>
            ) : !clienteId ? (
              <option value="">Selecione um cliente primeiro</option>
            ) : petsDoCliente.length === 0 ? (
              <option value="">Nenhum pet para este cliente</option>
            ) : (
              <>
                <option value="">Selecione</option>
                {petsDoCliente.map((pet) => (
                  <option key={pet.id} value={String(pet.id)}>
                    {pet.nome}
                  </option>
                ))}
              </>
            )}
          </select>
        </div>

        <div>
          <label htmlFor="observacoes" className={`mb-1 block text-sm ${c.textSoft}`}>
            Observacoes
          </label>
          <textarea
            id="observacoes"
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            rows={3}
            className={`w-full rounded-xl border px-4 py-3 outline-none ${c.border} ${c.cardSoft} ${c.text} focus:ring-2 focus:ring-[#1c46f3]`}
          />
        </div>

        <div className="flex items-center gap-3 pt-8">
          <input
            id="online"
            type="checkbox"
            checked={online}
            onChange={(e) => setOnline(e.target.checked)}
            className="h-4 w-4"
          />
          <label htmlFor="online" className={`text-sm ${c.textSoft}`}>
            Online
          </label>
        </div>

        <div className="md:col-span-2">
          <div className="mb-2 flex items-center justify-between">
            <label className={`block text-sm ${c.textSoft}`}>Servicos do atendimento</label>
            <span className={`text-sm font-semibold ${c.text}`}>
              Total selecionado: R$ {valorTotalSelecionado.toFixed(2)}
            </span>
          </div>

          {loadingRelacionamentos ? (
            <div className={`rounded-xl border px-4 py-3 text-sm ${c.border} ${c.cardSoft} ${c.textSoft}`}>
              Carregando servicos...
            </div>
          ) : servicos.length === 0 ? (
            <div className={`rounded-xl border px-4 py-3 text-sm ${c.border} ${c.cardSoft} ${c.textSoft}`}>
              Nenhum servico encontrado.
            </div>
          ) : (
            <div className={`grid gap-2 rounded-xl border p-3 ${c.border} ${c.cardSoft}`}>
              {servicos.map((servico) => {
                const checked = servicoIdsSelecionados.includes(servico.id);

                return (
                  <label
                    key={servico.id}
                    className={`flex cursor-pointer items-center justify-between rounded-lg border px-3 py-2 transition ${checked ? "border-[#1c46f3] bg-[#1c46f3]/10" : `${c.border} ${c.card}`}`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleServico(servico.id)}
                        className="h-4 w-4"
                      />
                      <span className={`font-medium ${c.text}`}>{servico.nome}</span>
                    </div>
                    <span className={`text-sm ${c.textSoft}`}>
                      R$ {getPrecoSeguro(servico.preco).toFixed(2)}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          className={`rounded-xl px-5 py-3 font-semibold transition hover:opacity-90 ${c.primary} ${c.primaryText}`}
        >
          {appointmentBeingEdited ? "Salvar alteracoes" : "Cadastrar"}
        </button>

        {appointmentBeingEdited && (
          <button
            type="button"
            onClick={onCancelEdit}
            className={`rounded-xl border px-5 py-3 font-semibold transition ${c.border} ${c.text} hover:${c.bgSoft}`}
          >
            Cancelar edicao
          </button>
        )}
      </div>
    </form>
  );
}
