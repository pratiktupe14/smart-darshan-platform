import React, { useEffect, useState } from 'react';
import QRCode from 'react-qr-code';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useUser } from '../../context/UserContext';

export default function Dashboard() {
  const { t } = useLanguage();
  const { user } = useUser();

  const [progress, setProgress] = useState(0);
  const [activeBooking, setActiveBooking] = useState(null);
  const [queueInfo, setQueueInfo] = useState({
    currentServingToken: 'None',
    userTokenNumber: 'N/A',
    position: 0,
    estWait: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      const identifier = user._id || user.id || user.mobileNumber || user.mobile;
      if (!identifier) {
        console.log('[Dashboard] No valid user identifier found yet.');
        return;
      }
      try {
        console.log('[Dashboard] Logged-in User ID:', user._id || user.id);
        console.log('[Dashboard] Authentication Session:', user);
        console.log('[Dashboard] Querying bookings for identifier:', identifier);
        const res = await fetch(`http://localhost:5000/api/bookings/user/${identifier}`);
        if(res.ok) {
            const bookings = await res.json();
            console.log('[Dashboard] Database Query Result (Bookings):', bookings);
            
            // Align with MyPass active booking query
            const active = bookings.find(b => b.status !== 'completed' && b.status !== 'cancelled' && b.verificationStatus !== 'completed');
            console.log('[Dashboard] My Pass Fetch Result (Active Booking):', active);
            if (active) {
              console.log('[Dashboard] Booking User ID (Owner):', active.userId);
              console.log('[Dashboard] QR Code:', active.qrCode);
            } else {
              console.log('[Dashboard] Booking User ID (Owner): None (No active booking found)');
            }
            setActiveBooking(active);

            // Fetch queue status
            const qRes = await fetch(`http://localhost:5000/api/queue`);
            const queueList = await qRes.json();
            
            // Find current serving
            const currentServing = queueList.filter(q => q.status === 'serving');
            
            // Find user's token
            let userToken = null;
            let pos = 0;
            let waitingQueue = queueList.filter(q => q.status === 'waiting');
            if (active) {
                userToken = queueList.find(q => q.bookingId && (q.bookingId._id === active._id || q.bookingId === active._id));
                if (userToken && userToken.status === 'waiting') {
                    pos = waitingQueue.findIndex(q => q._id === userToken._id) + 1;
                }
            }
            
            let currProgress = 25;
            if (active) {
              const status = active.verificationStatus || 'none';
              if (status === 'verified_entry') {
                currProgress = 50;
              } else if (status === 'in_queue') {
                currProgress = pos === 0 ? (userToken && userToken.status === 'serving' ? 85 : 75) : Math.max(60, 100 - (pos * 5));
              } else if (status === 'completed') {
                currProgress = 100;
              } else {
                currProgress = 25;
              }
            } else {
              const completedBooking = bookings.find(b => b.status === 'completed' || b.verificationStatus === 'completed');
              if (completedBooking) {
                currProgress = 100;
              }
            }

            setQueueInfo({
                currentServingToken: currentServing.length > 0 ? currentServing[0].tokenNumber : 'None',
                userTokenNumber: userToken ? userToken.tokenNumber : 'N/A',
                position: pos,
                estWait: pos * 2, // 2 mins per token
            });
            setProgress(currProgress);
        }
      } catch (err) {
        console.error('[Dashboard] Error fetching booking data:', err);
      }
    };

    fetchData();
    const timer = setInterval(fetchData, 10000);

    return () => clearInterval(timer);
  }, [user]);

  const userTokenNumber = queueInfo.userTokenNumber !== 'N/A' ? queueInfo.userTokenNumber : (activeBooking?.qrCode ? activeBooking.qrCode.split('-')[1] : 'N/A');

  const isPassGenerated = !!(
    activeBooking &&
    activeBooking.qrCode &&
    userTokenNumber !== 'N/A' &&
    user && (
      (activeBooking.userId && (String(activeBooking.userId) === String(user._id) || String(activeBooking.userId) === String(user.id))) ||
      (activeBooking.mobile && (activeBooking.mobile === user.mobileNumber || activeBooking.mobile === user.mobile))
    )
  );

  return (
    <main className="px-4 md:px-10 pb-12 pt-8 md:pt-16 max-w-[1600px] mx-auto w-full">
      {/* Welcome Section */}
      <section className="mb-8 md:mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary leading-tight">Welcome back, {user?.fullName || 'User'}</h1>
          {isPassGenerated && (
            <div className="flex flex-wrap items-center gap-2 md:gap-3">
              <span className="px-3 py-1 bg-surface-container-highest text-primary text-xs md:text-sm font-medium rounded-full flex items-center gap-1">
                <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                {t('darshanDateLabel') || 'Darshan Date'}: {activeBooking ? new Date(activeBooking.darshanDate).toLocaleDateString() : 'N/A'}
              </span>
              <span className="px-3 py-1 bg-green-100 text-green-800 text-xs md:text-sm font-medium rounded-full flex items-center gap-1">
                <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                {t('currentStatus')}
              </span>
            </div>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Link to="/dashboard/book" className="flex-1 sm:flex-none h-12 md:h-14 px-6 bg-primary text-on-primary rounded-lg font-semibold flex items-center justify-center gap-3 shadow-md hover:scale-[1.02] transition-transform text-center">
            <span className="material-symbols-outlined">book_online</span>
            {t('bookDarshan')}
          </Link>
          <Link to="/dashboard/user-queue" className="flex-1 sm:flex-none h-12 md:h-14 px-6 border-2 border-primary text-primary rounded-lg font-semibold flex items-center justify-center gap-3 hover:bg-primary/5 transition-colors text-center">
            <span className="material-symbols-outlined">analytics</span>
            {t('queueStatus')}
          </Link>
        </div>
      </section>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
        {/* Digital Darshan Pass */}
        <div className="md:col-span-12 xl:col-span-8 flex flex-col">
          <h3 className="text-lg md:text-xl font-semibold text-on-surface mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">confirmation_number</span>
            {t('digitalPass')}
          </h3>
          {!isPassGenerated ? (
            <div className="bg-white rounded-xl border border-outline-variant p-8 flex flex-col items-center justify-center text-center shadow-lg w-full min-h-[300px]">
              <span className="material-symbols-outlined text-5xl text-primary mb-3">confirmation_number</span>
              <h4 className="text-xl font-bold text-on-surface mb-2">No Active Pass Available</h4>
              <div className="text-on-surface-variant mb-6 max-w-[450px] space-y-2 text-sm">
                <p>You do not have any active darshan bookings at the moment.</p>
                <p>Book a darshan slot to generate your digital pass.</p>
              </div>
              <Link to="/dashboard/book" className="h-12 px-6 bg-primary text-on-primary rounded-lg font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                <span className="material-symbols-outlined">book_online</span>
                Book Darshan Now
              </Link>
            </div>
          ) : (
            <div className="relative bg-white rounded-xl shadow-lg overflow-hidden flex flex-col lg:flex-row border border-outline-variant">
              {/* Ticket Main Body */}
              <div className="flex-grow p-6 md:p-8 bg-white">
                <div className="flex justify-between items-start mb-6 gap-4">
                  <div>
                    <p className="text-[10px] md:text-xs text-on-surface-variant uppercase tracking-wider mb-1">{t('devoteeName')}</p>
                    <p className="text-lg md:text-xl font-bold text-on-surface">{user?.fullName || activeBooking?.fullName || 'User'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] md:text-xs text-on-surface-variant uppercase tracking-wider mb-1">{t('tokenId')}</p>
                    <p className="text-xl md:text-2xl font-bold text-primary">#{userTokenNumber}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 md:gap-y-6 gap-x-4">
                  <div>
                    <p className="text-xs text-on-surface-variant mb-0.5 md:mb-1">{t('mobile')}</p>
                    <p className="text-sm md:text-base font-semibold">{user?.mobileNumber || user?.mobile || activeBooking?.mobile || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-on-surface-variant mb-0.5 md:mb-1">Vehicle No.</p>
                    <p className="text-sm md:text-base font-semibold">{activeBooking ? (activeBooking.vehicleNumber || 'None') : 'None'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-on-surface-variant mb-0.5 md:mb-1">{t('persons')}</p>
                    <p className="text-sm md:text-base font-semibold">{activeBooking ? activeBooking.persons : 0} (Adults)</p>
                  </div>
                  <div>
                    <p className="text-xs text-on-surface-variant mb-0.5 md:mb-1">{t('reportingTime')}</p>
                    <p className="text-sm md:text-base font-semibold">{activeBooking ? new Date(activeBooking.darshanDate).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>
                <div className="mt-6 md:mt-8 pt-6 border-t border-dashed border-outline-variant flex flex-col sm:flex-row gap-3 md:gap-4">
                  <Link to="/dashboard/pass" className="flex-1 h-12 bg-surface-container-high text-primary px-4 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-surface-container-highest transition-colors text-center">
                    <span className="material-symbols-outlined text-xl">visibility</span>
                    {t('viewPass')}
                  </Link>
                  <button className="flex-grow flex-1 h-12 bg-primary text-on-primary px-4 rounded-lg font-semibold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:opacity-90">
                    <span className="material-symbols-outlined text-xl">download</span>
                    {t('downloadPass')}
                  </button>
                </div>
              </div>
              
              {/* Ticket QR Section */}
              <div className="bg-surface-container-low p-6 md:p-8 flex flex-col items-center justify-center lg:min-w-[280px] border-t lg:border-t-0 lg:border-l border-dashed border-outline-variant">
                <div className="bg-white p-3 rounded-xl shadow-inner mb-4 w-40 h-40 flex items-center justify-center">
                  <QRCode 
                    value={activeBooking ? `TOKEN-${userTokenNumber}-${activeBooking._id}` : `TOKEN-NONE`} 
                    size={120} 
                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                  />
                </div>
                <p className="text-xs md:text-sm text-on-surface-variant text-center font-medium">{t('entranceGate')}</p>
                <div className="mt-4 w-full max-w-[180px]">
                  <div className="h-12 flex items-center justify-center bg-white rounded-lg px-4 border border-outline-variant shadow-sm">
                    <span className="font-mono text-base md:text-lg font-bold tracking-widest">{userTokenNumber}-RX42</span>
                  </div>
                </div>
                <div className="mt-8 pt-6 border-t border-outline-variant/30 w-full">
                  <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-lg">cloud</span>
                    Current Temple Weather
                  </h4>
                  <div className="bg-white p-4 rounded-lg border border-outline-variant/50 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-2xl">partly_cloudy_day</span>
                        <span className="text-xl font-bold text-on-surface">28°C</span>
                      </div>
                      <span className="text-sm font-medium text-on-surface-variant">Partly Cloudy</span>
                    </div>
                    <p className="text-[10px] md:text-xs text-on-surface-variant font-medium">
                      Oct 24, 2024 | 10:30 AM
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Queue Status Card & Map */}
        <div className="md:col-span-12 xl:col-span-4 flex flex-col gap-6">
          <h3 className="text-lg md:text-xl font-semibold text-on-surface mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">timer</span>
            {t('liveQueue')}
          </h3>
          
          <div className="bg-white p-6 rounded-xl shadow-lg border border-outline-variant flex-grow">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs text-on-surface-variant">{t('currentToken')}</p>
                <p className="text-xl md:text-2xl font-bold text-on-surface">{queueInfo.currentServingToken}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-on-surface-variant">{t('yourToken')}</p>
                <p className="text-xl md:text-2xl font-bold text-primary">{userTokenNumber}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs md:text-sm">
                <span className="text-on-surface-variant">{t('queueProgress')}</span>
                <span className="text-primary font-bold">{Math.floor(progress)}% {t('complete')}</span>
              </div>
              <div className="w-full h-3 bg-surface-container-highest rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-secondary-container rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
              </div>
              <div className="grid grid-cols-2 gap-3 md:gap-4 mt-6">
                <div className="bg-surface-container-low p-4 rounded-lg text-center">
                  <p className="text-[10px] md:text-xs text-on-surface-variant mb-1 uppercase">{t('queuePosition')}</p>
                  <p className="text-base md:text-lg font-bold text-on-surface">{queueInfo.position} <span className="text-[10px] md:text-xs font-normal">{t('away')}</span></p>
                </div>
                <div className="bg-surface-container-low p-4 rounded-lg text-center">
                  <p className="text-[10px] md:text-xs text-on-surface-variant mb-1 uppercase">{t('estWait')}</p>
                  <p className="text-base md:text-lg font-bold text-on-surface">{queueInfo.estWait} <span className="text-[10px] md:text-xs font-normal">{t('mins')}</span></p>
                </div>
              </div>
            </div>
            <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/10 flex items-start gap-3">
              <span className="material-symbols-outlined text-primary text-xl">info</span>
              <p className="text-xs text-on-surface-variant leading-relaxed">Please arrive at the holding area 15 minutes before your estimated time.</p>
            </div>
          </div>

          {/* Temple Directions Card */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-outline-variant">
            <div className="h-32 md:h-40 relative group cursor-pointer overflow-hidden">
              <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Map view" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA1NtQZMeVBKwdrnShTWtGDF6zEyIndWZEj-W4F7JovzgJVUtPWr9zMBmF9N5WhXlIKUVk08vlfivc3i94CVUsPWf40UCuyI1g37rwIfv666ETz7-VzSF--JXHonZdUs3tac5DA7_ZDLlX2aOBrJLY3tdGaUp1I2ktDnh70dXDzCcVY0fMfHdNta5mSbTGAqReavHWW6ecqYPiCFoGUEf9gGHPkHDQbLNV1c44JQ3dn19P51o4vQaDk6cpTFA8xUa9pjb3oR627dgk" />
              <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="bg-white text-primary px-4 py-2 rounded-full font-semibold text-xs md:text-sm shadow-xl">View Larger Map</span>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-on-surface truncate">Main Temple Complex</p>
                  <p className="text-[10px] md:text-xs text-on-surface-variant truncate">Gate No. 3, North Entrance, Sector 42A</p>
                </div>
                <button className="p-2 bg-primary text-on-primary rounded-full hover:scale-110 transition-transform shrink-0">
                  <span className="material-symbols-outlined text-[18px] md:text-[20px]">directions</span>
                </button>
              </div>
              <button className="w-full mt-3 h-10 border border-outline text-on-surface-variant rounded-lg text-xs font-medium hover:bg-surface-container-low transition-colors">
                Open in Google Maps
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Info Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mt-8 md:mt-12">
        {/* Darshan Timings */}
        <div className="bg-white p-6 rounded-xl border border-outline-variant h-full">
          <h4 className="text-lg font-semibold text-on-surface mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">schedule</span>
            {t('timingsTitle')}
          </h4>
          <div className="space-y-1">
            <div className="flex justify-between items-center py-3 border-b border-outline-variant/30">
              <span className="text-sm md:text-base font-medium">Morning Aarti</span>
              <span className="font-mono text-primary font-bold text-sm md:text-base">04:30 AM</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-outline-variant/30">
              <span className="text-sm md:text-base font-medium">Public Darshan (AM)</span>
              <span className="font-mono text-primary font-bold text-sm md:text-base">06:00 - 12:00</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-outline-variant/30">
              <span className="text-sm md:text-base font-medium">Mid-day Break</span>
              <span className="font-mono text-on-surface-variant text-sm md:text-base">12:30 - 04:00</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-sm md:text-base font-medium">Evening Aarti</span>
              <span className="font-mono text-primary font-bold text-sm md:text-base">07:00 PM</span>
            </div>
          </div>
        </div>

        {/* Festival Notices */}
        <div className="bg-white p-6 rounded-xl border border-outline-variant h-full">
          <h4 className="text-lg font-semibold text-on-surface mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">campaign</span>
            {t('noticesTitle')}
          </h4>
          <div className="space-y-4">
            <div className="flex gap-4 p-3 hover:bg-surface-container-low rounded-lg transition-colors cursor-pointer group">
              <div className="bg-secondary-container/20 p-2 h-fit rounded text-secondary shrink-0">
                <span className="material-symbols-outlined">event_repeat</span>
              </div>
              <div>
                <p className="text-sm md:text-base font-semibold group-hover:text-primary transition-colors">Sharad Purnima Utsav</p>
                <p className="text-xs text-on-surface-variant leading-relaxed">Special night darshan available from Oct 27-29. Pre-booking mandatory.</p>
              </div>
            </div>
            <div className="flex gap-4 p-3 hover:bg-surface-container-low rounded-lg transition-colors cursor-pointer group">
              <div className="bg-secondary-container/20 p-2 h-fit rounded text-secondary shrink-0">
                <span className="material-symbols-outlined">warning</span>
              </div>
              <div>
                <p className="text-sm md:text-base font-semibold group-hover:text-primary transition-colors">Parking Maintenance</p>
                <p className="text-xs text-on-surface-variant leading-relaxed">Parking Lot B will be closed on Oct 25. Please use Multi-level Lot C.</p>
              </div>
            </div>
          </div>
          <Link to="/dashboard/announcements" className="w-full mt-4 py-2 text-primary font-semibold text-sm hover:underline block text-center">
            {t('viewAllNotices')}
          </Link>
        </div>

        {/* Quick Links / Support */}
        <div className="bg-primary-container p-6 rounded-xl text-on-primary-container flex flex-col justify-between md:col-span-2 lg:col-span-1 min-h-[300px]">
          <div>
            <h4 className="text-lg md:text-xl font-bold mb-2">{t('assistance')}</h4>
            <p className="text-sm opacity-90 leading-relaxed mb-6">{t('assistanceDesc')}</p>
            <div className="space-y-3">
              <a className="flex items-center gap-3 bg-white/10 p-3.5 rounded-lg hover:bg-white/20 transition-colors" href="tel:1800-123-456">
                <span className="material-symbols-outlined">call</span>
                <span className="text-sm md:text-base font-medium">Helpline: 1800-123-456</span>
              </a>
              <a className="flex items-center gap-3 bg-white/10 p-3.5 rounded-lg hover:bg-white/20 transition-colors" href="#">
                <span className="material-symbols-outlined">chat</span>
                <span className="text-sm md:text-base font-medium">Live Chat with Admin</span>
              </a>
            </div>
          </div>
          <div className="mt-8 flex justify-center">
            <img className="w-24 md:w-32 h-auto opacity-30" alt="Illustration" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB8qfQInAEaN3batfDnJ9OjU4ukVGdF8ttc4C3jocmoZn8XD_A7m8NsUhJTzym2O0_OtOVX5e4Ziyzlca8cgNF8f-MJLUIZrBHFzTNPjQF1gydbwSSC-l5ux2mSU-yJr6M0vb8bwpVnX9ZEkJdR_Q6D7mFUnegA5cLSj5rKuvqo4DJEGkcE-Okbwa65NROxPmA4qA2IWtSlmrzEnbCv5rPavgREwTh_DxDat_JrMi1CnpzRLc-9fHiH_1Loxyb_HLs3gPwiHs-Ikog" />
          </div>
        </div>
      </div>
    </main>
  );
}
