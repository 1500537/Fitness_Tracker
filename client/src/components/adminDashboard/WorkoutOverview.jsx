import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Dumbbell, Plus, Edit3, Trash2, Video, Tag, 
  PlayCircle, FolderPlus, Check, X, 
  Search, ChevronDown, MonitorPlay, AlertCircle, Link2, Upload, RefreshCcw
} from 'lucide-react';
import { useAppContext } from '../../context/useAppContext';
import CustomPopUp from './CustomPopUp';

const WorkoutOverview = () => {
  const {
    drills,
    categories,
    drillsLoading,
    categoriesLoading,
    fetchDrills,
    fetchCategories,
    createDrill,
    updateDrill,
    deleteDrill,
    createCategory,
    updateCategory,
    deleteCategory,
    uploadDrillMedia,
    error,
    setError
  } = useAppContext();

  const [isAddingCat, setIsAddingCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [modal, setModal] = useState({ isOpen: false, type: 'edit', data: null });
  const [searchTerm, setSearchTerm] = useState('');
  const [uploading, setUploading] = useState(false);
  
  // Ref for hidden file input
  const fileInputRef = useRef(null);

  const pricingTiers = ["Starter", "Pro Performance", "Elite Pro"];

  // Load data on component mount
  useEffect(() => {
    fetchDrills();
    fetchCategories();
  }, [fetchDrills, fetchCategories]);

  // --- UNIVERSAL STREAM RESOLVER ---
  const resolveStreamUrl = (url) => {
    if (!url) return '';
    // Agar URL base64 (file upload) hai toh direct return karo
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

  // --- FILE UPLOAD HANDLER ---
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov'];
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Only images (JPEG, PNG, GIF, WebP) and videos (MP4, WebM, OGG, AVI, MOV) are allowed.');
      return;
    }

    // Check file size (100MB for videos, 10MB for images)
    const isVideo = file.type.startsWith('video/');
    const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024;

    if (file.size > maxSize) {
      setError(`File too large. Maximum size is ${isVideo ? '100MB' : '10MB'}.`);
      return;
    }

    setUploading(true);
    setError(null); // Clear any previous errors

    try {
      const result = await uploadDrillMedia(file);
      if (result.success) {
        // Update modal data with uploaded media
        setModal(prev => ({
          ...prev,
          data: {
            ...prev.data,
            videoUrl: result.videoUrl,
            mediaType: result.mediaType,
            mediaPublicId: result.mediaPublicId,
            thumbnailUrl: result.thumbnailUrl || null // For video thumbnails
          }
        }));

        // Clear file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        setError(result.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError('Upload failed. Please check your connection and try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleAction = async () => {
    const { type, data } = modal;
    if (!data || !data.name) return;

    try {
      let result;
      if (type === 'add') {
        result = await createDrill(data);
      } else if (type === 'edit') {
        result = await updateDrill(data._id, data);
      } else if (type === 'delete') {
        result = await deleteDrill(data._id);
      }

      if (result && result.success) {
        setModal({ isOpen: false, type: 'edit', data: null });
        if (result.message) {
          alert(result.message);
        }
      } else {
        alert(result?.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Action error:', error);
      alert('Operation failed. Please try again.');
    }
  };

  const addNewCategory = async () => {
    if (!newCatName.trim()) return;

    try {
      const result = await createCategory({ name: newCatName.trim() });
      if (result.success) {
        setModal({ ...modal, data: { ...modal.data, category: result.category.name } });
        setNewCatName('');
        setIsAddingCat(false);
      } else {
        alert(result.message || 'Failed to create category');
      }
    } catch (error) {
      console.error('Category creation error:', error);
      alert('Failed to create category. Please try again.');
    }
  };

  const openModal = (type, data = null) => {
    setModal({
      isOpen: true,
      type,
      data: data ? { ...data } : { name: '', category: categories.length > 0 ? categories[0].name : '', tag: '', notes: '', videoUrl: '', pricing: 'Starter' },
      title: type === 'add' ? 'INITIALIZE NEW DRILL' : type === 'edit' ? 'RECALIBRATE WORKOUT' : 'PURGE PROTOCOL',
      confirmText: type === 'add' ? 'DEPLOY' : type === 'edit' ? 'SYNC' : 'TERMINATE'
    });
  };

  const filteredWorkouts = drills.filter(drill => 
    drill.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    drill.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#020202] text-white">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#FF7222]/5 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 p-4 sm:p-8 lg:p-12 lg:pl-[340px] pt-24 sm:pt-32">
        {/* HEADER */}
        <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-10 mb-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-4 mb-6">
              <span className="h-[2px] w-12 bg-[#FF7222]" />
              <span className="text-[10px] font-black uppercase tracking-[0.6em] text-gray-500">Titan_Vault_v6.0</span>
            </div>
            <h1 className="text-5xl sm:text-7xl lg:text-9xl font-[1000] italic uppercase tracking-tighter leading-[0.85] mb-4">
              COMMAND<span className="text-[#FF7222]">_</span><br/>CENTER
            </h1>
          </motion.div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
            <div className="relative w-full sm:w-80 group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="text" placeholder="SEARCH DRILLS..." value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-[10px] font-black uppercase outline-none focus:border-[#FF7222]"
              />
            </div>
            <button onClick={() => openModal('add')} className="w-full sm:w-auto bg-[#FF7222] text-black px-10 py-5 rounded-2xl font-black uppercase text-[10px] flex items-center justify-center gap-4 hover:brightness-110 active:scale-95 transition-all">
              <Plus size={20} strokeWidth={4} /> ADD DRILL
            </button>
          </div>
        </header>

        {/* LOADING STATE */}
        {(drillsLoading || categoriesLoading) && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-[#FF7222] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-[10px] font-black uppercase text-gray-500">Loading Data...</p>
            </div>
          </div>
        )}

        {/* ERROR STATE */}
        {error && (
          <div className="bg-red-600/10 border border-red-600/20 rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-3">
              <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-[10px] font-black uppercase text-red-400 mb-1">System Error</p>
                <p className="text-[11px] font-bold text-red-300">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-500 hover:text-red-400 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {/* GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-10">
          <AnimatePresence mode="popLayout">
            {filteredWorkouts.map((item) => (
              <motion.div layout key={item._id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="group relative">
                <div className="bg-[#080808] border border-white/5 hover:border-[#FF7222]/30 rounded-[3rem] p-8 sm:p-10 h-full flex flex-col transition-all">
                  <div className="flex justify-between items-center mb-10">
                    <div className="px-5 py-2 bg-white/5 rounded-full text-[9px] font-black uppercase text-[#FF7222]">{item.category}</div>
                    <span className="text-[9px] font-black text-gray-600 uppercase">{item.pricing}</span>
                  </div>
                  <h3 className="text-3xl font-[1000] italic uppercase mb-6">{item.name}</h3>
                  <div className="flex items-center gap-3 mb-10 opacity-60"><Tag size={14} className="text-[#FF7222]" /><span className="text-[10px] font-black uppercase">{item.tag || "GENERAL"}</span></div>
                  <div className="flex gap-4 mt-auto">
                    <button onClick={() => openModal('edit', item)} className="flex-1 bg-white/5 hover:bg-white text-black py-5 rounded-2xl text-[9px] font-black uppercase flex items-center justify-center gap-3"><Edit3 size={16} /> MODIFY</button>
                    <button onClick={() => openModal('delete', item)} className="w-16 bg-red-600/10 text-red-500 border border-red-600/20 rounded-2xl flex items-center justify-center hover:bg-red-600 hover:text-white transition-all"><Trash2 size={20} /></button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* MODAL */}
        <CustomPopUp isOpen={modal.isOpen} onClose={() => setModal({ ...modal, isOpen: false, data: null })} onConfirm={handleAction} title={modal.title} type={modal.type} confirmText={modal.confirmText}>
          {modal.isOpen && modal.data && (
            modal.type === 'delete' ? (
              <div className="text-center py-10"><Trash2 size={40} className="text-red-500 mx-auto mb-6"/><h4 className="text-3xl font-black italic uppercase text-white">{modal.data.name}</h4></div>
            ) : (
              <div className="flex flex-col gap-8 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
                
                {/* NAME */}
                <div className="w-full space-y-4">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest italic flex items-center gap-2"><Dumbbell size={14} className="text-[#FF7222]" /> Drill Name</label>
                  <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 focus-within:border-[#FF7222]">
                    <input value={modal.data.name} onChange={(e) => setModal({ ...modal, data: { ...modal.data, name: e.target.value }})} className="bg-transparent border-none w-full outline-none font-black text-2xl italic text-white uppercase" placeholder="ENTER DRILL NAME..."/>
                  </div>
                </div>

                {/* INFO GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex justify-between px-1"><label className="text-[9px] font-black text-gray-500 uppercase">Category</label>
                    {!isAddingCat && <button onClick={() => setIsAddingCat(true)} className="text-[9px] font-black text-[#FF7222] uppercase">+ New</button>}</div>
                    {isAddingCat ? (
                      <div className="flex gap-2">
                        <input value={newCatName} onChange={(e) => setNewCatName(e.target.value)} className="w-full bg-white/[0.05] border border-[#FF7222] rounded-xl p-4 text-[10px] text-white uppercase font-black" placeholder="NEW..."/>
                        <button onClick={addNewCategory} className="bg-[#FF7222] text-black px-4 rounded-xl"><Check size={18}/></button>
                      </div>
                    ) : (
                      <select value={modal.data.category} onChange={(e) => setModal({ ...modal, data: { ...modal.data, category: e.target.value }})} className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-5 text-[10px] font-black uppercase text-white outline-none">
                        {categories.map(cat => <option key={cat._id} value={cat.name} className="bg-[#111]">{cat.name}</option>)}
                      </select>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/[0.03] p-4 rounded-xl border border-white/10">
                      <label className="text-[8px] font-black text-gray-500 uppercase block mb-2 italic">Tier</label>
                      <select value={modal.data.pricing} onChange={(e) => setModal({ ...modal, data: { ...modal.data, pricing: e.target.value }})} className="bg-transparent w-full text-[10px] font-black text-[#FF7222] outline-none uppercase">
                        {pricingTiers.map(tier => <option key={tier} value={tier} className="bg-[#111]">{tier}</option>)}
                      </select>
                    </div>
                    <div className="bg-white/[0.03] p-4 rounded-xl border border-white/10">
                      <label className="text-[8px] font-black text-gray-500 uppercase block mb-2 italic">Tag</label>
                      <input value={modal.data.tag} onChange={(e) => setModal({ ...modal, data: { ...modal.data, tag: e.target.value }})} className="bg-transparent w-full text-[10px] font-black text-white outline-none uppercase" placeholder="TAG" />
                    </div>
                  </div>
                </div>

                {/* --- SMART VISUAL UPLINK (LINK OR FILE) --- */}
                <div className="w-full bg-white/[0.02] border border-white/5 rounded-3xl p-6 space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <label className="text-[10px] font-black text-gray-500 uppercase italic flex items-center gap-2">
                      <MonitorPlay size={16} className="text-blue-500" /> Intelligence Visual Feed
                    </label>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => fileInputRef.current.click()} 
                        disabled={uploading}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[9px] font-black transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                          uploading 
                            ? 'bg-gray-600/10 text-gray-500 cursor-not-allowed' 
                            : 'bg-blue-600/10 hover:bg-blue-600 text-blue-500 hover:text-white'
                        }`}
                      >
                        {uploading ? (
                          <>
                            <div className="w-3 h-3 border border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            UPLOADING...
                          </>
                        ) : (
                          <>
                            <Upload size={14}/> UPLOAD FILE
                          </>
                        )}
                      </button>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileUpload} 
                        accept="image/*,video/*"
                        className="hidden" 
                        disabled={uploading}
                      />
                      {modal.data.videoUrl && (
                        <button 
                          onClick={() => setModal({...modal, data: {...modal.data, videoUrl: '', mediaType: null, mediaPublicId: '', thumbnailUrl: ''}})} 
                          className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                          disabled={uploading}
                        >
                          <RefreshCcw size={14}/>
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="relative group">
                    <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={14} />
                    <input 
                      type="text" value={modal.data.videoUrl || ''}
                      onChange={(e) => setModal({ ...modal, data: { ...modal.data, videoUrl: e.target.value, mediaType: null, mediaPublicId: '' }})}
                      className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-4 text-[11px] font-bold text-blue-400 outline-none focus:border-blue-500/50"
                      placeholder="OR PASTE GOOGLE DRIVE / GIF LINK..."
                    />
                  </div>

                  {/* PLAYER PREVIEW */}
                  <div className="relative aspect-video rounded-2xl bg-black overflow-hidden border border-white/10 shadow-2xl">
                    {uploading ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#050505]">
                        <div className="w-8 h-8 border-2 border-[#FF7222] border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#FF7222]">Uploading Media...</span>
                      </div>
                    ) : modal.data.videoUrl ? (
                      <div className="w-full h-full">
                        {modal.data.mediaType === 'video' ? (
                          <video
                            key={`video-${modal.data.videoUrl}`}
                            src={resolveStreamUrl(modal.data.videoUrl)}
                            autoPlay
                            muted
                            loop
                            playsInline
                            controls={false}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.error('Video load error:', e);
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'block';
                            }}
                            onLoadStart={() => {
                              // Show loading state
                              const loadingDiv = e.target.parentElement.querySelector('.video-loading');
                              if (loadingDiv) loadingDiv.style.display = 'flex';
                            }}
                            onCanPlay={() => {
                              // Hide loading state
                              const loadingDiv = e.target.parentElement.querySelector('.video-loading');
                              if (loadingDiv) loadingDiv.style.display = 'none';
                            }}
                          />
                        ) : (
                          <img
                            key={`image-${modal.data.videoUrl}`}
                            src={resolveStreamUrl(modal.data.videoUrl)}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.error('Image load error:', e);
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                            onLoad={() => {
                              // Hide loading state
                              const loadingDiv = e.target.parentElement.querySelector('.video-loading');
                              if (loadingDiv) loadingDiv.style.display = 'none';
                            }}
                          />
                        )}

                        {/* Loading overlay */}
                        <div className="video-loading absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#050505] opacity-90">
                          <div className="w-6 h-6 border-2 border-[#FF7222] border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[#FF7222]">Loading Media...</span>
                        </div>

                        {/* Error fallback */}
                        <div className="hidden absolute inset-0 flex-col items-center justify-center bg-[#050505] text-red-500/50 gap-3">
                          <AlertCircle size={40} />
                          <span className="text-[9px] font-black uppercase text-center px-10">Media Load Failed</span>
                        </div>

                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

                        {/* Status indicator */}
                        <div className="absolute bottom-4 left-4 flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full shadow-lg ${
                            modal.data.mediaType === 'image' ? 'bg-green-500 shadow-green-500' :
                            modal.data.mediaType === 'video' ? 'bg-blue-500 shadow-blue-500' :
                            'bg-yellow-500 shadow-yellow-500'
                          }`} />
                          <div className="flex flex-col">
                            <span className="text-[9px] font-black uppercase tracking-wider text-white">
                              {modal.data.mediaType === 'image' ? 'Cloud_Image_Active' :
                               modal.data.mediaType === 'video' ? 'Cloud_Video_Active' :
                               'External_Link_Active'}
                            </span>
                            {modal.data.mediaPublicId && (
                              <span className="text-[7px] font-bold text-gray-400 uppercase">
                                ID: {modal.data.mediaPublicId.substring(0, 12)}...
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 opacity-20">
                        <PlayCircle size={40} className="text-white" />
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white">No Visual Source Loaded</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* NOTES */}
                <div className="w-full space-y-4 pb-4">
                  <label className="text-[10px] font-black text-gray-500 uppercase italic">Coaching Protocol</label>
                  <textarea value={modal.data.notes} onChange={(e) => setModal({ ...modal, data: { ...modal.data, notes: e.target.value }})} className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-6 outline-none focus:border-white/30 font-bold text-[13px] text-gray-400 h-28 resize-none custom-scrollbar" placeholder="Enter coaching points..."/>
                </div>
              </div>
            )
          )}
        </CustomPopUp>
      </div>
    </div>
  );
};

export default WorkoutOverview;