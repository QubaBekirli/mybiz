import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useSalesGoal } from "@/contexts/SalesGoalContext";
import { Target, Pencil, Plus, Trash2, X, Wallet } from "lucide-react";

const SalesGoalCard: React.FC = () => {
  const { goal, setGoal, removeGoal } = useSalesGoal();
  const [editing, setEditing] = useState(false);
  const [target, setTarget] = useState(goal?.target.toString() ?? "");
  const [period, setPeriod] = useState(goal?.period ?? "Aylıq");

  const pct = goal ? Math.min(100, (goal.current / goal.target) * 100) : 0;

  const handleSave = () => {
    const t = parseFloat(target);
    if (t > 0) setGoal(t, period);
    setEditing(false);
  };

  return (
    <div className="bg-card rounded-2xl card-shadow p-5">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setEditing(true)} className="flex items-center gap-2 group">
          <Target className="w-4 h-4 text-secondary" />
          <h2 className="font-semibold text-foreground text-sm group-hover:text-secondary transition-colors">
            Satış hədəfi
          </h2>
          {/* Always visible edit pencil */}
          <Pencil className="w-3.5 h-3.5 text-muted-foreground group-hover:text-secondary transition-colors" />
        </button>
        {goal && (
          <span className="text-xs bg-secondary/10 text-secondary px-2 py-0.5 rounded-full font-medium">
            {goal.period}
          </span>
        )}
      </div>

      {goal ? (
        <div className="flex items-center gap-5">
          {/* Wallet — cash drops from left, center & right; green-only borders */}
          <div className="relative w-28 h-28 shrink-0 overflow-hidden" aria-hidden="true">
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-24 h-14 rounded-xl shadow-lg z-10"
                 style={{ background: "linear-gradient(135deg, #8b5e3c 0%, #5c3a21 100%)" }}>
              <Wallet className="w-7 h-7 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ color: "#fef3c7" }} />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full" style={{ background: "#facc15", boxShadow: "0 0 4px #facc15" }} />
            </div>
            <div className="absolute inset-0 pointer-events-none motion-reduce:hidden">
              {[
                { left: "22%", delay: 0,    anim: "cashFallLeft"   },
                { left: "50%", delay: 0.9,  anim: "cashFallCenter" },
                { left: "78%", delay: 1.8,  anim: "cashFallRight"  },
              ].map((c, i) => (
                <span
                  key={i}
                  className="absolute will-change-transform"
                  style={{
                    left: c.left,
                    marginLeft: "-11px",
                    top: "-6px",
                    width: "22px",
                    height: "12px",
                    borderRadius: "2px",
                    background: "linear-gradient(135deg, #d1fae5 0%, #6ee7b7 35%, #16a34a 100%)",
                    border: "1px solid #16a34a",
                    boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.4), 0 1px 2px rgba(22,163,74,0.25)",
                    animation: `${c.anim} 3.4s cubic-bezier(.4,.05,.5,.95) ${c.delay}s infinite`,
                  }}
                >
                  <span style={{
                    display: "block",
                    width: "5px",
                    height: "5px",
                    background: "#16a34a",
                    borderRadius: "50%",
                    margin: "3.5px auto",
                  }} />
                </span>
              ))}
            </div>
            <style>{`
              @keyframes cashFallCenter {
                0%   { transform: translate3d(0, 0, 0) rotate(-3deg); opacity: 0; }
                15%  { opacity: 1; }
                70%  { transform: translate3d(0, 56px, 0) rotate(2deg); opacity: 1; }
                100% { transform: translate3d(0, 70px, 0) rotate(0deg) scale(0.7); opacity: 0; }
              }
              @keyframes cashFallLeft {
                0%   { transform: translate3d(-8px, 0, 0) rotate(-12deg); opacity: 0; }
                15%  { opacity: 1; }
                70%  { transform: translate3d(16px, 56px, 0) rotate(8deg); opacity: 1; }
                100% { transform: translate3d(24px, 70px, 0) rotate(0deg) scale(0.7); opacity: 0; }
              }
              @keyframes cashFallRight {
                0%   { transform: translate3d(8px, 0, 0) rotate(12deg); opacity: 0; }
                15%  { opacity: 1; }
                70%  { transform: translate3d(-16px, 56px, 0) rotate(-8deg); opacity: 1; }
                100% { transform: translate3d(-24px, 70px, 0) rotate(0deg) scale(0.7); opacity: 0; }
              }
              @media (prefers-reduced-motion: reduce) {
                @keyframes cashFallCenter { from, to { transform: none; opacity: 0; } }
                @keyframes cashFallLeft   { from, to { transform: none; opacity: 0; } }
                @keyframes cashFallRight  { from, to { transform: none; opacity: 0; } }
              }
            `}</style>
          </div>

          <div className="flex-1">
            <p className="text-2xl font-bold text-foreground" style={{ lineHeight: "1.1" }}>
              ₼{goal.current.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              hədəf: ₼{goal.target.toLocaleString()}
            </p>
            <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-success rounded-full transition-all duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-xs font-semibold text-success mt-1.5">{pct.toFixed(0)}% tamamlandı</p>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setEditing(true)}
          className="w-full py-6 rounded-xl border-2 border-dashed border-border hover:border-secondary/40 hover:bg-secondary/5 transition-all flex flex-col items-center gap-2"
        >
          <Plus className="w-5 h-5 text-secondary" />
          <span className="text-sm font-medium text-foreground">Hədəf əlavə et</span>
        </button>
      )}

      {editing && createPortal(
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-foreground/60 backdrop-blur-md p-4" onClick={() => setEditing(false)}>
          <div className="bg-card rounded-2xl card-shadow w-full max-w-sm p-4 animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-foreground text-sm">Satış hədəfini düzənlə</h3>
              <button onClick={() => setEditing(false)} className="p-1 rounded-lg hover:bg-muted">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Hədəf məbləği (₼)</label>
                <input
                  type="number"
                  value={target}
                  onChange={e => setTarget(e.target.value)}
                  placeholder="10000"
                  className="w-full px-3 py-2 rounded-xl bg-muted/50 border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {[500, 1000, 5000, 10000, 25000].map(v => (
                    <button key={v} type="button" onClick={() => setTarget(String(v))}
                      className="text-[11px] px-2 py-1 rounded-md bg-secondary/10 text-secondary font-semibold hover:bg-secondary/20 transition">
                      ₼{v.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Dövr</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {["Həftəlik", "Aylıq", "Rüblük", "İllik"].map(p => (
                    <button key={p} type="button" onClick={() => setPeriod(p)}
                      className={`py-1.5 rounded-lg text-[11px] font-semibold transition-all ${period === p ? "gradient-primary text-primary-foreground" : "bg-muted text-foreground hover:bg-muted/70"}`}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                {goal && (
                  <button
                    onClick={() => { removeGoal(); setEditing(false); }}
                    className="px-3 py-2 rounded-xl bg-destructive/10 text-destructive text-sm font-medium hover:bg-destructive/20 transition-all flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setEditing(false)}
                  className="flex-1 py-2 rounded-xl bg-muted text-foreground text-sm font-medium hover:bg-muted/80 transition-all"
                >
                  Ləğv et
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-all"
                >
                  Yadda saxla
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default SalesGoalCard;
