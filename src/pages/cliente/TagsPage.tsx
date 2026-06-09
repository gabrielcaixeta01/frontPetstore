import { useEffect, useState } from "react";
import TagList from "../../components/tag/TagList";
import { getTags } from "../../services/tagService";
import { getPets } from "../../services/petService";
import type { Etiqueta } from "../../types/tag";

const TEAL  = "#0D7377";
const COAL  = "#1E293B";
const BORD  = "#E2E8F0";
const MUTED = "#64748B";

export default function ClienteTagsPage() {
  const [tags, setTags]                   = useState<Etiqueta[]>([]);
  const [petCountByTag, setPetCountByTag] = useState<Record<number, number>>({});
  const [loading, setLoading]             = useState(true);

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
      <div className="mx-auto max-w-6xl space-y-6">

        {/* Header */}
        <div>
          <span className="mb-1 inline-block text-xs font-bold uppercase tracking-widest" style={{ color: TEAL }}>
            Classificações
          </span>
          <h1 className="text-2xl font-extrabold" style={{ color: COAL }}>Tags</h1>
          <p className="mt-0.5 text-sm" style={{ color: MUTED }}>
            Classificações utilizadas para organizar os pets do sistema.
          </p>
        </div>

        {loading ? (
          <div
            className="p-8 text-center text-sm"
            style={{ border: `1px solid ${BORD}`, borderRadius: "8px", background: "#fff", color: MUTED }}
          >
            Carregando tags...
          </div>
        ) : (
          <TagList tags={tags} cards petCountByTag={petCountByTag} />
        )}
      </div>
    </div>
  );
}
