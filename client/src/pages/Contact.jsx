import React, { useState, useEffect } from 'react';
import { contactData } from "../assets/assets";

const Contact = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <section className="min-h-screen bg-[#000] font-outfit py-16 md:py-24 lg:py-32 relative overflow-hidden selection:bg-[#FF7222] selection:text-white">
      
      {/* --- BACKGROUND ARCHITECTURE --- */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,114,34,0.08)_0%,transparent_70%)]" />
        <div className="absolute inset-0 opacity-10" 
             style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`, backgroundSize: 'clamp(50px, 10vw, 100px) clamp(50px, 10vw, 100px)' }} />
      </div>

      <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-16 relative z-10">
        
        {/* --- DYNAMIC SPLIT HEADER --- */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 mb-16 md:mb-24 lg:mb-32">
          <div className="max-w-4xl w-full">
            <div className={`overflow-hidden transition-all duration-[1500ms] ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
              <h2 className="text-[18vw] sm:text-[15vw] lg:text-[10vw] font-[1000] italic uppercase leading-[0.8] tracking-tighter text-white">
                LET'S <span className="text-transparent" style={{ WebkitTextStroke: '1px #FF7222' }}>SYNC</span>
              </h2>
            </div>
            <div className={`mt-6 flex items-center gap-4 transition-all duration-[2000ms] delay-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
               <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-[#FF7222] flex items-center justify-center animate-bounce">
                  <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#FF7222] rounded-full" />
               </div>
               <p className="text-[#FF7222] font-black uppercase tracking-[0.3em] md:tracking-[0.5em] text-[10px] md:text-xs">Awaiting Signal</p>
            </div>
          </div>
          
          {/* ARCHITECTURAL STATEMENT - Shown on md+ for better layout */}
          <div className="max-w-md text-left lg:text-right hidden sm:block group">
            <div className="flex lg:justify-end mb-6">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-[#FF7222] rounded-full animate-ping"></div>
                <div className="w-8 h-[2px] bg-[#FF7222]/30 mt-[3px]"></div>
              </div>
            </div>
            <p className="text-lg md:text-2xl font-light leading-snug text-white/50 italic tracking-tight transition-all duration-700 group-hover:text-white">
              Pushing the <span className="text-white font-black not-italic border-b border-[#FF7222]">boundaries</span> of 
              <span className="block text-[#FF7222] font-[1000] uppercase tracking-[0.2em] text-sm mt-2">
                Human Performance
              </span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          
          {/* --- LEFT: INFO MODULES --- */}
          <div className="lg:col-span-4 space-y-4 order-2 lg:order-1">
            {[
              { label: 'Neural Mail', value: contactData.email },
              { label: 'Voice Link', value: contactData.phone },
              { label: 'Main Grid', value: contactData.address }
            ].map((info, i) => (
              <div key={i} className="group relative bg-[#0A0A0A] border border-white/5 p-6 md:p-10 rounded-2xl md:rounded-3xl transition-all duration-500 hover:bg-[#111] hover:border-[#FF7222]/30 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF7222]/5 blur-3xl rounded-full group-hover:bg-[#FF7222]/10" />
                <p className="text-[#FF7222] font-black uppercase tracking-widest text-[9px] md:text-[10px] mb-3 md:mb-4">{info.label}</p>
                <h4 className="text-lg md:text-2xl font-bold text-white break-words leading-tight uppercase tracking-tighter">{info.value}</h4>
                <div className="mt-6 flex items-center gap-2 text-white/20 group-hover:text-white transition-colors">
                  <span className="text-[9px] font-black uppercase tracking-widest">Access Data</span>
                  <div className="w-4 h-[1px] bg-current" />
                </div>
              </div>
            ))}

            {/* Premium Social Dock */}
            <div className="flex flex-wrap gap-6 md:gap-8 pt-6 md:pt-8 justify-center lg:justify-start">
               {contactData.socials.map((social, i) => (
                 <a key={i} href={social.link} className="text-white/30 font-black italic uppercase text-lg md:text-xl hover:text-[#FF7222] transition-all hover:-translate-y-1">
                    {social.name}
                 </a>
               ))}
            </div>
          </div>

          {/* --- RIGHT: THE COMMAND CENTER FORM --- */}
          <div className="lg:col-span-8 order-1 lg:order-2">
            <div className="bg-gradient-to-br from-[#0A0A0A] to-black border border-white/10 rounded-[30px] md:rounded-[60px] p-8 md:p-16 lg:p-20 shadow-2xl relative overflow-hidden">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 mb-12 md:mb-16">
                <div className="relative group">
                  <input type="text" required placeholder=" " className="peer w-full bg-transparent border-b-2 border-white/10 py-4 md:py-6 text-xl md:text-2xl font-bold text-white focus:outline-none focus:border-[#FF7222] transition-all uppercase" />
                  <span className="absolute left-0 top-4 md:top-6 text-gray-600 transition-all peer-focus:-top-4 peer-focus:text-[#FF7222] peer-focus:text-[10px] font-black uppercase tracking-widest pointer-events-none peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-[10px]">Identity / Name</span>
                </div>
                
                <div className="relative group">
                  <input type="email" required placeholder=" " className="peer w-full bg-transparent border-b-2 border-white/10 py-4 md:py-6 text-xl md:text-2xl font-bold text-white focus:outline-none focus:border-[#FF7222] transition-all uppercase" />
                  <span className="absolute left-0 top-4 md:top-6 text-gray-600 transition-all peer-focus:-top-4 peer-focus:text-[#FF7222] peer-focus:text-[10px] font-black uppercase tracking-widest pointer-events-none peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-[10px]">Access / Email</span>
                </div>
              </div>

              <div className="relative mb-12 md:mb-16">
                <textarea rows="3" required placeholder=" " className="peer w-full bg-transparent border-b-2 border-white/10 py-4 md:py-6 text-xl md:text-2xl font-bold text-white focus:outline-none focus:border-[#FF7222] transition-all uppercase resize-none" />
                <span className="absolute left-0 top-4 md:top-6 text-gray-600 transition-all peer-focus:-top-4 peer-focus:text-[#FF7222] peer-focus:text-[10px] font-black uppercase tracking-widest pointer-events-none peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-[10px]">Objective / Message</span>
              </div>

              {/* ULTRA DEPLOY BUTTON */}
              <button className="group relative inline-flex items-center justify-center px-10 md:px-16 py-6 md:py-8 bg-[#FF7222] rounded-full overflow-hidden transition-all duration-700 hover:shadow-[0_0_60px_rgba(255,114,34,0.4)] w-full sm:w-auto">
                <div className="absolute inset-0 bg-white translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-700 ease-[cubic-bezier(0.19,1,0.22,1)]" />
                <span className="relative z-10 text-white group-hover:text-black font-[1000] italic text-xl md:text-2xl uppercase tracking-tighter flex items-center justify-center gap-4">
                  Deploy Signal
                  <svg className="w-6 h-6 md:w-8 md:h-8 transition-transform duration-500 group-hover:rotate-45" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24"><path d="M7 17L17 7M17 7H7M17 7V17" /></svg>
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- KINETIC RIBBON MARQUEE --- */}
      <div className="mt-24 md:mt-40 relative h-24 md:h-48 flex items-center bg-[#FF7222] -rotate-1 scale-[1.05] shadow-2xl">
        <div className="flex animate-marquee-vanguard whitespace-nowrap">
           {[...Array(6)].map((_, i) => (
             <div key={i} className="flex items-center">
                <span className="text-black text-4xl md:text-9xl font-[1000] italic uppercase tracking-tight px-6 md:px-12">PULSE FORCE</span>
                <div className="w-3 h-3 md:w-8 md:h-8 bg-black rounded-full" />
                <span className="text-white text-4xl md:text-9xl font-[1000] italic uppercase tracking-tight px-6 md:px-12">LIMITLESS</span>
                <div className="w-3 h-3 md:w-8 md:h-8 bg-white border-2 md:border-4 border-black rounded-full" />
             </div>
           ))}
        </div>
      </div>

      <style>{`
        @keyframes marquee-vanguard {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee-vanguard {
          display: flex;
          animation: marquee-vanguard 30s linear infinite;
          width: fit-content;
        }
        @media (max-width: 768px) {
          .animate-marquee-vanguard { animation-duration: 15s; }
        }
        /* Input fix for floating labels without state */
        .peer:placeholder-shown ~ span {
          top: 1.5rem;
          font-size: 1.25rem;
        }
        @media (max-width: 768px) {
          .peer:placeholder-shown ~ span {
            top: 1rem;
            font-size: 1.1rem;
          }
        }
        input:-webkit-autofill {
          -webkit-text-fill-color: white !important;
          -webkit-box-shadow: 0 0 0px 1000px #0A0A0A inset !important;
        }
      `}</style>
    </section>
  );
};

export default Contact;