import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Building2, Loader2, Trash2, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function EmpresasProspectadas() {
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroQ, setFiltroQ] = useState("");

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("prospected_companies")
      .select("*")
      .order("lead_score", { ascending: false })
      .limit(200);
    setEmpresas(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const remover = async (id: string) => {
    await supabase.from("prospected_companies").delete().eq("id", id);
    setEmpresas((prev) => prev.filter((e) => e.id !== id));
    toast.success("Empresa removida");
  };

  const filtered = empresas.filter((e) => {
    if (!filtroQ) return true;
    const q = filtroQ.toLowerCase();
    return (
      e.nome?.toLowerCase().includes(q) ||
      e.cidade?.toLowerCase().includes(q) ||
      e.segmento?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="h-full overflow-y-auto px-6 py-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-light text-primary tracking-wide">Empresas Prospectadas</h2>
            <p className="text-xs text-muted-foreground mt-1">{empresas.length} empresa(s) na base · ordenadas por lead score</p>
          </div>
          <input
            placeholder="Filtrar por nome, cidade ou segmento..."
            value={filtroQ} onChange={(e) => setFiltroQ(e.target.value)}
            className="bg-background/40 border border-border/40 rounded-md px-3 py-1.5 text-xs w-64 focus:border-primary/60 outline-none"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-sm text-muted-foreground">
            Nenhuma empresa prospectada ainda. Use a aba <span className="text-primary">Buscar Empresas</span> para iniciar.
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((emp) => (
              <motion.div key={emp.id}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="flex items-center gap-3 p-3 bg-card/30 border border-border/30 rounded-lg hover:border-primary/30 transition-colors group">
                <Building2 className="w-5 h-5 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-medium truncate">{emp.nome}</h4>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider ${
                      emp.qualificacao === "quente" ? "bg-orange-500/20 text-orange-400" :
                      emp.qualificacao === "morno" ? "bg-yellow-500/20 text-yellow-400" :
                      "bg-blue-500/20 text-blue-400"
                    }`}>{emp.qualificacao}</span>
                    <span className="text-[10px] text-muted-foreground">{emp.cidade}/{emp.estado}</span>
                    {emp.segmento && <span className="text-[10px] text-muted-foreground">· {emp.segmento}</span>}
                  </div>
                  {emp.observacoes && <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{emp.observacoes}</p>}
                </div>
                {emp.site && (
                  <a href={emp.site} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary p-1">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                <div className="text-right w-16">
                  <div className="text-lg font-light text-primary">{emp.lead_score}</div>
                </div>
                <button onClick={() => remover(emp.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive p-1">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
