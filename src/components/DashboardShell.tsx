import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import React from "react";
import { logout, useSession, type SessionUser } from "@/lib/auth";
import { ROLE_LABEL, type Role } from "@/lib/types";
import {
  LayoutDashboard, Store, FileBox, MessageSquare, Wallet, Stethoscope,
  Menu, LogOut, Leaf, ShieldCheck,
} from "lucide-react";
import { WeatherAlertBanner } from "@/components/WeatherAlertBanner";

type Item = { to: string; label: string; icon: ReactNode; roles: Role[] };

const ITEMS: Item[] = [
  { to: "/dashboard", label: "الرئيسية", icon: <LayoutDashboard className="h-5 w-5" />, roles: ["farmer","company","agri_expert","finance_expert","vet","admin"] },
  { to: "/dashboard/admin", label: "لوحة المسؤول", icon: <ShieldCheck className="h-5 w-5" />, roles: ["admin"] },
  { to: "/dashboard/marketplace", label: "سوق العروض", icon: <Store className="h-5 w-5" />, roles: ["farmer","company","agri_expert","finance_expert","vet","admin"] },
  { to: "/dashboard/listings", label: "عروضي", icon: <FileBox className="h-5 w-5" />, roles: ["farmer","company"] },
  { to: "/dashboard/consultations", label: "الاستشارات", icon: <MessageSquare className="h-5 w-5" />, roles: ["farmer","agri_expert","finance_expert"] },
  { to: "/dashboard/vet", label: "الاستشارات البيطرية", icon: <Stethoscope className="h-5 w-5" />, roles: ["farmer","vet"] },
  { to: "/dashboard/financial", label: "الجناح المالي", icon: <Wallet className="h-5 w-5" />, roles: ["farmer","finance_expert"] },
];

export function DashboardShell({ children }: { children: ReactNode }) {
  const user = useSession();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => { if (user === null) navigate({ to: "/login" }); }, [user, navigate]);
  useEffect(() => { setOpen(false); }, [path]);

  if (user === undefined) return <div className="flex min-h-screen items-center justify-center" dir="rtl"><p className="text-muted-foreground">جارٍ التحميل…</p></div>;
  if (user === null) return null;

  const role = user.primaryRole ?? "farmer";
  const items = ITEMS.filter((i) => i.roles.includes(role));
  const onLogout = async () => { await logout(); navigate({ to: "/" }); };

  return (
    <div className="flex min-h-screen bg-muted/30" dir="rtl">
      <aside className="hidden w-64 shrink-0 border-l bg-sidebar lg:flex lg:flex-col">
        <SidebarContent items={items} path={path} user={user} role={role} onLogout={onLogout} />
      </aside>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="absolute right-0 top-0 flex h-full w-72 flex-col border-l bg-sidebar shadow-xl">
            <SidebarContent items={items} path={path} user={user} role={role} onLogout={onLogout} />
          </aside>
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b bg-background/80 px-4 py-3 backdrop-blur lg:px-8">
          <button onClick={() => setOpen(true)} className="rounded-md p-2 hover:bg-accent lg:hidden" aria-label="فتح القائمة"><Menu className="h-5 w-5" /></button>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">مرحباً،</span>
            <span className="font-semibold">{user.profile?.full_name || user.email}</span>
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">{ROLE_LABEL[role]}</span>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8"><div className="mb-4"><WeatherAlertBanner /></div><SafeBoundary>{children}</SafeBoundary></main>
      </div>
    </div>
  );
}

function SidebarContent({ items, path, user, role, onLogout }: { items: Item[]; path: string; user: SessionUser; role: Role; onLogout: () => void }) {
  return (
    <>
      <div className="flex items-center justify-between border-b px-5 py-4">
        <Link to="/" className="flex items-center gap-2 font-black text-primary text-lg">
          <Leaf className="h-6 w-6" /> AgroVault
        </Link>
        <button onClick={onLogout} className="rounded-md p-1.5 text-muted-foreground hover:bg-accent" title="خروج"><LogOut className="h-4 w-4" /></button>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {items.map((i) => {
          const active = i.to === "/dashboard" ? path === "/dashboard" : path.startsWith(i.to);
          return (
            <Link key={i.to} to={i.to} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${active ? "bg-primary text-primary-foreground shadow-sm" : "text-foreground hover:bg-sidebar-accent"}`}>
              {i.icon}{i.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-4 text-xs text-muted-foreground">
        {user.profile?.full_name || user.email} · {ROLE_LABEL[role]}
      </div>
    </>
  );
}

class SafeBoundary extends React.Component<{ children: ReactNode }, { err: Error | null }> {
  state = { err: null as Error | null };
  static getDerivedStateFromError(err: Error) { return { err }; }
  componentDidCatch(err: Error) { console.error("Dashboard error:", err); }
  render() {
    if (this.state.err) {
      return (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
          <h2 className="font-bold text-destructive">حدث خطأ في عرض هذا القسم</h2>
          <p className="mt-2 text-sm text-muted-foreground">{this.state.err.message}</p>
          <button onClick={() => this.setState({ err: null })} className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">إعادة المحاولة</button>
        </div>
      );
    }
    return this.props.children;
  }
}
