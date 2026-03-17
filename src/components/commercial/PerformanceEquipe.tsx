import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Trophy, Medal, Award, Download, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { equipeComercial } from "@/lib/commercialData";
import { exportarRankingVendedores } from "@/lib/excelUtils";

const vendedores = [...equipeComercial].sort((a, b) => b.vendas - a.vendas);
const rankIcons = [Trophy, Medal, Award];
const trendIcons = { up: TrendingUp, down: TrendingDown, stable: Minus };
const trendColors = { up: "text-emerald-400", down: "text-red-400", stable: "text-muted-foreground" };

const PerformanceEquipe = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="w-full h-full p-4 sm:p-6 overflow-y-auto"
  >
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-semibold text-primary tracking-wider">PERFORMANCE DA EQUIPE</h2>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={exportarRankingVendedores}
        className="flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] rounded-md border border-primary/20 text-primary/70 hover:bg-primary/10 transition-colors"
      >
        <Download className="w-3 h-3" /> EXCEL
      </motion.button>
    </div>

    {/* Top 3 */}
    <div className="grid grid-cols-3 gap-3 mb-4">
      {vendedores.slice(0, 3).map((v, i) => {
        const Icon = rankIcons[i];
        const colors = ["text-yellow-400", "text-gray-300", "text-amber-600"];
        return (
          <motion.div
            key={v.nome}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.15 }}
            className="border border-primary/20 rounded-lg p-3 bg-primary/5 text-center"
          >
            <Icon className={`w-6 h-6 mx-auto mb-1 ${colors[i]}`} />
            <p className="text-sm font-semibold text-foreground truncate">{v.nome.split(" ")[0]}</p>
            <p className="text-lg font-bold text-primary">R$ {(v.vendas / 1000).toFixed(0)}K</p>
            <p className="text-[10px] text-muted-foreground">{v.contratos} contratos</p>
            <div className="mt-2 w-full bg-muted/30 rounded-full h-1.5">
              <div className="h-1.5 rounded-full bg-primary/70" style={{ width: `${Math.min(100, (v.vendas / v.meta) * 100)}%` }} />
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">{((v.vendas / v.meta) * 100).toFixed(0)}% da meta</p>
          </motion.div>
        );
      })}
    </div>

    {/* Evolution chart */}
    <div className="border border-primary/20 rounded-lg p-4 bg-primary/5 mb-4">
      <p className="text-xs text-primary/70 uppercase tracking-wider mb-3">Evolução de Vendas por Vendedor</p>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={vendedores[0].historicoMensal.map((_, mi) => {
          const point: any = { mes: vendedores[0].historicoMensal[mi].mes };
          vendedores.forEach(v => { point[v.nome.split(" ")[0]] = v.historicoMensal[mi]?.vendas || 0; });
          return point;
        })}>
          <XAxis dataKey="mes" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
          <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} tickFormatter={v => `${v / 1000}K`} />
          <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--primary) / 0.3)", fontSize: 11 }} formatter={(v: number) => `R$ ${(v / 1000).toFixed(0)}K`} />
          {vendedores.map((v, i) => (
            <Line key={v.nome} type="monotone" dataKey={v.nome.split(" ")[0]} stroke={`hsl(var(--primary) / ${1 - i * 0.2})`} strokeWidth={2} dot={{ r: 2 }} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>

    {/* Ranking chart */}
    <div className="border border-primary/20 rounded-lg p-4 bg-primary/5 mb-4">
      <p className="text-xs text-primary/70 uppercase tracking-wider mb-3">Ranking de Vendas</p>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={vendedores} layout="vertical">
          <XAxis type="number" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} tickFormatter={v => `${v / 1000}K`} />
          <YAxis dataKey="nome" type="category" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} width={80} tickFormatter={n => n.split(" ")[0]} />
          <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--primary) / 0.3)", fontSize: 12 }} formatter={(v: number) => `R$ ${(v / 1000).toFixed(0)}K`} />
          <Bar dataKey="vendas" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} opacity={0.8} />
        </BarChart>
      </ResponsiveContainer>
    </div>

    {/* Table */}
    <div className="border border-primary/20 rounded-lg overflow-hidden bg-primary/5">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-primary/10">
            <th className="text-left p-2 text-primary/70">#</th>
            <th className="text-left p-2 text-primary/70">Vendedor</th>
            <th className="text-right p-2 text-primary/70">Vendas</th>
            <th className="text-right p-2 text-primary/70">Conv.</th>
            <th className="text-right p-2 text-primary/70">Tend.</th>
          </tr>
        </thead>
        <tbody>
          {vendedores.map((v, i) => {
            const TrendIcon = trendIcons[v.tendencia];
            return (
              <tr key={v.nome} className="border-b border-primary/5 hover:bg-primary/10 transition-colors">
                <td className="p-2 text-muted-foreground">{i + 1}</td>
                <td className="p-2 text-foreground">{v.nome}</td>
                <td className="p-2 text-right text-foreground font-mono">R$ {(v.vendas / 1000).toFixed(0)}K</td>
                <td className="p-2 text-right text-primary font-mono">{v.conversao}%</td>
                <td className="p-2 text-right">
                  <TrendIcon className={`w-3.5 h-3.5 inline ${trendColors[v.tendencia]}`} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </motion.div>
);

export default PerformanceEquipe;
