import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Bug, Plus, Pencil, Trash2, X, Save } from "lucide-react";

interface Disease { id: string; name: string; symptoms: string; treatment: string; season: string; created_at: string; }
const empty = { name: "", symptoms: "", treatment: "", season: "" };

export function CropDiseasesPanel() {
  const [rows, setRows] = useState<Disease[]>([]);
  const [editing, setEditing] = useState<Disease | null>(null);
  const [form, setForm] = useState(empty);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("crop_diseases").select("*").order("created_at", { ascending: false });
    setRows((data as any) ?? []);
  };
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (d: Disease) => { setEditing(d); setForm({ name: d.name, symptoms: d.symptoms, treatment: d.treatment, season: d.season }); setOpen(true); };

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    try {
      if (editing) {
        const { error } = await supabase.from("crop_diseases").update({ ...form, updated_at: new Date().toISOString() }).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("crop_diseases").insert(form);
        if (error) throw error;
      }
      setOpen(false); setForm(empty); setEditing(null); await load();
    } catch (e: any) { alert(e.message); } finally { setBusy(false); }
  };
  const remove = async (id: string) => { if (!confirm("هل تريد حذف هذا المرض؟")) return; await supabase.from("crop_diseases").delete().eq("id", id); await load(); };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-black"><Bug className="h-5 w-5 text-primary" /> أمراض النباتات والمحاصيل</h2>
          <p className="mt-1 text-sm text-muted-foreground">إدارة قاعدة بيانات الأمراض والأعراض والعلاج.</p>
        </div>
        <button onClick={openNew} className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" /> إضافة مرض
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-right">
              <tr>
                <th className="p-3 font-bold">اسم المرض</th>
                <th className="p-3 font-bold">الأعراض</th>
                <th className="p-3 font-bold">طريقة العلاج</th>
                <th className="p-3 font-bold">الموسم</th>
                <th className="p-3 font-bold w-28">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((d) => (
                <tr key={d.id} className="hover:bg-muted/30">
                  <td className="p-3 font-semibold">{d.name}</td>
                  <td className="p-3 text-muted-foreground max-w-xs">{d.symptoms}</td>
                  <td className="p-3 text-muted-foreground max-w-xs">{d.treatment}</td>
                  <td className="p-3"><span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-bold text-primary">{d.season || "—"}</span></td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(d)} className="rounded-md p-2 hover:bg-accent" title="تعديل"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => remove(d.id)} className="rounded-md p-2 text-destructive hover:bg-destructive/10" title="حذف"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">لا توجد أمراض مسجلة بعد.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setOpen(false)}>
          <form onSubmit={save} onClick={(e) => e.stopPropagation()} className="w-full max-w-2xl space-y-4 rounded-2xl bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black">{editing ? "تعديل المرض" : "إضافة مرض جديد"}</h3>
              <button type="button" onClick={() => setOpen(false)} className="rounded-md p-1.5 hover:bg-accent"><X className="h-4 w-4" /></button>
            </div>
            <Field label="اسم المرض"><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border bg-background px-3 py-2.5 focus:border-primary focus:outline-none" /></Field>
            <Field label="الأعراض"><textarea required rows={3} value={form.symptoms} onChange={(e) => setForm({ ...form, symptoms: e.target.value })} className="w-full rounded-lg border bg-background px-3 py-2.5 focus:border-primary focus:outline-none" /></Field>
            <Field label="طريقة العلاج"><textarea required rows={3} value={form.treatment} onChange={(e) => setForm({ ...form, treatment: e.target.value })} className="w-full rounded-lg border bg-background px-3 py-2.5 focus:border-primary focus:outline-none" /></Field>
            <Field label="الوقت / الموسم المناسب"><input value={form.season} onChange={(e) => setForm({ ...form, season: e.target.value })} placeholder="مثال: الربيع، شهر مارس…" className="w-full rounded-lg border bg-background px-3 py-2.5 focus:border-primary focus:outline-none" /></Field>
            <button disabled={busy} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
              <Save className="h-4 w-4" /> {busy ? "جارٍ الحفظ…" : "حفظ"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-sm font-semibold">{label}</span>{children}</label>;
}
