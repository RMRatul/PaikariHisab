"use client";
import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Truck, Factory, Phone, MapPin, Eye, ArrowUpRight, ShieldCheck, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { deleteSupplier } from "@/actions/supplier";

export function SupplierTable({ suppliers, q }: { suppliers: any[], q?: string }) {
  const router = useRouter();

  return (
    <div className="relative max-h-[500px] overflow-auto custom-scrollbar border border-slate-100/50 rounded-2xl shadow-sm bg-white">
      <Table>
        <TableHeader className="bg-slate-50 sticky top-0 z-10 shadow-sm">
          <TableRow className="hover:bg-transparent border-b-slate-100">
            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 py-6 pl-10">Supply Chain Partner</TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 py-6">Brand / Entity</TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 py-6">Contact Vector</TableHead>
            <TableHead className="text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 py-6">Accounts Payable</TableHead>
            <TableHead className="text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 py-6 pr-10">Procurement Audit</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {suppliers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-64 text-center">
                 <div className="flex flex-col items-center justify-center text-slate-300 gap-4">
                    <Truck className="h-12 w-12 opacity-20" />
                    <p className="text-sm font-black uppercase tracking-widest">{q ? `No Vendor Match for "${q}"` : "Supply Chain Empty"}</p>
                 </div>
              </TableCell>
            </TableRow>
          ) : (
            suppliers.map((s) => (
              <TableRow 
                key={s.id} 
                className="group border-b-slate-50 hover:bg-slate-50/50 transition-all cursor-pointer"
                onClick={() => router.push(`/suppliers/${s.id}`)}
              >
                <TableCell className="py-6 pl-10">
                   <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 font-black text-sm group-hover:bg-purple-600 group-hover:text-white transition-all">
                         {s.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                         <div className="flex items-center gap-1.5">
                            <span className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">
                               {s.name}
                            </span>
                            <ShieldCheck className="h-3 w-3 text-emerald-500 opacity-50" />
                         </div>
                         <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Verified Mahajan</span>
                      </div>
                   </div>
                </TableCell>
                <TableCell className="py-6">
                   <div className="flex items-center gap-2 group/brand">
                      <Factory className="h-3.5 w-3.5 text-slate-300 group-hover/brand:text-purple-400 transition-colors" />
                      <div className="flex flex-col">
                         <span className="text-xs font-bold text-slate-600">{s.company || "Direct Individual"}</span>
                         <span className="text-[9px] font-medium text-slate-400 max-w-[150px] truncate">{s.address || "No billing address"}</span>
                      </div>
                   </div>
                </TableCell>
                <TableCell className="py-6">
                   <div className="flex items-center gap-2 text-slate-500">
                      <Phone className="h-3.5 w-3.5 opacity-50" />
                      <span className="text-xs font-medium tabular-nums tracking-tighter">{s.phone}</span>
                   </div>
                </TableCell>
                <TableCell className="text-right py-6">
                   {s.dueBalance > 0 ? (
                      <div className="flex flex-col items-end gap-1">
                         <span className="text-sm font-black text-purple-600 tabular-nums">Tk {s.dueBalance.toLocaleString()}</span>
                         <span className="inline-flex px-2 py-0.5 bg-purple-50 rounded-full text-[8px] font-black uppercase tracking-widest text-purple-500 border border-purple-100 shadow-sm">Payable Balance</span>
                      </div>
                   ) : (
                      <div className="flex flex-col items-end gap-1 text-emerald-500">
                         <span className="text-sm font-black tabular-nums">Tk 0</span>
                         <span className="inline-flex px-2 py-0.5 bg-emerald-50 rounded-full text-[8px] font-black uppercase tracking-widest text-emerald-500 border border-emerald-100 shadow-sm">Debt Free</span>
                      </div>
                   )}
                </TableCell>
                <TableCell className="text-right py-6 pr-10" onClick={(e) => e.stopPropagation()}>
                   <div className="flex justify-end gap-2 text-right">
                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white hover:shadow-md transition-all group/eye" asChild>
                         <Link href={`/suppliers/${s.id}`}>
                            <Eye className="h-4 w-4 text-slate-400 group-hover/eye:text-indigo-600" />
                         </Link>
                      </Button>
                      <DeleteConfirmDialog 
                           onDelete={() => deleteSupplier(s.id)}
                           title="Permanently Delete Supplier?"
                           description="This will remove the mahajan and their associated liability history. This action is destructive and cannot be reversed."
                           itemName={s.name}
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
