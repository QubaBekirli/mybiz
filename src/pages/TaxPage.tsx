import React, { useMemo, useState, useEffect } from "react";
import { useTransactions } from "@/contexts/TransactionContext";
import { Calculator, Receipt, Info, Download, AlertTriangle, Percent } from "lucide-react";
import { toast } from "@/hooks/use-toast";

// Azerbaijan tax regimes (simplified, illustrative)
const SIMPLIFIED_RATE = 0.02;   // 2% Bakı dövriyyə
const PROFIT_TAX_RATE = 0.20;   // 20% xalis mənfəət
const VAT_RATE = 0.18;          // 18% ƏDV
const SIMPLIFIED_LIMIT = 200000; // 12 aylıq dövriyyə limiti
const MICRO_DISCOUNT = 0.75;     // Mikro sahibkar üçün 75% güzəşt

type TaxMode = "simplified" | "profit" | "vat";

const TAX_MODES: { id: TaxMode; label: string; short: string; rate: string; portal: string }[] = [
  { id: "simplified", label: "Sadələşdirilmiş", short: "Sadə", rate: "2%", portal: "https://www.e-taxes.gov.az/ebyn/login.jsp" },
  { id: "profit", label: "Mənfəət vergisi", short: "Mənfəət", rate: "20%", portal: "https://www.e-taxes.gov.az/ebyn/commonStart.jsp?type=profit" },
  { id: "vat", label: "Əlavə Dəyər Vergisi (ƏDV)", short: "ƏDV", rate: "18%", portal: "https://www.e-taxes.gov.az/ebyn/commonStart.jsp?type=vat" },
];

