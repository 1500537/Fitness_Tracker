import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Lock, Crown, Star } from 'lucide-react';
import { useAppContext } from '../../context/useAppContext';
import { COACH_INTEL } from '../../assets/assets'; 

// --- PDF FIX: Sahi Imports aur Initialization ---
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; 

// Pricing Lock Component
const PricingLock = ({ tier, feature, children }) => {
  const { user } = useAppContext();
  
  // Real-time pricing check with case-insensitive comparison
  const userPricing = (user?.pricing || 'starter').toString().toLowerCase();
  const tiers = { starter: 0, pro: 1, elite: 2 };
  const userTierLevel = tiers[userPricing] !== undefined ? tiers[userPricing] : 0;
  const requiredTierLevel = tiers[tier] || 0;
  const hasAccess = userTierLevel >= requiredTierLevel;
  
  const tierColors = { starter: '#10B981', pro: '#F59E0B', elite: '#8B5CF6' };
  const tierIcons = { starter: Star, pro: Crown, elite: Crown };
  const TierIcon = tierIcons[tier];
  
  if (hasAccess) return children;
  
  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-[3rem] z-10 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 rounded-full border-2 mr-3" style={{ borderColor: tierColors[tier] }}>
              <Lock size={24} style={{ color: tierColors[tier] }} />
            </div>
            <TierIcon size={32} style={{ color: tierColors[tier] }} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2 capitalize">{tier.toUpperCase()} Feature</h3>
          <p className="text-sm text-gray-300 mb-4">{feature}</p>
          <button 
            onClick={() => window.location.href = '/pricing'}
            className="px-8 py-3 rounded-xl font-semibold text-black transition-all hover:scale-105"
            style={{ backgroundColor: tierColors[tier] }}
          >
            Upgrade to {tier.toUpperCase()}
          </button>
        </div>
      </div>
      <div className="opacity-20 pointer-events-none">{children}</div>
    </div>
  );
};

