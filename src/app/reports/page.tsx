import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, DollarSign, BarChart3, Calendar, PieChart, ArrowUpRight, ArrowDownRight, Package, Percent, FileBarChart, Layers, Wallet, TrendingDown, ShieldCheck, AlertCircle } from "lucide-react";
import { ReportPrint } from "@/components/reports/report-print";
import { BusinessBarChart } from "@/components/reports/business-bar-chart";
import { ExpensePieChart } from "@/components/reports/expense-pie-chart";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function getMonthlyPL(year?: string, month?: string) {
  const whereSales: any = {};
  const wherePurchases: any = {};
  const whereExpenses: any = {};
  const whereReturns: any = {};

  if (year && month) {
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
    const filter = { gte: startDate, lte: endDate };
    whereSales.date = filter;
    wherePurchases.date = filter;
    whereExpenses.date = filter;
    whereReturns.date = filter;
  } else if (year) {
    const startDate = new Date(parseInt(year), 0, 1);
    const endDate = new Date(parseInt(year), 11, 31, 23, 59, 59);
    const filter = { gte: startDate, lte: endDate };
    whereSales.date = filter;
    wherePurchases.date = filter;
    whereExpenses.date = filter;
    whereReturns.date = filter;
  }

  const [sales, purchases, expenses, returns, products, customers, suppliers, transactions] = await Promise.all([
    db.sale.findMany({ where: whereSales, include: { items: { include: { product: true } }, customer: true }, orderBy: { date: "desc" } }),
    db.purchase.findMany({ where: wherePurchases, include: { items: { include: { product: true } }, supplier: true }, orderBy: { date: "desc" } }),
    db.expense.findMany({ where: whereExpenses, include: { category: true }, orderBy: { date: "desc" } }),
    db.return.findMany({ where: whereReturns, include: { items: { include: { product: true } }, customer: true }, orderBy: { date: "desc" } }),
    db.product.findMany({ select: { stock: true, purchasePrice: true } }),
    db.customer.aggregate({ _sum: { dueBalance: true } }),
    db.supplier.aggregate({ _sum: { dueBalance: true } }),
    db.transaction.findMany({ where: { date: whereSales.date }, include: { customer: true, supplier: true }, orderBy: { date: "desc" } }),
  ]);

  const monthMap: Record<string, any> = {};

  const getMonthKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

  const initializeMonth = (date: Date) => {
    const key = getMonthKey(date);
    if (!monthMap[key]) {
      monthMap[key] = {
        month: key,
        label: date.toLocaleDateString("en-BD", { month: "long", year: "numeric" }),
        totalSales: 0, totalCollection: 0, totalPurchases: 0, 
        totalCost: 0, totalExpenses: 0, totalReturns: 0, grossProfit: 0, netProfit: 0,
        salesCount: 0, expenseCount: 0,
        totalUnitsSold: 0, totalUnitsBought: 0,
        cashIn: 0, bankIn: 0, cashOut: 0, bankOut: 0,
        expensesByCategory: {} as Record<string, number>,
        dailyData: {} as Record<string, { date: string, sales: number, expenses: number, purchases: number }>,
        registries: {
          sales: [] as typeof sales,
          purchases: [] as typeof purchases,
          expenses: [] as typeof expenses,
          returns: [] as typeof returns,
          payments: [] as typeof transactions
        }
      };
    }
    return monthMap[key];
  };

  const addDaily = (monthObj: any, date: Date, type: 'sales' | 'expenses' | 'purchases', amount: number) => {
    const day = date.getDate().toString().padStart(2, '0');
    if (!monthObj.dailyData[day]) {
      monthObj.dailyData[day] = { date: day, sales: 0, expenses: 0, purchases: 0 };
    }
    monthObj.dailyData[day][type] += amount;
  };

  sales.forEach(s => {
    const m = initializeMonth(s.date);
    m.totalSales += s.totalAmount;
    m.totalCollection += s.paidAmount;
    m.salesCount++;
    m.registries.sales.push(s);
    addDaily(m, s.date, 'sales', s.totalAmount);
    s.items.forEach(it => {
      m.totalCost += it.costPrice * it.quantity;
      m.totalUnitsSold += it.quantity;
    });
  });

  purchases.forEach(p => {
    const m = initializeMonth(p.date);
    m.totalPurchases += p.totalAmount;
    m.registries.purchases.push(p);
    addDaily(m, p.date, 'purchases', p.totalAmount);
    p.items.forEach(it => m.totalUnitsBought += it.quantity);
  });

  expenses.forEach(e => {
    const m = initializeMonth(e.date);
    m.totalExpenses += e.amount;
    m.expenseCount++;
    m.registries.expenses.push(e);
    addDaily(m, e.date, 'expenses', e.amount);
    const cat = e.category.name;
    m.expensesByCategory[cat] = (m.expensesByCategory[cat] || 0) + e.amount;
    // Assume expenses are cash unless noted, but for audit we prioritize total burn
    m.cashOut += e.amount;
  });

  returns.forEach(r => {
    const m = initializeMonth(r.date);
    m.totalReturns += r.totalAmount;
    m.registries.returns.push(r);
  });

  transactions.forEach(t => {
    const m = initializeMonth(t.date);
    if (t.type === "IN") {
      m.totalCollection += t.amount;
      if (t.method === "CASH") m.cashIn += t.amount;
      else m.bankIn += t.amount;
    } else {
      if (t.method === "CASH") m.cashOut += t.amount;
      else m.bankOut += t.amount;
    }
    m.registries.payments.push(t);
  });

  // Ensure that if a specific month was requested, it's at least present in the map even if no transactions exist
  if (year && month) {
    const key = `${year}-${month.padStart(2, "0")}`;
    if (!monthMap[key]) {
      const dummyDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      initializeMonth(dummyDate);
    }
  }

  const monthsList = Object.values(monthMap).sort((a, b) => b.month.localeCompare(a.month));

  monthsList.forEach((m: any) => {
    m.grossProfit = m.totalSales - m.totalCost - m.totalReturns;
    m.netProfit = m.grossProfit - m.totalExpenses;

    // Ensure dailyData is complete for the month
    const yearInt = parseInt(m.month.split("-")[0]);
    const monthInt = parseInt(m.month.split("-")[1]);
    const lastDay = new Date(yearInt, monthInt, 0).getDate();
    
    const now = new Date();
    const isCurrentMonth = now.getFullYear() === yearInt && (now.getMonth() + 1) === monthInt;
    
    // If it's a specific month filter, show the full month (1 to 30/31)
    // If it's the general view (no specific month filter), we still use the actual day for current month if needed
    // but the user specifically asked for "all dates month wise"
    const endDay = (year && month) ? lastDay : (isCurrentMonth ? now.getDate() : lastDay);

    for (let i = 1; i <= endDay; i++) {
        const dayStr = i.toString().padStart(2, '0');
        if (!m.dailyData[dayStr]) {
            m.dailyData[dayStr] = { date: dayStr, sales: 0, expenses: 0, purchases: 0 };
        }
    }
  });

  const inventoryValue = products.reduce((sum, p) => sum + (p.stock * p.purchasePrice), 0);
  const totalReceivables = customers._sum.dueBalance || 0;
  const totalPayables = suppliers._sum.dueBalance || 0;

  const generateInsights = (data: any) => {
    if (!data) return [];
    const insights = [];
    const profitMargin = data.totalSales > 0 ? (data.netProfit / data.totalSales) * 100 : 0;
    const expenseRatio = data.totalSales > 0 ? (data.totalExpenses / data.totalSales) * 100 : 0;
    const collectionRate = data.totalSales > 0 ? (data.totalCollection / data.totalSales) * 100 : 0;

    if (profitMargin > 15) insights.push({ type: "POSITIVE", text: `High Profit! (বেশি লাভ!) ${profitMargin.toFixed(1)}% margin.` });
    if (expenseRatio > 20) insights.push({ type: "DANGER", text: `High Expense! (বেশি খরচ!) Expenses are ${expenseRatio.toFixed(1)}% of sales.` });
    if (collectionRate < 70) insights.push({ type: "WARNING", text: `Low Collection! (কম আদায়!) Only ${collectionRate.toFixed(1)}% paid.` });
    if (data.totalPurchases > data.totalSales) insights.push({ type: "INFO", text: "High Purchase! (বেশি ক্রয়!) Bought more than sold." });
    
    return insights;
  };

  const currentMonthInsights = (year && month && monthsList.length > 0) ? generateInsights(monthsList[0]) : [];

  return {
    months: monthsList,
    stats: {
      inventoryValue,
      totalReceivables,
      totalPayables,
      netWorth: inventoryValue + totalReceivables - totalPayables,
    },
    insights: currentMonthInsights,
    detailedDebt: {
       receivables: await db.customer.findMany({ where: { dueBalance: { gt: 0 } }, orderBy: { dueBalance: 'desc' } }),
       payables: await db.supplier.findMany({ where: { dueBalance: { gt: 0 } }, orderBy: { dueBalance: 'desc' } })
    }
  };
}

