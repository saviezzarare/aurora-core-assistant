import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileSpreadsheet, BarChart3, Table, X, Check } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { importarExcel, type ImportedData } from "@/lib/excelUtils";

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--primary) / 0.7)",
  "hsl(var(--primary) / 0.5)",
  "hsl(var(--primary) / 0.35)",
  "hsl(var(--muted-foreground))",
];

type ViewMode = "table" | "bar" | "line" | "pie";

const ImportarDados = () => {
  const [sheets, setSheets] = useState<ImportedData[]>([]);
  const [activeSheet, setActiveSheet] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedColumns, setSelectedColumns] = useState<{ label: string; value: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      const data = await importarExcel(file);
      setSheets(data);
      setActiveSheet(0);
      setViewMode("table");
      // Auto-detect numeric columns for charts
      if (data.length > 0 && data[0].rows.length > 0) {
        const headers = data[0].headers;
        const numericCol = headers.find(h => typeof data[0].rows[0][h] === "number");
        const labelCol = headers.find(h => typeof data[0].rows[0][h] === "string");
        if (numericCol && labelCol) {
          setSelectedColumns({ label: labelCol, value: numericCol });
        }
      }
    } catch (err) {
      setError("Erro ao ler o arquivo. Verifique se é um arquivo Excel válido.");
    }
    setLoading(false);
  };

  const currentSheet = sheets[activeSheet];
  const numericHeaders = currentSheet?.headers.filter(h => currentSheet.rows.some(r => typeof r[h] === "number")) || [];
  const stringHeaders = currentSheet?.headers.filter(h => currentSheet.rows.some(r => typeof r[h] === "string")) || [];

  const chartData = currentSheet?.rows.slice(0, 50) || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full h-full p-4 sm:p-6 overflow-y-auto"
    >
      <h2 className="text-lg font-semibold text-primary tracking-wider mb-4">IMPORTAR DADOS</h2>

      {/* Upload area */}
      {sheets.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="border-2 border-dashed border-primary/30 rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
          onClick={() => fileRef.current?.click()}
        >
          <Upload className="w-10 h-10 text-primary/40 mx-auto mb-3" />
          <p className="text-sm text-foreground mb-1">Arraste ou clique para importar</p>
          <p className="text-[10px] text-muted-foreground">Formatos: .xlsx, .xls, .csv</p>
          {loading && <p className="text-xs text-primary mt-3 animate-pulse">Processando...</p>}
          {error && <p className="text-xs text-red-400 mt-3">{error}</p>}
        </motion.div>
      )}
      <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFile} />

      {/* Sheet tabs + controls */}
      {sheets.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-3">
            <div className="flex gap-1.5">
              {sheets.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setActiveSheet(i)}
                  className={`px-2.5 py-1 text-[10px] rounded border transition-colors ${
                    i === activeSheet ? "border-primary/40 bg-primary/15 text-primary" : "border-primary/10 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {s.sheetName}
                </button>
              ))}
            </div>
            <div className="flex gap-1">
              <button onClick={() => { setSheets([]); setSelectedColumns(null); }} className="p-1.5 rounded border border-red-400/20 text-red-400/60 hover:text-red-400 hover:bg-red-400/10 transition-colors">
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* View mode tabs */}
          <div className="flex gap-1.5 mb-4">
            {([
              { mode: "table" as ViewMode, icon: Table, label: "Tabela" },
              { mode: "bar" as ViewMode, icon: BarChart3, label: "Barras" },
              { mode: "line" as ViewMode, icon: BarChart3, label: "Linha" },
              { mode: "pie" as ViewMode, icon: BarChart3, label: "Pizza" },
            ]).map(({ mode, icon: Icon, label }) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`flex items-center gap-1 px-2.5 py-1.5 text-[10px] rounded border transition-colors ${
                  viewMode === mode ? "border-primary/40 bg-primary/15 text-primary" : "border-primary/10 text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-3 h-3" />
                {label}
              </button>
            ))}
          </div>

          {/* Column selector for charts */}
          {viewMode !== "table" && (
            <div className="flex gap-3 mb-4">
              <div>
                <label className="text-[9px] text-muted-foreground uppercase block mb-1">Eixo X (Rótulo)</label>
                <select
                  value={selectedColumns?.label || ""}
                  onChange={e => setSelectedColumns(prev => ({ label: e.target.value, value: prev?.value || numericHeaders[0] || "" }))}
                  className="bg-card border border-primary/20 rounded px-2 py-1 text-[11px] text-foreground"
                >
                  {currentSheet?.headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[9px] text-muted-foreground uppercase block mb-1">Eixo Y (Valor)</label>
                <select
                  value={selectedColumns?.value || ""}
                  onChange={e => setSelectedColumns(prev => ({ label: prev?.label || stringHeaders[0] || "", value: e.target.value }))}
                  className="bg-card border border-primary/20 rounded px-2 py-1 text-[11px] text-foreground"
                >
                  {numericHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
            </div>
          )}

          {/* Table view */}
          {viewMode === "table" && currentSheet && (
            <div className="border border-primary/20 rounded-lg overflow-hidden bg-primary/5">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-primary/10">
                      {currentSheet.headers.map(h => (
                        <th key={h} className="text-left p-2 text-primary/70 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {currentSheet.rows.slice(0, 50).map((row, i) => (
                      <tr key={i} className="border-b border-primary/5 hover:bg-primary/10 transition-colors">
                        {currentSheet.headers.map(h => (
                          <td key={h} className="p-2 text-foreground whitespace-nowrap font-mono">
                            {typeof row[h] === "number" ? row[h].toLocaleString("pt-BR") : String(row[h] ?? "")}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-3 py-2 text-[10px] text-muted-foreground border-t border-primary/10">
                {currentSheet.rows.length} linhas × {currentSheet.headers.length} colunas
              </div>
            </div>
          )}

          {/* Bar chart view */}
          {viewMode === "bar" && selectedColumns && (
            <div className="border border-primary/20 rounded-lg p-4 bg-primary/5">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <XAxis dataKey={selectedColumns.label} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }} angle={-30} textAnchor="end" height={60} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--primary) / 0.3)", fontSize: 12 }} />
                  <Bar dataKey={selectedColumns.value} fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} opacity={0.8} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Line chart view */}
          {viewMode === "line" && selectedColumns && (
            <div className="border border-primary/20 rounded-lg p-4 bg-primary/5">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <XAxis dataKey={selectedColumns.label} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }} angle={-30} textAnchor="end" height={60} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--primary) / 0.3)", fontSize: 12 }} />
                  <Line type="monotone" dataKey={selectedColumns.value} stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Pie chart view */}
          {viewMode === "pie" && selectedColumns && (
            <div className="border border-primary/20 rounded-lg p-4 bg-primary/5">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={chartData.slice(0, 8)}
                    dataKey={selectedColumns.value}
                    nameKey={selectedColumns.label}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={({ name, percent }) => `${String(name).substring(0, 12)} ${(percent * 100).toFixed(0)}%`}
                  >
                    {chartData.slice(0, 8).map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--primary) / 0.3)", fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Summary */}
          {currentSheet && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 border border-primary/20 rounded-lg p-3 bg-primary/5"
            >
              <p className="text-[10px] text-primary/70 uppercase tracking-wider mb-2">Resumo dos Dados</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {numericHeaders.slice(0, 4).map(h => {
                  const values = currentSheet.rows.map(r => Number(r[h]) || 0);
                  const sum = values.reduce((a, b) => a + b, 0);
                  const avg = sum / values.length;
                  return (
                    <div key={h} className="text-center">
                      <p className="text-[9px] text-muted-foreground truncate">{h}</p>
                      <p className="text-sm font-bold text-primary">{avg >= 1000 ? `${(avg / 1000).toFixed(1)}K` : avg.toFixed(1)}</p>
                      <p className="text-[9px] text-muted-foreground">média</p>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
};

export default ImportarDados;
