// Excel import/export utilities for JARVIS COMERCIAL
import * as XLSX from "xlsx";
import { equipeComercial, funilData, vendasMensais, metasGerais } from "./commercialData";

// --- EXPORT ---

function downloadWorkbook(wb: XLSX.WorkBook, filename: string) {
  XLSX.writeFile(wb, filename);
}

export function exportarRankingVendedores() {
  const data = equipeComercial.map((v, i) => ({
    "#": i + 1,
    Vendedor: v.nome,
    Supervisor: v.supervisor,
    "Vendas (R$)": v.vendas,
    "Meta (R$)": v.meta,
    "% Meta": Math.round((v.vendas / v.meta) * 100) + "%",
    Contratos: v.contratos,
    "Conversão": v.conversao + "%",
    Leads: v.leads,
    Propostas: v.propostas,
    "Ticket Médio (R$)": v.ticketMedio,
    Tendência: v.tendencia === "up" ? "↑ Alta" : v.tendencia === "down" ? "↓ Queda" : "→ Estável",
  }));
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);
  ws["!cols"] = [{ wch: 4 }, { wch: 18 }, { wch: 18 }, { wch: 14 }, { wch: 12 }, { wch: 8 }, { wch: 10 }, { wch: 10 }, { wch: 8 }, { wch: 10 }, { wch: 15 }, { wch: 10 }];
  XLSX.utils.book_append_sheet(wb, ws, "Ranking Vendedores");
  downloadWorkbook(wb, "ranking_vendedores_jarvis.xlsx");
}

export function exportarFunilComercial() {
  const etapas = [
    { Etapa: "Leads Gerados", Quantidade: funilData.leads, "Conversão": "100%" },
    { Etapa: "Qualificados", Quantidade: funilData.qualificados, "Conversão": Math.round((funilData.qualificados / funilData.leads) * 100) + "%" },
    { Etapa: "Propostas Enviadas", Quantidade: funilData.propostas, "Conversão": Math.round((funilData.propostas / funilData.qualificados) * 100) + "%" },
    { Etapa: "Em Negociação", Quantidade: funilData.negociacao, "Conversão": Math.round((funilData.negociacao / funilData.propostas) * 100) + "%" },
    { Etapa: "Fechados", Quantidade: funilData.fechados, "Conversão": Math.round((funilData.fechados / funilData.negociacao) * 100) + "%" },
  ];
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(etapas);
  ws["!cols"] = [{ wch: 22 }, { wch: 12 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(wb, ws, "Funil Comercial");
  downloadWorkbook(wb, "funil_comercial_jarvis.xlsx");
}

export function exportarVendasMensais() {
  const data = vendasMensais.map(m => ({
    Mês: m.mes,
    "Vendas (R$)": m.vendas,
    "Meta (R$)": m.meta,
    "% Atingimento": Math.round((m.vendas / m.meta) * 100) + "%",
    Diferença: m.vendas - m.meta,
  }));
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, "Vendas Mensais");
  downloadWorkbook(wb, "vendas_mensais_jarvis.xlsx");
}

export function exportarMetas() {
  const data = [
    { Indicador: "Receita Mensal", Atual: `R$ ${metasGerais.receitaMensal.atual}`, Meta: `R$ ${metasGerais.receitaMensal.meta}`, Atingimento: Math.round((metasGerais.receitaMensal.atual / metasGerais.receitaMensal.meta) * 100) + "%" },
    { Indicador: "Novos Contratos", Atual: metasGerais.novosContratos.atual, Meta: metasGerais.novosContratos.meta, Atingimento: Math.round((metasGerais.novosContratos.atual / metasGerais.novosContratos.meta) * 100) + "%" },
    { Indicador: "Taxa de Conversão", Atual: metasGerais.taxaConversao.atual + "%", Meta: metasGerais.taxaConversao.meta + "%", Atingimento: Math.round((metasGerais.taxaConversao.atual / metasGerais.taxaConversao.meta) * 100) + "%" },
    { Indicador: "Ticket Médio", Atual: `R$ ${metasGerais.ticketMedio.atual}`, Meta: `R$ ${metasGerais.ticketMedio.meta}`, Atingimento: Math.round((metasGerais.ticketMedio.atual / metasGerais.ticketMedio.meta) * 100) + "%" },
    { Indicador: "Retenção", Atual: metasGerais.retencao.atual + "%", Meta: metasGerais.retencao.meta + "%", Atingimento: Math.round((metasGerais.retencao.atual / metasGerais.retencao.meta) * 100) + "%" },
    { Indicador: "Leads Qualificados", Atual: metasGerais.leadsQualificados.atual, Meta: metasGerais.leadsQualificados.meta, Atingimento: Math.round((metasGerais.leadsQualificados.atual / metasGerais.leadsQualificados.meta) * 100) + "%" },
  ];
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(wb, ws, "Metas Comerciais");
  downloadWorkbook(wb, "metas_comerciais_jarvis.xlsx");
}

export function exportarRelatorioCompleto() {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Ranking
  const ranking = equipeComercial.map((v, i) => ({
    "#": i + 1, Vendedor: v.nome, Supervisor: v.supervisor,
    "Vendas (R$)": v.vendas, "Meta (R$)": v.meta, Contratos: v.contratos,
    "Conversão": v.conversao + "%",
  }));
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(ranking), "Equipe");

  // Sheet 2: Funil
  const funil = [
    { Etapa: "Leads", Qtd: funilData.leads },
    { Etapa: "Qualificados", Qtd: funilData.qualificados },
    { Etapa: "Propostas", Qtd: funilData.propostas },
    { Etapa: "Negociação", Qtd: funilData.negociacao },
    { Etapa: "Fechados", Qtd: funilData.fechados },
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(funil), "Funil");

  // Sheet 3: Vendas Mensais
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(vendasMensais), "Vendas Mensais");

  downloadWorkbook(wb, "relatorio_completo_jarvis.xlsx");
}

// --- IMPORT ---

export interface ImportedData {
  headers: string[];
  rows: Record<string, any>[];
  sheetName: string;
}

export function importarExcel(file: File): Promise<ImportedData[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheets: ImportedData[] = workbook.SheetNames.map(name => {
          const sheet = workbook.Sheets[name];
          const json = XLSX.utils.sheet_to_json<Record<string, any>>(sheet);
          const headers = json.length > 0 ? Object.keys(json[0]) : [];
          return { headers, rows: json, sheetName: name };
        });
        resolve(sheets);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}
