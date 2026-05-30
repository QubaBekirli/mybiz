import React, { useState, useMemo } from "react";
import { useTransactions } from "@/contexts/TransactionContext";
import { BarChart3, PieChart, CalendarDays, ShoppingCart, ShoppingBag, TrendingUp, Package } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RPieChart, Pie, Cell, Legend } from "recharts";
import { format, subDays, subWeeks, subMonths, subYears, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import StockAnalytics from "@/components/StockAnalytics";

const COLORS = ["#9061ff", "#c084fc", "#a78bfa", "#7c3aed", "#e879f9", "#f0abfc", "#6366f1", "#22d3ee", "#fbbf24", "#fb7185"];

type PeriodType = "day" | "week" | "month" | "year";

const PERIOD_LABELS: Record<PeriodType, string> = { day: "Gün", week: "Həftə", month: "Ay", year: "İl" };

function getPeriodRange(date: Date, period: PeriodType): { start: Date; end: Date } {
  switch (period) {
    case "day": return { start: startOfDay(date), end: endOfDay(date) };
    case "week": return { start: startOfWeek(date, { weekStartsOn: 1 }), end: endOfWeek(date, { weekStartsOn: 1 }) };
    case "month": return { start: startOfMonth(date), end: endOfMonth(date) };
    case "year": return { start: startOfYear(date), end: endOfYear(date) };
  }
}

function getPreviousPeriodDate(date: Date, period: PeriodType): Date {
  switch (period) {
    case "day": return subDays(date, 1);
    case "week": return subWeeks(date, 1);
    case "month": return subMonths(date, 1);
    case "year": return subYears(date, 1);
  }
}

// Reusable date-range selector
const DateRangeSelector: React.FC<{
  range: { from?: Date; to?: Date };
  onChange: (r: { from?: Date; to?: Date }) => void;
  label?: string;
}> = ({ range, onChange, label = "Tarix aralığı" }) => (
  <div className="flex flex-wrap items-center gap-2 mb-4">
    <span className="text-xs text-muted-foreground font-medium">{label}:</span>
    <DatePicker label="Başlanğıc" date={range.from} onSelect={d => onChange({ ...range, from: d })} />
    <DatePicker label="Son" date={range.to} onSelect={d => onChange({ ...range, to: d })} />
    {(range.from || range.to) && (
      <button onClick={() => onChange({})} className="text-xs text-muted-foreground hover:text-foreground">× Sıfırla</button>
    )}
  </div>
);

const AnalyticsPage: React.FC = () => {
  const { transactions, totalIncome, totalExpense } = useTransactions();
  const profit = totalIncome - totalExpense;
  const margin = totalIncome > 0 ? ((profit / totalIncome) * 100).toFixed(1) : "0";

  const [activeTab, setActiveTab] = useState<"finance" | "stock">("finance");

  // Per-section date ranges
  const [barRange, setBarRange] = useState<{ from?: Date; to?: Date }>({});
  const [pieRange, setPieRange] = useState<{ from?: Date; to?: Date }>({});
  const [periodType, setPeriodType] = useState<PeriodType>("month");
  const [period1Date, setPeriod1Date] = useState<Date>(new Date());
  const [period2Date, setPeriod2Date] = useState<Date>(getPreviousPeriodDate(new Date(), "month"));
  const [customRange1, setCustomRange1] = useState<{ from?: Date; to?: Date }>({});
  const [customRange2, setCustomRange2] = useState<{ from?: Date; to?: Date }>({});
  const [useCustomRange, setUseCustomRange] = useState(false);

  const filterByRange = (range: { from?: Date; to?: Date }) => {
    if (!range.from && !range.to) return transactions;
    return transactions.filter(t => {
      const td = new Date(t.date);
      if (range.from && td < startOfDay(range.from)) return false;
      if (range.to && td > endOfDay(range.to)) return false;
      return true;
    });
  };

  // Bar (gəlir/xərc) — last 7 days, range filtered
  const barTx = useMemo(() => filterByRange(barRange), [transactions, barRange]);
  const barData = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const ds = d.toISOString().slice(0, 10);
    const dayTx = barTx.filter(t => t.date === ds);
    return {
      day: d.toLocaleDateString("az-AZ", { weekday: "short" }),
      gəlir: dayTx.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0),
      xərc: dayTx.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0),
    };
  }), [barTx]);

  // Pie data — Alış (expense) categories only
  const pieTx = useMemo(() => filterByRange(pieRange), [transactions, pieRange]);
  const expenseCatData = useMemo(() => {
    const map: Record<string, number> = {};
    pieTx.filter(t => t.type === "expense").forEach(t => { map[t.category] = (map[t.category] || 0) + t.amount; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [pieTx]);

  // Comparison logic
  const comparisonData = useMemo(() => {
    const getRange = (date: Date, custom?: { from?: Date; to?: Date }) => {
      if (useCustomRange && custom?.from && custom?.to) {
        return { start: startOfDay(custom.from), end: endOfDay(custom.to) };
      }
      return getPeriodRange(date, periodType);
    };

    const range1 = getRange(period1Date, customRange1);
    const range2 = getRange(period2Date, customRange2);

    const filterTx = (range: { start: Date; end: Date }) =>
      transactions.filter(t => isWithinInterval(new Date(t.date), { start: range.start, end: range.end }));

    const tx1 = filterTx(range1);
    const tx2 = filterTx(range2);

    const calc = (txs: typeof transactions) => ({
      income: txs.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0),
      expense: txs.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0),
      get profit() { return this.income - this.expense; },
    });

    const p1 = calc(tx1);
    const p2 = calc(tx2);

    const formatLabel = (range: { start: Date; end: Date }) =>
      `${format(range.start, "dd.MM.yy")} - ${format(range.end, "dd.MM.yy")}`;

    const pctChange = (a: number, b: number) => b === 0 ? (a > 0 ? 100 : 0) : (((a - b) / b) * 100);

    return {
      label1: formatLabel(range1),
      label2: formatLabel(range2),
      chart: [
        { metric: "Gəlir", period1: p1.income, period2: p2.income },
        { metric: "Xərc", period1: p1.expense, period2: p2.expense },
        { metric: "Mənfəət", period1: p1.profit, period2: p2.profit },
      ],
      table: [
        { metric: "Gəlir", v1: p1.income, v2: p2.income, diff: p1.income - p2.income, pct: pctChange(p1.income, p2.income) },
        { metric: "Xərc", v1: p1.expense, v2: p2.expense, diff: p1.expense - p2.expense, pct: pctChange(p1.expense, p2.expense) },
        { metric: "Mənfəət", v1: p1.profit, v2: p2.profit, diff: p1.profit - p2.profit, pct: pctChange(p1.profit, p2.profit) },
      ],
    };
  }, [transactions, periodType, period1Date, period2Date, useCustomRange, customRange1, customRange2]);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="opacity-0 animate-fade-up">
        <h1 className="text-2xl font-bold text-foreground" style={{ lineHeight: "1.2" }}>Hesabatlar</h1>
      </div>

      {/* Tabs: Gəlir-Xərc | Stok */}
      <div className="flex gap-2 opacity-0 animate-fade-up" style={{ animationDelay: "40ms" }}>
        {([
          { id: "finance", label: "Gəlir-Xərc", icon: BarChart3 },
          { id: "stock", label: "Stok", icon: Package },
        ] as const).map(t => {
          const active = activeTab === t.id;
          return (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95 ${active ? "gradient-primary text-primary-foreground shadow-md" : "bg-card card-shadow text-foreground hover:card-shadow-hover"}`}>
              <t.icon className="w-4 h-4" />{t.label}
            </button>
          );
        })}
      </div>

      {activeTab === "stock" ? <StockAnalytics /> : (
      <>
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3 md:gap-4 opacity-0 animate-fade-up" style={{ animationDelay: "80ms" }}>
        {[
          { label: "Ümumi gəlir", val: `₼${totalIncome.toLocaleString()}`, color: "text-success" },
          { label: "Ümumi xərc", val: `₼${totalExpense.toLocaleString()}`, color: "text-destructive" },
          { label: "Profit margin", val: `${margin}%`, color: "text-secondary" },
        ].map(s => (
          <div key={s.label} className="bg-card rounded-2xl card-shadow p-4">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={`text-lg font-bold mt-1 ${s.color}`} style={{ lineHeight: "1.2" }}>{s.val}</p>
          </div>
        ))}
      </div>

      {/* Bar Chart with date range */}
      <div className="bg-card rounded-2xl card-shadow p-5 opacity-0 animate-fade-up" style={{ animationDelay: "160ms" }}>
        <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-secondary" />Gəlir / Xərc müqayisəsi
        </h2>
        <DateRangeSelector range={barRange} onChange={setBarRange} />
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,20%,90%)" />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="hsl(0,0%,33%)" />
            <YAxis tick={{ fontSize: 12 }} stroke="hsl(0,0%,33%)" />
            <Tooltip />
            <Bar dataKey="gəlir" fill="#28A745" radius={[6, 6, 0, 0]} />
            <Bar dataKey="xərc" fill="#DC3545" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* One pie — Alış (expense), more colorful + fits on mobile */}
      <div className="grid md:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-card rounded-2xl card-shadow p-5 opacity-0 animate-fade-up" style={{ animationDelay: "320ms" }}>
          <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-destructive" />Alış / Xərc kateqoriyaları
          </h2>
          <DateRangeSelector range={pieRange} onChange={setPieRange} label="Tarix" />
          <ResponsiveContainer width="100%" height={260}>
            <RPieChart>
              <Pie
                data={expenseCatData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                label={({ percent }) => `${(percent! * 100).toFixed(0)}%`}
                style={{ fontSize: 10, fontWeight: 600 }}
              >
                {expenseCatData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="hsl(var(--card))" strokeWidth={2} />)}
              </Pie>
              <Tooltip formatter={(val: number, _n, p: any) => [`${val.toFixed(2)} ₼`, p?.payload?.name]} />
              <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
            </RPieChart>
          </ResponsiveContainer>
          {expenseCatData.length === 0 && <p className="text-center text-xs text-muted-foreground py-6">Bu tarix aralığında xərc yoxdur</p>}
        </div>
      </div>

      {/* Date Comparison Section */}
      <div className="bg-card rounded-2xl card-shadow p-5 opacity-0 animate-fade-up" style={{ animationDelay: "400ms" }}>
        <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-secondary" />Dövr müqayisəsi
        </h2>

        <div className="flex flex-wrap gap-2 mb-4">
          {(Object.keys(PERIOD_LABELS) as PeriodType[]).map(p => (
            <button key={p} onClick={() => { setPeriodType(p); setUseCustomRange(false); setPeriod2Date(getPreviousPeriodDate(period1Date, p)); }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${!useCustomRange && periodType === p ? "gradient-accent text-primary-foreground" : "bg-muted text-foreground hover:bg-muted/80"}`}>
              {PERIOD_LABELS[p]}
            </button>
          ))}
          <button onClick={() => setUseCustomRange(true)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${useCustomRange ? "gradient-accent text-primary-foreground" : "bg-muted text-foreground hover:bg-muted/80"}`}>
            Xüsusi
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <div>
            <p className="text-xs text-muted-foreground mb-1.5 font-medium">Dövr 1</p>
            {useCustomRange ? (
              <div className="flex gap-2">
                <DatePicker label="Başlanğıc" date={customRange1.from} onSelect={d => setCustomRange1(r => ({ ...r, from: d }))} />
                <DatePicker label="Son" date={customRange1.to} onSelect={d => setCustomRange1(r => ({ ...r, to: d }))} />
              </div>
            ) : (
              <DatePicker label="Tarix seçin" date={period1Date} onSelect={d => d && setPeriod1Date(d)} />
            )}
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1.5 font-medium">Dövr 2</p>
            {useCustomRange ? (
              <div className="flex gap-2">
                <DatePicker label="Başlanğıc" date={customRange2.from} onSelect={d => setCustomRange2(r => ({ ...r, from: d }))} />
                <DatePicker label="Son" date={customRange2.to} onSelect={d => setCustomRange2(r => ({ ...r, to: d }))} />
              </div>
            ) : (
              <DatePicker label="Tarix seçin" date={period2Date} onSelect={d => d && setPeriod2Date(d)} />
            )}
          </div>
        </div>

        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={comparisonData.chart}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,20%,90%)" />
            <XAxis dataKey="metric" tick={{ fontSize: 12 }} stroke="hsl(0,0%,33%)" />
            <YAxis tick={{ fontSize: 12 }} stroke="hsl(0,0%,33%)" />
            <Tooltip />
            <Legend />
            <Bar dataKey="period1" fill="#7752FE" radius={[6, 6, 0, 0]} name={comparisonData.label1} />
            <Bar dataKey="period2" fill="#8E8FFA" radius={[6, 6, 0, 0]} name={comparisonData.label2} />
          </BarChart>
        </ResponsiveContainer>

        {/* Compact table — fits on mobile, no horizontal scroll */}
        <div className="mt-4 space-y-1.5 md:hidden">
          {comparisonData.table.map(row => (
            <div key={row.metric} className="rounded-xl bg-muted/30 p-2.5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-foreground">{row.metric}</span>
                <span className={`text-xs font-bold ${row.pct >= 0 ? "text-success" : "text-destructive"}`}>
                  {row.pct >= 0 ? "+" : ""}{row.pct.toFixed(1)}%
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div>
                  <p className="text-muted-foreground truncate">{comparisonData.label1}</p>
                  <p className="font-semibold text-foreground">₼{row.v1.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground truncate">{comparisonData.label2}</p>
                  <p className="font-semibold text-foreground">₼{row.v2.toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 hidden md:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 text-muted-foreground font-medium">Metrik</th>
                <th className="text-right py-2 text-muted-foreground font-medium whitespace-nowrap">{comparisonData.label1}</th>
                <th className="text-right py-2 text-muted-foreground font-medium whitespace-nowrap">{comparisonData.label2}</th>
                <th className="text-right py-2 text-muted-foreground font-medium">Fərq</th>
                <th className="text-right py-2 text-muted-foreground font-medium">%</th>
              </tr>
            </thead>
            <tbody>
              {comparisonData.table.map(row => (
                <tr key={row.metric} className="border-b border-border last:border-0">
                  <td className="py-2 font-medium text-foreground">{row.metric}</td>
                  <td className="text-right py-2 text-foreground whitespace-nowrap">₼{row.v1.toLocaleString()}</td>
                  <td className="text-right py-2 text-foreground whitespace-nowrap">₼{row.v2.toLocaleString()}</td>
                  <td className={`text-right py-2 font-semibold whitespace-nowrap ${row.diff >= 0 ? "text-success" : "text-destructive"}`}>
                    {row.diff >= 0 ? "+" : ""}₼{row.diff.toLocaleString()}
                  </td>
                  <td className={`text-right py-2 font-semibold whitespace-nowrap ${row.pct >= 0 ? "text-success" : "text-destructive"}`}>
                    {row.pct >= 0 ? "+" : ""}{row.pct.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      </>
      )}
    </div>
  );
};

const DatePicker: React.FC<{ label: string; date?: Date; onSelect: (d: Date | undefined) => void }> = ({ label, date, onSelect }) => (
  <Popover>
    <PopoverTrigger asChild>
      <button className={cn("flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-muted/50 text-xs transition-all hover:border-secondary/40", !date && "text-muted-foreground")}>
        <CalendarDays className="w-3.5 h-3.5" />
        {date ? format(date, "dd.MM.yyyy") : label}
      </button>
    </PopoverTrigger>
    <PopoverContent className="w-auto p-0" align="start">
      <Calendar mode="single" selected={date} onSelect={onSelect} initialFocus className={cn("p-3 pointer-events-auto")} />
    </PopoverContent>
  </Popover>
);

export default AnalyticsPage;
