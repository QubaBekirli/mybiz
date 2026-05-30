import React, { useState, useRef, useEffect } from "react";
import { useChat } from "@/contexts/ChatContext";
import { X, Send } from "lucide-react";

// Livelier AI robot head — blinking eyes, glowing antenna, soft 1mm float
const AIAvatar: React.FC<{ size?: number }> = ({ size = 28 }) => (
  <span
    className="inline-flex items-center justify-center relative motion-safe:animate-[aiFloat_3.6s_ease-in-out_infinite]"
    style={{ width: size, height: size }}
    aria-hidden="true"
  >
    <svg viewBox="0 0 64 64" width={size} height={size}>
      <defs>
        <radialGradient id="aiHead" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#ede9fe" />
        </radialGradient>
        <radialGradient id="aiCheek" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fda4af" />
          <stop offset="100%" stopColor="#fda4af" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* antenna */}
      <line x1="32" y1="6" x2="32" y2="14" stroke="#facc15" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="32" cy="5" r="2.8" fill="#facc15">
        <animate attributeName="r" values="2.5;3.6;2.5" dur="1.4s" repeatCount="indefinite" />
        <animate attributeName="fill" values="#facc15;#fde047;#facc15" dur="1.4s" repeatCount="indefinite" />
      </circle>
      {/* head */}
      <rect x="10" y="14" width="44" height="36" rx="12" fill="url(#aiHead)" stroke="#9061ff" strokeWidth="2.5" />
      {/* cheek blush */}
      <circle cx="17" cy="38" r="3.5" fill="url(#aiCheek)" />
      <circle cx="47" cy="38" r="3.5" fill="url(#aiCheek)" />
      {/* eyes — blinking */}
      <g>
        <circle cx="24" cy="30" r="4" fill="#9061ff">
          <animate attributeName="ry" values="4;4;0.3;4;4" dur="4s" keyTimes="0;0.92;0.95;0.98;1" repeatCount="indefinite" />
        </circle>
        <circle cx="40" cy="30" r="4" fill="#9061ff">
          <animate attributeName="ry" values="4;4;0.3;4;4" dur="4s" keyTimes="0;0.92;0.95;0.98;1" repeatCount="indefinite" />
        </circle>
        <circle cx="25.2" cy="28.8" r="1.3" fill="#ffffff" />
        <circle cx="41.2" cy="28.8" r="1.3" fill="#ffffff" />
      </g>
      {/* smile */}
      <path d="M24 42 Q32 48 40 42" stroke="#9061ff" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* ears with LED dots */}
      <rect x="6" y="26" width="4" height="12" rx="2" fill="#9061ff" />
      <rect x="54" y="26" width="4" height="12" rx="2" fill="#9061ff" />
      <circle cx="8" cy="32" r="1.3" fill="#22d3ee">
        <animate attributeName="opacity" values="1;0.3;1" dur="1.6s" repeatCount="indefinite" />
      </circle>
      <circle cx="56" cy="32" r="1.3" fill="#22d3ee">
        <animate attributeName="opacity" values="0.3;1;0.3" dur="1.6s" repeatCount="indefinite" />
      </circle>
    </svg>
    <style>{`
      @keyframes aiFloat {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-1.5px); }
      }
      @media (prefers-reduced-motion: reduce) {
        @keyframes aiFloat { from, to { transform: none; } }
      }
    `}</style>
  </span>
);

const ChatBot: React.FC = () => {
  const { messages, isOpen, setIsOpen, sendMessage, hasNewMessage, clearNewMessage } = useChat();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleOpen = () => {
    setIsOpen(true);
    clearNewMessage();
  };

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input.trim());
    setInput("");
  };

  // Removed generic "Salam / Kömək / Tövsiyə" chips — only real keyword chips remain
  const quickReplies = [
    "Gəlir analizi", "Xərc analizi", "Mənfəət", "Stok vəziyyəti",
    "Vergi hesabla", "Hesabat yarat", "Tranzaksiya əlavə et",
    "Bu ayın özəti", "Top satış", "Az qalan məhsullar",
    "Xatırlatma", "Abunəlik", "Müştəri", "Sağlamlıq",
  ];

  return (
    <>
      {!isOpen && (
        <button
          onClick={handleOpen}
          aria-label="AI Chatbot"
          className={`fixed bottom-24 md:bottom-8 right-4 md:right-8 z-50 w-14 h-14 rounded-full bg-card flex items-center justify-center card-shadow-hover transition-all duration-300 hover:scale-110 hover:-translate-y-1 active:scale-95 ${hasNewMessage ? "ring-2 ring-secondary motion-safe:animate-pulse" : ""}`}
          style={{ boxShadow: "0 8px 24px rgba(144,97,255,0.35)" }}
        >
          <AIAvatar size={36} />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-50 w-[calc(100%-2rem)] max-w-sm animate-scale-in">
          <div className="bg-card rounded-2xl card-shadow-hover overflow-hidden flex flex-col" style={{ height: "30rem" }}>
            <div className="gradient-accent px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AIAvatar size={28} />
                <span className="font-semibold text-primary-foreground text-sm">MyBiz AI Chatbot</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1 rounded-lg hover:bg-white/20 transition-colors">
                <X className="w-4 h-4 text-primary-foreground" />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm whitespace-pre-line ${
                    msg.role === "user"
                      ? "gradient-primary text-primary-foreground rounded-br-md"
                      : "bg-muted text-foreground rounded-bl-md"
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick-reply keyword chips — always visible, no generic words */}
            <div className="px-3 pb-2 pt-2 border-t border-border">
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {quickReplies.map(qr => (
                  <button key={qr} onClick={() => sendMessage(qr)}
                    className="shrink-0 text-xs px-3 py-1.5 rounded-full bg-muted text-foreground font-medium hover:bg-secondary/15 hover:text-secondary transition active:scale-95">
                    {qr}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 border-t border-border flex gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSend()}
                placeholder="Mesaj yazın..."
                className="flex-1 px-3 py-2 rounded-xl bg-muted text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              <button onClick={handleSend} className="w-9 h-9 rounded-xl gradient-accent flex items-center justify-center transition-opacity hover:opacity-90 active:scale-[0.95]">
                <Send className="w-4 h-4 text-primary-foreground" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
