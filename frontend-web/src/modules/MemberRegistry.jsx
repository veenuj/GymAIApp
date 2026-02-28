import React, { useState } from 'react';
import { Edit2, Trash2, Search, X, Check, Phone, Mail, Calendar, CreditCard, User } from 'lucide-react';

export default function MemberRegistry({ members, onUpdateMember, onDeleteMember }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  // Filter members based on Search (Name, Mobile, or Email)
  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.mobile.includes(searchTerm) ||
    m.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const startEditing = (member) => {
    setEditingId(member.id);
    setEditForm(member);
  };

  const handleSave = () => {
    onUpdateMember(editForm);
    setEditingId(null);
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Search Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-lime-400 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search identity, mobile or email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900 border border-white/5 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-lime-400/50 transition-all text-sm text-white"
          />
        </div>
        <div className="flex items-center gap-4">
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                Database Status: <span className="text-lime-400">Synced</span>
            </p>
            <div className="h-4 w-px bg-white/10"></div>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                Total: <span className="text-white">{members.length}</span>
            </p>
        </div>
      </div>

      {/* Main Table Interface */}
      <div className="bg-zinc-900/50 border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-md shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-black/40 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">
              <tr>
                <th className="p-6">Member Identity</th>
                <th className="p-6">Contact Bio</th>
                <th className="p-6">Plan & Fees</th>
                <th className="p-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredMembers.map(m => (
                <tr key={m.id} className="hover:bg-white/5 transition-all group">
                  {editingId === m.id ? (
                    /* EDITING ROW */
                    <React.Fragment>
                      <td className="p-6">
                        <input 
                          type="text" value={editForm.name} 
                          onChange={e => setEditForm({...editForm, name: e.target.value})}
                          className="bg-black border border-lime-400/30 rounded-lg p-2 text-sm text-white w-full outline-none mb-2"
                        />
                        <input 
                          type="text" value={editForm.email} 
                          onChange={e => setEditForm({...editForm, email: e.target.value})}
                          className="bg-black border border-white/10 rounded-lg p-2 text-[10px] text-zinc-400 w-full"
                          placeholder="Email"
                        />
                      </td>
                      <td className="p-6 space-y-2">
                        <input 
                          type="text" value={editForm.mobile} 
                          onChange={e => setEditForm({...editForm, mobile: e.target.value})}
                          className="bg-black border border-white/10 rounded-lg p-2 text-xs text-white w-full"
                        />
                        <div className="flex gap-2">
                            <input type="text" value={editForm.weight} onChange={e => setEditForm({...editForm, weight: e.target.value})} className="bg-black border border-white/10 rounded-lg p-2 text-[10px] text-white w-1/2" placeholder="Wt"/>
                            <input type="text" value={editForm.height} onChange={e => setEditForm({...editForm, height: e.target.value})} className="bg-black border border-white/10 rounded-lg p-2 text-[10px] text-white w-1/2" placeholder="Ht"/>
                        </div>
                      </td>
                      <td className="p-6">
                        <input 
                          type="text" value={editForm.plan_name} 
                          onChange={e => setEditForm({...editForm, plan_name: e.target.value})}
                          className="bg-black border border-white/10 rounded-lg p-2 text-xs text-white w-full mb-2"
                        />
                        <input 
                          type="text" value={editForm.amount_paid} 
                          onChange={e => setEditForm({...editForm, amount_paid: e.target.value})}
                          className="bg-black border border-white/10 rounded-lg p-2 text-xs text-lime-400 w-full"
                        />
                      </td>
                      <td className="p-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={handleSave} className="p-2 bg-lime-400 text-black rounded-lg hover:bg-white transition-colors"><Check size={16}/></button>
                          <button onClick={() => setEditingId(null)} className="p-2 bg-zinc-800 text-zinc-400 rounded-lg hover:text-white transition-colors"><X size={16}/></button>
                        </div>
                      </td>
                    </React.Fragment>
                  ) : (
                    /* DISPLAY ROW */
                    <React.Fragment>
                      <td className="p-6">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-xs mr-4 border border-white/5 text-lime-400 uppercase">
                            {m.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-white leading-none">{m.name}</p>
                            <p className="text-[10px] text-zinc-600 font-black mt-1">ID: TATH_0{m.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <p className="text-zinc-200 font-bold flex items-center gap-2 mb-1"><Phone size={10} className="text-zinc-500"/> {m.mobile}</p>
                        <p className="text-zinc-500 text-[11px] lowercase flex items-center gap-2"><Mail size={10} className="text-zinc-400"/> {m.email || 'no-email'}</p>
                        <div className="flex gap-3 mt-2 text-[10px] font-black text-lime-500/70 uppercase">
                            <span className="bg-lime-400/5 px-2 py-0.5 rounded">{m.weight}kg</span>
                            <span className="bg-zinc-800 px-2 py-0.5 rounded text-zinc-500">{m.height}cm</span>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2 text-white font-bold text-xs mb-1">
                            <CreditCard size={12} className="text-lime-400" />
                            {m.plan_name || 'Legacy Plan'}
                        </div>
                        <p className="text-lime-400 font-black text-[10px] mb-2 tracking-widest uppercase">
                            Paid: ₹{m.amount_paid || '0'}
                        </p>
                        <p className="text-zinc-500 text-[10px] italic flex items-center gap-1">
                            <Calendar size={10}/> Exp: {m.sub_expiry}
                        </p>
                      </td>
                      <td className="p-6 text-right">
                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => startEditing(m)} className="p-2.5 bg-white/5 text-zinc-400 rounded-xl hover:bg-lime-400 hover:text-black transition-all">
                            <Edit2 size={14}/>
                          </button>
                          <button onClick={() => onDeleteMember(m.id)} className="p-2.5 bg-white/5 text-zinc-400 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                            <Trash2 size={14}/>
                          </button>
                        </div>
                      </td>
                    </React.Fragment>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}