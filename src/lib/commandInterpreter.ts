// Command interpreter layer: maps voice text to system actions

export type CommandAction =
  | { type: "navigate"; module: string; label: string }
  | { type: "menu"; action: "open" | "close" | "toggle" }
  | { type: "report"; action: string; params?: Record<string, string> }
  | { type: "export"; format: string; module: string }
  | { type: "none" };

interface CommandPattern {
  patterns: RegExp[];
  action: CommandAction;
  response: string;
}

const commands: CommandPattern[] = [
  // Menu
  {
    patterns: [/abrir?\s+menu/, /mostrar?\s+menu/, /exibir?\s+menu/, /menu\s+lateral/],
    action: { type: "menu", action: "open" },
    response: "Abrindo o menu, senhor.",
  },
  {
    patterns: [/fechar?\s+menu/, /esconder?\s+menu/, /ocultar?\s+menu/],
    action: { type: "menu", action: "close" },
    response: "Fechando o menu, senhor.",
  },

  // Dashboard
  {
    patterns: [
      /dashboard\s*(de\s+)?vendas/,
      /painel\s*(de\s+)?vendas/,
      /dashboard\s*comercial/,
      /painel\s*comercial/,
      /abrir?\s+dashboard/,
      /mostrar?\s+dashboard/,
    ],
    action: { type: "navigate", module: "dashboard", label: "Dashboard Comercial" },
    response: "Abrindo o dashboard comercial, senhor.",
  },

  // Performance / Equipe
  {
    patterns: [
      /desempenho\s*(da\s+)?equipe/,
      /performance\s*(da\s+)?equipe/,
      /ranking\s*(de\s+)?vendedores/,
      /equipe\s*(de\s+)?vendas/,
      /mostrar?\s+equipe/,
      /abrir?\s+performance/,
    ],
    action: { type: "navigate", module: "performance", label: "Performance da Equipe" },
    response: "Exibindo o desempenho da equipe, senhor.",
  },

  // Funil
  {
    patterns: [
      /funil\s*(de\s+)?vendas/,
      /funil\s*comercial/,
      /pipeline\s*(de\s+)?vendas/,
      /abrir?\s+funil/,
      /mostrar?\s+funil/,
    ],
    action: { type: "navigate", module: "funil", label: "Funil Comercial" },
    response: "Abrindo o funil comercial, senhor.",
  },

  // Previsão
  {
    patterns: [
      /previsão\s*(de\s+)?vendas/,
      /previsao\s*(de\s+)?vendas/,
      /forecast/,
      /projeção\s*(de\s+)?vendas/,
      /projecao\s*(de\s+)?vendas/,
      /mostrar?\s+previs/,
      /abrir?\s+previs/,
    ],
    action: { type: "navigate", module: "previsao", label: "Previsão de Vendas" },
    response: "Exibindo a previsão de vendas, senhor.",
  },

  // Metas
  {
    patterns: [
      /metas?\s*(comerciais|de\s+vendas)?/,
      /objetivos?\s*(comerciais|de\s+vendas)?/,
      /abrir?\s+metas/,
      /mostrar?\s+metas/,
    ],
    action: { type: "navigate", module: "metas", label: "Metas Comerciais" },
    response: "Exibindo as metas comerciais, senhor.",
  },

  // Relatórios
  {
    patterns: [
      /relat[oó]rios?/,
      /abrir?\s+relat/,
      /mostrar?\s+relat/,
      /gerar?\s+relat/,
    ],
    action: { type: "navigate", module: "relatorios", label: "Relatórios" },
    response: "Abrindo os relatórios, senhor.",
  },

  // Simulações
  {
    patterns: [
      /simula[çc][oõ]es?\s*(estrat[eé]gicas)?/,
      /cen[aá]rios?\s*(estrat[eé]gicos)?/,
      /abrir?\s+simula/,
      /mostrar?\s+simula/,
    ],
    action: { type: "navigate", module: "simulacoes", label: "Simulações Estratégicas" },
    response: "Abrindo as simulações estratégicas, senhor.",
  },

  // Alertas
  {
    patterns: [
      /alertas?\s*(estrat[eé]gicos|comerciais)?/,
      /notifica[çc][oõ]es?\s*(comerciais)?/,
      /abrir?\s+alertas/,
      /mostrar?\s+alertas/,
    ],
    action: { type: "navigate", module: "alertas", label: "Alertas Estratégicos" },
    response: "Exibindo os alertas estratégicos, senhor.",
  },

  // Insights
  {
    patterns: [
      /insights?\s*(comerciais|estrat[eé]gicos|autom[aá]ticos)?/,
      /recomenda[çc][oõ]es/,
      /an[aá]lise\s+inteligente/,
      /mostrar?\s+insights/,
    ],
    action: { type: "navigate", module: "alertas", label: "Insights Estratégicos" },
    response: "Exibindo os insights e recomendações estratégicas, senhor.",
  },

  // Importar dados / Excel
  {
    patterns: [
      /importar?\s*(dados|planilha|excel|arquivo)/,
      /carregar?\s*(planilha|excel|dados)/,
      /abrir?\s+importa/,
      /upload\s*(de\s+)?(planilha|excel|dados)/,
    ],
    action: { type: "navigate", module: "importar", label: "Importar Dados" },
    response: "Abrindo o módulo de importação de dados, senhor.",
  },

  // Export
  {
    patterns: [/exportar?\s+.*(excel|csv|planilha)/],
    action: { type: "export", format: "excel", module: "current" },
    response: "Preparando a exportação dos dados, senhor.",
  },
  {
    patterns: [/exportar?\s+ranking/],
    action: { type: "export", format: "excel", module: "ranking" },
    response: "Exportando o ranking dos vendedores para Excel, senhor.",
  },
  {
    patterns: [/exportar?\s+funil/],
    action: { type: "export", format: "excel", module: "funil" },
    response: "Exportando o funil comercial para Excel, senhor.",
  },
  {
    patterns: [/exportar?\s+(relat[oó]rio\s+)?completo/],
    action: { type: "export", format: "excel", module: "completo" },
    response: "Exportando o relatório completo para Excel, senhor.",
  },

  // Report generation
  {
    patterns: [/gerar?\s+relat[oó]rio\s*(da\s+)?semana/],
    action: { type: "report", action: "weekly" },
    response: "Gerando o relatório semanal, senhor.",
  },
  {
    patterns: [/gerar?\s+relat[oó]rio\s*(do\s+)?m[eê]s/],
    action: { type: "report", action: "monthly" },
    response: "Gerando o relatório mensal, senhor.",
  },

  // Voltar / Home
  {
    patterns: [/voltar?\s*(para\s+)?(in[ií]cio|home|tela\s+principal)/, /fechar?\s+painel/, /fechar?\s+m[oó]dulo/],
    action: { type: "navigate", module: "home", label: "Tela Inicial" },
    response: "Retornando à tela inicial, senhor.",
  },
];

export function interpretCommand(text: string): { action: CommandAction; response: string } | null {
  const lower = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const lowerOriginal = text.toLowerCase();

  for (const cmd of commands) {
    for (const pattern of cmd.patterns) {
      // Test both normalized and original
      if (pattern.test(lower) || pattern.test(lowerOriginal)) {
        return { action: cmd.action, response: cmd.response };
      }
    }
  }

  return null;
}

export const MODULE_LIST = [
  { id: "dashboard", label: "Dashboard Comercial", icon: "BarChart3" },
  { id: "performance", label: "Performance da Equipe", icon: "Users" },
  { id: "funil", label: "Funil Comercial", icon: "Filter" },
  { id: "previsao", label: "Previsão de Vendas", icon: "TrendingUp" },
  { id: "metas", label: "Metas Comerciais", icon: "Target" },
  { id: "relatorios", label: "Relatórios", icon: "FileText" },
  { id: "simulacoes", label: "Simulações Estratégicas", icon: "FlaskConical" },
  { id: "alertas", label: "Alertas Estratégicos", icon: "Bell" },
  { id: "importar", label: "Importar Dados", icon: "Upload" },
] as const;

export type ModuleId = (typeof MODULE_LIST)[number]["id"];
