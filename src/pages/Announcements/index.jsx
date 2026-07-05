import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useUser } from '../../context/UserContext';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export default function Announcements() {
  const {
    t
  } = useLanguage();
  const {
    user,
    userRole
  } = useUser();
  const [announcements, setAnnouncements] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create'); // 'create' or 'edit'
  const [editingId, setEditingId] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  // Helper to load/save mock local storage data
  const getInitialAnnouncements = () => {
    const defaultAnnouncements = [{
      id: '1',
      title: 'Maha Shivratri Special Timings',
      content: 'Temple will remain open throughout the night for special prayers and Abhishekam ceremonies.',
      published: true,
      created_at: new Date('2026-03-08').toISOString()
    }, {
      id: '2',
      title: 'Live Stream for Morning Aarti',
      content: 'Experience the divine energy from home. Live streaming starts daily at 5:30 AM on our portal.',
      published: true,
      created_at: new Date('2026-03-05').toISOString()
    }, {
      id: '3',
      title: 'Annadanam Donation Portal',
      content: 'We have launched a simplified portal for sponsoring meals for devotees. Contribute now.',
      published: true,
      created_at: new Date('2026-03-01').toISOString()
    }];
    const stored = localStorage.getItem('announcements');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return defaultAnnouncements;
      }
    }
    localStorage.setItem('announcements', JSON.stringify(defaultAnnouncements));
    return defaultAnnouncements;
  };

  // Fetch announcements from new Express API
  const fetchAnnouncements = async () => {
    try {
      const response = await fetch(`${API_URL}/announcements`);
      if (response.ok) {
        const data = await response.json();
        setAnnouncements(data);
        localStorage.setItem('announcements', JSON.stringify(data));
      } else {
        throw new Error('Failed to fetch announcements');
      }
    } catch (error) {
      console.warn('API fetch failed, falling back to localStorage:', error.message);
      const localData = getInitialAnnouncements();
      setAnnouncements(localData);
    }
  };
  useEffect(() => {
    fetchAnnouncements();
  }, []);
  const handleCreate = async () => {
    if (!newTitle) return;
    const newAnn = {
      title: newTitle,
      content: newContent,
      isActive: true,
      author: userRole || 'admin'
    };
    try {
      const response = await fetch(`${API_URL}/announcements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newAnn)
      });
      if (response.ok) {
        const data = await response.json();
        setAnnouncements([data, ...announcements]);
      } else {
        throw new Error('Create failed');
      }
    } catch (error) {
      console.warn('API insert failed, falling back to localStorage:', error.message);
      const localData = getInitialAnnouncements();
      const localNewAnn = {
        _id: crypto.randomUUID(),
        title: newTitle,
        content: newContent,
        isActive: true,
        createdAt: new Date().toISOString()
      };
      const updated = [localNewAnn, ...localData];
      localStorage.setItem('announcements', JSON.stringify(updated));
      setAnnouncements(updated);
    }
    setShowModal(false);
    setNewTitle('');
    setNewContent('');
  };
  const handleEdit = async () => {
    if (!newTitle || !editingId) return;
    try {
      const response = await fetch(`${API_URL}/announcements/${editingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: newTitle,
          content: newContent
        })
      });
      if (response.ok) {
        const data = await response.json();
        setAnnouncements(announcements.map(ann => (ann._id || ann.id) === editingId ? data : ann));
      } else {
        throw new Error('Edit failed');
      }
    } catch (error) {
      console.warn('API update failed, falling back to localStorage:', error.message);
      const localData = getInitialAnnouncements();
      const updated = localData.map(ann => (ann._id || ann.id) === editingId ? {
        ...ann,
        title: newTitle,
        content: newContent
      } : ann);
      localStorage.setItem('announcements', JSON.stringify(updated));
      setAnnouncements(updated);
    }
    setShowModal(false);
    setNewTitle('');
    setNewContent('');
    setEditingId(null);
  };
  const handleDelete = async id => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    try {
      const response = await fetch(`${API_URL}/announcements/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Delete failed');
      setAnnouncements(announcements.filter(ann => (ann._id || ann.id) !== id));
    } catch (error) {
      console.warn('API delete failed, falling back to localStorage:', error.message);
      const localData = getInitialAnnouncements();
      const updated = localData.filter(ann => (ann._id || ann.id) !== id);
      localStorage.setItem('announcements', JSON.stringify(updated));
      setAnnouncements(updated);
    }
  };
  const handleTogglePublish = async ann => {
    const isPublished = ann.isActive !== undefined ? ann.isActive : ann.published;
    const nextPublishedState = !isPublished;
    const annId = ann._id || ann.id;
    try {
      const response = await fetch(`${API_URL}/announcements/${annId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isActive: nextPublishedState
        })
      });
      if (response.ok) {
        const data = await response.json();
        setAnnouncements(announcements.map(item => (item._id || item.id) === annId ? data : item));
      } else {
        throw new Error('Toggle publish failed');
      }
    } catch (error) {
      console.warn('API toggle publish failed, falling back to localStorage:', error.message);
      const localData = getInitialAnnouncements();
      const updated = localData.map(item => (item._id || item.id) === annId ? {
        ...item,
        isActive: nextPublishedState,
        published: nextPublishedState
      } : item);
      localStorage.setItem('announcements', JSON.stringify(updated));
      setAnnouncements(updated);
    }
  };

  // Filter based on roles
  const displayedAnnouncements = userRole === 'admin' ? announcements : announcements.filter(ann => {
    const isPublished = ann.isActive !== undefined ? ann.isActive : ann.published;
    return isPublished === true || isPublished === undefined;
  });
  return <main className="pt-8 pb-12 px-4 md:px-10 max-w-7xl mx-auto w-full">
      {/* Header Section */}
      <div className="mb-10">
        <h1 className="text-3xl md:text-5xl font-bold text-on-surface">{t('announcementsTitle')}</h1>
        <p className="text-on-surface-variant mt-2 max-w-2xl text-base">{t("stayInformedAboutTempleNotices")}</p>
      </div>

      {/* Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Content: 8 Columns */}
        <div className="lg:col-span-8 space-y-10">
          
          {/* Admin Create Button */}
          {userRole === 'admin' && <button className="mb-4 px-4 py-2.5 bg-primary text-on-primary rounded-xl hover:brightness-110 transition-all font-bold flex items-center gap-2 shadow-md active:scale-95 cursor-pointer" onClick={() => {
          setModalType('create');
          setEditingId(null);
          setNewTitle('');
          setNewContent('');
          setShowModal(true);
        }}>
              <span className="material-symbols-outlined text-sm">add</span>
              {t('createAnnouncement') || 'Create Announcement'}
            </button>}


          {/* Search & Filters */}
          <div className="flex flex-col md:flex-row gap-4 items-center overflow-x-auto pb-2 scrollbar-hide">
            <div className="flex gap-2 flex-wrap">
              <button className="px-4 py-2 rounded-full bg-primary text-on-primary font-medium text-sm shadow-sm hover:brightness-110 transition-all">{t('viewAllNotices')}</button>
              <button className="px-4 py-2 rounded-full bg-surface-container text-on-surface-variant font-medium text-sm border border-outline-variant/30 hover:bg-surface-variant transition-all">{t("generalNotice")}</button>
              <button className="px-4 py-2 rounded-full bg-surface-container text-on-surface-variant font-medium text-sm border border-outline-variant/30 hover:bg-surface-variant transition-all">{t("festivalUpdate")}</button>
              <button className="px-4 py-2 rounded-full bg-surface-container text-on-surface-variant font-medium text-sm border border-outline-variant/30 hover:bg-surface-variant transition-all">{t("darshanUpdate")}</button>
              <button className="px-4 py-2 rounded-full bg-surface-container text-on-surface-variant font-medium text-sm border border-outline-variant/30 hover:bg-surface-variant transition-all">{t("queueAlert")}</button>
            </div>
          </div>

          {/* Featured Announcement */}
          <section className="relative overflow-hidden rounded-[24px] shadow-lg group">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10"></div>
            <div className="h-[400px] w-full bg-cover bg-center" style={{
            backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCtoIkp_BE5TonuFZSs7TPovUm6LifRyQ7FLNu1NNh13TFpCPYpmzlg8qpbVTLntHzUXJzJ77FByPaCFjnFstYpWYvzZHobuH_8yRL7xOejdA1JylS-WJ7gHnRwJ9f5W_oAIkL1DvcwiLPehBUIrG8ZvwoVf4Bjtp2nYiIEXazk0FLOFpz3H5sQC-R1Tlij_Bh8wD7bLS6eTN3-pAbu-3yc3fHYhr_le9Z4u_wiw7byDvgLDnhXb4ezvqWVbRaHwtHh-FyRqepoaZ4')"
          }}></div>
            <div className="absolute bottom-0 left-0 p-8 z-20 w-full">
              <div className="flex items-center gap-3 mb-3">
                <span className="px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container font-semibold text-xs tracking-wide uppercase">{t("festivalUpdate")}</span>
                <span className="text-white/90 text-sm flex items-center gap-1">
                  <span className="material-symbols-outlined text-[18px]">calendar_today</span>{t("march82024")}</span>
              </div>
              <h2 className="text-white text-3xl md:text-4xl font-bold mb-4">{t("mahaShivratri2024Celebration")}</h2>
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <p className="text-white/80 max-w-2xl flex-1 text-base md:text-lg">{t("joinUsForTheMostAuspiciousNigh")}</p>
                <button className="bg-primary text-on-primary px-8 py-3 rounded-xl font-bold hover:shadow-xl transition-all active:scale-95 shrink-0 w-fit">{t('readDetails')}</button>
              </div>
            </div>
          </section>

          {/* Latest Announcements Grid */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-on-surface">{t('latestAnnouncements')}</h3>
              <a className="text-primary font-semibold text-sm hover:underline" href="#">{t('viewAll')}</a>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {displayedAnnouncements.map(ann => <div key={ann._id || ann.id} className="bg-white rounded-xl p-6 shadow-[0_4px_20px_0_rgba(152,67,0,0.06)] border border-outline-variant/20 hover:-translate-y-1 transition-transform duration-300 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex flex-col gap-1.5">
                        <span className="px-3 py-1 rounded-full bg-surface-container-high text-primary font-semibold text-xs w-fit">{ann.title}</span>
                        {userRole === 'admin' && <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded w-fit ${(ann.isActive !== undefined ? ann.isActive : ann.published) ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {(ann.isActive !== undefined ? ann.isActive : ann.published) ? 'Published' : 'Draft/Unpublished'}
                          </span>}
                      </div>
                      <span className="text-on-surface-variant text-[12px]">{new Date(ann.createdAt || ann.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-on-surface-variant text-sm mb-4 line-clamp-2">{ann.content}</p>
                  </div>
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-outline-variant/10">
                    <button className="text-primary font-bold text-sm flex items-center gap-1 group">
                      {t('details')} <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </button>
                    {userRole === 'admin' && <div className="flex gap-2">
                        <button onClick={() => handleTogglePublish(ann)} title={(ann.isActive !== undefined ? ann.isActive : ann.published) ? "Unpublish" : "Publish"} className={`p-1.5 rounded-lg border transition-colors ${(ann.isActive !== undefined ? ann.isActive : ann.published) ? 'border-yellow-200 text-yellow-700 hover:bg-yellow-50' : 'border-green-200 text-green-700 hover:bg-green-50'}`}>
                          <span className="material-symbols-outlined text-sm">{(ann.isActive !== undefined ? ann.isActive : ann.published) ? 'unpublished' : 'publish'}</span>
                        </button>
                        <button onClick={() => {
                    setEditingId(ann._id || ann.id);
                    setNewTitle(ann.title);
                    setNewContent(ann.content);
                    setModalType('edit');
                    setShowModal(true);
                  }} title={t("edit1")} className="p-1.5 rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container-low transition-colors">
                          <span className="material-symbols-outlined text-sm">edit</span>
                        </button>
                        <button onClick={() => handleDelete(ann._id || ann.id)} title={t("delete1")} className="p-1.5 rounded-lg border border-error/20 text-error hover:bg-error/5 transition-colors">
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>}
                  </div>
                </div>)}
            </div>
          </section>

          {/* Festival Updates Section */}
          <section className="bg-surface-container rounded-2xl p-8 border border-outline-variant/30">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="relative w-40 h-40 flex-shrink-0">
                <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
                <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin duration-[10s]"></div>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="font-bold text-4xl text-primary">45</span>
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{t("daysLeft")}</span>
                </div>
              </div>
              <div className="flex-grow text-center md:text-left">
                <h3 className="text-2xl font-semibold text-on-surface mb-2">{t("ramNavamiPreparation")}</h3>
                <p className="text-on-surface-variant mb-6">{t("preparationsAreUnderwayForTheG")}</p>
                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                  <button className="bg-secondary text-on-secondary px-6 py-2.5 rounded-lg font-bold text-sm active:scale-95 transition-all shadow-md">{t("viewDetails")}</button>
                  <button className="border border-secondary text-secondary px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-secondary/5 transition-all">{t("volunteerRegistration")}</button>
                </div>
              </div>
            </div>
          </section>

        </div>

        {/* Right Sidebar: 4 Columns */}
        <aside className="lg:col-span-4 space-y-6">
          
          {/* Important Notices Sidebar */}
          <div className="bg-white rounded-xl shadow-[0_4px_20px_0_rgba(152,67,0,0.06)] border border-outline-variant/20 overflow-hidden">
            <div className="bg-surface-container-high px-6 py-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary" style={{
              fontVariationSettings: "'FILL' 1"
            }}>priority_high</span>
              <h3 className="font-bold text-on-surface">{t("importantNotices")}</h3>
            </div>
            <div className="divide-y divide-outline-variant/20">
              
              {/* High Priority */}
              <div className="p-6 bg-error/5 group cursor-pointer hover:bg-error/10 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded bg-error text-white text-[10px] font-extrabold uppercase tracking-tight">{t("highPriority")}</span>
                </div>
                <p className="text-on-surface font-semibold text-sm leading-snug">{t("templeClosedFor2HoursOnFeb25So")}</p>
                <div className="flex items-center gap-2 mt-2 text-on-surface-variant text-[11px]">
                  <span className="material-symbols-outlined text-[14px]">schedule</span>{t("130Pm330Pm")}</div>
              </div>
              
              {/* Medium Priority */}
              <div className="p-6 group cursor-pointer hover:bg-surface-container/50 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 rounded bg-secondary-container text-on-secondary-container text-[10px] font-extrabold uppercase tracking-tight">{t("mediumPriority")}</span>
                </div>
                <p className="text-on-surface font-semibold text-sm leading-snug">{t("vipVisitScheduledForFeb22")}</p>
                <p className="text-on-surface-variant text-[11px] mt-2">{t("expectMinorDelaysInGeneralDars")}</p>
              </div>

            </div>
          </div>

          {/* Quick Info Card */}
          <div className="bg-primary text-on-primary rounded-xl p-6 shadow-lg relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <span className="material-symbols-outlined text-[120px]">temple_hindu</span>
            </div>
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined">info</span>{t("quickInformation")}</h3>
            <div className="space-y-4 relative z-10">
              <div className="flex items-center gap-4 border-b border-on-primary/20 pb-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <span className="material-symbols-outlined">schedule</span>
                </div>
                <div>
                  <p className="text-white/70 text-xs font-medium uppercase tracking-wider">{t("templeHours")}</p>
                  <p className="font-bold">{t("400Am1000Pm")}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-2 bg-white/20 rounded-lg">
                  <span className="material-symbols-outlined">call</span>
                </div>
                <div>
                  <p className="text-white/70 text-xs font-medium uppercase tracking-wider">{t("helplineNumber")}</p>
                  <p className="font-bold">1800-123-4567</p>
                </div>
              </div>
            </div>
          </div>

          {/* Social & Feedback */}
          <div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/30 text-center">
            <p className="text-on-surface-variant text-sm mb-4">{t("wantToReceiveUpdatesOnYourPhon")}</p>
            <button className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-white py-3 rounded-lg font-bold text-sm shadow-md active:scale-95 transition-all hover:bg-opacity-90">
              <span className="material-symbols-outlined text-[20px]">chat</span>{t("joinWhatsappChannel")}</button>
            <div className="mt-6 flex justify-center gap-4">
              <a className="p-2 bg-white rounded-full text-primary hover:scale-110 transition-transform shadow-sm" href="#"><span className="material-symbols-outlined">share</span></a>
              <a className="p-2 bg-white rounded-full text-primary hover:scale-110 transition-transform shadow-sm" href="#"><span className="material-symbols-outlined">mail</span></a>
            </div>
          </div>

        </aside>
      </div>

      {/* Create / Edit Modal */}
      {showModal && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 backdrop-blur-sm" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 100
    }}>
          <div className="bg-white p-6 rounded-xl shadow-2xl border border-outline-variant/30 text-on-surface relative flex flex-col gap-4" style={{
        width: '90%',
        maxWidth: '450px',
        minWidth: '320px',
        backgroundColor: 'white',
        borderRadius: '1rem'
      }}>
            <h2 className="text-xl font-bold">
              {modalType === 'create' ? t('createAnnouncement') || 'Create Announcement' : 'Edit Announcement'}
            </h2>
            <div className="flex flex-col gap-4 w-full">
              <div className="w-full">
                <label className="block text-xs font-bold text-on-surface-variant mb-2">{t("title")}</label>
                <input className="w-full p-3 bg-surface-container-low border border-outline-variant/50 rounded-lg outline-none focus:border-primary transition-all text-sm font-semibold box-border" style={{
              width: '100%'
            }} placeholder={t("enterAnnouncementTitle")} value={newTitle} onChange={e => setNewTitle(e.target.value)} />
              </div>
              <div className="w-full">
                <label className="block text-xs font-bold text-on-surface-variant mb-2">{t("content")}</label>
                <textarea className="w-full p-3 bg-surface-container-low border border-outline-variant/50 rounded-lg outline-none focus:border-primary transition-all text-sm font-semibold h-32 resize-none box-border" style={{
              width: '100%'
            }} placeholder={t("enterAnnouncementContent")} value={newContent} onChange={e => setNewContent(e.target.value)} />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-2 pt-4 border-t border-outline-variant/10 w-full">
              <button className="px-4 py-2 border border-outline-variant rounded-lg hover:bg-surface-container-low text-xs font-bold text-on-surface-variant transition-colors cursor-pointer" onClick={() => setShowModal(false)}>
                {t('cancel') || 'Cancel'}
              </button>
              <button className="px-5 py-2 bg-primary text-white rounded-lg hover:brightness-110 text-xs font-bold transition-all shadow-md cursor-pointer" onClick={modalType === 'create' ? handleCreate : handleEdit}>
                {t('submit') || 'Submit'}
              </button>
            </div>
          </div>
        </div>}
    </main>;
}