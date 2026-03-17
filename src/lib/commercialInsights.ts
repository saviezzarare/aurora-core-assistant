// Smart Analysis Engine: generates insights, predictions, and alerts from commercial data

import { equipeComercial, funilData, vendasMensais, metasGerais, type Vendedor } from "./commercialData";

export interface Insight {
  tipo: "positive" | "warning" | "critical" | "info";
  titulo: string;
  descricao: string;
  modulo: string;
  prioridade: number; // 1 = highest
}

export interface Previsao {
  label: string;
  valor: string;
  detalhe: string;
  confianca: number; // 0-100
}

// --- SMART ANALYSIS ---

export function gerarInsightsAutomaticos(): Insight[] {
  const insights: Insight[] = [];
  const totalVendas = equipeComercial.reduce((s, v) => s + v.vendas, 0);
  const totalMeta = equipeComercial.reduce((s, v) => s + v.meta, 0);
  const mediaConversao = equipeComercial.reduce((s, v) => s + v.conversao, 0) / equipeComercial.length;

  // Top performer
  const top = [...equipeComercial].sort((a, b) => b.vendas - a.vendas)[0];
  insights.push({
    tipo: "positive",
    titulo: `${top.nome} lidera o ranking de vendas`,
    descricao: `Com R$ ${(top.vendas / 1000).toFixed(0)}K em vendas e ${top.contratos} contratos, ${top.nome} é o vendedor com melhor desempenho do período. Taxa de conversão de ${top.conversao}%.`,
    modulo: "performance",
    prioridade: 2,
  });

  // Underperformers
  const below = equipeComercial.filter(v => v.vendas < v.meta * 0.8);
  if (below.length > 0) {
    insights.push({
      tipo: "warning",
      titulo: `${below.length} vendedor(es) abaixo de 80% da meta`,
      descricao: `${below.map(v => v.nome).join(", ")} ${below.length === 1 ? "está" : "estão"} com desempenho abaixo do esperado. Recomenda-se acompanhamento individual e revisão de abordagem comercial.`,
      modulo: "performance",
      prioridade: 1,
    });
  }

  // Declining trend
  const declining = equipeComercial.filter(v => v.tendencia === "down");
  if (declining.length > 0) {
    insights.push({
      tipo: "critical",
      titulo: `Tendência de queda: ${declining.map(v => v.nome).join(", ")}`,
      descricao: `${declining.length === 1 ? "Este vendedor apresenta" : "Estes vendedores apresentam"} queda nas vendas nos últimos 3 meses. Ação imediata recomendada para reverter a tendência.`,
      modulo: "alertas",
      prioridade: 1,
    });
  }

  // Funnel bottleneck
  const taxaQualificacao = (funilData.qualificados / funilData.leads * 100);
  const taxaProposta = (funilData.propostas / funilData.qualificados * 100);
  const taxaFechamento = (funilData.fechados / funilData.negociacao * 100);

  if (taxaQualificacao < 55) {
    insights.push({
      tipo: "warning",
      titulo: "Gargalo na qualificação de leads",
      descricao: `Apenas ${taxaQualificacao.toFixed(0)}% dos leads estão sendo qualificados. Oportunidade de melhorar os critérios de qualificação ou a abordagem inicial.`,
      modulo: "funil",
      prioridade: 2,
    });
  }

  if (taxaProposta < 70) {
    insights.push({
      tipo: "info",
      titulo: "Oportunidade: conversão de qualificados em propostas",
      descricao: `${taxaProposta.toFixed(0)}% dos leads qualificados recebem propostas. Aumentar esta taxa pode gerar ${Math.round((funilData.qualificados * 0.1) * (funilData.fechados / funilData.propostas))} novos contratos potenciais.`,
      modulo: "funil",
      prioridade: 3,
    });
  }

  // Meta achievement
  const pctMeta = (totalVendas / totalMeta) * 100;
  if (pctMeta >= 100) {
    insights.push({
      tipo: "positive",
      titulo: "Meta da equipe atingida!",
      descricao: `A equipe alcançou ${pctMeta.toFixed(0)}% da meta com R$ ${(totalVendas / 1000).toFixed(0)}K em vendas totais. Excelente desempenho coletivo.`,
      modulo: "metas",
      prioridade: 2,
    });
  } else if (pctMeta >= 90) {
    insights.push({
      tipo: "info",
      titulo: `Meta próxima: faltam R$ ${((totalMeta - totalVendas) / 1000).toFixed(0)}K`,
      descricao: `A equipe está em ${pctMeta.toFixed(0)}% da meta. Com o ritmo atual, é possível atingir 100% intensificando o acompanhamento de ${funilData.negociacao} negociações em andamento.`,
      modulo: "metas",
      prioridade: 2,
    });
  }

  // Growth trend
  const ultimos3 = vendasMensais.slice(-3);
  const crescimento = ((ultimos3[2].vendas - ultimos3[0].vendas) / ultimos3[0].vendas) * 100;
  if (crescimento > 5) {
    insights.push({
      tipo: "positive",
      titulo: `Crescimento de ${crescimento.toFixed(1)}% no trimestre`,
      descricao: `As vendas apresentam tendência de crescimento consistente nos últimos 3 meses, saindo de R$ ${(ultimos3[0].vendas / 1000).toFixed(0)}K para R$ ${(ultimos3[2].vendas / 1000).toFixed(0)}K.`,
      modulo: "dashboard",
      prioridade: 3,
    });
  }

  // Best practices replication
  if (top.conversao > mediaConversao * 1.3) {
    insights.push({
      tipo: "info",
      titulo: "Replicar boas práticas de " + top.nome,
      descricao: `A taxa de conversão de ${top.nome} (${top.conversao}%) é ${((top.conversao / mediaConversao - 1) * 100).toFixed(0)}% superior à média da equipe (${mediaConversao.toFixed(0)}%). Mapear suas técnicas pode elevar o desempenho geral.`,
      modulo: "performance",
      prioridade: 3,
    });
  }

  return insights.sort((a, b) => a.prioridade - b.prioridade);
}

