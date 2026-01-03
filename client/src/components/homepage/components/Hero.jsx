import React, { useState } from 'react';
import { assets } from '../../../assets/assets';

const PulseHeartHero = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const fitnessData = [
    { label: "Heart Rate", value: "124 BPM", icon: "🔥", color: "text-orange-500" },
    { label: "Sleep Score", value: "85/100", icon: "🌙", color: "text-purple-500" },
    { label: "Oxygen (SpO2)", value: "98%", icon: "🫁", color: "text-red-500" },
    { label: "Daily Steps", value: "12,430", icon: "👟", color: "text-blue-500" }
  ];

  const nextMetric = () => setCurrentIndex((prev) => (prev + 1) % fitnessData.length);
  const sports = ['Extreme Running', 'Power Walking', 'Urban Cycling', 'High Hiking', 'Elite Yoga'];

  return (
    <div className="min-h-screen bg-[#F5F5F5] font-outfit relative overflow-hidden text-[#1a1a1a] pt-20 md:pt-0">
      <style>
        {`
          @keyframes infinite-scroll { from { transform: translateX(0); } to { transform: translateX(-100%); } }
          @keyframes infinite-scroll-reverse { from { transform: translateX(-100%); } to { transform: translateX(0); } }
          @keyframes athlete-entrance { 
            from { transform: translateY(100px) scale(0.9); opacity: 0; }
            to { transform: translateY(0px) scale(1); opacity: 1; }
          }
          @keyframes float-watch {
            0% { transform: rotate(12deg) translateY(0px); }
            50% { transform: rotate(15deg) translateY(-15px); }
            100% { transform: rotate(12deg) translateY(0px); }
          }
          @keyframes pulse-ring {
            0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255, 114, 34, 0.7); }
            70% { transform: scale(1); box-shadow: 0 0 0 15px rgba(255, 114, 34, 0); }
            100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255, 114, 34, 0); }
          }
          .animate-scroll { animation: infinite-scroll 40s linear infinite; }
          .animate-scroll-reverse { animation: infinite-scroll-reverse 40s linear infinite; }
          .animate-athlete { animation: athlete-entrance 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          .animate-watch-float { animation: float-watch 5s ease-in-out infinite; }
          .tap-pulse { animation: pulse-ring 2s infinite; }
        `}
      </style>

      <main className="max-w-[1440px] mx-auto px-6 md:px-10 flex flex-col lg:grid lg:grid-cols-12 relative items-center min-h-screen pb-40 md:pb-20 lg:pb-0">
        
        {/* LEFT: Athlete (Responsive adjustments) */}
        <div className="w-full lg:col-span-4 relative flex items-end z-20 order-2 lg:order-1 mt-10 lg:mt-0 h-[400px] md:h-[600px] lg:h-full">
          <div className="absolute bottom-0 w-full h-[80%] md:h-[500px] bg-white rounded-t-[100px] md:rounded-t-[180px] rounded-b-[40px] md:rounded-b-[60px] shadow-2xl border border-white/50"></div>
          <img 
            src={assets.athelete} 
            alt="Athlete" 
            className="relative z-30 w-full h-[450px] md:h-[700px] lg:h-[780px] object-cover grayscale hover:grayscale-0 transition-all duration-1000 animate-athlete" 
            style={{ objectPosition: 'top center', marginBottom: '-20px' }}
          />
        </div>

        {/* CENTER: Typography (Responsive font sizes) */}
        <div className="w-full lg:col-span-5 px-0 md:px-10 flex flex-col justify-center z-40 order-1 lg:order-2 text-center lg:text-left mt-10 md:mt-20 lg:mt-0">
          <h1 className="text-7xl md:text-[120px] lg:text-[180px] font-[900] leading-[0.8] md:leading-[0.75] tracking-[-0.08em] text-black uppercase italic drop-shadow-xl">
            Pulse<br />Heart
          </h1>
          <p className="text-gray-500 text-lg md:text-2xl max-w-[450px] mt-6 md:mt-10 font-medium leading-relaxed italic mx-auto lg:mx-0">
            Precision tracking meets elite performance. Elevate your hustle.
          </p>

          <div className="mt-8 md:mt-12 flex flex-col md:flex-row items-center gap-6 md:gap-10">
            <button className="w-full md:w-auto bg-black text-white px-10 md:px-16 py-5 md:py-6 rounded-full font-black text-xl md:text-2xl hover:bg-[#FF7222] transition-all duration-500 hover:scale-105 shadow-2xl flex items-center justify-center gap-4 active:scale-95 group">
              Get Started <span className="group-hover:translate-x-2 transition-transform">→</span>
            </button>
            
            <div onClick={nextMetric} className="cursor-pointer group relative flex flex-col items-center lg:items-start">
               <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Explore Feature</p>
               <div className="flex items-center gap-3">
                 <span className="text-black font-bold group-hover:text-[#FF7222] transition-colors">Tap to switch</span>
                 <span className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center tap-pulse text-orange-600 group-hover:bg-[#FF7222] group-hover:text-white transition-all">
                   ↻
                 </span>
               </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Floating Watch (Scale down on mobile) */}
        <div className="w-full lg:col-span-3 relative h-[300px] lg:h-full flex flex-col justify-center items-center lg:items-end order-3 lg:order-3 mt-10 lg:mt-0">
          <div className="relative scale-[1] md:scale-[1.2] lg:scale-[1.4] lg:translate-x-16">
            <div className="absolute inset-0 bg-orange-400/20 blur-[80px] md:blur-[120px] rounded-full animate-pulse"></div>
            <img 
              src={assets.watch1} 
              alt="Watch" 
              className="relative z-10 w-48 md:w-64 lg:w-full animate-watch-float drop-shadow-[-30px_40px_30px_rgba(0,0,0,0.2)]" 
            />
            
            {/* Interactive Badge */}
            <div key={currentIndex} className="absolute -top-10 -left-10 md:-top-12 md:-left-12 z-20 bg-white/90 backdrop-blur-2xl p-4 md:p-6 rounded-[2rem] md:rounded-[2.5rem] shadow-xl min-w-[180px] md:min-w-[220px] border border-white animate-badge">
               <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
                  <span className="text-xl md:text-2xl">{fitnessData[currentIndex].icon}</span>
                  <p className="text-[9px] md:text-[11px] font-black text-gray-400 uppercase tracking-tighter">{fitnessData[currentIndex].label}</p>
               </div>
               <p className={`text-2xl md:text-4xl font-[1000] italic leading-none ${fitnessData[currentIndex].color}`}>
                 {fitnessData[currentIndex].value}
               </p>
               <div className="mt-3 md:mt-4 w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-black transition-all duration-1000" style={{ width: '75%' }}></div>
               </div>
            </div>
          </div>
        </div>
      </main>
 <br />
   {/* FOOTER: Cinematic Dual-Direction Marquees */}
      <div className="absolute bottom-0 w-full bg-black py-6 md:py-10 z-[60] overflow-hidden flex flex-col gap-3 md:gap-5 shadow-[0_-20px_50px_rgba(0,0,0,0.3)]">
        
        {/* Row 1: Forward Smooth Scroll */}
        <div className="flex whitespace-nowrap animate-scroll">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-12 md:gap-20 px-6 md:px-10">
              {sports.map((sport) => (
                <div key={sport} className="flex items-center gap-12 md:gap-20 group">
                  <span className="text-white/30 text-2xl md:text-5xl font-black uppercase italic tracking-tighter transition-all duration-500 hover:text-[#FF7222] cursor-default">
                    {sport}
                  </span>
                  {/* Glowing Orange Dot */}
                  <div className="w-2 h-2 md:w-3 md:h-3 bg-[#FF7222] rounded-full shadow-[0_0_15px_#FF7222]"></div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Row 2: Reverse Smooth Scroll (The "Opposite" Logic) */}
        <div className="flex whitespace-nowrap animate-scroll-reverse opacity-40">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-12 md:gap-20 px-6 md:px-10">
              {[...sports].reverse().map((sport) => (
                <div key={sport} className="flex items-center gap-12 md:gap-20 group">
                  <span className="text-white/20 text-xl md:text-4xl font-black uppercase italic tracking-tighter transition-all duration-500 hover:text-white cursor-default">
                    {sport}
                  </span>
                  <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-gray-600 rounded-full"></div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PulseHeartHero;