const TaxPage: React.FC = () => {
  const { transactions, totalIncome, totalExpense } = useTransactions();
  const [mode, setMode] = useState<TaxMode>("simplified");
  const [isMicro, setIsMicro] = useState(true);
  const [turnover, setTurnover] = useState<string>("");
  const [touched, setTouched] = useState(false);

  // Auto-calculate turnover (12 months) once when not touched
  useEffect(() => {
    if (!touched) setTurnover(String(totalIncome.toFixed(2)));
  }, [totalIncome, touched]);

  const turnoverNum = Number(turnover) || 0;
  const profit = Math.max(0, turnoverNum - totalExpense);

  // Group income per month from transactions
  const monthly = useMemo(() => {
    const m: Record<string, { income: number; expense: number }> = {};
    transactions.forEach(t => {
      const key = t.date.slice(0, 7);
      if (!m[key]) m[key] = { income: 0, expense: 0 };
      if (t.type === "income") m[key].income += t.amount;
      else m[key].expense += t.amount;
    });
    return Object.entries(m).sort(([a], [b]) => b.localeCompare(a));
  }, [transactions]);

  // Validation per mode
  let warning: string | null = null;
  let canCalculate = true;
  if (mode === "simplified" && turnoverNum > SIMPLIFIED_LIMIT) {
    warning = `Dövriyyə ${SIMPLIFIED_LIMIT.toLocaleString()} AZN-i keçir. Sadələşdirilmiş rejim tətbiq olunmur — ƏDV ödəyicisi olmalısınız.`;
    canCalculate = false;
  }
  if (mode === "vat" && turnoverNum < SIMPLIFIED_LIMIT) {
    warning = `Dövriyyə ${SIMPLIFIED_LIMIT.toLocaleString()} AZN-dən azdır. ƏDV məcburi deyil — "Sadələşdirilmiş" rejimini seçin.`;
    canCalculate = false;
  }

  let taxAmount = 0;
  let baseLabel = "";
  let baseValue = 0;
  if (canCalculate) {
    if (mode === "simplified") {
      taxAmount = turnoverNum * SIMPLIFIED_RATE;
      baseLabel = "Dövriyyə (12 aylıq)";
      baseValue = turnoverNum;
    } else if (mode === "profit") {
      const raw = profit * PROFIT_TAX_RATE;
      taxAmount = isMicro ? raw * (1 - MICRO_DISCOUNT) : raw;
      baseLabel = "Xalis mənfəət";
      baseValue = profit;
    } else {
      taxAmount = turnoverNum * VAT_RATE;
      baseLabel = "Vergi tutulan dövriyyə";
      baseValue = turnoverNum;
    }
  }

  const exportReport = () => {
    const lines = [
      "MyBiz — Vergi Hesabatı",
      `Tarix: ${new Date().toLocaleDateString("az-AZ")}`,
      `Rejim: ${TAX_MODES.find(m => m.id === mode)?.label}`,
      "",
      `Dövriyyə: ${turnoverNum.toFixed(2)} AZN`,
      `Xərc: ${totalExpense.toFixed(2)} AZN`,
      `Mənfəət: ${profit.toFixed(2)} AZN`,
      `Hesablanan vergi: ${taxAmount.toFixed(2)} AZN`,
      warning ? `\nXƏBƏRDARLIQ: ${warning}` : "",
      "",
      "Aylıq dövriyyə:",
      ...monthly.map(([k, v]) => `${k}: gəlir ${v.income.toFixed(2)}, xərc ${v.expense.toFixed(2)}`),
    ].join("\n");
    const blob = new Blob([lines], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mybiz-vergi-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Hesabat ixrac edildi" });
  };

  const currentMode = TAX_MODES.find(m => m.id === mode)!;

  return (
    <div className="max-w-5xl mx-auto opacity-0 animate-fade-up">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">Vergi Kalkulyatoru</h1>
          <p className="text-muted-foreground text-xs mt-0.5">Rejimi seçin, dövriyyəni redaktə edin</p>
        </div>
        <button onClick={exportReport} className="bg-card hover:bg-muted text-foreground rounded-xl px-3 py-2 text-xs font-semibold flex items-center gap-2 border border-border transition active:scale-95">
          <Download className="w-3.5 h-3.5" /> Hesabat
        </button>
      </div>

      {/* Mode tabs */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        {TAX_MODES.map(m => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`px-2 py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-95 ${
              mode === m.id ? "gradient-primary text-primary-foreground shadow" : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            <div className="flex flex-col items-center gap-0.5">
              <span>{m.short}</span>
              <span className="text-[10px] opacity-80">{m.rate}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Turnover input — auto-filled, editable */}
      <div className="bg-card rounded-2xl card-shadow p-4 mb-4">
        <label className="text-xs font-medium text-muted-foreground mb-2 block flex items-center gap-1.5">
          <Calculator className="w-3.5 h-3.5" /> Dövriyyə (12 aylıq, AZN)
        </label>
        <input
          type="number"
          value={turnover}
          onChange={e => { setTurnover(e.target.value); setTouched(true); }}
          placeholder="0.00"
          className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-lg font-bold focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <p className="text-[11px] text-muted-foreground mt-1.5">
          Tranzaksiyalardan avtomatik hesablanır. İstədikdə dəyişdirin.
          {touched && <button onClick={() => { setTouched(false); setTurnover(String(totalIncome.toFixed(2))); }} className="ml-2 text-primary font-medium hover:underline">Sıfırla</button>}
        </p>

        {mode === "profit" && (
          <label className="mt-3 flex items-center gap-2 text-sm text-foreground cursor-pointer">
            <input type="checkbox" checked={isMicro} onChange={e => setIsMicro(e.target.checked)} className="w-4 h-4 accent-primary" />
            Mikro sahibkar (1-10 işçi) — 75% güzəşt tətbiq olunur
          </label>
        )}
      </div>

      {/* Warning */}
      {warning && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-2xl p-4 mb-4 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <div className="text-sm text-foreground">
            <p className="font-semibold text-destructive mb-1">Vergi rejimi uyğun deyil</p>
            <p className="text-muted-foreground">{warning}</p>
          </div>
        </div>
      )}

      {/* Result */}
      {canCalculate && (
        <div className="bg-card rounded-2xl card-shadow p-6 mb-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <Percent className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{currentMode.label}</p>
              <p className="text-xs font-medium text-primary">{currentMode.rate} dərəcə{mode === "profit" && isMicro ? " · 75% güzəşt" : ""}</p>
            </div>
          </div>
          <p className="text-4xl font-bold text-gradient">{taxAmount.toFixed(2)} ₼</p>
          <p className="text-xs text-muted-foreground mt-2">{baseLabel}: {baseValue.toFixed(2)} ₼</p>
          <a
            href={currentMode.portal}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 w-full inline-flex items-center justify-center gap-2 gradient-primary text-primary-foreground rounded-xl px-4 py-3 text-sm font-bold hover:opacity-90 transition-all active:scale-[0.98]"
          >
            <Receipt className="w-4 h-4" /> Ödə — e-taxes.gov.az
          </a>
          <p className="text-[11px] text-muted-foreground mt-2 text-center">Dövlət ödəniş portalına keçirsiniz</p>
        </div>
      )}

      {/* Info note */}
      <div className="bg-accent/50 border border-accent rounded-2xl p-4 mb-5 flex gap-3">
        <Info className="w-5 h-5 text-accent-foreground flex-shrink-0 mt-0.5" />
        <div className="text-xs text-foreground">
          <p className="font-semibold mb-1">Qeyd</p>
          <p className="text-muted-foreground">Hesablamalar təxminidir. Dəqiq məbləğ fəaliyyət növündən, işçi sayından və qanunvericilikdən asılıdır.</p>
        </div>
      </div>

      {/* Monthly breakdown */}
      <div className="bg-card rounded-2xl card-shadow overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold text-foreground text-sm">Aylıq Dövriyyə</h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">Tranzaksiyalardan toplanmış</p>
        </div>
        {monthly.length === 0 && <p className="p-6 text-center text-muted-foreground text-sm">Tranzaksiya yoxdur</p>}
        {monthly.map(([month, data]) => (
          <div key={month} className="p-3 border-b border-border last:border-0 flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground text-sm">{month}</p>
              <p className="text-[11px] text-muted-foreground">Gəlir: {data.income.toFixed(2)} ₼ · Xərc: {data.expense.toFixed(2)} ₼</p>
            </div>
            <p className="font-bold text-primary text-sm">{(data.income * (mode === "vat" ? VAT_RATE : SIMPLIFIED_RATE)).toFixed(2)} ₼</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaxPage;
