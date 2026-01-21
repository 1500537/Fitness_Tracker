import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import { Users, Activity, Dumbbell, DollarSign, Zap, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { SYSTEM_STATS, HISTORICAL_DATA, RECENT_LOGS } from '../../assets/assets';

// --- PRO CANDLESTICK SHAPE ---
const ProfessionalCandle = (props) => {
  const { x, y, width, height, open, close, high, low } = props;
  const isUp = close >= open;
  const color = isUp ? "#00FF66" : "#FF3131";
  const ratio = height / Math.abs(open - close);
  const highY = y - (high - Math.max(open, close)) * ratio;
  const lowY = y + height + (Math.min(open, close) - low) * ratio;

  return (
    <g className="drop-shadow-[0_0_8px_rgba(0,255,102,0.3)]">
      <line x1={x + width / 2} y1={highY} x2={x + width / 2} y2={lowY} stroke={color} strokeWidth={1.5} opacity={0.7} />
      <rect x={x} y={y} width={width} height={height} fill={color} rx={1} className="transition-all duration-300" />
    </g>
  );
};

const Overview = () => {
  const [activeMetric, setActiveMetric] = useState('users');
  const [selectedDate, setSelectedDate] = useState('2026-01-18');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Filter data based on "Calendar Selection" (Simulating showing 7 days ending at selected date)
  const chartData = useMemo(() => {
    const data = HISTORICAL_DATA[activeMetric] || HISTORICAL_DATA['users'];
    return data; 
  }, [activeMetric]);

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-10 lg:pl-[340px] pt-28 relative">
      
      {/* 1. TOP NAVIGATION & CALENDAR CONTROL */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-12 gap-8">
        <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 rounded-full bg-[#FF7222] animate-ping" />
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.5em]">Market_Terminal_v4.2</span>
          </div>
          <h1 className="text-6xl font-[1000] italic uppercase tracking-tighter">DATA<span className="text-[#FF7222]">_</span>CORE</h1>
        </motion.div>

        {/* PRO CALENDAR WIDGET */}
        <div className="relative">
          <button 
            onClick={() => setIsCalendarOpen(!isCalendarOpen)}
            className="flex items-center gap-6 bg-white/[0.03] border border-white/10 px-8 py-4 rounded-3xl hover:bg-white/5 transition-all group"
          >
            <div className="flex flex-col items-start">
              <span className="text-[9px] font-black text-[#FF7222] uppercase tracking-widest">Selected_Timeline</span>
              <span className="text-lg font-bold italic uppercase">{selectedDate}</span>
            </div>
            <div className="p-3 bg-[#FF7222] rounded-2xl text-black group-hover:scale-110 transition-transform">
              <CalendarIcon size={20} />
            </div>
          </button>

          <AnimatePresence>
            {isCalendarOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                className="absolute top-full right-0 mt-4 w-80 bg-[#0F0F0F] border border-white/10 p-6 rounded-[2.5rem] z-[100] shadow-[0_30px_60px_rgba(0,0,0,0.8)] backdrop-blur-2xl"
              >
                <div className="flex justify-between items-center mb-6">
                  <ChevronLeft size={18} className="text-gray-500 cursor-pointer" />
                  <span className="text-xs font-black uppercase">January 2026</span>
                  <ChevronRight size={18} className="text-gray-500 cursor-pointer" />
                </div>
                <div className="grid grid-cols-7 gap-2 text-center text-[10px] text-gray-600 font-black mb-4">
                  {['S','M','T','W','T','F','S'].map(d => <div key={d}>{d}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({length: 31}).map((_, i) => (
                    <div 
                      key={i} 
                      onClick={() => { setSelectedDate(`2026-01-${i+1}`); setIsCalendarOpen(false); }}
                      className={`py-2 rounded-xl text-[10px] font-bold cursor-pointer transition-all ${
                        selectedDate === `2026-01-${i+1}` ? 'bg-[#FF7222] text-black' : 'hover:bg-white/5 text-gray-400'
                      }`}
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 2. STATS GRID (Clickable Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
        {SYSTEM_STATS.map((stat) => (
          <motion.div
            key={stat.id}
            whileHover={{ scale: 1.02, y: -5 }}
            onClick={() => setActiveMetric(stat.metric)}
            className={`p-8 rounded-[2.5rem] border cursor-pointer transition-all duration-500 relative overflow-hidden group ${
              activeMetric === stat.metric ? 'bg-[#FF7222]/10 border-[#FF7222]' : 'bg-white/[0.02] border-white/5'
            }`}
          >
            <div className="flex justify-between mb-6">
              <div className={`p-4 rounded-2xl transition-colors ${activeMetric === stat.metric ? 'bg-[#FF7222] text-black' : 'bg-white/5 text-[#FF7222]'}`}>
                {stat.id === 1 && <Users size={24} />}
                {stat.id === 2 && <Activity size={24} />}
                {stat.id === 3 && <Dumbbell size={24} />}
                {stat.id === 4 && <DollarSign size={24} />}
              </div>
              <div className="text-right">
                <span className="text-green-500 text-[10px] font-black">{stat.change}</span>
                <div className="h-1 w-8 bg-green-500/30 rounded-full mt-1" />
              </div>
            </div>
            <h3 className="text-gray-500 text-[9px] font-black uppercase tracking-widest">{stat.label}</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-[1000] tracking-tighter italic">{stat.value}</span>
              <span className="text-xs text-gray-700 uppercase font-black">{stat.valueSuffix}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 3. THE ELITE GRAPH CONTAINER */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <motion.div 
          layout
          className="xl:col-span-12 p-10 rounded-[4rem] bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5 relative"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
            <div className="flex items-center gap-4">
               <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                  <Filter size={18} className="text-[#FF7222]" />
               </div>
               <div>
                  <h2 className="text-2xl font-[1000] italic uppercase tracking-tighter">Live_Node_Pulse</h2>
                  <p className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.3em]">Showing activity for node: {activeMetric}_alpha</p>
               </div>
            </div>
            
            {/* Legend */}
            <div className="flex gap-6 bg-black/40 px-8 py-4 rounded-2xl border border-white/5">
               <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-sm bg-[#00FF66]" />
                 <span className="text-[9px] font-black uppercase">Bullish_Growth</span>
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-3 h-3 rounded-sm bg-[#FF3131]" />
                 <span className="text-[9px] font-black uppercase">Bearish_Dip</span>
               </div>
            </div>
          </div>

          <div className="h-[500px] w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={300} minHeight={400}>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: -20, bottom: 0 }}>
                <defs>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                <CartesianGrid strokeDasharray="1 1" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="day" stroke="#333" fontSize={11} fontWeights={900} axisLine={false} tickLine={false} dy={15} />
                <YAxis hide domain={['dataMin - 100', 'dataMax + 100']} />
                
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-[#0A0A0A] border-2 border-[#FF7222]/20 p-8 rounded-[2.5rem] shadow-2xl backdrop-blur-xl">
                          <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                            <CalendarIcon size={16} className="text-[#FF7222]" />
                            <span className="text-xs font-black uppercase tracking-widest">{d.date} | {d.day}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-x-12 gap-y-4">
                            <div><p className="text-[9px] text-gray-500 font-bold uppercase">Open</p><p className="text-lg font-black italic">{d.open}</p></div>
                            <div><p className="text-[9px] text-gray-500 font-bold uppercase">Close</p><p className="text-lg font-black italic">{d.close}</p></div>
                            <div><p className="text-[9px] text-green-500 font-bold uppercase">High</p><p className="text-lg font-black italic text-green-500">{d.high}</p></div>
                            <div><p className="text-[9px] text-red-500 font-bold uppercase">Low</p><p className="text-lg font-black italic text-red-500">{d.low}</p></div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                <Bar 
                  dataKey={(d) => Math.abs(d.close - d.open)} 
                  shape={<ProfessionalCandle />}
                  animationDuration={1500}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={entry.close >= entry.open ? "#00FF66" : "#FF3131"} />
                  ))}
                </Bar>
                
                {/* Horizontal Baseline for average */}
                <ReferenceLine y={12000} stroke="#FF7222" strokeDasharray="10 10" opacity={0.2} label={{ position: 'right', value: 'Avg_Goal', fill: '#FF7222', fontSize: 9, fontWeight: 900 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* BACKGROUND DECORATION */}
      <div className="fixed top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#FF7222]/[0.02] to-transparent pointer-events-none -z-10" />
    </div>
  );
};

export default Overview;