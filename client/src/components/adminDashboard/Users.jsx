import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Edit3, ShieldAlert, Zap, UserCheck, Trash2, Lock, Activity, User, Mail, ShieldCheck, Fingerprint, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { useAppContext } from '../../context/useAppContext';
import CustomPopUp from './CustomPopUp';

const Users = () => {
  const { isLoaded, userId } = useAuth();
  const {
    allUsers,
    usersLoading,
    fetchAllUsers,
    updateUser,
    deleteUser,
    toggleUserBan,
    error,
    setError
  } = useAppContext();

  // Don't render anything until authentication is loaded
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#020202] text-white p-4 md:p-10 lg:pl-[340px] pt-32 selection:bg-[#FF7222]/30 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#FF7222] mx-auto mb-4" />
          <p className="text-gray-400 font-bold">Authenticating...</p>
        </div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!userId) {
    return (
      <div className="min-h-screen bg-[#020202] text-white p-4 md:p-10 lg:pl-[340px] pt-32 selection:bg-[#FF7222]/30 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-black mb-2">Authentication Required</h2>
          <p className="text-gray-400 mb-4">Please sign in to access this section.</p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-[#FF7222] hover:bg-[#FF7222]/80 px-6 py-3 rounded-xl font-bold transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const [modal, setModal] = useState({
    isOpen: false,
    type: 'edit',
    data: null,
    title: '',
    confirmText: ''
  });

  // Fetch users on component mount
  useEffect(() => {
    fetchAllUsers();
  }, [fetchAllUsers]); // Now safe to include since it's memoized

  // Handle user actions with API calls
  const handleAction = async () => {
    if (!modal.data) return;

    setActionLoading(true);
    try {
      const { type, data } = modal;

      if (type === 'edit') {
        const result = await updateUser(data._id, {
          username: data.username,
          role: data.role
        });
        if (!result) {
          setError('Failed to update user');
          return;
        }
      } else if (type === 'ban') {
        const banReason = modal.banReason || (data.isBanned ? '' : 'Violation of community guidelines');
        const result = await toggleUserBan(data._id, !data.isBanned, banReason);
        if (!result) {
          setError('Failed to update user ban status');
          return;
        }
      } else if (type === 'delete') {
        const success = await deleteUser(data._id);
        if (!success) {
          setError('Failed to delete user');
          return;
        }
      }

      setModal({ ...modal, isOpen: false, data: null });
    } catch (err) {
      setError('An error occurred while processing your request');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredUsers = allUsers.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Loading state
  if (usersLoading) {
    return (
      <div className="min-h-screen bg-[#020202] text-white p-4 md:p-10 lg:pl-[340px] pt-32 selection:bg-[#FF7222]/30 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#FF7222] mx-auto mb-4" />
          <p className="text-gray-400 font-bold">Loading member database...</p>
        </div>
      </div>
    );
  }

  // Error state with better error categorization
  if (error) {
    const isAccessDenied = error.includes('Admin access required') || error.includes('Not Authorized') || error.includes('Authentication required');
    const isConnectionError = error.includes('Failed to fetch') || error.includes('NetworkError') || error.includes('Connection refused') || error.includes('ERR_CONNECTION_REFUSED');
    
    return (
      <div className="min-h-screen bg-[#020202] text-white p-4 md:p-10 lg:pl-[340px] pt-32 selection:bg-[#FF7222]/30 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-black mb-2">
            {isAccessDenied ? 'Access Denied' : isConnectionError ? 'Connection Error' : 'Error'}
          </h2>
          <p className="text-gray-400 mb-4">
            {isAccessDenied 
              ? 'You need administrator privileges to access this section.' 
              : isConnectionError
                ? 'Unable to connect to the server. Please check your internet connection and try again.'
                : error
            }
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => {
                setError(null);
                fetchAllUsers();
              }}
              className="bg-[#FF7222] hover:bg-[#FF7222]/80 px-6 py-3 rounded-xl font-bold transition-colors"
            >
              Try Again
            </button>
            {isAccessDenied && (
              <button
                onClick={() => window.location.href = '/'}
                className="bg-gray-600 hover:bg-gray-500 px-6 py-3 rounded-xl font-bold transition-colors"
              >
                Go Home
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020202] text-white p-4 md:p-10 lg:pl-[340px] pt-32 selection:bg-[#FF7222]/30">
      
      {/* --- PREMIUM HEADER --- */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-16 gap-8 relative z-10">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-3 mb-4">
            <Fingerprint className="text-[#FF7222]" size={18} />
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.5em]">Titan_Security_Protocol</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-[1000] italic uppercase tracking-tighter leading-none">
            MEMBER<span className="text-transparent bg-clip-text bg-gradient-to-t from-[#FF7222] to-orange-400">_BASE</span>
          </h1>
        </motion.div>

        {/* SEARCH BAR - CRYSTAL DESIGN */}
        <div className="relative group w-full lg:w-[450px]">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#FF7222] to-orange-600 rounded-[2rem] blur opacity-0 group-focus-within:opacity-20 transition duration-1000" />
          <div className="relative bg-[#0A0A0A] border border-white/5 rounded-[1.5rem] flex items-center px-6 transition-all">
            <Search className="text-gray-600 group-focus-within:text-[#FF7222] transition-colors" size={18} />
            <input 
              type="text" placeholder="Search members by identity..."
              className="bg-transparent border-none py-5 px-4 text-xs font-bold w-full focus:outline-none placeholder:text-gray-700"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* --- CARDS GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6 relative z-10">
        <AnimatePresence mode="popLayout">
          {filteredUsers.map((user) => (
            <motion.div
              layout key={user._id} 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5 }}
              className={`relative bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 transition-all duration-500 group overflow-hidden ${
                user.isBanned ? 'grayscale opacity-50' : 'hover:bg-white/[0.04] hover:border-[#FF7222]/20'
              }`}
            >
              <div className="flex items-center gap-6 mb-8">
                <div className="relative shrink-0">
                  <div className="w-20 h-20 rounded-[2rem] overflow-hidden border-2 border-white/5 shadow-2xl group-hover:border-[#FF7222]/40 transition-all">
                    <img src={user.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  </div>
                  {!user.isBanned && <div className="absolute top-0 right-0 w-4 h-4 bg-[#00FF66] border-4 border-black rounded-full shadow-[0_0_15px_#00FF66]" />}
                </div>
                <div className="min-w-0">
                  <h3 className="text-xl font-black italic uppercase tracking-tighter truncate group-hover:text-[#FF7222] transition-colors">{user.username}</h3>
                  <p className="text-[10px] font-bold text-gray-500 flex items-center gap-2 mt-1 truncate">
                    <Mail size={12} className="shrink-0" /> {user.email}
                  </p>
                </div>
              </div>

              {/* STATS CAPSULES */}
              <div className="grid grid-cols-2 gap-3 mb-8">
                <div className="bg-black/40 border border-white/5 rounded-2xl p-4 flex items-center gap-3">
                  <ShieldCheck size={16} className="text-[#FF7222]" />
                  <span className="text-[10px] font-black uppercase text-gray-400 truncate">{user.pricing}</span>
                </div>
                <div className="bg-black/40 border border-white/5 rounded-2xl p-4 flex items-center gap-3">
                  <Activity size={16} className="text-blue-500" />
                  <span className="text-[10px] font-black uppercase text-gray-400 truncate">{user.role}</span>
                </div>
              </div>

              {/* BUTTONS */}
              <div className="flex gap-2">
                <button 
                  onClick={() => setModal({ isOpen: true, type: 'edit', data: {...user}, title: 'Modify Athlete', confirmText: 'Sync Data' })}
                  className="flex-1 bg-white/5 hover:bg-white/10 py-4 rounded-xl text-[9px] font-black uppercase tracking-widest border border-white/5 transition-all flex items-center justify-center gap-2"
                >
                  <Edit3 size={14} /> Profile
                </button>
                <button 
                  onClick={() => setModal({ 
                    isOpen: true, 
                    type: 'ban', 
                    data: user, 
                    title: user.isBanned ? 'Unfreeze Account' : 'Freeze Account', 
                    confirmText: user.isBanned ? 'Unlock' : 'Lock',
                    banReason: user.isBanned ? '' : 'Violation of community guidelines'
                  })}
                  className={`flex-1 py-4 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${user.isBanned ? 'bg-green-600/10 text-green-500 border border-green-600/20' : 'bg-yellow-600/10 text-yellow-500 border border-yellow-600/20'}`}
                >
                  {user.isBanned ? <UserCheck size={14} /> : <ShieldAlert size={14} />} {user.isBanned ? 'Active' : 'Ban'}
                </button>
                <button 
                  onClick={() => setModal({ isOpen: true, type: 'delete', data: user, title: 'Terminate Account', confirmText: 'Purge' })}
                  className="w-14 bg-red-600/10 text-red-500 border border-red-600/20 rounded-xl flex items-center justify-center hover:bg-red-600 hover:text-white transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* --- GLASS MODAL SYSTEM --- */}
      <CustomPopUp 
        isOpen={modal.isOpen} 
        onClose={() => setModal({ ...modal, isOpen: false, data: null })} 
        onConfirm={handleAction} 
        title={modal.title} 
        type={modal.type} 
        confirmText={modal.confirmText}
        loading={actionLoading}
      >
        {modal.isOpen && modal.data && (
          modal.type === 'edit' ? (
            <div className="space-y-6">
              <div className="bg-white/5 border border-white/10 rounded-[1.5rem] p-6 shadow-inner">
                <label className="text-[8px] font-black text-gray-500 uppercase tracking-[0.4em] block mb-3">Athletic Alias</label>
                <div className="flex items-center gap-4">
                  <User size={20} className="text-[#FF7222]" />
                  <input 
                    value={modal.data.username || ''}
                    onChange={(e) => setModal({ ...modal, data: { ...modal.data, username: e.target.value }})}
                    className="bg-transparent border-none text-2xl font-black italic focus:outline-none w-full text-white placeholder:opacity-20"
                    placeholder="Enter Name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-black/50 p-5 rounded-2xl border border-white/5 flex flex-col gap-1 opacity-50">
                  <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Contact Identity</p>
                  <p className="text-xs font-bold text-gray-400 truncate">{modal.data.email}</p>
                </div>
                <div className="bg-black/50 p-5 rounded-2xl border border-white/5 flex flex-col gap-1 opacity-50">
                  <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest">Pricing Plan</p>
                  <p className="text-xs font-black text-[#FF7222] uppercase">{modal.data.pricing}</p>
                </div>
              </div>

              <div className="p-1">
                <label className="text-[8px] font-black text-gray-500 uppercase tracking-[0.4em] ml-2 block mb-3">Privilege Level</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                  <select 
                    value={modal.data.role}
                    onChange={(e) => setModal({ ...modal, data: { ...modal.data, role: e.target.value }})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 text-xs font-bold text-white outline-none focus:border-[#FF7222] transition-all appearance-none cursor-pointer"
                  >
                    <option value="user" className="bg-[#111]">Standard Athlete</option>
                    <option value="admin" className="bg-[#111]">Gym Administrator</option>
                  </select>
                </div>
              </div>
            </div>
          ) : modal.type === 'ban' && !modal.data?.isBanned ? (
            <div className="space-y-6">
              <div className="text-center py-4 bg-white/[0.02] rounded-3xl border border-white/5">
                <p className="text-sm text-gray-400 font-bold uppercase tracking-tight">
                  Confirming <span className="text-red-400 border-b border-red-400">{modal.type}</span> procedure for:<br/>
                  <span className="text-2xl font-black italic text-red-400 mt-4 block uppercase tracking-tighter">{modal.data?.username}</span>
                </p>
                <div className="mt-8 flex justify-center opacity-20">
                   <ShieldAlert size={40} className="animate-pulse text-red-400" />
                </div>
              </div>

              <div className="bg-red-500/5 border border-red-500/20 rounded-[1.5rem] p-6">
                <label className="text-[8px] font-black text-red-400 uppercase tracking-[0.4em] block mb-3">Ban Reason (Optional)</label>
                <div className="flex items-center gap-4">
                  <ShieldAlert className="text-red-400" size={20} />
                  <textarea
                    value={modal.banReason || ''}
                    onChange={(e) => setModal({ ...modal, banReason: e.target.value })}
                    placeholder="Enter reason for suspension..."
                    className="bg-transparent border-none text-sm font-bold focus:outline-none w-full text-white placeholder:opacity-30 resize-none"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 bg-white/[0.02] rounded-3xl border border-white/5">
              <p className="text-sm text-gray-400 font-bold uppercase tracking-tight">
                Confirming <span className="text-white border-b border-[#FF7222]">{modal.type}</span> procedure for:<br/>
                <span className="text-2xl font-black italic text-[#FF7222] mt-4 block uppercase tracking-tighter">{modal.data?.username}</span>
              </p>
              <div className="mt-8 flex justify-center opacity-20">
                 <Zap size={40} className="animate-pulse" />
              </div>
            </div>
          )
        )}
      </CustomPopUp>
    </div>
  );
};

export default Users;