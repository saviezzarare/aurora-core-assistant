import { motion } from "framer-motion";
import { Target, CheckCircle, Clock, AlertTriangle } from "lucide-react";

const metas = [
  { label: "Receita Mensal", atual: 610000, meta: 500000, status: "above" },
  { label: "Novos Contratos", atual: 47, meta: 50, status: "near" },
  { label: "Ticket Médio", atual: 21800, meta: 20000, status: "above" },
  { label: "Retenção", atual: 92, meta: 95, status: "below" },
  { label: "NPS", atual: 78, meta: 80, status: "near" },
  { label: "Leads Qualificados", atual: 185, meta: 200, status: "near" },
];

const statusConfig = {
  above: { icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-400/10", label: "Acima" },
  near: { icon: Clock, color: "text-yellow-400", bg: "bg-yellow-400/10", label: "Próximo" },
  below: { icon: AlertTriangle, color: "text-red-400", bg: "bg-red-400/10", label: "Abaixo" },
};

const format = (v: number) => v >= 1000 ? `${(v / 1000).toFixed(v >= 100000 ? 0 : 1)}K` : `${v}`;

const MetasComerciais = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="w-full h-full p-4 sm:p-6 overflow-y-auto"
  >
    <h2 className="text-lg font-semibold text-primary tracking-wider mb-4">METAS COMERCIAIS</h2>

    <div className="space-y-3">
      {metas.map((m, i) => {
        const pct = Math.min(100, (m.atual / m.meta) * 100);
        const cfg = statusConfig[m.status as keyof typeof statusConfig];
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
              <span className="text-lg font-bold text-foreground">{m.label === "Receita Mensal" ? `R$ ${format(m.atual)}` : m.label === "Ticket Médio" ? `R$ ${format(m.atual)}` : m.label.includes("Retenção") || m.label === "NPS" ? `${m.atual}%` : format(m.atual)}</span>
              <span className="text-[10px] text-muted-foreground">Meta: {m.label === "Receita Mensal" ? `R$ ${format(m.meta)}` : m.label === "Ticket Médio" ? `R$ ${format(m.meta)}` : m.label.includes("Retenção") || m.label === "NPS" ? `${m.meta}%` : format(m.meta)}</span>
            </div>
            <div className="w-full bg-muted/30 rounded-full h-1.5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ delay: 0.3 + i * 0.08, duration: 0.6 }}
                className={`h-1.5 rounded-full ${m.status === "above" ? "bg-emerald-400/70" : m.status === "near" ? "bg-yellow-400/70" : "bg-red-400/70"}`}
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5 text-right">{pct.toFixed(0)}%</p>
          </motion.div>
        );
      })}
    </div>
  </motion.div>
);

export default MetasComerciais;
