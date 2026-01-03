import React, { useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';

// --- CUSTOM 3D BLADE NOTIFICATION ---
const TacticalBlade = ({ message, type, isVisible }) => (
  <AnimatePresence>
    {isVisible && (
      <motion.div
        initial={{ x: 300, opacity: 0, rotateY: 90, skewX: -20 }}
        animate={{ x: 0, opacity: 1, rotateY: 0, skewX: 0 }}
        exit={{ x: 300, opacity: 0, filter: 'blur(20px)' }}
        className={`fixed top-20 right-10 z-[1000] p-1 rounded-br-[3rem] border-r-8 shadow-[0_30px_60px_rgba(0,0,0,0.5)] backdrop-blur-3xl bg-gradient-to-r ${
          type === 'success' ? 'from-emerald-500/20 to-emerald-900/40 border-emerald-500 text-emerald-400' :
          'from-red-500/20 to-red-900/40 border-red-500 text-red-400'
        }`}
      >
        <div className="flex items-center gap-6 px-8 py-6">
          <div className="text-4xl font-[1000] italic animate-pulse">{type === 'success' ? '⚡' : '⚠'}</div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-50 italic">Neural Log Update</p>
            <p className="text-2xl font-[1000] italic uppercase tracking-tighter">{message}</p>
          </div>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

// --- 3D INTERACTIVE WRAPPER ---
const Interactive3D = ({ children, className }) => {
  const x = useMotionValue(0); const y = useMotionValue(0);
  const mX = useSpring(x, { stiffness: 100, damping: 20 });
  const mY = useSpring(y, { stiffness: 100, damping: 20 });
  const rotateX = useTransform(mY, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mX, [-0.5, 0.5], ["-15deg", "15deg"]);

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
  const [meals, setMeals] = useState([
    { id: 1, name: 'Whey Isolate + Oats', calories: 450, protein: 40, carbs: 55, fats: 8, time: '08:00 AM', type: 'Breakfast' },
    { id: 2, name: 'Grilled Chicken & Quinoa', calories: 650, protein: 55, carbs: 45, fats: 12, time: '01:30 PM', type: 'Lunch' },
  ]);

  const [form, setForm] = useState({ name: '', protein: '', carbs: '', fats: '', type: 'Breakfast' });
  const [notif, setNotif] = useState({ show: false, msg: '', type: '' });

  const trigger = (msg, type) => {
    setNotif({ show: true, msg, type });
    setTimeout(() => setNotif(p => ({ ...p, show: false })), 3000);
  };

  const addMeal = () => {
    if (!form.name || !form.protein) return trigger("Invalid Credentials", "error");
    const cal = (Number(form.protein) * 4) + (Number(form.carbs) * 4) + (Number(form.fats) * 9);
    setMeals([{ ...form, id: Date.now(), calories: cal, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }, ...meals]);
    setForm({ name: '', protein: '', carbs: '', fats: '', type: 'Breakfast' });
    trigger("Fuel Cell Deployed", "success");
  };

  const totalCal = meals.reduce((a, b) => a + b.calories, 0);

  return (
    <div className="space-y-16 pb-32 text-white selection:bg-[#FF7222]">
      <TacticalBlade isVisible={notif.show} message={notif.msg} type={notif.type} />

      {/* --- HEADER: 3D HOLOGRAPHIC CORE --- */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start">
        
        <Interactive3D className="xl:col-span-7 relative group">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#FF7222]/20 to-transparent blur-[120px] rounded-full animate-pulse" />
          <div className="relative bg-black/40 border-t border-l border-white/20 p-16 rounded-[5rem] backdrop-blur-3xl overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.5)]">
            
            {/* Holographic Ring Decor */}
            <motion.div 
              animate={{ rotate: 360 }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-white/5 rounded-full border-dashed"
            />

            <div className="flex flex-col lg:flex-row items-center gap-16 relative z-10" style={{ transform: "translateZ(60px)" }}>
              <div className="relative w-64 h-64">
                <svg className="w-full h-full -rotate-90 drop-shadow-[0_0_20px_rgba(255,114,34,0.4)]">
                  <circle cx="128" cy="128" r="115" stroke="rgba(255,255,255,0.03)" strokeWidth="25" fill="transparent" />
                  <motion.circle 
                    cx="128" cy="128" r="115" stroke="#FF7222" strokeWidth="25" fill="transparent"
                    strokeDasharray="722" initial={{ strokeDashoffset: 722 }}
                    animate={{ strokeDashoffset: 722 - (722 * (totalCal / 3000)) }}
                    transition={{ duration: 2, ease: "circOut" }} strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-[10px] font-black tracking-[0.5em] text-gray-500 uppercase italic">Saturation</p>
                  <h2 className="text-7xl font-[1000] italic leading-none">{totalCal}</h2>
                  <p className="text-xs font-black text-[#FF7222] tracking-widest mt-2">KCAL TOTAL</p>
                </div>
              </div>

              <div className="space-y-6 flex-1">
                <h1 className="text-6xl font-[1000] italic uppercase leading-[0.8] tracking-tighter">Bio-Fuel<br/><span className="text-[#FF7222]">Analysis</span></h1>
                <div className="h-[2px] w-32 bg-gradient-to-r from-[#FF7222] to-transparent" />
                <p className="text-gray-400 font-bold italic text-sm max-w-xs">Real-time molecular tracking of macronutrient deployment across the system.</p>
              </div>
            </div>
          </div>
        </Interactive3D>

        {/* --- MACRO CUBES --- */}
        <div className="xl:col-span-5 grid grid-cols-1 gap-4">
          {[{l: 'Protein', v: '185g', c: 'border-blue-500/50'}, {l: 'Carbs', v: '210g', c: 'border-[#FF7222]/50'}, {l: 'Fats', v: '65g', c: 'border-yellow-500/50'}].map((m, i) => (
            <Interactive3D key={i} className={`bg-white/5 border-l-4 ${m.c} p-8 rounded-[2.5rem] backdrop-blur-xl hover:bg-white/10 transition-all`}>
              <div className="flex justify-between items-center" style={{ transform: "translateZ(40px)" }}>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 mb-1">{m.l}</p>
                  <h4 className="text-4xl font-[1000] italic uppercase tracking-tighter">{m.v}</h4>
                </div>
                <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center opacity-20">⚡</div>
              </div>
            </Interactive3D>
          ))}
        </div>
      </div>

      {/* --- BODY: LOGS & COMMANDER --- */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
        <div className="xl:col-span-8 space-y-8">
          <div className="flex items-center gap-6 px-4">
            <h3 className="text-4xl font-[1000] italic uppercase tracking-tighter">Tactical <span className="text-[#FF7222]">Logs</span></h3>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-white/20 to-transparent" />
          </div>

          <AnimatePresence mode="popLayout">
            {meals.map((meal) => (
              <Interactive3D key={meal.id} className="relative group overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-[#FF7222]/0 to-[#FF7222]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="bg-white/[0.02] border border-white/10 p-10 rounded-[4rem] flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
                  <div className="flex items-center gap-10" style={{ transform: "translateZ(30px)" }}>
                    <div className="text-center bg-black p-5 rounded-[2.5rem] border border-white/10 shadow-2xl">
                      <p className="text-[8px] font-black text-gray-500 uppercase italic">Time</p>
                      <p className="text-xl font-[1000] italic text-[#FF7222]">{meal.time}</p>
                    </div>
                    <div>
                      <span className="text-[9px] font-black bg-[#FF7222] text-black px-4 py-1 rounded-full italic uppercase tracking-widest">{meal.type}</span>
                      <h4 className="text-4xl font-[1000] italic uppercase mt-2 group-hover:translate-x-4 transition-transform duration-500">{meal.name}</h4>
                    </div>
                  </div>
                  <div className="flex items-center gap-12 bg-black/40 p-6 rounded-[3rem] border border-white/10" style={{ transform: "translateZ(50px)" }}>
                    <div className="text-center">
                      <p className="text-4xl font-[1000] italic leading-none">+{meal.calories}</p>
                      <p className="text-[10px] font-black text-[#FF7222] tracking-[0.3em] mt-1 uppercase">Stored KCAL</p>
                    </div>
                    <button onClick={() => setMeals(meals.filter(m => m.id !== meal.id))} className="w-14 h-14 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all text-2xl shadow-lg shadow-red-500/20">✕</button>
                  </div>
                </div>
              </Interactive3D>
            ))}
          </AnimatePresence>
        </div>

        {/* --- THE COMMANDER (3D FORM) --- */}
        <div className="xl:col-span-4">
          <Interactive3D className="sticky top-10">
            <div className="bg-white p-14 rounded-[5.5rem] relative overflow-hidden shadow-[0_60px_120px_rgba(0,0,0,0.6)]">
              {/* Back Texture Decorative */}
              <div className="absolute -bottom-10 -right-10 text-[15rem] font-black italic text-black/[0.03] select-none uppercase">MACRO</div>
              
              <div className="relative z-10 space-y-8" style={{ transform: "translateZ(60px)" }}>
                <h3 className="text-5xl font-[1000] italic uppercase leading-[0.85] text-black">INITIALIZE<br/><span className="text-[#FF7222]">DEPLOYMENT</span></h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase text-gray-400 ml-4 italic">Designation</p>
                    <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="MEAL TYPE..." className="w-full bg-black/5 p-6 rounded-[2.5rem] text-black font-[1000] italic uppercase text-lg outline-none border-2 border-transparent focus:border-black/10 transition-all" />
                  </div>

                  <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="w-full bg-black text-white p-6 rounded-[2.5rem] font-black italic uppercase outline-none appearance-none cursor-pointer hover:bg-gray-900 transition-all">
                    {['Breakfast', 'Lunch', 'Dinner', 'Snacks'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>

                  <div className="grid grid-cols-3 gap-3">
                    {['protein', 'carbs', 'fats'].map(key => (
                      <div key={key} className="bg-black/5 p-4 rounded-3xl text-center">
                        <p className="text-[8px] font-black uppercase text-gray-400 mb-1">{key.slice(0, 3)}</p>
                        <input value={form[key]} onChange={e => setForm({...form, [key]: e.target.value})} placeholder="0" className="w-full bg-transparent text-center text-black font-[1000] text-2xl outline-none" />
                      </div>
                    ))}
                  </div>

                  <motion.button 
                    whileHover={{ scale: 1.05, translateZ: 40 }} whileTap={{ scale: 0.95 }}
                    onClick={addMeal}
                    className="w-full bg-[#FF7222] py-8 rounded-[3rem] text-white font-[1000] italic uppercase text-2xl shadow-2xl shadow-orange-500/40 mt-6"
                  >
                    DEPLOY UNIT +
                  </motion.button>
                  <p className="text-center text-[8px] font-black text-gray-300 uppercase tracking-[0.5em] italic">Awaiting Bio-Metric Confirmation</p>
                </div>
              </div>
            </div>
          </Interactive3D>
        </div>
      </div>
    </div>
  );
};

export default NutritionModule;