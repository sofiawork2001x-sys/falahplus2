import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, CloudRain, Info } from "lucide-react";

interface Alert { id: string; message: string; severity: string; created_at: string; }

const STYLES: Record<string, { cls: string; icon: any; label: string }> = {
  danger:  { cls: "bg-destructive text-destructive-foreground border-destructive", icon: AlertTriangle, label: "تنبيه خطير" },
  warning: { cls: "bg-yellow-500 text-black border-yellow-600",                    icon: CloudRain,     label: "تحذير جوي" },
  info:    { cls: "bg-primary text-primary-foreground border-primary",             icon: Info,          label: "إشعار جوي" },
};

export function WeatherAlertBanner() {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("weather_alerts").select("*")
        .eq("active", true).order("created_at", { ascending: false }).limit(3);
      setAlerts((data as any) ?? []);
    };
    load();
    const ch = supabase.channel("weather-alerts")
      .on("postgres_changes", { event: "*", schema: "public", table: "weather_alerts" }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  if (!alerts.length) return null;

  return (
    <div className="space-y-2">
      {alerts.map((a) => {
        const s = STYLES[a.severity] ?? STYLES.info;
        const Icon = s.icon;
        return (
          <div key={a.id} className={`flex items-start gap-3 rounded-xl border-2 px-4 py-4 shadow-lg lg:px-6 lg:py-5 ${s.cls}`}>
            <Icon className="mt-0.5 h-7 w-7 shrink-0 lg:h-8 lg:w-8" />
            <div className="min-w-0 flex-1">
              <div className="text-xs font-black uppercase tracking-wider opacity-90">{s.label}</div>
              <p className="mt-1 text-base font-bold leading-relaxed lg:text-lg">{a.message}</p>
              <p className="mt-1 text-[11px] opacity-80">{new Date(a.created_at).toLocaleString("ar-DZ")}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
