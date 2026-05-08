import { useEffect, useState } from "react";
import { Scissors } from "lucide-react";
import { getServicos } from "../../services/servicoService";
import type { Servico } from "../../types/servico";

export default function ClienteServicosPage() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getServicos()
      .then(setServicos)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Serviços</h1>
        <p className="mt-0.5 text-sm text-gray-500">Conheça todos os serviços que oferecemos para o seu pet.</p>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center text-sm text-gray-400">
          Carregando serviços...
        </div>
      ) : servicos.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center">
          <Scissors size={36} className="mx-auto mb-3 text-gray-200" />
          <p className="text-sm text-gray-400">Nenhum serviço disponível no momento.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {servicos.map((s) => (
            <div
              key={s.id}
              className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-yellow-100">
                  <Scissors size={18} className="text-yellow-600" />
                </div>
                <h3 className="font-bold text-gray-900">{s.nome}</h3>
              </div>
              {s.descricao && (
                <p className="text-sm text-gray-500 leading-relaxed">{s.descricao}</p>
              )}
              <div className="mt-auto flex items-center justify-between border-t border-gray-50 pt-3">
                <span className="text-xs text-gray-400">Preço</span>
                <span className="text-lg font-bold text-[#1c46f3]">
                  R$ {Number(s.preco).toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
