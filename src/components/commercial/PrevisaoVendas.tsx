import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";

const forecastData = [
  { mes: "Jan", real: 420, previsto: 400 },
  { mes: "Fev", real: 380, previsto: 410 },
  { mes: "Mar", real: 510, previsto: 430 },
  { mes: "Abr", real: 470, previsto: 460 },
  { mes: "Mai", real: 530, previsto: 500 },
  { mes: "Jun", real: 610, previsto: 540 },
  { mes: "Jul", real: null, previsto: 580 },
  { mes: "Ago", real: null, previsto: 620 },
  { mes: "Set", real: null, previsto: 650 },
  { mes: "Out", real: null, previsto: 680 },
  { mes: "Nov", real: null, previsto: 720 },
  { mes: "Dez", real: null, previsto: 760 },
];

const insights = [
  { icon: TrendingUp, text: "Tendência de crescimento de 12% ao trimestre", type: "positive" },
  { icon: CheckCircle, text: "Meta anual alcançável com ritmo atual", type: "positive" },
  { icon: AlertTriangle, text: "Sazonalidade prevista em Agosto — atenção", type: "warning" },
];

const PrevisaoVendas = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="w-full h-full p-4 sm:p-6 overflow-y-auto"
  >
    <h2 className="text-lg font-semibold text-primary tracking-wider mb-4">PREVISÃO DE VENDAS</h2>

    {/* Forecast chart */}
    <div className="border border-primary/20 rounded-lg p-4 bg-primary/5 mb-4">
      <p className="text-xs text-primary/70 uppercase tracking-wider mb-3">Projeção Anual (R$ mil)</p>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={forecastData}>
          <XAxis dataKey="mes" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
          <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
          <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--primary) / 0.3)", fontSize: 12 }} formatter={(v: number) => v ? `R$ ${v}K` : "—"} />
          <ReferenceLine x="Jun" stroke="hsl(var(--primary))" strokeDasharray="3 3" opacity={0.5} />
          <Area type="monotone" dataKey="previsto" stroke="hsl(var(--muted-foreground))" fill="hsl(var(--muted-foreground))" fillOpacity={0.1} strokeDasharray="5 5" />
          <Area type="monotone" dataKey="real" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} connectNulls={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>

    {/* Summary cards */}
    <div className="grid grid-cols-3 gap-3 mb-4">
      <div className="border border-primary/20 rounded-lg p-3 bg-primary/5 text-center">
        <p className="text-[10px] text-muted-foreground uppercase">Previsto Ano</p>
        <p className="text-xl font-bold text-primary">R$ 7.1M</p>
      </div>
      <div className="border border-primary/20 rounded-lg p-3 bg-primary/5 text-center">
        <p className="text-[10px] text-muted-foreground uppercase">Realizado</p>
        <p className="text-xl font-bold text-foreground">R$ 2.92M</p>
      </div>
      <div className="border border-primary/20 rounded-lg p-3 bg-primary/5 text-center">
        <p className="text-[10px] text-muted-foreground uppercase">Atingimento</p>
        <p className="text-xl font-bold text-emerald-400">41.1%</p>
      </div>
    </div>

    {/* Insights */}
    <div className="border border-primary/20 rounded-lg p-4 bg-primary/5">
      <p className="text-xs text-primary/70 uppercase tracking-wider mb-3">Insights da IA</p>
      <div className="space-y-2">
        {insights.map((ins, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="flex items-center gap-2"
          >
            <ins.icon className={`w-4 h-4 flex-shrink-0 ${ins.type === "positive" ? "text-emerald-400" : "text-yellow-400"}`} />
            <span className="text-xs text-foreground/80">{ins.text}</span>
          </motion.div>
        ))}
      </div>
    </div>
  </motion.div>
);

export default PrevisaoVendas;
