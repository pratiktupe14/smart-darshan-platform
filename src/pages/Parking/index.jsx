import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';

export default function Parking() {
  const { t } = useLanguage();
  const [highlightSearch, setHighlightSearch] = useState(false);

  const handleSearchClick = () => {
    setHighlightSearch(true);
    setTimeout(() => setHighlightSearch(false), 1500);
  };

  return (
    <div className="flex flex-col max-w-7xl mx-auto w-full pb-20">
      {/* Page Header (Internal) */}
      <div className="bg-surface border-b border-outline-variant px-6 py-6 mb-8 flex flex-col md:flex-row md:items-center justify-between rounded-b-2xl shadow-sm">
        <div className="flex flex-col">
          <h2 className="text-2xl font-bold text-on-surface leading-tight">{t('parkingMgmtTitle')}</h2>
          <p className="text-sm text-on-surface-variant">{t('parkingMgmtSubtitle')}</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center gap-4">
          <div className="flex items-center gap-3 cursor-pointer bg-surface-container-low px-4 py-2 rounded-lg border border-outline-variant hover:bg-surface-container-high transition-colors">
            <span className="text-sm font-medium text-on-surface">{t('shiftMorning')}</span>
            <span className="material-symbols-outlined text-sm">expand_more</span>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-6 space-y-8">
        {/* Overview Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow flex items-center gap-6">
            <div className="p-3 bg-primary-fixed text-on-primary-fixed rounded-lg">
              <span className="material-symbols-outlined text-3xl">local_parking</span>
            </div>
            <div>
              <p className="text-sm font-medium text-on-surface-variant">{t('totalCapacity')}</p>
              <p className="text-3xl font-black text-on-surface">500</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow flex items-center gap-6">
            <div className="p-3 bg-secondary-fixed text-on-secondary-fixed rounded-lg">
              <span className="material-symbols-outlined text-3xl">drive_eta</span>
            </div>
            <div>
              <p className="text-sm font-medium text-on-surface-variant">{t('occupiedSlots')}</p>
              <p className="text-3xl font-black text-on-surface">342</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow flex items-center gap-6">
            <div className="p-3 bg-tertiary-fixed text-on-tertiary-fixed rounded-lg">
              <span className="material-symbols-outlined text-3xl">event_available</span>
            </div>
            <div>
              <p className="text-sm font-medium text-on-surface-variant">{t('availableSlots')}</p>
              <p className="text-3xl font-black text-on-surface">158</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow flex items-center gap-6">
            <div className="p-3 bg-surface-container-highest text-on-surface rounded-lg">
              <span className="material-symbols-outlined text-3xl">history</span>
            </div>
            <div>
              <p className="text-sm font-medium text-on-surface-variant">{t('vehiclesToday')}</p>
              <p className="text-3xl font-black text-on-surface">1,284</p>
            </div>
          </div>
        </section>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column (Larger) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Vehicle Entry Form */}
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-outline-variant">
              <h3 className="text-xl font-bold text-on-surface mb-6">{t('vehicleEntryForm')}</h3>
              <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-on-surface">{t('vehicleNumber')}</label>
                  <input className="w-full h-12 rounded-lg border border-outline-variant bg-surface focus:ring-2 focus:ring-primary/20 focus:border-primary px-4 outline-none transition-all" placeholder="e.g. MH 12 AB 1234" type="text" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-on-surface">{t('vehicleType')}</label>
                  <select className="w-full h-12 rounded-lg border border-outline-variant bg-surface focus:ring-2 focus:ring-primary/20 focus:border-primary px-4 outline-none transition-all">
                    <option>{t('twoWheeler')}</option>
                    <option>{t('fourWheeler')}</option>
                    <option>{t('bus')}</option>
                    <option>{t('vip')}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-on-surface">{t('driverName')}</label>
                  <input className="w-full h-12 rounded-lg border border-outline-variant bg-surface focus:ring-2 focus:ring-primary/20 focus:border-primary px-4 outline-none transition-all" placeholder="Full Name" type="text" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-on-surface">{t('mobileNumber')}</label>
                  <input className="w-full h-12 rounded-lg border border-outline-variant bg-surface focus:ring-2 focus:ring-primary/20 focus:border-primary px-4 outline-none transition-all" placeholder="+91" type="tel" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-semibold text-on-surface">{t('tokenNumber')}</label>
                  <input className="w-full h-12 rounded-lg border border-outline-variant bg-surface-container-low px-4 font-mono text-primary font-bold outline-none cursor-not-allowed" readOnly type="text" value="TKN-8829" />
                </div>
                <div className="md:col-span-2 pt-4">
                  <button className="w-full bg-primary text-on-primary font-bold py-4 rounded-xl hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-lg shadow-md hover:shadow-lg" type="button">
                    <span className="material-symbols-outlined">assignment_turned_in</span>
                    {t('assignParkingSlot')}
                  </button>
                </div>
              </form>
            </div>

            {/* Visual Map */}
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-outline-variant">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                <h3 className="text-xl font-bold text-on-surface">{t('parkingSlotStatus')}</h3>
                <div className="flex flex-wrap gap-4 text-xs font-semibold">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-500 rounded-full"></div> {t('available')}</div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 bg-orange-500 rounded-full"></div> {t('occupied')}</div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 bg-yellow-500 rounded-full"></div> {t('vip')}</div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded-full"></div> {t('disabled')}</div>
                </div>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-10 gap-3">
                {/* Simulated Grid */}
                <div className="h-14 flex items-center justify-center rounded-lg bg-orange-100 text-orange-800 border border-orange-300 font-bold text-xs hover:scale-105 transition-transform cursor-pointer shadow-sm">P-01</div>
                <div className="h-14 flex items-center justify-center rounded-lg bg-green-100 text-green-800 border border-green-300 font-bold text-xs hover:scale-105 transition-transform cursor-pointer shadow-sm">P-02</div>
                <div className="h-14 flex items-center justify-center rounded-lg bg-green-100 text-green-800 border border-green-300 font-bold text-xs hover:scale-105 transition-transform cursor-pointer shadow-sm">P-03</div>
                <div className="h-14 flex items-center justify-center rounded-lg bg-yellow-100 text-yellow-800 border border-yellow-300 font-bold text-xs hover:scale-105 transition-transform cursor-pointer shadow-sm">P-04</div>
                <div className="h-14 flex items-center justify-center rounded-lg bg-orange-100 text-orange-800 border border-orange-300 font-bold text-xs hover:scale-105 transition-transform cursor-pointer shadow-sm">P-05</div>
                <div className="h-14 flex items-center justify-center rounded-lg bg-blue-100 text-blue-800 border border-blue-300 font-bold text-xs hover:scale-105 transition-transform cursor-pointer shadow-sm">P-06</div>
                <div className="h-14 flex items-center justify-center rounded-lg bg-green-100 text-green-800 border border-green-300 font-bold text-xs hover:scale-105 transition-transform cursor-pointer shadow-sm">P-07</div>
                <div className="h-14 flex items-center justify-center rounded-lg bg-green-100 text-green-800 border border-green-300 font-bold text-xs hover:scale-105 transition-transform cursor-pointer shadow-sm">P-08</div>
                <div className="h-14 flex items-center justify-center rounded-lg bg-orange-100 text-orange-800 border border-orange-300 font-bold text-xs hover:scale-105 transition-transform cursor-pointer shadow-sm">P-09</div>
                <div className="h-14 flex items-center justify-center rounded-lg bg-green-100 text-green-800 border border-green-300 font-bold text-xs hover:scale-105 transition-transform cursor-pointer shadow-sm">P-10</div>
                {/* Second Row */}
                <div className="h-14 flex items-center justify-center rounded-lg bg-green-100 text-green-800 border border-green-300 font-bold text-xs hover:scale-105 transition-transform cursor-pointer shadow-sm">P-11</div>
                <div className="h-14 flex items-center justify-center rounded-lg bg-yellow-100 text-yellow-800 border border-yellow-300 font-bold text-xs hover:scale-105 transition-transform cursor-pointer shadow-sm">P-12</div>
                <div className="h-14 flex items-center justify-center rounded-lg bg-green-100 text-green-800 border border-green-300 font-bold text-xs hover:scale-105 transition-transform cursor-pointer shadow-sm">P-13</div>
                <div className="h-14 flex items-center justify-center rounded-lg bg-green-100 text-green-800 border border-green-300 font-bold text-xs hover:scale-105 transition-transform cursor-pointer shadow-sm">P-14</div>
                <div className="h-14 flex items-center justify-center rounded-lg bg-orange-100 text-orange-800 border border-orange-300 font-bold text-xs hover:scale-105 transition-transform cursor-pointer shadow-sm">P-15</div>
                <div className="h-14 flex items-center justify-center rounded-lg bg-orange-100 text-orange-800 border border-orange-300 font-bold text-xs hover:scale-105 transition-transform cursor-pointer shadow-sm">P-16</div>
                <div className="h-14 flex items-center justify-center rounded-lg bg-green-100 text-green-800 border border-green-300 font-bold text-xs hover:scale-105 transition-transform cursor-pointer shadow-sm">P-17</div>
                <div className="h-14 flex items-center justify-center rounded-lg bg-blue-100 text-blue-800 border border-blue-300 font-bold text-xs hover:scale-105 transition-transform cursor-pointer shadow-sm">P-18</div>
                <div className="h-14 flex items-center justify-center rounded-lg bg-green-100 text-green-800 border border-green-300 font-bold text-xs hover:scale-105 transition-transform cursor-pointer shadow-sm">P-19</div>
                <div className="h-14 flex items-center justify-center rounded-lg bg-green-100 text-green-800 border border-green-300 font-bold text-xs hover:scale-105 transition-transform cursor-pointer shadow-sm">P-20</div>
              </div>
            </div>
          </div>

          {/* Right Column (Smaller) */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Vehicle Search */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-outline-variant">
              <h3 className="text-xl font-bold text-on-surface mb-4">{t('quickSearch')}</h3>
              <div className="flex gap-2">
                <input className="flex-1 h-12 rounded-lg border border-outline-variant bg-surface focus:ring-2 focus:ring-primary/20 focus:border-primary px-4 outline-none transition-all" placeholder="Plate / Mobile No." type="text" />
                <button 
                  onClick={handleSearchClick}
                  className="bg-primary text-on-primary w-12 rounded-lg flex items-center justify-center hover:bg-primary/90 active:scale-95 transition-all shadow-md"
                >
                  <span className="material-symbols-outlined">search</span>
                </button>
              </div>
            </div>

            {/* Search Result Card */}
            <div className={`bg-primary/5 p-6 rounded-xl border border-primary/20 transition-all duration-300 ${highlightSearch ? 'ring-4 ring-primary/20 shadow-lg' : 'shadow-sm'}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest">{t('searchResult') || 'Search Result'}</p>
                  <h4 className="text-2xl font-black text-on-surface mt-1">MH12 AB 1234</h4>
                </div>
                <span className="px-2 py-1 bg-primary-fixed text-on-primary-fixed text-[10px] font-bold rounded">FOUR WHEELER</span>
              </div>
              <div className="space-y-3 py-4 border-y border-outline-variant/30">
                <div className="flex justify-between">
                  <span className="text-sm text-on-surface-variant font-medium">{t('owner') || 'Owner'}</span>
                  <span className="text-sm font-bold text-on-surface">Rajesh Modi</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-on-surface-variant font-medium">{t('assignedSlot') || 'Assigned Slot'}</span>
                  <span className="text-sm font-bold bg-primary text-white px-2 py-0.5 rounded">A-12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-on-surface-variant font-medium">{t('entryTime') || 'Entry Time'}</span>
                  <span className="text-sm font-bold text-on-surface">09:45 AM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-on-surface-variant font-medium">{t('duration') || 'Duration'}</span>
                  <span className="text-sm font-bold text-on-surface">2h 15m</span>
                </div>
              </div>
              <button className="w-full mt-6 border-2 border-primary text-primary font-bold py-3 rounded-xl hover:bg-primary hover:text-on-primary active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                <span className="material-symbols-outlined">exit_to_app</span>
                {t('markVehicleExit')}
              </button>
            </div>

            {/* Analytics */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-outline-variant">
              <h3 className="text-xl font-bold text-on-surface mb-6">{t('peakHourCapacity')}</h3>
              <div className="space-y-5">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-on-surface">
                    <span>{t('morningPeak')}</span>
                    <span>85%</span>
                  </div>
                  <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-on-surface">
                    <span>{t('middayPeak')}</span>
                    <span>98%</span>
                  </div>
                  <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                    <div className="h-full bg-secondary rounded-full" style={{ width: '98%' }}></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-on-surface">
                    <span>{t('eveningPeak')}</span>
                    <span>65%</span>
                  </div>
                  <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
                    <div className="h-full bg-primary-fixed-dim rounded-full" style={{ width: '65%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Table */}
        <section className="bg-white rounded-xl shadow-sm border border-outline-variant overflow-hidden">
          <div className="px-6 py-5 border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest">
            <h3 className="text-xl font-bold text-on-surface">{t('recentVehicleEntries')}</h3>
            <button className="text-primary text-sm font-bold flex items-center gap-1 hover:underline">
              {t('viewAllEntries')} <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-low text-on-surface-variant uppercase text-xs font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4 border-b border-outline-variant/30">{t('vehicleNumber')}</th>
                  <th className="px-6 py-4 border-b border-outline-variant/30">{t('slot') || 'Slot'}</th>
                  <th className="px-6 py-4 border-b border-outline-variant/30">{t('entryTime') || 'Entry Time'}</th>
                  <th className="px-6 py-4 border-b border-outline-variant/30">{t('status') || 'Status'}</th>
                  <th className="px-6 py-4 border-b border-outline-variant/30 text-right">{t('action') || 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30 text-sm">
                <tr className="hover:bg-surface-container-low transition-colors group cursor-pointer">
                  <td className="px-6 py-4 font-bold text-on-surface group-hover:text-primary transition-colors">GJ01 XY 9988</td>
                  <td className="px-6 py-4"><span className="px-2.5 py-1 bg-surface-container-highest font-semibold rounded text-xs">P-05</span></td>
                  <td className="px-6 py-4 font-medium text-on-surface-variant">11:20 AM</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span> {t('parked')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 rounded-full hover:bg-surface-container-high text-on-surface-variant hover:text-primary transition-colors"><span className="material-symbols-outlined">more_vert</span></button>
                  </td>
                </tr>
                <tr className="hover:bg-surface-container-low transition-colors group cursor-pointer">
                  <td className="px-6 py-4 font-bold text-on-surface group-hover:text-primary transition-colors">DL05 RT 1122</td>
                  <td className="px-6 py-4"><span className="px-2.5 py-1 bg-surface-container-highest font-semibold rounded text-xs">P-12</span></td>
                  <td className="px-6 py-4 font-medium text-on-surface-variant">10:45 AM</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span> {t('parked')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 rounded-full hover:bg-surface-container-high text-on-surface-variant hover:text-primary transition-colors"><span className="material-symbols-outlined">more_vert</span></button>
                  </td>
                </tr>
                <tr className="hover:bg-surface-container-low transition-colors group cursor-pointer">
                  <td className="px-6 py-4 font-bold text-on-surface group-hover:text-primary transition-colors">KA03 MH 4455</td>
                  <td className="px-6 py-4"><span className="px-2.5 py-1 bg-surface-container-highest font-semibold rounded text-xs">B-02</span></td>
                  <td className="px-6 py-4 font-medium text-on-surface-variant">09:30 AM</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-surface-variant text-on-surface-variant">
                      <span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant"></span> {t('exited')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 rounded-full hover:bg-surface-container-high text-on-surface-variant hover:text-primary transition-colors"><span className="material-symbols-outlined">more_vert</span></button>
                  </td>
                </tr>
                <tr className="hover:bg-surface-container-low transition-colors group cursor-pointer">
                  <td className="px-6 py-4 font-bold text-on-surface group-hover:text-primary transition-colors">MH04 JJ 0001</td>
                  <td className="px-6 py-4"><span className="px-2.5 py-1 bg-primary/10 text-primary font-bold rounded text-xs">VIP-01</span></td>
                  <td className="px-6 py-4 font-medium text-on-surface-variant">08:15 AM</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span> {t('parked')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 rounded-full hover:bg-surface-container-high text-on-surface-variant hover:text-primary transition-colors"><span className="material-symbols-outlined">more_vert</span></button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
