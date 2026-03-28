import { getSales, deleteSale } from "@/actions/sales";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { FileText, Plus, Receipt, TrendingUp, Wallet, CheckCircle2, History, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function SalesPage() {
  try {
    const sales = await getSales();
    const totalRevenue = sales.reduce((s, x) => s + (x.totalAmount || 0), 0);
    const totalPaid = sales.reduce((s, x) => s + (x.paidAmount || 0), 0);
    const totalDue = sales.reduce((s, x) => s + ((x.totalAmount || 0) - (x.paidAmount || 0)), 0);

  return (
    <div className="flex-1 space-y-10 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 font-outfit">
             Sales <span className="text-indigo-600">(বিক্রি)</span>
          </h1>
          <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-2 flex items-center gap-2">
             <Receipt className="h-3.5 w-3.5 text-indigo-500" /> Manage all your sales here
          </p>
        </div>
        <div className="flex gap-3">
           <Button asChild className="h-12 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 gap-2 active:scale-95 transition-all">
             <Link href="/sales/new"><Plus className="h-5 w-5" /> New Sale (নতুন মেমো)</Link>
           </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {/* KPI: Sales Volume */}
        <div className="group relative bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl transition-all hover:translate-y-[-4px] overflow-hidden">
           <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:rotate-12 transition-transform duration-700">
              <History className="h-20 w-20 text-white" />
           </div>
           <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-1">Total Sales (মোট বিক্রি)</p>
           <h3 className="text-3xl font-black text-white font-outfit">{sales.length}</h3>
           <div className="mt-6 flex items-center gap-2 text-indigo-400 text-[10px] font-black uppercase tracking-widest">
              Total Invoices Generated
           </div>
        </div>

        {/* KPI: Gross Revenue */}
        <div className="group relative bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col justify-between hover:bg-slate-50 transition-colors">
           <div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Total Amount (মোট টাকা)</p>
              <h3 className="text-3xl font-black text-indigo-600 font-outfit">Tk {totalRevenue.toLocaleString()}</h3>
           </div>
           <p className="mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-emerald-500" /> Total value of all sales
           </p>
        </div>

        {/* KPI: Total Collected */}
        <div className="group relative bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col justify-between hover:bg-slate-50 transition-colors">
           <div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Total Received (মোট গ্রহণ)</p>
              <h3 className="text-3xl font-black text-emerald-600 font-outfit">Tk {totalPaid.toLocaleString()}</h3>
           </div>
           <p className="mt-4 text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> Total money received
           </p>
        </div>

        {/* KPI: Outstandings */}
        <div className="group relative bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col justify-between hover:bg-slate-50 transition-colors">
           <div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Total Due (মোট বকেয়া)</p>
              <h3 className="text-3xl font-black text-rose-600 font-outfit">Tk {totalDue.toLocaleString()}</h3>
           </div>
           <p className="mt-4 text-[10px] font-bold text-rose-500 uppercase tracking-widest flex items-center gap-1">
              <Wallet className="h-3 w-3" /> Total money people owe
           </p>
        </div>
      </div>

      <Card className="border-none shadow-2xl shadow-slate-200/60 rounded-[3rem] overflow-hidden bg-white">
        <CardHeader className="flex flex-col md:flex-row items-center justify-between border-b border-slate-50 bg-slate-50/20 px-10 py-8 gap-6">
          <div>
             <CardTitle className="text-xl font-black text-slate-900 font-outfit">Sales History (বিক্রির হিসাব)</CardTitle>
             <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">List of all sales</p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative max-h-[500px] overflow-auto custom-scrollbar border border-slate-100/50 rounded-2xl shadow-sm bg-white">
            <Table>
              <TableHeader className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                <TableRow className="hover:bg-transparent border-b-slate-100">
                  <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 py-6 pl-10">Invoice No</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 py-6">Date</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 py-6">Customer</TableHead>
                  <TableHead className="text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 py-6">Total</TableHead>
                  <TableHead className="text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 py-6">Paid</TableHead>
                  <TableHead className="text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 py-6">Due</TableHead>
                  <TableHead className="text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 py-6 pr-10">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-64 text-center">
                       <div className="flex flex-col items-center justify-center text-slate-300 gap-4">
                          <Receipt className="h-12 w-12 opacity-20" />
                          <p className="text-sm font-black uppercase tracking-widest">No Sales Found (কোনো বিক্রি নেই)</p>
                       </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  sales.map((s) => (
                    <TableRow key={s.id} className="group border-b-slate-50 hover:bg-slate-50/50 transition-all">
                      <TableCell className="py-6 pl-10 font-mono text-xs font-black text-indigo-600">{s.memoNo}</TableCell>
                      <TableCell className="py-6 font-medium text-slate-500 text-xs">
                         {s.date ? new Date(s.date).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }) : "Unknown"}
                      </TableCell>
                      <TableCell className="py-6">
                         <div className="flex flex-col">
                            <span className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">
                               {s.customer?.name || "Unknown Customer"}
                            </span>
                            <span className="text-[9px] font-bold text-slate-400 mt-0.5">{s.customer?.shopName || "Private"}</span>
                         </div>
                      </TableCell>
                      <TableCell className="py-6 text-right font-bold text-slate-900 tabular-nums">Tk {(s.totalAmount || 0).toLocaleString()}</TableCell>
                      <TableCell className="py-6 text-right font-black text-emerald-600 tabular-nums">Tk {(s.paidAmount || 0).toLocaleString()}</TableCell>
                      <TableCell className="py-6 text-right">
                        <span className={cn(
                          "inline-flex px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm",
                          (s.dueAdded || 0) > 0 ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"
                        )}>
                          {(s.dueAdded || 0) > 0 ? `Tk ${(s.dueAdded || 0).toLocaleString()}` : "Settled"}
                        </span>
                      </TableCell>
                      <TableCell className="py-6 text-right pr-10">
                        <div className="flex justify-end gap-2 isolate">
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-white hover:shadow-md transition-all group/audit" asChild>
                            <Link href={`/sales/${s.id}`}>
                              <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover/audit:text-indigo-600" />
                            </Link>
                          </Button>
                          <DeleteConfirmDialog 
                             onDelete={deleteSale.bind(null, s.id)}
                             title="Delete Sale? (মেমো ডিলিট করবেন?)"
                             description="This will return stock and remove due. Cannot be undone."
                             itemName={`Voucher ${s.memoNo}`}
                          />
                        </div>
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
  );
  } catch (error: any) {
    return (
      <div className="flex-1 p-10 bg-red-50 text-red-900 rounded-2xl m-6">
        <h1 className="text-2xl font-bold mb-4">CRITICAL SALES PAGE ERROR</h1>
        <pre className="p-4 bg-white/50 rounded-lg text-sm whitespace-pre-wrap">{error.stack || error.message || String(error)}</pre>
      </div>
    );
  }
}
