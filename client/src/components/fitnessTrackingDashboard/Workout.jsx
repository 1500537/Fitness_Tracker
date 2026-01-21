import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { X, Lock, Crown, Star } from 'lucide-react';
import { eliteData } from '../../assets/assets';
import WorkoutDetail from './WorkoutDetail';
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
const NeuralConfirmModal = ({ isOpen, title, message, onConfirm, onCancel }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-md" 
          onClick={onCancel}
        />
        <motion.div 
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          className="relative bg-[#0a0a0a] border-2 border-red-500/30 p-8 md:p-12 rounded-[2.5rem] max-w-md w-full shadow-[0_0_50px_rgba(239,68,68,0.2)]"
        >
          <div className="text-red-500 text-xs font-black tracking-[0.3em] mb-4 uppercase italic">Security Protocol Required</div>
          <h2 className="text-3xl md:text-4xl font-[1000] italic uppercase tracking-tighter text-white mb-4 leading-none">{title}</h2>
          <p className="text-gray-400 font-bold text-sm mb-8 leading-relaxed">{message}</p>
          <div className="flex gap-4">
            <button onClick={onCancel} className="flex-1 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-black text-[10px] uppercase tracking-widest transition-all">Abort</button>
            <button onClick={onConfirm} className="flex-1 py-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-red-900/20 transition-all">Confirm Delete</button>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

// --- NEURAL GRID BACKGROUND EFFECT ---
const NeuralBackground = () => (
  <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden opacity-20">
    <svg width="100%" height="100%">
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,114,34,0.1)" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
  </div>
);

// --- NEURAL RADAR COMPONENT ---
const NeuralRadar = ({ workouts }) => {
  const cats = ['Strength', 'Cardio', 'Power', 'Endurance', 'Hypertrophy'];
  
  const radarData = useMemo(() => {
    return cats.map((cat, i) => {
      const count = workouts.filter(w => w.category === cat || w.tag?.includes(cat)).length;
      const value = Math.min(25 + (count * 15), 100); 
      const angle = (Math.PI * 2 * i) / cats.length;
      return {
        name: cat,
        x: 100 + value * Math.cos(angle - Math.PI / 2),
        y: 100 + value * Math.sin(angle - Math.PI / 2),
        angle: angle
      };
    });
  }, [workouts]);

  const pathData = radarData.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  return (
    <div className="relative w-full max-w-[300px] aspect-square md:max-w-[400px] lg:max-w-[450px] group shrink-0">
      <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_0_20px_rgba(255,114,34,0.3)] overflow-visible">
        {[0.2, 0.4, 0.6, 0.8, 1].map((scale, i) => (
          <circle key={i} cx="100" cy="100" r={80 * scale} fill="none" stroke="white" strokeOpacity="0.05" strokeWidth="0.5" />
        ))}
        {cats.map((_, i) => {
          const angle = (Math.PI * 2 * i) / cats.length;
          return <line key={i} x1="100" y1="100" x2={100 + 80 * Math.cos(angle - Math.PI / 2)} y2={100 + 80 * Math.sin(angle - Math.PI / 2)} stroke="white" strokeOpacity="0.05" />;
        })}
        <motion.path
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          d={pathData}
          fill="rgba(255, 114, 34, 0.15)"
          stroke="#FF7222"
          strokeWidth="2"
          transition={{ duration: 1.5, ease: "anticipate" }}
        />
        {radarData.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="2.5" fill="#fff" className="animate-pulse" />
            <text 
              x={100 + 95 * Math.cos(p.angle - Math.PI / 2)} 
              y={100 + 95 * Math.sin(p.angle - Math.PI / 2)} 
              fill="white" 
              fontSize="6" 
              fontWeight="900" 
              textAnchor="middle" 
              className="opacity-40 uppercase tracking-tighter"
            >
              {p.name}
            </text>
          </g>
        ))}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <p className="text-[8px] md:text-[10px] font-black text-[#FF7222] tracking-[0.3em] animate-pulse">NEURAL_SYNC</p>
      </div>
    </div>
  );
};

