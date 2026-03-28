"use client";
import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Edit3, ExternalLink, AlertCircle, CheckCircle2, MoreVertical, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { DeleteConfirmDialog } from "@/components/ui/delete-confirm-dialog";
import { deleteProduct } from "@/actions/inventory";

export function InventoryTable({ products, q }: { products: any[], q?: string }) {
  const router = useRouter();

  return (
    <div className="relative max-h-[500px] overflow-auto custom-scrollbar border border-slate-100/50 rounded-2xl shadow-sm bg-white">
      <Table>
        <TableHeader className="bg-slate-50 sticky top-0 z-10 shadow-sm">
          <TableRow className="hover:bg-transparent border-b-slate-100">
            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 py-6 pl-10">Codebase</TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 py-6">Product Nomenclature</TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 py-6">Category</TableHead>
            <TableHead className="text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 py-6">Acquisition</TableHead>
            <TableHead className="text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 py-6">Valuation</TableHead>
            <TableHead className="text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 py-6">Availability</TableHead>
            <TableHead className="text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 py-6 pr-10">Operations</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-64 text-center">
                <div className="flex flex-col items-center justify-center text-slate-400 gap-3">
                   <AlertCircle className="h-10 w-10 opacity-20" />
                   <p className="text-sm font-black uppercase tracking-widest">{q ? `Null Result for "${q}"` : "Warehouse Empty"}</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            products.map((p) => (
              <TableRow 
                key={p.id} 
                className="group border-b-slate-50 hover:bg-slate-50/50 transition-all cursor-pointer"
                onClick={() => router.push(`/inventory/${p.id}`)}
              >
                <TableCell className="py-6 pl-10">
                   <span className="font-mono text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md uppercase">
                      {p.code || 'NO-SKU'}
                   </span>
                </TableCell>
                <TableCell className="py-6">
                   <div className="flex flex-col">
                      <span className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">
                         {p.name}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Physical Asset</span>
                   </div>
                </TableCell>
                <TableCell className="py-6">
                   <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100/50 text-indigo-600 text-[9px] font-black uppercase tracking-widest shadow-sm">
                      <div className="h-1 w-1 bg-indigo-400 rounded-full" />
                      {p.category}
                   </div>
                </TableCell>
                <TableCell className="text-right py-6">
                   <span className="text-xs font-bold text-slate-500 uppercase">Tk {p.purchasePrice.toLocaleString()}</span>
                </TableCell>
                <TableCell className="text-right py-6">
                   <span className="text-sm font-black text-slate-900 tabular-nums uppercase">Tk {p.sellingPrice.toLocaleString()}</span>
                </TableCell>
                <TableCell className="text-right py-6">
                   <div className="flex flex-col items-end gap-1">
                      <div className={cn(
                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-2xl text-[10px] font-black uppercase tracking-tighter shadow-sm",
                        p.stock <= 5 
                          ? "bg-rose-50 text-rose-600 border border-rose-100" 
                          : p.stock <= 20 
                            ? "bg-amber-50 text-amber-600 border border-amber-100" 
                            : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                      )}>
                         {p.stock <= 5 ? <AlertCircle className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                         {p.stock} Units
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">In Warehouse</span>
                   </div>
                </TableCell>
                <TableCell className="text-right py-6 pr-10" onClick={(e) => e.stopPropagation()}>
                   <div className="flex justify-end gap-2 isolate">
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-white hover:shadow-md transition-all group/edit" asChild>
                         <Link href={`/inventory/${p.id}`}>
                            <Edit3 className="h-4 w-4 text-slate-400 group-hover/edit:text-indigo-600" />
                         </Link>
                      </Button>
                      <div onClick={(e) => e.stopPropagation()}>
                        <DeleteConfirmDialog 
                             onDelete={() => deleteProduct(p.id)}
                             title="Permanently Delete SKU?"
                             description="This will remove the product and all associated history from the warehouse records. This action is destructive."
                             itemName={p.name}
                          />
                      </div>
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
