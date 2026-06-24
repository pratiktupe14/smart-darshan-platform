import React, { useState } from 'react';
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
    bookingsToday,
    totalDevoteesInside,
    totalPendingEntries,
    qrScansToday,
    recentActivities,
    announcements, setAnnouncements,
    showToast
  } = useOutletContext();

  const [isAddNoticeModalOpen, setIsAddNoticeModalOpen] = useState(false);
  const [newNoticeTitle, setNewNoticeTitle] = useState('');
  const [newNoticeDesc, setNewNoticeDesc] = useState('');
  const [newNoticePriority, setNewNoticePriority] = useState('low');
  const [newNoticeCategory, setNewNoticeCategory] = useState('general');
  const [isSubmittingNotice, setIsSubmittingNotice] = useState(false);

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    if (!newNoticeTitle.trim() || !newNoticeDesc.trim()) return;

    setIsSubmittingNotice(true);
    try {
      const payload = {
        title: newNoticeTitle,
        content: newNoticeDesc,
        priority: newNoticePriority,
        category: newNoticeCategory,
        author: 'Committee Member',
        isActive: true
      };

      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/announcements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const savedNotice = await res.json();
        setAnnouncements([savedNotice, ...announcements]);
        showToast('Announcement added successfully');
        setIsAddNoticeModalOpen(false);
        setNewNoticeTitle('');
        setNewNoticeDesc('');
        setNewNoticePriority('low');
        setNewNoticeCategory('general');
      } else {
        showToast('Failed to add announcement');
      }
    } catch (err) {
      console.error(err);
      showToast('An error occurred');
    } finally {
      setIsSubmittingNotice(false);
    }
  };

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
          <p className="text-on-surface text-3xl font-extrabold">{qrScansToday?.toLocaleString() || 0}</p>
          <div className="mt-2 flex items-center gap-1 text-on-surface-variant text-xs font-medium">
            <span>Digital entry active</span>
          </div>
        </div>
      </div>

      {/* Extended Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-xl flex flex-col gap-1 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 text-primary/10 group-hover:text-primary/20 transition-colors">
            <span className="material-symbols-outlined text-7xl">book_online</span>
          </div>
          <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider font-label-sm">Today's Bookings</p>
          <p className="text-on-surface text-3xl font-extrabold">{bookingsToday?.toLocaleString() || 0}</p>
          <div className="mt-2 flex items-center gap-1 text-on-surface-variant text-xs font-medium">
            <span>Total Darshan bookings created today</span>
          </div>
        </div>

        <div className="glass-card p-6 rounded-xl flex flex-col gap-1 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 text-primary/10 group-hover:text-primary/20 transition-colors">
            <span className="material-symbols-outlined text-7xl">church</span>
          </div>
          <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider font-label-sm">Inside Temple</p>
          <p className="text-on-surface text-3xl font-extrabold">{totalDevoteesInside?.toLocaleString() || 0}</p>
          <div className="mt-2 flex items-center gap-1 text-on-surface-variant text-xs font-medium">
            <span>Total devotees currently inside</span>
          </div>
        </div>

        <div className="glass-card p-6 rounded-xl flex flex-col gap-1 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 text-primary/10 group-hover:text-primary/20 transition-colors">
            <span className="material-symbols-outlined text-7xl">pending_actions</span>
          </div>
          <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider font-label-sm">Pending Entries</p>
          <p className="text-on-surface text-3xl font-extrabold">{totalPendingEntries?.toLocaleString() || 0}</p>
          <div className="mt-2 flex items-center gap-1 text-on-surface-variant text-xs font-medium">
            <span>Booked but not yet entered</span>
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
          </div>
          <div className="flex flex-col gap-4">
            {recentActivities && recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => {
                let icon = 'check_circle';
                let colorClass = 'text-green-600 bg-green-100 border-green-500';
                
                if (activity.action?.toLowerCase().includes('entry') || activity.action?.toLowerCase().includes('verified')) {
                  icon = 'verified';
                  colorClass = 'text-primary bg-primary-container/20 border-primary';
                } else if (activity.action?.toLowerCase().includes('queue')) {
                  icon = 'hourglass_top';
                  colorClass = 'text-secondary bg-secondary-container/20 border-secondary';
                } else if (activity.action?.toLowerCase().includes('completed') || activity.action?.toLowerCase().includes('darshan')) {
                  icon = 'check_circle';
                  colorClass = 'text-green-600 bg-green-100 border-green-500';
                }

                return (
                  <div key={index} className={`flex items-center gap-4 p-3 hover:bg-surface-container-low rounded-lg transition-colors border-l-4 ${colorClass.split(' ')[2]}`}>
                    <div className={`size-10 rounded-full ${colorClass.split(' ')[1]} flex items-center justify-center shrink-0`}>
                      <span className={`material-symbols-outlined ${colorClass.split(' ')[0]}`}>{icon}</span>
                    </div>
                    <div className="flex flex-col flex-grow">
                      <p className="text-on-surface text-sm font-bold">{activity.name} - {activity.action}</p>
                      <p className="text-on-surface-variant text-xs">{activity.gate} • {new Date(activity.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <span className="material-symbols-outlined text-4xl text-outline mb-2 block">history</span>
                <p className="text-on-surface-variant text-sm font-medium">No Recent Activities</p>
              </div>
            )}
          </div>
        </div>

        {/* Announcements Widget */}
        <div className="glass-card rounded-xl p-6 bg-surface-container">
          <h3 className="text-on-surface text-lg font-bold mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">campaign</span>
            {t('announcements') || 'Announcements'}
          </h3>
          <div className="flex flex-col gap-5">
            {announcements && announcements.length > 0 ? (
              announcements.map((ann, index) => {
                let colorClass = 'bg-primary';
                if (ann.priority === 'high' || ann.priority === 'critical') colorClass = 'bg-error';
                else if (ann.priority === 'medium') colorClass = 'bg-secondary';
                
                return (
                  <div key={index} className="p-4 bg-white rounded-lg border border-outline-variant shadow-sm relative overflow-hidden">
                    <div className={`w-1 h-full absolute left-0 top-0 ${colorClass}`}></div>
                    <p className="text-on-surface text-sm font-bold leading-tight">{ann.title}</p>
                    <p className="text-on-surface-variant text-xs mt-2">{ann.content}</p>
                    <p className={`text-[10px] font-bold uppercase tracking-widest mt-3 ${ann.priority === 'high' || ann.priority === 'critical' ? 'text-error' : 'text-primary'}`}>
                      {ann.priority === 'high' || ann.priority === 'critical' ? 'Priority: High' : `Posted ${new Date(ann.createdAt).toLocaleDateString()}`}
                    </p>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <span className="material-symbols-outlined text-4xl text-outline mb-2 block">notifications_off</span>
                <p className="text-on-surface-variant text-sm font-medium">No Announcements Available</p>
              </div>
            )}
            
            <button 
              onClick={() => setIsAddNoticeModalOpen(true)}
              className="w-full py-3 bg-white border border-dashed border-primary/40 rounded-lg text-primary text-sm font-bold hover:bg-primary-container/10 transition-colors"
            >
              + Add New Notice
            </button>
          </div>
        </div>
      </div>

      {/* Add New Notice Modal */}
      {isAddNoticeModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border border-outline-variant animate-in fade-in zoom-in-95 duration-200 text-on-surface">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">add_alert</span>
                Add New Notice
              </h3>
              <button 
                onClick={() => setIsAddNoticeModalOpen(false)}
                className="text-on-surface-variant hover:bg-surface-container rounded-full p-1 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-2">Title</label>
                <input 
                  type="text" 
                  required
                  value={newNoticeTitle}
                  onChange={(e) => setNewNoticeTitle(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2.5 outline-none focus:border-primary transition-all text-sm font-semibold"
                  placeholder="Enter notice title"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface-variant mb-2">Description</label>
                <textarea 
                  required
                  rows="3"
                  value={newNoticeDesc}
                  onChange={(e) => setNewNoticeDesc(e.target.value)}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2.5 outline-none focus:border-primary transition-all text-sm font-semibold resize-none"
                  placeholder="Enter notice details"
                ></textarea>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-2">Priority</label>
                  <select 
                    value={newNoticePriority}
                    onChange={(e) => setNewNoticePriority(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2.5 outline-none focus:border-primary transition-all text-sm font-semibold"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-on-surface-variant mb-2">Category</label>
                  <select 
                    value={newNoticeCategory}
                    onChange={(e) => setNewNoticeCategory(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2.5 outline-none focus:border-primary transition-all text-sm font-semibold"
                  >
                    <option value="general">General</option>
                    <option value="darshan">Darshan</option>
                    <option value="vip">VIP</option>
                    <option value="emergency">Emergency</option>
                    <option value="facility">Facility</option>
                  </select>
                </div>
              </div>
              
              <div className="pt-4 flex gap-3 justify-end">
                <button 
                  type="button"
                  onClick={() => setIsAddNoticeModalOpen(false)}
                  className="px-4 py-2 border border-outline-variant rounded-lg hover:bg-surface-container-low text-xs font-bold text-on-surface-variant transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmittingNotice}
                  className="px-5 py-2 bg-primary text-white rounded-lg hover:brightness-110 text-xs font-bold transition-all shadow-md disabled:opacity-50"
                >
                  {isSubmittingNotice ? 'Saving...' : 'Add Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
