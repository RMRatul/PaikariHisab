"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Tag, Edit2, Check, X } from "lucide-react";
import { addExpenseCategory, deleteExpenseCategory, updateExpenseCategory } from "@/actions/expense";
import type { ExpenseCategory } from "@/generated/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";

export function CategoryManager({ categories }: { categories: ExpenseCategory[] }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError("");
    const result = await addExpenseCategory({ name });
    if (result.success) {
      setName("");
    } else {
      setError(result.error || "Failed");
    }
    setLoading(false);
  };

  const handleUpdate = async (id: string) => {
    if (!editName.trim()) return;
    setLoading(true);
    const result = await updateExpenseCategory(id, editName);
    if (result.success) {
      setEditingId(null);
    } else {
      alert(result.error);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    return await deleteExpenseCategory(id);
  };

  return (
    <Card className="h-full border-slate-200 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-black flex items-center gap-2 text-slate-800">
           <Tag className="h-5 w-5 text-indigo-600" /> Expense Categories
        </CardTitle>
        <CardDescription className="text-xs font-medium text-slate-500">
          Create groups like "Rent", "Salary", or "Utility" to track spending.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleAdd} className="flex gap-2">
          <Input 
            placeholder="e.g. Office Rent, Electricity..." 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            className="h-10 text-sm border-slate-200 focus:ring-indigo-500"
          />
          <Button type="submit" size="icon" disabled={loading || !name.trim()} className="bg-indigo-600 hover:bg-indigo-700 h-10 w-12 shrink-0">
            {loading ? "..." : <Plus className="h-5 w-5" />}
          </Button>
        </form>
        {error && <p className="text-[10px] text-red-500 font-bold uppercase bg-red-50 px-2 py-1 rounded">{error}</p>}
        
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
          {categories.map(c => (
            <div key={c.id} className="flex items-center justify-between group p-2.5 bg-slate-50 hover:bg-white rounded-xl border border-transparent hover:border-slate-200 transition-all">
              {editingId === c.id ? (
                <div className="flex items-center gap-1 w-full">
                  <Input 
                    value={editName} 
                    onChange={(e) => setEditName(e.target.value)}
                    className="h-8 text-sm py-1 px-2"
                    autoFocus
                  />
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" onClick={() => handleUpdate(c.id)}>
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400" onClick={() => setEditingId(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <span className="text-sm font-bold text-slate-700">{c.name}</span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => {
                        setEditingId(c.id);
                        setEditName(c.name);
                      }}
                      className="h-8 w-8 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <DeleteConfirmDialog 
                      onDelete={() => handleDelete(c.id)}
                      title="Permanently Delete Category?"
                      description="This will fail if there are active expenses linked to this category."
                      itemName={c.name}
                    />
                  </div>
                </>
              )}
            </div>
          ))}
          {categories.length === 0 && (
            <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-2xl">
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest italic">No Categories Yet</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
