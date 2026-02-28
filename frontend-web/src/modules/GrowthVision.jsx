import React, { useMemo, useState } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, Activity, ChevronRight, Database, Fingerprint, Dumbbell, Calendar, User, BrainCircuit } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/90 border border-white/10 p-4 rounded-2xl shadow-2xl backdrop-blur-md">
        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 border-b border-white/10 pb-2">{label}</p>
        <div className="space-y-2">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-6">
               <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
                  <span className="text-xs text-zinc-300 font-bold">{entry.name}</span>
               </div>
               <span className="text-sm font-black" style={{ color: entry.color }}>{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

function ImpactCard({ icon, label, value, sub, active, positive }) {
  return (
    <div className={`p-6 rounded-[2rem] border shadow-xl relative overflow-hidden group transition-all h-full ${active ? 'bg-zinc-950/80 border-white/5 backdrop-blur-xl' : 'bg-zinc-950/30 border-white/5 opacity-50'}`}>
      <div className="relative z-10">
        <div className="p-3 bg-black border border-white/5 rounded-2xl inline-block mb-4 shadow-inner">
            {icon}
        </div>
        <h4 className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">{label}</h4>
        <p className="text-3xl font-black mt-1 text-white tracking-tighter">{value}</p>
        <p className={`text-[9px] font-black uppercase mt-3 tracking-widest ${active ? (positive ? 'text-lime-400' : 'text-red-500') : 'text-zinc-600'}`}>{sub}</p>
      </div>
    </div>
  );
}

export default function GrowthVision({ members, selectedMember, onSelectMember, analyticsData }) {
  const [timeHorizon, setTimeHorizon] = useState('6M');

  // Find the exact member to extract height for BMI calculation
  const selectedMemberData = useMemo(() => members.find(m => m.name === selectedMember), [members, selectedMember]);

  const filteredData = useMemo(() => {
    if (!analyticsData) return [];
    if (timeHorizon === '6M') return analyticsData.slice(-6);
    if (timeHorizon === '1Y') return analyticsData.slice(-12);
    return analyticsData;
  }, [analyticsData, timeHorizon]);

  // --- NEW: AI FORECASTING LOGIC ---
  const extendedData = useMemo(() => {
      if (!filteredData || filteredData.length === 0) return [];
      const dataCopy = filteredData.map(d => ({...d})); 

      // If we have history, predict the next point
      if (dataCopy.length >= 2) {
          const last = dataCopy[dataCopy.length - 1];
          const prev = dataCopy[dataCopy.length - 2];

          const weightDelta = last.weight - prev.weight;
          const fatDelta = last.fat - prev.fat;

          // Connect the solid line to the dashed line
          last.forecastWeight = last.weight;
          last.forecastFat = last.fat;

          // Push the predictive future node
          dataCopy.push({
              month: 'AI Forecast',
              forecastWeight: Number((last.weight + (weightDelta * 0.8)).toFixed(1)), // Dampen slope slightly
              forecastFat: Number((last.fat + (fatDelta * 0.8)).toFixed(1)),
          });
      }
      return dataCopy;
  }, [filteredData]);

  const metrics = useMemo(() => {
    if (!filteredData || filteredData.length < 2) return null;
    const first = filteredData[0];
    const latest = filteredData[filteredData.length - 1];
    
    const muscleGain = (latest.muscle - first.muscle).toFixed(1);
    const fatLoss = (first.fat - latest.fat).toFixed(1);

    // Calculate Live BMI
    let currentBMI = '--';
    if (selectedMemberData && selectedMemberData.height) {
        const heightM = parseFloat(selectedMemberData.height) / 100;
        if (heightM > 0) currentBMI = (latest.weight / (heightM * heightM)).toFixed(1);
    }
    
    return {
      muscle: muscleGain > 0 ? `+${muscleGain}kg` : `${muscleGain}kg`,
      fat: fatLoss > 0 ? `-${fatLoss}%` : `+${Math.abs(fatLoss)}%`,
      currentWeight: latest.weight,
      bmi: currentBMI,
      muscleTrendUp: muscleGain > 0,
      fatTrendDown: fatLoss > 0
    };
  }, [filteredData, selectedMemberData]);

  return (
    <div className="animate-fade-in space-y-10 flex flex-col h-full">
      {/* 1. Member Selector Strip */}
      <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
        {members.length === 0 ? (
           <div className="text-zinc-500 text-xs font-black uppercase tracking-widest flex items-center bg-zinc-900/50 p-6 rounded-2xl border border-white/5 w-full justify-center">
               <Database size={16} className="mr-3"/> No SQL Client Records Found
           </div>
        ) : (
            members.map(member => (
            <button 
                key={member.id} 
                onClick={() => onSelectMember(member.name)} 
                className={`flex-shrink-0 px-6 py-4 rounded-2xl border transition-all flex items-center gap-4 ${selectedMember === member.name ? 'bg-lime-400 border-lime-400 text-black shadow-[0_0_30px_rgba(163,230,53,0.2)]' : 'bg-zinc-950/80 border-white/5 text-zinc-400 hover:border-white/20 hover:text-white backdrop-blur-sm'}`}
            >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black ${selectedMember === member.name ? 'bg-black/10' : 'bg-white/5'}`}>
                    {member.name.charAt(0)}
                </div>
                <div className="text-left">
                    <span className="font-bold text-sm block leading-none mb-1">{member.name}</span>
                    <span className={`text-[9px] font-black uppercase tracking-widest ${selectedMember === member.name ? 'text-black/60' : 'text-zinc-600'}`}>ID: TATH_0{member.id}</span>
                </div>
                {selectedMember === member.name && <ChevronRight size={18} className="ml-2" />}
            </button>
            ))
        )}
      </div>

      

      {/* 2. Main Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
        
        {/* Chart Area */}
        <div className="lg:col-span-8 bg-zinc-950/80 border border-white/5 rounded-[3rem] p-10 shadow-2xl backdrop-blur-xl flex flex-col relative overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 relative z-10 gap-4 border-b border-white/5 pb-6">
              <div>
                  <h3 className="font-black text-2xl text-white uppercase tracking-tighter flex items-center mb-1">
                      <Fingerprint className="text-lime-400 mr-3" size={28} /> 
                      {selectedMember ? `Telemetry: ${selectedMember}` : 'Biometric Telemetry'}
                  </h3>
                  {selectedMember && (
                      <div className="flex items-center gap-3 ml-10 mt-2">
                          <span className="text-[9px] font-black bg-lime-400/10 text-lime-400 px-3 py-1 rounded-md border border-lime-400/20 tracking-widest uppercase flex items-center">
                              Live SQL Sync
                          </span>
                          <span className="text-[9px] font-black bg-blue-500/10 text-blue-400 px-3 py-1 rounded-md border border-blue-500/20 tracking-widest uppercase flex items-center">
                              <BrainCircuit size={10} className="mr-1" /> AI Forecast Active
                          </span>
                      </div>
                  )}
              </div>

              {selectedMember && (
                  <div className="flex bg-black p-1 rounded-xl border border-white/10">
                      {['6M', '1Y', 'ALL'].map(horizon => (
                          <button 
                              key={horizon} onClick={() => setTimeHorizon(horizon)}
                              className={`px-4 py-2 rounded-lg text-[10px] font-black tracking-widest transition-all ${timeHorizon === horizon ? 'bg-zinc-800 text-white shadow-md' : 'text-zinc-500 hover:text-white'}`}
                          >
                              {horizon}
                          </button>
                      ))}
                  </div>
              )}
          </div>
          
          <div className="flex-1 min-h-[400px] w-full relative z-10">
            {!selectedMember ? (
                <div className="h-full flex flex-col items-center justify-center text-zinc-500 animate-pulse">
                    <User size={80} className="mb-6 opacity-20" />
                    <p className="font-black uppercase tracking-[0.3em] text-xs">Select a Client</p>
                </div>
            ) : extendedData && extendedData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={extendedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorW" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#a3e635" stopOpacity={0.6}/><stop offset="95%" stopColor="#a3e635" stopOpacity={0}/></linearGradient>
                        <linearGradient id="colorF" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
                    <XAxis dataKey="month" stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                    <YAxis stroke="#71717a" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    
                    {/* Historical Solid Lines */}
                    <Area type="monotone" name="Total Mass (kg)" dataKey="weight" stroke="#a3e635" strokeWidth={4} fillOpacity={1} fill="url(#colorW)" connectNulls />
                    <Area type="monotone" name="Body Fat (%)" dataKey="fat" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorF)" connectNulls />
                    
                    {/* Predictive Dashed Lines */}
                    <Area type="monotone" name="Proj. Mass" dataKey="forecastWeight" stroke="#a3e635" strokeWidth={3} strokeDasharray="6 6" fill="none" connectNulls />
                    <Area type="monotone" name="Proj. Fat" dataKey="forecastFat" stroke="#10b981" strokeWidth={2} strokeDasharray="6 6" fill="none" connectNulls />
                </AreaChart>
                </ResponsiveContainer>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-zinc-600 animate-pulse">
                    <Activity size={80} className="mb-6 opacity-20 text-lime-400" />
                    <p className="font-black uppercase tracking-[0.3em] text-xs text-zinc-400">Awaiting Telemetry</p>
                </div>
            )}
          </div>
        </div>

        {/* Dynamic Impact Cards */}
        <div className="lg:col-span-4 grid grid-cols-2 gap-4 flex-col justify-start">
           <div className="col-span-2">
               <ImpactCard 
                   icon={<Dumbbell className={metrics ? "text-lime-400" : "text-zinc-600"}/>} 
                   label={`Muscle Delta`} 
                   value={metrics ? metrics.muscle : '--'} 
                   sub={!selectedMember ? "Select a client" : metrics ? (metrics.muscleTrendUp ? "Hypertrophy Detected" : "Atrophy Warning") : "Awaiting Data"} 
                   active={!!metrics}
                   positive={metrics ? metrics.muscleTrendUp : false}
               />
           </div>
           
           <ImpactCard 
               icon={<TrendingUp className={metrics ? "text-emerald-400" : "text-zinc-600"}/>} 
               label={`Adipose`} 
               value={metrics ? metrics.fat : '--'} 
               sub={metrics ? (metrics.fatTrendDown ? "Good" : "Warning") : "N/A"} 
               active={!!metrics}
               positive={metrics ? metrics.fatTrendDown : false}
           />
           <ImpactCard 
               icon={<Activity className={metrics ? "text-blue-400" : "text-zinc-600"}/>} 
               label={`Live BMI`} 
               value={metrics ? metrics.bmi : '--'} 
               sub={metrics ? (metrics.bmi < 25 ? "Healthy Range" : "Overweight Range") : "N/A"} 
               active={!!metrics}
               positive={metrics ? metrics.bmi < 25 : false}
           />

           {metrics && selectedMember && (
               <div className="bg-lime-400 p-6 rounded-[2rem] text-black shadow-[0_0_40px_rgba(163,230,53,0.15)] relative overflow-hidden mt-2 col-span-2 flex justify-between items-center">
                   <div className="absolute right-0 top-0 p-4 opacity-10"><Calendar size={80} /></div>
                   <div className="relative z-10">
                       <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-80">Verified Mass</p>
                       <p className="text-4xl font-black tracking-tighter">{metrics.currentWeight}<span className="text-lg ml-1">kg</span></p>
                   </div>
               </div>
           )}
        </div>
      </div>
    </div>
  );
}