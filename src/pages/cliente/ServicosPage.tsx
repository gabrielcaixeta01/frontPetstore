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
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
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
              className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:border-[#1c46f3]/25 hover:shadow-md"
            >
              {/* Accent bar */}
              <div className="h-1 bg-gradient-to-r from-[#1c46f3] to-[#00bb69]" />

              <div className="flex flex-1 flex-col p-5">
                {/* Icon + name + desc */}
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1c46f3]/10 transition group-hover:bg-[#1c46f3]/15">
                    <Scissors size={16} className="text-[#1c46f3]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold leading-snug text-gray-900">{s.nome}</h3>
                    {s.descricao && (
                      <p className="mt-1 text-xs leading-relaxed text-gray-400 line-clamp-2">{s.descricao}</p>
                    )}
                  </div>
                </div>

                {/* Footer: price */}
                <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-3">
                  <p className="text-xs text-gray-400">Preço</p>
                  <p className="text-base font-medium text-[#1c46f3]">
                    R$ {Number(s.preco).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
