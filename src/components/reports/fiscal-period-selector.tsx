"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Calendar, ChevronDown } from "lucide-react";

export function FiscalPeriodSelector() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const currentYear = searchParams.get("year") || new Date().getFullYear().toString();
  const currentMonth = searchParams.get("month") || (new Date().getMonth() + 1).toString().padStart(2, "0");

  const years = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - i).toString());
  const months = [
    { v: "01", l: "January" },
    { v: "02", l: "February" },
    { v: "03", l: "March" },
    { v: "04", l: "April" },
    { v: "05", l: "May" },
    { v: "06", l: "June" },
    { v: "07", l: "July" },
    { v: "08", l: "August" },
    { v: "09", l: "September" },
    { v: "10", l: "October" },
    { v: "11", l: "November" },
    { v: "12", l: "December" },
  ];

  const updateParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
      <div className="flex items-center gap-2 px-3 text-slate-400">
        <Calendar className="h-4 w-4" />
        <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Fiscal Period</span>
      </div>
      
      <div className="relative group">
        <select 
          value={currentYear} 
          onChange={(e) => updateParams("year", e.target.value)}
          className="h-10 w-28 pl-4 pr-8 appearance-none bg-slate-50 border-none rounded-xl font-bold text-xs focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer"
        >
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none group-hover:text-indigo-500 transition-colors" />
      </div>

      <div className="relative group">
        <select 
          value={currentMonth} 
          onChange={(e) => updateParams("month", e.target.value)}
          className="h-10 w-36 pl-4 pr-8 appearance-none bg-slate-50 border-none rounded-xl font-bold text-xs focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer"
        >
          {months.map(m => <option key={m.v} value={m.v}>{m.l}</option>)}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none group-hover:text-indigo-500 transition-colors" />
      </div>
    </div>
  );
}
