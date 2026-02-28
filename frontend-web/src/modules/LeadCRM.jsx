import React, { useState, useEffect } from 'react';
import { 
  Magnet, MapPin, Phone, UserPlus, Users, BellRing, 
  Scale, Ruler, Home, Check, Crown, Star, Zap, X, CreditCard, 
  Loader2, Mail, RefreshCw, Instagram, Globe, Facebook, 
  QrCode, Wallet, Banknote 
} from 'lucide-react';
import { InputField } from '../components/UI';

export default function LeadCRM({ leads, formData, setFormData, onAddMember, onRefreshLeads }) {
  // --- 1. STATE MANAGEMENT ---
  const [step, setStep] = useState('form'); 
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [customPrice, setCustomPrice] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi'); 
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // --- 2. DYNAMIC SUBSCRIPTION PLANS ---
  const plans = [
    { id: '1m', name: '1 Month Standard', price: 1500, duration: 1, features: ['Gym Access', 'Locker', 'Mobile App'], icon: <Users size={20}/> },
    { id: '3m', name: '3 Months Pro', price: 4000, duration: 3, features: ['Standard + AI Protocols', 'Progress Tracking'], icon: <Star size={20} className="text-lime-400" />, popular: true },
    { id: '6m', name: '6 Months Elite', price: 7500, duration: 6, features: ['Pro + Personal Trainer', 'Monthly Analysis'], icon: <Zap size={20} className="text-yellow-500" /> },
    { id: '12m', name: '12 Months Legend', price: 13000, duration: 12, features: ['All Access', 'Free Supplements', 'Priority Support'], icon: <Crown size={20} className="text-orange-500" /> }
  ];

  // --- 3. LOGIC FUNCTIONS (Declared before useEffect to avoid access error) ---

  const getSourceIcon = (source) => {
    if (source?.toLowerCase().includes('instagram')) return <Instagram size={12} className="text-pink-500" />;
    if (source?.toLowerCase().includes('facebook')) return <Facebook size={12} className="text-blue-500" />;
    return <Globe size={12} className="text-emerald-500" />;
  };

  const handleSyncLeads = async () => {
    setIsSyncing(true);
    if (onRefreshLeads) await onRefreshLeads(); 
    setTimeout(() => setIsSyncing(false), 800);
  };

  const handleInitialSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.mobile || !formData.email) return alert("Fill Identity details first.");
    setStep('plan');
  };

  const calculateExpiryDate = (months) => {
    const d = new Date();
    d.setMonth(d.getMonth() + months);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    // Auto-update the subscription end date based on duration
    if (plan) {
        const expiry = calculateExpiryDate(plan.duration);
        setFormData(prev => ({ ...prev, sub_expiry: expiry }));
    }
    setStep('payment');
  };

  const handleFinalExecute = async () => {
    setIsVerifying(true);
    setTimeout(() => {
        const finalData = { 
            ...formData, 
            plan_name: selectedPlan?.name || 'Custom Plan', 
            amount_paid: selectedPlan ? selectedPlan.price : customPrice,
            payment_method: paymentMethod,
            status: 'Active' 
        };
        onAddMember(finalData);
        setStep('form');
        setSelectedPlan(null);
        setIsVerifying(false);
    }, 2000);
  };

  // --- 4. AUTO-SYNC EFFECT ---
  useEffect(() => {
    handleSyncLeads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  return (
    <div className="relative">
      {/* STEP 1: FORM VIEW */}
      <div className={`animate-fade-in space-y-12 ${(step === 'plan' || step === 'payment') ? 'blur-md pointer-events-none' : ''}`}>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
          <div className="xl:col-span-1 bg-zinc-900/50 border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-sm relative overflow-hidden">
             <div className="flex justify-between items-center mb-8 relative z-10 text-white">
                <h3 className="text-xl font-bold flex items-center"><Magnet size={20} className="text-lime-400 mr-2" /> Live Leads</h3>
                <button onClick={handleSyncLeads} className={`p-2 rounded-xl bg-white/5 text-zinc-400 hover:text-lime-400 ${isSyncing ? 'animate-spin' : ''}`}><RefreshCw size={16} /></button>
            </div>
            <div className="space-y-4 relative z-10 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar text-white">
              {leads.map(lead => (
                <div key={lead.id} className="p-5 bg-black/40 border border-white/5 rounded-2xl group hover:border-lime-400/30 transition-all cursor-pointer" onClick={() => setFormData({...formData, name: lead.name, mobile: lead.phone})}>
                  <div className="flex justify-between items-start"><h4 className="font-bold">{lead.name}</h4>{getSourceIcon(lead.source)}</div>
                  <p className="text-zinc-500 text-[10px] mt-2 font-medium">From {lead.area}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="xl:col-span-2 bg-zinc-900 border border-white/5 rounded-[3rem] p-12 shadow-2xl relative overflow-hidden text-white">
            <h3 className="text-2xl font-black mb-10 uppercase tracking-tighter">New Member Registration</h3>
            <form onSubmit={handleInitialSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
              <InputField label="Name" icon={<Users size={14}/>} value={formData.name} placeholder="Rahul Sharma" onChange={v => setFormData({...formData, name: v})} />
              <InputField label="Mobile" icon={<Phone size={14}/>} value={formData.mobile} placeholder="+91 99xxx xxxxx" onChange={v => setFormData({...formData, mobile: v})} />
              <InputField label="Email" icon={<Mail size={14}/>} value={formData.email} placeholder="rahul@example.com" onChange={v => setFormData({...formData, email: v})} />
              <InputField label="Manual Sub End (Optional)" icon={<BellRing size={14}/>} value={formData.sub_expiry} placeholder="Auto-calculated on plan" onChange={v => setFormData({...formData, sub_expiry: v})} />
              <div className="grid grid-cols-2 gap-4">
                 <InputField label="Weight (kg)" icon={<Scale size={14}/>} value={formData.weight} placeholder="85" onChange={v => setFormData({...formData, weight: v})} />
                 <InputField label="Height (cm)" icon={<Ruler size={14}/>} value={formData.height} placeholder="178" onChange={v => setFormData({...formData, height: v})} />
              </div>
              <InputField label="Address" icon={<Home size={14}/>} value={formData.address} placeholder="Saket, Meerut" onChange={v => setFormData({...formData, address: v})} />
              <div className="md:col-span-2 mt-6"><button type="submit" className="w-full bg-lime-400 text-black font-black py-5 rounded-2xl hover:bg-white transition-all uppercase text-xs tracking-widest shadow-xl shadow-lime-400/20">Select Performance Plan</button></div>
            </form>
          </div>
        </div>
      </div>

      {/* STEP 2: PLAN SELECTION OVERLAY */}
      {step === 'plan' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl">
          <div className="max-w-6xl w-full animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-end mb-10 text-white">
               <div><h2 className="text-4xl font-black uppercase italic tracking-tighter">Subscription Length for <span className="text-lime-400">{formData.name}</span></h2></div>
               <button onClick={() => setStep('form')} className="p-3 bg-zinc-900 rounded-full text-zinc-500 hover:text-white transition-colors"><X size={20}/></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {plans.map(plan => (
                <div key={plan.id} onClick={() => handlePlanSelect(plan)} className={`bg-zinc-900 border ${plan.popular ? 'border-lime-400 shadow-[0_0_50px_rgba(163,230,53,0.15)]' : 'border-white/5'} p-8 rounded-[2.5rem] cursor-pointer hover:scale-105 transition-all group relative text-white`}>
                  <div className="mb-6 bg-black w-12 h-12 rounded-2xl flex items-center justify-center border border-white/5">{plan.icon}</div>
                  <h4 className="text-lg font-bold mb-2 leading-tight">{plan.name}</h4>
                  <p className="text-3xl font-black text-white mb-6">₹{plan.price}</p>
                  <ul className="space-y-3 mb-8">{plan.features.map((f, i) => (<li key={i} className="text-[10px] text-zinc-400 flex items-center font-medium"><Check size={12} className="text-lime-400 mr-2" /> {f}</li>))}</ul>
                  <div className="w-full py-4 bg-white/5 group-hover:bg-lime-400 group-hover:text-black rounded-xl text-[10px] font-black uppercase text-center transition-all">Select Tier</div>
                </div>
              ))}
              <div className="bg-zinc-900/50 border border-dashed border-white/10 p-8 rounded-[2.5rem] flex flex-col justify-center text-center group hover:border-lime-400 transition-all text-white">
                  <Zap size={30} className="mx-auto mb-4 text-zinc-700 group-hover:text-lime-400" />
                  <h4 className="text-white font-bold mb-4 text-sm">Custom</h4>
                  <input type="number" placeholder="Price" value={customPrice} onChange={(e) => setCustomPrice(e.target.value)} className="bg-black border border-white/10 rounded-xl p-4 text-center text-white mb-4 outline-none focus:border-lime-400" />
                  <button disabled={!customPrice} onClick={() => handlePlanSelect(null)} className="w-full py-4 bg-zinc-800 text-zinc-400 rounded-xl text-[10px] font-black uppercase hover:bg-white hover:text-black transition-all">Launch</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: PAYMENT GATEWAY (QR/UPI/CARD) */}
      {step === 'payment' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-3xl animate-in fade-in duration-500">
          <div className="bg-zinc-950 border border-white/10 w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 rounded-[3.5rem] overflow-hidden shadow-[0_0_100px_rgba(163,230,53,0.1)]">
            
            <div className="p-12 bg-zinc-900/50 border-r border-white/5 text-white">
                <div className="flex items-center gap-2 mb-8"><div className="w-2 h-2 bg-lime-400 rounded-full animate-pulse"></div><span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Billing Engine</span></div>
                <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">Checkout</h3>
                <p className="text-zinc-500 text-sm mb-10">Client: {formData.name}</p>
                
                <div className="space-y-6">
                    <div className="flex justify-between border-b border-white/5 pb-4"><span className="text-zinc-500 text-xs uppercase font-bold">Plan Duration</span><span className="text-white font-black">{selectedPlan?.name || 'Custom'}</span></div>
                    <div className="flex justify-between border-b border-white/5 pb-4"><span className="text-zinc-500 text-xs uppercase font-bold">Sub Ends On</span><span className="text-lime-400 font-bold">{formData.sub_expiry}</span></div>
                    <div className="flex justify-between pt-4"><span className="text-lime-400 text-sm uppercase font-black tracking-widest">Amount Due</span><span className="text-4xl font-black text-white tracking-tighter">₹{selectedPlan ? selectedPlan.price : customPrice}</span></div>
                </div>
            </div>

            <div className="p-12 flex flex-col justify-between text-white">
                <div>
                    <h4 className="text-white font-black uppercase text-xs tracking-widest mb-6">Payment Source</h4>
                    <div className="grid grid-cols-3 gap-4 mb-10">
                        <PaymentTab active={paymentMethod === 'upi'} onClick={() => setPaymentMethod('upi')} icon={<QrCode size={18}/>} label="UPI" />
                        <PaymentTab active={paymentMethod === 'card'} onClick={() => setPaymentMethod('card')} icon={<CreditCard size={18}/>} label="Card" />
                        <PaymentTab active={paymentMethod === 'cash'} onClick={() => setPaymentMethod('cash')} icon={<Banknote size={18}/>} label="Cash" />
                    </div>

                    <div className="min-h-[220px] flex flex-col items-center justify-center bg-black/40 rounded-3xl border border-white/5 p-8 relative overflow-hidden">
                        {paymentMethod === 'upi' && (
                            <div className="text-center animate-in zoom-in-90 duration-300">
                                <div className="bg-white p-3 rounded-2xl inline-block mb-4 relative">
                                    <QrCode size={110} className="text-black" />
                                    <div className="absolute inset-0 bg-lime-400/20 animate-pulse rounded-2xl pointer-events-none"></div>
                                </div>
                                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Pay ₹{selectedPlan ? selectedPlan.price : customPrice} via UPI</p>
                            </div>
                        )}
                        {paymentMethod === 'card' && (
                            <div className="w-full space-y-4 animate-in slide-in-from-right-4">
                                <input disabled placeholder="Card Swiped Offline" className="w-full bg-zinc-900 border border-white/5 rounded-xl p-4 text-sm text-zinc-500 cursor-not-allowed" />
                            </div>
                        )}
                        {paymentMethod === 'cash' && (
                            <div className="text-center space-y-2">
                                <Banknote size={48} className="text-lime-400 mx-auto opacity-50" />
                                <p className="text-white font-bold uppercase tracking-widest text-xs text-white">Awaiting Physical Cash</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-4 mt-8">
                    <button onClick={handleFinalExecute} disabled={isVerifying} className="w-full bg-lime-400 text-black font-black py-6 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-lime-400/20 uppercase text-xs tracking-widest flex items-center justify-center">
                        {isVerifying ? <Loader2 className="animate-spin mr-2" size={20} /> : <Check size={18} className="mr-2" />}
                        {isVerifying ? 'Securing Transaction...' : 'Verify & Activate'}
                    </button>
                    <button onClick={() => setStep('plan')} className="w-full py-2 text-zinc-600 font-black text-[10px] uppercase tracking-[0.2em] hover:text-white transition-all">Go Back</button>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PaymentTab({ active, onClick, icon, label }) {
    return (
        <button onClick={onClick} className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${active ? 'bg-lime-400 border-lime-400 text-black shadow-lg shadow-lime-400/10' : 'bg-zinc-900/50 border-white/5 text-zinc-500 hover:border-zinc-700'}`}>
            {icon}
            <span className="text-[9px] font-black uppercase mt-2 tracking-widest">{label}</span>
        </button>
    );
}