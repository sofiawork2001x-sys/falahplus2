import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/auth";
import { CONSULTATION_LABEL, type Consultation, type ConsultationType } from "@/lib/types";
import { Plus } from "lucide-react";

export default function ConsultationsHub({ mode }: { mode: "vet" | "non_vet" }) {
  const user = useSession();
  const [list, setList] = useState<Consultation[]>([]);
  const [composing, setComposing] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("consultations").select("*").order("created_at", { ascending: false });
    setList((data as any as Consultation[]) ?? []);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-black">مركز الاستشارات</h1>
      <button onClick={() => setComposing(!composing)} className="bg-primary text-white p-2 rounded-lg flex items-center gap-2">
        <Plus className="h-4 w-4"/> استشارة جديدة
      </button>
      
      <div className="grid gap-4">
        {list.map((c) => (
          <div key={c.id} className="p-4 border rounded-2xl bg-card">
            <h2 className="font-bold">{c.title}</h2>
            <p className="text-sm text-gray-500">{CONSULTATION_LABEL[c.type]}</p>
            <div className={`mt-2 ${c.is_paid ? "text-green-600" : "text-red-600 font-bold"}`}>
              {c.is_paid ? "✅ مدفوعة" : "🔒 غير مدفوعة - يجب الدفع"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}