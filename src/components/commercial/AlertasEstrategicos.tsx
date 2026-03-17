import { motion } from "framer-motion";
import { AlertTriangle, Bell, TrendingDown, TrendingUp, ShieldAlert, Clock, CheckCircle } from "lucide-react";
import { gerarAlertasAutomaticos, gerarInsightsAutomaticos } from "@/lib/commercialInsights";

const iconMap: Record<string, any> = {
  critical: AlertTriangle,
  warning: TrendingDown,
  info: Bell,
  positive: CheckCircle,
};

const typeStyles = {
  critical: "border-red-400/30 bg-red-400/5",
  warning: "border-yellow-400/30 bg-yellow-400/5",
  info: "border-primary/20 bg-primary/5",
  positive: "border-emerald-400/30 bg-emerald-400/5",
};

const iconColors = {
  critical: "text-red-400",
  warning: "text-yellow-400",
  info: "text-primary/60",
  positive: "text-emerald-400",
};

const AlertasEstrategicos = () => {
  const alertas = gerarAlertasAutomaticos();
  const insights = gerarInsightsAutomaticos();

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const h = Math.floor(diff / 3600000);
    if (h < 1) return "Agora";
    if (h < 24) return `Há ${h}h`;
    return `Há ${Math.floor(h / 24)}d`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full h-full p-4 sm:p-6 overflow-y-auto"
    >
      <h2 className="text-lg font-semibold text-primary tracking-wider mb-4">ALERTAS ESTRATÉGICOS</h2>

      <div className="flex gap-2 mb-4 flex-wrap">
        <span className="text-[10px] px-2 py-0.5 rounded border border-red-400/30 bg-red-400/10 text-red-400">
          {alertas.filter(a => a.tipo === "critical").length} Críticos
        </span>
        <span className="text-[10px] px-2 py-0.5 rounded border border-yellow-400/30 bg-yellow-400/10 text-yellow-400">
          {alertas.filter(a => a.tipo === "warning").length} Atenção
        </span>
        <span className="text-[10px] px-2 py-0.5 rounded border border-emerald-400/30 bg-emerald-400/10 text-emerald-400">
          {alertas.filter(a => a.tipo === "positive").length} Positivos
        </span>
        <span className="text-[10px] px-2 py-0.5 rounded border border-primary/30 bg-primary/10 text-primary">
          {alertas.filter(a => a.tipo === "info").length} Info
        </span>
      </div>

      {/* Alerts */}
      <div className="space-y-2 mb-6">
        {alertas.map((a, i) => {
          const Icon = iconMap[a.tipo] || Bell;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`border rounded-lg p-3 ${typeStyles[a.tipo]} hover:brightness-110 transition-all cursor-pointer`}
            >
              <div className="flex items-start gap-2">
                <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${iconColors[a.tipo]}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground">{a.titulo}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{a.descricao}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] text-muted-foreground/60">{timeAgo(a.timestamp)}</span>
                    <span className="text-[10px] text-primary/70 hover:text-primary cursor-pointer">{a.acao} →</span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Strategic Insights */}
      <div className="border border-primary/20 rounded-lg p-4 bg-primary/5">
        <p className="text-xs text-primary/70 uppercase tracking-wider mb-3">💡 Recomendações Estratégicas</p>
        <div className="space-y-2">
          {insights.slice(0, 4).map((ins, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="text-[11px] text-foreground/80 p-2 border-l-2 border-primary/30 pl-3"
            >
              <p className="font-medium text-foreground">{ins.titulo}</p>
              <p className="text-muted-foreground mt-0.5">{ins.descricao}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default AlertasEstrategicos;
