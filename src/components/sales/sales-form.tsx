"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createSale } from "@/actions/sales";
import { Trash2, Plus, User, ShoppingCart, CreditCard, Ship, CheckCircle2, ShieldAlert, Package, ArrowLeft, Wallet } from "lucide-react";
import type { Customer, Product } from "@/generated/client";
import { cn } from "@/lib/utils";
import Link from "next/link";

type SaleItem = {
  id: string; // Local unique ID for React keys and stable mapping
  productId: string;
  quantity: number;
  price: number;
};

export function SalesForm({
  customers,
  products,
  nextMemoNo,
}: {
  customers: Customer[];
  products: Product[];
  nextMemoNo?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [items, setItems] = useState<SaleItem[]>([
    { id: Math.random().toString(36).substr(2, 9), productId: "", quantity: 1, price: 0 },
  ]);
  const [discount, setDiscount] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [courierName, setCourierName] = useState("");
  // Pre-fill Bilty No if nextMemoNo is provided
  const [courierBilty, setCourierBilty] = useState(nextMemoNo || "");
  const [method, setMethod] = useState("CASH");
  const printAfterSaveRef = useRef(false);

  // Update courierBilty when nextMemoNo changes (initial load)
  useEffect(() => {
    if (nextMemoNo && !courierBilty) {
      setCourierBilty(nextMemoNo);
    }
  }, [nextMemoNo]);

  const subTotal = items.reduce((sum, i) => sum + i.quantity * i.price, 0);
  const totalAmount = subTotal - discount;
  const dueAdded = totalAmount - paidAmount;

  const updateItem = (id: string, field: keyof SaleItem, value: string | number) => {
    setItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      
      if (field === "productId") {
        const selectedProduct = products.find((p) => p.id === value);
        return {
          ...item,
          productId: value as string,
          price: selectedProduct?.sellingPrice ?? 0,
        };
      }
      return { ...item, [field]: value };
    }));
  };

  const addItem = () => {
    setItems(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), productId: "", quantity: 1, price: 0 }]);
  };

  const removeItem = (id: string) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) { setError("Please select a customer."); return; }
    if (items.some((i) => !i.productId)) { setError("Please select products for all lines."); return; }
    if (paidAmount > totalAmount + 0.01) { setError("Cash paid cannot be more than total bill."); return; }

    setLoading(true);
    setError("");
    const result = await createSale({
      customerId,
      // Map back to expected format for server action (removing local ID)
      items: items.map(({ productId, quantity, price }) => ({ productId, quantity, price })),
      subTotal,
      discount,
      totalAmount,
      paidAmount,
      method,
      dueAdded: Math.max(0, dueAdded),
      courierName: courierName || undefined,
      courierBilty: courierBilty || undefined,
    });

    if (result.success) {
      if (printAfterSaveRef.current && result.data && result.data.id) {
        router.push(`/sales/${result.data.id}`);
      } else {
        router.push("/sales");
      }
    } else {
      setError(result.error || "System Error");
      setLoading(false);
    }
  };

  const selectedCustomer = customers.find(x => x.id === customerId);

  return (
    <form onSubmit={handleSubmit} className="space-y-10 max-w-7xl mx-auto">
      {error && (
        <div className="bg-rose-50 border border-rose-100 p-6 rounded-[2rem] flex items-center gap-4 text-rose-600 animate-in fade-in slide-in-from-top-4 duration-500">
           <ShieldAlert className="h-6 w-6" />
           <p className="font-bold text-sm tracking-tight">{error}</p>
        </div>
      )}

      {selectedCustomer && selectedCustomer.dueBalance > 0 && (
        <div className="bg-indigo-900 text-white p-6 rounded-[2rem] flex items-center justify-between border-b-4 border-indigo-950 shadow-2xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-1000">
              <Wallet className="h-16 w-16" />
           </div>
           <div className="flex items-center gap-4 relative z-10">
              <div className="h-12 w-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md border border-white/20">
                 <ShieldAlert className="h-6 w-6 text-indigo-300" />
              </div>
              <div>
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300">Previous Due (আগের বাকি)</p>
                 <h4 className="text-xl font-black font-outfit uppercase tracking-tight">
                    {selectedCustomer.name} - বকেয়া আছে <span className="text-indigo-400">Tk {selectedCustomer.dueBalance.toLocaleString()}</span>
                 </h4>
              </div>
           </div>
           <Link href={`/customers/${selectedCustomer.id}`} className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10 backdrop-blur-md transition-all">
              Profile (প্রোফাইল)
           </Link>
        </div>
      )}

      {/* Serial Memo Number Display */}
      <div className="bg-white/50 backdrop-blur-md border border-slate-100 p-6 rounded-[2rem] flex items-center justify-between shadow-sm">
         <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100">
               <Package className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
               <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Next Available Serial (পরবর্তী সিরিয়াল)</p>
               <h4 className="text-lg font-black font-outfit text-indigo-900">{nextMemoNo || "Auto-generating..." }</h4>
            </div>
         </div>
         <div className="px-5 py-2 bg-emerald-50 rounded-full border border-emerald-100 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600">Syncing with server</span>
         </div>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-10 items-start">
        {/* Left Side: Modules */}
        <div className="lg:col-span-8 space-y-10 w-full">
           {/* Customer Info */}
           <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/60 p-10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                 <User className="h-24 w-24" />
              </div>
              <p className="text-indigo-600 text-[10px] font-black uppercase tracking-[0.3em] mb-8">Customer & Shipping Info (কাস্টমার ও শিপিং তথ্য)</p>
              
              <div className="space-y-8">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Customer Name (ক্রেতা) *</label>
                    <select 
                      className="flex h-14 w-full rounded-2xl border-2 border-slate-50 bg-slate-50/50 px-6 py-2 text-base font-bold ring-offset-background focus:outline-none focus:border-indigo-500/50 focus:bg-white transition-all appearance-none" 
                      value={customerId} 
                      onChange={(e) => setCustomerId(e.target.value)} 
                      required
                    >
                      <option value="">Search Customer (কাস্টমার খুঁজুন)</option>
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>{c.name} {c.shopName ? `— ${c.shopName}` : ""}</option>
                      ))}
                    </select>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Courier Service (কুরিয়ার)</label>
                       <div className="relative">
                          <Ship className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 pointer-events-none" />
                          <Input 
                            placeholder="e.g. SA Paribahan" 
                            className="h-14 rounded-2xl border-2 border-slate-50 bg-slate-50/50 pl-14 font-bold focus:border-indigo-500/50 focus:bg-white transition-all"
                            value={courierName} 
                            onChange={(e) => setCourierName(e.target.value)} 
                          />
                       </div>
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Bilty No (বিল্টি নং)</label>
                       <div className="relative group/bilty">
                          <CheckCircle2 className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-500 pointer-events-none opacity-50" />
                          <Input 
                            placeholder="Auto-generated" 
                            className="h-14 rounded-2xl border-2 border-emerald-50 bg-emerald-50/10 pl-14 font-black transition-all text-emerald-600 cursor-not-allowed"
                            value={courierBilty} 
                            readOnly
                          />
                          <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[8px] font-black uppercase tracking-widest text-emerald-400">Fixed</div>
                       </div>
                       <p className="text-[9px] text-slate-400 font-bold pl-2 italic">Automatically matches Memo number.</p>
                    </div>
                 </div>
              </div>
           </div>

           {/* Items */}
           <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/60 p-1 relative overflow-hidden">
              <div className="p-10 pb-6">
                 <p className="text-indigo-600 text-[10px] font-black uppercase tracking-[0.3em]">Product List (মালের তালিকা)</p>
              </div>
              
              <div className="px-10 pb-10 space-y-4">
                 <div className="grid grid-cols-12 gap-4 px-2 mb-2">
                    <div className="col-span-5 text-[9px] font-black uppercase text-slate-400 tracking-widest">Product Information (পণ্য)</div>
                    <div className="col-span-2 text-center text-[9px] font-black uppercase text-slate-400 tracking-widest">Qty (পরিমাণ)</div>
                    <div className="col-span-3 text-right text-[9px] font-black uppercase text-slate-400 tracking-widest">Price (দর)</div>
                    <div className="col-span-2 text-right text-[9px] font-black uppercase text-slate-400 tracking-widest">Total</div>
                 </div>

                 {items.map((item) => (
                   <div key={item.id} className="grid grid-cols-12 gap-4 items-center group/row animate-in fade-in slide-in-from-left-4 duration-300">
                     <div className="col-span-5 flex flex-col">
                        <select 
                          className="flex h-12 w-full rounded-xl border-2 border-slate-50 bg-slate-50/50 px-4 py-2 text-sm font-bold focus:outline-none focus:border-indigo-400 appearance-none transition-all" 
                          value={item.productId} 
                          onChange={(e) => updateItem(item.id, "productId", e.target.value)} 
                          required
                        >
                          <option value="">Select Product (পণ্য খুঁজুন)</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>{p.name} [{p.code}]</option>
                          ))}
                        </select>
                        {item.productId && (
                          <div className="mt-1 pl-2 flex items-center gap-1.5">
                            <Package className="h-3 w-3 text-slate-300" />
                            <span className={cn(
                              "text-[9px] font-black uppercase tracking-widest",
                              (products.find(p => p.id === item.productId)?.stock ?? 0) > 0 ? "text-emerald-500" : "text-rose-500"
                            )}>
                              Stock: {products.find(p => p.id === item.productId)?.stock ?? 0} Unit Available
                            </span>
                          </div>
                        )}
                      </div>
                     <div className="col-span-2">
                       <Input 
                         type="number" 
                         min="1" 
                         value={item.quantity} 
                         onChange={(e) => updateItem(item.id, "quantity", parseInt(e.target.value) || 1)} 
                         onFocus={(e) => e.target.select()}
                         className="h-12 text-center rounded-xl border-2 border-slate-50 bg-slate-50/50 font-black tabular-nums focus:border-indigo-400 transition-all"
                       />
                     </div>
                     <div className="col-span-3 relative">
                       <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase">Tk</span>
                       <Input 
                         type="number" 
                         step="0.01" 
                         min="0" 
                         value={item.price} 
                         onChange={(e) => updateItem(item.id, "price", parseFloat(e.target.value) || 0)} 
                         onFocus={(e) => e.target.select()}
                         className="h-12 text-right pl-10 rounded-xl border-2 border-slate-50 bg-slate-50/50 font-black tabular-nums focus:border-indigo-400 transition-all"
                       />
                     </div>
                     <div className="col-span-2 flex justify-end gap-2">
                        <div className="h-12 w-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-[10px] font-black text-white tabular-nums px-2 text-center">
                           {(item.quantity * item.price).toLocaleString()}
                        </div>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          onClick={() => removeItem(item.id)} 
                          className="h-12 w-12 rounded-xl text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-all border border-rose-100 shadow-sm flex-shrink-0"
                          title="Click to remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                     </div>
                   </div>
                 ))}

                 <Button 
                   type="button" 
                   variant="ghost" 
                   onClick={addItem}
                   className="w-full h-14 border-2 border-dashed border-slate-100 rounded-2xl hover:bg-slate-50 text-slate-400 hover:text-indigo-600 transition-all group/add gap-3 mt-4"
                 >
                   <Plus className="h-5 w-5 group-hover/add:rotate-90 transition-transform duration-500" />
                   <span className="text-[10px] font-black uppercase tracking-widest">Add More Item (আরো পণ্য যোগ করুন)</span>
                 </Button>
              </div>
           </div>

           {/* Payment */}
           <div className="bg-slate-900 text-white rounded-[3rem] p-10 relative overflow-hidden group shadow-2xl shadow-indigo-500/10">
              <div className="absolute bottom-0 right-0 p-10 opacity-10 group-hover:translate-x-4 transition-transform duration-1000">
                 <CreditCard className="h-32 w-32" />
              </div>
              <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] mb-8">Payment Details (পেমেন্টের হিসাব)</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Cash Paid (টাকা জমা)</label>
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
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Incentive / Rebate (ছাড়)</label>
                  <div className="relative">
                     <span className="absolute left-6 top-1/2 -translate-y-1/2 text-sm font-black text-emerald-500/50">TK</span>
                     <Input 
                       type="number" 
                       step="0.01" 
                       min="0" 
                       value={discount} 
                       onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)} 
                       onFocus={(e) => e.target.select()}
                       className="h-16 bg-white/5 border-white/10 rounded-2xl pl-14 font-black text-xl tabular-nums focus:border-emerald-500/50 transition-all placeholder:text-white/10"
                       placeholder="0.00"
                     />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Payment Method (পেমেন্ট পদ্ধতি)</label>
                  <select 
                    className="h-16 w-full bg-white/5 border border-white/10 rounded-2xl px-6 font-black text-lg focus:outline-none focus:border-indigo-500/50 transition-all appearance-none"
                    value={method}
                    onChange={(e) => setMethod(e.target.value)}
                  >
                    <option value="CASH" className="bg-slate-900 text-white">Cash / নগদ</option>
                    <option value="BANK" className="bg-slate-900 text-white">Bank / ব্যাংক</option>
                    <option value="BKASH" className="bg-slate-900 text-white">bKash / বিকাশ</option>
                    <option value="NAGAD" className="bg-slate-900 text-white">Nagad / নগদ (Mobile)</option>
                  </select>
                </div>
              </div>
           </div>
        </div>

        {/* Right Side: Execution Summary */}
        <div className="lg:col-span-4 w-full sticky top-32 space-y-8">
           <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[3rem] overflow-hidden bg-white/80 backdrop-blur-xl border border-white/20">
             <CardHeader className="bg-slate-50/50 border-b border-slate-100/50 px-10 py-8 text-center">
                <CardTitle className="text-xl font-black font-outfit uppercase tracking-tighter text-slate-900">Bill Summary (হিসাব)</CardTitle>
                <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest">Real-time Calculation</p>
             </CardHeader>
             <CardContent className="p-10 space-y-8">
                <div className="space-y-4">
                   <div className="flex justify-between items-center px-4">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Sub Total (মোট টাকা)</span>
                      <span className="font-bold tabular-nums text-slate-900">Tk {subTotal.toLocaleString()}</span>
                   </div>
                   <div className="flex justify-between items-center px-4">
                      <span className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Discount (ছাড়)</span>
                      <span className="font-bold text-emerald-600 tabular-nums">- Tk {discount.toLocaleString()}</span>
                   </div>
                   <div className="h-px bg-slate-100 mx-2" />
                   <div className="bg-slate-900 text-white rounded-[2rem] p-8 space-y-2 text-center group shadow-xl">
                      <p className="text-[9px] font-black uppercase text-slate-500 tracking-[0.2em]">Final Bill (মোট বিল)</p>
                      <h4 className="text-3xl font-black font-outfit tabular-nums tracking-tighter group-hover:scale-105 transition-transform">Tk {totalAmount.toLocaleString()}</h4>
                   </div>
                </div>

                <div className="space-y-4 pt-4">
                   <div className="flex justify-between items-center px-6 py-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                      <span className="text-[9px] font-black uppercase text-emerald-600 tracking-widest">Cash Paid (জমা)</span>
                      <span className="font-black text-emerald-700 tabular-nums text-lg">Tk {paidAmount.toLocaleString()}</span>
                   </div>
                   <div className={cn(
                     "flex justify-between items-center px-6 py-4 rounded-2xl border transition-all",
                     dueAdded > 0 ? "bg-rose-50 border-rose-100 text-rose-700 font-black" : "bg-slate-50 border-slate-100 text-slate-400 opacity-50 font-bold"
                   )}>
                      <span className="text-[9px] font-black uppercase tracking-widest">{dueAdded > 0 ? "Due (বাকি)" : "Settled (পরিশোধ)"}</span>
                      <span className="tabular-nums text-lg">Tk {Math.abs(dueAdded).toLocaleString()}</span>
                   </div>
                </div>

                <div className="pt-6 flex flex-col gap-4">
                   <Button 
                    type="submit" 
                    onClick={() => { printAfterSaveRef.current = true; }}
                    disabled={loading}
                    className="w-full h-16 rounded-[1.5rem] bg-indigo-600 border-b-4 border-indigo-800 hover:translate-y-1 hover:border-b-0 transition-all shadow-xl shadow-indigo-200 text-white font-black uppercase tracking-widest text-xs"
                   >
                     {loading && printAfterSaveRef.current ? (
                        <div className="flex items-center gap-2">
                           <CheckCircle2 className="h-4 w-4 animate-pulse" /> Saving...
                        </div>
                     ) : "Confirm & Print PDF (সেভ + প্রিন্ট)"}
                   </Button>
                   <div className="grid grid-cols-2 gap-4">
                       <Button 
                        type="submit" 
                        onClick={() => { printAfterSaveRef.current = false; }}
                        disabled={loading}
                        className="h-14 rounded-2xl bg-white border-2 border-slate-100 hover:bg-indigo-50 hover:border-indigo-100 hover:text-indigo-600 transition-all shadow-sm font-black uppercase tracking-widest text-[10px] text-slate-600"
                       >
                         {loading && !printAfterSaveRef.current ? "Saving..." : "Save Only (সেভ)"}
                       </Button>
                       <Button 
                        type="button" 
                        onClick={() => router.back()} 
                        disabled={loading}
                        className="h-14 rounded-2xl bg-white border-2 border-slate-100 font-black uppercase tracking-widest text-[10px] text-rose-500 hover:bg-rose-50 hover:border-rose-100 transition-all"
                       >
                         Cancel (বাতিল)
                       </Button>
                   </div>
                </div>
             </CardContent>
           </Card>

           <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-8 text-white relative overflow-hidden group">
              <div className="absolute -bottom-4 -right-4 p-6 opacity-10 group-hover:scale-125 transition-transform duration-1000">
                 <Package className="h-20 w-20" />
              </div>
              <div className="flex gap-4 items-center">
                 <div className="h-10 w-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <CheckCircle2 className="h-5 w-5" />
                 </div>
                 <div>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Stock Update</p>
                    <p className="text-xs font-bold font-outfit mt-0.5 text-slate-300">Stock will be auto-deducted (স্টক থেকে অটোবিয়োগ হয়ে যাবে).</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </form>
  );
}
