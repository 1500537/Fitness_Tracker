import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, CartesianGrid, ReferenceLine, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Lock, Crown, Star, Edit, Trash2, Activity, Utensils, TrendingUp, Calendar, Target, Zap, BarChart3, PieChart as PieChartIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { progressAsset } from '../../assets/assets';
import { useAppContext } from '../../context/useAppContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Pricing Lock Component
const PricingLock = ({ tier, feature, children }) => {
  const { user } = useAppContext();
  
  // Real-time pricing check with case-insensitive comparison
  const userPricing = (user?.pricing || 'starter').toString().toLowerCase();
  const tiers = { starter: 0, pro: 1, elite: 2 };
  const userTierLevel = tiers[userPricing] !== undefined ? tiers[userPricing] : 0;
  const requiredTierLevel = tiers[tier] || 0;
  const hasAccess = userTierLevel >= requiredTierLevel;
  
  const tierColors = { starter: '#10B981', pro: '#F59E0B', elite: '#8B5CF6' };
  const tierIcons = { starter: Star, pro: Crown, elite: Crown };
  const TierIcon = tierIcons[tier];
  
  if (hasAccess) return children;
  
  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm rounded-[3rem] z-10 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 rounded-full border-2 mr-3" style={{ borderColor: tierColors[tier] }}>
              <Lock size={24} style={{ color: tierColors[tier] }} />
            </div>
            <TierIcon size={32} style={{ color: tierColors[tier] }} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2 capitalize">{tier.toUpperCase()} Feature</h3>
          <p className="text-sm text-gray-300 mb-4">{feature}</p>
          <button 
            onClick={() => window.location.href = '/pricing'}
            className="px-8 py-3 rounded-xl font-semibold text-black transition-all hover:scale-105"
            style={{ backgroundColor: tierColors[tier] }}
          >
            Upgrade to {tier.toUpperCase()}
          </button>
        </div>
      </div>
      <div className="opacity-20 pointer-events-none">{children}</div>
    </div>
  );
};

// --- GLASS LOADER COMPONENT ---
const NeuralSyncLoader = () => (
  <motion.div 
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    className="absolute inset-0 z-[50] flex items-center justify-center bg-black/60 backdrop-blur-xl rounded-[3rem]"
  >
    <div className="relative flex flex-col items-center">
      <motion.div 
        animate={{ rotate: 360, scale: [1, 1.1, 1] }} 
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        className="w-32 h-32 border-t-2 border-b-2 border-[#FF7222] rounded-full shadow-[0_0_40px_rgba(255,114,34,0.4)]"
      />
      <motion.p className="mt-6 text-[#FF7222] font-black italic tracking-[0.5em] text-[10px] uppercase">Neural Syncing...</motion.p>
    </div>
  </motion.div>
);

