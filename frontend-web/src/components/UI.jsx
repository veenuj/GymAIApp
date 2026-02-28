import React from 'react';
import { Dumbbell } from 'lucide-react';

export function SidebarLink({ active, onClick, icon, label }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center p-4 rounded-2xl transition-all relative group ${active ? 'text-lime-400 font-bold bg-white/5' : 'text-zinc-500 hover:text-zinc-200'}`}>
      <span className="relative z-10 mr-4 group-hover:scale-110 transition-transform">{icon}</span>
      <span className="relative z-10 font-bold uppercase text-[10px] tracking-widest">{label}</span>
      {active && <div className="absolute right-4 w-1 h-1 bg-lime-400 rounded-full shadow-[0_0_10px_#a3e635]"></div>}
    </button>
  );
}

export function InputField({ label, icon, value, placeholder, onChange }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-zinc-500 uppercase ml-1 flex items-center">{icon} <span className="ml-2 tracking-widest">{label}</span></label>
      <input type="text" value={value} onChange={e => onChange(e.target.value)} className="w-full bg-black border border-white/10 rounded-2xl p-4 focus:border-lime-400 outline-none transition-all text-white text-sm" placeholder={placeholder} />
    </div>
  );
}

export function StatSummary({ label, value, color }) {
  return (
    <div className="bg-zinc-900/50 p-6 rounded-[1.5rem] border border-white/5">
      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">{label}</p>
      <p className={`text-4xl font-black ${color}`}>{value}</p>
    </div>
  );
}