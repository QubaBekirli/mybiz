import React, { useState, useMemo, useEffect } from "react";
import { PieChart as RPieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area, ReferenceDot } from "recharts";
import { ArrowLeft, TrendingUp, Crown, Star, Package, CalendarDays, Tag } from "lucide-react";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const COLORS = ["#7c3aed", "#60a5fa", "#34d399", "#fb923c", "#9ca3af", "#f472b6", "#fbbf24"];

const CATEGORIES: { name: string; value: number; profit: number; products: { name: string; value: number }[] }[] = [
  { name: "Şirniyyat", value: 45.2, profit: 2451, products: [
    { name: "Kruassan", value: 35.1 }, { name: "Tort", value: 22.8 }, { name: "Piroq", value: 15.3 },
    { name: "Makaron", value: 12.9 }, { name: "Peçenye", value: 7.2 }, { name: "Digər", value: 6.7 },
  ]},
  { name: "İçkilər", value: 22.1, profit: 1120, products: [
    { name: "Çay", value: 38.4 }, { name: "Qəhvə", value: 31.2 }, { name: "Şirə", value: 18.5 }, { name: "Su", value: 11.9 },
  ]},
  { name: "Çörək-Bulka", value: 15.3, profit: 740, products: [
    { name: "Çörək", value: 52.0 }, { name: "Bulka", value: 30.5 }, { name: "Lavaş", value: 17.5 },
  ]},
  { name: "Yeməklər", value: 10.7, profit: 510, products: [
    { name: "Salat", value: 40.1 }, { name: "Sup", value: 35.4 }, { name: "Bişmiş", value: 24.5 },
  ]},
  { name: "Digər", value: 6.7, profit: 280, products: [
    { name: "Aksessuar", value: 60 }, { name: "Digər", value: 40 },
  ]},
];

function hourlyData(seed = 1) {
  const base = [2,1,1,0,0,3,8,30,180,360,440,420,300,180,140,200,260,320,280,230,180,90,40,20];
  return base.map((v, h) => ({ hour: `${String(h).padStart(2,"0")}:00`, value: Math.round(v * seed) }));
}

interface InvItem {
  id: string;
  name: string;
  sell_price: number;
  cost_price: number;
  quantity: number;
  category: string | null;
  unit: string | null;
}

