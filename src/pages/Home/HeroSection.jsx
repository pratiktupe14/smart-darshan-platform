import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useUser } from '../../context/UserContext';

export default function HeroSection() {
  const { t } = useLanguage();
  const { user } = useUser();
  const navigate = useNavigate();

  const handleBookDarshan = (e) => {
    e.preventDefault();
    if (user) {
      navigate('/dashboard/book');
    } else {
      navigate('/login?redirect=/dashboard/book');
    }
  };

  return (
    <section className="relative overflow-hidden min-h-[870px] flex items-center px-margin-mobile md:px-margin-desktop py-xxl">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-tr from-background via-transparent to-primary/5"></div>
      </div>
      <div className="relative z-10 max-w-[80rem] mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-xl items-center">
        <div className="space-y-xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm">
            <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            {t('officialPortal')}
          </div>
          <h1 className="font-hero-title text-hero-title-mobile md:text-hero-title text-on-surface leading-tight">
            {t('heroTitle')}
          </h1>
          <p className="font-body text-body text-on-surface-variant max-w-[32rem] leading-relaxed">
            {t('heroSubtitle')}
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap gap-md w-full">
            <button onClick={handleBookDarshan} className="w-full sm:w-auto bg-primary text-on-primary font-button text-button px-8 py-4 rounded-xl shadow-xl shadow-primary/25 hover:translate-y-[-2px] transition-all text-center cursor-pointer">
              {t('bookDarshan')}
            </button>
            <Link to="/dashboard/user-queue" className="w-full sm:w-auto justify-center bg-surface-container-highest text-on-surface font-button text-button px-8 py-4 rounded-xl flex items-center gap-2 hover:bg-surface-variant transition-all text-center">
              <span className="material-symbols-outlined">analytics</span>
              {t('checkQueue')}
            </Link>
          </div>
        </div>
        <div className="relative mt-8 lg:mt-0 h-full flex flex-col justify-center">
          <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl border border-on-surface/5 bg-surface/50 flex items-center justify-center mx-auto w-auto h-auto max-h-[85vh]">
            <img className="w-auto h-auto max-w-full max-h-[85vh] object-contain" alt="Temple Hero View" src="/temple-view.jpg" />
          </div>
        </div>
      </div>
    </section>
  );
}

