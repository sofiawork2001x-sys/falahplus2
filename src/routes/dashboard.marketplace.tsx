import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { LandRent, Equipment, Wilaya } from "@/lib/types";
import { MapPin, Tractor, Sprout, Loader2 } from "lucide-react";

export const Route = createFileRoute("/dashboard/marketplace")({ component: Marketplace });

function Marketplace() {
  const [filter, setFilter] = useState<"all" | "land" | "machine">("all");
  const [wilayaCode, setWilayaCode] = useState<number | "all">("all");
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [lands, setLands] = useState<LandRent[]>([]);
  const [equips, setEquips] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [w, l, e] = await Promise.all([
        supabase.from("wilayas").select("*").order("code"),
        supabase.from("lands_rent").select("*").eq("status", "active").order("created_at", { ascending: false }),
        supabase.from("equipment").select("*").eq("status", "active").order("created_at", { ascending: false }),
      ]);
      setWilayas((w.data as any) ?? []);
      setLands((l.data as any) ?? []);
      setEquips((e.data as any) ?? []);
    } catch (err) {
      console.error("Error loading marketplace data:", err);
    } finally {
      setLoading(false);
    }
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
    <div className="space-y-6" dir="rtl">
      {/* الهيدر العلوي الأنيق */}
      <div className="bg-card p-6 rounded-2xl border shadow-sm">
        <h1 className="text-2xl font-black text-foreground">سوق العروض الفلاحية</h1>
        <p className="mt-1 text-sm text-muted-foreground">اكتشف واستأجر أفضل الأراضي والمعدات الزراعية المعروضة من الفلاحين والشركات مباشرة.</p>
      </div>

      {/* الفلاتر والتحكم */}
      <div className="flex flex-wrap items-center gap-2 bg-muted/30 p-2 rounded-2xl border">
        <div className="flex items-center gap-1.5">
          {([
            { k: "all", l: "الكل" },
            { k: "land", l: "أراضي زراعية" },
            { k: "machine", l: "آلات ومعدات" }
          ] as const).map(b => (
            <button 
              key={b.k} 
              onClick={() => setFilter(b.k)} 
              className={`rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                filter === b.k 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "bg-card border hover:bg-muted text-muted-foreground"
              }`}
            >
              {b.l}
            </button>
          ))}
        </div>
        
        <select 
          value={wilayaCode === "all" ? "all" : String(wilayaCode)} 
          onChange={(e) => setWilayaCode(e.target.value === "all" ? "all" : Number(e.target.value))}
          className="mr-auto rounded-xl border bg-card px-3 py-2 text-xs font-bold focus:outline-none focus:border-primary"
        >
          <option value="all">كل الولايات المنتجة</option>
          {wilayas.map(w => (
            <option key={w.code} value={w.code}>{w.code} — {w.name_ar}</option>
          ))}
        </select>
      </div>

      {/* عرض المحتوى أو التحميل */}
      {loading ? (
        <div className="flex h-48 flex-col items-center justify-center text-muted-foreground gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-xs font-medium">جاري تحديث العروض المتاحة...</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* عرض الأراضي */}
          {filteredLands.map((l) => (
            <Card 
              key={l.id} 
              id={l.id} 
              title={l.title} 
              desc={l.description} 
              price={String(l.price)} 
              wilaya={wilayaName(wilayas, l.wilaya_code)} 
              type="land" 
              image={l.images?.[0]} 
              sub={`${l.area_hectares} هكتار`} 
            />
          ))}
          
          {/* عرض المعدات */}
          {filteredEquips.map((e) => (
            <Card 
              key={e.id} 
              id={e.id} 
              title={e.name} 
              desc={e.description} 
              price={String(e.price)} 
              wilaya={wilayaName(wilayas, e.wilaya_code)} 
              type="machine" 
              image={e.images?.[0]} 
              sub={e.category ?? "آلة زراعية"} 
            />
          ))}
          
          {/* حالة عدم وجود بيانات متطابقة */}
          {filteredLands.length === 0 && filteredEquips.length === 0 && (
            <div className="col-span-full rounded-2xl border border-dashed bg-card p-12 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
              <span className="text-3xl">🌾</span>
              <p className="font-bold text-sm">لا توجد عروض مطابقة للفلاتر المحددة حالياً.</p>
            </div>
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

function Card({ id, title, desc, price, wilaya, type, image, sub }: { id: string, title: string; desc: string; price: string; wilaya: string; type: "land" | "machine"; image?: string; sub: string }) {
  return (
    <article className="overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 duration-200 flex flex-col h-full">
      {/* الصورة أو الأيقونة الافتراضية */}
      <div className="relative flex h-44 items-center justify-center overflow-hidden bg-gradient-to-bl from-primary/10 to-accent/10 text-primary border-b">
        {image ? (
          <img src={image} alt={title} className="h-full w-full object-cover" />
        ) : (
          type === "land" ? <Sprout className="h-12 w-12 text-primary/70" /> : <Tractor className="h-12 w-12 text-primary/70" />
        )}
      </div>

      {/* تفاصيل الكرت */}
      <div className="p-5 flex flex-col flex-1 justify-between space-y-3">
        <div className="space-y-2">
          <span className={`inline-block rounded-lg px-2.5 py-0.5 text-xs font-bold ${
            type === "land" ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"
          }`}>
            {type === "land" ? "أرض للكراء" : "معدات للكراء"} · {sub}
          </span>
          <h3 className="text-base font-bold text-foreground truncate">{title}</h3>
          <p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed">{desc}</p>
        </div>

        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 text-primary" /> 
            <span>{wilaya}</span>
          </div>
          
          <div className="flex items-center justify-between border-t pt-3">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground font-medium">سعر الكراء</span>
              <span className="text-sm font-black text-primary">{price} دج</span>
            </div>
            <Link 
              to="/dashboard/payment" 
              className="rounded-xl bg-primary px-4 py-2 text-xs font-black text-primary-foreground hover:bg-primary/90 shadow-sm transition"
            >
              طلب كراء سريع
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}