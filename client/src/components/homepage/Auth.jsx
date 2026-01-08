import React, { useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // --- 3D INTERACTIVE ENGINE ---
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);
  
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7deg", "-7deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7deg", "7deg"]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const triggerAuth = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000); // Simulated Neural Link
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      className="min-h-screen bg-[#020202] flex items-center justify-center p-4 md:p-10 font-['Outfit'] overflow-hidden relative"
    >
      {/* --- BACKGROUND DYNAMICS --- */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute -top-[20%] -right-[10%] w-[80%] h-[80%] bg-[#FF7222]/10 blur-[150px] rounded-full" 
        />
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
      </div>

      {/* --- CINEMATIC LOADER --- */}
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center"
          >
            <div className="w-20 h-20 relative">
               <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="absolute inset-0 border-b-2 border-r-2 border-[#FF7222] rounded-full" />
               <div className="absolute inset-2 border border-white/5 rounded-full" />
            </div>
            <p className="mt-8 text-[10px] font-black uppercase tracking-[0.8em] text-[#FF7222] animate-pulse">Establishing Neural Link</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- AUTH GATEWAY CARD --- */}
      <motion.div 
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative z-10 w-full max-w-[1200px] min-h-[700px] flex flex-col lg:flex-row bg-white/[0.01] border border-white/10 rounded-[4rem] overflow-hidden backdrop-blur-3xl shadow-[0_80px_150px_-30px_rgba(0,0,0,0.8)]"
      >
        
        {/* --- LEFT VISUAL CORE --- */}
        <motion.div 
          layout
          className={`hidden lg:flex flex-col justify-between p-20 w-[45%] relative transition-all duration-1000 ${isLogin ? 'bg-[#FF7222]' : 'bg-white'}`}
        >
          <div className="relative z-10" style={{ transform: "translateZ(60px)" }}>
            <h2 className={`text-8xl font-[1000] italic leading-[0.8] uppercase tracking-tighter ${isLogin ? 'text-black' : 'text-[#FF7222]'}`}>
              Pulse<br />{isLogin ? 'Elite' : 'Core'}
            </h2>
            <div className={`h-1 w-20 mt-8 ${isLogin ? 'bg-black/20' : 'bg-[#FF7222]/20'}`} />
          </div>

          <div className="relative z-10" style={{ transform: "translateZ(40px)" }}>
            <p className="text-3xl font-bold italic text-black leading-tight tracking-tighter">
              {isLogin ? "Unlock your performance dashboard." : "Initiate your digital transformation."}
            </p>
            <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-black/40">Secure Encrypted Gateway</p>
          </div>

          {/* 3D Floating Elements */}
          <div className="absolute -bottom-10 -right-10 text-[18rem] font-black opacity-10 italic tracking-tighter pointer-events-none selection:bg-none">
            {isLogin ? 'IN' : 'UP'}
          </div>
        </motion.div>

        {/* --- RIGHT FORM ENGINE --- */}
        <div className="flex-1 p-8 md:p-20 lg:p-24 flex flex-col justify-center relative bg-[#050505]/40">
          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? 'login' : 'register'}
              initial={{ opacity: 0, x: 50, filter: 'blur(10px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, x: -50, filter: 'blur(10px)' }}
              transition={{ duration: 0.6, ease: "circOut" }}
            >
              <header className="mb-12">
                <h3 className="text-5xl font-[1000] italic uppercase tracking-tighter text-white">
                  {isLogin ? 'Authenticate' : 'Register Unit'}
                </h3>
                <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mt-3">Universal Access Node</p>
              </header>

              <form onSubmit={triggerAuth} className="space-y-6">
                {!isLogin && (
                  <div className="relative group">
                    <input type="text" required placeholder="IDENTIFICATION NAME" className="w-full bg-white/5 border-b border-white/10 p-4 text-white font-bold outline-none focus:border-[#FF7222] transition-all placeholder:text-white/10 text-sm tracking-widest uppercase" />
                  </div>
                )}
                <div className="relative group">
                  <input type="email" required placeholder="NEURAL EMAIL" className="w-full bg-white/5 border-b border-white/10 p-4 text-white font-bold outline-none focus:border-[#FF7222] transition-all placeholder:text-white/10 text-sm tracking-widest uppercase" />
                </div>
                <div className="relative group">
                  <input type="password" required placeholder="ACCESS KEY" className="w-full bg-white/5 border-b border-white/10 p-4 text-white font-bold outline-none focus:border-[#FF7222] transition-all placeholder:text-white/10 text-sm tracking-widest" />
                </div>

                <motion.button 
                  whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(0,0,0,0.4)" }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full py-6 rounded-2xl font-[1000] italic uppercase tracking-[0.3em] transition-all duration-500 shadow-2xl ${isLogin ? 'bg-[#FF7222] text-white shadow-[#FF7222]/20' : 'bg-white text-black'}`}
                >
                  {isLogin ? 'Initialize Sync' : 'Finalize Uplink'}
                </motion.button>
              </form>

              {/* GOOGLE HUB */}
              <div className="mt-12">
                <div className="relative flex items-center justify-center mb-8">
                  <div className="w-full border-t border-white/5"></div>
                  <span className="absolute bg-[#080808] px-4 text-[9px] font-black text-gray-600 uppercase tracking-widest">Third-Party Gateway</span>
                </div>
                
                <motion.button 
                  whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                  className="w-full border border-white/10 py-4 rounded-2xl flex items-center justify-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] text-white/60 transition-all hover:text-white"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  </svg>
                  Sync with Google
                </motion.button>
              </div>

              <footer className="mt-12 text-center">
                <button 
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-[#FF7222] transition-colors"
                >
                  {isLogin ? "Request New Identity?" : "Back to Verification?"}
                </button>
              </footer>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
      
      {/* --- STATUS DECOR --- */}
      <div className="fixed bottom-10 left-10 hidden xl:block">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.5em]">Network: Global_Secure</span>
        </div>
      </div>
    </div>
  );
};

export default Auth;