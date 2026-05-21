import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { History } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function HistoricoBuscas() {
  const [buscas, setBuscas] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("prospection_searches").select("*").order("created_at", { ascending: false }).limit(50);
      setBuscas(data || []);
    })();
  }, []);

  return (
    <div className="h-full overflow-y-auto px-6 py-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-light text-primary tracking-wide">Histórico de Buscas</h2>
          <p className="text-xs text-muted-foreground mt-1">Últimas {buscas.length} buscas realizadas</p>
        </div>

        {buscas.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-20">Nenhuma busca registrada.</p>
        ) : (
          <div className="space-y-2">
            {buscas.map((b) => (
              <motion.div key={b.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex items-center gap-3 p-3 bg-card/30 border border-border/30 rounded-lg">
                <History className="w-4 h-4 text-primary" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm">
                    <span className="text-primary">{b.segmento}</span>
                    <span className="text-muted-foreground"> em </span>
                    <span>{b.cidade}/{b.estado}</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">
                    {new Date(b.created_at).toLocaleString("pt-BR")} · {b.total_encontrado} resultado(s) · {b.status}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
