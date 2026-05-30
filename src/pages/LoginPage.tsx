import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Zap, Lock, Mail, Eye, EyeOff } from "lucide-react";
import logo from "@/assets/logo_main.svg";

const LoginPage: React.FC = () => {
  const { login, signup, quickLogin } = useAuth();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (mode === "signup") {
      const res = await signup(email, password);
      if (!res.ok) { setError(res.error || "Qeydiyyat alınmadı"); return; }
      // auto-confirm enabled → sign in immediately
      const ok = await login(email, password);
      if (!ok) setError("Qeydiyyat oldu, lakin giriş alınmadı");
      return;
    }
    const ok = await login(email, password);
    if (!ok) setError(t.wrongCredentials as string);
  };

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md opacity-0 animate-fade-up">
        <button
          onClick={quickLogin}
          className="w-full mb-6 gradient-accent rounded-xl p-4 flex items-center gap-3 text-left transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
        >
          <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <p className="font-semibold text-primary-foreground text-sm">{t.quickLogin}</p>
            <p className="text-primary-foreground/80 text-xs">{t.quickLoginDesc}</p>
          </div>
        </button>

        <div className="bg-card rounded-2xl card-shadow p-8">
          <div className="flex flex-col items-center mb-8">
            <img src={logo} alt="MyBiz" className="w-20 h-20 mb-2" />
            <p className="text-muted-foreground text-sm">{t.manageYourBusiness}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">{t.email}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-muted/50 border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">{t.password}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 rounded-xl bg-muted/50 border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-destructive text-sm font-medium">{error}</p>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl gradient-primary font-semibold text-sm text-primary-foreground transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
            >
              {mode === "login" ? t.loginTitle : "Qeydiyyatdan keç"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="text-xs text-secondary font-medium hover:underline"
            >
              {mode === "login" ? "Hesabın yoxdursa qeydiyyatdan keç" : "Hesabın var? Daxil ol"}
            </button>
          </div>
        </div>

        <p className="text-center text-[10px] text-muted-foreground mt-6">
          Copyright © 2026 MyBiz. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
