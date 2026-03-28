"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, User, Lock, ArrowRight, Landmark, Loader2, Mail } from "lucide-react";
import { recoverPassword } from "@/actions/auth";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryMessage, setRecoveryMessage] = useState("");
  const [isRecoveringLoading, setIsRecoveringLoading] = useState(false);
  
  // Need to import action dynamically or server action
  // But wait, it's easier to just fetch or use the server action if we import it.
  // Actually I will import it at the top.

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid username or password (ভুল ইউজারনেম বা পাসওয়ার্ড)");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRecoveringLoading(true);
    setError("");
    setRecoveryMessage("");
    
    try {
      const res = await recoverPassword(recoveryEmail);
      if (res.success) {
        setRecoveryMessage(res.message || "");
      } else {
        setError(res.error || "Failed to recover password");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsRecoveringLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse duration-700"></div>
      
      <div className="w-full max-w-[1200px] grid lg:grid-cols-2 gap-0 overflow-hidden bg-slate-900/40 backdrop-blur-3xl border border-white/5 rounded-[4rem] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.5)]">
        
        {/* Branding Sidebar */}
        <div className="hidden lg:flex flex-col justify-between p-20 bg-gradient-to-br from-indigo-600 to-indigo-900 text-white relative">
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>
           
           <div className="relative z-10">
              <div className="h-16 w-16 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center mb-8">
                 <Landmark className="h-8 w-8" />
              </div>
              <h1 className="text-6xl font-black font-outfit leading-none tracking-tighter">
                বারাকাহ <br /> <span className="text-white/50">ক্লথ স্টোর</span>
              </h1>
              <p className="mt-8 text-indigo-100 font-medium max-w-sm text-lg leading-relaxed">
                 Secure wholesale enterprise management system. Built for speed, precision, and scalability.
              </p>
           </div>

           <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md">
                 <div className="h-10 w-10 bg-indigo-400 rounded-xl flex items-center justify-center">
                    <ShieldCheck className="h-5 w-5" />
                 </div>
                 <p className="text-sm font-bold">Enterprise-Grade Security Protocol Enabled.</p>
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/30">
                 © বারাকাহ ক্লথ স্টোর | 2026 Stable Release
              </p>
           </div>
        </div>

        {/* Login Form Section */}
        <div className="p-12 lg:p-24 flex flex-col justify-center bg-transparent">
           {!isRecovering ? (
             <>
               <div className="mb-12">
                  <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 mb-2">Gate Activation</h2>
                  <h3 className="text-4xl font-black font-outfit text-white">System Login</h3>
                  <p className="text-slate-400 font-bold mt-2">Enter your command credentials below.</p>
               </div>

               <form onSubmit={handleSubmit} className="space-y-8">
                  {error && (
                    <div className="bg-rose-500/10 border border-rose-500/20 p-6 rounded-3xl flex items-center gap-4 text-rose-400 animate-in fade-in slide-in-from-top-4">
                      <ShieldCheck className="h-5 w-5" />
                      <p className="text-xs font-black uppercase tracking-tight">{error}</p>
                    </div>
                  )}

                  <div className="space-y-6">
                     <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-2">Username or Email (ইউজারনেম / ইমেইল)</label>
                        <div className="relative group">
                           <User className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                           <Input 
                            placeholder="admin or admin@email.com" 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="h-16 bg-white/5 border-white/10 rounded-2xl pl-16 text-white font-bold focus:border-indigo-500/50 transition-all placeholder:text-slate-600"
                           />
                        </div>
                     </div>

                     <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-2">Password (পাসওয়ার্ড)</label>
                        <div className="relative group">
                           <Lock className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                           <Input 
                            type="password"
                            placeholder="••••••••" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="h-16 bg-white/5 border-white/10 rounded-2xl pl-16 text-white font-bold focus:border-indigo-500/50 transition-all placeholder:text-slate-600"
                           />
                        </div>
                     </div>
                     <div className="flex justify-end pr-2 mt-2">
                        <button type="button" onClick={() => setIsRecovering(true)} className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
                           Forgot Password?
                        </button>
                     </div>
                  </div>

                  <div className="pt-6">
                     <Button 
                       type="submit" 
                       disabled={loading}
                       className="w-full h-16 rounded-[2rem] bg-indigo-600 text-white font-black uppercase tracking-widest text-[11px] group relative overflow-hidden transition-all shadow-2xl shadow-indigo-600/20"
                     >
                        <span className="relative z-10 flex items-center justify-center gap-3">
                           {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Initiate System Session"}
                           {!loading && <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform" />}
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                     </Button>
                  </div>
               </form>
             </>
           ) : (
             <>
               <div className="mb-12">
                  <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 mb-2">Account Recovery</h2>
                  <h3 className="text-4xl font-black font-outfit text-white">Reset Password</h3>
                  <p className="text-slate-400 font-bold mt-2">Enter your registered email address.</p>
               </div>

               <form onSubmit={handleRecovery} className="space-y-8">
                  {error && (
                    <div className="bg-rose-500/10 border border-rose-500/20 p-6 rounded-3xl flex items-center gap-4 text-rose-400 animate-in fade-in slide-in-from-top-4">
                      <ShieldCheck className="h-5 w-5" />
                      <p className="text-xs font-black uppercase tracking-tight">{error}</p>
                    </div>
                  )}
                  {recoveryMessage && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-3xl flex flex-col gap-2 text-emerald-400 animate-in fade-in slide-in-from-top-4">
                      <div className="flex items-center gap-4">
                        <ShieldCheck className="h-5 w-5" />
                        <p className="text-xs font-black uppercase tracking-tight">Recovery Success</p>
                      </div>
                      <p className="text-sm font-bold mt-1 text-emerald-300">{recoveryMessage}</p>
                    </div>
                  )}

                  <div className="space-y-6">
                     <div className="space-y-4">
                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-2">Email Address (ইমেইল)</label>
                        <div className="relative group">
                           <Mail className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                           <Input 
                            type="email"
                            placeholder="admin@email.com" 
                            value={recoveryEmail}
                            onChange={(e) => setRecoveryEmail(e.target.value)}
                            required
                            className="h-16 bg-white/5 border-white/10 rounded-2xl pl-16 text-white font-bold focus:border-indigo-500/50 transition-all placeholder:text-slate-600"
                           />
                        </div>
                     </div>
                  </div>

                  <div className="pt-6 space-y-4">
                     <Button 
                       type="submit" 
                       disabled={isRecoveringLoading}
                       className="w-full h-16 rounded-[2rem] bg-indigo-600 text-white font-black uppercase tracking-widest text-[11px] group relative overflow-hidden transition-all shadow-2xl shadow-indigo-600/20"
                     >
                        <span className="relative z-10 flex items-center justify-center gap-3">
                           {isRecoveringLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Recover Password"}
                           {!isRecoveringLoading && <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform" />}
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                     </Button>
                     <Button 
                       type="button" 
                       onClick={() => {
                         setIsRecovering(false);
                         setError("");
                         setRecoveryMessage("");
                       }}
                       variant="ghost"
                       className="w-full h-12 rounded-[2rem] text-slate-400 hover:text-white hover:bg-white/5 font-bold tracking-wider text-[11px] uppercase transition-all"
                     >
                        Back to Login
                     </Button>
                  </div>
               </form>
             </>
           )}

           <div className="mt-12 text-center">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                 Authorized Personnel Only — Unauthorized Access Monitored
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
