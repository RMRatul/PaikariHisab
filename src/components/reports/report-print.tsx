"use client";

import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";
import { Printer, ShieldCheck, Landmark, TrendingUp, Wallet, Package, AlertCircle } from "lucide-react";
import { cn, formatPriceBN, toBengaliNumber } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from "recharts";

const COLORS = ["#000000", "#1f2937", "#4b5563", "#9ca3af", "#d1d5db", "#e5e7eb", "#f3f4f6"];
const CATEGORY_COLORS: Record<string, string> = {
  "Sales": "#000000",
  "Expense": "#be123c",
  "Purchase": "#111827",
  "Profit": "#000000"
};

export function ReportPrint({ data, stats, insights = [], isDetailed = false, detailedDebt = { receivables: [], payables: [] } }: { 
  data: any[], 
  stats: any, 
  insights?: any[], 
  isDetailed?: boolean,
  detailedDebt?: { receivables: any[], payables: any[] }
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  
  const currentMonthData = data[0]; // For isDetailed=true, this is the selected month

  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: currentMonthData ? `Audit_Report_${currentMonthData.label.replace(/\s+/g, '_')}` : `Barakah_Audit_Report_${new Date().getFullYear()}`,
  });

  // Calculate daily rows for the month
  const getDailyRows = (monthObj: any) => {
    if (!monthObj || !monthObj.dailyData) return [];
    return Object.values(monthObj.dailyData).sort((a: any, b: any) => a.date.localeCompare(b.date));
  };

  const dailyRows = getDailyRows(currentMonthData);

  const pieData = currentMonthData ? Object.entries(currentMonthData.expensesByCategory).map(([name, amount]) => ({
    name,
    value: amount as number
  })).sort((a, b) => b.value - a.value) : [];

  return (
    <>
      <style jsx global>{`
        @page {
          margin: 15mm;
          size: A4;
        }
        @media print {
          .pdf-page {
            page-break-after: always;
            box-sizing: border-box;
            width: 100%;
            min-height: 260mm;
            padding: 5mm;
            background: white;
            margin: 0;
          }
          body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
          .force-print-color { background-color: inherit !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .break-inside-avoid {
             break-inside: avoid !important;
             -webkit-column-break-inside: avoid !important;
             page-break-inside: avoid !important;
          }
        }
      `}</style>

      <div className="flex flex-col items-center gap-2">
        <Button 
          onClick={() => {
            console.log("AUDIT DATA VERIFIED:", {
              month: currentMonthData?.label,
              sales: currentMonthData?.registries.sales.length,
              expenses: currentMonthData?.registries.expenses.length,
              mahajans: currentMonthData?.registries.purchases.length
            });
            handlePrint();
          }} 
          className="h-14 px-8 rounded-2xl bg-slate-900 hover:bg-black text-white shadow-2xl gap-3 active:scale-95 transition-all font-black uppercase tracking-widest text-[10px]"
        >
          <Printer className="h-4 w-4" /> Export Professional Audit (PDF)
        </Button>
        <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest flex items-center gap-1 animate-pulse">
          <AlertCircle className="h-3 w-3" /> Tip: Enable "Background Graphics" in Print Settings for charts
        </p>
      </div>
      
      {/* Hidden Print Content */}
      <div style={{ display: "none" }}>
        <div ref={contentRef} className="text-black bg-white font-serif leading-tight mx-auto w-[210mm]">
          
          {/* PAGE 1: EXECUTIVE POSITIONING */}
          <div className="pdf-page p-12">
            {/* HEADER */}
            <div className="text-center border-b-4 border-double border-black pb-6 mb-8">
               <h1 className="text-5xl font-serif font-black uppercase tracking-tighter mb-1 text-black">বারাকাহ ক্লথ স্টোর</h1>
               <p className="text-[11pt] font-sans font-black uppercase tracking-[0.4em] text-gray-500">অফিশিয়াল প্রাতিষ্ঠানিক নিরীক্ষা এবং আর্থিক বিবরণী</p>
               <div className="mt-8 flex justify-between items-end border-t border-gray-100 pt-4 text-[9pt] font-sans text-gray-600">
                  <div className="text-left leading-relaxed">
                     <p className="font-bold text-black uppercase tracking-widest">প্রশাসনিক পরিচয়</p>
                     <p>নিবন্ধন: {toBengaliNumber("ইআরপি-নিরীক্ষা-২০২৬-এক্স৯")}</p>
                     <p className="text-[7pt] text-gray-400">ডেটা অথ: {toBengaliNumber(currentMonthData?.registries.sales.length || 0)}টি বিক্রয় / {toBengaliNumber(currentMonthData?.registries.expenses.length || 0)}টি ব্যয় রেকর্ড পাওয়া গেছে</p>
                  </div>
                  <div className="text-right">
                     <p className="font-bold text-black uppercase tracking-widest">বিবরণীর বৈধতা</p>
                     <p className="text-[12pt] font-black text-black">{toBengaliNumber(new Date().toLocaleDateString("bn-BD", { day: 'numeric', month: 'long', year: 'numeric' }))}</p>
                  </div>
               </div>
            </div>

            <div className="flex justify-between items-center mb-6 border-b-2 border-black pb-2 break-inside-avoid">
               <h2 className="text-[16pt] font-serif font-black uppercase italic">নির্বাহী অবস্থান বিবরণী</h2>
               <span className="text-[10pt] font-black uppercase tracking-widest bg-black text-white px-4 py-1 rounded-sm">{currentMonthData?.label}</span>
            </div>
            
            <table className="w-full border-collapse border-2 border-black mb-10 text-[11pt] break-inside-avoid">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border border-black p-4 text-left uppercase tracking-tighter">আর্থিক শ্রেণিবিন্যাস এবং সম্পদ মানচিত্র</th>
                  <th className="border border-black p-4 text-right">মূল্যায়ন (টাকা)</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className="border border-black p-4 font-black bg-gray-50 uppercase">সম্পদ ও ইনভেন্টরি</td><td className="border border-black p-4 text-right"></td></tr>
                <tr><td className="border border-black p-3 pl-10 italic">গুদাম ইনভেন্টরি লিকুইড মূল্যায়ন</td><td className="border border-black p-3 text-right">{formatPriceBN(stats.inventoryValue)}</td></tr>
                <tr><td className="border border-black p-3 pl-10 italic">সক্রিয় বাজার পাওনা</td><td className="border border-black p-3 text-right">{formatPriceBN(stats.totalReceivables)}</td></tr>
                <tr className="bg-gray-100 font-black"><td className="border border-black p-4 text-right uppercase">মোট মূলধন সম্পদ (ক)</td><td className="border border-black p-4 text-right underline decoration-2">{formatPriceBN(stats.inventoryValue + stats.totalReceivables)}</td></tr>
                
                <tr><td className="border border-black p-4 font-black bg-gray-50 uppercase">দায়বদ্ধতা (দেনা)</td><td className="border border-black p-4 text-right"></td></tr>
                <tr><td className="border border-black p-3 pl-10 italic">সরবরাহকারী প্রদেয় হিসাব (মহাজন ঋণ)</td><td className="border border-black p-3 text-right">({formatPriceBN(stats.totalPayables)})</td></tr>
                <tr className="bg-gray-100 font-black"><td className="border border-black p-4 text-right uppercase">মোট দায়বদ্ধতা (খ)</td><td className="border border-black p-4 text-right text-rose-700">({formatPriceBN(stats.totalPayables)})</td></tr>

                <tr className="bg-black text-white">
                  <td className="border border-black p-5 font-black uppercase text-[15pt] tracking-tighter">প্রত্যয়িত এন্টারপ্রাইজ নিট সম্পদ</td>
                  <td className="border border-black p-5 text-right font-black text-[18pt]">টাকা {formatPriceBN(stats.netWorth)}</td>
                </tr>
              </tbody>
            </table>

            {/* AI STRATEGIC INSIGHTS GRID */}
            {insights.length > 0 && (
                <div className="grid grid-cols-2 gap-4">
                   {insights.map((ins, i) => (
                      <div key={i} className="border-l-8 border-gray-900 bg-gray-50 p-6 break-inside-avoid shadow-sm mb-2">
                         <p className="text-[8pt] font-black uppercase text-gray-500 mb-1">নিরীক্ষা উপদেষ্টা ({ins.type})</p>
                         <p className="text-[10pt] font-serif italic text-black leading-tight border-t border-gray-200 pt-2">{ins.text}</p>
                      </div>
                   ))}
                </div>
            )}
          </div>

          {/* PAGE 2: ANALYTICS & DAILY PULSE */}
          {isDetailed && currentMonthData && (
             <div className="pdf-page p-12">
                <div className="flex justify-between items-center mb-8 border-b-2 border-black pb-2">
                   <h2 className="text-[16pt] font-serif font-black uppercase italic">বাজারের দৈনিক পারফরম্যান্স পালস</h2>
                </div>

                {/* V7 PURE CSS CHARTS (100% PDF RELIABILITY) */}
                <div className="grid grid-cols-2 gap-8 mb-12">
                    {/* BAR CHART: REVENUE VELOCITY */}
                    <div className="border-2 border-black p-6 bg-white flex flex-col h-[300px]">
                       <h4 className="text-[10pt] font-black uppercase mb-6 text-center italic border-b-2 border-black pb-2">দৈনিক রাজস্বের গতি</h4>
                        <div className="flex-1 flex items-end justify-between gap-1 px-2 border-b-2 border-black pt-8">
                           {dailyRows.map((d: any, idx) => {
                              const maxVal = Math.max(...dailyRows.map((r: any) => r.sales)) * 1.2 || 1; // 20% scale buffer
                              const salesHeight = `${(d.sales / maxVal) * 100}%`;
                              const expenseHeight = `${(d.expenses / maxVal) * 100}%`;
                              return (
                                 <div key={idx} className="flex-1 flex justify-center gap-[1px] h-full items-end">
                                    <div className="w-[40%] bg-black transition-all force-print-color" style={{ height: Math.max(parseInt(salesHeight), 3) + '%', backgroundColor: 'black !important' }} title={`বিক্রয়: ${d.sales}`} />
                                    <div className="w-[40%] bg-gray-300 transition-all force-print-color" style={{ height: Math.max(parseInt(expenseHeight), 3) + '%', backgroundColor: '#d1d5db !important' }} title={`ব্যয়: ${d.expenses}`} />
                                 </div>
                              );
                           })}
                        </div>
                        <div className="flex justify-center gap-6 mt-4">
                           <div className="flex items-center gap-2 text-[7pt] font-black uppercase"><div className="h-3 w-3 bg-black text-white flex items-center justify-center text-[5pt]"></div> বিক্রয় (টাকা)</div>
                           <div className="flex items-center gap-2 text-[7pt] font-black uppercase"><div className="h-3 w-3 bg-gray-300"></div> ব্যয় (টাকা)</div>
                        </div>
                     </div>

                    {/* PIE CHART: COST ALLOCATION (CSS CONIC GRADIENT) */}
                    <div className="border-2 border-black p-6 bg-black text-white flex flex-col items-center h-[300px]">
                       <h4 className="text-[10pt] font-black uppercase mb-6 text-center border-b border-white/20 pb-2 w-full tracking-widest">অপারেশনাল ব্যয় মানচিত্র</h4>
                       <div className="relative w-40 h-40 rounded-full border-4 border-white/20 shadow-inner" style={{
                          background: pieData.length > 0 ? `conic-gradient(${pieData.reduce((acc, curr, i) => {
                             const percent = (curr.value / (currentMonthData.totalExpenses || 1)) * 100;
                             const start = acc.total;
                             acc.total += percent;
                              acc.strings.push(`${COLORS[i % COLORS.length]} ${start}% ${acc.total}%`);
                              return acc;
                           }, { total: 0, strings: [] as string[] }).strings.join(', ')}) !important` : '#333 !important'
                        }}>
                          <div className="absolute inset-6 bg-black rounded-full flex flex-col items-center justify-center border-2 border-white/10">
                             <span className="text-[7pt] font-black uppercase tracking-widest opacity-50">মোট ব্যয়</span>
                             <span className="text-[10pt] font-black italic">টাকা {formatPriceBN(currentMonthData?.totalExpenses)}</span>
                          </div>
                       </div>
                       <div className="mt-8 flex flex-wrap justify-center gap-x-4 gap-y-2 w-full text-white">
                          {pieData.slice(0, 4).map((d, i) => (
                             <div key={i} className="flex items-center gap-2 text-[7pt] font-black uppercase">
                                <div className="h-2 w-2 rounded-full shadow" style={{ background: COLORS[i % COLORS.length] }} />
                                {d.name}: {toBengaliNumber(((d.value / (currentMonthData.totalExpenses || 1)) * 100).toFixed(0))}%
                             </div>
                          ))}
                       </div>
                    </div>
                </div>

                {/* DAILY TABLE */}
                <table className="w-full border-collapse border-2 border-black text-[10pt]">
                   <thead className="bg-gray-200 font-black text-center uppercase">
                      <tr>
                         <th className="border border-black p-3 text-left w-20">দিন</th>
                         <th className="border border-black p-3 text-right">রাজস্ব (টাকা)</th>
                         <th className="border border-black p-3 text-right">ব্যয় (টাকা)</th>
                         <th className="border border-black p-3 text-right">ক্রয় (টাকা)</th>
                         <th className="border border-black p-3 text-right font-black underline">নিট চক্র</th>
                      </tr>
                   </thead>
                   <tbody>
                      {dailyRows.map((d: any) => (
                         <tr key={d.date} className="font-sans">
                            <td className="border border-black p-3 font-black text-center bg-gray-50">{toBengaliNumber(d.date)}</td>
                            <td className="border border-black p-3 text-right tabular-nums">{formatPriceBN(d.sales)}</td>
                            <td className="border border-black p-3 text-right tabular-nums text-rose-700">({formatPriceBN(d.expenses)})</td>
                            <td className="border border-black p-3 text-right tabular-nums text-indigo-800">{formatPriceBN(d.purchases)}</td>
                            <td className={cn("border border-black p-3 text-right font-black tabular-nums", (d.sales - d.expenses) >= 0 ? "text-emerald-900" : "text-rose-900")}>
                               {formatPriceBN(d.sales - d.expenses)}
                            </td>
                         </tr>
                      ))}
                      <tr className="bg-black text-white font-black italic">
                         <td className="border border-black p-4 text-center">মোট</td>
                         <td className="border border-black p-4 text-right tabular-nums">{currentMonthData.totalSales.toLocaleString()}</td>
                         <td className="border border-black p-4 text-right tabular-nums">({currentMonthData.totalExpenses.toLocaleString()})</td>
                         <td className="border border-black p-4 text-right tabular-nums">{currentMonthData.totalPurchases.toLocaleString()}</td>
                         <td className="border border-black p-4 text-right tabular-nums text-emerald-400">টাকা {currentMonthData.netProfit.toLocaleString()}</td>
                      </tr>
                   </tbody>
                </table>

                {/* CASH FLOW AUDIT (CASH vs BANK) */}
                <div className="mt-10 border-4 border-black p-8 bg-gray-50 break-inside-avoid">
                    <h3 className="text-[14pt] font-black uppercase mb-6 flex items-center gap-3"><Wallet className="h-6 w-6" /> প্রাতিষ্ঠানিক নগদ প্রবাহ নিরীক্ষা</h3>
                    <div className="grid grid-cols-2 gap-10">
                        <div className="space-y-4">
                            <p className="text-[10pt] font-black uppercase text-gray-500 border-b border-black pb-1 italic">মাসিক আয়</p>
                            <div className="flex justify-between items-center text-[11pt] font-bold"><span>মোট নগদ সংগ্রহ:</span><span className="tabular-nums">টাকা {formatPriceBN(currentMonthData.cashIn)}</span></div>
                            <div className="flex justify-between items-center text-[11pt] font-bold"><span>মোট ব্যাংক/এমএফএস ক্রেডিট:</span><span className="tabular-nums">টাকা {formatPriceBN(currentMonthData.bankIn)}</span></div>
                            <div className="pt-2 border-t-2 border-black flex justify-between items-center font-black text-emerald-900"><span>মোট রাজস্ব প্রবাহ:</span><span>টাকা {formatPriceBN(currentMonthData.totalCollection)}</span></div>
                        </div>
                        <div className="space-y-4 border-l-2 border-black/10 pl-10">
                            <p className="text-[10pt] font-black uppercase text-gray-500 border-b border-black pb-1 italic">মাসিক ব্যয়</p>
                            <div className="flex justify-between items-center text-[11pt] font-bold"><span>মোট নগদ অর্থপ্রদান:</span><span className="tabular-nums">টাকা {formatPriceBN(currentMonthData.cashOut)}</span></div>
                            <div className="flex justify-between items-center text-[11pt] font-bold"><span>মোট ব্যাংক স্থানান্তর:</span><span className="tabular-nums">টাকা {formatPriceBN(currentMonthData.bankOut)}</span></div>
                            <div className="pt-2 border-t-2 border-black flex justify-between items-center font-black text-rose-900"><span>মোট ব্যয়ের প্রবাহ:</span><span>টাকা {formatPriceBN(currentMonthData.cashOut + currentMonthData.bankOut)}</span></div>
                        </div>
                    </div>
                </div>
             </div>
          )}

          {/* PAGE 3: DEBT & RECEIVABLES REGISTRIES (SYSTEM-WIDE) */}
          <div className="pdf-page p-12">
             <div className="flex justify-between items-center mb-8 border-b-2 border-black pb-2">
                <h2 className="text-[16pt] font-serif font-black uppercase italic">এন্টারপ্রাইজ ব্যালেন্স নিরীক্ষা (বাকি ও ঋণ)</h2>
             </div>

             <div className="grid grid-cols-2 gap-8 items-start">
                {/* DETAILED RECEIVABLES (PAONA) */}
                <div className="break-inside-avoid">
                    <h3 className="text-[12pt] font-black uppercase text-white bg-black px-4 py-2 mb-4 italic">১. বাজার পাওনা (পাওনা খতিয়ান)</h3>
                    <table className="w-full border-collapse border border-black text-[8pt]">
                        <thead className="bg-gray-100 font-bold uppercase">
                            <tr>
                                <th className="border border-black p-2 text-left">গ্রাহকের নাম</th>
                                <th className="border border-black p-2 text-right">বকেয়া (টাকা)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {detailedDebt.receivables.length === 0 ? (
                                <tr><td colSpan={2} className="border border-black p-3 text-center italic">কোন বকেয়া পাওনা নেই।</td></tr>
                            ) : (
                                detailedDebt.receivables.map((c) => (
                                    <tr key={c.id}>
                                        <td className="border border-black p-2 font-black uppercase">{c.name}</td>
                                        <td className="border border-black p-2 text-right tabular-nums font-bold text-emerald-900">{formatPriceBN(c.dueBalance)}</td>
                                    </tr>
                                ))
                            )}
                            <tr className="bg-gray-100 font-black">
                                <td className="border border-black p-2 text-right uppercase">মোট পাওনা:</td>
                                <td className="border border-black p-2 text-right tabular-nums">টাকা {formatPriceBN(stats.totalReceivables)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* DETAILED PAYABLES (RIN) */}
                <div className="break-inside-avoid">
                    <h3 className="text-[12pt] font-black uppercase text-white bg-rose-900 px-4 py-2 mb-4 italic">২. মহাজন ঋণ রেজিস্ট্রি (ঋণ খতিয়ান)</h3>
                    <table className="w-full border-collapse border border-black text-[8pt]">
                        <thead className="bg-gray-100 font-bold uppercase">
                            <tr>
                                <th className="border border-black p-2 text-left">সরবরাহকারী/মহাজন</th>
                                <th className="border border-black p-2 text-right">ঋণ মূলধন (টাকা)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {detailedDebt.payables.length === 0 ? (
                                <tr><td colSpan={2} className="border border-black p-3 text-center italic">কোন বকেয়া ঋণ নেই।</td></tr>
                            ) : (
                                detailedDebt.payables.map((s) => (
                                    <tr key={s.id}>
                                        <td className="border border-black p-2 font-black uppercase">{s.name}</td>
                                        <td className="border border-black p-2 text-right tabular-nums font-bold text-rose-900">{formatPriceBN(s.dueBalance)}</td>
                                    </tr>
                                ))
                            )}
                            <tr className="bg-gray-100 font-black">
                                <td className="border border-black p-2 text-right uppercase">মোট ঋণ:</td>
                                <td className="border border-black p-2 text-right tabular-nums">টাকা {formatPriceBN(stats.totalPayables)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
             </div>
             
             <div className="mt-8 p-6 bg-slate-50 border-2 border-black border-dashed rounded-lg">
                 <p className="text-[9pt] font-serif leading-tight">
                    <strong className="uppercase">নিরীক্ষকের নোট:</strong> এই রেজিস্ট্রি আউরা এন্টারপ্রাইজের যাচাইকৃত বকেয়া ব্যালেন্স উপস্থাপন করে। 
                    বাকি (পাওনা) এবং ঋণ ব্যক্তিগত ভাউচার ইতিহাসের বিপরীতে নিরীক্ষণ করা হয়। বর্তমান অবস্থান একটি সুস্থ তারল্য অনুপাত নির্দেশ করে।
                 </p>
             </div>
          </div>

          {/* PAGE 3+: CATEGORICAL TRANSACTION AUDIT */}
          {isDetailed && currentMonthData && (
             <>
               <div className="pdf-page p-12">
                  <div className="flex justify-between items-center mb-8 border-b-2 border-black pb-2">
                     <h2 className="text-[16pt] font-serif font-black uppercase italic">শ্রেণীবদ্ধ নিরীক্ষা রেজিস্ট্রি</h2>
                  </div>
                  
                  {/* SALES LEDGER */}
                  <h3 className="text-[13pt] font-black uppercase text-white bg-black px-6 py-2 mb-4">১. গ্রাহক বিক্রয় রেজিস্ট্রি (ভাউচার)</h3>
                  <table className="w-full border-collapse border-2 border-black text-[9pt] mb-12 break-inside-avoid">
                     <thead className="bg-gray-100 font-black uppercase">
                        <tr>
                           <th className="border border-black p-2 text-left w-24">ভাউচার</th>
                           <th className="border border-black p-2 text-left">প্রতিষ্ঠানের নাম</th>
                           <th className="border border-black p-2 text-right">সাবটোটাল</th>
                           <th className="border border-black p-2 text-right">ক্রেডিট (টাকা)</th>
                           <th className="border border-black p-2 text-right font-black bg-gray-200">মোট বিলিং</th>
                        </tr>
                     </thead>
                     <tbody>
                        {currentMonthData.registries.sales.map((s: any) => (
                           <tr key={s.id}>
                              <td className="border border-black p-2 font-mono font-bold">{toBengaliNumber(s.memoNo)}</td>
                              <td className="border border-black p-2 uppercase font-bold">{s.customer.name}</td>
                              <td className="border border-black p-2 text-right tabular-nums">{formatPriceBN(s.subTotal)}</td>
                              <td className="border border-black p-2 text-right tabular-nums">{formatPriceBN(s.totalAmount - s.paidAmount)}</td>
                              <td className="border border-black p-2 text-right font-black tabular-nums bg-gray-50">{formatPriceBN(s.totalAmount)}</td>
                           </tr>
                        ))}
                     </tbody>
                  </table>

                  {/* PROCUREMENT REGISTRY */}
                  <h3 className="text-[13pt] font-black uppercase text-white bg-indigo-900 px-6 py-2 mb-4">২. মহাজন ক্রয় লগ</h3>
                  <table className="w-full border-collapse border-2 border-black text-[9pt] break-inside-avoid">
                     <thead className="bg-gray-100 font-black uppercase">
                        <tr>
                           <th className="border border-black p-2 text-left w-24">ইনভয়েস নং</th>
                           <th className="border border-black p-2 text-left">সরবরাহকারী অংশীদার</th>
                           <th className="border border-black p-2 text-right">বকেয়া</th>
                           <th className="border border-black p-2 text-right">পরিশোধিত</th>
                           <th className="border border-black p-2 text-right font-black">নিট বকেয়া</th>
                        </tr>
                     </thead>
                     <tbody>
                        {currentMonthData.registries.purchases.length === 0 ? (
                           <tr><td colSpan={5} className="border border-black p-4 text-center italic">কোন রেকর্ড পাওয়া যায়নি।</td></tr>
                        ) : (
                           currentMonthData.registries.purchases.map((p: any) => (
                              <tr key={p.id}>
                                 <td className="border border-black p-2 font-mono">{toBengaliNumber(p.invoiceNo || 'BUY')}</td>
                                 <td className="border border-black p-2 font-black">{p.supplier.name}</td>
                                 <td className="border border-black p-2 text-right tabular-nums">{formatPriceBN(p.totalAmount)}</td>
                                 <td className="border border-black p-2 text-right tabular-nums">{formatPriceBN(p.paidAmount)}</td>
                                 <td className="border border-black p-2 text-right tabular-nums font-black text-rose-700">({formatPriceBN(p.totalAmount - p.paidAmount)})</td>
                              </tr>
                           ))
                        )}
                     </tbody>
                  </table>
               </div>

               <div className="pdf-page p-12">
                  {/* EXPENSE AUDIT */}
                  <h3 className="text-[13pt] font-black uppercase text-white bg-rose-900 px-6 py-2 mb-4">৩. অপারেশনাল ব্যয় নিরীক্ষা</h3>
                  <table className="w-full border-collapse border-2 border-black text-[9pt] mb-12 break-inside-avoid">
                     <thead className="bg-gray-100 font-black uppercase">
                        <tr>
                           <th className="border border-black p-2 text-left">শ্রেণী</th>
                           <th className="border border-black p-2 text-left">নিরীক্ষা নোট</th>
                           <th className="border border-black p-2 text-center w-24">তারিখ</th>
                           <th className="border border-black p-2 text-right">পরিমাণ (টাকা)</th>
                        </tr>
                     </thead>
                     <tbody>
                        {currentMonthData.registries.expenses.map((e: any) => (
                           <tr key={e.id}>
                              <td className="border border-black p-2 uppercase font-black">{e.category.name}</td>
                              <td className="border border-black p-2 italic">{e.description || 'যাচাইকৃত অপারেশনাল ব্যয়'}</td>
                              <td className="border border-black p-2 text-center text-xs">{toBengaliNumber(new Date(e.date).toLocaleDateString())}</td>
                              <td className="border border-black p-2 text-right tabular-nums font-black">{formatPriceBN(e.amount)}</td>
                           </tr>
                        ))}
                        <tr className="bg-black text-white font-black"><td colSpan={3} className="border border-black p-3 text-right">একীভূত মোট ব্যয়</td><td className="border border-black p-3 text-right tabular-nums">{formatPriceBN(currentMonthData.totalExpenses)}</td></tr>
                     </tbody>
                  </table>

                  {/* SIGNATURE SECTION (ANCHORED TO LAST PAGE) */}
                  <div className="mt-20 pt-10 border-t-2 border-black">
                     <div className="flex justify-between items-start gap-12">
                        <div className="w-2/3">
                           <h3 className="text-[12pt] font-black uppercase mb-4 flex items-center gap-2"><ShieldCheck className="h-5 w-5" /> Institutional Certification</h3>
                           <p className="text-[10pt] italic text-gray-700 leading-relaxed border-l-8 border-black pl-6 bg-gray-50 py-4">
                              This financial statement represents an immutable extraction from the Barakah Enterprise Resource Planning (ERP). 
                              All figures are cross-referenced with internal digital vouchers. Unauthorized reproduction carries legal implications.
                              (এই পেশাদারি রিপোর্টটি একটি অফিশিয়াল আইনি নথি)।
                           </p>
                        </div>
                        <div className="w-1/3 flex flex-col items-center">
                           <div className="w-full border-b-2 border-black mb-4 mt-12 shadow-sm"></div>
                           <p className="font-black text-[12pt] uppercase tracking-tighter">Managing Director</p>
                           <p className="text-[8pt] text-gray-500 mt-2 uppercase tracking-[0.3em] font-bold">Authorized Digital Seal & Signature</p>
                        </div>
                     </div>
                  </div>

                  <div className="mt-24 text-center text-gray-400 text-[8pt] font-sans font-black uppercase tracking-[0.8em] opacity-40">
                     *** CONFIDENTIAL INTERNAL AUDIT RECORD - PROPERTY OF BARAKAH CLOTH STORE ***
                  </div>
               </div>
             </>
          )}
        </div>
      </div>
    </>
  );
}
