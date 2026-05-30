import React from "react";
import { Percent, Clock, Gift, Megaphone, ArrowLeft } from "lucide-react";

const PROMOTIONS = [
  {
    id: "p1",
    title: "Premiumda endirim!",
    desc: "İllik abunəliyə keçin və qənaət edin. Məhdud müddətli təklif!",
    icon: Percent,
    color: "bg-destructive/10 text-destructive",
    badge: "Endirim",
    badgeColor: "bg-destructive/10 text-destructive",
  },
  {
    id: "p2",
    title: "Abunəlik vaxtı bitir",
    desc: "Pulsuz sınaq müddətiniz 3 gün sonra bitəcək. Premium-a keçid edin!",
    icon: Clock,
    color: "bg-secondary/10 text-secondary",
    badge: "Xatırlatma",
    badgeColor: "bg-secondary/10 text-secondary",
  },
  {
    id: "p3",
    title: "Yeni: CSV İmport Pro",
    desc: "Bank hesabatlarınızı avtomatik import edin. Yüklənmiş CSV-lər üçün yeni xüsusiyyətlər!",
    icon: Gift,
    color: "bg-success/10 text-success",
    badge: "Yenilik",
    badgeColor: "bg-success/10 text-success",
  },
  {
    id: "p4",
    title: "Kampaniya: Dost tövsiyəsi",
    desc: "Dostunuzu dəvət edin, hər ikiniz 1 ay pulsuz Premium qazanın.",
    icon: Megaphone,
    color: "bg-accent text-accent-foreground",
    badge: "Kampaniya",
    badgeColor: "bg-accent text-accent-foreground",
  },
];

interface PromotionsPageProps {
  onBack?: () => void;
}

const PromotionsPage: React.FC<PromotionsPageProps> = ({ onBack }) => {
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3 opacity-0 animate-fade-up">
        {onBack && (
          <button onClick={onBack} className="p-2 rounded-xl bg-card card-shadow hover:card-shadow-hover transition-all">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
        )}
        <h1 className="text-2xl font-bold text-foreground" style={{ lineHeight: "1.2" }}>Bildirişlər</h1>
      </div>

      <div className="space-y-3">
        {PROMOTIONS.map((promo, i) => (
          <div
            key={promo.id}
            className="bg-card rounded-2xl card-shadow p-5 flex items-start gap-4 hover:card-shadow-hover transition-all cursor-pointer active:scale-[0.99] opacity-0 animate-fade-up"
            style={{ animationDelay: `${(i + 1) * 80}ms` }}
          >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${promo.color}`}>
              <promo.icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-semibold text-foreground">{promo.title}</p>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${promo.badgeColor}`}>{promo.badge}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{promo.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PromotionsPage;
