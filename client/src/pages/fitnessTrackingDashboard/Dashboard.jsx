import React, { useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { eliteData, dashboardData, progressAssets, nutritionData } from '../../assets/assets';

// --- 1. 3D SPATIAL WRAPPER (Tilt Effect) ---
const SpatialCard = ({ children, className }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  return (
    <motion.div
      onMouseMove={handleMove}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={`${className} transition-shadow duration-500`}
    >
      <div style={{ transform: "translateZ(60px)" }}>{children}</div>
    </motion.div>
  );
};

// --- 2. HOLOGRAPHIC 3D GRAPH ---
const HolographicGraph = () => {
  const [activeBar, setActiveBar] = useState(null);

  return (
    <div className="relative h-[450px] w-full bg-white/[0.02] border border-white/5 rounded-[4rem] p-12 overflow-hidden shadow-2xl">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,114,34,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,114,34,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent)]" />
      
      <div className="relative z-10 flex justify-between items-start mb-16">
        <div>
          <h3 className="text-4xl font-[1000] italic uppercase tracking-tighter">Neural <span className="text-[#FF7222]">Pulse</span></h3>
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.5em] mt-2 italic">Protocol_v4: Data_Flow_Active</p>
        </div>
        <div className="flex gap-4">
            <div className="text-right">
                <p className="text-[8px] font-black text-gray-500 uppercase italic">Peak Load</p>
                <p className="text-xl font-black text-[#FF7222]">95.4%</p>
            </div>
        </div>
      </div>

      <div className="relative h-64 flex items-end justify-between gap-4 md:gap-10">
        {eliteData.progress.map((item, i) => (
          <div key={i} className="flex-1 flex flex-col items-center group/bar" onMouseEnter={() => setActiveBar(i)} onMouseLeave={() => setActiveBar(null)}>
            <AnimatePresence>
              {activeBar === i && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: -20 }} exit={{ opacity: 0, y: 10 }} className="absolute -top-12 z-20 bg-white text-black px-4 py-2 rounded-xl font-black italic text-[10px] shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                  {item.performance}% DATA_SYNC
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${item.performance}%` }}
              transition={{ duration: 1.5, delay: i * 0.1, ease: "circOut" }}
              className={`w-full max-w-[50px] relative rounded-t-2xl transition-all duration-500 ${activeBar === i ? 'bg-[#FF7222] shadow-[0_0_50px_rgba(255,114,34,0.4)]' : 'bg-white/10'}`}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/10 rounded-t-2xl" />
              <motion.div animate={{ top: ["0%", "100%"] }} transition={{ duration: 2, repeat: Infinity }} className="absolute w-full h-[2px] bg-white/40 blur-sm" />
            </motion.div>
            <span className={`mt-6 text-[10px] font-black uppercase italic transition-colors ${activeBar === i ? 'text-white' : 'text-gray-600'}`}>{item.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- MAIN COMMAND DASHBOARD ---
const EliteDashboard = () => {
  return (
    <div className="min-h-screen bg-[#020202] text-white p-6 md:p-16 relative overflow-hidden font-['Outfit']">
      
      {/* BACKGROUND ELEMENTS */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-[#FF7222]/10 blur-[180px] rounded-full animate-pulse" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')] opacity-20" />
      </div>

      <div className="max-w-[1700px] mx-auto relative z-10">
        
        {/* TOP STATUS BAR */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 mb-20">
          <motion.div initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-[2px] bg-[#FF7222]" />
              <span className="text-xs font-black uppercase tracking-[0.8em] text-[#FF7222]">Security_Override: Active</span>
            </div>
            <h1 className="text-8xl md:text-[11rem] font-[1000] italic leading-[0.75] tracking-tighter uppercase">
              COMMAND<br /><span className="text-transparent stroke-text">CENTER</span>
            </h1>
          </motion.div>

          <SpatialCard className="bg-white/5 border border-white/10 p-10 rounded-[3.5rem] backdrop-blur-3xl flex items-center gap-8 min-w-[350px]">
            <div className="relative">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }} className="absolute -inset-4 border border-dashed border-[#FF7222]/40 rounded-full" />
              <div className="w-20 h-20 bg-[#FF7222] rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(255,114,34,0.4)]">
                <span className="text-black text-3xl font-black italic">!</span>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Weekly Growth</p>
              <h4 className="text-4xl font-[1000] italic text-white">+12.4%</h4>
              <p className="text-[8px] font-bold text-green-500 uppercase mt-2">Elite Status Confirmed</p>
            </div>
          </SpatialCard>
        </header>

        {/* DASHBOARD GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
          
          {/* LEFT COLUMN (The Core) */}
          <div className="xl:col-span-8 space-y-10">
            <HolographicGraph />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <SpatialCard className="bg-gradient-to-br from-[#FF7222] to-[#e6651d] p-10 rounded-[4rem] text-black relative overflow-hidden group">
                <div className="relative z-10">
                  <h4 className="text-4xl font-[1000] italic uppercase leading-[0.8] mb-6">Fueling<br />Report</h4>
                  <div className="space-y-4">
                    {nutritionData.initialMeals.map((meal, i) => (
                      <div key={i} className="flex justify-between border-b border-black/10 pb-2">
                        <span className="text-xs font-black uppercase italic">{meal.name}</span>
                        <span className="text-xs font-bold">{meal.protein}g P</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="absolute -right-10 -bottom-10 text-[15rem] font-black italic opacity-10 pointer-events-none">BIO</div>
              </SpatialCard>

              <SpatialCard className="bg-white/5 border border-white/10 p-10 rounded-[4rem] flex flex-col justify-between">
                <div>
                  <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] mb-6 italic">Target_Database</h4>
                  <div className="flex flex-wrap gap-3">
                    {eliteData.exerciseLibrary.Strength.map((ex, i) => (
                      <span key={i} className="px-4 py-2 bg-white/5 rounded-full text-[9px] font-black uppercase italic border border-white/10 hover:bg-[#FF7222] hover:text-black transition-all cursor-crosshair">
                        {ex}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[9px] font-black text-[#FF7222] uppercase tracking-widest">Load Status: Heavy</span>
                  <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div animate={{ width: "85%" }} className="h-full bg-[#FF7222]" />
                  </div>
                </div>
              </SpatialCard>
            </div>
          </div>

          {/* RIGHT COLUMN (The Analytics) */}
          <div className="xl:col-span-4 space-y-10">
            <SpatialCard className="bg-white/[0.02] border border-white/5 p-12 rounded-[4rem] relative overflow-hidden">
               <div className="flex justify-between items-start mb-10">
                  <h4 className="text-xl font-[1000] italic uppercase">Vital<br />History</h4>
                  <span className="text-[9px] font-black text-gray-500">v4.0.1</span>
               </div>
               <div className="space-y-8">
                  {progressAssets.initialHistory.map((h, i) => (
                    <div key={i} className="flex items-center gap-6 group cursor-pointer">
                      <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center font-black italic text-xs group-hover:bg-[#FF7222] group-hover:text-black transition-all">
                        {h.id}
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-[#FF7222] uppercase">{h.date}</p>
                        <h5 className="text-lg font-[1000] italic uppercase text-white/80 group-hover:text-white">Bench: {h.bench}KG</h5>
                        <p className="text-[9px] font-bold text-gray-500 italic mt-1 uppercase">Volume_Scan: {h.volume}</p>
                      </div>
                    </div>
                  ))}
               </div>
            </SpatialCard>

            <SpatialCard className="bg-white/5 border border-white/10 p-12 rounded-[4rem] text-center relative group">
               <motion.div 
                 animate={{ scale: [1, 1.05, 1], rotate: [0, 2, 0] }} 
                 transition={{ repeat: Infinity, duration: 4 }}
                 className="text-7xl mb-6 opacity-40 group-hover:opacity-100 group-hover:text-[#FF7222] transition-all"
               >
                 ☢️
               </motion.div>
               <h4 className="text-2xl font-[1000] italic uppercase mb-2 tracking-tighter">System Health</h4>
               <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-relaxed">
                 All neural pathways are synchronized.<br />Recovery protocol: <span className="text-[#FF7222]">Enabled</span>
               </p>
               <button className="w-full mt-10 py-5 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] hover:bg-white hover:text-black transition-all">
                  Request_Full_Dump
               </button>
            </SpatialCard>
          </div>

        </div>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100;400;900&display=swap');
        .stroke-text { -webkit-text-stroke: 1.5px rgba(255,255,255,0.1); }
        body { font-family: 'Outfit', sans-serif; background: #020202; }
      `}</style>
    </div>
  );
};

export default EliteDashboard;