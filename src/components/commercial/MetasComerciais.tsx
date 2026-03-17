import { motion } from "framer-motion";
import { Target, CheckCircle, Clock, AlertTriangle, Download } from "lucide-react";
import { metasGerais, equipeComercial } from "@/lib/commercialData";
import { exportarMetas } from "@/lib/excelUtils";

const metas = [
  { label: "Receita Mensal", atual: metasGerais.receitaMensal.atual, meta: metasGerais.receitaMensal.meta, format: "currency" },
  { label: "Novos Contratos", atual: metasGerais.novosContratos.atual, meta: metasGerais.novosContratos.meta, format: "number" },
  { label: "Taxa de Conversão", atual: metasGerais.taxaConversao.atual, meta: metasGerais.taxaConversao.meta, format: "percent" },
  { label: "Ticket Médio", atual: metasGerais.ticketMedio.atual, meta: metasGerais.ticketMedio.meta, format: "currency" },
  { label: "Retenção", atual: metasGerais.retencao.atual, meta: metasGerais.retencao.meta, format: "percent" },
  { label: "Leads Qualificados", atual: metasGerais.leadsQualificados.atual, meta: metasGerais.leadsQualificados.meta, format: "number" },
];

const formatValue = (v: number, fmt: string) => {
  if (fmt === "currency") return v >= 1000 ? `R$ ${(v / 1000).toFixed(v >= 100000 ? 0 : 1)}K` : `R$ ${v}`;
  if (fmt === "percent") return `${v}%`;
  return `${v}`;
};

const MetasComerciais = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="w-full h-full p-4 sm:p-6 overflow-y-auto"
  >
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-semibold text-primary tracking-wider">METAS COMERCIAIS</h2>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={exportarMetas}
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] rounded-md border border-primary/20 text-primary/70 hover:bg-primary/10 transition-colors"
      >
        <Download className="w-3 h-3" /> EXCEL
      </motion.button>
    </div>

    {/* Individual goals */}
    <div className="space-y-3 mb-6">
      {metas.map((m, i) => {
        const pct = Math.min(100, (m.atual / m.meta) * 100);
        const status = pct >= 100 ? "above" : pct >= 85 ? "near" : "below";
        const cfg = {
          above: { icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-400/10", barColor: "bg-emerald-400/70", label: "Acima" },
          near: { icon: Clock, color: "text-yellow-400", bg: "bg-yellow-400/10", barColor: "bg-yellow-400/70", label: "Próximo" },
          below: { icon: AlertTriangle, color: "text-red-400", bg: "bg-red-400/10", barColor: "bg-red-400/70", label: "Abaixo" },
        }[status];
        const Icon = cfg.icon;
        return (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="border border-primary/20 rounded-lg p-3 bg-primary/5"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Target className="w-3.5 h-3.5 text-primary/60" />
                <span className="text-xs font-medium text-foreground">{m.label}</span>
              </div>
              <div className={`flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded ${cfg.bg} ${cfg.color}`}>
                <Icon className="w-3 h-3" />
                {cfg.label}
              </div>
            </div>
            <div className="flex items-end justify-between mb-1">
              <span className="text-lg font-bold text-foreground">{formatValue(m.atual, m.format)}</span>
              <span className="text-[10px] text-muted-foreground">Meta: {formatValue(m.meta, m.format)}</span>
            </div>
            <div className="w-full bg-muted/30 rounded-full h-1.5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ delay: 0.3 + i * 0.08, duration: 0.6 }}
                className={`h-1.5 rounded-full ${cfg.barColor}`}
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5 text-right">{pct.toFixed(0)}%</p>
          </motion.div>
        );
      })}
    </div>

    {/* Per-seller meta */}
    <div className="border border-primary/20 rounded-lg p-4 bg-primary/5">
      <p className="text-xs text-primary/70 uppercase tracking-wider mb-3">Meta Individual dos Vendedores</p>
      {equipeComercial.map((v, i) => {
        const pct = Math.min(100, (v.vendas / v.meta) * 100);
        return (
          <div key={v.nome} className="mb-2 last:mb-0">
            <div className="flex items-center justify-between text-[11px] mb-0.5">
              <span className="text-foreground">{v.nome}</span>
              <span className={`font-mono ${pct >= 100 ? "text-emerald-400" : pct >= 80 ? "text-yellow-400" : "text-red-400"}`}>{pct.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-muted/30 rounded-full h-1">
              <div className={`h-1 rounded-full ${pct >= 100 ? "bg-emerald-400/70" : pct >= 80 ? "bg-yellow-400/70" : "bg-red-400/70"}`} style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  </motion.div>
);

export default MetasComerciais;
