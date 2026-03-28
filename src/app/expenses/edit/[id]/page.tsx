import { ExpenseForm } from "@/components/expenses/expense-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getExpenseCategories } from "@/actions/expense";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";

export default async function EditExpensePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [categories, expense] = await Promise.all([
    db.expenseCategory.findMany({ orderBy: { name: "asc" } }),
    db.expense.findUnique({ where: { id } })
  ]);

  if (!expense) notFound();

  // Pick only necessary fields and ensure they are serializable
  const serializedExpense = {
    id: expense.id,
    amount: expense.amount,
    categoryId: expense.categoryId,
    description: expense.description,
    date: expense.date.toISOString(), // Convert Date to ISO string
  };

  const serializedCategories = categories.map(c => ({
    id: c.id,
    name: c.name
  }));

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="rounded-full hover:bg-slate-100">
          <Link href="/expenses"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <div>
          <h2 className="text-3xl font-black text-slate-900 font-outfit uppercase tracking-tight">Edit <span className="text-indigo-600">Expense</span></h2>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-1">Transaction Ref: {id}</p>
        </div>
      </div>
      <div className="mt-8">
        <ExpenseForm categories={serializedCategories} initialData={serializedExpense} />
      </div>
    </div>
  );
}
