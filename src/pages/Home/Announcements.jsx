import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

export default function Announcements() {
  const { t } = useLanguage();

  return (
    <section className="py-xxl px-margin-mobile md:px-margin-desktop bg-surface-container-high relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="max-w-[80rem] mx-auto relative z-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-xxl">
          <div className="max-w-[36rem]">
            <h2 className="font-section-title text-section-title text-on-surface mb-sm">{t('noticeBoard')}</h2>
            <p className="text-on-surface-variant font-body text-body">{t('noticeSubtitle')}</p>
          </div>
          <Link className="flex items-center gap-2 text-primary font-bold hover:underline" to="/dashboard/announcements">
            {t('viewAllNotices')}
            <span className="material-symbols-outlined">arrow_forward</span>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-xl">
          {/* Notice 1 */}
          <div className="bg-surface-container-lowest p-lg rounded-xl shadow-sm hover:-translate-y-1 transition-transform border border-outline-variant/10">
            <div className="flex justify-between items-start mb-md">
              <span className="px-3 py-1 bg-tertiary-container text-on-tertiary-container text-[10px] font-bold rounded-full uppercase tracking-widest">{t('newTag')}</span>
              <span className="text-on-surface-variant font-caption text-caption">Oct 12, 2024</span>
            </div>
            <h4 className="font-card-title text-on-surface mb-md">{t('notice1Title')}</h4>
            <p className="text-on-surface-variant font-body text-sm mb-lg">{t('notice1Desc')}</p>
            <button className="text-primary font-bold text-sm flex items-center gap-1 group">
              {t('readDetails')} <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">chevron_right</span>
            </button>
          </div>
          {/* Notice 2 */}
          <div className="bg-surface-container-lowest p-lg rounded-xl shadow-sm hover:-translate-y-1 transition-transform border border-outline-variant/10">
            <div className="flex justify-between items-start mb-md">
              <span className="px-3 py-1 bg-secondary-container text-on-secondary-container text-[10px] font-bold rounded-full uppercase tracking-widest">{t('updateTag')}</span>
              <span className="text-on-surface-variant font-caption text-caption">Oct 10, 2024</span>
            </div>
            <h4 className="font-card-title text-on-surface mb-md">{t('notice2Title')}</h4>
            <p className="text-on-surface-variant font-body text-sm mb-lg">{t('notice2Desc')}</p>
            <button className="text-primary font-bold text-sm flex items-center gap-1 group">
              {t('watchLive')} <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">play_circle</span>
            </button>
          </div>
          {/* Notice 3 */}
          <div className="bg-surface-container-lowest p-lg rounded-xl shadow-sm hover:-translate-y-1 transition-transform border border-outline-variant/10">
            <div className="flex justify-between items-start mb-md">
              <span className="px-3 py-1 bg-outline-variant text-on-surface-variant text-[10px] font-bold rounded-full uppercase tracking-widest">{t('adminTag')}</span>
              <span className="text-on-surface-variant font-caption text-caption">Oct 05, 2024</span>
            </div>
            <h4 className="font-card-title text-on-surface mb-md">{t('notice3Title')}</h4>
            <p className="text-on-surface-variant font-body text-sm mb-lg">{t('notice3Desc')}</p>
            <button className="text-primary font-bold text-sm flex items-center gap-1 group">
              {t('donateNow')} <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">volunteer_activism</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

