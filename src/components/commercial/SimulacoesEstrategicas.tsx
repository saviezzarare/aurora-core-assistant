import { motion } from "framer-motion";
import { FlaskConical, TrendingUp, TrendingDown, Minus } from "lucide-react";

const cenarios = [
  {
    nome: "Cenário Otimista",
    desc: "Aumento de 20% na equipe + campanhas agressivas",
    impacto: "+35% receita",
    investimento: "R$ 180K",
    roi: "290%",
    trend: "up",
  },
  {
    nome: "Cenário Conservador",
    desc: "Manter equipe atual + otimizar processos",
    impacto: "+12% receita",
    investimento: "R$ 45K",
    roi: "420%",
    trend: "up",
  },
  {
    nome: "Cenário de Risco",
    desc: "Redução de investimento em marketing",
    impacto: "-8% receita",
    investimento: "—",
    roi: "—",
    trend: "down",
  },
  {
    nome: "Cenário Digital",
    desc: "Migração para vendas online + automação",
    impacto: "+22% receita",
    investimento: "R$ 120K",
    roi: "350%",
    trend: "up",
  },
];

const trendIcons = { up: TrendingUp, down: TrendingDown, neutral: Minus };
const trendColors = { up: "text-emerald-400", down: "text-red-400", neutral: "text-muted-foreground" };

const SimulacoesEstrategicas = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="w-full h-full p-4 sm:p-6 overflow-y-auto"
  >
    <h2 className="text-lg font-semibold text-primary tracking-wider mb-4">SIMULAÇÕES ESTRATÉGICAS</h2>

    <div className="space-y-3">
      {cenarios.map((c, i) => {
        const Icon = trendIcons[c.trend as keyof typeof trendIcons];
        const color = trendColors[c.trend as keyof typeof trendColors];
        return (
          <motion.div
            key={c.nome}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="border border-primary/20 rounded-lg p-4 bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-primary/60" />
                <span className="text-sm font-semibold text-foreground">{c.nome}</span>
              </div>
              <div className={`flex items-center gap-1 ${color}`}>
                <Icon className="w-4 h-4" />
                <span className="text-xs font-bold">{c.impacto}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-3">{c.desc}</p>
            <div className="flex gap-4">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase">Investimento</p>
                <p className="text-xs font-mono text-foreground">{c.investimento}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase">ROI Estimado</p>
                <p className="text-xs font-mono text-primary">{c.roi}</p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  </motion.div>
);

export default SimulacoesEstrategicas;
