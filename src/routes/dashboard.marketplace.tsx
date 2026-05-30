import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { LandRent, Equipment, Wilaya } from "@/lib/types";
import { MapPin, Tractor, Sprout } from "lucide-react";

export const Route = createFileRoute("/dashboard/marketplace")({ component: Marketplace });

function Marketplace() {
  const [filter, setFilter] = useState<"all" | "land" | "machine">("all");
  const [wilayaCode, setWilayaCode] = useState<number | "all">("all");
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [lands, setLands] = useState<LandRent[]>([]);
  const [equips, setEquips] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const [w, l, e] = await Promise.all([
      supabase.from("wilayas").select("*").order("code"),
      supabase.from("lands_rent").select("*").eq("status","active").order("created_at",{ascending:false}),
      supabase.from("equipment").select("*").eq("status","active").order("created_at",{ascending:false}),
    ]);
    setWilayas((w.data as any) ?? []);
    setLands((l.data as any) ?? []);
    setEquips((e.data as any) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const ch = supabase.channel("marketplace")
      .on("postgres_changes", { event: "*", schema: "public", table: "lands_rent" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "equipment" }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const wMatch = (c: number | null) => wilayaCode === "all" || c === wilayaCode;
  const showLands = filter !== "machine";
  const showMachines = filter !== "land";
  const filteredLands = showLands ? lands.filter(l => wMatch(l.wilaya_code)) : [];
  const filteredEquips = showMachines ? equips.filter(e => wMatch(e.wilaya_code)) : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black">سوق العروض</h1>
        <p className="mt-1 text-muted-foreground">كل الأراضي والمعدات المعروضة من الفلاحين والشركات.</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {([{k:"all",l:"الكل"},{k:"land",l:"أراضي"},{k:"machine",l:"آلات ومعدات"}] as const).map(b => (
          <button key={b.k} onClick={()=>setFilter(b.k)} className={`rounded-full px-4 py-1.5 text-sm font-semibold ${filter===b.k?"bg-primary text-primary-foreground":"bg-card border hover:bg-accent/30"}`}>{b.l}</button>
        ))}
        <select value={wilayaCode === "all" ? "all" : String(wilayaCode)} onChange={(e)=>setWilayaCode(e.target.value==="all"?"all":Number(e.target.value))}
          className="mr-auto rounded-lg border bg-card px-3 py-1.5 text-sm">
          <option value="all">كل الولايات</option>
          {wilayas.map(w => <option key={w.code} value={w.code}>{w.code} — {w.name_ar}</option>)}
        </select>
      </div>

      {loading ? <p className="text-muted-foreground">جارٍ التحميل…</p> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredLands.map((l) => (
            <Card key={l.id} title={l.title} desc={l.description} price={l.price} wilaya={wilayaName(wilayas, l.wilaya_code)} type="land" image={l.images[0]} sub={`${l.area_hectares} هكتار`} />
          ))}
          {filteredEquips.map((e) => (
            <Card key={e.id} title={e.name} desc={e.description} price={e.price} wilaya={wilayaName(wilayas, e.wilaya_code)} type="machine" image={e.images[0]} sub={e.category ?? "آلة"} />
          ))}
          {filteredLands.length === 0 && filteredEquips.length === 0 && (
            <p className="col-span-full rounded-xl border border-dashed p-8 text-center text-muted-foreground">لا توجد عروض مطابقة.</p>
          )}
        </div>
      )}
    </div>
  );
}

function wilayaName(wilayas: Wilaya[], code: number | null) {
  if (!code) return "غير محدد";
  return wilayas.find(w => w.code === code)?.name_ar ?? "غير محدد";
}

function Card({ title, desc, price, wilaya, type, image, sub }: { title: string; desc: string; price: string; wilaya: string; type: "land"|"machine"; image?: string; sub: string }) {
  return (
    <article className="overflow-hidden rounded-2xl border bg-card shadow-sm transition hover:shadow-md">
      <div className="relative flex h-40 items-center justify-center overflow-hidden bg-gradient-to-bl from-primary/15 to-accent/20 text-primary">
        {image ? <img src={image} alt={title} className="h-full w-full object-cover" /> : (type === "land" ? <Sprout className="h-16 w-16" /> : <Tractor className="h-16 w-16" />)}
      </div>
      <div className="space-y-2 p-5">
        <span className="inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">{type === "land" ? "أرض للكراء" : "آلة للكراء"} · {sub}</span>
        <h3 className="text-base font-bold">{title}</h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">{desc}</p>
        <div className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3.5 w-3.5" /> {wilaya}</div>
        <div className="border-t pt-3"><span className="text-sm font-black text-primary">{price}</span></div>
      </div>
    </article>
  );
}
