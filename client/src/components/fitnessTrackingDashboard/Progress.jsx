import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis } from 'recharts';
import { progressAsset } from '../../assets/assets';

// PDF Engine Imports
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const ProgressModule = () => {
  // --- LOCAL STORAGE LOGIC ---
  const [history, setHistory] = useState(() => {
    const savedData = localStorage.getItem('pulse_elite_progress');
    return savedData ? JSON.parse(savedData) : progressAsset.initialHistory;
  });

  const [form, setForm] = useState({ weight: '', bench: '', run: '', waist: '' });
  const [compareSelection, setCompareSelection] = useState([history[0], history[history.length - 1]]);

  // Save to localStorage whenever history changes
  useEffect(() => {
    localStorage.setItem('pulse_elite_progress', JSON.stringify(history));
  }, [history]);

  // --- ERROR-FREE PDF GENERATOR ---
  const downloadReport = () => {
    try {
      const doc = new jsPDF();
      doc.setFillColor(15, 15, 15);
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setTextColor(255, 114, 34);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('PULSE ELITE: EVOLUTION LOG', 15, 25);
      
      doc.setTextColor(150, 150, 150);
      doc.setFontSize(9);
      doc.text(`REPORT GENERATED: ${new Date().toLocaleString()}`, 15, 33);

      const tableRows = history.map(h => [h.date, `${h.weight}kg`, `${h.bench}kg`, `${h.run}m`, `${h.waist}"`, `${h.score}%`]);

      autoTable(doc, {
        startY: 45,
        head: [['DATE', 'WEIGHT', 'BENCH', 'RUN', 'WAIST', 'VITALITY']],
        body: tableRows,
        theme: 'striped',
        headStyles: { fillColor: [255, 114, 34], halign: 'center' },
        bodyStyles: { halign: 'center' }
      });

      doc.save(`Pulse_Elite_Report_${Date.now()}.pdf`);
    } catch (err) {
      console.error("PDF Error:", err);
    }
  };

  const logData = () => {
    if (!form.weight || !form.bench) return;
    const newEntry = {
      id: Date.now(),
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' }),
      weight: parseFloat(form.weight),
      bench: parseFloat(form.bench),
      run: parseFloat(form.run) || 0,
      waist: parseFloat(form.waist) || 0,
      score: Math.floor(Math.random() * (95 - 75) + 75)
    };
    setHistory(prev => [newEntry, ...prev]); // Newest data first
    setForm({ weight: '', bench: '', run: '', waist: '' });
  };

  return (
    <div className="space-y-8 md:space-y-12 pb-24 text-white max-w-[1600px] mx-auto px-2">
      
      {/* --- HEADER & PDF ACTION --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="border-l-4 border-[#FF7222] pl-6">
          <h2 className="text-5xl md:text-8xl font-[1000] italic uppercase leading-[0.8] tracking-tighter">
            DATA<br /><span className="text-[#FF7222]">VAULT</span>
          </h2>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05, backgroundColor: '#FF7222', color: '#000' }}
          whileTap={{ scale: 0.95 }}
          onClick={downloadReport}
          className="bg-white/5 border border-white/10 px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] flex items-center gap-3 transition-all"
        >
          Download Intel PDF 📥
        </motion.button>
      </div>

      {/* --- 3D INPUT PANEL (STAYING CLEAN & RESPONSIVE) --- */}
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white p-6 md:p-12 rounded-[2.5rem] md:rounded-[4rem] shadow-2xl relative overflow-hidden group">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-4 text-black">
            <h3 className="text-4xl md:text-5xl font-[1000] italic uppercase leading-none tracking-tighter mb-2">Manual<br/>Input</h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic leading-relaxed">Update your neural biometric nodes manually.</p>
          </div>
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            {['weight', 'bench', 'run', 'waist'].map((key) => (
              <div key={key} className="space-y-2">
                <p className="text-[9px] font-black text-gray-400 uppercase text-center">{key}</p>
                <input 
                  type="number" 
                  value={form[key]} 
                  onChange={(e) => setForm({...form, [key]: e.target.value})}
                  className="w-full bg-black/5 p-4 md:p-6 rounded-2xl md:rounded-[2rem] text-center font-black text-xl md:text-3xl text-black border-2 border-transparent focus:border-[#FF7222] outline-none transition-all" 
                  placeholder="0.0"
                />
              </div>
            ))}
            <button onClick={logData} className="col-span-2 md:col-span-4 bg-black text-white py-5 md:py-8 rounded-2xl md:rounded-[2.5rem] font-[1000] italic uppercase hover:bg-[#FF7222] transition-all duration-500 shadow-xl">
              Sync Data Point +
            </button>
          </div>
        </div>
      </motion.div>

      {/* --- ANALYTICS HUB (CHART & RADAR) --- */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Radar: Visual Balance */}
        <div className="xl:col-span-4 bg-[#080808] border border-white/5 rounded-[3rem] p-8 md:p-12 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF7222]/5 blur-[60px] rounded-full" />
          <h4 className="text-center text-[10px] font-black tracking-[0.5em] text-gray-600 uppercase mb-8">Performance Radar</h4>
          <div className="h-64 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={progressAsset.radarLabels.map(label => ({
                subject: label.label,
                A: compareSelection[0]?.[label.key] || 0,
                B: compareSelection[1]?.[label.key] || 0,
              }))}>
                <PolarGrid stroke="#222" />
                <PolarAngleAxis dataKey="subject" tick={{fill: '#555', fontSize: 10, fontWeight: '900'}} />
                <Radar name="Previous" dataKey="A" stroke="#444" fill="#444" fillOpacity={0.2} />
                <Radar name="Selected" dataKey="B" stroke="#FF7222" fill="#FF7222" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Area: Growth Telemetry */}
        <div className="xl:col-span-8 bg-white/[0.02] border border-white/10 rounded-[3rem] md:rounded-[4rem] p-8 md:p-12">
          <div className="h-[300px] md:h-[450px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="colorBench" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF7222" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#FF7222" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#333" fontSize={10} axisLine={false} tickLine={false} tick={{dy: 10}} />
                <Tooltip contentStyle={{backgroundColor: '#000', border: '1px solid #333', borderRadius: '20px', fontSize: '12px'}} />
                <Area type="monotone" dataKey="bench" stroke="#FF7222" strokeWidth={5} fillOpacity={1} fill="url(#colorBench)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
        </div>
      </div>

      {/* --- HISTORY FEED (PERSISTENT DATA) --- */}
      <div className="space-y-6">
        <div className="flex items-center gap-4 px-6">
          <div className="h-px flex-1 bg-white/10" />
          <h4 className="text-[10px] font-black italic uppercase tracking-[0.5em] text-gray-500 text-center">Neural History Nodes</h4>
          <div className="h-px flex-1 bg-white/10" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {history.map((node, i) => (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -10, borderColor: 'rgba(255,114,34,0.4)' }}
                key={node.id} 
                onClick={() => setCompareSelection([compareSelection[1], node])}
                className="bg-white/5 border border-white/5 p-8 rounded-[2.5rem] md:rounded-[3.5rem] flex justify-between items-center cursor-pointer transition-all hover:bg-white/[0.08]"
              >
                <div>
                  <p className="text-[10px] font-black text-[#FF7222] uppercase tracking-widest">{node.date}</p>
                  <h5 className="text-4xl font-[1000] italic tracking-tighter">{node.weight}kg</h5>
                </div>
                <div className="text-right">
                  <p className="text-[8px] font-bold text-gray-600 uppercase mb-1">Vitality</p>
                  <p className="text-2xl font-[1000] italic text-emerald-400">{node.score}%</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ProgressModule;