const ProgressModule = () => {
  const { progress, goals, fetchProgress, fetchGoals, addProgressEntry, updateProgressEntry, deleteProgressEntry, updateGoals, loading, error, workouts, nutrition, nutritionStats, fetchWorkouts, fetchNutrition, fetchNutritionStats } = useAppContext();

  // Ensure goals has a default value
  const safeGoals = goals || { type: 'bench', value: 100 };

  // --- STATE MANAGEMENT ---
  const [history, setHistory] = useState([]);
  const [form, setForm] = useState({ weight: '', bench: '', run: '', waist: '', neck: '', height: '175' });
  const [activeTab, setActiveTab] = useState('strength'); 
  const [compareSelection, setCompareSelection] = useState([
    { weight: 0, bench: 0, waist: 0, score: 0 },
    { weight: 0, bench: 0, waist: 0, score: 0 }
  ]);
  const [showMissionSuccess, setShowMissionSuccess] = useState(false);
  const [showTrendAlert, setShowTrendAlert] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [editingEntry, setEditingEntry] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [realTimeUpdate, setRealTimeUpdate] = useState(0);
  
  // --- NEW ANALYTICS STATE ---
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [analyticsType, setAnalyticsType] = useState('workout'); // 'workout' or 'nutrition'
  const [workoutAnalytics, setWorkoutAnalytics] = useState([]);
  const [nutritionAnalytics, setNutritionAnalytics] = useState([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [showAllEntries, setShowAllEntries] = useState(false);
  // Enhanced Real-time Custom Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const dataKey = payload[0].dataKey;
      
      const getMetricInfo = (key) => {
        const metrics = {
          weight: { label: 'Body Weight', unit: 'KG', color: '#FF7222' },
          bench: { label: 'Bench Press', unit: 'KG', color: '#10B981' },
          run: { label: 'Run Distance', unit: 'KM', color: '#3B82F6' },
          waist: { label: 'Waist Size', unit: 'CM', color: '#F59E0B' },
          score: { label: 'Bio Score', unit: '%', color: '#8B5CF6' },
          calories: { label: 'Calories', unit: 'kcal', color: '#FF7222' },
          volume: { label: 'Training Volume', unit: 'kg', color: '#10B981' }
        };
        return metrics[key] || { label: key, unit: '', color: '#FF7222' };
      };
      
      const metric = getMetricInfo(dataKey);
      
      return (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-black/95 border-2 border-[#FF7222]/50 rounded-3xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.8)] backdrop-blur-2xl min-w-[280px]"
        >
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#FF7222]/20">
            <div className="w-3 h-3 bg-[#FF7222] rounded-full animate-pulse"></div>
            <p className="text-[#FF7222] font-black uppercase text-lg tracking-wider">Real-Time Data</p>
          </div>
          
          <div className="mb-4">
            <p className="text-gray-300 font-bold uppercase text-sm tracking-wide">Session Date</p>
            <p className="text-white font-black text-xl">{label}</p>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-[#FF7222]/10 to-transparent rounded-2xl border border-[#FF7222]/20">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full shadow-[0_0_15px_currentColor]" style={{ backgroundColor: metric.color }}></div>
                <div>
                  <p className="font-black uppercase text-sm" style={{ color: metric.color }}>{metric.label}</p>
                  <p className="text-white font-bold text-2xl">{payload[0].value} {metric.unit}</p>
                </div>
              </div>
            </div>
            
            {/* Additional metrics display */}
            <div className="grid grid-cols-2 gap-2">
              {data.waist && (
                <div className="flex flex-col items-center p-3 bg-white/5 rounded-xl">
                  <span className="text-gray-400 text-xs uppercase font-bold">Waist</span>
                  <span className="text-white font-black text-lg">{data.waist} CM</span>
                </div>
              )}
              
              {data.run && (
                <div className="flex flex-col items-center p-3 bg-white/5 rounded-xl">
                  <span className="text-gray-400 text-xs uppercase font-bold">Run</span>
                  <span className="text-white font-black text-lg">{data.run} KM</span>
                </div>
              )}
              
              {data.score && (
                <div className="flex flex-col items-center p-3 bg-[#8B5CF6]/10 rounded-xl border border-[#8B5CF6]/20">
                  <span className="text-[#8B5CF6] text-xs uppercase font-bold">Bio Score</span>
                  <span className="text-white font-black text-lg">{data.score}%</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      );
    }
    return null;
  };

  // --- ANALYTICS MODAL COMPONENT ---
  const AnalyticsModal = () => {
    const currentAnalytics = analyticsType === 'workout' ? workoutAnalytics : nutritionAnalytics;
    
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4"
        onClick={() => setShowAnalytics(false)}
      >
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-[3rem] p-8 max-w-6xl w-full max-h-[90vh] overflow-y-auto border-2 border-[#FF7222]/30 shadow-[0_0_100px_rgba(255,114,34,0.3)]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              {analyticsType === 'workout' ? (
                <Activity className="w-8 h-8 text-[#FF7222]" />
              ) : (
                <Utensils className="w-8 h-8 text-[#10B981]" />
              )}
              <div>
                <h2 className="text-3xl font-black text-white uppercase tracking-wider">
                  {analyticsType === 'workout' ? 'Workout Analytics' : 'Nutrition Analytics'}
                </h2>
                <p className="text-gray-400 font-bold">Real-time data analysis</p>
              </div>
            </div>
            <button 
              onClick={() => setShowAnalytics(false)}
              className="w-12 h-12 rounded-full bg-red-500/20 border-2 border-red-500/50 text-red-400 hover:bg-red-500/30 transition-all flex items-center justify-center"
            >
              ✕
            </button>
          </div>

          {/* Analytics Content */}
          {analyticsType === 'workout' && workoutAnalytics.categoryChart && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Category Distribution */}
              <div className="bg-gradient-to-br from-[#FF7222]/10 to-transparent rounded-3xl p-6 border border-[#FF7222]/20">
                <div className="flex items-center gap-3 mb-6">
                  <PieChartIcon className="w-6 h-6 text-[#FF7222]" />
                  <h3 className="text-xl font-black text-white uppercase">Exercise Categories</h3>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={workoutAnalytics.categoryChart}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#FF7222"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {workoutAnalytics.categoryChart.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#FF7222', '#10B981', '#3B82F6', '#F59E0B', '#8B5CF6'][index % 5]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Weekly Volume */}
              <div className="bg-gradient-to-br from-[#10B981]/10 to-transparent rounded-3xl p-6 border border-[#10B981]/20">
                <div className="flex items-center gap-3 mb-6">
                  <BarChart3 className="w-6 h-6 text-[#10B981]" />
                  <h3 className="text-xl font-black text-white uppercase">Weekly Volume</h3>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={workoutAnalytics.weeklyChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="week" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="volume" fill="#10B981" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Strength Progress */}
              <div className="bg-gradient-to-br from-[#3B82F6]/10 to-transparent rounded-3xl p-6 border border-[#3B82F6]/20 lg:col-span-2">
                <div className="flex items-center gap-3 mb-6">
                  <TrendingUp className="w-6 h-6 text-[#3B82F6]" />
                  <h3 className="text-xl font-black text-white uppercase">Bench Press Progress</h3>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={workoutAnalytics.strengthChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="weight" stroke="#3B82F6" strokeWidth={3} dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Stats Cards */}
              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-[#FF7222]/20 to-transparent rounded-2xl p-6 border border-[#FF7222]/30">
                  <div className="flex items-center gap-3">
                    <Target className="w-8 h-8 text-[#FF7222]" />
                    <div>
                      <p className="text-gray-400 font-bold uppercase text-sm">Total Workouts</p>
                      <p className="text-white font-black text-3xl">{workoutAnalytics.totalWorkouts}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-[#10B981]/20 to-transparent rounded-2xl p-6 border border-[#10B981]/30">
                  <div className="flex items-center gap-3">
                    <Zap className="w-8 h-8 text-[#10B981]" />
                    <div>
                      <p className="text-gray-400 font-bold uppercase text-sm">Total Volume</p>
                      <p className="text-white font-black text-3xl">{Math.round(workoutAnalytics.totalVolume).toLocaleString()}</p>
                      <p className="text-gray-500 text-sm">kg lifted</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-[#3B82F6]/20 to-transparent rounded-2xl p-6 border border-[#3B82F6]/30">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-8 h-8 text-[#3B82F6]" />
                    <div>
                      <p className="text-gray-400 font-bold uppercase text-sm">Avg/Week</p>
                      <p className="text-white font-black text-3xl">{Math.round(workoutAnalytics.avgWorkoutsPerWeek)}</p>
                      <p className="text-gray-500 text-sm">workouts</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {analyticsType === 'nutrition' && nutritionAnalytics.dailyChart && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Daily Calories */}
              <div className="bg-gradient-to-br from-[#10B981]/10 to-transparent rounded-3xl p-6 border border-[#10B981]/20">
                <div className="flex items-center gap-3 mb-6">
                  <TrendingUp className="w-6 h-6 text-[#10B981]" />
                  <h3 className="text-xl font-black text-white uppercase">Daily Calories</h3>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={nutritionAnalytics.dailyChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="calories" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Macro Distribution */}
              <div className="bg-gradient-to-br from-[#F59E0B]/10 to-transparent rounded-3xl p-6 border border-[#F59E0B]/20">
                <div className="flex items-center gap-3 mb-6">
                  <PieChartIcon className="w-6 h-6 text-[#F59E0B]" />
                  <h3 className="text-xl font-black text-white uppercase">Macro Distribution</h3>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={nutritionAnalytics.macroChart}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {nutritionAnalytics.macroChart.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Meal Distribution */}
              <div className="bg-gradient-to-br from-[#8B5CF6]/10 to-transparent rounded-3xl p-6 border border-[#8B5CF6]/20 lg:col-span-2">
                <div className="flex items-center gap-3 mb-6">
                  <BarChart3 className="w-6 h-6 text-[#8B5CF6]" />
                  <h3 className="text-xl font-black text-white uppercase">Meal Distribution</h3>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={nutritionAnalytics.mealChart}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Nutrition Stats */}
              <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-[#10B981]/20 to-transparent rounded-2xl p-6 border border-[#10B981]/30">
                  <div className="flex items-center gap-3">
                    <Zap className="w-8 h-8 text-[#10B981]" />
                    <div>
                      <p className="text-gray-400 font-bold uppercase text-sm">Total Calories</p>
                      <p className="text-white font-black text-3xl">{Math.round(nutritionAnalytics.totalCalories).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-[#F59E0B]/20 to-transparent rounded-2xl p-6 border border-[#F59E0B]/30">
                  <div className="flex items-center gap-3">
                    <Target className="w-8 h-8 text-[#F59E0B]" />
                    <div>
                      <p className="text-gray-400 font-bold uppercase text-sm">Avg Daily</p>
                      <p className="text-white font-black text-3xl">{Math.round(nutritionAnalytics.avgDailyCalories)}</p>
                      <p className="text-gray-500 text-sm">calories</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-[#8B5CF6]/20 to-transparent rounded-2xl p-6 border border-[#8B5CF6]/30">
                  <div className="flex items-center gap-3">
                    <Utensils className="w-8 h-8 text-[#8B5CF6]" />
                    <div>
                      <p className="text-gray-400 font-bold uppercase text-sm">Total Meals</p>
                      <p className="text-white font-black text-3xl">{nutritionAnalytics.totalMeals}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    );
  };

  useEffect(() => {
    fetchProgress();
    fetchGoals();
    fetchWorkouts();
    fetchNutrition();
    fetchNutritionStats();
  }, []);

  // --- ANALYTICS DATA PROCESSING ---
  useEffect(() => {
    if (workouts.length > 0) {
      processWorkoutAnalytics();
    }
    if (nutrition.length > 0) {
      processNutritionAnalytics();
    }
  }, [workouts, nutrition]);

  const processWorkoutAnalytics = () => {
    const categoryData = {};
    const weeklyData = {};
    const strengthProgress = [];
    
    workouts.forEach(workout => {
      const date = new Date(workout.createdAt);
      const week = `Week ${Math.ceil(date.getDate() / 7)}`;
      const category = workout.category;
      
      // Category distribution
      categoryData[category] = (categoryData[category] || 0) + 1;
      
      // Weekly volume
      if (!weeklyData[week]) {
        weeklyData[week] = { week, volume: 0, workouts: 0 };
      }
      weeklyData[week].volume += workout.sets * workout.reps * workout.weight;
      weeklyData[week].workouts += 1;
      
      // Strength progression for bench press
      if (workout.name.toLowerCase().includes('bench')) {
        strengthProgress.push({
          date: date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
          weight: workout.weight,
          volume: workout.sets * workout.reps * workout.weight
        });
      }
    });
    
    const analytics = {
      categoryChart: Object.entries(categoryData).map(([name, value]) => ({ name, value })),
      weeklyChart: Object.values(weeklyData),
      strengthChart: strengthProgress.slice(-10), // Last 10 entries
      totalWorkouts: workouts.length,
      totalVolume: Object.values(weeklyData).reduce((sum, week) => sum + week.volume, 0),
      avgWorkoutsPerWeek: Object.values(weeklyData).reduce((sum, week) => sum + week.workouts, 0) / Object.keys(weeklyData).length || 0
    };
    
    setWorkoutAnalytics(analytics);
  };

  const processNutritionAnalytics = () => {
    const dailyCalories = {};
    const macroDistribution = { protein: 0, carbs: 0, fats: 0 };
    const mealTypeData = {};
    
    nutrition.forEach(entry => {
      const date = new Date(entry.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
      
      // Daily calories
      if (!dailyCalories[date]) {
        dailyCalories[date] = { date, calories: 0, protein: 0, carbs: 0, fats: 0 };
      }
      dailyCalories[date].calories += entry.calories;
      dailyCalories[date].protein += entry.protein;
      dailyCalories[date].carbs += entry.carbs;
      dailyCalories[date].fats += entry.fats;
      
      // Macro distribution
      macroDistribution.protein += entry.protein;
      macroDistribution.carbs += entry.carbs;
      macroDistribution.fats += entry.fats;
      
      // Meal type distribution
      mealTypeData[entry.type] = (mealTypeData[entry.type] || 0) + entry.calories;
    });
    
    const analytics = {
      dailyChart: Object.values(dailyCalories).slice(-7), // Last 7 days
      macroChart: [
        { name: 'Protein', value: macroDistribution.protein, color: '#10B981' },
        { name: 'Carbs', value: macroDistribution.carbs, color: '#3B82F6' },
        { name: 'Fats', value: macroDistribution.fats, color: '#F59E0B' }
      ],
      mealChart: Object.entries(mealTypeData).map(([name, value]) => ({ name, value })),
      totalCalories: nutritionStats.totalCalories,
      avgDailyCalories: Object.values(dailyCalories).reduce((sum, day) => sum + day.calories, 0) / Object.keys(dailyCalories).length || 0,
      totalMeals: nutrition.length
    };
    
    setNutritionAnalytics(analytics);
  };

  useEffect(() => {
    // Convert progress to history format with proper error handling
    const hist = progress.map(p => {
      // Calculate bio score for each entry
      const score = calculateBioScore({
        weight: p.weight,
        bench: p.bench,
        run: p.run || 0,
        waist: p.waist,
        neck: p.neck || 40,
        height: p.height
      });
      
      return {
        id: p._id,
        _id: p._id, // Keep both for compatibility
        date: new Date(p.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
        weight: p.weight,
        bench: p.bench,
        run: p.run || 0,
        waist: p.waist,
        neck: p.neck || 40,
        height: p.height,
        score: score
      };
    });;
    
    setHistory(hist);
    updateChartData(hist, activeTab);
    
    if (hist.length >= 2) {
      setCompareSelection([hist[0], hist[hist.length - 1]]);
    } else if (hist.length === 1) {
      setCompareSelection([hist[0], hist[0]]);
    } else {
      setCompareSelection([
        { weight: 0, bench: 0, waist: 0, score: 0 },
        { weight: 0, bench: 0, waist: 0, score: 0 }
      ]);
    }
    
    // Trigger real-time update
    setRealTimeUpdate(prev => prev + 1);
  }, [progress, activeTab]);

  // Real-time chart data updater
  const updateChartData = (historyData, tab) => {
    const reversedHistory = [...historyData].reverse();
    setChartData(reversedHistory);
  };

  // Enhanced tab switching with real-time updates
  const switchTab = (tab) => {
    setIsSyncing(true);
    setTimeout(() => { 
      setActiveTab(tab); 
      updateChartData(history, tab);
      setIsSyncing(false); 
    }, 600);
  };

  // Get current chart metric based on active tab
  const getCurrentMetric = () => {
    const metrics = {
      strength: { key: 'bench', label: 'Bench Press', unit: 'KG', color: '#10B981' },
      biometrics: { key: 'weight', label: 'Body Weight', unit: 'KG', color: '#FF7222' },
      cardio: { key: 'run', label: 'Run Distance', unit: 'KM', color: '#3B82F6' },
      composition: { key: 'waist', label: 'Waist Size', unit: 'CM', color: '#F59E0B' },
      vitality: { key: 'score', label: 'Bio Score', unit: '%', color: '#8B5CF6' }
    };
    return metrics[activeTab] || metrics.strength;
  };

  // --- TREND ANALYSIS LOGIC ---
  const getTrendData = () => {
    if (history.length < 2) return { status: 'STABLE', diff: 0, percent: 0 };
    const current = history[0][safeGoals.type];
    const previous = history[1][safeGoals.type];
    const diff = current - previous;
    const percent = ((diff / previous) * 100).toFixed(1);
    
    let status = 'STABLE';
    if (safeGoals.type === 'weight') {
        status = diff < 0 ? 'OPTIMIZING' : 'INCREASING'; // For weight loss
    } else {
        status = diff > 0 ? 'GAINING' : 'STAGNANT'; // For strength/run
    }
    return { status, diff, percent };
  };

  const trend = getTrendData();



  const calculateBioScore = (f) => {
    const { weight, bench, run, waist, neck, height } = f;
    
    // Base score
    let score = 50;
    
    // Body Fat Percentage (using Navy Method)
    let bodyFat = 20; // Default
    if (waist && neck && height && waist > neck && height > 100) {
        try {
            const waistNeckDiff = waist - neck;
            if (waistNeckDiff > 10) {
                bodyFat = 86.010 * Math.log10(waistNeckDiff) - 70.041 * Math.log10(height) + 36.76;
                bodyFat = Math.max(3, Math.min(50, bodyFat));
            }
        } catch (e) {
            bodyFat = 20;
        }
    }
    
    // Strength ratio (bench press to body weight)
    const strengthRatio = weight > 0 ? bench / weight : 0;
    
    // Cardiovascular fitness (run distance)
    const cardioScore = run > 0 ? Math.min(25, Math.max(0, run * 1.5)) : 0;
    
    // Scoring algorithm
    // Body composition (35% weight)
    if (bodyFat < 8) score += 25;
    else if (bodyFat < 12) score += 20;
    else if (bodyFat < 15) score += 15;
    else if (bodyFat < 18) score += 10;
    else if (bodyFat < 22) score += 5;
    else if (bodyFat < 25) score += 0;
    else if (bodyFat > 30) score -= 10;
    
    // Strength assessment (40% weight)
    if (strengthRatio >= 2.0) score += 25;
    else if (strengthRatio >= 1.5) score += 20;
    else if (strengthRatio >= 1.2) score += 15;
    else if (strengthRatio >= 1.0) score += 10;
    else if (strengthRatio >= 0.8) score += 5;
    else score -= 5;
    
    // Cardiovascular fitness (25% weight)
    score += cardioScore;
    
    // Bonus for balanced metrics
    const metricsComplete = [weight > 30, bench > 10, waist > 50, height > 140].filter(Boolean).length;
    score += metricsComplete * 2;
    
    // Ensure score is between 0-100
    return Math.max(0, Math.min(100, Math.round(score)));
  };

  const validateForm = () => {
    const errors = {};
    const weight = parseFloat(form.weight);
    const bench = parseFloat(form.bench);
    const run = parseFloat(form.run);
    const waist = parseFloat(form.waist);
    const neck = parseFloat(form.neck);
    const height = parseFloat(form.height);

    // Weight validation (KG) - Realistic human weight range
    if (!form.weight || isNaN(weight) || weight < 30 || weight > 300) {
      errors.weight = 'Weight must be between 30-300 kg';
    }

    // Bench press validation (KG) - Realistic strength range
    if (!form.bench || isNaN(bench) || bench < 10 || bench > 600) {
      errors.bench = 'Bench press must be between 10-600 kg';
    }

    // Run validation (KM) - Distance running
    if (form.run && (isNaN(run) || run < 0 || run > 50)) {
      errors.run = 'Run distance must be between 0-50 km';
    }

    // Waist validation (CM) - Realistic waist circumference
    if (!form.waist || isNaN(waist) || waist < 50 || waist > 200) {
      errors.waist = 'Waist must be between 50-200 cm';
    }

    // Neck validation (CM) - Realistic neck circumference
    if (form.neck && (isNaN(neck) || neck < 25 || neck > 60)) {
      errors.neck = 'Neck must be between 25-60 cm';
    }

    // Height validation (CM) - Realistic human height
    if (!form.height || isNaN(height) || height < 120 || height > 250) {
      errors.height = 'Height must be between 120-250 cm';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const logData = async () => {
    if (!validateForm()) return;

    const progressData = {
      date: new Date(),
      weight: parseFloat(form.weight),
      bench: parseFloat(form.bench),
      run: parseFloat(form.run) || 0,
      waist: parseFloat(form.waist),
      neck: parseFloat(form.neck) || 40,
      height: parseFloat(form.height)
    };

    const result = await addProgressEntry(progressData);
    if (result) {
      // Check for goals
      const currentVal = parseFloat(form[safeGoals.type]);
      if (currentVal >= safeGoals.value && history.length > 0 && history[0][safeGoals.type] < safeGoals.value) {
        setShowMissionSuccess(true);
      } else if (history.length > 0 && (safeGoals.type !== 'weight' ? currentVal > history[0][safeGoals.type] : currentVal < history[0][safeGoals.type])) {
        setShowTrendAlert(true);
      }
      setForm({ weight: '', bench: '', run: '', waist: '', neck: '', height: '175' });
      setValidationErrors({});
    }
  };

  const downloadReport = () => {
    const doc = new jsPDF();
    doc.setFillColor(10, 10, 10); doc.rect(0, 0, 210, 297, 'F');
    doc.setTextColor(255, 114, 34); doc.text('INTEL REPORT', 15, 30);
    autoTable(doc, {
      startY: 50,
      head: [['DATE', 'WT', 'BENCH', 'WAIST', 'VITALITY']],
      body: history.map(h => [h.date, `${h.weight}kg`, `${h.bench}kg`, `${h.waist}cm`, `${h.score}%`]),
      headStyles: { fillColor: [255, 114, 34] }
    });
    doc.save(`Intel_Sync_${Date.now()}.pdf`);
  };

  // Edit progress entry
  const editProgressEntry = async (entry) => {
    console.log('✏️ Editing progress entry:', entry);
    setEditingEntry(entry);
    setForm({
      weight: entry.weight.toString(),
      bench: entry.bench.toString(),
      run: entry.run?.toString() || '',
      waist: entry.waist.toString(),
      neck: entry.neck?.toString() || '40',
      height: entry.height.toString()
    });
  };

  // Update progress entry
  const updateProgress = async () => {
    if (!editingEntry || !validateForm()) return;

    console.log('🔄 Updating progress entry:', editingEntry.id);
    const progressData = {
      weight: parseFloat(form.weight),
      bench: parseFloat(form.bench),
      run: parseFloat(form.run) || 0,
      waist: parseFloat(form.waist),
      neck: parseFloat(form.neck) || 40,
      height: parseFloat(form.height)
    };

    const result = await updateProgressEntry(editingEntry.id, progressData);
    if (result) {
      console.log('✅ Progress updated successfully');
      setEditingEntry(null);
      setForm({ weight: '', bench: '', run: '', waist: '', neck: '', height: '175' });
      setValidationErrors({});
      // Refresh progress data
      fetchProgress();
    } else {
      console.error('❌ Failed to update progress');
    }
  };

  // Delete progress entry
  const deleteProgress = async (id) => {
    console.log('🗑️ Deleting progress entry:', id);
    const result = await deleteProgressEntry(id);
    if (result) {
      console.log('✅ Progress deleted successfully');
      setShowDeleteConfirm(null);
      // Refresh progress data
      fetchProgress();
    } else {
      console.error('❌ Failed to delete progress');
    }
  };

  return (
    <div className="relative space-y-12 pb-24 text-white max-w-[1600px] mx-auto px-4 bg-black min-h-screen">
      
      {/* --- MISSION SUCCESS POPUP (Static Goal) --- */}
      <AnimatePresence>
        {showMissionSuccess && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[500] flex items-center justify-center bg-black/95 backdrop-blur-3xl">
             <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="p-16 border border-[#FF7222]/20 bg-white/[0.02] rounded-[5rem] text-center max-w-2xl">
                <h2 className="text-8xl font-[1000] italic uppercase tracking-tighter text-[#FF7222]">MISSION<br/>SUCCESS</h2>
                <button onClick={() => setShowMissionSuccess(false)} className="mt-8 bg-white text-black px-12 py-5 rounded-full font-black uppercase italic">Synchronize</button>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- TREND ALERT POPUP (Dynamic Improvement) --- */}
      <AnimatePresence>
        {showTrendAlert && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[490] flex items-center justify-center bg-black/80 backdrop-blur-md">
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-[#111] border-2 border-[#FF7222] p-12 rounded-[3rem] text-center shadow-[0_0_100px_rgba(255,114,34,0.2)]">
                <p className="text-[#FF7222] font-black tracking-widest text-xs uppercase mb-2 italic">Neural Momentum Detected</p>
                <h3 className="text-5xl font-[1000] italic uppercase tracking-tighter text-white">TRENDING<br/><span className="text-[#FF7222]">UPWARDS</span></h3>
                <div className="mt-6 flex justify-center gap-4">
                    <div className="bg-white/5 p-4 rounded-2xl"><p className="text-[8px] text-gray-500 uppercase">Improvement</p><p className="text-2xl font-black">{trend.percent}%</p></div>
                </div>
                <button onClick={() => setShowTrendAlert(false)} className="mt-8 border border-white/20 text-white px-10 py-3 rounded-2xl font-black uppercase text-[10px] hover:bg-white hover:text-black transition-all">Continue Evolution</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 pt-10">
        <div className="border-l-4 border-[#FF7222] pl-6">
          <p className="text-[#FF7222] font-black tracking-[0.4em] text-xs mb-2 uppercase italic">Protocol V2.0</p>
          <h2 className="text-6xl md:text-8xl font-[1000] italic uppercase leading-[0.8] tracking-tighter">DATA<br /><span className="text-[#FF7222]">VAULT</span></h2>
        </div>
        
        <div className="flex items-center gap-4 bg-white/[0.03] p-3 rounded-[2.5rem] border border-white/10 backdrop-blur-md">
            <div className="px-6 border-r border-white/10 flex flex-col items-end">
                <select value={safeGoals.type} onChange={async (e) => { await updateGoals({...safeGoals, type: e.target.value}); }} className="bg-transparent text-[9px] font-black text-gray-500 uppercase outline-none cursor-pointer">
                    <option value="bench" className="bg-black">Target Bench</option>
                    <option value="weight" className="bg-black">Target Weight</option>
                    <option value="run" className="bg-black">Target Run</option>
                </select>
                <input type="number" value={safeGoals.value} onChange={async (e)=> { await updateGoals({...safeGoals, value: parseFloat(e.target.value) || 0}); }} className="bg-transparent text-2xl font-[1000] italic text-[#FF7222] w-16 outline-none" />
            </div>
            <button onClick={downloadReport} className="bg-[#FF7222] text-black px-8 py-4 rounded-3xl font-black text-[10px] uppercase tracking-widest">Export Intel</button>
        </div>
      </div>

      {/* --- ANALYTICS BUTTONS SECTION --- */}
      <PricingLock tier="pro" feature="Advanced Analytics Dashboard with Real-time Workout & Nutrition Insights">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Workout Analytics Button */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { setAnalyticsType('workout'); setShowAnalytics(true); }}
            className="bg-gradient-to-br from-[#FF7222]/20 via-[#FF7222]/10 to-transparent border-2 border-[#FF7222]/30 rounded-[3rem] p-8 cursor-pointer hover:border-[#FF7222]/60 transition-all group relative overflow-hidden"
          >
            <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-40 transition-opacity">
              <Activity size={64} className="text-[#FF7222]" />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-[#FF7222]/20 rounded-2xl border border-[#FF7222]/30">
                  <Activity className="w-8 h-8 text-[#FF7222]" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-wider">Workout Analytics</h3>
                  <p className="text-gray-400 font-bold text-sm">Click for real-time analysis</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-black/30 rounded-2xl p-4 text-center">
                  <p className="text-[#FF7222] font-black text-2xl">{workouts.length}</p>
                  <p className="text-gray-400 text-xs uppercase font-bold">Total Workouts</p>
                </div>
                <div className="bg-black/30 rounded-2xl p-4 text-center">
                  <p className="text-[#10B981] font-black text-2xl">{workouts.filter(w => w.category === 'CHEST').length}</p>
                  <p className="text-gray-400 text-xs uppercase font-bold">Chest Sessions</p>
                </div>
                <div className="bg-black/30 rounded-2xl p-4 text-center">
                  <p className="text-[#3B82F6] font-black text-2xl">{workouts.filter(w => w.status === 'completed').length}</p>
                  <p className="text-gray-400 text-xs uppercase font-bold">Completed</p>
                </div>
              </div>
              
              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#FF7222] rounded-full animate-pulse"></div>
                  <span className="text-[#FF7222] font-black text-xs uppercase">Live Data</span>
                </div>
                <div className="text-white font-black text-sm">→ Click to Analyze</div>
              </div>
            </div>
          </motion.div>

          {/* Nutrition Analytics Button */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { setAnalyticsType('nutrition'); setShowAnalytics(true); }}
            className="bg-gradient-to-br from-[#10B981]/20 via-[#10B981]/10 to-transparent border-2 border-[#10B981]/30 rounded-[3rem] p-8 cursor-pointer hover:border-[#10B981]/60 transition-all group relative overflow-hidden"
          >
            <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-40 transition-opacity">
              <Utensils size={64} className="text-[#10B981]" />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-[#10B981]/20 rounded-2xl border border-[#10B981]/30">
                  <Utensils className="w-8 h-8 text-[#10B981]" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-wider">Nutrition Analytics</h3>
                  <p className="text-gray-400 font-bold text-sm">Click for real-time analysis</p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-black/30 rounded-2xl p-4 text-center">
                  <p className="text-[#10B981] font-black text-2xl">{Math.round(nutritionStats.totalCalories)}</p>
                  <p className="text-gray-400 text-xs uppercase font-bold">Total Calories</p>
                </div>
                <div className="bg-black/30 rounded-2xl p-4 text-center">
                  <p className="text-[#F59E0B] font-black text-2xl">{Math.round(nutritionStats.totalProtein)}g</p>
                  <p className="text-gray-400 text-xs uppercase font-bold">Protein</p>
                </div>
                <div className="bg-black/30 rounded-2xl p-4 text-center">
                  <p className="text-[#8B5CF6] font-black text-2xl">{nutritionStats.mealCount}</p>
                  <p className="text-gray-400 text-xs uppercase font-bold">Meals Logged</p>
                </div>
              </div>
              
              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse"></div>
                  <span className="text-[#10B981] font-black text-xs uppercase">Live Data</span>
                </div>
                <div className="text-white font-black text-sm">→ Click to Analyze</div>
              </div>
            </div>
          </motion.div>
        </div>
      </PricingLock>

      {/* TREND ANALYSIS PANEL (NEW) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#111] border border-white/5 p-8 rounded-[3rem] flex items-center justify-between group overflow-hidden relative">
              <div className="relative z-10">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Current Momentum</p>
                  <h4 className={`text-4xl font-[1000] italic uppercase ${trend.diff >= 0 ? 'text-green-500' : 'text-red-500'}`}>{trend.status}</h4>
              </div>
              <div className="text-right relative z-10">
                  <p className="text-3xl font-[1000] italic">{trend.percent}%</p>
                  <p className="text-[10px] font-bold text-gray-600 uppercase">vs Last Entry</p>
              </div>
              <div className="absolute right-[-10%] top-[-20%] text-9xl font-black text-white/[0.02] italic select-none uppercase">{safeGoals.type}</div>
          </div>
          
          <div className="md:col-span-2 bg-white/[0.03] border border-white/5 p-8 rounded-[3rem] flex items-center justify-between">
              <div>
                  <h4 className="text-xl font-[1000] italic uppercase">Neural Insight: <span className="text-[#FF7222]">{history.length > 0 ? Math.abs(safeGoals.value - history[0][safeGoals.type]).toFixed(1) : safeGoals.value} Units Remaining</span></h4>
                  <p className="text-[10px] font-bold text-gray-500 uppercase mt-2 tracking-widest">Estimated {history.length > 0 ? Math.ceil(Math.abs(safeGoals.value - history[0][safeGoals.type]) / (Math.abs(trend.diff) || 1)) : 'N/A'} more sessions at current rate</p>
              </div>
              <div className="w-16 h-16 rounded-full border-4 border-[#FF7222]/20 flex items-center justify-center relative">
                  <svg className="w-12 h-12 -rotate-90">
                      <circle cx="24" cy="24" r="20" fill="transparent" stroke="#222" strokeWidth="4" />
                      <circle cx="24" cy="24" r="20" fill="transparent" stroke="#FF7222" strokeWidth="4" strokeDasharray="125.6" strokeDashoffset={125.6 - (history.length > 0 ? Math.min(history[0][safeGoals.type] / safeGoals.value, 1) * 125.6 : 0)} strokeLinecap="round" />
                  </svg>
              </div>
          </div>
      </div>

      {/* INPUT GRID - GLASS UI */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white rounded-[4rem] p-10 shadow-2xl">
        <div className="lg:col-span-3 text-black">
            <h3 className="text-5xl font-[1000] italic uppercase leading-[0.85] tracking-tighter">Log<br/><span className="text-gray-300">Intel</span></h3>
            <p className="text-[10px] font-bold text-gray-400 mt-6 uppercase tracking-[0.2em]">Biometric accuracy is mandatory.</p>
        </div>
        <div className="lg:col-span-9 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {[
            { label: 'Weight (KG)', key: 'weight' }, 
            { label: 'Bench (KG)', key: 'bench' }, 
            { label: 'Run (KM)', key: 'run' }, 
            { label: 'Waist (CM)', key: 'waist' }, 
            { label: 'Neck (CM)', key: 'neck' }, 
            { label: 'Height (CM)', key: 'height' }
          ].map((item) => (
            <div key={item.key} className="space-y-1">
              <label className="text-[9px] font-black text-gray-400 uppercase ml-3 tracking-tighter">{item.label}</label>
              <input type="number" value={form[item.key]} onChange={(e) => setForm({...form, [item.key]: e.target.value})} className={`w-full bg-gray-50 p-5 rounded-3xl text-black font-[1000] text-2xl italic border-2 outline-none ${validationErrors[item.key] ? 'border-red-500' : 'border-transparent focus:border-[#FF7222]'}`} />
              {validationErrors[item.key] && <p className="text-red-500 text-[8px] font-bold uppercase">{validationErrors[item.key]}</p>}
            </div>
          ))}
          <button onClick={logData} disabled={loading} className="col-span-2 md:col-span-3 xl:col-span-6 bg-black py-6 rounded-3xl font-[1000] italic uppercase text-white hover:bg-[#FF7222] transition-all text-xl disabled:opacity-50">Push Data to Vault +</button>
        </div>
      </div>

      {/* ANALYTICS HUB WITH REAL-TIME TRANSITION */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-4 bg-[#0A0A0A] border border-white/5 rounded-[4rem] p-10 flex flex-col justify-between shadow-2xl">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={[
                { subject: 'Weight', A: compareSelection[0].weight, B: compareSelection[1].weight },
                { subject: 'Bench', A: compareSelection[0].bench, B: compareSelection[1].bench },
                { subject: 'Waist', A: compareSelection[0].waist * 2, B: compareSelection[1].waist * 2 },
                { subject: 'Vitality', A: calculateBioScore(compareSelection[0]), B: calculateBioScore(compareSelection[1]) }
              ]}>
                <PolarGrid stroke="#222" /><PolarAngleAxis dataKey="subject" tick={{fill: '#444', fontSize: 10, fontWeight: 900}} />
                <Radar dataKey="A" stroke="#333" fill="#333" fillOpacity={0.3} /><Radar dataKey="B" stroke="#FF7222" fill="#FF7222" fillOpacity={0.5} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="xl:col-span-8 bg-white/[0.02] border border-white/10 rounded-[4rem] p-10 relative overflow-hidden shadow-2xl">
          <AnimatePresence>{isSyncing && <NeuralSyncLoader />}</AnimatePresence>
          
          {/* Enhanced Tab Navigation */}
          <div className="flex justify-between items-center mb-10">
            <div className="flex gap-1 bg-black/50 p-1 rounded-3xl border border-white/10 backdrop-blur-md">
                <button 
                  onClick={() => switchTab('strength')} 
                  className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase transition-all duration-300 ${activeTab === 'strength' ? 'bg-[#10B981] text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]' : 'text-gray-500 hover:text-white'}`}
                >
                  💪 Strength
                </button>
                <button 
                  onClick={() => switchTab('biometrics')} 
                  className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase transition-all duration-300 ${activeTab === 'biometrics' ? 'bg-[#FF7222] text-black shadow-[0_0_20px_rgba(255,114,34,0.3)]' : 'text-gray-500 hover:text-white'}`}
                >
                  ⚖️ Weight
                </button>
                <button 
                  onClick={() => switchTab('cardio')} 
                  className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase transition-all duration-300 ${activeTab === 'cardio' ? 'bg-[#3B82F6] text-black shadow-[0_0_20px_rgba(59,130,246,0.3)]' : 'text-gray-500 hover:text-white'}`}
                >
                  🏃 Cardio
                </button>
                <button 
                  onClick={() => switchTab('composition')} 
                  className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase transition-all duration-300 ${activeTab === 'composition' ? 'bg-[#F59E0B] text-black shadow-[0_0_20px_rgba(245,158,11,0.3)]' : 'text-gray-500 hover:text-white'}`}
                >
                  📏 Body
                </button>
                <button 
                  onClick={() => switchTab('vitality')} 
                  className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase transition-all duration-300 ${activeTab === 'vitality' ? 'bg-[#8B5CF6] text-black shadow-[0_0_20px_rgba(139,92,246,0.3)]' : 'text-gray-500 hover:text-white'}`}
                >
                  ⚡ Vitality
                </button>
            </div>
            
            {/* Real-time Goal Display */}
            <div className="flex items-center gap-4 bg-black/30 px-6 py-3 rounded-2xl border border-white/10">
              <div className="w-2 h-2 bg-[#FF7222] rounded-full animate-pulse"></div>
              <div className="text-[10px] font-black text-[#FF7222] uppercase italic">
                Goal: {safeGoals.value} {safeGoals.type === 'weight' ? 'KG' : safeGoals.type === 'bench' ? 'KG' : safeGoals.type === 'run' ? 'KM' : safeGoals.type === 'waist' ? 'CM' : 'CM'}
              </div>
            </div>
          </div>
          
          {/* Real-time Chart Container */}
          <motion.div 
            key={activeTab + realTimeUpdate}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="h-96"
          >
            <ResponsiveContainer width="100%" height="100%" minWidth={300} minHeight={200}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id={`color${activeTab}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={getCurrentMetric().color} stopOpacity={0.6}/>
                    <stop offset="95%" stopColor={getCurrentMetric().color} stopOpacity={0}/>
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge> 
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/> 
                    </feMerge>
                  </filter>
                </defs>
                
                <CartesianGrid 
                  strokeDasharray="5 5" 
                  stroke="#222" 
                  vertical={false} 
                  horizontal={true}
                />
                
                <XAxis 
                  dataKey="date" 
                  stroke="#666" 
                  fontSize={10} 
                  fontWeight={700} 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: '#666', fontSize: 10, fontWeight: 700 }}
                />
                
                <YAxis 
                  stroke="#666" 
                  fontSize={10} 
                  fontWeight={700} 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: '#666', fontSize: 10, fontWeight: 700 }}
                />
                
                <Tooltip content={<CustomTooltip />} />
                
                {/* Dynamic Reference Line for Goals */}
                <ReferenceLine 
                  y={safeGoals.type === getCurrentMetric().key ? safeGoals.value : undefined} 
                  stroke={getCurrentMetric().color} 
                  strokeDasharray="8 8" 
                  strokeWidth={2}
                  opacity={0.7}
                />
                
                {/* Main Area Chart */}
                <Area 
                  type="monotone" 
                  dataKey={getCurrentMetric().key} 
                  stroke={getCurrentMetric().color} 
                  strokeWidth={4} 
                  fill={`url(#color${activeTab})`}
                  filter="url(#glow)"
                  dot={{ 
                    fill: getCurrentMetric().color, 
                    strokeWidth: 2, 
                    stroke: '#000',
                    r: 6
                  }}
                  activeDot={{ 
                    r: 8, 
                    fill: getCurrentMetric().color,
                    stroke: '#000',
                    strokeWidth: 3,
                    filter: 'url(#glow)'
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
          
          {/* Real-time Metric Info */}
          <div className="mt-6 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: getCurrentMetric().color }}></div>
              <span className="text-sm font-bold text-white uppercase">
                {getCurrentMetric().label} ({getCurrentMetric().unit})
              </span>
            </div>
            
            <div className="text-xs text-gray-400 uppercase font-bold">
              Last Updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      {/* RECENT ENTRIES (Real-time update with View More) */}
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="border-l-4 border-[#FF7222] pl-6">
            <h3 className="text-4xl font-[1000] italic uppercase leading-[0.8] tracking-tighter text-white">Recent<br/><span className="text-[#FF7222]">Entries</span></h3>
            <p className="text-[10px] font-bold text-gray-500 uppercase mt-2 tracking-widest">Click entries for real-time analysis</p>
          </div>
          <div className="text-xs text-gray-400 uppercase font-bold">
            {history.length} Total Entries
          </div>
        </div>

        {/* Entries Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {history.slice(0, showAllEntries ? history.length : 4).map((node) => (
            <motion.div 
              layout 
              key={node.id} 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#0A0A0A] border border-white/5 p-8 rounded-[3rem] hover:border-[#FF7222]/40 transition-all cursor-pointer group relative"
            >
              {/* Edit/Delete buttons */}
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={(e) => { e.stopPropagation(); editProgressEntry(node); }}
                  className="p-2 bg-blue-500/20 hover:bg-blue-500/40 rounded-xl transition-colors"
                >
                  <Edit size={16} className="text-blue-400" />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(node); }}
                  className="p-2 bg-red-500/20 hover:bg-red-500/40 rounded-xl transition-colors"
                >
                  <Trash2 size={16} className="text-red-400" />
                </button>
              </div>
              
              <div onClick={() => setCompareSelection([compareSelection[1], node])} className="flex justify-between items-start mb-6">
                <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{node.date}</span>
                <span className="text-[#FF7222] font-black italic text-xl">{node.score}%</span>
              </div>
              <h5 className="text-4xl font-[1000] italic tracking-tighter text-white group-hover:text-[#FF7222] transition-colors">{node.weight} KG</h5>
              <div className="mt-6 pt-6 border-t border-white/5 flex justify-between">
                <div className="text-center"><p className="text-[8px] font-bold text-gray-600 uppercase">Bench</p><p className="font-black text-lg">{node.bench} KG</p></div>
                <div className="text-center"><p className="text-[8px] font-bold text-gray-600 uppercase">Waist</p><p className="font-black text-lg">{node.waist} CM</p></div>
                <div className="text-center"><p className="text-[8px] font-bold text-gray-600 uppercase">Vitality</p><p className="font-black text-lg text-[#FF7222]">{node.score}%</p></div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View More Button */}
        {history.length > 4 && (
          <div className="flex justify-center mt-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAllEntries(!showAllEntries)}
              className="flex items-center gap-3 bg-gradient-to-r from-[#FF7222]/20 to-[#FF7222]/10 border-2 border-[#FF7222]/30 hover:border-[#FF7222]/60 px-8 py-4 rounded-3xl transition-all group"
            >
              <span className="text-white font-black uppercase text-sm tracking-wider">
                {showAllEntries ? 'Show Less' : `View More (${history.length - 4})`}
              </span>
              <motion.div
                animate={{ rotate: showAllEntries ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                className="text-[#FF7222] group-hover:text-white transition-colors"
              >
                {showAllEntries ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </motion.div>
            </motion.button>
          </div>
        )}
      </div>

      {/* EDIT MODAL */}
      <AnimatePresence>
        {editingEntry && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[600] flex items-center justify-center bg-black/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#111] border-2 border-[#FF7222] p-12 rounded-[3rem] w-full max-w-2xl mx-4"
            >
              <h3 className="text-3xl font-[1000] italic uppercase text-white mb-8 text-center">Edit Progress Entry</h3>
              
              {/* Form fields */}
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-bold text-gray-400 uppercase mb-2">Weight (KG)</label>
                  <input
                    type="number"
                    value={form.weight}
                    onChange={(e) => setForm({...form, weight: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold"
                  />
                  {validationErrors.weight && <p className="text-red-400 text-xs mt-1">{validationErrors.weight}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-400 uppercase mb-2">Bench Press (KG)</label>
                  <input
                    type="number"
                    value={form.bench}
                    onChange={(e) => setForm({...form, bench: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold"
                  />
                  {validationErrors.bench && <p className="text-red-400 text-xs mt-1">{validationErrors.bench}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-400 uppercase mb-2">Run Distance (KM)</label>
                  <input
                    type="number"
                    value={form.run}
                    onChange={(e) => setForm({...form, run: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold"
                  />
                  {validationErrors.run && <p className="text-red-400 text-xs mt-1">{validationErrors.run}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-400 uppercase mb-2">Waist (IN)</label>
                  <input
                    type="number"
                    value={form.waist}
                    onChange={(e) => setForm({...form, waist: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold"
                  />
                  {validationErrors.waist && <p className="text-red-400 text-xs mt-1">{validationErrors.waist}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-400 uppercase mb-2">Neck (IN)</label>
                  <input
                    type="number"
                    value={form.neck}
                    onChange={(e) => setForm({...form, neck: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold"
                  />
                  {validationErrors.neck && <p className="text-red-400 text-xs mt-1">{validationErrors.neck}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-400 uppercase mb-2">Height (CM)</label>
                  <input
                    type="number"
                    value={form.height}
                    onChange={(e) => setForm({...form, height: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white font-bold"
                  />
                  {validationErrors.height && <p className="text-red-400 text-xs mt-1">{validationErrors.height}</p>}
                </div>
              </div>
              
              {/* Buttons */}
              <div className="flex gap-4 justify-center">
                <button 
                  onClick={updateProgress}
                  className="bg-[#FF7222] text-black px-8 py-4 rounded-2xl font-black uppercase text-sm hover:scale-105 transition-transform"
                >
                  Update Entry
                </button>
                <button 
                  onClick={() => { setEditingEntry(null); setForm({ weight: '', bench: '', run: '', waist: '', neck: '', height: '175' }); setValidationErrors({}); }}
                  className="border border-white/20 text-white px-8 py-4 rounded-2xl font-black uppercase text-sm hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[600] flex items-center justify-center bg-black/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#111] border-2 border-red-500 p-12 rounded-[3rem] w-full max-w-lg mx-4 text-center"
            >
              <div className="text-red-400 mb-6">
                <Trash2 size={48} className="mx-auto" />
              </div>
              <h3 className="text-2xl font-[1000] italic uppercase text-white mb-4">Delete Entry</h3>
              <p className="text-gray-400 mb-8">Are you sure you want to delete this progress entry? This action cannot be undone.</p>
              
              <div className="flex gap-4 justify-center">
                <button 
                  onClick={() => deleteProgress(showDeleteConfirm.id)}
                  className="bg-red-500 text-white px-8 py-4 rounded-2xl font-black uppercase text-sm hover:scale-105 transition-transform"
                >
                  Delete
                </button>
                <button 
                  onClick={() => setShowDeleteConfirm(null)}
                  className="border border-white/20 text-white px-8 py-4 rounded-2xl font-black uppercase text-sm hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- ANALYTICS MODAL --- */}
      <AnimatePresence>
        {showAnalytics && <AnalyticsModal />}
      </AnimatePresence>
    </div>
  );
};

export default ProgressModule;