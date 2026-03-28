"use client";

import { BarChart as ReBar, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from "recharts";

export function BusinessBarChart({ data = [] }: { data: any[] }) {
  // Check if data is daily (based on item structure or count)
  const isDaily = data.length > 0 && (data[0].date !== undefined && data[0].month === undefined);

  let chartData: any[] = [];
  
  if (data.length === 0) {
    chartData = [];
  } else if (isDaily) {
    // Show all days provided (sorted by date)
    chartData = [...data].sort((a,b) => parseInt(a.date) - parseInt(b.date)).map(d => ({
      name: d.date,
      Revenue: Math.max(0, d.sales || 0),
      Expenses: Math.max(0, d.expenses || 0),
      Purchases: Math.max(0, d.purchases || 0),
      Profit: 0
    }));
  } else {
    // Take last 6 months and reverse to chronological order
    chartData = data.slice(0, 6).reverse().map(m => ({
      name: m.label ? m.label.split(" ")[0].toUpperCase() : "N/A",
      Revenue: Math.max(0, m.totalSales || 0),
      Profit: Math.max(0, m.netProfit || 0),
      Expenses: 0,
      Purchases: 0
    }));
  }

  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ReBar data={chartData} margin={{ top: 20, right: 0, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="8 8" vertical={false} stroke="#f1f5f9" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 8, fontWeight: 900 }} 
            interval={isDaily ? 0 : "preserveStartEnd"}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 700 }}
            tickFormatter={(v) => {
              if (v >= 1000000) return `Tk ${(v/1000000).toFixed(1)}M`;
              if (v >= 1000) return `Tk ${(v/1000).toFixed(1)}k`;
              return `Tk ${v}`;
            }}
          />
          <Tooltip 
            cursor={{ fill: '#f8fafc' }}
            contentStyle={{ 
                borderRadius: '24px', 
                border: '1px solid #f1f5f9', 
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)',
                padding: '16px',
                background: 'rgba(255,255,255,0.8)',
                backdropFilter: 'blur(12px)'
            }}
            itemStyle={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}
            labelStyle={{ fontSize: '10px', fontWeight: 900, color: '#6366f1', marginBottom: '8px', letterSpacing: '0.1em' }}
          />
          <Legend 
            verticalAlign="top" 
            align="right"
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ paddingBottom: '20px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}
          />
          <ReferenceLine y={0} stroke="#e2e8f0" strokeDasharray="3 3" />
          
          <Bar 
            dataKey="Revenue" 
            fill="url(#colorRevenue)" 
            radius={[4, 4, 0, 0]} 
            barSize={isDaily ? 8 : 32} 
          />
          
          {!isDaily ? (
            <Bar 
              dataKey="Profit" 
              fill="url(#colorProfit)" 
              radius={[4, 4, 0, 0]} 
              barSize={32} 
            />
          ) : (
            <>
              <Bar 
                dataKey="Purchases" 
                fill="url(#colorPurchases)" 
                radius={[4, 4, 0, 0]} 
                barSize={8} 
              />
              <Bar 
                dataKey="Expenses" 
                fill="url(#colorExpenses)" 
                radius={[4, 4, 0, 0]} 
                barSize={8} 
              />
            </>
          )}

          <defs>
             <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={1}/>
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.8}/>
             </linearGradient>
             <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={1}/>
                <stop offset="95%" stopColor="#059669" stopOpacity={0.8}/>
             </linearGradient>
             <linearGradient id="colorPurchases" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={1}/>
                <stop offset="95%" stopColor="#d97706" stopOpacity={0.8}/>
             </linearGradient>
             <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ec4899" stopOpacity={1}/>
                <stop offset="95%" stopColor="#db2777" stopOpacity={0.8}/>
             </linearGradient>
          </defs>
        </ReBar>
      </ResponsiveContainer>
    </div>
  );
}
