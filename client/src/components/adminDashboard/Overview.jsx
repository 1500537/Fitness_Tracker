import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Users, Activity, DollarSign, Zap, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppContext } from '../../context/useAppContext';

const Overview = () => {
  const { socket } = useAppContext();
  const [activeMetric, setActiveMetric] = useState('users');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [overviewData, setOverviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentDate] = useState(new Date());

  const fetchOverviewData = async (date = selectedDate) => {
    try {
      setLoading(true);
      const token = await window.Clerk?.session?.getToken();
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/overview/dashboard?date=${date}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        setOverviewData(data.data);
        setError(null);
      } else {
        setError(data.message || 'Failed to fetch data');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (socket) {
      socket.emit('join-overview-room');
      socket.on('overview-updated', (data) => {
        setOverviewData(data);
      });
      return () => {
        socket.off('overview-updated');
      };
    }
  }, [socket]);

  useEffect(() => {
    fetchOverviewData(selectedDate);
  }, [selectedDate]);

  const chartData = useMemo(() => {
    if (!overviewData) return [];
    return overviewData.historicalData?.[activeMetric] || [];
  }, [activeMetric, overviewData]);

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-10 lg:pl-[340px] pt-28 relative">
      
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-12 gap-8">
        <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 rounded-full bg-[#FF7222] animate-ping" />
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.5em]">Market_Terminal_v4.2</span>
          </div>
          <h1 className="text-6xl font-[1000] italic uppercase tracking-tighter">DATA<span className="text-[#FF7222]">_</span>CORE</h1>
        </motion.div>

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
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full right-0 mt-4 w-80 bg-[#0F0F0F] border border-white/10 p-6 rounded-[2.5rem] z-[100] shadow-[0_30px_60px_rgba(0,0,0,0.8)] backdrop-blur-2xl"
              >
                <div className="flex justify-between items-center mb-6">
                  <ChevronLeft size={18} className="text-gray-500 cursor-pointer" />
                  <span className="text-xs font-black uppercase">{currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                  <ChevronRight size={18} className="text-gray-500 cursor-pointer" />
                </div>
                <div className="grid grid-cols-7 gap-2 text-center text-[10px] text-gray-600 font-black mb-4">
                  {['S','M','T','W','T','F','S'].map((d, idx) => <div key={`day-${idx}`}>{d}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({length: currentDate.getDate()}).map((_, i) => {
                    const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), i + 1);
                    const dateStr = dayDate.toISOString().split('T')[0];
                    const isToday = dateStr === currentDate.toISOString().split('T')[0];
                    const isSelected = selectedDate === dateStr;
                    
                    return (
                      <div 
                        key={i} 
                        onClick={() => { setSelectedDate(dateStr); setIsCalendarOpen(false); }}
                        className={`py-2 rounded-xl text-[10px] font-bold cursor-pointer transition-all ${
                          isSelected ? 'bg-[#FF7222] text-black shadow-[0_0_10px_rgba(255,114,34,0.5)]' : 
                          isToday ? 'bg-white/20 text-white border border-[#FF7222]' :
                          'hover:bg-white/5 text-gray-400'
                        }`}
                      >
                        {i + 1}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="p-8 rounded-[2.5rem] border border-white/5 bg-white/[0.02] animate-pulse">
              <div className="flex justify-between mb-6">
                <div className="w-12 h-12 bg-white/10 rounded-2xl" />
                <div className="w-16 h-4 bg-white/10 rounded" />
              </div>
              <div className="w-20 h-3 bg-white/10 rounded mb-2" />
              <div className="w-24 h-8 bg-white/10 rounded" />
            </div>
          ))
        ) : error ? (
          <div className="col-span-4 text-center py-8">
            <p className="text-red-400 text-sm">{error}</p>
            <button onClick={fetchOverviewData} className="mt-4 px-4 py-2 bg-[#FF7222] text-black rounded-lg text-sm font-bold">
              Retry
            </button>
          </div>
        ) : (
          overviewData?.systemStats?.map((stat) => (
            <motion.div
              key={stat.id}
              whileHover={{ scale: 1.02, y: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveMetric(stat.metric)}
              className={`p-8 rounded-[2.5rem] border cursor-pointer transition-all duration-500 relative overflow-hidden group ${
                activeMetric === stat.metric ? 'bg-[#FF7222]/10 border-[#FF7222] shadow-[0_0_30px_rgba(255,114,34,0.3)]' : 'bg-white/[0.02] border-white/5 hover:border-white/20'
              }`}
            >
              <div className="flex justify-between mb-6">
                <div className={`p-4 rounded-2xl transition-all duration-300 ${
                  activeMetric === stat.metric 
                    ? 'bg-[#FF7222] text-black shadow-[0_0_20px_rgba(255,114,34,0.4)]' 
                    : 'bg-white/5 text-[#FF7222] group-hover:bg-white/10'
                }`}>
                  {stat.id === 1 && <Users size={24} />}
                  {stat.id === 2 && <Activity size={24} />}
                  {stat.id === 3 && <DollarSign size={24} />}
                  {stat.id === 4 && <Zap size={24} />}
                </div>
                <span className={`text-[10px] font-black px-3 py-1 rounded-full ${
                  stat.change?.includes('+') ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                }`}>
                  {stat.change || '+0'}
                </span>
              </div>
              <h4 className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-2">{stat.label}</h4>
              <p className="text-4xl font-[1000] italic tracking-tighter">{stat.value || '0'}</p>
              <motion.div className="absolute bottom-0 left-0 h-1 bg-[#FF7222]" initial={{ width: 0 }} whileHover={{ width: '100%' }} />
            </motion.div>
          ))
        )}
      </div>

      <div className="bg-black/40 backdrop-blur-3xl p-10 rounded-[3.5rem] border border-white/10 relative group mb-16">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-bold text-[#FF7222]">Analytics Dashboard</h3>
          <div className="flex gap-2">
            {['users', 'workouts', 'revenue', 'growth'].map((metric) => (
              <button 
                key={metric}
                onClick={() => setActiveMetric(metric)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${
                  activeMetric === metric ? 'bg-[#FF7222] text-black' : 'bg-white/5 text-gray-400 hover:text-white'
                }`}
              >
                {metric}
              </button>
            ))}
          </div>
        </div>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
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
              />
              <Bar dataKey="value" fill="#FF7222" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={`rgba(255, 114, 34, ${0.3 + (index * 0.1)})`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Overview;