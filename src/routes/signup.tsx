import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ROLE_OPTIONS, type Role } from "@/lib/types";
import { Leaf } from "lucide-react";

export const Route = createFileRoute("/signup")({ component: SignupPage });

function SignupPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [wilaya, setWilaya] = useState("");
  const [role, setRole] = useState<Role>("farmer");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(""); setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: {
          emailRedirectTo: window.location.origin,
          data: { full_name: fullName, phone, wilaya, role },
        },
      });
      if (error) throw error;
      navigate({ to: "/dashboard" });
    } catch (e: any) {
      setErr(e.message || "تعذر إنشاء الحساب");
    } finally { setLoading(false); }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10" dir="rtl">
      <div className="w-full max-w-2xl rounded-2xl border bg-card p-6 shadow-lg lg:p-10">
        <Link to="/" className="flex items-center gap-2 font-black text-primary text-xl"><Leaf className="h-6 w-6"/>  فلاح plus</Link>
        <h1 className="mt-6 text-2xl font-black">إنشاء حساب جديد</h1>
        <p className="mt-1 text-sm text-muted-foreground">اختر دورك وأكمل بياناتك للبدء.</p>

        <form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="mb-2 block text-sm font-semibold">اختر دورك</label>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {ROLE_OPTIONS.map((r) => (
                <button type="button" key={r.value} onClick={() => setRole(r.value)}
                  className={`rounded-xl border p-3 text-right transition ${role === r.value ? "border-primary bg-primary/5 ring-2 ring-primary" : "hover:bg-accent/30"}`}>
                  <div className="font-bold">{r.label}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{r.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <Field label="الاسم الكامل" value={fullName} onChange={setFullName} required />
          <Field label="رقم الهاتف" value={phone} onChange={setPhone} />
          <Field label="البريد الإلكتروني" type="email" value={email} onChange={setEmail} required />
          <Field label="كلمة المرور (6 أحرف فأكثر)" type="password" value={password} onChange={setPassword} required />
          <Field label="الولاية" value={wilaya} onChange={setWilaya} placeholder="مثلاً: بسكرة" />

          {err && <div className="sm:col-span-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{err}</div>}

          <button disabled={loading} className="sm:col-span-2 rounded-lg bg-primary px-4 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
            {loading ? "جارٍ الإنشاء…" : "إنشاء الحساب"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          لديك حساب؟ <Link to="/login" className="font-bold text-primary">تسجيل الدخول</Link>
        </p>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type="text", required=false, placeholder="" }:
  { label: string; value: string; onChange: (v:string)=>void; type?: string; required?: boolean; placeholder?: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required} placeholder={placeholder}
        className="w-full rounded-lg border bg-background px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" />
    </div>
  );
}
