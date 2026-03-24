import React, { useState, useEffect } from 'react';
import { 
  Users, Dumbbell, Activity, 
  LogOut, TrendingUp, Zap, ShieldCheck, BellRing,
  ShoppingCart, Wrench, UserPlus, Wallet, Megaphone, Briefcase, Receipt, Home, Lock, Mail
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

// --- ROLE-BASED ACCESS CONFIGURATION ---
const ROLE_PERMISSIONS = {
  admin: ['home', 'finance', 'growth', 'crm', 'registry', 'attendance', 'diet', 'supplements', 'analytics', 'maintenance', 'staff', 'expenses'],
  trainer: ['home', 'registry', 'attendance', 'diet', 'analytics'],
  frontdesk: ['home', 'crm', 'registry', 'attendance', 'supplements']
};

// --- DYNAMIC API URL SETUP ---
// This uses your Render backend when live on Netlify, but defaults to your Mac when coding locally!
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8005';

function App() {
  // --- CORE SYSTEM & AUTH STATE ---
  const [view, setView] = useState('website'); // 'website', 'login', 'admin'
  const [activeTab, setActiveTab] = useState('home');
  const [refreshTrigger, setRefreshTrigger] = useState(0); 

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null); // e.g., { name: 'Anuj', role: 'admin' }
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // --- DATA STATES ---
  const [members, setMembers] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [analyticsData, setAnalyticsData] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [leads, setLeads] = useState([]);
  const [finance, setFinance] = useState({ revenue: [], expenses: [] });
  const [staff, setStaff] = useState([]); 
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

  // --- MOCK AUTHENTICATION HANDLER ---
  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError('');

    const email = loginEmail.toLowerCase();

    if (email === 'admin@tathastu.com' && loginPassword === 'admin123') {
        setCurrentUser({ name: 'System Admin', role: 'admin' });
    } else if (email === 'trainer@tathastu.com' && loginPassword === 'trainer123') {
        setCurrentUser({ name: 'Master Trainer', role: 'trainer' });
    } else if (email === 'desk@tathastu.com' && loginPassword === 'desk123') {
        setCurrentUser({ name: 'Front Desk', role: 'frontdesk' });
    } else {
        setLoginError('Invalid credentials or unauthorized access.');
        return;
    }

    setIsAuthenticated(true);
    setView('admin');
    setActiveTab('home');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setLoginEmail('');
    setLoginPassword('');
    setView('website');
  };

  const canAccess = (moduleName) => {
      return currentUser && ROLE_PERMISSIONS[currentUser.role].includes(moduleName);
  };

  // --- 1. GLOBAL DATA FETCHING ---
  const triggerDataRefresh = () => setRefreshTrigger(prev => prev + 1); 

  useEffect(() => {
    let ignore = false;
    async function loadGlobalData() {
      if (view === 'admin' && isAuthenticated) {
        try {
          const endpoints = ['members', 'inventory', 'equipment', 'leads', 'finance', 'finance-analysis', 'staff'];
          const results = await Promise.all(
            endpoints.map(ep => fetch(`${API_BASE}/api/${ep}`).then(r => r.json()))
          );

          if (!ignore) {
            setMembers(results[0].members);
            setInventory(results[1].inventory);
            setEquipment(results[2].equipment);
            setLeads(results[3].leads);
            setFinance(results[4]);
            setAiFinanceInsight(results[5].analysis);
            setStaff(results[6].staff || []); 
          }
        } catch (err) {
          if (!ignore) console.error("Global Data Sync Error:", err);
        }
      }
    }
    loadGlobalData();
    return () => { ignore = true; }; 
  }, [view, refreshTrigger, isAuthenticated]); 

  // --- 2. DYNAMIC ANALYTICS FETCHING ---
  useEffect(() => {
    let ignore = false;
    async function fetchMemberAnalytics() {
      if (view === 'admin' && activeTab === 'analytics') {
        try {
          const aRes = await fetch(`${API_BASE}/api/analytics/${selectedMember}`);
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
        const res = await fetch(`${API_BASE}/api/add-member`, {
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
      const res = await fetch(`${API_BASE}/api/members/${id}`, { method: 'DELETE' });
      if(res.ok) {
        setMembers(members.filter(m => m.id !== id));
        alert("Member scrubbed from registry.");
      }
    } catch (err) { console.error("Delete failure:", err); }
  };

  const handleAutoMessage = async () => {
    setIsMessaging(true);
    try {
      await fetch(`${API_BASE}/api/trigger-retention`, { method: 'POST' });
      triggerDataRefresh();
    } catch (err) { console.error("Retention Bot failed:", err); }
    setIsMessaging(false);
  };

  const handleMarkAttendance = async (id, currentWeight) => {
    try {
        const res = await fetch(`${API_BASE}/api/mark-attendance/${id}`, { 
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
      const response = await fetch(`${API_BASE}/api/generate-diet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ member_name: dietName, requirements: dietPrompt })
      });
      const data = await response.json();
      setDietOutput(data.plan);
    } catch (err) { console.error("AI Generation error:", err); }
    setIsGenerating(false);
  };

  // --- RENDER 1: PUBLIC WEBSITE ---
  if (view === 'website') {
    return (
      <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col items-center justify-center relative overflow-hidden text-white">
        <h1 className="text-8xl font-black italic tracking-tighter mb-8 text-white">TATHASTU<span className="text-lime-400">FIT</span></h1>
        <button onClick={() => setView('login')} className="px-10 py-4 bg-lime-400 text-black rounded-full font-black hover:scale-105 transition-all uppercase tracking-widest text-xs z-10 shadow-[0_0_30px_rgba(163,230,53,0.3)]">
            ERP Secure Portal
        </button>
      </div>
    );
  }

  // --- RENDER 2: LOGIN SCREEN ---
  if (view === 'login') {
      return (
        <div className="min-h-screen bg-[#050505] text-white font-sans flex items-center justify-center relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-lime-400/10 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="w-full max-w-md bg-zinc-950/80 border border-white/5 p-10 rounded-[3rem] backdrop-blur-xl shadow-2xl relative z-10">
                <div className="text-center mb-10">
                    <ShieldCheck size={48} className="mx-auto text-lime-400 mb-4" />
                    <h2 className="text-3xl font-black uppercase tracking-tighter">Auth Gateway</h2>
                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-2">Restricted Enterprise Access</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    {loginError && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-bold text-center">
                            {loginError}
                        </div>
                    )}
                    <div>
                        <div className="relative">
                            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                            <input 
                                type="email" placeholder="Corporate Email" required
                                value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)}
                                className="w-full bg-black border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-lime-400 text-sm font-medium transition-colors"
                            />
                        </div>
                    </div>
                    <div>
                        <div className="relative">
                            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                            <input 
                                type="password" placeholder="Passkey" required
                                value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)}
                                className="w-full bg-black border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-lime-400 text-sm font-medium transition-colors"
                            />
                        </div>
                    </div>
                    <button type="submit" className="w-full bg-lime-400 text-black font-black py-4 rounded-2xl uppercase tracking-widest text-xs hover:bg-white transition-all shadow-lg">
                        Authenticate
                    </button>
                </form>

                <div className="mt-8 pt-8 border-t border-white/5 text-center">
                    <p className="text-zinc-600 text-[9px] uppercase tracking-widest font-black mb-3">Demo Credentials</p>
                    <div className="flex flex-col gap-1 text-[10px] font-mono text-zinc-500">
                        <span><span className="text-lime-400">Admin:</span> admin@tathastu.com / admin123</span>
                        <span><span className="text-lime-400">Trainer:</span> trainer@tathastu.com / trainer123</span>
                        <span><span className="text-lime-400">Desk:</span> desk@tathastu.com / desk123</span>
                    </div>
                </div>
            </div>
        </div>
      );
  }

  // --- RENDER 3: ADMIN ERP ---
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 flex font-sans selection:bg-lime-400 selection:text-black">

      <aside className="w-72 bg-black/40 backdrop-blur-xl border-r border-white/5 flex flex-col print:hidden text-white relative z-20">
        <div className="p-8 pb-4">
          <div className="text-2xl font-black italic tracking-tighter flex items-center text-white"><Zap className="text-lime-400 mr-2 fill-lime-400" size={24} /> TATHASTU<span className="text-lime-400 font-normal">ERP</span></div>
        </div>

        {/* Current User Badge */}
        <div className="px-8 pb-8">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-lime-400 text-black flex items-center justify-center font-black">
                    {currentUser?.name.charAt(0)}
                </div>
                <div>
                    <p className="font-bold text-sm leading-tight">{currentUser?.name}</p>
                    <p className="text-[9px] text-zinc-400 uppercase tracking-widest font-black">{currentUser?.role}</p>
                </div>
            </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          {canAccess('home') && <SidebarLink active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<Home size={20}/>} label="System Overview" />}
          {canAccess('finance') && <SidebarLink active={activeTab === 'finance'} onClick={() => setActiveTab('finance')} icon={<Wallet size={20}/>} label="Finance Engine" />}
          {canAccess('growth') && <SidebarLink active={activeTab === 'growth'} onClick={() => setActiveTab('growth')} icon={<Megaphone size={20}/>} label="AI Ad Campaigns" />}
          {canAccess('crm') && <SidebarLink active={activeTab === 'crm'} onClick={() => setActiveTab('crm')} icon={<UserPlus size={20}/>} label="Leads & Onboarding" />}
          {canAccess('registry') && <SidebarLink active={activeTab === 'registry'} onClick={() => setActiveTab('registry')} icon={<Users size={20}/>} label="Member Registry" />}
          {canAccess('attendance') && <SidebarLink active={activeTab === 'attendance'} onClick={() => setActiveTab('attendance')} icon={<BellRing size={20}/>} label="Retention Bot" />}
          {canAccess('diet') && <SidebarLink active={activeTab === 'diet'} onClick={() => setActiveTab('diet')} icon={<ShieldCheck size={20}/>} label="Elite Protocols" />}
          {canAccess('supplements') && <SidebarLink active={activeTab === 'supplements'} onClick={() => setActiveTab('supplements')} icon={<ShoppingCart size={20}/>} label="Stock Engine" />}
          {canAccess('analytics') && <SidebarLink active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} icon={<TrendingUp size={20}/>} label="Growth Vision" />}
          {canAccess('maintenance') && <SidebarLink active={activeTab === 'maintenance'} onClick={() => setActiveTab('maintenance')} icon={<Wrench size={20}/>} label="Machine Health" />}
          {canAccess('staff') && <SidebarLink active={activeTab === 'staff'} onClick={() => setActiveTab('staff')} icon={<Briefcase size={20}/>} label="Team Operations" />}
          {canAccess('expenses') && <SidebarLink active={activeTab === 'expenses'} onClick={() => setActiveTab('expenses')} icon={<Receipt size={20}/>} label="OpEx Ledger" />}
        </nav>

        <div className="p-6 border-t border-white/5">
          <button onClick={handleLogout} className="w-full p-4 bg-zinc-900 hover:bg-zinc-800 rounded-2xl flex items-center justify-center text-sm font-bold transition-all text-white"><LogOut size={16} className="mr-2 text-zinc-500" /> End Session</button>
        </div>
      </aside>

      <main className="flex-1 p-12 overflow-y-auto">
        <header className="mb-12 print:hidden text-white">
            <h2 className="text-4xl font-black uppercase tracking-tight text-white">{activeTab.replace(/([A-Z])/g, ' $1').trim()} Intelligence</h2>
            <p className="text-zinc-500 font-medium mt-1 uppercase text-[10px] tracking-[0.3em]">System Status <span className="text-lime-400 ml-2">● Online</span></p>
        </header>

        {/* --- SECURE DYNAMIC MODULE RENDERING --- */}
        {activeTab === 'home' && canAccess('home') && <SystemOverview members={members} finance={finance} equipment={equipment} inventory={inventory} leads={leads} staff={staff} aiInsight={aiFinanceInsight} />}
        {activeTab === 'finance' && canAccess('finance') && <FinanceTracker finance={finance} aiInsight={aiFinanceInsight} />}
        {activeTab === 'growth' && canAccess('growth') && <LeadGenerator onCampaignSuccess={triggerDataRefresh} />}
        {activeTab === 'crm' && canAccess('crm') && <LeadCRM leads={leads} members={members} formData={formData} setFormData={setFormData} onAddMember={handleAddMember} onRefreshLeads={triggerDataRefresh} />}
        {activeTab === 'registry' && canAccess('registry') && <MemberRegistry members={members} onUpdateMember={handleUpdateMember} onDeleteMember={handleDeleteMember} />}
        {activeTab === 'attendance' && canAccess('attendance') && <AttendanceBot members={members} onNudge={handleAutoMessage} isMessaging={isMessaging} onMarkAttendance={handleMarkAttendance} onRefresh={triggerDataRefresh} />}
        {activeTab === 'diet' && canAccess('diet') && <DietProtocols members={members} dietName={dietName} setDietName={setDietName} dietPrompt={dietPrompt} setDietPrompt={setDietPrompt} onGenerate={handleGenerateDiet} isGenerating={isGenerating} dietOutput={dietOutput} />}
        {activeTab === 'analytics' && canAccess('analytics') && <GrowthVision members={members} selectedMember={selectedMember} onSelectMember={setSelectedMember} analyticsData={analyticsData} />}
        {activeTab === 'supplements' && canAccess('supplements') && <StockEngine inventory={inventory} dietOutput={dietOutput} dietName={dietName} onRefresh={triggerDataRefresh} />}
        {activeTab === 'maintenance' && canAccess('maintenance') && <MachineHealth equipment={equipment} onRefresh={triggerDataRefresh} />}
        {activeTab === 'staff' && canAccess('staff') && <StaffOperations onRefresh={triggerDataRefresh} />}
        {activeTab === 'expenses' && canAccess('expenses') && <ExpenseManager onRefresh={triggerDataRefresh} />}
      </main>
    </div>
  );
}

export default App;