import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertOctagon, UserMinus, ShieldCheck, Loader2 } from 'lucide-react';

const CustomPopUp = ({ isOpen, onClose, onConfirm, title, type, children, confirmText = "Confirm", loading = false }) => {
  // Dynamic icons and colors based on type
  const typeConfigs = {
    edit: { icon: <ShieldCheck className="text-blue-400" size={28} />, glow: "rgba(59, 130, 246, 0.5)", btn: "bg-blue-600" },
    ban: { icon: <AlertOctagon className="text-yellow-400" size={28} />, glow: "rgba(234, 179, 8, 0.5)", btn: "bg-yellow-600" },
    delete: { icon: <UserMinus className="text-red-400" size={28} />, glow: "rgba(239, 68, 68, 0.5)", btn: "bg-red-600" }
  };

  const config = typeConfigs[type] || typeConfigs.edit;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-hidden">
          {/* Deep Blur Overlay */}
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={onClose} 
            className="absolute inset-0 bg-black/60 backdrop-blur-[12px]"
          />

          {/* Floating Glass Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-white/[0.03] border border-white/10 backdrop-blur-[30px] rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full blur-[80px]" style={{ backgroundColor: config.glow }} />

            <div className="p-8 md:p-10">
              {/* Header */}
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/5 rounded-2xl border border-white/10 shadow-inner">
                    {config.icon}
                  </div>
                  <div>
                    <h2 className="text-xl font-black italic text-white tracking-tight leading-none uppercase">{title}</h2>
                    <p className="text-[9px] text-gray-500 font-bold tracking-[0.3em] uppercase mt-1">Authorized Session</p>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-500 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              {/* Content Area */}
              <div className="relative z-10 mb-10">
                {children}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button 
                  onClick={onClose} 
                  className="flex-1 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-400 transition-all active:scale-95"
                >
                  Discard
                </button>
                <button 
                  onClick={() => { if (!loading) onConfirm(); }}
                  disabled={loading}
                  className={`flex-1 py-4 ${config.btn} text-white shadow-2xl rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:brightness-110 active:scale-95 flex items-center justify-center gap-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />} {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CustomPopUp;