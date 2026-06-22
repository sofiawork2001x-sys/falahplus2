import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/auth";
import { 
  AlertTriangle, CloudRain, Info, Send, Power, Trash2, 
  CloudLightning, Bug, BarChart3, Plus, ShieldCheck, DollarSign, Wallet 
} from "lucide-react";

// إضافة الـ Tab المالي الجديد لـ Admin
type Tab = "alerts" | "diseases" | "ain-defla" | "financial";

export const Route = createFileRoute("/dashboard/admin")({ component: AdminPanel });

interface Alert { id: string; message: string; severity: string; active: boolean; created_at: string; }
interface Disease { id: string; name: string; symptoms: string; treatment: string; season: string; }
interface Statistic { id: string; cropType: string; area: string; production: string; status: string; }

// هيكل بيانات الأرباح الحقيقية القادمة من الفلاحين
interface AdminPayment {
  id: string;
  farmer_name: string;
  amount: number;
  service_type: string;
  status: string;
  created_at: string;
}

function AdminPanel() {
  const user = useSession();
  const navigate = useNavigate();
  
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState<"info"|"warning"|"danger">("warning");
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<Tab>("alerts");

  // قاعدة بيانات الأرباح والمدفوعات حية من Supabase
  const [paymentsLog, setPaymentsLog] = useState<AdminPayment[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);

  // قاعدة بيانات الأمراض
  const [diseases, setDiseases] = useState<Disease[]>([
    { id: "1", name: "اللفحة المتأخرة (Late Blight)", symptoms: "بقع مائية داكنة على الأوراق وتعفن الساق وجفاف الثمار", treatment: "رش مبيدات فطرية نحاسية وقائية وتنظيم سقي المحصول", season: "شتاء / ربيع ممطر" },
    { id: "2", name: "العفن الرمادي (Botrytis)", symptoms: "طبقة رمادية غبارية كثيفة على الأوراق والأزهار تؤدي لذبولها", treatment: "تهوية البيوت البلاستيكية والتخلص الفوري من الأجزاء المصابة", season: "ربيع / رطوبة عالية" }
  ]);
  const [showDiseaseForm, setShowDiseaseForm] = useState(false);
  const [diseaseName, setDiseaseName] = useState("");
  const [diseaseSymptoms, setDiseaseSymptoms] = useState("");
  const [diseaseTreatment, setDiseaseTreatment] = useState("");
  const [diseaseSeason, setDiseaseSeason] = useState("");

  // قاعدة بيانات عين الدفلى
  const [stats, setStats] = useState<Statistic[]>([
    { id: "1", cropType: "الحبوب (قمح صلب ولين، شعير)", area: "45,000 هكتار", production: "1.2 مليون قنطار", status: "في مرحلة الحصاد" },
    { id: "2", cropType: "البطاطا (المحصول الاستراتيجي لعين الدفلى)", area: "15,500 هكتار", production: "450,000 طن", status: "إنتاج وفير جاهز للقلع" }
  ]);
  const [showStatForm, setShowStatForm] = useState(false);
  const [statCrop, setStatCrop] = useState("");
  const [statArea, setStatArea] = useState("");
  const [statProduction, setStatProduction] = useState("");
  const [statStatus, setStatStatus] = useState("");

  useEffect(() => {
    if (user && user.primaryRole !== "admin") navigate({ to: "/dashboard" });
  }, [user, navigate]);

  // دالة جلب كافة تنبيهات الطقس والمدفوعات الحالية المصبوبة للـ Admin
  const load = async () => {
    // 1. جلب التنبيهات الجوية
    const { data: weatherData } = await supabase.from("weather_alerts").select("*").order("created_at", { ascending: false });
    setAlerts((weatherData as any) ?? []);

    // 2. جلب المداخيل والأموال الحقيقية المسجلة من الفلاحين
    const { data: paymentsData } = await supabase.from("payments").select("*").order("created_at", { ascending: false });
    if (paymentsData) {
      const logs = paymentsData as any as AdminPayment[];
      setPaymentsLog(logs);
      // حساب إجمالي الأموال داخل الخزينة تلقائياً
      const total = logs.reduce((acc, current) => acc + Number(current.amount), 0);
      setTotalRevenue(total);
    }
  };

  useEffect(() => {
    if (!user) return;
    load();
    const ch = supabase.channel("admin-updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "weather_alerts" }, load)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "payments" }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user?.id]);

  if (!user || user.primaryRole !== "admin") return null;

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setBusy(true);
    try {
      const { error } = await supabase.from("weather_alerts").insert({
        author_id: user.id, message: message.trim(), severity, active: true,
      });
      if (error) throw error;
      setMessage("");
    } catch (e: any) { alert(e.message); }
    finally { setBusy(false); }
  };

  const toggle = async (a: Alert) => {
    await supabase.from("weather_alerts").update({ active: !a.active }).eq("id", a.id);
  };
  const remove = async (id: string) => {
    if (!confirm("هل تريد حذف هذا التنبيه؟")) return;
    await supabase.from("weather_alerts").delete().eq("id", id);
  };

  const handleAddDisease = (e: React.FormEvent) => {
    e.preventDefault();
    if (!diseaseName || !diseaseSymptoms || !diseaseTreatment || !diseaseSeason) return;
    const newDisease: Disease = { id: Date.now().toString(), name: diseaseName, symptoms: diseaseSymptoms, treatment: diseaseTreatment, season: diseaseSeason };
    setDiseases([...diseases, newDisease]);
    setDiseaseName(""); setDiseaseSymptoms(""); setDiseaseTreatment(""); setDiseaseSeason("");
    setShowDiseaseForm(false);
  };

  const handleRemoveDisease = (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذا المرض؟")) setDiseases(diseases.filter(d => d.id !== id));
  };

  const handleAddStat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!statCrop || !statArea || !statProduction || !statStatus) return;
    const newStat: Statistic = { id: Date.now().toString(), cropType: statCrop, area: statArea.includes("هكتار") ? statArea : `${statArea} هكتار`, production: statProduction, status: statStatus };
    setStats([...stats, newStat]);
    setStatCrop(""); setStatArea(""); setStatProduction(""); setStatStatus("");
    setShowStatForm(false);
  };

  const handleRemoveStat = (id: string) => {
    if (confirm("هل أنت متأكد من حذف هذه الإحصائية؟")) setStats(stats.filter(s => s.id !== id));
  };

  const sevMeta: Record<string, { label: string; cls: string; icon: any }> = {
    info: { label: "إشعار", cls: "bg-primary/10 text-primary", icon: Info },
    warning: { label: "تحذير", cls: "bg-yellow-500/15 text-yellow-700", icon: CloudRain },
    danger: { label: "خطر", cls: "bg-destructive/15 text-destructive", icon: AlertTriangle },
  };

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: "alerts", label: "تنبيهات الطقس", icon: CloudLightning },
    { id: "diseases", label: "أمراض المحاصيل", icon: Bug },
    { id: "ain-defla", label: "إحصائيات عين الدفلى", icon: BarChart3 },
    { id: "financial", label: "الخزينة والمداخيل", icon: Wallet }, // تم الدمج بنجاح
  ];

  return (
    <div className="space-y-6" dir="rtl">
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-black">لوحة المسؤول الرئيسي ⚖️</h1>
        <p className="mt-1 text-sm text-muted-foreground">التحكم الشامل للمنصة: تسيير المداخيل المالية، تتبع استشارات الفلاحين، وقواعد البيانات الجغرافية.</p>
      </div>

      <div className="flex flex-wrap gap-2 rounded-2xl border bg-card p-2 shadow-sm">
        {tabs.map((t) => {
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition ${active ? "bg-emerald-600 text-white shadow" : "text-muted-foreground hover:bg-accent"}`}>
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          );
        })}
      </div>

      {tab === "alerts" && (
        <div className="space-y-6">
          <form onSubmit={send} className="space-y-4 rounded-2xl border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-black">إرسال تنبيه جوي جديد</h2>
            <div>
              <label className="mb-1.5 block text-sm font-semibold">درجة الخطورة</label>
              <div className="flex flex-wrap gap-2">
                {(["info","warning","danger"] as const).map((s) => {
                  const m = sevMeta[s];
                  return (
                    <button key={s} type="button" onClick={()=>setSeverity(s)}
                      className={`inline-flex items-center gap-2 rounded-lg border-2 px-4 py-2 text-sm font-bold transition ${severity===s ? "border-emerald-600 bg-emerald-50 text-emerald-800" : "border-transparent bg-muted hover:bg-accent"}`}>
                      <m.icon className="h-4 w-4"/> {m.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold">نص التنبيه</label>
              <textarea value={message} onChange={(e)=>setMessage(e.target.value)} required rows={3}
                placeholder="مثال: أمطار غنية متوقعة في ولايات الشمال خلال الـ 24 ساعة القادمة. يُنصح بحماية المحاصيل الحساسة."
                className="w-full rounded-lg border bg-background px-3 py-3 text-base focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"/>
            </div>
            <button disabled={busy} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60">
              <Send className="h-4 w-4"/> {busy ? "جارٍ الإرسال…" : "إرسال التنبيه الفوري"}
            </button>
          </form>

          <div className="rounded-2xl border bg-card shadow-sm">
            <div className="border-b p-5 font-bold">التنبيهات المرسلة ({alerts.length})</div>
            <ul className="divide-y">
              {alerts.map((a) => {
                const m = sevMeta[a.severity] ?? sevMeta.info;
                return (
                  <li key={a.id} className="flex items-start gap-3 p-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-bold ${m.cls}`}>
                      <m.icon className="h-3.5 w-3.5"/> {m.label}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm ${a.active ? "" : "text-muted-foreground line-through"}`}>{a.message}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString("ar-DZ")}</p>
                    </div>
                    <button onClick={()=>toggle(a)} title={a.active?"إيقاف":"تفعيل"} className={`rounded-md p-2 ${a.active?"text-emerald-600 hover:bg-accent":"text-muted-foreground hover:bg-accent"}`}>
                      <Power className="h-4 w-4"/>
                    </button>
                    <button onClick={()=>remove(a.id)} className="rounded-md p-2 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4"/></button>
                  </li>
                );
              })}
              {alerts.length===0 && <li className="p-6 text-center text-sm text-muted-foreground">لا توجد تنبيهات بعد.</li>}
            </ul>
          </div>
        </div>
      )}

      {tab === "diseases" && (
        <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800">🦠 قاعدة بيانات أمراض النباتات والمحاصيل</h2>
              <p className="text-xs text-muted-foreground mt-1">تعديل الأعراض والعلاجات المقترحة لحماية الفلاحين.</p>
            </div>
            <button onClick={() => setShowDiseaseForm(!showDiseaseForm)} className="inline-flex items-center gap-1 bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded-lg hover:bg-emerald-700">
              <Plus className="h-4 w-4" /> {showDiseaseForm ? "إغلاق" : "إضافة مرض جديد"}
            </button>
          </div>

          {showDiseaseForm && (
            <form onSubmit={handleAddDisease} className="bg-muted/40 p-4 rounded-xl border border-dashed space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input type="text" placeholder="اسم المرض" value={diseaseName} onChange={(e)=>setDiseaseName(e.target.value)} required className="p-2.5 border rounded-lg bg-background text-sm" />
                <input type="text" placeholder="الوقت / الموسم" value={diseaseSeason} onChange={(e)=>setDiseaseSeason(e.target.value)} required className="p-2.5 border rounded-lg bg-background text-sm" />
                <input type="text" placeholder="الأعراض الظاهرة بالتفصيل" value={diseaseSymptoms} onChange={(e)=>setDiseaseSymptoms(e.target.value)} required className="p-2.5 border rounded-lg bg-background text-sm md:col-span-2" />
                <input type="text" placeholder="طريقة العلاج والوقاية الموصى بها" value={diseaseTreatment} onChange={(e)=>setDiseaseTreatment(e.target.value)} required className="p-2.5 border rounded-lg bg-background text-sm md:col-span-2" />
              </div>
              <button type="submit" className="bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded-lg">حفظ السجل</button>
            </form>
          )}
          
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-emerald-50/50 text-emerald-800 border-b text-sm">
                  <th className="p-4 font-bold">اسم المرض</th>
                  <th className="p-4 font-bold">الأعراض</th>
                  <th className="p-4 font-bold">طريقة العلاج</th>
                  <th className="p-4 font-bold">الوقت / الموسم</th>
                  <th className="p-4 font-bold text-center">التحكم</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm text-gray-700">
                {diseases.map((d) => (
                  <tr key={d.id} className="hover:bg-muted/30 transition">
                    <td className="p-4 font-bold text-emerald-700">{d.name}</td>
                    <td className="p-4 max-w-xs text-xs">{d.symptoms}</td>
                    <td className="p-4 max-w-sm text-xs">{d.treatment}</td>
                    <td className="p-4"><span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded text-xs font-semibold">{d.season}</span></td>
                    <td className="p-4 text-center">
                      <button type="button" onClick={() => handleRemoveDisease(d.id)} className="text-xs text-destructive hover:bg-destructive/10 p-2 rounded-md font-bold">حذف</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "ain-defla" && (
        <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800">🌾 مساحات ومحاصيل ولاية عين الدفلى</h2>
              <p className="text-xs text-muted-foreground mt-1">متابعة المساحات المزروعة وتعداد الأطنان الاستراتيجية بالولاية.</p>
            </div>
            <button onClick={() => setShowStatForm(!showStatForm)} className="inline-flex items-center gap-1 bg-amber-600 text-white font-bold text-xs px-4 py-2 rounded-lg hover:bg-amber-700">
              <Plus className="h-4 w-4" /> {showStatForm ? "إغلاق" : "إضافة بيان محصول"}
            </button>
          </div>

          {showStatForm && (
            <form onSubmit={handleAddStat} className="bg-muted/40 p-4 rounded-xl border border-dashed space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input type="text" placeholder="نوع المحصول المتوفر" value={statCrop} onChange={(e)=>setStatCrop(e.target.value)} required className="p-2.5 border rounded-lg bg-background text-sm" />
                <input type="text" placeholder="المساحة المزروعة" value={statArea} onChange={(e)=>setStatArea(e.target.value)} required className="p-2.5 border rounded-lg bg-background text-sm" />
                <input type="text" placeholder="الإنتاج المتوقع" value={statProduction} onChange={(e)=>setStatProduction(e.target.value)} required className="p-2.5 border rounded-lg bg-background text-sm" />
                <input type="text" placeholder="حالة الموسم" value={statStatus} onChange={(e)=>setStatStatus(e.target.value)} required className="p-2.5 border rounded-lg bg-background text-sm" />
              </div>
              <button type="submit" className="bg-amber-600 text-white font-bold text-xs px-4 py-2 rounded-lg">حفظ السجل</button>
            </form>
          )}
          
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-amber-50/50 text-amber-800 border-b text-sm">
                  <th className="p-4 font-bold">نوع المحصول المتوفر</th>
                  <th className="p-4 font-bold">المساحة المزروعة</th>
                  <th className="p-4 font-bold">الإنتاج المتوقع</th>
                  <th className="p-4 font-bold">حالة الموسم</th>
                  <th className="p-4 font-bold text-center">التحكم</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm text-gray-700">
                {stats.map((s) => (
                  <tr key={s.id} className="hover:bg-muted/30 transition">
                    <td className="p-4 font-bold text-gray-950">{s.cropType}</td>
                    <td className="p-4 font-mono font-bold text-emerald-600">{s.area}</td>
                    <td className="p-4 font-medium">{s.production}</td>
                    <td className="p-4"><span className="px-2 py-0.5 bg-amber-50 text-amber-800 rounded-full text-xs font-semibold">{s.status}</span></td>
                    <td className="p-4 text-center">
                      <button type="button" onClick={() => handleRemoveStat(s.id)} className="text-xs text-destructive hover:bg-destructive/10 p-2 rounded-md font-bold">حذف</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* [إضافة حقيقية] القسم المالي السري ومراقبة خزينة الـ Admin لـ e-3doul */}
      {tab === "financial" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-700 p-6 rounded-2xl text-white shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs text-emerald-100 font-bold">إجمالي مداخيل الخزينة الحالية</p>
                <h3 className="text-3xl font-black mt-2">{totalRevenue.toLocaleString()} دج</h3>
              </div>
              <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-bold">إجمالي عمليات الدفع الناجحة</p>
                <h3 className="text-3xl font-black mt-2 text-slate-800">{paymentsLog.length} معالجة</h3>
              </div>
              <div className="h-12 w-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <ShieldCheck className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800">📊 تفاصيل سجلات الدفع الواردة من الفلاحين</h2>
              <p className="text-xs text-slate-400 mt-0.5">مراقبة حية للتحويلات المالية الإلكترونية المكتملة عبر بوابات الخدمة.</p>
            </div>
            
            <div className="overflow-x-auto rounded-xl border">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b text-xs">
                    <th className="p-4 font-bold">اسم الفلاح</th>
                    <th className="p-4 font-bold">الخدمة المطلوبة</th>
                    <th className="p-4 font-bold">المبلغ المستلم</th>
                    <th className="p-4 font-bold">الحالة</th>
                    <th className="p-4 font-bold">التاريخ والوقت</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm text-slate-700">
                  {paymentsLog.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-4 font-bold text-slate-800">{p.farmer_name}</td>
                      <td className="p-4 text-xs font-medium text-slate-600">{p.service_type}</td>
                      <td className="p-4 font-mono font-bold text-emerald-600">+{p.amount} دج</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md text-[10px] font-bold">مكتمل ومؤكد</span>
                      </td>
                      <td className="p-4 text-xs text-slate-400">
                        {new Date(p.created_at).toLocaleString("ar-DZ")}
                      </td>
                    </tr>
                  ))}
                  {paymentsLog.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-xs text-slate-400">لا توجد مداخيل أو تحويلات مسجلة في الخزينة بعد.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}