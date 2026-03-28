import { getSuppliers } from "@/actions/supplier";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { Plus, Truck, Wallet, CheckCircle2, Factory, TrendingDown } from "lucide-react";
import { SearchBar } from "@/components/ui/search-bar";
import { Suspense } from "react";
import { SupplierTable } from "@/components/suppliers/supplier-table";

export const dynamic = "force-dynamic";

export default async function SuppliersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const suppliers = await getSuppliers(q);
  const totalDue = suppliers.reduce((s, x) => s + x.dueBalance, 0);

  return (
    <div className="flex-1 space-y-10 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 font-outfit">
             Suppliers <span className="text-indigo-600">(মহাজন)</span>
          </h1>
          <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-2 flex items-center gap-2">
             <Factory className="h-3.5 w-3.5 text-indigo-500" /> Manage all your suppliers here
          </p>
        </div>
        <div className="flex gap-3">
           <Button asChild className="h-12 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 gap-2 active:scale-95 transition-all">
             <Link href="/suppliers/new"><Plus className="h-5 w-5" /> New Supplier (নতুন মহাজন)</Link>
           </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* KPI: Total Suppliers */}
        <div className="group relative bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl transition-all hover:translate-y-[-4px] overflow-hidden">
           <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:rotate-12 transition-transform duration-700">
              <Truck className="h-20 w-20 text-white" />
           </div>
           <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-1">Total Suppliers (মোট মহাজন)</p>
           <h3 className="text-3xl font-black text-white font-outfit">{suppliers.length}</h3>
           <div className="mt-6 flex items-center gap-2 text-indigo-400 text-[10px] font-black uppercase tracking-widest">
              Total active suppliers
           </div>
        </div>

        {/* KPI: Total Payables */}
        <div className="group relative bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col justify-between hover:bg-slate-50 transition-colors">
           <div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Total Due (মোট বকেয়া)</p>
              <h3 className="text-3xl font-black text-rose-600 font-outfit">Tk {totalDue.toLocaleString()}</h3>
           </div>
           <p className="mt-4 text-[10px] font-bold text-rose-500 uppercase tracking-widest flex items-center gap-1">
              <TrendingDown className="h-3 w-3" /> Total money you owe
           </p>
        </div>

        {/* KPI: Cleared Suppliers */}
        <div className="group relative bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col justify-between hover:bg-slate-50 transition-colors">
           <div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">No Due (বকেয়া নেই)</p>
              <h3 className="text-3xl font-black text-emerald-600 font-outfit">{suppliers.filter(s => s.dueBalance <= 0).length}</h3>
           </div>
           <p className="mt-4 text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> Suppliers with zero due
           </p>
        </div>
      </div>

      <Card className="border-none shadow-2xl shadow-slate-200/60 rounded-[3rem] overflow-hidden bg-white">
        <CardHeader className="flex flex-col md:flex-row items-center justify-between border-b border-slate-50 bg-slate-50/20 px-10 py-8 gap-6">
          <div>
             <CardTitle className="text-xl font-black text-slate-900 font-outfit">Supplier List (মহাজন লিস্ট)</CardTitle>
             <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">List of all suppliers</p>
          </div>
          <div className="w-full md:w-auto">
             <Suspense>
                 <SearchBar placeholder="Search supplier by name, company, phone..." />
             </Suspense>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <SupplierTable suppliers={suppliers} q={q} />
        </CardContent>
      </Card>
    </div>
  );
}
