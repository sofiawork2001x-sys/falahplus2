import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/auth";
import { uploadMany } from "@/lib/storage";
import { FIN_KIND_LABEL, type FinancialKind, type FinancialRequest } from "@/lib/types";
import { Plus, Upload, CheckCircle2, XCircle, Clock } from "lucide-react";

export const Route = createFileRoute("/dashboard/financial")({ component: Financial });

function Financial() {
  const user = useSession();
  const [items, setItems] = useState<FinancialRequest[]>([]);
  const [composing, setComposing] = useState(false);
  const [kind, setKind] = useState<FinancialKind>("feasibility");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [details, setDetails] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);

  const role = user?.primaryRole;
  const isFarmer = role === "farmer";
  const isReviewer = role === "finance_expert" || role === "admin";

  const load = async () => {
    const { data } = await supabase.from("financial_requests").select("*").order("created_at", { ascending: false });
    setItems((data as any) ?? []);
  };

  useEffect(() => {
    if (!user) return;
    load();
    const ch = supabase.channel("fin").on("postgres_changes", { event: "*", schema: "public", table: "financial_requests" }, load).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user?.id]);

  if (!user) return null;
  if (!isFarmer && !isReviewer) return <p className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">هذا القسم مخصص للفلاحين والخبير المالي.</p>;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const urls = files.length ? await uploadMany(user.id, files, "financial") : [];
      const { error } = await supabase.from("financial_requests").insert({
        farmer_id: user.id, kind, title, details, amount: amount || null, files: urls,
      });
      if (error) throw error;
      setTitle(""); setDetails(""); setAmount(""); setFiles([]); setComposing(false);
      await load();
    } catch (e: any) { alert(e.message); }
    finally { setBusy(false); }
  };

  const decide = async (id: string, status: "approved" | "rejected") => {
    const note = prompt("ملاحظة الخبير المالي (اختياري):") ?? "";
    await supabase.from("financial_requests").update({ status, reviewer_id: user.id, reviewer_note: note || null }).eq("id", id);
    await load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black">الجناح المالي والدعم</h1>
          <p className="mt-1 text-sm text-muted-foreground">{isFarmer ? "اطلب دراسة جدوى أو ارفع ملف دعم مالي." : "راجع طلبات الفلاحين واتخذ القرار."}</p>
        </div>
        {isFarmer && (
          <button onClick={()=>setComposing(v=>!v)} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4"/> طلب جديد
          </button>
        )}
      </div>

      {composing && isFarmer && (
        <form onSubmit={submit} className="grid gap-3 rounded-2xl border bg-card p-5 sm:grid-cols-2">
          <select value={kind} onChange={(e)=>setKind(e.target.value as FinancialKind)} className="rounded-lg border bg-background px-3 py-2 text-sm">
            <option value="feasibility">{FIN_KIND_LABEL.feasibility}</option>
            <option value="support_file">{FIN_KIND_LABEL.support_file}</option>
          </select>
          <input value={amount} onChange={(e)=>setAmount(e.target.value)} placeholder="المبلغ المطلوب (اختياري)" className="rounded-lg border bg-background px-3 py-2 text-sm"/>
          <input value={title} onChange={(e)=>setTitle(e.target.value)} required placeholder="عنوان الطلب" className="sm:col-span-2 rounded-lg border bg-background px-3 py-2 text-sm"/>
          <textarea value={details} onChange={(e)=>setDetails(e.target.value)} rows={4} placeholder="تفاصيل المشروع أو الملف" className="sm:col-span-2 rounded-lg border bg-background px-3 py-2 text-sm"/>
          <label className="sm:col-span-2 flex cursor-pointer items-center gap-2 rounded-lg border border-dashed px-3 py-2.5 text-sm hover:bg-accent/30">
            <Upload className="h-4 w-4 text-primary"/> رفع ملفات ({files.length})
            <input type="file" multiple onChange={(e)=>setFiles(Array.from(e.target.files??[]))} className="hidden"/>
          </label>
          <button disabled={busy} className="sm:col-span-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-60">{busy?"جارٍ الإرسال…":"إرسال الطلب"}</button>
        </form>
      )}

      <div className="grid gap-3">
        {items.map(r => (
          <div key={r.id} className="rounded-2xl border bg-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold">{r.title}</h3>
                  <StatusBadge status={r.status}/>
                  <span className="text-xs text-muted-foreground">{FIN_KIND_LABEL[r.kind]}</span>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{r.details}</p>
                {r.amount && <p className="mt-2 text-sm font-bold text-primary">المبلغ: {r.amount}</p>}
                {r.files.length>0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {r.files.map((u,i)=> <a key={i} href={u} target="_blank" className="rounded-md border bg-background px-2 py-1 text-xs hover:bg-accent">ملف {i+1}</a>)}
                  </div>
                )}
                {r.reviewer_note && <p className="mt-3 rounded-md border-r-4 border-primary bg-primary/5 p-2 text-sm">📝 {r.reviewer_note}</p>}
              </div>
              {isReviewer && r.status === "pending" && (
                <div className="flex gap-2">
                  <button onClick={()=>decide(r.id,"approved")} className="rounded-lg bg-success px-3 py-1.5 text-xs font-bold text-success-foreground">قبول</button>
                  <button onClick={()=>decide(r.id,"rejected")} className="rounded-lg bg-destructive px-3 py-1.5 text-xs font-bold text-destructive-foreground">رفض</button>
                </div>
              )}
            </div>
          </div>
        ))}
        {items.length===0 && <p className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">لا توجد طلبات بعد.</p>}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: "pending"|"approved"|"rejected" }) {
  if (status==="pending") return <span className="inline-flex items-center gap-1 rounded-full bg-warning/15 px-2 py-0.5 text-xs font-semibold text-warning-foreground"><Clock className="h-3 w-3"/> قيد المراجعة</span>;
  if (status==="approved") return <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-xs font-semibold text-success"><CheckCircle2 className="h-3 w-3"/> مقبول</span>;
  return <span className="inline-flex items-center gap-1 rounded-full bg-destructive/15 px-2 py-0.5 text-xs font-semibold text-destructive"><XCircle className="h-3 w-3"/> مرفوض</span>;
}
