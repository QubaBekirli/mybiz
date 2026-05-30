import React, { createContext, useContext, useState, useCallback } from "react";

export interface Reminder {
  id: string;
  title: string;
  type: "tax" | "rent" | "other";
  dueDate: string;
  amount: number;
  recurring: boolean;
  completed: boolean;
}

interface RemindersContextType {
  reminders: Reminder[];
  addReminder: (r: Omit<Reminder, "id">) => void;
  toggleComplete: (id: string) => void;
  deleteReminder: (id: string) => void;
  upcomingCount: number;
}

const RemindersContext = createContext<RemindersContextType | null>(null);

const INITIAL_REMINDERS: Reminder[] = [
  { id: "r1", title: "ƏDV ödənişi", type: "tax", dueDate: "2026-03-25", amount: 1200, recurring: true, completed: false },
  { id: "r2", title: "Ofis icarəsi", type: "rent", dueDate: "2026-04-01", amount: 800, recurring: true, completed: false },
  { id: "r3", title: "İnternet ödənişi", type: "other", dueDate: "2026-03-28", amount: 60, recurring: true, completed: false },
  { id: "r4", title: "Gəlir vergisi", type: "tax", dueDate: "2026-04-15", amount: 2500, recurring: false, completed: false },
];

export const RemindersProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [reminders, setReminders] = useState<Reminder[]>(INITIAL_REMINDERS);

  const addReminder = useCallback((r: Omit<Reminder, "id">) => {
    setReminders(prev => [...prev, { ...r, id: `r${Date.now()}` }]);
  }, []);

  const toggleComplete = useCallback((id: string) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, completed: !r.completed } : r));
  }, []);

  const deleteReminder = useCallback((id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
  }, []);

  const upcomingCount = reminders.filter(r => !r.completed).length;

  return (
    <RemindersContext.Provider value={{ reminders, addReminder, toggleComplete, deleteReminder, upcomingCount }}>
      {children}
    </RemindersContext.Provider>
  );
};

export const useReminders = () => {
  const ctx = useContext(RemindersContext);
  if (!ctx) throw new Error("useReminders must be used within RemindersProvider");
  return ctx;
};
