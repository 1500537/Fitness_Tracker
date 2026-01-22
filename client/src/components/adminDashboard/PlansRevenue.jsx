import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useSpring, useTransform } from 'framer-motion';
import { 
  TrendingUp, Calendar, Clock, DollarSign, Users, Activity, Zap, Layers,
  Filter, Download, Maximize2, RefreshCcw, AlertCircle, Timer, ShieldCheck, Mail, Cpu, Globe
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';
import { pricingData } from '../../assets/assets';
import { useAppContext } from '../../context/useAppContext';

const PlansRevenue = () => {
  const { 
    revenueData, 
    revenueLoading, 
    fetchRevenueData,
    generatePDFReport
  } = useAppContext();
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [filterPlan, setFilterPlan] = useState('all');
  const [filterBilling, setFilterBilling] = useState('all');
  const [chartFilter, setChartFilter] = useState('all');
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    fetchRevenueData();
  }, [fetchRevenueData]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getSubscriptionStatus = (endDate) => {
    const now = currentTime.getTime();
    const end = new Date(endDate).getTime();
    const remaining = end - now;
    
    if (remaining <= 0) return { timeStr: "EXPIRED", percent: 0, color: "text-red-500", bg: "bg-red-600/50" };
    
    const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
    const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const mins = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
    
    const progress = Math.min(100, (remaining / (30 * 24 * 60 * 60 * 1000)) * 100);
    
    return {
      timeStr: days > 0 ? `${days}d ${hours}h` : `${hours}h ${mins}m`,
      percent: progress,
      color: progress < 20 ? "text-red-400 shadow-[0_0_10px_#ef4444]" : "text-[#FF7222]",
      bg: progress < 20 ? "bg-red-500" : "bg-[#FF7222]"
    };
  };

  const resetSession = () => {
    fetchRevenueData();
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-[#050505] text-white selection:bg-[#FF7222] overflow-x-hidden relative font-sans perspective-1000">
      
      {/* Debug Info */}
      {revenueLoading && (
        <div className="fixed top-20 right-4 bg-[#FF7222] text-black px-4 py-2 rounded-lg z-50">
          Loading revenue data...
        </div>
      )}
      
      {!revenueData && !revenueLoading && (
        <div className="fixed top-20 right-4 bg-red-500 text-white px-4 py-2 rounded-lg z-50">
          No revenue data - Check connection
        </div>
      )}
      
      {/* --- 3D GLOBAL PROGRESS BAR --- */}
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-[#FF7222] z-[100] origin-left shadow-[0_0_20px_#FF7222]" style={{ scaleX }} />

      {/* --- ADVANCED CYBER BACKGROUND --- */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 opacity-[0.05]" 
          style={{ backgroundImage: `linear-gradient(#FF7222 1px, transparent 1px), linear-gradient(90deg, #FF7222 1px, transparent 1px)`, backgroundSize: '60px 60px' }} 
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute -top-[20%] -left-[10%] w-[800px] h-[800px] bg-[#FF7222]/10 blur-[150px] rounded-full" 
        />
      </div>

      <div className="relative z-10 p-4 sm:p-10 lg:pl-[340px] pt-24">
        
        {/* --- 3D STATUS BAR --- */}
        <motion.div 
          initial={{ rotateX: -20, opacity: 0 }}
          animate={{ rotateX: 0, opacity: 1 }}
          className="flex flex-wrap items-center justify-between gap-6 mb-16 bg-white/[0.03] backdrop-blur-3xl p-6 rounded-[2rem] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transform-style-3d hover:translate-y-[-5px] transition-transform duration-500"
        >
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 bg-black/40 px-5 py-3 rounded-xl border border-white/5 hover:border-[#FF7222]/50 transition-colors">
              <Calendar size={18} className="text-[#FF7222]" />
              <span className="text-[11px] font-bold uppercase tracking-widest">{currentTime.toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-3 bg-black/40 px-5 py-3 rounded-xl border border-white/5">
              <Clock size={18} className="text-[#FF7222]" />
              <span className="text-[11px] font-bold uppercase tracking-widest tabular-nums">{currentTime.toLocaleTimeString()}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <motion.button whileHover={{ scale: 1.1, rotate: 180 }} onClick={resetSession} className="p-4 bg-white/5 rounded-xl border border-white/10 text-[#FF7222]">
                <RefreshCcw size={20} />
             </motion.button>
             <motion.button 
               whileHover={{ scale: 1.05, y: -2 }} 
               whileTap={{ scale: 0.95 }} 
               onClick={() => generatePDFReport(filterPlan, filterBilling, chartFilter)}
               className="flex items-center gap-3 bg-[#FF7222] px-8 py-3 rounded-xl text-black font-black text-[10px] uppercase shadow-[0_10px_30px_-10px_#FF7222]"
             >
                <Download size={16} /> Neural Export
             </motion.button>
          </div>
        </motion.div>

        {/* --- HERO HEADER WITH PARALLAX --- */}
        <header className="mb-24 relative">
          <motion.div initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.8 }}>
            <h1 className="text-[10vw] font-[1000] italic uppercase tracking-tighter leading-[0.75] mb-6 mix-blend-difference">
              DATA<br/><span className="text-transparent border-t-2 border-[#FF7222] bg-clip-text bg-gradient-to-r from-[#FF7222] to-white">MAINFRAME</span>
            </h1>
            <div className="flex items-center gap-6">
               <motion.div animate={{ width: [0, 100] }} className="h-[2px] bg-[#FF7222]" />
               <span className="text-[10px] font-black text-gray-500 tracking-[0.8em] uppercase">Security_Protocol_Active</span>
            </div>
          </motion.div>
        </header>

        {/* --- 3D METRIC CARDS --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 mb-16">
          {[
            { label: 'Revenue Magnitude', value: revenueData?.metrics?.totalRevenue ? `$${revenueData.metrics.totalRevenue.toLocaleString()}` : '$0', grow: '+12.5%', icon: DollarSign, color: '#FF7222' },
            { label: 'Active Uplinks', value: revenueData?.metrics?.activeSubscriptions || 0, grow: '+3.2%', icon: Globe, color: '#3b82f6' },
            { label: 'Sync Stability', value: revenueData?.metrics?.conversionRate || '0.0%', grow: `${revenueData?.syncStabilityChange >= 0 ? '+' : ''}${revenueData?.syncStabilityChange || '0.0'}%`, icon: Cpu, color: '#10b981' },
            { label: 'Monthly Revenue', value: revenueData?.metrics?.powerConsumption || '$0', grow: `${revenueData?.mrrChange >= 0 ? '+' : ''}${revenueData?.mrrChange || '0.0'}%`, icon: Zap, color: '#f59e0b' },
          ].map((metric, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ rotateY: 15, rotateX: -5, translateZ: 20 }}
              transition={{ delay: i * 0.1 }}
              className="bg-gradient-to-br from-white/[0.05] to-transparent backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/10 relative overflow-hidden group cursor-pointer transform-style-3d shadow-2xl"
            >
              <div className="absolute -right-4 -top-4 opacity-[0.05] group-hover:opacity-[0.2] transition-opacity">
                <metric.icon size={120} />
              </div>
              <div className="flex justify-between items-start mb-10">
                <div className="p-4 rounded-2xl bg-black shadow-inner border border-white/5 group-hover:border-[#FF7222]/50 transition-all">
                  <metric.icon size={24} style={{ color: metric.color }} />
                </div>
                <span className={`text-[10px] font-black px-3 py-1 rounded-full ${metric.grow.includes('+') ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                  {metric.grow}
                </span>
              </div>
              <h4 className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-2">{metric.label}</h4>
              <p className="text-4xl font-[1000] italic tracking-tighter">{metric.value}</p>
              <motion.div className="absolute bottom-0 left-0 h-1 bg-[#FF7222]" initial={{ width: 0 }} whileHover={{ width: '100%' }} />
            </motion.div>
          ))}
        </div>

        {/* --- REVENUE CHART SECTION --- */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-16">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            className="xl:col-span-2 bg-black/40 backdrop-blur-3xl p-10 rounded-[3.5rem] border border-white/10 relative group"
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-bold text-[#FF7222]">Revenue Analytics</h3>
              <div className="flex gap-2">
                <button 
                  onClick={() => setChartFilter('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    chartFilter === 'all' ? 'bg-[#FF7222] text-black' : 'bg-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  All Plans
                </button>
                <button 
                  onClick={() => setChartFilter('starter')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    chartFilter === 'starter' ? 'bg-[#FF7222] text-black' : 'bg-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  Starter
                </button>
                <button 
                  onClick={() => setChartFilter('pro')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    chartFilter === 'pro' ? 'bg-[#FF7222] text-black' : 'bg-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  Pro
                </button>
                <button 
                  onClick={() => setChartFilter('elite')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    chartFilter === 'elite' ? 'bg-[#FF7222] text-black' : 'bg-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  Elite
                </button>
              </div>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%" minWidth={300} minHeight={200}>
                <AreaChart data={revenueData?.chartData?.filter(data => {
                  if (chartFilter === 'all') return true;
                  return data.planFilter === chartFilter;
                }) || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="date" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0,0,0,0.9)', 
                      border: '2px solid #FF7222', 
                      borderRadius: '15px',
                      boxShadow: '0 10px 30px rgba(255,114,34,0.3)'
                    }}
                    labelStyle={{ color: '#FF7222', fontWeight: 'bold' }}
                    formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#FF7222" 
                    fill="url(#colorRevenue)"
                    strokeWidth={3}
                    dot={{ fill: '#FF7222', strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, stroke: '#FF7222', strokeWidth: 2, fill: '#FF7222' }}
                  />
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF7222" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#FF7222" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* --- QUICK STATS --- */}
          <motion.div 
            initial={{ x: 100, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            className="bg-black/40 backdrop-blur-3xl p-8 rounded-[3rem] border border-white/10"
          >
            <h3 className="text-xl font-bold mb-6 text-[#FF7222]">Quick Stats</h3>
            <div className="space-y-6">
              {[
                { label: 'Today Revenue', value: revenueData?.quickStats?.todayRevenue?.value || '$0', change: revenueData?.quickStats?.todayRevenue?.change || '+0.0%' },
                { label: 'New Subscriptions', value: revenueData?.quickStats?.newSubscriptions?.value || '0', change: revenueData?.quickStats?.newSubscriptions?.change || '+0.0%' },
                { label: 'Churn Rate', value: revenueData?.quickStats?.churnRate?.value || '0.0%', change: revenueData?.quickStats?.churnRate?.change || '+0.0%' },
                { label: 'Avg. Revenue/User', value: revenueData?.quickStats?.avgRevenuePerUser?.value || '$0', change: revenueData?.quickStats?.avgRevenuePerUser?.change || '+0.0%' }
              ].map((stat, i) => (
                <div key={i} className="flex justify-between items-center p-4 bg-white/5 rounded-xl">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">{stat.label}</p>
                    <p className="text-lg font-bold">{stat.value}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    stat.change.startsWith('+') && !stat.label.includes('Churn') ? 'bg-green-500/20 text-green-400' : 
                    stat.change.startsWith('-') && stat.label.includes('Churn') ? 'bg-green-500/20 text-green-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {stat.change}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* --- SUBSCRIPTION PLANS TABLE --- */}
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          className="bg-black/40 backdrop-blur-3xl p-10 rounded-[3.5rem] border border-white/10 mb-16"
        >
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-bold text-[#FF7222]">Active Subscriptions</h3>
            <div className="flex gap-4">
              <select 
                value={filterPlan} 
                onChange={(e) => setFilterPlan(e.target.value)}
                className="px-4 py-2 bg-white/10 text-white rounded-lg border border-white/20 focus:border-[#FF7222] focus:outline-none"
              >
                <option value="all" className="bg-black">All Plans</option>
                <option value="starter" className="bg-black">Starter</option>
                <option value="pro" className="bg-black">Pro Performance</option>
                <option value="elite" className="bg-black">Elite Force</option>
              </select>
              <select 
                value={filterBilling} 
                onChange={(e) => setFilterBilling(e.target.value)}
                className="px-4 py-2 bg-white/10 text-white rounded-lg border border-white/20 focus:border-[#FF7222] focus:outline-none"
              >
                <option value="all" className="bg-black">All Billing</option>
                <option value="monthly" className="bg-black">Monthly</option>
                <option value="annually" className="bg-black">Annual</option>
              </select>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-4 px-6 text-xs font-bold uppercase tracking-wide text-gray-400">User</th>
                  <th className="text-left py-4 px-6 text-xs font-bold uppercase tracking-wide text-gray-400">Plan</th>
                  <th className="text-left py-4 px-6 text-xs font-bold uppercase tracking-wide text-gray-400">Billing</th>
                  <th className="text-left py-4 px-6 text-xs font-bold uppercase tracking-wide text-gray-400">Status</th>
                  <th className="text-left py-4 px-6 text-xs font-bold uppercase tracking-wide text-gray-400">Revenue</th>
                  <th className="text-left py-4 px-6 text-xs font-bold uppercase tracking-wide text-gray-400">Expires</th>
                </tr>
              </thead>
              <tbody>
                {(revenueData?.subscriptions || [])
                  .filter(sub => sub.role !== 'admin')
                  .filter(sub => filterPlan === 'all' || sub.planName?.toLowerCase().includes(filterPlan))
                  .filter(sub => filterBilling === 'all' || sub.billingCycle === filterBilling)
                  .map((sub, i) => {
                  const status = getSubscriptionStatus(sub.endDate);
                  return (
                    <motion.tr 
                      key={sub.id || i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-[#FF7222] rounded-full flex items-center justify-center text-black font-bold text-sm">
                            {sub.userName?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <p className="font-semibold">{sub.userName || 'Unknown User'}</p>
                            <p className="text-xs text-gray-400">{sub.userEmail || 'No email'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-3 py-1 bg-[#FF7222]/20 text-[#FF7222] rounded-full text-sm font-semibold">
                          {sub.planName || 'Basic'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-semibold">
                          {sub.billingCycle || 'monthly'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${status.bg}`}></div>
                          <span className={`text-sm font-semibold ${status.color}`}>
                            {status.timeStr}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-bold text-green-400">
                          ${sub.amount || '0'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-sm text-gray-400">
                          {new Date(sub.endDate).toLocaleDateString()}
                        </span>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PlansRevenue;