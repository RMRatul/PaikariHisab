"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { updateProduct } from "@/actions/inventory";
import type { Product } from "@/generated/client";
import { Tag, Hash, Wallet, TrendingUp, CheckCircle2, ShieldAlert, Layers, Percent, PenTool, ArrowRight, History } from "lucide-react";
import { cn } from "@/lib/utils";

export function InventoryEditForm({ product }: { product: Product }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Real-time calculation state
  const [purchasePrice, setPurchasePrice] = useState<number>(product.purchasePrice);
  const [sellingPrice, setSellingPrice] = useState<number>(product.sellingPrice);

  const profitMargin = useMemo(() => {
    if (sellingPrice <= 0) return 0;
    return ((sellingPrice - purchasePrice) / sellingPrice) * 100;
  }, [purchasePrice, sellingPrice]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const result = await updateProduct(product.id, {
      code: fd.get("code") as string,
      name: fd.get("name") as string,
      category: fd.get("category") as string,
      purchasePrice: parseFloat(fd.get("purchasePrice") as string),
      sellingPrice: parseFloat(fd.get("sellingPrice") as string),
      stock: parseInt(fd.get("stock") as string) || 0,
    });
    if (result.success) { router.push("/inventory"); }
    else { setError(result.error || "Execution Error: Registry update breached."); setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10 max-w-5xl mx-auto pb-20">
      <div className="flex items-center gap-4 bg-emerald-900/5 border border-emerald-100 p-6 rounded-[2rem] animate-in fade-in duration-700">
         <div className="h-12 w-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
            <PenTool className="h-6 w-6" />
         </div>
         <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600">Administrative Corridor</p>
            <h2 className="text-xl font-black font-outfit text-slate-900">Modifying Resource: <span className="text-emerald-600">{product.name}</span></h2>
         </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-100 p-6 rounded-[2rem] flex items-center gap-4 text-rose-600 animate-in fade-in slide-in-from-top-4 duration-500">
           <ShieldAlert className="h-6 w-6" />
           <p className="font-bold text-sm tracking-tight">{error}</p>
        </div>
      )}

      <div className="flex flex-col md:grid md:grid-cols-12 gap-10">
        <div className="md:col-span-8 space-y-10">
           {/* Product Info */}
           <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/60 p-10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                 <Tag className="h-24 w-24" />
              </div>
              <p className="text-emerald-600 text-[10px] font-black uppercase tracking-[0.3em] mb-8">Product Info (পণ্যের তথ্য)</p>
              
              <div className="space-y-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Resource Code (Unique)</label>
                       <div className="relative">
                          <Hash className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 pointer-events-none" />
                          <Input 
                            name="code" 
                            required 
                            defaultValue={product.code}
                            className="h-14 rounded-2xl border-2 border-slate-50 bg-slate-50/50 pl-14 font-bold focus:border-emerald-500/50 focus:bg-white transition-all text-slate-900" 
                          />
                       </div>
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Classification Cluster</label>
                       <div className="relative">
                          <Layers className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 pointer-events-none" />
                          <Input 
                            name="category" 
                            required 
                            defaultValue={product.category}
                            className="h-14 rounded-2xl border-2 border-slate-50 bg-slate-50/50 pl-14 font-bold focus:border-emerald-500/50 focus:bg-white transition-all text-slate-900"
                          />
                       </div>
                    </div>
                 </div>

                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Primary Designation</label>
                    <Input 
                      name="name" 
                      required 
                      defaultValue={product.name}
                      className="h-14 rounded-2xl border-2 border-slate-50 bg-slate-50/50 px-6 font-bold focus:border-emerald-500/50 focus:bg-white transition-all text-slate-900"
                    />
                 </div>
              </div>
           </div>

           {/* Pricing */}
           <div className="bg-slate-900 text-white rounded-[3rem] p-10 relative overflow-hidden group shadow-2xl shadow-emerald-500/10">
              <div className="absolute bottom-0 right-0 p-10 opacity-10 group-hover:translate-x-4 transition-transform duration-1000">
                 <Wallet className="h-32 w-32" />
              </div>
              <p className="text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em] mb-8">Pricing (দাম)</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Acquisition Rate (Buy Price)</label>
                  <div className="relative">
                     <span className="absolute left-6 top-1/2 -translate-y-1/2 text-sm font-black text-emerald-500/50">TK</span>
                     <Input 
                       name="purchasePrice" 
                       type="number" 
                       min="0"
                       step="0.01" 
                       required 
                       value={purchasePrice}
                       onChange={(e) => setPurchasePrice(parseFloat(e.target.value) || 0)}
                       onFocus={(e) => e.target.select()}
                       className="h-16 bg-white/5 border-white/10 rounded-2xl pl-14 font-black text-xl tabular-nums focus:border-emerald-500/50 transition-all text-white" 
                     />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Value Capture (Sell Price)</label>
                  <div className="relative">
                     <span className="absolute left-6 top-1/2 -translate-y-1/2 text-sm font-black text-indigo-500/50">TK</span>
                     <Input 
                       name="sellingPrice" 
                       type="number" 
                       min="0"
                       step="0.01" 
                       required 
                       value={sellingPrice}
                       onChange={(e) => setSellingPrice(parseFloat(e.target.value) || 0)}
                       onFocus={(e) => e.target.select()}
                       className="h-16 bg-white/5 border-white/10 rounded-2xl pl-14 font-black text-xl tabular-nums focus:border-indigo-500/50 transition-all text-white"
                     />
                  </div>
                </div>
              </div>
           </div>
        </div>

        {/* Intelligence Hub */}
        <div className="md:col-span-4 space-y-8">
           <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[3rem] overflow-hidden bg-white/80 backdrop-blur-xl border border-white/20">
             <CardHeader className="bg-slate-50/50 border-b border-slate-100/50 px-10 py-8 text-center">
                <CardTitle className="text-xl font-black font-outfit uppercase tracking-tighter text-slate-900">Margin Audit</CardTitle>
                <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest">Real-time Recalibration Analysis</p>
             </CardHeader>
             <CardContent className="p-10 space-y-8">
                <div className="bg-slate-900 rounded-[2rem] p-8 space-y-2 text-center relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Percent className="h-12 w-12" />
                   </div>
                   <p className="text-[9px] font-black uppercase text-slate-500 tracking-[0.2em] relative z-10">Updated Margin</p>
                   <h4 className={cn(
                     "text-4xl font-black font-outfit tabular-nums tracking-tighter transition-all relative z-10",
                     profitMargin > 20 ? "text-emerald-400" : profitMargin > 0 ? "text-amber-400" : "text-rose-400"
                   )}>
                      {profitMargin.toFixed(1)}%
                   </h4>
                   <p className="text-[10px] font-bold text-slate-400 mt-2">Tk {(sellingPrice - purchasePrice).toLocaleString()} Profit / Unit</p>
                </div>

                <div className="space-y-4">
                   <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Volume Adjustment (Stock)</p>
                   <div className="relative">
                      <History className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 pointer-events-none" />
                      <Input 
                        name="stock" 
                        type="number" min="0" 
                        defaultValue={product.stock}
                        onFocus={(e) => e.target.select()}
                        className="h-14 rounded-2xl border-2 border-slate-50 bg-slate-50/50 pl-14 font-black transition-all text-slate-900"
                      />
                   </div>
                </div>

                <div className="pt-6 flex flex-col gap-4">
                   <Button 
                    type="submit" 
                    disabled={loading}
                    className="h-16 rounded-[1.5rem] bg-emerald-600 border-b-4 border-emerald-800 hover:translate-y-1 hover:border-b-0 transition-all shadow-xl shadow-emerald-200 text-white font-black uppercase tracking-widest text-[10px] w-full"
                   >
                     {loading ? (
                        <div className="flex items-center gap-2">
                           <History className="h-4 w-4 animate-spin" /> Committing...
                        </div>
                     ) : "Authorize Update"}
                   </Button>
                   <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => router.back()} 
                    disabled={loading}
                    className="h-12 rounded-2xl border-2 border-slate-50 font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 transition-all opacity-50 hover:opacity-100"
                   >
                     Abort Changes
                   </Button>
                </div>
             </CardContent>
           </Card>

           <div className="bg-indigo-900 border border-indigo-800 rounded-[2rem] p-8 text-white relative overflow-hidden group shadow-2xl">
              <div className="absolute -bottom-4 -right-4 p-6 opacity-10 group-hover:scale-125 transition-transform duration-1000">
                 <TrendingUp className="h-20 w-20" />
              </div>
              <div className="flex gap-4 items-center">
                 <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20 backdrop-blur-md">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                 </div>
                 <div>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Registry Integrity</p>
                    <p className="text-xs font-bold font-outfit mt-0.5 text-slate-300">Synchronization persists across all ledgers.</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </form>
  );
}
