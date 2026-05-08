import { useEffect, useState } from "react";
import { Tag } from "lucide-react";
import { getTags } from "../../services/tagService";
import type { Etiqueta } from "../../types/tag";

const tagColors = [
  "bg-blue-50 text-blue-700 border-blue-200",
  "bg-emerald-50 text-emerald-700 border-emerald-200",
  "bg-purple-50 text-purple-700 border-purple-200",
  "bg-yellow-50 text-yellow-700 border-yellow-200",
  "bg-pink-50 text-pink-700 border-pink-200",
  "bg-orange-50 text-orange-700 border-orange-200",
];

export default function ClienteTagsPage() {
  const [tags, setTags] = useState<Etiqueta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTags()
      .then(setTags)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tags</h1>
        <p className="mt-0.5 text-sm text-gray-500">Classificações utilizadas para organizar os pets do sistema.</p>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center text-sm text-gray-400">
          Carregando tags...
        </div>
      ) : tags.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center">
          <Tag size={36} className="mx-auto mb-3 text-gray-200" />
          <p className="text-sm text-gray-400">Nenhuma tag disponível no momento.</p>
        </div>
      ) : (
        <>
          {/* Tag pills */}
          <div className="mb-6 flex flex-wrap gap-2">
            {tags.map((tag, i) => (
              <span
                key={tag.id}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium ${tagColors[i % tagColors.length]}`}
              >
                <Tag size={12} />
                {tag.nome}
              </span>
            ))}
          </div>

          {/* Tag cards with description */}
          {tags.some((t) => t.descricao) && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {tags.filter((t) => t.descricao).map((tag, i) => (
                <div
                  key={tag.id}
                  className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
                >
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${tagColors[i % tagColors.length]}`}>
                    <Tag size={10} />
                    {tag.nome}
                  </span>
                  <p className="mt-2 text-sm text-gray-500 leading-relaxed">{tag.descricao}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
