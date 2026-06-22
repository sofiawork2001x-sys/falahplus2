import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/auth";
import { 
  Shield, 
  FileText, 
  AlertTriangle, 
  XCircle, 
  ArrowLeftRight,
  TrendingUp,
  CloudLightning,
  CreditCard
} from 'lucide-react';

export const Route = createFileRoute('/dashboard/admin')({
  component: AdminPanel,
});

function AdminPanel() {
  const user = useSession();
  const [activeTab, setActiveTab] = useState<'stats' | 'diseases' | 'weather' | 'payments'>('payments');
  
  // States للبيانات المختلفة
  const [alerts, setAlerts] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // دالة جلب التنبيهات الجوية
  const loadAlerts = async () => {
    const { data } = await supabase
      .from("weather_alerts")
      .select("*")
      .order("created_at", { ascending: false });
    setAlerts((data as any) ?? []);
  };

  // دالة جلب طلبات الدفع والاستشارات المفتوحة للمراجعة (تم الإصلاح هنا باستخدام حالة "open")
  const loadPayments = async () => {
    const { data } = await supabase
      .from("consultations")
      .select("*")
      .eq("status", "open")
      .order("created_at", { ascending: false });
    setPayments((data as any) ?? []);
  };

  useEffect(() => {
    if (!user) return;
    loadAlerts();
    loadPayments();
  }, [user?.id]);

  // دالة قبول الطلب وتحديث حالته إلى "answered" ليختفي من قائمة المراجعة المعلقة
  const handleApproveAndAssign = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("consultations")
        .update({ 
          status: "answered" 
        })
        .eq("id", id);

      if (error) throw error;
      alert("تمت الموافقة على طلب الدفع وتنشيط الاستشارة بنجاح! 🎉");
      await loadPayments();
    } catch (error: any) {
      alert("حدث خطأ أثناء التحديث: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // دالة رفض الطلب وتحويل حالته إلى "closed"
  const handleRejectPayment = async (id: string) => {
    if (!confirm("هل أنت متأكد من رفض هذا الطلب؟")) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from("consultations")
        .update({ 
          status: "closed" 
        })
        .eq("id", id);

      if (error) throw error;
      alert("تم رفض الطلب بنجاح.");
      await loadPayments();
    } catch (error: any) {
      alert("حدث خطأ: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6" dir="rtl">
      {/* الهيدر العلوي */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-card p-6 rounded-2xl border shadow-sm gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-black text-foreground">لوحة المسؤول (Admin)</h1>
          </div>
          <p className="text-muted-foreground mt-1">إدارة كاملة للتنبيهات، إحصائيات المحاصيل، وطلبات الدفع الواردة من الفلاحين.</p>
        </div>
        <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-xl font-bold text-sm">
          <span>مرحباً، {user?.email?.split('@')[0] || "المسؤول"}</span>
          <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-md">مسؤول</span>
        </div>
      </div>

      {/* التبويبات الرئيسية بتصميم Prestige ومودرن */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-muted/40 p-1.5 rounded-2xl border">
        <button
          onClick={() => setActiveTab('payments')}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'payments' 
              ? 'bg-primary text-primary-foreground shadow-sm' 
              : 'hover:bg-muted text-muted-foreground'
          }`}
        >
          <CreditCard className="h-4 w-4" />
          مراجعة طلبات الدفع
        </button>

        <button
          onClick={() => setActiveTab('stats')}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'stats' 
              ? 'bg-primary text-primary-foreground shadow-sm' 
              : 'hover:bg-muted text-muted-foreground'
          }`}
        >
          <TrendingUp className="h-4 w-4" />
          إحصائيات الولايات
        </button>

        <button
          onClick={() => setActiveTab('diseases')}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'diseases' 
              ? 'bg-primary text-primary-foreground shadow-sm' 
              : 'hover:bg-muted text-muted-foreground'
          }`}
        >
          <FileText className="h-4 w-4" />
          أمراض المحاصيل
        </button>

        <button
          onClick={() => setActiveTab('weather')}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'weather' 
              ? 'bg-primary text-primary-foreground shadow-sm' 
              : 'hover:bg-muted text-muted-foreground'
          }`}
        >
          <CloudLightning className="h-4 w-4" />
          تنبيهات الطقس
        </button>
      </div>

      {/* المحتوى المتغير حسب التبويب النشط */}
      <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
        {activeTab === 'payments' && (
          <div className="p-6 space-y-4">
            <div className="border-b pb-4">
              <h2 className="text-xl font-black text-foreground flex items-center gap-2">
                💳 مراجعة طلبات الدفع واستشارات الفلاحين الواردة
              </h2>
              <p className="text-sm text-muted-foreground mt-1">تأكيد ومطابقة الحسابات وتوجيه طلب الدعم والاستشارة الفنية فوراً إلى حساب الخبير المناسب.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="border-b bg-muted/30 text-muted-foreground font-bold text-sm">
                    <th className="p-4">العنوان / اسم الفلاح</th>
                    <th className="p-4">رقم البطاقة / الحساب</th>
                    <th className="p-4">تاريخ الإرسال</th>
                    <th className="p-4">حالة الطلب</th>
                    <th className="p-4 text-center">الإجراء والتوجيه</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id} className="border-b hover:bg-muted/10 transition text-sm">
                      <td className="p-4 font-bold text-foreground">{payment.title}</td>
                      <td className="p-4 font-mono text-muted-foreground max-w-xs truncate">{payment.body}</td>
                      <td className="p-4 text-muted-foreground">
                        {new Date(payment.created_at).toLocaleDateString('ar-DZ', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                          <AlertTriangle className="h-3 w-3" />
                          بانتظار المراجعة
                        </span>
                      </td>
                      <td className="p-4 flex items-center justify-center gap-2">
                        <button
                          disabled={loading}
                          onClick={() => handleApproveAndAssign(payment.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 shadow-sm transition disabled:opacity-50"
                        >
                          <ArrowLeftRight className="h-3.5 w-3.5" />
                          قبول وتوجيه للخبير
                        </button>
                        <button
                          disabled={loading}
                          onClick={() => handleRejectPayment(payment.id)}
                          className="bg-destructive/10 hover:bg-destructive/20 text-destructive p-1.5 rounded-xl transition disabled:opacity-50"
                          title="رفض الطلب"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {payments.length === 0 && (
                <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
                  <span className="text-3xl">☕</span>
                  <p className="font-medium text-sm">لا توجد طلبات دفع معلقة بانتظار المراجعة حالياً. كل شيء محدث!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="p-12 text-center text-muted-foreground">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="font-bold">لوحة إحصائيات الولايات والمحاصيل</p>
            <p className="text-sm mt-1">يتم جلب وعرض المساحات المزروعة هنا في الولايات المختلفة.</p>
          </div>
        )}

        {activeTab === 'diseases' && (
          <div className="p-12 text-center text-muted-foreground">
            <FileText className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="font-bold">إدارة سجل أمراض النباتات</p>
            <p className="text-sm mt-1">يمكنك تحديث وتعديل قائمة الأوبئة والتقارير الفلاحية هنا.</p>
          </div>
        )}

        {activeTab === 'weather' && (
          <div className="p-12 text-center text-muted-foreground">
            <CloudLightning className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="font-bold">إرسال التنبيهات الجوية الطارئة</p>
            <p className="text-sm mt-1">أدوات إرسال إشعارات الصقيع والرياح للفلاحين في الولايات المتأثرة.</p>
          </div>
        )}
      </div>
    </div>
  );
}