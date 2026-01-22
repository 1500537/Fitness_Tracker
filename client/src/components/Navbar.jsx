import React, { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Link as ScrollLink } from 'react-scroll';
import { motion, AnimatePresence } from 'framer-motion';
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import CustomPopUp from './adminDashboard/CustomPopUp';
import { useAppContext } from '../context/useAppContext';
import { Clock, Crown, Zap, Calendar } from 'lucide-react';

const Navbar = () => {
  const [hoveredItem, setHoveredItem] = useState(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [timerData, setTimerData] = useState({ timeLeft: 0, status: 'expired', planName: 'starter', billingCycle: 'monthly' });
  const { user, isLoaded } = useUser();
  const { user: appUser, fetchUser, showPremiumModal, setShowPremiumModal } = useAppContext();
  const navigate = useNavigate();
  
  // Fetch timer data from API
  const fetchTimerData = async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/me/timer`, {
        headers: {
          'Authorization': `Bearer ${await window.Clerk.session.getToken()}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setTimerData(data.timer);
      }
    } catch (error) {
      // Error fetching timer
    }
  };
  
  // Fetch timer data when user loads and every 5 seconds
  useEffect(() => {
    if (user) {
      fetchTimerData();
      const interval = setInterval(fetchTimerData, 5000); // Update every 5 seconds
      return () => clearInterval(interval);
    }
  }, [user]);
  
  // Fetch user data when Clerk user is loaded
  useEffect(() => {
    // Fetch app user when Clerk user is loaded or changes.
    // If appUser exists but belongs to a different Clerk id, refetch.
    if (isLoaded && user) {
      const needsFetch = !appUser || (appUser?.clerkId && appUser.clerkId !== user.id);
      if (needsFetch) {
        fetchUser();
      }
    }
  }, [isLoaded, user, appUser, fetchUser]);
  
  // Force re-render when appUser changes
  useEffect(() => {
    if (appUser) {
      // Force component re-render by updating state
      setHoveredItem(null);
    }
  }, [appUser, appUser?.role]); // Added appUser.role as dependency
  
  // Navigation items logic - Show appropriate dashboard link based on user role
  const publicItems = ['Home', 'About', 'Pricing', 'Contact'];
  const getDashboardItem = () => {
    if (!user || !appUser) return null;

    const role = (appUser.role || '').toString().toLowerCase();
    if (role === 'user') {
      return 'Tracker';
    }
    if (role === 'admin' || role === 'owner') {
      return 'Admin';
    }

    // Unknown role — don't show dashboard link
    return null;
  };
  const dashboardItem = getDashboardItem();
  const currentNavItems = dashboardItem ? [...publicItems, dashboardItem] : publicItems;

  const scrollToPricing = () => {
    setShowSubscriptionModal(false);
    const pricingElement = document.getElementById('pricing');
    if (pricingElement) {
      pricingElement.scrollIntoView({ behavior: 'smooth' });
    } else {
      // If not on home page, navigate to pricing page
      window.location.href = '/#pricing';
    }
  };

  const formatTime = (seconds, status) => {
    if (status === 'unlimited') return { text: 'Unlimited', color: 'text-green-400' };
    if (status === 'expired' || !seconds || seconds <= 0) return { text: 'Expired', color: 'text-red-400' };
    
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    
    let text = '';
    let color = 'text-green-400';
    
    if (days > 7) {
      text = `${days}d ${hours}h`;
      color = 'text-green-400';
    } else if (days > 0) {
      text = `${days}d ${hours}h`;
      color = 'text-yellow-400';
    } else if (hours > 0) {
      text = `${hours}h ${minutes}m`;
      color = 'text-orange-400';
    } else {
      text = `${minutes}m`;
      color = 'text-red-400';
    }
    
    return { text, color };
  };
  
  const getPlanIcon = () => {
    const plan = timerData.planName || 'starter';
    if (plan === 'elite') return { icon: Crown, color: 'from-purple-500 to-purple-600' };
    if (plan === 'pro') return { icon: Zap, color: 'from-blue-500 to-blue-600' };
    return { icon: Clock, color: 'from-gray-500 to-gray-600' };
  };

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
              {(item === 'Tracker' || item === 'Admin') ? (
                // Dashboard routes: use programmatic navigation so we can pass pricing and show premium popup
                <button
                  onClick={() => {
                    const path = item === 'Admin' ? '/admin' : '/dashboard';
                    // Only show premium popup for regular users, not admins
                    if (item === 'Tracker' && appUser?.role === 'user') {
                      try {
                        const pricing = (appUser?.pricing || '').toString().toLowerCase();
                        if (pricing === 'pro' || pricing === 'elite') {
                          setShowPremiumModal(true);
                        }
                        // If user clicked Tracker and is elite, set a flag so App shows an elite modal once on /dashboard
                        if (pricing === 'elite') {
                          try {
                            const flagKey = `eliteModalNext_${appUser?.clerkId || 'anon'}`;
                            localStorage.setItem(flagKey, 'true');
                          } catch (e) {
                            console.warn('Unable to set elite modal flag', e);
                          }
                        }
                      } catch (err) {
                        console.warn('Pricing check failed', err);
                      }
                    }
                    navigate(path, { state: { pricing: appUser?.pricing } });
                  }}
                  className={`px-10 py-3 text-[13px] font-black uppercase tracking-[0.2em] italic transition-all duration-500 block ${hoveredItem === item ? 'text-white' : 'text-black/70'}`}
                >
                  {item}
                </button>
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
                className="flex items-center gap-3"
              >
                {/* Professional Plan Status with Real-time Timer - Only for regular users */}
                {appUser?.role === 'user' && (
                  <motion.button
                    onClick={() => setShowSubscriptionModal(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative group"
                  >
                    <div className={`flex items-center gap-2 bg-gradient-to-r ${getPlanIcon().color} p-2 pr-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300`}>
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        {(() => {
                          const { icon: PlanIcon } = getPlanIcon();
                          return <PlanIcon size={16} className="text-white" />;
                        })()}
                      </div>
                      <div className="hidden sm:flex flex-col items-start leading-none">
                        <span className="text-[8px] font-black uppercase tracking-wider text-white/80">
                          {timerData.billingCycle}
                        </span>
                        <span className={`text-[10px] font-mono font-bold ${formatTime(timerData.timeLeft, timerData.status).color}`}>
                          {formatTime(timerData.timeLeft, timerData.status).text}
                        </span>
                      </div>
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    </div>
                  </motion.button>
                )}

                {/* User Profile */}
                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xl p-1.5 pr-4 rounded-full border border-white/20 shadow-xl hover:border-[#FF7222]/50 transition-all duration-500">
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
                      {user?.firstName} • {appUser?.pricing || 'starter'}
                    </span>
                  </div>
                </div>
              </motion.div>
            </SignedIn>
          </>
        )}
      </div>

      {/* MOBILE NAV (Synced with Auth) */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] bg-black/80 backdrop-blur-3xl border border-white/10 h-16 rounded-[2rem] flex items-center justify-around px-6 z-[200] shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        {currentNavItems.map((item, index) => (
           (item === 'Tracker' || item === 'Admin') ? 
           <RouterLink key={`${item}-${index}`} to={item === 'Admin' ? '/admin' : '/dashboard'} className="text-[10px] font-black uppercase text-white/40 hover:text-[#FF7222] italic tracking-widest transition-colors">{item}</RouterLink> :
           <ScrollLink key={`${item}-${index}`} to={item.toLowerCase()} smooth={true} className="text-[10px] font-black uppercase text-white/40 hover:text-[#FF7222] italic tracking-widest transition-colors cursor-pointer">{item}</ScrollLink>
        ))}
      </div>

      {/* Plan Modal */}
      <AnimatePresence>
        {/* Use CustomPopUp for premium UI so we don't create new files */}
        <CustomPopUp
          isOpen={showPremiumModal}
          onClose={() => setShowPremiumModal(false)}
          title={appUser?.pricing ? `${appUser.pricing.toString().toUpperCase()} Access` : 'Premium Access'}
          type="premium"
          pricing={appUser?.pricing}
          onConfirm={() => setShowPremiumModal(false)}
        />
        {showSubscriptionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[300] flex items-center justify-center p-4"
            onClick={() => setShowSubscriptionModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-[#111] to-[#000] rounded-3xl p-8 max-w-md w-full border border-white/10 shadow-2xl"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-[#FF7222] to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Crown size={32} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Current Plan</h3>
                <p className="text-gray-400 text-sm">Your fitness plan status</p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm font-medium">Plan</span>
                    <Zap size={16} className="text-[#FF7222]" />
                  </div>
                  <p className="text-white font-bold text-lg capitalize">
                    {appUser?.pricing || 'Starter'} Plan
                  </p>
                </div>

                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm font-medium">Billing</span>
                    <Calendar size={16} className="text-[#FF7222]" />
                  </div>
                  <p className="text-white font-bold text-lg capitalize">
                    {appUser?.subscription?.billingCycle || 'Monthly'}
                  </p>
                </div>

                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-sm font-medium">Time Remaining</span>
                    <Clock size={16} className="text-[#FF7222]" />
                  </div>
                  <p className={`font-bold text-2xl font-mono ${formatTime(timerData.timeLeft, timerData.status).color}`}>
                    {formatTime(timerData.timeLeft, timerData.status).text}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowSubscriptionModal(false)}
                  className="flex-1 py-3 px-4 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={scrollToPricing}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-[#FF7222] to-orange-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                >
                  View Plans
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;