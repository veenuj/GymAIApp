import React, { useState } from 'react';
import { Zap, Loader, Users, BellRing, CheckCircle, Clock, UserCheck, Scale, AlertTriangle } from 'lucide-react';
import { StatSummary } from '../components/UI';

export default function AttendanceBot({ members, onNudge, isMessaging, onMarkAttendance, onRefresh }) {
  // Local state to hold the weight input for each member being checked in
  const [weights, setWeights] = useState({});

  const handleWeightChange = (id, value) => {
    setWeights(prev => ({ ...prev, [id]: value }));
  };

  const handleCheckIn = (id) => {
    const currentWeight = weights[id];
    // Pass both the ID and the new weight up to the parent App.jsx
    onMarkAttendance(id, currentWeight);
  };

  // --- NEW: RENEWAL API CALL ---
  const handleRenew = async (id) => {
    if(!window.confirm("Charge member and extend access by 30 days?")) return;
    try {
      const res = await fetch(`http://localhost:8005/api/members/${id}/renew`, { method: 'POST' });
      const data = await res.json();
      alert(data.message);
      if (onRefresh) onRefresh(); // Instantly update the UI and Finance tracking
    } catch (e) {
      console.error("Renewal Error:", e);
    }
  };

  // --- LOGIC ---
  const atRiskCount = members.filter(m => m.last_seen_days > 4).length;
  const presentToday = members.filter(m => m.isPresentToday).length; 
  const activeCount = members.length;

  const getSubHealth = (dateStr) => {
      // Basic parser for "12 March 2026" type strings
      const expiry = new Date(dateStr);
      const today = new Date();
      const diffTime = expiry - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (isNaN(diffDays)) return { text: "Active", color: "text-lime-400 bg-lime-400/5 border-lime-400/20", isExpired: false };
      if (diffDays < 0) return { text: "EXPIRED", color: "text-red-500 bg-red-500/10 border-red-500/30", isExpired: true };
      if (diffDays <= 5) return { text: `Expiring: ${diffDays}d`, color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/30", isExpired: false };
      return { text: "Active", color: "text-lime-400 bg-lime-400/5 border-lime-400/20", isExpired: false };
  };

  return (
    <div className="animate-fade-in space-y-8">
      
      {/* 1. EXPANDED METRICS BAR */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatSummary label="Present Today" value={presentToday} color="text-emerald-400" />
        <StatSummary label="Churn Risk (4d+)" value={atRiskCount} color="text-red-500" />
        <StatSummary label="Total Members" value={activeCount} color="text-lime-400" />
        <StatSummary label="AI Nudges Active" value={members.filter(m => m.status.includes('✅')).length} color="text-blue-400" />
      </div>

      

      {/* 2. ATTENDANCE & RETENTION HUB */}
      <div className="bg-zinc-900/50 border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-md shadow-2xl">
        <div className="p-8 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center bg-white/5 gap-4">
          <div>
            <h3 className="text-xl font-bold text-white uppercase tracking-tighter flex items-center">
              <UserCheck className="mr-2 text-lime-400" size={20} /> Daily Entry Terminal
            </h3>
            <p className="text-zinc-500 text-[10px] mt-1 uppercase tracking-[0.2em] font-black">
              System Date: {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
          </div>
          
          <div className="flex gap-4">
            <button 
                onClick={onNudge} 
                disabled={isMessaging}
                className="bg-zinc-800 text-white px-6 py-4 rounded-2xl font-black flex items-center hover:bg-zinc-700 transition-all text-[10px] tracking-widest border border-white/5 disabled:opacity-50"
            >
                {isMessaging ? <Loader className="animate-spin mr-2"/> : <BellRing size={14} className="mr-2 text-lime-400"/>} 
                NUDGE INACTIVE
            </button>
            <button 
                onClick={onRefresh}
                className="bg-lime-400 text-black px-6 py-4 rounded-2xl font-black flex items-center hover:scale-[1.02] active:scale-95 transition-all text-[10px] tracking-widest shadow-lg shadow-lime-400/20"
            >
                <Clock size={14} className="mr-2"/> SYSTEM REFRESH
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-left">
            <thead className="bg-black/20 text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                <tr>
                  <th className="p-6">Member Identity</th>
                  <th className="p-6 text-center">Subscription Status</th>
                  <th className="p-6 text-center">Engagement</th>
                  <th className="p-6 text-right">Access Control</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
                {members.map(m => {
                    const subHealth = getSubHealth(m.sub_expiry);
                    
                    return (
                        <tr key={m.id} className={`group hover:bg-white/5 transition-all ${m.isPresentToday ? 'bg-lime-400/[0.02]' : ''}`}>
                            {/* Member Info */}
                            <td className="p-6">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold border ${m.isPresentToday ? 'border-lime-400 text-lime-400 bg-lime-400/10' : subHealth.isExpired ? 'border-red-500 text-red-500 bg-red-500/10' : 'border-white/10 bg-zinc-800 text-zinc-500'}`}>
                                        {m.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-white text-sm">{m.name}</p>
                                        <p className="text-[10px] text-zinc-500 font-medium">Last logged weight: {m.weight}kg</p>
                                    </div>
                                </div>
                            </td>

                            {/* Subscription Status */}
                            <td className="p-6 text-center">
                                <span className={`px-3 py-1.5 rounded-md text-[9px] font-black uppercase border tracking-widest ${subHealth.color}`}>
                                    {subHealth.text}
                                </span>
                            </td>

                            {/* Engagement (Combined Last Seen & Status) */}
                            <td className="p-6 text-center">
                                <div className="flex flex-col items-center gap-2">
                                    <span className={`text-[11px] font-bold ${m.last_seen_days > 4 ? 'text-red-500' : 'text-zinc-400'}`}>
                                        {m.last_seen_days === 0 ? 'Seen Today' : `${m.last_seen_days} days ago`}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase border ${m.status.includes('✅') ? 'border-lime-400/50 text-lime-400 bg-lime-400/5' : 'border-zinc-800 text-zinc-600'}`}>
                                        {m.status}
                                    </span>
                                </div>
                            </td>

                            {/* ACTION: SMART ACCESS CONTROL */}
                            <td className="p-6 text-right">
                                {subHealth.isExpired ? (
                                    <button 
                                        onClick={() => handleRenew(m.id)}
                                        className="bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-red-500/20 animate-pulse flex items-center justify-end ml-auto"
                                    >
                                        <AlertTriangle size={14} className="mr-2"/> Renew To Unlock
                                    </button>
                                ) : m.isPresentToday ? (
                                    <div className="inline-flex items-center text-lime-400 font-black text-[10px] uppercase tracking-widest animate-in fade-in zoom-in duration-300">
                                        <CheckCircle size={14} className="mr-2" /> Access Granted
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-end gap-2">
                                        <div className="relative">
                                            <Scale size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                                            <input 
                                                type="number" 
                                                placeholder="Wt (kg)" 
                                                value={weights[m.id] || ''}
                                                onChange={(e) => handleWeightChange(m.id, e.target.value)}
                                                className="bg-black border border-white/10 rounded-xl py-2.5 pl-8 pr-3 text-[11px] text-white w-24 outline-none focus:border-lime-400 transition-colors placeholder:text-zinc-600 font-bold"
                                            />
                                        </div>
                                        <button 
                                            onClick={() => handleCheckIn(m.id)}
                                            className="bg-white/5 hover:bg-lime-400 hover:text-black text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/5 transition-all group-hover:scale-105 active:scale-95"
                                        >
                                            Grant Access
                                        </button>
                                    </div>
                                )}
                            </td>
                        </tr>
                    );
                })}
            </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}