import { FiscalPeriodSelector } from "@/components/reports/fiscal-period-selector";
import { Suspense } from "react";

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ year?: string, month?: string }> }) {
  const { year: yr, month: mo } = await searchParams;
  const today = new Date();
  
  // Default to current year/month if not explicitly provided, to ensure daily view
  const year = yr || today.getFullYear().toString();
  const month = mo || (today.getMonth() + 1).toString().padStart(2, "0");

  const { months, stats, insights, detailedDebt } = await getMonthlyPL(year, month);
  
  const currentMonth = months[0] || {
    label: "No Data", totalSales: 0, totalCollection: 0, totalPurchases: 0, 
    totalCost: 0, totalExpenses: 0, netProfit: 0, 
    expensesByCategory: {},
    dailyData: {},
    registries: { sales: [], purchases: [], expenses: [], payments: [] }
  };

  return (
    <div className="flex-1 space-y-10 pb-10 text-slate-900">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight font-outfit uppercase">Reports <span className="text-indigo-600">(রিপোর্ট)</span></h1>
          <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-2 flex items-center gap-2">
            <FileBarChart className="h-3.5 w-3.5 text-indigo-500" /> View all your business data here
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <Suspense fallback={<div className="h-14 w-64 bg-slate-100 animate-pulse rounded-2xl" />}>
             <FiscalPeriodSelector />
          </Suspense>
          <ReportPrint 
            data={year && month ? [currentMonth] : months} 
            stats={stats} 
            insights={insights} 
            isDetailed={!!(year && month)} 
            detailedDebt={detailedDebt}
          />
        </div>
      </div>

      {insights.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
           {insights.map((ins, i) => (
             <div key={i} className={cn(
               "p-6 rounded-[2rem] border-2 flex items-start gap-3 shadow-xl",
               ins.type === "POSITIVE" ? "bg-emerald-50 border-emerald-100 text-emerald-800" :
               ins.type === "DANGER" ? "bg-rose-50 border-rose-100 text-rose-800" :
               ins.type === "WARNING" ? "bg-amber-50 border-amber-100 text-amber-800" :
               "bg-slate-50 border-slate-100 text-slate-800"
             )}>
                {ins.type === "POSITIVE" ? <TrendingUp className="h-5 w-5 mt-1" /> : <AlertCircle className="h-5 w-5 mt-1" />}
                <p className="text-[11px] font-black uppercase tracking-tight leading-relaxed">{ins.text}</p>
             </div>
           ))}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-4">
         <Card className="lg:col-span-2 border-none shadow-2xl shadow-indigo-100/50 rounded-[3rem] overflow-hidden bg-slate-900 text-white p-10 flex flex-col justify-between relative group">
            <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform duration-1000">
               <Layers className="h-32 w-32" />
            </div>
            <div className="relative z-10">
               <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] mb-4">Business Value (ব্যবসার মূল্য)</p>
               <h3 className="text-5xl font-black font-outfit tracking-tighter mb-2">Net Worth</h3>
            </div>
            <div className="mt-12 relative z-10">
               <h4 className="text-6xl font-black font-outfit tabular-nums text-emerald-400">Tk {stats.netWorth.toLocaleString()}</h4>
               <div className="mt-8 grid grid-cols-2 gap-8 border-t border-white/10 pt-8">
                  <div className="space-y-1">
                     <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Stock + Receivables</p>
                     <p className="text-xl font-bold tabular-nums text-white">Tk {(stats.inventoryValue + stats.totalReceivables).toLocaleString()}</p>
                  </div>
                  <div className="space-y-1">
                     <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Total Due to Pay</p>
                     <p className="text-xl font-bold tabular-nums text-rose-400">Tk {stats.totalPayables.toLocaleString()}</p>
                  </div>
               </div>
            </div>
         </Card>

         <Card className="lg:col-span-2 border-none shadow-2xl shadow-slate-200/60 rounded-[3rem] overflow-hidden bg-white p-10 flex flex-col items-center justify-center">
            <div className="w-full text-center mb-8">
               <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mb-1">Expense Types (খরচের খাত)</p>
               <h3 className="text-2xl font-black font-outfit text-slate-900">Where you spend money</h3>
            </div>
            <ExpensePieChart data={currentMonth.expensesByCategory} />
         </Card>
      </div>

      <div className="grid gap-10 lg:grid-cols-3">
         <Card className="lg:col-span-2 border-none shadow-2xl shadow-slate-200/60 rounded-[3rem] overflow-hidden bg-white">
             <CardHeader className="bg-slate-900 text-white px-10 py-8">
                <CardTitle className="text-xl font-black font-outfit uppercase tracking-[0.1em]">Sales & Profit (বিক্রি ও লাভ)</CardTitle>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Daily sales and profit</p>
             </CardHeader>
            <CardContent className="p-10">
               <BusinessBarChart data={year && month ? Object.values(currentMonth.dailyData) : months} />
            </CardContent>
         </Card>

          <Card className="border-none shadow-2xl shadow-emerald-100/30 rounded-[3rem] overflow-hidden bg-white p-10 flex flex-col space-y-8">
             <h3 className="text-2xl font-black font-outfit text-slate-900">Assets & Liabilities (সম্পদ ও দায়)</h3>
             <div className="space-y-4">
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                   <p className="text-xs font-black text-slate-400 uppercase">Stock Value</p>
                   <p className="text-xl font-black font-outfit tabular-nums">Tk {stats.inventoryValue.toLocaleString()}</p>
                </div>
                <div className="p-6 bg-indigo-50 border border-indigo-100 rounded-2xl flex justify-between items-center text-indigo-700">
                   <p className="text-xs font-black uppercase">To Receive</p>
                   <p className="text-xl font-black font-outfit tabular-nums">Tk {stats.totalReceivables.toLocaleString()}</p>
                </div>
                <div className="p-6 bg-rose-50 border border-rose-100 rounded-2xl flex justify-between items-center text-rose-700">
                   <p className="text-xs font-black uppercase">To Pay</p>
                   <p className="text-xl font-black font-outfit tabular-nums">Tk {stats.totalPayables.toLocaleString()}</p>
                </div>
            </div>
         </Card>
      </div>

      <Card className="border-none shadow-2xl shadow-slate-200/60 rounded-[3rem] overflow-hidden bg-white">
        <CardHeader className="bg-slate-50/50 px-10 py-8 border-b border-slate-100">
           <CardTitle className="text-xl font-black font-outfit uppercase tracking-[0.1em]">Monthly Report (মাসিক রিপোর্ট)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
           <div className="relative max-h-[500px] overflow-auto custom-scrollbar border border-slate-100/50 rounded-2xl shadow-sm bg-white">
             <Table>
               <TableHeader className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                 <TableRow className="border-b-slate-100">
                   <TableHead className="py-6 pl-10 text-[10px] font-black uppercase tracking-widest text-slate-500">Month</TableHead>
                   <TableHead className="text-right text-[10px] font-black uppercase tracking-widest text-slate-500">Sales</TableHead>
                   <TableHead className="text-right text-[10px] font-black uppercase tracking-widest text-slate-500">Expense</TableHead>
                   <TableHead className="text-right text-[10px] font-black uppercase tracking-widest text-slate-500 pr-10">Profit</TableHead>
                 </TableRow>
               </TableHeader>
               <TableBody>
                 {months.map((m) => (
                   <TableRow key={m.month} className="group border-b-slate-50 hover:bg-slate-50 transition-all font-outfit">
                     <TableCell className="py-6 pl-10"><span className="text-sm font-black uppercase">{m.label}</span></TableCell>
                     <TableCell className="text-right py-6 font-bold tabular-nums">Tk {m.totalSales.toLocaleString()}</TableCell>
                     <TableCell className="text-right py-6 text-rose-500 font-bold tabular-nums">Tk {m.totalExpenses.toLocaleString()}</TableCell>
                     <TableCell className="text-right py-6 pr-10">
                        <span className={cn("px-4 py-1.5 rounded-xl text-xs font-black", m.netProfit >= 0 ? "bg-emerald-500 text-white" : "bg-rose-500 text-white")}>
                          Tk {m.netProfit.toLocaleString()}
                        </span>
                     </TableCell>
                   </TableRow>
                 ))}
               </TableBody>
             </Table>
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
