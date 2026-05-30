import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, Plus, Pencil, Trash2, X, Save, Sprout } from "lucide-react";

interface Stat { id: string; crop_name: string; area_hectares: number; crops_count: number; notes: string; created_at: string; }
const empty = { crop_name: "", area_hectares: 0, crops_count: 0, notes: "" };

export function AinDeflaPanel() {
  const [rows, setRows] = useState<Stat[]>([]);
  const [editing, setEditing] = useState<Stat | null>(null);
  const [form, setForm] = useState(empty);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("ain_defla_stats").select("*").order("area_hectares", { ascending: false });
    setRows((data as any) ?? []);
  };
  useEffect(() => { load(); }, []);

  const totalArea = rows.reduce((s, r) => s + Number(r.area_hectares || 0), 0);
  const totalCrops = rows.reduce((s, r) => s + Number(r.crops_count || 0), 0);

  const openNew = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (s: Stat) => { setEditing(s); setForm({ crop_name: s.crop_name, area_hectares: Number(s.area_hectares), crops_count: s.crops_count, notes: s.notes }); setOpen(true); };

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    try {
      const payload = { ...form, area_hectares: Number(form.area_hectares), crops_count: Number(form.crops_count) };
      if (editing) {
        const { error } = await supabase.from("ain_defla_stats").update({ ...payload, updated_at: new Date().toISOString() }).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("ain_defla_stats").insert(payload);
        if (error) throw error;
      }
      setOpen(false); setForm(empty); setEditing(null); await load();
    } catch (e: any) { alert(e.message); } finally { setBusy(false); }
  };
  const remove = async (id: string) => { if (!confirm("حذف هذا السجل؟")) return; await supabase.from("ain_defla_stats").delete().eq("id", id); await load(); };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-black"><BarChart3 className="h-5 w-5 text-primary" /> إحصائيات عين الدفلى</h2>
          <p className="mt-1 text-sm text-muted-foreground">إدارة بيانات المحاصيل والمساحات لولاية عين الدفلى.</p>
        </div>
        <button onClick={openNew} className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" /> إضافة محصول
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="إجمالي المساحة" value={`${totalArea.toLocaleString("ar-DZ")} هكتار`} />
        <StatCard label="عدد المحاصيل" value={`${totalCrops.toLocaleString("ar-DZ")}`} />
        <StatCard label="أنواع المحاصيل" value={`${rows.length}`} />
      </div>

      <div className="overflow-hidden rounded-xl border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-right">
              <tr>
                <th className="p-3 font-bold">نوع المحصول</th>
                <th className="p-3 font-bold">المساحة (هكتار)</th>
                <th className="p-3 font-bold">عدد المحاصيل</th>
                <th className="p-3 font-bold">ملاحظات</th>
                <th className="p-3 font-bold w-28">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((s) => (
                <tr key={s.id} className="hover:bg-muted/30">
                  <td className="p-3 font-semibold"><span className="inline-flex items-center gap-1.5"><Sprout className="h-4 w-4 text-success" />{s.crop_name}</span></td>
                  <td className="p-3 font-mono">{Number(s.area_hectares).toLocaleString("ar-DZ")}</td>
                  <td className="p-3 font-mono">{s.crops_count}</td>
                  <td className="p-3 text-muted-foreground max-w-xs">{s.notes || "—"}</td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(s)} className="rounded-md p-2 hover:bg-accent"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => remove(s.id)} className="rounded-md p-2 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">لا توجد بيانات بعد.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setOpen(false)}>
          <form onSubmit={save} onClick={(e) => e.stopPropagation()} className="w-full max-w-2xl space-y-4 rounded-2xl bg-card p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black">{editing ? "تعديل السجل" : "إضافة محصول جديد"}</h3>
              <button type="button" onClick={() => setOpen(false)} className="rounded-md p-1.5 hover:bg-accent"><X className="h-4 w-4" /></button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="نوع المحصول"><input required value={form.crop_name} onChange={(e) => setForm({ ...form, crop_name: e.target.value })} placeholder="قمح، طماطم، زيتون…" className="w-full rounded-lg border bg-background px-3 py-2.5 focus:border-primary focus:outline-none" /></Field>
              <Field label="المساحة (هكتار)"><input required type="number" step="0.01" min="0" value={form.area_hectares} onChange={(e) => setForm({ ...form, area_hectares: Number(e.target.value) })} className="w-full rounded-lg border bg-background px-3 py-2.5 focus:border-primary focus:outline-none" /></Field>
              <Field label="عدد المحاصيل"><input required type="number" min="0" value={form.crops_count} onChange={(e) => setForm({ ...form, crops_count: Number(e.target.value) })} className="w-full rounded-lg border bg-background px-3 py-2.5 focus:border-primary focus:outline-none" /></Field>
              <div className="sm:col-span-2"><Field label="ملاحظات"><textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full rounded-lg border bg-background px-3 py-2.5 focus:border-primary focus:outline-none" /></Field></div>
            </div>
            <button disabled={busy} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
              <Save className="h-4 w-4" /> {busy ? "جارٍ الحفظ…" : "حفظ"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border bg-muted/30 p-4"><p className="text-xs font-semibold text-muted-foreground">{label}</p><p className="mt-1 text-xl font-black text-primary">{value}</p></div>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-sm font-semibold">{label}</span>{children}</label>;
}
