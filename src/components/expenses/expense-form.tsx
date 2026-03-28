"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { addExpense, updateExpense } from "@/actions/expense";
import { Info } from "lucide-react";

import type { ExpenseCategory } from "@/generated/client";

interface ExpenseFormProps {
  categories: { id: string; name: string }[];
  initialData?: {
    id: string;
    amount: number;
    categoryId: string;
    description: string | null;
    date: Date | string;
  };
}

export function ExpenseForm({ categories, initialData }: ExpenseFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      categoryId: formData.get("categoryId") as string,
      amount: parseFloat(formData.get("amount") as string),
      description: formData.get("description") as string,
      date: formData.get("date") as string,
    };

    const result = initialData 
      ? await updateExpense(initialData.id, data)
      : await addExpense(data);

    if (result.success) { 
      router.push("/expenses"); 
      router.refresh();
    } else { 
      setError(result.error || "Error"); 
      setLoading(false); 
    }
  };

  const defaultDate = initialData 
    ? new Date(initialData.date).toISOString().split("T")[0] 
    : new Date().toISOString().split("T")[0];

  return (
    <Card className="max-w-xl border-slate-200 shadow-xl rounded-[2rem] overflow-hidden">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
        <CardTitle className="text-2xl font-black text-slate-900 font-outfit">
          {initialData ? "Edit Expense" : "New Expense"}
        </CardTitle>
        <CardDescription className="text-slate-500 font-medium">
          {initialData ? "Update the details of this expenditure." : "Record a new business expense to track your spending."}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="text-sm font-bold text-red-600 bg-red-50 p-4 rounded-xl border border-red-100">{error}</div>}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                Category <span className="text-rose-500">*</span>
              </label>
              <select 
                name="categoryId" 
                required 
                defaultValue={initialData?.categoryId || ""}
                className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 outline-none"
              >
                <option value="">-- Choose Category --</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                <Info className="h-3 w-3" /> Select what this expense is for.
              </p>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500">
                Date <span className="text-rose-500">*</span>
              </label>
              <Input 
                name="date" 
                type="date" 
                defaultValue={defaultDate} 
                required 
                className="h-12 rounded-xl border-slate-200 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
              Amount (Tk) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
               <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">Tk</span>
               <Input 
                name="amount" 
                type="number" 
                step="0.01" 
                min="0" 
                required 
                placeholder="0.00" 
                defaultValue={initialData?.amount}
                onFocus={(e) => e.target.select()} 
                className="h-12 pl-10 rounded-xl border-slate-200 focus:ring-indigo-500 font-bold text-lg"
              />
            </div>
            <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
              <Info className="h-3 w-3" /> Enter the total amount paid.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-500">
              Description / Notes
            </label>
            <Input 
              name="description" 
              placeholder="e.g. Paid for office electricity bill, snacks for meeting..." 
              defaultValue={initialData?.description || ""}
              className="h-12 rounded-xl border-slate-200 focus:ring-indigo-500"
            />
            <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
              <Info className="h-3 w-3" /> Add a short note to remember this expense later.
            </p>
          </div>

          <div className="pt-6 flex flex-col-reverse sm:flex-row justify-end gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.back()} 
              disabled={loading}
              className="h-12 px-8 rounded-xl font-bold border-slate-200 hover:bg-slate-50 text-slate-600"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="h-12 px-8 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20"
            >
              {loading ? (initialData ? "Updating..." : "Saving...") : (initialData ? "Update Expense" : "Save Expense")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
