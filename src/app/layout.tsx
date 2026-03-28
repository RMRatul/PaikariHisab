import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { AuthProvider } from "@/components/auth-provider";
import { ProgressProvider } from "@/components/progress-provider";
import { Suspense } from "react";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "বারাকাহ ক্লথ স্টোর | Wholesale ERP",
  description: "Advanced wholesale business management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body className="font-sans bg-[#F8FAFC] text-slate-900 overflow-hidden antialiased">
        <AuthProvider>
          <div className="flex h-screen w-full p-2 gap-2 bg-slate-200/50 backdrop-blur-sm">
            <Sidebar />
            <div className="flex flex-1 flex-col overflow-hidden bg-white rounded-3xl shadow-2xl border border-white/40">
              <Header />
              <main className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
                <Suspense fallback={<div className="flex items-center justify-center h-full font-bold text-slate-400">Loading System Resources...</div>}>
                  <ProgressProvider>
                    <div className="h-full">
                      {children}
                    </div>
                  </ProgressProvider>
                </Suspense>
              </main>
            </div>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
