import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// === COMMERCIAL DATA (mirrors frontend commercialData.ts) ===
const equipeComercial = [
  { nome: "João Gabriel", cargo: "Vendedor PJ", supervisor: "Oderlei Pereira", vendas: 185000, meta: 150000, contratos: 14, conversao: 42, leads: 48, propostas: 22, ticketMedio: 13214, tendencia: "up" },
  { nome: "Cleverson Bispo", cargo: "Vendedor PJ", supervisor: "Oderlei Pereira", vendas: 162000, meta: 150000, contratos: 11, conversao: 38, leads: 42, propostas: 18, ticketMedio: 14727, tendencia: "up" },
  { nome: "José Victor", cargo: "Vendedor PJ", supervisor: "Kátia Moraes", vendas: 134000, meta: 140000, contratos: 9, conversao: 31, leads: 38, propostas: 15, ticketMedio: 14889, tendencia: "stable" },
  { nome: "Douglas", cargo: "Vendedor PJ", supervisor: "Kátia Moraes", vendas: 98000, meta: 130000, contratos: 6, conversao: 22, leads: 35, propostas: 11, ticketMedio: 16333, tendencia: "down" },
];

const funilData = { leads: 163, qualificados: 85, propostas: 66, negociacao: 38, fechados: 40 };

const vendasMensais = [
  { mes: "Jan", vendas: 450000, meta: 500000 }, { mes: "Fev", vendas: 492000, meta: 500000 },
  { mes: "Mar", vendas: 541000, meta: 520000 }, { mes: "Abr", vendas: 538000, meta: 520000 },
  { mes: "Mai", vendas: 559000, meta: 550000 }, { mes: "Jun", vendas: 579000, meta: 570000 },
];

const metasGerais = {
  receitaMensal: { atual: 579000, meta: 570000 },
  novosContratos: { atual: 40, meta: 45 },
  taxaConversao: { atual: 24.5, meta: 30 },
  ticketMedio: { atual: 14478, meta: 15000 },
  retencao: { atual: 92, meta: 95 },
  leadsQualificados: { atual: 85, meta: 100 },
};

