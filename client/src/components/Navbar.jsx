import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Link as ScrollLink } from 'react-scroll'; // Smooth scroll ke liye
import { motion } from 'framer-motion';
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/clerk-react';

const Navbar = () => {
  const [hoveredItem, setHoveredItem] = useState(null);
  const { user, isLoaded } = useUser();
  
  // Navigation items logic
  const publicItems = ['Home', 'About', 'Pricing', 'Contact'];
  const currentNavItems = user ? [...publicItems, 'Tracker'] : publicItems;

  return (
    <nav className="flex items-center justify-between w-full px-6 md:px-16 py-6 md:py-10 bg-transparent absolute top-0 z-[100]">
      
      {/* LEFT: LOGO */}
      <div className="flex items-center">
        <RouterLink to="/" className="flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full bg-black shadow-2xl transition-all duration-700 hover:rotate-[360deg] relative group border border-white/10">
          <svg viewBox="0 0 24 24" fill="#FF7222" className="w-6 h-6 md:w-8 md:h-8 relative z-10">
            <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
          </svg>
        </RouterLink>
      </div>

      {/* CENTER: NAV PILL (Robust & Professional) */}
      <div className="hidden lg:flex relative items-center bg-black/10 backdrop-blur-2xl px-2 py-2 rounded-full border border-white/10 shadow-2xl">
        <ul className="flex items-center relative">
          {currentNavItems.map((item) => (
            <li 
              key={item}
              onMouseEnter={() => setHoveredItem(item)}
              onMouseLeave={() => setHoveredItem(null)}
              className="relative z-10"
            >
              {item === 'Tracker' ? (
                // Tracker ke liye real route
                <RouterLink 
                  to="/dashboard" 
                  className={`px-10 py-3 text-[13px] font-black uppercase tracking-[0.2em] italic transition-all duration-500 block ${hoveredItem === item ? 'text-white' : 'text-black/70'}`}
                >
                  {item}
                </RouterLink>
              ) : (
                // Baki items ke liye smooth scroll
                <ScrollLink
                  to={item.toLowerCase()}
                  smooth={true}
                  duration={800}
                  offset={-20}
                  className={`px-10 py-3 text-[13px] font-black uppercase tracking-[0.2em] italic cursor-pointer transition-all duration-500 block ${hoveredItem === item ? 'text-white' : 'text-black/70'}`}
                >
                  {item}
                </ScrollLink>
              )}
            </li>
          ))}

          {/* DYNAMIC ORANGE SLIDER */}
          <motion.div 
            className="absolute top-0 bottom-0 left-0 bg-[#FF7222] rounded-full z-0 shadow-[0_0_25px_rgba(255,114,34,0.5)]"
            initial={false}
            animate={{
              width: `${100 / currentNavItems.length}%`,
              x: `${currentNavItems.indexOf(hoveredItem) * 100}%`,
              opacity: hoveredItem ? 1 : 0
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        </ul>
      </div>

      {/* RIGHT: AUTH SECTION (Neural ID Aesthetic) */}
      <div className="flex items-center gap-4">
        {!isLoaded ? (
          <div className="w-12 h-12 rounded-full bg-black/10 animate-pulse" />
        ) : (
          <>
            <SignedOut>
              <SignInButton mode="modal">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-3 bg-white/10 backdrop-blur-xl p-1.5 pr-6 rounded-full border border-white/20 shadow-xl hover:bg-black group transition-all duration-500"
                >
                  <div className="w-10 h-10 rounded-full bg-[#FF7222] flex items-center justify-center text-black">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                  </div>
                  <div className="hidden sm:flex flex-col items-start leading-none text-left">
                    <span className="text-[8px] font-black uppercase tracking-widest text-[#FF7222]">Access Portal</span>
                    <span className="text-[11px] font-black uppercase text-white italic group-hover:text-[#FF7222] transition-colors">Sign In</span>
                  </div>
                </motion.button>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 bg-white/10 backdrop-blur-xl p-1.5 pr-4 rounded-full border border-white/20 shadow-xl hover:border-[#FF7222]/50 transition-all duration-500"
              >
                <UserButton 
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "w-10 h-10 border-2 border-[#FF7222] shadow-[0_0_15px_rgba(255,114,34,0.3)]",
                    }
                  }}
                />
                <div className="hidden sm:flex flex-col items-start leading-none">
                  <span className="text-[8px] font-black uppercase tracking-widest text-[#FF7222]">Neural Active</span>
                  <span className="text-[11px] font-black uppercase text-white italic truncate max-w-[80px]">
                    {user?.firstName}
                  </span>
                </div>
              </motion.div>
            </SignedIn>
          </>
        )}
      </div>

      {/* MOBILE NAV (Synced with Auth) */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] bg-black/80 backdrop-blur-3xl border border-white/10 h-16 rounded-[2rem] flex items-center justify-around px-6 z-[200] shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        {currentNavItems.map((item) => (
           item === 'Tracker' ? 
           <RouterLink key={item} to="/dashboard" className="text-[10px] font-black uppercase text-white/40 hover:text-[#FF7222] italic tracking-widest transition-colors">{item}</RouterLink> :
           <ScrollLink key={item} to={item.toLowerCase()} smooth={true} className="text-[10px] font-black uppercase text-white/40 hover:text-[#FF7222] italic tracking-widest transition-colors cursor-pointer">{item}</ScrollLink>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;