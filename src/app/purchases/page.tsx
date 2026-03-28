import { db } from "@/lib/db";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, PackageCheck, Wallet, ChevronRight, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { deletePurchase } from "@/actions/purchase";

export const dynamic = "force-dynamic";

async function getPurchases() {
  const purchases = await db.purchase.findMany({
    include: {
      supplier: true,
      items: {
        include: {
          product: true,
        },
      },
    },
    orderBy: {
      date: "desc",
    },
  });
  return purchases;
}

export default async function PurchasesPage() {
  const purchases = await getPurchases();

  const totalProcured = purchases.reduce((acc, p) => acc + p.totalAmount, 0);
  const totalDue = purchases.reduce((acc, p) => acc + p.dueAdded, 0);
  const recentPurchases = purchases.length;

  return (
    <div className="flex-1 space-y-10 pb-10 text-slate-900">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight font-outfit">
             Purchase <span className="text-amber-600">(ক্রয়)</span>
          </h1>
          <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-2 flex items-center gap-2">
             <PackageCheck className="h-3.5 w-3.5 text-amber-500" /> Manage all your purchases here
          </p>
        </div>
        <div className="flex gap-3">
           <Button className="h-12 px-8 rounded-2xl bg-slate-900 hover:bg-black text-white shadow-xl shadow-slate-200/50 transition-all active:scale-95" asChild>
             <Link href="/purchases/new">New Purchase (নতুন ক্রয়)</Link>
           </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
         {[
           { label: "Total Purchase (মোট ক্রয়)", val: `Tk ${totalProcured.toLocaleString()}`, sub: "Total value of items bought", icon: ShoppingCart, color: "text-amber-600", bg: "bg-amber-50" },
           { label: "Total Due (মোট বকেয়া)", val: `Tk ${totalDue.toLocaleString()}`, sub: "Total money you owe", icon: Wallet, color: "text-rose-600", bg: "bg-rose-50" },
           { label: "Total Invoices (মোট চালান)", val: `${recentPurchases}`, sub: "Total number of purchases", icon: PackageCheck, color: "text-indigo-600", bg: "bg-indigo-50" },
         ].map((kpi, idx) => (
           <Card key={idx} className="border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem] bg-white group hover:bg-slate-50 transition-all p-8">
              <div className="flex justify-between items-start">
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{kpi.label}</p>
                    <h3 className={cn("text-2xl font-black font-outfit", kpi.color)}>{kpi.val}</h3>
                 </div>
                 <div className={cn("h-10 w-10 rounded-2xl flex items-center justify-center shadow-inner transition-transform group-hover:scale-110", kpi.bg)}>
                    <kpi.icon className={cn("h-5 w-5", kpi.color)} />
                 </div>
              </div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-4">
                 {kpi.sub}
              </p>
           </Card>
         ))}
      </div>

      <Card className="border-none shadow-2xl shadow-slate-200/60 rounded-[3rem] overflow-hidden bg-white">
        <CardHeader className="bg-slate-900 text-white px-10 py-8">
           <CardTitle className="text-xl font-black font-outfit uppercase tracking-[0.1em]">Purchase History (ক্রয়ের হিসাব)</CardTitle>
           <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">List of all purchases</p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative max-h-[500px] overflow-auto custom-scrollbar border border-slate-100/50 rounded-2xl shadow-sm bg-white">
            <Table>
              <TableHeader className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                <TableRow className="hover:bg-transparent border-b-slate-100">
                  <TableHead className="py-6 pl-10 text-[10px] font-black text-slate-500 uppercase tracking-widest">Invoice No</TableHead>
                  <TableHead className="py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Supplier</TableHead>
                  <TableHead className="py-6 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">Total</TableHead>
                  <TableHead className="py-6 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">Paid</TableHead>
                  <TableHead className="py-6 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">Due</TableHead>
                  <TableHead className="py-6 pr-10 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchases.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="h-64 text-center text-slate-300 font-black uppercase tracking-widest">No Purchases Found (কোনো ক্রয় নেই)</TableCell></TableRow>
                ) : (
                  purchases.map((p) => (
                    <TableRow key={p.id} className="group border-b-slate-50 hover:bg-slate-50 transition-all">
                      <TableCell className="py-6 pl-10">
                         <div className="flex flex-col">
                             <span className="text-sm font-black text-slate-900 group-hover:text-amber-600 transition-colors uppercase tracking-tight">#{p.invoiceNo || p.id.slice(-6)}</span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase">{p.date ? new Date(p.date).toLocaleDateString() : "Unknown"}</span>
                         </div>
                      </TableCell>
                      <TableCell>
                         <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-700">{p.supplier?.name || "Unknown Supplier"}</span>
                             <span className="text-sm font-black text-slate-400 uppercase tracking-tighter">{p.supplier?.company || "Enterprise Vendor"}</span>
                         </div>
                      </TableCell>
                      <TableCell className="text-right py-6 font-bold text-slate-900 tabular-nums">Tk {(p.totalAmount || 0).toLocaleString()}</TableCell>
                      <TableCell className="text-right py-6 text-emerald-600 font-bold text-xs tabular-nums tracking-tighter">Tk {(p.paidAmount || 0).toLocaleString()}</TableCell>
                      <TableCell className="text-right py-6 text-rose-500 font-bold text-xs tabular-nums tracking-tighter">Tk {(p.dueAdded || 0).toLocaleString()}</TableCell>
                      <TableCell className="text-right py-6 pr-10">
                        <div className="flex justify-end items-center gap-2 text-slate-400 min-w-[140px] flex-nowrap">
                           <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm" asChild title="View Details">
                              <Link href={`/purchases/${p.id}`}>
                                 <ChevronRight className="h-4 w-4" />
                              </Link>
                           </Button>
                           <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-amber-600 hover:text-white transition-all shadow-sm" asChild title="Edit Purchase">
                              <Link href={`/purchases/${p.id}/edit`}>
                                 <Pencil className="h-4 w-4" />
                              </Link>
                           </Button>
                           <DeleteConfirmDialog 
                              onDelete={deletePurchase.bind(null, p.id)}
                              title="Delete Purchase? (ক্রয় ডিলিট করবেন?)"
                              description="This will remove stock and adjust due. Cannot be undone."
                              itemName={`#${p.invoiceNo || p.id.slice(-6)}`}
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
}
