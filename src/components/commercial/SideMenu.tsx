import { motion, AnimatePresence } from "framer-motion";
import { X, BarChart3, Users, Filter, TrendingUp, Target, FileText, FlaskConical, Bell, Home, Upload } from "lucide-react";
import type { ModuleId } from "@/lib/commandInterpreter";

const icons: Record<string, any> = {
  dashboard: BarChart3,
  performance: Users,
  funil: Filter,
  previsao: TrendingUp,
  metas: Target,
  relatorios: FileText,
  simulacoes: FlaskConical,
  alertas: Bell,
  importar: Upload,
};

const modules = [
  { id: "dashboard" as ModuleId, label: "Dashboard" },
  { id: "performance" as ModuleId, label: "Equipe" },
  { id: "funil" as ModuleId, label: "Funil" },
  { id: "previsao" as ModuleId, label: "Previsão" },
  { id: "metas" as ModuleId, label: "Metas" },
  { id: "relatorios" as ModuleId, label: "Relatórios" },
  { id: "simulacoes" as ModuleId, label: "Simulações" },
  { id: "alertas" as ModuleId, label: "Alertas" },
  { id: "importar" as ModuleId, label: "Importar Excel" },
];

interface SideMenuProps {
  open: boolean;
  onClose: () => void;
  activeModule: ModuleId | null;
  onNavigate: (module: ModuleId | null) => void;
}

const SideMenu = ({ open, onClose, activeModule, onNavigate }: SideMenuProps) => (
  <AnimatePresence>
    {open && (
      <>
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40"
          onClick={onClose}
        />

        {/* Menu panel */}
        <motion.div
          initial={{ x: -280, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -280, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed left-0 top-0 bottom-0 w-64 bg-card/95 backdrop-blur-xl border-r border-primary/20 z-50 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-primary/10">
            <span className="text-xs tracking-[0.3em] uppercase text-primary font-semibold">J.A.R.V.I.S.</span>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-1.5 rounded-full border border-primary/20 text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </motion.button>
          </div>

          {/* Home */}
          <div className="px-3 pt-3">
            <motion.button
              whileHover={{ x: 4 }}
              onClick={() => { onNavigate(null); onClose(); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs transition-colors ${
                !activeModule ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-primary/5"
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Tela Inicial</span>
            </motion.button>
          </div>

          {/* Divider */}
          <div className="px-4 py-2">
            <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/50">Módulos Comerciais</p>
          </div>

          {/* Module list */}
          <div className="flex-1 overflow-y-auto px-3 space-y-0.5">
            {modules.map((mod, i) => {
              const Icon = icons[mod.id];
              const isActive = activeModule === mod.id;
              return (
                <motion.button
                  key={mod.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ x: 4 }}
                  onClick={() => { onNavigate(mod.id); onClose(); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs transition-colors ${
                    isActive ? "bg-primary/15 text-primary border border-primary/20" : "text-muted-foreground hover:text-foreground hover:bg-primary/5"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{mod.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                    />
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-primary/10">
            <p className="text-[9px] text-muted-foreground/40 text-center">JARVIS COMERCIAL v2.0</p>
            <p className="text-[9px] text-muted-foreground/30 text-center">Unimed Bauru</p>
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

export default SideMenu;