// === TOOLS ===
const tools = [
  {
    type: "function",
    function: {
      name: "get_current_time",
      description: "Retorna a data e hora atual no fuso horário do Brasil",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "create_reminder",
      description: "Cria um lembrete para o usuário",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Título do lembrete" },
          minutes_from_now: { type: "number", description: "Minutos a partir de agora para o lembrete" },
        },
        required: ["title", "minutes_from_now"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "list_reminders",
      description: "Lista os lembretes ativos do usuário",
      parameters: {
        type: "object",
        properties: {
          session_id: { type: "string", description: "ID da sessão do usuário" },
        },
        required: ["session_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_weather",
      description: "Retorna informações do clima para uma cidade",
      parameters: {
        type: "object",
        properties: { city: { type: "string", description: "Nome da cidade" } },
        required: ["city"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_dollar_rate",
      description: "Retorna a cotação atual do dólar em relação ao real",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "get_news",
      description: "Retorna as últimas notícias do Brasil",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "generate_spreadsheet",
      description: "Gera dados em formato de tabela markdown",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Título da planilha" },
          description: { type: "string", description: "Descrição do conteúdo desejado" },
        },
        required: ["title", "description"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "web_search",
      description: "Pesquisa informações na web sobre qualquer assunto",
      parameters: {
        type: "object",
        properties: { query: { type: "string", description: "Termo de pesquisa" } },
        required: ["query"],
      },
    },
  },
  // === NEW: Commercial data tools ===
  {
    type: "function",
    function: {
      name: "get_team_performance",
      description: "Retorna dados de desempenho de toda a equipe comercial ou de um vendedor específico. Use para perguntas sobre vendas, contratos, conversão, ranking, metas de vendedores.",
      parameters: {
        type: "object",
        properties: {
          vendedor: { type: "string", description: "Nome do vendedor (opcional, se vazio retorna todos)" },
        },
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_sales_funnel",
      description: "Retorna dados do funil comercial: leads, qualificados, propostas, negociação e fechados.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "get_monthly_sales",
      description: "Retorna vendas mensais e metas mensais para análise de tendência e previsão.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "get_goals_status",
      description: "Retorna o status de todas as metas comerciais (receita, contratos, conversão, ticket médio, retenção, leads).",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function",
    function: {
      name: "simulate_scenario",
      description: "Simula cenários como aumento de leads, melhoria de conversão ou aumento de ticket médio e retorna o impacto projetado.",
      parameters: {
        type: "object",
        properties: {
          tipo: { type: "string", enum: ["aumento_leads", "melhoria_conversao", "aumento_ticket"], description: "Tipo de simulação" },
          percentual: { type: "number", description: "Percentual de mudança (ex: 20 para 20%)" },
        },
        required: ["tipo", "percentual"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_strategic_alerts",
      description: "Retorna alertas estratégicos automáticos sobre a equipe comercial.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
];

// === TOOL EXECUTION ===
async function executeToolCall(name: string, args: Record<string, any>, sessionId?: string): Promise<string> {
  switch (name) {
    case "get_current_time": {
      const now = new Date();
      const brTime = now.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
      const dayOfWeek = now.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo", weekday: "long" });
      return JSON.stringify({ datetime: brTime, day_of_week: dayOfWeek });
    }

    case "create_reminder": {
      const remindAt = new Date(Date.now() + (args.minutes_from_now || 30) * 60000);
      const resp = await fetch(`${SUPABASE_URL}/rest/v1/reminders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          session_id: sessionId || "default",
          title: args.title,
          remind_at: remindAt.toISOString(),
        }),
      });
      const data = await resp.json();
      return JSON.stringify({ success: true, reminder: data[0], remind_at: remindAt.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }) });
    }

    case "list_reminders": {
      const resp = await fetch(
        `${SUPABASE_URL}/rest/v1/reminders?session_id=eq.${args.session_id || sessionId}&completed=eq.false&order=remind_at.asc`,
        { headers: { apikey: SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` } }
      );
      const data = await resp.json();
      return JSON.stringify({ reminders: data });
    }

    case "get_weather": {
      try {
        const city = encodeURIComponent(args.city || "Bauru");
        const resp = await fetch(`https://wttr.in/${city}?format=j1&lang=pt`);
        if (resp.ok) {
          const data = await resp.json();
          const current = data.current_condition?.[0];
          if (current) {
            return JSON.stringify({
              city: args.city, temp_c: current.temp_C, feels_like: current.FeelsLikeC,
              humidity: current.humidity, description: current.lang_pt?.[0]?.value || current.weatherDesc?.[0]?.value,
              wind_kmph: current.windspeedKmph,
            });
          }
        }
      } catch {}
      return JSON.stringify({ city: args.city, error: "Não foi possível obter dados do clima." });
    }

    case "get_dollar_rate": {
      try {
        const resp = await fetch("https://economia.awesomeapi.com.br/json/last/USD-BRL");
        if (resp.ok) {
          const data = await resp.json();
          const usd = data.USDBRL;
          return JSON.stringify({ buy: usd.bid, sell: usd.ask, variation: usd.pctChange, updated: usd.create_date });
        }
      } catch {}
      return JSON.stringify({ error: "Não foi possível obter a cotação do dólar." });
    }

    case "get_news": {
      try {
        const resp = await fetch("https://newsdata.io/api/1/news?country=br&language=pt&apikey=pub_0000000000000");
        if (resp.ok) {
          const data = await resp.json();
          if (data.results) {
            const headlines = data.results.slice(0, 5).map((a: any) => ({ title: a.title, source: a.source_name }));
            return JSON.stringify({ headlines });
          }
        }
      } catch {}
      return JSON.stringify({ note: "Serviço de notícias indisponível no momento." });
    }

    case "generate_spreadsheet": {
      return JSON.stringify({ note: "Gere a planilha como tabela markdown formatada. Título: " + args.title + ". Descrição: " + args.description });
    }

    case "web_search": {
      return JSON.stringify({ note: "Forneça a melhor resposta possível com base no seu conhecimento sobre: " + args.query });
    }

    // === COMMERCIAL DATA TOOLS ===
    case "get_team_performance": {
      if (args.vendedor) {
        const v = equipeComercial.find(e => e.nome.toLowerCase().includes(args.vendedor.toLowerCase()));
        if (v) return JSON.stringify(v);
        return JSON.stringify({ error: `Vendedor "${args.vendedor}" não encontrado. Vendedores: ${equipeComercial.map(e => e.nome).join(", ")}` });
      }
      const totalVendas = equipeComercial.reduce((s, v) => s + v.vendas, 0);
      const totalMeta = equipeComercial.reduce((s, v) => s + v.meta, 0);
      const ranking = [...equipeComercial].sort((a, b) => b.vendas - a.vendas);
      return JSON.stringify({
        equipe: equipeComercial,
        ranking: ranking.map((v, i) => `${i + 1}. ${v.nome}: R$ ${(v.vendas / 1000).toFixed(0)}K (${v.conversao}% conversão)`),
        totalVendas, totalMeta,
        atingimentoMeta: ((totalVendas / totalMeta) * 100).toFixed(1) + "%",
        supervisores: [
          { nome: "Oderlei Pereira", vendedores: ["João Gabriel", "Cleverson Bispo"] },
          { nome: "Kátia Moraes", vendedores: ["José Victor", "Douglas"] },
        ],
      });
    }

    case "get_sales_funnel": {
      const taxas = {
        qualificacao: ((funilData.qualificados / funilData.leads) * 100).toFixed(1) + "%",
        proposta: ((funilData.propostas / funilData.qualificados) * 100).toFixed(1) + "%",
        negociacao: ((funilData.negociacao / funilData.propostas) * 100).toFixed(1) + "%",
        fechamento: ((funilData.fechados / funilData.negociacao) * 100).toFixed(1) + "%",
        conversaoGeral: ((funilData.fechados / funilData.leads) * 100).toFixed(1) + "%",
      };
      return JSON.stringify({ funil: funilData, taxasConversao: taxas });
    }

    case "get_monthly_sales": {
      const totalVendido = vendasMensais.reduce((s, m) => s + m.vendas, 0);
      const totalMeta = vendasMensais.reduce((s, m) => s + m.meta, 0);
      const media = totalVendido / vendasMensais.length;
      const ultimo = vendasMensais[vendasMensais.length - 1];
      const crescimento = ((ultimo.vendas - vendasMensais[0].vendas) / vendasMensais[0].vendas * 100).toFixed(1);
      return JSON.stringify({
        meses: vendasMensais, totalVendido, totalMeta,
        mediaMensal: Math.round(media),
        crescimentoPeriodo: crescimento + "%",
        previsaoProximoMes: Math.round(ultimo.vendas * 1.035),
      });
    }

    case "get_goals_status": {
      const status = Object.entries(metasGerais).map(([key, val]) => ({
        indicador: key,
        atual: val.atual,
        meta: val.meta,
        atingimento: ((val.atual / val.meta) * 100).toFixed(1) + "%",
        status: val.atual >= val.meta ? "✅ Atingida" : val.atual >= val.meta * 0.9 ? "⚠️ Próxima" : "🔴 Abaixo",
      }));
      return JSON.stringify({ metas: status });
    }

    case "simulate_scenario": {
      const pct = (args.percentual || 10) / 100;
      if (args.tipo === "aumento_leads") {
        const novosLeads = Math.round(funilData.leads * (1 + pct));
        const novosContratos = Math.round(novosLeads * (funilData.fechados / funilData.leads));
        const contratosAtuais = funilData.fechados;
        return JSON.stringify({
          cenario: `Aumento de ${args.percentual}% nos leads`,
          leadsAtuais: funilData.leads, novosLeads,
          contratosAtuais, contratosProjetados: novosContratos,
          ganho: novosContratos - contratosAtuais,
        });
      }
      if (args.tipo === "melhoria_conversao") {
        const convAtual = funilData.fechados / funilData.leads;
        const novaConv = convAtual * (1 + pct);
        const novosContratos = Math.round(funilData.leads * novaConv);
        return JSON.stringify({
          cenario: `Melhoria de ${args.percentual}% na conversão`,
          conversaoAtual: (convAtual * 100).toFixed(1) + "%",
          novaConversao: (novaConv * 100).toFixed(1) + "%",
          contratosAtuais: funilData.fechados, contratosProjetados: novosContratos,
          ganho: novosContratos - funilData.fechados,
        });
      }
      if (args.tipo === "aumento_ticket") {
        const ticketAtual = metasGerais.ticketMedio.atual;
        const novoTicket = Math.round(ticketAtual * (1 + pct));
        const totalVendas = equipeComercial.reduce((s, v) => s + v.vendas, 0);
        const novaReceita = Math.round(totalVendas * (1 + pct));
        return JSON.stringify({
          cenario: `Aumento de ${args.percentual}% no ticket médio`,
          ticketAtual, novoTicket, receitaAtual: totalVendas, receitaProjetada: novaReceita,
          ganho: novaReceita - totalVendas,
        });
      }
      return JSON.stringify({ error: "Tipo de simulação não reconhecido." });
    }

    case "get_strategic_alerts": {
      const alerts: any[] = [];
      // Declining sellers
      equipeComercial.filter(v => v.tendencia === "down").forEach(v => {
        alerts.push({ tipo: "critical", titulo: `Queda: ${v.nome}`, descricao: `Vendas em declínio. Conversão: ${v.conversao}%.` });
      });
      // Low conversion
      equipeComercial.filter(v => v.conversao < 25).forEach(v => {
        alerts.push({ tipo: "warning", titulo: `Baixa conversão: ${v.nome} (${v.conversao}%)`, descricao: `${v.leads} leads → ${v.contratos} contratos.` });
      });
      // Below meta
      equipeComercial.filter(v => v.vendas < v.meta * 0.8).forEach(v => {
        alerts.push({ tipo: "warning", titulo: `Abaixo da meta: ${v.nome}`, descricao: `R$ ${(v.vendas/1000).toFixed(0)}K de R$ ${(v.meta/1000).toFixed(0)}K (${((v.vendas/v.meta)*100).toFixed(0)}%).` });
      });
      // Top performer
      const top = [...equipeComercial].sort((a, b) => b.vendas - a.vendas)[0];
      alerts.push({ tipo: "positive", titulo: `Destaque: ${top.nome}`, descricao: `Lidera com R$ ${(top.vendas/1000).toFixed(0)}K e ${top.contratos} contratos.` });
      // Meta status
      const pct = (metasGerais.receitaMensal.atual / metasGerais.receitaMensal.meta) * 100;
      if (pct >= 100) alerts.push({ tipo: "positive", titulo: "Meta mensal atingida!", descricao: `${pct.toFixed(0)}% alcançado.` });
      else if (pct >= 90) alerts.push({ tipo: "info", titulo: `Meta a ${(100-pct).toFixed(0)}% de ser atingida`, descricao: `Faltam R$ ${((metasGerais.receitaMensal.meta - metasGerais.receitaMensal.atual)/1000).toFixed(0)}K.` });
      // Funnel
      if (funilData.negociacao > funilData.fechados * 1.5) {
        alerts.push({ tipo: "warning", titulo: "Acúmulo em negociação", descricao: `${funilData.negociacao} propostas em negociação vs ${funilData.fechados} fechamentos.` });
      }
      // Retention
      if (metasGerais.retencao.atual < metasGerais.retencao.meta) {
        alerts.push({ tipo: "warning", titulo: `Retenção: ${metasGerais.retencao.atual}%`, descricao: `Meta: ${metasGerais.retencao.meta}%.` });
      }
      return JSON.stringify({ alertas: alerts });
    }

    default:
      return JSON.stringify({ error: "Função desconhecida" });
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, session_id } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `Você é o J.A.R.V.I.S. COMERCIAL (Just A Rather Very Intelligent System), um assistente executivo de inteligência de vendas integrado ao sistema JARVIS COMERCIAL.

USUÁRIO PRINCIPAL:
O usuário principal é o Diego, que utiliza o sistema para estudo e análise de dados comerciais da Unimed Bauru. Reconheça-o pelo nome quando possível e personalize as análises para seu contexto.

REGRAS GERAIS:
- Responda SEMPRE em português brasileiro (PT-BR).
- Fale de forma refinada, educada e levemente formal.
- Trate o usuário como "senhor" ou "Diego" quando apropriado.
- Respostas breves (2-4 frases) a menos que mais detalhes sejam pedidos.
- SEMPRE use as ferramentas (tools) de dados comerciais para responder perguntas sobre vendas, equipe, metas, funil — NUNCA invente números.

SEU PAPEL:
- Especialista em vendas e analista de dados comerciais
- Consultor estratégico de vendas
- Assistente executivo
- Gerador automático de relatórios e insights

CONTEXTO ORGANIZACIONAL — UNIMED BAURU:
- Gerente Comercial: Dorival Russo de Moraes
- Supervisores: Oderlei Pereira (supervisiona João Gabriel e Cleverson), Kátia Moraes (supervisiona José Victor e Douglas)
- Vendedores PJ: João Gabriel, Cleverson Bispo, José Victor, Douglas
Sempre reconheça esses nomes como membros da equipe.

MÓDULOS DO SISTEMA:
Dashboard Comercial | Performance da Equipe | Funil Comercial | Previsão de Vendas | Metas Comerciais | Relatórios | Simulações Estratégicas | Alertas Estratégicos | Importar Dados

FERRAMENTAS DE DADOS COMERCIAIS:
- get_team_performance: dados de desempenho da equipe ou vendedor específico
- get_sales_funnel: funil comercial completo com taxas de conversão
- get_monthly_sales: vendas mensais, tendências e previsão
- get_goals_status: status de todas as metas comerciais
- simulate_scenario: simulações what-if (aumento de leads, melhoria de conversão, aumento de ticket)
- get_strategic_alerts: alertas estratégicos automáticos

COMO ANALISAR DADOS:
1. SEMPRE chame a ferramenta antes de responder sobre dados — nunca invente números
2. Interprete os dados estrategicamente — não apenas repita os números
3. Compare vendedores entre si quando relevante
4. Identifique tendências, gargalos e oportunidades
5. Sugira ações práticas baseadas nos dados
6. Quando gerar tabelas, use markdown formatado

OUTRAS FERRAMENTAS:
- get_current_time: data e hora atual
- get_weather: clima (padrão: Bauru)
- create_reminder / list_reminders: lembretes
- get_dollar_rate: cotação do dólar
- get_news: últimas notícias
- generate_spreadsheet: gerar tabelas markdown
- web_search: pesquisar informações`;

    const firstResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        tools,
        stream: false,
      }),
    });

    if (!firstResponse.ok) {
      if (firstResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições atingido, senhor." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (firstResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos esgotados, senhor." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await firstResponse.text();
      console.error("AI gateway error:", firstResponse.status, t);
      return new Response(JSON.stringify({ error: "Erro no gateway de IA" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const firstData = await firstResponse.json();
    const choice = firstData.choices?.[0];

    if (choice?.finish_reason === "tool_calls" || choice?.message?.tool_calls?.length > 0) {
      const toolCalls = choice.message.tool_calls;
      const toolResults: any[] = [];

      for (const tc of toolCalls) {
        const args = typeof tc.function.arguments === "string" ? JSON.parse(tc.function.arguments) : tc.function.arguments;
        const result = await executeToolCall(tc.function.name, args, session_id);
        toolResults.push({ role: "tool", tool_call_id: tc.id, content: result });
      }

      const secondResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [{ role: "system", content: systemPrompt }, ...messages, choice.message, ...toolResults],
          stream: true,
        }),
      });

      if (!secondResponse.ok) {
        const t = await secondResponse.text();
        console.error("Second call error:", secondResponse.status, t);
        return new Response(JSON.stringify({ error: "Erro ao processar resultado" }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(secondResponse.body, { headers: { ...corsHeaders, "Content-Type": "text/event-stream" } });
    }

    const streamResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        stream: true,
      }),
    });

    if (!streamResponse.ok) {
      const t = await streamResponse.text();
      console.error("Stream error:", streamResponse.status, t);
      return new Response(JSON.stringify({ error: "Erro no streaming" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(streamResponse.body, { headers: { ...corsHeaders, "Content-Type": "text/event-stream" } });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
