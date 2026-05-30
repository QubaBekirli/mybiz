import React, { useState } from "react";
import { useReminders, Reminder } from "@/contexts/RemindersContext";
import { ClipboardList, CheckCircle2, Calendar, Plus, Pencil, Trash2, X, AlertTriangle, Clock } from "lucide-react";

type Status = "overdue" | "active" | "completed";

function getStatus(r: Reminder, today: string): Status {
  if (r.completed) return "completed";
  if (r.dueDate < today) return "overdue";
  return "active";
}

const NotificationsPage: React.FC = () => {
  const { reminders, addReminder, toggleComplete, deleteReminder } = useReminders();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Reminder | null>(null);
  const today = new Date().toISOString().slice(0, 10);

  const [form, setForm] = useState({
    title: "",
    type: "other" as Reminder["type"],
    dueDate: today,
    amount: "",
    recurring: false,
  });

  const sorted = [...reminders].sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  // "Ən aktual": vaxtı keçmiş + ən yaxın aktiv olanlar (5 ən vacib)
  const overdue = sorted.filter(r => getStatus(r, today) === "overdue");
  const active = sorted.filter(r => getStatus(r, today) === "active");
  const completed = sorted.filter(r => r.completed);
  const topActual = [...overdue, ...active].slice(0, 6);

  const openAdd = () => {
    setEditing(null);
    setForm({ title: "", type: "other", dueDate: today, amount: "", recurring: false });
    setShowModal(true);
  };

  const openEdit = (r: Reminder) => {
    setEditing(r);
    setForm({ title: r.title, type: r.type, dueDate: r.dueDate, amount: r.amount.toString(), recurring: r.recurring });
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      title: form.title,
      type: form.type,
      dueDate: form.dueDate,
      amount: parseFloat(form.amount) || 0,
      recurring: form.recurring,
      completed: editing?.completed ?? false,
    };
    if (editing) {
      deleteReminder(editing.id);
    }
    addReminder(data);
    setShowModal(false);
  };

  const renderRow = (r: Reminder) => {
    const status = getStatus(r, today);
    const ringClass =
      status === "overdue" ? "border-l-4 border-destructive bg-destructive/5"
      : status === "active" ? "border-l-4 border-warning-yellow bg-warning-yellow/5"
      : "opacity-60";

    return (
      <div key={r.id} className={`px-5 py-4 flex items-center justify-between gap-3 ${ringClass}`}>
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => toggleComplete(r.id)}
            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all shrink-0 ${
              r.completed ? "bg-success border-success" : "border-border hover:border-secondary"
            }`}
          >
            {r.completed && <CheckCircle2 className="w-3 h-3 text-success-foreground" />}
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className={`text-sm font-medium ${r.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>{r.title}</p>
              {status === "overdue" && (
                <span className="inline-flex items-center gap-0.5 text-[10px] bg-destructive/10 text-destructive px-1.5 py-0.5 rounded-full font-bold">
                  <AlertTriangle className="w-2.5 h-2.5" />Vaxtı keçib
                </span>
              )}
              {status === "active" && (
                <span className="inline-flex items-center gap-0.5 text-[10px] bg-warning-yellow/20 text-warning-yellow-foreground px-1.5 py-0.5 rounded-full font-bold">
                  <Clock className="w-2.5 h-2.5" />Qüvvədə
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <Calendar className="w-3 h-3 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">{r.dueDate} · ₼{r.amount} {r.recurring && "· Təkrar"}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={() => openEdit(r)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          <button onClick={() => deleteReminder(r.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors">
            <Trash2 className="w-3.5 h-3.5 text-destructive" />
          </button>
          {r.type === "tax" && !r.completed && (
            <a href="https://taxes.gov.az" target="_blank" rel="noopener noreferrer"
              className="ml-1 text-xs gradient-accent px-2.5 py-1 rounded-lg font-medium text-primary-foreground hover:opacity-90">
              Ödə
            </a>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between opacity-0 animate-fade-up">
        <h1 className="text-xl font-bold text-foreground" style={{ lineHeight: "1.2" }}>Tapşırıqlar</h1>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.97]">
          <Plus className="w-4 h-4" />Əlavə et
        </button>
      </div>

      {/* Ən aktual / Bu günün vacibləri */}
      <div className="bg-card rounded-2xl card-shadow overflow-hidden opacity-0 animate-fade-up" style={{ animationDelay: "80ms" }}>
        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-secondary" />
          <h2 className="font-semibold text-foreground text-sm">Ən aktual tapşırıqlar</h2>
          <span className="ml-auto text-xs bg-secondary/10 text-secondary px-2 py-0.5 rounded-full font-medium">{topActual.length}</span>
        </div>
        <div className="divide-y divide-border">
          {topActual.length === 0 && (
            <div className="p-8 text-center text-muted-foreground text-sm">Aktiv tapşırıq yoxdur</div>
          )}
          {topActual.map(renderRow)}
        </div>
      </div>

      {/* Tamamlanmış */}
      {completed.length > 0 && (
        <div className="bg-card rounded-2xl card-shadow overflow-hidden opacity-0 animate-fade-up" style={{ animationDelay: "160ms" }}>
          <div className="px-5 py-4 border-b border-border flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-success" />
            <h2 className="font-semibold text-foreground text-sm">Tamamlanmış</h2>
          </div>
          <div className="divide-y divide-border">
            {completed.map(renderRow)}
          </div>
        </div>
      )}

      {/* Add/Edit modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-foreground/40 p-0 md:p-4" onClick={() => setShowModal(false)}>
          <div className="bg-card rounded-t-3xl md:rounded-2xl card-shadow w-full max-w-md p-6 animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">{editing ? "Tapşırığı düzənlə" : "Yeni tapşırıq"}</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-muted"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-3">
              <input required placeholder="Başlıq" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40" />
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as Reminder["type"] }))}
                className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40">
                <option value="tax">Vergi</option>
                <option value="rent">İcarə</option>
                <option value="other">Digər</option>
              </select>
              <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40" />
              <input type="number" placeholder="Məbləğ (₼)" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl bg-muted/50 border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-secondary/40" />
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input type="checkbox" checked={form.recurring} onChange={e => setForm(f => ({ ...f, recurring: e.target.checked }))} />
                Təkrarlanan
              </label>
              <button type="submit" className="w-full py-2.5 rounded-xl gradient-primary text-sm font-semibold text-primary-foreground hover:opacity-90 transition-all">
                {editing ? "Yenilə" : "Əlavə et"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
