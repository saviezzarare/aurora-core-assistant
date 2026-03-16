import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { TrendingUp, TrendingDown, DollarSign, Users, ShoppingCart, Target } from "lucide-react";

const monthlyData = [
  { mes: "Jan", vendas: 420000, meta: 400000 },
  { mes: "Fev", vendas: 380000, meta: 400000 },
  { mes: "Mar", vendas: 510000, meta: 450000 },
  { mes: "Abr", vendas: 470000, meta: 450000 },
  { mes: "Mai", vendas: 530000, meta: 500000 },
  { mes: "Jun", vendas: 610000, meta: 500000 },
];

const weeklyData = [
  { dia: "Seg", valor: 42000 },
  { dia: "Ter", valor: 38000 },
  { dia: "Qua", valor: 55000 },
  { dia: "Qui", valor: 47000 },
  { dia: "Sex", valor: 63000 },
];

const kpis = [
  { label: "Receita Mensal", value: "R$ 610K", change: "+15.2%", up: true, icon: DollarSign },
  { label: "Novos Contratos", value: "47", change: "+8", up: true, icon: ShoppingCart },
  { label: "Taxa de Conversão", value: "34.2%", change: "+2.1%", up: true, icon: Target },
  { label: "Clientes Ativos", value: "1.284", change: "-3", up: false, icon: Users },
];

const DashboardComercial = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="w-full h-full p-4 sm:p-6 overflow-y-auto"
  >
    <h2 className="text-lg font-semibold text-primary tracking-wider mb-4">DASHBOARD COMERCIAL</h2>

    {/* KPIs */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
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

    {/* Charts */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="border border-primary/20 rounded-lg p-4 bg-primary/5">
        <p className="text-xs text-primary/70 uppercase tracking-wider mb-3">Vendas vs Meta (Mensal)</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={monthlyData}>
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
        <ResponsiveContainer width="100%" height={200}>
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
  </motion.div>
);

export default DashboardComercial;
