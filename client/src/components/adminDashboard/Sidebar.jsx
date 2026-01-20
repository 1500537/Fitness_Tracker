import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  Dumbbell,
  Package, 
  TrendingUp, 
  LogOut, 
  Menu,
  X,
  Zap,
  Cpu,
  Fingerprint
} from 'lucide-react';

// --- PREMIUM SIDEBAR ITEM ---
const SidebarItem = ({ icon: Icon, label, isActive, onClick, isCollapsed, isMobile }) => {
  return (
    <motion.div
      onClick={onClick}
      whileHover={!isMobile ? { scale: 1.02, x: 5 } : { scale: 0.95 }}
      whileTap={{ scale: 0.95 }}
      className={`relative flex items-center p-3 md:p-4 cursor-pointer transition-all duration-500 rounded-2xl group ${
        isActive 
          ? 'bg-gradient-to-r from-[#FF7222]/20 to-[#FF7222]/5 border border-[#FF7222]/30 shadow-[0_0_20px_rgba(255,114,34,0.15)]' 
          : 'hover:bg-white/[0.03] border border-transparent'
      } ${isMobile ? 'flex-col gap-1 flex-1 justify-center' : 'mb-2'}`}
    >
      {/* ACTIVE NEON INDICATOR (Desktop Only) */}
      {isActive && !isMobile && (
        <motion.div 
          layoutId="activeGlow"
          className="absolute left-0 w-1 h-6 bg-[#FF7222] rounded-full shadow-[0_0_15px_#FF7222]"
        />
      )}

      <div className={`transition-all duration-500 flex-shrink-0 ${
        isActive ? 'text-[#FF7222] drop-shadow-[0_0_10px_rgba(255,114,34,0.6)]' : 'text-gray-500 group-hover:text-white'
      }`}>
        <Icon size={isMobile ? 20 : 22} strokeWidth={isActive ? 2.5 : 2} />
      </div>

      {(!isCollapsed || isMobile) && (
        <motion.span 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`font-[900] uppercase italic transition-all duration-500 ${
            isMobile ? 'text-[7px] tracking-widest' : 'text-[10px] ml-4 tracking-[0.2em]'
          } ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-gray-200'}`}
        >
          {label}
        </motion.span>
      )}

      {/* TOOLTIP (Collapsed Desktop) */}
      {isCollapsed && !isMobile && (
        <div className="absolute left-16 px-4 py-2 bg-white text-black text-[9px] font-black rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all translate-x-4 group-hover:translate-x-0 uppercase tracking-widest z-50">
          {label}
        </div>
      )}
    </motion.div>
  );
};

// --- MAIN ARCHITECTURE ---
const AdminSidebar = ({ onPageChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activePage, setActivePage] = useState('overview');
  const [isMobile, setIsMobile] = useState(false);

  // Responsive Detection
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Overview', page: 'overview' },
    { icon: Users, label: 'Users', page: 'users' },
    { icon: Dumbbell, label: 'Workouts', page: 'workouts' },
    { icon: Package, label: 'Plans', page: 'plans' },
    { icon: TrendingUp, label: 'Plans-Revenue', page: 'plans-revenue' },
  ];

  const handleClick = (page) => {
    setActivePage(page);
    if (onPageChange) onPageChange(page);
  };

  if (isMobile) {
    // --- MOBILE NAVIGATION (BOTTOM BAR) ---
    return (
      <nav className="fixed bottom-4 left-4 right-4 h-20 bg-black/80 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] z-[1000] flex items-center justify-around px-2 shadow-[0_-20px_40px_rgba(0,0,0,0.5)]">
        {menuItems.map((item, index) => (
          <SidebarItem
            key={index}
            {...item}
            isMobile={true}
            isActive={activePage === item.page}
            onClick={() => handleClick(item.page)}
          />
        ))}
      </nav>
    );
  }

  // --- DESKTOP SIDEBAR ---
  return (
    <LayoutGroup>
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? '100px' : '300px' }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        className="fixed left-0 top-0 h-screen bg-[#050505]/95 border-r border-white/5 z-[100] flex flex-col p-6 backdrop-blur-3xl overflow-hidden"
      >
        {/* TOP GLOW EFFECT */}
        <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-[#FF7222]/10 to-transparent pointer-events-none" />

        {/* LOGO AREA */}
        <div className={`flex items-center mb-12 relative z-10 ${isCollapsed ? 'justify-center' : 'justify-between px-2'}`}>
          <div className="flex items-center gap-4">
            <motion.div 
              whileHover={{ rotate: 180 }}
              className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.1)] cursor-pointer"
            >
              <Cpu size={24} color="black" strokeWidth={2.5} />
            </motion.div>
            {!isCollapsed && (
              <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                <h2 className="text-white font-[1000] italic uppercase tracking-tighter text-xl leading-none">VULCAN.UI</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-[7px] font-black text-gray-500 uppercase tracking-[0.3em]">System_Online</span>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* NAVIGATION */}
        <div className="flex-1 relative z-10">
          <p className={`text-[8px] font-black text-gray-600 uppercase tracking-[0.5em] mb-8 ${isCollapsed ? 'text-center' : 'px-4'}`}>
            {isCollapsed ? "---" : "Core_Management"}
          </p>
          <div className="space-y-2">
            {menuItems.map((item, index) => (
              <SidebarItem
                key={index}
                {...item}
                isCollapsed={isCollapsed}
                isActive={activePage === item.page}
                onClick={() => handleClick(item.page)}
              />
            ))}
          </div>
        </div>

        {/* USER PROFILE & COLLAPSE TOGGLE */}
        <div className="mt-auto relative z-10 space-y-4">
          <div className={`flex items-center gap-4 bg-white/[0.03] p-4 rounded-3xl border border-white/5 group hover:border-[#FF7222]/40 transition-all duration-500 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-800 to-black border border-white/10 flex items-center justify-center">
                <Fingerprint size={20} className="text-[#FF7222]" />
              </div>
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-white uppercase tracking-wider">Admin_Overseer</span>
                <span className="text-[7px] font-bold text-[#FF7222] uppercase tracking-[0.2em] animate-pulse">Class: S-Rank</span>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="flex-1 bg-white/5 hover:bg-white/10 p-4 rounded-2xl text-gray-400 transition-all flex items-center justify-center border border-white/5"
            >
              {isCollapsed ? <Zap size={18} /> : <Menu size={18} />}
            </button>
            {!isCollapsed && (
              <button className="flex-1 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white p-4 rounded-2xl transition-all flex items-center justify-center border border-red-500/20 shadow-lg shadow-red-500/5">
                <LogOut size={18} />
              </button>
            )}
          </div>
        </div>

        {/* DECORATIVE WATERMARK */}
        {!isCollapsed && (
          <div className="absolute -bottom-10 -right-10 opacity-[0.03] pointer-events-none select-none">
            <span className="text-[140px] font-black italic">NAV</span>
          </div>
        )}
      </motion.aside>
    </LayoutGroup>
  );
};

export default AdminSidebar;