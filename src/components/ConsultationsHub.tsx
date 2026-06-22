import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/auth";
import { uploadMany } from "@/lib/storage";
import { CONSULTATION_LABEL, type Consultation, type ConsultationReply, type ConsultationType } from "@/lib/types";
import { Send, Upload, MessageSquare, Plus, Lock, ShieldCheck, Loader2 } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner"; // للتنبيهات الاحترافية

export default function ConsultationsHub({ mode }: { mode: "vet" | "non_vet" }) {
  const user = useSession();
  const navigate = useNavigate();
  const [list, setList] = useState<Consultation[]>([]);
  const [replies, setReplies] = useState<Record<string, ConsultationReply[]>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [composing, setComposing] = useState(false);

  const [type, setType] = useState<ConsultationType>(mode === "vet" ? "vet" : "technical");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);

  // سعر الاستشارة الموحد (مثلاً 1000 دج) ليتم إرساله لحساب الـ Admin
  const [amount] = useState(1000); 

  const role = user?.primaryRole;
  const canCompose = role === "farmer";

  const load = async () => {
    // جلب الاستشارات الخاصة بالنوع الحالي (vet أو non_vet)
    const { data } = await supabase
      .from("consultations")
      .select("*")
      .order("created_at", { ascending: false });
    
    const arr = (data as any as Consultation[]) ?? [];
    // تصفية الاستشارات بناءً على المود لكي لا تختلط الاستشارات البيطرية بالفنية
    const filtered = arr.filter(c => mode === "vet" ? c.type === "vet" : c.type !== "vet");
    setList(filtered);
    
    if (filtered.length) {
      const ids = filtered.map(c => c.id);
      const { data: r } = await supabase.from("consultation_replies").select("*").in("consultation_id", ids);
      const grp: Record<string, ConsultationReply[]> = {};
      (r as any as ConsultationReply[] ?? []).forEach(x => { (grp[x.consultation_id] ??= []).push(x); });
      setReplies(grp);
    }
  };

  useEffect(() => {
    if (user) load();
  }, [user?.id, mode]);

  const current = useMemo(() => list.find(c => c.id === selected) ?? null, [list, selected]);

  // دالة الدفع الفوري وإنشاء الاستشارة وإرسالها للـ Admin
  const createConsult = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);

    try {
      if (!user?.id) {
        toast.error("يجب تسجيل الدخول أولاً");
        return;
      }

      // 1. معالجة وحفظ عملية الدفع تلقائياً لكي يراها الـ Admin في جدول الحسابات والمداخيل
      const { data: newPayment, error: paymentError } = await supabase
        .from("payments")
        .insert({
          farmer_id: user?.id,
          farmer_name: user?.user_metadata?.full_name || "فلاح",
          amount: amount,
          status: "paid", // مدفوعة فوراً عبر بوابتنا المدمجة
          service_type: mode === "vet" ? "استشارة بيطرية" : "استشارة فنية وقانونية",
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (paymentError) throw paymentError;

      // 2. رفع الملفات أو الصور إن وجدت
      const imgs = files.length ? await uploadMany(user?.id ?? "", files, "consultations") : [];

      // 3. إنشاء الاستشارة وربطها بالدفع الناجح
      const { data, error } = await supabase.from("consultations").insert({
        farmer_id: user?.id, 
        type, 
        title, 
        body, 
        images: imgs, 
        is_paid: true, // معلمة كمدفوعة مباشرة
        status: "open",
        amount_paid: amount
      }).select().single();

      if (error) throw error;

      toast.success(`تم تأكيد الدفع بقيمة ${amount} دج بنجاح، ووصلت للآدمين والمختص!`);
      setTitle(""); setBody(""); setFiles([]); setComposing(false);
      await load();
      if (data) setSelected((data as any).id);
    } catch (e: any) { 
      console.error(e);
      toast.error(e.message || "حدث خطأ أثناء معالجة الدفع الفوري"); 
    } finally { 
      setBusy(false); 
    }
  };

  const sendReply = async () => {
    if (!current || !reply.trim()) return;
    await supabase.from("consultation_replies").insert({ consultation_id: current.id, author_id: user?.id, body: reply });
    setReply("");
    await load();
  };

  if (!user) return null;

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-800">مركز الاستشارات المدفوعة</h1>
          <p className="text-xs text-slate-400 mt-0.5">اطرح استفسارك وسيتم سحب الرسوم وتوصيلها للآدمين والمختص فوراً</p>
        </div>
        {canCompose && (
          <button onClick={() => setComposing(!composing)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-colors text-sm shadow-sm">
            <Plus className="h-4 w-4"/> استشارة جديدة
          </button>
        )}
      </div>

      {composing && (
        <form onSubmit={createConsult} className="border border-emerald-200 p-5 rounded-2xl bg-white grid gap-4 shadow-sm">
          <div className="grid gap-1">
            <label className="text-xs font-bold text-slate-600">عنوان الاستشارة</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="اكتب عنواناً يوضح المشكلة الفلاحية..." required className="border p-2.5 rounded-xl text-sm focus:outline-none focus:border-emerald-500" />
          </div>
          
          <div className="grid gap-1">
            <label className="text-xs font-bold text-slate-600">تفاصيل الاستفسار والأسئلة</label>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="اشرح مشكلتك هنا بالتفصيل لكي يجيبك الخبير بدقة..." required rows={4} className="border p-2.5 rounded-xl text-sm focus:outline-none focus:border-emerald-500 resize-none" />
          </div>

          {/* شريط الدفع الآمن التلقائي المدمج لضمان تحويل المداخيل للـ Admin */}
          <div className="p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 bg-emerald-600 text-white rounded-xl flex items-center justify-center font-black text-sm">
                دج
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-900">رسوم الاستشارة المستحقة للآدمين</p>
                <p className="text-[10px] text-emerald-700 flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> بوابة الدفع الإلكتروني مؤمنة كلياً
                </p>
              </div>
            </div>
            <div className="text-left">
              <span className="text-lg font-black text-emerald-700">{amount} دج</span>
            </div>
          </div>

          <button disabled={busy} className="bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-sm text-sm">
            {busy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                جاري سحب الرسوم والتوصيل...
              </>
            ) : (
              "تأكيد الدفع الفوري وإرسال"
            )}
          </button>
        </form>
      )}

      <div className="grid lg:grid-cols-[300px_1fr] gap-4">
        <aside className="border rounded-2xl overflow-hidden bg-white shadow-sm h-[500px] overflow-y-auto">
          <div className="p-3 bg-slate-50 border-b font-bold text-xs text-slate-500">سجل استشاراتي</div>
          {list.length === 0 ? (
            <p className="text-center text-xs text-gray-400 py-8">لا توجد استشارات حالياً</p>
          ) : (
            list.map(c => (
              <button key={c.id} onClick={() => setSelected(c.id)} className={`w-full p-4 border-b text-right transition-colors block ${selected === c.id ? "bg-emerald-50/60 border-l-4 border-l-emerald-600" : "hover:bg-slate-50"}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-sm text-slate-700 truncate max-w-[180px]">{c.title}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-medium">مدفوعة</span>
                </div>
              </button>
            ))
          )}
        </aside>

        <section className="h-[500px] border rounded-2xl flex flex-col bg-white shadow-sm overflow-hidden">
          {current ? (
            <>
              <div className="p-4 border-b font-black text-slate-800 bg-slate-50/50 flex justify-between items-center">
                <span>{current.title}</span>
                <span className="text-xs font-normal text-slate-400">{new Date(current.created_at).toLocaleDateString("ar-DZ")}</span>
              </div>
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/30">
                <div className="bg-white p-3.5 rounded-2xl border border-slate-100 shadow-sm">
                  <p className="text-xs font-bold text-emerald-700 mb-1">نص الاستشارة الأصلية:</p>
                  <p className="text-sm text-slate-700 leading-relaxed">{current.body}</p>
                </div>
                {(replies[current.id] ?? []).map(r => (
                  <div key={r.id} className="bg-blue-50/60 p-3.5 rounded-2xl border border-blue-100 max-w-[85%] mr-auto">
                    <p className="text-xs font-bold text-blue-700 mb-1">رد المستشار/المختص:</p>
                    <p className="text-sm text-slate-700 leading-relaxed">{r.body}</p>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t flex gap-2 bg-white">
                <textarea value={reply} onChange={(e) => setReply(e.target.value)} className="flex-1 border rounded-xl p-2 text-sm focus:outline-none focus:border-emerald-500 resize-none" placeholder="اكتب ردك أو تعقيبك هنا..." rows={2} />
                <button onClick={sendReply} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 rounded-xl transition-colors shadow-sm"><Send className="h-4 w-4"/></button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-sm bg-slate-50/20">اختر استشارة من القائمة الجانبية لعرض التفاصيل والردود</div>
          )}
        </section>
      </div>
    </div>
  );
}