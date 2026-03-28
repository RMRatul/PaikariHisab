import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Users,
  Package,
  TrendingUp,
  ArrowUpRight,
  Clock,
  Activity,
  Zap,
  DollarSign,
  ShoppingCart,
  ReceiptText
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getDashboardData() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [
    customersCount, 
    inventoryStats, 
    sales, 
    standalonePayments, 
    totalSalesAggregate, 
    todaySalesAggregate,
    receivables,
    payables
  ] = await Promise.all([
    db.customer.count(),
    db.product.findMany({ select: { stock: true, purchasePrice: true } }),
    db.sale.findMany({ 
      include: { customer: { select: { name: true } } },
      orderBy: { createdAt: "desc" }, 
      take: 8 
    }),
    db.transaction.findMany({
      where: {
        date: { gte: todayStart },
      },
    }),
    db.sale.aggregate({ _sum: { totalAmount: true } }),
    db.sale.aggregate({
      _sum: { paidAmount: true },
      where: { date: { gte: todayStart } },
    }),
    db.customer.aggregate({ _sum: { dueBalance: true } }),
    db.supplier.aggregate({ _sum: { dueBalance: true } }),
  ]);

  const totalSales = totalSalesAggregate._sum.totalAmount || 0;
  const todayCollection = (todaySalesAggregate._sum.paidAmount || 0) + 
                          standalonePayments.reduce((sum, t) => sum + t.amount, 0);
  
  // Calculate approximate Cash on Hand from all transactions
  const allWalletTransactions = await db.transaction.findMany({ select: { amount: true, type: true } });
  const totalCashIn = allWalletTransactions.filter(t => t.type === "IN").reduce((acc, t) => acc + t.amount, 0);
  const totalCashOut = allWalletTransactions.filter(t => t.type === "OUT").reduce((acc, t) => acc + t.amount, 0);
  const estimatedCash = totalCashIn - totalCashOut;

  const totalReceivables = receivables._sum.dueBalance || 0;
  const totalPayables = payables._sum.dueBalance || 0;
  const inventoryValue = inventoryStats.reduce((acc, p) => acc + (p.stock * p.purchasePrice), 0);
  
  // Adjusted Net Worth: Inventory + Receivables + Liquid Cash - Payables
  const netWorth = inventoryValue + totalReceivables + estimatedCash - totalPayables;

  return {
    totalCustomers: customersCount,
    totalStockValue: inventoryStats.reduce((acc, p) => acc + p.stock, 0),
    totalSales,
    todayCollection,
    recentSales: sales,
    netWorth,
    totalReceivables,
    totalPayables
  };
}


