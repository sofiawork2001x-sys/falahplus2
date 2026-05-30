import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/auth";
import { uploadMany } from "@/lib/storage";
import type { LandRent, Equipment, Wilaya } from "@/lib/types";
import { Trash2, Plus, Upload } from "lucide-react";

export const Route = createFileRoute("/dashboard/listings")({ component: MyListings });

function MyListings() {
  const user = useSession();
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [items, setItems] = useState<(LandRent | Equipment)[]>([]);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [wilayaCode, setWilayaCode] = useState<number | "">("");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [category, setCategory] = useState("");
  const [desc, setDesc] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const role = user?.primaryRole;
  const isLand = role === "farmer";
  const table = isLand ? "lands_rent" : "equipment";
  const ownerCol = isLand ? "farmer_id" : "company_id";

  const load = async () => {
    if (!user) return;
    const [w, q] = await Promise.all([
      supabase.from("wilayas").select("*").order("code"),
      (supabase.from(table) as any).select("*").eq(ownerCol, user.id).order("created_at",{ascending:false}),
    ]);
    setWilayas((w.data as any) ?? []);
    setItems((q.data as any) ?? []);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [user?.id, table]);

  if (!user) return null;
  if (role !== "farmer" && role !== "company") {
    return <p className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">هذا القسم مخصص للفلاحين والشركات فقط.</p>;
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(""); setBusy(true);
    try {
      const imageUrls = files.length ? await uploadMany(user.id, files, "listings") : [];
      const payload: any = {
        title: isLand ? title : undefined,
        name: isLand ? undefined : title,
        description: desc,
        wilaya_code: wilayaCode || null,
        price,
        images: imageUrls,
        [ownerCol]: user.id,
      };
      if (isLand) { payload.area_hectares = Number(area) || 0; payload.city = city || null; }
      else { payload.category = category || null; }
      const { error } = await supabase.from(table).insert(payload);
      if (error) throw error;
      setTitle(""); setPrice(""); setCity(""); setArea(""); setCategory(""); setDesc(""); setFiles([]); setWilayaCode("");
      await load();
    } catch (e: any) { setErr(e.message || "حدث خطأ"); }
    finally { setBusy(false); }
  };

  const remove = async (id: string) => {
    if (!confirm("هل تريد حذف هذا العرض؟")) return;
    await supabase.from(table).delete().eq("id", id);
    await load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black">عروضي</h1>
        <p className="mt-1 text-muted-foreground">{isLand ? "أضف أرضاً للكراء وستظهر فوراً في سوق العروض لكل المستخدمين." : "أضف آلة أو معداً للكراء وستظهر فوراً في سوق العروض."}</p>
      </div>

      <form onSubmit={submit} className="grid gap-3 rounded-2xl border bg-card p-5 sm:grid-cols-2">
        <input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder={isLand?"عنوان الأرض":"اسم الآلة"} required className="rounded-lg border bg-background px-3 py-2 text-sm"/>
        <input value={price} onChange={(e)=>setPrice(e.target.value)} placeholder="السعر مثلاً: 100,000 دج / سنة" required className="rounded-lg border bg-background px-3 py-2 text-sm"/>
        <select value={wilayaCode === "" ? "" : String(wilayaCode)} onChange={(e)=>setWilayaCode(e.target.value?Number(e.target.value):"")} className="rounded-lg border bg-background px-3 py-2 text-sm">
          <option value="">اختر الولاية</option>
          {wilayas.map(w=> <option key={w.code} value={w.code}>{w.code} — {w.name_ar}</option>)}
        </select>
        {isLand ? (
          <>
            <input value={area} onChange={(e)=>setArea(e.target.value)} type="number" step="0.1" placeholder="المساحة (هكتار)" className="rounded-lg border bg-background px-3 py-2 text-sm"/>
            <input value={city} onChange={(e)=>setCity(e.target.value)} placeholder="البلدية / الحي" className="sm:col-span-2 rounded-lg border bg-background px-3 py-2 text-sm"/>
          </>
        ) : (
          <input value={category} onChange={(e)=>setCategory(e.target.value)} placeholder="النوع (جرار، حصادة، محراث...)" className="sm:col-span-2 rounded-lg border bg-background px-3 py-2 text-sm"/>
        )}
        <textarea value={desc} onChange={(e)=>setDesc(e.target.value)} placeholder="وصف مفصل" rows={3} className="sm:col-span-2 rounded-lg border bg-background px-3 py-2 text-sm"/>
        <label className="sm:col-span-2 flex cursor-pointer items-center gap-2 rounded-lg border border-dashed bg-background/50 px-3 py-3 text-sm hover:bg-accent/30">
          <Upload className="h-4 w-4 text-primary"/>
          <span>إضافة صور ({files.length})</span>
          <input type="file" multiple accept="image/*" onChange={(e)=>setFiles(Array.from(e.target.files ?? []))} className="hidden"/>
        </label>
        {err && <div className="sm:col-span-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{err}</div>}
        <button disabled={busy} type="submit" className="sm:col-span-2 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
          <Plus className="h-4 w-4"/> {busy ? "جارٍ النشر…" : "نشر العرض"}
        </button>
      </form>

      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((l: any) => (
          <div key={l.id} className="rounded-2xl border bg-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h3 className="font-bold">{isLand ? l.title : l.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{wilayas.find(w=>w.code===l.wilaya_code)?.name_ar ?? "—"}{isLand && l.city ? ` · ${l.city}` : ""}</p>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{l.description}</p>
                <p className="mt-3 text-sm font-bold text-primary">{l.price}</p>
                {l.images?.length>0 && <div className="mt-3 flex gap-1.5">{l.images.slice(0,3).map((u:string,i:number)=><img key={i} src={u} alt="" className="h-14 w-14 rounded object-cover"/>)}</div>}
              </div>
              <button onClick={()=>remove(l.id)} className="rounded-md p-2 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4"/></button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="col-span-full rounded-xl border border-dashed p-8 text-center text-muted-foreground">لم تنشر أي عرض بعد.</p>}
      </div>
    </div>
  );
}
