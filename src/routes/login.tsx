import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Leaf } from "lucide-react";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(""); setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      navigate({ to: "/dashboard" });
    } catch (e: any) {
      setErr(e.message || "بيانات الدخول غير صحيحة");
    } finally { setLoading(false); }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4" dir="rtl">
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-lg">
        <Link to="/" className="flex items-center gap-2 font-black text-primary text-xl"><Leaf className="h-6 w-6"/> AgroVault</Link>
        <h1 className="mt-6 text-2xl font-black">تسجيل الدخول</h1>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold">البريد الإلكتروني</label>
            <input type="email" required value={email} onChange={(e)=>setEmail(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"/>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold">كلمة المرور</label>
            <input type="password" required value={password} onChange={(e)=>setPassword(e.target.value)}
              className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"/>
          </div>
          {err && <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{err}</div>}
          <button disabled={loading} className="w-full rounded-xl bg-primary px-6 py-5 text-lg font-black text-primary-foreground shadow-lg transition hover:bg-primary/90 hover:shadow-xl disabled:opacity-60">
            {loading ? "جارٍ الدخول…" : "دخـــول إلى المنصة"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          ليس لديك حساب؟ <Link to="/signup" className="font-bold text-primary">إنشاء حساب</Link>
        </p>
      </div>
    </div>
  );
}
