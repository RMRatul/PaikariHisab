import { getExpenses, getExpenseCategories } from "@/actions/expense";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { Plus, Receipt, Wallet, Banknote, Calendar } from "lucide-react";
import { CategoryManager } from "@/components/expenses/category-manager";
import { ExpenseActions } from "@/components/expenses/expense-actions";

export const dynamic = "force-dynamic";

export default async function ExpensesPage() {
  const [expenses, categories] = await Promise.all([
    getExpenses(),
    getExpenseCategories()
  ]);
  
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const thisMonth = expenses.filter(e => {
    const d = new Date(e.date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="flex-1 space-y-10 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 font-outfit">
             Expense <span className="text-indigo-600">Manager</span>
          </h1>
          <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-2 flex items-center gap-2">
             <Banknote className="h-3.5 w-3.5 text-indigo-500" /> Track and manage your daily business expenses
          </p>
        </div>
        <div className="flex gap-3">
           <Button asChild className="h-12 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 gap-2 active:scale-95 transition-all">
             <Link href="/expenses/new"><Plus className="h-5 w-5" /> Add New Expense</Link>
           </Button>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-4 items-start">
        <div className="md:col-span-1 sticky top-24">
           <CategoryManager categories={categories} />
        </div>

        <div className="md:col-span-3 space-y-8">
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
             {/* KPI: Monthly Total */}
             <div className="group relative bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col justify-between hover:bg-slate-50 transition-colors">
                <div>
                   <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Monthly Total</p>
                   <h3 className="text-3xl font-black text-rose-600 font-outfit">Tk {thisMonth.toLocaleString()}</h3>
                </div>
                <p className="mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                   <Calendar className="h-3 w-3 text-rose-500" /> This month's expenses
                </p>
             </div>

             {/* KPI: Cumulative Total */}
             <div className="group relative bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl transition-all hover:translate-y-[-4px] overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:rotate-12 transition-transform duration-700">
                   <Wallet className="h-20 w-20 text-white" />
                </div>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-1">Total Expenses</p>
                <h3 className="text-3xl font-black text-white font-outfit">Tk {total.toLocaleString()}</h3>
                <div className="mt-6 flex items-center gap-2 text-indigo-400 text-[10px] font-black uppercase tracking-widest">
                   All-time spending
                </div>
             </div>
          </div>

          <Card className="border-none shadow-2xl shadow-slate-200/60 rounded-[3rem] overflow-hidden bg-white">
            <CardHeader className="flex flex-col md:flex-row items-center justify-between border-b border-slate-50 bg-slate-50/20 px-10 py-8 gap-6">
              <div>
                 <CardTitle className="text-xl font-black text-slate-900 font-outfit">Expense History</CardTitle>
                 <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">List of all recorded expenses</p>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="relative max-h-[500px] overflow-auto custom-scrollbar border border-slate-100/50 rounded-2xl shadow-sm bg-white">
                <Table>
                  <TableHeader className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                    <TableRow className="hover:bg-transparent border-b-slate-100">
                      <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 py-6 pl-10">Date</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 py-6">Category</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 py-6">Description</TableHead>
                      <TableHead className="text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 py-6">Amount</TableHead>
                      <TableHead className="text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 py-6 pr-10">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenses.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-64 text-center">
                           <div className="flex flex-col items-center justify-center text-slate-300 gap-4">
                              <Receipt className="h-12 w-12 opacity-20" />
                              <p className="text-sm font-black uppercase tracking-widest">No Expenses Found</p>
                           </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      expenses.map((e) => (
                        <TableRow key={e.id} className="group border-b-slate-50 hover:bg-slate-50/50 transition-all">
                          <TableCell className="py-6 pl-10 font-medium text-slate-500 text-xs">
                             {new Date(e.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                          </TableCell>
                          <TableCell className="py-6">
                             <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-100/50 text-indigo-600 text-[9px] font-black uppercase tracking-widest rounded-full shadow-sm">
                                {e.category.name}
                             </span>
                          </TableCell>
                          <TableCell className="py-6">
                             <div className="flex flex-col">
                                <span className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">
                                   {e.description || "No description"}
                                </span>
                             </div>
                          </TableCell>
                          <TableCell className="py-6 text-right font-black text-rose-600 tabular-nums">
                             Tk {e.amount.toLocaleString()}
                          </TableCell>
                          <TableCell className="py-6 text-right pr-10">
                             <ExpenseActions id={e.id} description={e.description} />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
