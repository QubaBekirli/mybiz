import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import {
  Shield, Download, ChevronRight, X,
  Globe, Moon, Sun, Trash2, HelpCircle, MessageSquare, AlertTriangle,
  Smartphone, ArrowLeft, Bell
} from "lucide-react";

interface SettingsPageProps {
  onBack?: () => void;
  onNavigate?: (page: string) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ onBack, onNavigate }) => {
  const { logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [show2FA, setShow2FA] = useState(false);
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(true);

  return (
    <div className="space-y-5 max-w-3xl pb-8">
      {/* Header with back */}
      <div className="flex items-center gap-3 opacity-0 animate-fade-up">
        {onBack && (
          <button onClick={onBack} className="p-2 rounded-xl bg-card card-shadow hover:card-shadow-hover transition-all active:scale-95">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
        )}
        <h1 className="text-2xl font-bold text-foreground" style={{ lineHeight: "1.2" }}>{t.settingsTitle}</h1>
      </div>

      {/* App Settings — moved from profile */}
      <div className="bg-card rounded-2xl card-shadow overflow-hidden opacity-0 animate-fade-up" style={{ animationDelay: "60ms" }}>
        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
          <Globe className="w-4 h-4 text-secondary" />
          <h2 className="font-semibold text-foreground text-sm">{t.appSettings}</h2>
        </div>
        <div className="divide-y divide-border">
          <div className="px-5 py-3.5 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{t.language}</p>
              <p className="text-sm font-medium text-foreground mt-0.5">
                {language === "az" ? "Azərbaycan" : "Русский"}
              </p>
            </div>
            <select
              value={language}
              onChange={e => setLanguage(e.target.value as any)}
              className="text-xs px-3 py-1.5 rounded-lg bg-muted/50 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/40"
            >
              <option value="az">Azərbaycan</option>
              <option value="ru">Русский</option>
            </select>
          </div>
          <div className="px-5 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {theme === "light" ? <Sun className="w-4 h-4 text-muted-foreground" /> : <Moon className="w-4 h-4 text-muted-foreground" />}
              <div>
                <p className="text-sm text-muted-foreground">{t.theme}</p>
                <p className="text-sm font-medium text-foreground mt-0.5">{theme === "light" ? t.light : t.dark}</p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className={`w-11 h-6 rounded-full relative transition-colors ${theme === "dark" ? "bg-secondary" : "bg-muted"}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-card shadow transition-transform ${theme === "dark" ? "left-[22px]" : "left-0.5"}`} />
            </button>
          </div>
          <div className="px-5 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Bildirişlər</p>
                <p className="text-sm font-medium text-foreground mt-0.5">{notifEnabled ? "Aktiv" : "Söndürülüb"}</p>
              </div>
            </div>
            <button
              onClick={() => setNotifEnabled(v => !v)}
              className={`w-11 h-6 rounded-full relative transition-colors ${notifEnabled ? "bg-secondary" : "bg-muted"}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-card shadow transition-transform ${notifEnabled ? "left-[22px]" : "left-0.5"}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="bg-card rounded-2xl card-shadow overflow-hidden opacity-0 animate-fade-up" style={{ animationDelay: "120ms" }}>
        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
          <Shield className="w-4 h-4 text-secondary" />
          <h2 className="font-semibold text-foreground text-sm">{t.security}</h2>
        </div>
        <div className="divide-y divide-border">
          <div className="px-5 py-3.5 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{t.password}</p>
              <p className="text-sm font-medium text-foreground mt-0.5">••••••••</p>
            </div>
            <button className="text-xs text-secondary font-medium flex items-center gap-1 hover:underline">
              {t.change}<ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="px-5 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">İki faktorlu autentifikasiya</p>
                <p className="text-xs text-muted-foreground mt-0.5">{twoFAEnabled ? "Aktivdir" : "Aktiv deyil"}</p>
              </div>
            </div>
            <button
              onClick={() => setShow2FA(true)}
              className="text-xs text-secondary font-medium flex items-center gap-1 hover:underline"
            >
              {twoFAEnabled ? "İdarə et" : "Aktivləşdir"}<ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="px-5 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-destructive" />
              <div>
                <p className="text-sm text-destructive font-medium">{t.deleteAccount}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{t.allDataDeleted}</p>
              </div>
            </div>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="text-xs text-destructive font-medium flex items-center gap-1 hover:underline"
            >
              {t.delete}<ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Help / Support — link to dedicated page */}
      <div className="bg-card rounded-2xl card-shadow overflow-hidden opacity-0 animate-fade-up" style={{ animationDelay: "180ms" }}>
        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-secondary" />
          <h2 className="font-semibold text-foreground text-sm">{t.helpSupport}</h2>
        </div>
        <div className="divide-y divide-border">
          <button onClick={() => onNavigate?.("help")} className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">{t.faq}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
          <button onClick={() => onNavigate?.("help")} className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">{t.contact}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
          <button onClick={() => onNavigate?.("help")} className="w-full px-5 py-3.5 flex items-center justify-between hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">{t.reportProblem}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Export */}
      <div className="opacity-0 animate-fade-up" style={{ animationDelay: "240ms" }}>
        <button className="w-full flex items-center gap-3 px-5 py-4 bg-card rounded-2xl card-shadow hover:card-shadow-hover transition-all active:scale-[0.99]">
          <Download className="w-5 h-5 text-secondary" />
          <span className="text-sm font-medium text-foreground">{t.exportData}</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
        </button>
      </div>

      {/* 2FA Modal */}
      {show2FA && (
        <Modal title="İki faktorlu autentifikasiya" onClose={() => setShow2FA(false)}>
          <p className="text-sm text-muted-foreground mb-4">Hesabınıza əlavə təhlükəsizlik qatı əlavə edin. Hər girişdə telefonunuza kod gələcək.</p>
          <button onClick={() => { setTwoFAEnabled(v => !v); setShow2FA(false); }}
            className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${twoFAEnabled ? "bg-destructive text-destructive-foreground" : "gradient-primary text-primary-foreground"} hover:opacity-90`}>
            {twoFAEnabled ? "Deaktiv et" : "Aktivləşdir"}
          </button>
        </Modal>
      )}

      {/* Delete confirm */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4" onClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-card rounded-2xl card-shadow w-full max-w-sm p-6 animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-destructive" />
              </div>
              <h2 className="text-lg font-bold text-foreground">{t.deleteConfirmTitle}</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-5">{t.deleteConfirmText}</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-2.5 rounded-xl bg-muted text-sm font-medium text-foreground hover:bg-muted/80 transition-all">
                {t.cancel}
              </button>
              <button onClick={() => { setShowDeleteConfirm(false); logout(); }} className="flex-1 py-2.5 rounded-xl bg-destructive text-sm font-medium text-destructive-foreground hover:bg-destructive/90 transition-all">
                {t.delete}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Modal: React.FC<{ title: string; onClose: () => void; children: React.ReactNode }> = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-foreground/40 p-0 md:p-4" onClick={onClose}>
    <div className="bg-card rounded-t-3xl md:rounded-2xl card-shadow w-full max-w-md p-6 animate-scale-in max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted"><X className="w-5 h-5" /></button>
      </div>
      {children}
    </div>
  </div>
);

export default SettingsPage;
