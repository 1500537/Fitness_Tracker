import React from 'react';
import { Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';

const DashboardLayout = () => {
  return (
    <div className="flex min-h-screen bg-[#020202] text-white selection:bg-[#FF7222] selection:text-black overflow-hidden">
      
      {/* --- EXTREME BACKGROUND DECOR (HOLOGRAPHIC) --- */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Top Right Orange Glow */}
        <div className="absolute -top-[10%] -right-[5%] w-[40%] h-[40%] bg-[#FF7222]/10 blur-[150px] rounded-full" />
        {/* Bottom Left Blue Glow (Contrast) */}
        <div className="absolute -bottom-[10%] -left-[5%] w-[30%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
        {/* Grid Overlay for Tech Look */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] brightness-100" />
      </div>

      {/* --- 3D STATIC SIDEBAR --- */}
      <Sidebar />

      {/* --- MAIN VANTAGE POINT (The Content) --- */}
      <main className="flex-1 lg:ml-80 relative z-10">
        {/* Dynamic Header for Dashboard (Status Bar) */}
        <header className="sticky top-0 z-[50] px-6 py-6 md:px-12 backdrop-blur-sm bg-[#020202]/30 flex justify-between items-center border-b border-white/5">
           <motion.div 
             initial={{ opacity: 0, x: -20 }} 
             animate={{ opacity: 1, x: 0 }}
             className="flex items-center gap-4"
           >
             <div className="h-2 w-2 rounded-full bg-[#FF7222] animate-pulse shadow-[0_0_10px_#FF7222]" />
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">System Live // v2.0.6</span>
           </motion.div>

           <div className="flex items-center gap-6">
              <div className="hidden md:flex flex-col items-end">
                 <p className="text-[10px] font-black uppercase text-gray-500 italic">Sync Time</p>
                 <p className="text-xs font-bold text-white uppercase italic">0.024ms</p>
              </div>
              <button className="bg-white/5 p-3 rounded-xl border border-white/10 hover:border-[#FF7222]/50 transition-all group">
                <span className="group-hover:rotate-180 block transition-transform duration-500 text-xl">⚙️</span>
              </button>
           </div>
        </header>

        {/* --- PAGE VIEWPORT WITH SMOOTH TRANSITIONS --- */}
        <div className="p-6 md:p-12 min-h-[calc(100vh-80px)]">
          <AnimatePresence mode="wait">
            <motion.div
              key={window.location.pathname} // Har route change par trigger hoga
              initial={{ opacity: 0, y: 30, filter: 'blur(10px)', scale: 0.98 }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)', scale: 1 }}
              exit={{ opacity: 0, y: -30, filter: 'blur(10px)', scale: 1.02 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* --- BOTTOM DECORATIVE BAR --- */}
        <footer className="px-12 py-8 opacity-20 border-t border-white/5 flex justify-between text-[10px] font-black uppercase tracking-widest pointer-events-none">
           <p>© Pulse Elite Systems</p>
           <p>Terminal Hash: 7X-091</p>
        </footer>
      </main>
    </div>
  );
};

export default DashboardLayout;