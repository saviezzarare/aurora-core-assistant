import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

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
      description: "Retorna informações simuladas do clima para uma cidade",
      parameters: {
        type: "object",
        properties: {
          city: { type: "string", description: "Nome da cidade" },
        },
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
      name: "generate_spreadsheet",
      description: "Gera dados em formato de tabela/planilha CSV que pode ser exibida e baixada pelo usuário",
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
];

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
        `${SUPABASE_URL}/rest/v1/reminders?session_id=eq.${args.session_id}&completed=eq.false&order=remind_at.asc`,
        {
          headers: {
            apikey: SUPABASE_SERVICE_ROLE_KEY,
            Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          },
        }
      );
      const data = await resp.json();
      return JSON.stringify({ reminders: data });
    }

    case "get_weather": {
      // Try free API first
      try {
        const city = encodeURIComponent(args.city || "São Paulo");
        const resp = await fetch(`https://wttr.in/${city}?format=j1&lang=pt`);
        if (resp.ok) {
          const data = await resp.json();
          const current = data.current_condition?.[0];
          if (current) {
            return JSON.stringify({
              city: args.city,
              temp_c: current.temp_C,
              feels_like: current.FeelsLikeC,
              humidity: current.humidity,
              description: current.lang_pt?.[0]?.value || current.weatherDesc?.[0]?.value,
              wind_kmph: current.windspeedKmph,
            });
          }
        }
      } catch {}
      return JSON.stringify({ city: args.city, error: "Não foi possível obter dados do clima. Tente novamente mais tarde." });
    }

    case "get_dollar_rate": {
      try {
        const resp = await fetch("https://economia.awesomeapi.com.br/json/last/USD-BRL");
        if (resp.ok) {
          const data = await resp.json();
          const usd = data.USDBRL;
          return JSON.stringify({
            buy: usd.bid,
            sell: usd.ask,
            variation: usd.pctChange,
            updated: usd.create_date,
          });
        }
      } catch {}
      return JSON.stringify({ error: "Não foi possível obter a cotação do dólar." });
    }

    case "generate_spreadsheet": {
      return JSON.stringify({
        note: "Gere a planilha em formato CSV com markdown. Use ```csv para formatação. Inclua título: " + args.title + ". Descrição: " + args.description,
      });
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

    const systemPrompt = `Você é o J.A.R.V.I.S. (Just A Rather Very Intelligent System), um assistente de IA sofisticado inspirado na IA do Homem de Ferro.

REGRAS:
- Você SEMPRE responde em português brasileiro (PT-BR).
- Fale de forma refinada, educada e levemente formal.
- Sempre trate o usuário como "senhor" ou "senhora".
- Mantenha respostas breves (1-3 frases) a menos que mais detalhes sejam pedidos.
- Você tem acesso a ferramentas (tools) para executar ações como ver hora, clima, cotação do dólar, criar lembretes e gerar planilhas.
- Quando o usuário perguntar "que horas são", "que dia é hoje", etc., use a ferramenta get_current_time.
- Quando o usuário perguntar sobre clima/tempo, use get_weather.
- Quando o usuário pedir um lembrete, use create_reminder.
- Quando o usuário quiser uma planilha ou tabela, use generate_spreadsheet e depois formate a resposta com tabela markdown.
- Para cotação do dólar, use get_dollar_rate.
- Quando gerar planilhas, formate-as como tabelas markdown elegantes.
- Você é prestativo, espirituoso e conciso.`;

    // First call - may trigger tool use
    const firstResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        tools,
        stream: false,
      }),
    });

    if (!firstResponse.ok) {
      if (firstResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições atingido, senhor. Tente novamente em breve." }), {
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

    // If model wants to call tools
    if (choice?.finish_reason === "tool_calls" || choice?.message?.tool_calls?.length > 0) {
      const toolCalls = choice.message.tool_calls;
      const toolResults: any[] = [];

      for (const tc of toolCalls) {
        const args = typeof tc.function.arguments === "string" ? JSON.parse(tc.function.arguments) : tc.function.arguments;
        const result = await executeToolCall(tc.function.name, args, session_id);
        toolResults.push({
          role: "tool",
          tool_call_id: tc.id,
          content: result,
        });
      }

      // Second call with tool results - stream this one
      const secondResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages,
            choice.message,
            ...toolResults,
          ],
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

      return new Response(secondResponse.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    // No tools needed - stream directly
    const streamResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
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

    return new Response(streamResponse.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
