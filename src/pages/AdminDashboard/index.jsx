import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

export default function AdminDashboard() {
  const { t } = useLanguage();

  const [currentTime, setCurrentTime] = useState('');
  const [analyticsView, setAnalyticsView] = useState('daily');
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const [visitorLimit, setVisitorLimit] = useState(50000);
  
  const [stats, setStats] = useState({
    bookingsToday: 0,
    visitorsToday: 0,
    visitorsInside: 0,
    queueCount: 0,
    vipVisitors: 0,
    parkingOccupancy: 0,
    completedDarshans: 0,
    cancelledBookings: 0
  });

  const [servingToken, setServingToken] = useState('None');
  const [queueFlowRate, setQueueFlowRate] = useState(0);
  const [nextTokens, setNextTokens] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [staffAnalytics, setStaffAnalytics] = useState([]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options = { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
      setCurrentTime(now.toLocaleString('en-US', options).replace(',', ' |'));
    };
    updateTime();
    const clockTimer = setInterval(updateTime, 1000);
    return () => clearInterval(clockTimer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/stats`);
        const settingsRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/settings`);
        const queueRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/queue`);
        const activitiesRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/stats/activities`);
        const staffRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/stats/staff`);
        
        if (activitiesRes.ok) {
          const acts = await activitiesRes.json();
          setRecentActivities(acts);
        }
        
        if (staffRes.ok) {
          const staff = await staffRes.json();
          setStaffAnalytics(staff);
        }
        
        if (statsRes.ok && settingsRes.ok && queueRes.ok) {
          const statsData = await statsRes.json();
          const settingsData = await settingsRes.json();
          const queueData = await queueRes.json();
          
          setStats({
            bookingsToday: statsData.bookingsToday,
            visitorsToday: statsData.visitorsToday,
            visitorsInside: statsData.visitorsInside,
            queueCount: statsData.queueCount,
            vipVisitors: statsData.vipVisitors,
            parkingOccupancy: settingsData.parkingOccupancy || 0,
            completedDarshans: statsData.completedDarshans,
            cancelledBookings: statsData.cancelledBookings
          });
          
          setVisitorLimit(settingsData.visitorLimit || 50000);
          setIsEmergencyActive(settingsData.isEmergencyActive || false);
          
          const serving = queueData.filter(q => q.status === 'serving');
          const waiting = queueData.filter(q => q.status === 'waiting');
          
          setServingToken(serving.length > 0 ? serving[0].tokenNumber : 'None');
          setNextTokens(waiting.slice(0, 5).map(q => q.tokenNumber));
          setQueueFlowRate(statsData.queueCount > 0 ? Math.min(100, Math.max(20, 100 - (statsData.queueCount / 2))) : 100);
        }
      } catch (e) {
        console.error(e);
      }
    };
    
    fetchData();
    const timer = setInterval(fetchData, 10000);
    return () => clearInterval(timer);
  }, []);

  const handleEmergencyClosure = async () => {
    try {
        if (!isEmergencyActive) {
          if (window.confirm('CRITICAL: Are you sure you want to trigger an Emergency Closure? This will halt all entry and notify all onsite personnel.')) {
            await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/settings`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isEmergencyActive: true })
            });
            alert('PROTOCOL INITIATED: Gate signals set to RED. Public notification dispatched.');
            setIsEmergencyActive(true);
          }
        } else {
          if (window.confirm('Are you sure you want to lift the Emergency Closure?')) {
            await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/settings`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isEmergencyActive: false })
            });
            setIsEmergencyActive(false);
          }
        }
    } catch (e) {
        console.error(e);
    }
  };

  const adjustCapacity = async (amount) => {
    const newLimit = Math.max(1000, visitorLimit + amount);
    try {
        await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/settings`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ visitorLimit: newLimit })
        });
        setVisitorLimit(newLimit);
    } catch (e) {
        console.error(e);
    }
  };

  // Mock data for charts
  const dailyChart = [
    { label: 'Mon', normal: 40, festival: 20 },
    { label: 'Tue', normal: 55, festival: 35 },
    { label: 'Wed', normal: 30, festival: 15 },
    { label: 'Thu', normal: 95, festival: 95 }, // Peak/today
    { label: 'Fri', normal: 55, festival: 45 },
    { label: 'Sat', normal: 70, festival: 60 },
    { label: 'Sun', normal: 85, festival: 80 }
  ];

  const weeklyChart = [
    { label: 'Wk 1', normal: 60, festival: 40 },
    { label: 'Wk 2', normal: 45, festival: 50 },
    { label: 'Wk 3', normal: 80, festival: 70 },
    { label: 'Wk 4', normal: 90, festival: 85 }
  ];

  const chartData = analyticsView === 'daily' ? dailyChart : weeklyChart;

  return (
    <div className="px-4 md:px-10 py-8 max-w-[1600px] mx-auto w-full space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant/30 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-on-surface">{t('welcomeAdmin')}</h1>
          <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-1">
            <p className="text-on-surface-variant text-sm font-medium" id="current-time">
              {currentTime || 'Jun 20 | 2026, 09:47 PM'}
            </p>
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant font-label-sm">
              {t('liveSystemStatus')}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <p className="text-sm font-bold text-primary">Sri Devi Temple</p>
            <p className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant font-label-sm">
              Udaipur, India
            </p>
          </div>
          <button className="bg-primary text-on-primary h-10 px-6 rounded-lg font-bold text-sm flex items-center gap-2 hover:bg-opacity-90 transition-all shadow-sm active:scale-95">
            <span className="material-symbols-outlined text-lg">add</span>
            New Entry
          </button>
        </div>
      </div>

      {/* Emergency Alert Banner */}
      {isEmergencyActive && (
        <div className="bg-error-container text-on-error-container p-4 rounded-xl border border-error/30 flex items-center gap-3 animate-pulse">
          <span className="material-symbols-outlined text-error text-2xl">report</span>
          <div>
            <p className="font-bold text-sm">EMERGENCY PROTOCOL ACTIVE</p>
            <p className="text-xs opacity-90">All temple entrances are closed. Signals are set to red and public notices have been dispatched.</p>
          </div>
        </div>
      )}

      {/* Statistics Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1 */}
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-soft hover:-translate-y-1 transition-transform duration-200">
          <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider font-label-sm mb-1">{t('totalBookingsToday')}</p>
          <div className="flex items-end justify-between">
            <h3 className="text-2xl font-bold">{stats.bookingsToday.toLocaleString()}</h3>
            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">+5.2%</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-soft hover:-translate-y-1 transition-transform duration-200">
          <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider font-label-sm mb-1">{t('totalVisitorsToday')}</p>
          <div className="flex items-end justify-between">
            <h3 className="text-2xl font-bold">{stats.visitorsToday.toLocaleString()}</h3>
            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">+12%</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-soft border-l-4 border-l-primary hover:-translate-y-1 transition-transform duration-200">
          <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider font-label-sm mb-1">{t('visitorsInside')}</p>
          <div className="flex items-end justify-between">
            <h3 className="text-2xl font-bold">{stats.visitorsInside}</h3>
            <div className="flex items-center gap-1 text-on-surface-variant">
              <span className="material-symbols-outlined text-sm">person</span>
              <span className="text-xs font-medium">85% Cap.</span>
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-soft hover:-translate-y-1 transition-transform duration-200">
          <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider font-label-sm mb-1">{t('queueCount')}</p>
          <div className="flex items-end justify-between">
            <h3 className="text-2xl font-bold">{stats.queueCount}</h3>
            <span className="text-xs font-bold text-primary">Avg 22m/hr</span>
          </div>
        </div>

        {/* Card 5 */}
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-soft hover:-translate-y-1 transition-transform duration-200">
          <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider font-label-sm mb-1">{t('vipVisitors')}</p>
          <div className="flex items-end justify-between">
            <h3 className="text-2xl font-bold">{stats.vipVisitors}</h3>
            <span className="text-xs font-bold text-secondary">Verified</span>
          </div>
        </div>

        {/* Card 6 */}
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-soft hover:-translate-y-1 transition-transform duration-200">
          <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider font-label-sm mb-1">{t('parkingOccupancy')}</p>
          <div className="flex items-end justify-between">
            <h3 className="text-2xl font-bold">{stats.parkingOccupancy}%</h3>
            <div className="w-16 h-1.5 bg-outline-variant rounded-full overflow-hidden">
              <div className="bg-primary h-full" style={{ width: `${stats.parkingOccupancy}%` }}></div>
            </div>
          </div>
        </div>

        {/* Card 7 */}
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-soft hover:-translate-y-1 transition-transform duration-200">
          <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider font-label-sm mb-1">{t('completedDarshans')}</p>
          <div className="flex items-end justify-between">
            <h3 className="text-2xl font-bold">{stats.completedDarshans.toLocaleString()}</h3>
            <span className="text-xs font-bold text-green-600">83% Success</span>
          </div>
        </div>

        {/* Card 8 */}
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant shadow-soft hover:-translate-y-1 transition-transform duration-200">
          <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider font-label-sm mb-1">{t('cancelledBookings')}</p>
          <div className="flex items-end justify-between">
            <h3 className="text-2xl font-bold">{stats.cancelledBookings}</h3>
            <span className="text-xs font-bold text-error">{((stats.cancelledBookings / stats.bookingsToday) * 100).toFixed(1)}% Rate</span>
          </div>
        </div>
      </section>

      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Live Queue & Progress */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-soft h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                  {t('liveQueueOverview')}
                </h2>
                <div className="bg-primary-container px-3 py-1 rounded-full text-[10px] font-bold text-on-primary-container uppercase animate-pulse">
                  Live Updates
                </div>
              </div>

              <div className="bg-surface-container flex flex-col items-center justify-center p-6 rounded-lg mb-6 text-center">
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest font-label-sm mb-1">Current Serving Token</p>
                <h3 className="text-4xl font-extrabold text-primary">#T-{servingToken}</h3>
                <div className="mt-4 flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase">Avg Wait</p>
                    <p className="text-lg font-bold">45 mins</p>
                  </div>
                  <span className="w-px h-8 bg-outline-variant"></span>
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase">Throughput</p>
                    <p className="text-lg font-bold">120/hr</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-xs font-bold text-on-surface-variant uppercase font-label-sm">Next 5 Tokens</p>
                <div className="grid grid-cols-5 gap-2">
                  {nextTokens.map((token, idx) => (
                    <div key={idx} className="bg-surface-container-low p-2 rounded text-center border border-outline-variant">
                      <p className="text-[10px] font-bold opacity-50">{idx === 0 ? 'NEXT' : `+${idx + 1}`}</p>
                      <p className="text-sm font-bold">{token}</p>
                    </div>
                  ))}
                  {nextTokens.length === 0 && <p className="col-span-5 text-sm text-center text-on-surface-variant py-2">No tokens waiting</p>}
                </div>
                
                <div className="pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-on-surface-variant">Queue Flow Rate</p>
                    <p className="text-xs font-bold text-primary">{queueFlowRate}% Optimal</p>
                  </div>
                  <div className="h-2 w-full bg-outline-variant rounded-full overflow-hidden">
                    <div className="bg-primary h-full transition-all duration-500" style={{ width: `${queueFlowRate}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
            
            <button className="mt-6 w-full py-2.5 rounded-lg border border-primary text-primary font-bold text-sm hover:bg-primary/5 active:scale-98 transition-all">
              View Full Live Queue
            </button>
          </div>
        </div>

        {/* Booking Analytics Visualization */}
        <div className="lg:col-span-7">
          <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-soft h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary">query_stats</span>
                {t('bookingAnalytics')}
              </h2>
              <div className="flex bg-surface-container rounded-lg p-0.5">
                <button 
                  onClick={() => setAnalyticsView('daily')}
                  className={`px-3 py-1 rounded text-xs font-bold transition-all ${analyticsView === 'daily' ? 'bg-white text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
                >
                  Daily
                </button>
                <button 
                  onClick={() => setAnalyticsView('weekly')}
                  className={`px-3 py-1 rounded text-xs font-bold transition-all ${analyticsView === 'weekly' ? 'bg-white text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
                >
                  Weekly
                </button>
              </div>
            </div>

            <div className="flex-1 min-h-[250px] relative flex flex-col justify-end">
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                <div className="border-b border-outline w-full h-full"></div>
                <div className="border-b border-outline w-full h-full"></div>
                <div className="border-b border-outline w-full h-full"></div>
                <div className="border-b border-outline w-full h-full"></div>
              </div>

              {/* Chart Bars */}
              <div className="flex items-end gap-4 h-48 px-4 relative z-10">
                {chartData.map((data, idx) => (
                  <div key={idx} className="flex-1 flex flex-col justify-end h-full group relative cursor-pointer">
                    <div className="flex gap-1 w-full items-end h-full">
                      <div 
                        className="flex-1 bg-primary rounded-t-md hover:opacity-90 transition-all duration-300"
                        style={{ height: `${data.normal}%` }}
                        title={`Normal: ${data.normal}%`}
                      ></div>
                      <div 
                        className="flex-1 bg-primary-container opacity-50 rounded-t-md hover:opacity-75 transition-all duration-300"
                        style={{ height: `${data.festival}%` }}
                        title={`Festival: ${data.festival}%`}
                      ></div>
                    </div>
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-on-surface text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-md">
                      Normal: {data.normal}% | Festival: {data.festival}%
                    </div>
                  </div>
                ))}
              </div>

              <div className="w-full h-px bg-outline mt-2"></div>
              
              <div className="flex w-full justify-between mt-2 px-4 text-[10px] font-bold text-on-surface-variant uppercase">
                {chartData.map((data, idx) => (
                  <span key={idx} className={data.label === 'Thu' ? 'text-primary' : ''}>
                    {data.label}
                  </span>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-6 justify-center">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-primary"></span>
                  <span className="text-xs font-medium">Normal Days</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-primary-container opacity-50"></span>
                  <span className="text-xs font-medium">Festival Bookings</span>
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 bg-tertiary-container/10 rounded-lg border border-tertiary/20">
                <p className="text-[10px] font-bold uppercase text-tertiary font-label-sm">Projected Capacity</p>
                <p className="text-lg font-bold text-on-surface">15,000 / Day</p>
              </div>
              <div className="p-3 bg-secondary-container/10 rounded-lg border border-secondary/20">
                <p className="text-[10px] font-bold uppercase text-secondary font-label-sm">Slot Utilization</p>
                <p className="text-lg font-bold text-on-surface">92.4%</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Middle Section: Recent Activity & Festival Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Recent Activity Table */}
        <div className="lg:col-span-8">
          <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-soft h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">{t('recentActivities')}</h2>
              <button className="text-sm font-bold text-primary hover:underline">View All Logs</button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="text-xs font-bold text-on-surface-variant uppercase font-label-sm border-b border-outline-variant">
                  <tr>
                    <th className="py-3 px-2">Devotee / ID</th>
                    <th className="py-3 px-2">Action</th>
                    <th className="py-3 px-2">Staff Member</th>
                    <th className="py-3 px-2">Gate</th>
                    <th className="py-3 px-2">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant text-sm">
                  {recentActivities.length > 0 ? recentActivities.map((act, idx) => (
                    <tr key={idx} className="hover:bg-surface-container-lowest transition-colors">
                      <td className="py-3 px-2">
                        <p className="font-bold text-on-surface">{act.name}</p>
                        <p className="text-[10px] text-on-surface-variant font-medium">{act.token || 'N/A'}</p>
                      </td>
                      <td className="py-3 px-2">
                        <span className="bg-primary-container text-on-primary-container px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">
                          {act.action}
                        </span>
                      </td>
                      <td className="py-3 px-2 font-medium">{act.staffName}</td>
                      <td className="py-3 px-2 text-on-surface-variant text-xs">{act.gate}</td>
                      <td className="py-3 px-2 text-on-surface-variant text-xs">
                        {new Date(act.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="5" className="text-center py-8 text-on-surface-variant text-sm font-medium">No recent activities found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Festival Overview Card */}
        <div className="lg:col-span-4">
          <div className="bg-primary p-6 rounded-xl shadow-lg h-full text-on-primary relative overflow-hidden flex flex-col justify-between">
            {/* Decorative glow */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white opacity-10 rounded-full blur-3xl"></div>
            
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined">celebration</span>
                <p className="text-xs font-bold uppercase tracking-widest font-label-sm text-white/90">{t('upcomingFestival')}</p>
              </div>
              <div>
                <h3 className="text-3xl font-extrabold mb-2">Ram Navami</h3>
                <p className="text-sm opacity-90 leading-relaxed">Peak event expected on 17th April. High capacity management required.</p>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs border-b border-white border-opacity-20 pb-2">
                  <span className="font-medium text-white/80">Total Capacity</span>
                  <span className="font-bold">50,000 / Day</span>
                </div>
                <div className="flex justify-between items-center text-xs border-b border-white border-opacity-20 pb-2">
                  <span className="font-medium text-white/80">Advance Bookings</span>
                  <span className="font-bold">34,290 (68%)</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-white/80">Special Pooja Slots</span>
                  <span className="font-bold text-white bg-primary-container px-2 py-0.5 rounded">Fully Booked</span>
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-3 relative z-10">
              <button className="flex-1 bg-white text-primary font-bold py-2.5 rounded-lg text-sm shadow-sm hover:bg-opacity-90 active:scale-95 transition-all">
                Adjust Capacity
              </button>
              <button className="p-2 border border-white border-opacity-40 rounded-lg hover:bg-white hover:bg-opacity-10 active:scale-95 transition-all">
                <span className="material-symbols-outlined text-white">settings_suggest</span>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Staff Performance Analytics */}
      <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-soft">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary font-variation-settings-['FILL'_1]">badge</span>
            Committee Staff Analytics
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {staffAnalytics.length > 0 ? staffAnalytics.map((staff, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-outline-variant hover:border-secondary transition-all bg-surface flex flex-col justify-between h-full group">
              <div>
                <p className="font-bold text-on-surface text-lg group-hover:text-secondary transition-colors">{staff.name}</p>
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">Entries Processed</p>
                  <p className="text-2xl font-extrabold text-secondary">{staff.scans}</p>
                </div>
              </div>
              <p className="text-[10px] text-on-surface-variant mt-4 font-bold flex items-center gap-1 border-t border-outline-variant/50 pt-2">
                <span className="material-symbols-outlined text-[12px]">schedule</span>
                Last Active: {new Date(staff.lastActive).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          )) : (
            <p className="text-sm text-on-surface-variant col-span-full font-medium py-4">No staff analytics available yet. Data will appear when entries are verified.</p>
          )}
        </div>
      </div>

      {/* Bottom Section: Quick Actions & Notifications Center */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Quick Actions */}
        <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant hover:border-primary transition-all duration-200 cursor-pointer group flex flex-col justify-between">
            <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-primary">add_box</span>
            </div>
            <div>
              <p className="font-bold text-sm text-on-surface">Add Booking</p>
              <p className="text-[10px] text-on-surface-variant mt-1">Direct portal entry</p>
            </div>
          </div>

          <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant hover:border-primary transition-all duration-200 cursor-pointer group flex flex-col justify-between">
            <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-primary">verified_user</span>
            </div>
            <div>
              <p className="font-bold text-sm text-on-surface">Add VIP Entry</p>
              <p className="text-[10px] text-on-surface-variant mt-1">Manual clearance</p>
            </div>
          </div>

          <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant hover:border-primary transition-all duration-200 cursor-pointer group flex flex-col justify-between">
            <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-primary">manage_accounts</span>
            </div>
            <div>
              <p className="font-bold text-sm text-on-surface">Manage Staff</p>
              <p className="text-[10px] text-on-surface-variant mt-1">Roster & Attendance</p>
            </div>
          </div>

          <Link to="/dashboard/admin/announcements" className="bg-surface-container-low p-4 rounded-xl border border-outline-variant hover:border-primary transition-all duration-200 cursor-pointer group flex flex-col justify-between">
            <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-primary">notification_add</span>
            </div>
            <div>
              <p className="font-bold text-sm text-on-surface">Create Announcement</p>
              <p className="text-[10px] text-on-surface-variant mt-1">App & SMS alerts</p>
            </div>
          </Link>
        </div>

        {/* Notifications Center */}
        <div className="lg:col-span-4">
          <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-soft">
            <h2 className="text-sm font-bold uppercase tracking-wider font-label-sm text-on-surface-variant mb-6">
              {t('notificationCenter')}
            </h2>
            <div className="space-y-4">
              <div className="flex gap-3 items-start">
                <div className="mt-1.5 w-2 h-2 rounded-full bg-error flex-shrink-0"></div>
                <div>
                  <p className="text-sm font-bold leading-tight text-on-surface">Server Delay Alert</p>
                  <p className="text-[10px] text-on-surface-variant mt-1">Verification system lag detected at South Gate.</p>
                  <p className="text-[10px] font-medium text-outline mt-1">2 mins ago</p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className="mt-1.5 w-2 h-2 rounded-full bg-primary flex-shrink-0"></div>
                <div>
                  <p className="text-sm font-bold leading-tight text-on-surface">Capacity Warning</p>
                  <p className="text-[10px] text-on-surface-variant mt-1">90% of afternoon slots filled for tomorrow.</p>
                  <p className="text-[10px] font-medium text-outline mt-1">1 hour ago</p>
                </div>
              </div>

              <div className="flex gap-3 items-start opacity-60">
                <div className="mt-1.5 w-2 h-2 rounded-full bg-outline flex-shrink-0"></div>
                <div>
                  <p className="text-sm font-bold leading-tight text-on-surface">System Backup Complete</p>
                  <p className="text-[10px] text-on-surface-variant mt-1">Weekly data archive successful.</p>
                  <p className="text-[10px] font-medium text-outline mt-1">3 hours ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Capacity & Emergency Control Panel */}
      <section className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-soft">
        <h3 className="text-lg font-bold mb-4">{t('capacityControls')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-surface p-4 rounded-xl border border-outline-variant/50">
            <span className="text-sm font-bold text-on-surface min-w-[150px]">{t('dailyVisitorLimit')}:</span>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => adjustCapacity(-5000)}
                className="w-10 h-10 rounded bg-outline-variant/30 hover:bg-outline-variant/50 flex items-center justify-center font-bold text-lg transition-colors active:scale-90"
              >
                -5k
              </button>
              <span className="font-extrabold text-xl w-28 text-center text-primary">
                {visitorLimit.toLocaleString()}
              </span>
              <button 
                onClick={() => adjustCapacity(5000)}
                className="w-10 h-10 rounded bg-outline-variant/30 hover:bg-outline-variant/50 flex items-center justify-center font-bold text-lg transition-colors active:scale-90"
              >
                +5k
              </button>
            </div>
          </div>

          <div>
            <button 
              onClick={handleEmergencyClosure}
              className={`w-full py-4 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98] ${
                isEmergencyActive 
                  ? 'bg-on-surface hover:bg-on-surface/90' 
                  : 'bg-error hover:bg-error/95 shadow-error/20'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">
                {isEmergencyActive ? 'lock_open' : 'report'}
              </span>
              {isEmergencyActive ? t('liftEmergency') : t('emergencyClosure')}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
