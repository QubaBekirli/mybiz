import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Package, Plus, Trash2, AlertTriangle, X, Search, Edit3, Minus } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface InvItem {
  id: string;
  name: string;
  sku: string | null;
  category: string | null;
  cost_price: number;
  sell_price: number;
  quantity: number;
  low_stock_threshold: number;
  unit: string | null;
}

const DEFAULT_ITEMS = [
  { name: "Kruassan", sku: "KRS-01", category: "Şirniyyat", cost_price: 0.80, sell_price: 1.50, quantity: 120, low_stock_threshold: 20, unit: "ədəd" },
  { name: "Tort", sku: "TRT-01", category: "Şirniyyat", cost_price: 5.00, sell_price: 9.00, quantity: 15, low_stock_threshold: 5, unit: "ədəd" },
  { name: "Çay", sku: "CAY-01", category: "İçkilər", cost_price: 0.30, sell_price: 0.80, quantity: 200, low_stock_threshold: 30, unit: "stəkan" },
  { name: "Qəhvə", sku: "QHV-01", category: "İçkilər", cost_price: 0.60, sell_price: 1.50, quantity: 180, low_stock_threshold: 30, unit: "stəkan" },
  { name: "Çörək", sku: "CRK-01", category: "Çörək-Bulka", cost_price: 0.20, sell_price: 0.50, quantity: 300, low_stock_threshold: 50, unit: "ədəd" },
  { name: "Bulka", sku: "BLK-01", category: "Çörək-Bulka", cost_price: 0.15, sell_price: 0.40, quantity: 250, low_stock_threshold: 40, unit: "ədəd" },
  { name: "Salat", sku: "SLT-01", category: "Yeməklər", cost_price: 1.50, sell_price: 3.50, quantity: 40, low_stock_threshold: 10, unit: "porsiya" },
  { name: "Şirə", sku: "SIR-01", category: "İçkilər", cost_price: 0.40, sell_price: 1.00, quantity: 90, low_stock_threshold: 20, unit: "stəkan" },
];

