import React, { createContext, useContext, useState, useCallback } from "react";

interface SalesGoal {
  target: number;
  current: number;
  period: string;
}

interface SalesGoalContextType {
  goal: SalesGoal | null;
  setGoal: (target: number, period?: string) => void;
  updateProgress: (current: number) => void;
  removeGoal: () => void;
}

const SalesGoalContext = createContext<SalesGoalContextType | null>(null);

export const SalesGoalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [goal, setGoalState] = useState<SalesGoal | null>({
    target: 10000,
    current: 8460,
    period: "Aylıq",
  });

  const setGoal = useCallback((target: number, period: string = "Aylıq") => {
    setGoalState(g => ({ target, current: g?.current ?? 0, period }));
  }, []);

  const updateProgress = useCallback((current: number) => {
    setGoalState(g => g ? { ...g, current } : null);
  }, []);

  const removeGoal = useCallback(() => setGoalState(null), []);

  return (
    <SalesGoalContext.Provider value={{ goal, setGoal, updateProgress, removeGoal }}>
      {children}
    </SalesGoalContext.Provider>
  );
};

export const useSalesGoal = () => {
  const ctx = useContext(SalesGoalContext);
  if (!ctx) throw new Error("useSalesGoal must be used within SalesGoalProvider");
  return ctx;
};
