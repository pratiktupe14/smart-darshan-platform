import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { supabase } from '../../lib/supabase';


export default function Profile() {
  const navigate = useNavigate();
  const { t, currentLanguage, setLanguage } = useLanguage();

  const handleLogout = async () => {
    if (window.confirm(t('confirmLogout'))) {
      await supabase.auth.signOut();
      localStorage.clear();
      sessionStorage.clear();
      navigate('/login');
    }
  };

  return (
    <main className="pt-8 pb-12 px-4 md:px-10 max-w-[1280px] mx-auto w-full">
      {/* Hero Section */}
      <div className="mb-12">
        <h1 className="text-3xl md:text-5xl font-bold text-primary mb-2">My Profile</h1>
        <p className="text-base text-on-surface-variant">Manage your account, bookings, and preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Profile & Stats */}
        <div className="lg:col-span-4 space-y-8">
          {/* Profile Overview Card */}
          <section className="bg-white rounded-xl p-8 shadow-[0_4px_20px_rgba(152,67,0,0.08)] border border-[rgba(86,67,57,0.05)]">
            <div className="flex flex-col items-center text-center">
              <div className="relative group mb-6">
                <img 
                  className="w-32 h-32 rounded-full border-4 border-primary-fixed shadow-md object-cover" 
                  alt="Profile" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCQ8B_WS1S_AMXodk0VLAB4geE2PZA-lEYEUVBWpW-AW4i04SQPFkeXEYLdJ-1e7_kfdw8GELH-5Q7JDI_yf2qa85jKC-J-RJQZMVjLNupT8SNQu_T4QwSO3AdMqcnd44bQo636Z4mKTxVdm0YzCkv1AdR9Nvnvx5kn2dD5ibBRBqZRKz_p3cMZJdTr_bCNe1_ue5lghQRhBY38E_friMSu-sd3YuQ1XClNWf2CqNTqjvRW3zf_YLZ6AJb0rF3UawOEOL7MXkT4Ci4"
                />
                <button className="absolute bottom-1 right-1 bg-primary text-white p-2 rounded-full shadow-lg hover:bg-primary-container transition-colors">
                  <span className="material-symbols-outlined text-sm">edit</span>
                </button>
              </div>
              <h2 className="text-xl font-semibold mb-1">Pratik Tupe</h2>
              <span className="bg-secondary-fixed px-3 py-1 rounded-full text-xs font-medium text-on-secondary-fixed mb-4">#SD-88291</span>
              <p className="text-xs text-on-surface-variant mb-6">Member since Oct 2023</p>
              
              <div className="flex flex-col w-full gap-3">
                <button className="w-full py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-container transition-colors shadow-sm active:scale-95">
                  Edit Profile
                </button>
                <button className="w-full py-3 border-2 border-primary text-primary rounded-xl font-semibold hover:bg-surface-container transition-colors active:scale-95">
                  Change Photo
                </button>
              </div>
            </div>
          </section>

          {/* Stats Grid */}
          <section className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-[0_4px_12px_rgba(152,67,0,0.05)] border border-[rgba(86,67,57,0.05)] flex flex-col items-center">
              <span className="text-primary font-bold text-2xl">12</span>
              <span className="text-xs font-medium text-on-surface-variant">Total Bookings</span>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-[0_4px_12px_rgba(152,67,0,0.05)] border border-[rgba(86,67,57,0.05)] flex flex-col items-center">
              <span className="text-tertiary font-bold text-2xl">10</span>
              <span className="text-xs font-medium text-on-surface-variant">Completed</span>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-[0_4px_12px_rgba(152,67,0,0.05)] border border-[rgba(86,67,57,0.05)] flex flex-col items-center">
              <span className="text-secondary font-bold text-2xl">1</span>
              <span className="text-xs font-medium text-on-surface-variant">Upcoming</span>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-[0_4px_12px_rgba(152,67,0,0.05)] border border-[rgba(86,67,57,0.05)] flex flex-col items-center">
              <span className="text-error font-bold text-2xl">1</span>
              <span className="text-xs font-medium text-on-surface-variant">Cancelled</span>
            </div>
          </section>

          {/* Support Section */}
          <section className="bg-white rounded-xl p-6 shadow-[0_4px_20px_rgba(152,67,0,0.05)] border border-[rgba(86,67,57,0.05)]">
            <h3 className="text-sm font-semibold mb-4 text-primary">Support & Resources</h3>
            <div className="space-y-4">
              <a className="flex items-center gap-3 text-on-surface-variant hover:text-primary transition-colors group" href="#">
                <span className="material-symbols-outlined text-xl">help_center</span>
                <span className="text-sm font-medium">Help Center</span>
                <span className="material-symbols-outlined ml-auto text-sm opacity-0 group-hover:opacity-100">chevron_right</span>
              </a>
              <a className="flex items-center gap-3 text-on-surface-variant hover:text-primary transition-colors group" href="#">
                <span className="material-symbols-outlined text-xl">contact_support</span>
                <span className="text-sm font-medium">Contact Support</span>
                <span className="material-symbols-outlined ml-auto text-sm opacity-0 group-hover:opacity-100">chevron_right</span>
              </a>
              <a className="flex items-center gap-3 text-on-surface-variant hover:text-primary transition-colors group" href="#">
                <span className="material-symbols-outlined text-xl">quiz</span>
                <span className="text-sm font-medium">Frequently Asked Questions</span>
                <span className="material-symbols-outlined ml-auto text-sm opacity-0 group-hover:opacity-100">chevron_right</span>
              </a>
            </div>
          </section>

          <button 
            onClick={handleLogout}
            className="w-full py-4 bg-error-container text-on-error-container rounded-xl font-semibold hover:bg-error hover:text-white transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined">logout</span>
            {t('logout')}
          </button>
        </div>

        {/* Right Column: Personal Info & History */}
        <div className="lg:col-span-8 space-y-8">
          {/* Personal Info Grid */}
          <section className="bg-white rounded-xl p-8 shadow-[0_4px_20px_rgba(152,67,0,0.08)] border border-[rgba(86,67,57,0.05)]">
            <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">person_outline</span>
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-on-surface-variant">Full Name</label>
                <div className="px-4 py-3 bg-surface-container-low rounded-lg border border-outline-variant text-on-surface">Pratik Tupe</div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-on-surface-variant">Mobile Number</label>
                <div className="px-4 py-3 bg-surface-container-low rounded-lg border border-outline-variant text-on-surface">+91 98765 43210</div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-on-surface-variant">Current City</label>
                <div className="px-4 py-3 bg-surface-container-low rounded-lg border border-outline-variant text-on-surface">Pune, Maharashtra</div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-on-surface-variant">Communication Language</label>
                <div className="px-4 py-3 bg-surface-container-low rounded-lg border border-outline-variant text-on-surface">English</div>
              </div>
            </div>
          </section>

          {/* Booking History */}
          <section className="bg-white rounded-xl p-8 shadow-[0_4px_20px_rgba(152,67,0,0.08)] border border-[rgba(86,67,57,0.05)]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">history</span>
                Recent Booking Tokens
              </h3>
              <button className="text-primary font-semibold text-sm hover:underline">View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant">
                    <th className="py-4 text-sm font-semibold text-on-surface-variant">Token ID</th>
                    <th className="py-4 text-sm font-semibold text-on-surface-variant">Date</th>
                    <th className="py-4 text-sm font-semibold text-on-surface-variant">Status</th>
                    <th className="py-4 text-sm font-semibold text-on-surface-variant text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-outline-variant/30 hover:bg-surface-container-lowest transition-colors">
                    <td className="py-5 font-semibold">#A080</td>
                    <td className="py-5 text-sm text-on-surface-variant">Nov 15, 2023</td>
                    <td className="py-5">
                      <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-xs font-semibold">Upcoming</span>
                    </td>
                    <td className="py-5 text-right">
                      <button className="text-primary hover:bg-primary/10 px-4 py-2 rounded-lg transition-colors font-semibold text-sm">View Pass</button>
                    </td>
                  </tr>
                  <tr className="border-b border-outline-variant/30 hover:bg-surface-container-lowest transition-colors">
                    <td className="py-5 font-semibold">#B882</td>
                    <td className="py-5 text-sm text-on-surface-variant">Oct 28, 2023</td>
                    <td className="py-5">
                      <span className="bg-tertiary-fixed text-on-tertiary-fixed px-3 py-1 rounded-full text-xs font-semibold">Completed</span>
                    </td>
                    <td className="py-5 text-right">
                      <button className="text-on-surface-variant hover:bg-surface-container-high px-4 py-2 rounded-lg transition-colors font-semibold text-sm">View Pass</button>
                    </td>
                  </tr>
                  <tr className="border-b border-outline-variant/30 hover:bg-surface-container-lowest transition-colors">
                    <td className="py-5 font-semibold">#C991</td>
                    <td className="py-5 text-sm text-on-surface-variant">Oct 12, 2023</td>
                    <td className="py-5">
                      <span className="bg-tertiary-fixed text-on-tertiary-fixed px-3 py-1 rounded-full text-xs font-semibold">Completed</span>
                    </td>
                    <td className="py-5 text-right">
                      <button className="text-on-surface-variant hover:bg-surface-container-high px-4 py-2 rounded-lg transition-colors font-semibold text-sm">View Pass</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Preferences */}
          <section className="bg-white rounded-xl p-8 shadow-[0_4px_20px_rgba(152,67,0,0.08)] border border-[rgba(86,67,57,0.05)]">
            <h3 className="text-xl font-semibold mb-8 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">settings_suggest</span>
              Notification Preferences
            </h3>
            
            <div className="space-y-6">
              <div className="flex items-center justify-between group hover:bg-primary/5 p-2 rounded-lg transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                    <span className="material-symbols-outlined">chat</span>
                  </div>
                  <div>
                    <p className="font-semibold text-on-surface">WhatsApp Updates</p>
                    <p className="text-xs text-on-surface-variant">Receive tokens and schedules on WhatsApp</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input defaultChecked className="sr-only peer" type="checkbox" />
                  <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <div className="flex items-center justify-between group hover:bg-primary/5 p-2 rounded-lg transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <span className="material-symbols-outlined">sms</span>
                  </div>
                  <div>
                    <p className="font-semibold text-on-surface">SMS Alerts</p>
                    <p className="text-xs text-on-surface-variant">Critical booking changes and reminders</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input defaultChecked className="sr-only peer" type="checkbox" />
                  <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <div className="flex items-center justify-between group hover:bg-primary/5 p-2 rounded-lg transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined">notifications_active</span>
                  </div>
                  <div>
                    <p className="font-semibold text-on-surface">Push Notifications</p>
                    <p className="text-xs text-on-surface-variant">App alerts for queue status and seva timings</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input className="sr-only peer" type="checkbox" />
                  <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>

            <div className="mt-10 pt-10 border-t border-outline-variant">
              <label className="text-sm font-semibold text-on-surface-variant block mb-3">Preferred App Language</label>
              <div className="relative max-w-xs">
                <select 
                  value={currentLanguage}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full appearance-none bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none cursor-pointer font-medium"
                >
                  <option value="en">English (US)</option>
                  <option value="hi">Hindi (हिन्दी)</option>
                  <option value="mr">Marathi (मराठी)</option>
                </select>
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">keyboard_arrow_down</span>
              </div>
            </div>
          </section>

        </div>
      </div>
    </main>
  );
}
