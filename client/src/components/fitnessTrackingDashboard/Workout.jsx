import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { eliteData } from '../../assets/assets';
import WorkoutDetail from './WorkoutDetail';
import { useAppContext } from '../../context/useAppContext';

// --- 3D INTERACTIVE WRAPPER ---
const PerspectiveCard = ({ children, className }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 100, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 100, damping: 20 });
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["12deg", "-12deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-12deg", "12deg"]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={`relative group ${className}`}
    >
      <div style={{ transform: "translateZ(60px)" }} className="h-full">{children}</div>
      {/* Dynamic Ambient Glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#FF7222]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[inherit] pointer-events-none" />
    </motion.div>
  );
};

const LavishSelect = ({ label, options, value, onChange, placeholder, isEditMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative space-y-2">
      <div className="flex justify-between items-center ml-4">
        <p className={`text-[10px] font-black uppercase tracking-[0.3em] opacity-60 italic ${isEditMode ? 'text-black' : 'text-white'}`}>{label}</p>
        <div className={`h-[1px] flex-1 ml-4 bg-current opacity-20`} />
      </div>
      <div 
        onClick={() => setIsOpen(!isOpen)} 
        className={`w-full backdrop-blur-xl p-6 rounded-[2.5rem] cursor-pointer flex justify-between items-center border transition-all duration-500 shadow-2xl ${
          isEditMode 
          ? 'bg-black/10 border-black/20 hover:border-black' 
          : 'bg-white/5 border-white/10 hover:border-[#FF7222]/50'
        }`}
      >
        <span className={`font-[1000] italic uppercase text-sm tracking-widest ${!value ? 'opacity-30' : ''}`}>{value || placeholder}</span>
        <motion.span animate={{ rotate: isOpen ? 180 : 0 }} className={isEditMode ? "text-black" : "text-[#FF7222]"}>▼</motion.span>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10, scale: 0.95 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            exit={{ opacity: 0, y: -10, scale: 0.95 }} 
            className="absolute z-[100] w-full mt-3 bg-[#0a0a0a]/95 backdrop-blur-3xl border border-white/20 rounded-[2.5rem] shadow-[0_50px_100px_rgba(0,0,0,0.9)] overflow-hidden"
          >
            <div className="max-h-64 overflow-y-auto custom-scrollbar p-3">
              {options.map((opt) => (
                <motion.div 
                  key={opt} 
                  whileHover={{ backgroundColor: '#FF7222', x: 10, color: '#fff' }} 
                  onClick={() => { onChange(opt); setIsOpen(false); }} 
                  className={`p-5 rounded-2xl cursor-pointer font-black italic text-[11px] uppercase tracking-widest transition-all ${value === opt ? 'bg-white/10 text-[#FF7222]' : 'text-white/60'}`}
                >
                  {opt}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const WorkoutModule = () => {
  const { workouts, createWorkout, updateWorkout, deleteWorkout, completeWorkout } = useAppContext();
  const [activeWorkout, setActiveWorkout] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [form, setForm] = useState({ name: '', sets: '', reps: '', weight: '', notes: '', category: 'Strength', tag: 'Hypertrophy' });
  const [errors, setErrors] = useState({});

  const validExercises = eliteData.exerciseLibrary[form.category] || [];

  const validateForm = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'REQUIRED';
    if (!form.sets || isNaN(form.sets)) newErrors.sets = 'INVALID';
    if (!form.reps || isNaN(form.reps)) newErrors.reps = 'INVALID';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleAction = async () => {
    if (!validateForm()) return;
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);

    const workoutData = { ...form, sets: parseInt(form.sets), reps: parseInt(form.reps), weight: parseFloat(form.weight) || 0 };
    if (editingId) {
      await updateWorkout(editingId, workoutData);
      setEditingId(null);
    } else {
      await createWorkout(workoutData);
    }
    setForm({ name: '', sets: '', reps: '', weight: '', notes: '', category: 'Strength', tag: 'Hypertrophy' });
  };

  return (
    <div className="space-y-12 pb-24 select-none relative bg-transparent text-white min-h-screen">
      
      {/* --- TERMINAL OVERLAY EFFECT --- */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />

      {/* --- SUCCESS TERMINAL --- */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-xl pointer-events-none"
          >
            <motion.div 
              initial={{ scale: 0.5, y: 100 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 1.5, opacity: 0 }}
              className="bg-[#FF7222] p-24 rounded-[5rem] text-center shadow-[0_0_200px_rgba(255,114,34,0.4)] border-8 border-white/20"
            >
              <h2 className="text-9xl font-[1000] italic uppercase tracking-tighter text-white">SYNCED</h2>
              <div className="h-2 w-full bg-black/20 mt-4 overflow-hidden rounded-full">
                <motion.div initial={{ x: '-100%' }} animate={{ x: '100%' }} transition={{ duration: 1.5, repeat: Infinity }} className="h-full w-1/2 bg-white" />
              </div>
              <p className="text-sm font-black tracking-[1.5em] text-black mt-8">DATA DEPLOYMENT SUCCESSFUL</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>{activeWorkout && <WorkoutDetail workout={activeWorkout} onClose={() => setActiveWorkout(null)} onFinish={completeWorkout} />}</AnimatePresence>

      {/* --- TACTICAL HUD STATS --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
        {[
          { label: 'Active Missions', val: workouts.length, color: 'text-[#FF7222]', icon: '◈' },
          { label: 'Cleared Ops', val: workouts.filter(v => v.status === 'completed').length, color: 'text-green-400', icon: '✓' },
          { label: 'Neural Load', val: 'MAXIMUM', color: 'text-red-500', icon: '⚠' },
          { label: 'Sync Status', val: 'OPTIMAL', color: 'text-blue-400', icon: '🌐' }
        ].map((item, i) => (
          <motion.div key={i} whileHover={{ y: -8, scale: 1.02 }} className="bg-white/5 border border-white/10 p-8 rounded-[3rem] backdrop-blur-2xl shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-10 text-4xl opacity-10 font-black">{item.icon}</div>
            <p className="text-[10px] font-black uppercase text-gray-500 tracking-[0.4em] mb-4">{item.label}</p>
            <div className="flex items-baseline gap-2">
                <span className={`text-4xl font-[1000] italic uppercase tracking-tighter ${item.color}`}>{item.val}</span>
                <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 2 }} className={`w-2 h-2 rounded-full bg-current ${item.color}`} />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 px-4">
        {/* --- LEFT: MISSION LOGS --- */}
        <div className="xl:col-span-7 space-y-10">
          <div className="flex items-end gap-6 px-4">
            <h2 className="text-7xl font-[1000] italic uppercase tracking-tighter leading-none">Combat <span className="text-[#FF7222]">Logs</span></h2>
            <div className="h-[2px] flex-1 bg-gradient-to-r from-[#FF7222] to-transparent mb-2 opacity-30" />
          </div>
          
          <div className="space-y-8 max-h-[1000px] overflow-y-auto custom-scrollbar pr-6">
            <AnimatePresence mode="popLayout">
              {workouts.map((w) => (
                <PerspectiveCard key={w._id} className="w-full">
                  <motion.div 
                    layout 
                    initial={{ opacity: 0, scale: 0.9 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    className={`group relative p-12 rounded-[4.5rem] border-2 transition-all duration-700 ${
                        w.status === 'completed' 
                        ? 'bg-green-500/5 border-green-500/10 grayscale' 
                        : 'bg-white/5 border-white/10 hover:border-[#FF7222] shadow-[0_40px_80px_rgba(0,0,0,0.6)]'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row justify-between items-center gap-10">
                      <div className="flex-1 w-full space-y-6">
                        <div className="flex items-center gap-4">
                          <span className="text-[9px] font-black bg-[#FF7222] text-white px-5 py-2 rounded-full uppercase italic tracking-widest">{w.category}</span>
                          <span className={`text-[9px] font-black uppercase italic tracking-[0.2em] ${w.status === 'completed' ? 'text-green-400' : 'text-gray-500'}`}>// {w.tag}</span>
                        </div>
                        <h3 className={`text-6xl font-[1000] italic uppercase tracking-tighter leading-none group-hover:tracking-normal transition-all duration-500 ${w.status === 'completed' ? 'line-through opacity-40' : ''}`}>{w.name}</h3>
                        <div className="flex gap-12 pt-4">
                            <div className="space-y-1"><p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Sets</p><p className="text-3xl font-[1000] italic">{w.sets}</p></div>
                            <div className="space-y-1"><p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Reps</p><p className="text-3xl font-[1000] italic">{w.reps}</p></div>
                            <div className="space-y-1"><p className="text-[9px] font-black text-[#FF7222] uppercase tracking-widest">Load</p><p className="text-3xl font-[1000] italic">{w.weight}<span className="text-xs ml-1 opacity-50">KG</span></p></div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 w-full lg:w-auto">
                        {w.status !== 'completed' && (
                          <motion.button 
                            whileHover={{ scale: 1.05, letterSpacing: "0.2em" }} 
                            whileTap={{ scale: 0.9 }} 
                            onClick={() => setActiveWorkout(w)} 
                            className="flex-1 lg:flex-none bg-[#FF7222] text-white h-24 px-16 rounded-[2.5rem] font-[1000] italic uppercase text-lg shadow-[0_20px_40px_rgba(255,114,34,0.3)]"
                          >
                            ENGAGE
                          </motion.button>
                        )}
                        <div className="flex flex-col gap-3">
                          <button onClick={() => {setEditingId(w._id); setForm(w);}} className="w-16 h-16 bg-white/5 rounded-[1.5rem] flex items-center justify-center hover:bg-white hover:text-black transition-all border border-white/10 group-hover:border-white/40">✎</button>
                          <button onClick={() => deleteWorkout(w._id)} className="w-16 h-16 bg-red-500/10 text-red-500 rounded-[1.5rem] flex items-center justify-center hover:bg-red-500 hover:text-white transition-all border border-red-500/20">✕</button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </PerspectiveCard>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* --- RIGHT: 3D DEPLOYMENT HUB --- */}
        <div className="xl:col-span-5">
          <PerspectiveCard className="sticky top-10">
            <motion.div 
              layout 
              className={`p-14 rounded-[5.5rem] relative overflow-hidden transition-all duration-1000 shadow-[0_50px_100px_rgba(0,0,0,0.5)] border-2 ${
                editingId ? 'bg-white text-black border-white' : 'bg-[#0f0f0f] text-white border-white/10'
              }`}
            >
              <div className="relative z-10 space-y-10">
                <div className="space-y-3">
                    <h2 className="text-8xl font-[1000] italic uppercase leading-[0.75] tracking-tighter">
                      {editingId ? 'REWRITE\nCORE' : 'DEPLOY\nFORCE'}
                    </h2>
                    <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: 120 }} 
                        className={`h-2 rounded-full ${editingId ? 'bg-black' : 'bg-[#FF7222]'}`} 
                    />
                </div>

                <div className="space-y-7">
                  <LavishSelect isEditMode={editingId} label="Sector Category" options={Object.keys(eliteData.exerciseLibrary)} value={form.category} onChange={(val) => handleInputChange('category', val)} />
                  <LavishSelect isEditMode={editingId} label="Unit Designation" options={validExercises} value={form.name} placeholder="SELECT UNIT" onChange={(val) => handleInputChange('name', val)} />
                  
                  <div className="grid grid-cols-3 gap-5">
                    {['sets', 'reps', 'weight'].map((key) => (
                      <div key={key} className="space-y-3">
                        <p className={`text-[10px] font-[1000] uppercase opacity-50 text-center italic tracking-widest`}>{key}</p>
                        <input 
                          value={form[key]} 
                          onChange={(e) => handleInputChange(key, e.target.value)} 
                          placeholder="00" 
                          className={`w-full p-8 rounded-[2.5rem] outline-none font-[1000] text-center text-3xl transition-all border-2 ${
                            editingId 
                            ? 'bg-black/5 border-transparent focus:border-black/20 text-black' 
                            : 'bg-white/5 border-transparent focus:border-[#FF7222]/50 text-white'
                          } ${errors[key] ? 'border-red-500 animate-bounce' : ''}`} 
                        />
                      </div>
                    ))}
                  </div>

                  <div className="space-y-5">
                    <input 
                        value={form.tag} 
                        onChange={(e) => handleInputChange('tag', e.target.value)} 
                        placeholder="NEURAL TAG (e.g. UPPER BODY)" 
                        className={`w-full p-7 rounded-[2.5rem] outline-none font-black italic uppercase text-[11px] tracking-[0.3em] border transition-all ${
                            editingId ? 'bg-black/5 border-black/10 focus:border-black' : 'bg-white/5 border-white/10 focus:border-[#FF7222]'
                        }`} 
                    />
                    <textarea 
                        value={form.notes} 
                        onChange={(e) => handleInputChange('notes', e.target.value)} 
                        placeholder="MISSION INTEL & OBJECTIVES..." 
                        className={`w-full p-8 rounded-[3rem] outline-none h-32 resize-none font-bold italic text-xs border transition-all ${
                            editingId ? 'bg-black/5 border-black/10 focus:border-black' : 'bg-white/5 border-white/10 focus:border-[#FF7222]'
                        }`} 
                    />
                  </div>

                  <motion.button 
                    whileHover={{ scale: 1.02, letterSpacing: "0.15em", boxShadow: editingId ? "0 20px 40px rgba(0,0,0,0.1)" : "0 20px 40px rgba(255,114,34,0.4)" }} 
                    whileTap={{ scale: 0.97 }} 
                    onClick={handleAction} 
                    className={`w-full py-10 rounded-[3.5rem] font-[1000] italic uppercase text-3xl transition-all ${
                        editingId ? 'bg-black text-white' : 'bg-[#FF7222] text-white shadow-xl'
                    }`}
                  >
                    {editingId ? 'OVERWRITE MISSION ✓' : 'EXECUTE SEQUENCE +'}
                  </motion.button>
                </div>
              </div>

              {/* Decorative Background HUD Elements */}
              <div className="absolute top-0 right-0 p-10 opacity-10 pointer-events-none">
                 <div className="w-32 h-32 border-t-4 border-r-4 border-current rounded-tr-[4rem]" />
              </div>
              <div className="absolute bottom-[-5%] left-[-5%] w-80 h-80 bg-[#FF7222]/10 rounded-full blur-[120px] pointer-events-none" />
            </motion.div>
          </PerspectiveCard>
        </div>
      </div>
    </div>
  );
};

export default WorkoutModule;