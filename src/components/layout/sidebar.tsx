"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Package, ShoppingCart, Truck, ReceiptText, BarChart3, Settings, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard (ড্যাশবোর্ড)", href: "/", icon: LayoutDashboard },
  { name: "Customers (কাস্টমার)", href: "/customers", icon: Users },
  { name: "Suppliers (মহাজন)", href: "/suppliers", icon: Truck },
  { name: "Inventory (স্টক/মালামাল)", href: "/inventory", icon: Package },
  { name: "Sales (বিল/মেমো)", href: "/sales", icon: ShoppingCart },
  { name: "Returns (মাল ফেরত)", href: "/returns", icon: RefreshCw },
  { name: "Purchases (ক্রয়)", href: "/purchases", icon: ReceiptText },
  { name: "Expenses (খরচ)", href: "/expenses", icon: ReceiptText },
  { name: "Reports (রিপোর্ট)", href: "/reports", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-72 flex-col bg-slate-900/95 backdrop-blur-xl rounded-3xl shrink-0 border border-white/10 shadow-2xl relative overflow-hidden group">
      {/* Visual Accents */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
      
      <div className="flex h-20 items-center px-8">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
             <LayoutDashboard className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-xl font-black tracking-tighter text-white font-outfit">
            বারাকাহ ক্লথ স্টোর
          </h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-6 custom-scrollbar">
        <nav className="grid gap-1.5 px-4">
          <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Main Menu (মেনু)</p>
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all duration-300 group/item",
                  isActive 
                    ? "bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.05)]" 
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >
                {isActive && (
                  <div className="absolute left-0 w-1 h-6 bg-indigo-500 rounded-r-full shadow-[0_0_10px_#6366f1]" />
                )}
                <item.icon className={cn("h-5 w-5 transition-transform duration-300 group-hover/item:scale-110", isActive ? "text-indigo-400" : "text-slate-500")} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 mt-auto">
        <div className="bg-white/5 rounded-3xl p-4 border border-white/5">
           <Link
            href="/settings"
            className="flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-bold text-slate-400 transition-all hover:text-white hover:bg-white/5 group/settings"
          >
            <Settings className="h-5 w-5 text-slate-500 group-hover/settings:rotate-90 transition-transform duration-500" />
            Settings (সেটিংস)
          </Link>
        </div>
      </div>
    </div>
  );
}
