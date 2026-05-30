import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  User, CreditCard, LogOut, ChevronRight, X, Crown, Star, Pencil, Gift, Settings as SettingsIcon, Check, Mail,
  Calculator, ClipboardList
} from "lucide-react";
import logo from "@/assets/logo_main.svg";
import NotificationsPage from "@/pages/NotificationsPage";
import TaxPage from "@/pages/TaxPage";

interface ProfilePageProps {
  onNavigate: (page: string) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate }) => {
  const { user, logout, updateProfile } = useAuth();
  const { t } = useLanguage();

  const [showEditBusiness, setShowEditBusiness] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [showPremium, setShowPremium] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [activeModule, setActiveModule] = useState<"tasks" | "tax" | "subscription">("subscription");
  const [selectedPlan, setSelectedPlan] = useState<number>(-1);

  const [cardForm, setCardForm] = useState({ number: "", name: "", expiry: "", cvv: "" });
  const [savedCard, setSavedCard] = useState<string | null>(null);

  const [bizForm, setBizForm] = useState({
    businessName: user?.businessName || "",
    ownerName: user?.ownerName || "",
    category: "",
    employees: "1-5",
    voen: "",
  });

  const plans = [
    { name: t.basicPlan as string, price: t.basicPrice as string, yearlyPrice: "149.99 ₼",
      features: t.basicFeatures as string[], icon: Star },
    { name: t.premiumPlan as string, price: t.premiumPrice as string, yearlyPrice: "239.99 ₼",
      features: t.premiumFeatures as string[], popular: true, icon: Crown },
    { name: t.businessPlan as string, price: t.businessPrice as string, yearlyPrice: "299.99 ₼",
      features: t.businessFeatures as string[], icon: CreditCard },
  ];

  const initials = (bizForm.ownerName || user?.email || "U").slice(0, 2).toUpperCase();

  const MODULE_TABS = [
    { id: "subscription" as const, label: "Abunəlik", icon: Crown },
    { id: "tasks" as const, label: "Tapşırıqlar", icon: ClipboardList },
    { id: "tax" as const, label: "Vergi Kalkulyatoru", icon: Calculator },
  ];

  return (
    <div className="space-y-5 max-w-3xl pb-8">
      {/* Header — Profil + Settings (no logo) */}
      <div className="flex items-center justify-between opacity-0 animate-fade-up">
        <h1 className="text-2xl font-bold text-foreground" style={{ lineHeight: "1.2" }}>{t.profile}</h1>
        <button
          onClick={() => onNavigate("settings")}
          aria-label={t.settings as string}
          className="p-2.5 rounded-xl bg-card card-shadow hover:card-shadow-hover transition-all active:scale-95"
        >
          <SettingsIcon className="w-5 h-5 text-foreground" />
        </button>
      </div>


      {/* Profile hero — pencil top-right opens business info editor */}
      <div className="relative rounded-2xl gradient-primary text-primary-foreground p-5 card-shadow opacity-0 animate-fade-up" style={{ animationDelay: "60ms" }}>
        <button
          onClick={() => setShowEditBusiness(true)}
          aria-label="Biznes məlumatlarını düzənlə"
          className="absolute top-3 right-3 p-2 rounded-lg bg-primary-foreground/15 hover:bg-primary-foreground/25 backdrop-blur transition-all active:scale-95"
        >
          <Pencil className="w-3.5 h-3.5 text-primary-foreground" />
        </button>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary-foreground/20 backdrop-blur flex items-center justify-center text-xl font-bold">
            {initials}
          </div>
          <div className="min-w-0 flex-1 pr-8">
            <p className="text-lg font-bold truncate">{bizForm.ownerName || "İstifadəçi"}</p>
            <div className="flex items-center gap-1.5 mt-0.5 opacity-90">
              <Mail className="w-3 h-3" />
              <p className="text-xs truncate">{user?.email}</p>
            </div>
            <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full bg-primary-foreground/20 backdrop-blur border border-primary-foreground/10">
              <Star className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold">{selectedPlan === -1 ? "Free" : plans[selectedPlan]?.name || "Free"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Biznes modulları — 3 tabs, default İşçilər */}
      <div className="opacity-0 animate-fade-up" style={{ animationDelay: "100ms" }}>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {MODULE_TABS.map(m => {
            const active = activeModule === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setActiveModule(m.id)}
                className={`flex flex-col items-center justify-center gap-1 px-1.5 py-2.5 rounded-xl text-[11px] font-semibold transition-all active:scale-[0.97] ${
                  active
                    ? "gradient-primary text-primary-foreground shadow-lg"
                    : "bg-card card-shadow text-foreground hover:card-shadow-hover hover:-translate-y-0.5"
                }`}
              >
                <m.icon className="w-4 h-4" />
                <span className="text-center leading-tight">{m.label}</span>
              </button>
            );
          })}
        </div>
        <div className="bg-card rounded-2xl card-shadow p-3.5 md:p-4 text-[13px] md:text-sm">

          {activeModule === "tasks" && <NotificationsPage />}
          {activeModule === "tax" && <TaxPage />}
          {activeModule === "subscription" && (
            <div className="space-y-4">
              <div className="flex flex-col gap-3">
                <div className="p-4 rounded-xl border border-border bg-muted/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">{t.plan}</p>
                    <p className="text-base font-bold text-foreground mt-0.5">{selectedPlan === -1 ? "Free" : plans[selectedPlan]?.name || "Free"}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setShowPremium(true)} className="px-4 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-all">
                      {t.upgrade}
                    </button>
                    {selectedPlan > 0 && (
                      <button onClick={() => setSelectedPlan(0)} className="px-4 py-2 rounded-xl bg-destructive/10 text-destructive text-sm font-semibold hover:bg-destructive/20 transition-all">
                        Ləğv et
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-border bg-muted/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">{t.paymentMethod}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <CreditCard className="w-4 h-4 text-secondary" />
                      <p className="text-base font-medium text-foreground">{savedCard ? `•••• ${savedCard.slice(-4)}` : t.notAdded}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button onClick={() => setShowCard(true)} className="px-4 py-2 rounded-xl bg-secondary/10 text-secondary text-sm font-semibold hover:bg-secondary/20 transition-all">
                      {savedCard ? "Dəyişdir" : t.add}
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-border bg-muted/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center">
                      <Gift className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">Dostunuzu dəvət edin</p>
                      <p className="text-sm text-muted-foreground mt-0.5">Hər dəvət üçün 1 ay pulsuz Premium</p>
                    </div>
                  </div>
                  <button onClick={() => setShowInvite(true)} className="px-4 py-2 rounded-xl border border-border hover:bg-muted/50 text-sm font-medium transition-all">
                    Dəvət et
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>




      <div className="space-y-3 opacity-0 animate-fade-up" style={{ animationDelay: "240ms" }}>
        <button onClick={logout} className="w-full flex items-center justify-center gap-3 px-5 py-4 bg-card rounded-2xl card-shadow hover:card-shadow-hover transition-all active:scale-[0.99]">
          <LogOut className="w-5 h-5 text-destructive" />
          <span className="text-sm font-medium text-destructive">{t.exit}</span>
        </button>
      </div>

      {/* Premium Modal */}
      {showPremium && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-foreground/40 p-0 md:p-4" onClick={() => setShowPremium(false)}>
          <div className="bg-card rounded-t-3xl md:rounded-2xl card-shadow w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-card px-5 pt-5 pb-3 border-b border-border z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-secondary" />
                  <h2 className="text-lg font-bold text-foreground">{t.premium}</h2>
                </div>
                <button onClick={() => setShowPremium(false)} className="p-1.5 rounded-lg hover:bg-muted"><X className="w-5 h-5" /></button>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{t.premiumDesc}</p>
              <p className="text-[11px] text-success font-medium mb-3">🎁 İlk dəfə abonə olarkən 1 ay pulsuz</p>
              <div className="flex bg-muted/50 rounded-xl p-1">
                <button onClick={() => setBillingCycle("monthly")}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${billingCycle === "monthly" ? "bg-card card-shadow text-foreground" : "text-muted-foreground"}`}>
                  {t.monthly}
                </button>
                <button onClick={() => setBillingCycle("yearly")}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1 ${billingCycle === "yearly" ? "bg-card card-shadow text-foreground" : "text-muted-foreground"}`}>
                  {t.yearly} <span className="text-[10px] text-success font-bold">{t.save20}</span>
                </button>
              </div>
            </div>
            <div className="p-5 space-y-4">
              {plans.map((plan, i) => {
                const isPopular = (plan as any).popular;
                const isSelected = selectedPlan === i;
                const borderCls = isSelected
                  ? "border-purple-500 ring-2 ring-purple-500/40 bg-purple-500/5"
                  : isPopular
                  ? "border-warning-yellow bg-warning-yellow/5 hover:border-purple-500"
                  : "border-border hover:border-purple-500";
                return (
                <div
                  key={i}
                  className={`w-full text-left rounded-2xl border-2 p-4 transition-all cursor-pointer ${borderCls}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <plan.icon className={`w-5 h-5 ${isSelected ? "text-secondary" : isPopular ? "text-warning-yellow" : "text-muted-foreground"}`} />
                      <h3 className="font-bold text-foreground">{plan.name}</h3>
                      {isPopular && (
                        <span className="text-[10px] bg-warning-yellow text-warning-yellow-foreground px-2 py-0.5 rounded-full font-bold">{t.popular}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-2xl font-bold text-foreground">
                      {billingCycle === "yearly" ? plan.yearlyPrice : plan.price}
                    </span>
                    {plan.price !== t.basicPrice && <span className="text-sm text-muted-foreground">{t.perMonth}</span>}
                  </div>
                  <ul className="space-y-2 mb-4">
                    {plan.features.map((f, fi) => (
                      <li key={fi} className="flex items-center gap-2 text-sm text-foreground">
                        <Check className="w-4 h-4 text-success shrink-0" />{f}
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={() => setSelectedPlan(i)}
                    className={`w-full py-2.5 rounded-xl text-sm font-semibold text-center transition-all active:scale-95 overflow-hidden relative ${
                      isSelected
                        ? "gradient-primary text-primary-foreground shadow-lg animate-scale-in"
                        : "bg-secondary/10 text-secondary hover:bg-secondary/20"
                    }`}
                  >
                    <span className="inline-flex items-center justify-center gap-1.5">
                      {isSelected && <Check className="w-4 h-4 animate-fade-up" />}
                       {isSelected ? "Abunə olundu" : "Abunə ol"}
                    </span>
                  </button>
                </div>
              );})}
            </div>
          </div>
        </div>
      )}

      {/* Edit Business */}
      {showEditBusiness && (
        <Modal title="Biznes məlumatlarını düzənlə" onClose={() => setShowEditBusiness(false)}>
          <div className="space-y-3">
            {[
              { k: "businessName", label: t.businessName as string },
              { k: "ownerName", label: t.owner as string },
              { k: "category", label: "Kateqoriya" },
              { k: "employees", label: "İşçi sayı" },
              { k: "voen", label: "VÖEN" },
            ].map(f => (
              <div key={f.k}>
                <label className="text-xs text-muted-foreground mb-1 block">{f.label}</label>
                <input value={(bizForm as any)[f.k]} onChange={e => setBizForm(b => ({ ...b, [f.k]: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40" />
              </div>
            ))}
            <button onClick={async () => {
              await updateProfile({ ownerName: bizForm.ownerName, businessName: bizForm.businessName });
              setShowEditBusiness(false);
            }}
              className="w-full py-2.5 rounded-xl gradient-primary text-sm font-semibold text-primary-foreground hover:opacity-90">
              Yadda saxla
            </button>
          </div>
        </Modal>
      )}

      {/* Invite — copy with feedback */}
      {showInvite && <InviteModal onClose={() => setShowInvite(false)} /> }

      {/* Card */}
      {showCard && (
        <Modal title="Ödəniş kartı əlavə et" onClose={() => setShowCard(false)}>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Kart nömrəsi</label>
              <input
                inputMode="numeric"
                maxLength={19}
                value={cardForm.number}
                onChange={e => {
                  const digits = e.target.value.replace(/\D/g, "").slice(0, 16);
                  const formatted = digits.replace(/(.{4})/g, "$1 ").trim();
                  setCardForm(c => ({ ...c, number: formatted }));
                }}
                placeholder="1234 5678 9012 3456"
                className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-foreground text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-secondary/40"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Kart sahibinin adı</label>
              <input
                value={cardForm.name}
                onChange={e => setCardForm(c => ({ ...c, name: e.target.value.toUpperCase() }))}
                placeholder="AD SOYAD"
                className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Son tarix</label>
                <input
                  maxLength={5}
                  value={cardForm.expiry}
                  onChange={e => {
                    let v = e.target.value.replace(/\D/g, "").slice(0, 4);
                    if (v.length >= 3) v = v.slice(0, 2) + "/" + v.slice(2);
                    setCardForm(c => ({ ...c, expiry: v }));
                  }}
                  placeholder="MM/YY"
                  className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">CVV</label>
                <input
                  inputMode="numeric"
                  maxLength={3}
                  value={cardForm.cvv}
                  onChange={e => setCardForm(c => ({ ...c, cvv: e.target.value.replace(/\D/g, "").slice(0, 3) }))}
                  placeholder="•••"
                  className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40"
                />
              </div>
            </div>
            <button
              onClick={() => {
                const digits = cardForm.number.replace(/\s/g, "");
                if (digits.length === 16 && cardForm.expiry.length === 5 && cardForm.cvv.length === 3) {
                  setSavedCard(digits);
                  setShowCard(false);
                }
              }}
              className="w-full py-2.5 rounded-xl gradient-primary text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              Kartı əlavə et
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="px-5 py-3.5">
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="text-sm font-medium text-foreground mt-0.5">{value}</p>
  </div>
);

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

const InviteModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [copied, setCopied] = useState(false);
  const link = "https://mybiz.az/invite/USR123";
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      // fallback
      const ta = document.createElement("textarea");
      ta.value = link; document.body.appendChild(ta); ta.select();
      document.execCommand("copy"); document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Modal title="Dostunuzu dəvət edin" onClose={onClose}>
      <p className="text-sm text-muted-foreground mb-3">Hər dəvət üçün 1 ay Premium pulsuz əldə edin.</p>
      <div className="flex gap-2 mb-2">
        <input
          readOnly
          value={link}
          onFocus={e => e.currentTarget.select()}
          className="flex-1 px-3 py-2.5 rounded-xl bg-muted/50 border border-border text-foreground text-xs font-mono cursor-text"
        />
        <button
          onClick={handleCopy}
          className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-95 ${copied ? "bg-success text-success-foreground" : "gradient-accent text-primary-foreground hover:opacity-90"}`}
        >
          {copied ? "✓ Kopyalandı" : "Kopyala"}
        </button>
      </div>
      <p className="text-[11px] text-muted-foreground">Linki dostunuza göndərin və o qeydiyyatdan keçəndə hər ikiniz bonus qazanın.</p>
    </Modal>
  );
};
export default ProfilePage;