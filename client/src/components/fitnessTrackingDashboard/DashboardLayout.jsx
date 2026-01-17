import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';

const DashboardLayout = () => {
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-[#020202] text-white selection:bg-[#FF7222] selection:text-black overflow-hidden font-['Outfit']">
      
      {/* --- ELITE HOLOGRAPHIC ATMOSPHERE --- */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[60%] h-[60%] bg-[#FF7222]/10 blur-[140px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[50%] bg-blue-600/5 blur-[120px] rounded-full" />
        
        {/* Cinematic Grid & Scanlines */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] z-10 bg-[length:100%_3px,3px_100%]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-overlay" />
      </div>

      <Sidebar />

      <main className="flex-1 lg:ml-80 relative z-10 flex flex-col">
        {/* --- PREMIUM STATUS HEADER --- */}
        <header className="sticky top-0 z-[100] px-8 py-6 backdrop-blur-2xl bg-[#020202]/40 border-b border-white/5 flex justify-between items-center shadow-[0_10px_40px_rgba(0,0,0,0.7)]">
           <motion.div 
             initial={{ opacity: 0, x: -30 }} 
             animate={{ opacity: 1, x: 0 }}
             className="flex items-center gap-5"
           >
             <div className="relative flex items-center justify-center">
                <div className="h-4 w-4 rounded-full bg-[#FF7222] animate-ping absolute opacity-20" />
                <div className="h-2.5 w-2.5 rounded-full bg-[#FF7222] shadow-[0_0_15px_#FF7222]" />
             </div>
             <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-[0.6em] text-white/90 leading-none">System_Link: Stable</span>
                <span className="text-[8px] font-bold text-gray-500 uppercase mt-1.5">Node_ID: PX-992 // 2.0.6</span>
             </div>
           </motion.div>

           <div className="flex items-center gap-8">
              <div className="hidden md:flex flex-col items-end border-r border-white/10 pr-6">
                 <p className="text-[9px] font-black uppercase text-[#FF7222] italic tracking-widest">Sync Speed</p>
                 <p className="text-sm font-black text-white italic leading-none mt-0.5">0.024<span className="text-[9px] text-gray-600 ml-1">MS</span></p>
              </div>
              <motion.button 
                whileHover={{ rotate: 180, scale: 1.1, backgroundColor: "rgba(255,114,34,0.15)" }}
                whileTap={{ scale: 0.9 }}
                className="bg-white/5 p-3 rounded-xl border border-white/10 transition-all duration-500"
              >
                <span className="text-xl block">⚙️</span>
              </motion.button>
           </div>
        </header>

        {/* --- DYNAMIC TRANSITION VIEWPORT --- */}
        <div className="p-6 md:p-12 flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 50, scale: 0.98, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -50, scale: 1.02, filter: 'blur(10px)' }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>

        <footer className="px-12 py-8 opacity-30 border-t border-white/5 flex justify-between text-[9px] font-black uppercase tracking-[0.5em]">
           <p className="hover:text-[#FF7222] transition-colors cursor-help">© Pulse Elite Systems // Global</p>
           <p className="text-[#FF7222] animate-pulse">Terminal_Hash: 7X-091</p>
        </footer>
      </main>
    </div>
  );
};

export default DashboardLayout;