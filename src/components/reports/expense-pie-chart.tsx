"use client";

import { PieChart as RePie, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const COLORS = ["#6366f1", "#8b5cf6", "#10b981", "#f59e0b", "#ec4899", "#06b6d4", "#fb7185"];

export function ExpensePieChart({ data = {} }: { data: Record<string, number> }) {
  const chartData = Object.entries(data || {})
    .sort((a, b) => b[1] - a[1])
    .map(([name, amount]) => ({ name, value: amount }));

  if (chartData.length === 0) {
    return (
      <div className="h-[300px] flex flex-col items-center justify-center text-slate-500 gap-4">
         <div className="h-12 w-12 border-2 border-dashed border-slate-700/50 rounded-full animate-pulse" />
         <p className="text-[10px] font-black uppercase tracking-widest italic opacity-30 text-center">Data Stream Empty</p>
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RePie>
          <Pie
            data={chartData}
            cx="50%"
            cy="45%"
            innerRadius={70}
            outerRadius={95}
            paddingAngle={10}
            dataKey="value"
            stroke="none"
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]} 
                className="hover:opacity-80 transition-opacity cursor-pointer shadow-lg" 
              />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
                borderRadius: '20px', 
                border: 'none', 
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                background: 'rgba(15, 23, 42, 0.9)',
                backdropFilter: 'blur(8px)',
                padding: '12px 16px'
            }}
            itemStyle={{ fontSize: '10px', fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em' }}
            formatter={(value: any) => [`Tk ${Number(value).toLocaleString()}`, 'BURN']}
          />
          <Legend 
            verticalAlign="bottom" 
            iconType="circle" 
            iconSize={6}
            wrapperStyle={{ paddingTop: '20px' }}
            formatter={(value) => <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-1">{value}</span>}
          />
        </RePie>
      </ResponsiveContainer>
    </div>
  );
}
