import { getCustomers } from "@/actions/customer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { Plus, Users, Wallet, CheckCircle2, AlertTriangle, TrendingUp } from "lucide-react";
import { SearchBar } from "@/components/ui/search-bar";
import { Suspense } from "react";
import { CustomerTable } from "@/components/customers/customer-table";

export const dynamic = "force-dynamic";

export default async function CustomersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const customers = await getCustomers(q);
  const totalDue = customers.reduce((s, c) => s + c.dueBalance, 0);

  return (
    <div className="flex-1 space-y-10 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 font-outfit">
             Customers <span className="text-indigo-600">(কাস্টমার)</span>
          </h1>
          <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-2 flex items-center gap-2">
             <Users className="h-3.5 w-3.5 text-indigo-500" /> Manage all your customers here
          </p>
        </div>
        <div className="flex gap-3">
           <Button asChild className="h-12 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 gap-2 active:scale-95 transition-all">
             <Link href="/customers/new"><Plus className="h-5 w-5" /> New Customer (নতুন কাস্টমার)</Link>
           </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {/* KPI: Total Clients */}
        <div className="group relative bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl transition-all hover:translate-y-[-4px] overflow-hidden">
           <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:rotate-12 transition-transform duration-700">
              <Users className="h-20 w-20 text-white" />
           </div>
           <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-1">Total Customers (মোট কাস্টমার)</p>
           <h3 className="text-3xl font-black text-white font-outfit">{customers.length}</h3>
           <div className="mt-6 flex items-center gap-2 text-indigo-400 text-[10px] font-black uppercase tracking-widest">
              Total active customers
           </div>
        </div>

        {/* KPI: Total Receivables */}
        <div className="group relative bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col justify-between hover:bg-slate-50 transition-colors">
           <div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Total Due (মোট বকেয়া)</p>
              <h3 className="text-3xl font-black text-rose-600 font-outfit">Tk {totalDue.toLocaleString()}</h3>
           </div>
           <p className="mt-4 text-[10px] font-bold text-rose-500 uppercase tracking-widest flex items-center gap-1">
              <Wallet className="h-3 w-3" /> Total money people owe
           </p>
        </div>

        {/* KPI: Settled Accounts */}
        <div className="group relative bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col justify-between hover:bg-slate-50 transition-colors">
           <div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">No Due (বকেয়া নেই)</p>
              <h3 className="text-3xl font-black text-emerald-600 font-outfit">{customers.filter(c => c.dueBalance <= 0).length}</h3>
           </div>
           <p className="mt-4 text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> Customers with zero due
           </p>
        </div>

        {/* KPI: High Exposure */}
        <div className="group relative bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col justify-between hover:bg-slate-50 transition-colors">
           <div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">High Due (বেশি বকেয়া)</p>
              <h3 className="text-3xl font-black text-slate-900 font-outfit">{customers.filter(c => c.dueBalance > 50000).length}</h3>
           </div>
           <p className="mt-4 text-[10px] font-bold text-amber-500 uppercase tracking-widest flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" /> Customers owing {'>'} 50,000
           </p>
        </div>
      </div>

      <Card className="border-none shadow-2xl shadow-slate-200/60 rounded-[3rem] overflow-hidden bg-white">
        <CardHeader className="flex flex-col md:flex-row items-center justify-between border-b border-slate-50 bg-slate-50/20 px-10 py-8 gap-6">
          <div>
             <CardTitle className="text-xl font-black text-slate-900 font-outfit">Customer List (কাস্টমার লিস্ট)</CardTitle>
             <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">List of all customers</p>
          </div>
          <div className="w-full md:w-auto">
             <Suspense>
                 <SearchBar placeholder="Search customer by name, phone, shop..." />
             </Suspense>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <CustomerTable customers={customers} q={q} />
        </CardContent>
      </Card>
    </div>
  );
}
