import React, { useState } from 'react';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false); // Mobile toggle
  const [activeTab, setActiveTab] = useState('Dashboard');

  const menuItems = [
    { name: 'Dashboard', icon: '📊' },
    { name: 'Workouts', icon: '💪' },
    { name: 'Diet Plan', icon: '🥗' },
    { name: 'Analytics', icon: '📈' },
    { name: 'Challenges', icon: '🏆' },
    { name: 'Settings', icon: '⚙️' },
  ];

  return (
    <>
      {/* --- MOBILE TOGGLE BUTTON --- */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-24 left-6 z-[110] p-3 bg-[#FF7222] text-white rounded-xl shadow-lg active:scale-90 transition-transform"
      >
        {isOpen ? '✕' : '☰'}
      </button>

      {/* --- SIDEBAR CONTAINER --- */}
      <aside className={`
        fixed top-0 left-0 h-screen z-[105] transition-all duration-500 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        w-72 md:w-80 bg-white dark:bg-[#0A0A0A]/80 backdrop-blur-xl
        border-r border-black/5 dark:border-white/10 p-8 flex flex-col
      `}>
        
        {/* LOGO SECTION */}
        <div className="flex items-center gap-4 mb-16 px-2">
          <div className="w-12 h-12 bg-black dark:bg-[#FF7222] rounded-2xl flex items-center justify-center shadow-xl rotate-3">
             <span className="text-white text-2xl font-black italic">P</span>
          </div>
          <div>
            <h2 className="text-xl font-[1000] italic uppercase leading-none dark:text-white">Pulse</h2>
            <p className="text-[10px] font-bold text-[#FF7222] uppercase tracking-[0.3em]">Hustle</p>
          </div>
        </div>

        {/* NAVIGATION LINKS */}
        <nav className="flex-1 space-y-3">
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => {
                setActiveTab(item.name);
                if(window.innerWidth < 1024) setIsOpen(false);
              }}
              className={`
                w-full flex items-center gap-5 px-6 py-4 rounded-2xl font-black uppercase italic text-sm tracking-widest transition-all duration-300 group relative
                ${activeTab === item.name 
                  ? 'bg-[#FF7222] text-white shadow-[0_10px_30px_rgba(255,114,34,0.3)] scale-105' 
                  : 'text-gray-500 hover:bg-black/5 dark:hover:bg-white/5 hover:text-black dark:hover:text-white'}
              `}
            >
              <span className={`text-xl transition-transform group-hover:scale-125 duration-500`}>
                {item.icon}
              </span>
              {item.name}
              
              {/* Active Indicator Line */}
              {activeTab === item.name && (
                <div className="absolute left-0 w-1.5 h-6 bg-white rounded-r-full" />
              )}
            </button>
          ))}
        </nav>

        {/* BOTTOM USER PROFILE CARD */}
        <div className="mt-auto pt-8 border-t border-black/5 dark:border-white/10">
          <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-[2.5rem] flex items-center gap-4 border border-black/5 dark:border-white/5 group cursor-pointer hover:border-[#FF7222] transition-all">
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=100" 
                alt="User" 
                className="w-12 h-12 rounded-full object-cover border-2 border-[#FF7222]"
              />
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-[#0A0A0A] rounded-full"></div>
            </div>
            <div className="overflow-hidden">
              <h4 className="font-black italic text-sm dark:text-white truncate">Alex Hustle</h4>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Pro Member</p>
            </div>
            <button className="ml-auto text-gray-400 hover:text-[#FF7222] transition-colors">
              ↳
            </button>
          </div>
        </div>

      </aside>

      {/* MOBILE OVERLAY (Sliding effect ke liye) */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] lg:hidden transition-all duration-500"
        />
      )}
    </>
  );
};

export default Sidebar;