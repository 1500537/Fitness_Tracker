import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, Check, ShieldCheck, Star, Edit, Trash2, 
  Plus, Settings, LayoutGrid, DollarSign, Target, X,
  Crown, Cpu, Globe, Rocket
} from 'lucide-react';
import { useAppContext } from '../../context/useAppContext';
import CustomPopUp from './CustomPopUp';

const PlansManagement = () => {
  const { 
    plans, 
    plansLoading, 
    fetchPlans, 
    createPlan, 
    updatePlan, 
    deletePlan, 
    error, 
    setError 
  } = useAppContext();
  
  const [billingCycle, setBillingCycle] = useState('monthly'); 
  const [modal, setModal] = useState({ isOpen: false, type: 'edit', data: null });
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });

  React.useEffect(() => {
    fetchPlans();
  }, []);

  const showAlert = (message, type = 'success') => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleAction = async () => {
    const { type, data } = modal;
    let result;
    
    try {
      if (type === 'add') {
        result = await createPlan(data);
      } else if (type === 'edit') {
        result = await updatePlan(data._id, data);
      } else if (type === 'delete') {
        result = await deletePlan(data._id);
      }
      
      if (result.success) {
        showAlert(result.message, 'success');
        setModal({ isOpen: false, type: 'edit', data: null });
      } else {
        showAlert(result.message, 'error');
      }
    } catch (error) {
      showAlert('Operation failed', 'error');
    }
  };

  const openModal = (type, data = null) => {
    setModal({
      isOpen: true,
      type,
      data: data ? { ...data } : { 
        name: '', 
        tagline: '', 
        monthlyPrice: 0, 
        annualPrice: 0, 
        features: [], 
        popular: false 
      },
      title: type === 'add' ? 'FORGE NEW TIER' : type === 'edit' ? 'RESTRUCTURE PLAN' : 'TERMINATE ACCESS',
      confirmText: type === 'add' ? 'ACTIVATE' : type === 'edit' ? 'UPDATE' : 'CONFIRM PURGE'
    });
  };

  return (
    <>
      <div className="min-h-screen bg-[#050505] text-white selection:bg-[#FF7222] selection:text-black overflow-x-hidden relative">
        
        {/* Background Elements */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 opacity-[0.03]" 
            style={{ backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`, backgroundSize: '40px 40px' }} 
          />
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#FF7222]/10 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full animate-bounce" style={{ animationDuration: '15s' }} />
        </div>

        <div className="relative z-10 p-4 sm:p-8 lg:p-12 lg:pl-[340px] pt-24 sm:pt-32">
          
          {/* Header */}
          <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-10 mb-20">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="flex items-center gap-4 mb-6">
                <span className="h-[2px] w-12 bg-[#FF7222]" />
                <span className="text-[10px] font-black uppercase tracking-[0.6em] text-gray-500 flex items-center gap-2">
                  <Cpu size={12} className="text-[#FF7222]"/> Economic_Protocol_v2
                </span>
              </div>
              <h1 className="text-5xl sm:text-7xl lg:text-9xl font-[1000] italic uppercase tracking-tighter leading-[0.85]">
                SUBSCRIPTION<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF7222] to-white">MODELS</span>
              </h1>
            </motion.div>

            <div className="flex flex-col sm:flex-row gap-6 items-center w-full xl:w-auto">
              <div className="bg-white/5 p-1.5 rounded-2xl border border-white/10 flex items-center relative w-full sm:w-auto backdrop-blur-md shadow-2xl">
                <button 
                  onClick={() => setBillingCycle('monthly')}
                  className={`relative z-10 flex-1 sm:flex-none px-10 py-3 rounded-xl text-[10px] font-black uppercase transition-all duration-300 ${billingCycle === 'monthly' ? 'bg-[#FF7222] text-black shadow-[0_0_20px_rgba(255,114,34,0.3)]' : 'text-gray-500 hover:text-white'}`}
                >
                  Monthly
                </button>
                <button 
                  onClick={() => setBillingCycle('annual')}
                  className={`relative z-10 flex-1 sm:flex-none px-10 py-3 rounded-xl text-[10px] font-black uppercase transition-all duration-300 ${billingCycle === 'annual' ? 'bg-[#FF7222] text-black shadow-[0_0_20px_rgba(255,114,34,0.3)]' : 'text-gray-500 hover:text-white'}`}
                >
                  Annual <span className="ml-1 opacity-60 text-[8px]">-20%</span>
                </button>
              </div>
              
              <button 
                onClick={() => openModal('add')}
                className="w-full sm:w-auto bg-white text-black px-10 py-5 rounded-2xl font-black uppercase text-[10px] flex items-center justify-center gap-4 hover:bg-[#FF7222] hover:text-white transition-all shadow-xl active:scale-95 group"
              >
                <Plus size={18} strokeWidth={4} className="group-hover:rotate-90 transition-transform"/> NEW ACCESS LEVEL
              </button>
            </div>
          </header>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 items-stretch">
            {plansLoading ? (
              <div className="col-span-full flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-[#FF7222]/30 border-t-[#FF7222] rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">Loading Plans...</p>
                </div>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {plans.map((plan) => (
                <motion.div 
                  layout
                  key={plan._id || plan.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={`relative group rounded-[3rem] p-1 transition-all duration-700 ${plan.popular ? 'bg-gradient-to-b from-[#FF7222] to-transparent scale-[1.02] z-10 shadow-[0_40px_80px_-20px_rgba(255,114,34,0.15)]' : 'bg-white/5 hover:bg-white/10'}`}
                >
                  <div className="relative h-full rounded-[2.85rem] p-8 sm:p-12 flex flex-col overflow-hidden backdrop-blur-xl">
                    
                    <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-700">
                      <Globe size={180} />
                    </div>

                    {plan.popular && (
                      <div className="absolute -top-1 right-12 bg-[#FF7222] text-white text-[8px] font-[1000] uppercase px-6 py-2 rounded-b-xl italic tracking-[0.2em] shadow-lg flex items-center gap-2">
                        <Star size={10} fill="currentColor"/> RECOMMENDED_LINK
                      </div>
                    )}

                    <div className="absolute top-8 right-8 flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                      <button onClick={() => openModal('edit', plan)} className="p-3 bg-black/5 hover:bg-black/10 rounded-xl transition-all"><Edit size={16}/></button>
                      <button onClick={() => openModal('delete', plan)} className="p-3 bg-red-500/10 hover:bg-red-500 text-red-600 hover:text-white rounded-xl transition-all"><Trash2 size={16}/></button>
                    </div>

                    <div className="mb-12">
                      <h3 className="text-4xl font-[1000] italic uppercase tracking-tighter mb-2 leading-none">{plan.name}</h3>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 italic">{plan.tagline}</p>
                    </div>

                    <div className="mb-12">
                      <div className="flex items-baseline gap-2">
                        <span className="text-7xl font-[1000] tracking-tighter leading-none">
                          ${billingCycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice}
                        </span>
                        <span className="text-[11px] font-black uppercase opacity-40">/ mo</span>
                      </div>
                      {billingCycle === 'annual' && plan.monthlyPrice > 0 && (
                        <p className="text-[9px] font-black text-[#FF7222] mt-3 uppercase tracking-widest bg-[#FF7222]/10 w-fit px-3 py-1 rounded-md">
                          Saving ${(plan.monthlyPrice - plan.annualPrice) * 12} Yearly
                        </p>
                      )}
                    </div>

                    <div className="space-y-5 flex-1 mb-12">
                      <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#FF7222] mb-6 flex items-center gap-2">
                        <Settings size={12} className="animate-spin-slow"/> Core_Protocols:
                      </p>
                      {plan.features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-4 group/item">
                          <div className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center border transition-all border-white/20 bg-white/5 text-[#FF7222]">
                            <Check size={12} strokeWidth={4} />
                          </div>
                          <span className="text-[11px] font-bold uppercase tracking-wide opacity-70 group-hover/item:opacity-100 transition-opacity">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <button className="w-full py-6 rounded-[2rem] font-[1000] uppercase text-[11px] tracking-[0.4em] transition-all hover:tracking-[0.5em] active:scale-95 shadow-2xl bg-[#FF7222] text-black hover:bg-white">
                      DEPLOY_PROTOCOL
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            )}
          </div>
        </div>
      </div>

      <CustomPopUp
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        onConfirm={handleAction}
        title={modal.title}
        type={modal.type}
        confirmText={modal.confirmText}
      >
        {modal.isOpen && modal.data && (
          modal.type === 'delete' ? (
            <div className="text-center py-10">
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                 <Trash2 size={40} className="text-red-500" />
              </div>
              <h4 className="text-3xl font-[1000] italic uppercase">Erase {modal.data.name}?</h4>
              <p className="text-gray-500 text-[10px] mt-4 font-bold uppercase tracking-widest leading-loose">Caution: This tier will be purged from the active database permanently.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-8 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar overflow-x-hidden">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-500 uppercase italic">Tier Label</label>
                  <input 
                    value={modal.data.name}
                    onChange={(e) => setModal({ ...modal, data: { ...modal.data, name: e.target.value }})}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-5 outline-none font-black text-white uppercase focus:border-[#FF7222] transition-colors"
                    placeholder="e.g. TITAN PRO"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-500 uppercase italic">Visual Tagline</label>
                  <input 
                    value={modal.data.tagline}
                    onChange={(e) => setModal({ ...modal, data: { ...modal.data, tagline: e.target.value }})}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-5 outline-none font-black text-white uppercase focus:border-[#FF7222] transition-colors"
                    placeholder="SHORT MOTTO"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 bg-white/[0.02] p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FF7222]/20 to-transparent" />
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-500 uppercase italic flex items-center gap-2">
                    <DollarSign size={14} className="text-[#FF7222]" /> Monthly Rate
                  </label>
                  <input 
                    type="number"
                    value={modal.data.monthlyPrice}
                    onChange={(e) => setModal({ ...modal, data: { ...modal.data, monthlyPrice: Number(e.target.value) }})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 font-[1000] text-3xl text-white outline-none focus:border-white/20"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-500 uppercase italic flex items-center gap-2">
                    <Target size={14} className="text-blue-500" /> Annual Rate
                  </label>
                  <input 
                    type="number"
                    value={modal.data.annualPrice}
                    onChange={(e) => setModal({ ...modal, data: { ...modal.data, annualPrice: Number(e.target.value) }})}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 font-[1000] text-3xl text-white outline-none focus:border-white/20"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-500 uppercase italic">Protocol Specifications (Comma Separated)</label>
                <textarea 
                  value={modal.data.features.join(', ')}
                  onChange={(e) => setModal({ ...modal, data: { ...modal.data, features: e.target.value.split(',').map(f => f.trim()) }})}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-6 outline-none font-bold text-sm text-gray-400 h-28 resize-none focus:border-[#FF7222] transition-colors"
                  placeholder="Feature 1, Feature 2, Feature 3..."
                />
              </div>

              <div className="p-6 bg-white/[0.02] rounded-3xl border border-white/5">
                 <label className="flex items-center gap-4 cursor-pointer group w-fit">
                    <div className="relative w-14 h-7 bg-white/10 rounded-full transition-all group-hover:bg-white/20">
                      <input 
                        type="checkbox" 
                        checked={modal.data.popular} 
                        onChange={(e) => setModal({ ...modal, data: { ...modal.data, popular: e.target.checked }})}
                        className="sr-only peer" 
                      />
                      <div className="absolute top-1 left-1 w-5 h-5 bg-gray-500 rounded-full transition-all peer-checked:translate-x-7 peer-checked:bg-[#FF7222] peer-checked:shadow-[0_0_15px_#FF7222]" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest italic group-hover:text-white transition-colors">Mark as Preferred Protocol</span>
                 </label>
              </div>

            </div>
          )
        )}
      </CustomPopUp>

      {alert.show && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${alert.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
          {alert.message}
        </div>
      )}

      <style>{`
        .animate-spin-slow {
          animation: spin 6s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default PlansManagement;