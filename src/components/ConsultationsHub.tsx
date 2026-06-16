import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/auth";
import { uploadMany } from "@/lib/storage";
import { CONSULTATION_LABEL, type Consultation, type ConsultationReply, type ConsultationType } from "@/lib/types";
import { Send, Upload, MessageSquare, Plus, Lock } from "lucide-react";
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
    
    // 1. التحقق من الدفع قبل الإرسال
    const { data: payment } = await supabase
      .from("payments")
      .select("id")
      .eq("farmer_id", user?.id)
      .eq("status", "paid")
      .single();

    if (!payment) {
      alert("يرجى إتمام عملية الدفع أولاً!");
      navigate({ to: '/dashboard/payment' });
      return;
    }

    setBusy(true);
    try {
      const imgs = files.length ? await uploadMany(user?.id ?? "", files, "consultations") : [];
      const { data, error } = await supabase.from("consultations").insert({
        farmer_id: user?.id, type, title, body, images: imgs, is_paid: true, status: "open"
      }).select().single();

      if (error) throw error;
      setTitle(""); setBody(""); setFiles([]); setComposing(false);
      await load();
      if (data) setSelected((data as any).id);
    } catch (e: any) { alert(e.message); }
    finally { setBusy(false); }
  };

  const sendReply = async () => {
    if (!current || !reply.trim()) return;
    await supabase.from("consultation_replies").insert({ consultation_id: current.id, author_id: user?.id, body: reply });
    setReply("");
    await load();
  };

  if (!user) return null;

  return (
    <div className="space-y-4">
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
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="عنوان الاستشارة" required className="border p-2 rounded-lg text-sm" />
          <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="تفاصيل الاستشارة..." required rows={3} className="border p-2 rounded-lg text-sm" />
          <button disabled={busy} className="bg-primary text-white py-2 rounded-lg font-bold">{busy ? "جاري الإرسال..." : "إرسال الاستشارة"}</button>
        </form>
      )}

      <div className="grid lg:grid-cols-[300px_1fr] gap-4">
        <aside className="border rounded-2xl overflow-hidden">
          {list.map(c => (
            <button key={c.id} onClick={() => setSelected(c.id)} className={`w-full p-4 border-b text-right ${selected === c.id ? "bg-primary/10" : ""}`}>
              <div className="flex items-center gap-2">
                {!c.is_paid && <Lock className="h-3 w-3 text-red-500"/>}
                <span className="font-semibold text-sm">{c.title}</span>
              </div>
            </button>
          ))}
        </aside>

        <section className="h-[500px] border rounded-2xl flex flex-col bg-muted/20">
          {current ? (
            <>
              <div className="p-4 border-b font-black">{current.title}</div>
              <div className="flex-1 p-4 overflow-y-auto">
                <p className="bg-white p-3 rounded-lg border">{current.body}</p>
                {(replies[current.id] ?? []).map(r => (
                  <p key={r.id} className="mt-2 bg-blue-50 p-3 rounded-lg border text-sm">{r.body}</p>
                ))}
              </div>
              <div className="p-4 border-t flex gap-2">
                <textarea value={reply} onChange={(e) => setReply(e.target.value)} className="flex-1 border rounded-lg p-2" placeholder="اكتب ردك..." />
                <button onClick={sendReply} className="bg-primary text-white px-4 rounded-lg"><Send className="h-4 w-4"/></button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">اختر استشارة لعرضها</div>
          )}
        </section>
      </div>
    </div>
  );
}