"use client";
import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Button } from "@/components/ui/button";
import { Printer, ShieldEllipsis, Landmark, CheckCircle2 } from "lucide-react";
import { formatPriceBN, toBengaliNumber } from "@/lib/utils";

export function InvoicePrint({ sale }: { sale: any }) {
  const contentRef = useRef<HTMLDivElement>(null);
  
  const handlePrint = useReactToPrint({
    contentRef,
    documentTitle: `Memo_${sale.memoNo}_Barakah`,
  });

  return (
    <>
      <Button 
        onClick={() => handlePrint()} 
        className="h-12 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl gap-2 active:scale-95 transition-all"
      >
        <Printer className="h-4 w-4" /> Export Voucher (Print)
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
          {/* Header */}
          <div className="flex justify-between items-start border-b-[6px] border-slate-900 pb-10">
            <div className="flex gap-4 items-center">
               <div className="h-14 w-14 bg-slate-900 rounded-xl flex items-center justify-center text-white">
                  <Landmark className="h-8 w-8" />
               </div>
               <div>
                  <h1 className="text-4xl font-black uppercase tracking-tighter leading-none" style={{ fontFamily: 'var(--font-outfit)' }}>
                     বারাকাহ ক্লথ স্টোর
                  </h1>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 ml-1">Excellence in Textiles & Wholesale Distribution</p>
               </div>
            </div>
            <div className="text-right flex flex-col items-end">
               <h2 className="text-3xl font-black uppercase tracking-widest text-slate-100" style={{ fontFamily: 'var(--font-outfit)' }}>Cash Memo</h2>
               <div className="mt-4 flex flex-col items-end bg-slate-50 p-4 rounded-2xl border border-slate-100">
                 <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-1">Official Voucher</p>
                 <p className="text-lg font-black tabular-nums">#{toBengaliNumber(sale.memoNo)}</p>
                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-1">{toBengaliNumber(new Date(sale.date).toLocaleDateString("en-BD", { day: 'numeric', month: 'long', year: 'numeric' }))}</p>
               </div>
            </div>
          </div>

          {/* Identification Block */}
          <div className="grid grid-cols-2 gap-16 my-12 py-8 bg-slate-50 rounded-[2rem] px-10 border border-slate-100 break-inside-avoid">
            <div>
              <p className="text-[9px] font-black uppercase text-indigo-500 tracking-[0.2em] mb-4">Consignee (ক্রেতা)</p>
              <h3 className="text-xl font-black uppercase tracking-tight" style={{ fontFamily: 'var(--font-outfit)' }}>{sale.customer.name}</h3>
              <p className="font-bold text-slate-500 uppercase text-xs mt-1">{sale.customer.shopName || "Private Account"}</p>
              <div className="mt-4 pt-4 border-t border-slate-200/50 flex flex-col gap-1">
                 <p className="text-xs font-bold tabular-nums text-slate-600">{sale.customer.phone}</p>
                 <p className="text-[10px] text-slate-400 leading-tight italic uppercase">{sale.customer.shopAddress || "Address Registry Pending"}</p>
              </div>
            </div>
            <div className="text-right flex flex-col justify-between">
              <div>
                 <p className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em] mb-4">Logistics Handler</p>
                 <p className="text-sm font-black text-slate-900 uppercase tracking-tight">{sale.courierName || "Local Transfer / Pickup"}</p>
                 <div className="mt-2 text-[10px] font-mono font-bold text-slate-400 py-1 bg-white border border-slate-100 rounded inline-block px-3">
                    MANIFEST: {sale.courierBilty || "INTERNAL-STOCK"}
                 </div>
              </div>
              <div className="flex items-center justify-end gap-2 text-emerald-600">
                 <p className="text-[9px] font-black uppercase tracking-widest">Transaction Verified</p>
                 <CheckCircle2 className="h-3.5 w-3.5" />
              </div>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="overflow-hidden rounded-[1.5rem] border border-slate-100 shadow-sm mb-12 break-inside-avoid">
             <table className="w-full border-collapse">
               <thead>
                 <tr className="bg-slate-900 text-white">
                   <th className="py-4 px-6 text-left text-[10px] font-black uppercase tracking-widest w-12">SN</th>
                   <th className="py-4 px-6 text-left text-[10px] font-black uppercase tracking-widest">Description (বিবরণ)</th>
                   <th className="py-4 px-6 text-right text-[10px] font-black uppercase tracking-widest w-32">Rate</th>
                   <th className="py-4 px-6 text-center text-[10px] font-black uppercase tracking-widest w-24">Qty</th>
                   <th className="py-4 px-6 text-right text-[10px] font-black uppercase tracking-widest w-40">Total Val</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                 {sale.items.map((item: any, idx: number) => (
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

          {/* Settlement Summary */}
          <div className="flex justify-between items-start gap-16 break-inside-avoid">
            <div className="flex-1 pt-4">
               <p className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em] mb-4">Digital Validation</p>
               <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
                  <ShieldEllipsis className="h-8 w-8 text-indigo-300" />
                  <p className="text-[10px] leading-relaxed text-slate-400 italic font-medium">
                     This cash memo is an official record of stock transfer and liability settlement. 
                     The data is mirrored in the central ledger for auditing purposes. 
                     Thank you for your continued partnership.
                  </p>
               </div>
            </div>
            <div className="w-96 space-y-3">
              <div className="flex justify-between items-center py-2 px-6 border-b border-slate-100">
                <span className="text-[9px] font-black uppercase text-slate-400">Inventory Value</span>
                <span className="font-bold tabular-nums">Tk {formatPriceBN(sale.totalAmount)}</span>
              </div>
              {sale.discount > 0 && (
                <div className="flex justify-between items-center py-2 px-6">
                  <span className="text-[9px] font-black uppercase text-emerald-500 tracking-widest">Trade Discount</span>
                  <span className="font-bold text-emerald-600 tabular-nums">- Tk {formatPriceBN(sale.discount)}</span>
                </div>
              )}
              <div className="flex justify-between items-center py-6 px-8 bg-slate-900 text-white rounded-[1.5rem] shadow-xl">
                <span className="font-black uppercase text-xs tracking-widest">Net Voucher</span>
                <span className="font-black text-2xl tabular-nums" style={{ fontFamily: 'var(--font-outfit)' }}>Tk {formatPriceBN(sale.totalAmount - sale.discount)}</span>
              </div>
              
              <div className="pt-4 grid grid-cols-2 gap-4">
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                   <p className="text-[8px] font-black uppercase text-emerald-600 tracking-widest mb-1">Settled</p>
                   <p className="text-sm font-black text-emerald-700 tabular-nums">Tk {formatPriceBN(sale.paidAmount)}</p>
                </div>
                <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100">
                   <p className="text-[8px] font-black uppercase text-rose-600 tracking-widest mb-1">Arrears</p>
                   <p className="text-sm font-black text-rose-700 tabular-nums">Tk {formatPriceBN(sale.dueAdded)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Signature Grid */}
          <div className="mt-32 grid grid-cols-2 gap-32 break-inside-avoid">
             <div className="text-center group">
                <div className="h-20 border-b-2 border-slate-100 group-hover:border-slate-300 transition-all flex items-center justify-center">
                   {/* Placeholder for actual signature if needed */}
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-4">Recipient Endorsement</p>
             </div>
             <div className="text-center group">
                <div className="h-20 border-b-2 border-slate-900 flex items-center justify-center">
                   <Landmark className="h-10 w-10 text-slate-50 opacity-10" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 mt-4">Authorized Executive Seal</p>
             </div>
          </div>

          <div className="mt-20 pt-8 border-t border-slate-50 text-center">
             <p className="text-[8px] text-slate-300 font-black uppercase tracking-[0.6em]">বারাকাহ ক্লথ স্টোর — Official Stock Voucher</p>
          </div>
        </div>
      </div>
    </>
  );
}
