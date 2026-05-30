import { createFileRoute, Link } from "@tanstack/react-router";
import { useSession } from "@/lib/auth";
import { ROLE_LABEL } from "@/lib/types";
import { Store, FileBox, MessageSquare, Wallet, Stethoscope } from "lucide-react";

export const Route = createFileRoute("/dashboard/")({ component: DashboardHome });

function DashboardHome() {
  const user = useSession();
  if (!user) return null;
  const role = user.primaryRole ?? "farmer";

  const cards: { to: string; label: string; desc: string; icon: any; show: boolean }[] = [
    { to: "/dashboard/marketplace", label: "سوق العروض", desc: "تصفح الأراضي والمعدات المعروضة في كل الولايات.", icon: Store, show: true },
    { to: "/dashboard/listings", label: "عروضي", desc: role === "farmer" ? "أضف أرضك للكراء." : "أضف معداتك وآلاتك.", icon: FileBox, show: role === "farmer" || role === "company" },
    { to: "/dashboard/consultations", label: "الاستشارات الفنية والتقنية", desc: "اطرح استشارة فلاحية أو مالية.", icon: MessageSquare, show: role === "farmer" || role === "agri_expert" || role === "finance_expert" },
    { to: "/dashboard/vet", label: "الاستشارات البيطرية", desc: "صحة الحيوانات ورعايتها.", icon: Stethoscope, show: role === "farmer" || role === "vet" },
    { to: "/dashboard/financial", label: "الجناح المالي", desc: "دراسات الجدوى وملفات الدعم.", icon: Wallet, show: role === "farmer" || role === "finance_expert" },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-black">مرحباً، {user.profile?.full_name || user.email}</h1>
        <p className="mt-2 text-sm text-muted-foreground">دورك في المنصة: <span className="font-bold text-primary">{ROLE_LABEL[role]}</span></p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.filter(c => c.show).map((c) => (
          <Link key={c.to} to={c.to} className="group rounded-2xl border bg-card p-5 shadow-sm transition hover:border-primary hover:shadow-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
              <c.icon className="h-6 w-6" />
            </div>
            <h3 className="mt-4 font-bold">{c.label}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{c.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
