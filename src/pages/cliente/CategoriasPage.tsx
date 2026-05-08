import { useEffect, useState } from "react";
import { LayoutGrid } from "lucide-react";
import { getCategories } from "../../services/categoriaService";
import type { Categoria } from "../../types/categoria";

export default function ClienteCategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategories()
      .then(setCategorias)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Categorias</h1>
        <p className="mt-0.5 text-sm text-gray-500">Tipos de pet atendidos pelo nosso petshop.</p>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center text-sm text-gray-400">
          Carregando categorias...
        </div>
      ) : categorias.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center">
          <LayoutGrid size={36} className="mx-auto mb-3 text-gray-200" />
          <p className="text-sm text-gray-400">Nenhuma categoria disponível no momento.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categorias.map((cat) => (
            <div
              key={cat.id}
              className="flex items-start gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#00bb69]/15 to-[#00bb69]/5">
                <LayoutGrid size={18} className="text-[#00bb69]" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-gray-900">{cat.name}</h3>
                {cat.description && (
                  <p className="mt-1 text-sm text-gray-500 leading-relaxed">{cat.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
