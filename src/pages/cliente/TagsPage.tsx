import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import TagList from "../../components/tag/TagList";
import { getTags } from "../../services/tagService";
import type { Etiqueta } from "../../types/tag";

export default function ClienteTagsPage() {
  const [tags, setTags] = useState<Etiqueta[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadTags() {
    try {
      setLoading(true);
      const data = await getTags();
      setTags(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTags();
  }, []);

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tags</h1>
            <p className="mt-0.5 text-sm text-gray-500">Classificações utilizadas para organizar os pets do sistema.</p>
          </div>
          <button
            onClick={loadTags}
            className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
          >
            <RefreshCw size={14} />
            Atualizar
          </button>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center text-sm text-gray-400">
            Carregando tags...
          </div>
        ) : (
          <TagList tags={tags} compact />
        )}
      </div>
    </div>
  );
}
