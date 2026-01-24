import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from 'recharts';
import { Lock, Crown, Zap, Star, ChevronDown, ChevronUp, Shield, X } from 'lucide-react';
import { useAppContext } from '../../context/useAppContext';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';

// Network connectivity hook
const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return isOnline;
};

// --- ELITE ACCESS MODAL ---
const EliteAccessModal = ({ isOpen, onClose, onConfirm, userPricing }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-xl"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, rotateY: -15 }}
          animate={{ scale: 1, opacity: 1, rotateY: 0 }}
          exit={{ scale: 0.8, opacity: 0, rotateY: 15 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative bg-gradient-to-br from-[#1a1a1a] via-[#0f0f0f] to-black border-2 border-[#8B5CF6]/30 rounded-[3rem] p-8 max-w-lg mx-4 shadow-[0_40px_120px_rgba(139,92,246,0.3)]"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-300 group"
          >
            <X size={20} className="text-white/70 group-hover:text-white" />
          </button>

          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", damping: 20 }}
              className="w-20 h-20 bg-gradient-to-br from-[#8B5CF6] to-[#6366F1] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-[0_20px_40px_rgba(139,92,246,0.4)]"
            >
              <Shield size={40} className="text-white" />
            </motion.div>
            
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-4xl font-black text-white mb-2"
            >
              <span className="bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] bg-clip-text text-transparent">ELITE</span> ACCESS
            </motion.h2>
            
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-sm font-bold text-[#8B5CF6] uppercase tracking-[0.3em]"
            >
              ELITE MEMBER
            </motion.p>
          </div>

          {/* Welcome Message */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mb-8"
          >
            <h3 className="text-2xl font-bold text-white mb-4">Welcome, Elite Member!</h3>
            <p className="text-gray-300 leading-relaxed mb-6">
              All features are now available — advanced analytics, exports, unlimited plans, priority sync and more.
            </p>
            
            {/* Features List */}
            <div className="space-y-3">
              {[
                'Custom Workout Plans',
                'Real-time Sync & Priority Analytics',
                'Exportable Progress Reports'
              ].map((feature, index) => (
                <motion.div
                  key={feature}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse" />
                  <span className="text-gray-300 font-medium">{feature}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="flex gap-4"
          >
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl transition-all duration-300 border border-white/20"
            >
              DISCARD
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] hover:from-[#7C3AED] hover:to-[#5B21B6] text-white font-bold rounded-2xl transition-all duration-300 shadow-[0_10px_30px_rgba(139,92,246,0.4)] flex items-center justify-center gap-2"
            >
              <Shield size={16} />
              CONFIRM
            </button>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// --- 1. ENTERPRISE 3D SPATIAL ENGINE ---
const SpatialCard = ({ children, className, intensity = 12 }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const mouseXSpring = useSpring(x, { stiffness: 200, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 200, damping: 30 });
  
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [`${intensity}deg`, `-${intensity}deg`]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [`-${intensity}deg`, `${intensity}deg`]);

  const handleMouseMove = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set(mouseX / width - 0.5);
    y.set(mouseY / height - 0.5);
  }, [x, y]);

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      // added min-w-0 to prevent flex/grid overflow issues with recharts
      className={`relative group transition-shadow duration-700 ease-out min-w-0 ${className}`}
    >
      <div style={{ transform: "translateZ(60px)" }} className="h-full w-full relative z-10">
        {children}
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-[#FF7222]/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 rounded-[inherit] transition-opacity duration-700 pointer-events-none" />
      <div className="absolute -inset-[1px] bg-gradient-to-r from-[#FF7222]/20 to-transparent rounded-[inherit] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
    </motion.div>
  );
};

// --- 2. PRECISION ANALYTICS CHART ---
const ProgressChart = ({ data = [] }) => {
  const chartData = useMemo(() => data, [data]);
  
  // State for active series
  const [activeSeries, setActiveSeries] = useState('both'); // 'weight', 'bench', or 'both'

  // Custom Tooltip Component with Enhanced Design
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const weightData = payload.find(p => p.dataKey === 'weight');
      const benchData = payload.find(p => p.dataKey === 'bench');
      
      return (
        <div className="bg-black/95 border-2 border-[#FF7222]/50 rounded-3xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.8)] backdrop-blur-2xl min-w-[280px]">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#FF7222]/20">
            <div className="w-3 h-3 bg-[#FF7222] rounded-full animate-pulse"></div>
            <p className="text-[#FF7222] font-black uppercase text-lg tracking-wider">Bio Analytics</p>
            <div className="flex-1 h-px bg-gradient-to-r from-[#FF7222]/50 to-transparent"></div>
          </div>
          
          {/* Date */}
          <div className="mb-4">
            <p className="text-gray-300 font-bold uppercase text-sm tracking-wide">Session Date</p>
            <p className="text-white font-black text-xl">{label}</p>
          </div>
          
          {/* Data Points */}
          <div className="space-y-4">
            {weightData && (activeSeries === 'weight' || activeSeries === 'both') && (
              <div className="flex items-center justify-between p-3 bg-[#FF7222]/10 rounded-2xl border border-[#FF7222]/20">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-[#FF7222] rounded-full shadow-[0_0_15px_#FF7222]"></div>
                  <div>
                    <p className="text-[#FF7222] font-black uppercase text-sm">Body Weight</p>
                    <p className="text-white font-bold text-lg">{weightData.value} KG</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-xs uppercase tracking-wider">Current</p>
                  <p className="text-white font-black text-sm">Active</p>
                </div>
              </div>
            )}
            
            {benchData && (activeSeries === 'bench' || activeSeries === 'both') && (
              <div className="flex items-center justify-between p-3 bg-[#8884d8]/10 rounded-2xl border border-[#8884d8]/20">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-[#8884d8] rounded-full shadow-[0_0_15px_#8884d8]"></div>
                  <div>
                    <p className="text-[#8884d8] font-black uppercase text-sm">Bench Press</p>
                    <p className="text-white font-bold text-lg">{benchData.value} KG</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-xs uppercase tracking-wider">Peak</p>
                  <p className="text-white font-black text-sm">Performance</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="mt-4 pt-3 border-t border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-xs font-black uppercase tracking-widest">Real-Time Data</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                <span className="text-green-400 text-xs font-bold uppercase">Live</span>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Dot Component for Enhanced Interaction
  const CustomDot = ({ cx, cy, stroke, fill, r, dataKey }) => (
    <circle
      cx={cx}
      cy={cy}
      r={r}
      fill={fill}
      stroke={stroke}
      strokeWidth={2}
      className="animate-pulse"
      style={{
        filter: `drop-shadow(0 0 8px ${stroke})`,
        transition: 'all 0.3s ease'
      }}
    />
  );

  // Handle legend click
  const handleLegendClick = (series) => {
    if (activeSeries === series) {
      setActiveSeries('both'); // If clicking active series, show both
    } else {
      setActiveSeries(series); // Otherwise show only clicked series
    }
  };

  return (
    <SpatialCard className="bg-[#080808]/80 border border-white/5 p-6 md:p-12 rounded-[2.5rem] md:rounded-[4rem] backdrop-blur-2xl shadow-[0_40px_100px_rgba(0,0,0,0.5)]">
      <div className="flex flex-col md:flex-row justify-between items-start mb-12 gap-6">
        <div>
          <h3 className="text-3xl md:text-5xl font-[1000] italic uppercase tracking-tighter leading-none">
            Bio <span className="text-[#FF7222]">Analytics</span>
            {activeSeries !== 'both' && (
              <span className="text-sm font-bold ml-4 px-3 py-1 bg-black/50 rounded-full border border-white/10">
                {activeSeries === 'weight' ? 'Weight Focus' : 'Bench Focus'}
              </span>
            )}
          </h3>
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.6em] mt-3">Core_Engine_Feed_v5.0</p>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
            <span className="text-[8px] font-black text-green-400 uppercase tracking-wider">Real-Time Sync</span>
          </div>
        </div>
        <div className="flex bg-white/5 p-3 rounded-3xl border border-white/10 gap-6 backdrop-blur-sm shadow-lg">
            <div 
              className={`flex items-center gap-3 px-4 py-2 bg-black/40 rounded-2xl border cursor-pointer transition-all duration-300 ${
                activeSeries === 'weight' 
                  ? 'border-[#FF7222]/50 bg-[#FF7222]/10 shadow-[0_0_20px_rgba(255,114,34,0.3)]' 
                  : 'border-white/5 hover:bg-[#FF7222]/10 hover:border-[#FF7222]/30'
              }`}
              onClick={() => handleLegendClick('weight')}
              title={activeSeries === 'weight' ? 'Click to show both metrics' : 'Click to show only weight'}
            >
              <div className={`w-3 h-3 rounded-full animate-pulse shadow-[0_0_10px_#FF7222] ${activeSeries === 'weight' ? 'animate-bounce' : ''}`}></div> 
              <div>
                <span className={`text-[10px] font-black uppercase transition-colors ${
                  activeSeries === 'weight' ? 'text-[#FF7222]' : 'text-gray-400 group-hover:text-[#FF7222]'
                }`}>Body Weight</span>
                <div className="text-[8px] font-bold text-gray-500 uppercase tracking-wider">KG Units</div>
              </div>
            </div>
            <div 
              className={`flex items-center gap-3 px-4 py-2 bg-black/40 rounded-2xl border cursor-pointer transition-all duration-300 ${
                activeSeries === 'bench' 
                  ? 'border-[#8884d8]/50 bg-[#8884d8]/10 shadow-[0_0_20px_rgba(136,132,216,0.3)]' 
                  : 'border-white/5 hover:bg-[#8884d8]/10 hover:border-[#8884d8]/30'
              }`}
              onClick={() => handleLegendClick('bench')}
              title={activeSeries === 'bench' ? 'Click to show both metrics' : 'Click to show only bench'}
            >
              <div className={`w-3 h-3 rounded-full animate-pulse shadow-[0_0_10px_#8884d8] ${activeSeries === 'bench' ? 'animate-bounce' : ''}`}></div> 
              <div>
                <span className={`text-[10px] font-black uppercase transition-colors ${
                  activeSeries === 'bench' ? 'text-[#8884d8]' : 'text-gray-400 group-hover:text-[#8884d8]'
                }`}>Bench Press</span>
                <div className="text-[8px] font-bold text-gray-500 uppercase tracking-wider">Max Performance</div>
              </div>
            </div>
        </div>
      </div>
      
      {/* ENHANCED CHART CONTAINER */}
      <div className="h-[320px] w-full min-h-[320px] relative bg-gradient-to-br from-black/20 via-transparent to-black/10 rounded-3xl border border-white/5 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/circuit.png')] pointer-events-none"></div>
        
        {/* Subtle Glow Effects */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#FF7222]/5 via-transparent to-[#8884d8]/5 pointer-events-none"></div>
        
        <ResponsiveContainer width="100%" height="100%" minWidth={400} minHeight={300}>
          <AreaChart 
            data={chartData} 
            margin={{ top: 20, right: 30, left: -10, bottom: 10 }}
            className="drop-shadow-[0_0_20px_rgba(255,114,34,0.1)]"
          >
            {/* Enhanced Gradients */}
            <defs>
              <linearGradient id="gWeight" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FF7222" stopOpacity={0.6}/>
                <stop offset="50%" stopColor="#FF7222" stopOpacity={0.3}/>
                <stop offset="100%" stopColor="#FF7222" stopOpacity={0.05}/>
              </linearGradient>
              <linearGradient id="gBench" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8884d8" stopOpacity={0.6}/>
                <stop offset="50%" stopColor="#8884d8" stopOpacity={0.3}/>
                <stop offset="100%" stopColor="#8884d8" stopOpacity={0.05}/>
              </linearGradient>
              
              {/* Glow Filters */}
              <filter id="glowWeight">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              <filter id="glowBench">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            {/* Enhanced Grid */}
            <CartesianGrid 
              strokeDasharray="8 8" 
              stroke="#ffffff08" 
              vertical={false}
              strokeWidth={1}
            />
            
            {/* Enhanced Axes */}
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ 
                fontSize: 11, 
                fill: '#666', 
                fontWeight: 800,
                fontFamily: 'Outfit'
              }}
              interval="preserveStartEnd"
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ 
                fontSize: 11, 
                fill: '#666', 
                fontWeight: 800,
                fontFamily: 'Outfit'
              }}
              domain={['dataMin - 5', 'dataMax + 5']}
            />
            
            {/* Premium Tooltip */}
            <Tooltip content={<CustomTooltip />} />
            
            {/* Enhanced Areas - Conditionally Rendered */}
            {(activeSeries === 'weight' || activeSeries === 'both') && (
              <Area 
                type="monotone" 
                dataKey="weight" 
                stroke="#FF7222" 
                strokeWidth={5} 
                fill="url(#gWeight)" 
                filter="url(#glowWeight)"
                dot={<CustomDot dataKey="weight" />}
                activeDot={{ 
                  r: 8, 
                  stroke: '#FF7222', 
                  strokeWidth: 3, 
                  fill: '#fff',
                  filter: 'drop-shadow(0 0 12px #FF7222)'
                }}
                animationDuration={800}
                animationEasing="ease-out"
              />
            )}
            {(activeSeries === 'bench' || activeSeries === 'both') && (
              <Area 
                type="monotone" 
                dataKey="bench" 
                stroke="#8884d8" 
                strokeWidth={5} 
                fill="url(#gBench)" 
                filter="url(#glowBench)"
                dot={<CustomDot dataKey="bench" />}
                activeDot={{ 
                  r: 8, 
                  stroke: '#8884d8', 
                  strokeWidth: 3, 
                  fill: '#fff',
                  filter: 'drop-shadow(0 0 12px #8884d8)'
                }}
                animationDuration={800}
                animationEasing="ease-out"
                animationBegin={(activeSeries === 'bench' || activeSeries === 'both') && activeSeries !== 'weight' ? 0 : 200}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
        
        {/* Real-time Indicator */}
        <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/50 rounded-full px-3 py-1 border border-white/10">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
          <span className="text-xs font-black text-green-400 uppercase tracking-wider">Live Data</span>
        </div>
      </div>
    </SpatialCard>
  );
};

// --- 3. HIGH-VELOCITY PERFORMANCE MATRIX ---
const ProgressBars = ({ data = [] }) => {
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [showChart, setShowChart] = useState(false);
  const { progress } = useAppContext();

  // Convert progress data to chart format - use backend data if available, otherwise use context
  const benchPressData = useMemo(() => {
    const sourceData = data.length > 0 ? data : progress;
    return sourceData.map((entry, index) => ({
      id: entry._id || entry.id,
      date: entry.date || new Date(entry.date || Date.now()).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
      weight: entry.weight || entry.bench || 0,
      performance: entry.performance || Math.min(100, Math.round(((entry.bench || entry.weight || 0) / 150) * 100)),
      waist: entry.waist || 0,
      run: entry.run || 0,
      bodyWeight: entry.bodyWeight || entry.weight || 0,
      score: entry.score || 50,
      bench: entry.bench || entry.weight || 0
    })).slice(0, 7); // Show only last 7 entries
  }, [progress, data]);

  // Handle click on bench press entry
  const handleEntryClick = (entry, index) => {
    setSelectedEntry({ ...entry, index });
    setShowChart(true);
  };

  // Generate chart data for selected entry and surrounding entries
  const getChartData = () => {
    if (!selectedEntry || !benchPressData.length) return [];
    
    const currentIndex = selectedEntry.index;
    const range = 3; // Show 3 entries before and after
    const startIndex = Math.max(0, currentIndex - range);
    const endIndex = Math.min(benchPressData.length - 1, currentIndex + range);
    
    return benchPressData.slice(startIndex, endIndex + 1).map(item => ({
      date: item.date,
      bench: item.weight,
      performance: item.performance,
      bodyWeight: item.bodyWeight,
      waist: item.waist,
      run: item.run
    }));
  };

  // Custom Tooltip for Bench Press Chart
  const BenchTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-black/95 border-2 border-[#8884d8]/50 rounded-3xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.8)] backdrop-blur-2xl min-w-[280px]"
        >
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#8884d8]/20">
            <div className="w-3 h-3 bg-[#8884d8] rounded-full animate-pulse"></div>
            <p className="text-[#8884d8] font-black uppercase text-lg tracking-wider">Bench Press Analytics</p>
          </div>
          
          <div className="mb-4">
            <p className="text-gray-300 font-bold uppercase text-sm tracking-wide">Session Date</p>
            <p className="text-white font-black text-xl">{label}</p>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#8884d8]/10 to-transparent rounded-2xl border border-[#8884d8]/20">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-[#8884d8] rounded-full shadow-[0_0_15px_#8884d8]"></div>
                <div>
                  <p className="text-[#8884d8] font-black uppercase text-sm">Max Performance</p>
                  <p className="text-white font-bold text-2xl">{payload[0].value} KG</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col items-center p-3 bg-white/5 rounded-xl">
                <span className="text-gray-400 text-xs uppercase font-bold">Performance</span>
                <span className="text-white font-black text-lg">{data.performance}%</span>
              </div>
              <div className="flex flex-col items-center p-3 bg-white/5 rounded-xl">
                <span className="text-gray-400 text-xs uppercase font-bold">Body Weight</span>
                <span className="text-white font-black text-lg">{data.bodyWeight} KG</span>
              </div>
            </div>
          </div>
        </motion.div>
      );
    }
    return null;
  };

  return (
    <>
      <div className="w-full bg-[#080808]/40 border border-white/5 rounded-[2.5rem] md:rounded-[4rem] p-8 md:p-14 backdrop-blur-3xl shadow-3xl">
        <div className="flex items-center gap-6 mb-16">
          <h3 className="text-3xl md:text-5xl font-[1000] italic uppercase tracking-tighter">Bench Press <span className="text-[#8884d8]">Analytics</span></h3>
          <div className="h-[2px] flex-1 bg-gradient-to-r from-[#8884d8]/40 to-transparent" />
          <div className="text-xs text-gray-400 uppercase font-bold">Click entries for real-time analysis</div>
        </div>

        {benchPressData.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4 opacity-20">📊</div>
            <p className="text-gray-500 text-lg font-bold uppercase tracking-wider">No bench press data available</p>
            <p className="text-gray-600 text-sm mt-2">Add progress entries to see analytics</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-6 md:gap-10">
            {benchPressData.map((item, i) => (
              <motion.div 
                key={item.id} 
                className="flex flex-col items-center group cursor-pointer relative"
                onClick={() => handleEntryClick(item, i)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="w-full relative h-48 md:h-72 bg-white/[0.03] rounded-3xl overflow-hidden border border-white/5 shadow-inner transition-all duration-500 group-hover:shadow-[0_0_30px_rgba(136,132,216,0.4)] group-hover:border-[#8884d8]/50">
                  <motion.div
                    initial={{ height: 0 }}
                    whileInView={{ height: `${item.performance}%` }}
                    transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1], delay: i * 0.05 }}
                    className="absolute bottom-0 w-full bg-gradient-to-t from-[#8884d8] via-[#a29bdb] to-white/60"
                  >
                     <div className="absolute top-0 left-0 w-full h-1 bg-white/40 blur-[2px]" />
                     <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                  </motion.div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/60 backdrop-blur-sm">
                     <div className="text-center">
                       <span className="text-2xl font-black italic text-[#8884d8] block">{item.performance}%</span>
                       <span className="text-sm font-bold text-white uppercase tracking-wide">{item.weight}KG</span>
                       <div className="mt-2 text-xs text-[#8884d8] font-bold uppercase">Click for Graph</div>
                     </div>
                  </div>
                  
                  {/* Real-time indicator */}
                  <div className="absolute top-2 right-2 w-2 h-2 bg-[#8884d8] rounded-full animate-ping opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-6 group-hover:text-[#8884d8] transition-colors">{item.date}</span>
                <span className="text-sm font-black text-white mt-1 italic group-hover:text-[#8884d8] transition-colors">{item.weight}KG</span>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Real-time Chart Modal */}
      <AnimatePresence>
        {showChart && selectedEntry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md"
            onClick={() => setShowChart(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#111] border-2 border-[#8884d8] rounded-[3rem] p-8 w-full max-w-4xl mx-4 relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-3xl font-[1000] italic uppercase text-white mb-2">
                    Bench Press <span className="text-[#8884d8]">Analytics</span>
                  </h3>
                  <p className="text-sm text-gray-400 uppercase font-bold">
                    Selected: {selectedEntry.date} - {selectedEntry.weight}KG
                  </p>
                </div>
                <button
                  onClick={() => setShowChart(false)}
                  className="text-gray-400 hover:text-white text-2xl font-bold transition-colors"
                >
                  ×
                </button>
              </div>

              {/* Real-time Chart */}
              <div className="h-96 w-full bg-gradient-to-br from-black/20 via-transparent to-black/10 rounded-3xl border border-white/5 overflow-hidden p-4">
                <ResponsiveContainer width="100%" height="100%" minWidth={300} minHeight={200}>
                  <AreaChart data={getChartData()}>
                    <defs>
                      <linearGradient id="benchGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8884d8" stopOpacity={0.6}/>
                        <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                      </linearGradient>
                      <filter id="benchGlow">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                        <feMerge> 
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/> 
                        </feMerge>
                      </filter>
                    </defs>
                    
                    <CartesianGrid 
                      strokeDasharray="5 5" 
                      stroke="#333" 
                      vertical={false} 
                    />
                    
                    <XAxis 
                      dataKey="date" 
                      stroke="#666" 
                      fontSize={10} 
                      fontWeight={700} 
                      axisLine={false} 
                      tickLine={false}
                    />
                    
                    <YAxis 
                      stroke="#666" 
                      fontSize={10} 
                      fontWeight={700} 
                      axisLine={false} 
                      tickLine={false}
                    />
                    
                    <Tooltip content={<BenchTooltip />} />
                    
                    <Area 
                      type="monotone" 
                      dataKey="bench" 
                      stroke="#8884d8" 
                      strokeWidth={4} 
                      fill="url(#benchGradient)"
                      filter="url(#benchGlow)"
                      dot={{ 
                        fill: '#8884d8', 
                        strokeWidth: 2, 
                        stroke: '#000',
                        r: 6
                      }}
                      activeDot={{ 
                        r: 8, 
                        fill: '#8884d8',
                        stroke: '#000',
                        strokeWidth: 3,
                        filter: 'url(#benchGlow)'
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Stats Panel */}
              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="bg-[#8884d8]/10 border border-[#8884d8]/20 rounded-2xl p-4 text-center">
                  <div className="text-2xl font-black text-[#8884d8]">{selectedEntry.weight}KG</div>
                  <div className="text-xs text-gray-400 uppercase font-bold">Max Weight</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
                  <div className="text-2xl font-black text-white">{selectedEntry.performance}%</div>
                  <div className="text-xs text-gray-400 uppercase font-bold">Performance</div>
                </div>
                <div className="bg-[#FF7222]/10 border border-[#FF7222]/20 rounded-2xl p-4 text-center">
                  <div className="text-2xl font-black text-[#FF7222]">{selectedEntry.date}</div>
                  <div className="text-xs text-gray-400 uppercase font-bold">Session Date</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// --- 4. NEURAL NUTRITION ANALYTICS ---
const MacroBreakdown = ({ nutritionStats }) => {
  const stats = useMemo(() => ({
    totalProtein: nutritionStats?.totalProtein || 0,
    totalCarbs: nutritionStats?.totalCarbs || 0,
    totalFats: nutritionStats?.totalFats || 0
  }), [nutritionStats]);

  const total = stats.totalProtein + stats.totalCarbs + stats.totalFats;

  const macroData = [
    { name: 'Protein', value: stats.totalProtein, color: '#FF7222', fullName: 'Protein (P)' },
    { name: 'Carbs', value: stats.totalCarbs, color: '#8884d8', fullName: 'Carbohydrates (C)' },
    { name: 'Fats', value: stats.totalFats, color: '#FFFFFF', fullName: 'Fats (F)' },
  ];

  // Custom Tooltip for Pie Chart
  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : 0;
      return (
        <div className="bg-black/90 border border-[#FF7222]/30 rounded-2xl p-4 shadow-2xl backdrop-blur-xl">
          <p className="text-[#FF7222] font-black uppercase text-sm tracking-wider mb-2">{data.payload.fullName}</p>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: data.color }} />
            <span className="text-white font-bold text-lg">{data.value}g</span>
          </div>
          <div className="text-gray-400 text-xs font-black uppercase tracking-widest">
            {percentage}% of Total Fuel
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <SpatialCard className="bg-white/[0.03] border border-white/10 p-10 rounded-[3rem] md:rounded-[4rem] text-center shadow-2xl backdrop-blur-md">
      <h4 className="text-xl font-[1000] italic uppercase mb-10 tracking-[0.3em] text-gray-400">Biological_Load</h4>
      {/* FIXED HEIGHT CONTAINER FOR PIE CHART */}
      <div className="h-[220px] w-full relative min-h-[220px]">
        <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={200}>
          <PieChart>
            <Pie 
                data={macroData} 
                innerRadius={70} 
                outerRadius={95} 
                paddingAngle={10} 
                dataKey="value" 
                stroke="none"
                animationDuration={1000}
            >
              {macroData.map((entry, index) => (
                <Cell 
                  key={index} 
                  fill={entry.color} 
                  style={{ filter: 'drop-shadow(0 0 10px rgba(255, 114, 34, 0.3))' }}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomPieTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
           <span className="text-[9px] font-black text-gray-600 uppercase tracking-[0.4em]">Fuel_Mix</span>
           <span className="text-2xl font-[1000] italic text-white">{total}g</span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-6 mt-10">
        {macroData.map((item, i) => {
          const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
          return (
            <div key={i} className="flex flex-col group cursor-pointer">
              <div className="w-1.5 h-1.5 rounded-full mx-auto mb-2 transition-all duration-300 group-hover:scale-150" style={{ backgroundColor: item.color }} />
              <p className="text-[9px] font-black text-gray-500 uppercase group-hover:text-white transition-colors">{item.name}</p>
              <p className="text-md font-black text-white group-hover:text-[#FF7222] transition-colors">{item.value}g</p>
              <p className="text-[8px] font-bold text-gray-600 uppercase tracking-wider">{percentage}%</p>
            </div>
          );
        })}
      </div>
    </SpatialCard>
  );
};

// --- VITAL TRACE ENTRIES COMPONENT WITH SCROLL EFFECTS ---
const VitalTraceEntries = ({ dashboard }) => {
  const [showAllEntries, setShowAllEntries] = useState(false);
  
  const uniqueEntries = (dashboard?.recentProgress || [])
    .filter((item, index, arr) => arr.findIndex(p => p._id === item._id) === index);
  
  const displayedEntries = showAllEntries ? uniqueEntries : uniqueEntries.slice(0, 3);
  
  return (
    <div className="space-y-6">
      {/* Scrollable Entries Container */}
      <div className={`relative ${
        showAllEntries 
          ? 'max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#FF7222]/30 hover:scrollbar-thumb-[#FF7222]/50' 
          : 'max-h-none overflow-hidden'
      } transition-all duration-500`}>
        
        {/* Gradient Fade Effects for Scroll */}
        {showAllEntries && (
          <>
            <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-[#080808] to-transparent z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#080808] to-transparent z-10 pointer-events-none" />
          </>
        )}
        
        {/* Entries List */}
        <div className="space-y-8 pr-2">
          <AnimatePresence>
            {displayedEntries.map((p, i) => (
              <motion.div 
                key={p._id || i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                whileHover={{ x: 8, scale: 1.02 }} 
                className="flex items-center gap-6 group cursor-pointer p-4 rounded-2xl hover:bg-white/[0.02] transition-all duration-300"
              >
                <div className="w-14 h-14 bg-white/[0.03] border border-white/10 rounded-2xl flex flex-col items-center justify-center group-hover:bg-[#FF7222] group-hover:text-black transition-all duration-500 flex-shrink-0">
                  <span className="text-[7px] font-black uppercase">Ref</span>
                  <span className="text-lg font-[1000] italic">0{i+1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] font-black text-[#FF7222] uppercase tracking-widest mb-1">
                    {new Date(p.date).toLocaleDateString()}
                  </p>
                  <h5 className="text-xl font-[1000] italic uppercase text-white group-hover:translate-x-1 transition-transform truncate">
                    MASS: {p.weight}KG
                  </h5>
                  <p className="text-[9px] font-bold text-gray-500 italic mt-1 uppercase tracking-tighter truncate">
                    Peak_Performance: {p.benchPress || p.bench}KG
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[7px] font-black text-[#FF7222] uppercase tracking-widest">VITALITY</span>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-[#FF7222] rounded-full animate-pulse"></div>
                      <span className="text-sm font-[1000] italic text-[#FF7222]">{p.score || 50}%</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* View More Button */}
      {uniqueEntries.length > 3 && (
        <div className="flex justify-center pt-4 border-t border-white/5">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAllEntries(!showAllEntries)}
            className="flex items-center gap-2 bg-gradient-to-r from-[#FF7222]/20 to-[#FF7222]/10 border border-[#FF7222]/30 hover:border-[#FF7222]/60 px-4 py-2 rounded-xl transition-all group text-xs"
          >
            <span className="text-white font-black uppercase tracking-wider">
              {showAllEntries ? 'Show Less' : `View More (${uniqueEntries.length - 3})`}
            </span>
            <motion.div
              animate={{ rotate: showAllEntries ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="text-[#FF7222] group-hover:text-white transition-colors"
            >
              {showAllEntries ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </motion.div>
          </motion.button>
        </div>
      )}
    </div>
  );
};
const PricingLock = ({ tier, feature, children }) => {
  const { user } = useAppContext();
  const userTier = user?.pricing || 'starter';
  
  const tiers = { starter: 0, pro: 1, elite: 2 };
  const hasAccess = tiers[userTier] >= tiers[tier];
  
  const tierColors = { starter: '#10B981', pro: '#F59E0B', elite: '#8B5CF6' };
  const tierIcons = { starter: Zap, pro: Crown, elite: Star };
  const TierIcon = tierIcons[tier];
  
  if (hasAccess) return children;
  
  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-[2.5rem] z-10 flex items-center justify-center">
        <div className="text-center p-6">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 rounded-full border-2 mr-3" style={{ borderColor: tierColors[tier] }}>
              <Lock size={20} style={{ color: tierColors[tier] }} />
            </div>
            <TierIcon size={24} style={{ color: tierColors[tier] }} />
          </div>
          <h3 className="text-lg font-bold text-white mb-2 capitalize">{tier} Feature</h3>
          <p className="text-sm text-gray-300 mb-4">{feature}</p>
          <button 
            onClick={() => window.location.href = '/pricing'}
            className="px-6 py-2 rounded-lg font-semibold text-black transition-all"
            style={{ backgroundColor: tierColors[tier] }}
          >
            Upgrade to {tier}
          </button>
        </div>
      </div>
      <div className="opacity-20 pointer-events-none">{children}</div>
    </div>
  );
};

// --- MAIN ELITE CONSOLE ---
const EliteDashboard = () => {
  const { dashboard, fetchDashboard, nutritionStats, loading, error, user } = useAppContext();
  const { userId } = useAuth();
  const location = useLocation();
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [showEliteModal, setShowEliteModal] = useState(false);
  const isOnline = useNetworkStatus();
  const [wasOffline, setWasOffline] = useState(false);

  // Get pricing from user context, not navigation state
  const pricing = user?.pricing || 'starter';

  useEffect(() => {
    fetchDashboard?.();
  }, [fetchDashboard]);

  // Auto-refresh when connection is restored
  useEffect(() => {
    if (isOnline && wasOffline) {
      // Connection restored, refresh the page
      window.location.reload();
    }
    setWasOffline(!isOnline);
  }, [isOnline, wasOffline]);

  // Elite Access Modal Logic - Show only once when navigating to dashboard
  useEffect(() => {
    if (userId && user && user.pricing === 'elite' && location.pathname.startsWith('/dashboard')) {
      const modalKey = `eliteModalShown_${userId}`;
      const hasShownModal = sessionStorage.getItem(modalKey);
      
      // Show modal immediately if not shown before
      if (!hasShownModal) {
        setShowEliteModal(true);
      }
    }
  }, [userId, user, location.pathname]);

  const handleCloseEliteModal = () => {
    const modalKey = `eliteModalShown_${userId}`;
    sessionStorage.setItem(modalKey, 'true');
    setShowEliteModal(false);
  };

  const handleConfirmEliteModal = () => {
    const modalKey = `eliteModalShown_${userId}`;
    sessionStorage.setItem(modalKey, 'true');
    setShowEliteModal(false);
  };

  // Test function to update pricing
  const testUpdatePricing = async (newPricing) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/me/pricing`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await window.Clerk.session.getToken()}`
        },
        body: JSON.stringify({ pricing: newPricing })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Refresh user data immediately
        setTimeout(() => {
          fetchDashboard?.();
          window.location.reload(); // Force reload to see changes
        }, 500);
      }
    } catch (error) {
      // Error updating pricing
    }
  };

  // Check for success parameter in URL and refresh user data
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const isSuccess = urlParams.get('success') === 'true';
    const planName = urlParams.get('plan');
    
    if (isSuccess) {
      setShowSuccessNotification(true);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
      // Auto hide after 5 seconds
      setTimeout(() => setShowSuccessNotification(false), 5000);
      
      // Refresh user data after payment success
      const refreshUserData = async () => {
        try {
          const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/me`, {
            headers: {
              'Authorization': `Bearer ${await window.Clerk.session.getToken()}`
            }
          });
          const userData = await response.json();
          if (userData.success) {
            // Force re-fetch dashboard data with updated user info
            fetchDashboard?.();
          }
        } catch (error) {
          // Error refreshing user data
        }
      };
      
      // Delay to ensure webhook has processed
      setTimeout(refreshUserData, 2000);
    }
  }, [fetchDashboard]);

  if (loading) return (
    <div className="min-h-screen bg-[#020202] text-white flex flex-col items-center justify-center">
      <div className="relative">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }} className="w-24 h-24 border-t-2 border-b-2 border-[#FF7222] rounded-full shadow-[0_0_50px_#FF7222]" />
        <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black italic animate-pulse">SYNCING</div>
      </div>
    </div>
  );

  if (error || !dashboard) return (
    <div className="min-h-screen bg-[#020202] text-white flex flex-col items-center justify-center p-10 text-center">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="p-12 border border-red-500/20 bg-red-500/5 rounded-[3rem] backdrop-blur-xl">
        <h2 className="text-5xl font-[1000] italic uppercase mb-6 tracking-tighter text-red-500">Signal_Lost</h2>
        <p className="text-gray-500 max-w-sm mb-10 text-xs font-bold uppercase tracking-widest leading-loose">
          {!isOnline ? 'Network connection lost. Attempting auto-refresh...' : 'Neural uplink disconnected. Database access restricted.'}
        </p>
        {!isOnline && (
          <div className="mb-6 flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-ping"></div>
            <span className="text-xs text-yellow-500 font-bold uppercase tracking-wider">Auto-refresh on reconnect</span>
          </div>
        )}
        <button onClick={() => window.location.reload()} className="group relative px-12 py-5 bg-white text-black font-black uppercase italic rounded-2xl overflow-hidden">
          <span className="relative z-10">{!isOnline ? 'Manual_Refresh' : 'Re-Authorize_Uplink'}</span>
          <div className="absolute inset-0 bg-[#FF7222] translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
        </button>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020202] text-white p-4 sm:p-10 lg:p-20 relative overflow-hidden font-['Outfit'] selection:bg-[#FF7222] selection:text-black">
      
      {/* Elite Access Modal - Show first before dashboard content */}
      {showEliteModal && (
        <EliteAccessModal 
          isOpen={showEliteModal} 
          onClose={handleCloseEliteModal}
          onConfirm={handleConfirmEliteModal}
          userPricing={user?.pricing}
        />
      )}
      
      {/* Dashboard content - Only show when modal is closed */}
      {!showEliteModal && (
        <>
          {/* Success Notification */}
          {showSuccessNotification && (
            <motion.div
              initial={{ opacity: 0, y: -100, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -100, scale: 0.9 }}
              className="fixed top-8 right-8 z-[200] bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-2xl shadow-2xl border border-green-400/30 backdrop-blur-xl"
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-lg">Payment Successful!</h4>
                  <p className="text-sm opacity-90">Your subscription is now active</p>
                </div>
                <button 
                  onClick={() => setShowSuccessNotification(false)}
                  className="ml-4 text-white/70 hover:text-white transition-colors"
                >
                  ×
                </button>
              </div>
            </motion.div>
          )}
      {/* GLOBAL ATMOSPHERE */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[100vw] h-[100vw] bg-[#FF7222]/5 blur-[200px] rounded-full" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[80vw] h-[80vw] bg-[#8884d8]/5 blur-[200px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.03]" />
      </div>

      <div className="max-w-[1800px] mx-auto relative z-10 space-y-16 md:space-y-24">
        
        {/* COMMAND HEADER */}
        <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-12">
          <motion.div initial={{ x: -80, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 1, ease: "circOut" }}>
            <div className="flex items-center gap-5 mb-8">
              <div className="w-20 h-[2px] bg-[#FF7222] shadow-[0_0_20px_#FF7222]" />
              <span className="text-[11px] font-black uppercase tracking-[1em] text-[#FF7222]">Access_Granted: Overseer_01</span>
            </div>
            <h1 className="text-[15vw] md:text-[10vw] xl:text-[11rem] font-[1000] italic leading-[0.7] tracking-tighter uppercase">
              COMMAND<br /><span className="text-transparent stroke-text-white">CENTER</span>
            </h1>
          </motion.div>

          <SpatialCard className="bg-white/5 border border-white/10 p-10 md:p-12 rounded-[4rem] backdrop-blur-3xl flex items-center gap-10 w-full xl:w-auto shadow-[0_50px_100px_rgba(0,0,0,0.4)]">
            <div className="relative">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute -inset-6 border border-dashed border-[#FF7222]/30 rounded-full" />
              <div className="w-24 h-24 md:w-32 md:h-32 bg-white text-black rounded-full flex flex-col items-center justify-center shadow-[0_0_60px_rgba(255,255,255,0.2)]">
                <span className="text-5xl md:text-6xl font-[1000] italic leading-none">{dashboard.stats?.totalWorkouts || 0}</span>
                <span className="text-[8px] font-black uppercase tracking-tighter">Sessions</span>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] mb-2 italic">Performance_Sync</p>
              <h4 className="text-4xl md:text-5xl font-[1000] italic text-white uppercase leading-none tracking-tighter">
                {dashboard.stats?.completedWorkouts || 0} <span className="text-[#FF7222]">Live</span>
              </h4>
              <div className={`flex items-center gap-3 mt-5 px-4 py-2 rounded-full border w-fit transition-all duration-300 ${
                isOnline 
                  ? 'bg-green-500/10 border-green-500/20' 
                  : 'bg-red-500/10 border-red-500/20'
              }`}>
                 <div className={`w-2 h-2 rounded-full animate-ping ${
                   isOnline ? 'bg-green-500' : 'bg-red-500'
                 }`} />
                 <span className={`text-[9px] font-black uppercase ${
                   isOnline ? 'text-green-500' : 'text-red-500'
                 }`}>
                   {isOnline ? 'Uplink Stable' : 'Signal Lost'}
                 </span>
              </div>
            </div>
          </SpatialCard>
        </header>

        {/* METRIC FLOW - PRO FEATURE */}
        <PricingLock tier="pro" feature="Advanced Progress Analytics">
          <ProgressBars data={dashboard?.progressBarData || []} />
        </PricingLock>

        {/* CORE GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 md:gap-20">
          
          {/* PRIMARY COLUMN */}
          <div className="xl:col-span-8 space-y-10 md:space-y-20">
            <PricingLock tier="pro" feature="Bio Analytics Chart">
              <ProgressChart data={dashboard?.progressChartData || []} />
            </PricingLock>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-20">
              <PricingLock tier="starter" feature="Basic Nutrition Tracking">
                <SpatialCard className="bg-gradient-to-br from-[#FF7222] via-[#e6651d] to-[#b34a10] p-12 rounded-[4rem] text-black relative overflow-hidden group shadow-3xl">
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-12">
                    <h4 className="text-5xl font-[1000] italic uppercase leading-[0.8] tracking-tighter">BIO<br />FUEL</h4>
                    <span className="text-[10px] font-black border-2 border-black/20 px-3 py-1 rounded-full italic">LOAD_V4</span>
                  </div>
                  <div className="space-y-5">
                    {(dashboard?.recentNutrition || []).slice(0, 3).map((meal, i) => (
                      <div key={i} className="flex justify-between items-end border-b border-black/10 pb-4 group/item">
                        <span className="text-[11px] font-black uppercase italic opacity-70 group-hover/item:opacity-100 transition-opacity">{meal.name || 'Fuel Entry'}</span>
                        <span className="text-2xl font-[1000] italic leading-none">{meal.protein || 0}G <small className="text-xs font-black">PRO</small></span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="absolute -right-20 -bottom-20 text-[25rem] font-black italic opacity-[0.07] pointer-events-none select-none">FUEL</div>
                </SpatialCard>
              </PricingLock>

              <PricingLock tier="starter" feature="Workout History">
                <SpatialCard className="bg-[#0A0A0A] border border-white/5 p-12 rounded-[4rem] flex flex-col justify-between backdrop-blur-3xl shadow-3xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-20"><div className="w-20 h-20 border border-white/40 rounded-full flex items-center justify-center italic font-black text-xs">LOG</div></div>
                <div>
                  <h4 className="text-[11px] font-black text-gray-600 uppercase tracking-[0.6em] mb-12 italic">Tactical_Operations</h4>
                  <div className="space-y-8">
                    {(dashboard?.recentWorkouts || []).slice(0, 3).map((workout, i) => (
                      <div key={i} className="flex justify-between items-center group/log">
                        <div>
                          <span className="text-lg font-black uppercase italic text-white group-hover/log:text-[#FF7222] transition-colors">{workout.name}</span>
                          <p className="text-[9px] font-bold text-gray-500 mt-1 uppercase tracking-[0.2em]">{workout.category}</p>
                        </div>
                        <div className={`px-4 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-widest ${workout.status === 'completed' ? 'border-green-500/20 text-green-400 bg-green-500/5' : 'border-yellow-500/20 text-yellow-400 bg-yellow-500/5'}`}>
                          {workout.status}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-14 pt-10 border-t border-white/5 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-gray-500 uppercase">Efficiency_Rate</p>
                    <span className="text-3xl font-[1000] italic text-[#FF7222] leading-none">{dashboard?.stats?.workoutCompletionRate || 0}%</span>
                  </div>
                  <div className="w-32 h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <motion.div initial={{ width: 0 }} whileInView={{ width: `${dashboard?.stats?.workoutCompletionRate || 0}%` }} transition={{ duration: 1.5 }} className="h-full bg-white" />
                  </div>
                </div>
                </SpatialCard>
              </PricingLock>
            </div>
          </div>

          {/* SECONDARY COLUMN */}
          <div className="xl:col-span-4 space-y-10 md:space-y-20">
            <PricingLock tier="pro" feature="Vitality Analytics">
              <SpatialCard className="bg-gradient-to-br from-[#FF7222]/10 via-[#FF7222]/5 to-transparent border border-[#FF7222]/20 p-12 rounded-[4rem] text-center relative overflow-hidden group shadow-3xl">
                <div className="absolute inset-0 bg-gradient-to-br from-[#FF7222]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <div className="relative z-10">
                  <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }} className="w-32 h-32 mx-auto mb-8 bg-[#FF7222] rounded-full flex flex-col items-center justify-center shadow-[0_0_60px_rgba(255,114,34,0.4)]">
                    <span className="text-4xl font-[1000] italic text-black leading-none">
                      {dashboard?.recentProgress?.[0]?.score || 50}
                    </span>
                    <span className="text-[8px] font-black text-black/70 uppercase tracking-wider">SCORE</span>
                  </motion.div>
                  <h4 className="text-3xl font-[1000] italic uppercase mb-4 tracking-tighter">VITALITY<br />INDEX</h4>
                  <p className="text-[12px] font-bold text-gray-600 uppercase tracking-widest leading-relaxed">
                    Professional health assessment based on body composition, strength metrics, and cardiovascular performance.
                  </p>
                  <div className="mt-6 flex justify-center">
                    <div className="px-4 py-2 bg-black/20 rounded-full border border-[#FF7222]/30">
                      <span className="text-[10px] font-black text-[#FF7222] uppercase tracking-wider">Real-Time Sync</span>
                    </div>
                  </div>
                </div>
              </SpatialCard>
            </PricingLock>
            <PricingLock tier="elite" feature="Vital Trace Monitoring">
              <SpatialCard className="bg-[#080808] border border-white/5 p-12 rounded-[4rem] relative overflow-hidden shadow-3xl">
                <div className="flex justify-between items-center mb-14">
                  <div>
                    <h4 className="text-2xl font-[1000] italic uppercase tracking-tighter">VITAL_TRACE</h4>
                    <p className="text-[10px] font-bold text-gray-500 uppercase mt-2 tracking-widest">Click entries for real-time analysis</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-xs text-gray-400 uppercase font-bold">
                      {(dashboard?.recentProgress || []).filter((item, index, arr) => arr.findIndex(p => p._id === item._id) === index).length} Entries
                    </div>
                    <div className="flex gap-1">
                      {[1,2,3].map(i => <div key={i} className="w-1 h-4 bg-[#FF7222]/40 rounded-full animate-pulse" />)}
                    </div>
                  </div>
                </div>
                
                <VitalTraceEntries dashboard={dashboard} />
              </SpatialCard>
            </PricingLock>

            <PricingLock tier="pro" feature="Macro Breakdown Analysis">
              <MacroBreakdown nutritionStats={nutritionStats} />
            </PricingLock>

            <PricingLock tier="elite" feature="Neural Stability Diagnostics">
              <SpatialCard className="bg-white/5 border border-white/10 p-12 rounded-[4rem] text-center group backdrop-blur-xl relative overflow-hidden shadow-2xl">
                <motion.div animate={{ rotateY: 360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }} className="text-8xl mb-10 drop-shadow-[0_0_30px_rgba(255,114,34,0.4)]">🛡️</motion.div>
                <h4 className="text-3xl font-[1000] italic uppercase mb-4 tracking-tighter">NEURAL_STABILITY</h4>
                <p className="text-[12px] font-bold text-gray-500 uppercase tracking-widest leading-loose">
                  Biometric authentication: <span className="text-white">Active</span><br />
                  Recovery protocol: <span className="text-[#FF7222] animate-pulse">Engaged</span>
                </p>
                <button className="w-full mt-12 py-6 bg-white text-black rounded-[2rem] text-[11px] font-[1000] uppercase tracking-[0.6em] hover:bg-[#FF7222] hover:text-white hover:scale-[1.02] transition-all duration-500 shadow-3xl">
                  ACCESS_DIAGNOSTICS
                </button>
              </SpatialCard>
            </PricingLock>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100;400;700;900&display=swap');
        .stroke-text-white { -webkit-text-stroke: 2px rgba(255,255,255,0.1); }
        body { font-family: 'Outfit', sans-serif; background: #020202; overflow-x: hidden; color: white; }
        ::selection { background: #FF7222; color: #000; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #FF7222; border-radius: 10px; }
        .scrollbar-thin::-webkit-scrollbar { width: 6px; }
        .scrollbar-track-transparent::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thumb-\[\#FF7222\]\/30::-webkit-scrollbar-thumb { background: rgba(255, 114, 34, 0.3); border-radius: 10px; }
        .scrollbar-thumb-\[\#FF7222\]\/50:hover::-webkit-scrollbar-thumb { background: rgba(255, 114, 34, 0.5); }
        @media (max-width: 768px) {
            .stroke-text-white { -webkit-text-stroke: 1px rgba(255,255,255,0.08); }
        }
      `}</style>
        </>
      )}
    </div>
  );
};

export default EliteDashboard;