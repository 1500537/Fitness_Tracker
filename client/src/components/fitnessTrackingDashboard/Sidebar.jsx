import React from 'react';
import { motion } from 'framer-motion';
import { NavLink, useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();
  const links = [
    { name: 'Overview', path: '/dashboard', icon: '⚡' },
    { name: 'Workouts', path: '/dashboard/workouts', icon: '🏋️‍♂️' },
    { name: 'Nutrition', path: '/dashboard/nutrition', icon: '🥗' },
    { name: 'Progress', path: '/dashboard/progress', icon: '📈' }
  ];

  return (
    <motion.aside 
      initial={{ x: -100, rotateY: 35, opacity: 0 }}
      animate={{ x: 0, rotateY: 15, opacity: 1 }}
      whileHover={{ rotateY: 2, x: 10 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      className="fixed left-8 top-8 bottom-8 w-80 bg-black/40 backdrop-blur-2xl text-white rounded-[4rem] p-10 flex flex-col z-[100] shadow-[50px_0_100px_rgba(0,0,0,0.8)] border border-white/10 hidden lg:flex overflow-hidden group/sidebar"
    >
      {/* --- BACKGROUND GLOW DECORATION --- */}
      <div className="absolute -top-20 -left-20 w-40 h-40 bg-[#FF7222]/20 blur-[100px] rounded-full pointer-events-none" />
      
      {/* --- LOGO SECTION (Redirects to Home) --- */}
      <div 
        onClick={() => navigate('/')}
        className="mb-16 cursor-pointer group/logo flex items-center gap-4"
      >
        <div className="w-12 h-12 bg-[#FF7222] rounded-2xl flex items-center justify-center rotate-12 group-hover/logo:rotate-[360deg] transition-all duration-700 shadow-[0_0_20px_#FF7222]">
          <span className="text-black font-black text-2xl tracking-tighter italic">P</span>
        </div>
        <h2 className="text-3xl font-[1000] italic uppercase tracking-tighter group-hover/logo:tracking-widest transition-all duration-500">
          Elite<span className="text-[#FF7222]">Pulse</span>
        </h2>
      </div>

      {/* --- NAVIGATION LINKS --- */}
      <nav className="flex-1 space-y-6">
        {links.map((link) => (
          <NavLink 
            key={link.name} 
            to={link.path}
            end={link.path === '/dashboard'} // Proper active matching
            className={({ isActive }) => `
              relative flex items-center gap-5 p-5 rounded-[2rem] transition-all duration-500 group/item overflow-hidden
              ${isActive ? 'bg-[#FF7222] text-black shadow-[0_20px_40px_rgba(255,114,34,0.3)]' : 'text-gray-400 hover:text-white hover:bg-white/5'}
            `}
          >
            {/* Active Indicator Bar */}
            <motion.div 
               className={`absolute left-0 w-1 h-8 bg-black rounded-full transition-all duration-300`}
               initial={false}
               animate={{ opacity: 1 }}
            />

            <motion.span 
              whileHover={{ scale: 1.3, rotate: -10 }}
              className="text-2xl relative z-10"
            >
              {link.icon}
            </motion.span>
            
            <span className="font-[1000] italic uppercase text-[11px] tracking-[0.25em] relative z-10">
              {link.name}
            </span>

            {/* Hover Shine Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover/item:translate-x-full transition-transform duration-1000" />
          </NavLink>
        ))}
      </nav>

      {/* --- USER PROFILE WIDGET --- */}
      <motion.div 
        whileHover={{ y: -5 }}
        className="bg-gradient-to-br from-white/10 to-white/5 p-6 rounded-[3rem] border border-white/10 relative group/profile cursor-pointer shadow-2xl"
      >
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FF7222] to-orange-400 rotate-6 group-hover/profile:rotate-0 transition-all duration-500 overflow-hidden border-2 border-white/20">
               <img src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=100" alt="avatar" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-black rounded-full" />
          </div>
          <div>
            <p className="text-xs font-black uppercase italic tracking-tighter">Alex Vanguard</p>
            <div className="flex items-center gap-1">
               <span className="w-2 h-2 bg-[#FF7222] rounded-full animate-pulse" />
               <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Active Level 09</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* --- DECORATIVE PERSPECTIVE SKEW --- */}
      <div className="absolute bottom-10 -right-10 opacity-5 pointer-events-none">
        <h1 className="text-[10rem] font-black italic uppercase leading-none">PULSE</h1>
      </div>
    </motion.aside>
  );
};

export default Sidebar;