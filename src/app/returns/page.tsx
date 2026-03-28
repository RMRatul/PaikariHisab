import { getReturns } from "@/actions/return";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, RefreshCw, FileText, User } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function ReturnsPage() {
  const returns = await getReturns();

  return (
    <div className="flex-1 space-y-10 pb-20 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black font-outfit text-slate-900 tracking-tighter">
            Asset <span className="bg-gradient-to-r from-rose-500 to-amber-500 bg-clip-text text-transparent">Restitution</span>
          </h1>
          <p className="text-slate-400 font-bold uppercase tracking-[0.25em] text-[10px] mt-3 flex items-center gap-2">
             <RefreshCw className="h-3 w-3 text-rose-500 animate-spin-slow" />
             Returns & Stock Reconciliation Ledger
          </p>
        </div>
        <div className="flex gap-4">
           <Button className="h-14 px-8 rounded-2xl bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-200/50 font-black uppercase tracking-widest text-[10px] gap-3 transition-all active:scale-95" asChild>
             <Link href="/returns/new"><RefreshCw className="h-4 w-4" /> Process New Return</Link>
           </Button>
        </div>
      </div>

      <Card className="border-none shadow-2xl shadow-slate-200/60 rounded-[3rem] overflow-hidden bg-white">
        <CardHeader className="bg-slate-50/50 px-10 py-8 border-b border-slate-100">
           <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400">Restitution Registry</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative max-h-[500px] overflow-auto custom-scrollbar border border-slate-100/50 rounded-2xl shadow-sm bg-white">
            <Table>
              <TableHeader className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                <TableRow className="hover:bg-transparent border-b-slate-100">
                  <TableHead className="py-6 pl-10 text-[10px] font-black text-slate-500 uppercase tracking-widest">Entry Date</TableHead>
                  <TableHead className="py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Customer Entity</TableHead>
                  <TableHead className="py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Reason / Status</TableHead>
                  <TableHead className="py-6 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">Items</TableHead>
                  <TableHead className="py-6 pr-10 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">Refund Value (Tk)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {returns.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-64 text-center">
                       <div className="flex flex-col items-center justify-center text-slate-300 gap-4">
                          <RefreshCw className="h-12 w-12 opacity-20" />
                          <p className="text-sm font-black uppercase tracking-widest">Return Registry Empty</p>
                       </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  returns.map((r) => (
                    <TableRow key={r.id} className="group border-b-slate-50 hover:bg-slate-50 transition-all">
                      <TableCell className="py-6 pl-10">
                         <span className="text-xs font-bold text-slate-500 uppercase tabular-nums">
                           {new Date(r.date).toLocaleDateString()}
                         </span>
                      </TableCell>
                      <TableCell>
                         <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                               <User className="h-4 w-4" />
                            </div>
                            <div className="flex flex-col">
                               <span className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{r.customer.name}</span>
                               <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{r.customer.shopName || "Private"}</span>
                            </div>
                         </div>
                      </TableCell>
                      <TableCell>
                         <div className="flex flex-col gap-1">
                            <span className="text-xs font-bold text-slate-600">{r.reason || "Product Return"}</span>
                            <span className="text-[8px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-50 w-fit px-2 py-0.5 rounded-full border border-emerald-100 shadow-sm">Capital Rectified</span>
                         </div>
                      </TableCell>
                      <TableCell className="text-right py-6 font-bold text-slate-500 tabular-nums">
                         {r.items.length} Sku
                      </TableCell>
                      <TableCell className="text-right py-6 pr-10 font-black text-slate-900 tabular-nums text-lg">
                         Tk {r.totalAmount.toLocaleString()}
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
}