// --- 3D INTERACTIVE WRAPPER ---
const PerspectiveCard = ({ children, className }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 100, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 100, damping: 20 });
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["12deg", "-12deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-12deg", "12deg"]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className={`relative group ${className}`}
    >
      <div style={{ transform: "translateZ(60px)" }} className="h-full w-full">{children}</div>
      <div className="absolute inset-0 bg-gradient-to-tr from-[#FF7222]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[inherit] pointer-events-none" />
    </motion.div>
  );
};

const LavishSelect = ({ label, options, value, onChange, placeholder, isEditMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative space-y-2 w-full">
      <div className="flex justify-between items-center ml-4">
        <p className={`text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] opacity-60 italic ${isEditMode ? 'text-black' : 'text-white'}`}>{label}</p>
        <div className={`h-[1px] flex-1 ml-4 bg-current opacity-20`} />
      </div>
      <div 
        onClick={() => setIsOpen(!isOpen)} 
        className={`w-full backdrop-blur-xl p-5 md:p-6 rounded-[2rem] md:rounded-[2.5rem] cursor-pointer flex justify-between items-center border transition-all duration-500 shadow-2xl ${
          isEditMode ? 'bg-black/10 border-black/20 hover:border-black' : 'bg-white/5 border-white/10 hover:border-[#FF7222]/50'
        }`}
      >
        <span className={`font-[1000] italic uppercase text-xs md:text-sm tracking-widest ${!value ? 'opacity-30' : ''}`}>{value || placeholder}</span>
        <motion.span animate={{ rotate: isOpen ? 180 : 0 }} className={isEditMode ? "text-black" : "text-[#FF7222]"}>▼</motion.span>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.95 }} 
            className="absolute z-[100] w-full mt-3 bg-[#0a0a0a]/95 backdrop-blur-3xl border border-white/20 rounded-[2rem] md:rounded-[2.5rem] shadow-[0_50px_100px_rgba(0,0,0,0.9)] overflow-hidden"
          >
            <div className="max-h-64 overflow-y-auto custom-scrollbar p-3">
              {options.map((opt) => (
                <motion.div 
                  key={opt} whileHover={{ backgroundColor: '#FF7222', x: 10, color: '#fff' }} 
                  onClick={() => { onChange(opt); setIsOpen(false); }} 
                  className={`p-4 md:p-5 rounded-2xl cursor-pointer font-black italic text-[10px] md:text-[11px] uppercase tracking-widest transition-all ${value === opt ? 'bg-white/10 text-[#FF7222]' : 'text-white/60'}`}
                >
                  {opt}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const WorkoutModule = () => {
  const { 
    workouts, 
    createWorkout, 
    updateWorkout, 
    deleteWorkout, 
    completeWorkout,
    drills,
    categories,
    fetchDrills,
    fetchCategories,
    error,
    setError,
    user
  } = useAppContext();
  
  const [activeWorkout, setActiveWorkout] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [form, setForm] = useState({ name: '', sets: '', reps: '', weight: '', notes: '', category: '', tag: 'Hypertrophy' });
  const [errors, setErrors] = useState({});
  const [aiSuggestion, setAiSuggestion] = useState("AWAITING_DATA_INPUT...");
  
  // New States: Search & Delete Modal
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  // Load admin data on component mount
  useEffect(() => {
    fetchDrills().catch(err => console.error('Error fetching drills:', err));
    fetchCategories().catch(err => console.error('Error fetching categories:', err));
  }, [fetchDrills, fetchCategories]);

  // Global error handler for unhandled promise rejections
  useEffect(() => {
    const handleUnhandledRejection = (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      event.preventDefault();
    };
    
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    return () => window.removeEventListener('unhandledrejection', handleUnhandledRejection);
  }, []);

  // Set default category when categories are loaded
  useEffect(() => {
    if (categories.length > 0 && !form.category) {
      setForm(prev => ({ ...prev, category: categories[0].name }));
    }
  }, [categories, form.category]);

  // Get available exercises from admin drills based on selected category
  const validExercises = drills
    .filter(drill => drill.category === form.category)
    .map(drill => drill.name) || [];

  // Get available categories from admin data
  const availableCategories = categories.map(cat => cat.name) || [];

  // Get drill media URL for a workout
  const getDrillMedia = (workoutName, workoutCategory) => {
    const drill = drills.find(d => 
      d.name.toLowerCase() === workoutName.toLowerCase() && 
      d.category.toLowerCase() === workoutCategory.toLowerCase()
    );
    return drill ? { videoUrl: drill.videoUrl, mediaType: drill.mediaType } : null;
  };

  // --- UNIVERSAL STREAM RESOLVER ---
  const resolveStreamUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('data:')) return url;
    
    let processedUrl = url.trim();
    if (processedUrl.includes('drive.google.com') || processedUrl.includes('share.google')) {
      const driveIdMatch = processedUrl.match(/(?:\/d\/|id=|share\.google\/)([\w-]+)/);
      if (driveIdMatch && driveIdMatch[1]) {
        return `https://drive.google.com/uc?export=download&id=${driveIdMatch[1]}`;
      }
    }
    if (processedUrl.includes('dropbox.com')) {
      return processedUrl.replace('www.dropbox.com', 'dl.dropboxusercontent.com').replace('?dl=0', '');
    }
    return processedUrl;
  };

  // Filter Logic
  const filteredWorkouts = useMemo(() => {
    return workouts.filter(w => {
      const matchesSearch = w.name.toLowerCase().includes(searchQuery.toLowerCase()) || w.tag?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === 'ALL' || w.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [workouts, searchQuery, filterCategory]);

  const totalVolume = useMemo(() => {
    return (parseInt(form.sets) || 0) * (parseInt(form.reps) || 0) * (parseFloat(form.weight) || 0);
  }, [form.sets, form.reps, form.weight]);

  useEffect(() => {
    const analyze = () => {
      if (!form.name) return "READY_FOR_DEPLOYMENT...";
      const load = (parseInt(form.sets) * parseInt(form.reps)) || 0;
      if (load > 50) return "ADVICE: High volume detected. Focus on mind-muscle connection.";
      if (form.category === 'Strength' && form.weight > 80) return "WARNING: Heavy load. Ensure spotter is active.";
      return `SUGGESTION: Optimal ${form.category} parameters detected.`;
    };
    setAiSuggestion(analyze());
  }, [form]);

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const timestamp = new Date().toLocaleString();
    doc.setFillColor(20, 20, 20);
    doc.rect(0, 0, 210, 297, 'F');
    doc.setTextColor(255, 114, 34);
    doc.setFontSize(22);
    doc.text("KINETIC FLOW - MISSION REPORT", 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(`GENERATED: ${timestamp}`, 14, 28);
    doc.line(14, 32, 196, 32);

    const tableData = workouts.map(w => [
      w.name.toUpperCase(),
      w.category,
      w.sets,
      w.reps,
      `${w.weight} KG`,
      w.status.toUpperCase()
    ]);

    autoTable(doc, {
      startY: 40,
      head: [['EXERCISE', 'CATEGORY', 'SETS', 'REPS', 'WEIGHT', 'STATUS']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [255, 114, 34], textColor: [255, 255, 255], fontStyle: 'bold' },
      bodyStyles: { fillColor: [30, 30, 30], textColor: [240, 240, 240] },
      alternateRowStyles: { fillColor: [40, 40, 40] },
      margin: { top: 40 }
    });

    doc.save(`Mission_Report_${new Date().getTime()}.pdf`);
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Check if categories are loaded
    if (availableCategories.length === 0) {
      newErrors.category = 'Categories are loading. Please wait.';
      setErrors(newErrors);
      return false;
    }
    
    const name = form.name.trim();
    if (!name) {
      newErrors.name = 'Exercise name is required';
    } else if (name.length < 2 || name.length > 100) {
      newErrors.name = 'Name must be 2-100 characters';
    }
    
    if (!form.category) {
      newErrors.category = 'Category is required';
    }
    
    const sets = parseInt(form.sets);
    if (!form.sets || isNaN(sets) || sets < 1 || sets > 20) {
      newErrors.sets = 'Sets must be 1-20';
    }
    
    const reps = parseInt(form.reps);
    if (!form.reps || isNaN(reps) || reps < 1 || reps > 100) {
      newErrors.reps = 'Reps must be 1-100';
    }
    
    const weight = parseFloat(form.weight);
    if (form.weight && (isNaN(weight) || weight < 0 || weight > 1000)) {
      newErrors.weight = 'Weight must be 0-1000 kg';
    }
    
    if (form.notes && form.notes.length > 500) {
      newErrors.notes = 'Notes max 500 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    let sanitizedValue = value;
    if (field === 'name' || field === 'notes') {
      sanitizedValue = value.replace(/[<>\"'&]/g, ''); // Basic XSS prevention
    }
    setForm(prev => ({ ...prev, [field]: sanitizedValue }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleAction = async () => {
    if (!validateForm()) {
      console.log('Validation failed:', errors);
      return;
    }
    
    console.log('Creating workout with data:', form);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);

    try {
      const workoutData = { 
        ...form, 
        sets: parseInt(form.sets), 
        reps: parseInt(form.reps), 
        weight: parseFloat(form.weight) || 0 
      };
      
      let result;
      if (editingId) {
        result = await updateWorkout(editingId, workoutData);
        setEditingId(null);
      } else {
        result = await createWorkout(workoutData);
      }
      
      if (result && result.success) {
        console.log('Workout operation successful:', result);
        setForm({ 
          name: '', 
          sets: '', 
          reps: '', 
          weight: '', 
          notes: '', 
          category: availableCategories[0] || '', 
          tag: 'Hypertrophy' 
        });
      } else {
        console.error('Workout operation failed:', result?.message);
        setError(result?.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Error in workout operation:', error);
      setError('Operation failed. Please try again.');
    }
  };

  const confirmDeletion = async () => {
    if (deleteTargetId) {
      try {
        const result = await deleteWorkout(deleteTargetId);
        console.log('Workout deleted successfully:', result.message);
      } catch (error) {
        console.error('Delete error caught:', error);
      } finally {
        setDeleteTargetId(null);
      }
    }
  };

  return (
    <div className="relative space-y-8 md:space-y-12 pb-24 select-none bg-[#050505] text-white min-h-screen px-4 md:px-8 max-w-[1600px] mx-auto overflow-x-hidden">
      <NeuralBackground />
      
      {/* Custom Delete Modal */}
      <NeuralConfirmModal 
        isOpen={!!deleteTargetId}
        title="Terminate Mission?"
        message="This operation will permanently purge the selected combat log from the neural database. This cannot be undone."
        onConfirm={confirmDeletion}
        onCancel={() => setDeleteTargetId(null)}
      />

      {/* --- TERMINAL OVERLAY EFFECT --- */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />

      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[400] flex items-center justify-center bg-black/90 backdrop-blur-xl pointer-events-none p-6"
          >
            <motion.div 
              initial={{ scale: 0.5, y: 100 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 1.5, opacity: 0 }}
              className="bg-[#FF7222] p-12 md:p-24 rounded-[3rem] md:rounded-[5rem] text-center shadow-[0_0_200px_rgba(255,114,34,0.4)] border-4 md:border-8 border-white/20 w-full max-w-2xl"
            >
              <h2 className="text-6xl md:text-9xl font-[1000] italic uppercase tracking-tighter text-white">SYNCED</h2>
              <div className="h-2 w-full bg-black/20 mt-4 overflow-hidden rounded-full">
                <motion.div initial={{ x: '-100%' }} animate={{ x: '100%' }} transition={{ duration: 1.5, repeat: Infinity }} className="h-full w-1/2 bg-white" />
              </div>
              <p className="text-[10px] md:text-sm font-black tracking-[1em] md:tracking-[1.5em] text-black mt-8">DATA DEPLOYMENT SUCCESSFUL</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- HEADER --- */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-10 pt-10 relative z-20">
        <div className="space-y-4 text-center lg:text-left w-full">
          <motion.h1 initial={{ x: -50 }} animate={{ x: 0 }} className="text-5xl md:text-8xl lg:text-9xl font-[1000] italic uppercase tracking-tighter leading-none">
            Neural <span className="text-[#FF7222]">OS</span>
          </motion.h1>
          <div className="flex flex-col sm:flex-row gap-4 items-center lg:items-start">
            <div className="bg-white/5 border-l-4 border-[#FF7222] p-4 backdrop-blur-3xl rounded-r-2xl max-w-md">
              <p className="text-[10px] font-black tracking-widest text-[#FF7222] uppercase">AI Terminal / Suggestions</p>
              <p className="text-xs md:text-sm font-bold italic opacity-80 animate-pulse">{aiSuggestion}</p>
            </div>
            <motion.button 
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={handleExportPDF}
              className="bg-white/10 hover:bg-white hover:text-black border border-white/20 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all h-fit"
            >
              📥 Export Report (.PDF)
            </motion.button>
          </div>
        </div>
        <NeuralRadar workouts={workouts} />
      </div>

      <AnimatePresence>{activeWorkout && <WorkoutDetail workout={activeWorkout} onClose={() => setActiveWorkout(null)} onFinish={completeWorkout} />}</AnimatePresence>

      {/* Error Display */}
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-24 right-8 z-[200] bg-red-600/90 backdrop-blur-xl border border-red-500/30 rounded-2xl p-6 max-w-md shadow-2xl"
        >
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
            <p className="text-[10px] font-black uppercase text-red-200 tracking-widest">System Error</p>
            <button onClick={() => setError(null)} className="ml-auto text-red-200 hover:text-white">
              <X size={16} />
            </button>
          </div>
          <p className="text-white font-bold text-sm mt-2">{error}</p>
        </motion.div>
      )}

      {/* --- HUD STATS --- */}
      <PricingLock tier="starter" feature="Basic Workout Statistics">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 relative z-20">
          {[
            { label: 'Active Missions', val: workouts.length, color: 'text-[#FF7222]', icon: '◈' },
            { label: 'Cleared Ops', val: workouts.filter(v => v.status === 'completed').length, color: 'text-green-400', icon: '✓' },
            { label: 'Neural Load', val: 'MAX', color: 'text-red-500', icon: '⚠' },
            { label: 'Sync Status', val: 'OPTML', color: 'text-blue-400', icon: '🌐' }
          ].map((item, i) => (
            <motion.div key={i} whileHover={{ y: -5 }} className="bg-white/5 border border-white/10 p-5 md:p-8 rounded-[2rem] md:rounded-[3rem] backdrop-blur-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-6 text-2xl md:text-4xl opacity-10 font-black">{item.icon}</div>
              <p className="text-[8px] md:text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] md:tracking-[0.4em] mb-2 md:mb-4">{item.label}</p>
              <div className="flex items-baseline gap-2">
                  <span className={`text-2xl md:text-4xl font-[1000] italic uppercase tracking-tighter ${item.color}`}>{item.val}</span>
                  <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 2 }} className={`w-1.5 h-1.5 rounded-full bg-current ${item.color}`} />
              </div>
            </motion.div>
          ))}
        </div>
      </PricingLock>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 md:gap-12 relative z-20">
        <div className="xl:col-span-7 space-y-8 order-2 xl:order-1">
          {/* SEARCH & FILTER AREA */}
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-end gap-6">
              <h2 className="text-5xl md:text-7xl font-[1000] italic uppercase tracking-tighter leading-none">Combat <span className="text-[#FF7222]">Logs</span></h2>
              <div className="flex-1 w-full md:w-auto relative group">
                <input 
                  type="text" 
                  placeholder="SEARCH LOGS..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 focus:border-[#FF7222]/50 p-4 pl-12 rounded-2xl outline-none font-black italic text-xs tracking-widest transition-all"
                />
                <span className="absolute left-5 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:text-[#FF7222] group-focus-within:opacity-100 transition-all">🔍</span>
              </div>
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              {['ALL', ...availableCategories].map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-6 py-2 rounded-full text-[9px] font-[1000] italic uppercase tracking-widest border transition-all whitespace-nowrap ${
                    filterCategory === cat ? 'bg-[#FF7222] border-[#FF7222] text-white shadow-[0_0_15px_rgba(255,114,34,0.4)]' : 'bg-white/5 border-white/10 text-white/40 hover:border-white/20'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          
          <div className="space-y-6 md:space-y-8 max-h-[600px] md:max-h-[900px] overflow-y-auto custom-scrollbar pr-2 md:pr-6">
            <AnimatePresence mode="popLayout">
              {filteredWorkouts.length > 0 ? filteredWorkouts.map((w) => {
                const drillMedia = getDrillMedia(w.name, w.category);
                return (
                <PerspectiveCard key={w._id} className="w-full">
                  <motion.div 
                    layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
                    className={`group relative p-8 md:p-12 rounded-[3rem] md:rounded-[4.5rem] border-2 transition-all duration-700 overflow-hidden ${
                        w.status === 'completed' ? 'bg-green-500/5 border-green-500/10 grayscale opacity-60' : 'bg-white/5 border-white/10 hover:border-[#FF7222] shadow-2xl'
                    }`}
                  >
                    {/* Background Media */}
                    {drillMedia && drillMedia.videoUrl && (
                      <div className="absolute inset-0 rounded-[3rem] md:rounded-[4.5rem] overflow-hidden">
                        {drillMedia.mediaType === 'video' ? (
                          <video
                            src={resolveStreamUrl(drillMedia.videoUrl)}
                            autoPlay
                            muted
                            loop
                            playsInline
                            className="w-full h-full object-cover opacity-40 group-hover:opacity-50 transition-opacity duration-300"
                          />
                        ) : (
                          <img
                            src={resolveStreamUrl(drillMedia.videoUrl)}
                            className="w-full h-full object-cover opacity-40 group-hover:opacity-50 transition-opacity duration-300"
                            alt={w.name}
                          />
                        )}
                        {/* Gradient overlay for readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
                      </div>
                    )}
                    
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 relative z-10">
                      <div className="flex-1 w-full space-y-4 md:space-y-6">
                        <div className="flex items-center gap-3">
                          <span className="text-[8px] font-black bg-[#FF7222] text-white px-4 py-1.5 rounded-full uppercase italic tracking-widest">{w.category}</span>
                          <span className={`text-[8px] font-black uppercase italic tracking-[0.2em] ${w.status === 'completed' ? 'text-green-400' : 'text-gray-500'}`}>// {w.tag}</span>
                        </div>
                        <h3 className={`text-4xl md:text-6xl font-[1000] italic uppercase tracking-tighter leading-none ${w.status === 'completed' ? 'line-through opacity-40' : ''} text-white drop-shadow-lg`}>{w.name}</h3>
                        <div className="flex gap-8 md:gap-12 pt-2">
                            <div className="space-y-1"><p className="text-[8px] font-black text-gray-300 uppercase">Sets</p><p className="text-xl md:text-3xl font-[1000] italic text-white">{w.sets}</p></div>
                            <div className="space-y-1"><p className="text-[8px] font-black text-gray-300 uppercase">Reps</p><p className="text-xl md:text-3xl font-[1000] italic text-white">{w.reps}</p></div>
                            <div className="space-y-1"><p className="text-[8px] font-black text-[#FF7222] uppercase">Load</p><p className="text-xl md:text-3xl font-[1000] italic text-white">{w.weight}<span className="text-[10px] ml-1 opacity-50">KG</span></p></div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 w-full lg:w-auto">
                        {w.status !== 'completed' && (
                          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setActiveWorkout(w)} 
                            className="flex-1 lg:flex-none bg-[#FF7222] text-white h-16 md:h-24 px-8 md:px-16 rounded-[1.5rem] md:rounded-[2.5rem] font-[1000] italic uppercase text-sm md:text-lg shadow-xl"
                          >ENGAGE</motion.button>
                        )}
                        <div className="flex lg:flex-col gap-2">
                          <button onClick={() => {setEditingId(w._id); setForm(w); window.scrollTo({top: 0, behavior: 'smooth'});}} className="w-12 h-12 md:w-16 md:h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center hover:bg-white hover:text-black transition-all border border-white/10">✎</button>
                          <button onClick={() => setDeleteTargetId(w._id)} className="w-12 h-12 md:w-16 md:h-16 bg-red-500/20 text-red-500 rounded-2xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all border border-red-500/20 backdrop-blur-sm">✕</button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </PerspectiveCard>
              )}) : (
                <div className="py-20 text-center opacity-30">
                   <p className="text-4xl font-[1000] italic uppercase tracking-tighter">No Neural Logs Found</p>
                   <p className="text-[10px] font-black tracking-[0.5em] mt-2">ADJUST FILTER PARAMETERS</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="xl:col-span-5 order-1 xl:order-2">
          <PricingLock tier="starter" feature="Workout Creation & Management">
            <PerspectiveCard className="sticky top-10 w-full">
            <motion.div 
              layout className={`p-8 md:p-14 rounded-[3rem] md:rounded-[5.5rem] relative overflow-hidden transition-all duration-1000 shadow-2xl border-2 ${
                editingId ? 'bg-white text-black border-white' : 'bg-[#0f0f0f] text-white border-white/10'
              }`}
            >
              <div className="relative z-10 space-y-8 md:space-y-10">
                <div className="space-y-3">
                    <h2 className="text-5xl md:text-8xl font-[1000] italic uppercase leading-[0.8] tracking-tighter">
                      {editingId ? 'REWRITE\nCORE' : 'DEPLOY\nFORCE'}
                    </h2>
                    <motion.div initial={{ width: 0 }} animate={{ width: 80 }} className={`h-1.5 md:h-2 rounded-full ${editingId ? 'bg-black' : 'bg-[#FF7222]'}`} />
                </div>

                <div className="space-y-6">
                  {/* --- TONNAGE INDICATOR --- */}
                  <div className={`p-4 rounded-3xl border ${editingId ? 'border-black/10 bg-black/5' : 'border-white/10 bg-white/5'}`}>
                    <p className="text-[8px] font-black uppercase tracking-[0.2em] opacity-50 mb-1">Estimated Neural Tonnage</p>
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-[1000] italic">{totalVolume}</span>
                      <span className="text-[10px] font-black opacity-50 mb-1">KG TOTAL</span>
                    </div>
                  </div>

                  {/* Error Display */}
                  {Object.keys(errors).length > 0 && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-6">
                      <p className="text-red-400 text-xs font-black uppercase mb-2">Validation Errors:</p>
                      {Object.entries(errors).map(([field, error]) => (
                        <p key={field} className="text-red-300 text-xs">
                          <span className="font-black uppercase">{field}:</span> {error}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Loading State */}
                  {availableCategories.length === 0 && (
                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 mb-6">
                      <p className="text-yellow-400 text-xs font-black uppercase">Loading admin data...</p>
                    </div>
                  )}

                  <LavishSelect 
                    isEditMode={editingId} 
                    label="Sector Category" 
                    options={availableCategories} 
                    value={form.category} 
                    onChange={(val) => handleInputChange('category', val)} 
                  />
                  <LavishSelect 
                    isEditMode={editingId} 
                    label="Unit Designation" 
                    options={validExercises} 
                    value={form.name} 
                    placeholder="SELECT UNIT" 
                    onChange={(val) => handleInputChange('name', val)} 
                  />
                  
                  <div className="grid grid-cols-3 gap-3 md:gap-5">
                    {['sets', 'reps', 'weight'].map((key) => (
                      <div key={key} className="space-y-2">
                        <p className="text-[8px] md:text-[10px] font-[1000] uppercase opacity-50 text-center italic tracking-widest">{key}</p>
                        <input 
                          type="number"
                          value={form[key]} onChange={(e) => handleInputChange(key, e.target.value)} placeholder="00" 
                          className={`w-full p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] outline-none font-[1000] text-center text-xl md:text-3xl transition-all border-2 ${
                            editingId ? 'bg-black/5 border-transparent focus:border-black text-black' : 'bg-white/5 border-transparent focus:border-[#FF7222]/50 text-white'
                          } ${errors[key] ? 'border-red-500' : ''}`} 
                        />
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <input 
                        value={form.tag} onChange={(e) => handleInputChange('tag', e.target.value)} placeholder="NEURAL TAG (e.g. UPPER BODY)" 
                        className={`w-full p-5 md:p-7 rounded-[1.5rem] md:rounded-[2.5rem] outline-none font-black italic uppercase text-[9px] md:text-[11px] tracking-widest border transition-all ${
                            editingId ? 'bg-black/5 border-black/10 focus:border-black' : 'bg-white/5 border-white/10 focus:border-[#FF7222]'
                        }`} 
                    />
                    <textarea 
                        value={form.notes} onChange={(e) => handleInputChange('notes', e.target.value)} placeholder="MISSION INTEL & OBJECTIVES..." 
                        className={`w-full p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] outline-none h-24 md:h-32 resize-none font-bold italic text-xs border transition-all ${
                            editingId ? 'bg-black/5 border-black/10 focus:border-black' : 'bg-white/5 border-white/10 focus:border-[#FF7222]'
                        }`} 
                    />
                  </div>

                  <motion.button 
                    whileHover={{ scale: 1.02 }} 
                    whileTap={{ scale: 0.97 }} 
                    onClick={handleAction}
                    disabled={availableCategories.length === 0 || !form.category || !form.name}
                    className={`w-full py-8 md:py-10 rounded-[2.5rem] md:rounded-[3.5rem] font-[1000] italic uppercase text-xl md:text-3xl transition-all ${
                      editingId ? 'bg-black text-white' : 'bg-[#FF7222] text-white shadow-2xl'
                    } ${(availableCategories.length === 0 || !form.category || !form.name) ? 'opacity-50 cursor-not-allowed' : 'hover:brightness-110'}`}
                  >
                    {availableCategories.length === 0 ? 'LOADING DATA...' : editingId ? 'OVERWRITE MISSION ✓' : 'EXECUTE SEQUENCE +'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </PerspectiveCard>
          </PricingLock>
        </div>
      </div>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #FF7222; border-radius: 10px; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        input[type=number]::-webkit-inner-spin-button, 
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        @media (max-width: 768px) {
          .tracking-tighter { letter-spacing: -0.05em; }
        }
      `}</style>
    </div>
  );
};

export default WorkoutModule;