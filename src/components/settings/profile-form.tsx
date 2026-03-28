"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Lock, Mail, User, ShieldCheck, Loader2, AlertCircle, Clock } from "lucide-react";
import { updateProfile, updatePassword } from "@/actions/profile";
import { useSession } from "next-auth/react";

const profileSchema = z.object({
  name: z.string().min(2, "Name too short"),
  email: z.string().email("Invalid email for recovery"),
});

const passwordSchema = z.object({
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export function ProfileForm({ initialData }: { initialData: { name?: string; email?: string, passwordHistory?: { createdAt: Date }[] } }) {
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: initialData.name || "",
      email: initialData.email || "",
    },
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function onProfileSubmit(values: z.infer<typeof profileSchema>) {
    setLoading(true);
    const res = await updateProfile(values);
    setLoading(false);
    if (res.success) {
      await update({ ...session, user: { ...session?.user, name: values.name } });
      alert("Profile updated successfully!");
    } else {
      alert(res.error || "Failed to update profile");
    }
  }

  async function onPasswordSubmit(values: z.infer<typeof passwordSchema>) {
    setPassLoading(true);
    const res = await updatePassword({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    });
    setPassLoading(false);
    if (res.success) {
      passwordForm.reset();
      await update({ ...session, user: { ...session?.user, isDefaultPassword: false } });
      alert("Password hardened successfully!");
    } else {
      alert(res.error || "Failed to update password");
    }
  }

  return (
    <div className="grid gap-10 md:grid-cols-2">
      {/* Basic Profile */}
      <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white overflow-hidden">
        <CardHeader className="bg-slate-50/50 p-10">
          <div className="h-14 w-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-indigo-100">
            <User className="h-7 w-7" />
          </div>
          <CardTitle className="text-2xl font-black font-outfit text-slate-900">Administrative Identity</CardTitle>
          <CardDescription className="font-bold text-slate-400 uppercase tracking-widest text-[10px] mt-1">Update your display name and recovery email</CardDescription>
        </CardHeader>
        <CardContent className="p-10">
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
              <FormField
                control={profileForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-500">Full Name</FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 transition-colors group-focus-within:text-indigo-600" />
                        <Input {...field} className="h-14 pl-12 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-50 border-2 transition-all font-bold" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={profileForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-500">Recovery Email</FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 transition-colors group-focus-within:text-indigo-600" />
                        <Input {...field} type="email" placeholder="email@company.com" className="h-14 pl-12 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-50 border-2 transition-all font-bold" />
                      </div>
                    </FormControl>
                    <FormDescription className="text-[10px] font-medium text-slate-400 mt-2">
                      Used for critical security alerts and password restoration.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={loading} className="w-full h-14 rounded-2xl bg-slate-900 text-white font-black uppercase text-[10px] tracking-[0.2em] shadow-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                Synchronize Profile
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Password Rotation */}
      <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white overflow-hidden">
        <CardHeader className="bg-slate-50/50 p-10">
          <div className="h-14 w-14 bg-rose-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-rose-100">
            <Lock className="h-7 w-7" />
          </div>
          <CardTitle className="text-2xl font-black font-outfit text-slate-900">Credential Rotation</CardTitle>
          <CardDescription className="font-bold text-slate-400 uppercase tracking-widest text-[10px] mt-1">Rotate your access credentials to harden security</CardDescription>
        </CardHeader>
        <CardContent className="p-10">
          {/* Note: The global default credentials notification is now displayed in the global header layer */}
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
              {!session?.user?.isDefaultPassword && (
                <FormField
                  control={passwordForm.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-500">Current Access Code</FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input {...field} type="password" placeholder="••••••••" className="h-14 pl-12 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white border-2 transition-all font-bold" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-500">New Vault Key</FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input {...field} type="password" placeholder="••••••••" className="h-14 pl-12 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white border-2 transition-all font-bold" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-500">Confirm Vault Key</FormLabel>
                    <FormControl>
                      <div className="relative group">
                        <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input {...field} type="password" placeholder="••••••••" className="h-14 pl-12 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white border-2 transition-all font-bold" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={passLoading} className="w-full h-14 rounded-2xl bg-rose-600 text-white font-black uppercase text-[10px] tracking-[0.2em] shadow-xl hover:bg-rose-700 transition-all flex items-center justify-center gap-2">
                {passLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                Harden Credentials
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Password History Section */}
      {initialData.passwordHistory && initialData.passwordHistory.length > 0 && (
        <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden md:col-span-2">
          <CardHeader className="bg-slate-50/50 p-8 border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-xl font-black font-outfit text-slate-900">Recent Security Events</CardTitle>
                <CardDescription className="font-bold text-slate-400 uppercase tracking-widest text-[10px] mt-1">Last {initialData.passwordHistory.length} Vault Key Rotations</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {initialData.passwordHistory.map((history, idx) => {
                const date = new Date(history.createdAt);
                const formatOpts: Intl.DateTimeFormatOptions = {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                };
                return (
                  <div key={idx} className="flex items-center justify-between p-6 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                        <ShieldCheck className="h-4 w-4 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">Vault Key Rotated</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{date.toLocaleDateString('en-US', formatOpts)}</p>
                      </div>
                    </div>
                    <div className="text-xs font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-lg">
                      SUCCESS
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
