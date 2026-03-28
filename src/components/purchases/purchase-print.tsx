"use client";
import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";
import { Printer, ShieldCheck, Landmark, PackageCheck } from "lucide-react";
import { formatPriceBN, toBengaliNumber } from "@/lib/utils";

export function PurchasePrint({ purchase }: { purchase: any }) {
  const contentRef = useRef<HTMLDivElement>(null);
  
  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: `Purchase_Audit_${purchase.memoNo}_Aura`,
  });

  return (
    <>
      <Button 
        onClick={() => handlePrint()} 
        className="h-12 px-6 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white shadow-xl gap-2 active:scale-95 transition-all"
      >
        <Printer className="h-4 w-4" /> Export Procurement Audit (Print)
      </Button>
      
      <style dangerouslySetInnerHTML={{ __html: `
        @page {
          margin: 15mm;
          size: A4;
        }
        @media print {
          .print-container {
             width: 100% !important;
             margin: 0 !important;
             padding: 5mm !important;
          }
          .break-inside-avoid {
             break-inside: avoid !important;
             -webkit-column-break-inside: avoid !important;
             page-break-inside: avoid !important;
          }
          body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
        }
      ` }} />


      {/* Hidden Print Content */}
      <div style={{ display: "none" }}>
        <div ref={contentRef} className="print-container p-16 text-slate-900 bg-white min-h-[280mm] w-full font-sans">
          {/* Header Section */}
          <div className="border-b-[6px] border-slate-900 pb-10 flex justify-between items-start">
            <div className="flex gap-4 items-center">
               <div className="h-16 w-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
                  <PackageCheck className="h-10 w-10" />
               </div>
               <div>
                  <h1 className="text-5xl font-black uppercase tracking-tighter leading-none" style={{ fontFamily: 'var(--font-outfit)' }}>
                     AURA <span className="text-slate-500 font-light">SUPPLY</span>
                  </h1>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">Enterprise Procurement Module — Audit Copy</p>
               </div>
            </div>
            <div className="text-right flex flex-col items-end">
               <ShieldCheck className="h-8 w-8 text-amber-500 mb-2" />
               <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Procurement Audit Entry</p>
               <p className="text-sm font-bold mt-1 tabular-nums">{new Date(purchase.date).toLocaleDateString("en-BD", { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>

          <div className="mt-16">
            <div className="flex justify-between items-start mb-12 break-inside-avoid">
               <div>
                  <p className="text-[9px] font-black uppercase text-amber-600 tracking-[0.2em] mb-4">Supplier Registry (বিক্রেতা)</p>
                  <h3 className="text-2xl font-black uppercase tracking-tight" style={{ fontFamily: 'var(--font-outfit)' }}>{purchase.supplier.name}</h3>
                  <p className="font-bold text-slate-500 uppercase text-xs mt-1">{purchase.supplier.shopName || "Enterprise Vendor"}</p>
                  <p className="text-xs font-bold tabular-nums text-slate-400 mt-2">{purchase.supplier.phone}</p>
               </div>
               <div className="text-right">
                  <p className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em] mb-4">Voucher Reference</p>
                  <p className="text-xl font-black tabular-nums">VOUCHER #{purchase.invoiceNo || "AUTO-GEN"}</p>
                  <div className="mt-2 text-[10px] font-mono font-bold text-slate-400 py-1 bg-slate-50 border border-slate-100 rounded inline-block px-3 uppercase">
                     Ledger Status: Verified
                  </div>
               </div>
            </div>
            
            <div className="overflow-hidden rounded-[1.5rem] border border-slate-100 shadow-sm mb-12 break-inside-avoid">
               <table className="w-full border-collapse">
                 <thead>
                   <tr className="bg-slate-900 text-white">
                     <th className="py-4 px-6 text-left text-[10px] font-black uppercase tracking-widest w-12">SN</th>
                     <th className="py-4 px-6 text-left text-[10px] font-black uppercase tracking-widest">Asset Description (মালের বিবরণ)</th>
                     <th className="py-4 px-6 text-right text-[10px] font-black uppercase tracking-widest w-32">Acq Rate</th>
                     <th className="py-4 px-6 text-center text-[10px] font-black uppercase tracking-widest w-24">Volume</th>
                     <th className="py-4 px-6 text-right text-[10px] font-black uppercase tracking-widest w-40">Total Inflow</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                   {purchase.items.map((item: any, idx: number) => (
                     <tr key={item.id} className="text-sm group hover:bg-slate-50 transition-colors">
                       <td className="py-5 px-6 text-[10px] font-black text-slate-300 tabular-nums">{toBengaliNumber(String(idx + 1).padStart(2, '0'))}</td>
                       <td className="py-5 px-6">
                          <div className="flex flex-col">
                             <span className="font-black text-slate-900 uppercase tracking-tight">{item.product.name}</span>
                             <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{item.product.code}</span>
                          </div>
                       </td>
                       <td className="py-5 px-6 text-right font-medium text-slate-500 tabular-nums">Tk {formatPriceBN(item.price)}</td>
                       <td className="py-5 px-6 text-center font-black tabular-nums">{toBengaliNumber(item.quantity)}</td>
                       <td className="py-5 px-6 text-right font-black tabular-nums">Tk {formatPriceBN(item.price * item.quantity)}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
            </div>
          </div>

          <div className="mt-12 flex justify-end break-inside-avoid">
             <div className="w-96 space-y-4">
                <div className="flex justify-between items-center py-2 px-6 border-b border-slate-100">
                   <span className="text-[9px] font-black uppercase text-slate-400">Total Procurement Value</span>
                   <span className="font-bold tabular-nums">Tk {formatPriceBN(purchase.totalAmount)}</span>
                </div>
                <div className="flex justify-between items-center py-6 px-8 bg-slate-100 text-slate-900 rounded-[1.5rem] border-2 border-slate-900 shadow-xl">
                   <span className="font-black uppercase text-xs tracking-widest">Net Outflow</span>
                   <span className="font-black text-2xl tabular-nums" style={{ fontFamily: 'var(--font-outfit)' }}>Tk {formatPriceBN(purchase.totalAmount)}</span>
                </div>
                <div className="pt-4 grid grid-cols-2 gap-4">
                   <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                      <p className="text-[8px] font-black uppercase text-emerald-600 tracking-widest mb-1">Settled Cash</p>
                      <p className="text-sm font-black text-emerald-700 tabular-nums">Tk {formatPriceBN(purchase.paidAmount)}</p>
                   </div>
                   <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100">
                      <p className="text-[8px] font-black uppercase text-rose-600 tracking-widest mb-1">Payable Balance</p>
                      <p className="text-sm font-black text-rose-700 tabular-nums">Tk {formatPriceBN(purchase.dueAdded)}</p>
                   </div>
                </div>
             </div>
          </div>

          <div className="mt-40 grid grid-cols-2 gap-32 items-end break-inside-avoid">
             <div className="text-center group">
                <div className="h-20 border-b-2 border-slate-100 group-hover:border-slate-300 transition-all"></div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-4">Warehouse Receiving Seal</p>
             </div>
             <div className="text-center group">
                <div className="h-20 border-b-2 border-slate-900 flex items-center justify-center">
                   <Landmark className="h-10 w-10 text-slate-50 opacity-10" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 mt-4">Authorized Audit Endorsement</p>
             </div>
          </div>

          <div className="mt-20 text-center relative">
             <div className="absolute top-1/2 left-0 right-0 h-px bg-slate-100 -z-10"></div>
             <span className="bg-white px-8 text-[9px] font-black uppercase tracking-[0.5em] text-slate-200">
                Supply Chain Cryptographic Ledger Entry
             </span>
          </div>
        </div>
      </div>
    </>
  );
}