// --- PREDICTIONS ---

export function gerarPrevisoes(): Previsao[] {
  const previsoes: Previsao[] = [];
  const mediaMensal = vendasMensais.reduce((s, m) => s + m.vendas, 0) / vendasMensais.length;
  const ultimoMes = vendasMensais[vendasMensais.length - 1];
  const crescimentoMedio = vendasMensais.length > 1
    ? ((ultimoMes.vendas - vendasMensais[0].vendas) / vendasMensais[0].vendas / (vendasMensais.length - 1)) * 100
    : 0;

  // Contracts forecast
  const totalContratos = equipeComercial.reduce((s, v) => s + v.contratos, 0);
  const contratosPrevistos = Math.round(totalContratos + funilData.negociacao * (funilData.fechados / funilData.negociacao));
  previsoes.push({
    label: "Contratos até fim do mês",
    valor: `${contratosPrevistos} contratos`,
    detalhe: `${totalContratos} fechados + ${funilData.negociacao} em negociação com taxa de ${((funilData.fechados / funilData.negociacao) * 100).toFixed(0)}% de fechamento`,
    confianca: 72,
  });

  // Revenue forecast
  const receitaPrevista = ultimoMes.vendas * (1 + crescimentoMedio / 100);
  previsoes.push({
    label: "Receita próximo mês",
    valor: `R$ ${(receitaPrevista / 1000).toFixed(0)}K`,
    detalhe: `Baseado na tendência de crescimento de ${crescimentoMedio.toFixed(1)}% ao mês`,
    confianca: 65,
  });

  // Goal achievement
  const metaAnual = 570000 * 12;
  const realizadoAnual = vendasMensais.reduce((s, m) => s + m.vendas, 0);
  const mesesRestantes = 12 - vendasMensais.length;
  const necessarioMensal = (metaAnual - realizadoAnual) / mesesRestantes;
  previsoes.push({
    label: "Meta anual",
    valor: mediaMensal >= necessarioMensal ? "Alcançável ✓" : "Em risco ⚠",
    detalhe: `Necessário R$ ${(necessarioMensal / 1000).toFixed(0)}K/mês. Média atual: R$ ${(mediaMensal / 1000).toFixed(0)}K/mês`,
    confianca: mediaMensal >= necessarioMensal ? 78 : 45,
  });

  // Lead impact simulation
  const leadIncrease20 = Math.round(funilData.leads * 0.2 * (funilData.fechados / funilData.leads));
  previsoes.push({
    label: "Impacto +20% leads",
    valor: `+${leadIncrease20} contratos`,
    detalhe: `Aumento de 20% nos leads geraria ~${leadIncrease20} contratos adicionais mantendo a conversão atual`,
    confianca: 60,
  });

  // Conversion improvement impact
  const convAtual = funilData.fechados / funilData.leads;
  const convMelhorada = convAtual * 1.15;
  const contratosExtra = Math.round(funilData.leads * convMelhorada) - funilData.fechados;
  previsoes.push({
    label: "Impacto +15% conversão",
    valor: `+${contratosExtra} contratos`,
    detalhe: `Melhorar conversão de ${(convAtual * 100).toFixed(1)}% para ${(convMelhorada * 100).toFixed(1)}% adicionaria ~${contratosExtra} contratos`,
    confianca: 55,
  });

  return previsoes;
}

