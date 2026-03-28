"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createPurchase, updatePurchase } from "@/actions/purchase";
import { Trash2, Plus, ShoppingCart, User, CreditCard, ChevronRight, PackageCheck, ShieldCheck, Wallet, ArrowLeft } from "lucide-react";
import type { Supplier, Product } from "@/generated/client";
import { cn } from "@/lib/utils";
import Link from "next/link";

type PurchaseItem = { productId: string; quantity: number; price: number };

interface PurchaseFormProps {
  suppliers: Supplier[];
  products: Product[];
  initialData?: any;
  nextInvoiceNo?: string;
}

export function PurchaseForm({ suppliers, products, initialData, nextInvoiceNo }: PurchaseFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [supplierId, setSupplierId] = useState(initialData?.supplierId || "");
  const [invoiceNo, setInvoiceNo] = useState(initialData?.invoiceNo || nextInvoiceNo || "");
  useEffect(() => {
    if (nextInvoiceNo && !initialData?.invoiceNo && !invoiceNo) {
      setInvoiceNo(nextInvoiceNo);
    }
  }, [nextInvoiceNo]);
  const [items, setItems] = useState<PurchaseItem[]>(
    initialData?.items?.map((i: any) => ({
      productId: i.productId,
      quantity: i.quantity,
      price: i.price,
    })) || [{ productId: "", quantity: 1, price: 0 }]
  );
  const [paidAmount, setPaidAmount] = useState(initialData?.paidAmount || 0);
  const [method, setMethod] = useState(initialData?.method || "CASH");

  const subTotal = items.reduce((sum, i) => sum + i.quantity * i.price, 0);
  const totalAmount = subTotal;
  const dueAdded = Math.max(0, totalAmount - paidAmount);

  const updateItem = (index: number, field: keyof PurchaseItem, value: string | number) => {
    const updated = [...items];
    if (field === "productId") {
      const p = products.find((x) => x.id === value);
      updated[index] = { ...updated[index], productId: value as string, price: p?.purchasePrice ?? 0 };
    } else {
      (updated[index] as any)[field] = value;
    }
    setItems(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId) { setError("Please select a supplier (সাপ্লায়ার সিলেক্ট করুন)."); return; }
    if (items.some((i) => !i.productId)) { setError("Please select products (পণ্য সিলেক্ট করুন)."); return; }
    
    setLoading(true);
    const payload = { 
      supplierId, 
      invoiceNo: invoiceNo || undefined, 
      items, 
      totalAmount, 
      discount: 0, 
      paidAmount, 
      method,
      dueAdded 
    };

    const result = initialData 
      ? await updatePurchase(initialData.id, payload)
      : await createPurchase(payload);

    if (result.success) { 
      router.push("/purchases");
      router.refresh();
    } else { 
      setError(result.error || "System Error (সিস্টেম এরর: কিছু ভুল হয়েছে)"); 
      setLoading(false); 
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10 max-w-7xl mx-auto">
      {error && (
        <div className="bg-rose-50 border border-rose-100 p-6 rounded-[2rem] flex items-center gap-4 text-rose-600 animate-in fade-in slide-in-from-top-4 duration-500">
           <ShieldCheck className="h-6 w-6" />
           <p className="font-bold text-sm tracking-tight">{error}</p>
        </div>
      )}

      {/* Serial Invoice Number Display */}
      {(!initialData) && (
        <div className="bg-white/50 backdrop-blur-md border border-slate-100 p-6 rounded-[2rem] flex items-center justify-between shadow-sm">
           <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-amber-50 rounded-xl flex items-center justify-center border border-amber-100">
                 <PackageCheck className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                 <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Next Available Serial (পরবর্তী সিরিয়াল)</p>
                 <h4 className="text-lg font-black font-outfit text-amber-900">{invoiceNo || "Auto-generating..." }</h4>
              </div>
           </div>
           <div className="px-5 py-2 bg-emerald-50 rounded-full border border-emerald-100 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600">Syncing with server</span>
           </div>
        </div>
      )}

      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-10 items-start">
        {/* Left Side: Input Modules */}
        <div className="lg:col-span-8 space-y-10 w-full">
           {/* Supplier Info */}
           <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/60 p-10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                 <User className="h-24 w-24" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Supplier Name (সাপ্লায়ার/মহাজন) *</label>
                  <select 
                    className="flex h-14 w-full rounded-2xl border-2 border-slate-50 bg-slate-50/50 px-6 py-2 text-sm font-bold ring-offset-background focus:outline-none focus:border-amber-500/50 focus:bg-white transition-all appearance-none" 
                    value={supplierId} 
                    onChange={(e) => setSupplierId(e.target.value)} 
                    required
                  >
                    <option value="">Select Supplier (সাপ্লায়ার খুঁজুন)</option>
                    {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name} {s.company ? `— ${s.company}` : ""}</option>)}
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Invoice / Voucher No (ইনভয়েস নং)</label>
                  <Input 
                    placeholder="Challan or Bill No" 
                    className="h-14 rounded-2xl border-2 border-slate-50 bg-slate-50/50 px-6 font-bold focus:border-amber-500/50 focus:bg-white transition-all text-amber-600"
                    value={invoiceNo} 
                    onChange={e => setInvoiceNo(e.target.value)} 
                    readOnly={!initialData}
                  />
                </div>
              </div>
           </div>

           {/* Product List */}
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/60 p-2 relative overflow-hidden">
               <div className="px-6 py-10 space-y-6">
                  <div className="hidden md:grid grid-cols-12 gap-6 px-4 mb-2">
                     <div className="col-span-5 text-[10px] font-black uppercase text-slate-400 tracking-widest pl-2">Product nomenclature (পণ্য)</div>
                     <div className="col-span-2 text-center text-[10px] font-black uppercase text-slate-400 tracking-widest">Qty (পরিমাণ)</div>
                     <div className="col-span-3 text-right text-[10px] font-black uppercase text-slate-400 tracking-widest">Rate (দাম)</div>
                     <div className="col-span-2 text-right text-[10px] font-black uppercase text-slate-400 tracking-widest pr-4">Total</div>
                  </div>

                  {items.map((item, index) => (
                    <div key={index} className="flex flex-col md:grid md:grid-cols-12 gap-4 md:gap-6 items-start md:items-center group/row p-6 md:p-2 rounded-[2rem] border border-slate-50 md:border-none bg-slate-50/30 md:bg-transparent relative">
                      <div className="col-span-5 w-full">
                        <div className="md:hidden text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 px-1">Product (পণ্য)</div>
                        <div className="relative group/sel">
                          <select 
                            className="flex min-h-12 w-full rounded-2xl border-2 border-slate-50 bg-white px-4 py-3 text-sm font-bold focus:outline-none focus:border-amber-400 appearance-none transition-all shadow-sm leading-relaxed whitespace-normal break-words h-auto" 
                            value={item.productId} 
                            onChange={(e) => updateItem(index, "productId", e.target.value)} 
                            required
                          >
                            <option value="">Select Product (পণ্য খুঁজুুন)</option>
                            {products.map((p) => (
                              <option key={p.id} value={p.id} className="whitespace-normal">
                                {p.name} [{p.code}]
                              </option>
                            ))}
                          </select>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-20 group-hover/sel:opacity-100 transition-opacity">
                             <Plus className="h-4 w-4 rotate-45" />
                          </div>
                        </div>
                      </div>

                      <div className="col-span-2 w-full">
                        <div className="md:hidden text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 px-1">Qty (পরিমাণ)</div>
                        <Input 
                          type="number" 
                          min="1" 
                          value={item.quantity} 
                          onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 1)} 
                          onFocus={(e) => e.target.select()}
                          className="h-12 text-center rounded-2xl border-2 border-slate-50 bg-white font-black tabular-nums focus:border-amber-400 transition-all shadow-sm"
                        />
                      </div>

                      <div className="col-span-3 w-full relative">
                        <div className="md:hidden text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 px-1">Rate (দাম)</div>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase">Tk</span>
                          <Input 
                            type="number" 
                            step="0.01" 
                            min="0" 
                            value={item.price} 
                            onChange={(e) => updateItem(index, "price", parseFloat(e.target.value) || 0)} 
                            onFocus={(e) => e.target.select()}
                            className="h-12 text-right pl-10 rounded-2xl border-2 border-slate-50 bg-white font-black tabular-nums focus:border-amber-400 transition-all shadow-sm"
                          />
                        </div>
                      </div>

                      <div className="col-span-2 w-full flex items-center justify-between md:justify-end gap-4 pt-4 md:pt-0">
                         <div className="md:hidden text-[10px] font-black uppercase text-slate-400 tracking-widest">Total Value</div>
                         <div className="flex items-center gap-3">
                            <div className="h-12 px-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-[10px] font-black text-white tabular-nums shadow-lg">
                               Tk {(item.quantity * item.price).toLocaleString()}
                            </div>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => items.length > 1 && setItems(items.filter((_, i) => i !== index))} 
                              className="h-12 w-12 rounded-xl text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-all border-2 border-transparent hover:border-rose-100 flex-shrink-0"
                              title="Delete Item"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                         </div>
                      </div>
                    </div>
                  ))}

                  <div className="pt-6">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      onClick={() => setItems([...items, { productId: "", quantity: 1, price: 0 }])}
                      className="w-full h-16 border-2 border-dashed border-slate-100 rounded-[2rem] hover:bg-slate-50 text-slate-400 hover:text-amber-600 transition-all group/add gap-4 shadow-sm"
                    >
                      <Plus className="h-6 w-6 group-hover/add:rotate-90 transition-transform duration-500" />
                      <span className="text-xs font-black uppercase tracking-[0.2em]">Add More Item (আরো পণ্য যোগ করুন)</span>
                    </Button>
                  </div>
               </div>
            </div>

           {/* Payment Details */}
           <div className="bg-slate-900 text-white rounded-[3rem] p-10 relative overflow-hidden group shadow-2xl shadow-indigo-500/10">
              <div className="absolute bottom-0 right-0 p-10 opacity-10 group-hover:translate-x-4 transition-transform duration-1000">
                 <CreditCard className="h-32 w-32" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Amount Paid (টাকা দিয়েছেন)</label>
                  <div className="relative">
                     <span className="absolute left-6 top-1/2 -translate-y-1/2 text-sm font-black text-indigo-500/50">TK</span>
                     <Input 
                       type="number" 
                       step="0.01" 
                       min="0" 
                       value={paidAmount || ""} 
                       onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)} 
                       onFocus={(e) => e.target.select()}
                       className="h-16 bg-white/5 border-white/10 rounded-2xl pl-14 font-black text-xl tabular-nums focus:border-indigo-500/50 transition-all placeholder:text-white/10"
                       placeholder="0.00"
                     />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Payment Method (পেমেন্ট পদ্ধতি)</label>
                  <select 
                    className="h-16 w-full bg-white/5 border border-white/10 rounded-2xl px-6 font-black text-lg focus:outline-none focus:border-amber-500/50 transition-all appearance-none text-white"
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                  >
                    <option value="CASH" className="bg-slate-900">Cash / নগদ</option>
                    <option value="BANK" className="bg-slate-900">Bank / ব্যাংক</option>
                    <option value="BKASH" className="bg-slate-900">bKash / বিকাশ</option>
                    <option value="NAGAD" className="bg-slate-900">Nagad / নগদ (Mobile)</option>
                  </select>
                </div>
              </div>
           </div>
        </div>

        {/* Right Side: Execution Dashboard */}
        <div className="lg:col-span-4 w-full lg:mt-0 mt-8">
           <div className="lg:sticky lg:top-8 space-y-8 lg:max-h-[calc(100vh-4rem)] lg:overflow-y-auto pr-1 custom-scrollbar">
           <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[3rem] overflow-hidden bg-white/80 backdrop-blur-xl border border-white/20">
             <CardHeader className="bg-slate-50/50 border-b border-slate-100/50 px-10 py-8 text-center">
                <CardTitle className="text-xl font-black font-outfit uppercase tracking-tighter">Purchase Summary (হিসাব)</CardTitle>
                <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest">Real-time Calculation</p>
             </CardHeader>
             <CardContent className="p-10 space-y-8">
                <div className="space-y-4">
                   <div className="flex justify-between items-center px-4">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Total Price (মোট টাকা)</span>
                      <span className="font-bold tabular-nums">Tk {subTotal.toLocaleString()}</span>
                   </div>
                   <div className="h-px bg-slate-100 mx-2" />
                   <div className="bg-slate-50 rounded-[2rem] p-8 space-y-2 text-center group">
                      <p className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em]">Net Payable (মোট বিল)</p>
                      <h4 className="text-3xl font-black font-outfit tabular-nums tracking-tighter group-hover:scale-105 transition-transform">Tk {totalAmount.toLocaleString()}</h4>
                   </div>
                </div>

                <div className="space-y-4 pt-4">
                   <div className="flex justify-between items-center px-6 py-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                      <span className="text-[9px] font-black uppercase text-emerald-600 tracking-widest">Paid (পরিশোধ)</span>
                      <span className="font-black text-emerald-700 tabular-nums text-lg">Tk {paidAmount.toLocaleString()}</span>
                   </div>
                   <div className={cn(
                     "flex justify-between items-center px-6 py-4 rounded-2xl border transition-all",
                     dueAdded > 0 ? "bg-rose-50 border-rose-100 text-rose-700" : "bg-slate-50 border-slate-100 text-slate-400 opacity-50"
                   )}>
                      <span className="text-[9px] font-black uppercase tracking-widest">Due (বাকি)</span>
                      <span className="font-black tabular-nums text-lg">Tk {dueAdded.toLocaleString()}</span>
                   </div>
                </div>

                <div className="pt-6 flex flex-col gap-4">
                   <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full h-16 rounded-2xl bg-slate-900 border-b-4 border-slate-800 hover:translate-y-0.5 hover:border-b-2 transition-all shadow-xl font-black uppercase tracking-widest text-xs text-white"
                   >
                     {loading ? (
                        <div className="flex items-center gap-2">
                           <ShieldCheck className="h-4 w-4 animate-pulse" /> Saving...
                        </div>
                     ) : initialData ? "Update Purchase" : "Save Purchase"}
                   </Button>
                   <Button 
                    type="button" 
                    onClick={() => router.back()} 
                    disabled={loading}
                    className="w-full h-16 rounded-2xl bg-slate-900 border-b-4 border-slate-800 hover:translate-y-0.5 hover:border-b-2 transition-all shadow-xl font-black uppercase tracking-widest text-xs text-white"
                   >
                     Cancel
                   </Button>
                </div>
             </CardContent>
           </Card>

           <div className="bg-amber-600 rounded-[2rem] p-8 text-white relative overflow-hidden group">
              <div className="absolute -bottom-4 -right-4 p-6 opacity-10 group-hover:scale-125 transition-transform duration-1000">
                 <ShoppingCart className="h-20 w-20" />
              </div>
              <div className="flex gap-4 items-center">
                 <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/10">
                    <PackageCheck className="h-5 w-5" />
                 </div>
                 <div>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Supply Optimization</p>
                    <p className="text-xs font-bold font-outfit mt-0.5">Maintain healthy vendor relations through timely settlement.</p>
                 </div>
              </div>
           </div>
           </div>
        </div>
      </div>
    </form>
  );
}
