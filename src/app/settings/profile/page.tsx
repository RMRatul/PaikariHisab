import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { ProfileForm } from "@/components/settings/profile-form";
import { ShieldCheck, Lock } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = (await getServerSession(authOptions as any)) as any;
  
  const userId = session?.user?.id;
  if (!userId) return <div>Unauthorized</div>;

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { 
      name: true, 
      email: true,
      passwordHistory: {
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { createdAt: true }
      }
    }
  });

  return (
    <div className="flex-1 space-y-10 pb-10 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 font-outfit">
             Security <span className="text-rose-600">Hardening</span>
          </h1>
          <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mt-3 flex items-center gap-2">
             <ShieldCheck className="h-3.5 w-3.5 text-rose-500" /> Vault & Identity Management
          </p>
        </div>
      </div>

      <ProfileForm initialData={{ name: user?.name || "", email: user?.email || "", passwordHistory: user?.passwordHistory || [] }} />
      
      <div className="bg-slate-50 rounded-[2.5rem] p-10 border border-slate-100 mt-10">
         <div className="flex items-start gap-4">
            <div className="h-10 w-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-400">
               <Lock className="h-5 w-5" />
            </div>
            <div>
               <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Enterprise Security Protocol</h4>
               <p className="text-xs font-medium text-slate-500 mt-2 leading-relaxed">
                  The Aura ERP uses industry-standard `bcrypt` 10-round hashing for your credentials. 
                  Setting a recovery email is critical for password restoration in case of lockout. 
                  Once you update the default password, the dashboard security alert will be automatically dismissed.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
}
