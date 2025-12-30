import React, { useState } from 'react';
import { aboutData } from "../assets/assets";

const About = () => {
  const [index, setIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      setIndex((prev) => (prev + 1) % aboutData.length);
      setIsAnimating(false);
    }, 400);
  };

  const handlePrev = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      setIndex((prev) => (prev - 1 + aboutData.length) % aboutData.length);
      setIsAnimating(false);
    }, 400);
  };

  return (
    <section className="min-h-screen bg-[#0A0A0A] font-outfit relative overflow-hidden py-16 md:py-24 flex items-center justify-center">
      
      <style>
        {`
          @keyframes revealText {
            from { transform: translateY(100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          @keyframes imageZoom {
            from { transform: scale(1.2); filter: blur(5px); }
            to { transform: scale(1); filter: blur(0); }
          }
          .animate-reveal { animation: revealText 0.8s cubic-bezier(0.19, 1, 0.22, 1) forwards; }
          .animate-img { animation: imageZoom 1s ease-out forwards; }
          .glass-card { background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.05); }
        `}
      </style>

      {/* Ambient Background Lights */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[10%] left-[-5%] w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-[#FF7222]/10 blur-[100px] md:blur-[150px] rounded-full"></div>
        <div className="absolute bottom-[5%] right-[0%] w-[250px] md:w-[400px] h-[250px] md:h-[400px] bg-blue-500/5 blur-[80px] md:blur-[120px] rounded-full"></div>
      </div>

      <div className="max-w-[1400px] w-full mx-auto px-4 md:px-10 relative z-10">
        
        <div className="flex flex-col lg:flex-row rounded-[40px] md:rounded-[80px] overflow-hidden shadow-2xl border border-white/5 bg-[#111]">
          
          {/* --- LEFT: IMAGE STAGE --- */}
          <div className="w-full lg:w-[45%] bg-white p-6 md:p-16 relative overflow-hidden">
            
            {/* Control HUD (Responsive position) */}
            <div className="absolute top-6 left-6 md:top-10 md:left-10 flex gap-3 z-50">
              <button onClick={handlePrev} className="w-12 h-12 md:w-14 md:h-14 rounded-full border border-gray-200 flex items-center justify-center bg-white/80 hover:bg-black hover:text-white transition-all active:scale-90">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M15 18l-6-6 6-6"/></svg>
              </button>
              <button onClick={handleNext} className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#FF7222] text-white flex items-center justify-center hover:scale-110 shadow-lg transition-all active:scale-90">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M9 18l6-6-6-6"/></svg>
              </button>
            </div>

            {/* Image Container */}
            <div className={`h-full flex flex-col justify-center transition-all duration-500 ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
              <div className="relative aspect-[4/5] md:aspect-[3/4] rounded-[30px] md:rounded-[60px] overflow-hidden shadow-2xl border-[8px] md:border-[15px] border-gray-50">
                <img 
                  key={aboutData[index].image}
                  src={aboutData[index].image} 
                  className="w-full h-full object-cover grayscale brightness-110 animate-img"
                  alt="Vision"
                />
                
                {/* Floating Badge (Hidden on very small screens, visible from md) */}
                <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 glass-card bg-black/90 p-5 md:p-8 rounded-[25px] md:rounded-[40px] text-white max-w-[80%]">
                  <span className="text-[#FF7222] text-3xl md:text-5xl font-[1000] italic leading-none">{aboutData[index].id}.</span>
                  <p className="mt-1 md:mt-2 font-black tracking-tighter uppercase text-[10px] md:text-sm opacity-60">System Core</p>
                  <p className="text-sm md:text-xl font-black italic truncate">{aboutData[index].accent}</p>
                </div>
              </div>
            </div>
          </div>

          {/* --- RIGHT: CONTENT ENGINE --- */}
          <div className="w-full lg:w-[55%] bg-[#0A0A0A] p-8 md:p-16 lg:p-24 flex flex-col justify-center relative">
            
            {/* Watermark (Responsive sizing) */}
            <div className="absolute top-6 right-6 md:top-10 md:right-10 text-white/[0.02] text-[80px] md:text-[180px] font-black italic select-none pointer-events-none">
              {aboutData[index].id}
            </div>

            <div className={`transition-all duration-700 ${isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
              <div className="flex items-center gap-4 md:gap-6 mb-6 md:mb-10">
                <div className="h-1 w-12 md:w-20 bg-[#FF7222]"></div>
                <p className="text-[#FF7222] font-black uppercase tracking-[0.3em] md:tracking-[0.5em] text-[10px] md:text-sm">Vision & Strategy</p>
              </div>

              <div className="overflow-hidden mb-6 md:mb-10">
                <h2 className="text-4xl md:text-7xl lg:text-[100px] font-[1000] italic leading-[0.9] md:leading-[0.8] tracking-tighter text-white uppercase animate-reveal">
                  {aboutData[index].title}
                </h2>
              </div>

              <p className="text-gray-400 text-lg md:text-2xl lg:text-3xl font-medium leading-relaxed italic mb-10 md:mb-16 max-w-xl border-l-4 border-white/10 pl-6 md:pl-8">
                "{aboutData[index].desc}"
              </p>

              {/* Action & Progress */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-8 mt-4">
                <button className="w-full sm:w-auto relative px-10 md:px-12 py-5 md:py-6 bg-white text-black font-black text-lg md:text-xl rounded-full overflow-hidden group hover:text-white transition-colors duration-500">
                  <span className="relative z-10">EXPLORE ARCHIVE</span>
                  <div className="absolute inset-0 bg-[#FF7222] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500"></div>
                </button>

                {/* Progress Dots */}
                <div className="flex gap-3 md:gap-4 items-center">
                  {aboutData.map((_, i) => (
                    <div 
                      key={i}
                      onClick={() => setIndex(i)}
                      className={`cursor-pointer transition-all duration-500 rounded-full 
                        ${index === i ? 'w-12 md:w-20 h-2 md:h-3 bg-[#FF7222]' : 'w-3 h-2 md:w-4 md:h-3 bg-white/10 hover:bg-white/30'}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default About;