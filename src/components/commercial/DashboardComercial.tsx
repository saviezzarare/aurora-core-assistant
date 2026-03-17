import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, TrendingDown, DollarSign, Users, ShoppingCart, Target, Download, Brain } from "lucide-react";
import { equipeComercial, vendasMensais, funilData, metasGerais } from "@/lib/commercialData";
import { gerarInsightsAutomaticos } from "@/lib/commercialInsights";
import { exportarRelatorioCompleto } from "@/lib/excelUtils";

const totalVendas = equipeComercial.reduce((s, v) => s + v.vendas, 0);
const totalContratos = equipeComercial.reduce((s, v) => s + v.contratos, 0);
const mediaConversao = equipeComercial.reduce((s, v) => s + v.conversao, 0) / equipeComercial.length;

const weeklyData = [
  { dia: "Seg", valor: 28000 },
  { dia: "Ter", valor: 32000 },
  { dia: "Qua", valor: 45000 },
  { dia: "Qui", valor: 38000 },
  { dia: "Sex", valor: 52000 },
];

const kpis = [
  { label: "Receita Mensal", value: `R$ ${(totalVendas / 1000).toFixed(0)}K`, change: "+7.0%", up: true, icon: DollarSign },
  { label: "Novos Contratos", value: `${totalContratos}`, change: `+${totalContratos - 35}`, up: true, icon: ShoppingCart },
  { label: "Taxa de Conversão", value: `${mediaConversao.toFixed(1)}%`, change: "+1.8%", up: true, icon: Target },
  { label: "Vendedores Ativos", value: `${equipeComercial.length}`, change: "100%", up: true, icon: Users },
];

const supervisorData = [
  { nome: "Oderlei", vendas: equipeComercial.filter(v => v.supervisor === "Oderlei Pereira").reduce((s, v) => s + v.vendas, 0) },
  { nome: "Kátia", vendas: equipeComercial.filter(v => v.supervisor === "Kátia Moraes").reduce((s, v) => s + v.vendas, 0) },
];

const COLORS = ["hsl(var(--primary))", "hsl(var(--muted-foreground))"];

const DashboardComercial = () => {
  const insights = gerarInsightsAutomaticos().slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full h-full p-4 sm:p-6 overflow-y-auto"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-primary tracking-wider">DASHBOARD COMERCIAL</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={exportarRelatorioCompleto}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] rounded-md border border-primary/20 text-primary/70 hover:bg-primary/10 transition-colors"
        >
          <Download className="w-3 h-3" /> EXPORTAR
        </motion.button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="border border-primary/20 rounded-lg p-3 bg-primary/5 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between mb-1">
              <kpi.icon className="w-4 h-4 text-primary/60" />
              <span className={`text-[10px] font-mono flex items-center gap-0.5 ${kpi.up ? "text-emerald-400" : "text-red-400"}`}>
                {kpi.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {kpi.change}
              </span>
            </div>
            <p className="text-xl font-bold text-foreground">{kpi.value}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{kpi.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div className="border border-primary/20 rounded-lg p-4 bg-primary/5">
          <p className="text-xs text-primary/70 uppercase tracking-wider mb-3">Vendas vs Meta (Mensal)</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={vendasMensais}>
              <XAxis dataKey="mes" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
              <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} tickFormatter={v => `${v / 1000}K`} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--primary) / 0.3)", fontSize: 12 }}
                formatter={(v: number) => `R$ ${(v / 1000).toFixed(0)}K`}
              />
              <Bar dataKey="vendas" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} opacity={0.8} />
              <Bar dataKey="meta" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} opacity={0.3} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="border border-primary/20 rounded-lg p-4 bg-primary/5">
          <p className="text-xs text-primary/70 uppercase tracking-wider mb-3">Vendas da Semana</p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={weeklyData}>
              <XAxis dataKey="dia" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
              <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} tickFormatter={v => `${v / 1000}K`} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--primary) / 0.3)", fontSize: 12 }}
                formatter={(v: number) => `R$ ${(v / 1000).toFixed(0)}K`}
              />
              <Area type="monotone" dataKey="valor" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Supervisor split + Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="border border-primary/20 rounded-lg p-4 bg-primary/5">
          <p className="text-xs text-primary/70 uppercase tracking-wider mb-3">Vendas por Supervisor</p>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={supervisorData} dataKey="vendas" nameKey="nome" cx="50%" cy="50%" outerRadius={55} label={({ nome, percent }) => `${nome} ${(percent * 100).toFixed(0)}%`}>
                {supervisorData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v: number) => `R$ ${(v / 1000).toFixed(0)}K`} contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--primary) / 0.3)", fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="border border-primary/20 rounded-lg p-4 bg-primary/5">
          <p className="text-xs text-primary/70 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Brain className="w-3.5 h-3.5" /> Insights da IA
          </p>
          <div className="space-y-2">
            {insights.map((ins, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className={`text-[11px] p-2 rounded border ${
                  ins.tipo === "positive" ? "border-emerald-400/20 bg-emerald-400/5 text-emerald-300" :
                  ins.tipo === "critical" ? "border-red-400/20 bg-red-400/5 text-red-300" :
                  ins.tipo === "warning" ? "border-yellow-400/20 bg-yellow-400/5 text-yellow-300" :
                  "border-primary/20 bg-primary/5 text-primary/80"
                }`}
              >
                <p className="font-medium">{ins.titulo}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardComercial;
