import React, { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

const ScrollToTopButton: React.FC = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 300);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!show) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Ən yuxarı çıx"
      // Positioned on the LEFT so it never overlaps the AI chatbot (right side)
      className="fixed bottom-24 md:bottom-8 left-4 md:left-72 z-40 w-11 h-11 rounded-full gradient-primary text-primary-foreground shadow-lg flex items-center justify-center hover:opacity-90 hover:-translate-y-0.5 active:scale-95 transition-all animate-fade-in"
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
};

export default ScrollToTopButton;
