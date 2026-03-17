import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { TrendingUp, AlertTriangle, CheckCircle, Brain, Target } from "lucide-react";
import { vendasMensais, equipeComercial, funilData } from "@/lib/commercialData";
import { gerarPrevisoes } from "@/lib/commercialInsights";

const crescimentoMedio = vendasMensais.length > 1
  ? ((vendasMensais[vendasMensais.length - 1].vendas - vendasMensais[0].vendas) / vendasMensais[0].vendas / (vendasMensais.length - 1))
  : 0;

const forecastData = [
  ...vendasMensais.map(m => ({ mes: m.mes, real: m.vendas / 1000, previsto: m.meta / 1000 })),
  ...["Jul", "Ago", "Set", "Out", "Nov", "Dez"].map((mes, i) => ({
    mes,
    real: null as number | null,
    previsto: Math.round((vendasMensais[vendasMensais.length - 1].vendas * Math.pow(1 + crescimentoMedio, i + 1)) / 1000),
  })),
];

const totalRealizado = vendasMensais.reduce((s, m) => s + m.vendas, 0);
const totalPrevisto = forecastData.reduce((s, d) => s + (d.previsto || 0), 0) * 1000;

const PrevisaoVendas = () => {
  const previsoes = gerarPrevisoes();

  return (
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
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={forecastData}>
            <XAxis dataKey="mes" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
            <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--primary) / 0.3)", fontSize: 12 }} formatter={(v: number | null) => v ? `R$ ${v}K` : "—"} />
            <ReferenceLine x={vendasMensais[vendasMensais.length - 1].mes} stroke="hsl(var(--primary))" strokeDasharray="3 3" opacity={0.5} />
            <Area type="monotone" dataKey="previsto" stroke="hsl(var(--muted-foreground))" fill="hsl(var(--muted-foreground))" fillOpacity={0.1} strokeDasharray="5 5" />
            <Area type="monotone" dataKey="real" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} connectNulls={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="border border-primary/20 rounded-lg p-3 bg-primary/5 text-center">
          <p className="text-[10px] text-muted-foreground uppercase">Previsto Ano</p>
          <p className="text-xl font-bold text-primary">R$ {(totalPrevisto / 1000000).toFixed(1)}M</p>
        </div>
        <div className="border border-primary/20 rounded-lg p-3 bg-primary/5 text-center">
          <p className="text-[10px] text-muted-foreground uppercase">Realizado</p>
          <p className="text-xl font-bold text-foreground">R$ {(totalRealizado / 1000000).toFixed(2)}M</p>
        </div>
        <div className="border border-primary/20 rounded-lg p-3 bg-primary/5 text-center">
          <p className="text-[10px] text-muted-foreground uppercase">Atingimento</p>
          <p className="text-xl font-bold text-emerald-400">{((totalRealizado / totalPrevisto) * 100).toFixed(1)}%</p>
        </div>
      </div>

      {/* AI Predictions */}
      <div className="border border-primary/20 rounded-lg p-4 bg-primary/5">
        <p className="text-xs text-primary/70 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Brain className="w-3.5 h-3.5" /> Previsões Inteligentes
        </p>
        <div className="space-y-2.5">
          {previsoes.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="border border-primary/10 rounded-lg p-3 bg-background/30"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-foreground">{p.label}</span>
                <span className="text-sm font-bold text-primary">{p.valor}</span>
              </div>
              <p className="text-[10px] text-muted-foreground">{p.detalhe}</p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <div className="flex-1 bg-muted/30 rounded-full h-1">
                  <div className="h-1 rounded-full bg-primary/60" style={{ width: `${p.confianca}%` }} />
                </div>
                <span className="text-[9px] text-muted-foreground">{p.confianca}% confiança</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default PrevisaoVendas;
