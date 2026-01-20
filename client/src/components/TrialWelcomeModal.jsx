import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Zap, User } from 'lucide-react';

const TrialWelcomeModal = ({ user, onClose }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 7, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!user?.trialEnd) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(user.trialEnd).getTime();
      const distance = end - now;

      if (distance > 0) {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [user?.trialEnd]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1000] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="bg-gradient-to-br from-[#050505] to-[#0a0a0a] border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-[#FF7222]/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <User size={32} className="text-[#FF7222]" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Welcome, {user?.username}!</h2>
            <p className="text-gray-400 text-sm">Your 7-day free trial has started</p>
          </div>

          {/* Timer */}
          <div className="bg-white/5 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Clock size={20} className="text-[#FF7222]" />
              <span className="text-white font-semibold">Trial Time Remaining</span>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-[#FF7222]/10 rounded-lg p-3">
                <div className="text-2xl font-bold text-[#FF7222]">{timeLeft.days}</div>
                <div className="text-xs text-gray-400">Days</div>
              </div>
              <div className="bg-[#FF7222]/10 rounded-lg p-3">
                <div className="text-2xl font-bold text-[#FF7222]">{timeLeft.hours}</div>
                <div className="text-xs text-gray-400">Hours</div>
              </div>
              <div className="bg-[#FF7222]/10 rounded-lg p-3">
                <div className="text-2xl font-bold text-[#FF7222]">{timeLeft.minutes}</div>
                <div className="text-xs text-gray-400">Min</div>
              </div>
              <div className="bg-[#FF7222]/10 rounded-lg p-3">
                <div className="text-2xl font-bold text-[#FF7222]">{timeLeft.seconds}</div>
                <div className="text-xs text-gray-400">Sec</div>
              </div>
            </div>
          </div>

          {/* Message */}
          <div className="text-center mb-6">
            <p className="text-gray-300 text-sm leading-relaxed">
              Explore all features and start your fitness journey. Upgrade anytime to unlock premium benefits!
            </p>
          </div>

          {/* Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="w-full bg-gradient-to-r from-[#FF7222] to-[#FF8C42] text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2"
          >
            <Zap size={20} />
            Start Your Journey
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TrialWelcomeModal;