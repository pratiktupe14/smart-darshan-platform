import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../lib/supabase';

export default function CommitteeDashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, currentLanguage, setLanguage } = useLanguage();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = async () => {
    if (window.confirm(t('confirmLogout'))) {
      await supabase.auth.signOut();
      localStorage.clear();
      sessionStorage.clear();
      navigate('/login');
    }
  };


  // --- STATES PRESERVED ACROSS CHILDREN ---
  // Serving Controller States
  const [activeToken, setActiveToken] = useState('B-42');
  const [activeName, setActiveName] = useState('Rameshwar Kulkarni');
  const [activeType, setActiveType] = useState('VIP DARSHAN');
  const [isNextLoading, setIsNextLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isPaused, setIsPaused] = useState(false);

  // Queue List State
  const [queueList, setQueueList] = useState([
    { id: 'B-43', name: 'Mahesh Patil', type: 'Regular', checkIn: '10:42 AM', wait: '12m', isVip: false },
    { id: 'V-11', name: 'Kavita Gupta', type: 'VIP Member', checkIn: '10:45 AM', wait: '9m', isVip: true },
    { id: 'B-44', name: 'Rahul Sharma', type: 'Regular', checkIn: '10:48 AM', wait: '6m', isVip: false },
    { id: 'B-45', name: 'Nitin Kamble', type: 'Regular', checkIn: '10:50 AM', wait: '4m', isVip: false },
    { id: 'B-46', name: 'Priya Verma', type: 'Regular', checkIn: '10:52 AM', wait: '2m', isVip: false },
  ]);

  // VIP Pool State
  const [vipPool, setVipPool] = useState([
    { id: 'V-09', name: 'Anjali Deshmukh', type: 'VIP Member', checkIn: '10:35 AM', wait: '16m', members: 'Family (4 Members)', isVip: true },
    { id: 'V-10', name: 'Suresh Prabhu', type: 'VIP Member', checkIn: '10:38 AM', wait: '13m', members: 'Senior Citizen', isVip: true },
  ]);

  // Metrics State
  const [totalToday, setTotalToday] = useState(1284);
  const [currentlyInside, setCurrentlyInside] = useState(142);

  // Modal States
  const [isNewEntryOpen, setIsNewEntryOpen] = useState(false);

  // Form States (New Entry)
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('Regular'); // 'Regular' or 'VIP'
  const [newCategory, setNewCategory] = useState('Individual'); // 'Individual', 'Family', 'Senior Citizen'

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage('');
    }, 3000);
  };

  const handleCreateNewEntry = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;

    let tokenId = '';
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (newType === 'VIP') {
      const allVips = [...queueList, ...vipPool].filter(item => item.id.startsWith('V-'));
      let nextVNum = 12;
      if (allVips.length > 0) {
        const numbers = allVips.map(item => parseInt(item.id.split('-')[1])).filter(num => !isNaN(num));
        if (numbers.length > 0) {
          nextVNum = Math.max(...numbers) + 1;
        }
      }
      tokenId = `V-${nextVNum}`;

      const newVipItem = {
        id: tokenId,
        name: newName,
        type: 'VIP Member',
        checkIn: nowTime,
        wait: '0m',
        members: newCategory === 'Family' ? 'Family (4 Members)' : newCategory === 'Senior Citizen' ? 'Senior Citizen' : 'Individual VIP',
        isVip: true
      };

      setVipPool(prev => [...prev, newVipItem]);
      showToast(`Added VIP Devotee ${newName} to Priority Pool`);
    } else {
      const allRegs = queueList.filter(item => item.id.startsWith('B-'));
      let nextBNum = 47;
      if (allRegs.length > 0) {
        const numbers = allRegs.map(item => parseInt(item.id.split('-')[1])).filter(num => !isNaN(num));
        if (numbers.length > 0) {
          nextBNum = Math.max(...numbers) + 1;
        }
      }
      tokenId = `B-${nextBNum}`;

      const newQueueItem = {
        id: tokenId,
        name: newName,
        type: newCategory,
        checkIn: nowTime,
        wait: '0m',
        isVip: false
      };

      setQueueList(prev => [...prev, newQueueItem]);
      showToast(`Added Devotee ${newName} to Live Queue`);
    }

    setTotalToday(prev => prev + 1);
    setIsNewEntryOpen(false);
    setNewName('');
  };

  const getSidebarLinkClasses = (path) => {
    const isActive = location.pathname === path;
    return `flex items-center gap-3 px-4 py-3 rounded-lg font-bold font-label-md text-sm transition-all active:scale-[0.98] ${
      isActive
        ? 'bg-secondary-container text-on-secondary-container font-bold'
        : 'text-on-surface-variant hover:bg-surface-container-high font-semibold'
    }`;
  };

  const getHeaderLinkClasses = (path) => {
    const isActive = location.pathname === path;
    return isActive
      ? 'text-primary font-bold border-b-2 border-primary font-label-md text-sm pb-1'
      : 'text-on-surface-variant hover:text-primary transition-colors font-label-md text-sm font-semibold';
  };

  const themeVars = {
    '--color-primary': '#8f4e00',
    '--color-secondary-container': '#fed65b',
    '--color-on-secondary-container': '#745c00',
    '--color-surface-container-lowest': '#ffffff',
    '--color-on-surface-variant': '#554336',
    '--color-outline-variant': '#dbc2b0',
    '--color-background': '#f9f9f9',
    '--color-surface-container-high': '#e8e8e8',
    '--color-surface-container-low': '#f3f3f4',
    '--color-surface-container': '#eeeeee',
    '--color-surface': '#f9f9f9',
    '--color-on-surface': '#1a1c1c',
  };

  return (
    <div style={themeVars} className="bg-background text-on-surface font-body-md text-body-md overflow-x-hidden min-h-screen flex flex-col">
      {/* TopNavBar */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 md:px-10 h-16 bg-surface border-b border-outline-variant">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-3xl">temple_hindu</span>
            <span className="font-display text-2xl font-extrabold text-primary tracking-tighter">TemplePortal</span>
          </div>
          <div className="hidden md:block h-6 w-px bg-outline-variant mx-2"></div>
          <h1 className="hidden md:block font-headline-md text-2xl font-semibold text-on-surface">{t('committeeTitle')}</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-6">
            <Link className={getHeaderLinkClasses('/dashboard/committee/dashboard')} to="/dashboard/committee/dashboard">{t('dashboard')}</Link>
            <Link className={getHeaderLinkClasses('/dashboard/committee')} to="/dashboard/committee">{t('queueStatus')}</Link>
            <Link className="text-on-surface-variant hover:text-primary transition-colors font-label-md text-sm font-semibold" to="#">{t('bookings')}</Link>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <select 
              value={currentLanguage} 
              onChange={(e) => setLanguage(e.target.value)}
              className="font-label-sm text-label-sm bg-transparent border border-outline-variant rounded-xl px-2 py-1 text-on-surface hover:border-primary focus:outline-none transition-all cursor-pointer mr-1"
              aria-label="Language Selector"
            >
              <option value="en">EN</option>
              <option value="hi">HI</option>
              <option value="mr">MR</option>
            </select>
            <button className="p-2 hover:bg-surface-container-high rounded-full transition-colors relative">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-surface"></span>
            </button>
            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="p-2 hover:bg-surface-container-high rounded-full transition-colors"
                aria-label="Profile Menu"
              >
                <span className="material-symbols-outlined">account_circle</span>
              </button>
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-surface rounded-xl shadow-lg border border-outline-variant py-2 z-50">
                  <button 
                    onClick={() => {
                      setIsProfileOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-error hover:bg-error/10 w-full text-left font-bold"
                  >
                    <span className="material-symbols-outlined text-sm text-error">logout</span>
                    <span>{t('logout')}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* SideNavBar (Desktop Only) */}
      <aside className="hidden lg:flex flex-col h-full w-64 fixed left-0 top-0 bg-surface-container-low pt-20 px-4 space-y-2 border-r border-outline-variant z-40">
        <div className="mb-6 px-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-white font-bold">T</div>
            <div>
              <div className="font-label-md text-sm font-bold text-on-surface">Temple Admin</div>
              <div className="flex items-center gap-1.5">
                <span className="font-label-sm text-xs text-on-surface-variant">Committee Member</span>
                <span className="text-[6px] text-on-surface-variant">•</span>
                <button onClick={handleLogout} className="text-xs text-error font-bold hover:underline cursor-pointer">
                  {t('logout')}
                </button>
              </div>
            </div>
          </div>
        </div>
        <nav className="space-y-1">
          <Link className={getSidebarLinkClasses('/dashboard/committee/dashboard')} to="/dashboard/committee/dashboard">
            <span className="material-symbols-outlined">dashboard</span> {t('dashboard')}
          </Link>
          <Link className={getSidebarLinkClasses('/dashboard/committee')} to="/dashboard/committee">
            <span className="material-symbols-outlined">groups</span> {t('queueStatus')}
          </Link>
          <Link className={getSidebarLinkClasses('/dashboard/committee/scanner')} to="/dashboard/committee/scanner">
            <span className="material-symbols-outlined">qr_code_scanner</span> {t('qrScanner')}
          </Link>
          <Link className={getSidebarLinkClasses('/dashboard/committee/scanner-verification')} to="/dashboard/committee/scanner-verification">
            <span className="material-symbols-outlined">verified_user</span> {t('newEntry')}
          </Link>
          <Link className={getSidebarLinkClasses('/dashboard/committee/parking')} to="/dashboard/committee/parking">
            <span className="material-symbols-outlined">local_parking</span> {t('parkingManagement')}
          </Link>
          <Link className={getSidebarLinkClasses('/dashboard/committee/announcements')} to="/dashboard/committee/announcements">
            <span className="material-symbols-outlined">campaign</span> {t('announcements')}
          </Link>
        </nav>
        <div className="mt-auto pb-6 flex flex-col gap-2">
          <button 
            onClick={() => setIsNewEntryOpen(true)}
            className="w-full bg-primary text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 saffron-glow hover:brightness-110 active:scale-[0.98] transition-all"
          >
            <span className="material-symbols-outlined">add</span> {t('newEntry')}
          </button>
          <button 
            onClick={handleLogout}
            className="w-full border border-outline text-on-surface hover:bg-surface-container-high py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span> {t('logout')}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow lg:ml-64 pt-20 px-4 md:px-10 pb-12 z-0 relative flex flex-col">
        <Outlet context={{
          activeToken, setActiveToken,
          activeName, setActiveName,
          activeType, setActiveType,
          isNextLoading, setIsNextLoading,
          toastMessage, setToastMessage,
          isPaused, setIsPaused,
          queueList, setQueueList,
          vipPool, setVipPool,
          totalToday, setTotalToday,
          currentlyInside, setCurrentlyInside,
          showToast
        }} />
      </main>

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#1a1c1c] text-white px-6 py-3 rounded-full shadow-lg z-[100] animate-[slideUp_0.3s_ease-out_forwards]">
          <span className="font-label-md text-sm font-semibold text-white">{toastMessage}</span>
        </div>
      )}

      {/* --- MODALS --- */}
      {/* 1. New Entry Modal */}
      {isNewEntryOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-outline-variant animate-in fade-in zoom-in-95 duration-200 text-on-surface">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">person_add</span>
                Add New Devotee Entry
              </h3>
              <button 
                onClick={() => setIsNewEntryOpen(false)}
                className="text-on-surface-variant hover:bg-surface-container rounded-full p-1 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleCreateNewEntry} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-2">{t('nameLabel')}</label>
                <input 
                  type="text" 
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2.5 outline-none focus:border-primary transition-all text-sm font-semibold"
                  placeholder="Enter full name"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-2">{t('queueTypeLabel')}</label>
                  <select 
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2.5 outline-none focus:border-primary transition-all text-sm font-semibold"
                  >
                    <option value="Regular">Regular Queue</option>
                    <option value="VIP">VIP Priority Pool</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-2">{t('categoryLabel')}</label>
                  <select 
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2.5 outline-none focus:border-primary transition-all text-sm font-semibold"
                  >
                    <option value="Individual">Individual</option>
                    <option value="Family">Family</option>
                    <option value="Senior Citizen">Senior Citizen</option>
                  </select>
                </div>
              </div>
              
              <div className="pt-4 flex gap-3 justify-end">
                <button 
                  type="button"
                  onClick={() => setIsNewEntryOpen(false)}
                  className="px-4 py-2 border border-outline-variant rounded-lg hover:bg-surface-container-low text-xs font-bold text-on-surface-variant transition-colors"
                >
                  {t('cancel')}
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-primary text-white rounded-lg hover:brightness-110 text-xs font-bold transition-all shadow-md"
                >
                  {t('newEntry')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
