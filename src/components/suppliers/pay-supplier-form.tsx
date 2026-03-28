"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { paySupplier } from "@/actions/supplier";

const METHODS = ["CASH", "BANK TRANSFER", "bKash", "Nagad", "Rocket", "Cheque"];

export function PaySupplierForm({ supplierId, currentDue }: { supplierId: string; currentDue: number }) {
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
    if (amount <= 0 && discount <= 0) { setError("Amount or discount must be greater than 0"); return; }
    if (totalDeduction > currentDue) { 
      const msg = `Cannot pay more than current due (Tk ${currentDue.toFixed(2)})`;
      setError(msg);
      alert(msg);
      return; 
    }
    setLoading(true);
    const result = await paySupplier({ supplierId, amount, discount, method, description });
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
          <label className="text-sm font-medium">Amount Paid (Tk)</label>
          <Input type="number" step="0.01" min="0" value={amount || ""} onChange={e => setAmount(parseFloat(e.target.value) || 0)} onFocus={(e) => e.target.select()} className="text-slate-900 font-bold" placeholder="0.00" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Discount (Tk)</label>
          <Input type="number" step="0.01" min="0" value={discount || ""} onChange={e => setDiscount(parseFloat(e.target.value) || 0)} onFocus={(e) => e.target.select()} className="text-slate-900 font-bold" placeholder="0.00" />
        </div>
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium">Payment Method</label>
        <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-slate-900 font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" value={method} onChange={e => setMethod(e.target.value)}>
          {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>
      <div className="space-y-1">
        <label className="text-sm font-medium">Note (optional)</label>
        <Input value={description} onChange={e => setDescription(e.target.value)} className="text-slate-900 font-bold" placeholder="e.g. March payment" />
      </div>
      {(amount > 0 || discount > 0) && (
        <div className="bg-purple-50 border border-purple-200 rounded-md p-3 text-sm space-y-1">
          <div className="flex justify-between"><span>Total Payment:</span><span className="font-bold">Tk {totalDeduction.toFixed(2)}</span></div>
          <div className="flex justify-between"><span>Remaining Due:</span><span className={`font-bold ${newDue > 0 ? "text-purple-600" : "text-green-600"}`}>Tk {newDue.toFixed(2)}</span></div>
        </div>
      )}
      <Button type="submit" disabled={loading} className="w-full h-14 rounded-2xl bg-indigo-600 border-b-4 border-indigo-800 hover:translate-y-1 hover:border-b-0 transition-all shadow-xl shadow-indigo-200 text-white font-black uppercase tracking-widest text-[10px]">
        {loading ? "Processing..." : "✓ Confirm Payment"}
      </Button>
    </form>
  );
}
