import React from 'react';
import { 
    Activity, Users, TrendingUp, AlertTriangle, Cpu, 
    IndianRupee, Package, UsersRound, Megaphone, ShieldCheck 
} from 'lucide-react';

export default function SystemOverview({ members, finance, equipment, inventory, leads, staff, aiInsight }) {
  
  // --- MASTER KPI CALCULATIONS ---
  // 1. Members & Attendance
  const activeMembers = members.length;
  const presentToday = members.filter(m => m.isPresentToday).length;
  const churnRisk = members.filter(m => m.last_seen_days > 4).length;

  // 2. Financials (Revenue - Expenses)
  const totalRev = finance?.revenue?.reduce((acc, curr) => acc + curr.amount, 0) || 0;
  const totalExp = finance?.expenses?.reduce((acc, curr) => acc + curr.amount, 0) || 0;
  const netProfit = totalRev - totalExp;

  // 3. Operational Alerts
  const criticalMachines = equipment.filter(m => (m.usage_hours / m.limit) > 0.9).length;
  const lowStockItems = inventory.filter(i => i.stock <= i.threshold).length;
  
  // 4. Payroll Liability
  const pendingPayroll = staff.reduce((acc, emp) => acc + emp.base_salary + emp.pt_commissions, 0);

  // Format Currency
  const formatINR = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="animate-fade-in space-y-8 flex flex-col h-full text-white">
        
        {/* TOP COMMAND STRIP */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-950/80 p-6 rounded-[2rem] border border-white/5 backdrop-blur-xl shadow-xl">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-lime-400/10 rounded-xl border border-lime-400/20">
                    <Cpu className="text-lime-400" size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-black uppercase tracking-tighter">Tathastu Central Command</h2>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1 flex items-center">
                        <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse mr-2"></span>
                        All SQL Databases Synced
                    </p>
                </div>
            </div>
            <div className="text-right hidden md:block">
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">System Date</p>
                <p className="font-bold">{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
            </div>
        </div>

        {/* PRIMARY KPI GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <KPICard 
                title="Net Profit (MTD)" 
                value={formatINR(netProfit)} 
                icon={<IndianRupee size={20} className="text-lime-400"/>} 
                trend={netProfit >= 0 ? "+ Healthy Margin" : "Operating at Loss"}
                positive={netProfit >= 0}
            />
            <KPICard 
                title="Daily Footfall" 
                value={presentToday} 
                icon={<Activity size={20} className="text-emerald-400"/>} 
                trend={`Out of ${activeMembers} Active`}
                positive={true}
            />
            <KPICard 
                title="Churn Risk" 
                value={churnRisk} 
                icon={<UsersRound size={20} className="text-red-500"/>} 
                trend="Members MIA (4d+)"
                positive={false}
            />
            <KPICard 
                title="Pending Payroll" 
                value={formatINR(pendingPayroll)} 
                icon={<ShieldCheck size={20} className="text-blue-400"/>} 
                trend={`${staff.length} Active Staff`}
                positive={true}
            />
        </div>

        {/* BENTO BOX METRICS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
            
            {/* AI Executive Briefing */}
            <div className="lg:col-span-8 bg-zinc-950/80 border border-white/5 rounded-[2.5rem] p-8 shadow-2xl backdrop-blur-xl flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5"><TrendingUp size={150}/></div>
                <h3 className="font-black text-sm text-lime-400 uppercase tracking-widest flex items-center mb-6 relative z-10">
                    <Cpu size={16} className="mr-2"/> AI Executive Summary
                </h3>
                <div className="bg-black/40 border border-white/5 rounded-2xl p-6 flex-1 relative z-10">
                    <p className="whitespace-pre-wrap font-medium text-zinc-300 text-sm leading-relaxed">
                        {aiInsight || "Analyzing multi-module telemetry... Please trigger Finance Analysis to generate briefing."}
                    </p>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mt-6 relative z-10">
                    <div className="bg-black/40 border border-white/5 p-4 rounded-xl text-center">
                        <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1">Gross Rev</p>
                        <p className="font-bold text-white">{formatINR(totalRev)}</p>
                    </div>
                    <div className="bg-black/40 border border-white/5 p-4 rounded-xl text-center">
                        <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1">OpEx Burn</p>
                        <p className="font-bold text-white">{formatINR(totalExp)}</p>
                    </div>
                    <div className="bg-black/40 border border-white/5 p-4 rounded-xl text-center">
                        <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1">Lead Funnel</p>
                        <p className="font-bold text-white">{leads.length} Prospects</p>
                    </div>
                </div>
            </div>

            {/* Operational Action Center */}
            <div className="lg:col-span-4 flex flex-col gap-6">
                
                {/* Equipment Status */}
                <div className={`p-8 rounded-[2.5rem] border shadow-xl flex-1 flex flex-col justify-center relative overflow-hidden ${criticalMachines > 0 ? 'bg-red-500/10 border-red-500/30' : 'bg-zinc-950/80 border-white/5'}`}>
                    <div className="relative z-10 flex items-center gap-4">
                        <div className={`p-4 rounded-2xl ${criticalMachines > 0 ? 'bg-red-500/20 text-red-500' : 'bg-white/5 text-zinc-400'}`}>
                            <AlertTriangle size={28} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Hardware Alerts</p>
                            {criticalMachines > 0 ? (
                                <div>
                                    <p className="text-2xl font-black text-white tracking-tighter">{criticalMachines} Critical</p>
                                    <p className="text-[9px] font-bold text-red-500 uppercase mt-1">Service Required</p>
                                </div>
                            ) : (
                                <p className="text-xl font-black text-white tracking-tighter">All Nominal</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Inventory Status */}
                <div className={`p-8 rounded-[2.5rem] border shadow-xl flex-1 flex flex-col justify-center relative overflow-hidden ${lowStockItems > 0 ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-zinc-950/80 border-white/5'}`}>
                    <div className="relative z-10 flex items-center gap-4">
                        <div className={`p-4 rounded-2xl ${lowStockItems > 0 ? 'bg-yellow-500/20 text-yellow-500' : 'bg-white/5 text-zinc-400'}`}>
                            <Package size={28} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Inventory Levels</p>
                            {lowStockItems > 0 ? (
                                <div>
                                    <p className="text-2xl font-black text-white tracking-tighter">{lowStockItems} Low Stock</p>
                                    <p className="text-[9px] font-bold text-yellow-500 uppercase mt-1">Restock Recommended</p>
                                </div>
                            ) : (
                                <p className="text-xl font-black text-white tracking-tighter">Fully Stocked</p>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>
  );
}

// Mini Component for top KPIs
function KPICard({ title, value, icon, trend, positive }) {
    return (
        <div className="bg-zinc-950/80 border border-white/5 p-6 rounded-[2rem] shadow-xl backdrop-blur-md relative overflow-hidden group hover:border-white/10 transition-colors">
            <div className="flex justify-between items-start mb-4">
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{title}</p>
                <div className="p-2 bg-black border border-white/5 rounded-lg">{icon}</div>
            </div>
            <p className="text-3xl font-black text-white tracking-tighter mb-3">{value}</p>
            <div className="flex items-center">
                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${positive ? 'bg-lime-400/10 text-lime-400' : 'bg-red-500/10 text-red-500'}`}>
                    {trend}
                </span>
            </div>
        </div>
    );
}