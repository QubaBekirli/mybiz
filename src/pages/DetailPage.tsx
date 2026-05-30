import React from "react";
import { useTransactions } from "@/contexts/TransactionContext";
import { ArrowLeft, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface DetailPageProps {
  type: "income" | "expense" | "profit";
  onBack: () => void;
}

const LABELS: Record<string, string> = { income: "Gəlir", expense: "Xərc", profit: "Mənfəət" };

const DetailPage: React.FC<DetailPageProps> = ({ type, onBack }) => {
  const { transactions, totalIncome, totalExpense } = useTransactions();

  const relevantTx = type === "profit"
    ? transactions
    : transactions.filter(t => t.type === type);

  const total = type === "income" ? totalIncome : type === "expense" ? totalExpense : totalIncome - totalExpense;

  const monthlyMap: Record<string, { income: number; expense: number }> = {};
  transactions.forEach(t => {
    const month = t.date.slice(0, 7);
    if (!monthlyMap[month]) monthlyMap[month] = { income: 0, expense: 0 };
    if (t.type === "income") monthlyMap[month].income += t.amount;
    else monthlyMap[month].expense += t.amount;
  });

  const monthlyData = Object.entries(monthlyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({
      month: new Date(month + "-01").toLocaleDateString("az-AZ", { month: "short", year: "2-digit" }),
      value: type === "income" ? data.income : type === "expense" ? data.expense : data.income - data.expense,
    }));

  const catMap: Record<string, number> = {};
  relevantTx.forEach(t => {
    catMap[t.category] = (catMap[t.category] || 0) + t.amount;
  });
  const top5 = Object.entries(catMap).sort(([, a], [, b]) => b - a).slice(0, 5);

  const half = Math.floor(relevantTx.length / 2);
  const recentSum = relevantTx.slice(0, half).reduce((s, t) => s + t.amount, 0);
  const olderSum = relevantTx.slice(half).reduce((s, t) => s + t.amount, 0);
  const pctChange = olderSum > 0 ? (((recentSum - olderSum) / olderSum) * 100).toFixed(1) : "0";
  const isPositive = parseFloat(pctChange) >= 0;

  const barColor = type === "income" ? "#28A745" : type === "expense" ? "#DC3545" : "#7752FE";

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-3 opacity-0 animate-fade-up">
        <button onClick={onBack} className="p-2 rounded-xl bg-card card-shadow hover:card-shadow-hover transition-all">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-foreground" style={{ lineHeight: "1.2" }}>{LABELS[type]}</h1>
          <p className="text-muted-foreground text-sm mt-1">Ətraflı analiz və breakdown</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 opacity-0 animate-fade-up" style={{ animationDelay: "80ms" }}>
        <div className="bg-card rounded-2xl card-shadow p-5">
          <p className="text-xs text-muted-foreground">Ümumi {LABELS[type]}</p>
          <p className="text-2xl font-bold text-foreground mt-1" style={{ lineHeight: "1.2" }}>₼{total.toLocaleString()}</p>
        </div>
        <div className="bg-card rounded-2xl card-shadow p-5">
          <p className="text-xs text-muted-foreground">Dövr dəyişikliyi</p>
          <div className="flex items-center gap-1 mt-1">
            {isPositive ? <ArrowUpRight className="w-5 h-5 text-success" /> : <ArrowDownRight className="w-5 h-5 text-destructive" />}
            <p className={`text-2xl font-bold ${isPositive ? "text-success" : "text-destructive"}`} style={{ lineHeight: "1.2" }}>{pctChange}%</p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl card-shadow p-5 opacity-0 animate-fade-up" style={{ animationDelay: "160ms" }}>
        <h2 className="font-semibold text-foreground mb-4">Aylıq Breakdown</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,20%,90%)" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(0,0%,33%)" />
            <YAxis tick={{ fontSize: 12 }} stroke="hsl(0,0%,33%)" />
            <Tooltip />
            <Bar dataKey="value" fill={barColor} radius={[6, 6, 0, 0]} name={LABELS[type]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-card rounded-2xl card-shadow p-5 opacity-0 animate-fade-up" style={{ animationDelay: "240ms" }}>
          <h2 className="font-semibold text-foreground mb-4">Top 5 Kateqoriya</h2>
          <div className="space-y-3">
            {top5.map(([cat, amount], i) => (
              <div key={cat} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-secondary/10 text-secondary text-xs font-bold flex items-center justify-center">{i + 1}</span>
                  <span className="text-sm text-foreground font-medium">{cat}</span>
                </div>
                <span className="text-sm font-bold text-foreground">₼{amount.toLocaleString()}</span>
              </div>
            ))}
            {top5.length === 0 && <p className="text-sm text-muted-foreground">Məlumat yoxdur</p>}
          </div>
        </div>

        <div className="bg-card rounded-2xl card-shadow p-5 opacity-0 animate-fade-up" style={{ animationDelay: "320ms" }}>
          <h2 className="font-semibold text-foreground mb-4">Tranzaksiyalar</h2>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {relevantTx.map(tx => (
              <div key={tx.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-medium text-foreground">{tx.description}</p>
                  <p className="text-xs text-muted-foreground">{tx.category} · {tx.date}</p>
                </div>
                <p className={`text-sm font-bold ${tx.type === "income" ? "text-success" : "text-destructive"}`}>
                  {tx.type === "income" ? "+" : "-"}₼{tx.amount}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailPage;
