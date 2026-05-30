import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User as SbUser } from "@supabase/supabase-js";

export interface User {
  id: string;
  email: string;
  businessName: string;
  ownerName: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, ownerName?: string, businessName?: string) => Promise<{ ok: boolean; error?: string }>;
  quickLogin: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<Pick<User, "ownerName" | "businessName">>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const toAppUser = (sb: SbUser | null): User | null => {
  if (!sb) return null;
  return {
    id: sb.id,
    email: sb.email || "demo@mybiz.app",
    businessName: (sb.user_metadata?.businessName as string) || "MyBiz Demo",
    ownerName: (sb.user_metadata?.ownerName as string) || "Demo İstifadəçi",
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(toAppUser(newSession?.user ?? null));
    });

    // Then fetch existing session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(toAppUser(s?.user ?? null));
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    // Demo credentials → anonymous sign-in for backend access
    if (email === "usermybiz@mail.com" && password === "demo") {
      const { error } = await supabase.auth.signInAnonymously({
        options: { data: { businessName: "MyBiz Demo", ownerName: "Demo İstifadəçi", email } }
      });
      return !error;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return !error;
  }, []);

  const signup = useCallback(async (email: string, password: string, ownerName?: string, businessName?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          ownerName: ownerName || "İstifadəçi",
          businessName: businessName || "MyBiz",
        },
      },
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }, []);

  const quickLogin = useCallback(async () => {
    const { error } = await supabase.auth.signInAnonymously({
      options: { data: { businessName: "MyBiz Demo", ownerName: "Demo İstifadəçi", email: "usermybiz@mail.com" } }
    });
    if (error) console.error("quickLogin error", error);
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const updateProfile = useCallback(async (updates: Partial<Pick<User, "ownerName" | "businessName">>) => {
    // Optimistic local update so UI reflects change immediately everywhere
    setUser(prev => prev ? { ...prev, ...updates } : prev);
    await supabase.auth.updateUser({ data: updates });
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, isAuthenticated: !!user, loading, login, signup, quickLogin, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
