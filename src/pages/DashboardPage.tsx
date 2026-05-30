import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTransactions } from "@/contexts/TransactionContext";
import { useReminders } from "@/contexts/RemindersContext";
import { useLanguage } from "@/contexts/LanguageContext";
import SalesGoalCard from "@/components/SalesGoalCard";
import {
  TrendingUp, TrendingDown, Activity, DollarSign, Bell,
  ArrowUpRight, ArrowDownRight, CheckCircle2, AlertCircle, Lightbulb, Calendar, Wallet, Bot, Sparkles
} from "lucide-react";

interface DashboardPageProps {
  onNavigateDetail?: (type: "income" | "expense" | "profit") => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigateDetail }) => {
  const { user } = useAuth();
  const { transactions, totalIncome, totalExpense } = useTransactions();
  const { reminders, upcomingCount } = useReminders();
  const { t } = useLanguage();
  const profit = totalIncome - totalExpense;
  // Sağlamlıq: 100 - (Xərc/Gəlir × 100), max 100
  const healthScore = totalIncome > 0
    ? Math.max(0, Math.min(100, Math.round(100 - (totalExpense / totalIncome) * 100)))
    : 0;
  const recentTx = transactions.slice(0, 5);
  const nextReminder = reminders.filter(r => !r.completed).sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];

  const displayName = user?.ownerName || (t.user as string);

  const stats = [
    { label: t.income as string, value: `₼${totalIncome.toLocaleString()}`, icon: TrendingUp, trend: "+12%", positive: true, detailType: "income" as const },
    { label: t.expense as string, value: `₼${totalExpense.toLocaleString()}`, icon: TrendingDown, trend: "-3%", positive: false, detailType: "expense" as const },
    { label: t.profit as string, value: `₼${profit.toLocaleString()}`, icon: DollarSign, trend: "+18%", positive: profit > 0, detailType: "profit" as const },
    { label: t.health as string, value: `${healthScore}/100`, icon: Activity, trend: healthScore > 60 ? (t.good as string) : "Orta", positive: healthScore > 60, detailType: null },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      <h1 className="hidden md:block text-2xl font-bold text-foreground opacity-0 animate-fade-up" style={{ lineHeight: "1.2" }}>Dashboard</h1>
      {/* Wallet hero — replaces bank card; animated coins */}
      <div className="relative overflow-hidden rounded-3xl p-6 gradient-primary text-primary-foreground card-shadow opacity-0 animate-fade-up">
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center">
            <Wallet className="w-7 h-7" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs opacity-80">Pul kisəsi · Balans</p>
            <p className="text-3xl font-extrabold tracking-tight" style={{ lineHeight: "1.1" }}>
              ₼{profit.toLocaleString()}
            </p>
            <p className="text-xs opacity-80 mt-1">Gəlir ₼{totalIncome.toLocaleString()} · Xərc ₼{totalExpense.toLocaleString()}</p>
          </div>
        </div>
        {/* Falling yellow coins */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <span
              key={i}
              className="absolute rounded-full"
              style={{
                left: `${(i * 13 + 8) % 95}%`,
                top: "-20px",
                width: `${10 + (i % 3) * 4}px`,
                height: `${10 + (i % 3) * 4}px`,
                background: "radial-gradient(circle at 30% 30%, #FEF08A, #F59E0B 70%, #B45309)",
                boxShadow: "0 0 8px rgba(245,158,11,0.6)",
                animation: `coinFall ${4 + (i % 5)}s linear ${i * 0.6}s infinite`,
                opacity: 0.85,
              }}
            />
          ))}
        </div>
        <style>{`
          @keyframes coinFall {
            0% { transform: translateY(-20px) rotate(0deg); opacity: 0; }
            10% { opacity: 1; }
            100% { transform: translateY(220px) rotate(540deg); opacity: 0; }
          }
        `}</style>
      </div>



      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {stats.map((s, i) => (
          <div
            key={s.label}
            onClick={() => s.detailType && onNavigateDetail?.(s.detailType)}
            className={`bg-card rounded-2xl card-shadow p-4 md:p-5 transition-all duration-300 hover:card-shadow-hover opacity-0 animate-fade-up ${s.detailType ? "cursor-pointer active:scale-[0.97]" : ""}`}
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.positive ? "bg-success/10" : "bg-destructive/10"}`}>
                <s.icon className={`w-4 h-4 ${s.positive ? "text-success" : "text-destructive"}`} />
              </div>
              <span className={`text-xs font-semibold flex items-center gap-0.5 ${s.positive ? "text-success" : "text-destructive"}`}>
                {s.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {s.trend}
              </span>
            </div>
            <p className="text-lg md:text-xl font-bold text-foreground" style={{ lineHeight: "1.2" }}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Sales Goal */}
      <div className="opacity-0 animate-fade-up" style={{ animationDelay: "320ms" }}>
        <SalesGoalCard />
      </div>

      <div className="grid md:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-card rounded-2xl card-shadow p-5 opacity-0 animate-fade-up" style={{ animationDelay: "400ms" }}>
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <ArrowUpRight className="w-4 h-4 text-secondary" />{t.recentTransactions}
          </h2>
          <div className="space-y-3">
            {recentTx.map(tx => (
              <div key={tx.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tx.type === "income" ? "bg-success/10" : "bg-destructive/10"}`}>
                    {tx.type === "income" ? <ArrowUpRight className="w-4 h-4 text-success" /> : <ArrowDownRight className="w-4 h-4 text-destructive" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{tx.description}</p>
                    <p className="text-xs text-muted-foreground">{tx.category} · {tx.type === "income" ? t.income as string : t.expense as string}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${tx.type === "income" ? "text-success" : "text-destructive"}`}>
                    {tx.type === "income" ? "+" : "-"}₼{tx.amount}
                  </p>
                  {!tx.verified && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] text-destructive font-medium">
                      <AlertCircle className="w-3 h-3" />{t.check}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4 flex flex-col">
          {/* AI Recommendation — emphasized, comes BEFORE next payment on mobile */}
          <div className="order-1 bg-card rounded-2xl p-5 opacity-0 animate-fade-up overflow-hidden relative border-2 border-secondary/30 shadow-[0_8px_30px_-8px_hsl(258,100%,69%,0.45)]" style={{ animationDelay: "440ms" }}>
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full gradient-accent opacity-20 blur-3xl pointer-events-none motion-safe:animate-pulse" />
            <div className="absolute -bottom-12 -left-12 w-44 h-44 rounded-full gradient-primary opacity-10 blur-3xl pointer-events-none" />
            <h2 className="font-bold text-secondary mb-3 flex items-center gap-2 relative text-sm uppercase tracking-wider">
              <span className="relative inline-flex w-8 h-8 items-center justify-center rounded-xl gradient-accent shadow-lg">
                <Bot className="w-4 h-4 text-primary-foreground" />
                <Sparkles className="w-2.5 h-2.5 text-warning-yellow absolute -top-1 -right-1 motion-safe:animate-pulse" />
              </span>
              {t.aiRecommendation}
            </h2>
            <div className="p-3.5 rounded-xl gradient-accent text-primary-foreground relative shadow-inner">
              <p className="text-sm font-medium leading-relaxed">{t.aiTip}</p>
            </div>
          </div>

          {nextReminder && (
            <div className="order-2 bg-card rounded-2xl card-shadow p-5 opacity-0 animate-fade-up" style={{ animationDelay: "520ms" }}>
              <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Bell className="w-4 h-4 text-secondary" />{t.nextPayment}
                <span className="ml-auto text-xs bg-secondary/10 text-secondary px-2 py-0.5 rounded-full font-medium">{upcomingCount}</span>
              </h2>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-accent/30">
                <Calendar className="w-5 h-5 text-secondary" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{nextReminder.title}</p>
                  <p className="text-xs text-muted-foreground">{nextReminder.dueDate} · ₼{nextReminder.amount}</p>
                </div>
                {nextReminder.type === "tax" && (
                  <a href="https://www.e-taxes.gov.az/ebyn/login.jsp" target="_blank" rel="noopener noreferrer"
                    className="text-xs gradient-accent px-3 py-1.5 rounded-lg font-medium text-primary-foreground transition-all hover:opacity-90 hover:-translate-y-0.5">
                    {t.pay}
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
