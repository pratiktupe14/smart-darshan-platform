import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

export default function MyPass() {
  const { t } = useLanguage();

  return (
    <main className="max-w-7xl mx-auto px-4 md:px-10 py-8 md:py-12 w-full">
      {/* Header Section */}
      <div className="mb-12">
        <h1 className="text-3xl md:text-5xl font-bold text-on-surface mb-2">{t('digitalPass')}</h1>
        <p className="text-on-surface-variant text-base">View and manage your active and previous darshan passes.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        {/* Active Pass Column */}
        <div className="lg:col-span-8 space-y-6 md:space-y-8">
          {/* Premium Ticket Card */}
          <div className="bg-surface-container-lowest rounded-xl premium-ticket-glow overflow-hidden border border-outline/10">
            <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8">
              {/* QR Code Section */}
              <div className="flex flex-col items-center justify-center space-y-4 shrink-0">
                <div className="bg-white p-4 rounded-xl border border-outline-variant shadow-sm w-48 h-48 flex items-center justify-center">
                  <img 
                    className="w-full h-full object-contain" 
                    alt="QR code" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDVzYKnMQ3jaH4gun067quZa1LDy94pMcGOl0m4q29pc6pcKauNUb3fQoQFwp7mxJUDFQg4uVYh2uVwU1ZRaiIXxoXVVFLVu9H43gNd0Rz1gkM0hNrJ_HNEF1VcPkM_WwCUCsp13i19CN3m6HwhdSE8KFvaZnf6KlG2LSw4Rjq3yrC3w-wijwjXhOaFNLbTnrV8gyRmMcMynpz2_9P6IZtOHOmrRKiDGWt4zZgExzYIdZEbcwlaB5kta7etBBzdOS5Y9KWH1af-yr8"
                  />
                </div>
                <span className="bg-primary-container text-on-primary-container px-4 py-1 rounded-full text-xs font-bold">Active Pass</span>
                <div className="text-center">
                  <p className="text-sm text-on-surface-variant font-medium">{t('tokenId')}</p>
                  <p className="text-3xl text-primary font-bold">#A001</p>
                </div>
              </div>
              
              {/* Ticket Details Section */}
              <div className="flex-grow space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold text-on-surface">Sri Meenakshi Temple</h2>
                    <p className="text-primary font-medium">Main Sanctum Darshan</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-on-surface-variant font-medium">Date & Time</p>
                    <p className="text-base font-bold">Oct 25, 2024</p>
                    <p className="text-base text-primary font-bold">08:30 AM</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                  <div>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-medium">{t('devoteeName')}</p>
                    <p className="text-base font-semibold">Pratik Tupe</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-medium">{t('mobile')}</p>
                    <p className="text-base font-semibold">+91 9876543210</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-medium">Vehicle No</p>
                    <p className="text-base font-semibold">MH-12-AB-1234 (SUV)</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-medium">{t('persons')}</p>
                    <p className="text-base font-semibold">4 Persons</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-medium">City</p>
                    <p className="text-base font-semibold">Pune</p>
                  </div>
                </div>

                <div className="dash-line pt-6 border-t border-dashed border-outline-variant">
                  <div className="flex flex-wrap gap-2">
                    <button className="flex items-center gap-1 bg-primary text-on-primary px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-all shadow-md">
                      <span className="material-symbols-outlined text-[18px]">download</span>
                      Download PDF
                    </button>
                    <button className="flex items-center gap-1 border-2 border-primary text-primary px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/5 transition-all">
                      <span className="material-symbols-outlined text-[18px]">share</span>
                      Share
                    </button>
                    <button className="flex items-center gap-1 bg-black text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-all shadow-md">
                      <span className="material-symbols-outlined text-[18px]">wallet</span>
                      Add to Wallet
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pass History */}
          <section className="space-y-4">
            <h3 className="text-xl font-semibold text-on-surface">Pass History</h3>
            <div className="bg-surface-container-lowest rounded-xl border border-outline/10 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface-container-low border-b border-outline/10">
                  <tr>
                    <th className="px-6 py-4 text-sm font-medium text-on-surface-variant">Token</th>
                    <th className="px-6 py-4 text-sm font-medium text-on-surface-variant">Date</th>
                    <th className="px-6 py-4 text-sm font-medium text-on-surface-variant">Temple</th>
                    <th className="px-6 py-4 text-sm font-medium text-on-surface-variant text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline/5">
                  <tr className="hover:bg-surface-bright transition-colors cursor-pointer group">
                    <td className="px-6 py-4 font-bold text-on-surface">#B882</td>
                    <td className="px-6 py-4 text-on-surface-variant">Oct 10, 2024</td>
                    <td className="px-6 py-4 text-on-surface">Sri Meenakshi Temple</td>
                    <td className="px-6 py-4 text-right">
                      <span className="bg-on-tertiary-container text-tertiary px-4 py-1 rounded-full text-xs font-bold inline-block">Completed</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-surface-bright transition-colors cursor-pointer group">
                    <td className="px-6 py-4 font-bold text-on-surface">#C991</td>
                    <td className="px-6 py-4 text-on-surface-variant">Sept 15, 2024</td>
                    <td className="px-6 py-4 text-on-surface">Sri Meenakshi Temple</td>
                    <td className="px-6 py-4 text-right">
                      <span className="bg-on-tertiary-container text-tertiary px-4 py-1 rounded-full text-xs font-bold inline-block">Completed</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Side Cards Column */}
        <div className="lg:col-span-4 space-y-6 md:space-y-8">
          {/* Queue Info Card */}
          <div className="bg-surface-container-lowest p-6 md:p-8 rounded-xl border border-outline/10 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-primary">groups</span>
              <h3 className="text-xl font-semibold text-on-surface">{t('liveQueue')}</h3>
            </div>
            
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-sm font-medium text-on-surface-variant">{t('currentToken')}</p>
                  <p className="text-3xl font-bold text-on-surface">A045</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-on-surface-variant">{t('yourToken')}</p>
                  <p className="text-3xl font-bold text-primary">A001</p>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="relative h-3 w-full bg-surface-container-high rounded-full overflow-hidden">
                <div className="absolute top-0 left-0 h-full bg-primary transition-all duration-1000" style={{ width: '100%' }}></div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-outline/10">
                <div>
                  <p className="text-sm font-medium text-on-surface-variant">{t('queuePosition')}</p>
                  <p className="text-base font-bold text-primary">At Entry Point</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-on-surface-variant">{t('estWait')}</p>
                  <p className="text-base font-bold text-primary">Ready</p>
                </div>
              </div>
              
              <div className="bg-primary-fixed text-on-primary-fixed-variant p-4 rounded-lg flex gap-4 items-start">
                <span className="material-symbols-outlined">info</span>
                <p className="text-xs leading-relaxed font-medium">Please proceed to the entry gate immediately. Your token is currently being called.</p>
              </div>
            </div>
          </div>

          {/* Temple Info Card */}
          <div className="bg-surface-container-lowest p-6 md:p-8 rounded-xl border border-outline/10 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-primary">location_on</span>
              <h3 className="text-xl font-semibold text-on-surface">Temple Location</h3>
            </div>
            
            <div className="space-y-4">
              <div className="rounded-xl overflow-hidden h-40 relative group cursor-pointer">
                <img 
                  className="w-full h-full object-cover" 
                  alt="Map" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuC5n-uotQottW_pWYMQVIMb0Binv8SC8W3L8bw4otbKMzWFAzGHvKqgflFNMHkVxE5sBzvyAVW8bjg-YilLHmn-_XBWcSeh1rFuMaOGGBvL-GEnRFod1bT5ggMT-k8ZdoxC2ZCREcbenkIbHi1D9TpKa1J-uEIH0KgX3QQUeOdvnjGynMsU8B_idF3eSzisjsw7HXtgRx93u2tufAKC8fXzQ7h3nVPazUDOhrlEiL73Kam6AFUX0urFZheYgLinSjdhbGoOyNnkGOY"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <button className="bg-surface px-4 py-2 rounded-lg text-xs font-semibold shadow-md opacity-0 group-hover:opacity-100 transition-opacity">View Map</button>
                </div>
              </div>
              
              <div>
                <p className="text-base font-semibold text-on-surface">Sri Meenakshi Temple</p>
                <p className="text-xs text-on-surface-variant leading-relaxed font-medium">Madurai Main Rd, Madurai, Tamil Nadu 625001, India</p>
              </div>
              
              <button className="w-full py-3 bg-surface-container border border-outline-variant text-on-surface rounded-xl text-base font-semibold hover:bg-surface-variant transition-colors flex items-center justify-center gap-2">
                <span className="material-symbols-outlined">directions</span>
                Open in Google Maps
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
