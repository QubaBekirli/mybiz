import React, { createContext, useContext, useState, useCallback } from "react";

export interface Transaction {
  id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
  date: string;
  verified: boolean;
}

interface TransactionContextType {
  transactions: Transaction[];
  addTransaction: (t: Omit<Transaction, "id">) => void;
  updateTransaction: (id: string, t: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  totalIncome: number;
  totalExpense: number;
}

const TransactionContext = createContext<TransactionContextType | null>(null);

const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: "t1", type: "income", amount: 2500, category: "Satış", description: "Onlayn satış", date: "2026-03-21", verified: true },
  { id: "t2", type: "expense", amount: 800, category: "İcarə", description: "Ofis icarəsi", date: "2026-03-20", verified: true },
  { id: "t3", type: "income", amount: 1200, category: "Xidmət", description: "Konsaltinq xidməti", date: "2026-03-19", verified: true },
  { id: "t4", type: "expense", amount: 350, category: "Kommunal", description: "Elektrik ödənişi", date: "2026-03-18", verified: false },
  { id: "t5", type: "income", amount: 3800, category: "Satış", description: "Topdan satış", date: "2026-03-17", verified: true },
  { id: "t6", type: "expense", amount: 150, category: "Nəqliyyat", description: "Çatdırılma xərcləri", date: "2026-03-16", verified: true },
  { id: "t7", type: "expense", amount: 420, category: "Marketinq", description: "Reklam kampaniyası", date: "2026-03-15", verified: true },
  { id: "t8", type: "income", amount: 950, category: "Xidmət", description: "Texniki dəstək", date: "2026-03-14", verified: true },
];

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);

  const addTransaction = useCallback((t: Omit<Transaction, "id">) => {
    setTransactions(prev => [{ ...t, id: `t${Date.now()}` }, ...prev]);
  }, []);

  const updateTransaction = useCallback((id: string, updates: Partial<Transaction>) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  }, []);

  const totalIncome = transactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  return (
    <TransactionContext.Provider value={{ transactions, addTransaction, updateTransaction, deleteTransaction, totalIncome, totalExpense }}>
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = () => {
  const ctx = useContext(TransactionContext);
  if (!ctx) throw new Error("useTransactions must be used within TransactionProvider");
  return ctx;
};
