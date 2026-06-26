import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

export default function CommitteeDashboard() {
  const { t } = useLanguage();

  const {
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

  // New Devotee Profile States
  const [selectedDevotee, setSelectedDevotee] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isCompletingDarshan, setIsCompletingDarshan] = useState(false);

  const handleViewProfile = async (item) => {
    setIsLoadingProfile(true);
    setSelectedDevotee(item); // Optimistic UI
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/bookings/verify-scanner`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: item.id })
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedDevotee({ ...item, bookingData: data.booking });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleCompleteDarshan = async (bookingId) => {
    setIsCompletingDarshan(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/bookings/verify-scanner/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, counterNumber: 3, staffName: 'Committee Member' })
      });
      if (res.ok) {
        showToast('Devotee Darshan Completed!');
        setQueueList(prev => {
          const newQueue = prev.filter(q => q.bookingData?._id !== bookingId);
          return newQueue.map((q, i) => ({ ...q, position: i + 1 }));
        });
        setCurrentlyInside(prev => Math.max(0, prev - (selectedDevotee?.persons || 1)));
        setSelectedDevotee(null);
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to complete Darshan');
      }
    } catch (err) {
      showToast('An error occurred');
    } finally {
      setIsCompletingDarshan(false);
    }
  };


  const handlePushNext = (vipItem) => {
    setVipPool(prev => prev.filter(item => item.id !== vipItem.id));
    const promotedDevotee = {
      id: vipItem.id,
      name: vipItem.name,
      type: 'VIP Member',
      checkIn: vipItem.checkIn,
      wait: '0m',
      isVip: true,
      persons: parseInt(vipItem.members) || 1
    };
    setQueueList(prev => {
      const newQueue = [promotedDevotee, ...prev];
      return newQueue.map((q, i) => ({ ...q, position: i + 1 }));
    });
    showToast(`Pushed ${vipItem.name} (${vipItem.id}) to top of Live Queue!`);
  };

  const handleDelete = (tokenId) => {
    setQueueList(prev => {
      const newQueue = prev.filter(item => item.id !== tokenId);
      return newQueue.map((q, i) => ({ ...q, position: i + 1 }));
    });
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
        {/* Left Column: VIP Priority Section */}
        <div className="lg:col-span-4 space-y-8">
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
        <div className="lg:col-span-8 h-full">
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
                    onClick={() => handleViewProfile(item)}
                    className={`group cursor-pointer flex flex-col gap-2 p-4 rounded-xl transition-all border ${item.isVip ? 'hover:bg-secondary-container/10 border-transparent hover:border-secondary-container bg-surface-container-lowest' : 'hover:bg-surface-container-low border-transparent hover:border-outline-variant bg-surface-container-lowest shadow-sm'}`}
                  >
                    <div className="flex items-center gap-4">
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
                        <div className="text-xs text-on-surface-variant flex flex-wrap gap-x-4 gap-y-1 mt-1.5 font-medium">
                          <span><strong className="text-on-surface">Queue Pos:</strong> #{item.position}</span>
                          <span><strong className="text-on-surface">Persons:</strong> {item.persons}</span>
                          <span><strong className="text-on-surface">Entry:</strong> {item.checkIn}</span>
                          <span><strong className="text-on-surface">Est. Wait:</strong> {item.wait}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-primary font-bold text-xs bg-primary/10 px-2 py-1 rounded-md border border-primary/20">Waiting in Queue</span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity mt-1">
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleOpenEdit(item); }}
                            className="p-1 text-on-surface-variant hover:text-primary transition-colors bg-white rounded shadow-sm border border-outline-variant"
                          >
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                            className="p-1 text-on-surface-variant hover:text-error transition-colors bg-white rounded shadow-sm border border-outline-variant"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        </div>
                      </div>
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
          <div className="bg-white rounded-2xl w-[90vw] max-w-md p-6 shadow-2xl border border-outline-variant animate-in fade-in zoom-in-95 duration-200 text-on-surface">
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
      
      {/* Devotee Profile Modal */}
      {selectedDevotee && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] flex justify-end">
          <div className="bg-surface-container-lowest w-full max-w-lg h-full shadow-2xl border-l border-outline-variant animate-in slide-in-from-right duration-300 flex flex-col overflow-hidden">
            <div className="flex justify-between items-center px-6 py-4 border-b border-outline-variant bg-surface-container-lowest sticky top-0 z-10">
              <h3 className="text-xl font-bold font-headline-md flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">account_circle</span>
                Devotee Profile
              </h3>
              <button 
                onClick={() => setSelectedDevotee(null)}
                className="text-on-surface-variant hover:bg-surface-container rounded-full p-2 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-background">
              {isLoadingProfile && !selectedDevotee.bookingData?.mobile ? (
                <div className="flex justify-center items-center py-12">
                  <span className="material-symbols-outlined animate-spin text-primary text-4xl">sync</span>
                </div>
              ) : (
                <>
                  {/* Status Banner */}
                  <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center font-display font-bold text-primary shadow-sm border border-outline-variant">
                        {selectedDevotee.id}
                      </div>
                      <div>
                        <p className="font-bold text-primary">Token {selectedDevotee.id}</p>
                        <p className="text-xs text-on-surface-variant font-medium">Currently Waiting in Queue (Pos: #{selectedDevotee.position})</p>
                      </div>
                    </div>
                  </div>

                  {/* Personal Info */}
                  <div className="tonal-layer rounded-xl p-5 border border-outline-variant bg-white shadow-sm">
                    <h4 className="font-bold text-sm text-on-surface-variant mb-4 uppercase tracking-wider flex items-center gap-2 border-b border-outline-variant pb-2">
                      <span className="material-symbols-outlined text-[18px]">person</span> Personal Information
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-on-surface-variant">Full Name</p>
                        <p className="font-bold text-on-surface">{selectedDevotee.bookingData?.fullName || selectedDevotee.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-on-surface-variant">Mobile Number</p>
                        <p className="font-bold text-on-surface">{selectedDevotee.bookingData?.mobile || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-on-surface-variant">City</p>
                        <p className="font-bold text-on-surface">{selectedDevotee.bookingData?.placeCity || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-on-surface-variant">Age</p>
                        <p className="font-bold text-on-surface">{selectedDevotee.bookingData?.visitors?.[0]?.age ? `${selectedDevotee.bookingData.visitors[0].age} Yrs` : 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Booking Info */}
                  <div className="tonal-layer rounded-xl p-5 border border-outline-variant bg-white shadow-sm">
                    <h4 className="font-bold text-sm text-on-surface-variant mb-4 uppercase tracking-wider flex items-center gap-2 border-b border-outline-variant pb-2">
                      <span className="material-symbols-outlined text-[18px]">confirmation_number</span> Booking Information
                    </h4>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-on-surface-variant">Booking ID</p>
                        <p className="font-bold text-on-surface">{selectedDevotee.bookingData?._id?.substring(0, 8) || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-on-surface-variant">Number of Persons</p>
                        <p className="font-bold text-on-surface">{selectedDevotee.persons} Persons</p>
                      </div>
                      <div>
                        <p className="text-xs text-on-surface-variant">Booking Date</p>
                        <p className="font-bold text-on-surface">{selectedDevotee.bookingData?.createdAt ? new Date(selectedDevotee.bookingData.createdAt).toLocaleDateString() : 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-on-surface-variant">Darshan Date</p>
                        <p className="font-bold text-on-surface">{selectedDevotee.bookingData?.darshanDate ? new Date(selectedDevotee.bookingData.darshanDate).toLocaleDateString() : 'N/A'}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs text-on-surface-variant">Vehicle Info</p>
                        <p className="font-bold text-on-surface">{selectedDevotee.bookingData?.vehicleType && selectedDevotee.bookingData.vehicleType !== 'none' ? `${selectedDevotee.bookingData.vehicleType.toUpperCase()} - ${selectedDevotee.bookingData.vehicleNumber}` : 'No Vehicle'}</p>
                      </div>
                    </div>
                    
                    {selectedDevotee.bookingData?.visitors && selectedDevotee.bookingData.visitors.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-on-surface-variant mb-2 font-bold">Visitors List</p>
                        <div className="bg-surface-container-low rounded-lg p-3 space-y-2 border border-outline-variant">
                          {selectedDevotee.bookingData.visitors.map((v, i) => (
                            <div key={i} className="flex justify-between items-center text-sm">
                              <span className="font-semibold text-on-surface">{v.name}</span>
                              <span className="text-on-surface-variant text-xs bg-white px-2 py-0.5 rounded border border-outline-variant">{v.age} Yrs</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Journey Status */}
                  <div className="tonal-layer rounded-xl p-5 border border-outline-variant bg-white shadow-sm">
                    <h4 className="font-bold text-sm text-on-surface-variant mb-4 uppercase tracking-wider flex items-center gap-2 border-b border-outline-variant pb-2">
                      <span className="material-symbols-outlined text-[18px]">timeline</span> Journey Status
                    </h4>
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <div className="w-6 flex flex-col items-center">
                          <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white"><span className="material-symbols-outlined text-[12px]">check</span></div>
                          <div className="w-0.5 h-full bg-green-500 my-1"></div>
                        </div>
                        <div className="pb-4">
                          <p className="font-bold text-sm text-on-surface">Booking Confirmed</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-6 flex flex-col items-center">
                          <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white"><span className="material-symbols-outlined text-[12px]">check</span></div>
                          <div className="w-0.5 h-full bg-green-500 my-1"></div>
                        </div>
                        <div className="pb-4">
                          <p className="font-bold text-sm text-on-surface">Temple Entry Completed</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-6 flex flex-col items-center">
                          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-white"><span className="material-symbols-outlined text-[12px]">hourglass_top</span></div>
                          <div className="w-0.5 h-full bg-outline-variant my-1"></div>
                        </div>
                        <div className="pb-4">
                          <p className="font-bold text-sm text-primary">Waiting in Queue</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-6 flex flex-col items-center">
                          <div className="w-5 h-5 rounded-full border-2 border-outline-variant bg-white"></div>
                        </div>
                        <div>
                          <p className="font-bold text-sm text-on-surface-variant">Darshan Completed</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <div className="p-4 border-t border-outline-variant bg-white flex gap-3 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-10">
              <button 
                onClick={() => setSelectedDevotee(null)}
                className="flex-1 py-3 border border-outline-variant rounded-xl font-bold text-on-surface-variant hover:bg-surface-container-low transition-colors"
              >
                Close
              </button>
              <button 
                onClick={() => handleCompleteDarshan(selectedDevotee.bookingData?._id)}
                disabled={isCompletingDarshan || !selectedDevotee.bookingData?._id}
                className="flex-[2] py-3 bg-primary text-white rounded-xl font-bold hover:brightness-110 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isCompletingDarshan ? (
                  <span className="material-symbols-outlined animate-spin">sync</span>
                ) : (
                  <span className="material-symbols-outlined">check_circle</span>
                )}
                Mark Darshan Completed
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
