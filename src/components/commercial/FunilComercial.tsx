import { motion } from "framer-motion";

const stages = [
  { label: "Leads Gerados", value: 340, color: "hsl(var(--primary) / 0.3)" },
  { label: "Qualificados", value: 185, color: "hsl(var(--primary) / 0.45)" },
  { label: "Propostas Enviadas", value: 92, color: "hsl(var(--primary) / 0.6)" },
  { label: "Negociação", value: 54, color: "hsl(var(--primary) / 0.75)" },
  { label: "Fechados", value: 28, color: "hsl(var(--primary))" },
];

const FunilComercial = () => {
  const maxVal = stages[0].value;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full h-full p-4 sm:p-6 overflow-y-auto"
    >
      <h2 className="text-lg font-semibold text-primary tracking-wider mb-4">FUNIL COMERCIAL</h2>

      {/* Visual funnel */}
      <div className="flex flex-col items-center gap-2 mb-6">
        {stages.map((stage, i) => {
          const widthPct = 30 + (stage.value / maxVal) * 70;
          const convRate = i > 0 ? ((stage.value / stages[i - 1].value) * 100).toFixed(0) : "100";
          return (
            <motion.div
              key={stage.label}
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: i * 0.12 }}
              className="relative"
              style={{ width: `${widthPct}%` }}
            >
              <div
                className="rounded-md py-3 px-4 flex items-center justify-between border border-primary/20"
                style={{ background: stage.color }}
              >
                <span className="text-xs font-medium text-foreground">{stage.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-foreground">{stage.value}</span>
                  {i > 0 && (
                    <span className="text-[10px] bg-background/30 px-1.5 py-0.5 rounded text-foreground/70">
                      {convRate}%
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Conversion metrics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="border border-primary/20 rounded-lg p-3 bg-primary/5">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Taxa Geral</p>
          <p className="text-2xl font-bold text-primary">{((stages[4].value / stages[0].value) * 100).toFixed(1)}%</p>
          <p className="text-[10px] text-muted-foreground">Lead → Fechamento</p>
        </div>
        <div className="border border-primary/20 rounded-lg p-3 bg-primary/5">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Ticket Médio</p>
          <p className="text-2xl font-bold text-primary">R$ 21.8K</p>
          <p className="text-[10px] text-muted-foreground">Por contrato</p>
        </div>
        <div className="border border-primary/20 rounded-lg p-3 bg-primary/5">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Ciclo Médio</p>
          <p className="text-2xl font-bold text-primary">18 dias</p>
          <p className="text-[10px] text-muted-foreground">Lead → Contrato</p>
        </div>
        <div className="border border-primary/20 rounded-lg p-3 bg-primary/5">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Em Negociação</p>
          <p className="text-2xl font-bold text-primary">R$ 1.17M</p>
          <p className="text-[10px] text-muted-foreground">Valor no pipeline</p>
        </div>
      </div>
    </motion.div>
  );
};

export default FunilComercial;
