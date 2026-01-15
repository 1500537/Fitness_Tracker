import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useAppContext } from '../../context/useAppContext';

// --- 1. ENHANCED 3D BIOMETRIC LOADER ---
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
        className={`fixed top-10 right-10 z-[1000] p-[2px] rounded-br-[2rem] bg-gradient-to-r ${
          type === 'success' ? 'from-emerald-500 to-transparent' : 'from-red-500 to-transparent'
        }`}
      >
        <div className="bg-black/90 backdrop-blur-2xl px-8 py-4 rounded-br-[2rem] flex items-center gap-4 border-l-4 border-white/20">
          <span className="text-2xl">{type === 'success' ? '⚡' : '⚠'}</span>
          <p className="text-lg font-[1000] italic uppercase tracking-tighter">{message}</p>
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

  useEffect(() => { fetchNutrition(); fetchNutritionStats(); }, []);

  const trigger = (msg, type) => {
    setNotif({ show: true, msg, type });
    setTimeout(() => setNotif(p => ({ ...p, show: false })), 3000);
  };

  const addMeal = async () => {
    if (!form.name || !form.protein) return trigger("INVALID INTEL", "error");
    const result = await addNutritionEntry({ ...form, carbs: form.carbs || 0, fats: form.fats || 0 });
    if (result) {
      setForm({ name: '', protein: '', carbs: '', fats: '', type: 'Breakfast' });
      trigger("FUEL DEPLOYED", "success");
    }
  };

  const totalCal = nutritionStats.totalCalories || 0;
  const maintenance = 2500;
  const diff = totalCal - maintenance;

  // AI PROJECTION LOGIC
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
    <div className="space-y-12 pb-32 text-white selection:bg-[#FF7222]">
      <TacticalBlade isVisible={notif.show} message={notif.msg} type={notif.type} />
      <AnimatePresence>{loading && <BiometricLoader />}</AnimatePresence>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <Interactive3D className="xl:col-span-8">
          <div className="relative bg-[#050505] border border-white/10 p-10 rounded-[4rem] overflow-hidden shadow-2xl">
            <div className="absolute -top-24 -left-24 w-80 h-80 bg-[#FF7222]/5 blur-[100px] rounded-full" />
            
            <div className="flex flex-col lg:flex-row items-center gap-10 relative z-10">
              <div className="relative w-72 h-72 flex items-center justify-center">
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

              <div className="flex-1 space-y-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-5xl font-[1000] italic uppercase leading-[0.8] tracking-tighter">BIO-FUEL<br/><span className="text-[#FF7222]">CONTROL</span></h1>
                        <p className="text-gray-500 font-bold uppercase text-[9px] mt-2 italic tracking-[0.2em]">AI Sync Active</p>
                    </div>
                    {/* --- AI PROJECTION WIDGET --- */}
                    <div className="text-right bg-white/[0.03] p-5 rounded-[2rem] border border-[#FF7222]/20 backdrop-blur-md">
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

        <div className="xl:col-span-4 grid grid-cols-1 gap-4">
          {[
            {label: 'Protein', value: nutritionStats.totalProtein, color: '#3b82f6', icon: '🧬'},
            {label: 'Carbs', value: nutritionStats.totalCarbs, color: '#FF7222', icon: '⚡'},
            {label: 'Fats', value: nutritionStats.totalFats, color: '#eab308', icon: '🔋'}
          ].map((m, i) => (
            <div key={i} className="bg-[#0A0A0A] border border-white/5 p-6 rounded-[2.5rem] flex items-center justify-between group hover:border-white/20 transition-all">
                <div>
                    <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">{m.label}</p>
                    <h4 className="text-4xl font-[1000] italic">{m.value || 0}<span className="text-xs ml-1 opacity-30 text-white italic">g</span></h4>
                </div>
                <div style={{ color: m.color }} className="text-2xl opacity-50 group-hover:opacity-100 transition-opacity">{m.icon}</div>
            </div>
          ))}
        </div>
      </div>

      {/* --- WEEKLY FUEL FORECAST (GRAPH PRESERVED) --- */}
      <Interactive3D className="w-full">
        <div className="bg-[#050505] border border-white/10 p-10 rounded-[4rem] overflow-hidden">
            <div className="flex items-center justify-between mb-8 px-4">
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
                                <stop offset="5%" stopColor="#FF7222" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#FF7222" stopOpacity={0}/>
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
            <h3 className="text-3xl font-[1000] italic uppercase px-4 tracking-tighter text-white">Mission <span className="text-[#FF7222]">Logs</span></h3>
            <div className="grid grid-cols-1 gap-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                <AnimatePresence mode="popLayout">
                {nutrition.map((meal) => (
                    <motion.div layout key={meal._id} className="bg-[#0A0A0A] border border-white/5 p-6 rounded-[2.5rem] flex items-center justify-between group">
                        <div className="flex items-center gap-6">
                            <div className="w-14 h-14 bg-[#FF7222]/5 border border-white/5 rounded-2xl flex flex-col items-center justify-center">
                                <span className="text-[7px] font-black text-gray-500 uppercase italic">{meal.time}</span>
                            </div>
                            <div>
                                <p className="text-[8px] font-black text-[#FF7222] uppercase tracking-widest">{meal.type}</p>
                                <h4 className="text-2xl font-[1000] italic uppercase group-hover:translate-x-2 transition-transform">{meal.name}</h4>
                            </div>
                        </div>
                        <div className="flex items-center gap-8 text-right">
                            <div>
                                <p className="text-2xl font-[1000] italic text-white">+{meal.calories}</p>
                                <p className="text-[8px] font-black text-gray-600 uppercase">KCAL Unit</p>
                            </div>
                            <button onClick={() => deleteNutritionEntry(meal._id)} className="w-12 h-12 bg-red-500/5 text-red-500 border border-red-500/10 rounded-xl hover:bg-red-500 hover:text-white transition-all">✕</button>
                        </div>
                    </motion.div>
                ))}
                </AnimatePresence>
            </div>
        </div>

        <div className="xl:col-span-4">
          <Interactive3D className="sticky top-10">
            <div className="bg-white rounded-[4rem] p-12 relative overflow-hidden shadow-2xl border-t-[12px] border-[#FF7222]">
              <div className="relative z-10 space-y-6">
                <h3 className="text-4xl font-[1000] italic uppercase leading-none text-black tracking-tighter underline decoration-[#FF7222]">DEPLOY UNIT</h3>
                
                <div className="space-y-4">
                  <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="UNIT DESIGNATION" className="w-full bg-black/5 p-5 rounded-3xl text-black font-[1000] italic uppercase outline-none border-2 border-transparent focus:border-black/10" />
                  
                  <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="w-full bg-black text-white p-5 rounded-3xl font-[1000] italic uppercase text-xs cursor-pointer outline-none">
                    {['Breakfast', 'Lunch', 'Dinner', 'Snacks'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>

                  <div className="grid grid-cols-3 gap-3">
                    {['protein', 'carbs', 'fats'].map(key => (
                      <div key={key} className="bg-black/5 p-4 rounded-3xl text-center border border-black/5 hover:border-[#FF7222]/20 transition-colors">
                        <p className="text-[7px] font-black uppercase text-gray-400 mb-1">{key}</p>
                        <input value={form[key]} onChange={e => setForm({...form, [key]: e.target.value})} placeholder="0" className="w-full bg-transparent text-center text-black font-[1000] text-xl outline-none" />
                      </div>
                    ))}
                  </div>

                  <motion.button 
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={addMeal} 
                    className="w-full bg-black py-7 rounded-[3rem] text-white font-[1000] italic uppercase text-xl transition-all shadow-2xl flex items-center justify-center gap-4"
                  >
                    SYNC CORE <span className="text-[#FF7222]">+</span>
                  </motion.button>
                </div>
              </div>
              <div className="absolute -bottom-8 -right-8 text-[12rem] font-black italic text-black/[0.03] select-none pointer-events-none uppercase">Fuel</div>
            </div>
          </Interactive3D>
        </div>
      </div>
    </div>
  );
};

export default NutritionModule;