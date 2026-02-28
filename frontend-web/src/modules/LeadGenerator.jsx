import React, { useState, useEffect } from 'react'; 
import { Zap, Instagram, MessageSquare, Target, Sparkles, Send, Loader2 } from 'lucide-react';

export default function LeadGenerator({ onCampaignSuccess }) {
  // --- 1. STATE MANAGEMENT ---
  const [area, setArea] = useState('Kankerkhera, Meerut'); // Default updated
  const [goal, setGoal] = useState('Weight Loss'); 
  const [platform, setPlatform] = useState('Instagram');
  const [adCopy, setAdCopy] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);

  // --- 2. EFFECT HOOK ---
  useEffect(() => {
    console.log(`Growth Engine targeting initialized for: ${area}`);
  }, [area, adCopy, isGenerating]);

  // --- 3. LOGIC FUNCTIONS ---
  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('http://localhost:8005/api/generate-ad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ area, goal, platform })
      });
      const data = await res.json();
      setAdCopy(data.ad_copy);
    } catch (e) { 
      console.error("AI Error:", e);
      setAdCopy("Error connecting to AI Marketer. Check backend.");
    }
    setIsGenerating(false);
  };

  const handleLaunch = async () => {
    setIsLaunching(true);
    try {
      const res = await fetch(`http://localhost:8005/api/launch-campaign?area=${area}`, { method: 'POST' });
      const data = await res.json();
      alert(data.message);
      if (onCampaignSuccess) onCampaignSuccess(); // Refresh global leads
    } catch (e) { console.error("Launch Error:", e); }
    setIsLaunching(false);
  };

  return (
    <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-12 gap-10">
      
      {/* 1. CAMPAIGN CONFIGURATION */}
      <div className="lg:col-span-5 space-y-8">
        <div className="bg-zinc-900/50 border border-white/5 p-10 rounded-[3rem] shadow-2xl backdrop-blur-md">
            <h3 className="text-2xl font-black text-white mb-8 flex items-center">
                <Target className="text-lime-400 mr-3" /> Growth Engine
            </h3>
            
            <div className="space-y-6">
                {/* UPATED: Hyper-local Location Selector */}
                <div>
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 block text-white">Target Location</label>
                    <select value={area} onChange={(e) => setArea(e.target.value)} className="w-full bg-black border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-lime-400 appearance-none cursor-pointer">
                        <option value="Kankerkhera, Meerut">Kankerkhera, Meerut</option>
                        <option value="Saket, Meerut">Saket, Meerut</option>
                        <option value="Pallavpuram, Meerut">Pallavpuram, Meerut</option>
                        <option value="Railway Road, Deoband">Railway Road, Deoband</option>
                        <option value="GT Road, Modinagar">GT Road, Modinagar</option>
                    </select>
                </div>

                {/* Marketing Goal Selector */}
                <div>
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 block text-white">Ad Focus / Goal</label>
                    <select value={goal} onChange={(e) => setGoal(e.target.value)} className="w-full bg-black border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-lime-400 appearance-none cursor-pointer text-white">
                        <option value="Weight Loss">🔥 Weight Loss Transformation</option>
                        <option value="Muscle Gain">💪 Strength & Muscle Building</option>
                        <option value="Yoga & Mobility">🧘 Yoga & Holistic Health</option>
                        <option value="General Fitness">⚡ Community Fitness</option>
                    </select>
                </div>

                {/* Platform Toggle */}
                <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => setPlatform('Instagram')} className={`p-4 rounded-2xl border transition-all flex items-center justify-center gap-2 ${platform === 'Instagram' ? 'bg-pink-500/10 border-pink-500 text-white' : 'bg-black border-white/5 text-zinc-500 hover:text-zinc-300'}`}>
                        <Instagram size={18} /> Instagram
                    </button>
                    <button onClick={() => setPlatform('WhatsApp')} className={`p-4 rounded-2xl border transition-all flex items-center justify-center gap-2 ${platform === 'WhatsApp' ? 'bg-emerald-500/10 border-emerald-500 text-white' : 'bg-black border-white/5 text-zinc-500 hover:text-zinc-300'}`}>
                        <MessageSquare size={18} /> WhatsApp
                    </button>
                </div>

                <button 
                    onClick={handleGenerate} 
                    disabled={isGenerating}
                    className="w-full bg-white text-black font-black py-5 rounded-2xl hover:bg-lime-400 transition-all uppercase text-xs tracking-widest flex items-center justify-center shadow-xl shadow-white/5"
                >
                    {isGenerating ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2" size={16}/>}
                    {isGenerating ? 'AI Writing...' : 'Generate AI Campaign Copy'}
                </button>
            </div>
        </div>

        {isLaunching && (
            <div className="bg-lime-400/10 border border-lime-400/20 p-6 rounded-3xl animate-pulse text-white">
                <p className="text-lime-400 text-center font-black text-[10px] uppercase tracking-widest">Injecting localized {goal} ads into {area} feeds...</p>
            </div>
        )}
      </div>

      {/* 2. AD PREVIEW PANEL */}
      <div className="lg:col-span-7">
        <div className="bg-zinc-900 border border-white/5 rounded-[3.5rem] p-12 h-full relative overflow-hidden flex flex-col items-center shadow-2xl">
            <h4 className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mb-10">Real-time Ad Creative Preview</h4>
            
            {/* Phone Mockup */}
            <div className="w-[300px] aspect-[9/18] bg-[#000] rounded-[3rem] border-[10px] border-zinc-800 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden flex flex-col">
                <div className="p-4 border-b border-white/5 flex items-center justify-between bg-zinc-900 text-white">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-lime-400 to-emerald-500"></div>
                        <span className="text-[10px] font-black">Tathastu_Fit</span>
                    </div>
                    {platform === 'Instagram' ? <Instagram size={14} className="text-zinc-500" /> : <MessageSquare size={14} className="text-emerald-500" />}
                </div>
                
                <div className="flex-1 bg-zinc-900 relative flex items-center justify-center p-6">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80')] bg-cover"></div>
                    <div className="relative z-10 bg-black/60 backdrop-blur-xl p-5 rounded-2xl border border-white/10 shadow-2xl">
                        <p className="text-zinc-100 text-[10px] leading-relaxed italic font-medium">
                            {adCopy || "Configure your campaign on the left to see the AI magic here..."}
                        </p>
                    </div>
                </div>

                <div className="p-4 bg-lime-400 text-black text-center font-black text-[10px] uppercase tracking-widest">
                    {platform === 'Instagram' ? 'Learn More' : 'Message on WhatsApp'}
                </div>
            </div>

            <button 
                onClick={handleLaunch}
                disabled={!adCopy || isLaunching}
                className="mt-12 bg-lime-400 text-black font-black px-12 py-5 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-lime-400/20 uppercase text-[10px] tracking-widest flex items-center disabled:opacity-30 disabled:hover:scale-100"
            >
                <Send size={16} className="mr-2" /> Activate {area} Campaign
            </button>
        </div>
      </div>
    </div>
  );
}