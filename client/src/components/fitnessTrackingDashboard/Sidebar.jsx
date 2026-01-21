import React from 'react';
import { motion } from 'framer-motion';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Dumbbell, 
  Apple, 
  LineChart, 
  Zap, 
  ShieldCheck,
  ChevronRight,
  Menu,
  X,
  Fingerprint,
  Cpu,
  Activity,
  Lock,
  Crown,
  Star
} from 'lucide-react';
import { useAppContext } from '../../context/useAppContext';

const Sidebar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = React.useState(false);
  const { user } = useAppContext();

  const links = [
    { name: 'Overview', path: '/dashboard', icon: LayoutDashboard, tier: 'starter' },
    { name: 'Workouts', path: '/dashboard/workouts', icon: Dumbbell, tier: 'starter' },
    { name: 'Nutrition', path: '/dashboard/nutrition', icon: Apple, tier: 'pro' },
    { name: 'Progress', path: '/dashboard/progress', icon: LineChart, tier: 'elite' }
  ];

  const tiers = { starter: 0, pro: 1, elite: 2 };
  const tierColors = { starter: '#10B981', pro: '#F59E0B', elite: '#8B5CF6' };
  const tierIcons = { starter: Zap, pro: Crown, elite: Star };

  // Real-time pricing check: convert to lowercase for case-insensitive matching
  const userPricing = (user?.pricing || 'starter').toString().toLowerCase();
  const tierLevel = tiers[userPricing] !== undefined ? tiers[userPricing] : 0;

  return (
    <>
      {/* --- MOBILE TRIGGER --- */}
      <div className="lg:hidden fixed top-6 left-6 z-[200]">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-4 bg-[#FF7222] rounded-2xl text-black shadow-[0_0_20px_#FF7222]"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* --- MAIN SIDEBAR --- */}
      <motion.aside 
        initial={{ x: -350, rotateY: 35, opacity: 0 }}
        animate={{ 
          x: isOpen ? 0 : (window.innerWidth < 1024 ? -350 : 0), 
          rotateY: window.innerWidth < 1024 ? 0 : 15, 
          opacity: 1 
        }}
        whileHover={window.innerWidth > 1024 ? { rotateY: 5, x: 10 } : {}}
        transition={{ type: 'spring', stiffness: 80, damping: 20 }}
        className={`
          fixed left-6 top-6 bottom-6 w-80 
          bg-black/60 backdrop-blur-3xl text-white 
          rounded-[3.5rem] p-10 flex flex-col z-[150] 
          shadow-[50px_0_100px_rgba(0,0,0,0.9)] 
          border border-white/10 overflow-hidden group/sidebar
          ${isOpen ? 'flex' : 'hidden lg:flex'}
        `}
      >
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-[#FF7222]/5 to-transparent h-[200%] animate-scanline" />

        {/* --- LOGO SECTION --- */}
        <div 
          onClick={() => navigate('/')}
          className="mb-20 cursor-pointer group/logo flex items-center gap-5 relative z-10"
        >
          <div className="w-14 h-14 bg-[#FF7222] rounded-2xl flex items-center justify-center rotate-12 group-hover/logo:rotate-[360deg] transition-all duration-700 shadow-[0_0_30px_#FF7222]">
            <Zap className="text-black fill-black" size={28} />
          </div>
          <div className="flex flex-col">
            <h2 className="text-3xl font-[1000] italic uppercase tracking-tighter leading-none">
              Elite<span className="text-[#FF7222]">Pulse</span>
            </h2>
            <span className="text-[8px] font-black tracking-[0.4em] text-gray-500 uppercase mt-1 italic">Neural_Network_v2</span>
          </div>
        </div>

        {/* --- NAVIGATION LINKS --- */}
        <nav className="flex-1 space-y-4 relative z-10">
          {links.map((link) => {
            // Real-time access check: always fetch latest pricing from context
            const currentPricing = (user?.pricing || 'starter').toString().toLowerCase();
            const currentTierLevel = tiers[currentPricing] !== undefined ? tiers[currentPricing] : 0;
            const hasAccess = currentTierLevel >= tiers[link.tier];
            return (
              <NavLink 
                key={link.name} 
                to={hasAccess ? link.path : '/pricing'}
                end={link.path === '/dashboard'}
                onClick={() => setIsOpen(false)}
              >
                {({ isActive }) => (
                  <div className={`
                    relative flex items-center justify-between p-5 rounded-3xl transition-all duration-500 group/item overflow-hidden
                    ${isActive && hasAccess
                      ? 'bg-gradient-to-r from-[#FF7222] to-orange-600 text-black shadow-[0_15px_30px_rgba(255,114,34,0.4)] scale-105' 
                      : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10'}
                    ${!hasAccess ? 'opacity-60' : ''}
                  `}>
                    <div className="flex items-center gap-5">
                      <div className="relative">
                        <link.icon 
                          size={22} 
                          className={`transition-transform duration-500 group-hover/item:rotate-12 ${isActive && hasAccess ? 'scale-110' : ''}`} 
                        />
                        {!hasAccess && (
                          <Lock 
                            size={12} 
                            className="absolute -top-1 -right-1 text-red-400"
                          />
                        )}
                      </div>
                      <span className="font-[1000] italic uppercase text-[10px] tracking-[0.2em]">
                        {link.name}
                      </span>
                      {!hasAccess && (
                        <span className="text-[8px] bg-red-500/20 text-red-400 px-2 py-1 rounded-full uppercase font-bold">
                          {link.tier}
                        </span>
                      )}
                    </div>
                    <ChevronRight 
                      size={14} 
                      className={`transition-all duration-300 ${isActive && hasAccess ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0'}`} 
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/item:translate-x-full transition-transform duration-1000" />
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* --- PROFESSIONAL NEURAL ID --- */}
        <motion.div 
          whileHover={{ y: -5, borderColor: 'rgba(255,114,34,0.5)' }}
          className="mt-auto bg-gradient-to-br from-white/[0.07] to-transparent backdrop-blur-md p-6 rounded-[2.5rem] border border-white/10 relative group/profile cursor-pointer shadow-2xl transition-all"
        >
          <div className="flex flex-col gap-4 relative z-10">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#FF7222]/20 rounded-lg">
                  <Fingerprint size={18} className="text-[#FF7222]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-[#FF7222] tracking-widest uppercase">Operator</span>
                  <p className="text-sm font-[1000] italic uppercase tracking-tighter">{user?.username || 'User'}</p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                 <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]" />
                 <span className="text-[7px] text-green-500 font-bold mt-1">ONLINE</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="flex items-center gap-2">
                  <Cpu size={12} className="text-gray-500" />
                  <span className="text-[8px] font-bold text-gray-400">CORE: v8.2</span>
               </div>
               <div className="flex items-center gap-2">
                  <Activity size={12} className="text-gray-500" />
                  <span className="text-[8px] font-bold text-gray-400">STB: 100%</span>
               </div>
            </div>

            <div className="flex items-center justify-between bg-black/40 py-2 px-4 rounded-xl border border-white/5">
               <div className="flex items-center gap-2">
                 <ShieldCheck size={12} className="text-[#FF7222]" />
                 <p className="text-[8px] text-gray-400 font-black uppercase tracking-[0.2em]">Tier: {userPricing}</p>
               </div>
               <div className="flex items-center gap-1">
                 {React.createElement(tierIcons[userPricing], { size: 12, style: { color: tierColors[userPricing] } })}
                 <span className="text-[8px] font-bold uppercase" style={{ color: tierColors[userPricing] }}>{userPricing}</span>
               </div>
            </div>
            
            {userPricing !== 'elite' && (
              <button 
                onClick={() => navigate('/pricing')}
                className="text-[8px] bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-2 rounded-lg font-bold uppercase tracking-wider hover:scale-105 transition-transform"
              >
                Upgrade Plan
              </button>
            )}
          </div>
          <div className="absolute inset-0 bg-gradient-to-tr from-[#FF7222]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[2.5rem]" />
        </motion.div>

        <div className="absolute bottom-[-20px] left-[-20px] opacity-[0.03] pointer-events-none select-none">
          <h1 className="text-[8rem] font-black italic uppercase leading-none">PULSE</h1>
        </div>
      </motion.aside>

      {isOpen && (
        <div onClick={() => setIsOpen(false)} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[140] lg:hidden" />
      )}

      <style jsx>{`
        @keyframes scanline {
          0% { transform: translateY(-50%); }
          100% { transform: translateY(0%); }
        }
        .animate-scanline {
          animation: scanline 8s linear infinite;
        }
      `}</style>
    </>
  );
};

export default Sidebar;