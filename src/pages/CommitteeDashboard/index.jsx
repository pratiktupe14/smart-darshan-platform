import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

export default function CommitteeDashboard() {
  const { t } = useLanguage();

  const {
    activeToken, setActiveToken,
    activeName, setActiveName,
    activeType, setActiveType,
    isNextLoading, setIsNextLoading,
    isPaused, setIsPaused,
    queueList, setQueueList,
    vipPool, setVipPool,
    totalToday, setTotalToday,
    currentlyInside, setCurrentlyInside,
    showToast
  } = useOutletContext();

  // Local states for editing
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingDevotee, setEditingDevotee] = useState(null);
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('Regular');

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'regular', 'vip'
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  // Actions
  const handleNextToken = () => {
    if (isPaused) {
      showToast('Queue is paused. Please resume first.');
      return;
    }
    if (queueList.length === 0) {
      showToast('Queue is empty!');
      return;
    }

    setIsNextLoading(true);
    setTimeout(() => {
      const nextPerson = queueList[0];
      setActiveToken(nextPerson.id);
      setActiveName(nextPerson.name);
      setActiveType(nextPerson.isVip ? 'VIP DARSHAN' : 'REGULAR DARSHAN');
      
      setQueueList(queueList.slice(1));
      setCurrentlyInside(prev => prev + 1);
      showToast(`Called Token ${nextPerson.id}`);
      setIsNextLoading(false);
    }, 400);
  };

  const handleSkip = () => {
    if (queueList.length === 0) {
      showToast('Queue is empty! Nothing to skip.');
      return;
    }
    const skippedToken = activeToken;
    showToast(`Skipped Token ${skippedToken}`);

    // Load next person immediately
    const nextPerson = queueList[0];
    setActiveToken(nextPerson.id);
    setActiveName(nextPerson.name);
    setActiveType(nextPerson.isVip ? 'VIP DARSHAN' : 'REGULAR DARSHAN');
    setQueueList(queueList.slice(1));
  };

  const handleTogglePause = () => {
    setIsPaused(prev => {
      const nextState = !prev;
      showToast(nextState ? 'Queue Paused' : 'Queue Resumed');
      return nextState;
    });
  };

  const handlePushNext = (vipItem) => {
    setVipPool(prev => prev.filter(item => item.id !== vipItem.id));
    const promotedDevotee = {
      id: vipItem.id,
      name: vipItem.name,
      type: 'VIP Member',
      checkIn: vipItem.checkIn,
      wait: '0m',
      isVip: true
    };
    setQueueList(prev => [promotedDevotee, ...prev]);
    showToast(`Pushed ${vipItem.name} (${vipItem.id}) to top of Live Queue!`);
  };

  const handleDelete = (tokenId) => {
    setQueueList(prev => prev.filter(item => item.id !== tokenId));
    setVipPool(prev => prev.filter(item => item.id !== tokenId));
    showToast(`Removed Token ${tokenId} from waitlist`);
  };

  const handleOpenEdit = (devotee) => {
    setEditingDevotee(devotee);
    setEditName(devotee.name);
    setEditCategory(devotee.isVip ? 'VIP Member' : devotee.type);
    setIsEditOpen(true);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editingDevotee) return;

    const isVip = editCategory === 'VIP Member';

    setQueueList(prev => prev.map(item => 
      item.id === editingDevotee.id 
        ? { ...item, name: editName, type: editCategory, isVip } 
        : item
    ));

    setVipPool(prev => prev.map(item => 
      item.id === editingDevotee.id 
        ? { ...item, name: editName, type: editCategory, members: isVip ? 'VIP Member' : editCategory } 
        : item
    ));

    showToast(`Updated details for Token ${editingDevotee.id}`);
    setIsEditOpen(false);
    setEditingDevotee(null);
  };

  const filteredQueueList = queueList.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterType === 'regular') {
      return matchesSearch && !item.isVip;
    }
    if (filterType === 'vip') {
      return matchesSearch && item.isVip;
    }
    return matchesSearch;
  });

  return (
    <div className="flex-1 w-full animate-in fade-in duration-200">
      {/* Dashboard Stats Bento */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="md:col-span-1 tonal-layer p-6 rounded-xl flex flex-col justify-between">
          <div>
            <span className="font-label-sm text-xs text-on-surface-variant block mb-1 font-medium">{t('totalToday')}</span>
            <h3 className="font-display text-primary leading-none text-[32px] md:text-[48px] font-extrabold tracking-tighter">{totalToday.toLocaleString()}</h3>
          </div>
          <div className="mt-4 flex items-center gap-1 text-green-700 font-label-sm text-xs font-semibold">
            <span className="material-symbols-outlined text-sm">trending_up</span> +12% from avg
          </div>
        </div>
        <div className="md:col-span-1 tonal-layer p-6 rounded-xl flex flex-col justify-between">
          <div>
            <span className="font-label-sm text-xs text-on-surface-variant block mb-1 font-medium">{t('currentlyInside')}</span>
            <h3 className="font-display text-primary text-[32px] md:text-[48px] font-extrabold tracking-tighter leading-none">{currentlyInside}</h3>
          </div>
          <div className="mt-4 flex items-center gap-1 text-on-secondary-container font-label-sm text-xs font-semibold">
            <span className="material-symbols-outlined text-sm">group</span> 85% capacity
          </div>
        </div>
        <div className="md:col-span-1 tonal-layer p-6 rounded-xl flex flex-col justify-between">
          <div>
            <span className="font-label-sm text-xs text-on-surface-variant block mb-1 font-medium">{t('avgWaitTime')}</span>
            <h3 className="font-display text-primary leading-none text-[32px] md:text-[48px] font-extrabold tracking-tighter">24<span className="text-2xl">m</span></h3>
          </div>
          <div className="mt-4 flex items-center gap-1 text-error font-label-sm text-xs font-semibold">
            <span className="material-symbols-outlined text-sm">schedule</span> +5m delay
          </div>
        </div>
        <div className="md:col-span-1 tonal-layer p-6 rounded-xl bg-[#fef1e5] border-[#fde4d0] border">
          <span className="font-label-sm text-xs text-primary block mb-3 font-semibold">Crowd Analytics</span>
          <div className="h-16 flex items-end gap-1">
            <div className="flex-1 bg-primary/20 h-8 rounded-t-sm"></div>
            <div className="flex-1 bg-primary/40 h-12 rounded-t-sm"></div>
            <div className="flex-1 bg-primary/60 h-16 rounded-t-sm"></div>
            <div className="flex-1 bg-primary/80 h-14 rounded-t-sm"></div>
            <div className="flex-1 bg-primary h-10 rounded-t-sm"></div>
            <div className="flex-1 bg-primary/40 h-6 rounded-t-sm"></div>
          </div>
        </div>
      </section>

      {/* Management Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Controls & Active Token */}
        <div className="lg:col-span-5 space-y-8">
          {/* Live Queue Controller */}
          <div className="tonal-layer rounded-xl p-8 text-center relative overflow-hidden bg-surface-container-lowest shadow-sm border border-outline-variant">
            <span className="font-label-md text-sm text-on-surface-variant uppercase tracking-widest block mb-4 font-bold">{t('currentlyServing')}</span>
            <div className="flex flex-col items-center mb-8">
              <div className={`w-32 h-32 rounded-full border-[3px] ${isPaused ? 'border-outline-variant bg-surface-container' : 'border-primary'} flex items-center justify-center mb-4 relative`}>
                <span className={`font-display ${isPaused ? 'text-on-surface-variant' : 'text-primary'} text-[48px] font-extrabold tracking-tight`}>
                  {isPaused ? 'II' : activeToken}
                </span>
                {isPaused && (
                  <span className="absolute -bottom-1.5 bg-outline-variant text-on-surface-variant px-3 py-0.5 text-[9px] font-bold rounded-full uppercase">
                    {t('pause')}
                  </span>
                )}
              </div>
              <h2 className="font-headline-md text-[24px] font-bold text-on-surface mb-2">
                {isPaused ? 'Queue is Paused' : activeName}
              </h2>
              {!isPaused && (
                <span className="inline-flex px-3 py-1 bg-secondary-container text-on-secondary-container text-[11px] font-bold rounded-full uppercase tracking-wider">
                  {activeType}
                </span>
              )}
            </div>
            <div className="grid grid-cols-3 gap-4">
              <button 
                onClick={handleSkip}
                disabled={isPaused}
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-xl border border-outline-variant hover:bg-surface-container-high transition-all text-on-surface-variant disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-2xl">skip_next</span>
                <span className="font-label-sm text-xs font-semibold">{t('skip')}</span>
              </button>
              <button 
                onClick={handleNextToken}
                disabled={isPaused || isNextLoading}
                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl bg-primary text-white saffron-glow transition-all ${isNextLoading ? 'scale-95' : 'hover:scale-[1.02] active:scale-95'} disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                <span className={`material-symbols-outlined text-2xl ${isNextLoading ? 'animate-spin' : ''}`}>
                  {isNextLoading ? 'sync' : 'play_arrow'}
                </span>
                <span className="font-label-sm text-xs font-semibold">{t('nextToken')}</span>
              </button>
              <button 
                onClick={handleTogglePause}
                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all ${isPaused ? 'border-primary bg-primary/10 text-primary font-bold' : 'border-outline-variant hover:bg-surface-container-high text-on-surface-variant'}`}
              >
                <span className="material-symbols-outlined text-2xl">
                  {isPaused ? 'play_arrow' : 'pause'}
                </span>
                <span className="font-label-sm text-xs font-semibold">
                  {isPaused ? t('resume') : t('pause')}
                </span>
              </button>
            </div>
          </div>

          {/* VIP Queue Priority Section */}
          <div className="tonal-layer rounded-xl overflow-hidden border border-outline-variant shadow-sm bg-surface-container-lowest">
            <div className="bg-secondary-container/30 px-6 py-4 border-b border-outline-variant flex justify-between items-center">
              <div className="flex items-center gap-2 text-on-secondary-container">
                <span className="material-symbols-outlined text-[20px]">star</span>
                <span className="font-label-md text-sm font-bold uppercase tracking-wider">{t('vipPriorityPool')}</span>
              </div>
              <span className="bg-[#8f4e00] text-white px-2 py-0.5 rounded text-[10px] font-bold">
                {vipPool.length} PENDING
              </span>
            </div>
            <div className="p-4 space-y-3">
              {vipPool.length === 0 ? (
                <div className="text-center py-6 text-xs text-on-surface-variant font-semibold">
                  No pending VIPs in pool.
                </div>
              ) : (
                vipPool.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-outline-variant hover:shadow-sm transition-shadow">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-sm">
                        {item.id}
                      </div>
                      <div>
                        <p className="font-label-md text-sm font-bold text-on-surface">{item.name}</p>
                        <p className="text-[10px] text-on-surface-variant font-medium">{item.members}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handlePushNext(item)}
                        className="text-primary font-bold text-xs hover:underline mr-1"
                      >
                        Push Next
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="text-on-surface-variant hover:text-error transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Real-time List */}
        <div className="lg:col-span-7 h-full">
          <div className="tonal-layer rounded-xl h-full flex flex-col bg-surface-container-lowest shadow-sm overflow-hidden border border-outline-variant">
            <div className="p-6 border-b border-outline-variant flex items-center justify-between bg-white z-10 sticky top-0 rounded-t-xl">
              <div className="flex items-center gap-4">
                <h2 className="font-headline-md text-2xl font-bold text-on-surface">Live Queue</h2>
                <div className="flex items-center gap-2 bg-surface-container rounded-full px-3 py-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface">Live Updates</span>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <input 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-4 py-2 border border-outline-variant rounded-full text-xs focus:ring-2 focus:ring-primary/20 outline-none w-48 transition-all bg-surface-container-lowest" 
                    placeholder="Search Token or Name..." 
                    type="text" 
                  />
                  <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">search</span>
                </div>
                <div className="relative">
                  <button 
                    onClick={() => setIsFilterDropdownOpen(prev => !prev)}
                    className={`p-2 border rounded-full hover:bg-surface-container transition-all ${filterType !== 'all' ? 'border-primary text-primary bg-primary/5' : 'border-outline-variant text-on-surface-variant'}`}
                  >
                    <span className="material-symbols-outlined text-[18px]">filter_list</span>
                  </button>
                  {isFilterDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-40 bg-white border border-outline-variant rounded-xl shadow-lg py-1 z-30 animate-in fade-in slide-in-from-top-2 duration-150">
                      <button 
                        onClick={() => { setFilterType('all'); setIsFilterDropdownOpen(false); }}
                        className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-surface-container-low transition-colors ${filterType === 'all' ? 'text-primary bg-primary/5' : 'text-on-surface-variant'}`}
                      >
                        All Devotees
                      </button>
                      <button 
                        onClick={() => { setFilterType('regular'); setIsFilterDropdownOpen(false); }}
                        className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-surface-container-low transition-colors ${filterType === 'regular' ? 'text-primary bg-primary/5' : 'text-on-surface-variant'}`}
                      >
                        Regular Only
                      </button>
                      <button 
                        onClick={() => { setFilterType('vip'); setIsFilterDropdownOpen(false); }}
                        className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-surface-container-low transition-colors ${filterType === 'vip' ? 'text-primary bg-primary/5' : 'text-on-surface-variant'}`}
                      >
                        VIP Only
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="overflow-y-auto p-6 space-y-4" style={{maxHeight: '640px'}}>
              {filteredQueueList.length === 0 ? (
                <div className="text-center py-12 text-on-surface-variant">
                  <span className="material-symbols-outlined text-4xl opacity-50 mb-2">done_all</span>
                  <p className="font-semibold text-sm">No matching queue items</p>
                </div>
              ) : (
                filteredQueueList.map((item) => (
                  <div 
                    key={item.id} 
                    className={`group flex items-center gap-4 p-4 rounded-xl transition-all border ${item.isVip ? 'hover:bg-secondary-container/10 border-transparent hover:border-secondary-container' : 'hover:bg-surface-container-low border-transparent hover:border-outline-variant'}`}
                  >
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-display font-bold transition-all ${item.isVip ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-container text-on-surface-variant group-hover:bg-white group-hover:text-primary group-hover:shadow-sm'}`}>
                      {item.id}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-label-md text-sm font-bold text-on-surface">{item.name}</p>
                        <span className={`px-2 py-0.5 text-[9px] font-extrabold rounded uppercase tracking-wider ${item.isVip ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-container text-on-surface-variant'}`}>
                          {item.type}
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant mt-1 font-medium">Check-in: {item.checkIn} • Waiting {item.wait}</p>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleOpenEdit(item)}
                        className="p-2 text-on-surface-variant hover:text-primary transition-colors"
                      >
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-on-surface-variant hover:text-error transition-colors"
                      >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="mt-auto p-6 border-t border-outline-variant text-center bg-white">
              <button className="text-[#8f4e00] font-label-md text-sm font-bold hover:underline">
                Showing {filteredQueueList.length} of {queueList.length} {t('waitlistItems')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- MODALS --- */}
      {/* Edit Entry Modal */}
      {isEditOpen && editingDevotee && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-outline-variant animate-in fade-in zoom-in-95 duration-200 text-on-surface">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">edit</span>
                Edit Devotee: {editingDevotee.id}
              </h3>
              <button 
                onClick={() => { setIsEditOpen(false); setEditingDevotee(null); }}
                className="text-on-surface-variant hover:bg-surface-container rounded-full p-1 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-2">{t('nameLabel')}</label>
                <input 
                  type="text" 
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2.5 outline-none focus:border-primary transition-all text-sm font-semibold"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-2">{t('categoryLabel')}</label>
                <input 
                  type="text"
                  required
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2.5 outline-none focus:border-primary transition-all text-sm font-semibold"
                  placeholder="e.g. Regular, Family, VIP Member"
                />
              </div>
              
              <div className="pt-4 flex gap-3 justify-end">
                <button 
                  type="button"
                  onClick={() => { setIsEditOpen(false); setEditingDevotee(null); }}
                  className="px-4 py-2 border border-outline-variant rounded-lg hover:bg-surface-container-low text-xs font-bold text-on-surface-variant transition-colors"
                >
                  {t('cancel')}
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-primary text-white rounded-lg hover:brightness-110 text-xs font-bold transition-all shadow-md"
                >
                  {t('saveChanges')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
