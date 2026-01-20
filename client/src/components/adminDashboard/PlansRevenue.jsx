import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useSpring, useTransform } from 'framer-motion';
import { 
  TrendingUp, Calendar, Clock, DollarSign, Users, Activity, Zap, Layers,
  Filter, Download, Maximize2, RefreshCcw, AlertCircle, Timer, ShieldCheck, Mail, Cpu, Globe
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';
import { pricingData, INITIAL_SUBSCRIPTIONS } from '../../assets/assets';

const PlansRevenue = () => {
  const [data, setData] = useState(Array.from({ length: 12 }, (_, i) => ({
    name: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
    revenue: Math.floor(Math.random() * 5000) + 2000,
  })));
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activePlan, setActivePlan] = useState(null);
  const [persistentSubs, setPersistentSubs] = useState([]);
  const containerRef = useRef(null);

  // Scroll Progress for 3D entry effects
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  // --- PERSISTENCE ENGINE ---
  useEffect(() => {
    const savedStartTime = localStorage.getItem('session_start_time');
    let sessionStart = savedStartTime ? parseInt(savedStartTime) : new Date().getTime();
    if (!savedStartTime) localStorage.setItem('session_start_time', sessionStart.toString());

    setPersistentSubs(INITIAL_SUBSCRIPTIONS.map(sub => {
      const duration = new Date(sub.end).getTime() - new Date(sub.start).getTime();
      return { ...sub, calculatedStart: sessionStart, calculatedEnd: sessionStart + duration };
    }));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getSubscriptionStatus = (start, end) => {
    const now = currentTime.getTime();
    const total = end - start;
    const remaining = end - now;
    const progress = Math.max(0, (remaining / total) * 100);
    if (remaining <= 0) return { timeStr: "EXPIRED", percent: 0, color: "text-red-500", bg: "bg-red-600/50" };
    
    const hours = Math.floor(remaining / 3600000);
    const mins = Math.floor((remaining % 3600000) / 60000);
    const secs = Math.floor((remaining % 60000) / 1000);
    
    return {
      timeStr: `${hours}h ${mins}m ${secs}s`,
      percent: progress,
      color: progress < 20 ? "text-red-400 shadow-[0_0_10px_#ef4444]" : "text-[#FF7222]",
      bg: progress < 20 ? "bg-red-500" : "bg-[#FF7222]"
    };
  };

  const resetSession = () => {
    localStorage.removeItem('session_start_time');
    window.location.reload();
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-[#050505] text-white selection:bg-[#FF7222] overflow-x-hidden relative font-sans perspective-1000">
      
      {/* --- 3D GLOBAL PROGRESS BAR --- */}
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-[#FF7222] z-[100] origin-left shadow-[0_0_20px_#FF7222]" style={{ scaleX }} />

      {/* --- ADVANCED CYBER BACKGROUND --- */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 opacity-[0.05]" 
          style={{ backgroundImage: `linear-gradient(#FF7222 1px, transparent 1px), linear-gradient(90deg, #FF7222 1px, transparent 1px)`, backgroundSize: '60px 60px' }} 
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute -top-[20%] -left-[10%] w-[800px] h-[800px] bg-[#FF7222]/10 blur-[150px] rounded-full" 
        />
      </div>

      <div className="relative z-10 p-4 sm:p-10 lg:pl-[340px] pt-24">
        
        {/* --- 3D STATUS BAR --- */}
        <motion.div 
          initial={{ rotateX: -20, opacity: 0 }}
          animate={{ rotateX: 0, opacity: 1 }}
          className="flex flex-wrap items-center justify-between gap-6 mb-16 bg-white/[0.03] backdrop-blur-3xl p-6 rounded-[2rem] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform-style-3d hover:translate-y-[-5px] transition-transform duration-500"
        >
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 bg-black/40 px-5 py-3 rounded-xl border border-white/5 hover:border-[#FF7222]/50 transition-colors">
              <Calendar size={18} className="text-[#FF7222]" />
              <span className="text-[11px] font-bold uppercase tracking-widest">{currentTime.toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-3 bg-black/40 px-5 py-3 rounded-xl border border-white/5">
              <Clock size={18} className="text-[#FF7222]" />
              <span className="text-[11px] font-bold uppercase tracking-widest tabular-nums">{currentTime.toLocaleTimeString()}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <motion.button whileHover={{ scale: 1.1, rotate: 180 }} onClick={resetSession} className="p-4 bg-white/5 rounded-xl border border-white/10 text-[#FF7222]">
                <RefreshCcw size={20} />
             </motion.button>
             <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-3 bg-[#FF7222] px-8 py-3 rounded-xl text-black font-black text-[10px] uppercase shadow-[0_10px_30px_-10px_#FF7222]">
                <Download size={16} /> Neural Export
             </motion.button>
          </div>
        </motion.div>

        {/* --- HERO HEADER WITH PARALLAX --- */}
        <header className="mb-24 relative">
          <motion.div initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.8 }}>
            <h1 className="text-[10vw] font-[1000] italic uppercase tracking-tighter leading-[0.75] mb-6 mix-blend-difference">
              DATA<br/><span className="text-transparent border-t-2 border-[#FF7222] bg-clip-text bg-gradient-to-r from-[#FF7222] to-white">MAINFRAME</span>
            </h1>
            <div className="flex items-center gap-6">
               <motion.div animate={{ width: [0, 100] }} className="h-[2px] bg-[#FF7222]" />
               <span className="text-[10px] font-black text-gray-500 tracking-[0.8em] uppercase">Security_Protocol_Active</span>
            </div>
          </motion.div>
        </header>

        {/* --- 3D METRIC CARDS --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 mb-16">
          {[
            { label: 'Revenue Magnitude', value: '$842,900', grow: '+12.5%', icon: DollarSign, color: '#FF7222' },
            { label: 'Active Uplinks', value: persistentSubs.length, grow: '+3.2%', icon: Globe, color: '#3b82f6' },
            { label: 'Sync Stability', value: '99.9%', grow: '+0.1%', icon: Cpu, color: '#10b981' },
            { label: 'Power Draw', value: '24.8kW', grow: '+5.4%', icon: Zap, color: '#f59e0b' },
          ].map((metric, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ rotateY: 15, rotateX: -5, translateZ: 20 }}
              transition={{ delay: i * 0.1 }}
              className="bg-gradient-to-br from-white/[0.05] to-transparent backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/10 relative overflow-hidden group cursor-pointer transform-style-3d shadow-2xl"
            >
              <div className="absolute -right-4 -top-4 opacity-[0.05] group-hover:opacity-[0.2] transition-opacity">
                <metric.icon size={120} />
              </div>
              <div className="flex justify-between items-start mb-10">
                <div className="p-4 rounded-2xl bg-black shadow-inner border border-white/5 group-hover:border-[#FF7222]/50 transition-all">
                  <metric.icon size={24} style={{ color: metric.color }} />
                </div>
                <span className={`text-[10px] font-black px-3 py-1 rounded-full ${metric.grow.includes('+') ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                  {metric.grow}
                </span>
              </div>
              <h4 className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-2">{metric.label}</h4>
              <p className="text-4xl font-[1000] italic tracking-tighter">{metric.value}</p>
              <motion.div className="absolute bottom-0 left-0 h-1 bg-[#FF7222]" initial={{ width: 0 }} whileHover={{ width: '100%' }} />
            </motion.div>
          ))}
        </div>

        {/* --- MAIN ANALYTICS SECTION --- */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-16">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            className="xl:col-span-2 bg-black/40 backdrop-blur-3xl p-10 rounded-[3.5rem] border border-white/10 relative group"
          >
            <div className="flex justify-between items-center mb-12">
              <h3 className="text-2xl font-[1000] italic uppercase flex items-center gap-4">
                <Activity className="text-[#FF7222] animate-pulse" /> Revenue Neural Map
              </h3>
              <div className="flex gap-2">
                {[1, 2, 3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#FF7222]/30" />)}
              </div>
            </div>
            <div className="h-[450px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="color3D" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FF7222" stopOpacity={0.4}/>
                      <stop offset="100%" stopColor="#FF7222" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="name" stroke="#333" fontSize={10} axisLine={false} tickLine={false} />
                  <YAxis stroke="#333" fontSize={10} axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{ stroke: '#FF7222', strokeWidth: 1 }}
                    contentStyle={{ backgroundColor: '#000', border: '1px solid #FF7222', borderRadius: '12px', color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#FF7222" strokeWidth={5} fill="url(#color3D)" animationDuration={2000} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div 
            initial={{ x: 50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            className="bg-white/[0.02] backdrop-blur-3xl p-10 rounded-[3.5rem] border border-white/10 shadow-2xl"
          >
            <h3 className="text-2xl font-[1000] italic uppercase mb-10 flex items-center gap-3">
              <Layers size={24} className="text-blue-500" /> Tier Load
            </h3>
            <div className="space-y-8">
              {pricingData.map((plan, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ x: 10 }}
                  className="relative group p-6 rounded-2xl bg-black/40 border border-white/5 overflow-hidden"
                >
                  <div className="flex justify-between items-center mb-4 relative z-10">
                    <span className="text-[11px] font-black uppercase italic tracking-tighter text-gray-300">{plan.name}</span>
                    <span className="text-[#FF7222] font-black text-xs">ACTIVE</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full relative z-10">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: `${Math.random() * 60 + 40}%` }}
                      className="h-full bg-gradient-to-r from-[#FF7222] to-white shadow-[0_0_15px_#FF7222]"
                    />
                  </div>
                  <div className="absolute inset-0 bg-[#FF7222]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* --- 3D LIVE SURVEILLANCE TERMINAL --- */}
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          className="bg-gradient-to-b from-white/[0.05] to-transparent backdrop-blur-3xl rounded-[4rem] border border-white/10 overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.8)]"
        >
          <div className="p-12 border-b border-white/5 flex flex-wrap justify-between items-end gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span className="text-red-500 text-[10px] font-black uppercase tracking-widest">Live Uplink Stream</span>
              </div>
              <h3 className="text-4xl font-[1000] italic uppercase tracking-tighter">Satellite Surveillance</h3>
            </div>
            <div className="flex gap-4">
              <button className="flex items-center gap-2 bg-white/5 px-6 py-3 rounded-full text-[10px] font-black border border-white/10 hover:bg-white/10 transition-all uppercase">
                <Filter size={14} /> Refine Feed
              </button>
            </div>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[1100px]">
              <thead>
                <tr className="text-[10px] font-black uppercase text-gray-500 tracking-[0.4em] bg-black/40 border-b border-white/5">
                  <th className="px-12 py-8">User Entity</th>
                  <th className="px-10 py-8">Protocol</th>
                  <th className="px-10 py-8">Magnitude</th>
                  <th className="px-10 py-8">Neural Lifespan</th>
                  <th className="px-12 py-8 text-right">Verification</th>
                </tr>
              </thead>
              <tbody className="text-[13px] font-bold uppercase italic tabular-nums">
                {persistentSubs.map((sub, i) => {
                  const status = getSubscriptionStatus(sub.calculatedStart, sub.calculatedEnd);
                  
                  return (
                    <motion.tr 
                      key={sub.id}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ backgroundColor: 'rgba(255,114,34,0.03)' }}
                      className="border-b border-white/5 group transition-colors"
                    >
                      <td className="px-12 py-8">
                        <div className="flex items-center gap-5">
                          <div className={`w-12 h-12 rounded-2xl bg-black border border-white/10 flex items-center justify-center text-[#FF7222] shadow-inner group-hover:scale-110 transition-transform`}>
                             <Users size={20} />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-lg font-[1000] tracking-tighter text-white group-hover:text-[#FF7222] transition-colors">{sub.user}</span>
                            <span className="text-[9px] font-black text-gray-500 lowercase not-italic tracking-wider opacity-60 flex items-center gap-1">
                              <Mail size={10} /> {sub.user.toLowerCase()}@uplink.io
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <span className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black tracking-widest">{sub.plan}</span>
                      </td>
                      <td className="px-10 py-8">
                        <div className="text-[#FF7222] text-xl font-[1000] drop-shadow-[0_0_10px_rgba(255,114,34,0.3)]">
                           {sub.plan === 'Elite Force' ? '$499' : sub.plan === 'Premium' ? '$199' : '$49'}
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <div className="min-w-[180px]">
                          <div className={`text-[16px] font-[1000] mb-2 ${status.color}`}>{status.timeStr}</div>
                          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 shadow-inner">
                            <motion.div 
                              className={`h-full ${status.bg} shadow-[0_0_10px_currentColor]`}
                              animate={{ width: `${status.percent}%` }}
                              transition={{ duration: 1, ease: "linear" }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-12 py-8 text-right">
                        <AnimatePresence mode="wait">
                          <motion.div 
                            key={status.timeStr}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl border font-black text-[10px] tracking-widest ${status.timeStr === "EXPIRED" ? 'text-red-500 bg-red-500/10 border-red-500/20' : 'text-green-500 bg-green-500/10 border-green-500/20'}`}
                          >
                            {status.timeStr === "EXPIRED" ? <AlertCircle size={14} /> : <ShieldCheck size={14} className="animate-pulse" />} 
                            {status.timeStr === "EXPIRED" ? "NODE_TERMINATED" : "VERIFIED_ACTIVE"}
                          </motion.div>
                        </AnimatePresence>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { height: 6px; width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #050505; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1a1a1a; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #FF7222; }
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
      `}</style>
    </div>
  );
};

export default PlansRevenue;