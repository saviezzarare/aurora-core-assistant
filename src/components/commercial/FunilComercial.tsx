import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Download, AlertTriangle, Lightbulb } from "lucide-react";
import { funilData, equipeComercial } from "@/lib/commercialData";
import { exportarFunilComercial } from "@/lib/excelUtils";

const stages = [
  { label: "Leads Gerados", value: funilData.leads, color: "hsl(var(--primary) / 0.3)" },
  { label: "Qualificados", value: funilData.qualificados, color: "hsl(var(--primary) / 0.45)" },
  { label: "Propostas Enviadas", value: funilData.propostas, color: "hsl(var(--primary) / 0.6)" },
  { label: "Negociação", value: funilData.negociacao, color: "hsl(var(--primary) / 0.75)" },
  { label: "Fechados", value: funilData.fechados, color: "hsl(var(--primary))" },
];

const taxaGeral = ((funilData.fechados / funilData.leads) * 100).toFixed(1);
const ticketMedio = equipeComercial.reduce((s, v) => s + v.ticketMedio, 0) / equipeComercial.length;
const valorPipeline = funilData.negociacao * ticketMedio;

const convPorVendedor = equipeComercial.map(v => ({
  nome: v.nome.split(" ")[0],
  conversao: v.conversao,
  leads: v.leads,
  fechados: v.contratos,
})).sort((a, b) => b.conversao - a.conversao);

// Bottleneck detection
const taxas = [
  { de: "Leads → Qualificados", valor: (funilData.qualificados / funilData.leads) * 100 },
  { de: "Qualificados → Propostas", valor: (funilData.propostas / funilData.qualificados) * 100 },
  { de: "Propostas → Negociação", valor: (funilData.negociacao / funilData.propostas) * 100 },
  { de: "Negociação → Fechamento", valor: (funilData.fechados / funilData.negociacao) * 100 },
];
const gargalo = taxas.reduce((min, t) => t.valor < min.valor ? t : min, taxas[0]);

const FunilComercial = () => {
  const maxVal = stages[0].value;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full h-full p-4 sm:p-6 overflow-y-auto"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-primary tracking-wider">FUNIL COMERCIAL</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={exportarFunilComercial}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] rounded-md border border-primary/20 text-primary/70 hover:bg-primary/10 transition-colors"
        >
          <Download className="w-3 h-3" /> EXCEL
        </motion.button>
      </div>

      {/* Visual funnel */}
      <div className="flex flex-col items-center gap-2 mb-4">
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

      {/* Bottleneck alert */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="border border-yellow-400/20 bg-yellow-400/5 rounded-lg p-3 mb-4 flex items-start gap-2"
      >
        <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-medium text-yellow-300">Gargalo identificado: {gargalo.de}</p>
          <p className="text-[10px] text-muted-foreground">Taxa de {gargalo.valor.toFixed(0)}% — menor conversão do funil. Oportunidade de melhoria nesta etapa.</p>
        </div>
      </motion.div>

      {/* Conversion by seller */}
      <div className="border border-primary/20 rounded-lg p-4 bg-primary/5 mb-4">
        <p className="text-xs text-primary/70 uppercase tracking-wider mb-3">Conversão por Vendedor</p>
        <ResponsiveContainer width="100%" height={130}>
          <BarChart data={convPorVendedor}>
            <XAxis dataKey="nome" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
            <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} tickFormatter={v => `${v}%`} />
            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--primary) / 0.3)", fontSize: 12 }} formatter={(v: number) => `${v}%`} />
            <Bar dataKey="conversao" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} opacity={0.8} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="border border-primary/20 rounded-lg p-3 bg-primary/5">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Taxa Geral</p>
          <p className="text-2xl font-bold text-primary">{taxaGeral}%</p>
          <p className="text-[10px] text-muted-foreground">Lead → Fechamento</p>
        </div>
        <div className="border border-primary/20 rounded-lg p-3 bg-primary/5">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Ticket Médio</p>
          <p className="text-2xl font-bold text-primary">R$ {(ticketMedio / 1000).toFixed(1)}K</p>
          <p className="text-[10px] text-muted-foreground">Por contrato</p>
        </div>
        <div className="border border-primary/20 rounded-lg p-3 bg-primary/5">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Ciclo Médio</p>
          <p className="text-2xl font-bold text-primary">18 dias</p>
          <p className="text-[10px] text-muted-foreground">Lead → Contrato</p>
        </div>
        <div className="border border-primary/20 rounded-lg p-3 bg-primary/5">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Pipeline</p>
          <p className="text-2xl font-bold text-primary">R$ {(valorPipeline / 1000).toFixed(0)}K</p>
          <p className="text-[10px] text-muted-foreground">Valor em negociação</p>
        </div>
      </div>
    </motion.div>
  );
};

export default FunilComercial;
