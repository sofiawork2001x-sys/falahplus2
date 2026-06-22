import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client"; 
import { useSession } from "@/lib/auth"; 

export const Route = createFileRoute('/dashboard/payment')({
  component: PaymentPage,
});

function PaymentPage() {
  const user = useSession(); 
  const [loading, setLoading] = useState(false);
  
  // States الحقيقية المعرفة في ملفكِ
  const [farmerName, setFarmerName] = useState("");
  const [cardNumber, setCardNumber] = useState("");

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmerName.trim() || !cardNumber.trim()) return;
    
    setLoading(true);

    try {
      // نرسل البيانات باستخدام حقول جدول consultations المتوفرة
      const { error } = await supabase
        .from("consultations")
        .insert({
          farmer_id: user?.id ?? "", 
          type: "technical", // تحديد نوع الاستشارة الفنية الافتراضي ليتوافق مع الـ Enum
          title: `طلب دفع - ${farmerName.trim()}`, // نضع الاسم في العنوان
          body: `رقم البطاقة أو الحساب: ${cardNumber.trim()}`, // نضع رقم الحساب في التفاصيل
          status: "open" // الحالة المفتوحة والمسموحة في السكيمة
        });

      if (error) throw error;

      alert("تم إرسال طلب الدفع بنجاح! سيتم مراجعته وتنشيطه من قبل المسؤول فوراً. 🎉");
      
      // تفريغ الحقول بعد النجاح
      setFarmerName("");
      setCardNumber("");

    } catch (error: any) {
      alert("حدث خطأ أثناء إرسال الطلب: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl p-8" dir="rtl">
      <h1 className="text-2xl font-black">إتمام عملية الدفع</h1>
      <p className="mt-2 text-muted-foreground">الرجاء إدخال تفاصيل الدفع لتأكيد طلبك.</p>
      
      <form onSubmit={handlePayment} className="mt-8 space-y-4 rounded-2xl border bg-card p-6 shadow-sm">
        <div>
          <label className="block text-sm font-bold mb-1">اسم صاحب البطاقة</label>
          <input 
            required 
            type="text" 
            value={farmerName}
            onChange={(e) => setFarmerName(e.target.value)}
            className="w-full rounded-xl border bg-background p-3 focus:outline-none focus:border-primary" 
            placeholder="أدخل اسمك الكامل" 
          />
        </div>
        <div>
          <label className="block text-sm font-bold mb-1">رقم البطاقة / الحساب</label>
          <input 
            required 
            type="text" 
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            className="w-full rounded-xl border bg-background p-3 focus:outline-none focus:border-primary text-left" dir="ltr"
            placeholder="xxxx-xxxx-xxxx-xxxx" 
          />
        </div>
        <button 
          disabled={loading}
          type="submit" 
          className="w-full rounded-xl bg-primary py-3 font-black text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition"
        >
          {loading ? "جاري إرسال الطلب..." : "تأكيد الدفع"}
        </button>
      </form>
    </div>
  );
}