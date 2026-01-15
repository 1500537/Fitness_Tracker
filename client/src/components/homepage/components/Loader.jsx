import React from 'react';
import { motion } from 'framer-motion';

const AdvancedBiometricLoader = () => {
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 backdrop-blur-md">
      {/* --- MAIN GLASS CONTAINER --- */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-[450px] h-[450px] bg-white/[0.03] border border-white/10 rounded-[4rem] flex flex-col items-center justify-center overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
      >
        {/* Animated Scanning Grid Background */}
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

        {/* --- 3D ROTATING INTERFACE --- */}
        <div className="relative w-64 h-64 flex items-center justify-center perspective-[1000px]">
          
          {/* Outer Holographic Ring */}
          <motion.div
            animate={{ rotateZ: 360, rotateX: [60, 50, 60], rotateY: [10, -10, 10] }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border-[2px] border-dashed border-[#FF7222]/40 rounded-full shadow-[0_0_30px_#FF722230]"
          />

          {/* Middle Floating Hexagon Frame */}
          <motion.div
            animate={{ rotateZ: -360, scale: [1, 1.1, 1] }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute w-48 h-48 border-[1px] border-white/20 rounded-[2rem] rotate-45"
          />

          {/* Inner Core: The 3D Pulse Disc */}
          <motion.div
            animate={{ 
              rotateX: [70, 65, 70],
              rotateY: [5, -5, 5],
              rotateZ: 360 
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            className="relative w-40 h-40 border-b-4 border-t-4 border-[#FF7222] rounded-full flex items-center justify-center shadow-[0_0_60px_#FF722260]"
          >
            {/* Pulsing Energy Sphere */}
            <motion.div 
              animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-16 h-16 bg-[#FF7222] rounded-full blur-2xl"
            />
          </motion.div>

          {/* X-Ray Laser Scanner Line */}
          <motion.div
            animate={{ top: ["10%", "90%", "10%"] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-[-20%] right-[-20%] h-[1px] bg-gradient-to-r from-transparent via-[#FF7222] to-transparent z-50 shadow-[0_0_15px_#FF7222]"
          />
        </div>

        {/* --- DATA PACKET ANIMATION --- */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: 400, x: Math.random() * 400, opacity: 0 }}
              animate={{ y: -50, opacity: [0, 1, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: i * 0.5, ease: "linear" }}
              className="absolute w-[1px] h-8 bg-gradient-to-t from-transparent via-[#FF7222] to-transparent"
            />
          ))}
        </div>

        {/* --- INFO PANEL (BOTTOM) --- */}
        <div className="mt-12 text-center z-10">
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="flex items-center gap-3 justify-center"
          >
            <span className="w-2 h-2 bg-[#FF7222] rounded-full shadow-[0_0_10px_#FF7222]"></span>
            <h2 className="text-white font-[1000] italic tracking-[0.6em] uppercase text-[10px]">
              Syncing Neural Core
            </h2>
          </motion.div>
          
          <div className="mt-4 flex gap-1 justify-center opacity-40">
            {["ID_77X", "SYNC_01", "BUF_ERR_0", "DATA_LNK"].map((txt, i) => (
                <span key={i} className="text-[6px] font-black text-white/50 border border-white/10 px-2 py-1 rounded">
                    {txt}
                </span>
            ))}
          </div>
        </div>

        {/* Glass Reflection Flare */}
        <div className="absolute top-[-50%] left-[-50%] w-full h-full bg-white/5 rotate-45 pointer-events-none blur-3xl"></div>
      </motion.div>
    </div>
  );
};

export default AdvancedBiometricLoader;