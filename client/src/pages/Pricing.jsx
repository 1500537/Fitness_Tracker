import React, { useState, useEffect, useRef } from 'react';
import { assets, testimonialsData } from "../assets/assets";
import { useAppContext } from '../context/useAppContext';
import ErrorBoundary from '../components/ErrorBoundary';
import { useUser } from '@clerk/clerk-react';
import { Crown, Star, Zap } from 'lucide-react';

const TestimonialPricing = () => {
  const { plans, plansLoading, fetchPlans, error, user } = useAppContext();
  const { user: clerkUser } = useUser();
  const [activeStory, setActiveStory] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const hasFetched = useRef(false);

  const userTier = user?.pricing || 'starter';
  const tierIcons = { starter: Zap, pro: Crown, elite: Star };
  const tierColors = { starter: '#10B981', pro: '#F59E0B', elite: '#8B5CF6' };

  useEffect(() => {
    setIsVisible(true);
    if (!hasFetched.current && fetchPlans) {
      fetchPlans().catch(() => {});
      hasFetched.current = true;
    }
  }, [fetchPlans]);

  const handleSubscribe = async (plan) => {
    if (!clerkUser) {
      alert('Please login to subscribe');
      return;
    }

    const isExpiredUser = user?.subscription?.isActive === false || user?.subscription?.status === 'expired';
    
    // Allow subscription if:
    // 1. User doesn't have this plan currently
    // 2. OR user has this plan but it's expired (for reactivation)
    if (plan.name.toLowerCase() === userTier && !isExpiredUser) {
      return; // Already subscribed and active
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/stripe/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await window.Clerk.session.getToken()}`
        },
        body: JSON.stringify({
          planId: plan._id,
          planName: plan.name,
          price: billingCycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice,
          billingCycle
        })
      });

      const data = await response.json();
      
      if (data.success) {
        if (data.url) {
          window.location.href = data.url;
        } else if (data.shouldRefresh) {
          window.location.reload();
        }
      } else {
        alert('Payment setup failed. Please try again.');
      }
    } catch (error) {
      alert('Payment failed. Please try again.');
    }
  };

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
            <div className="mb-8 md:mb-12 text-center lg:text-left mt-10 lg:mt-0">
              <div className="flex items-center justify-center lg:justify-start gap-4 mb-4">
                <div className="w-8 h-[2px] bg-[#FF7222]" />
                <span className="text-[#FF7222] font-black uppercase tracking-widest text-[10px] md:text-xs">Architectural Pricing</span>
              </div>
              <h2 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-[1000] italic uppercase leading-[0.9] lg:leading-[0.75] tracking-tighter text-white">
                Engineer <br className="hidden md:block" />
                <span className="text-transparent" style={{ WebkitTextStroke: '1px md:2px #FF7222' }}>Your Body</span>
              </h2>
              
              {/* Billing Toggle */}
              <div className="flex justify-center lg:justify-start mt-6">
                <div className="bg-white/5 p-1 rounded-2xl border border-white/10 flex items-center backdrop-blur-md">
                  <button 
                    onClick={() => setBillingCycle('monthly')}
                    className={`px-4 md:px-6 py-2 rounded-xl text-xs font-black uppercase transition-all ${
                      billingCycle === 'monthly' 
                        ? 'bg-[#FF7222] text-black' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Monthly
                  </button>
                  <button 
                    onClick={() => setBillingCycle('annual')}
                    className={`px-4 md:px-6 py-2 rounded-xl text-xs font-black uppercase transition-all ${
                      billingCycle === 'annual' 
                        ? 'bg-[#FF7222] text-black' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Annual <span className="ml-1 opacity-60 text-[8px]">-20%</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-3 md:space-y-6">
              {plansLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-[#FF7222]/30 border-t-[#FF7222] rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">Loading Plans...</p>
                  </div>
                </div>
              ) : error ? (
                <div className="text-center py-20">
                  <p className="text-red-400 text-sm font-bold uppercase tracking-widest">{error}</p>
                </div>
              ) : plans && plans.length > 0 ? (
                plans.map((plan, idx) => {
                  const currentPrice = billingCycle === 'monthly' ? plan.monthlyPrice : plan.annualPrice;
                  const monthlyPrice = plan.monthlyPrice;
                  const annualPrice = plan.annualPrice;
                  const savings = billingCycle === 'annual' && monthlyPrice > 0 
                    ? Math.round((monthlyPrice * 12 - annualPrice * 12) * 100) / 100
                    : 0;
                  
                  const isExpiredUser = user?.subscription?.isActive === false || user?.subscription?.status === 'expired';
                  
                  return (
                    <div 
                      key={plan._id}
                      className={`group relative flex flex-col sm:flex-row items-center justify-between p-4 md:p-8 lg:p-12 rounded-[20px] md:rounded-[30px] lg:rounded-[50px] transition-all duration-500 cursor-pointer overflow-hidden border
                        ${plan.name.toLowerCase() === userTier && !isExpiredUser
                          ? 'bg-gradient-to-r from-green-500 to-green-600 text-white border-green-400 scale-[1.02]' 
                          : plan.popular 
                          ? 'bg-white text-black border-white shadow-xl scale-[1] lg:scale-[1.03]' 
                          : 'bg-[#111] text-white border-white/5 hover:border-[#FF7222]'}
                        ${isExpiredUser ? 'animate-pulse hover:animate-none hover:shadow-[0_0_30px_#FF7222] hover:scale-105' : ''}`}
                    >
                      <div className="absolute inset-0 bg-[#FF7222] translate-y-[101%] group-hover:translate-y-0 transition-transform duration-700 ease-in-out" />

                      <div className="relative z-10 flex flex-col sm:flex-row items-center gap-3 md:gap-8 lg:gap-12 text-center sm:text-left w-full">
                        <div className="flex flex-col items-center sm:items-start">
                          <span className="text-2xl md:text-4xl lg:text-6xl font-[1000] italic tracking-tighter leading-none group-hover:text-white transition-colors">
                            {currentPrice === 0 ? 'FREE' : `$${currentPrice}`}
                          </span>
                          <div className="flex flex-col items-center sm:items-start">
                            {currentPrice !== 0 && (
                              <span className="text-[8px] md:text-[10px] lg:text-sm font-black opacity-40 uppercase group-hover:text-white transition-colors">
                                Per {billingCycle === 'monthly' ? 'Month' : 'Month (Billed Annually)'}
                              </span>
                            )}
                            {savings > 0 && (
                              <span className="text-[6px] md:text-[8px] lg:text-[10px] font-black text-[#FF7222] mt-1 uppercase tracking-widest bg-[#FF7222]/10 px-2 py-1 rounded group-hover:text-white group-hover:bg-white/20">
                                Save ${savings}/year
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="hidden sm:block h-8 md:h-12 lg:h-16 w-[1px] bg-current opacity-10 group-hover:bg-white" />

                        <div className="flex-1">
                          <h4 className="text-xl md:text-3xl lg:text-5xl font-[1000] italic uppercase tracking-tighter leading-none mb-1 md:mb-2 group-hover:text-white transition-colors">
                            {plan.name}
                          </h4>
                          <p className="font-black italic opacity-40 uppercase tracking-[0.2em] text-[6px] md:text-[8px] lg:text-[10px] group-hover:text-white transition-colors">
                            {plan.tagline}
                          </p>
                        </div>

                        <button
                          onClick={() => handleSubscribe(plan)}
                          className={`relative z-10 mt-4 sm:mt-0 w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 rounded-full font-black uppercase text-[10px] md:text-xs tracking-widest transition-all duration-300 cursor-pointer
                            ${plan.name.toLowerCase() === userTier && isExpiredUser
                              ? 'bg-[#FF7222] text-black hover:bg-[#e6651f]' 
                              : plan.name.toLowerCase() === userTier && !isExpiredUser
                              ? 'bg-white text-green-600 border border-white cursor-not-allowed' 
                              : plan.popular 
                              ? 'bg-black text-white hover:bg-gray-800 border border-black group-hover:bg-white group-hover:text-black group-hover:border-white' 
                              : 'bg-[#FF7222] text-black hover:bg-[#e6651f] group-hover:bg-white group-hover:text-black'}`}
                        >
                          {plan.name.toLowerCase() === userTier && isExpiredUser ? 'Reactivate' : 
                           plan.name.toLowerCase() === userTier && !isExpiredUser ? 'Current Plan' : 'Subscribe'}
                        </button>
                      </div>

                      {plan.popular && (
                        <div className="absolute -top-3 -right-1 sm:-top-2 sm:right-4">
                          <div className="relative">
                            <div className="bg-gradient-to-r from-[#FF7222] to-[#e6651f] text-white text-[8px] sm:text-[10px] md:text-xs font-[1000] uppercase px-3 sm:px-4 md:px-6 py-1.5 md:py-2 rounded-b-xl sm:rounded-b-2xl italic tracking-[0.15em] sm:tracking-[0.2em] shadow-xl border-2 border-white/20">
                              <div className="flex items-center gap-1">
                                <svg className="w-2 h-2 sm:w-3 sm:h-3 fill-current" viewBox="0 0 24 24">
                                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                </svg>
                                <span>POPULAR</span>
                              </div>
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-r from-[#FF7222] to-[#e6651f] rounded-b-xl sm:rounded-b-2xl blur-sm opacity-50 -z-10"></div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-20">
                  <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">No plans available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- CINEMATIC VELOCITY MARQUEE --- */}
      <div className="mt-20 md:mt-40 bg-[#FF7222] py-8 md:py-14 rotate-[-2deg] scale-110 shadow-2xl relative z-50 overflow-hidden border-y-[2px] md:border-y-[4px] border-black">
        <div className="flex animate-marquee-slow whitespace-nowrap">
           {[...Array(10)].map((_, i) => (
             <div key={`marquee-${i}`} className="flex items-center mx-10 md:mx-20">
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

const PricingWithErrorBoundary = () => (
  <ErrorBoundary>
    <TestimonialPricing />
  </ErrorBoundary>
);

export default PricingWithErrorBoundary;