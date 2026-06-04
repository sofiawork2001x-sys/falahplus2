import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useSession } from "@/lib/auth";
import { Leaf, Sprout, Tractor, MessageSquare, Wallet, Stethoscope, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const user = useSession();
  const navigate = useNavigate();
  useEffect(() => { if (user) navigate({ to: "/dashboard" }); }, [user, navigate]);

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
          <Link to="/" className="flex items-center gap-2 font-black text-primary text-xl">
            <Leaf className="h-7 w-7" />  فلاح plus
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/login" className="rounded-xl border-2 border-primary px-5 py-2.5 text-base font-black text-primary hover:bg-primary/10">تسجيل الدخول</Link>
            <Link to="/signup" className="rounded-xl bg-primary px-5 py-2.5 text-base font-black text-primary-foreground shadow-md hover:bg-primary/90">إنشاء حساب</Link>
          </div>
        </div>
      </header>

      <section className="gradient-hero relative overflow-hidden text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 py-20 lg:px-8 lg:py-28">
          <div className="max-w-3xl">
            <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">منصة فلاحية جزائرية متكاملة</span>
            <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl lg:text-5xl">
               فلاح plus: استشارة فلاحية فنية، تقنية، ومالية..
              <br />حيث يلتقي الفلاح بالخبير، والآلة، والدعم.
            </h1>
            <p className="mt-5 max-w-2xl text-base/relaxed text-white/90 lg:text-lg/relaxed">
              منصة موحدة تربط الفلاحين بالخبراء الفنيين والماليين والبيطريين، وتفتح سوقاً لكراء الأراضي والآلات بين الفلاحين والشركات في جميع الولايات الجزائرية.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/signup" className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-5 text-lg font-black text-primary shadow-2xl transition hover:scale-[1.02] hover:bg-white/95">
                ابدأ الآن مجاناً <ArrowLeft className="h-5 w-5" />
              </Link>
              <Link to="/login" className="inline-flex items-center gap-2 rounded-xl border-2 border-white bg-white/10 px-8 py-5 text-lg font-black text-white backdrop-blur transition hover:bg-white/20">
                دخول الأعضاء
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <h2 className="text-center text-2xl font-black lg:text-3xl">خدمات المنصة</h2>
        <p className="mt-2 text-center text-muted-foreground">كل ما يحتاجه الفلاح الجزائري في مكان واحد.</p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: Sprout, title: "كراء الأراضي", desc: "اعرض أرضك للكراء بتفاصيلها وصورها، أو ابحث عن أرض في ولايتك." },
            { icon: Tractor, title: "آلات ومعدات", desc: "تكتري الجرارات والحصادات من الشركات مباشرة بأسعار شفافة." },
            { icon: MessageSquare, title: "استشارة فنية", desc: "اطرح سؤالك على خبير فلاحي مختص واحصل على رد بسرعة." },
            { icon: Stethoscope, title: "استشارة بيطرية", desc: "ارفع أعراض الحيوان وصورته ليجيبك الطبيب البيطري." },
            { icon: Wallet, title: "دراسة جدوى مالية", desc: "اطلب دراسة جدوى لمشروعك من خبير مالي معتمد." },
            { icon: Wallet, title: "ملفات الدعم", desc: "ارفع وثائق الدعم وتابع حالة ملفك خطوة بخطوة." },
          ].map((s, i) => (
            <div key={i} className="rounded-2xl border bg-card p-6 shadow-sm transition hover:shadow-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <s.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-bold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t bg-muted/30">
        <div className="mx-auto max-w-4xl px-4 py-14 text-center lg:px-8">
          <h2 className="text-2xl font-black lg:text-3xl">جاهز للانطلاق؟</h2>
          <p className="mt-3 text-muted-foreground">سجل حسابك في أقل من دقيقة واختر دورك: فلاح، شركة، أو خبير.</p>
          <Link to="/signup" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90">
            إنشاء حساب الآن <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()}  فلاح plus — منصة الفلاح الجزائري.
      </footer>
    </div>
  );
}
