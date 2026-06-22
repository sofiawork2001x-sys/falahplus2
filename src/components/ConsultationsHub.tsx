import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/auth";
import { uploadMany } from "@/lib/storage";
import { type Consultation, type ConsultationReply, type ConsultationType } from "@/lib/types";
import { Send, Plus, Lock } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

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

  const role = user?.primaryRole;
  const canCompose = role === "farmer";

  const load = async () => {
    const { data } = await supabase.from("consultations").select("*").order("created_at", { ascending: false });
    const arr = (data as any as Consultation[]) ?? [];
    setList(arr);
    
    if (arr.length) {
      const ids = arr.map(c => c.id);
      const { data: r } = await supabase.from("consultation_replies").select("*").in("consultation_id", ids);
      const grp: Record<string, ConsultationReply[]> = {};
      (r as any as ConsultationReply[] ?? []).forEach(x => { (grp[x.consultation_id] ??= []).push(x); });
      setReplies(grp);
    }
  };

  useEffect(() => {
    if (user) load();
  }, [user?.id]);

  const current = useMemo(() => list.find(c => c.id === selected) ?? null, [list, selected]);

  const createConsult = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setBusy(true);
    try {
      const imgs = files.length ? await uploadMany(user?.id ?? "", files, "consultations") : [];
      
      const { data, error } = await supabase.from("consultations").insert({
        farmer_id: user?.id ?? "", 
        type, 
        title: title.trim(), 
        body: body.trim(), 
        status: "open" // تم التعديل من pending إلى open لتتوافق مع الـ Types
      }).select().single();

      if (error) throw error;
      setTitle(""); setBody(""); setFiles([]); setComposing(false);
      await load();
      if (data) setSelected((data as any).id);
      
      alert("تم إرسال الاستشارة بنجاح وهي بانتظار المراجعة والتوجيه! 🎉");
    } catch (e: any) { 
      alert(e.message); 
    } finally { 
      setBusy(false); 
    }
  };

  const sendReply = async () => {
    if (!current || !reply.trim()) return;
    await supabase.from("consultation_replies").insert({ 
      consultation_id: current.id, 
      author_id: user?.id ?? "", 
      body: reply.trim() 
    });
    setReply("");
    await load();
  };

  if (!user) return null;

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-black">مركز الاستشارات</h1>
        {canCompose && (
          <button onClick={() => setComposing(!composing)} className="bg-primary text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2">
            <Plus className="h-4 w-4"/> استشارة جديدة
          </button>
        )}
      </div>

      {composing && (
        <form onSubmit={createConsult} className="border p-4 rounded-2xl bg-card grid gap-3">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="عنوان الاستشارة" required className="border p-2 rounded-lg text-sm bg-background" />
          <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="تفاصيل الاستشارة والطلب الفني..." required rows={3} className="border p-2 rounded-lg text-sm bg-background" />
          <button disabled={busy} className="bg-primary text-white py-2 rounded-lg font-bold hover:bg-primary/90 disabled:opacity-60 transition">
            {busy ? "جاري الإرسال..." : "إرسال الاستشارة"}
          </button>
        </form>
      )}

      <div className="grid lg:grid-cols-[300px_1fr] gap-4">
        <aside className="border rounded-2xl overflow-hidden bg-card">
          {list.map(c => (
            <button key={c.id} onClick={() => setSelected(c.id)} className={`w-full p-4 border-b text-right transition hover:bg-muted/50 ${selected === c.id ? "bg-primary/10 font-bold" : ""}`}>
              <div className="flex items-center gap-2">
                {c.status === "closed" && <Lock className="h-3 w-3 text-amber-500"/>}
                <span className="text-sm truncate">{c.title}</span>
              </div>
            </button>
          ))}
          {list.length === 0 && <div className="p-4 text-center text-xs text-muted-foreground">لا توجد استشارات حالياً.</div>}
        </aside>

        <section className="h-125 border rounded-2xl flex flex-col bg-muted/20">
          {current ? (
            <>
              <div className="p-4 border-b font-black bg-card">{current.title}</div>
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                <div className="bg-white p-3 rounded-xl border shadow-sm">
                  <p className="text-sm font-semibold text-gray-900">{current.body}</p>
                </div>
                {(replies[current.id] ?? []).map(r => (
                  <div key={r.id} className="bg-blue-50/70 p-3 rounded-xl border border-blue-100 text-sm mr-6">
                    <p className="text-gray-800">{r.body}</p>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t flex gap-2 bg-card">
                <textarea value={reply} onChange={(e) => setReply(e.target.value)} className="flex-1 border rounded-lg p-2 text-sm bg-background focus:outline-none focus:border-primary" placeholder="اكتب ردك هنا..." rows={1} />
                <button onClick={sendReply} className="bg-primary text-white px-4 rounded-lg hover:bg-primary/90 transition flex items-center justify-center">
                  <Send className="h-4 w-4 transform rotate-180"/>
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">اختر استشارة من القائمة الجانبية لعرض تفاصيلها والرد عليها.</div>
          )}
        </section>
      </div>
    </div>
  );
}