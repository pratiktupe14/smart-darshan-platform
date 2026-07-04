import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useUser } from '../../context/UserContext';

export default function UserQueueStatus() {
  const { t } = useLanguage();
  const { user } = useUser();
  const [queueInfo, setQueueInfo] = useState({
    currentServingToken: 'None',
    userTokenNumber: 'N/A',
    position: 0,
    peopleAhead: 0,
    tokensAhead: 0,
    userPersons: 0,
    estWait: 0,
    progress: 0,
    currentStage: 1,
    nextTokens: [],
    hasActivePass: false
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!user || (!user.mobile && !user._id)) return;
      try {
        const identifier = user._id || user.mobile;
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/bookings/user/${identifier}`);
        if (res.ok) {
          const bookings = await res.json();
          const active = bookings.find(b => b.status === 'confirmed');

          const qRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/queue`);
          const queueList = await qRes.json();
          
          const currentServing = queueList.filter(q => q.status === 'serving');
          let waitingQueue = queueList.filter(q => q.status === 'waiting');
          
          let userToken = null;
          let pos = 0;
          let peopleAhead = 0;
          let tokensAhead = 0;
          let userPersons = 0;
          
          if (active) {
              userToken = queueList.find(q => q.bookingId && q.bookingId._id === active._id);
              if (userToken) {
                  const tokenIndex = queueList.findIndex(q => q._id === userToken._id);
                  if (tokenIndex !== -1) {
                      tokensAhead = tokenIndex;
                      pos = tokenIndex + 1;
                      userPersons = userToken.bookingId.persons || 1;
                      
                      for (let i = 0; i < tokenIndex; i++) {
                          peopleAhead += (queueList[i].bookingId?.persons || 1);
                      }
                  }
              }
          }
          
          let currentStage = 1;
          let progress = 25;

          if (active) {
            const status = active.verificationStatus || 'none';
            if (status === 'verified_entry') {
              currentStage = 2;
              progress = 50;
            } else if (status === 'in_queue') {
              currentStage = 3;
              if (userToken && userToken.status === 'serving') {
                progress = 85;
              } else {
                const scaledProgress = pos > 0 ? Math.max(60, Math.min(80, 85 - pos * 2)) : 75;
                progress = scaledProgress;
              }
            } else if (status === 'completed') {
              currentStage = 4;
              progress = 100;
            } else {
              currentStage = 1;
              progress = 25;
            }
          } else {
            const completedBooking = bookings.find(b => b.status === 'completed' || b.verificationStatus === 'completed');
            if (completedBooking) {
              currentStage = 4;
              progress = 100;
            }
          }
          
          setQueueInfo({
              currentServingToken: currentServing.length > 0 ? currentServing[0].tokenNumber : 'None',
              userTokenNumber: userToken ? userToken.tokenNumber : 'N/A',
              position: pos,
              peopleAhead: peopleAhead,
              tokensAhead: tokensAhead,
              userPersons: userPersons,
              estWait: peopleAhead * 2,
              progress: progress,
              currentStage: currentStage,
              nextTokens: waitingQueue.slice(0, 5).map(q => q.tokenNumber),
              hasActivePass: !!active
          });
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
    const timer = setInterval(fetchData, 10000);

    return () => clearInterval(timer);
  }, [user]);

  return (
    <main className="max-w-[1280px] mx-auto px-4 md:px-10 py-8 space-y-8 w-full">
      {/* Hero Header */}
      <div className="space-y-2 pt-4">
        <h2 className="text-3xl font-semibold text-on-surface">{t('liveQueue')}</h2>
        <p className="text-base text-on-surface-variant max-w-2xl">
          Track your queue position and waiting time for darshan.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Personal Status & Progress */}
        <div className="lg:col-span-8 space-y-6">
          {queueInfo.hasActivePass ? (
            <>
              {/* My Queue Card */}
              <div className="bg-surface-container-lowest border border-outline/10 rounded-xl p-8 shadow-sm relative overflow-hidden group hover:-translate-y-0.5 transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-500"></div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="bg-primary-container/10 text-primary-container px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider">In Queue</span>
                  <span className="text-on-surface-variant text-sm font-medium">{new Date().toLocaleDateString()}</span>
                </div>
                <div className="space-y-1">
                  <p className="text-on-surface-variant font-medium">{t('yourToken')}</p>
                  <h3 className="text-7xl font-black text-primary tracking-tighter">{queueInfo.userTokenNumber}</h3>
                </div>
              </div>
              
              <div className="bg-surface-container border border-primary/10 rounded-xl p-6 min-w-[250px] shadow-sm">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-3xl font-bold text-primary">{queueInfo.peopleAhead}</p>
                    <p className="text-[11px] text-on-surface-variant font-medium mt-1 uppercase tracking-wider">Devotees Ahead</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-primary">{queueInfo.position}</p>
                    <p className="text-[11px] text-on-surface-variant font-medium mt-1 uppercase tracking-wider">Queue Position</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-on-surface">{queueInfo.tokensAhead}</p>
                    <p className="text-[11px] text-on-surface-variant font-medium mt-1 uppercase tracking-wider">Tokens Ahead</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-on-surface">{queueInfo.userPersons}</p>
                    <p className="text-[11px] text-on-surface-variant font-medium mt-1 uppercase tracking-wider">Your Group</p>
                  </div>
                </div>
                <div className="mt-5 pt-4 border-t border-primary/10 flex items-center justify-between text-primary font-semibold text-sm px-2">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base">schedule</span>
                    <span>Wait: {queueInfo.estWait}m</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base">trending_down</span>
                    <span>Moving Fast</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Queue Progress Visual Tracker */}
          <div className="bg-surface-container-lowest border border-outline/10 rounded-xl p-8 shadow-sm space-y-10 hover:-translate-y-0.5 transition-all duration-300">
            <div className="flex justify-between items-center">
              <h4 className="text-xl font-semibold text-on-surface">Live Journey Tracker</h4>
              <span className="text-primary font-bold">{Math.floor(queueInfo.progress)}% Progress</span>
            </div>
            
            <div className="relative px-2">
              {/* Background Line */}
              <div className="absolute top-1/2 left-0 w-full h-1.5 bg-surface-container-high -translate-y-1/2 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-1000 ease-out" style={{ width: `${queueInfo.progress}%` }}></div>
              </div>
              
              {/* Steps */}
              <div className="relative flex justify-between">
                {[
                  { id: 1, label: "Booking Confirmed", icon: "confirmation_number", pendingText: "1" },
                  { id: 2, label: "Temple Entry", icon: "login", pendingText: "2" },
                  { id: 3, label: "Waiting in Queue", icon: "hourglass_top", pendingText: "3" },
                  { id: 4, label: "Darshan Completed", icon: "temple_hindu", pendingText: "temple_hindu" }
                ].map((step) => {
                  const isCompleted = queueInfo.currentStage > step.id;
                  const isActive = queueInfo.currentStage === step.id;
                  
                  if (isCompleted) {
                    return (
                      <div key={step.id} className="flex flex-col items-center gap-3 w-24">
                        <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-md z-10">
                          <span className="material-symbols-outlined text-sm font-bold">check</span>
                        </div>
                        <span className="text-xs font-bold text-on-surface text-center">{step.label}</span>
                      </div>
                    );
                  } else if (isActive) {
                    return (
                      <div key={step.id} className="flex flex-col items-center gap-3 w-24">
                        <div className="w-10 h-10 -mt-1 rounded-full bg-white border-4 border-primary text-primary flex items-center justify-center shadow-lg z-10 animate-pulse">
                          {step.id === 4 ? (
                            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>{step.icon}</span>
                          ) : (
                            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>hourglass_top</span>
                          )}
                        </div>
                        <span className="text-sm font-black text-primary text-center">{step.label}</span>
                      </div>
                    );
                  } else {
                    return (
                      <div key={step.id} className="flex flex-col items-center gap-3 w-24">
                        <div className="w-8 h-8 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center z-10">
                          {step.pendingText === "temple_hindu" ? (
                            <span className="material-symbols-outlined text-sm">temple_hindu</span>
                          ) : (
                            <span className="text-xs font-bold">{step.pendingText}</span>
                          )}
                        </div>
                        <span className="text-xs font-medium text-on-surface-variant text-center">{step.label}</span>
                      </div>
                    );
                  }
                })}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center justify-center gap-3 bg-primary text-white py-4 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-md active:scale-95">
              <span className="material-symbols-outlined">qr_code_2</span>
              {t('viewPass')}
            </button>
            <button className="flex items-center justify-center gap-3 bg-white border-2 border-primary/20 text-primary py-4 rounded-xl font-bold hover:bg-primary/5 transition-all active:scale-95">
              <span className="material-symbols-outlined">download</span>
              {t('downloadPass')}
            </button>
            <a href="https://www.google.com/maps/place/ardhanareshwari+nag+jotirling/@20.6836728,73.7838213,17z/data=!3m1!4b1!4m6!3m5!1s0x3bde3de27d6c9e1d:0x42fcd5a79fa923be!8m2!3d20.6836728!4d73.7864016!16s%2Fg%2F11b7jjr46p?hl=en-IN&entry=ttu&g_ep=EgoyMDI2MDYyMy4wIKXMDSoASAFQAw%3D%3D" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-3 bg-white border-2 border-primary/20 text-primary py-4 rounded-xl font-bold hover:bg-primary/5 transition-all active:scale-95">
              <span className="material-symbols-outlined">near_me</span>
              Open Directions
            </a>
          </div>
            </>
          ) : (
            <div className="bg-surface-container-lowest border border-outline/10 rounded-xl p-8 shadow-sm text-center space-y-4 py-20">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="material-symbols-outlined text-4xl text-primary">confirmation_number</span>
              </div>
              <h3 className="text-2xl font-bold text-on-surface">No Active Darshan Pass</h3>
              <p className="text-on-surface-variant">You don't have an active darshan pass. Please book a darshan to see your live queue status and journey tracker.</p>
              <button onClick={() => window.location.href='/dashboard/book'} className="mt-8 inline-flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-full font-bold hover:bg-primary/90 transition-colors shadow-md">
                <span className="material-symbols-outlined">add</span>
                Book Darshan
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Live Data & Info */}
        <div className="lg:col-span-4 space-y-6">
          {/* Active Status Card */}
          <div className="bg-inverse-surface text-surface rounded-xl p-6 shadow-lg space-y-6">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
              <h4 className="text-sm font-bold uppercase tracking-widest text-primary-fixed">Live Counters</h4>
            </div>
            
            <div className="flex justify-between items-end border-b border-surface-variant/10 pb-6">
              <div>
                <p className="text-surface-variant text-sm">Active Token</p>
                <h5 className="text-4xl font-bold text-white">{queueInfo.currentServingToken}</h5>
              </div>
              <div className="text-right">
                <p className="text-surface-variant text-sm">Est. Wait</p>
                <h5 className="text-xl font-bold text-primary-fixed">{queueInfo.estWait} Mins</h5>
              </div>
            </div>
            
            <div className="space-y-4">
              <p className="text-xs font-bold text-surface-variant uppercase">Next Upcoming</p>
              <div className="flex flex-wrap gap-2">
                {queueInfo.nextTokens.length > 0 ? queueInfo.nextTokens.map((token, i) => (
                  <span key={i} className="bg-surface-variant/10 border border-surface-variant/20 px-3 py-1.5 rounded-lg text-sm font-semibold">{token}</span>
                )) : <span className="text-surface-variant">None</span>}
              </div>
            </div>
            
            <div className="bg-surface-container-highest/10 rounded-lg p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary-fixed">schedule</span>
                <span className="text-sm">Estimated Darshan Time</span>
              </div>
              <span className="font-bold text-white">10:45 AM</span>
            </div>
          </div>

          {/* Statistics */}
          <div className="bg-surface-container-lowest border border-outline/10 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-bold text-on-surface">Queue Metrics</h4>
              <span className="text-[10px] text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">sync</span>
                Updated 1 min ago
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-surface-container-low rounded-lg">
                <p className="text-[10px] uppercase font-bold text-on-surface-variant">Queue Speed</p>
                <p className="text-lg font-bold text-primary">1.5 <span className="text-xs font-medium">tkns/m</span></p>
              </div>
              <div className="p-3 bg-surface-container-low rounded-lg">
                <p className="text-[10px] uppercase font-bold text-on-surface-variant">Avg. Time</p>
                <p className="text-lg font-bold text-primary">12 <span className="text-xs font-medium">mins</span></p>
              </div>
            </div>
          </div>

          {/* Temple Notice */}
          <div className="bg-tertiary-fixed text-on-tertiary-fixed rounded-xl p-6 shadow-sm relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <span className="material-symbols-outlined text-8xl">campaign</span>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <span className="material-symbols-outlined text-tertiary">campaign</span>
              <h4 className="font-bold">Temple Notice</h4>
            </div>
            <p className="text-sm leading-relaxed mb-4">Maha-Aarti scheduled for 11:30 AM today. Queue processing may slow down for 20 minutes during the ceremony. We appreciate your patience.</p>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-xs font-medium">
                <span className="material-symbols-outlined text-sm">history</span>
                Temple Hours: 4:00 AM - 10:00 PM
              </div>
              <div className="flex items-center gap-2 text-xs font-medium">
                <span className="material-symbols-outlined text-sm">call</span>
                Helpline: +91 1234567890
              </div>
            </div>
          </div>

          {/* Temple Map Snippet */}
          <div className="bg-surface-container-lowest border border-outline/10 rounded-xl p-4 shadow-sm">
            <div 
              className="h-32 w-full rounded-lg mb-3 bg-cover bg-center overflow-hidden" 
              style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCsFT3IFfq63Xzd8M_ArrBfFX7jyZMTp2IHBjaNMtTRZBNuemS8ZpmEmSbKR8VURvlZHxa0gWKEBeROxiq-_plqaAi9wH-aBOkeQrltkexzlxWbMHye7YasrstqyXOSszFzL85_wP2W7280jLISnD-0X6BTksHlSH8VezPrJemCgmN75bs7OD8GqCDEgDgD_kGdakZjSWVCXAMgfiBfq64ffLBNFgLBeiJTNt-Lv6kTPVCv6GpgsPon53fYxKd2OrcOhEerxJ8ap4k')" }}
            ></div>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-on-surface">Queue Hall B</p>
                <p className="text-[10px] text-on-surface-variant">Current Location: Near Entrance Gate 3</p>
              </div>
              <button className="bg-primary/10 text-primary p-2 rounded-lg hover:bg-primary/20 transition-colors">
                <span className="material-symbols-outlined">explore</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
