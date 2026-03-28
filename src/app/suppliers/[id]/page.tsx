import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Phone, MapPin, Pencil, TrendingUp, TrendingDown, Truck, Wallet, History, FileText, CheckCircle2, ShieldAlert, BadgeDollarSign, Footprints, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { PaySupplierForm } from "@/components/suppliers/pay-supplier-form";
import { cn } from "@/lib/utils";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { deleteTransaction } from "@/actions/transaction";
import { deletePurchase } from "@/actions/purchase";
import { Trash2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SupplierProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const supplier = await db.supplier.findUnique({
    where: { id },
    include: {
      purchases: { include: { items: { include: { product: true } } }, orderBy: { date: "asc" } },
      transactions: { orderBy: { date: "asc" } },
    },
  });

  if (!supplier) notFound();

  // Ledger Logic
  type LedgerEntry = { date: Date; type: "PURCHASE" | "PAYMENT"; description: string; debit: number; credit: number; ref: string; purchaseId?: string };
  
  const ledgerEntries: LedgerEntry[] = [
    ...supplier.purchases.map((p) => ({
      date: p.date,
      type: "PURCHASE" as const,
      description: `Asset Acquisition — ${p.items.length} Product Models`,
      debit: p.totalAmount,
      credit: 0,
      ref: p.invoiceNo || "INV-ACQ",
      purchaseId: p.id
    })),
    ...supplier.transactions.map((t) => ({
      date: t.date,
      type: "PAYMENT" as const,
      description: `Capital Commitment — ${t.method}${t.discount > 0 ? ` (Waiver: Tk ${t.discount})` : ""}`,
      debit: 0,
      credit: t.amount + t.discount,
      ref: "PMT-" + t.id.slice(-4).toUpperCase(),
      transactionId: t.id
    })),
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let running = 0;
  const ledgerWithBalance = ledgerEntries.map((e) => { 
    running += e.debit - e.credit; 
    return { ...e, balance: running }; 
  });

  const totalPurchasesTk = supplier.purchases.reduce((s, p) => s + p.totalAmount, 0);
  const totalPaidTk = supplier.transactions.reduce((s, t) => s + t.amount, 0);
  
  const trustScore = totalPurchasesTk > 0 ? Math.min(100, Math.round((totalPaidTk / totalPurchasesTk) * 100)) : 100;

  return (
    <div className="flex-1 space-y-10 pb-20">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex items-center gap-6">
           <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-white shadow-xl shadow-slate-200/50 hover:bg-slate-50 border border-slate-100" asChild>
             <Link href="/suppliers"><ArrowLeft className="h-5 w-5" /></Link>
           </Button>
           <div>
              <p className="text-amber-600 text-[10px] font-black uppercase tracking-[0.3em] mb-1">Supplier Info (মহাজনের তথ্য)</p>
              <h1 className="text-4xl font-black font-outfit text-slate-900 tracking-tight flex items-center gap-3">
                {supplier.name}
                <div className={cn(
                  "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2",
                  trustScore > 80 ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                )}>
                   <Truck className="h-3 w-3" />
                   {trustScore > 80 ? "Good Supplier (খুব ভালো)" : "Regular Supplier (সাধারণ)"}
                </div>
              </h1>
              <div className="flex items-center gap-4 mt-2">
                 <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                    <Phone className="h-3.5 w-3.5 text-amber-500" /> {supplier.phone}
                 </span>
                 {supplier.company && (
                   <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                      <BadgeDollarSign className="h-3.5 w-3.5 text-amber-500" /> {supplier.company}
                   </span>
                 )}
              </div>
           </div>
        </div>
        <div className="flex gap-3">
           <Button className="h-12 px-8 rounded-2xl bg-white border-2 border-slate-50 text-slate-600 hover:bg-slate-50 shadow-xl shadow-slate-200/40 font-bold transition-all active:scale-95" asChild>
             <Link href={`/suppliers/${id}/edit`}>Edit Registry</Link>
           </Button>
           <Button className="h-12 px-8 rounded-2xl bg-slate-900 text-white hover:bg-black shadow-xl shadow-slate-200/50 font-bold transition-all active:scale-95" asChild>
             <Link href="/purchases/new">Log Purchase</Link>
           </Button>
        </div>
      </div>

      {/* Bento KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         {[
           { label: "Total Purchase (মোট ক্রয়)", val: `Tk ${totalPurchasesTk.toLocaleString()}`, sub: "Lifetime Business", icon: ShoppingBag, color: "text-amber-600", bg: "bg-amber-50" },
           { label: "Total Payable (মোট পাওনা)", val: `Tk ${supplier.dueBalance.toLocaleString()}`, sub: "What you owe", icon: Wallet, color: supplier.dueBalance > 0 ? "text-rose-600" : "text-emerald-600", bg: supplier.dueBalance > 0 ? "bg-rose-50" : "bg-emerald-50" },
           { label: "Total Invoices (মোট চালান)", val: `${supplier.purchases.length}`, sub: "Total Purchases Made", icon: Truck, color: "text-slate-600", bg: "bg-slate-100" },
           { label: "Paid Rate (পরিশোধের হার)", val: `${trustScore}%`, sub: "How much we paid them", icon: BadgeDollarSign, color: "text-indigo-600", bg: "bg-indigo-50" },
         ].map((kpi, idx) => (
           <Card key={idx} className="border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem] bg-white group hover:bg-slate-50 transition-all p-8 relative overflow-hidden">
              <div className="relative z-10">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{kpi.label}</p>
                 <h3 className={cn("text-2xl font-black font-outfit", kpi.color)}>{kpi.val}</h3>
                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-4">{kpi.sub}</p>
              </div>
              <div className={cn("absolute -bottom-6 -right-6 h-24 w-24 opacity-5 group-hover:scale-125 transition-transform duration-1000", kpi.color)}>
                 <kpi.icon className="h-full w-full" />
              </div>
           </Card>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
         {/* Ledger Audit Tray */}
         <div className="lg:col-span-8 space-y-10 w-full">
            <Card className="border-none shadow-2xl shadow-slate-200/60 rounded-[3rem] overflow-hidden bg-white">
               <CardHeader className="bg-slate-900 text-white px-10 py-8 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-black font-outfit uppercase tracking-[0.1em]">Purchase History (ক্রয়ের হিসাব)</CardTitle>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">All Purchases and Payments</p>
                  </div>
                  <Button variant="outline" className="h-10 rounded-xl bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10 text-[10px] font-black uppercase tracking-widest">
                     Export Statement
                  </Button>
               </CardHeader>
               <CardContent className="p-0">
                  <div className="relative max-h-[500px] overflow-auto custom-scrollbar border border-slate-100/50 rounded-2xl shadow-sm bg-white">
                    <Table>
                      <TableHeader className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                        <TableRow className="hover:bg-transparent border-b-slate-100">
                          <TableHead className="py-6 pl-10 text-[10px] font-black text-slate-500 uppercase tracking-widest">Date (তারিখ)</TableHead>
                          <TableHead className="py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Details (বিবরণ)</TableHead>
                          <TableHead className="py-6 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">Purchase Amount (ক্রয়)</TableHead>
                          <TableHead className="py-6 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">Paid Amount (প্রদান)</TableHead>
                          <TableHead className="py-6 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">Balance (বকেয়া)</TableHead>
                          <TableHead className="py-6 pr-10 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {ledgerWithBalance.length === 0 ? (
                          <TableRow><TableCell colSpan={5} className="h-64 text-center text-slate-300 font-black uppercase tracking-widest">No records found...</TableCell></TableRow>
                        ) : (
                          ledgerWithBalance.map((entry, idx) => (
                            <TableRow key={idx} className="group border-b-slate-50 hover:bg-slate-50 transition-all">
                              <TableCell className="py-6 pl-10">
                                 <div className="flex flex-col">
                                    <span className="text-sm font-black text-slate-900 transition-colors uppercase tracking-tight">
                                       {entry.purchaseId ? (
                                          <Link href={`/purchases/${entry.purchaseId}`} className="hover:text-amber-600 flex items-center gap-2">
                                             #{entry.ref} <Truck className="h-3 w-3" />
                                          </Link>
                                       ) : (
                                          `REF: ${entry.ref}`
                                       )}
                                    </span>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase">{new Date(entry.date).toLocaleDateString()}</span>
                                 </div>
                              </TableCell>
                              <TableCell className="max-w-[180px]">
                                 <span className="text-xs font-bold text-slate-600 line-clamp-1">{entry.description}</span>
                              </TableCell>
                              <TableCell className="text-right py-6 font-bold text-slate-400 tabular-nums text-xs">
                                 {entry.debit > 0 ? `Tk ${entry.debit.toLocaleString()}` : "—"}
                              </TableCell>
                              <TableCell className="text-right py-6 font-bold text-emerald-600 tabular-nums text-xs">
                                 {entry.credit > 0 ? `Tk ${entry.credit.toLocaleString()}` : "—"}
                              </TableCell>
                              <TableCell className="text-right py-6 font-black text-amber-600 tabular-nums">
                                 Tk {entry.balance.toLocaleString()}
                              </TableCell>
                              <TableCell className="text-right py-6 pr-10">
                                 <div className="flex justify-end gap-2 text-slate-400">
                                    {entry.type === "PURCHASE" && entry.purchaseId && (
                                       <>
                                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-amber-600 hover:text-white transition-all shadow-sm" asChild title="Edit Purchase">
                                             <Link href={`/purchases/${entry.purchaseId}/edit`}>
                                                <Pencil className="h-4 w-4" />
                                             </Link>
                                          </Button>
                                          <DeleteConfirmDialog 
                                            onDelete={deletePurchase.bind(null, entry.purchaseId)}
                                            title="Delete Purchase?"
                                            description="This will reverse stock additions and adjust supplier balance."
                                            itemName={entry.ref}
                                          />
                                       </>
                                    )}
                                    {entry.type === "PAYMENT" && (entry as any).transactionId && (
                                       <DeleteConfirmDialog 
                                         onDelete={deleteTransaction.bind(null, (entry as any).transactionId)}
                                         title="Delete Transaction?"
                                         description="This will reverse the payment and increase the supplier's due balance."
                                         itemName={entry.ref}
                                        />
                                    )}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <Card className="border-none shadow-xl shadow-slate-200/40 rounded-[2.5rem] bg-white p-8">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                     <MapPin className="h-3 w-3 text-amber-500" /> Address (ঠিকানা)
                  </p>
                  <div className="space-y-6">
                     <div>
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Shop Address (দোকানের ঠিকানা)</p>
                        <p className="text-sm font-bold text-slate-700">{supplier.address || "Unregistered"}</p>
                     </div>
                  </div>
               </Card>
               <div className="bg-amber-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-125 transition-transform duration-1000">
                     <ShieldAlert className="h-20 w-20" />
                  </div>
                  <p className="text-amber-400 text-[10px] font-black uppercase tracking-widest mb-6">Note (নোট)</p>
                  <p className="text-sm font-medium text-amber-100/70 leading-relaxed italic relative z-10">
                     "Regular supplier. Try to clear payments on time for good relations."
                  </p>
               </div>
            </div>
         </div>

         {/* Action Intelligence */}
         <div className="lg:col-span-4 space-y-8 sticky top-32 w-full">
            <Card className="border-none shadow-2xl shadow-amber-500/10 rounded-[3rem] overflow-hidden bg-slate-900 text-white">
               <CardHeader className="bg-white/5 border-b border-white/5 px-10 py-8 text-center">
                  <CardTitle className="text-xl font-black font-outfit uppercase tracking-tighter">Pay Supplier (পেমেন্ট করুন)</CardTitle>
                  <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest">Add new payment</p>
               </CardHeader>
               <CardContent className="p-10">
                  {supplier.dueBalance <= 0 ? (
                    <div className="text-center py-10 space-y-4">
                       <div className="h-20 w-20 bg-white/10 rounded-[2rem] flex items-center justify-center mx-auto backdrop-blur-md border border-white/20">
                          <CheckCircle2 className="h-10 w-10 text-emerald-400" />
                       </div>
                       <div>
                          <p className="text-lg font-black font-outfit">All Paid (সব পরিশোধ)</p>
                          <p className="text-xs text-slate-400 mt-1">You don't owe any money here.</p>
                       </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                       <div className="bg-white/10 rounded-2xl p-6 text-center border border-white/10 backdrop-blur-md">
                          <p className="text-[9px] font-black uppercase tracking-widest text-amber-400 mb-1">Total Due (মোট বকেয়া)</p>
                          <h4 className="text-3xl font-black font-outfit tabular-nums">Tk {supplier.dueBalance.toLocaleString()}</h4>
                       </div>
                       <PaySupplierForm supplierId={supplier.id} currentDue={supplier.dueBalance} />
                    </div>
                  )}
               </CardContent>
            </Card>

            <div className="bg-amber-50 border-2 border-amber-100/50 rounded-[2.5rem] p-8 shadow-xl shadow-amber-200/20">
               <div className="flex gap-4 items-center">
                  <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center shadow-inner">
                     <Footprints className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                     <p className="text-[10px] font-black uppercase tracking-widest text-amber-900/40">Supply Status</p>
                     <p className="text-xs font-bold text-amber-900/70 mt-0.5">Our relationship with this supplier is good.</p>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
