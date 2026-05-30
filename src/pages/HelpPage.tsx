import React, { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  HelpCircle, MessageSquare, AlertTriangle, ChevronDown, ChevronUp, ChevronRight,
  Mail, Phone, Send, X, BookOpen, LifeBuoy, Sparkles, ArrowLeft
} from "lucide-react";

interface HelpPageProps { onBack?: () => void; }

const HelpPage: React.FC<HelpPageProps> = ({ onBack }) => {
  const { t } = useLanguage();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [showContact, setShowContact] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [reportForm, setReportForm] = useState({ category: "bugError", title: "", detail: "" });
  const [sent, setSent] = useState<"contact" | "report" | null>(null);

  const faqItems = t.faqItems as { q: string; a: string }[];

  const handleSendContact = (e: React.FormEvent) => {
    e.preventDefault();
    setSent("contact");
    setTimeout(() => {
      setShowContact(false);
      setSent(null);
      setContactForm({ name: "", email: "", message: "" });
    }, 1400);
  };

  const handleSendReport = (e: React.FormEvent) => {
    e.preventDefault();
    setSent("report");
    setTimeout(() => {
      setShowReport(false);
      setSent(null);
      setReportForm({ category: "bugError", title: "", detail: "" });
    }, 1400);
  };

  return (
    <div className="space-y-5 max-w-3xl pb-8">
      {/* Back button */}
      {onBack && (
        <div className="opacity-0 animate-fade-up">
          <button onClick={onBack} className="inline-flex items-center gap-2 p-2 rounded-xl bg-card card-shadow hover:card-shadow-hover transition-all active:scale-95">
            <ArrowLeft className="w-4 h-4 text-foreground" />
            <span className="text-sm font-medium text-foreground pr-1">Geri</span>
          </button>
        </div>
      )}
      {/* Hero */}
      <div className="opacity-0 animate-fade-up">
        <div className="rounded-2xl gradient-primary text-primary-foreground p-6 card-shadow relative overflow-hidden">
          <div className="absolute -right-6 -top-6 opacity-20">
            <LifeBuoy className="w-32 h-32" />
          </div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-medium opacity-90">{t.helpSupport}</span>
            </div>
            <h1 className="text-2xl font-bold mb-1" style={{ lineHeight: "1.2" }}>
              Necə kömək edə bilərik?
            </h1>
            <p className="text-sm opacity-90">Suallarınız üçün bizimlə əlaqə saxlayın.</p>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3 opacity-0 animate-fade-up" style={{ animationDelay: "60ms" }}>
        <button
          onClick={() => setShowContact(true)}
          className="bg-card rounded-2xl p-4 card-shadow hover:card-shadow-hover transition-all active:scale-[0.98] text-left"
        >
          <div className="w-10 h-10 rounded-xl gradient-accent flex items-center justify-center mb-3">
            <MessageSquare className="w-5 h-5 text-primary-foreground" />
          </div>
          <p className="font-semibold text-sm text-foreground">{t.contact}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Bizə yazın</p>
        </button>
        <button
          onClick={() => setShowReport(true)}
          className="bg-card rounded-2xl p-4 card-shadow hover:card-shadow-hover transition-all active:scale-[0.98] text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center mb-3">
            <AlertTriangle className="w-5 h-5 text-destructive" />
          </div>
          <p className="font-semibold text-sm text-foreground">{t.reportProblem}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Xəta barədə bildir</p>
        </button>
      </div>

      {/* FAQ */}
      <div className="bg-card rounded-2xl card-shadow overflow-hidden opacity-0 animate-fade-up" style={{ animationDelay: "120ms" }}>
        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-secondary" />
          <h2 className="font-semibold text-foreground text-sm">{t.faq}</h2>
        </div>
        <div className="divide-y divide-border">
          {faqItems.map((faq, i) => (
            <div key={i}>
              <button
                onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
                    <HelpCircle className="w-3.5 h-3.5 text-secondary" />
                  </div>
                  <p className="text-sm font-medium text-foreground">{faq.q}</p>
                </div>
                {expandedFaq === i
                  ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                  : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
              </button>
              {expandedFaq === i && (
                <div className="px-5 pb-4 pl-[60px]">
                  <p className="text-xs text-muted-foreground leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact info */}
      <div className="bg-card rounded-2xl card-shadow overflow-hidden opacity-0 animate-fade-up" style={{ animationDelay: "180ms" }}>
        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
          <LifeBuoy className="w-4 h-4 text-secondary" />
          <h2 className="font-semibold text-foreground text-sm">Birbaşa əlaqə</h2>
        </div>
        <div className="divide-y divide-border">
          <a href="mailto:mybizsupport@gmail.com" className="px-5 py-4 flex items-center gap-3 hover:bg-muted/30 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-secondary/10 flex items-center justify-center">
              <Mail className="w-4 h-4 text-secondary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm font-medium text-foreground">mybizsupport@gmail.com</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </a>
          <a href="tel:+994121234567" className="px-5 py-4 flex items-center gap-3 hover:bg-muted/30 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-secondary/10 flex items-center justify-center">
              <Phone className="w-4 h-4 text-secondary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">{t.phone}</p>
              <p className="text-sm font-medium text-foreground">+994 12 123 45 67</p>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </a>
        </div>
      </div>

      {/* Contact Modal */}
      {showContact && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-foreground/40 p-0 md:p-4" onClick={() => setShowContact(false)}>
          <div className="bg-card rounded-t-3xl md:rounded-2xl card-shadow w-full max-w-md p-6 animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-secondary" />
                <h2 className="text-lg font-bold text-foreground">{t.contact}</h2>
              </div>
              <button onClick={() => setShowContact(false)} className="p-1.5 rounded-lg hover:bg-muted"><X className="w-5 h-5" /></button>
            </div>
            {sent === "contact" ? (
              <div className="py-8 text-center">
                <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-3">
                  <Send className="w-6 h-6 text-success" />
                </div>
                <p className="text-sm font-medium text-foreground">Mesajınız göndərildi!</p>
                <p className="text-xs text-muted-foreground mt-1">Tezliklə sizinlə əlaqə saxlayacağıq.</p>
              </div>
            ) : (
              <form onSubmit={handleSendContact} className="space-y-3">
                <input required placeholder="Ad soyad" value={contactForm.name} onChange={e => setContactForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40" />
                <input required type="email" placeholder="Email" value={contactForm.email} onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40" />
                <textarea required rows={4} placeholder={t.writeMessage as string} value={contactForm.message} onChange={e => setContactForm(f => ({ ...f, message: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40 resize-none" />
                <button type="submit" className="w-full py-2.5 rounded-xl gradient-primary text-sm font-semibold text-primary-foreground hover:opacity-90 transition-all flex items-center justify-center gap-2">
                  <Send className="w-4 h-4" />{t.send}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReport && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-foreground/40 p-0 md:p-4" onClick={() => setShowReport(false)}>
          <div className="bg-card rounded-t-3xl md:rounded-2xl card-shadow w-full max-w-md p-6 animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                <h2 className="text-lg font-bold text-foreground">{t.reportProblem}</h2>
              </div>
              <button onClick={() => setShowReport(false)} className="p-1.5 rounded-lg hover:bg-muted"><X className="w-5 h-5" /></button>
            </div>
            {sent === "report" ? (
              <div className="py-8 text-center">
                <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-3">
                  <Send className="w-6 h-6 text-success" />
                </div>
                <p className="text-sm font-medium text-foreground">Problem qeydə alındı!</p>
                <p className="text-xs text-muted-foreground mt-1">Komandamız bunu yoxlayacaq.</p>
              </div>
            ) : (
              <form onSubmit={handleSendReport} className="space-y-3">
                <select value={reportForm.category} onChange={e => setReportForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40">
                  <option value="bugError">{t.bugError}</option>
                  <option value="performance">{t.performance}</option>
                  <option value="designIssue">{t.designIssue}</option>
                  <option value="dataLoss">{t.dataLoss}</option>
                  <option value="other">{t.other}</option>
                </select>
                <input required placeholder={t.shortTitle as string} value={reportForm.title} onChange={e => setReportForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40" />
                <textarea required rows={4} placeholder={t.describeDetail as string} value={reportForm.detail} onChange={e => setReportForm(f => ({ ...f, detail: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40 resize-none" />
                <button type="submit" className="w-full py-2.5 rounded-xl bg-destructive text-destructive-foreground text-sm font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2">
                  <Send className="w-4 h-4" />{t.report}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpPage;