const InventoryPage: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<InvItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<InvItem | null>(null);
  const [form, setForm] = useState({ name: "", sku: "", category: "", cost_price: "", sell_price: "", quantity: "", low_stock_threshold: "5", unit: "ədəd" });
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkText, setBulkText] = useState("");

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase.from("inventory").select("*").order("created_at", { ascending: false });
    if (error) {
      toast({ title: "Xəta", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }
    if (!data || data.length === 0) {
      const payloads = DEFAULT_ITEMS.map(item => ({ ...item, owner_id: user.id }));
      const { error: insertError } = await supabase.from("inventory").insert(payloads);
      if (insertError) {
        toast({ title: "Xəta", description: insertError.message, variant: "destructive" });
        setLoading(false);
        return;
      }
      const { data: fresh } = await supabase.from("inventory").select("*").order("created_at", { ascending: false });
      setItems((fresh as InvItem[]) || []);
    } else {
      setItems(data as InvItem[]);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [user?.id]);

  const resetForm = () => setForm({ name: "", sku: "", category: "", cost_price: "", sell_price: "", quantity: "", low_stock_threshold: "5", unit: "ədəd" });

  const openNew = () => { setEditing(null); resetForm(); setOpen(true); };
  const openEdit = (it: InvItem) => {
    setEditing(it);
    setForm({
      name: it.name, sku: it.sku || "", category: it.category || "",
      cost_price: String(it.cost_price), sell_price: String(it.sell_price),
      quantity: String(it.quantity), low_stock_threshold: String(it.low_stock_threshold),
      unit: it.unit || "ədəd",
    });
    setOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (bulkMode) {
      const lines = bulkText.split("\n").filter(l => l.trim().length > 0);
      const payloads = lines.map(line => {
        const parts = line.split(",").map(p => p.trim());
        return {
          owner_id: user.id,
          name: parts[0] || "Bilinməyən",
          sell_price: Number(parts[1]) || 0,
          quantity: parseInt(parts[2]) || 0,
          low_stock_threshold: 5,
          unit: "ədəd"
        };
      });
      if (payloads.length > 0) {
        const { error } = await supabase.from("inventory").insert(payloads);
        if (error) return toast({ title: "Xəta", description: error.message, variant: "destructive" });
        toast({ title: `${payloads.length} məhsul əlavə edildi` });
      }
      setOpen(false); resetForm(); setBulkText(""); load();
      return;
    }

    const payload = {
      owner_id: user.id,
      name: form.name,
      sku: form.sku || null,
      category: form.category || null,
      cost_price: Number(form.cost_price) || 0,
      sell_price: Number(form.sell_price) || 0,
      quantity: parseInt(form.quantity) || 0,
      low_stock_threshold: parseInt(form.low_stock_threshold) || 5,
      unit: form.unit || "ədəd",
    };
    const { error } = editing
      ? await supabase.from("inventory").update(payload).eq("id", editing.id)
      : await supabase.from("inventory").insert(payload);
    if (error) return toast({ title: "Xəta", description: error.message, variant: "destructive" });
    toast({ title: editing ? "Yeniləndi" : "Əlavə edildi" });
    setOpen(false); resetForm(); setEditing(null); load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("inventory").delete().eq("id", id);
    if (error) return toast({ title: "Xəta", description: error.message, variant: "destructive" });
    setItems(items.filter(i => i.id !== id));
  };

  const adjust = async (it: InvItem, delta: number) => {
    const newQty = Math.max(0, it.quantity + delta);
    const { error } = await supabase.from("inventory").update({ quantity: newQty }).eq("id", it.id);
    if (error) return toast({ title: "Xəta", description: error.message, variant: "destructive" });
    setItems(items.map(i => i.id === it.id ? { ...i, quantity: newQty } : i));
  };

  const filtered = useMemo(() => items.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    (i.sku || "").toLowerCase().includes(search.toLowerCase())
  ), [items, search]);

  const lowStock = items.filter(i => i.quantity <= i.low_stock_threshold);
  const totalValue = items.reduce((s, i) => s + i.quantity * i.sell_price, 0);

  return (
    // overflow-x-hidden əsas konteyner səviyyəsində horizontal scroll-u tam bağlayır
    <div className="max-w-6xl mx-auto opacity-0 animate-fade-up overflow-x-hidden">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground" style={{ lineHeight: "1.2" }}>Stok / Anbar</h1>
          <p className="text-muted-foreground text-xs mt-0.5">Məhsulları və miqdarı izləyin</p>
        </div>
        <button onClick={openNew} className="gradient-primary text-primary-foreground rounded-xl px-4 py-2.5 text-sm font-semibold flex items-center gap-2 hover:opacity-90 transition active:scale-95">
          <Plus className="w-4 h-4" /> Məhsul əlavə et
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        <div className="bg-card rounded-2xl card-shadow p-4">
          <p className="text-xs text-muted-foreground">Ümumi məhsul</p>
          <p className="text-2xl font-bold text-foreground mt-1">{items.length}</p>
        </div>
        <div className="bg-card rounded-2xl card-shadow p-4">
          <p className="text-xs text-muted-foreground">Stok dəyəri</p>
          <p className="text-2xl font-bold text-gradient mt-1">{totalValue.toFixed(2)} ₼</p>
        </div>
        <div className="bg-card rounded-2xl card-shadow p-4 col-span-2 md:col-span-1">
          <p className="text-xs text-muted-foreground flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-warning-yellow" />Az qalan</p>
          <p className="text-2xl font-bold text-warning-yellow mt-1">{lowStock.length}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Məhsul və ya SKU axtar..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* List */}
      <div className="bg-card rounded-2xl card-shadow overflow-hidden">
        {loading && <div className="p-10 text-center text-muted-foreground">Yüklənir...</div>}
        {!loading && filtered.length === 0 && (
          <div className="p-10 text-center">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-foreground font-medium">Məhsul tapılmadı</p>
          </div>
        )}

        {filtered.map((it, idx) => {
          const low = it.quantity <= it.low_stock_threshold;
          return (
            <div
              key={it.id}
              className={`p-4 ${idx !== filtered.length - 1 ? "border-b border-border" : ""}`}
            >
              {/* Yuxarı sətir: ikon + məlumat + edit/sil düymələri */}
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center ${low ? "bg-warning-yellow/20" : "bg-accent"}`}>
                  <Package className={`w-5 h-5 ${low ? "text-warning-yellow" : "text-accent-foreground"}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">{it.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {it.sku && <>SKU: {it.sku} · </>}
                    {it.sell_price.toFixed(2)} ₼ / {it.unit}
                  </p>
                  {/* Status badge */}
                  <div className="mt-1">
                    {it.quantity < 10 && (
                      <span className="text-[10px] bg-destructive/10 text-destructive px-1.5 py-0.5 rounded font-semibold">
                        Tükənmək üzrədir (&lt;10)
                      </span>
                    )}
                    {it.quantity >= 10 && it.quantity < 30 && (
                      <span className="text-[10px] bg-warning-yellow/10 text-warning-yellow-foreground px-1.5 py-0.5 rounded font-semibold">
                        Satış sürəti yüksəkdir
                      </span>
                    )}
                    {it.quantity >= 30 && (
                      <span className="text-[10px] bg-success/10 text-success px-1.5 py-0.5 rounded font-semibold">
                        Mövsümi artım gözlənilir
                      </span>
                    )}
                  </div>
                </div>

                {/* Edit + Delete — yuxarı sağ künc */}
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => openEdit(it)} className="text-muted-foreground hover:text-primary p-1.5">
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button onClick={() => remove(it.id)} className="text-muted-foreground hover:text-destructive p-1.5">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Aşağı sətir: miqdar artır/azalt — tam genişliyi tutur, overflow olmur */}
              <div className="flex items-center justify-between mt-3 pl-[52px]">
                <span className="text-xs text-muted-foreground">Miqdar</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => adjust(it, -1)}
                    className="w-8 h-8 rounded-lg bg-muted hover:bg-border flex items-center justify-center"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-10 text-center font-bold text-foreground tabular-nums">{it.quantity}</span>
                  <button
                    onClick={() => adjust(it, 1)}
                    className="w-8 h-8 rounded-lg bg-muted hover:bg-border flex items-center justify-center"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-card rounded-2xl w-full max-w-md p-6 animate-slide-up max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">{editing ? "Məhsulu redaktə et" : "Yeni məhsul"}</h2>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            {!editing && (
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setBulkMode(false)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg ${!bulkMode ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                >
                  Tək-tək
                </button>
                <button
                  onClick={() => setBulkMode(true)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg ${bulkMode ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                >
                  Toplu əlavə
                </button>
              </div>
            )}

            <form onSubmit={submit} className="space-y-3">
              {bulkMode ? (
                <>
                  <p className="text-xs text-muted-foreground mb-2">
                    Hər sətrə bir məhsul: <code>Ad, Qiymət, Miqdar</code> formatında yazın.
                  </p>
                  <textarea
                    required
                    value={bulkText}
                    onChange={e => setBulkText(e.target.value)}
                    placeholder={"Alma, 2.50, 100\nArmud, 3.00, 50"}
                    className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-sm min-h-[150px] focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </>
              ) : (
                <>
                  <input
                    required
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="Məhsulun adı"
                    className="w-full px-4 py-2.5 rounded-xl bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      value={form.sku}
                      onChange={e => setForm({ ...form, sku: e.target.value })}
                      placeholder="SKU"
                      className="px-4 py-2.5 rounded-xl bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    <input
                      value={form.category}
                      onChange={e => setForm({ ...form, category: e.target.value })}
                      placeholder="Kateqoriya"
                      className="px-4 py-2.5 rounded-xl bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number" step="0.01"
                      value={form.cost_price}
                      onChange={e => setForm({ ...form, cost_price: e.target.value })}
                      placeholder="Alış (₼)"
                      className="px-4 py-2.5 rounded-xl bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    <input
                      type="number" step="0.01" required
                      value={form.sell_price}
                      onChange={e => setForm({ ...form, sell_price: e.target.value })}
                      placeholder="Satış (₼)"
                      className="px-4 py-2.5 rounded-xl bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <input
                      type="number" required
                      value={form.quantity}
                      onChange={e => setForm({ ...form, quantity: e.target.value })}
                      placeholder="Miqdar"
                      className="px-4 py-2.5 rounded-xl bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    <input
                      type="number"
                      value={form.low_stock_threshold}
                      onChange={e => setForm({ ...form, low_stock_threshold: e.target.value })}
                      placeholder="Min"
                      className="px-4 py-2.5 rounded-xl bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    <input
                      value={form.unit}
                      onChange={e => setForm({ ...form, unit: e.target.value })}
                      placeholder="Vahid"
                      className="px-4 py-2.5 rounded-xl bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </>
              )}
              <button
                type="submit"
                className="w-full gradient-primary text-primary-foreground rounded-xl py-3 text-sm font-semibold hover:opacity-90 transition active:scale-95"
              >
                {editing ? "Yadda saxla" : (bulkMode ? "Toplu Əlavə et" : "Əlavə et")}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;