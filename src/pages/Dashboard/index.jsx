import React, { useEffect, useState } from 'react';
import QRCode from 'react-qr-code';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useUser } from '../../context/UserContext';
export default function Dashboard() {
  const {
    t
  } = useLanguage();
  const {
    user
  } = useUser();
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
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/bookings/user/${identifier}`);
        if (res.ok) {
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
          const qRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/queue`);
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
              currProgress = pos === 0 ? userToken && userToken.status === 'serving' ? 85 : 75 : Math.max(60, 100 - pos * 5);
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
            estWait: pos * 2 // 2 mins per token
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
  const userTokenNumber = queueInfo.userTokenNumber !== 'N/A' ? queueInfo.userTokenNumber : activeBooking?.qrCode ? activeBooking.qrCode.split('-')[1] : 'N/A';
  const isPassGenerated = !!(activeBooking && activeBooking.qrCode && userTokenNumber !== 'N/A' && user && (activeBooking.userId && (String(activeBooking.userId) === String(user._id) || String(activeBooking.userId) === String(user.id)) || activeBooking.mobile && (activeBooking.mobile === user.mobileNumber || activeBooking.mobile === user.mobile)));
  return <main className="px-4 md:px-10 pb-12 pt-8 md:pt-16 max-w-[1600px] mx-auto w-full">
      {/* Welcome Section */}
      <section className="mb-8 md:mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary leading-tight">Welcome back, {user?.fullName || 'User'}</h1>
          {isPassGenerated && <div className="flex flex-wrap items-center gap-2 md:gap-3">
              <span className="px-3 py-1 bg-surface-container-highest text-primary text-xs md:text-sm font-medium rounded-full flex items-center gap-1">
                <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                {t('darshanDateLabel') || 'Darshan Date'}: {activeBooking ? new Date(activeBooking.darshanDate).toLocaleDateString() : 'N/A'}
              </span>
              <span className="px-3 py-1 bg-green-100 text-green-800 text-xs md:text-sm font-medium rounded-full flex items-center gap-1">
                <span className="material-symbols-outlined text-[18px]" style={{
              fontVariationSettings: "'FILL' 1"
            }}>check_circle</span>
                {t('currentStatus')}
              </span>
            </div>}
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
          {!isPassGenerated ? <div className="bg-white rounded-xl border border-outline-variant p-8 flex flex-col items-center justify-center text-center shadow-lg w-full min-h-[300px]">
              <span className="material-symbols-outlined text-5xl text-primary mb-3">confirmation_number</span>
              <h4 className="text-xl font-bold text-on-surface mb-2">{t("noActivePassAvailable")}</h4>
              <div className="text-on-surface-variant mb-6 max-w-[450px] space-y-2 text-sm">
                <p>{t("youDoNotHaveAnyActiveDarshanBo")}</p>
                <p>{t("bookADarshanSlotToGenerateYour")}</p>
              </div>
              <Link to="/dashboard/book" className="h-12 px-6 bg-primary text-on-primary rounded-lg font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                <span className="material-symbols-outlined">book_online</span>{t("bookDarshanNow")}</Link>
            </div> : <div className="relative bg-white rounded-xl shadow-lg overflow-hidden flex flex-col lg:flex-row border border-outline-variant">
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
                    <p className="text-xs text-on-surface-variant mb-0.5 md:mb-1">{t("vehicleNo")}</p>
                    <p className="text-sm md:text-base font-semibold">{activeBooking ? activeBooking.vehicleNumber || 'None' : 'None'}</p>
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
                  <QRCode value={activeBooking ? `TOKEN-${userTokenNumber}-${activeBooking._id}` : `TOKEN-NONE`} size={120} style={{
                height: "auto",
                maxWidth: "100%",
                width: "100%"
              }} />
                </div>
                <p className="text-xs md:text-sm text-on-surface-variant text-center font-medium">{t('entranceGate')}</p>
                <div className="mt-4 w-full max-w-[180px]">
                  <div className="h-12 flex items-center justify-center bg-white rounded-lg px-4 border border-outline-variant shadow-sm">
                    <span className="font-mono text-base md:text-lg font-bold tracking-widest">{userTokenNumber}-RX42</span>
                  </div>
                </div>
                <div className="mt-8 pt-6 border-t border-outline-variant/30 w-full">
                  <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-lg">cloud</span>{t("currentTempleWeather")}</h4>
                  <div className="bg-white p-4 rounded-lg border border-outline-variant/50 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-2xl">partly_cloudy_day</span>
                        <span className="text-xl font-bold text-on-surface">{t("28c")}</span>
                      </div>
                      <span className="text-sm font-medium text-on-surface-variant">{t("partlyCloudy")}</span>
                    </div>
                    <p className="text-[10px] md:text-xs text-on-surface-variant font-medium">{t("oct2420241030Am")}</p>
                  </div>
                </div>
              </div>
            </div>}
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
                <div className="h-full bg-gradient-to-r from-primary to-secondary-container rounded-full transition-all duration-1000" style={{
                width: `${progress}%`
              }}></div>
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
              <p className="text-xs text-on-surface-variant leading-relaxed">{t("pleaseArriveAtTheHoldingArea15")}</p>
            </div>
          </div>

          {/* Temple Directions Card */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-outline-variant">
            <a href="https://www.google.com/maps/place/ardhanareshwari+nag+jotirling/@20.6836728,73.7838213,17z/data=!3m1!4b1!4m6!3m5!1s0x3bde3de27d6c9e1d:0x42fcd5a79fa923be!8m2!3d20.6836728!4d73.7864016!16s%2Fg%2F11b7jjr46p?hl=en-IN&entry=ttu&g_ep=EgoyMDI2MDYyMy4wIKXMDSoASAFQAw%3D%3D" target="_blank" rel="noreferrer" className="block h-32 md:h-40 relative group cursor-pointer overflow-hidden">
              <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Map view" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA1NtQZMeVBKwdrnShTWtGDF6zEyIndWZEj-W4F7JovzgJVUtPWr9zMBmF9N5WhXlIKUVk08vlfivc3i94CVUsPWf40UCuyI1g37rwIfv666ETz7-VzSF--JXHonZdUs3tac5DA7_ZDLlX2aOBrJLY3tdGaUp1I2ktDnh70dXDzCcVY0fMfHdNta5mSbTGAqReavHWW6ecqYPiCFoGUEf9gGHPkHDQbLNV1c44JQ3dn19P51o4vQaDk6cpTFA8xUa9pjb3oR627dgk" />
              <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="bg-white text-primary px-4 py-2 rounded-full font-semibold text-xs md:text-sm shadow-xl">{t("viewLargerMap")}</span>
              </div>
            </a>
            <div className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-on-surface truncate">{t("ardhanareshwariNagJotirling")}</p>
                  <p className="text-[10px] md:text-xs text-on-surface-variant truncate">{t("tapMapToOpenDirections")}</p>
                </div>
                <a href="https://www.google.com/maps/place/ardhanareshwari+nag+jotirling/@20.6836728,73.7838213,17z/data=!3m1!4b1!4m6!3m5!1s0x3bde3de27d6c9e1d:0x42fcd5a79fa923be!8m2!3d20.6836728!4d73.7864016!16s%2Fg%2F11b7jjr46p?hl=en-IN&entry=ttu&g_ep=EgoyMDI2MDYyMy4wIKXMDSoASAFQAw%3D%3D" target="_blank" rel="noreferrer" className="inline-block p-2 bg-primary text-on-primary rounded-full hover:scale-110 transition-transform shrink-0">
                  <span className="material-symbols-outlined text-[18px] md:text-[20px] block">directions</span>
                </a>
              </div>
              <a href="https://www.google.com/maps/place/ardhanareshwari+nag+jotirling/@20.6836728,73.7838213,17z/data=!3m1!4b1!4m6!3m5!1s0x3bde3de27d6c9e1d:0x42fcd5a79fa923be!8m2!3d20.6836728!4d73.7864016!16s%2Fg%2F11b7jjr46p?hl=en-IN&entry=ttu&g_ep=EgoyMDI2MDYyMy4wIKXMDSoASAFQAw%3D%3D" target="_blank" rel="noreferrer" className="flex items-center justify-center w-full mt-3 h-10 border border-outline text-on-surface-variant rounded-lg text-xs font-medium hover:bg-surface-container-low transition-colors">{t("openInGoogleMaps")}</a>
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
              <span className="text-sm md:text-base font-medium">{t("morningAarti")}</span>
              <span className="font-mono text-primary font-bold text-sm md:text-base">{t("0430Am")}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-outline-variant/30">
              <span className="text-sm md:text-base font-medium">{t("publicDarshanAm")}</span>
              <span className="font-mono text-primary font-bold text-sm md:text-base">06:00 - 12:00</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-outline-variant/30">
              <span className="text-sm md:text-base font-medium">{t("middayBreak")}</span>
              <span className="font-mono text-on-surface-variant text-sm md:text-base">12:30 - 04:00</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-sm md:text-base font-medium">{t("eveningAarti")}</span>
              <span className="font-mono text-primary font-bold text-sm md:text-base">{t("0700Pm")}</span>
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
                <p className="text-sm md:text-base font-semibold group-hover:text-primary transition-colors">{t("sharadPurnimaUtsav")}</p>
                <p className="text-xs text-on-surface-variant leading-relaxed">{t("specialNightDarshanAvailableFr")}</p>
              </div>
            </div>
            <div className="flex gap-4 p-3 hover:bg-surface-container-low rounded-lg transition-colors cursor-pointer group">
              <div className="bg-secondary-container/20 p-2 h-fit rounded text-secondary shrink-0">
                <span className="material-symbols-outlined">warning</span>
              </div>
              <div>
                <p className="text-sm md:text-base font-semibold group-hover:text-primary transition-colors">{t("parkingMaintenance")}</p>
                <p className="text-xs text-on-surface-variant leading-relaxed">{t("parkingLotBWillBeClosedOnOct25")}</p>
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
                <span className="text-sm md:text-base font-medium">{t("helpline1800123456")}</span>
              </a>
              <a className="flex items-center gap-3 bg-white/10 p-3.5 rounded-lg hover:bg-white/20 transition-colors" href="#">
                <span className="material-symbols-outlined">chat</span>
                <span className="text-sm md:text-base font-medium">{t("liveChatWithAdmin")}</span>
              </a>
            </div>
              }}></div>
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
              <p className="text-xs text-on-surface-variant leading-relaxed">{t("pleaseArriveAtTheHoldingArea15")}</p>
            </div>
          </div>

          {/* Temple Directions Card */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-outline-variant">
            <a href="https://www.google.com/maps/place/ardhanareshwari+nag+jotirling/@20.6836728,73.7838213,17z/data=!3m1!4b1!4m6!3m5!1s0x3bde3de27d6c9e1d:0x42fcd5a79fa923be!8m2!3d20.6836728!4d73.7864016!16s%2Fg%2F11b7jjr46p?hl=en-IN&entry=ttu&g_ep=EgoyMDI2MDYyMy4wIKXMDSoASAFQAw%3D%3D" target="_blank" rel="noreferrer" className="block h-32 md:h-40 relative group cursor-pointer overflow-hidden">
              <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Map view" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA1NtQZMeVBKwdrnShTWtGDF6zEyIndWZEj-W4F7JovzgJVUtPWr9zMBmF9N5WhXlIKUVk08vlfivc3i94CVUsPWf40UCuyI1g37rwIfv666ETz7-VzSF--JXHonZdUs3tac5DA7_ZDLlX2aOBrJLY3tdGaUp1I2ktDnh70dXDzCcVY0fMfHdNta5mSbTGAqReavHWW6ecqYPiCFoGUEf9gGHPkHDQbLNV1c44JQ3dn19P51o4vQaDk6cpTFA8xUa9pjb3oR627dgk" />
              <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="bg-white text-primary px-4 py-2 rounded-full font-semibold text-xs md:text-sm shadow-xl">{t("viewLargerMap")}</span>
              </div>
            </a>
            <div className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-on-surface truncate">{t("ardhanareshwariNagJotirling")}</p>
                  <p className="text-[10px] md:text-xs text-on-surface-variant truncate">{t("tapMapToOpenDirections")}</p>
                </div>
                <a href="https://www.google.com/maps/place/ardhanareshwari+nag+jotirling/@20.6836728,73.7838213,17z/data=!3m1!4b1!4m6!3m5!1s0x3bde3de27d6c9e1d:0x42fcd5a79fa923be!8m2!3d20.6836728!4d73.7864016!16s%2Fg%2F11b7jjr46p?hl=en-IN&entry=ttu&g_ep=EgoyMDI2MDYyMy4wIKXMDSoASAFQAw%3D%3D" target="_blank" rel="noreferrer" className="inline-block p-2 bg-primary text-on-primary rounded-full hover:scale-110 transition-transform shrink-0">
                  <span className="material-symbols-outlined text-[18px] md:text-[20px] block">directions</span>
                </a>
              </div>
              <a href="https://www.google.com/maps/place/ardhanareshwari+nag+jotirling/@20.6836728,73.7838213,17z/data=!3m1!4b1!4m6!3m5!1s0x3bde3de27d6c9e1d:0x42fcd5a79fa923be!8m2!3d20.6836728!4d73.7864016!16s%2Fg%2F11b7jjr46p?hl=en-IN&entry=ttu&g_ep=EgoyMDI2MDYyMy4wIKXMDSoASAFQAw%3D%3D" target="_blank" rel="noreferrer" className="flex items-center justify-center w-full mt-3 h-10 border border-outline text-on-surface-variant rounded-lg text-xs font-medium hover:bg-surface-container-low transition-colors">{t("openInGoogleMaps")}</a>
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
              <span className="text-sm md:text-base font-medium">{t("morningAarti")}</span>
              <span className="font-mono text-primary font-bold text-sm md:text-base">{t("0430Am")}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-outline-variant/30">
              <span className="text-sm md:text-base font-medium">{t("publicDarshanAm")}</span>
              <span className="font-mono text-primary font-bold text-sm md:text-base">06:00 - 12:00</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-outline-variant/30">
              <span className="text-sm md:text-base font-medium">{t("middayBreak")}</span>
              <span className="font-mono text-on-surface-variant text-sm md:text-base">12:30 - 04:00</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-sm md:text-base font-medium">{t("eveningAarti")}</span>
              <span className="font-mono text-primary font-bold text-sm md:text-base">{t("0700Pm")}</span>
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
                <p className="text-sm md:text-base font-semibold group-hover:text-primary transition-colors">{t("sharadPurnimaUtsav")}</p>
                <p className="text-xs text-on-surface-variant leading-relaxed">{t("specialNightDarshanAvailableFr")}</p>
              </div>
            </div>
            <div className="flex gap-4 p-3 hover:bg-surface-container-low rounded-lg transition-colors cursor-pointer group">
              <div className="bg-secondary-container/20 p-2 h-fit rounded text-secondary shrink-0">
                <span className="material-symbols-outlined">warning</span>
              </div>
              <div>
                <p className="text-sm md:text-base font-semibold group-hover:text-primary transition-colors">{t("parkingMaintenance")}</p>
                <p className="text-xs text-on-surface-variant leading-relaxed">{t("parkingLotBWillBeClosedOnOct25")}</p>
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
                <span className="text-sm md:text-base font-medium">{t("helpline1800123456")}</span>
              </a>
              <a className="flex items-center gap-3 bg-white/10 p-3.5 rounded-lg hover:bg-white/20 transition-colors" href="#">
                <span className="material-symbols-outlined">chat</span>
                <span className="text-sm md:text-base font-medium">{t("liveChatWithAdmin")}</span>
              </a>
            </div>
          </div>
          <div className="mt-8 flex justify-center">
            <img className="w-24 md:w-32 h-auto opacity-30" alt="Illustration" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB8qfQInAEaN3batfDnJ9OjU4ukVGdF8ttc4C3jocmoZn8XD_A7m8NsUhJTzym2O0_OtOVX5e4Ziyzlca8cgNF8f-MJLUIZrBHFzTNPjQF1gydbwSSC-l5ux2mSU-yJr6M0vb8bwpVnX9ZEkJdR_Q6D7mFUnegA5cLSj5rKuvqo4DJEGkcE-Okbwa65NROxPmA4qA2IWtSlmrzEnbCv5rPavgREwTh_DxDat_JrMi1CnpzRLc-9fHiH_1Loxyb_HLs3gPwiHs-Ikog" />
          </div>
        </div>
      </div>

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/1800123456?text=Hello%2C%20I%20need%20help%20regarding%20my%20Darshan%20booking."
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 bg-[#25D366] text-white p-3 md:p-4 rounded-full shadow-[0_4px_12px_rgba(37,211,102,0.4)] hover:shadow-[0_6px_16px_rgba(37,211,102,0.6)] hover:scale-110 transition-all duration-300 z-50 flex items-center justify-center group"
        aria-label="WhatsApp Support"
      >
        <svg
          className="w-7 h-7 md:w-8 md:h-8"
          fill="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
        
        {/* Tooltip */}
        <span className="absolute bottom-full right-0 mb-4 w-max opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gray-800 text-white text-xs md:text-sm px-4 py-2 rounded-lg shadow-lg pointer-events-none">
          Need Help? Chat with us on WhatsApp
          {/* Arrow */}
          <div className="absolute top-full right-4 md:right-5 border-[6px] border-transparent border-t-gray-800"></div>
        </span>
      </a>
    </main>;
}