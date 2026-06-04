import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

export const Route = createFileRoute('/dashboard/payment')({
  component: PaymentPage,
});

function PaymentPage() {
  const [loading, setLoading] = useState(false);

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // هنا مستقبلاً تربطين بـ Stripe أو API الدفع الخاص بك
    setTimeout(() => {
      alert("تم إرسال طلب الدفع بنجاح! سيتم مراجعته.");
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="mx-auto max-w-xl p-8">
      <h1 className="text-2xl font-black">إتمام عملية الدفع</h1>
      <p className="mt-2 text-muted-foreground">الرجاء إدخال تفاصيل الدفع لتأكيد طلبك.</p>
      
      <form onSubmit={handlePayment} className="mt-8 space-y-4 rounded-2xl border bg-card p-6 shadow-sm">
        <div>
          <label className="block text-sm font-bold mb-1">اسم صاحب البطاقة</label>
          <input required type="text" className="w-full rounded-xl border p-3" placeholder="أدخل اسمك الكامل" />
        </div>
        <div>
          <label className="block text-sm font-bold mb-1">رقم البطاقة / الحساب</label>
          <input required type="text" className="w-full rounded-xl border p-3" placeholder="xxxx-xxxx-xxxx-xxxx" />
        </div>
        <button 
          disabled={loading}
          type="submit" 
          className="w-full rounded-xl bg-primary py-3 font-black text-primary-foreground hover:bg-primary/90"
        >
          {loading ? "جاري المعالجة..." : "تأكيد الدفع"}
        </button>
      </form>
    </div>
  );
}