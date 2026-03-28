import { getProducts } from "@/actions/inventory";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { Plus, Package, BarChart2, Boxes, TrendingUp, Search as SearchIcon } from "lucide-react";
import { SearchBar } from "@/components/ui/search-bar";
import { Suspense } from "react";
import { InventoryTable } from "@/components/inventory/inventory-table";

export const dynamic = "force-dynamic";

export default async function InventoryPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const products = await getProducts(q);
  const totalStockValue = products.reduce((s, p) => s + p.stock * p.purchasePrice, 0);
  const totalItems = products.reduce((s, p) => s + p.stock, 0);

  return (
    <div className="flex-1 space-y-10 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 font-outfit">
             Inventory <span className="text-indigo-600">(স্টক)</span>
          </h1>
          <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-2 flex items-center gap-2">
             <Boxes className="h-3.5 w-3.5 text-indigo-500" /> Manage your stock here (স্টক ম্যানেজ করুন)
          </p>
        </div>
        <div className="flex gap-3">
           <Button asChild className="h-12 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 gap-2 active:scale-95 transition-all">
             <Link href="/inventory/new"><Plus className="h-5 w-5" /> Add New Item (নতুন স্টক)</Link>
           </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* KPI: SKUs */}
        <div className="group relative bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl transition-all hover:translate-y-[-4px] overflow-hidden">
           <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:rotate-12 transition-transform duration-700">
              <Package className="h-20 w-20 text-white" />
           </div>
           <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mb-1">Total Items (মোট আইটেম)</p>
           <h3 className="text-3xl font-black text-white font-outfit">{products.length} <span className="text-xs text-slate-500 font-bold uppercase tracking-widest ml-1">Items</span></h3>
           <div className="mt-6 flex items-center gap-2 text-indigo-400 text-[10px] font-black uppercase tracking-widest">
              Different products in shop
           </div>
        </div>

        {/* KPI: Total Units */}
        <div className="group relative bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col justify-between hover:bg-slate-50 transition-colors">
           <div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Total Stock (মোট স্টক)</p>
              <h3 className="text-3xl font-black text-slate-900 font-outfit">{totalItems.toLocaleString()} <span className="text-xs text-slate-400 uppercase font-black">Pcs (পিস)</span></h3>
           </div>
           <p className="mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <Boxes className="h-3 w-3" /> Total pieces in shop
           </p>
        </div>

        {/* KPI: Value */}
        <div className="group relative bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col justify-between hover:bg-slate-50 transition-colors">
           <div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Stock Value (স্টকের মূল্য)</p>
              <h3 className="text-3xl font-black text-indigo-600 font-outfit">Tk {totalStockValue.toLocaleString()}</h3>
           </div>
           <p className="mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-emerald-500" /> Total value of stock
           </p>
        </div>
      </div>

      <Card className="border-none shadow-2xl shadow-slate-200/60 rounded-[3rem] overflow-hidden bg-white">
        <CardHeader className="flex flex-col md:flex-row items-center justify-between border-b border-slate-50 bg-slate-50/20 px-10 py-8 gap-6">
          <div>
             <CardTitle className="text-xl font-black text-slate-900 font-outfit">Stock List (স্টক লিস্ট)</CardTitle>
             <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">Details of all your items</p>
          </div>
          <div className="w-full md:w-auto">
             <Suspense>
                <div className="relative group">
                   <SearchBar placeholder="Search naming, batch, or sku..." />
                </div>
             </Suspense>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <InventoryTable products={products} q={q} />
        </CardContent>
      </Card>
    </div>
  );
}
