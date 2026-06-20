import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

export default function Scanner() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full pb-20">
      {/* Page Header */}
      <section className="flex flex-col gap-1">
        <h2 className="text-2xl md:text-3xl font-bold text-on-surface">{t('qrScannerTitle')}</h2>
        <p className="text-on-surface-variant text-base max-w-2xl">{t('qrScannerSubtitle')}</p>
      </section>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Scanner & Manual Entry */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Scanner Card */}
          <div className="bg-white border border-outline-variant rounded-xl p-6 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-on-surface">{t('liveScanner')}</h3>
              <span className="flex items-center gap-2 text-xs font-semibold text-tertiary px-3 py-1 bg-tertiary/10 rounded-full">
                <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
                {t('cameraActive')}
              </span>
            </div>
            
            <div className="relative overflow-hidden bg-inverse-surface rounded-xl aspect-video md:aspect-[16/10] flex flex-col items-center justify-center border-4 border-surface-container">
              {/* Scanner Animation Line */}
              <div 
                className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent left-0 z-20"
                style={{
                  animation: 'scan 3s infinite linear',
                }}
              ></div>
              <style dangerouslySetInnerHTML={{__html: `
                @keyframes scan {
                  0% { top: 0; }
                  50% { top: 100%; }
                  100% { top: 0; }
                }
              `}} />

              <div className="relative z-10 flex flex-col items-center gap-4 text-white text-center p-6">
                <button className="px-8 py-3 bg-primary text-on-primary rounded-full font-bold shadow-xl flex items-center gap-2 hover:scale-105 transition-transform active:scale-95">
                  <span className="material-symbols-outlined">photo_camera</span>
                  {t('scanQrCode')}
                </button>
              </div>
            </div>

            {/* Manual Search Forms */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-on-surface-variant">{t('tokenNumber')}</label>
                <input className="px-4 py-2 border border-outline-variant rounded-lg bg-surface focus:border-primary outline-none transition-all" placeholder="T-5421" type="text" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-on-surface-variant">{t('mobileNumber')}</label>
                <input className="px-4 py-2 border border-outline-variant rounded-lg bg-surface focus:border-primary outline-none transition-all" placeholder="+91 987..." type="tel" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-on-surface-variant">{t('vehicleNumber')}</label>
                <input className="px-4 py-2 border border-outline-variant rounded-lg bg-surface focus:border-primary outline-none transition-all" placeholder="MH12 AB..." type="text" />
              </div>
            </div>
            <button className="w-full mt-4 py-3 border border-primary text-primary font-bold rounded-lg hover:bg-primary/5 transition-colors">
              {t('manualSearch')}
            </button>
          </div>

          {/* Verification Result Card (Static View) */}
          <div className="bg-white border-t-4 border-t-primary border-x border-b border-outline-variant rounded-xl p-6 shadow-md animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="flex gap-4">
                <div className="h-16 w-16 rounded-xl overflow-hidden bg-surface-container shrink-0">
                  <img className="w-full h-full object-cover" alt="Devotee" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB4ZJvo6PMpOnAOfd5dJm8L6GSge3a9_Y7scJw3BMWOSimBGR-csaju_9rtYY1-TfK5hBYwSGIncGqgfxunq5d7c2lUshReI54VJQzTaCdEbAoOepYm-IqEKPWm-m2P3iDgpggDGAJKq2iD02FE7CjBen6F7_SK9ToNbcoINCDRIdPYcU1lIxBSgmpCTFEF3_iq4GgirKcexbLIVe4VKhNtYexhMNQ28tfVn0AIYyBqBnVigsUTBdfvw54GHffnx1v6x4jWs99H_Bo" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-on-surface">Rajesh Modi</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="bg-primary-container text-on-primary-container px-2 py-0.5 rounded text-xs font-semibold">{t('familyPass')}</span>
                    <span className="text-on-surface-variant text-sm font-semibold">{t('tokenNumber') || 'Token'}: #DH8829</span>
                  </div>
                </div>
              </div>
              <div className="text-left md:text-right">
                <p className="text-on-surface-variant text-xs font-semibold uppercase">{t('bookingTime')}</p>
                <p className="font-bold text-on-surface">Today, 10:30 AM</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 p-4 bg-surface-container-low rounded-lg">
              <div>
                <p className="text-xs text-on-surface-variant">{t('phone')}</p>
                <p className="font-bold text-on-surface">+91 98234 1120</p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant">{t('vehicle')}</p>
                <p className="font-bold text-on-surface">KA 01 MG 4421</p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant">{t('members')}</p>
                <p className="font-bold text-on-surface">04 (2 Adults, 2 Child)</p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant">{t('gateNo')}</p>
                <p className="font-bold text-on-surface">North Archway</p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <button className="flex-1 min-w-[140px] py-3 bg-primary text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg hover:brightness-110 active:scale-95 transition-all">
                <span className="material-symbols-outlined">verified</span>
                {t('verifyEntry')}
              </button>
              <button className="flex-1 min-w-[140px] py-3 border-2 border-secondary text-secondary font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-secondary/5 active:scale-95 transition-all">
                <span className="material-symbols-outlined">hourglass_top</span>
                {t('markInQueue')}
              </button>
              <button className="flex-1 min-w-[140px] py-3 border-2 border-outline-variant text-on-surface-variant font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-surface-container-highest active:scale-95 transition-all">
                <span className="material-symbols-outlined">login</span>
                {t('markEntered')}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Stats & Recent History */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border border-outline-variant p-4 rounded-xl hover:-translate-y-1 transition-transform shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <span className="material-symbols-outlined">group</span>
                </div>
                <p className="text-xs font-semibold text-on-surface-variant">{t('totalToday')}</p>
              </div>
              <p className="text-3xl font-bold text-primary">1,284</p>
              <div className="mt-2 h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                <div className="bg-primary h-full w-3/4 rounded-full"></div>
              </div>
            </div>
            <div className="bg-white border border-outline-variant p-4 rounded-xl hover:-translate-y-1 transition-transform shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-tertiary/10 rounded-lg text-tertiary">
                  <span className="material-symbols-outlined">church</span>
                </div>
                <p className="text-xs font-semibold text-on-surface-variant">{t('insideTemple')}</p>
              </div>
              <p className="text-3xl font-bold text-tertiary">412</p>
              <p className="text-[10px] text-tertiary mt-1 font-bold">Capacity: 60%</p>
            </div>
            <div className="bg-white border border-outline-variant p-4 rounded-xl hover:-translate-y-1 transition-transform shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-secondary/10 rounded-lg text-secondary">
                  <span className="material-symbols-outlined">hourglass_empty</span>
                </div>
                <p className="text-xs font-semibold text-on-surface-variant">{t('queueCount')}</p>
              </div>
              <p className="text-3xl font-bold text-secondary">85</p>
              <p className="text-[10px] text-on-surface-variant mt-1">Est. wait: 12 mins</p>
            </div>
            <div className="bg-white border border-outline-variant p-4 rounded-xl hover:-translate-y-1 transition-transform shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-error/10 rounded-lg text-error">
                  <span className="material-symbols-outlined">pending_actions</span>
                </div>
                <p className="text-xs font-semibold text-on-surface-variant">{t('pending')}</p>
              </div>
              <p className="text-3xl font-bold text-error">12</p>
              <p className="text-[10px] text-on-surface-variant mt-1">Requiring assistance</p>
            </div>
          </div>

          {/* Recent Scans List */}
          <div className="bg-white border border-outline-variant rounded-xl flex-1 flex flex-col overflow-hidden shadow-sm">
            <div className="p-6 border-b border-outline-variant flex justify-between items-center">
              <h3 className="text-xl font-bold text-on-surface">{t('recentScans')}</h3>
              <button className="text-primary font-semibold text-sm hover:underline">{t('viewAll')}</button>
            </div>
            <div className="flex-1 overflow-y-auto max-h-[500px]">
              <div className="divide-y divide-outline-variant">
                
                {/* Scan Item */}
                <div className="p-4 flex items-center justify-between hover:bg-surface-container-low transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary-container/30 flex items-center justify-center text-secondary">
                      <span className="material-symbols-outlined">person</span>
                    </div>
                    <div>
                      <p className="font-bold text-on-surface text-sm">Anjali Sharma</p>
                      <p className="text-xs text-on-surface-variant">4 People • Gate 2</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-on-surface mb-1">09:42 AM</p>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary-container/20 text-on-primary-container font-bold uppercase">{t('verified')}</span>
                  </div>
                </div>
                
                {/* Scan Item */}
                <div className="p-4 flex items-center justify-between hover:bg-surface-container-low transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary-container/30 flex items-center justify-center text-secondary">
                      <span className="material-symbols-outlined">person</span>
                    </div>
                    <div>
                      <p className="font-bold text-on-surface text-sm">Vikram Mehta</p>
                      <p className="text-xs text-on-surface-variant">1 Person • VIP Entry</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-on-surface mb-1">09:38 AM</p>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-tertiary-container/20 text-on-tertiary-container font-bold uppercase">{t('entered')}</span>
                  </div>
                </div>

                {/* Scan Item */}
                <div className="p-4 flex items-center justify-between hover:bg-surface-container-low transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary-container/30 flex items-center justify-center text-secondary">
                      <span className="material-symbols-outlined">person</span>
                    </div>
                    <div>
                      <p className="font-bold text-on-surface text-sm">Sunita Deshpande</p>
                      <p className="text-xs text-on-surface-variant">2 People • Gate 1</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-on-surface mb-1">09:35 AM</p>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-variant text-on-surface-variant font-bold uppercase">{t('waiting')}</span>
                  </div>
                </div>

                {/* Scan Item */}
                <div className="p-4 flex items-center justify-between hover:bg-surface-container-low transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary-container/30 flex items-center justify-center text-secondary">
                      <span className="material-symbols-outlined">person</span>
                    </div>
                    <div>
                      <p className="font-bold text-on-surface text-sm">Amit Patel</p>
                      <p className="text-xs text-on-surface-variant">5 People • Parking A</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-on-surface mb-1">09:31 AM</p>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary-container/20 text-on-primary-container font-bold uppercase">{t('verified')}</span>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
