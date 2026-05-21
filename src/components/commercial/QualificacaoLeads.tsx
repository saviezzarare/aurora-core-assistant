import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Target, Flame, Snowflake, Thermometer } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function QualificacaoLeads() {
  const [stats, setStats] = useState({ quente: 0, morno: 0, frio: 0, total: 0, media: 0 });
  const [top, setTop] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("prospected_companies").select("lead_score,qualificacao,nome,cidade,segmento").order("lead_score", { ascending: false });
      const all = data || [];
      const q = all.filter((e) => e.qualificacao === "quente").length;
      const m = all.filter((e) => e.qualificacao === "morno").length;
      const f = all.filter((e) => e.qualificacao === "frio").length;
      const media = all.length ? Math.round(all.reduce((s, e) => s + (e.lead_score || 0), 0) / all.length) : 0;
      setStats({ quente: q, morno: m, frio: f, total: all.length, media });
      setTop(all.slice(0, 10));
    })();
  }, []);

  const card = (label: string, value: number, Icon: any, color: string) => (
    <div className="bg-card/40 border border-border/30 rounded-xl p-4 backdrop-blur-md">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <div className="text-3xl font-light mt-2">{value}</div>
    </div>
  );

  return (
    <div className="h-full overflow-y-auto px-6 py-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-light text-primary tracking-wide">Qualificação de Leads</h2>
          <p className="text-xs text-muted-foreground mt-1">Score médio: {stats.media}/100 · Regras 01–04 aplicadas automaticamente</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {card("Total", stats.total, Target, "text-primary")}
          {card("Quentes", stats.quente, Flame, "text-orange-400")}
          {card("Mornos", stats.morno, Thermometer, "text-yellow-400")}
          {card("Frios", stats.frio, Snowflake, "text-blue-400")}
        </div>

        <div className="bg-card/40 border border-primary/15 rounded-xl p-5">
          <h3 className="text-sm font-medium text-primary mb-3">Top 10 Leads</h3>
          {top.length === 0 ? (
            <p className="text-xs text-muted-foreground">Sem leads ainda. Faça uma busca primeiro.</p>
          ) : (
            <div className="space-y-1.5">
              {top.map((e, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 py-1.5 px-2 rounded hover:bg-primary/5">
                  <span className="text-[10px] text-muted-foreground w-5">#{i + 1}</span>
                  <span className="text-sm flex-1 truncate">{e.nome}</span>
                  <span className="text-[10px] text-muted-foreground">{e.cidade}</span>
                  <span className="text-base font-light text-primary w-10 text-right">{e.lead_score}</span>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 bg-card/30 border border-border/30 rounded-xl p-4 text-[11px] text-muted-foreground space-y-1">
          <p className="text-primary text-xs mb-1">Critérios de pontuação</p>
          <p>• <span className="text-foreground">+25</span> Segmento saúde (clínicas, hospitais, laboratórios)</p>
          <p>• <span className="text-foreground">+15</span> Indústria</p>
          <p>• <span className="text-foreground">+15</span> Cidade da carteira (Bauru e região)</p>
          <p>• <span className="text-foreground">+10</span> Serviços profissionais (advocacia, contabilidade)</p>
          <p>• <span className="text-foreground">+5</span> Indicadores de porte (LTDA, S.A.)</p>
        </div>
      </div>
    </div>
  );
}