export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="flex-1 space-y-10 pb-10 max-w-7xl mx-auto">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black tracking-tight text-slate-900 font-outfit">
             Dashboard <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">(ড্যাশবোর্ড)</span>
          </h1>
          <div className="text-slate-400 font-bold uppercase tracking-[0.25em] text-[10px] mt-3 flex items-center gap-2">
             <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
             System Status: Active (সিস্টেম চালু)
          </div>
        </div>
        <div className="flex items-center gap-3">
           <div className="px-5 py-2.5 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
              <Clock className="h-4 w-4 text-indigo-500" />
              <span className="text-xs font-black uppercase text-slate-600 tracking-wider">
                {new Date().toLocaleDateString("en-BD", { month: 'short', day: '2-digit', year: 'numeric' })}
              </span>
           </div>
        </div>
      </div>

      {/* Primary KPI Grid (Bento Style) */}
      <div className="grid gap-6 md:grid-cols-4 lg:grid-cols-4">
        {/* Main Revenue Card - Transformed to Net Worth */}
        <div className="md:col-span-2 group relative overflow-hidden bg-slate-900 rounded-[2.5rem] p-10 shadow-2xl transition-all hover:translate-y-[-4px]">
           <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-all duration-700 -rotate-12 group-hover:rotate-0">
              <TrendingUp className="h-32 w-32 text-white" />
           </div>
           <div className="relative z-10">
               <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] mb-2">Total Capital (মোট মূলধন)</p>
               <h3 className="text-5xl font-black text-white font-outfit tabular-nums">Tk {data.netWorth.toLocaleString()}</h3>
              <div className="mt-8 flex items-center gap-3">
                 <div className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                    <ArrowUpRight className="h-3 w-3" /> Good Status (ভালো অবস্থা)
                 </div>
                 <p className="text-slate-500 text-[10px] font-bold uppercase">Cash + Stock + Due - Payable (সম্পদ - দায়)</p>
              </div>
           </div>
        </div>

        {/* Secondary KPIs */}
        <div className="group relative bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col justify-between hover:bg-slate-50 transition-colors">
           <div>
              <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center mb-6">
                 <DollarSign className="h-6 w-6 text-indigo-600" />
              </div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Total Receivables (মোট পাওনা)</p>
              <h3 className="text-3xl font-black text-slate-900 font-outfit text-rose-600">Tk {data.totalReceivables.toLocaleString()}</h3>
           </div>
           <p className="mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <Activity className="h-3 w-3" /> Money People Owe You
           </p>
        </div>

        <div className="group relative bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col justify-between hover:bg-slate-50 transition-colors">
           <div>
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center mb-6">
                 <Users className="h-6 w-6 text-emerald-600" />
              </div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Total Customers (মোট কাস্টমার)</p>
              <h3 className="text-3xl font-black text-slate-900 font-outfit">{data.totalCustomers}</h3>
           </div>
           <p className="mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Customers</p>
        </div>
      </div>

      {/* Activity & Intelligence Section */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Ledger Pulse */}
        <div className="lg:col-span-8 bg-white rounded-[3rem] p-10 shadow-2xl border border-slate-50">
           <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-2xl font-black text-slate-900 font-outfit">Recent Transactions (সাম্প্রতিক লেনদেন)</h2>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.25em] mt-1">Live Updates</p>
              </div>
              <Link href="/sales" className="h-10 px-5 bg-slate-900 text-white rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-all active:scale-95 group">
                 <span className="text-[10px] font-black uppercase tracking-widest">All Sales (সব বিক্রি)</span>
                 <ArrowUpRight className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
           </div>

           <div className="space-y-3">
              {data.recentSales.map((sale) => (
                <div key={sale.id} className="group relative flex items-center justify-between p-6 rounded-[2rem] hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                   <div className="flex items-center gap-5">
                      <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center group-hover:bg-white transition-colors shadow-sm">
                         <ReceiptText className="h-6 w-6 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                      </div>
                      <div>
                         <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">
                            INV-{sale.id.slice(-6).toUpperCase()}
                         </p>
                         <p className="text-base font-black text-slate-900">{(sale.customer as any)?.name || 'Walk-in'}</p>
                         <p className="text-[10px] font-bold text-slate-400 uppercase">{new Date(sale.date).toLocaleDateString("en-BD", { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-lg font-black text-slate-900">Tk {sale.totalAmount.toLocaleString()}</p>
                      <span className="inline-block px-3 py-1 bg-white border rounded-full text-[9px] font-black uppercase tracking-widest text-slate-500 mt-1 shadow-sm">
                         Done (সম্পন্ন)
                      </span>
                   </div>
                </div>
              ))}
              {data.recentSales.length === 0 && (
                 <div className="h-64 flex flex-col items-center justify-center text-slate-300 gap-4">
                    <Activity className="h-12 w-12 opacity-20" />
                    <p className="text-sm font-black uppercase tracking-widest">No Transactions Yet (কোনো লেনদেন নেই)</p>
                 </div>
              )}
           </div>
        </div>

        {/* Intelligence Actions */}
        <div className="lg:col-span-4 space-y-8">
           {/* Growth Promo */}
           <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute -bottom-10 -right-10 opacity-20 group-hover:scale-125 transition-transform duration-[2s]">
                 <Zap className="h-64 w-64" />
              </div>
              <div className="relative z-10">
                <h2 className="text-3xl font-black font-outfit mb-4">Business Reports (ব্যবসার রিপোর্ট)</h2>
                <p className="text-indigo-100 text-sm font-medium mb-10 leading-relaxed opacity-80">
                   View all your business reports and analytics here.
                </p>
                <Link href="/reports" className="inline-flex items-center gap-3 px-8 py-4 bg-white text-indigo-600 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] shadow-lg hover:shadow-indigo-500/40 hover:-translate-y-1 transition-all">
                   View Reports (রিপোর্ট দেখুন)
                </Link>
              </div>
           </div>

           {/* Quick Operations */}
           <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-xl">
              <h2 className="text-xl font-black font-outfit text-slate-900 mb-8">Quick Links (কুইক লিঙ্ক)</h2>
              <div className="grid grid-cols-2 gap-4">
                 <Link href="/sales/new" className="flex flex-col items-center justify-center gap-3 p-6 rounded-[2rem] bg-slate-50 hover:bg-indigo-50 border border-slate-100 hover:border-indigo-100 transition-all group">
                    <div className="h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center group-hover:bg-indigo-600 transition-transform duration-300">
                       <ShoppingCart className="h-6 w-6 text-slate-400 group-hover:text-white" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 group-hover:text-indigo-600">New Sale (নতুন মেমো)</span>
                 </Link>
                 <Link href="/inventory" className="flex flex-col items-center justify-center gap-3 p-6 rounded-[2rem] bg-slate-50 hover:bg-indigo-50 border border-slate-100 hover:border-indigo-100 transition-all group">
                    <div className="h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center group-hover:bg-indigo-600 transition-transform duration-300">
                       <Package className="h-6 w-6 text-slate-400 group-hover:text-white" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 group-hover:text-indigo-600">Add Stock (নতুন স্টক)</span>
                 </Link>
              </div>
           </div>

           {/* Inventory Pulse */}
           <div className="bg-slate-50 rounded-[3rem] p-8 flex items-center justify-between border border-transparent hover:border-slate-200 transition-colors">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-slate-400">
                   <Package className="h-7 w-7" />
                </div>
                <div>
                   <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Total Stock (মোট স্টক)</p>
                   <p className="text-2xl font-black text-slate-900">{data.totalStockValue.toLocaleString()} Unit</p>
                </div>
              </div>
              <Link href="/inventory" className="h-10 w-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center group hover:bg-slate-900 transition-colors">
                 <ArrowUpRight className="h-5 w-5 text-slate-400 group-hover:text-white" />
              </Link>
           </div>
        </div>
      </div>
    </div>
  );
}
