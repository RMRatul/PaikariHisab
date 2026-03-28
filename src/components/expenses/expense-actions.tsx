"use client";

import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";
import Link from "next/link";
import { deleteExpense } from "@/actions/expense";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";

export function ExpenseActions({ id, description }: { id: string; description: string | null }) {

  return (
    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <Button variant="ghost" size="icon" asChild className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50">
        <Link href={`/expenses/edit/${id}`}>
          <Edit2 className="h-3.5 w-3.5" />
        </Link>
      </Button>
      <DeleteConfirmDialog 
         onDelete={() => deleteExpense(id)}
         title="Permanently Delete Expense?"
         description="This will instantly remove the operational expense from the ledger. This action cannot be reversed."
         itemName={description || "Operational Expense"}
      />
    </div>
  );
}
