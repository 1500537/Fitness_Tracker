import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, Clock, ShieldX } from 'lucide-react';
import { useClerk } from '@clerk/clerk-react';

const BanAlert = ({ banAlert, onClose }) => {
  const { signOut } = useClerk();
  const [countdown, setCountdown] = useState(3);

  console.log('🚫 BanAlert rendering with:', banAlert);

  useEffect(() => {
    if (banAlert) {
      // Countdown timer
      const countdownTimer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            handleLogout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(countdownTimer);
    }
  }, [banAlert]);

  const handleLogout = () => {
    signOut();
    onClose();
  };

  if (!banAlert) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-hidden"
      >
        {/* Deep Blur Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-red-900/80 backdrop-blur-[20px]"
        />

        {/* Ban Alert Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg bg-gradient-to-br from-red-900/90 to-black/90 border border-red-500/30 backdrop-blur-[30px] rounded-[2.5rem] shadow-[0_20px_50px_rgba(239,68,68,0.5)] overflow-hidden"
        >
          {/* Animated Background Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent" />
          <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full blur-[80px] bg-red-500/30" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full blur-[80px] bg-red-600/20" />

          <div className="p-8 md:p-10 relative z-10">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-2xl shadow-inner">
                  <ShieldX className="text-red-400" size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-black italic text-white tracking-tight leading-none uppercase">Account Suspended</h2>
                  <p className="text-[10px] text-red-300 font-bold tracking-[0.3em] uppercase mt-1">Security Protocol Activated</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-red-500/20 rounded-full transition-colors text-red-300 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="mb-8">
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 mb-6">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="text-red-400 mt-1 flex-shrink-0" size={24} />
                  <div>
                    <h3 className="text-lg font-black text-white mb-2">Access Revoked</h3>
                    <p className="text-red-200 font-medium leading-relaxed">
                      {banAlert.reason || banAlert.message}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-black/30 border border-red-500/10 rounded-2xl p-4">
                <div className="flex items-center gap-3 text-red-300">
                  <ShieldX size={16} />
                  <span className="text-sm font-bold">
                    Automatic logout in <span className="text-white">{countdown} seconds</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="flex justify-center">
              <button
                onClick={handleLogout}
                className="px-8 py-4 bg-red-600 hover:bg-red-500 text-white shadow-2xl rounded-2xl text-sm font-black uppercase tracking-widest transition-all hover:brightness-110 active:scale-95 flex items-center gap-3"
              >
                <ShieldX size={18} />
                Logout Now
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BanAlert;
