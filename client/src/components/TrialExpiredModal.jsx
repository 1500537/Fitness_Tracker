import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, CreditCard, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TrialExpiredModal = ({ user, onClose }) => {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    navigate('/pricing');
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1000] flex items-center justify-center p-4"
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
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} className="text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Trial Expired</h2>
            <p className="text-gray-400 text-sm">Your 7-day free trial has ended</p>
          </div>

          {/* Message */}
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-6">
            <p className="text-red-300 text-sm text-center">
              Your starter trial is finished. Subscribe to a plan to continue accessing all features and unlock your full potential!
            </p>
          </div>

          {/* Features */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 text-sm text-gray-300">
              <div className="w-2 h-2 bg-[#FF7222] rounded-full"></div>
              Unlimited workout tracking
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-300">
              <div className="w-2 h-2 bg-[#FF7222] rounded-full"></div>
              Advanced nutrition analytics
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-300">
              <div className="w-2 h-2 bg-[#FF7222] rounded-full"></div>
              Progress visualization
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-300">
              <div className="w-2 h-2 bg-[#FF7222] rounded-full"></div>
              Priority support
            </div>
          </div>

          {/* Buttons */}
          <div className="space-y-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleUpgrade}
              className="w-full bg-gradient-to-r from-[#FF7222] to-[#FF8C42] text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2"
            >
              <CreditCard size={20} />
              Choose Your Plan
              <ArrowRight size={20} />
            </motion.button>

            <button
              onClick={onClose}
              className="w-full text-gray-400 text-sm py-2 hover:text-white transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TrialExpiredModal;