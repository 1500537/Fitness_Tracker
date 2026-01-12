import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { eliteData } from '../../assets/assets';
import WorkoutDetail from './WorkoutDetail';

// --- LAVISH CUSTOM SELECT COMPONENT ---
const LavishSelect = ({ label, options, value, onChange, themeColor, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative space-y-1">
      <p className="text-[9px] font-black uppercase opacity-60 ml-4 italic">{label}</p>
      <div onClick={() => setIsOpen(!isOpen)} className="w-full bg-black/5 p-5 rounded-3xl cursor-pointer flex justify-between items-center group border-2 border-transparent hover:border-black/10 transition-all">
        <span className={`font-[1000] italic uppercase text-sm tracking-widest ${!value ? 'opacity-20' : ''}`}>{value || placeholder}</span>
        <motion.span animate={{ rotate: isOpen ? 180 : 0 }} className="text-xs">▼</motion.span>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }} className="absolute z-[60] w-full mt-2 bg-white/90 backdrop-blur-3xl border border-white/20 rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.3)] overflow-hidden">
            <div className="max-h-60 overflow-y-auto custom-scrollbar">
              {options.map((opt) => (
                <motion.div key={opt} whileHover={{ x: 10, backgroundColor: themeColor, color: '#fff' }} onClick={() => { onChange(opt); setIsOpen(false); }} className={`p-5 cursor-pointer font-[1000] italic text-[11px] uppercase border-b border-black/5 last:border-none transition-all ${value === opt ? 'bg-black/5' : ''}`}>{opt}</motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const WorkoutModule = () => {
  const [workouts, setWorkouts] = useState(eliteData.workouts.map(w => ({ ...w, status: 'pending' })));
  const [activeWorkout, setActiveWorkout] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false); // SUCCESS ANIMATION STATE
  const [form, setForm] = useState({ name: '', sets: '', reps: '', weight: '', notes: '', category: 'Strength', tag: 'Hypertrophy' });

  const currentExercises = eliteData.exerciseLibrary[form.category] || [];

  useEffect(() => {
    if (!currentExercises.includes(form.name) && !editingId) {
      setForm(prev => ({ ...prev, name: '' }));
    }
  }, [form.category]);

  const handleAction = () => {
    if (!form.name || !form.sets) return;
    
    // Trigger Animation
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);

    if (editingId) {
      setWorkouts(workouts.map(w => w.id === editingId ? { ...form, id: editingId, status: 'pending' } : w));
      setEditingId(null);
    } else {
      setWorkouts([{ ...form, id: Date.now(), status: 'pending' }, ...workouts]);
    }
    setForm({ name: '', sets: '', reps: '', weight: '', notes: '', category: 'Strength', tag: 'Hypertrophy' });
  };

  const handleFinish = (id) => {
    setWorkouts(prev => prev.map(w => w.id === id ? { ...w, status: 'completed' } : w));
    setActiveWorkout(null);
  };

  return (
    <div className="space-y-12 pb-24 select-none relative">
      
      {/* --- WORKOUT ADDED SUCCESS OVERLAY --- */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center pointer-events-none"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 1.1, opacity: 0 }}
              className="bg-black/90 backdrop-blur-2xl border border-white/20 p-10 rounded-[3rem] text-center shadow-[0_0_100px_rgba(255,114,34,0.3)]"
            >
              <div className="w-20 h-20 bg-[#FF7222] rounded-full mx-auto mb-6 flex items-center justify-center text-white text-4xl shadow-[0_0_30px_#FF7222]">✓</div>
              <h2 className="text-4xl font-[1000] italic uppercase tracking-tighter text-white">DATA DEPLOYED</h2>
              <p className="text-[10px] font-black text-[#FF7222] uppercase tracking-[0.4em] mt-2">Tactical Database Updated</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>{activeWorkout && <WorkoutDetail workout={activeWorkout} onClose={() => setActiveWorkout(null)} onFinish={handleFinish} />}</AnimatePresence>

      {/* --- TOP HUD --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[{ label: 'Tactical Routines', val: workouts.length, color: 'text-[#FF7222]' }, { label: 'Completed', val: workouts.filter(v => v.status === 'completed').length, color: 'text-green-500' }, { label: 'System Load', val: 'Elite', color: 'text-blue-500' }, { label: 'Core', val: 'Pulse', color: 'text-white' }].map((item, i) => (
          <div key={i} className="bg-white/5 border border-white/10 p-5 rounded-3xl backdrop-blur-md">
            <p className="text-[8px] font-black uppercase text-gray-500 tracking-[0.4em] mb-1">{item.label}</p>
            <span className={`text-2xl font-[1000] italic uppercase ${item.color}`}>{item.val}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        <div className="xl:col-span-7 space-y-6">
          <h2 className="text-4xl font-[1000] italic uppercase tracking-tighter px-2">Tactical <span className="text-[#FF7222]">Database</span></h2>
          <AnimatePresence mode="popLayout">
            {workouts.map((w) => (
              <motion.div key={w.id} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.9 }} className={`group relative p-8 rounded-[3.5rem] border transition-all duration-500 ${w.status === 'completed' ? 'bg-green-500/5 border-green-500/20 opacity-50' : 'bg-white/5 border-white/10 hover:border-white/30'}`}>
                <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
                  <div className="flex-1 w-full text-left">
                    <div className="flex gap-2 mb-3">
                      <span className="text-[8px] font-black bg-white/10 px-3 py-1 rounded-full uppercase italic text-white/50">{w.category}</span>
                      <span className={`text-[8px] font-black uppercase tracking-[0.2em] italic ${w.status === 'completed' ? 'text-green-500' : 'text-[#FF7222]'}`}>{w.status === 'completed' ? 'MISSION ACCOMPLISHED' : w.tag}</span>
                    </div>
                    <h3 className={`text-4xl font-[1000] italic uppercase tracking-tighter leading-none ${w.status === 'completed' ? 'line-through' : ''}`}>{w.name}</h3>
                  </div>
                  
                  <div className="flex items-center gap-4 w-full lg:w-auto">
                    {w.status !== 'completed' && (
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setActiveWorkout(w)} className="flex-1 lg:flex-none bg-white text-black h-16 px-8 rounded-2xl font-[1000] italic uppercase text-xs hover:bg-[#FF7222] hover:text-white transition-all shadow-xl">Start Mission</motion.button>
                    )}
                    <button onClick={() => setEditingId(w.id) || setForm(w)} className="w-12 h-16 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-white hover:text-black transition-all">✎</button>
                    <button onClick={() => setWorkouts(workouts.filter(v => v.id !== w.id))} className="w-12 h-16 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">✕</button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="xl:col-span-5">
          <motion.div layout className={`sticky top-10 p-10 rounded-[4rem] relative overflow-hidden transition-all duration-700 ${editingId ? 'bg-[#FF7222] text-black shadow-[#FF7222]/20' : 'bg-white text-black'}`}>
            <div className="relative z-10 space-y-6">
              <h2 className="text-5xl font-[1000] italic uppercase leading-[0.8] tracking-tighter">{editingId ? 'MODULATE\nCORE' : 'DEPLOY\nFORCE'}</h2>
              <div className="space-y-4">
                <LavishSelect label="1. Category" options={Object.keys(eliteData.exerciseLibrary)} value={form.category} onChange={(val) => setForm({...form, category: val})} themeColor={editingId ? '#000' : '#FF7222'} />
                <LavishSelect label="2. Designation" options={currentExercises} value={form.name} placeholder="SELECT EXERCISE" onChange={(val) => setForm({...form, name: val})} themeColor={editingId ? '#000' : '#FF7222'} />
                <div className="grid grid-cols-3 gap-3">
                  {['sets', 'reps', 'weight'].map((key) => (
                    <div key={key} className="space-y-1">
                      <p className="text-[8px] font-black uppercase opacity-60 text-center">{key}</p>
                      <input value={form[key]} onChange={(e) => setForm({...form, [key]: e.target.value})} placeholder="00" className="w-full bg-black/5 p-5 rounded-2xl outline-none font-[1000] text-center text-xl" />
                    </div>
                  ))}
                </div>
                <input value={form.tag} onChange={(e) => setForm({...form, tag: e.target.value})} placeholder="NEURAL TAG (e.g. CHEST)" className="w-full bg-black/5 p-5 rounded-3xl outline-none font-[1000] italic uppercase text-xs" />
                <textarea value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})} placeholder="NEURAL INTEL..." className="w-full bg-black/5 p-5 rounded-3xl outline-none h-20 resize-none font-bold italic text-xs" />
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleAction} className={`w-full py-7 rounded-[2.5rem] font-[1000] italic uppercase text-xl shadow-2xl transition-all ${editingId ? 'bg-black text-white' : 'bg-[#FF7222] text-white'}`}>
                  {editingId ? 'OVERWRITE ✓' : 'EXECUTE +'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutModule;