// Command interpreter — Fase 2: focado em prospecção de empresas

export type CommandAction =
  | { type: "navigate"; module: string; label: string }
  | { type: "menu"; action: "open" | "close" | "toggle" }
  | { type: "none" };

interface CommandPattern {
  patterns: RegExp[];
  action: CommandAction;
  response: string;
}

const commands: CommandPattern[] = [
  // Menu
  {
    patterns: [/abrir?\s+menu/, /mostrar?\s+menu/, /menu\s+lateral/],
    action: { type: "menu", action: "open" },
    response: "Abrindo o menu, senhor.",
  },
  {
    patterns: [/fechar?\s+menu/, /esconder?\s+menu/, /ocultar?\s+menu/],
    action: { type: "menu", action: "close" },
    response: "Fechando o menu, senhor.",
  },

  // Buscar / Prospectar
  {
    patterns: [
      /buscar?\s+empresas?/, /prospectar/, /prospec[çc][aã]o/,
      /nova\s+busca/, /procurar?\s+empresas?/,
    ],
    action: { type: "navigate", module: "prospeccao", label: "Buscar Empresas" },
    response: "Abrindo o motor de prospecção, senhor.",
  },

  // Empresas prospectadas
  {
    patterns: [
      /empresas?\s+prospectadas?/, /lista\s+(de\s+)?empresas?/,
      /mostrar?\s+empresas?/, /ver\s+empresas?/,
    ],
    action: { type: "navigate", module: "empresas", label: "Empresas Prospectadas" },
    response: "Exibindo as empresas prospectadas, senhor.",
  },

  // Qualificação / Lead score
  {
    patterns: [
      /qualifica[çc][aã]o/, /lead\s*score/, /qualificar?\s+leads?/,
      /ranking\s+(de\s+)?leads?/,
    ],
    action: { type: "navigate", module: "qualificacao", label: "Qualificação de Leads" },
    response: "Abrindo a qualificação de leads, senhor.",
  },

  // Mapa regional
  {
    patterns: [/mapa\s+(regional|de\s+empresas?|de\s+cidades?)/, /distribui[çc][aã]o\s+regional/],
    action: { type: "navigate", module: "mapa", label: "Mapa Regional" },
    response: "Abrindo o mapa regional, senhor.",
  },

  // Análise de segmentos
  {
    patterns: [
      /an[aá]lise\s+(de\s+)?segmentos?/, /segmentos?\s+(prospectados?|atendidos?)?/,
      /por\s+segmento/,
    ],
    action: { type: "navigate", module: "segmentos", label: "Análise de Segmentos" },
    response: "Exibindo a análise por segmento, senhor.",
  },

  // Histórico de buscas
  {
    patterns: [/hist[oó]rico\s+(de\s+)?buscas?/, /buscas?\s+anteriores/, /minhas\s+buscas?/],
    action: { type: "navigate", module: "historico", label: "Histórico de Buscas" },
    response: "Abrindo o histórico de buscas, senhor.",
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
      if (pattern.test(lower) || pattern.test(lowerOriginal)) {
        return { action: cmd.action, response: cmd.response };
      }
    }
  }
  return null;
}

export const MODULE_LIST = [
  { id: "prospeccao", label: "Buscar Empresas", icon: "Search" },
  { id: "empresas", label: "Empresas Prospectadas", icon: "Building2" },
  { id: "qualificacao", label: "Qualificação de Leads", icon: "Target" },
  { id: "mapa", label: "Mapa Regional", icon: "MapPin" },
  { id: "segmentos", label: "Análise de Segmentos", icon: "PieChart" },
  { id: "historico", label: "Histórico de Buscas", icon: "History" },
] as const;

export type ModuleId = (typeof MODULE_LIST)[number]["id"];
