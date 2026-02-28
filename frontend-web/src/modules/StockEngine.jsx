import React, { useState } from 'react';
import { Dumbbell, Zap, PackagePlus, Plus, Minus, Loader2 } from 'lucide-react';
import { InputField } from '../components/UI'; // Reusing your UI components

export default function StockEngine({ inventory, dietOutput, dietName, onRefresh }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '', stock: '', price: '', threshold: '5'
  });

  // --- ADD NEW PRODUCT TO SQL ---
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.stock) return alert("Fill all fields.");
    setIsSubmitting(true);
    try {
      const res = await fetch('http://localhost:8005/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          stock: parseInt(formData.stock),
          price: parseFloat(formData.price),
          threshold: parseInt(formData.threshold)
        })
      });
      if (res.ok) {
        setFormData({ name: '', stock: '', price: '', threshold: '5' });
        if (onRefresh) onRefresh(); // Trigger global sync
      }
    } catch (err) { console.error("Inventory error:", err); }
    setIsSubmitting(false);
  };

  // --- UPDATE STOCK QUANTITY (+ / -) ---
  const handleUpdateStock = async (id, action) => {
    try {
      await fetch(`http://localhost:8005/api/inventory/${id}?action=${action}`, { method: 'PUT' });
      if (onRefresh) onRefresh();
    } catch (err) { console.error("Stock update error:", err); }
  };

  return (
    <div className="animate-fade-in space-y-10 text-white">
      
      {/* Top Section: Add Product & AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Registration Form */}
        <div className="lg:col-span-5 bg-zinc-900/50 border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-md shadow-xl">
            <h3 className="text-lg font-bold mb-6 flex items-center">
                <PackagePlus className="mr-3 text-lime-400" size={20} /> Register New SKU
            </h3>
            <form onSubmit={handleAddProduct} className="space-y-4">
                <input 
                    placeholder="Product Name (e.g., Creatine 250g)" 
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-black border border-white/10 rounded-xl p-4 text-sm text-white outline-none focus:border-lime-400 transition-colors" 
                />
                <div className="grid grid-cols-2 gap-4">
                    <input 
                        type="number" placeholder="Initial Stock" 
                        value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})}
                        className="bg-black border border-white/10 rounded-xl p-4 text-sm text-white outline-none focus:border-lime-400" 
                    />
                    <input 
                        type="number" placeholder="Price (₹)" 
                        value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})}
                        className="bg-black border border-white/10 rounded-xl p-4 text-sm text-white outline-none focus:border-lime-400" 
                    />
                </div>
                <button 
                    type="submit" disabled={isSubmitting}
                    className="w-full bg-lime-400 text-black font-black py-4 rounded-xl hover:bg-white transition-all uppercase text-[10px] tracking-widest flex items-center justify-center"
                >
                    {isSubmitting ? <Loader2 className="animate-spin mr-2" size={16}/> : <Plus size={16} className="mr-2"/>} Add Product
                </button>
            </form>
        </div>

        {/* AI Sales Intelligence Section */}
        <div className="lg:col-span-7 bg-zinc-900 border border-lime-400/20 rounded-[2.5rem] p-8 relative overflow-hidden shadow-2xl flex flex-col justify-center">
            <div className="absolute top-0 right-0 p-8 opacity-10 text-lime-400"><Zap size={120} /></div>
            <div className="relative z-10">
                <h3 className="text-lime-400 text-[10px] font-black uppercase tracking-[0.3em] mb-4">AI Cross-Sell Engine</h3>
                <h4 className="text-2xl font-bold mb-4">Active Recommendation</h4>
                <p className="max-w-xl text-zinc-300 leading-relaxed text-sm font-medium">
                    {dietOutput?.toLowerCase().includes('protein') ? (
                    <span className="block p-5 bg-lime-400/10 border border-lime-400/20 text-lime-400 rounded-2xl font-bold animate-pulse">
                        🔥 OPPORTUNITY: High protein requirement detected for {dietName || 'this member'}. 
                        Nudge them to purchase "Whey Protein" from stock before they leave.
                    </span>
                    ) : (
                    <span className="italic text-zinc-500">
                        Generate an Elite Diet Protocol for a member to trigger intelligent cross-selling alerts here.
                    </span>
                    )}
                </p>
            </div>
        </div>
      </div>

      [Image of a warehouse inventory management dashboard with product cards and low stock warnings]

      {/* Inventory Grid */}
      <h3 className="text-xl font-black uppercase tracking-tighter text-white pt-4">Current Warehouse Stock</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {inventory.map(item => (
          <InventoryCard key={item.id} item={item} onUpdate={handleUpdateStock} />
        ))}
        {inventory.length === 0 && <p className="text-zinc-500 text-sm col-span-4">No inventory found in database.</p>}
      </div>
    </div>
  );
}

// Internal Component for Inventory Cards
function InventoryCard({ item, onUpdate }) {
  const isLow = item.stock <= item.threshold;
  const stockWidth = Math.min((item.stock / 25) * 100, 100);

  return (
    <div className={`bg-zinc-900/80 border ${isLow ? 'border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.1)]' : 'border-white/5'} p-6 rounded-[2rem] transition-all group flex flex-col justify-between`}>
      <div>
          <div className="flex justify-between items-start mb-6">
            <div className={`p-3 rounded-xl ${isLow ? 'bg-red-500/10 text-red-500' : 'bg-lime-400/10 text-lime-400'}`}>
              <Dumbbell size={20} />
            </div>
            {isLow && (
              <span className="text-[8px] font-black bg-red-500 text-white px-2 py-1 rounded-full animate-pulse uppercase tracking-widest">
                Critical Stock
              </span>
            )}
          </div>
          
          <h3 className="font-bold text-lg text-white mb-1 group-hover:text-lime-400 transition-colors">{item.name}</h3>
          <p className="text-zinc-500 text-[10px] font-black mb-6 tracking-widest uppercase">Price: ₹{item.price.toLocaleString()}</p>
          
          <div className="space-y-3 mb-6">
            <div className="w-full h-1.5 bg-black rounded-full overflow-hidden border border-white/5">
              <div className={`h-full transition-all duration-1000 ${isLow ? 'bg-red-500' : 'bg-lime-400'}`} style={{ width: `${stockWidth}%` }}></div>
            </div>
            <div className="flex justify-between text-[10px] font-black text-zinc-500 uppercase tracking-tighter">
              <span>Units Left</span>
              <span className={isLow ? 'text-red-500' : 'text-zinc-200'}>{item.stock}</span>
            </div>
          </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="grid grid-cols-2 gap-2 mt-auto border-t border-white/5 pt-4">
          <button 
            onClick={() => onUpdate(item.id, 'sell')}
            disabled={item.stock === 0}
            className="flex items-center justify-center py-2 bg-black border border-white/5 rounded-lg text-zinc-400 hover:text-white hover:border-white/20 transition-all text-[10px] font-black uppercase disabled:opacity-30"
          >
              <Minus size={12} className="mr-1" /> Sell 1
          </button>
          <button 
            onClick={() => onUpdate(item.id, 'add')}
            className="flex items-center justify-center py-2 bg-lime-400/10 border border-lime-400/20 rounded-lg text-lime-400 hover:bg-lime-400 hover:text-black transition-all text-[10px] font-black uppercase"
          >
              <Plus size={12} className="mr-1" /> Restock
          </button>
      </div>
    </div>
  );
}