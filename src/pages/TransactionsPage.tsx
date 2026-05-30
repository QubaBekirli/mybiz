import React, { useState, useMemo } from "react";
import { useTransactions, Transaction } from "@/contexts/TransactionContext";
import {
  Plus, Search, ArrowUpRight, ArrowDownRight, AlertCircle, CheckCircle2, X,
  FileSpreadsheet, Database, FileText, FileInput, PenLine, Pencil, Trash2,
  ArrowUpDown, Download
} from "lucide-react";
import logo from "@/assets/logo_main.svg";


const CATEGORIES = ["Satış", "Alış", "Xidmət", "İcarə", "Kommunal", "Nəqliyyat", "Marketinq", "Digər"];

// Manual ilk gəlir
const IMPORT_OPTIONS = [
  { id: "manual", label: "Əl ilə daxil et", desc: "Manual tranzaksiya", icon: PenLine, accept: null },
  { id: "excel", label: "Excel fayl", desc: ".xlsx, .xls", icon: FileSpreadsheet, accept: ".xlsx,.xls" },
  { id: "csv", label: "CSV fayl", desc: ".csv formatı", icon: FileText, accept: ".csv" },
  { id: "sql", label: "SQL bağlantısı", desc: "Database qoşulması", icon: Database, accept: null },
  { id: "c1", label: "C1 sənəd", desc: "1C export", icon: FileInput, accept: null },
  { id: "pdf", label: "PDF hesabat", desc: "Bank hesabatı", icon: FileText, accept: ".pdf" },
];

const SEARCH_SUGGESTIONS = ["Satış", "İcarə", "Onlayn", "Vergi", "Kommunal", "Marketinq", "Topdan"];

type SortKey = "date" | "amount" | "description";
type SortDir = "asc" | "desc";

