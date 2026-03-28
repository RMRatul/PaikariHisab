"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { collectPayment } from "@/actions/customer";

const METHODS = ["CASH", "BANK TRANSFER", "bKash", "Nagad", "Rocket"];

export function CollectPaymentForm({ customerId, currentDue }: { customerId: string; currentDue: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [amount, setAmount] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [method, setMethod] = useState("CASH");
  const [description, setDescription] = useState("");

  const totalDeduction = amount + discount;
  const newDue = currentDue - totalDeduction;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0 && discount <= 0) { setError("Amount or discount must be greater than 0 (অংক ০ এর বেশি হতে হবে)"); return; }
    if (totalDeduction > currentDue) { 
      const msg = `Cannot collect more than current due (বাকি বিলের চেয়ে বেশি জমা নেয়া যাবে না: Tk ${currentDue.toFixed(2)})`;
      setError(msg);
      alert(msg);
      return; 
    }
    setLoading(true);
    const result = await collectPayment({ customerId, amount, discount, method, description });
    if (result.success) { 
      setAmount(0);
      setDiscount(0);
      setDescription("");
      setError("");
      setLoading(false);
      router.refresh(); 
    }
    else { setError(result.error || "Error"); setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      {error && <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md">{error}</div>}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Money Received (টাকা দিয়েছেন)</label>
          <Input type="number" step="0.01" min="0" value={amount || ""} onChange={e => setAmount(parseFloat(e.target.value) || 0)} onFocus={(e) => e.target.select()} className="h-12 rounded-xl border-2 border-slate-50 font-bold text-slate-900 focus:border-indigo-400 transition-all" placeholder="0.00" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Discount (ছাড়)</label>
          <Input type="number" step="0.01" min="0" value={discount || ""} onChange={e => setDiscount(parseFloat(e.target.value) || 0)} onFocus={(e) => e.target.select()} className="h-12 rounded-xl border-2 border-slate-50 font-bold text-slate-900 focus:border-indigo-400 transition-all" placeholder="0.00" />
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Payment Mode (পেমেন্ট মাধ্যম)</label>
        <select className="flex h-12 w-full rounded-xl border-2 border-slate-50 bg-white px-3 py-2 text-sm font-bold text-slate-900 focus:outline-none focus:border-indigo-400 transition-all appearance-none" value={method} onChange={e => setMethod(e.target.value)}>
          {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>
      <div className="space-y-1">
        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Note / বিবরণ (ঐচ্ছিক)</label>
        <Input value={description} onChange={e => setDescription(e.target.value)} className="h-12 rounded-xl border-2 border-slate-50 font-bold text-slate-900 focus:border-indigo-400 transition-all" placeholder="e.g. Collection" />
      </div>
      {(amount > 0 || discount > 0) && (
        <div className="bg-slate-900 text-white rounded-2xl p-4 text-xs space-y-2 shadow-xl">
          <div className="flex justify-between opacity-60"><span>Total Adjustment (মোট সমন্বয়):</span><span className="font-bold">Tk {totalDeduction.toFixed(2)}</span></div>
          <div className="flex justify-between border-t border-white/5 pt-2"><span>New Due (নতুন বাকি):</span><span className={`font-black text-sm tabular-nums ${newDue > 0 ? "text-amber-400" : "text-emerald-400"}`}>Tk {newDue.toFixed(2)}</span></div>
        </div>
      )}
      <Button type="submit" disabled={loading} className="w-full h-14 rounded-2xl bg-indigo-600 border-b-4 border-indigo-800 hover:translate-y-1 hover:border-b-0 transition-all shadow-xl shadow-indigo-200 text-white font-black uppercase tracking-widest text-[10px]">
        {loading ? "Processing..." : "✓ Confirm Payment (পেমেন্ট কনফার্ম করুন)"}
      </Button>
    </form>
  );
}
