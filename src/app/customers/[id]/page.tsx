import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Phone, MapPin, Pencil, TrendingUp, TrendingDown, Star, Wallet, CreditCard, ShoppingBag, History, FileText, CheckCircle2, ShieldAlert, Clock, Eye } from "lucide-react";
import Link from "next/link";
import { CollectPaymentForm } from "@/components/customers/payment/collect-payment-form";
import { cn } from "@/lib/utils";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { deleteTransaction } from "@/actions/transaction";
import { deleteSale } from "@/actions/sales";
import { WhatsAppShareButton } from "@/components/customers/whatsapp-share-button";
import { Trash2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CustomerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const customer = await db.customer.findUnique({
    where: { id },
    include: {
      sales: { include: { items: { include: { product: true } } }, orderBy: { date: "asc" } },
      returns: true,
      transactions: { orderBy: { date: "asc" } },
    },
  });

  if (!customer) notFound();

  // Ledger Logic
  type LedgerEntry = {
    date: Date;
    type: "SALE" | "PAYMENT" | "RETURN" | "OPENING";
    description: string;
    debit: number;
    credit: number;
    ref: string;
    memoId?: string;
    transactionId?: string;
  };

  const totalLedgerDebit = customer.sales.reduce((s, x) => s + x.totalAmount, 0);
  const totalLedgerCredit = customer.transactions.reduce((s, x) => s + (x.amount + x.discount), 0) + customer.returns.reduce((s, x) => s + x.totalAmount, 0);
  const unaccountedDue = customer.dueBalance - (totalLedgerDebit - totalLedgerCredit);

  const initialEntries: LedgerEntry[] = [];
  if (Math.abs(unaccountedDue) > 0.01) {
    initialEntries.push({
      date: customer.createdAt,
      type: "OPENING",
      description: "Balance Brought Forward (পূর্বের বকেয়া)",
      debit: unaccountedDue > 0 ? unaccountedDue : 0,
      credit: unaccountedDue < 0 ? Math.abs(unaccountedDue) : 0,
      ref: "B/F",
    });
  }

  const ledgerEntries: LedgerEntry[] = [
    ...initialEntries,
    ...customer.sales.map((s) => ({
      date: s.date,
      type: "SALE" as const,
      description: `Sales Transaction — ${s.items.length} Assets ${s.courierName ? `via ${s.courierName}` : ""}`,
      debit: s.totalAmount,
      credit: 0,
      ref: s.memoNo,
      memoId: s.id,
    })),
    ...customer.transactions.map((t) => ({
      date: t.date,
      type: "PAYMENT" as const,
      description: `${t.description || "Credit Recieved"} — ${t.method}${t.discount > 0 ? ` (Rebate: Tk ${t.discount})` : ""}`,
      debit: 0,
      credit: t.amount + t.discount,
      ref: t.id.slice(-6).toUpperCase(),
      transactionId: t.id
    })),
    ...customer.returns.map((r) => ({
      date: r.date,
      type: "RETURN" as const,
      description: r.reason || "Asset Restitution (মাল ফেরত)",
      debit: 0,
      credit: r.totalAmount,
      ref: "RTN",
    })),
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let runningBalance = 0;
  const ledgerWithBalance = ledgerEntries.map((entry) => {
    runningBalance += entry.debit - entry.credit;
    return { ...entry, balance: runningBalance };
  });

  // Intelligence Metrics
  const totalSalesTk = customer.sales.reduce((s, x) => s + x.totalAmount, 0);
  const totalPaidTk = customer.transactions.reduce((s, x) => s + x.amount, 0);
  const collectionRate = totalSalesTk > 0 ? (totalPaidTk / totalSalesTk) : 0;
  const avgDueRatio = totalSalesTk > 0 ? (customer.dueBalance / totalSalesTk) : 0;
  
  // Advanced Ranking Logic
  const txCount = customer.sales.length;
  const avgSaleValue = txCount > 0 ? (totalSalesTk / txCount) : 0;
  const isOverdue = customer.dueBalance > (avgSaleValue * 1.5) && txCount > 2;

  // Baki Aging Logic: Find the date of the oldest UNPAID debt
  // We look for the first entry in the ledger that contributed to the current positive balance
  const oldestUnpaidEntry = ledgerWithBalance.find(e => e.balance > 0.01);
  const bakiAgeDays = oldestUnpaidEntry ? Math.floor((new Date().getTime() - new Date(oldestUnpaidEntry.date).getTime()) / (1000 * 3600 * 24)) : 0;

  const statusConfig = {
    VIP: { label: "VIP Partner", color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20", icon: Star, desc: "High Volume, Fast Settlement" },
    Standard: { label: "Regular Asset", color: "text-indigo-500", bg: "bg-indigo-500/10", border: "border-indigo-500/20", icon: CheckCircle2, desc: "Consistent Performance" },
    Risky: { label: "Watchlist / Credit Risk", color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20", icon: ShieldAlert, desc: "High Arrears / Slow Pay" },
  };

  let clientTier: keyof typeof statusConfig = "Standard";
  if (isOverdue || avgDueRatio > 0.6) clientTier = "Risky";
  else if (collectionRate > 0.9 && txCount > 5) clientTier = "VIP";
  const tier = statusConfig[clientTier];


  return (
    <div className="flex-1 space-y-10 pb-20">
      {/* Intelligence Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex items-center gap-6">
           <Button variant="ghost" size="icon" className="h-14 w-14 rounded-2xl bg-white shadow-xl shadow-slate-200/50 hover:bg-slate-50 border border-slate-100 group" asChild>
             <Link href="/customers"><ArrowLeft className="h-6 w-6 group-hover:-translate-x-1 transition-transform" /></Link>
           </Button>
           <div>
              <div className="flex items-center gap-3 mb-2">
                 <div className={cn("px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2 border", tier.bg, tier.color, tier.border)}>
                    <tier.icon className="h-3 w-3" />
                    {tier.label}
                 </div>
                 {isOverdue && (
                    <div className="px-4 py-1 rounded-full bg-rose-600 text-white text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2 animate-pulse">
                       <ShieldAlert className="h-3 w-3" />
                       Critical Arrears
                    </div>
                 )}
              </div>
              <h1 className="text-5xl font-black font-outfit text-slate-900 tracking-tighter">
                {customer.name} {customer.code && <span className="text-2xl font-bold text-slate-300 align-middle ml-4">#{customer.code}</span>}
              </h1>
              <div className="flex items-center gap-6 mt-3">
                 <span className="flex items-center gap-2 text-sm font-bold text-slate-500">
                    <div className="h-2 w-2 rounded-full bg-indigo-500" />
                    {customer.phone}
                 </span>
                 {customer.shopName && (
                   <span className="flex items-center gap-2 text-sm font-bold text-slate-400">
                      <ShoppingBag className="h-4 w-4 text-slate-300" /> {customer.shopName}
                   </span>
                 )}
              </div>
           </div>
        </div>
        <div className="flex gap-4">
           <WhatsAppShareButton 
             phone={customer.phone}
             name={customer.name}
             totalSales={totalSalesTk}
             dueBalance={customer.dueBalance}
             tierLabel={tier.label}
           />
           <Button className="h-14 px-8 rounded-2xl bg-white border-2 border-slate-100 text-slate-600 hover:bg-slate-50 shadow-xl shadow-slate-200/30 font-black uppercase tracking-widest text-[10px] transition-all active:scale-95" asChild>
             <Link href={`/customers/${id}/edit`}><Pencil className="h-4 w-4 mr-2" /> Adjust Registry</Link>
           </Button>
        </div>
      </div>

      {/* Bento KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         {[
           { label: "Total Buy (মোট কেনাকাটা)", val: `Tk ${totalSalesTk.toLocaleString()}`, sub: "Total Sales Amount", icon: TrendingUp, color: "text-indigo-600", bg: "bg-indigo-50" },
           { label: "Due Age (বকেয়ার বয়স)", val: `${bakiAgeDays} Days`, sub: "Days Since Oldest Due", icon: Clock, color: bakiAgeDays > 30 ? "text-rose-600" : "text-amber-600", bg: bakiAgeDays > 30 ? "bg-rose-50" : "bg-amber-50" },
           { label: "Total Memo (মোট মেমো)", val: `${txCount}`, sub: "Total Invoices Issued", icon: History, color: "text-amber-600", bg: "bg-amber-50" },
           { label: "Paid Rate (পরিশোধের হার)", val: `${Math.round(collectionRate * 100)}%`, sub: "Payment Percentage", icon: CreditCard, color: "text-indigo-600", bg: "bg-indigo-50" },
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
                    <CardTitle className="text-xl font-black font-outfit uppercase tracking-[0.1em]">Transaction History (লেনদেনের হিসাব)</CardTitle>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">All Invoices and Payments</p>
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
                          <TableHead className="py-6 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">Debit (Tk)</TableHead>
                          <TableHead className="py-6 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">Credit (Tk)</TableHead>
                          <TableHead className="py-6 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">Balance (বকেয়া)</TableHead>
                          <TableHead className="py-6 pr-10 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {ledgerWithBalance.length === 0 ? (
                          <TableRow><TableCell colSpan={5} className="h-64 text-center text-slate-300 font-black uppercase tracking-widest">Timeline empty...</TableCell></TableRow>
                        ) : (
                          ledgerWithBalance.map((entry, idx) => (
                            <TableRow key={idx} className="group border-b-slate-50 hover:bg-slate-50 transition-all">
                              <TableCell className="py-6 pl-10">
                                 <div className="flex flex-col">
                                    <span className="text-sm font-black text-slate-900 transition-colors uppercase tracking-tight">
                                       {entry.memoId ? (
                                          <Link href={`/sales/${entry.memoId}`} className="hover:text-indigo-600 flex items-center gap-2">
                                             #{entry.ref} <FileText className="h-3 w-3" />
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
                              <TableCell className="text-right py-6 font-bold text-rose-500 tabular-nums text-xs">
                                 {entry.debit > 0 ? `Tk ${entry.debit.toLocaleString()}` : "—"}
                              </TableCell>
                              <TableCell className="text-right py-6 font-bold text-emerald-600 tabular-nums text-xs">
                                 {entry.credit > 0 ? `Tk ${entry.credit.toLocaleString()}` : "—"}
                              </TableCell>
                              <TableCell className="text-right py-6 font-black text-slate-900 tabular-nums">
                                 Tk {entry.balance.toLocaleString()}
                              </TableCell>
                              <TableCell className="text-right py-6 pr-10">
                                 <div className="flex justify-end gap-2 text-slate-400">
                                    {entry.type === "SALE" && entry.memoId && (
                                       <>
                                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm" asChild title="View Memo">
                                             <Link href={`/sales/${entry.memoId}`}>
                                                <Eye className="h-4 w-4" />
                                             </Link>
                                          </Button>
                                          <DeleteConfirmDialog 
                                            onDelete={deleteSale.bind(null, entry.memoId)}
                                            title="Delete Sale Record?"
                                            description="This will reverse the sale, restock products, and adjust customer balance."
                                            itemName={entry.ref}
                                          />
                                       </>
                                    )}
                                    {entry.type === "PAYMENT" && entry.transactionId && (
                                       <DeleteConfirmDialog 
                                         onDelete={deleteTransaction.bind(null, entry.transactionId!)}
                                         title="Delete Transaction?"
                                         description="This will reverse the collection and increase the customer's due balance."
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
                     <MapPin className="h-3 w-3 text-indigo-500" /> Address (ঠিকানা)
                  </p>
                  <div className="space-y-6">
                     <div>
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Commercial Hub (দোকানের ঠিকানা)</p>
                        <p className="text-sm font-bold text-slate-700">{customer.shopAddress || "Unregistered Registry"}</p>
                     </div>
                     <div>
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Domicile (স্থায়ী ঠিকানা)</p>
                        <p className="text-sm font-bold text-slate-700">{customer.permanentAddress || "Confidential"}</p>
                     </div>
                  </div>
               </Card>
               <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-125 transition-transform duration-1000">
                     <FileText className="h-20 w-20" />
                  </div>
                  <p className="text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-6">Note (নোট)</p>
                  <p className="text-sm font-medium text-slate-400 leading-relaxed italic relative z-10">
                     "Customer since {new Date(customer.createdAt).toLocaleDateString()}. Maintain good relations for better sales."
                  </p>
               </div>
            </div>
         </div>

         {/* Action Intelligence */}
         <div className="lg:col-span-4 space-y-8 sticky top-32 w-full">
            <Card className="border-none shadow-2xl shadow-indigo-500/10 rounded-[3rem] overflow-hidden bg-indigo-600 text-white">
               <CardHeader className="bg-white/5 border-b border-white/5 px-10 py-8 text-center">
                  <CardTitle className="text-xl font-black font-outfit uppercase tracking-tighter">Clear Due (বকেয়া পরিশোধ)</CardTitle>
                  <p className="text-indigo-300 text-[9px] font-black uppercase tracking-widest text-center">Add Received Payments</p>
               </CardHeader>
               <CardContent className="p-10">
                  {customer.dueBalance <= 0 ? (
                    <div className="text-center py-10 space-y-4">
                       <div className="h-20 w-20 bg-white/10 rounded-[2rem] flex items-center justify-center mx-auto backdrop-blur-md border border-white/20">
                          <CheckCircle2 className="h-10 w-10 text-emerald-400" />
                       </div>
                       <div>
                          <p className="text-lg font-black font-outfit">Full Liquidity Cleared</p>
                          <p className="text-xs text-indigo-200 mt-1 uppercase font-bold tracking-widest">Target Status: All Clear</p>
                       </div>
                    </div>
                  ) : (
                     <div className="space-y-6">
                        <div className="bg-white/10 rounded-2xl p-6 text-center border border-white/10 backdrop-blur-md">
                           <p className="text-[9px] font-black uppercase tracking-widest text-indigo-200 mb-1">Total Due (মোট বকেয়া)</p>
                           <h4 className="text-4xl font-black font-outfit tabular-nums">Tk {customer.dueBalance.toLocaleString()}</h4>
                        </div>
                       <CollectPaymentForm customerId={customer.id} currentDue={customer.dueBalance} />
                    </div>
                  )}
               </CardContent>
            </Card>

            <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/40 relative overflow-hidden group">
               <div className="flex gap-5 items-start">
                  <div className="h-14 w-14 bg-indigo-50 rounded-2xl flex items-center justify-center shadow-inner group-hover:bg-indigo-600 transition-colors duration-500">
                     <TrendingUp className="h-7 w-7 text-indigo-600 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                     <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Payment Habit (পরিশোধের অভ্যাস)</p>
                     <h5 className="text-lg font-black font-outfit text-slate-900 leading-tight">
                        {collectionRate > 0.8 ? "Good Payment Habit" : "Needs Collection Effort"}
                     </h5>
                     <p className="text-[11px] font-bold text-slate-400 mt-2 leading-relaxed">
                        Customer pays back ~{Math.round(collectionRate * 100)}% of their total credit within time.
                     </p>
                  </div>
               </div>
            </div>
            
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-10">
                  <ShieldAlert className="h-20 w-20" />
               </div>
               <p className="text-rose-400 text-[10px] font-black uppercase tracking-[0.4em] mb-4">Credit Risk (ঝুঁকি)</p>
               <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-400">
                     <span>Due to Purchase Ratio</span>
                     <span className={cn(avgDueRatio > 0.5 ? "text-rose-500" : "text-emerald-500")}>{(avgDueRatio * 100).toFixed(1)}%</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                     <div 
                        className={cn("h-full transition-all duration-1000", avgDueRatio > 0.5 ? "bg-rose-500" : "bg-emerald-500")}
                        style={{ width: `${Math.min(avgDueRatio * 100, 100)}%` }}
                     />
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium italic mt-4">
                     {avgDueRatio > 0.5 ? "Warning: Arrears exceed half of lifetime value." : "Health: Account within safe credit limits."}
                  </p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
