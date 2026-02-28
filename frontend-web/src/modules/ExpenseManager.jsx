import React, { useState, useEffect, useCallback } from 'react';
import { Receipt, Zap, Droplet, Megaphone, Home, Wrench, Plus, Loader2, TrendingDown } from 'lucide-react';

export default function ExpenseManager({ onRefresh }) {
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ category: 'Electricity', amount: '', description: '' });

  // 1. Wrap the fetch function in useCallback to stabilize it
  const fetchExpenses = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:8005/api/finance');
      const data = await res.json();
      // Reverse to show newest first
      setExpenses(data.expenses.reverse());
    } catch (err) { 
        console.error("Expense fetch error:", err); 
    } finally {
        setIsLoading(false);
    }
  }, []);

  // 2. Safely call it inside useEffect and pass it as a dependency
  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const handleLogExpense = async (e) => {
    e.preventDefault();
    if (!formData.amount) return alert("Please enter an amount.");
    
    setIsSubmitting(true);
    try {
      // We attach the description to the category name so it shows in the ledger
      const finalCategory = formData.description 
        ? `${formData.category} - ${formData.description}` 
        : formData.category;

      await fetch('http://localhost:8005/api/expense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            category: finalCategory,
            amount: parseFloat(formData.amount)
        })
      });
      
      setFormData({ category: 'Electricity', amount: '', description: '' }); // Fixed to keep default category
      await fetchExpenses();
      if (onRefresh) onRefresh(); // Refresh the main Finance Dashboard
    } catch (err) { console.error(err); }
    setIsSubmitting(false);
  };

  const totalBurn = expenses.reduce((acc, exp) => acc + exp.amount, 0);

  // Helper function to pick the right icon based on the category string
  const getCategoryIcon = (categoryStr) => {
      const lower = categoryStr.toLowerCase();
      if (lower.includes('electric') || lower.includes('power')) return <Zap size={16} className="text-yellow-400" />;
      if (lower.includes('water')) return <Droplet size={16} className="text-blue-400" />;
      if (lower.includes('marketing') || lower.includes('ad')) return <Megaphone size={16} className="text-pink-400" />;
      if (lower.includes('rent') || lower.includes('lease')) return <Home size={16} className="text-emerald-400" />;
      if (lower.includes('service') || lower.includes('maintenance')) return <Wrench size={16} className="text-zinc-400" />;
      return <Receipt size={16} className="text-white" />;
  };

  return (
    <div className="animate-fade-in space-y-8 text-white h-full flex flex-col">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT: LOG NEW EXPENSE */}
        <div className="lg:col-span-5 bg-zinc-950/80 border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-xl shadow-2xl flex flex-col">
             <h3 className="font-black text-lg mb-6 flex items-center uppercase tracking-tighter text-white border-b border-white/5 pb-4">
                <Receipt className="mr-3 text-lime-400" size={20} /> Log Operational Expense
             </h3>
             <form onSubmit={handleLogExpense} className="space-y-5 flex-1 flex flex-col">
                 
                 <div>
                     <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">Expense Category</label>
                     <div className="relative">
                         <select 
                            value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                            className="w-full bg-black border border-white/10 rounded-xl p-4 text-sm outline-none focus:border-lime-400 text-white appearance-none cursor-pointer"
                         >
                             <option value="Electricity">Electricity & Power</option>
                             <option value="Rent">Facility Rent</option>
                             <option value="Water">Water & Utilities</option>
                             <option value="Marketing">Marketing & Ads</option>
                             <option value="Maintenance">Equipment Maintenance</option>
                             <option value="Misc">Miscellaneous / Other</option>
                         </select>
                         <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">▼</div>
                     </div>
                 </div>

                 <div>
                     <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">Amount (₹)</label>
                     <input 
                        type="number" placeholder="e.g. 15000" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})}
                        className="w-full bg-black border border-white/10 rounded-xl p-4 text-xl font-black tracking-tighter outline-none focus:border-red-500 transition-colors text-white" 
                     />
                 </div>

                 <div>
                     <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">Note / Invoice # (Optional)</label>
                     <input 
                        type="text" placeholder="e.g. Bill for May 2026" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                        className="w-full bg-black border border-white/10 rounded-xl p-4 text-sm outline-none focus:border-lime-400 transition-colors text-white" 
                     />
                 </div>

                 <button type="submit" disabled={isSubmitting} className="w-full bg-red-500 text-white font-black py-5 rounded-xl hover:bg-red-600 active:scale-95 transition-all uppercase text-[10px] tracking-widest flex items-center justify-center mt-auto shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                    {isSubmitting ? <Loader2 className="animate-spin mr-2" size={16}/> : <Plus size={16} className="mr-2"/>} Deduct from Ledger
                 </button>
             </form>
        </div>

        

        {/* RIGHT: EXPENSE LEDGER & KPI */}
        <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* KPI Card */}
            <div className="bg-zinc-900 border border-white/5 p-8 rounded-[2.5rem] flex items-center justify-between shadow-xl relative overflow-hidden">
                <div className="absolute -right-6 -top-6 opacity-5"><TrendingDown size={150} /></div>
                <div className="relative z-10">
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Total Operational Burn (YTD)</p>
                    <p className="text-4xl font-black text-white tracking-tighter">₹{totalBurn.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-red-500/10 rounded-2xl border border-red-500/20 relative z-10">
                    <TrendingDown size={28} className="text-red-500" />
                </div>
            </div>

            {/* Ledger List */}
            <div className="bg-zinc-950/80 border border-white/5 rounded-[2.5rem] p-8 flex-1 backdrop-blur-xl shadow-2xl flex flex-col overflow-hidden">
                <h3 className="font-black text-sm uppercase tracking-widest text-zinc-400 mb-6">Recent Expense Ledger</h3>
                
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin text-zinc-600" size={30}/></div>
                    ) : expenses.length === 0 ? (
                        <p className="text-zinc-600 text-sm italic text-center mt-10">No expenses logged yet.</p>
                    ) : (
                        expenses.map((exp, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 bg-black/40 border border-white/5 rounded-2xl hover:bg-zinc-900 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-zinc-900 rounded-xl border border-white/5">
                                        {getCategoryIcon(exp.category)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white leading-tight">{exp.category.split(' - ')[0]}</p>
                                        <p className="text-[10px] text-zinc-500 font-medium mt-0.5 max-w-[200px] truncate">
                                            {exp.category.split(' - ')[1] || 'Automated Entry'}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-base font-black text-white tracking-tighter">-₹{exp.amount.toLocaleString()}</p>
                                    <p className="text-[8px] font-black uppercase tracking-widest text-red-500 mt-1">Deducted</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}