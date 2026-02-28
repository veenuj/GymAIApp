import React, { useState, useEffect } from 'react';
import { 
  Users, Dumbbell, Activity, 
  LogOut, TrendingUp, Zap, ShieldCheck, BellRing,
  ShoppingCart, Wrench, UserPlus, Wallet, Megaphone, Briefcase, Receipt, Home
} from 'lucide-react';

// 1. IMPORTING REUSABLE UI COMPONENTS
import { SidebarLink } from './components/UI';

// 2. IMPORTING INDEPENDENT MODULES
import AttendanceBot from './modules/AttendanceBot';
import DietProtocols from './modules/DietProtocols';
import GrowthVision from './modules/GrowthVision';
import LeadCRM from './modules/LeadCRM';
import FinanceTracker from './modules/FinanceTracker';
import StockEngine from './modules/StockEngine'; 
import MachineHealth from './modules/MachineHealth'; 
import MemberRegistry from './modules/MemberRegistry'; 
import LeadGenerator from './modules/LeadGenerator'; 
import StaffOperations from './modules/StaffOperations';
import ExpenseManager from './modules/ExpenseManager';
import SystemOverview from './modules/SystemOverview';

function App() {
  // --- CORE SYSTEM STATE ---
  const [view, setView] = useState('website'); 
  const [activeTab, setActiveTab] = useState('home'); // Now defaults to the amazing System Overview
  const [refreshTrigger, setRefreshTrigger] = useState(0); 
  
  // --- DATA STATES ---
  const [members, setMembers] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [analyticsData, setAnalyticsData] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [leads, setLeads] = useState([]);
  const [finance, setFinance] = useState({ revenue: [], expenses: [] });
  const [staff, setStaff] = useState([]); // FIXED: Added missing staff state
  const [aiFinanceInsight, setAiFinanceInsight] = useState('');
  
  // --- UI & LOGIC STATES ---
  const [selectedMember, setSelectedMember] = useState('Rahul Sharma');
  const [isMessaging, setIsMessaging] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [dietName, setDietName] = useState('');
  const [dietPrompt, setDietPrompt] = useState('');
  const [dietOutput, setDietOutput] = useState('');
  const [formData, setFormData] = useState({
    name: '', mobile: '', email: '', weight: '', height: '', address: '', sub_expiry: ''
  });

  // --- 1. GLOBAL DATA FETCHING (Linter Safe) ---
  const triggerDataRefresh = () => {
    setRefreshTrigger(prev => prev + 1); 
  };

  useEffect(() => {
    let ignore = false;
    async function loadGlobalData() {
      if (view === 'admin') {
        try {
          // FIXED: Added 'staff' to the endpoints array
          const endpoints = ['members', 'inventory', 'equipment', 'leads', 'finance', 'finance-analysis', 'staff'];
          const results = await Promise.all(
            endpoints.map(ep => fetch(`http://localhost:8005/api/${ep}`).then(r => r.json()))
          );

          if (!ignore) {
            setMembers(results[0].members);
            setInventory(results[1].inventory);
            setEquipment(results[2].equipment);
            setLeads(results[3].leads);
            setFinance(results[4]);
            setAiFinanceInsight(results[5].analysis);
            setStaff(results[6].staff || []); // FIXED: Syncing staff data
          }
        } catch (err) {
          if (!ignore) console.error("Global Data Sync Error:", err);
        }
      }
    }
    loadGlobalData();
    return () => { ignore = true; }; 
  }, [view, refreshTrigger]); 

  // --- 2. DYNAMIC ANALYTICS FETCHING (Linter Safe) ---
  useEffect(() => {
    let ignore = false;
    async function fetchMemberAnalytics() {
      if (view === 'admin' && activeTab === 'analytics') {
        try {
          const aRes = await fetch(`http://localhost:8005/api/analytics/${selectedMember}`);
          const aData = await aRes.json();
          if (!ignore) setAnalyticsData(aData.progress);
        } catch (err) {
          if (!ignore) console.error("Analytics Sync Error:", err);
        }
      }
    }
    fetchMemberAnalytics();
    return () => { ignore = true; };
  }, [selectedMember, activeTab, view]);

  // --- 3. LOGIC HANDLERS ---

  const handleAddMember = async (finalMemberData) => {
    try {
        const res = await fetch('http://localhost:8005/api/add-member', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(finalMemberData) 
        });
        const data = await res.json();
        setMembers([...members, data.member]);
        setFormData({ name: '', mobile: '', email: '', weight: '', height: '', address: '', sub_expiry: '' });
        alert(`Member Onboarded: ${data.member.name} successfully!`);
        triggerDataRefresh(); 
    } catch (err) { console.error("Onboarding failed:", err); }
  };

  const handleUpdateMember = async (updatedMember) => {
    try {
      setMembers(members.map(m => m.id === updatedMember.id ? updatedMember : m));
      alert("Member record updated locally.");
    } catch (err) { console.error("Update failed:", err); }
  };

  const handleDeleteMember = async (id) => {
    if(!window.confirm("Permanent deletion? This will remove all biometric and financial logs for this user.")) return;
    try {
      const res = await fetch(`http://localhost:8005/api/members/${id}`, { method: 'DELETE' });
      if(res.ok) {
        setMembers(members.filter(m => m.id !== id));
        alert("Member scrubbed from registry.");
      }
    } catch (err) { console.error("Delete failure:", err); }
  };

  const handleAutoMessage = async () => {
    setIsMessaging(true);
    try {
      await fetch('http://localhost:8005/api/trigger-retention', { method: 'POST' });
      triggerDataRefresh();
    } catch (err) { console.error("Retention Bot failed:", err); }
    setIsMessaging(false);
  };

  const handleMarkAttendance = async (id, currentWeight) => {
    try {
        const res = await fetch(`http://localhost:8005/api/mark-attendance/${id}`, { 
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ weight: currentWeight }) 
        });
        
        if (res.ok) {
            setMembers(members.map(m => m.id === id ? { 
              ...m, 
              isPresentToday: true, 
              last_seen_days: 0,
              weight: currentWeight ? currentWeight : m.weight 
            } : m));
            triggerDataRefresh(); 
        }
    } catch (err) {
        console.error("Attendance Error:", err);
    }
  };

  const handleGenerateDiet = async () => {
    if (!dietName || !dietPrompt) return alert("Provide Member details.");
    setIsGenerating(true);
    try {
      const response = await fetch('http://localhost:8005/api/generate-diet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ member_name: dietName, requirements: dietPrompt })
      });
      const data = await response.json();
      setDietOutput(data.plan);
    } catch (err) { console.error("AI Generation error:", err); }
    setIsGenerating(false);
  };

  // --- PUBLIC WEBSITE RENDER ---
  if (view === 'website') {
    return (
      <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col items-center justify-center relative overflow-hidden text-white">
        <h1 className="text-8xl font-black italic tracking-tighter mb-8 text-white">TATHASTU<span className="text-lime-400">FIT</span></h1>
        <button onClick={() => setView('admin')} className="px-10 py-4 bg-zinc-900 border border-white/10 rounded-full font-bold hover:border-lime-400 transition-all uppercase tracking-widest text-xs z-10 text-white">Enter ERP Dashboard</button>
      </div>
    );
  }

  // --- ADMIN ERP RENDER ---
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 flex font-sans selection:bg-lime-400 selection:text-black">
      
      <aside className="w-72 bg-black/40 backdrop-blur-xl border-r border-white/5 flex flex-col print:hidden text-white">
        <div className="p-8">
          <div className="text-2xl font-black italic tracking-tighter flex items-center text-white"><Zap className="text-lime-400 mr-2 fill-lime-400" size={24} /> TATHASTU<span className="text-lime-400 font-normal">ERP</span></div>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {/* FIXED: Added Home Tab to Navigation */}
          <SidebarLink active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<Home size={20}/>} label="System Overview" />
          <SidebarLink active={activeTab === 'finance'} onClick={() => setActiveTab('finance')} icon={<Wallet size={20}/>} label="Finance Engine" />
          <SidebarLink active={activeTab === 'growth'} onClick={() => setActiveTab('growth')} icon={<Megaphone size={20}/>} label="AI Ad Campaigns" />
          <SidebarLink active={activeTab === 'crm'} onClick={() => setActiveTab('crm')} icon={<UserPlus size={20}/>} label="Leads & Onboarding" />
          <SidebarLink active={activeTab === 'registry'} onClick={() => setActiveTab('registry')} icon={<Users size={20}/>} label="Member Registry" />
          <SidebarLink active={activeTab === 'attendance'} onClick={() => setActiveTab('attendance')} icon={<BellRing size={20}/>} label="Retention Bot" />
          <SidebarLink active={activeTab === 'diet'} onClick={() => setActiveTab('diet')} icon={<ShieldCheck size={20}/>} label="Elite Protocols" />
          <SidebarLink active={activeTab === 'supplements'} onClick={() => setActiveTab('supplements')} icon={<ShoppingCart size={20}/>} label="Stock Engine" />
          <SidebarLink active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} icon={<TrendingUp size={20}/>} label="Growth Vision" />
          <SidebarLink active={activeTab === 'maintenance'} onClick={() => setActiveTab('maintenance')} icon={<Wrench size={20}/>} label="Machine Health" />
          <SidebarLink active={activeTab === 'staff'} onClick={() => setActiveTab('staff')} icon={<Briefcase size={20}/>} label="Team Operations" />
          <SidebarLink active={activeTab === 'expenses'} onClick={() => setActiveTab('expenses')} icon={<Receipt size={20}/>} label="OpEx Ledger" />
        </nav>

        <div className="p-6 border-t border-white/5 text-white">
          <button onClick={() => setView('website')} className="w-full p-4 bg-zinc-900 hover:bg-zinc-800 rounded-2xl flex items-center justify-center text-sm font-bold transition-all text-white"><LogOut size={16} className="mr-2 text-zinc-500" /> Sign Out</button>
        </div>
      </aside>

      <main className="flex-1 p-12 overflow-y-auto">
        <header className="mb-12 print:hidden text-white">
            <h2 className="text-4xl font-black uppercase tracking-tight text-white">{activeTab.replace(/([A-Z])/g, ' $1').trim()} Intelligence</h2>
            <p className="text-zinc-500 font-medium mt-1 uppercase text-[10px] tracking-[0.3em]">System Status <span className="text-lime-400 ml-2">● Online</span></p>
        </header>
        
        {/* --- DYNAMIC MODULE RENDERING --- */}
        {activeTab === 'home' && (
              <SystemOverview 
                  members={members} 
                  finance={finance} 
                  equipment={equipment} 
                  inventory={inventory} 
                  leads={leads}
                  staff={staff} 
                  aiInsight={aiFinanceInsight} // FIXED: Passed the correct state
              />
          )}
          
        {activeTab === 'finance' && <FinanceTracker finance={finance} aiInsight={aiFinanceInsight} />}
        {activeTab === 'growth' && <LeadGenerator onCampaignSuccess={triggerDataRefresh} />}
        {activeTab === 'crm' && <LeadCRM leads={leads} members={members} formData={formData} setFormData={setFormData} onAddMember={handleAddMember} onRefreshLeads={triggerDataRefresh} />}
        {activeTab === 'registry' && <MemberRegistry members={members} onUpdateMember={handleUpdateMember} onDeleteMember={handleDeleteMember} />}
        {activeTab === 'attendance' && <AttendanceBot members={members} onNudge={handleAutoMessage} isMessaging={isMessaging} onMarkAttendance={handleMarkAttendance} onRefresh={triggerDataRefresh} />}
        {activeTab === 'diet' && <DietProtocols members={members} dietName={dietName} setDietName={setDietName} dietPrompt={dietPrompt} setDietPrompt={setDietPrompt} onGenerate={handleGenerateDiet} isGenerating={isGenerating} dietOutput={dietOutput} />}
        {activeTab === 'analytics' && <GrowthVision members={members} selectedMember={selectedMember} onSelectMember={setSelectedMember} analyticsData={analyticsData} />}
        {activeTab === 'supplements' && <StockEngine inventory={inventory} dietOutput={dietOutput} dietName={dietName} onRefresh={triggerDataRefresh} />}
        {activeTab === 'maintenance' && <MachineHealth equipment={equipment} onRefresh={triggerDataRefresh} />}
        {activeTab === 'staff' && <StaffOperations onRefresh={triggerDataRefresh} />}
        {activeTab === 'expenses' && <ExpenseManager onRefresh={triggerDataRefresh} />}
      </main>
    </div>
  );
}

export default App;