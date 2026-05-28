import { useEffect, useState } from "react";
import TagList from "../../components/tag/TagList";
import { getTags } from "../../services/tagService";
import { getPets } from "../../services/petService";
import type { Etiqueta } from "../../types/tag";

export default function ClienteTagsPage() {
  const [tags, setTags] = useState<Etiqueta[]>([]);
  const [petCountByTag, setPetCountByTag] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [tagData, petData] = await Promise.all([
          getTags(),
          getPets().catch(() => []),
        ]);
        setTags(tagData);
        const counts: Record<number, number> = {};
        petData.forEach((p) => {
          p.tags?.forEach((t) => { counts[t.id] = (counts[t.id] ?? 0) + 1; });
        });
        setPetCountByTag(counts);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Tags</h1>
          <p className="mt-0.5 text-sm text-gray-500">Classificações utilizadas para organizar os pets do sistema.</p>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center text-sm text-gray-400">
            Carregando tags...
          </div>
        ) : (
          <TagList tags={tags} cards petCountByTag={petCountByTag} />
        )}
      </div>
    </div>
  );
}
