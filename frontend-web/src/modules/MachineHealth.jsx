import React, { useState } from 'react';
import { Wrench, AlertTriangle, Settings, Activity, Plus, Loader2, CheckCircle2, RotateCcw } from 'lucide-react';

export default function MachineHealth({ equipment, onRefresh }) {
  const [formData, setFormData] = useState({ name: '', limit: '1000' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- SQL LOGIC HANDLERS ---
  const handleAddEquipment = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.limit) return alert("Fill all fields.");
    setIsSubmitting(true);
    try {
      const res = await fetch('http://localhost:8005/api/equipment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.name, limit: parseInt(formData.limit) })
      });
      if (res.ok) {
        setFormData({ name: '', limit: '1000' });
        if (onRefresh) onRefresh();
      }
    } catch (err) { console.error("Error adding equipment:", err); }
    setIsSubmitting(false);
  };

  const handleService = async (id) => {
    try {
      await fetch(`http://localhost:8005/api/equipment/${id}/service`, { method: 'PUT' });
      if (onRefresh) onRefresh();
    } catch (err) { console.error("Error servicing equipment:", err); }
  };

  const handleAddUsage = async (id) => {
    try {
      // Simulating +50 hours of usage for demonstration
      await fetch(`http://localhost:8005/api/equipment/${id}/use?hours=50`, { method: 'PUT' });
      if (onRefresh) onRefresh();
    } catch (err) { console.error("Error adding usage:", err); }
  };

  // --- CALCULATIONS ---
  const criticalMachines = equipment.filter(m => (m.usage_hours / m.limit) > 0.9);

  return (
    <div className="animate-fade-in space-y-8 text-white">
      
      {/* TOP ROW: ALERTS & REGISTRATION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* System Alert Banner */}
          <div className="lg:col-span-8 h-full">
            {criticalMachines.length > 0 ? (
                <div className="bg-red-500/10 border border-red-500/30 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center justify-between shadow-[0_0_50px_rgba(239,68,68,0.15)] h-full relative overflow-hidden backdrop-blur-xl">
                    <div className="absolute -right-10 -top-10 opacity-5 text-red-500"><AlertTriangle size={200}/></div>
                    <div className="flex items-center text-center md:text-left relative z-10">
                        <div className="w-16 h-16 rounded-2xl bg-red-500/20 flex items-center justify-center text-red-500 mr-6 mb-4 md:mb-0 animate-pulse border border-red-500/50">
                            <AlertTriangle size={32} />
                        </div>
                        <div>
                            <h4 className="font-black text-white uppercase tracking-tighter text-2xl">Operational Risk Detected</h4>
                            <p className="text-red-200/70 text-sm mt-2 font-medium">
                                {criticalMachines.length} unit(s) have exceeded safety usage limits. Immediate technical service required to prevent hardware failure.
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-lime-400/10 border border-lime-400/20 rounded-[2.5rem] p-10 flex items-center h-full backdrop-blur-xl relative overflow-hidden">
                     <div className="absolute -right-10 -top-10 opacity-5 text-lime-400"><CheckCircle2 size={200}/></div>
                     <div className="flex items-center relative z-10">
                        <div className="w-16 h-16 rounded-2xl bg-lime-400/20 flex items-center justify-center text-lime-400 mr-6 border border-lime-400/50">
                            <CheckCircle2 size={32} />
                        </div>
                        <div>
                            <h4 className="font-black text-lime-400 uppercase tracking-tighter text-2xl">All Systems Nominal</h4>
                            <p className="text-lime-200/60 text-sm mt-2 font-medium">
                                Gym floor telemetry indicates all hardware is operating within safe mechanical thresholds.
                            </p>
                        </div>
                     </div>
                </div>
            )}
          </div>

          {/* Registration Form */}
          <div className="lg:col-span-4 bg-zinc-900/80 border border-white/5 rounded-[2.5rem] p-8 shadow-2xl backdrop-blur-xl">
             <h3 className="font-black text-lg mb-6 flex items-center uppercase tracking-tighter">
                <Wrench className="mr-3 text-lime-400" size={20} /> Register Asset
             </h3>
             <form onSubmit={handleAddEquipment} className="space-y-4">
                 <input 
                    placeholder="Machine Name (e.g. Leg Press V2)" 
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-black border border-white/10 rounded-xl p-4 text-sm outline-none focus:border-lime-400 transition-colors placeholder:text-zinc-600 font-bold" 
                 />
                 <input 
                    type="number" placeholder="Service Threshold (Hours)" 
                    value={formData.limit} onChange={e => setFormData({...formData, limit: e.target.value})}
                    className="w-full bg-black border border-white/10 rounded-xl p-4 text-sm outline-none focus:border-lime-400 transition-colors placeholder:text-zinc-600 font-bold" 
                 />
                 <button 
                    type="submit" disabled={isSubmitting}
                    className="w-full bg-white text-black font-black py-4 rounded-xl hover:bg-lime-400 transition-all uppercase text-[10px] tracking-widest flex items-center justify-center mt-2"
                 >
                    {isSubmitting ? <Loader2 className="animate-spin mr-2" size={16}/> : <Plus size={16} className="mr-2"/>} Add Asset to DB
                 </button>
             </form>
          </div>

      </div>

      [Image of a modern dark-themed industrial equipment health monitoring dashboard showing real-time usage bars]

      {/* ASSET GRID */}
      <h3 className="text-xl font-black uppercase tracking-tighter text-white pt-4">Deployed Hardware Array</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {equipment.map(machine => (
          <MachineHealthCard 
            key={machine.id} 
            machine={machine} 
            onService={() => handleService(machine.id)}
            onUse={() => handleAddUsage(machine.id)}
          />
        ))}
        {equipment.length === 0 && <p className="text-zinc-500 text-sm col-span-3">No hardware assets registered.</p>}
      </div>
    </div>
  );
}