// --- ALERTS ---

export interface AlertaEstrategico {
  tipo: "critical" | "warning" | "info" | "positive";
  titulo: string;
  descricao: string;
  acao: string;
  timestamp: string;
}

export function gerarAlertasAutomaticos(): AlertaEstrategico[] {
  const alertas: AlertaEstrategico[] = [];
  const now = new Date();

  // Declining sellers
  equipeComercial.filter(v => v.tendencia === "down").forEach(v => {
    alertas.push({
      tipo: "critical",
      titulo: `Queda de desempenho: ${v.nome}`,
      descricao: `Vendas em declínio nos últimos meses. Conversão atual de ${v.conversao}% está ${v.conversao < 30 ? "abaixo" : "na média"} da equipe.`,
      acao: "Agendar feedback individual",
      timestamp: new Date(now.getTime() - 2 * 3600000).toISOString(),
    });
  });

  // Low conversion
  equipeComercial.filter(v => v.conversao < 25).forEach(v => {
    alertas.push({
      tipo: "warning",
      titulo: `Baixa conversão: ${v.nome} (${v.conversao}%)`,
      descricao: `Taxa de conversão significativamente abaixo da média. ${v.leads} leads geraram apenas ${v.contratos} contratos.`,
      acao: "Revisar abordagem comercial",
      timestamp: new Date(now.getTime() - 5 * 3600000).toISOString(),
    });
  });

  // Pipeline risk
  if (funilData.negociacao > funilData.fechados * 1.5) {
    alertas.push({
      tipo: "warning",
      titulo: "Pipeline com acúmulo em negociação",
      descricao: `${funilData.negociacao} propostas em negociação com apenas ${funilData.fechados} fechamentos. Risco de estagnação.`,
      acao: "Intensificar follow-up",
      timestamp: new Date(now.getTime() - 8 * 3600000).toISOString(),
    });
  }

  // Goal proximity
  const pctMeta = (metasGerais.receitaMensal.atual / metasGerais.receitaMensal.meta) * 100;
  if (pctMeta >= 90 && pctMeta < 100) {
    alertas.push({
      tipo: "info",
      titulo: `Meta a ${(100 - pctMeta).toFixed(0)}% de ser atingida`,
      descricao: `Faltam R$ ${((metasGerais.receitaMensal.meta - metasGerais.receitaMensal.atual) / 1000).toFixed(0)}K para bater a meta mensal.`,
      acao: "Acompanhar negociações",
      timestamp: new Date(now.getTime() - 3600000).toISOString(),
    });
  } else if (pctMeta >= 100) {
    alertas.push({
      tipo: "positive",
      titulo: "Meta mensal de receita atingida!",
      descricao: `R$ ${(metasGerais.receitaMensal.atual / 1000).toFixed(0)}K de R$ ${(metasGerais.receitaMensal.meta / 1000).toFixed(0)}K — ${pctMeta.toFixed(0)}% alcançado.`,
      acao: "Celebrar e definir nova meta",
      timestamp: new Date(now.getTime() - 1800000).toISOString(),
    });
  }

  // Top performer recognition
  const top = [...equipeComercial].sort((a, b) => b.vendas - a.vendas)[0];
  if (top.tendencia === "up") {
    alertas.push({
      tipo: "positive",
      titulo: `Destaque: ${top.nome} em alta`,
      descricao: `${top.nome} mantém tendência de crescimento com ${top.contratos} contratos e R$ ${(top.vendas / 1000).toFixed(0)}K em vendas.`,
      acao: "Reconhecer e compartilhar práticas",
      timestamp: new Date(now.getTime() - 12 * 3600000).toISOString(),
    });
  }

  // Retention alert
  if (metasGerais.retencao.atual < metasGerais.retencao.meta) {
    alertas.push({
      tipo: "warning",
      titulo: `Retenção abaixo da meta: ${metasGerais.retencao.atual}%`,
      descricao: `Meta de retenção é ${metasGerais.retencao.meta}%, atualmente em ${metasGerais.retencao.atual}%. Necessário plano de retenção.`,
      acao: "Implementar plano de retenção",
      timestamp: new Date(now.getTime() - 24 * 3600000).toISOString(),
    });
  }

  return alertas;
}
