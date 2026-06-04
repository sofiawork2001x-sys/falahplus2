import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/payment')({
  component: PaymentPage,
})

function PaymentPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">دفع المستحقات</h1>
      <p className="mt-4 text-muted-foreground">هنا ستتم عملية الدفع.</p>
    </div>
  )
}