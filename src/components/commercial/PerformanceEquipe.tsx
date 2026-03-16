import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Trophy, Medal, Award } from "lucide-react";

const vendedores = [
  { nome: "Carlos Silva", vendas: 185000, meta: 150000, contratos: 12, conversao: 42 },
  { nome: "Ana Oliveira", vendas: 162000, meta: 150000, contratos: 10, conversao: 38 },
  { nome: "Pedro Santos", vendas: 148000, meta: 150000, contratos: 9, conversao: 35 },
  { nome: "Maria Costa", vendas: 134000, meta: 130000, contratos: 8, conversao: 31 },
  { nome: "João Souza", vendas: 121000, meta: 130000, contratos: 7, conversao: 28 },
  { nome: "Lucia Ferreira", vendas: 98000, meta: 120000, contratos: 5, conversao: 22 },
];

const rankIcons = [Trophy, Medal, Award];

const PerformanceEquipe = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="w-full h-full p-4 sm:p-6 overflow-y-auto"
  >
    <h2 className="text-lg font-semibold text-primary tracking-wider mb-4">PERFORMANCE DA EQUIPE</h2>

    {/* Top 3 */}
    <div className="grid grid-cols-3 gap-3 mb-6">
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
              <div
                className="h-1.5 rounded-full bg-primary/70"
                style={{ width: `${Math.min(100, (v.vendas / v.meta) * 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">{((v.vendas / v.meta) * 100).toFixed(0)}% da meta</p>
          </motion.div>
        );
      })}
    </div>

    {/* Chart */}
    <div className="border border-primary/20 rounded-lg p-4 bg-primary/5 mb-4">
      <p className="text-xs text-primary/70 uppercase tracking-wider mb-3">Ranking de Vendas</p>
      <ResponsiveContainer width="100%" height={200}>
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
          </tr>
        </thead>
        <tbody>
          {vendedores.map((v, i) => (
            <tr key={v.nome} className="border-b border-primary/5 hover:bg-primary/10 transition-colors">
              <td className="p-2 text-muted-foreground">{i + 1}</td>
              <td className="p-2 text-foreground">{v.nome}</td>
              <td className="p-2 text-right text-foreground font-mono">R$ {(v.vendas / 1000).toFixed(0)}K</td>
              <td className="p-2 text-right text-primary font-mono">{v.conversao}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </motion.div>
);

export default PerformanceEquipe;
