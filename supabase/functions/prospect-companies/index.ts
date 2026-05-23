import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface ProspectBody {
  cidade: string;
  estado?: string;
  segmento: string;
  limit?: number;
}

function qualificar(nome: string, segmento: string, cidade: string) {
  let score = 40;
  const obs: string[] = [];
  const segLower = (segmento || "").toLowerCase();

  if (/sa[uú]de|cl[ií]nica|hospital|laborat[oó]rio|farm[aá]cia/.test(segLower)) { score += 25; obs.push("Segmento saúde"); }
  if (/ind[uú]stria|metal|fabrica|f[aá]brica/.test(segLower)) { score += 15; obs.push("Indústria"); }
  if (/escrit[oó]rio|advocacia|cont[aá]bil|consultor/.test(segLower)) { score += 10; obs.push("Serviço profissional"); }
  if (/bauru|jaú|jau|len[çc][oó]is|agudos|pederneiras/i.test(cidade)) { score += 15; obs.push("Cidade de carteira"); }
  if (/ltda|s\.?a\.?|me\b|epp/i.test(nome)) { score += 5; }
  score = Math.min(100, score);

  let qualificacao = "frio";
  if (score >= 75) qualificacao = "quente";
  else if (score >= 55) qualificacao = "morno";
  return { score, qualificacao, observacoes: obs.join(" · ") };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
    if (!FIRECRAWL_API_KEY) throw new Error("FIRECRAWL_API_KEY não configurada");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Authenticate caller
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Não autenticado" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await authClient.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Sessão inválida" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = userData.user.id;

    const body = (await req.json()) as ProspectBody;
    const cidade = (body.cidade || "").trim();
    const segmento = (body.segmento || "").trim();
    if (!cidade || !segmento) {
      return new Response(JSON.stringify({ error: "cidade e segmento são obrigatórios" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const limit = Math.min(body.limit || 10, 20);

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: searchRow } = await supabase
      .from("prospection_searches")
      .insert({ user_id: userId, cidade, estado: body.estado || "SP", segmento, filtros: { limit }, status: "executando" })
      .select()
      .single();
    const searchId = searchRow?.id;

    const query = `${segmento} em ${cidade} ${body.estado || "SP"} site:.com.br OR site:.com`;
    const fcRes = await fetch("https://api.firecrawl.dev/v2/search", {
      method: "POST",
      headers: { Authorization: `Bearer ${FIRECRAWL_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ query, limit, lang: "pt", country: "br" }),
    });
    const fcJson = await fcRes.json();
    if (!fcRes.ok) throw new Error(`Firecrawl ${fcRes.status}: ${JSON.stringify(fcJson).slice(0, 300)}`);

    const results: any[] = fcJson?.data?.web || fcJson?.data || fcJson?.results?.web || fcJson?.results || [];

    const inserts = results.slice(0, limit).map((r: any) => {
      const nome = (r.title || r.url || "").replace(/\s*[-|–·].*$/, "").trim().slice(0, 200) || "Empresa";
      const q = qualificar(nome, segmento, cidade);
      return {
        user_id: userId,
        nome,
        site: r.url || null,
        cidade,
        estado: body.estado || "SP",
        segmento,
        fonte: "firecrawl",
        lead_score: q.score,
        qualificacao: q.qualificacao,
        observacoes: [r.description, q.observacoes].filter(Boolean).join(" — ").slice(0, 500),
        raw: r,
        search_id: searchId,
      };
    });

    let saved: any[] = [];
    if (inserts.length) {
      const { data } = await supabase.from("prospected_companies").insert(inserts).select();
      saved = data || [];
    }

    await supabase.from("prospection_searches")
      .update({ total_encontrado: saved.length, status: "concluida" })
      .eq("id", searchId);

    return new Response(JSON.stringify({ success: true, search_id: searchId, total: saved.length, empresas: saved }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("prospect-companies error:", msg);
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
