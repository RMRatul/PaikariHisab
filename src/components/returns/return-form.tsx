"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Plus, User, Package, RefreshCw, ArrowLeft, ShieldAlert, FileText } from "lucide-react";
import type { Customer, Product } from "@/generated/client";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { processReturn } from "@/actions/return";

type ReturnItem = {
  productId: string;
  quantity: number;
  refundPrice: number;
};

export function ReturnForm({
  customers,
  products,
}: {
  customers: Customer[];
  products: Product[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [reason, setReason] = useState("");
  const [items, setItems] = useState<ReturnItem[]>([
    { productId: "", quantity: 1, refundPrice: 0 },
  ]);

  const totalRefund = items.reduce((sum, i) => sum + i.quantity * i.refundPrice, 0);

  const updateItem = (index: number, field: keyof ReturnItem, value: string | number) => {
    const updated = [...items];
    if (field === "productId") {
      const selectedProduct = products.find((p) => p.id === value);
      updated[index] = {
        ...updated[index],
        productId: value as string,
        refundPrice: selectedProduct?.sellingPrice ?? 0, // Default to selling price for refund
      };
    } else {
      (updated[index] as any)[field] = value;
    }
    setItems(updated);
  };

  const addItem = () => {
    setItems([...items, { productId: "", quantity: 1, refundPrice: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) { setError("Please select a customer."); return; }
    if (items.some((i) => !i.productId)) { setError("Please select products for all lines."); return; }
    if (!reason) { setError("Please provide a reason for the return."); return; }

    setLoading(true);
    setError("");
    const result = await processReturn({
      customerId,
      items,
      reason,
    });

    if (result.success) {
      router.push("/returns");
    } else {
      setError(result.error || "System Error (সিস্টেম এরর)");
      setLoading(false);
    }
  };

  const selectedCustomer = customers.find(x => x.id === customerId);

  return (
    <form onSubmit={handleSubmit} className="space-y-10 max-w-7xl mx-auto">
      {error && (
        <div className="bg-rose-50 border border-rose-100 p-6 rounded-[2rem] flex items-center gap-4 text-rose-600 animate-in fade-in slide-in-from-top-4 duration-500">
           <ShieldAlert className="h-6 w-6 shrink-0" />
           <p className="text-sm font-black uppercase tracking-widest">{error}</p>
        </div>
      )}

      <div className="flex items-center gap-6">
         <Button variant="ghost" size="icon" className="h-14 w-14 rounded-2xl bg-white shadow-xl shadow-slate-200/50 hover:bg-slate-50 border border-slate-100 group" asChild>
           <Link href="/returns"><ArrowLeft className="h-6 w-6 group-hover:-translate-x-1 transition-transform" /></Link>
         </Button>
         <h1 className="text-4xl font-black font-outfit text-slate-900 tracking-tighter">Register Asset <span className="text-rose-600">Restitution</span></h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
         <div className="lg:col-span-8 space-y-10 w-full">
            <Card className="border-none shadow-2xl shadow-slate-200/60 rounded-[3.5rem] overflow-hidden bg-white">
               <CardHeader className="bg-slate-50/50 px-10 py-8 border-b border-slate-100 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-3">
                     <Package className="h-4 w-4 text-indigo-500" /> Itemized Return List
                  </CardTitle>
                  <Button type="button" onClick={addItem} variant="outline" className="rounded-xl border-dashed border-2 hover:bg-indigo-50 hover:text-indigo-600 transition-all gap-2 h-10 px-4">
                     <Plus className="h-4 w-4" /> <span className="text-[10px] font-black uppercase tracking-widest">Add Position</span>
                  </Button>
               </CardHeader>
               <CardContent className="p-0">
                  <Table>
                    <TableHeader className="bg-slate-50/30">
                      <TableRow className="hover:bg-transparent border-b-slate-100">
                        <TableHead className="py-6 pl-10 text-[10px] font-black text-slate-500 uppercase tracking-widest">Product Catalog</TableHead>
                        <TableHead className="py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest w-24">Qty</TableHead>
                        <TableHead className="py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Refund Unit (Tk)</TableHead>
                        <TableHead className="py-6 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest pr-10">Effect</TableHead>
                        <TableHead className="w-16"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item, index) => (
                        <TableRow key={index} className="group border-b-slate-50 hover:bg-slate-50/50 transition-all">
                          <TableCell className="py-6 pl-10">
                            <select
                              value={item.productId}
                              onChange={(e) => updateItem(index, "productId", e.target.value)}
                              className="w-full h-12 bg-white border border-slate-200 rounded-xl px-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none appearance-none"
                            >
                              <option value="">Select Asset...</option>
                              {products.map((p) => (
                                <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                              ))}
                            </select>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 1)}
                              className="h-12 border-slate-200 rounded-xl font-bold text-slate-700 text-center"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={item.refundPrice}
                              onChange={(e) => updateItem(index, "refundPrice", parseFloat(e.target.value) || 0)}
                              className="h-12 border-slate-200 rounded-xl font-bold text-slate-700 tabular-nums"
                            />
                          </TableCell>
                          <TableCell className="text-right pr-10">
                             <div className="flex flex-col">
                                <span className="text-sm font-black text-slate-900">Tk {(item.quantity * item.refundPrice).toLocaleString()}</span>
                                <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mt-0.5">Stock +{item.quantity}</span>
                             </div>
                          </TableCell>
                          <TableCell className="pr-10">
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(index)} className="h-10 w-10 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
               </CardContent>
            </Card>

            <Card className="border-none shadow-xl shadow-slate-200/40 rounded-[2.5rem] bg-white p-10">
               <div className="flex items-center gap-4 mb-8">
                  <div className="h-10 w-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-500">
                     <FileText className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-black font-outfit text-slate-900 uppercase tracking-tighter">Restitution Context</h3>
               </div>
               <Input
                  placeholder="Why is this product being returned? (e.g. Size Mismatch, Material Flaw, Extra Stock)"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="h-14 border-slate-200 rounded-2xl px-6 font-bold text-slate-700 bg-slate-50/30 focus:bg-white transition-all shadow-inner border-2"
               />
            </Card>
         </div>

         <div className="lg:col-span-4 space-y-8 sticky top-32">
            <Card className="border-none shadow-2xl shadow-indigo-500/10 rounded-[3rem] overflow-hidden bg-white p-10 border border-slate-100">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-8">Partner Target</p>
               <div className="space-y-6">
                  <div className="relative group">
                     <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                     </div>
                     <select
                        value={customerId}
                        onChange={(e) => setCustomerId(e.target.value)}
                        className="w-full h-14 bg-slate-50/50 border-2 border-slate-100 rounded-2xl pl-12 pr-4 text-sm font-bold text-slate-700 focus:bg-white focus:border-indigo-600 transition-all outline-none appearance-none"
                     >
                        <option value="">Select Customer Entity...</option>
                        {customers.map((c) => (
                           <option key={c.id} value={c.id}>{c.name} — {c.shopName || "Private"}</option>
                        ))}
                     </select>
                  </div>

                  {selectedCustomer && (
                    <div className="p-6 bg-slate-900 rounded-[2rem] text-white relative overflow-hidden animate-in zoom-in-95 duration-500">
                       <div className="absolute right-0 top-0 p-6 opacity-10">
                          <User className="h-16 w-16" />
                       </div>
                       <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">Current Liability</p>
                       <h4 className="text-3xl font-black font-outfit tabular-nums">Tk {selectedCustomer.dueBalance.toLocaleString()}</h4>
                    </div>
                  )}
               </div>

               <div className="mt-12 space-y-4">
                  <div className="flex justify-between items-center px-4">
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Restitution Value</span>
                     <span className="text-2xl font-black font-outfit text-rose-600 tabular-nums">Tk {totalRefund.toLocaleString()}</span>
                  </div>
                  <div className="px-4 py-3 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-between border border-emerald-100">
                     <span className="text-[9px] font-black uppercase tracking-widest">New Balance Prediction</span>
                     <span className="text-sm font-black tabular-nums">Tk {Math.max(0, (selectedCustomer?.dueBalance || 0) - totalRefund).toLocaleString()}</span>
                  </div>
               </div>

               <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full h-16 mt-10 rounded-[1.5rem] bg-indigo-600 border-b-4 border-indigo-800 hover:translate-y-1 hover:border-b-0 transition-all shadow-xl shadow-indigo-200 text-white font-black uppercase tracking-widest text-xs gap-3 disabled:opacity-50"
               >
                  {loading ? <RefreshCw className="animate-spin h-5 w-5" /> : <ShieldAlert className="h-5 w-5" />}
                  {loading ? "Processing..." : "Commit Restitution"}
               </Button>

               <p className="text-[9px] text-slate-400 text-center font-bold uppercase tracking-widest mt-6">
                  Transaction will credit customer balance & adjust stock
               </p>
            </Card>
         </div>
      </div>
    </form>
  );
}
