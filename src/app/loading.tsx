import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex-1 min-h-[60vh] flex flex-col items-center justify-center gap-6">
      <div className="relative">
        <div className="absolute inset-0 bg-indigo-500 rounded-full blur-2xl opacity-20 animate-pulse"></div>
        <Loader2 className="h-16 w-16 animate-[spin_1.5s_linear_infinite] text-indigo-600 relative z-10" />
      </div>
      <div className="flex flex-col items-center gap-1">
         <p className="text-xs font-black uppercase tracking-[0.2em] text-indigo-600 animate-pulse">
           Connecting to System
         </p>
         <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
           Fetching live parameters...
         </p>
      </div>
    </div>
  );
}
