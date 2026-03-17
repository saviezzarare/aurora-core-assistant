// Central commercial data store with the Unimed Bauru team structure
// Used across all commercial modules for consistent data

export interface Vendedor {
  nome: string;
  cargo: string;
  supervisor: string;
  vendas: number;
  meta: number;
  contratos: number;
  conversao: number;
  leads: number;
  propostas: number;
  ticketMedio: number;
  tendencia: "up" | "down" | "stable";
  historicoMensal: { mes: string; vendas: number }[];
}

export const equipeComercial: Vendedor[] = [
  {
    nome: "João Gabriel",
    cargo: "Vendedor PJ",
    supervisor: "Oderlei Pereira",
    vendas: 185000,
    meta: 150000,
    contratos: 14,
    conversao: 42,
    leads: 48,
    propostas: 22,
    ticketMedio: 13214,
    tendencia: "up",
    historicoMensal: [
      { mes: "Jan", vendas: 120000 }, { mes: "Fev", vendas: 135000 },
      { mes: "Mar", vendas: 165000 }, { mes: "Abr", vendas: 158000 },
      { mes: "Mai", vendas: 172000 }, { mes: "Jun", vendas: 185000 },
    ],
  },
  {
    nome: "Cleverson Bispo",
    cargo: "Vendedor PJ",
    supervisor: "Oderlei Pereira",
    vendas: 162000,
    meta: 150000,
    contratos: 11,
    conversao: 38,
    leads: 42,
    propostas: 18,
    ticketMedio: 14727,
    tendencia: "up",
    historicoMensal: [
      { mes: "Jan", vendas: 110000 }, { mes: "Fev", vendas: 125000 },
      { mes: "Mar", vendas: 140000 }, { mes: "Abr", vendas: 148000 },
      { mes: "Mai", vendas: 155000 }, { mes: "Jun", vendas: 162000 },
    ],
  },
  {
    nome: "José Victor",
    cargo: "Vendedor PJ",
    supervisor: "Kátia Moraes",
    vendas: 134000,
    meta: 140000,
    contratos: 9,
    conversao: 31,
    leads: 38,
    propostas: 15,
    ticketMedio: 14889,
    tendencia: "stable",
    historicoMensal: [
      { mes: "Jan", vendas: 115000 }, { mes: "Fev", vendas: 120000 },
      { mes: "Mar", vendas: 128000 }, { mes: "Abr", vendas: 130000 },
      { mes: "Mai", vendas: 132000 }, { mes: "Jun", vendas: 134000 },
    ],
  },
  {
    nome: "Douglas",
    cargo: "Vendedor PJ",
    supervisor: "Kátia Moraes",
    vendas: 98000,
    meta: 130000,
    contratos: 6,
    conversao: 22,
    leads: 35,
    propostas: 11,
    ticketMedio: 16333,
    tendencia: "down",
    historicoMensal: [
      { mes: "Jan", vendas: 105000 }, { mes: "Fev", vendas: 112000 },
      { mes: "Mar", vendas: 108000 }, { mes: "Abr", vendas: 102000 },
      { mes: "Mai", vendas: 100000 }, { mes: "Jun", vendas: 98000 },
    ],
  },
];

export const supervisores = [
  { nome: "Oderlei Pereira", cargo: "Supervisor", vendedores: ["João Gabriel", "Cleverson Bispo"] },
  { nome: "Kátia Moraes", cargo: "Supervisora", vendedores: ["José Victor", "Douglas"] },
];

export const gerente = { nome: "Dorival Russo de Moraes", cargo: "Gerente Comercial" };

// Funnel data
export const funilData = {
  leads: 163,
  qualificados: 85,
  propostas: 66,
  negociacao: 38,
  fechados: 40,
};

// Monthly totals
export const vendasMensais = [
  { mes: "Jan", vendas: 450000, meta: 500000 },
  { mes: "Fev", vendas: 492000, meta: 500000 },
  { mes: "Mar", vendas: 541000, meta: 520000 },
  { mes: "Abr", vendas: 538000, meta: 520000 },
  { mes: "Mai", vendas: 559000, meta: 550000 },
  { mes: "Jun", vendas: 579000, meta: 570000 },
];

// Goals
export const metasGerais = {
  receitaMensal: { atual: 579000, meta: 570000 },
  novosContratos: { atual: 40, meta: 45 },
  taxaConversao: { atual: 24.5, meta: 30 },
  ticketMedio: { atual: 14478, meta: 15000 },
  retencao: { atual: 92, meta: 95 },
  leadsQualificados: { atual: 85, meta: 100 },
};
