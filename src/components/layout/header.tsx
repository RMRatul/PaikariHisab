"use client";
import { Search, User, LogOut, AlertCircle } from "lucide-react";
import { useSession, signOut } from "next-auth/react";

export function Header() {
  const { data: session } = useSession();
  
  return (
    <header className="flex flex-col w-full sticky top-0 z-20">
      {session?.user?.isDefaultPassword && (
        <div className="bg-rose-500 text-white px-4 py-2.5 flex items-center justify-center gap-3 shadow-md w-full animate-in slide-in-from-top-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <p className="text-[11px] font-bold uppercase tracking-widest text-wrap text-center">
            CRITICAL: Account currently using default credentials. Immediate rotation highly recommended for data safety.
          </p>
        </div>
      )}
      <div className="flex h-20 items-center justify-between bg-white/50 backdrop-blur-md px-8 border-b border-slate-100">
        <div className="flex items-center gap-6">
          {/* Search removed as per user request */}
        </div>
      <div className="flex items-center gap-4">
        {/* Notification removed as per user request */}
        <div className="h-10 w-px bg-slate-100 mx-2" />
        <div className="flex items-center gap-3 pl-2 group">
          <div className="text-right">
            <p className="text-[9px] font-black uppercase text-slate-400 leading-none mb-1">{session?.user?.role || "Administrator"}</p>
            <p className="text-sm font-bold text-slate-900">{session?.user?.name || "Loading..."}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-200">
             {session?.user?.name?.[0].toUpperCase() || "A"}
          </div>
          <button 
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-rose-50 text-slate-300 hover:text-rose-500 transition-all ml-2 border border-transparent hover:border-rose-100"
            title="Sign Out"
          >
             <LogOut className="h-4 w-4" />
          </button>
        </div>
        </div>
      </div>
    </header>
  );
}
