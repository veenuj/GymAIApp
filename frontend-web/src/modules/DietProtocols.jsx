import React, { useState } from 'react';
import { Loader, Printer, ShieldCheck, Zap, User, Database, Activity, Sparkles, CheckCircle2, FileText } from 'lucide-react';

export default function DietProtocols({ 
  members, 
  dietName, setDietName, dietPrompt, setDietPrompt, onGenerate, isGenerating, dietOutput 
}) {
  const [isSynced, setIsSynced] = useState(false);

  // Auto-fill biometrics when a member is selected from the DB
  const handleClientSelect = (e) => {
    const selectedName = e.target.value;
    setDietName(selectedName);

    const clientData = members.find(m => m.name === selectedName);
    if (clientData) {
        setIsSynced(true);
        setDietPrompt(`[TARGET GOAL]\nFocus: (e.g., Fat Loss / Muscle Hypertrophy)\n\n[BIOMETRIC DATA]\nCurrent Weight: ${clientData.weight}kg\nCurrent Height: ${clientData.height}cm\n\n[RESTRICTIONS & PREFERENCES]\nAllergies: None reported\nDiet Type: (e.g., Veg / Non-Veg / Vegan)\nMeals per day: 4`);
        setTimeout(() => setIsSynced(false), 2000); // Pulse effect duration
    } else {
        setDietPrompt('');
        setIsSynced(false);
    }
  };

  return (
    <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-12 gap-10 h-full">
      
      {/* LEFT: MASTER PROFILER (INPUT) */}
      <div className="lg:col-span-4 space-y-6 print:hidden flex flex-col">
        <div className="bg-zinc-950/80 p-8 rounded-[2.5rem] border border-white/5 shadow-2xl backdrop-blur-xl relative overflow-hidden flex-1 flex flex-col">
          
          {/* Background Decorator */}
          <div className="absolute top-0 right-0 p-8 opacity-5 text-lime-400 pointer-events-none">
            <Database size={120} />
          </div>

          <div className="flex justify-between items-center mb-8 relative z-10">
              <h3 className="text-xs font-black text-lime-400 uppercase tracking-widest flex items-center bg-lime-400/10 px-4 py-2 rounded-full border border-lime-400/20">
                <User size={14} className="mr-2" /> Master Profiler
              </h3>
              {isSynced && <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest animate-pulse flex items-center"><CheckCircle2 size={12} className="mr-1"/> SQL Synced</span>}
          </div>
          
          <div className="space-y-6 relative z-10 flex-1 flex flex-col">
            {/* Real Database Dropdown */}
            <div>
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 block">Target Client</label>
                <div className="relative group">
                    <select 
                        value={dietName} 
                        onChange={handleClientSelect} 
                        className="w-full bg-black border border-white/10 rounded-2xl p-4 outline-none focus:border-lime-400 transition-all text-white text-sm appearance-none cursor-pointer group-hover:border-white/20" 
                    >
                        <option value="" className="text-zinc-600">Select Registered Client...</option>
                        {members && members.map(m => (
                            <option key={m.id} value={m.name} className="text-white bg-zinc-900">{m.name} (ID: TATH_0{m.id})</option>
                        ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500 group-hover:text-lime-400 transition-colors">▼</div>
                </div>
            </div>

            {/* AI Prompt Window */}
            <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-end mb-3">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">Hyper-Parameters</label>
                    <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">RAG Engine Active</span>
                </div>
                <textarea 
                  value={dietPrompt} 
                  onChange={(e) => setDietPrompt(e.target.value)} 
                  className={`w-full bg-black border ${isSynced ? 'border-lime-400/50 shadow-[0_0_20px_rgba(163,230,53,0.1)]' : 'border-white/10'} rounded-2xl p-5 flex-1 min-h-[250px] outline-none focus:border-lime-400 transition-all resize-none text-zinc-300 text-sm leading-relaxed font-mono`} 
                  placeholder="Select a client to auto-fill biometrics, or manually input parameters here..."
                ></textarea>
            </div>
            
            <button 
              onClick={onGenerate} 
              disabled={isGenerating || !dietName} 
              className="w-full bg-lime-400 text-black font-black py-5 rounded-2xl shadow-[0_0_30px_rgba(163,230,53,0.15)] hover:scale-[1.02] active:scale-95 transition-all text-[11px] uppercase tracking-widest disabled:opacity-30 disabled:hover:scale-100 disabled:cursor-not-allowed flex items-center justify-center overflow-hidden relative group"
            >
              <div className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
              {isGenerating ? <Loader className="animate-spin mr-2" size={18}/> : <Sparkles className="mr-2" size={18}/>}
              {isGenerating ? 'Synthesizing Protocol...' : 'Generate Elite Protocol'}
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT: DIGITAL REPORT (OUTPUT) */}
      <div className="lg:col-span-8 h-full flex flex-col">
        <div className="bg-zinc-950 rounded-[3rem] border border-white/5 p-12 shadow-2xl print:bg-white print:text-black print:p-8 print:border-none print:shadow-none relative overflow-hidden flex-1 flex flex-col">
          
          {/* Header Area */}
          <div className="flex justify-between items-center mb-10 pb-6 border-b border-white/5 print:border-black/10">
            <div className="flex items-center gap-4">
               <div className="p-3 bg-lime-400/10 rounded-xl print:hidden">
                   <ShieldCheck className="text-lime-400" size={24} />
               </div>
               <div>
                   <h2 className="text-2xl font-black text-white print:text-black tracking-tighter uppercase">Tathastu <span className="text-lime-400 print:text-zinc-500">Fit</span></h2>
                   <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mt-1">Official Nutrition Protocol</span>
               </div>
            </div>
            
            {dietOutput && (
              <div className="flex items-center gap-4">
                  <div className="text-right print:block hidden md:block">
                      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Client</p>
                      <p className="text-sm font-bold text-white print:text-black">{dietName}</p>
                  </div>
                  <button onClick={() => window.print()} className="p-4 bg-white/5 print:hidden hover:bg-lime-400 hover:text-black text-zinc-400 rounded-2xl transition-all shadow-lg hover:shadow-lime-400/20 group">
                    <Printer size={20} className="group-hover:scale-110 transition-transform" />
                  </button>
              </div>
            )}
          </div>
          
          {/* Content Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 print:overflow-visible">
            {dietOutput ? (
                <div className="whitespace-pre-wrap font-sans text-zinc-300 print:text-zinc-800 leading-relaxed text-sm md:text-base prose prose-invert print:prose-zinc max-w-none">
                    {/* Render AI Output here */}
                    {dietOutput}
                </div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-zinc-600 space-y-6 animate-pulse mt-20">
                    <div className="relative">
                        <FileText size={100} className="text-zinc-800/50" />
                        <Activity size={40} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-lime-400" />
                    </div>
                    <div className="text-center">
                        <p className="font-sans font-black tracking-[0.3em] uppercase text-zinc-500 text-xs">Awaiting Telemetry</p>
                        <p className="text-[10px] font-medium text-zinc-600 mt-2">Select a client profile to generate a bespoke nutritional matrix.</p>
                    </div>
                </div>
            )}
          </div>

          {/* Print Footer */}
          <div className="hidden print:block mt-12 pt-6 border-t border-black/10 text-center">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Tathastu ERP • AI Generated Protocol • strictly confidential</p>
          </div>

        </div>
      </div>
    </div>
  );
}