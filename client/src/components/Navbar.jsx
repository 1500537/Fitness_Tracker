import React, { useState } from 'react';

const Navbar = () => {
  const [hoveredItem, setHoveredItem] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false); // Default Light for Black text
  const navItems = ['Home', 'About', 'Pricing', 'Contact'];

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    // document.documentElement.classList.toggle('dark'); // Optional: Toggle dark class on body
  };

  return (
    <nav className="flex items-center justify-between w-full px-6 md:px-16 py-6 md:py-10 bg-transparent absolute top-0 z-[100]">
      
      {/* --- LEFT: LOGO --- */}
      <div className="flex items-center">
        <div className="flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full bg-black shadow-2xl cursor-pointer transition-all duration-700 hover:rotate-[360deg] relative group">
          <div className="absolute inset-0 bg-[#FF7222] rounded-full animate-ping opacity-0 group-hover:opacity-20 transition-opacity"></div>
          <svg viewBox="0 0 24 24" fill="#FF7222" className="w-6 h-6 md:w-8 md:h-8 relative z-10 transition-transform duration-500 group-hover:scale-110">
            <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
          </svg>
        </div>
      </div>

      {/* --- CENTER: NAVIGATION PILL (Desktop Only) --- */}
      <div className="hidden lg:flex relative items-center bg-black/[0.05] backdrop-blur-md px-2 py-2 rounded-full border border-black/10 shadow-sm group/nav">
        <ul className="flex items-center relative">
          {navItems.map((item) => (
            <li 
              key={item}
              onMouseEnter={() => setHoveredItem(item)}
              onMouseLeave={() => setHoveredItem(null)}
              className="relative z-10"
            >
              <a 
                href={`#${item.toLowerCase()}`} 
                className={`px-10 py-3 text-[14px] font-[1000] uppercase tracking-[0.15em] italic transition-all duration-500 block
                  ${hoveredItem === item ? 'text-white' : 'text-black'}`}
              >
                {item}
              </a>
            </li>
          ))}
          
          {/* Liquid Orange Slider */}
          <div 
            className="absolute top-0 bottom-0 left-0 bg-[#FF7222] rounded-full transition-all duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] z-0 shadow-[0_10px_20px_rgba(255,114,34,0.3)]"
            style={{
              width: `${100 / navItems.length}%`,
              transform: `translateX(${navItems.indexOf(hoveredItem) * 100}%)`,
              opacity: hoveredItem ? 1 : 0,
              visibility: hoveredItem ? 'visible' : 'hidden'
            }}
          />
        </ul>
      </div>

      {/* --- RIGHT: ACTIONS (Toggle + Profile) --- */}
      <div className="flex items-center gap-3 md:gap-6">
        
        {/* DAY/NIGHT TOGGLE */}
        <button 
          onClick={toggleTheme}
          className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-black/10 flex items-center justify-center bg-black/5 hover:bg-black hover:text-white transition-all duration-500 group"
        >
          <div className="relative w-5 h-5 flex items-center justify-center overflow-hidden">
            {isDarkMode ? (
              /* Moon Icon */
              <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5 text-[#FF7222] animate-in slide-in-from-bottom-full duration-500">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
              </svg>
            ) : (
              /* Sun Icon */
              <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className="w-5 h-5 text-black group-hover:text-[#FF7222] animate-in slide-in-from-top-full duration-500">
                <circle cx="12" cy="12" r="5" /><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42m12.72-12.72l1.42-1.42" />
              </svg>
            )}
          </div>
        </button>

        {/* PROFILE SECTION */}
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[9px] font-black uppercase tracking-widest text-black/40">Status</span>
            <span className="text-[10px] font-[1000] uppercase tracking-tighter text-black italic leading-none">Elite</span>
          </div>

          <div className="relative">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white border-2 border-black/10 overflow-hidden transition-transform duration-500 group-hover:scale-110 shadow-lg">
              <img 
                src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=100&auto=format&fit=crop" 
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
        </div>
      </div>

      {/* --- MOBILE BOTTOM NAVBAR (Floating Pill) --- */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[85%] bg-white/90 backdrop-blur-xl border border-black/10 h-14 rounded-full flex items-center justify-around px-4 z-[200] shadow-xl">
        {navItems.map((item) => (
          <a 
            key={item} 
            href={`#${item.toLowerCase()}`} 
            className="text-[10px] font-black uppercase text-black/60 hover:text-[#FF7222] transition-colors tracking-widest italic"
          >
            {item}
          </a>
        ))}
      </div>

    </nav>
  );
};

export default Navbar;