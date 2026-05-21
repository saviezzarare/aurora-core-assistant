import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function MapaRegional() {
  const [grupos, setGrupos] = useState<{ cidade: string; total: number; score: number }[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("prospected_companies").select("cidade,lead_score");
      const map = new Map<string, { total: number; soma: number }>();
      for (const r of data || []) {
        const c = r.cidade || "Sem cidade";
        const e = map.get(c) || { total: 0, soma: 0 };
        e.total++; e.soma += r.lead_score || 0;
        map.set(c, e);
      }
      const arr = Array.from(map.entries())
        .map(([cidade, v]) => ({ cidade, total: v.total, score: Math.round(v.soma / v.total) }))
        .sort((a, b) => b.total - a.total);
      setGrupos(arr);
    })();
  }, []);

  const max = Math.max(...grupos.map((g) => g.total), 1);

  return (
    <div className="h-full overflow-y-auto px-6 py-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-light text-primary tracking-wide">Mapa Regional</h2>
          <p className="text-xs text-muted-foreground mt-1">Distribuição de empresas prospectadas por cidade</p>
        </div>

        {grupos.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-20">Nenhum dado regional ainda.</p>
        ) : (
          <div className="space-y-2">
            {grupos.map((g, i) => (
              <motion.div key={g.cidade} initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                className="bg-card/40 border border-border/30 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">{g.cidade}</span>
                  <span className="text-[10px] text-muted-foreground ml-auto">{g.total} empresa(s) · score médio {g.score}</span>
                </div>
                <div className="h-1.5 bg-background/40 rounded-full overflow-hidden">
                  <motion.div className="h-full bg-primary/60 rounded-full"
                    initial={{ width: 0 }} animate={{ width: `${(g.total / max) * 100}%` }} transition={{ duration: 0.6 }} />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
