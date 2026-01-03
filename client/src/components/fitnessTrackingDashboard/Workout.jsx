import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { eliteData } from '../../assets/assets';

// --- LAVISH CUSTOM SELECT COMPONENT ---
const LavishSelect = ({ label, options, value, onChange, themeColor }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative space-y-1">
      <p className="text-[9px] font-black uppercase opacity-60 ml-4">{label}</p>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-black/5 p-5 rounded-3xl cursor-pointer flex justify-between items-center group border-2 border-transparent hover:border-black/10 transition-all"
      >
        <span className="font-[1000] italic uppercase text-sm tracking-widest">{value}</span>
        <motion.span animate={{ rotate: isOpen ? 180 : 0 }} className="text-xs">▼</motion.span>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute z-50 w-full mt-2 bg-white/90 backdrop-blur-2xl border border-white/20 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] overflow-hidden"
          >
            {options.map((opt) => (
              <motion.div
                key={opt}
                whileHover={{ x: 10, backgroundColor: themeColor, color: '#fff' }}
                onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                }}
                className={`p-5 cursor-pointer font-[1000] italic text-[11px] uppercase border-b border-black/5 last:border-none transition-all ${value === opt ? 'bg-black/5' : ''}`}
              >
                {opt}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const WorkoutModule = () => {
  const [workouts, setWorkouts] = useState(eliteData.workouts || []);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: '', sets: '', reps: '', weight: '', notes: '', category: 'Strength', tag: 'Hypertrophy'
  });

  const handleAction = () => {
    if (!form.name || !form.sets) return;
    if (editingId) {
      setWorkouts(workouts.map(w => w.id === editingId ? { ...form, id: editingId } : w));
      setEditingId(null);
    } else {
      const newWorkout = { ...form, id: Date.now() };
      setWorkouts([...workouts, newWorkout]);
    }
    setForm({ name: '', sets: '', reps: '', weight: '', notes: '', category: 'Strength', tag: 'Hypertrophy' });
  };

  const startEdit = (workout) => {
    setEditingId(workout.id);
    setForm(workout);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    setWorkouts(workouts.filter(w => w.id !== id));
  };

  return (
    <div className="space-y-12 pb-24 select-none perspective-1000">
      
      {/* --- TOP HUD --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Routines', val: workouts.length, color: 'text-[#FF7222]' },
          { label: 'System Load', val: 'Elite', color: 'text-blue-500' },
          { label: 'Last Sync', val: 'Now', color: 'text-green-500' },
          { label: 'Status', val: 'Online', color: 'text-white' }
        ].map((item, i) => (
          <div key={i} className="bg-white/5 border border-white/10 p-5 rounded-3xl backdrop-blur-md">
            <p className="text-[8px] font-black uppercase text-gray-500 tracking-[0.4em] mb-1">{item.label}</p>
            <span className={`text-2xl font-[1000] italic uppercase ${item.color}`}>{item.val}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        
        {/* --- LEFT: LIST --- */}
        <div className="xl:col-span-7 space-y-6">
          <h2 className="text-4xl font-[1000] italic uppercase tracking-tighter px-2">Tactical <span className="text-[#FF7222]">Database</span></h2>
          <AnimatePresence mode="popLayout">
            {workouts.map((w) => (
              <motion.div 
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, filter: 'blur(10px)' }}
                key={w.id} 
                className={`group relative overflow-hidden p-8 rounded-[3.5rem] border transition-all duration-500 ${editingId === w.id ? 'bg-[#FF7222]/10 border-[#FF7222]' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
              >
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                  <div className="flex-1">
                    <div className="flex gap-2 mb-3">
                      <span className="text-[8px] font-black bg-white/10 px-3 py-1 rounded-full uppercase italic">{w.category}</span>
                      <span className="text-[8px] font-black text-[#FF7222] uppercase tracking-[0.2em] italic">{w.tag}</span>
                    </div>
                    <h3 className="text-4xl font-[1000] italic uppercase leading-none tracking-tighter">{w.name}</h3>
                    <p className="text-gray-500 text-[10px] font-bold mt-2 italic">INTEL: {w.notes || 'NO DATA'}</p>
                  </div>
                  <div className="flex items-center gap-8 bg-black/40 p-6 rounded-[2.5rem] border border-white/5 shadow-2xl">
                    <div className="text-center">
                      <p className="text-[8px] font-black text-gray-500 uppercase mb-1">Vol</p>
                      <p className="text-3xl font-[1000] italic leading-none">{w.sets}x{w.reps}</p>
                      <p className="text-[10px] font-black text-[#FF7222] mt-1">{w.weight}KG</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button onClick={() => startEdit(w)} className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center hover:bg-white hover:text-black transition-all">✎</button>
                      <button onClick={() => handleDelete(w.id)} className="w-10 h-10 bg-red-500/10 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">✕</button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* --- RIGHT: COMMANDER FORM --- */}
        <div className="xl:col-span-5">
          <motion.div 
            layout
            className={`sticky top-10 p-10 rounded-[4rem] shadow-[0_50px_100px_rgba(0,0,0,0.3)] relative transition-colors duration-700 overflow-hidden ${editingId ? 'bg-[#FF7222] text-black shadow-[#FF7222]/20' : 'bg-white text-black'}`}
          >
            <div className="relative z-10 space-y-6">
              <h2 className="text-5xl font-[1000] italic uppercase leading-[0.8] tracking-tighter">
                {editingId ? 'RE-CODE\nMATRIX' : 'DEPLOY\nFORCE'}
              </h2>

              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase opacity-60 ml-4 italic">Designation</p>
                  <input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} placeholder="E.G. BENCH PRESS" className="w-full bg-black/5 p-5 rounded-3xl outline-none font-[1000] italic uppercase text-lg border-2 border-transparent focus:border-black/10 transition-all" />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {['sets', 'reps', 'weight'].map((key) => (
                    <div key={key} className="space-y-1">
                      <p className="text-[8px] font-black uppercase opacity-60 text-center">{key}</p>
                      <input value={form[key]} onChange={(e) => setForm({...form, [key]: e.target.value})} placeholder="00" className="w-full bg-black/5 p-5 rounded-2xl outline-none font-[1000] text-center text-xl" />
                    </div>
                  ))}
                </div>

                {/* LAVISH SELECTS */}
                <div className="grid grid-cols-1 gap-4">
                  <LavishSelect 
                    label="Training Category"
                    options={['Strength', 'Cardio', 'Mobility', 'Endurance']}
                    value={form.category}
                    onChange={(val) => setForm({...form, category: val})}
                    themeColor={editingId ? '#000' : '#FF7222'}
                  />
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase opacity-60 ml-4 italic">Neural Tag</p>
                    <input value={form.tag} onChange={(e) => setForm({...form, tag: e.target.value})} placeholder="CHEST / LEGS" className="w-full bg-black/5 p-5 rounded-3xl outline-none font-[1000] italic uppercase text-xs" />
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-[9px] font-black uppercase opacity-60 ml-4 italic">Tactical Notes</p>
                  <textarea value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})} placeholder="MAX EFFORT..." className="w-full bg-black/5 p-5 rounded-3xl outline-none h-20 resize-none font-bold italic text-xs" />
                </div>

                <motion.button 
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handleAction}
                  className={`w-full py-7 rounded-[2.5rem] font-[1000] italic uppercase text-xl mt-4 shadow-2xl transition-all ${editingId ? 'bg-black text-white' : 'bg-[#FF7222] text-white'}`}
                >
                  {editingId ? 'OVERWRITE DATA ✓' : 'EXECUTE COMMIT +'}
                </motion.button>

                {editingId && (
                  <button onClick={() => {setEditingId(null); setForm({name:'', sets:'', reps:'', weight:'', notes:'', category:'Strength', tag:'Hypertrophy'})}} className="w-full text-[10px] font-black uppercase mt-2 opacity-60 hover:opacity-100 underline tracking-widest">Abort Edit</button>
                )}
              </div>
            </div>
            
            <div className="absolute top-0 right-0 p-10 text-9xl font-black italic opacity-5 pointer-events-none select-none">
              {editingId ? 'EDIT' : 'NEW'}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutModule;