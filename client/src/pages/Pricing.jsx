import React, { useState, useEffect } from 'react';
import { assets, pricingData, testimonialsData } from "../assets/assets";

const TestimonialPricing = () => {
  const [activeStory, setActiveStory] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="min-h-screen bg-[#050505] font-outfit py-16 md:py-32 relative overflow-hidden selection:bg-[#FF7222] selection:text-white">
      
      {/* --- CINEMATIC BACKGROUND ENGINE --- */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#FF7222]/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] bg-blue-500/5 blur-[100px] rounded-full" />
        
        {/* Animated Grid Overlay */}
        <div className="absolute inset-0 opacity-[0.15]" 
             style={{ backgroundImage: `radial-gradient(#ffffff 0.5px, transparent 0.5px)`, backgroundSize: '30px 30px' }} />

        {/* Massive Liquid Watermark - Scaled for all devices */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center select-none opacity-[0.03]">
          <h1 className="text-[120px] sm:text-[250px] md:text-[400px] lg:text-[550px] font-[1000] italic leading-none tracking-tighter text-white">LIMITLESS</h1>
        </div>
      </div>

      <div className="max-w-[1500px] mx-auto px-6 md:px-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-20 items-stretch">
          
          {/* --- LEFT: THE CINEMATIC STORY VAULT --- */}
          <div className="lg:col-span-5 perspective-2000">
            <div className={`relative bg-gradient-to-br from-[#111] to-[#000] rounded-[40px] md:rounded-[60px] p-8 md:p-16 shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] overflow-hidden min-h-[500px] md:min-h-[850px] flex flex-col justify-between border border-white/10 transition-all duration-1000 transform ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
              
              {/* Internal Glass Accents */}
              <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-white/5 blur-3xl rounded-full" />

              <div className="relative z-30">
                <div className="flex items-center gap-4 md:gap-6 mb-8 md:mb-12">
                  <div className="group/quote relative">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-[#FF7222] rounded-xl md:rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(255,114,34,0.4)] rotate-12 transition-transform duration-500 group-hover:rotate-0">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="white" className="md:w-7 md:h-7"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" /></svg>
                    </div>
                  </div>
                  <span className="text-[#FF7222] font-black tracking-[0.4em] md:tracking-[0.6em] text-[10px] md:text-xs uppercase animate-pulse">Live Impact</span>
                </div>

                <div className="space-y-4 md:space-y-6">
                  <h3 className="text-5xl md:text-7xl lg:text-8xl font-[1000] italic uppercase leading-[0.9] md:leading-[0.8] tracking-tighter text-white">
                    Vault <br /><span className="text-transparent" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.3)' }}>Stories</span>
                  </h3>
                  
                  <div key={activeStory} className="animate-in fade-in slide-in-from-bottom-5 duration-700">
                    <p className="text-lg md:text-2xl lg:text-3xl text-gray-400 font-light italic leading-relaxed max-w-[450px] border-l-2 border-[#FF7222] pl-4 md:pl-8 py-2 md:py-4">
                      {testimonialsData[activeStory].story}
                    </p>
                    
                    <div className="mt-8 md:mt-12 flex items-center gap-4 md:gap-6">
                      <div className="h-[2px] w-8 md:w-12 bg-[#FF7222]" />
                      <div>
                        <h4 className="text-xl md:text-4xl font-[1000] italic uppercase text-white tracking-tighter">{testimonialsData[activeStory].name}</h4>
                        <p className="text-[#FF7222] font-black uppercase tracking-widest text-[10px] md:text-xs mt-1">{testimonialsData[activeStory].role}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ATHLETE: Adjusted position to prevent overlap on small mobiles */}
              <div className="absolute bottom-0 right-[-5%] w-[90%] md:w-[120%] h-[40%] md:h-[75%] z-20 pointer-events-none select-none opacity-30 md:opacity-100">
                <img 
                  src={assets.athleteImg} 
                  className="w-full h-full object-contain object-bottom filter drop-shadow-[0_0_80px_rgba(255,114,34,0.2)]" 
                  alt="Elite Performance"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#000] via-transparent to-transparent opacity-60" />
              </div>

              {/* Indicators */}
              <div className="relative z-40 flex items-center gap-2 md:gap-4 mt-8 md:mt-0">
                {testimonialsData.map((_, i) => (
                  <button 
                    key={i} 
                    onClick={() => setActiveStory(i)}
                    className={`h-[3px] transition-all duration-700 ease-out ${activeStory === i ? 'w-12 md:w-24 bg-[#FF7222] shadow-[0_0_15px_#FF7222]' : 'w-4 md:w-6 bg-white/20 hover:bg-white/40'}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* --- RIGHT: THE ARCHITECT PRICING --- */}
          <div className={`lg:col-span-7 flex flex-col justify-center lg:pl-10 xl:pl-16 transition-all duration-1000 delay-500 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="mb-12 md:mb-20 text-center lg:text-left mt-10 lg:mt-0">
              <div className="flex items-center justify-center lg:justify-start gap-4 mb-4">
                <div className="w-8 h-[2px] bg-[#FF7222]" />
                <span className="text-[#FF7222] font-black uppercase tracking-widest text-[10px] md:text-xs">Architectural Pricing</span>
              </div>
              <h2 className="text-5xl sm:text-7xl md:text-9xl lg:text-[100px] xl:text-[120px] font-[1000] italic uppercase leading-[0.9] lg:leading-[0.75] tracking-tighter text-white">
                Engineer <br className="hidden md:block" />
                <span className="text-transparent" style={{ WebkitTextStroke: '1px md:2px #FF7222' }}>Your Body</span>
              </h2>
            </div>

            <div className="space-y-4 md:space-y-8">
              {pricingData.map((plan, idx) => (
                <div 
                  key={plan.id}
                  className={`group relative flex flex-col sm:flex-row items-center justify-between p-6 md:p-12 rounded-[30px] md:rounded-[50px] transition-all duration-500 cursor-pointer overflow-hidden border
                    ${plan.popular 
                      ? 'bg-white text-black border-white shadow-xl scale-[1] lg:scale-[1.03]' 
                      : 'bg-[#111] text-white border-white/5 hover:border-[#FF7222]'}`}
                >
                  <div className="absolute inset-0 bg-[#FF7222] translate-y-[101%] group-hover:translate-y-0 transition-transform duration-700 ease-in-out" />

                  <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4 md:gap-12 text-center sm:text-left">
                    <div className="flex flex-col">
                      <span className="text-4xl md:text-6xl font-[1000] italic tracking-tighter leading-none group-hover:text-white transition-colors">
                        {plan.monthlyPrice === 0 ? 'FREE' : `$${plan.monthlyPrice}`}
                      </span>
                      {plan.monthlyPrice !== 0 && <span className="text-[10px] md:text-sm font-black opacity-40 uppercase group-hover:text-white transition-colors">Per Month</span>}
                    </div>

                    <div className="hidden sm:block h-12 md:h-16 w-[1px] bg-current opacity-10 group-hover:bg-white" />

                    <div>
                      <h4 className="text-3xl md:text-5xl font-[1000] italic uppercase tracking-tighter leading-none mb-1 md:mb-2 group-hover:text-white transition-colors">{plan.name}</h4>
                      <p className="font-black italic opacity-40 uppercase tracking-[0.2em] text-[8px] md:text-[10px] group-hover:text-white transition-colors">
                        {plan.tagline}
                      </p>
                    </div>
                  </div>

                  <div className={`relative z-10 mt-6 sm:mt-0 w-12 h-12 md:w-20 md:h-20 rounded-full flex items-center justify-center border transition-all duration-700 
                    ${plan.popular ? 'border-black/10 bg-black/5' : 'border-white/10 bg-white/5'} group-hover:border-white group-hover:rotate-45`}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="md:w-8 md:h-8 group-hover:text-white transition-colors">
                      <path d="M7 17L17 7M17 7H7M17 7V17" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* --- CINEMATIC VELOCITY MARQUEE --- */}
      <div className="mt-20 md:mt-40 bg-[#FF7222] py-8 md:py-14 rotate-[-2deg] scale-110 shadow-2xl relative z-50 overflow-hidden border-y-[2px] md:border-y-[4px] border-black">
        <div className="flex animate-marquee-slow whitespace-nowrap">
           {[...Array(10)].map((_, i) => (
             <div key={i} className="flex items-center mx-10 md:mx-20">
                <span className="text-black text-4xl md:text-8xl font-[1000] italic uppercase tracking-tighter">UNSTOPPABLE</span>
                <span className="mx-10 md:mx-20 text-white text-3xl md:text-7xl font-light opacity-50">/</span>
                <span className="text-black text-4xl md:text-8xl font-[1000] italic uppercase tracking-tighter">SUBSCRIBE NOW</span>
                <span className="mx-10 md:mx-20 text-white text-3xl md:text-7xl font-light opacity-50">/</span>
             </div>
           ))}
        </div>
      </div>

      <style>{`
        .perspective-2000 { perspective: 2000px; }
        @keyframes marquee-slow { 
          0% { transform: translateX(0); } 
          100% { transform: translateX(-50%); } 
        }
        .animate-marquee-slow { 
          display: flex; 
          animation: marquee-slow 60s linear infinite; 
          width: fit-content;
          will-change: transform;
        }
        html { scroll-behavior: smooth; }
      `}</style>
    </section>
  );
};

export default TestimonialPricing;