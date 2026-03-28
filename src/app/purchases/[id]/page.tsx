import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer, Box, FastForward, CreditCard, ChevronRight, PackageCheck, ShieldCheck, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { PurchasePrint } from "@/components/purchases/purchase-print";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function PurchaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const purchase = await db.purchase.findUnique({
    where: { id },
    include: {
      supplier: true,
      items: {
        include: { product: true },
      },
    },
  });

  if (!purchase) notFound();

  return (
    <div className="flex-1 space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex items-center gap-6">
          <Button variant="ghost" size="icon" className="h-14 w-14 rounded-2xl bg-white shadow-xl shadow-slate-200/50 hover:bg-slate-50 transition-all border border-slate-100" asChild>
            <Link href="/purchases"><ArrowLeft className="h-6 w-6 text-slate-400" /></Link>
          </Button>
          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900 font-outfit">
               Supply Audit <span className="text-amber-600">#{purchase.invoiceNo}</span>
            </h1>
            <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-2 flex items-center gap-2">
               <ShieldCheck className="h-3.5 w-3.5 text-amber-500" /> Procurement Entry: {new Date(purchase.date).toLocaleDateString("en-BD", { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <PurchasePrint purchase={purchase} />
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content: Items Table */}
        <div className="lg:col-span-2 flex flex-col gap-8">
           <Card className="border-none shadow-2xl shadow-slate-200/60 rounded-[3rem] overflow-hidden bg-white">
             <CardHeader className="bg-slate-50/20 border-b border-slate-50 px-10 py-8">
                <div>
                   <CardTitle className="text-xl font-black font-outfit">Asset Inflow Analysis</CardTitle>
                   <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Acquisition Cost & Inventory Volume</p>
                </div>
             </CardHeader>
             <CardContent className="p-0">
               <div className="relative max-h-[500px] overflow-auto custom-scrollbar border border-slate-100/50 rounded-2xl shadow-sm bg-white">
                 <table className="w-full">
                   <thead>
                     <tr className="bg-slate-50/50 border-b border-slate-100">
                       <th className="text-left py-6 px-10 text-[10px] font-black uppercase tracking-widest text-slate-500">Resource Registry</th>
                       <th className="text-right py-6 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Acq Rate</th>
                       <th className="text-right py-6 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Quant</th>
                       <th className="text-right py-6 pr-10 text-[10px] font-black uppercase tracking-widest text-slate-500">Gross Outflow</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                     {purchase.items.map((item) => (
                       <tr key={item.id} className="group hover:bg-slate-50/50 transition-all">
                         <td className="py-6 px-10">
                            <div className="flex flex-col">
                               <span className="text-sm font-black text-slate-900 group-hover:text-amber-600 transition-colors uppercase tracking-tight">
                                  {item.product.name}
                               </span>
                               <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{item.product.code}</span>
                            </div>
                         </td>
                         <td className="py-6 px-4 text-right font-medium text-slate-600 tabular-nums">Tk {item.price.toLocaleString()}</td>
                         <td className="py-6 px-4 text-right">
                            <span className="inline-flex px-2 py-0.5 bg-slate-100 rounded-lg text-[10px] font-black tabular-nums border border-slate-200/50">{item.quantity} units</span>
                         </td>
                         <td className="py-6 pr-10 text-right font-black text-slate-900 tabular-nums">Tk {(item.price * item.quantity).toLocaleString()}</td>
                       </tr>
                     ))}
                   </tbody>
                   <tfoot className="bg-slate-900 text-white">
                      <tr>
                         <td colSpan={3} className="py-8 px-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Aggregated Capital Outflow</td>
                         <td className="py-8 pr-10 text-right">
                            <div className="flex flex-col items-end gap-1">
                               <span className="text-2xl font-black font-outfit">Tk {purchase.totalAmount.toLocaleString()}</span>
                               <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Inventory Liquidation Value</span>
                            </div>
                         </td>
                      </tr>
                   </tfoot>
                 </table>
               </div>
             </CardContent>
           </Card>
        </div>

        {/* Sidebar: Intelligence Panels */}
        <div className="flex flex-col gap-8">
           {/* Supplier Card */}
           <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-xl shadow-slate-200/50 group transition-all hover:bg-amber-600 hover:text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all">
                 <ShoppingCart className="h-24 w-24" />
              </div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mb-6 group-hover:text-amber-200">Vendor Relationship</p>
              <div className="space-y-4">
                 <div>
                    <Link href={`/suppliers/${purchase.supplierId}`} className="text-xl font-black hover:text-amber-200 transition-colors font-outfit block uppercase tracking-tight">
                       {purchase.supplier.name}
                    </Link>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 group-hover:text-slate-100/50">{purchase.supplier.company || "Enterprise Supplier"}</p>
                 </div>
                 <div className="flex items-center gap-2 pt-4 border-t border-slate-50 group-hover:border-white/10">
                    <span className="text-xs font-medium tabular-nums group-hover:text-slate-200">{purchase.supplier.phone}</span>
                 </div>
              </div>
           </div>

           {/* Financial Settlement Card */}
           <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:rotate-12 transition-transform duration-700">
                 <CreditCard className="h-20 w-20" />
              </div>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-6">Capital Flow audit</p>
              <div className="space-y-4 relative z-10">
                 <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-slate-500 uppercase tracking-tighter">Liquidated Cash</span>
                    <span className="font-black text-emerald-400 tabular-nums">Tk {purchase.paidAmount.toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                    <span className="font-bold text-slate-500 uppercase tracking-tighter">Account Payable</span>
                    <span className="font-black text-rose-500 tabular-nums">Tk {purchase.dueAdded.toLocaleString()}</span>
                 </div>
                 <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-between">
                    <div>
                       <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Acquisition Vector</p>
                       <p className="text-xs font-black uppercase text-white mt-1">"Transaction Verified"</p>
                    </div>
                    {purchase.dueAdded === 0 && (
                       <div className="h-10 w-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                          <PackageCheck className="h-5 w-5 text-emerald-500" />
                       </div>
                    )}
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
