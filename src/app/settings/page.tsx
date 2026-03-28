"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { updateSystemSettings } from "@/actions/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Key, Mail, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null);

  useEffect(() => {
    if (session?.user?.email) {
      setEmail(session.user.email);
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "loading") return;
    
    if (newPassword && newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match." });
      return;
    }

    if (newPassword && !currentPassword) {
      setMessage({ type: "error", text: "Current password is required to set a new password." });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await updateSystemSettings({
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
        email: email || undefined,
      });

      if (res.success) {
        // Update session so UI reflects change immediately
        await update({ email });
        
        setMessage({ type: "success", text: "Settings updated successfully!" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        // Reload to update server components as well
        setTimeout(() => router.refresh(), 1000);
      } else {
        setMessage({ type: "error", text: res.error || "Failed to update settings" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "An error occurred." });
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto w-full pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-outfit">System Settings</h1>
        <p className="text-slate-500 mt-2 font-medium">Manage your account credentials and security preferences.</p>
      </div>

      {!session?.user?.email && (
        <Alert variant="destructive" className="bg-rose-50 border-rose-200 text-rose-800 rounded-[2rem] p-6 shadow-xl shadow-rose-100/50">
          <AlertCircle className="h-5 w-5 text-rose-500" />
          <div className="ml-3">
            <AlertTitle className="text-sm font-black uppercase tracking-tight">Security Action Required (অ্যাকশন প্রয়োজন)</AlertTitle>
            <AlertDescription className="text-xs font-bold mt-1 leading-relaxed">
              You haven't added a recovery email yet. Please add one below to ensure you can recover your account if you forget the password.
              <br />
              (আপনার একাউন্টে কোনো রিকভারি ইমেইল নেই। পাসওয়ার্ড ভুলে গেলে উদ্ধারের জন্য নিচে একটি ইমেইল যুক্ত করুন।)
            </AlertDescription>
          </div>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-100 rounded-lg text-indigo-700">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Security Settings</CardTitle>
                    <CardDescription>Update your email and password.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                
                {message && (
                  <Alert variant={message.type === "error" ? "destructive" : "default"} className={message.type === "success" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : ""}>
                    {message.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                    <AlertTitle>{message.type === "success" ? "Success" : "Error"}</AlertTitle>
                    <AlertDescription>{message.text}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-slate-500" />
                      Recovery Email (রিকভারি ইমেইল)
                    </Label>
                    <Input 
                      type="email" 
                      placeholder="Add an email for password recovery..."
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <p className="text-xs text-slate-500">This email will be used to recover your account if you forget the password.</p>
                  </div>

                  <div className="border-t border-slate-100 pt-4 mt-6 space-y-4">
                    <h3 className="text-sm font-semibold flex items-center gap-2 text-slate-800">
                      <Key className="h-4 w-4" />
                      Change Password (পাসওয়ার্ড পরিবর্তন)
                    </h3>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2 md:col-span-2">
                        <Label>Current Password (বর্তমান পাসওয়ার্ড)</Label>
                        <Input 
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="••••••••"
                        />
                        <p className="text-xs text-slate-500">Required if you want to set a new password.</p>
                      </div>

                      <div className="space-y-2">
                        <Label>New Password (নতুন পাসওয়ার্ড)</Label>
                        <Input 
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Confirm New Password (পুনরায় নতুন পাসওয়ার্ড)</Label>
                        <Input 
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-all font-medium px-8"
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>

    </div>
  );
}
