import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#000] pt-20 md:pt-32 pb-10 relative overflow-hidden border-t border-white/5">
      
      {/* --- BACKGROUND ACCENTS --- */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-[300px] bg-[#FF7222]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-[1600px] mx-auto px-6 md:px-16 relative z-10">
        
        {/* TOP SECTION: MASSIVE BRANDING */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 mb-16 md:mb-24 items-start">
          
          <div className="lg:col-span-6 text-center lg:text-left">
            <h2 className="text-[16vw] sm:text-[12vw] lg:text-[8vw] font-[1000] italic uppercase leading-[0.8] md:leading-[0.75] tracking-tighter text-white mb-6 md:mb-10">
              TRAKE <br className="hidden sm:block" />
              <span className="text-transparent" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.3)' }}>FORCE</span>
            </h2>
            <p className="max-w-md mx-auto lg:mx-0 text-gray-500 text-base md:text-xl font-medium leading-relaxed italic border-l-0 lg:border-l-2 border-[#FF7222] lg:pl-6">
              Engineering the next generation of elite human performance. Join the revolution.
            </p>
          </div>

          <div className="lg:col-span-6 grid grid-cols-2 md:grid-cols-3 gap-10 pt-4 md:pt-10">
            <div>
              <p className="text-[#FF7222] font-black uppercase tracking-widest text-[9px] md:text-[10px] mb-4 md:mb-6">Navigation</p>
              <ul className="space-y-3 md:space-y-4">
                {['Programs', 'Stories', 'Pricing', 'Sync'].map((link) => (
                  <li key={link}>
                    <a href={`#${link}`} className="text-white/60 hover:text-white transition-all duration-300 uppercase font-bold tracking-tighter text-sm md:text-base hover:translate-x-2 inline-block">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-[#FF7222] font-black uppercase tracking-widest text-[9px] md:text-[10px] mb-4 md:mb-6">Legal</p>
              <ul className="space-y-3 md:space-y-4">
                {['Privacy', 'Terms', 'Security'].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-white/40 hover:text-white transition-all duration-300 uppercase font-bold tracking-tighter text-sm md:text-base">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-span-2 md:col-span-1">
              <p className="text-[#FF7222] font-black uppercase tracking-widest text-[9px] md:text-[10px] mb-4 md:mb-6">HQ</p>
              <p className="text-white/60 font-bold uppercase tracking-tighter leading-snug text-sm md:text-base">
                99 Velocity Way<br />
                Cyber-Hub, NY 10001
              </p>
            </div>
          </div>
        </div>

        {/* MIDDLE SECTION: INTERACTIVE SOCIALS */}
        <div className="flex flex-col md:flex-row justify-between items-center border-y border-white/5 py-10 md:py-12 gap-8">
          <div className="flex flex-wrap justify-center gap-6 md:gap-10 lg:gap-16">
            {['Instagram', 'Twitter', 'LinkedIn', 'YouTube'].map((social) => (
              <a key={social} href="#" className="group relative overflow-hidden inline-block">
                <span className="text-xl md:text-3xl font-[1000] italic uppercase text-white/20 group-hover:text-[#FF7222] transition-all duration-500 block group-hover:-translate-y-full">
                  {social}
                </span>
                <span className="absolute top-0 left-0 text-xl md:text-3xl font-[1000] italic uppercase text-white translate-y-full group-hover:translate-y-0 transition-all duration-500">
                  {social}
                </span>
              </a>
            ))}
          </div>

          <button 
            onClick={scrollToTop}
            className="group flex flex-col items-center gap-2 md:gap-3 transition-transform hover:-translate-y-2"
            aria-label="Scroll to top"
          >
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-full border border-white/10 flex items-center justify-center group-hover:border-[#FF7222] transition-colors">
              <svg width="20" height="20" md:width="24" md:height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="group-hover:stroke-[#FF7222] transition-colors">
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
            </div>
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/30 group-hover:text-white transition-colors">Top</span>
          </button>
        </div>

        {/* BOTTOM SECTION: COPYRIGHT */}
        <div className="mt-8 md:mt-12 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <div className="text-gray-700 font-black tracking-[0.2em] md:tracking-[0.3em] text-[8px] md:text-[10px] uppercase">
            © {currentYear} TRAKE FORCE. All Rights Secured.
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]" />
            <span className="text-gray-700 font-black tracking-[0.2em] md:tracking-[0.3em] text-[8px] md:text-[10px] uppercase">Systems Operational</span>
          </div>
        </div>

      </div>

      {/* FINAL DECORATIVE ELEMENT - Hidden on very small screens to prevent overflow issues */}
      <div className="absolute -bottom-6 md:-bottom-10 left-0 w-full flex justify-center opacity-[0.02] select-none pointer-events-none overflow-hidden">
        <h3 className="text-[120px] sm:text-[180px] md:text-[250px] font-black italic uppercase tracking-tighter whitespace-nowrap">PERFORM</h3>
      </div>
      
    </footer>
  );
};

export default Footer;