import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, CartesianGrid, ReferenceLine } from 'recharts';
import { progressAsset } from '../../assets/assets';
import { useAppContext } from '../../context/useAppContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- GLASS LOADER COMPONENT ---
const NeuralSyncLoader = () => (
  <motion.div 
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    className="absolute inset-0 z-[50] flex items-center justify-center bg-black/60 backdrop-blur-xl rounded-[3rem]"
  >
    <div className="relative flex flex-col items-center">
      <motion.div 
        animate={{ rotate: 360, scale: [1, 1.1, 1] }} 
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        className="w-32 h-32 border-t-2 border-b-2 border-[#FF7222] rounded-full shadow-[0_0_40px_rgba(255,114,34,0.4)]"
      />
      <motion.p className="mt-6 text-[#FF7222] font-black italic tracking-[0.5em] text-[10px] uppercase">Neural Syncing...</motion.p>
    </div>
  </motion.div>
);

const ProgressModule = () => {
  const { progress, goals, fetchProgress, fetchGoals, addProgressEntry, updateGoals, loading, error } = useAppContext();

  // --- STATE MANAGEMENT ---
  const [history, setHistory] = useState([]);
  const [form, setForm] = useState({ weight: '', bench: '', run: '', waist: '', neck: '', height: '175' });
  const [activeTab, setActiveTab] = useState('strength'); 
  const [compareSelection, setCompareSelection] = useState([
    { weight: 0, bench: 0, waist: 0, score: 0 },
    { weight: 0, bench: 0, waist: 0, score: 0 }
  ]);
  const [showMissionSuccess, setShowMissionSuccess] = useState(false);
  const [showTrendAlert, setShowTrendAlert] = useState(false); // NEW: Trend Popup
  const [isSyncing, setIsSyncing] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    fetchProgress();
    fetchGoals();
  }, []);

  useEffect(() => {
    // Convert progress to history format
    const hist = progress.map(p => ({
      id: p._id,
      date: new Date(p.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
      weight: p.weight,
      bench: p.bench,
      run: p.run,
      waist: p.waist,
      neck: p.neck,
      height: p.height
    }));
    setHistory(hist);
    if (hist.length >= 2) {
      setCompareSelection([hist[0], hist[hist.length - 1]]);
    } else if (hist.length === 1) {
      setCompareSelection([hist[0], hist[0]]);
    } else {
      setCompareSelection([
        { weight: 0, bench: 0, waist: 0, score: 0 },
        { weight: 0, bench: 0, waist: 0, score: 0 }
      ]);
    }
  }, [progress]);

  // --- TREND ANALYSIS LOGIC ---
  const getTrendData = () => {
    if (history.length < 2) return { status: 'STABLE', diff: 0, percent: 0 };
    const current = history[0][goals.type];
    const previous = history[1][goals.type];
    const diff = current - previous;
    const percent = ((diff / previous) * 100).toFixed(1);
    
    let status = 'STABLE';
    if (goals.type === 'weight') {
        status = diff < 0 ? 'OPTIMIZING' : 'INCREASING'; // For weight loss
    } else {
        status = diff > 0 ? 'GAINING' : 'STAGNANT'; // For strength/run
    }
    return { status, diff, percent };
  };

  const trend = getTrendData();

  const switchTab = (tab) => {
    setIsSyncing(true);
    setTimeout(() => { setActiveTab(tab); setIsSyncing(false); }, 600);
  };

  const calculateBioScore = (f) => {
    const bf = 86.010 * Math.log10(f.waist - f.neck) - 70.041 * Math.log10(f.height) + 36.76;
    const strengthRatio = f.bench / f.weight;
    let score = 50;
    if (strengthRatio > 1.2) score += 20;
    if (bf < 20) score += 20;
    return Math.min(Math.max(Math.floor(score), 40), 99);
  };

  const validateForm = () => {
    const errors = {};
    const weight = parseFloat(form.weight);
    const bench = parseFloat(form.bench);
    const run = parseFloat(form.run);
    const waist = parseFloat(form.waist);
    const neck = parseFloat(form.neck);
    const height = parseFloat(form.height);

    if (!form.weight || isNaN(weight) || weight <= 0 || weight > 500) {
      errors.weight = 'Weight must be a positive number between 1-500 kg';
    }
    if (!form.bench || isNaN(bench) || bench <= 0 || bench > 1000) {
      errors.bench = 'Bench press must be a positive number between 1-1000 kg';
    }
    if (form.run && (isNaN(run) || run < 0 || run > 100)) {
      errors.run = 'Run time must be between 0-100 minutes';
    }
    if (!form.waist || isNaN(waist) || waist <= 0 || waist > 200) {
      errors.waist = 'Waist must be a positive number between 1-200 cm';
    }
    if (form.neck && (isNaN(neck) || neck <= 0 || neck > 100)) {
      errors.neck = 'Neck must be between 1-100 cm';
    }
    if (!form.height || isNaN(height) || height <= 0 || height > 300) {
      errors.height = 'Height must be a positive number between 1-300 cm';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const logData = async () => {
    if (!validateForm()) return;

    const progressData = {
      date: new Date(),
      weight: parseFloat(form.weight),
      bench: parseFloat(form.bench),
      run: parseFloat(form.run) || 0,
      waist: parseFloat(form.waist),
      neck: parseFloat(form.neck) || 40,
      height: parseFloat(form.height)
    };

    const result = await addProgressEntry(progressData);
    if (result) {
      // Check for goals
      const currentVal = parseFloat(form[goals.type]);
      if (currentVal >= goals.value && history.length > 0 && history[0][goals.type] < goals.value) {
        setShowMissionSuccess(true);
      } else if (history.length > 0 && (goals.type !== 'weight' ? currentVal > history[0][goals.type] : currentVal < history[0][goals.type])) {
        setShowTrendAlert(true);
      }
      setForm({ weight: '', bench: '', run: '', waist: '', neck: '', height: '175' });
      setValidationErrors({});
    }
  };

  const downloadReport = () => {
    const doc = new jsPDF();
    doc.setFillColor(10, 10, 10); doc.rect(0, 0, 210, 297, 'F');
    doc.setTextColor(255, 114, 34); doc.text('INTEL REPORT', 15, 30);
    autoTable(doc, {
      startY: 50,
      head: [['DATE', 'WT', 'BENCH', 'WAIST', 'VITALITY']],
      body: history.map(h => [h.date, `${h.weight}kg`, `${h.bench}kg`, `${h.waist}"`, `${h.score}%`]),
      headStyles: { fillColor: [255, 114, 34] }
    });
    doc.save(`Intel_Sync_${Date.now()}.pdf`);
  };

  return (
    <div className="relative space-y-12 pb-24 text-white max-w-[1600px] mx-auto px-4 bg-black min-h-screen">
      
      {/* --- MISSION SUCCESS POPUP (Static Goal) --- */}
      <AnimatePresence>
        {showMissionSuccess && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[500] flex items-center justify-center bg-black/95 backdrop-blur-3xl">
             <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="p-16 border border-[#FF7222]/20 bg-white/[0.02] rounded-[5rem] text-center max-w-2xl">
                <h2 className="text-8xl font-[1000] italic uppercase tracking-tighter text-[#FF7222]">MISSION<br/>SUCCESS</h2>
                <button onClick={() => setShowMissionSuccess(false)} className="mt-8 bg-white text-black px-12 py-5 rounded-full font-black uppercase italic">Synchronize</button>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- TREND ALERT POPUP (Dynamic Improvement) --- */}
      <AnimatePresence>
        {showTrendAlert && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[490] flex items-center justify-center bg-black/80 backdrop-blur-md">
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-[#111] border-2 border-[#FF7222] p-12 rounded-[3rem] text-center shadow-[0_0_100px_rgba(255,114,34,0.2)]">
                <p className="text-[#FF7222] font-black tracking-widest text-xs uppercase mb-2 italic">Neural Momentum Detected</p>
                <h3 className="text-5xl font-[1000] italic uppercase tracking-tighter text-white">TRENDING<br/><span className="text-[#FF7222]">UPWARDS</span></h3>
                <div className="mt-6 flex justify-center gap-4">
                    <div className="bg-white/5 p-4 rounded-2xl"><p className="text-[8px] text-gray-500 uppercase">Improvement</p><p className="text-2xl font-black">{trend.percent}%</p></div>
                </div>
                <button onClick={() => setShowTrendAlert(false)} className="mt-8 border border-white/20 text-white px-10 py-3 rounded-2xl font-black uppercase text-[10px] hover:bg-white hover:text-black transition-all">Continue Evolution</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 pt-10">
        <div className="border-l-4 border-[#FF7222] pl-6">
          <p className="text-[#FF7222] font-black tracking-[0.4em] text-xs mb-2 uppercase italic">Protocol V2.0</p>
          <h2 className="text-6xl md:text-8xl font-[1000] italic uppercase leading-[0.8] tracking-tighter">DATA<br /><span className="text-[#FF7222]">VAULT</span></h2>
        </div>
        
        <div className="flex items-center gap-4 bg-white/[0.03] p-3 rounded-[2.5rem] border border-white/10 backdrop-blur-md">
            <div className="px-6 border-r border-white/10 flex flex-col items-end">
                <select value={goals.type} onChange={async (e) => { await updateGoals({...goals, type: e.target.value}); }} className="bg-transparent text-[9px] font-black text-gray-500 uppercase outline-none cursor-pointer">
                    <option value="bench" className="bg-black">Target Bench</option>
                    <option value="weight" className="bg-black">Target Weight</option>
                    <option value="run" className="bg-black">Target Run</option>
                </select>
                <input type="number" value={goals.value} onChange={async (e)=> { await updateGoals({...goals, value: parseFloat(e.target.value) || 0}); }} className="bg-transparent text-2xl font-[1000] italic text-[#FF7222] w-16 outline-none" />
            </div>
            <button onClick={downloadReport} className="bg-[#FF7222] text-black px-8 py-4 rounded-3xl font-black text-[10px] uppercase tracking-widest">Export Intel</button>
        </div>
      </div>

      {/* TREND ANALYSIS PANEL (NEW) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#111] border border-white/5 p-8 rounded-[3rem] flex items-center justify-between group overflow-hidden relative">
              <div className="relative z-10">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Current Momentum</p>
                  <h4 className={`text-4xl font-[1000] italic uppercase ${trend.diff >= 0 ? 'text-green-500' : 'text-red-500'}`}>{trend.status}</h4>
              </div>
              <div className="text-right relative z-10">
                  <p className="text-3xl font-[1000] italic">{trend.percent}%</p>
                  <p className="text-[10px] font-bold text-gray-600 uppercase">vs Last Entry</p>
              </div>
              <div className="absolute right-[-10%] top-[-20%] text-9xl font-black text-white/[0.02] italic select-none uppercase">{goals.type}</div>
          </div>
          
          <div className="md:col-span-2 bg-white/[0.03] border border-white/5 p-8 rounded-[3rem] flex items-center justify-between">
              <div>
                  <h4 className="text-xl font-[1000] italic uppercase">Neural Insight: <span className="text-[#FF7222]">{history.length > 0 ? Math.abs(goals.value - history[0][goals.type]).toFixed(1) : goals.value} Units Remaining</span></h4>
                  <p className="text-[10px] font-bold text-gray-500 uppercase mt-2 tracking-widest">Estimated {history.length > 0 ? Math.ceil(Math.abs(goals.value - history[0][goals.type]) / (Math.abs(trend.diff) || 1)) : 'N/A'} more sessions at current rate</p>
              </div>
              <div className="w-16 h-16 rounded-full border-4 border-[#FF7222]/20 flex items-center justify-center relative">
                  <svg className="w-12 h-12 -rotate-90">
                      <circle cx="24" cy="24" r="20" fill="transparent" stroke="#222" strokeWidth="4" />
                      <circle cx="24" cy="24" r="20" fill="transparent" stroke="#FF7222" strokeWidth="4" strokeDasharray="125.6" strokeDashoffset={125.6 - (history.length > 0 ? Math.min(history[0][goals.type] / goals.value, 1) * 125.6 : 0)} strokeLinecap="round" />
                  </svg>
              </div>
          </div>
      </div>

      {/* INPUT GRID - GLASS UI */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white rounded-[4rem] p-10 shadow-2xl">
        <div className="lg:col-span-3 text-black">
            <h3 className="text-5xl font-[1000] italic uppercase leading-[0.85] tracking-tighter">Log<br/><span className="text-gray-300">Intel</span></h3>
            <p className="text-[10px] font-bold text-gray-400 mt-6 uppercase tracking-[0.2em]">Biometric accuracy is mandatory.</p>
        </div>
        <div className="lg:col-span-9 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {[{ label: 'Weight', key: 'weight' }, { label: 'Bench', key: 'bench' }, { label: 'Run', key: 'run' }, { label: 'Waist', key: 'waist' }, { label: 'Neck', key: 'neck' }, { label: 'Height', key: 'height' }].map((item) => (
            <div key={item.key} className="space-y-1">
              <label className="text-[9px] font-black text-gray-400 uppercase ml-3 tracking-tighter">{item.label}</label>
              <input type="number" value={form[item.key]} onChange={(e) => setForm({...form, [item.key]: e.target.value})} className={`w-full bg-gray-50 p-5 rounded-3xl text-black font-[1000] text-2xl italic border-2 outline-none ${validationErrors[item.key] ? 'border-red-500' : 'border-transparent focus:border-[#FF7222]'}`} />
              {validationErrors[item.key] && <p className="text-red-500 text-[8px] font-bold uppercase">{validationErrors[item.key]}</p>}
            </div>
          ))}
          <button onClick={logData} disabled={loading} className="col-span-2 md:col-span-3 xl:col-span-6 bg-black py-6 rounded-3xl font-[1000] italic uppercase text-white hover:bg-[#FF7222] transition-all text-xl disabled:opacity-50">Push Data to Vault +</button>
        </div>
      </div>

      {/* ANALYTICS HUB WITH REAL-TIME TRANSITION */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-4 bg-[#0A0A0A] border border-white/5 rounded-[4rem] p-10 flex flex-col justify-between shadow-2xl">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={[
                { subject: 'Weight', A: compareSelection[0].weight, B: compareSelection[1].weight },
                { subject: 'Bench', A: compareSelection[0].bench, B: compareSelection[1].bench },
                { subject: 'Waist', A: compareSelection[0].waist * 2, B: compareSelection[1].waist * 2 },
                { subject: 'Vitality', A: calculateBioScore(compareSelection[0]), B: calculateBioScore(compareSelection[1]) }
              ]}>
                <PolarGrid stroke="#222" /><PolarAngleAxis dataKey="subject" tick={{fill: '#444', fontSize: 10, fontWeight: 900}} />
                <Radar dataKey="A" stroke="#333" fill="#333" fillOpacity={0.3} /><Radar dataKey="B" stroke="#FF7222" fill="#FF7222" fillOpacity={0.5} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="xl:col-span-8 bg-white/[0.02] border border-white/10 rounded-[4rem] p-10 relative overflow-hidden shadow-2xl">
          <AnimatePresence>{isSyncing && <NeuralSyncLoader />}</AnimatePresence>
          <div className="flex justify-between items-center mb-10">
            <div className="flex gap-2 bg-black p-1 rounded-2xl border border-white/5">
                <button onClick={() => switchTab('strength')} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'strength' ? 'bg-[#FF7222] text-black' : 'text-gray-500'}`}>Strength</button>
                <button onClick={() => switchTab('biometrics')} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase transition-all ${activeTab === 'biometrics' ? 'bg-[#FF7222] text-black' : 'text-gray-500'}`}>Biometrics</button>
            </div>
            <div className="text-[10px] font-black text-[#FF7222] uppercase italic">Active Goal: {goals.value} {goals.type}</div>
          </div>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[...history].reverse()}>
                <defs><linearGradient id="colorMain" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#FF7222" stopOpacity={0.4}/><stop offset="95%" stopColor="#FF7222" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="10 10" stroke="#111" vertical={false} />
                <XAxis dataKey="date" stroke="#333" fontSize={10} fontWeight={900} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{backgroundColor: '#000', border: 'none', borderRadius: '20px'}} />
                <ReferenceLine y={activeTab === 'strength' ? (goals.type === 'bench' ? goals.value : 0) : (goals.type === 'weight' ? goals.value : 0)} stroke="#FF7222" strokeDasharray="10 10" />
                <Area type="monotone" dataKey={activeTab === 'strength' ? 'bench' : 'weight'} stroke="#FF7222" strokeWidth={6} fill="url(#colorMain)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* RECENT ENTRIES (Real-time update) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {history.slice(0, 4).map((node) => (
            <motion.div layout key={node.id} onClick={() => setCompareSelection([compareSelection[1], node])} className="bg-[#0A0A0A] border border-white/5 p-8 rounded-[3rem] hover:border-[#FF7222]/40 transition-all cursor-pointer group">
              <div className="flex justify-between items-start mb-6"><span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{node.date}</span><span className="text-[#FF7222] font-black italic text-xl">{node.score}%</span></div>
              <h5 className="text-4xl font-[1000] italic tracking-tighter text-white group-hover:text-[#FF7222] transition-colors">{node.weight}KG</h5>
              <div className="mt-6 pt-6 border-t border-white/5 flex justify-between">
                <div className="text-center"><p className="text-[8px] font-bold text-gray-600 uppercase">Bench</p><p className="font-black text-lg">{node.bench}k</p></div>
                <div className="text-center"><p className="text-[8px] font-bold text-gray-600 uppercase">Waist</p><p className="font-black text-lg">{node.waist}"</p></div>
                <div className="text-center"><p className="text-[8px] font-bold text-gray-600 uppercase">Vitality</p><p className="font-black text-lg text-[#FF7222]">{node.score}</p></div>
              </div>
            </motion.div>
          ))}
      </div>
    </div>
  );
};

export default ProgressModule;