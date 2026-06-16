import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/auth";
import { uploadMany } from "@/lib/storage";
import { CONSULTATION_LABEL, type Consultation, type ConsultationReply, type ConsultationType } from "@/lib/types";
import { Send, Upload, MessageSquare, Plus } from "lucide-react";

export default function ConsultationsHub({ mode }: { mode: "vet" | "non_vet" }) {
  const user = useSession();
  const [list, setList] = useState<Consultation[]>([]);
  const [replies, setReplies] = useState<Record<string, ConsultationReply[]>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [composing, setComposing] = useState(false);

  // new consultation form
  const [type, setType] = useState<ConsultationType>(mode === "vet" ? "vet" : "technical");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);

  const role = user?.primaryRole;
  const canCompose = role === "farmer";

  const allowedTypes: ConsultationType[] = mode === "vet" ? ["vet"] : ["technical", "financial"];

  const load = async () => {
    const { data } = await supabase.from("consultations").select("*").in("type", allowedTypes).order("created_at", { ascending: false });
    const arr = (data as any as Consultation[]) ?? [];
    setList(arr);
    if (arr.length) {
      const ids = arr.map(c => c.id);
      const { data: r } = await supabase.from("consultation_replies").select("*").in("consultation_id", ids).order("created_at");
      const grp: Record<string, ConsultationReply[]> = {};
      (r as any as ConsultationReply[] ?? []).forEach(x => { (grp[x.consultation_id] ??= []).push(x); });
      setReplies(grp);
    } else setReplies({});
  };

  useEffect(() => {
    if (!user) return;
    load();
    const ch = supabase.channel(`cons-${mode}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "consultations" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "consultation_replies" }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  // eslint-disable-next-line
  }, [user?.id, mode]);

  const current = useMemo(() => list.find(c => c.id === selected) ?? null, [list, selected]);

  if (!user) return null;

  const createConsult = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const imgs = files.length ? await uploadMany(user.id, files, "consultations") : [];
      const { data, error } = await supabase.from("consultations").insert({
        farmer_id: user.id, type, title, body, images: imgs, wilaya_code: null,
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
    await supabase.from("consultation_replies").insert({ consultation_id: current.id, author_id: user.id, body: reply });
    // Mark answered if expert replies
    if (role !== "farmer") await supabase.from("consultations").update({ status: "answered" }).eq("id", current.id);
    setReply("");
    await load();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black">{mode === "vet" ? "الاستشارات البيطرية" : "مركز الاستشارات"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{mode === "vet" ? "استشارات صحة الحيوانات بين الفلاح والطبيب البيطري." : "استشارات فنية وتقنية ومالية بين الفلاح والخبراء."}</p>
        </div>
        {canCompose && (
          <button onClick={()=>setComposing(v=>!v)} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4"/> استشارة جديدة
          </button>
        )}
      </div>

      {composing && canCompose && (
        <form onSubmit={createConsult} className="grid gap-3 rounded-2xl border bg-card p-5">
          {mode !== "vet" && (
            <select value={type} onChange={(e)=>setType(e.target.value as ConsultationType)} className="rounded-lg border bg-background px-3 py-2 text-sm">
              <option value="technical">{CONSULTATION_LABEL.technical}</option>
              <option value="financial">{CONSULTATION_LABEL.financial}</option>
            </select>
          )}
          <input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="عنوان الاستشارة" required className="rounded-lg border bg-background px-3 py-2 text-sm"/>
          <textarea value={body} onChange={(e)=>setBody(e.target.value)} required rows={4} placeholder={mode==="vet"?"أعراض المرض، عمر الحيوان، التغذية...":"اشرح حالتك بالتفصيل"} className="rounded-lg border bg-background px-3 py-2 text-sm"/>
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed px-3 py-2.5 text-sm hover:bg-accent/30">
            <Upload className="h-4 w-4 text-primary"/> صور ({files.length})
            <input type="file" multiple accept="image/*" onChange={(e)=>setFiles(Array.from(e.target.files??[]))} className="hidden"/>
          </label>
          <button disabled={busy} className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground disabled:opacity-60">{busy?"جارٍ الإرسال…":"إرسال الاستشارة"}</button>
        </form>
      )}

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <aside className="rounded-2xl border bg-card">
          <div className="border-b p-3 text-sm font-bold">الاستشارات ({list.length})</div>
          <ul className="max-h-[720px] divide-y overflow-y-auto">
            {list.map(c => (
              <li key={c.id}>
                <button onClick={()=>setSelected(c.id)} className={`w-full px-4 py-3 text-right ${selected===c.id?"bg-primary/10":"hover:bg-accent/20"}`}>
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${c.status==="open"?"bg-warning":"bg-success"}`}/>
                    <span className="line-clamp-1 text-sm font-semibold">{c.title}</span>
                  </div>
                  <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{CONSULTATION_LABEL[c.type]}</p>
                </button>
              </li>
            ))}
            {list.length===0 && <li className="p-6 text-center text-sm text-muted-foreground">لا توجد استشارات بعد.</li>}
          </ul>
        </aside>

        <section className="flex h-[720px] flex-col overflow-hidden rounded-2xl border bg-card shadow-sm">
          {!current ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 text-muted-foreground">
              <MessageSquare className="h-14 w-14 opacity-40"/>
              <p className="text-base">اختر استشارة لعرضها أو ابدأ واحدة جديدة.</p>
            </div>
          ) : (
            <>
              <div className="border-b bg-muted/40 p-5">
                <h2 className="text-lg font-black">{current.title}</h2>
                <p className="mt-1 text-xs text-muted-foreground">{CONSULTATION_LABEL[current.type]} · {new Date(current.created_at).toLocaleDateString("ar-DZ")}</p>
              </div>
              <div className="flex-1 space-y-4 overflow-y-auto bg-muted/20 p-5 lg:p-6">
                {/* Original consultation as first bubble from the farmer */}
                <ChatBubble
                  mine={current.farmer_id===user.id}
                  name={current.farmer_id===user.id ? "أنا (الفلاح)" : "الفلاح"}
                  body={current.body}
                  images={current.images}
                  ts={current.created_at}
                />
                {(replies[current.id] ?? []).map(r => (
                  <ChatBubble
                    key={r.id}
                    mine={r.author_id===user.id}
                    name={r.author_id===current.farmer_id ? (r.author_id===user.id?"أنا (الفلاح)":"الفلاح") : (r.author_id===user.id?"أنا (الخبير)":"الخبير")}
                    body={r.body}
                    ts={r.created_at}
                  />
                ))}
              </div>
              <div className="flex items-end gap-2 border-t bg-background p-4">
                <textarea
                  value={reply}
                  onChange={(e)=>setReply(e.target.value)}
                  onKeyDown={(e)=>{ if(e.key==="Enter" && !e.shiftKey){ e.preventDefault(); sendReply(); } }}
                  rows={2}
                  placeholder="اكتب رسالتك هنا…  (Enter للإرسال)"
                  className="flex-1 resize-none rounded-2xl border bg-muted/40 px-4 py-3 text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button onClick={sendReply} className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90">
                  <Send className="h-5 w-5"/>
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

function ChatBubble({ mine, name, body, images, ts }: { mine: boolean; name: string; body: string; images?: string[]; ts: string }) {
  return (
    <div className={`flex ${mine ? "justify-start" : "justify-end"}`}>
      <div className={`flex max-w-[78%] flex-col ${mine ? "items-start" : "items-end"}`}>
        <span className="mb-1 px-2 text-[11px] font-bold text-muted-foreground">{name}</span>
        <div className={`rounded-2xl px-4 py-3 text-[15px] leading-relaxed shadow-sm ${
          mine
            ? "rounded-tr-md bg-primary text-primary-foreground"
            : "rounded-tl-md bg-card border"
        }`}>
          <p className="whitespace-pre-wrap">{body}</p>
          {images && images.length>0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {images.map((u,i)=><img key={i} src={u} className="h-28 w-28 rounded-lg object-cover" alt=""/>)}
            </div>
          )}
        </div>
        <span className="mt-1 px-2 text-[10px] text-muted-foreground">{new Date(ts).toLocaleString("ar-DZ")}</span>
      </div>
    </div>
  );
}
