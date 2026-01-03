import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { dashboardData } from '../../assets/assets';
import WorkoutModule from '../../components/fitnessTrackingDashboard/Workout';
import NutritionModule from '../../components/fitnessTrackingDashboard/Nutrition';
import ProgressModule from '../../components/fitnessTrackingDashboard/Progress';


const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('Workouts');

  return (
    <div className="min-h-screen bg-[#020202] text-white selection:bg-[#FF7222] selection:text-black overflow-x-hidden relative pb-10">
      
      {/* --- LAYER 0: HOLOGRAPHIC BACKGROUND FX --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-[#FF7222]/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-blue-600/5 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.02]" />
      </div>

      <div className="relative z-10 w-full max-w-[1800px] mx-auto px-4 sm:px-8 lg:px-12 pt-8 md:pt-16">
        
        {/* --- HEADER: EXTREME TYPOGRAPHY (RESPONSIVE CLAMP) --- */}
        <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-10 mb-16 md:mb-24">
          <motion.div 
            initial={{ x: -100, opacity: 0 }} 
            animate={{ x: 0, opacity: 1 }}
            className="border-l-4 md:border-l-8 border-[#FF7222] pl-6 md:pl-10"
          >
            <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.6em] text-[#FF7222] mb-4">Neural Link Established</p>
            <h1 className="text-[clamp(3rem,10vw,10rem)] font-[1000] italic leading-[0.8] tracking-[ -0.05em] uppercase">
              PULSE<br />
              <span className="text-transparent stroke-text italic">ELITE</span>
            </h1>
          </motion.div>

          {/* --- TAB NAV: 3D SLIDER --- */}
          <nav className="w-full xl:w-auto bg-white/5 backdrop-blur-3xl p-2 rounded-3xl md:rounded-[3rem] border border-white/10 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
            {dashboardData.tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-6 md:px-12 py-4 md:py-6 rounded-2xl md:rounded-[2.5rem] text-[10px] md:text-xs font-black uppercase tracking-widest transition-all duration-500 whitespace-nowrap
                ${activeTab === tab.id ? 'text-black' : 'text-gray-500 hover:text-white'}`}
              >
                {activeTab === tab.id && (
                  <motion.div 
                    layoutId="activeTabGlow"
                    className="absolute inset-0 bg-[#FF7222] rounded-2xl md:rounded-[2.5rem] shadow-[0_0_40px_rgba(255,114,34,0.6)]"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-3">
                  <span className="hidden sm:inline">{tab.icon}</span> {tab.id}
                </span>
              </button>
            ))}
          </nav>
        </header>

        {/* --- STATUS BAR: SMART ADAPTIVE GRID --- */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12 md:mb-20">
          {dashboardData.stats.map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.05, translateZ: 20 }}
              className="bg-white/[0.03] border border-white/10 p-5 md:p-8 rounded-[2rem] md:rounded-[2.5rem] backdrop-blur-2xl hover:bg-white/5 transition-all"
            >
              <p className="text-[8px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 italic">{stat.label}</p>
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full animate-ping ${stat.color === 'text-white' ? 'bg-white' : stat.color.replace('text', 'bg')}`} />
                <h4 className={`text-lg md:text-2xl font-[1000] italic uppercase ${stat.color}`}>{stat.val}</h4>
              </div>
            </motion.div>
          ))}
        </div>

        {/* --- MAIN PORTAL: THE 3D VIEWPORT --- */}
        <div className="relative group perspective-3000">
          {/* Decorative Corner Accents (Scaling with UI) */}
          <div className="absolute -top-6 -left-6 md:-top-10 md:-left-10 w-24 h-24 border-t-4 border-l-4 border-[#FF7222] rounded-tl-[3rem] opacity-30 group-hover:opacity-100 transition-opacity" />
          <div className="absolute -bottom-6 -right-6 md:-bottom-10 md:-right-10 w-24 h-24 border-b-4 border-r-4 border-[#FF7222] rounded-br-[3rem] opacity-30 group-hover:opacity-100 transition-opacity" />

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, rotateY: 15, scale: 0.9, filter: 'blur(20px)' }}
              animate={{ opacity: 1, rotateY: 0, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, rotateY: -15, scale: 1.1, filter: 'blur(20px)' }}
              transition={{ duration: 0.7, ease: [0.19, 1, 0.22, 1] }}
              className="relative z-10 w-full"
            >
              <div className="w-full">
                {activeTab === 'Workouts' && <WorkoutModule />}
                {activeTab === 'Nutrition' && <NutritionModule />}
                {activeTab === 'Progress' && <ProgressModule />}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* --- GLOBAL STYLES --- */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100;400;900&display=swap');
        
        body { font-family: 'Outfit', sans-serif; }
        .stroke-text { -webkit-text-stroke: 1.5px rgba(255,255,255,0.2); }
        @media (max-width: 768px) { .stroke-text { -webkit-text-stroke: 1px rgba(255,255,255,0.2); } }
        
        .perspective-3000 { perspective: 3000px; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        /* Smooth Card Animations */
        .glass-card {
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
      `}</style>
    </div>
  );
};

export default Dashboard;