// Internal Component for machine cards
function MachineHealthCard({ machine, onService, onUse }) {
  const usagePercent = (machine.usage_hours / machine.limit) * 100;
  const isWarning = usagePercent > 70 && usagePercent <= 90;
  const isCritical = usagePercent > 90;

  return (
    <div className={`bg-zinc-950/80 border ${isCritical ? 'border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.1)]' : isWarning ? 'border-yellow-500/50' : 'border-white/5'} p-8 rounded-[2rem] relative group hover:bg-zinc-900 transition-all overflow-hidden flex flex-col justify-between`}>
      <div>
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-xl font-bold tracking-tight text-white mb-1">{machine.name}</h3>
              <p className="text-zinc-500 text-[9px] font-black uppercase tracking-[0.2em]">ID: TATH_MACH_00{machine.id}</p>
            </div>
            <div className={`px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border 
              ${isCritical ? 'border-red-500/30 text-red-500 bg-red-500/10' : 
                isWarning ? 'border-yellow-500/30 text-yellow-500 bg-yellow-500/10' : 
                'border-lime-400/30 text-lime-400 bg-lime-400/10'}`}>
              {machine.status}
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex justify-between text-[10px] font-black uppercase text-zinc-500 tracking-widest">
              <span>Telemetry (Active Hours)</span>
              <span className={isCritical ? 'text-red-500' : isWarning ? 'text-yellow-500' : 'text-white'}>
                {machine.usage_hours} / {machine.limit}h
              </span>
            </div>
            
            <div className="w-full h-2 bg-black rounded-full border border-white/5 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-1000 
                  ${isCritical ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)]' : 
                    isWarning ? 'bg-yellow-500' : 
                    'bg-lime-400'}`}
                style={{ width: `${Math.min(usagePercent, 100)}%` }}
              ></div>
            </div>
          </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-auto">
        <button 
          onClick={onUse}
          className="py-3 bg-zinc-900 border border-white/5 hover:border-white/20 rounded-xl text-[9px] font-black text-zinc-400 uppercase tracking-widest transition-all flex items-center justify-center hover:text-white active:scale-95"
        >
          <Activity size={12} className="mr-2 text-blue-400" /> Log Usage
        </button>
        <button 
          onClick={onService}
          disabled={!isCritical && !isWarning}
          className="py-3 bg-lime-400/10 border border-lime-400/20 hover:bg-lime-400 hover:text-black rounded-xl text-[9px] font-black text-lime-400 uppercase tracking-widest transition-all flex items-center justify-center disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-lime-400 disabled:cursor-not-allowed"
        >
          <RotateCcw size={12} className="mr-2" /> Reset Service
        </button>
      </div>
    </div>
  );
}