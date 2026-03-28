import { ExpenseForm } from "@/components/expenses/expense-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getExpenseCategories } from "@/actions/expense";

export default async function NewExpensePage() {
  const categories = await getExpenseCategories();

  return (
    <div className="flex-1 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/expenses"><ArrowLeft className="h-5 w-5" /></Link>
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">Add Expense</h2>
      </div>
      <div className="mt-6"><ExpenseForm categories={categories} /></div>
    </div>
  );
}
