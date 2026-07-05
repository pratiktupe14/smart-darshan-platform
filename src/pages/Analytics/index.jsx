import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import ExportModal from '../../components/ExportModal';
export default function Analytics() {
  const {
    t
  } = useLanguage();
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const [visitorLimit, setVisitorLimit] = useState(5000);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const handleEmergencyClosure = () => {
    if (!isEmergencyActive) {
      if (window.confirm('CRITICAL: Are you sure you want to trigger an Emergency Closure? This will halt all entry and notify all onsite personnel.')) {
        alert('PROTOCOL INITIATED: Gate signals set to RED. Public notification dispatched.');
        setIsEmergencyActive(true);
      }
    }
  };
  const updateLimit = change => {
    setVisitorLimit(prev => Math.max(100, prev + change));
  };
  return <>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="font-headline-lg text-[32px] font-bold text-on-surface">{t('analyticsTitle')}</h1>
          <p className="text-on-surface-variant font-body-md">{t('analyticsSubtitle')}</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border-2 border-outline text-on-surface-variant rounded-lg font-label-md text-label-md hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-[18px]">calendar_today</span>
            {t('last24Hours')}
          </button>
          <button onClick={() => setIsExportModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-secondary text-white rounded-lg font-label-md text-label-md hover:opacity-90 transition-colors">
            <span className="material-symbols-outlined text-[18px]">download</span>
            {t('exportReport')}
          </button>
        </div>
      </div>

      {/* Bento Grid Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
        {/* Real-time Visitor Trends */}
        <div className="md:col-span-8 tonal-card sacred-border rounded-xl p-6 shadow-soft">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-headline-md text-[24px] font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[28px]">trending_up</span>
              {t('dailyVisitorTrends')}
            </h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5 text-xs font-label-md font-bold">
                <span className="w-3 h-3 rounded-full bg-primary"></span> {t('current') || 'Current'}
              </div>
              <div className="flex items-center gap-1.5 text-xs font-label-md font-bold">
                <span className="w-3 h-3 rounded-full bg-outline-variant"></span> {t('average') || 'Average'}
              </div>
            </div>
          </div>
          {/* Simulated Chart */}
          <div className="relative h-64 w-full flex items-end gap-1">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
              <div className="border-b border-outline h-full"></div>
              <div className="border-b border-outline h-full"></div>
              <div className="border-b border-outline h-full"></div>
              <div className="border-b border-outline h-full"></div>
            </div>
            {/* Chart Bars */}
            {[40, 55, 85, 65, 45, 95, 70, 50, 40, 80, 60, 30].map((height, index) => <div key={index} className={`flex-1 rounded-t transition-transform hover:-translate-y-1 cursor-pointer group relative ${height > 75 ? 'bg-primary hover:bg-primary-container' : 'bg-primary-fixed-dim hover:bg-primary'}`} style={{
            height: `${height}%`
          }}>
                {height === 85 && <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-on-surface text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">{t("42k")}</span>}
              </div>)}
          </div>
          <div className="flex justify-between mt-4 text-[10px] text-on-surface-variant font-label-md font-bold">
            <span>{t("0600Am")}</span>
            <span>{t("0900Am")}</span>
            <span>{t("1200Pm")}</span>
            <span>{t("0300Pm")}</span>
            <span>{t("0600Pm")}</span>
            <span>{t("0900Pm")}</span>
          </div>
        </div>

        {/* Crowd Analytics Gauge */}
        <div className="md:col-span-4 tonal-card rounded-xl p-6 flex flex-col items-center justify-center text-center">
          <h3 className="font-label-md text-label-md text-on-surface-variant mb-6 uppercase tracking-wider font-bold">{t('crowdCapacity')}</h3>
          <div className="relative w-48 h-48 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle className="text-surface-container-high" cx="96" cy="96" fill="transparent" r="80" stroke="currentColor" strokeWidth="12"></circle>
              <circle className="text-primary transition-all duration-1000" cx="96" cy="96" fill="transparent" r="80" stroke="currentColor" strokeDasharray="502.6" strokeDashoffset="125.6" strokeWidth="12"></circle>
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-4xl font-extrabold text-on-surface tracking-tighter">75%</span>
              <span className="text-xs text-on-surface-variant uppercase font-bold tracking-widest mt-1">{t('optimal')}</span>
            </div>
          </div>
          <div className="mt-6">
            <p className="font-body-md text-on-surface mb-1 font-bold">2,450 {t('peopleOnsite')}</p>
            <p className="text-xs text-on-surface-variant font-medium">{t('recommendedLimit')}: 3,500</p>
          </div>
        </div>

        {/* Vehicle Count Report */}
        <div className="md:col-span-4 tonal-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-label-md text-label-md font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-[20px]">directions_car</span>
              {t('vehicleEntry')}
            </h3>
            <span className="text-2xl font-extrabold text-primary">842</span>
          </div>
          <div className="space-y-4">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs mb-1">
                <span>{t('twoWheelers')}</span>
                <span className="font-bold">520</span>
              </div>
              <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                <div className="h-full bg-secondary w-[62%]"></div>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs mb-1">
                <span>{t('fourWheelers')}</span>
                <span className="font-bold">310</span>
              </div>
              <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                <div className="h-full bg-secondary w-[38%]"></div>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-xs mb-1">
                <span>{t('largeVehicles')}</span>
                <span className="font-bold">12</span>
              </div>
              <div className="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
                <div className="h-full bg-secondary w-[5%]"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Person Count Widget */}
        <div className="md:col-span-4 tonal-card rounded-xl p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-label-md text-label-md font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">person_check</span>
              {t('liveEntryCount')}
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-container-low p-4 rounded-lg">
              <p className="text-[10px] text-on-surface-variant font-bold uppercase mb-1 tracking-wider">{t('totalMale')}</p>
              <p className="text-2xl font-extrabold text-on-surface">1,120</p>
            </div>
            <div className="bg-surface-container-low p-4 rounded-lg">
              <p className="text-[10px] text-on-surface-variant font-bold uppercase mb-1 tracking-wider">{t('totalFemale')}</p>
              <p className="text-2xl font-extrabold text-on-surface">1,330</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-outline-variant flex justify-between items-center">
            <span className="text-xs text-on-surface-variant font-medium">{t('avgDwellTime')}</span>
            <span className="font-label-md text-label-md font-extrabold text-primary">{t("45Mins")}</span>
          </div>
        </div>

        {/* Slot Management Controls */}
        <div className="md:col-span-4 bg-primary-container text-on-primary-container rounded-xl p-6 shadow-soft flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="font-headline-md text-[24px] font-bold mb-2">{t('slotManagement')}</h3>
            <p className="font-body-md text-sm opacity-90 mb-6 font-medium">{t('modifyVisitorLimits')}</p>
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white/20 p-3 rounded-lg backdrop-blur-sm border border-white/10">
                <span className="text-sm font-bold">{t('dailyVisitorLimit')}</span>
                <div className="flex items-center gap-3">
                  <button onClick={() => updateLimit(-100)} className="w-8 h-8 rounded bg-white/20 hover:bg-white/30 flex items-center justify-center font-bold text-lg transition-colors">-</button>
                  <span className="font-extrabold text-lg w-16 text-center">{visitorLimit.toLocaleString()}</span>
                  <button onClick={() => updateLimit(100)} className="w-8 h-8 rounded bg-white/20 hover:bg-white/30 flex items-center justify-center font-bold text-lg transition-colors">+</button>
                </div>
              </div>
              <button onClick={handleEmergencyClosure} className={`w-full py-4 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${isEmergencyActive ? 'bg-on-surface scale-95 opacity-90 cursor-not-allowed' : 'bg-error hover:bg-opacity-90 active:scale-95'}`}>
                <span className="material-symbols-outlined text-[20px]">{isEmergencyActive ? 'lock' : 'report'}</span>
                {isEmergencyActive ? t('closureActive') : t('emergencyClosureTitle')}
              </button>
            </div>
          </div>
          {/* Decorative element */}
          <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
            <span className="material-symbols-outlined text-[160px]" style={{
            fontVariationSettings: "'FILL' 1"
          }}>shield</span>
          </div>
        </div>
      </div>

      {/* Audit Logs and Detailed Table Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Audit Logs List */}
        <div className="lg:col-span-4 tonal-card rounded-xl shadow-soft h-[500px] flex flex-col">
          <div className="p-6 border-b border-outline-variant">
            <h3 className="font-headline-md text-[24px] font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-on-surface-variant text-[28px]">history</span>
              {t('auditLogs')}
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
            <div className="flex gap-3 items-start pb-4 border-b border-outline-variant last:border-0">
              <div className="w-2 h-2 rounded-full bg-secondary mt-2 flex-shrink-0"></div>
              <div>
                <p className="text-sm font-bold text-on-surface">{t("slotLimitUpdatedTo5000")}</p>
                <p className="text-[10px] text-on-surface-variant font-medium mt-0.5">{t("byAdminsanjay1024Am")}</p>
              </div>
            </div>
            <div className="flex gap-3 items-start pb-4 border-b border-outline-variant last:border-0">
              <div className="w-2 h-2 rounded-full bg-error mt-2 flex-shrink-0"></div>
              <div>
                <p className="text-sm font-bold text-on-surface">{t("manualGateClosureNorth")}</p>
                <p className="text-[10px] text-on-surface-variant font-medium mt-0.5">{t("bySystemtrigger0945Am")}</p>
              </div>
            </div>
            <div className="flex gap-3 items-start pb-4 border-b border-outline-variant last:border-0">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
              <div>
                <p className="text-sm font-bold text-on-surface">{t("weeklyAnalyticsReportGenerated")}</p>
                <p className="text-[10px] text-on-surface-variant font-medium mt-0.5">{t("autoscheduler0800Am")}</p>
              </div>
            </div>
            <div className="flex gap-3 items-start pb-4 border-b border-outline-variant last:border-0">
              <div className="w-2 h-2 rounded-full bg-secondary mt-2 flex-shrink-0"></div>
              <div>
                <p className="text-sm font-bold text-on-surface">{t("updatedHolidayPoojaTimings")}</p>
                <p className="text-[10px] text-on-surface-variant font-medium mt-0.5">{t("byAdminnehaYesterday")}</p>
              </div>
            </div>
            <div className="flex gap-3 items-start pb-4 border-b border-outline-variant last:border-0">
              <div className="w-2 h-2 rounded-full bg-outline-variant mt-2 flex-shrink-0"></div>
              <div>
                <p className="text-sm font-bold text-on-surface">{t("loginSessionEstablishedFromIp1")}</p>
                <p className="text-[10px] text-on-surface-variant font-medium mt-0.5">{t("byAdminsanjayYesterday")}</p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-surface-container-low text-center rounded-b-xl border-t border-outline-variant">
            <button className="text-primary font-label-md text-label-md font-bold hover:underline">{t('viewAllActivity')}</button>
          </div>
        </div>

        {/* Detailed Stats Table */}
        <div className="lg:col-span-8 tonal-card rounded-xl shadow-soft overflow-hidden flex flex-col">
          <div className="p-6 border-b border-outline-variant flex flex-col sm:flex-row gap-4 sm:items-center justify-between bg-white">
            <h3 className="font-headline-md text-[24px] font-bold">{t('hourlyEntryStats')}</h3>
            <div className="flex bg-surface-container rounded-lg p-1">
              <button className="px-4 py-1.5 bg-white shadow-sm rounded-md text-xs font-bold text-primary transition-all">{t('table')}</button>
              <button className="px-4 py-1.5 text-xs font-bold text-on-surface-variant hover:text-primary transition-all">{t('heatmap')}</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-low text-on-surface-variant uppercase text-[10px] tracking-widest font-extrabold border-b border-outline-variant">
                <tr>
                  <th className="px-6 py-4 whitespace-nowrap">{t('hourSlot')}</th>
                  <th className="px-6 py-4 whitespace-nowrap">{t('totalVisitors')}</th>
                  <th className="px-6 py-4 whitespace-nowrap">{t('vehicles')}</th>
                  <th className="px-6 py-4 whitespace-nowrap">{t('status') || 'Status'}</th>
                  <th className="px-6 py-4 whitespace-nowrap">{t('waitTime')}</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-outline-variant">
                <tr className="hover:bg-surface-container-low transition-colors">
                  <td className="px-6 py-4 font-bold whitespace-nowrap">09:00 - 10:00</td>
                  <td className="px-6 py-4 font-medium">1,240</td>
                  <td className="px-6 py-4 font-medium">156</td>
                  <td className="px-6 py-4"><span className="px-2.5 py-1 rounded-md bg-[#FFF4E5] text-[#FF9933] text-[10px] font-bold uppercase tracking-wider">{t("high")}</span></td>
                  <td className="px-6 py-4 font-medium">{t("25m")}</td>
                </tr>
                <tr className="hover:bg-surface-container-low transition-colors">
                  <td className="px-6 py-4 font-bold whitespace-nowrap">10:00 - 11:00</td>
                  <td className="px-6 py-4 font-medium">2,105</td>
                  <td className="px-6 py-4 font-medium">248</td>
                  <td className="px-6 py-4"><span className="px-2.5 py-1 rounded-md bg-[#F0F7ED] text-[#2D5A27] text-[10px] font-bold uppercase tracking-wider">{t("peak")}</span></td>
                  <td className="px-6 py-4 font-medium">{t("42m")}</td>
                </tr>
                <tr className="hover:bg-surface-container-low transition-colors">
                  <td className="px-6 py-4 font-bold whitespace-nowrap">11:00 - 12:00</td>
                  <td className="px-6 py-4 font-medium">1,890</td>
                  <td className="px-6 py-4 font-medium">192</td>
                  <td className="px-6 py-4"><span className="px-2.5 py-1 rounded-md bg-[#FFF4E5] text-[#FF9933] text-[10px] font-bold uppercase tracking-wider">{t("high")}</span></td>
                  <td className="px-6 py-4 font-medium">{t("30m")}</td>
                </tr>
                <tr className="hover:bg-surface-container-low transition-colors">
                  <td className="px-6 py-4 font-bold whitespace-nowrap">12:00 - 13:00</td>
                  <td className="px-6 py-4 font-medium">950</td>
                  <td className="px-6 py-4 font-medium">88</td>
                  <td className="px-6 py-4"><span className="px-2.5 py-1 rounded-md bg-[#F2F2F2] text-[#666666] text-[10px] font-bold uppercase tracking-wider">{t("normal")}</span></td>
                  <td className="px-6 py-4 font-medium">{t("10m")}</td>
                </tr>
                <tr className="hover:bg-surface-container-low transition-colors">
                  <td className="px-6 py-4 font-bold whitespace-nowrap">13:00 - 14:00</td>
                  <td className="px-6 py-4 font-medium">420</td>
                  <td className="px-6 py-4 font-medium">34</td>
                  <td className="px-6 py-4"><span className="px-2.5 py-1 rounded-md bg-[#F2F2F2] text-[#666666] text-[10px] font-bold uppercase tracking-wider">{t("quiet")}</span></td>
                  <td className="px-6 py-4 font-medium">{t("0m")}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ExportModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} />
    </>;
}