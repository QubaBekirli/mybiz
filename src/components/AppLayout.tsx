import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { LayoutDashboard, ArrowLeftRight, BarChart3, Settings, LogOut, User, Bell, HelpCircle, Package } from "lucide-react";
import logoMain from "@/assets/logo_main.svg";
import logoWhite from "@/assets/logo_light_dark.svg";
import ScrollToTopButton from "@/components/ScrollToTopButton";


interface AppLayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children, currentPage, onNavigate }) => {
  const { logout, user } = useAuth();
  const { t } = useLanguage();
  const { theme } = useTheme();

  // Desktop sidebar always uses white logo (dark gradient bg). Mobile header uses theme-aware.
  const logo = theme === "dark" ? logoWhite : logoMain;

  const BOTTOM_NAV_ITEMS = [
    { id: "dashboard", label: t.dashboard as string, icon: LayoutDashboard },
    { id: "transactions", label: t.transactions as string, icon: ArrowLeftRight },
    { id: "analytics", label: t.reports as string, icon: BarChart3 },
    { id: "inventory", label: "Stok", icon: Package },
    { id: "profile", label: t.profile as string, icon: User },
  ];

  const SIDEBAR_NAV_ITEMS = [
    { id: "dashboard", label: t.dashboard as string, icon: LayoutDashboard },
    { id: "transactions", label: t.transactions as string, icon: ArrowLeftRight },
    { id: "analytics", label: t.reports as string, icon: BarChart3 },
    { id: "inventory", label: "Stok", icon: Package },
    { id: "promotions", label: "Xatırlatmalar", icon: Bell },
    { id: "profile", label: t.profile as string, icon: User },
    { id: "settings", label: t.settings as string, icon: Settings },
    { id: "help", label: t.help as string, icon: HelpCircle },
  ];

  const ownerName = user?.ownerName || "İstifadəçi";
  const hideMobileHeader = ["profile", "transactions", "analytics", "inventory", "promotions", "settings", "help"].includes(currentPage);

  return (
    <div className="min-h-screen gradient-bg flex">
      {/* Desktop Sidebar — no right border (use shadow/same color blend) */}
      <aside className="hidden md:flex w-64 gradient-sidebar flex-col p-6 fixed h-full z-30">
        <div className="flex items-center justify-center mb-10">
          <img src={logoWhite} alt="MyBiz" className="w-32 h-32 lg:w-36 lg:h-36 drop-shadow-xl" />
        </div>
        <nav className="flex-1 space-y-1">
          {SIDEBAR_NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 hover:translate-x-0.5 ${
                currentPage === item.id
                  ? "bg-white/20 text-white backdrop-blur-sm shadow-lg"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="border-t border-white/10 pt-4 mt-4">
          <button
            onClick={() => onNavigate("profile")}
            className="w-full flex items-center gap-3 p-2 rounded-2xl hover:bg-white/10 transition-all text-left mb-3"
          >
            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center text-white font-bold text-sm shrink-0">
              {(ownerName || user?.email || "U").slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white text-sm font-semibold truncate">{ownerName}</p>
              <p className="text-white/50 text-[11px] truncate">{user?.email}</p>
            </div>
          </button>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-white/70 hover:text-white text-sm font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" />
            {t.exit}
          </button>
        </div>
      </aside>

      <div className="flex-1 md:ml-64">
        {!hideMobileHeader && (
          <header className="md:hidden sticky top-0 z-40 bg-card/90 backdrop-blur-lg border-b border-border px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <img src={logo} alt="MyBiz" className="w-9 h-9 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground leading-none">Xoş gəlmisiniz</p>
                <p className="text-sm font-semibold text-foreground truncate leading-tight mt-0.5">{ownerName}</p>
              </div>
            </div>
            <button
              onClick={() => onNavigate("promotions")}
              className="p-2 rounded-lg hover:bg-muted transition-colors shrink-0"
              aria-label="Xatırlatmalar"
            >
              <Bell className="w-5 h-5 text-foreground" />
            </button>
          </header>
        )}

        <main className="p-4 md:p-8 pb-24 md:pb-8">{children}</main>
        <ScrollToTopButton />

        {/* Mobile Bottom Nav — tight pills, no white space around active purple, smaller text */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-lg border-t border-border flex px-0 py-0">
          {BOTTOM_NAV_ITEMS.map(item => {
            const active = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] transition-all duration-200 active:scale-95 ${
                  active
                    ? "gradient-primary text-white"
                    : "text-muted-foreground"
                }`}
              >
                <item.icon className={`w-5 h-5 transition-transform ${active ? "scale-110" : ""}`} />
                <span className="font-semibold">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default AppLayout;