const StockAnalytics: React.FC = () => {
  const { user } = useAuth();
  const [selectedCat, setSelectedCat] = useState<number | null>(null);
  const [selectedProd, setSelectedProd] = useState<number | null>(null);
  const [pieDate, setPieDate] = useState<{ from?: Date; to?: Date }>({});
  const [hiddenCats, setHiddenCats] = useState<Set<string>>(new Set());
  const [hiddenProds, setHiddenProds] = useState<Set<string>>(new Set());

  const [invItems, setInvItems] = useState<InvItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string>("");
  const [priceSlider, setPriceSlider] = useState<number>(0);

  useEffect(() => {
    if (!user) return;
    supabase.from("inventory").select("id,name,sell_price,cost_price,quantity,category,unit")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data && data.length > 0) {
          setInvItems(data as InvItem[]);
          setSelectedItemId((data as InvItem[])[0].id);
        }
      });
  }, [user?.id]);

  const selectedItem = invItems.find(i => i.id === selectedItemId) || null;
  const newPrice = selectedItem ? Math.max(0, selectedItem.sell_price * (1 + priceSlider / 100)) : 0;
  const priceDiff = selectedItem ? newPrice - selectedItem.sell_price : 0;

  const topCat = CATEGORIES[0];
  const topProd = useMemo(() => {
    let best = { name: "", profit: 0, cat: "" };
    CATEGORIES.forEach(c => c.products.forEach(p => {
      const profit = (c.profit * p.value) / 100;
      if (profit > best.profit) best = { name: p.name, profit: Math.round(profit), cat: c.name };
    }));
    return best;
  }, []);

  const pieData = CATEGORIES.filter(c => !hiddenCats.has(c.name)).map(c => ({ name: c.name, value: c.value }));
  const productBarData = selectedCat !== null
    ? CATEGORIES[selectedCat].products.filter(p => !hiddenProds.has(p.name)).map(p => ({ name: p.name, value: p.value }))
    : [];

  const hourly = useMemo(() => hourlyData(selectedProd !== null ? 0.6 : selectedCat !== null ? 0.85 : 1), [selectedCat, selectedProd]);
  const peak = useMemo(() => hourly.reduce((a, b) => b.value > a.value ? b : a, hourly[0]), [hourly]);

  const toggleCat = (name: string) => setHiddenCats(s => { const n = new Set(s); n.has(name) ? n.delete(name) : n.add(name); return n; });

  return (
    <div className="space-y-5">
      {/* Top highlight cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card rounded-2xl card-shadow p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shrink-0">
            <Crown className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground">Ən Çox Satan Kateqoriya</p>
            <p className="font-bold text-foreground text-sm truncate">{topCat.name}</p>
            <p className="text-[11px] text-secondary font-semibold">{topCat.value}% pay</p>
          </div>
        </div>
        <div className="bg-card rounded-2xl card-shadow p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-warning-yellow/20 flex items-center justify-center shrink-0">
            <Star className="w-5 h-5 text-warning-yellow" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-muted-foreground">Ən Çox Qazandıran Məhsul</p>
            <p className="font-bold text-foreground text-sm truncate">{topProd.name}</p>
            <p className="text-[11px] text-success font-semibold">{topProd.profit.toLocaleString()} ₼ mənfəət</p>
          </div>
        </div>
      </div>

      {/* Drill-down area */}
      <div className="bg-card rounded-2xl card-shadow p-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 min-w-0">
            {(selectedCat !== null) && (
              <button
                onClick={() => { if (selectedProd !== null) setSelectedProd(null); else { setSelectedCat(null); setHiddenProds(new Set()); } }}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors active:scale-95"
                aria-label="Geri"
              >
                <ArrowLeft className="w-4 h-4 text-secondary" />
              </button>
            )}
            <h2 className="font-semibold text-foreground text-sm truncate">
              {selectedProd !== null && selectedCat !== null
                ? `${CATEGORIES[selectedCat].products[selectedProd].name} — saat üzrə`
                : selectedCat !== null
                ? `${CATEGORIES[selectedCat].name} — Məhsul Səviyyəsi`
                : "Ümumi Satış"}
            </h2>
          </div>
        </div>

        {selectedCat === null && (
          <>
            <DateMini range={pieDate} onChange={setPieDate} />
            <div className="flex flex-col md:flex-row gap-3 items-center">
              <div className="w-full md:w-1/2 h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RPieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={2} dataKey="value"
                      onClick={(_, idx) => {
                        const visible = CATEGORIES.filter(c => !hiddenCats.has(c.name));
                        const real = CATEGORIES.findIndex(c => c.name === visible[idx]?.name);
                        if (real >= 0) setSelectedCat(real);
                      }}
                      style={{ cursor: "pointer" }}>
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="hsl(var(--card))" strokeWidth={2} />)}
                    </Pie>
                    <Tooltip formatter={(v: number) => `${v}%`} />
                  </RPieChart>
                </ResponsiveContainer>
              </div>
              <ul className="w-full md:w-1/2 space-y-1.5">
                {CATEGORIES.map((c, i) => {
                  const hidden = hiddenCats.has(c.name);
                  return (
                    <li key={c.name} className="flex items-center justify-between gap-2">
                      <button onClick={() => toggleCat(c.name)} className={`flex items-center gap-2 text-left flex-1 min-w-0 transition-opacity ${hidden ? "opacity-40" : ""}`}>
                        <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                        <span className="text-xs font-medium text-foreground truncate hover:text-secondary transition-colors">{c.name}</span>
                      </button>
                      <button onClick={() => setSelectedCat(i)} className="text-xs font-bold text-foreground hover:text-secondary transition-colors">
                        {c.value}%
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </>
        )}

        {selectedCat !== null && selectedProd === null && (
          <ResponsiveContainer width="100%" height={Math.max(200, productBarData.length * 36 + 40)}>
            <BarChart data={productBarData} layout="vertical" margin={{ left: 10, right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,20%,90%)" horizontal={false} />
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 12, cursor: "pointer" }} stroke="hsl(0,0%,33%)" width={80}
                onClick={(e: any) => {
                  const real = CATEGORIES[selectedCat].products.findIndex(p => p.name === e.value);
                  if (real >= 0) setSelectedProd(real);
                }} />
              <Tooltip formatter={(v: number) => `${v}%`} />
              <Bar dataKey="value" fill={COLORS[0]} radius={[0, 6, 6, 0]} style={{ cursor: "pointer" }}
                onClick={(d: any) => {
                  const real = CATEGORIES[selectedCat].products.findIndex(p => p.name === d.name);
                  if (real >= 0) setSelectedProd(real);
                }}>
                {productBarData.map((_, i) => <Cell key={i} fill={COLORS[0]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}

        {selectedCat !== null && selectedProd !== null && (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={hourly}>
              <defs>
                <linearGradient id="hg2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLORS[0]} stopOpacity={0.5} />
                  <stop offset="100%" stopColor={COLORS[0]} stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,20%,90%)" />
              <XAxis dataKey="hour" tick={{ fontSize: 10 }} stroke="hsl(0,0%,33%)" interval={3} />
              <YAxis tick={{ fontSize: 10 }} stroke="hsl(0,0%,33%)" />
              <Tooltip />
              <Area type="monotone" dataKey="value" stroke={COLORS[0]} fill="url(#hg2)" strokeWidth={2} dot />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Qiymət Dəyişdirici — inventory məhsullarına əsasən */}
      <div className="bg-card rounded-2xl card-shadow p-5">
        <h2 className="font-semibold text-foreground text-sm flex items-center gap-2 mb-4">
          <Tag className="w-4 h-4 text-secondary" />Qiymət Dəyişdirici
        </h2>

        {invItems.length === 0 ? (
          <div className="text-center py-8">
            <Package className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Stokda məhsul yoxdur</p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <p className="text-xs text-muted-foreground mb-1.5">Məhsul seçin:</p>
              <select
                value={selectedItemId}
                onChange={e => { setSelectedItemId(e.target.value); setPriceSlider(0); }}
                className="w-full px-3 py-2.5 rounded-xl bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                {invItems.map(i => (
                  <option key={i.id} value={i.id}>{i.name}</option>
                ))}
              </select>
            </div>

            {selectedItem && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-muted-foreground">Cari qiymət:</span>
                  <span className="text-base font-bold text-foreground">{selectedItem.sell_price.toFixed(2)} ₼</span>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Qiyməti dəyişdirin:</span>
                    <span className={`text-sm font-bold ${priceSlider >= 0 ? "text-success" : "text-destructive"}`}>
                      {priceSlider >= 0 ? "+" : ""}{priceSlider}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={-20}
                    max={20}
                    step={1}
                    value={priceSlider}
                    onChange={e => setPriceSlider(Number(e.target.value))}
                    className="w-full accent-primary h-2 rounded-full cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${((priceSlider + 20) / 40) * 100}%, hsl(var(--muted)) ${((priceSlider + 20) / 40) * 100}%, hsl(var(--muted)) 100%)`
                    }}
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                    <span>-20%</span><span>-10%</span><span>0%</span><span>+10%</span><span>+20%</span>
                  </div>
                </div>

                <div className="rounded-xl bg-muted/40 border border-border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground">Yeni qiymət:</span>
                    <span className="text-xl font-bold text-foreground">{newPrice.toFixed(2)} ₼</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Dəyişiklik:</span>
                    <span className={`text-sm font-semibold ${priceDiff >= 0 ? "text-success" : "text-destructive"}`}>
                      {priceDiff >= 0 ? "+" : ""}{priceDiff.toFixed(2)} ₼ ({priceSlider >= 0 ? "+" : ""}{priceSlider}%)
                    </span>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const DateMini: React.FC<{ range: { from?: Date; to?: Date }; onChange: (r: { from?: Date; to?: Date }) => void }> = ({ range, onChange }) => (
  <div className="flex flex-wrap items-center gap-2 mb-3">
    <span className="text-[11px] text-muted-foreground font-medium">Tarix:</span>
    <DateBtn label="Başlanğıc" date={range.from} onSelect={d => onChange({ ...range, from: d })} />
    <DateBtn label="Son" date={range.to} onSelect={d => onChange({ ...range, to: d })} />
    {(range.from || range.to) && (
      <button onClick={() => onChange({})} className="text-[11px] text-muted-foreground hover:text-foreground">× Sıfırla</button>
    )}
  </div>
);

const DateBtn: React.FC<{ label: string; date?: Date; onSelect: (d?: Date) => void }> = ({ label, date, onSelect }) => (
  <Popover>
    <PopoverTrigger asChild>
      <button className={cn("flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border bg-muted/40 text-[11px]", !date && "text-muted-foreground")}>
        <CalendarDays className="w-3 h-3" />{date ? format(date, "dd.MM.yy") : label}
      </button>
    </PopoverTrigger>
    <PopoverContent className="w-auto p-0" align="start">
      <Calendar mode="single" selected={date} onSelect={onSelect} initialFocus className="p-3 pointer-events-auto" />
    </PopoverContent>
  </Popover>
);

export default StockAnalytics;