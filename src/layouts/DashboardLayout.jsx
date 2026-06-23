import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useUser } from '../context/UserContext';

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, currentLanguage, setLanguage } = useLanguage();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const { user, userRole, logoutUser } = useUser();
  const userName = user?.fullName || '';

  const isAdminView = location.pathname.startsWith('/dashboard/admin') || 
                      location.pathname.startsWith('/dashboard/capacity') || 
                      location.pathname.startsWith('/dashboard/vip') || 
                      location.pathname.startsWith('/dashboard/committee') || 
                      location.pathname.startsWith('/dashboard/analytics') || 
                      location.pathname.startsWith('/dashboard/scanner') || 
                      location.pathname.startsWith('/dashboard/parking') ||
                      (location.pathname === '/dashboard/announcements' && userRole === 'admin');

  const handleLogout = () => {
    if (window.confirm(t('confirmLogout'))) {
      logoutUser();
      navigate('/login');
    }
  };

  const getLinkClasses = (path) => {
    const isActive = location.pathname === path || (path !== '/dashboard' && path !== '/dashboard/admin' && location.pathname.startsWith(path));
    return `flex items-center gap-3 px-4 py-3 rounded-lg font-bold font-label-md text-label-md transition-all ${
      isActive
        ? 'bg-secondary-container text-on-secondary-container active:scale-[0.98]'
        : 'text-on-surface-variant hover:bg-surface-container-high'
    }`;
  };


  return (
    <div className="font-body text-on-background bg-background min-h-screen flex flex-col">
      {/* TopNavBar */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 md:px-10 h-16 bg-surface border-b border-outline-variant">
        <div className="flex items-center gap-4">
          <span className="text-xl md:text-2xl font-bold text-primary">
            {isAdminView ? t('welcomeAdmin') : `${t('welcomeUser')}, ${userName || 'User'}`}
          </span>
        </div>
        <div className="flex items-center gap-2 md:gap-6">
          <div className="hidden sm:flex items-center bg-surface-container-low px-4 py-2 rounded-full border border-outline-variant">
            <span className="material-symbols-outlined text-on-surface-variant mr-2 text-xl">search</span>
            <input className="bg-transparent border-none focus:ring-0 text-sm w-32 md:w-48 outline-none" placeholder="Search services..." type="text" />
          </div>
          <div className="flex items-center gap-1 md:gap-2">
            <select 
              value={currentLanguage} 
              onChange={(e) => setLanguage(e.target.value)}
              className="font-label-sm text-label-sm bg-transparent border border-outline-variant rounded-xl px-2 py-1 text-on-surface hover:border-primary focus:outline-none transition-all cursor-pointer mr-1"
              aria-label="Language Selector"
            >
              <option value="en">EN</option>
              <option value="hi">HI</option>
              <option value="mr">MR</option>
            </select>
            <button className="p-2 hover:bg-surface-container-high rounded-full transition-colors relative">
              <span className="material-symbols-outlined text-xl md:text-2xl">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full"></span>
            </button>
            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="p-2 hover:bg-surface-container-high rounded-full transition-colors"
                aria-label="Profile Menu"
              >
                <span className="material-symbols-outlined text-xl md:text-2xl">account_circle</span>
              </button>
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-surface rounded-xl shadow-lg border border-outline-variant py-2 z-50">
                  <Link 
                    to="/dashboard/profile" 
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-on-surface hover:bg-surface-container-high w-full text-left"
                  >
                    <span className="material-symbols-outlined text-sm">person</span>
                    <span>{t('profile')}</span>
                  </Link>
                  <button 
                    onClick={() => {
                      setIsProfileOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-error hover:bg-error/10 w-full text-left font-bold"
                  >
                    <span className="material-symbols-outlined text-sm text-error">logout</span>
                    <span>{t('logout')}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* SideNavBar (Hidden on Mobile) */}
      <aside className="hidden lg:flex flex-col h-full w-64 fixed left-0 top-0 pt-20 px-4 space-y-2 bg-surface-container-low border-r border-outline-variant z-40 overflow-y-auto custom-scrollbar">
        {isAdminView ? (
          <>
            <div className="flex items-center gap-3 px-2 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center text-white">
                <span className="material-symbols-outlined">temple_hindu</span>
              </div>
              <div>
                <p className="font-label-md text-label-md font-bold text-primary">Temple Admin</p>
                <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">Management Console</p>
              </div>
            </div>
            <nav className="space-y-1">
              <Link to="/dashboard/admin" className={getLinkClasses('/dashboard/admin')}>
                <span className="material-symbols-outlined">dashboard</span>
                <span className="text-sm">{t('dashboard')}</span>
              </Link>


              <Link to="/dashboard/scanner" className={getLinkClasses('/dashboard/scanner')}>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>qr_code_scanner</span>
                <span className="text-sm">{t('qrScanner')}</span>
              </Link>
              <Link to="/dashboard/parking" className={getLinkClasses('/dashboard/parking')}>
                <span className="material-symbols-outlined">local_parking</span>
                <span className="text-sm">{t('parkingManagement')}</span>
              </Link>
              <Link to="/dashboard/capacity" className={getLinkClasses('/dashboard/capacity')}>
                <span className="material-symbols-outlined">speed</span>
                <span className="text-sm">{t('capacityManagement')}</span>
              </Link>
              <Link to="/dashboard/vip" className={getLinkClasses('/dashboard/vip')}>
                <span className="material-symbols-outlined font-variation-settings-['FILL'_1]">stars</span>
                <span className="text-sm">{t('vipManagement')}</span>
              </Link>

              <Link to="/dashboard/admin/announcements" className={getLinkClasses('/dashboard/admin/announcements')}>
                <span className="material-symbols-outlined">campaign</span>
                <span className="text-sm">{t('announcements')}</span>
              </Link>

              <Link to="/dashboard/analytics" className={getLinkClasses('/dashboard/analytics')}>
                <span className="material-symbols-outlined">analytics</span>
                <span className="text-sm">{t('reportsAnalytics')}</span>
              </Link>

            </nav>
            <div className="mt-auto pb-6 pt-4 flex flex-col gap-2">
              <button className="w-full bg-primary text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 saffron-glow transition-all hover:bg-opacity-90 shadow-soft">
                <span className="material-symbols-outlined text-[20px]">add</span> {t('newEntry')}
              </button>
              <button 
                onClick={handleLogout}
                className="w-full border border-outline text-on-surface hover:bg-surface-container-high py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
              >
                <span className="material-symbols-outlined text-[20px]">logout</span> {t('logout')}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="px-4 mb-8"></div>
            <nav className="space-y-1">
              <Link to="/dashboard" className={getLinkClasses('/dashboard')}>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
                <span className="text-sm">{t('home')}</span>
              </Link>
              <Link to="/dashboard/book" className={getLinkClasses('/dashboard/book')}>
                <span className="material-symbols-outlined">calendar_add_on</span>
                <span className="text-sm">{t('bookDarshan')}</span>
              </Link>
              <Link to="/dashboard/pass" className={getLinkClasses('/dashboard/pass')}>
                <span className="material-symbols-outlined">qr_code</span>
                <span className="text-sm">{t('myPass')}</span>
              </Link>
              <Link to="/dashboard/user-queue" className={getLinkClasses('/dashboard/user-queue')}>
                <span className="material-symbols-outlined">speed</span>
                <span className="text-sm">{t('queueStatus')}</span>
              </Link>
              <Link to="/dashboard/announcements" className={getLinkClasses('/dashboard/announcements')}>
                <span className="material-symbols-outlined">notifications</span>
                <span className="text-sm">{t('announcements')}</span>
              </Link>
              <Link to="/dashboard/profile" className={getLinkClasses('/dashboard/profile')}>
                <span className="material-symbols-outlined">account_circle</span>
                <span className="text-sm">{t('profile')}</span>
              </Link>
            </nav>
          </>
        )}
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64 flex flex-col pt-16">
        <Outlet />
        
        {/* Footer */}
        <footer className="w-full mt-auto py-10 px-4 md:px-10 bg-surface-container-highest border-t border-outline-variant">
          <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
            <div className="flex flex-col gap-2">
              <h2 className="text-2xl font-extrabold text-primary">Temple&nbsp; &nbsp; Portal</h2>
              <p className="text-sm text-on-surface-variant">© 2024 Mo&nbsp; &nbsp; &nbsp; &nbsp; &nbsp;dern Temple Trust. All Rights Reserved.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-4 md:gap-8">
              <a className="text-on-surface-variant hover:underline decoration-primary transition-opacity text-sm font-medium" href="#">Contact Us</a>
              <a className="text-on-surface-variant hover:underline decoration-primary transition-opacity text-sm font-medium" href="#">Privacy Policy</a>
              <a className="text-on-surface-variant hover:underline decoration-primary transition-opacity text-sm font-medium" href="#">Terms of Service</a>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => setLanguage('en')} 
                className={`${currentLanguage === 'en' ? 'text-primary font-bold' : 'text-on-surface-variant'} text-sm hover:underline`}
              >
                English
              </button>
              <button 
                onClick={() => setLanguage('hi')} 
                className={`${currentLanguage === 'hi' ? 'text-primary font-bold' : 'text-on-surface-variant'} text-sm hover:underline`}
              >
                Hindi
              </button>
              <button 
                onClick={() => setLanguage('mr')} 
                className={`${currentLanguage === 'mr' ? 'text-primary font-bold' : 'text-on-surface-variant'} text-sm hover:underline`}
              >
                Marathi
              </button>
            </div>
          </div>
        </footer>
      </div>

      {/* Bottom Navigation (Mobile Only for Admin) */}
      {isAdminView ? (
        <nav className="md:hidden fixed bottom-0 left-0 w-full bg-surface border-t border-outline-variant flex justify-around items-center h-16 z-50">
          <Link to="/dashboard/admin" className="flex flex-col items-center text-on-surface-variant hover:text-primary">
            <span className="material-symbols-outlined">dashboard</span>
            <span className="text-[10px] font-bold uppercase">Home</span>
          </Link>
          <Link to="/dashboard/analytics" className="flex flex-col items-center text-on-surface-variant hover:text-primary">
            <span className="material-symbols-outlined">analytics</span>
            <span className="text-[10px] font-bold uppercase">Reports</span>
          </Link>

        </nav>
      ) : (
        <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 py-3 pb-safe bg-surface shadow-[0_-4px_20px_rgba(152,67,0,0.12)] rounded-t-xl transition-all duration-150">
          <Link to="/dashboard" className={`flex flex-col items-center justify-center active:scale-95 ${location.pathname === '/dashboard' ? 'bg-primary-container text-on-primary-container rounded-full px-4 py-1' : 'text-on-surface-variant'}`}>
            <span className="material-symbols-outlined">home</span>
            <span className="font-label-sm text-[10px]">{t('home')}</span>
          </Link>
          <Link to="/dashboard/user-queue" className={`flex flex-col items-center justify-center active:scale-95 ${location.pathname.startsWith('/dashboard/user-queue') ? 'bg-primary-container text-on-primary-container rounded-full px-4 py-1' : 'text-on-surface-variant'}`}>
            <span className="material-symbols-outlined">hourglass_top</span>
            <span className="font-label-sm text-[10px]">{t('queueStatus')}</span>
          </Link>
          <Link to="/dashboard/pass" className={`flex flex-col items-center justify-center active:scale-95 ${location.pathname.startsWith('/dashboard/pass') ? 'bg-primary-container text-on-primary-container rounded-full px-4 py-1' : 'text-on-surface-variant'}`}>
            <span className="material-symbols-outlined">confirmation_number</span>
            <span className="font-label-sm text-[10px]">{t('myPass')}</span>
          </Link>
          <button onClick={handleLogout} className="flex flex-col items-center justify-center text-on-surface-variant active:scale-95 cursor-pointer">
            <span className="material-symbols-outlined">logout</span>
            <span className="font-label-sm text-[10px]">{t('logout')}</span>
          </button>
        </nav>
      )}
    </div>
  );
}
