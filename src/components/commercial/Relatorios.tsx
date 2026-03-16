import { motion } from "framer-motion";
import { FileText, Download, Calendar, Clock } from "lucide-react";

const relatorios = [
  { titulo: "Relatório Semanal", periodo: "10-16 Mar 2026", gerado: "16/03/2026 08:00", tipo: "semanal" },
  { titulo: "Relatório Mensal — Fevereiro", periodo: "01-28 Fev 2026", gerado: "01/03/2026 09:00", tipo: "mensal" },
  { titulo: "Relatório Mensal — Janeiro", periodo: "01-31 Jan 2026", gerado: "01/02/2026 09:00", tipo: "mensal" },
  { titulo: "Relatório Trimestral Q4 2025", periodo: "Out-Dez 2025", gerado: "02/01/2026 09:00", tipo: "trimestral" },
  { titulo: "Análise de Conversão", periodo: "Último trimestre", gerado: "15/03/2026 14:00", tipo: "especial" },
];

const Relatorios = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="w-full h-full p-4 sm:p-6 overflow-y-auto"
  >
    <h2 className="text-lg font-semibold text-primary tracking-wider mb-4">RELATÓRIOS</h2>

    {/* Quick actions */}
    <div className="grid grid-cols-2 gap-3 mb-6">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="border border-primary/30 rounded-lg p-3 bg-primary/10 text-left hover:bg-primary/20 transition-colors"
      >
        <FileText className="w-5 h-5 text-primary mb-1" />
        <p className="text-xs font-medium text-foreground">Gerar Relatório Semanal</p>
        <p className="text-[10px] text-muted-foreground">Dados da semana atual</p>
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="border border-primary/30 rounded-lg p-3 bg-primary/10 text-left hover:bg-primary/20 transition-colors"
      >
        <FileText className="w-5 h-5 text-primary mb-1" />
        <p className="text-xs font-medium text-foreground">Gerar Relatório Mensal</p>
        <p className="text-[10px] text-muted-foreground">Dados do mês atual</p>
      </motion.button>
    </div>

    {/* List */}
    <div className="space-y-2">
      {relatorios.map((r, i) => (
        <motion.div
          key={r.titulo}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.08 }}
          className="border border-primary/20 rounded-lg p-3 bg-primary/5 flex items-center justify-between hover:bg-primary/10 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <FileText className="w-4 h-4 text-primary/60 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-foreground">{r.titulo}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                  <Calendar className="w-2.5 h-2.5" /> {r.periodo}
                </span>
                <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                  <Clock className="w-2.5 h-2.5" /> {r.gerado}
                </span>
              </div>
            </div>
          </div>
          <Download className="w-4 h-4 text-primary/40 hover:text-primary transition-colors" />
        </motion.div>
      ))}
    </div>
  </motion.div>
);

export default Relatorios;
