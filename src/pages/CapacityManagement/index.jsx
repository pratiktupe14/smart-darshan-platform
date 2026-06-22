import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';

export default function CapacityManagement() {
  const { t } = useLanguage();
  const [visitorLimit, setVisitorLimit] = useState(50000);
  const [vehicleLimit, setVehicleLimit] = useState(1200);
  const [maxPersons, setMaxPersons] = useState('10');
  
  // Real-time slot state
  const [availableSlots, setAvailableSlots] = useState(15710);
  const [refreshCountdown, setRefreshCountdown] = useState(14);
  const [isBookingOpen, setIsBookingOpen] = useState(true);
  const [bookingRate, setBookingRate] = useState(120);

  // Simulated metrics
  const [bookingsToday, setBookingsToday] = useState(34290);
  const [onlineBookings, setOnlineBookings] = useState(28000);
  const [walkIns, setWalkIns] = useState(6290);

  // Simulated countdown for slot refresh
  useEffect(() => {
    const timer = setInterval(() => {
      setRefreshCountdown(prev => prev <= 1 ? 15 : prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await fetch('http://localhost:5000/api/stats');
        const settingsRes = await fetch('http://localhost:5000/api/settings');
        
        if (statsRes.ok) {
          const stats = await statsRes.json();
          setBookingsToday(stats.bookingsToday);
          setOnlineBookings(Math.floor(stats.bookingsToday * 0.8));
          setWalkIns(stats.bookingsToday - Math.floor(stats.bookingsToday * 0.8));
        }

        if (settingsRes.ok) {
          const settings = await settingsRes.json();
          setVisitorLimit(settings.visitorLimit || 50000);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const handleReset = () => {
    if (window.confirm(t('resetConfirmText') || 'Reset capacity configurations to default settings?')) {
      setVisitorLimit(50000);
      setVehicleLimit(1200);
      setMaxPersons('10');
    }
  };

  const handleSave = async () => {
    try {
      await fetch('http://localhost:5000/api/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ visitorLimit })
      });
      alert(`${t('configSavedSuccess') || 'Configuration saved successfully!'}\n- ${t('maxVisitors') || 'Max Visitors'}: ${visitorLimit.toLocaleString()}\n- ${t('maxVehicles') || 'Max Vehicles'}: ${vehicleLimit}\n- ${t('maxPersonsPerBooking') || 'Max Persons/Booking'}: ${maxPersons}`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateCapacity = async () => {
    const newLimit = prompt(t('enterNewMaxVisitors') || 'Enter new Max Visitors Per Day:', visitorLimit);
    if (newLimit !== null) {
      const parsed = parseInt(newLimit, 10);
      if (!isNaN(parsed) && parsed > 0) {
        setVisitorLimit(parsed);
        try {
          await fetch('http://localhost:5000/api/settings', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ visitorLimit: parsed })
          });
        } catch (e) { console.error(e); }
      } else {
        alert(t('enterValidNumber') || 'Please enter a valid positive number.');
      }
    }
  };

  return (
    <div className="px-4 md:px-10 py-8 max-w-[1600px] mx-auto w-full space-y-8">
      {/* Page Title & Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-outline-variant/30 pb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-on-surface">{t('capacityMgmtTitle')}</h2>
          <p className="text-on-surface-variant text-sm font-medium mt-1">
            {t('capacityMgmtSubtitle')}
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2.5 rounded-xl border border-secondary text-secondary font-bold text-sm hover:bg-secondary/5 transition-colors flex items-center gap-2 active:scale-95">
            <span className="material-symbols-outlined text-sm">download</span>
            {t('exportReport')}
          </button>
          <button 
            onClick={handleUpdateCapacity}
            className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-sm hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all flex items-center gap-2 active:scale-95"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            {t('limitOverridden')}
          </button>
        </div>
      </section>

      {/* Capacity Overview Cards (Bento Style) */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Daily Capacity */}
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-soft flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-primary/5 rounded-lg">
              <span className="material-symbols-outlined text-primary">diversity_3</span>
            </div>
            <span className="bg-surface-variant text-on-surface-variant px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest">{t('maxLimit') || 'Max Limit'}</span>
          </div>
          <div>
            <p className="text-xs text-on-surface-variant font-medium">{t('totalDailyCapacity')}</p>
            <h3 className="text-2xl font-bold mt-1">{visitorLimit.toLocaleString()}</h3>
          </div>
          <div className="mt-4 pt-4 border-t border-outline-variant/30">
            <p className="text-[11px] text-on-surface-variant italic">{t('configuredInSettings') || 'Configured in settings'}</p>
          </div>
        </div>

        {/* Total Bookings Today */}
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-soft flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-secondary/5 rounded-lg">
              <span className="material-symbols-outlined text-secondary">confirmation_number</span>
            </div>
            <div className="flex items-center text-green-600 font-bold text-[12px]">
              <span className="material-symbols-outlined text-[14px] mr-0.5">trending_up</span>
              +5.2%
            </div>
          </div>
          <div>
            <p className="text-xs text-on-surface-variant font-medium">{t('totalBookingsToday')}</p>
            <h3 className="text-2xl font-bold mt-1">{bookingsToday.toLocaleString()}</h3>
          </div>
          <div className="mt-4 pt-4 border-t border-outline-variant/30">
            <div className="w-full bg-outline-variant/20 h-1.5 rounded-full overflow-hidden">
              <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: `${(bookingsToday / visitorLimit) * 100}%` }}></div>
            </div>
          </div>
        </div>

        {/* Available Slots */}
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-soft flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-tertiary/5 rounded-lg">
              <span className="material-symbols-outlined text-tertiary">event_seat</span>
            </div>
            <div className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></div>
          </div>
          <div>
            <p className="text-xs text-on-surface-variant font-medium">{t('availableSlots')}</p>
            <h3 className="text-2xl font-bold mt-1">{Math.max(0, visitorLimit - bookingsToday).toLocaleString()}</h3>
          </div>
          <div className="mt-4 pt-4 border-t border-outline-variant/30">
            <p className="text-xs text-tertiary font-bold">{t('refreshingIn')} {refreshCountdown}s</p>
          </div>
        </div>

        {/* Capacity Utilization */}
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-soft flex flex-col items-center justify-center hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="relative w-28 h-28 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle className="text-outline-variant opacity-20" cx="56" cy="56" fill="transparent" r="48" stroke="currentColor" strokeWidth="8"></circle>
              <circle 
                className="text-primary transition-all duration-500" 
                cx="56" 
                cy="56" 
                fill="transparent" 
                r="48" 
                stroke="currentColor" 
                strokeDasharray="301.59" 
                strokeDashoffset={301.59 - (301.59 * Math.min(bookingsToday, visitorLimit)) / visitorLimit} 
                strokeWidth="8"
              ></circle>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-extrabold text-primary">{((bookingsToday / visitorLimit) * 100).toFixed(1)}%</span>
              <span className="text-[9px] text-on-surface-variant font-bold uppercase">{t('utilized')}</span>
            </div>
          </div>
          <p className="text-xs font-medium mt-4">{t('capacityUtilization')}</p>
        </div>
      </section>

      {/* Main Capacity Controls & Visuals */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Capacity Progress & Configurations */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Live Capacity Status Card */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-soft relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">{t('liveCapacityStatus')}</h3>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-primary"></span>
                  <span className="text-on-surface-variant font-medium">{t('onlineBooked')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-primary-container opacity-60"></span>
                  <span className="text-on-surface-variant font-medium">{t('walkins')}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="relative h-12 w-full bg-outline-variant/20 rounded-xl overflow-hidden shadow-inner flex">
                <div className="h-full bg-primary transition-all duration-700 ease-out flex items-center px-4" style={{ width: `${(onlineBookings / visitorLimit) * 100}%` }}>
                  <span className="text-on-primary text-[11px] font-bold truncate">{t('online')} ({(onlineBookings / 1000).toFixed(1)}k)</span>
                </div>
                <div className="h-full bg-primary-container opacity-60 transition-all duration-700 ease-out flex items-center px-4" style={{ width: `${(walkIns / visitorLimit) * 100}%` }}>
                  <span className="text-on-primary-container text-[11px] font-bold truncate">{t('walkins')} ({(walkIns / 1000).toFixed(1)}k)</span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30">
                  <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mb-1">{t('online')}</p>
                  <p className="text-xl font-bold text-primary">{onlineBookings.toLocaleString()}</p>
                </div>
                <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30">
                  <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mb-1">{t('walkins')}</p>
                  <p className="text-xl font-bold text-on-secondary-container">{walkIns.toLocaleString()}</p>
                </div>
                <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30">
                  <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mb-1">{t('cancelled')}</p>
                  <p className="text-xl font-bold text-error">1,120</p>
                </div>
                <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30">
                  <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider mb-1">{t('vipSpecial')}</p>
                  <p className="text-xl font-bold text-tertiary">450</p>
                </div>
              </div>
            </div>
          </div>

          {/* Configuration Card */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-soft">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-primary">settings_applications</span>
              <h3 className="text-lg font-bold">{t('capacityConfiguration')}</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-on-surface mb-2">{t('maxVisitorsPerDay')}</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-60">person</span>
                    <input 
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-outline-variant focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm font-bold" 
                      type="number" 
                      value={visitorLimit}
                      onChange={(e) => setVisitorLimit(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    />
                  </div>
                  <p className="text-[11px] text-on-surface-variant mt-2 italic">{t('standardLimitDesc') || 'Standard limit based on temple floor space analysis.'}</p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-on-surface mb-2">{t('maxVehiclesPerDay')}</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-60">directions_car</span>
                    <input 
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-outline-variant focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm font-bold" 
                      type="number" 
                      value={vehicleLimit}
                      onChange={(e) => setVehicleLimit(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 flex flex-col justify-between">
                <div>
                  <label className="block text-sm font-bold text-on-surface mb-2">{t('maxPersonsPerBooking')}</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-60">group_add</span>
                    <select 
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-outline-variant focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none transition-all text-sm font-bold"
                      value={maxPersons}
                      onChange={(e) => setMaxPersons(e.target.value)}
                    >
                      <option value="5">5 {t('persons')}</option>
                      <option value="10">10 {t('persons')}</option>
                      <option value="15">15 {t('persons')}</option>
                      <option value="20">20 {t('persons')}</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">expand_more</span>
                  </div>
                </div>
                <div className="pt-4 flex items-center justify-end gap-3">
                  <button 
                    onClick={handleReset}
                    className="px-5 py-2.5 rounded-xl text-on-surface-variant font-bold text-sm hover:bg-surface-variant transition-colors"
                  >
                    {t('resetToDefaults')}
                  </button>
                  <button 
                    onClick={handleSave}
                    className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-sm hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95"
                  >
                    {t('saveChanges')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Status and Quick Actions */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Capacity Status Card */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-soft flex flex-col gap-6">
            <div className="flex flex-col items-center text-center gap-2">
              <div className="w-20 h-20 rounded-full bg-tertiary/10 flex items-center justify-center mb-2">
                <div className="w-12 h-12 rounded-full bg-tertiary/20 flex items-center justify-center pulse-indicator flex-shrink-0">
                  <span className="material-symbols-outlined text-tertiary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {isBookingOpen ? 'check_circle' : 'block'}
                  </span>
                </div>
              </div>
              <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">{t('currentStatus')}</h4>
              <div className={`px-4 py-1.5 rounded-full font-bold text-sm ${isBookingOpen ? 'bg-tertiary-fixed text-on-tertiary-fixed' : 'bg-error-container text-on-error-container'}`}>
                {isBookingOpen ? t('openForBooking') : t('bookingsStopped')}
              </div>
            </div>

            <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant/30 flex items-start gap-4">
              <span className="material-symbols-outlined text-primary mt-1">trending_up</span>
              <div>
                <p className="text-sm font-bold text-on-surface">{t('bookingRate')}</p>
                <p className="text-xs text-on-surface-variant">
                  {t('bookingRateDesc') || 'Slots are currently being booked at a rate of'} <span className="font-bold text-primary">{bookingRate}/hr</span>.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              <button 
                onClick={handleUpdateCapacity}
                className="w-full py-3.5 rounded-xl bg-primary text-on-primary font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                <span className="material-symbols-outlined">update</span>
                {t('updateCapacity') || 'Update Capacity'}
              </button>
              
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setIsBookingOpen(false)}
                  disabled={!isBookingOpen}
                  className={`py-2.5 px-2 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                    !isBookingOpen 
                      ? 'border-outline-variant/40 text-on-surface-variant/40 cursor-not-allowed bg-surface-container' 
                      : 'border-outline text-on-surface-variant hover:bg-error/5 hover:text-error hover:border-error active:scale-95'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">block</span>
                  {t('stop')}
                </button>
                
                <button 
                  onClick={() => setIsBookingOpen(true)}
                  disabled={isBookingOpen}
                  className={`py-2.5 px-2 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                    isBookingOpen 
                      ? 'bg-surface-container-highest text-on-surface-variant opacity-40 cursor-not-allowed' 
                      : 'bg-primary text-on-primary hover:bg-primary/95 active:scale-95'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">play_arrow</span>
                  {t('resume')}
                </button>
              </div>
            </div>
          </div>

          {/* System Alerts */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-soft flex flex-col gap-4">
            <h4 className="text-sm font-bold flex items-center gap-2 text-on-surface">
              <span className="material-symbols-outlined text-primary text-lg">notification_important</span>
              {t('systemAlerts')}
            </h4>
            <div className="space-y-4 max-h-[250px] overflow-y-auto custom-scrollbar pr-2">
              <div className="flex gap-4 p-3 rounded-xl bg-surface hover:bg-surface-variant transition-colors border-l-4 border-primary cursor-pointer">
                <div className="shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-sm">warning</span>
                </div>
                <div>
                  <p className="text-xs font-bold">{t('alert1Title') || 'Afternoon Slot Spike'}</p>
                  <p className="text-[11px] text-on-surface-variant leading-tight mt-0.5">
                    {t('alert1Desc') || '14:00 - 15:00 slots reaching 90% capacity. Recommended: Open standby queue.'}
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-3 rounded-xl bg-surface hover:bg-surface-variant transition-colors border-l-4 border-tertiary cursor-pointer">
                <div className="shrink-0 w-8 h-8 rounded-full bg-tertiary/10 flex items-center justify-center text-tertiary">
                  <span className="material-symbols-outlined text-sm">cloud_done</span>
                </div>
                <div>
                  <p className="text-xs font-bold">{t('alert2Title') || 'API Sync Successful'}</p>
                  <p className="text-[11px] text-on-surface-variant leading-tight mt-0.5">
                    {t('alert2Desc') || "Online booking partner 'DharmaTravels' capacity synced 5 mins ago."}
                  </p>
                </div>
              </div>

              <div className="flex gap-4 p-3 rounded-xl bg-surface hover:bg-surface-variant transition-colors border-l-4 border-outline cursor-pointer">
                <div className="shrink-0 w-8 h-8 rounded-full bg-outline-variant/30 flex items-center justify-center text-on-surface-variant">
                  <span className="material-symbols-outlined text-sm">info</span>
                </div>
                <div>
                  <p className="text-xs font-bold">{t('alert3Title') || 'Night Limit Auto-Applied'}</p>
                  <p className="text-[11px] text-on-surface-variant leading-tight mt-0.5">
                    {t('alert3Desc') || 'Night darshan limits reduced to 2,000 per hour as per scheduled maintenance.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </section>
    </div>
  );
}
