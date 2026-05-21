import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Loader2, Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const SEGMENTOS_SUGERIDOS = [
  "Clínicas médicas", "Indústrias", "Escritórios de advocacia",
  "Laboratórios", "Escritórios contábeis", "Consultórios odontológicos",
  "Farmácias", "Construtoras", "Concessionárias",
];

const CIDADES_CARTEIRA = ["Bauru", "Jaú", "Lençóis Paulista", "Agudos", "Pederneiras"];

export default function BuscaProspeccao() {
  const [cidade, setCidade] = useState("Bauru");
  const [estado, setEstado] = useState("SP");
  const [segmento, setSegmento] = useState("");
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [resultados, setResultados] = useState<any[]>([]);

  const buscar = async () => {
    if (!segmento.trim()) {
      toast.error("Informe um segmento");
      return;
    }
    setLoading(true);
    setResultados([]);
    try {
      const { data, error } = await supabase.functions.invoke("prospect-companies", {
        body: { cidade, estado, segmento, limit },
      });
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Falha na busca");
      setResultados(data.empresas || []);
      toast.success(`${data.total} empresa(s) prospectadas em ${cidade}`);
    } catch (e: any) {
      toast.error(e.message || "Erro ao buscar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto px-6 py-4">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-light text-primary tracking-wide">Buscar Empresas</h2>
          <p className="text-xs text-muted-foreground mt-1">Motor de prospecção regional — Firecrawl + qualificação automática</p>
        </div>

        <div className="bg-card/40 border border-primary/15 rounded-xl p-5 backdrop-blur-md space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Cidade</label>
              <input
                value={cidade} onChange={(e) => setCidade(e.target.value)}
                list="cidades-list"
                className="w-full mt-1 bg-background/40 border border-border/40 rounded-md px-3 py-2 text-sm focus:border-primary/60 outline-none"
              />
              <datalist id="cidades-list">
                {CIDADES_CARTEIRA.map((c) => <option key={c} value={c} />)}
              </datalist>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Estado</label>
              <input
                value={estado} onChange={(e) => setEstado(e.target.value.toUpperCase().slice(0, 2))}
                className="w-full mt-1 bg-background/40 border border-border/40 rounded-md px-3 py-2 text-sm focus:border-primary/60 outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Quantidade</label>
              <input
                type="number" min={1} max={20}
                value={limit} onChange={(e) => setLimit(Number(e.target.value))}
                className="w-full mt-1 bg-background/40 border border-border/40 rounded-md px-3 py-2 text-sm focus:border-primary/60 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Segmento</label>
            <input
              value={segmento} onChange={(e) => setSegmento(e.target.value)}
              list="segmentos-list"
              placeholder="Ex: clínicas médicas, indústrias..."
              className="w-full mt-1 bg-background/40 border border-border/40 rounded-md px-3 py-2 text-sm focus:border-primary/60 outline-none"
            />
            <datalist id="segmentos-list">
              {SEGMENTOS_SUGERIDOS.map((s) => <option key={s} value={s} />)}
            </datalist>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {SEGMENTOS_SUGERIDOS.slice(0, 6).map((s) => (
                <button key={s} onClick={() => setSegmento(s)}
                  className="text-[10px] px-2 py-1 rounded-full border border-border/40 text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors">
                  {s}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={buscar} disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-primary/15 hover:bg-primary/25 border border-primary/30 text-primary rounded-md py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Prospectando...</> : <><Search className="w-4 h-4" />Prospectar Empresas</>}
          </button>
        </div>

        {resultados.length > 0 && (
          <div className="mt-6 space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">{resultados.length} resultado(s)</p>
            {resultados.map((emp) => (
              <motion.div key={emp.id}
                initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3 p-3 bg-card/30 border border-border/30 rounded-lg hover:border-primary/30 transition-colors">
                <Building2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium truncate">{emp.nome}</h4>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider ${
                      emp.qualificacao === "quente" ? "bg-orange-500/20 text-orange-400" :
                      emp.qualificacao === "morno" ? "bg-yellow-500/20 text-yellow-400" :
                      "bg-blue-500/20 text-blue-400"
                    }`}>{emp.qualificacao}</span>
                  </div>
                  {emp.observacoes && <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{emp.observacoes}</p>}
                  {emp.site && <a href={emp.site} target="_blank" rel="noreferrer" className="text-[10px] text-primary/70 hover:text-primary truncate block mt-1">{emp.site}</a>}
                </div>
                <div className="text-right shrink-0">
                  <div className="text-lg font-light text-primary">{emp.lead_score}</div>
                  <div className="text-[9px] text-muted-foreground uppercase tracking-wider">score</div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