// --- 1. ELITE CONFIRMATION MODAL ---
const ConfirmModal = ({ isOpen, onClose, onConfirm, itemName }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4 backdrop-blur-md">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose} className="absolute inset-0 bg-black/80" 
        />
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative bg-[#0A0A0A] border border-red-500/30 p-8 rounded-[3rem] max-w-sm w-full shadow-[0_0_50px_rgba(239,68,68,0.2)]"
        >
          <div className="text-center space-y-6">
            <h3 className="text-2xl font-[1000] italic text-white uppercase leading-none">Scrub <span className="text-red-500">Intel?</span></h3>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Permanently delete {itemName}?</p>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={onClose} className="py-4 bg-white/5 rounded-2xl text-[10px] font-black uppercase hover:bg-white/10 transition-all text-white">Abort</button>
              <button onClick={onConfirm} className="py-4 bg-red-600 rounded-2xl text-[10px] font-black uppercase text-white shadow-lg">Confirm</button>
            </div>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

// --- 2. BIOMETRIC LOADER ---
const BiometricLoader = () => (
  <div className="fixed inset-0 z-[2000] flex flex-col items-center justify-center bg-black backdrop-blur-3xl">
    <div className="relative w-72 h-72 flex items-center justify-center">
      <motion.div
        animate={{ rotate: 360, rotateX: [60, 45, 60], scale: [1, 1.1, 1] }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 border-t-2 border-b-2 border-[#FF7222] rounded-full shadow-[0_0_60px_rgba(255,114,34,0.3)]"
      />
      <motion.div
        animate={{ y: [-80, 80, -80] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#FF7222] to-transparent z-10 shadow-[0_0_20px_#FF7222]"
      />
      <div className="text-center z-20">
        <p className="text-[#FF7222] font-[1000] italic tracking-[0.5em] uppercase text-[10px] animate-pulse">Syncing AI Nutrition Core</p>
      </div>
    </div>
  </div>
);

const TacticalBlade = ({ message, type, isVisible }) => (
  <AnimatePresence>
    {isVisible && (
      <motion.div
        initial={{ x: 300, opacity: 0, skewX: -20 }}
        animate={{ x: 0, opacity: 1, skewX: 0 }}
        exit={{ x: 300, opacity: 0 }}
        className={`fixed top-10 right-4 lg:right-10 z-[1000] p-[2px] rounded-br-[2rem] bg-gradient-to-r ${
          type === 'success' ? 'from-emerald-500 to-transparent' : 'from-red-500 to-transparent'
        }`}
      >
        <div className="bg-black/90 backdrop-blur-2xl px-8 py-4 rounded-br-[2rem] flex items-center gap-4 border-l-4 border-white/20">
          <span className="text-2xl">{type === 'success' ? '⚡' : '⚠'}</span>
          <p className="text-lg font-[1000] italic uppercase tracking-tighter text-white">{message}</p>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

const Interactive3D = ({ children, className }) => {
  const x = useMotionValue(0); const y = useMotionValue(0);
  const mX = useSpring(x, { stiffness: 100, damping: 20 });
  const mY = useSpring(y, { stiffness: 100, damping: 20 });
  const rotateX = useTransform(mY, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mX, [-0.5, 0.5], ["-10deg", "10deg"]);

  return (
    <motion.div
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        x.set((e.clientX - rect.left) / rect.width - 0.5);
        y.set((e.clientY - rect.top) / rect.height - 0.5);
      }}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={className}
    >{children}</motion.div>
  );
};

const NutritionModule = () => {
  const { nutrition, nutritionStats, loading, addNutritionEntry, deleteNutritionEntry, fetchNutrition, fetchNutritionStats } = useAppContext();
  const [form, setForm] = useState({ name: '', protein: '', carbs: '', fats: '', type: 'Breakfast' });
  const [notif, setNotif] = useState({ show: false, msg: '', type: '' });
  
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [confirmDelete, setConfirmDelete] = useState({ show: false, id: null, name: "" });

  const [isCoachActive, setIsCoachActive] = useState(false);
  const [showCoachPopup, setShowCoachPopup] = useState(false);

  useEffect(() => { fetchNutrition(); fetchNutritionStats(); }, []);

  useEffect(() => {
    if (isCoachActive) {
        const timer = setTimeout(() => setShowCoachPopup(true), 500);
        return () => clearTimeout(timer);
    } else {
        setShowCoachPopup(false);
    }
  }, [isCoachActive]);

  const [validationErrors, setValidationErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    const name = form.name.trim();
    if (!name) {
      errors.name = 'Food name is required';
    } else if (name.length < 2 || name.length > 100) {
      errors.name = 'Name must be 2-100 characters';
    }
    if (!form.type) {
      errors.type = 'Meal type is required';
    }
    const protein = parseFloat(form.protein);
    if (!form.protein || isNaN(protein) || protein < 0 || protein > 500) {
      errors.protein = 'Protein must be 0-500g';
    }
    const carbs = parseFloat(form.carbs || 0);
    if (isNaN(carbs) || carbs < 0 || carbs > 1000) {
      errors.carbs = 'Carbs must be 0-1000g';
    }
    const fats = parseFloat(form.fats || 0);
    if (isNaN(fats) || fats < 0 || fats > 500) {
      errors.fats = 'Fats must be 0-500g';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field, value) => {
    let sanitizedValue = value;
    if (field === 'name') {
      sanitizedValue = value.replace(/[<>\"'&]/g, ''); // Basic XSS prevention
    }
    setForm(prev => ({ ...prev, [field]: sanitizedValue }));
    if (validationErrors[field]) setValidationErrors(prev => ({ ...prev, [field]: '' }));
  };

  const trigger = (msg, type) => {
    setNotif({ show: true, msg, type });
    setTimeout(() => setNotif({ show: false, msg: '', type: '' }), 3000);
  };

  const addMeal = async () => {
    if (!validateForm()) return trigger("INVALID INTEL", "error");
    const result = await addNutritionEntry({ ...form, carbs: parseFloat(form.carbs) || 0, fats: parseFloat(form.fats) || 0 });
    if (result) {
      setForm({ name: '', protein: '', carbs: '', fats: '', type: 'Breakfast' });
      setValidationErrors({});
      trigger("FUEL DEPLOYED", "success");
    }
  };

  const processDelete = async () => {
    await deleteNutritionEntry(confirmDelete.id);
    setConfirmDelete({ show: false, id: null, name: "" });
    trigger("DATA DELETED", "success");
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      
      doc.setFontSize(22);
      doc.setTextColor(255, 114, 34);
      doc.text("TACTICAL FUEL LOG", 14, 20);
      
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);

      const tableRows = filteredLogs.map(meal => [
        meal.name.toUpperCase(),
        meal.type,
        `${meal.protein}g`,
        `${meal.carbs}g`,
        `${meal.fats}g`,
        meal.calories
      ]);

      autoTable(doc, {
        startY: 35,
        head: [['UNIT', 'TYPE', 'PROT', 'CARB', 'FAT', 'KCAL']],
        body: tableRows,
        styles: { fontSize: 8, fontStyle: 'bold' },
        headStyles: { fillColor: [20, 20, 20], textColor: [255, 114, 34] },
        alternateRowStyles: { fillColor: [245, 245, 245] }
      });

      doc.save("Mission_Fuel_Intel.pdf");
      trigger("INTEL EXPORTED", "success");
    } catch (err) {
      console.error(err);
      trigger("EXPORT ERROR", "error");
    }
  };

  const filteredLogs = useMemo(() => {
    return nutrition.filter(meal => {
      const matchesSearch = meal.name.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = activeFilter === "All" || meal.type === activeFilter;
      return matchesSearch && matchesFilter;
    });
  }, [nutrition, search, activeFilter]);

  const totalCal = nutritionStats.totalCalories || 0;
  const maintenance = 2500;
  const diff = totalCal - maintenance;

  const getCoachSuggestion = () => {
    if (totalCal === 0) return "Awaiting fuel entry to begin Bio-Sync analysis.";
    const pRatio = ((nutritionStats.totalProtein * 4) / (totalCal || 1)) * 100;
    let category = "neutral";

    if (diff > 100) {
      category = pRatio > 25 ? "surplus_high_protein" : "surplus_low_protein";
    } else if (diff < -100) {
      category = pRatio > 30 ? "deficit_high_protein" : "deficit_low_protein";
    }

    const options = COACH_INTEL.suggestions[category] || COACH_INTEL.suggestions.neutral;
    return options[Math.floor(Math.random() * options.length)];
  };

  const calculateAIProjection = () => {
    const weeklySurplus = diff * 7;
    const kgChange = (weeklySurplus / 7700).toFixed(2);
    const pRatio = ((nutritionStats.totalProtein * 4) / (totalCal || 1)) * 100;
    
    if (diff > 0) {
      return {
        label: "Muscle Growth",
        value: kgChange,
        status: pRatio > 30 ? "Lean Gaining" : "High Surplus Warning",
        color: "#FF7222"
      };
    } else {
      return {
        label: "Fat Loss",
        value: Math.abs(kgChange),
        status: "Incineration Active",
        color: "#10b981"
      };
    }
  };

  const ai = calculateAIProjection();

  const calculateEfficiency = () => {
    if (totalCal === 0) return 0;
    const proteinRatio = ((nutritionStats.totalProtein * 4) / totalCal) * 100;
    return Math.min(Math.round(proteinRatio * 3), 100) || 0;
  };

  const weeklyData = [
    { day: 'Mon', kcal: 2400 }, { day: 'Tue', kcal: 2800 }, { day: 'Wed', kcal: 2200 },
    { day: 'Thu', kcal: totalCal }, { day: 'Fri', kcal: 2600 }, { day: 'Sat', kcal: 3100 }, { day: 'Sun', kcal: 2500 }
  ];

  const radarData = [
    { subject: 'Protein', A: nutritionStats.totalProtein || 0 },
    { subject: 'Carbs', A: nutritionStats.totalCarbs || 0 },
    { subject: 'Fats', A: nutritionStats.totalFats || 0 },
  ];

  return (
    <div className="space-y-8 lg:space-y-12 pb-32 text-white selection:bg-[#FF7222] px-4 md:px-0">
      <TacticalBlade isVisible={notif.show} message={notif.msg} type={notif.type} />
      <ConfirmModal 
        isOpen={confirmDelete.show} 
        onClose={() => setConfirmDelete({show: false, id: null, name: ""})} 
        onConfirm={processDelete}
        itemName={confirmDelete.name}
      />
      <AnimatePresence>{loading && <BiometricLoader />}</AnimatePresence>

      {/* --- FLOATING COACH POPUP --- */}
      <AnimatePresence>
        {showCoachPopup && (
          <motion.div
            initial={{ x: 400, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 400, opacity: 0 }}
            className="fixed top-32 right-6 z-[2000] w-80 pointer-events-auto"
          >
            <div className="bg-[#0A0A0A] border-l-4 border-[#FF7222] p-6 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] border border-white/10 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF7222]/10 blur-3xl -z-10" />
               <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full border border-[#FF7222]/30 overflow-hidden bg-black">
                        <img src={COACH_INTEL.trainerImage} alt="Coach" className="w-full h-full object-cover scale-150" />
                    </div>
                    <div>
                        <h5 className="text-[#FF7222] font-[1000] italic text-[10px] tracking-widest uppercase">Coach Suggestion</h5>
                        <p className="text-[8px] text-gray-500 font-bold uppercase">Priority: High</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setShowCoachPopup(false)} className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-[10px] hover:bg-emerald-500 hover:text-white transition-all">✓</button>
                    <button onClick={() => setShowCoachPopup(false)} className="w-6 h-6 rounded-lg bg-red-500/20 text-red-500 flex items-center justify-center text-[10px] hover:bg-red-500 hover:text-white transition-all">✕</button>
                  </div>
               </div>
               <p className="text-gray-200 text-xs font-bold italic leading-relaxed uppercase tracking-tight mb-4 border-t border-white/5 pt-4">
                "{getCoachSuggestion()}"
               </p>
               <div className="flex items-center justify-between text-[7px] font-black text-gray-600 uppercase italic">
                  <span>Tactical Insight v4.0</span>
                  <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="text-[#FF7222]">Live Syncing...</motion.div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- DASHBOARD HEADER --- */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <Interactive3D className="xl:col-span-8">
          <div className="relative bg-[#050505] border border-white/10 p-6 lg:p-10 rounded-[3rem] lg:rounded-[4rem] overflow-hidden shadow-2xl">
            <div className="absolute -top-24 -left-24 w-80 h-80 bg-[#FF7222]/5 blur-[100px] rounded-full" />
            <div className="flex flex-col lg:flex-row items-center gap-10 relative z-10">
              <div className="relative w-64 h-64 lg:w-72 lg:h-72 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                        <PolarGrid stroke="#222" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#666', fontSize: 10, fontWeight: 900 }} />
                        <Radar name="Macros" dataKey="A" stroke="#FF7222" fill="#FF7222" fillOpacity={0.5} />
                    </RadarChart>
                </ResponsiveContainer>
                <div className="absolute flex flex-col items-center justify-center bg-black/80 w-24 h-24 rounded-full border border-white/10">
                  <h2 className="text-3xl font-[1000] italic leading-none">{totalCal}</h2>
                  <p className="text-[7px] font-black text-[#FF7222] uppercase tracking-widest">KCAL</p>
                </div>
              </div>
              <div className="flex-1 space-y-6 w-full">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div>
                        <h1 className="text-4xl lg:text-5xl font-[1000] italic uppercase leading-[0.8] tracking-tighter">BIO-FUEL<br/><span className="text-[#FF7222]">CONTROL</span></h1>
                        <p className="text-gray-500 font-bold uppercase text-[9px] mt-2 italic tracking-[0.2em]">Neural Network Active</p>
                    </div>
                    <div className="text-right bg-white/[0.03] p-5 rounded-[2rem] border border-[#FF7222]/20 backdrop-blur-md w-full md:w-auto">
                        <p className="text-[7px] font-black text-[#FF7222] uppercase mb-1 italic tracking-widest">AI Projection</p>
                        <div className="flex items-baseline justify-end gap-1">
                          <span className="text-3xl font-[1000] italic" style={{ color: ai.color }}>{ai.value}</span>
                          <span className="text-[10px] font-black opacity-40 italic">KG/WK</span>
                        </div>
                        <p className="text-[8px] font-bold text-gray-500 uppercase mt-1">{ai.label}</p>
                    </div>
                </div>
                <div className="space-y-3 bg-black/40 p-6 rounded-[2.5rem] border border-white/5 relative overflow-hidden">
                    <div className="flex justify-between items-end relative z-10">
                        <p className="text-[8px] font-black uppercase text-gray-500 italic">Efficiency: {calculateEfficiency()}%</p>
                        <p className={`text-xs font-[1000] italic ${diff > 0 ? 'text-[#FF7222]' : 'text-emerald-400'}`}>
                            {diff > 0 ? `SURPLUS: +${diff}` : `DEFICIT: ${diff}`}
                        </p>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min((totalCal/maintenance) * 100, 100)}%` }}
                            className={`h-full rounded-full ${diff > 0 ? 'bg-[#FF7222]' : 'bg-emerald-500'}`}
                        />
                    </div>
                    <p className="text-[7px] font-black uppercase text-gray-600 italic tracking-[0.3em]">{ai.status}</p>
                </div>
              </div>
            </div>
          </div>
        </Interactive3D>
        <div className="xl:col-span-4 grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-1 gap-4">
          {[
            {label: 'Protein', value: nutritionStats.totalProtein, color: '#3b82f6', icon: '🧬'},
            {label: 'Carbs', value: nutritionStats.totalCarbs, color: '#FF7222', icon: '⚡'},
            {label: 'Fats', value: nutritionStats.totalFats, color: '#eab308', icon: '🔋'}
          ].map((m, i) => (
            <div key={i} className="bg-[#0A0A0A] border border-white/5 p-6 rounded-[2rem] lg:rounded-[2.5rem] flex items-center justify-between group hover:border-white/20 transition-all">
                <div>
                    <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">{m.label}</p>
                    <h4 className="text-3xl lg:text-4xl font-[1000] italic">{m.value || 0}<span className="text-xs ml-1 opacity-30 text-white italic">g</span></h4>
                </div>
                <div style={{ color: m.color }} className="text-2xl opacity-50 group-hover:opacity-100 transition-opacity">{m.icon}</div>
            </div>
          ))}
        </div>
      </div>

      {/* --- WEEKLY FORECAST --- */}
      <Interactive3D className="w-full">
        <div className="bg-[#050505] border border-white/10 p-6 lg:p-10 rounded-[3rem] lg:rounded-[4rem] overflow-hidden">
            <div className="flex flex-col md:flex-row items-center justify-between mb-8 px-4 gap-4">
                <div>
                    <h3 className="text-3xl font-[1000] italic uppercase tracking-tighter text-white">Weekly <span className="text-[#FF7222]">Forecast</span></h3>
                    <p className="text-[9px] font-black text-gray-500 uppercase italic">Fuel Consumption over 7-Day Cycle</p>
                </div>
                <div className="bg-emerald-500/10 px-6 py-2 rounded-full border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase italic animate-pulse">
                    Live System Status: Stable
                </div>
            </div>
            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weeklyData}>
                        <defs>
                            <linearGradient id="colorKcal" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#FF7222" stopOpacity={0.3}/><stop offset="95%" stopColor="#FF7222" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#111" vertical={false} />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#444', fontSize: 10, fontWeight: 900}} />
                        <YAxis hide domain={[0, 4000]} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '15px' }}
                            itemStyle={{ color: '#FF7222', fontWeight: 1000 }}
                        />
                        <Area type="monotone" dataKey="kcal" stroke="#FF7222" strokeWidth={4} fillOpacity={1} fill="url(#colorKcal)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
      </Interactive3D>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        <div className="xl:col-span-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between px-4 gap-4">
              <div className="flex items-center gap-4">
                  <h3 className="text-3xl font-[1000] italic uppercase tracking-tighter text-white">Mission <span className="text-[#FF7222]">Logs</span></h3>
                  <button 
                    onClick={handleExportPDF}
                    className="p-2 bg-white/5 hover:bg-[#FF7222]/20 border border-white/10 rounded-lg transition-all group"
                    title="Export Intel"
                  >
                    <span className="text-[10px] font-black text-[#FF7222] group-hover:text-white uppercase px-2">Export PDF</span>
                  </button>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <input 
                  type="text" placeholder="SEARCH MISSION..." value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest focus:border-[#FF7222]/50 outline-none w-full sm:w-48 text-white"
                />
                <div className="flex bg-white/5 rounded-xl p-1 border border-white/10">
                  {["All", "Breakfast", "Lunch", "Dinner"].map(f => (
                    <button 
                      key={f} onClick={() => setActiveFilter(f)}
                      className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase transition-all ${activeFilter === f ? 'bg-[#FF7222] text-white' : 'text-gray-500 hover:text-white'}`}
                    >
                      {f === "Breakfast" ? "BRK" : f === "Lunch" ? "LCH" : f === "Dinner" ? "DNR" : "ALL"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2 pb-10">
                <AnimatePresence mode="popLayout">
                {filteredLogs.map((meal, index) => (
                    <motion.div layout initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} key={`meal-${meal._id || index}-${meal.name}`} className="bg-[#0A0A0A] border border-white/5 p-6 rounded-[2.5rem] flex items-center justify-between group">
                        <div className="flex items-center gap-4 lg:gap-6">
                            <div className="w-12 h-12 lg:w-14 lg:h-14 bg-[#FF7222]/5 border border-white/5 rounded-2xl flex flex-col items-center justify-center">
                                <span className="text-[7px] font-black text-gray-500 uppercase italic">{meal.time || '00:00'}</span>
                            </div>
                            <div>
                                <p className="text-[8px] font-black text-[#FF7222] uppercase tracking-widest">{meal.type}</p>
                                <h4 className="text-xl lg:text-2xl font-[1000] italic uppercase group-hover:translate-x-2 transition-transform">{meal.name}</h4>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 lg:gap-8 text-right">
                            <div>
                                <p className="text-xl lg:text-2xl font-[1000] italic text-white">+{meal.calories}</p>
                                <p className="text-[8px] font-black text-gray-600 uppercase">KCAL Unit</p>
                            </div>
                            <button onClick={() => setConfirmDelete({ show: true, id: meal._id, name: meal.name })} className="w-10 h-10 lg:w-12 lg:h-12 bg-red-500/5 text-red-500 border border-red-500/10 rounded-xl hover:bg-red-500 hover:text-white transition-all">✕</button>
                        </div>
                    </motion.div>
                ))}
                </AnimatePresence>
            </div>
        </div>

        {/* --- AI COACH CONTROL --- */}
        <div className="xl:col-span-4 space-y-8">
          <Interactive3D>
            <div className="bg-[#050505] border border-white/10 rounded-[3rem] p-8 pt-12 relative overflow-visible shadow-2xl">
              <div className="absolute -top-32 -right-4 z-20 pointer-events-none">
                <div className="relative w-48 h-56 lg:w-56 lg:h-64">
                  <motion.img 
                    initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8 }}
                    src={COACH_INTEL.trainerImage} alt="Elite Athlete" 
                    className="w-full h-full object-contain drop-shadow-[0_20px_40px_rgba(255,114,34,0.4)] scale-110" 
                  />
                  <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }} transition={{ duration: 4, repeat: Infinity }} className="absolute inset-0 bg-[#FF7222]/20 rounded-full blur-3xl -z-10" />
                </div>
              </div>
              <div className="space-y-6 pr-24 relative z-10">
                <div>
                  <h4 className="text-white font-[1000] italic uppercase text-2xl tracking-tighter leading-none">NEURAL<br/><span className="text-[#FF7222]">LINK</span></h4>
                  <p className="text-[7px] text-gray-500 font-black uppercase tracking-widest mt-2 italic">Connect to AI Mastermind</p>
                </div>
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setIsCoachActive(!isCoachActive)}
                        className={`group relative w-20 h-10 rounded-full p-1 transition-all duration-500 ${isCoachActive ? 'bg-[#FF7222]' : 'bg-white/5 border border-white/10'}`}
                    >
                        <motion.div animate={{ x: isCoachActive ? 40 : 0 }} className={`w-8 h-8 rounded-full shadow-xl flex items-center justify-center transition-colors ${isCoachActive ? 'bg-white' : 'bg-zinc-800'}`}>
                            <div className={`w-3 h-3 rounded-full ${isCoachActive ? 'bg-[#FF7222] animate-pulse' : 'bg-zinc-600'}`} />
                        </motion.div>
                        <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[6px] font-black text-gray-500 uppercase whitespace-nowrap">
                            {isCoachActive ? 'Protocol Active' : 'Offline'}
                        </span>
                    </button>
                    <div className="h-10 w-[1px] bg-white/10" />
                    <div className="flex flex-col">
                        <span className={`text-[10px] font-black italic ${isCoachActive ? 'text-emerald-500' : 'text-gray-600'}`}>{isCoachActive ? 'SYNCED' : 'READY'}</span>
                        <span className="text-[6px] text-gray-500 font-bold uppercase">v.4.0.2</span>
                    </div>
                </div>
              </div>
              <div className="mt-12 flex justify-between items-center px-1">
                <div className="flex gap-1">{[1,2,3,4].map(i => <div key={i} className="w-3 h-1 bg-white/5 rounded-full" />)}</div>
                <span className="text-[6px] font-black text-gray-600 uppercase italic tracking-widest">Bio-Link Secure Connection</span>
              </div>
            </div>
          </Interactive3D>

          {/* --- DEPLOY UNIT --- */}
          <Interactive3D className="sticky top-10">
            <div className="bg-white rounded-[3rem] lg:rounded-[4rem] p-8 lg:p-12 relative overflow-hidden shadow-2xl border-t-[12px] border-[#FF7222]">
              <div className="relative z-10 space-y-6">
                <h3 className="text-3xl lg:text-4xl font-[1000] italic uppercase leading-none text-black tracking-tighter underline decoration-[#FF7222]">DEPLOY UNIT</h3>
                <div className="space-y-4">
                  <div>
                    <input value={form.name} onChange={e => handleInputChange('name', e.target.value)} placeholder="UNIT DESIGNATION" className={`w-full bg-black/5 p-5 rounded-3xl text-black font-[1000] italic uppercase outline-none border-2 ${validationErrors.name ? 'border-red-500' : 'border-transparent focus:border-black/10'}`} />
                    {validationErrors.name && <p className="text-red-500 text-xs font-bold mt-1">{validationErrors.name}</p>}
                  </div>
                  <div>
                    <select value={form.type} onChange={e => handleInputChange('type', e.target.value)} className={`w-full bg-black text-white p-5 rounded-3xl font-[1000] italic uppercase text-xs cursor-pointer outline-none border-2 ${validationErrors.type ? 'border-red-500' : 'border-transparent'}`}>
                      {['Breakfast', 'Lunch', 'Dinner', 'Snacks'].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    {validationErrors.type && <p className="text-red-500 text-xs font-bold mt-1">{validationErrors.type}</p>}
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {['protein', 'carbs', 'fats'].map(key => (
                      <div key={key} className="bg-black/5 p-4 rounded-3xl text-center border border-black/5 hover:border-[#FF7222]/20 transition-colors">
                        <p className="text-[7px] font-black uppercase text-gray-400 mb-1">{key}</p>
                        <input value={form[key]} onChange={e => handleInputChange(key, e.target.value)} placeholder="0" className={`w-full bg-transparent text-center text-black font-[1000] text-xl outline-none border-2 ${validationErrors[key] ? 'border-red-500' : 'border-transparent'}`} />
                        {validationErrors[key] && <p className="text-red-500 text-[6px] font-bold mt-1">{validationErrors[key]}</p>}
                      </div>
                    ))}
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={addMeal} 
                    className="w-full bg-black py-7 rounded-[3rem] text-white font-[1000] italic uppercase text-xl transition-all shadow-2xl flex items-center justify-center gap-4 disabled:opacity-50"
                    disabled={loading}
                  >
                    SYNC CORE <span className="text-[#FF7222]">+</span>
                  </motion.button>
                </div>
              </div>
              <div className="absolute -bottom-8 -right-8 text-[10rem] lg:text-[12rem] font-black italic text-black/[0.03] select-none pointer-events-none uppercase">Fuel</div>
            </div>
          </Interactive3D>
        </div>
      </div>
    </div>
  );
};

export default NutritionModule;