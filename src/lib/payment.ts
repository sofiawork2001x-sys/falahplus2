// src/lib/payment.ts
import { supabase } from "./supabase"; // افترضي أنكِ تملكين هذا الملف

export const submitPayment = async (amount: number, transactionRef: string) => {
  const { data, error } = await supabase
    .from("payments")
    .insert([
      { 
        amount, 
        transaction_ref: transactionRef, 
        status: "pending" 
      }
    ]);

  if (error) throw error;
  return data;
};