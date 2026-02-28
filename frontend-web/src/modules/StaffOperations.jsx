import React, { useState, useEffect, useCallback } from 'react';
import { Users, DollarSign, Plus, Loader2, ShieldAlert, CheckCircle2, Briefcase, Award } from 'lucide-react';

export default function StaffOperations({ onRefresh }) {
  const [staff, setStaff] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', role: 'Master Trainer', base_salary: '' });

  // Wrap the fetch function in useCallback so it's stable between renders
  const fetchStaff = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:8005/api/staff');
      const data = await res.json();
      setStaff(data.staff);
    } catch (err) { 
        console.error("Staff fetch error:", err); 
    } finally {
        setIsLoading(false);
    }
  }, []);

  // Now the effect only runs when the component mounts
  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const handleAddStaff = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.base_salary) return alert("Fill Name and Base Salary.");
    setIsSubmitting(true);
    try {
      await fetch('http://localhost:8005/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: formData.name,
            role: formData.role,
            base_salary: parseFloat(formData.base_salary)
        })
      });
      setFormData({ name: '', role: 'Master Trainer', base_salary: '' });
      await fetchStaff(); // Re-fetch the updated roster
    } catch (err) { console.error(err); }
    setIsSubmitting(false);
  };

  const handleExecutePayroll = async () => {
    if(!window.confirm("Execute monthly payroll? This will deduct the total amount from the Finance Engine and reset commissions.")) return;
    try {
        const res = await fetch('http://localhost:8005/api/staff/payroll', { method: 'POST' });
        const data = await res.json();
        alert(data.message);
        await fetchStaff(); // Re-fetch to see zeroed-out commissions
        if (onRefresh) onRefresh(); // Refresh global finances
    } catch (err) { console.error("Payroll Error:", err); }
  };

  const totalPayroll = staff.reduce((acc, emp) => acc + emp.base_salary + emp.pt_commissions, 0);

  return (
    <div className="animate-fade-in space-y-8 text-white h-full flex flex-col">
      
      {/* TOP ROW: KPI & PAYROLL EXECUTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Payroll Command */}
        <div className="lg:col-span-8 bg-lime-400 p-10 rounded-[2.5rem] relative overflow-hidden shadow-[0_0_50px_rgba(163,230,53,0.2)] text-black flex flex-col justify-center">
            <div className="absolute right-0 top-0 p-8 opacity-10"><DollarSign size={150} /></div>
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-80 flex items-center">
                        <ShieldAlert size={14} className="mr-2" /> Pending Payroll Liability
                    </p>
                    <p className="text-5xl font-black tracking-tighter">₹{totalPayroll.toLocaleString()}</p>
                    <p className="text-sm font-bold mt-2 opacity-80">{staff.length} Active Employees</p>
                </div>
                <button 
                    onClick={handleExecutePayroll}
                    disabled={staff.length === 0}
                    className="mt-6 md:mt-0 bg-black text-lime-400 px-8 py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl disabled:opacity-50 flex items-center"
                >
                    Execute Automated Payroll
                </button>
            </div>
        </div>

        {/* Onboarding Form */}
        <div className="lg:col-span-4 bg-zinc-950/80 border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-xl shadow-2xl">
             <h3 className="font-black text-lg mb-6 flex items-center uppercase tracking-tighter text-white">
                <Users className="mr-3 text-lime-400" size={20} /> Hire Personnel
             </h3>
             <form onSubmit={handleAddStaff} className="space-y-4">
                 <input 
                    placeholder="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-black border border-white/10 rounded-xl p-4 text-sm outline-none focus:border-lime-400 transition-colors text-white" 
                 />
                 <select 
                    value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}
                    className="w-full bg-black border border-white/10 rounded-xl p-4 text-sm outline-none focus:border-lime-400 text-white appearance-none cursor-pointer"
                 >
                     <option>Master Trainer</option>
                     <option>Floor Coach</option>
                     <option>Front Desk Manager</option>
                     <option>Maintenance Tech</option>
                 </select>
                 <input 
                    type="number" placeholder="Monthly Base Salary (₹)" value={formData.base_salary} onChange={e => setFormData({...formData, base_salary: e.target.value})}
                    className="w-full bg-black border border-white/10 rounded-xl p-4 text-sm outline-none focus:border-lime-400 transition-colors text-white" 
                 />
                 <button type="submit" disabled={isSubmitting} className="w-full bg-white text-black font-black py-4 rounded-xl hover:bg-lime-400 transition-all uppercase text-[10px] tracking-widest flex items-center justify-center mt-2">
                    {isSubmitting ? <Loader2 className="animate-spin mr-2" size={16}/> : <Plus size={16} className="mr-2"/>} Add to Roster
                 </button>
             </form>
        </div>
      </div>

      

      {/* STAFF ROSTER GRID */}
      <div className="flex-1">
        <h3 className="text-xl font-black uppercase tracking-tighter text-white mb-6 flex items-center">
            <Briefcase className="mr-3 text-zinc-500" size={24}/> Deployed Roster
        </h3>
        {isLoading ? (
            <div className="flex items-center justify-center h-40"><Loader2 className="animate-spin text-lime-400" size={40}/></div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {staff.map(emp => (
                    <div key={emp.id} className="bg-zinc-950/80 border border-white/5 p-8 rounded-[2rem] hover:border-white/20 transition-all group flex flex-col relative overflow-hidden shadow-xl">
                        {emp.role.includes('Trainer') && <div className="absolute -right-4 -top-4 opacity-5 text-white group-hover:text-lime-400 transition-colors"><Award size={100}/></div>}
                        
                        <div className="flex justify-between items-start mb-6 relative z-10">
                            <div>
                                <h4 className="text-xl font-bold text-white mb-1">{emp.name}</h4>
                                <span className="text-[10px] font-black uppercase tracking-widest text-lime-400 bg-lime-400/10 px-3 py-1 rounded-md border border-lime-400/20">{emp.role}</span>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center font-black text-zinc-500">
                                {emp.name.charAt(0)}
                            </div>
                        </div>

                        <div className="space-y-4 mb-6 relative z-10">
                            <div className="flex justify-between text-sm font-medium border-b border-white/5 pb-2">
                                <span className="text-zinc-500">Base Salary</span>
                                <span className="text-white">₹{emp.base_salary.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm font-medium border-b border-white/5 pb-2">
                                <span className="text-zinc-500">PT Commissions</span>
                                <span className="text-lime-400">+₹{emp.pt_commissions.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="mt-auto pt-4 relative z-10">
                            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-600 mb-1">Total Due</p>
                            <p className="text-2xl font-black text-white tracking-tighter">₹{(emp.base_salary + emp.pt_commissions).toLocaleString()}</p>
                        </div>
                    </div>
                ))}
                {staff.length === 0 && <p className="text-zinc-600 text-sm italic col-span-3">No personnel on roster. Hire your first employee above.</p>}
            </div>
        )}
      </div>
    </div>
  );
}