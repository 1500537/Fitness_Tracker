import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../../context/useAppContext';

const WorkoutDetail = ({ workout, onClose, onFinish }) => {
  const { drills } = useAppContext();
  const [seconds, setSeconds] = useState(0);
  const [restTimer, setRestTimer] = useState(60);
  const [isResting, setIsResting] = useState(false);
  const [currentSet, setCurrentSet] = useState(1);
  const [isLiveEditing, setIsLiveEditing] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  
  const [liveSets, setLiveSets] = useState(workout.sets);
  const [liveReps, setLiveReps] = useState(workout.reps);

  const totalSets = parseInt(liveSets) || 1;

  // Get drill media URL for the workout
  const getDrillMedia = (workoutName, workoutCategory) => {
    const drill = drills.find(d => 
      d.name.toLowerCase() === workoutName.toLowerCase() && 
      d.category.toLowerCase() === workoutCategory.toLowerCase()
    );
    return drill ? { videoUrl: drill.videoUrl, mediaType: drill.mediaType } : null;
  };

  // Resolve stream URL
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

  const drillMedia = getDrillMedia(workout.name, workout.category);

  useEffect(() => {
    let interval = null;
    if (!isLiveEditing && !isFinished) {
      interval = setInterval(() => {
        if (isResting) {
          setRestTimer((prev) => (prev > 0 ? prev - 1 : 0));
        } else {
          setSeconds((prev) => prev + 1);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isResting, restTimer, isLiveEditing, isFinished]);

  useEffect(() => {
    if (isResting && restTimer === 0) {
      setIsResting(false);
    }
  }, [restTimer]);

  const handleAction = () => {
    if (isResting) {
      setIsResting(false);
    } else {
      if (currentSet < totalSets) {
        setIsResting(true);
        setRestTimer(60);
        setCurrentSet(prev => prev + 1);
      } else {
        setIsFinished(true); // Trigger Success Animation
        setTimeout(() => {
          onFinish(workout._id, seconds);
        }, 3500); // 3.5 seconds of glory
      }
    }
  };

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 backdrop-blur-[80px] bg-black/95 overflow-hidden"
    >
      <AnimatePresence>
        {isFinished ? (
          /* --- MISSION ACCOMPLISHED ANIMATION --- */
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center z-[110] relative"
          >
            <motion.div 
              initial={{ rotate: -180, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 100 }}
              className="w-20 h-20 sm:w-32 sm:h-32 bg-green-500 rounded-full mx-auto flex items-center justify-center shadow-[0_0_50px_#22c55e]"
            >
              <span className="text-4xl sm:text-6xl text-white">✓</span>
            </motion.div>
            
            <motion.h2 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-4xl sm:text-5xl md:text-7xl font-[1000] italic uppercase tracking-tighter text-white mt-4 sm:mt-8 leading-none"
            >
              MISSION <br /> <span className="text-green-500">ACCOMPLISHED</span>
            </motion.h2>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-4 sm:mt-6 text-gray-500 font-black uppercase tracking-[0.3em] sm:tracking-[0.5em] text-[8px] sm:text-[10px]"
            >
              Neural Pathways Secured • Time: {formatTime(seconds)}
            </motion.div>
            
            {/* Background Glitch Effect for Finish */}
            <motion.div 
              animate={{ opacity: [0, 0.2, 0] }}
              transition={{ repeat: Infinity, duration: 0.2 }}
              className="absolute inset-0 bg-white z-[-1] blur-3xl rounded-full"
            />
          </motion.div>
        ) : (
          /* --- STANDARD WORKOUT HUD --- */
          <motion.div 
            initial={{ scale: 0.9, y: 50, rotateX: 10 }} animate={{ scale: 1, y: 0, rotateX: 0 }} exit={{ scale: 0.8, opacity: 0 }}
            className="bg-[#080808] border border-white/10 text-white w-full max-w-sm sm:max-w-2xl md:max-w-4xl lg:max-w-6xl rounded-[2rem] sm:rounded-[3.5rem] overflow-hidden relative shadow-[0_0_100px_rgba(255,114,34,0.1)]"
          >
            {/* Header section with Modify logic */}
            <div className="p-4 sm:p-6 md:p-8 pb-0 flex flex-col sm:flex-row justify-between items-start gap-4">
              <div className="space-y-1 flex-1">
                <div className="flex gap-1 mb-2">
                  {Array.from({ length: totalSets }).map((_, i) => (
                    <div key={i} className={`h-1 sm:h-1.5 w-4 sm:w-8 rounded-full transition-all duration-500 ${i + 1 < currentSet ? 'bg-green-500 shadow-[0_0_15px_#22c55e]' : i + 1 === currentSet ? 'bg-[#FF7222] shadow-[0_0_15px_#FF7222]' : 'bg-white/10'}`} />
                  ))}
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-[1000] italic uppercase tracking-tighter leading-none">{workout.name}</h2>
                <p className="text-[8px] sm:text-[10px] font-black text-[#FF7222] uppercase tracking-[0.2em] sm:tracking-[0.3em]">Protocol Phase: Set {currentSet}</p>
              </div>
              <button 
                onClick={() => setIsLiveEditing(!isLiveEditing)} 
                className={`px-3 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl text-[8px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${isLiveEditing ? 'bg-green-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
              >
                {isLiveEditing ? 'Confirm Intel' : 'Tactical Edit'}
              </button>
            </div>

            <div className="p-4 sm:p-6 md:p-8 pt-4 sm:pt-6 space-y-4 sm:space-y-6">
              {/* Dynamic HUD Display (Timer and Media Side by Side) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Timer Section */}
                <div className="relative aspect-square bg-gradient-to-br from-white/[0.04] to-transparent rounded-[2rem] sm:rounded-[3rem] border border-white/10 flex flex-col items-center justify-center shadow-inner overflow-hidden">
                  <AnimatePresence mode="wait">
                    {isResting ? (
                      <motion.div key="rest" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.2, opacity: 0 }} className="text-center">
                        <p className="text-[6px] sm:text-[8px] font-black text-[#FF7222] uppercase tracking-[0.4em] mb-2">Recovery Engine</p>
                        <h3 className="text-4xl sm:text-5xl md:text-6xl font-[1000] italic leading-[0.8] tabular-nums text-white tracking-tighter">{restTimer}</h3>
                        <div className="flex justify-center gap-2 mt-2 sm:mt-4">
                          <button onClick={() => setRestTimer(t => t + 15)} className="bg-white/5 hover:bg-white hover:text-black w-6 h-6 sm:w-8 sm:h-8 rounded-full font-black text-xs transition-all">+15</button>
                          <button onClick={() => setRestTimer(t => Math.max(0, t - 15))} className="bg-white/5 hover:bg-red-500 w-6 h-6 sm:w-8 sm:h-8 rounded-full font-black text-xs transition-all">-15</button>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div key="work" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 1.2, opacity: 0 }} className="text-center">
                        <p className="text-[6px] sm:text-[8px] font-black text-green-500 uppercase tracking-[0.4em] mb-2">Engagement Time</p>
                        <h3 className="text-4xl sm:text-5xl md:text-6xl font-[1000] italic leading-none tabular-nums text-white tracking-tighter">{formatTime(seconds)}</h3>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {isResting && <motion.div animate={{ opacity: [0.1, 0.2, 0.1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="absolute inset-0 bg-[#FF7222]/10" />}
                </div>

                {/* Media Section */}
                <div className="relative aspect-square bg-gradient-to-br from-white/[0.04] to-transparent rounded-[3rem] border border-white/10 overflow-hidden shadow-inner">
                  {drillMedia && drillMedia.videoUrl ? (
                    <div className="w-full h-full relative">
                      {drillMedia.mediaType === 'video' ? (
                        <video
                          src={resolveStreamUrl(drillMedia.videoUrl)}
                          autoPlay
                          muted
                          loop
                          playsInline
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src={resolveStreamUrl(drillMedia.videoUrl)}
                          className="w-full h-full object-cover"
                          alt={workout.name}
                        />
                      )}
                      {/* Gradient overlay for readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/10" />
                      {/* Media overlay label */}
                      <div className="absolute top-4 left-4 bg-black/50 px-3 py-1 rounded-full">
                        <p className="text-[8px] font-black text-white uppercase tracking-wider">Exercise Demo</p>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <div className="text-4xl mb-2">💪</div>
                        <p className="text-xs font-black uppercase tracking-wider">No Media</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats Adjustment Grid */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Sets', val: liveSets, set: setLiveSets },
                  { label: 'Reps', val: liveReps, set: setLiveReps },
                  { label: 'Load', val: workout.weight, readOnly: true },
                ].map((stat, i) => (
                  <div key={i} className="bg-white/5 p-6 rounded-[2.5rem] border border-white/5 text-center">
                    <p className="text-[9px] font-black text-gray-500 uppercase mb-2 tracking-widest">{stat.label}</p>
                    {isLiveEditing && !stat.readOnly ? (
                      <input 
                        type="number" 
                        value={stat.val} 
                        onChange={(e) => stat.set(e.target.value)}
                        className="w-full bg-white/10 rounded-xl text-center font-[1000] italic text-2xl text-[#FF7222] outline-none border border-white/10 py-1"
                      />
                    ) : (
                      <p className="text-3xl font-[1000] italic">{stat.val}{stat.label === 'Load' ? 'KG' : ''}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Primary Interaction Button */}
              <div className="flex flex-col gap-4">
                <motion.button 
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAction}
                  className={`w-full py-9 rounded-[2.5rem] font-[1000] italic uppercase text-3xl transition-all shadow-2xl ${
                    isResting 
                    ? 'bg-white text-black shadow-white/10' 
                    : 'bg-[#FF7222] text-white shadow-[#FF7222]/40'
                  }`}
                >
                  {isResting ? 'Skip Recovery →' : currentSet === totalSets ? 'Finish Mission ✓' : 'Set Complete ✓'}
                </motion.button>
                
                <button onClick={onClose} className="text-[9px] font-black uppercase opacity-20 hover:opacity-100 tracking-[0.5em] transition-all text-center py-2">_Abort Combat Session</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Cinematic Text */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-5">
        <h1 className="text-[30rem] font-black italic -rotate-12 absolute -left-20 top-0">ELITE</h1>
      </div>
    </motion.div>
  );
};

export default WorkoutDetail;