const TransactionsPage: React.FC = () => {
  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useTransactions();
  const [showModal, setShowModal] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [importView, setImportView] = useState<string | null>(null);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [search, setSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [visibleCount, setVisibleCount] = useState(50);
  const [form, setForm] = useState({ type: "income" as "income" | "expense", amount: "", category: "Satış", description: "", date: new Date().toISOString().slice(0, 10) });
  const [sqlConn, setSqlConn] = useState("");



  const filtered = useMemo(() => {
    const arr = transactions
      .filter(t => filterType === "all" || t.type === filterType)
      .filter(t => t.description.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase()));

    arr.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "date") cmp = a.date.localeCompare(b.date);
      else if (sortKey === "amount") cmp = a.amount - b.amount;
      else cmp = a.description.localeCompare(b.description);
      return sortDir === "asc" ? cmp : -cmp;
    });

    return arr;
  }, [transactions, filterType, search, sortKey, sortDir]);

  const visible = filtered.slice(0, visibleCount);

  const openAdd = () => {
    setEditing(null);
    setForm({ type: "income", amount: "", category: "Satış", description: "", date: new Date().toISOString().slice(0, 10) });
    setShowModal(true);
    setImportView(null);
  };

  const openEdit = (tx: Transaction) => {
    setEditing(tx);
    setForm({ type: tx.type, amount: tx.amount.toString(), category: tx.category, description: tx.description, date: tx.date });
    setShowModal(true);
    setImportView("manual");
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      updateTransaction(editing.id, { ...form, amount: parseFloat(form.amount) });
    } else {
      addTransaction({ ...form, amount: parseFloat(form.amount), verified: true });
    }
    setShowModal(false);
    setImportView(null);
    setEditing(null);
  };

  const handleImportSelect = (id: string) => {
    if (id === "manual") return setImportView("manual");
    const opt = IMPORT_OPTIONS.find(o => o.id === id);
    if (opt?.accept) {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = opt.accept;
      input.onchange = () => { setImportView(null); setShowModal(false); };
      input.click();
    } else if (id === "sql") {
      setImportView("sql");
    } else {
      setImportView(null);
      setShowModal(false);
    }
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  };

  const exportCSV = () => {
    const rows = [
      ["Tarix", "Növ", "Kateqoriya", "Təsvir", "Məbləğ"],
      ...filtered.map(t => [t.date, t.type === "income" ? "Gəlir" : "Xərc", t.category, t.description, t.amount.toString()]),
    ];
    const csv = rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `tranzaksiyalar-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const filteredSuggestions = SEARCH_SUGGESTIONS.filter(s =>
    s.toLowerCase().includes(search.toLowerCase()) && s.toLowerCase() !== search.toLowerCase()
  );

  return (
    <div className="space-y-5 max-w-4xl relative">


      <div className="flex items-center justify-between gap-3 opacity-0 animate-fade-up flex-wrap relative z-[90]">
        <h1 className="text-2xl font-bold text-foreground" style={{ lineHeight: "1.2" }}>Tranzaksiyalar</h1>
        <div className="flex items-center gap-2">
          <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.97]">
            <Plus className="w-4 h-4" />Əlavə et
          </button>
          <div className="relative">
            <button onClick={() => setShowExportMenu(s => !s)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card card-shadow text-sm font-semibold text-foreground hover:card-shadow-hover transition-all">
              <Download className="w-4 h-4" />Çıxarış
            </button>
            {showExportMenu && (
              <div className="absolute right-0 top-full mt-2 bg-card card-shadow rounded-xl border border-border z-[200] min-w-[140px] overflow-hidden">
                <button onClick={exportCSV} className="w-full px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted text-left flex items-center gap-2"><FileSpreadsheet className="w-4 h-4"/> CSV</button>
                <button onClick={exportCSV} className="w-full px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted text-left border-t border-border flex items-center gap-2"><FileText className="w-4 h-4"/> PDF</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 opacity-0 animate-fade-up relative z-0" style={{ animationDelay: "100ms" }}>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setShowSuggestions(true); }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="Axtar..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card card-shadow text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary/40 transition-all"
          />
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-card card-shadow rounded-xl border border-border z-20 overflow-hidden">
              {filteredSuggestions.map(s => (
                <button key={s} onMouseDown={() => { setSearch(s); setShowSuggestions(false); }}
                  className="w-full px-4 py-2 text-sm text-foreground hover:bg-muted text-left">
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["all", "income", "expense"] as const).map(f => (
            <button key={f} onClick={() => setFilterType(f)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:-translate-y-0.5 active:scale-95 ${filterType === f ? "gradient-accent text-primary-foreground shadow-md" : "bg-card card-shadow text-foreground hover:card-shadow-hover"}`}>
              {f === "all" ? "Hamısı" : f === "income" ? "Gəlir" : "Xərc"}
            </button>
          ))}
        </div>
      </div>

      {/* Sort row */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
        <ArrowUpDown className="w-3 h-3" />
        <span>Sırala:</span>
        {(["date", "amount", "description"] as SortKey[]).map(k => (
          <button key={k} onClick={() => handleSort(k)}
            className={`px-2.5 py-1 rounded-lg transition-all ${sortKey === k ? "bg-secondary/10 text-secondary font-semibold" : "hover:bg-muted"}`}>
            {k === "date" ? "Tarix" : k === "amount" ? "Məbləğ" : "Ad"} {sortKey === k && (sortDir === "asc" ? "↑" : "↓")}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="bg-card rounded-2xl card-shadow divide-y divide-border opacity-0 animate-fade-up" style={{ animationDelay: "200ms" }}>
        {visible.map(tx => (
          <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors group">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${tx.type === "income" ? "bg-success/10" : "bg-destructive/10"}`}>
                {tx.type === "income" ? <ArrowUpRight className="w-5 h-5 text-success" /> : <ArrowDownRight className="w-5 h-5 text-destructive" />}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{tx.description}</p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="text-xs text-muted-foreground">{tx.category}</span>
                  <span className="text-xs text-muted-foreground">·</span>
                  <span className="text-xs text-muted-foreground">{tx.date}</span>
                  {!tx.verified && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] bg-destructive/10 text-destructive px-1.5 py-0.5 rounded-full font-medium">
                      <AlertCircle className="w-2.5 h-2.5" />Yoxla
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <p className={`text-sm font-bold ${tx.type === "income" ? "text-success" : "text-destructive"}`}>
                {tx.type === "income" ? "+" : "-"}₼{tx.amount}
              </p>
              <div className="flex md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(tx)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                  <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
                <button onClick={() => deleteTransaction(tx.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors">
                  <Trash2 className="w-3.5 h-3.5 text-destructive" />
                </button>
                {!tx.verified && (
                  <button onClick={() => updateTransaction(tx.id, { verified: true })}
                    className="p-1.5 rounded-lg hover:bg-success/10 text-success transition-all">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="p-8 text-center text-muted-foreground text-sm">Tranzaksiya tapılmadı</div>
        )}
      </div>

      {/* Show more / Pro promo */}
      {filtered.length > visibleCount && (
        <button onClick={() => setVisibleCount(c => c + 50)}
          className="w-full py-3 rounded-xl bg-card card-shadow text-sm font-medium text-secondary hover:card-shadow-hover transition-all">
          Daha çox göstər ({filtered.length - visibleCount} qaldı) →
        </button>
      )}


      {/* Add/Edit/Import Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-foreground/40 p-0 md:p-4" onClick={() => { setShowModal(false); setImportView(null); }}>
          <div className="bg-card rounded-t-3xl md:rounded-2xl card-shadow w-full max-w-md p-6 animate-scale-in max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-foreground">
                {editing ? "Tranzaksiyanı düzənlə" : importView === "manual" ? "Yeni tranzaksiya" : importView === "sql" ? "SQL bağlantısı" : "Məlumat əlavə et"}
              </h2>
              <button onClick={() => { setShowModal(false); setImportView(null); }} className="p-1.5 rounded-lg hover:bg-muted"><X className="w-5 h-5" /></button>
            </div>

            {!importView && !editing && (
              <div className="grid grid-cols-2 gap-3">
                {IMPORT_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => handleImportSelect(opt.id)}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border hover:border-secondary/40 hover:bg-secondary/5 transition-all text-center group active:scale-[0.97]"
                  >
                    <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                      <opt.icon className="w-5 h-5 text-secondary" />
                    </div>
                    <span className="text-sm font-medium text-foreground">{opt.label}</span>
                    <span className="text-[11px] text-muted-foreground leading-tight">{opt.desc}</span>
                  </button>
                ))}
              </div>
            )}

            {importView === "sql" && (
              <div className="space-y-4">
                <button onClick={() => setImportView(null)} className="text-sm text-secondary font-medium hover:underline">← Geri</button>
                <input value={sqlConn} onChange={e => setSqlConn(e.target.value)}
                  placeholder="postgresql://user:pass@host:5432/db"
                  className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40 font-mono" />
                <button className="w-full py-3 rounded-xl gradient-primary text-sm font-semibold text-primary-foreground hover:opacity-90">Qoşul</button>
              </div>
            )}

            {(importView === "manual" || editing) && (
              <div className="space-y-4">
                {!editing && <button onClick={() => setImportView(null)} className="text-sm text-secondary font-medium hover:underline">← Geri</button>}
                <form onSubmit={handleSave} className="space-y-3">
                  <div className="flex gap-2">
                    {(["income", "expense"] as const).map(t => (
                      <button key={t} type="button" onClick={() => setForm(p => ({ ...p, type: t }))}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${form.type === t ? (t === "income" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive") : "bg-muted text-muted-foreground"}`}>
                        {t === "income" ? "Gəlir" : "Xərc"}
                      </button>
                    ))}
                  </div>
                  <input type="number" required placeholder="Məbləğ (₼)" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40" />
                  <input required placeholder="Təsvir / məhsul adı" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                    list="product-suggestions"
                    className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40" />
                  <datalist id="product-suggestions">
                    {transactions.map(t => <option key={t.id} value={t.description} />)}
                  </datalist>
                  <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40">
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                  <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40" />
                  <button type="submit" className="w-full py-3 rounded-xl gradient-primary text-sm font-semibold text-primary-foreground hover:opacity-90 active:scale-[0.97]">
                    {editing ? "Yenilə" : "Əlavə et"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionsPage;
