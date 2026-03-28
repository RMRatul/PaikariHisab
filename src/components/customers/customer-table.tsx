"use client";
import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { User, Store, Phone, MapPin, Eye, ArrowUpRight, Star, ShieldAlert, Trash2, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { deleteCustomer } from "@/actions/customer";

export function CustomerTable({ customers, q }: { customers: any[], q?: string }) {
  const router = useRouter();

  return (
    <div className="relative max-h-[500px] overflow-auto custom-scrollbar border border-slate-100/50 rounded-2xl shadow-sm bg-white">
      <Table>
        <TableHeader className="bg-slate-50 sticky top-0 z-10 shadow-sm">
          <TableRow className="hover:bg-transparent border-b-slate-100">
            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 py-6 pl-10">Relationship Partner</TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 py-6">Commercial Entity</TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 py-6">Contact Vector</TableHead>
            <TableHead className="text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 py-6">Balance Sheet</TableHead>
            <TableHead className="text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 py-6 pr-10">Ledger Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-64 text-center">
                 <div className="flex flex-col items-center justify-center text-slate-300 gap-4">
                    <User className="h-12 w-12 opacity-20" />
                    <p className="text-sm font-black uppercase tracking-widest">{q ? `No Match Found for "${q}"` : "Registry Empty"}</p>
                 </div>
              </TableCell>
            </TableRow>
          ) : (
            customers.map((c) => (
              <TableRow 
                key={c.id} 
                className="group border-b-slate-50 hover:bg-slate-50/50 transition-all cursor-pointer"
                onClick={() => router.push(`/customers/${c.id}`)}
              >
                <TableCell className="py-6 pl-10">
                   <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-black text-sm group-hover:bg-indigo-600 group-hover:text-white transition-all">
                         {c.name.charAt(0).toUpperCase()}
                      </div>
                       <div className="flex flex-col">
                          <span className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">
                             {c.name} {c.code && <span className="text-[10px] font-bold text-slate-400 ml-2">[{c.code}]</span>}
                          </span>
                          <div className="flex items-center gap-2 mt-0.5">
                           {(() => {
                              const totalSales = c.sales?.reduce((acc: number, s: any) => acc + s.totalAmount, 0) || 1;
                              const dueRatio = c.dueBalance / totalSales;
                              const txCount = c.sales?.length || 0;

                              if (c.dueBalance > 20000 || dueRatio > 0.6) {
                                 return (
                                    <span className="text-[8px] font-black text-rose-500 uppercase tracking-widest bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100 flex items-center gap-1">
                                       <ShieldAlert className="h-2 w-2" /> Credit Risk
                                    </span>
                                 );
                              } else if (txCount > 5 && dueRatio < 0.1) {
                                 return (
                                    <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 flex items-center gap-1">
                                       <Star className="h-2 w-2" /> VIP Candidate
                                    </span>
                                 );
                              } else {
                                 return <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Standard Profile</span>;
                              }
                           })()}
                        </div>
                       </div>
                   </div>
                </TableCell>
                <TableCell className="py-6">
                   <div className="flex items-center gap-2 group/shop">
                      <Store className="h-3.5 w-3.5 text-slate-300 group-hover/shop:text-indigo-400 transition-colors" />
                      <div className="flex flex-col">
                         <span className="text-xs font-bold text-slate-600">{c.shopName || "Private Agent"}</span>
                         <span className="text-[9px] font-medium text-slate-400 max-w-[150px] truncate">{c.shopAddress || "No location set"}</span>
                      </div>
                   </div>
                </TableCell>
                <TableCell className="py-6">
                   <div className="flex items-center gap-2 text-slate-500">
                      <Phone className="h-3.5 w-3.5 opacity-50" />
                      <span className="text-xs font-medium tabular-nums tracking-tighter">{c.phone}</span>
                   </div>
                </TableCell>
                <TableCell className="text-right py-6">
                   {c.dueBalance > 0 ? (
                      <div className="flex flex-col items-end gap-1">
                         <span className="text-sm font-black text-rose-600 tabular-nums">Tk {c.dueBalance.toLocaleString()}</span>
                         <span className="inline-flex px-2 py-0.5 bg-rose-50 rounded-full text-[8px] font-black uppercase tracking-widest text-rose-500 border border-rose-100 shadow-sm">Outstanding</span>
                      </div>
                   ) : (
                      <div className="flex flex-col items-end gap-1 text-emerald-500">
                         <span className="text-sm font-black tabular-nums">Tk 0</span>
                         <span className="inline-flex px-2 py-0.5 bg-emerald-50 rounded-full text-[8px] font-black uppercase tracking-widest text-emerald-500 border border-emerald-100 shadow-sm">Settled</span>
                      </div>
                   )}
                </TableCell>
                <TableCell className="text-right py-6 pr-10" onClick={(e) => e.stopPropagation()}>
                   <div className="flex justify-end items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white hover:shadow-md transition-all group/pencil" asChild>
                         <Link href={`/customers/${c.id}/edit`}>
                            <Pencil className="h-4 w-4 text-slate-400 group-hover/pencil:text-indigo-600" />
                          </Link>
                      </Button>
                      <DeleteConfirmDialog 
                         onDelete={() => deleteCustomer(c.id)}
                         title="Permanently Delete Customer?"
                         description="This will remove the customer and their associated ledger visibility. This action is destructive and cannot be reversed."
                         itemName={c.name}
                      />
                   </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
