import React, { createContext, useContext, useState, useCallback } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatContextType {
  messages: Message[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  sendMessage: (content: string) => void;
  hasNewMessage: boolean;
  clearNewMessage: () => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

// Detailed, keyword-driven answers (Azerbaijani). Each response is a mini brief, not a 1-liner.
const AI_RESPONSES: { keys: string[]; reply: string }[] = [
  {
    keys: ["gəlir analizi", "gəlir"],
    reply:
      "📈 Gəlir analizi:\n• Bu ay ümumi gəlir: ₼8,450 (keçən aya nisbətən +12%)\n• Əsas mənbə: Satış kateqoriyası (74%)\n• 2-ci mənbə: Xidmət (18%)\n• Gündəlik orta: ₼281\nTövsiyə: Xidmət kateqoriyasını genişləndirsəniz, marja 8-12% arta bilər.",
  },
  {
    keys: ["xərc analizi", "xərc"],
    reply:
      "📉 Xərc analizi:\n• Ümumi xərc: ₼3,180 (gəlirin 38%-i)\n• Ən böyük xərc maddəsi: İcarə (₼1,200)\n• Marketinq: ₼620 (kifayət qədər effektiv deyil)\n• Kommunal: ₼340\nTövsiyə: Marketinq xərclərini 15% optimallaşdırın — aylıq ₼90 qənaət.",
  },
  {
    keys: ["mənfəət", "profit"],
    reply:
      "💰 Mənfəət hesabatı:\n• Xalis mənfəət: ₼5,270\n• Profit margin: 62.4% (sahə üzrə yaxşıdır)\n• Trend: 3 aydır artımdadır 📈\nVergi öhdəliyini hesablamaq üçün 'vergi hesabla' yazın.",
  },
  {
    keys: ["stok", "məhsul", "anbar"],
    reply:
      "📦 Stok vəziyyəti:\n• Cəmi məhsul: 42 SKU\n• Stokda azalan: 5 məhsul (limit < 10)\n• Tükənmiş: 1 məhsul\n• Ümumi stok dəyəri: ₼12,400\nTövsiyə: Az qalan məhsullar üçün avtomatik xatırlatma quraşdırın.",
  },
  {
    keys: ["vergi hesabla", "vergi", "edv", "ƏDV"],
    reply:
      "🧾 Vergi hesablaması:\n• Rejim: Sadələşdirilmiş (2%)\n• 12 aylıq dövriyyə: ₼8,450 (limit ₼200,000)\n• Hesablanan vergi: ₼169\n• Növbəti ödəniş tarixi: ayın 20-i\nƏtraflı: Profil → Vergi Kalkulyatoru. Ödəniş üçün e-taxes.gov.az.",
  },
  {
    keys: ["hesabat", "report"],
    reply:
      "📊 Hesabat yaratmaq üçün:\n1. 'Hesabatlar' bölməsinə keçin\n2. Tarix aralığını seçin (gün/həftə/ay/il)\n3. Müqayisəli analiz üçün 2 dövr seçin\n4. PDF/CSV formatında export edin\nHazır şablonlar: Aylıq özət, Mövsümi analiz, Vergi hesabatı.",
  },
  {
    keys: ["tranzaksiya əlavə", "tranzaksiya"],
    reply:
      "➕ Tranzaksiya əlavə etmək üçün:\n• Manual: Tranzaksiyalar → 'Əlavə et'\n• CSV/Excel import: file seçin → avto-tanıma\n• PDF bank hesabatı: yüklə → OCR ilə oxunur\n• SQL DB qoşulması: connection string daxil edin\nQəbz şəkli də skan edilə bilər.",
  },
  {
    keys: ["xatırlatma", "tapşırıq", "reminder"],
    reply:
      "🔔 Xatırlatma yaratmaq:\n• Profil → Tapşırıqlar → 'Əlavə et'\n• Növ: vergi / icarə / digər\n• Təkrarlanan ödənişlər avtomatik xəbərdarlıq göndərir\n• Vaxtı keçmiş tapşırıqlar qırmızı ilə qeyd olunur.",
  },
  {
    keys: ["bu ayın özəti", "özət", "ay"],
    reply:
      "📅 Bu ayın özəti:\n• Gəlir: ₼8,450 (+12%)\n• Xərc: ₼3,180 (-3%)\n• Mənfəət: ₼5,270 (+18%)\n• Yeni müştəri: 14\n• Top satış: Aksesuar kateqoriyası (₼2,140)\nKeçən ayla müqayisə üçün Hesabatlar bölməsinə baxın.",
  },
  {
    keys: ["top satış", "ən çox satılan"],
    reply:
      "🏆 Top satış məhsulları (bu ay):\n1. Saat — 18 ədəd (₼2,160)\n2. Qol bağı — 14 ədəd (₼840)\n3. Eynək — 11 ədəd (₼1,320)\nTövsiyə: Top 3 üçün stok artırın və endirim kampaniyası planlaşdırın.",
  },
  {
    keys: ["az qalan", "tükənən", "minimum"],
    reply:
      "⚠️ Stokda azalan məhsullar (limit < 10):\n• Qara saat: 3 ədəd qalıb\n• Dəri qayış: 5 ədəd\n• Gümüş bağı: 4 ədəd\n• Aluminum çərçivə: 7 ədəd\n• USB kabel: 2 ədəd\nSifariş üçün Stok → həmin məhsul → 'Yenidən sifariş'.",
  },
  {
    keys: ["abunəlik", "premium", "plan"],
    reply:
      "💎 Abunəlik planları:\n• Pulsuz — əsas funksiyalar\n• Starter ₼20/ay — 50 əməliyyat, stok, vergi\n• Plus ₼35/ay — AI chatbot, 120 əməliyyat\n• Premium ₼45/ay — limitsiz, AI tövsiyə, mühasib portalı\nİllik ödəniş ilə 20% qənaət. İlk həftə pulsuzdur.",
  },
  {
    keys: ["sağlamlıq", "health", "biznes göstərici"],
    reply:
      "💚 Biznes sağlamlığı: 62/100 (Yaxşı)\n• Likvidlik: yüksək\n• Xərc nisbəti: 38% (sağlam)\n• Müştəri loyallığı: orta\nİrəliləyiş üçün: müntəzəm müştərilər üçün loyallıq proqramı qurun.",
  },
];

function getAIResponse(msg: string): string {
  const lower = msg.toLowerCase().trim();
  for (const item of AI_RESPONSES) {
    if (item.keys.some(k => lower.includes(k.toLowerCase()))) return item.reply;
  }
  return "Sualınızı tam başa düşmədim. Bu açar sözlərdən birini sınayın:\n• Gəlir / Xərc / Mənfəət analizi\n• Stok vəziyyəti\n• Vergi hesabla\n• Hesabat yarat\n• Tranzaksiya əlavə et\n• Xatırlatma / Tapşırıq\n• Top satış / Az qalan məhsullar\n• Abunəlik planları";
}

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: "init", role: "assistant", content: "Salam! Mən MyBiz AI köməkçisiyəm 🤖\nAşağıdakı açar sözlərdən birini seçin və ya sualınızı yazın. Sizə ətraflı analitika və tövsiyələr verəcəm." },
  ]);
  const [isOpen, setIsOpen] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);

  const sendMessage = useCallback((content: string) => {
    const userMsg: Message = { id: `u${Date.now()}`, role: "user", content };
    setMessages(prev => [...prev, userMsg]);

    setTimeout(() => {
      const aiMsg: Message = { id: `a${Date.now()}`, role: "assistant", content: getAIResponse(content) };
      setMessages(prev => [...prev, aiMsg]);
      setHasNewMessage(true);
    }, 700);
  }, []);

  const clearNewMessage = useCallback(() => setHasNewMessage(false), []);

  return (
    <ChatContext.Provider value={{ messages, isOpen, setIsOpen, sendMessage, hasNewMessage, clearNewMessage }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
};
