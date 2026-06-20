import React from 'react';
import { Link, useNavigate, useOutletContext } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

export default function OperationsOverview() {
  const { t } = useLanguage();
  const navigate = useNavigate();

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

  return (
    <div className="max-w-7xl mx-auto w-full flex flex-col gap-8">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 rounded-xl flex flex-col gap-1 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 text-primary/10 group-hover:text-primary/20 transition-colors">
            <span className="material-symbols-outlined text-7xl">group</span>
          </div>
          <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider font-label-sm">{t('totalToday')}</p>
          <p className="text-on-surface text-3xl font-extrabold">{totalToday.toLocaleString()}</p>
          <div className="mt-2 flex items-center gap-1 text-green-600 text-xs font-bold">
            <span className="material-symbols-outlined text-sm">trending_up</span>
            <span>12% from yesterday</span>
          </div>
        </div>

        <div className="glass-card p-6 rounded-xl flex flex-col gap-1 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 text-primary/10 group-hover:text-primary/20 transition-colors">
            <span className="material-symbols-outlined text-7xl">hourglass_empty</span>
          </div>
          <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider font-label-sm">{t('queueCount')}</p>
          <p className="text-on-surface text-3xl font-extrabold">{(queueList.length + vipPool.length).toLocaleString()}</p>
          <div className="mt-2 flex items-center gap-1 text-on-surface-variant text-xs font-medium">
            <span>Avg. wait: 45 mins</span>
          </div>
        </div>

        <div className="glass-card p-6 rounded-xl flex flex-col gap-1 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 text-primary/10 group-hover:text-primary/20 transition-colors">
            <span className="material-symbols-outlined text-7xl">confirmation_number</span>
          </div>
          <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider font-label-sm">{t('currentToken')}</p>
          <p className="text-primary text-3xl font-extrabold">{activeToken}</p>
          <div className="mt-2 flex items-center gap-1 text-on-surface-variant text-xs font-medium">
            <span>Last updated 2m ago</span>
          </div>
        </div>

        <div className="glass-card p-6 rounded-xl flex flex-col gap-1 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 text-primary/10 group-hover:text-primary/20 transition-colors">
            <span className="material-symbols-outlined text-7xl">qr_code_2</span>
          </div>
          <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider font-label-sm">{t('qrScansToday') || 'QR Scans Today'}</p>
          <p className="text-on-surface text-3xl font-extrabold">5,420</p>
          <div className="mt-2 flex items-center gap-1 text-on-surface-variant text-xs font-medium">
            <span>Digital entry active</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <section>
        <h3 className="text-on-surface text-lg font-bold mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">bolt</span>
          {t('quickActions')}
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Link 
            to="/dashboard/committee/scanner"
            className="flex flex-col items-center justify-center gap-3 p-6 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all transform hover:-translate-y-1 text-center"
          >
            <span className="material-symbols-outlined text-3xl">qr_code_scanner</span>
            <span className="text-sm font-bold">{t('scanQrCode')}</span>
          </Link>
          
          <Link 
            to="/dashboard/committee/scanner-verification"
            className="flex flex-col items-center justify-center gap-3 p-6 bg-secondary text-white rounded-xl shadow-lg shadow-secondary/20 hover:bg-secondary/90 transition-all transform hover:-translate-y-1 text-center"
          >
            <span className="material-symbols-outlined text-3xl">person_add</span>
            <span className="text-sm font-bold">{t('newEntry')}</span>
          </Link>
          
          <Link 
            to="/dashboard/committee/parking"
            className="flex flex-col items-center justify-center gap-3 p-6 bg-surface-container-high border border-outline-variant text-on-surface rounded-xl hover:bg-surface-variant transition-all transform hover:-translate-y-1 text-center"
          >
            <span className="material-symbols-outlined text-3xl text-primary">local_parking</span>
            <span className="text-sm font-bold">{t('parkingManagement')}</span>
          </Link>
          
          <button 
            onClick={handleNextToken}
            disabled={isPaused || isNextLoading}
            className="flex flex-col items-center justify-center gap-3 p-6 bg-surface-container-high border border-outline-variant text-on-surface rounded-xl hover:bg-surface-variant transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed text-center"
          >
            <span className="material-symbols-outlined text-3xl text-tertiary">arrow_circle_right</span>
            <span className="text-sm font-bold">{t('nextToken')}</span>
          </button>
        </div>
      </section>

      {/* Bottom Section: Activity and Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 glass-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-on-surface text-lg font-bold">{t('recentActivities') || 'Recent Activity'}</h3>
            <button className="text-primary text-sm font-bold hover:underline">View All</button>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4 p-3 hover:bg-surface-container-low rounded-lg transition-colors border-l-4 border-green-500">
              <div className="size-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-green-600">check_circle</span>
              </div>
              <div className="flex flex-col flex-grow">
                <p className="text-on-surface text-sm font-bold">Token #T-8845 Verified</p>
                <p className="text-on-surface-variant text-xs">Primary Gate • Just now</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-3 hover:bg-surface-container-low rounded-lg transition-colors border-l-4 border-primary">
              <div className="size-10 rounded-full bg-primary-container/20 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary">person_add_alt</span>
              </div>
              <div className="flex flex-col flex-grow">
                <p className="text-on-surface text-sm font-bold">New Offline Entry: Manoj Deshmukh</p>
                <p className="text-on-surface-variant text-xs">Counter #4 • 5 mins ago</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-3 hover:bg-surface-container-low rounded-lg transition-colors border-l-4 border-tertiary">
              <div className="size-10 rounded-full bg-tertiary-container/20 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-tertiary">update</span>
              </div>
              <div className="flex flex-col flex-grow">
                <p className="text-on-surface text-sm font-bold">Queue Update: Block A moving fast</p>
                <p className="text-on-surface-variant text-xs">Operations • 12 mins ago</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-3 hover:bg-surface-container-low rounded-lg transition-colors border-l-4 border-error">
              <div className="size-10 rounded-full bg-error-container flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-error">warning</span>
              </div>
              <div className="flex flex-col flex-grow">
                <p className="text-on-surface text-sm font-bold">Entry Denied: Invalid QR</p>
                <p className="text-on-surface-variant text-xs">Secondary Gate • 25 mins ago</p>
              </div>
            </div>
          </div>
        </div>

        {/* Announcements Widget */}
        <div className="glass-card rounded-xl p-6 bg-surface-container">
          <h3 className="text-on-surface text-lg font-bold mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">campaign</span>
            {t('announcements')}
          </h3>
          <div className="flex flex-col gap-5">
            <div className="p-4 bg-white rounded-lg border border-outline-variant shadow-sm relative overflow-hidden">
              <div className="w-1 h-full absolute left-0 top-0 bg-primary"></div>
              <p className="text-on-surface text-sm font-bold leading-tight">Temple Notice: Evening Aarti schedule change</p>
              <p className="text-on-surface-variant text-xs mt-2">Starting Oct 25, Aarti will begin at 6:45 PM instead of 7:00 PM.</p>
              <p className="text-primary text-[10px] font-bold uppercase tracking-widest mt-3">Posted 2h ago</p>
            </div>
            
            <div className="p-4 bg-white rounded-lg border border-outline-variant shadow-sm relative overflow-hidden">
              <div className="w-1 h-full absolute left-0 top-0 bg-error"></div>
              <p className="text-on-surface text-sm font-bold leading-tight">Crowd Alert: East Gate congestion</p>
              <p className="text-on-surface-variant text-xs mt-2">East gate is experiencing high volume. Directing devotees to North gate.</p>
              <p className="text-error text-[10px] font-bold uppercase tracking-widest mt-3">Priority: High</p>
            </div>
            
            <button className="w-full py-3 bg-white border border-dashed border-primary/40 rounded-lg text-primary text-sm font-bold hover:bg-primary-container/10 transition-colors">
              + Add New Notice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
