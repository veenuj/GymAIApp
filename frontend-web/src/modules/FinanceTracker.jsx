import React from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, YAxis, CartesianGrid, Cell } from 'recharts';
import { PieChart, Zap, TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';

export default function FinanceTracker({ finance, aiInsight }) {
  // --- CALCULATIONS ---
  const totalRev = finance.revenue.reduce((acc, curr) => acc + curr.amount, 0);
  const totalExp = finance.expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const netProfit = totalRev - totalExp;
  const profitMargin = totalRev > 0 ? ((netProfit / totalRev) * 100).toFixed(1) : 0;

  // Currency Formatter (Indian Rupees)
  const formatINR = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Combine and pseudo-sort ledger for recent transactions view
  const ledger = [
    ...finance.revenue.map(r => ({ ...r, type: 'in', icon: <ArrowUpRight size={14} className="text-lime-400" /> })),
    ...finance.expenses.map(e => ({ ...e, type: 'out', icon: <ArrowDownRight size={14} className="text-red-500" /> }))
  ].sort((a, b) => b.amount - a.amount); // Sorting by amount for realistic display focus

  return (
    <div className="animate-fade-in space-y-8">
      
      {/* 1. KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
            label="Gross Revenue" 
            value={formatINR(totalRev)} 
            trend="+12.5%" 
            trendUp={true} 
            icon={<TrendingUp size={16} className="text-lime-400"/>} 
        />
        <StatCard 
            label="Operating Burn (Expenses)" 
            value={formatINR(totalExp)} 
            trend="-2.4%" 
            trendUp={false} 
            icon={<TrendingDown size={16} className="text-red-500"/>} 
        />
        <div className="bg-lime-400 p-8 rounded-[2rem] text-black relative overflow-hidden shadow-[0_0_40px_rgba(163,230,53,0.15)] flex flex-col justify-between">
          <div className="absolute -right-6 -top-6 opacity-20"><Wallet size={120} /></div>
          <div>
              <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-80">Net Profit</p>
              <p className="text-4xl font-black tracking-tighter">{formatINR(netProfit)}</p>
          </div>
          <div className="mt-4 flex items-center bg-black/10 w-max px-3 py-1.5 rounded-lg">
              <Activity size={12} className="mr-2" />
              <span className="text-[10px] font-black uppercase tracking-widest">{profitMargin}% Margin</span>
          </div>
        </div>
      </div>

      {/* 2. CHARTS & DATA VISUALIZATION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Revenue Streams Chart */}
        <div className="lg:col-span-8 bg-zinc-900/50 border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-sm shadow-xl">
          <div className="flex justify-between items-center mb-8">
              <h3 className="font-bold text-lg text-white flex items-center"><PieChart className="mr-3 text-lime-400" size={20}/> Revenue Streams</h3>
              <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest bg-black px-3 py-1 rounded-full border border-white/5">MTD Live</span>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={finance.revenue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
                <XAxis dataKey="category" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                <Tooltip 
                    cursor={{fill: '#27272a80'}} 
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', color: '#fff', fontSize: '12px', fontWeight: 'bold' }} 
                    formatter={(value) => formatINR(value)}
                />
                <Bar dataKey="amount" radius={[6, 6, 0, 0]} maxBarSize={60}>
                  {finance.revenue.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#a3e635' : '#4ade80'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Breakdown */}
        <div className="lg:col-span-4 bg-zinc-900/50 border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-sm shadow-xl flex flex-col">
            <h3 className="font-bold text-lg text-white mb-8 flex items-center"><TrendingDown className="mr-3 text-red-500" size={20}/> Expense Distribution</h3>
            <div className="flex-1 space-y-6 overflow-y-auto custom-scrollbar pr-2">
                {finance.expenses.map((exp, idx) => {
                    const percentage = ((exp.amount / totalExp) * 100).toFixed(0);
                    return (
                        <div key={idx} className="space-y-2 group">
                            <div className="flex justify-between text-xs font-bold">
                                <span className="text-zinc-300">{exp.category}</span>
                                <span className="text-white">{formatINR(exp.amount)}</span>
                            </div>
                            <div className="w-full bg-black rounded-full h-2 overflow-hidden border border-white/5">
                                <div 
                                    className="bg-red-500 h-full rounded-full group-hover:bg-red-400 transition-colors" 
                                    style={{ width: `${percentage}%` }}
                                ></div>
                            </div>
                            <p className="text-[9px] text-zinc-600 font-black tracking-widest text-right">{percentage}% of Total Burn</p>
                        </div>
                    );
                })}
            </div>
        </div>
      </div>

      {/* 3. AI INSIGHTS & RECENT LEDGER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* AI CFO */}
        <div className="lg:col-span-5 bg-zinc-900 border border-lime-400/20 rounded-[2.5rem] p-8 relative overflow-hidden shadow-[0_0_50px_rgba(163,230,53,0.05)]">
          <div className="absolute top-0 right-0 p-8 opacity-5 text-lime-400 animate-pulse"><Zap size={100} /></div>
          <div className="flex items-center gap-2 mb-6">
              <div className="w-2 h-2 bg-lime-400 rounded-full animate-pulse"></div>
              <h3 className="text-[10px] font-black text-lime-400 uppercase tracking-widest">AI CFO Executive Summary</h3>
          </div>
          <p className="whitespace-pre-wrap font-medium text-zinc-300 text-sm leading-relaxed relative z-10 p-4 bg-black/40 rounded-2xl border border-white/5">
              {aiInsight || "Analyzing financial telemetry..."}
          </p>
        </div>

        {/* Recent Ledger */}
        <div className="lg:col-span-7 bg-zinc-900/50 border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-sm">
            <h3 className="font-bold text-lg text-white mb-6">Transaction Ledger</h3>
            <div className="space-y-3 max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
                {ledger.slice(0, 6).map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-4 bg-black/40 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-xl bg-zinc-900 border border-white/5`}>
                                {item.icon}
                            </div>
                            <div>
                                <p className="text-white text-xs font-bold">{item.category}</p>
                                <p className="text-zinc-600 text-[9px] uppercase font-black tracking-widest mt-0.5">Automated Entry</p>
                            </div>
                        </div>
                        <div className={`font-black tracking-tighter ${item.type === 'in' ? 'text-lime-400' : 'text-white'}`}>
                            {item.type === 'in' ? '+' : '-'}{formatINR(item.amount)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}

// Sub-component for KPI Cards
function StatCard({ label, value, trend, trendUp, icon }) {
  return (
    <div className="bg-zinc-900/80 p-8 rounded-[2rem] border border-white/5 shadow-xl relative overflow-hidden">
      <div className="flex justify-between items-start mb-4">
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{label}</p>
          <div className={`p-2 rounded-lg bg-black border border-white/5`}>{icon}</div>
      </div>
      <p className={`text-3xl font-black text-white tracking-tighter mb-4`}>{value}</p>
      <div className="flex items-center gap-2">
          <span className={`text-[10px] font-black px-2 py-1 rounded-md ${trendUp ? 'bg-lime-400/10 text-lime-400' : 'bg-red-500/10 text-red-500'}`}>
              {trend}
          </span>
          <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">vs last month</span>
      </div>
    </div>
  );
}