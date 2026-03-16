import { motion } from "framer-motion";
import { AlertTriangle, Bell, TrendingDown, Clock, UserMinus, ShieldAlert } from "lucide-react";

const alertas = [
  {
    tipo: "critical",
    icon: AlertTriangle,
    titulo: "Queda na conversão do vendedor João Souza",
    desc: "Taxa de conversão caiu de 35% para 22% nas últimas 3 semanas",
    tempo: "Há 2 horas",
    acao: "Agendar feedback",
  },
  {
    tipo: "warning",
    icon: TrendingDown,
    titulo: "Pipeline em queda",
    desc: "Volume de leads qualificados reduziu 15% em relação ao mês anterior",
    tempo: "Há 5 horas",
    acao: "Revisar campanhas",
  },
  {
    tipo: "info",
    icon: Clock,
    titulo: "3 propostas vencem esta semana",
    desc: "Propostas para Clinica Vida, Hospital São Lucas e Centro Médico ABC",
    tempo: "Há 1 dia",
    acao: "Follow-up",
  },
  {
    tipo: "warning",
    icon: UserMinus,
    titulo: "Churn elevado no segmento PME",
    desc: "Taxa de cancelamento de 4.2% (meta: 3%)",
    tempo: "Há 2 dias",
    acao: "Plano de retenção",
  },
  {
    tipo: "info",
    icon: Bell,
    titulo: "Meta mensal próxima de ser batida",
    desc: "Faltam R$ 40K para atingir 100% — 94% alcançado",
    tempo: "Há 3 dias",
    acao: "Acompanhar",
  },
  {
    tipo: "critical",
    icon: ShieldAlert,
    titulo: "Concorrente lançou plano agressivo",
    desc: "Operadora X reduziu preços em 20% para o segmento empresarial",
    tempo: "Há 4 dias",
    acao: "Análise competitiva",
  },
];

const typeStyles = {
  critical: "border-red-400/30 bg-red-400/5",
  warning: "border-yellow-400/30 bg-yellow-400/5",
  info: "border-primary/20 bg-primary/5",
};

const iconColors = {
  critical: "text-red-400",
  warning: "text-yellow-400",
  info: "text-primary/60",
};

const AlertasEstrategicos = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="w-full h-full p-4 sm:p-6 overflow-y-auto"
  >
    <h2 className="text-lg font-semibold text-primary tracking-wider mb-4">ALERTAS ESTRATÉGICOS</h2>

    <div className="flex gap-2 mb-4">
      <span className="text-[10px] px-2 py-0.5 rounded border border-red-400/30 bg-red-400/10 text-red-400">
        {alertas.filter(a => a.tipo === "critical").length} Críticos
      </span>
      <span className="text-[10px] px-2 py-0.5 rounded border border-yellow-400/30 bg-yellow-400/10 text-yellow-400">
        {alertas.filter(a => a.tipo === "warning").length} Atenção
      </span>
      <span className="text-[10px] px-2 py-0.5 rounded border border-primary/30 bg-primary/10 text-primary">
        {alertas.filter(a => a.tipo === "info").length} Info
      </span>
    </div>

    <div className="space-y-2">
      {alertas.map((a, i) => {
        const Icon = a.icon;
        return (
          <motion.div
            key={a.titulo}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`border rounded-lg p-3 ${typeStyles[a.tipo as keyof typeof typeStyles]} hover:brightness-110 transition-all cursor-pointer`}
          >
            <div className="flex items-start gap-2">
              <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${iconColors[a.tipo as keyof typeof iconColors]}`} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground">{a.titulo}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{a.desc}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] text-muted-foreground/60">{a.tempo}</span>
                  <span className="text-[10px] text-primary/70 hover:text-primary cursor-pointer">{a.acao} →</span>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  </motion.div>
);

export default AlertasEstrategicos;
