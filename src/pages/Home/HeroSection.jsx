import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

export default function HeroSection() {
  const { t } = useLanguage();

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
          <div className="flex flex-wrap gap-md">
            <Link to="/dashboard/book" className="bg-primary text-on-primary font-button text-button px-8 py-4 rounded-xl shadow-xl shadow-primary/25 hover:translate-y-[-2px] transition-all text-center">
              {t('bookDarshan')}
            </Link>
            <Link to="/dashboard/user-queue" className="bg-surface-container-highest text-on-surface font-button text-button px-8 py-4 rounded-xl flex items-center gap-2 hover:bg-surface-variant transition-all text-center">
              <span className="material-symbols-outlined">analytics</span>
              {t('checkQueue')}
            </Link>
          </div>
        </div>
        <div className="relative lg:block hidden">
          <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl border border-on-surface/5">
            <img className="w-full h-[500px] object-cover" alt="A grand, intricate Indian temple architecture with golden spires during sunset..." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBO33e142OHfbKh5UOWXJCCm5jzZtGlJ5V4ROsWrcSYXQ3BaVduLyOCXVYxRHvbPNgliJ6-7MKxzYIWsZICwYrQw4C3auJAxGYnJv4Kc4I_ZL1Nr6CunxLCzHYpEkmYTiO8nQsi3Hdr3Hm2kACtIkcec6bSbboAm_WgFX15BWB405spPcOKMFIVvyvVavPw5kvF0GcPx8Kjw4W3UWsDgTtops5iM4f0p_rI_dQ_qzU9T67zH26P9erUVogzw_JaVTpjP5Aia2UHzUA" />
          </div>
          {/* QR Pass Preview Floating Card */}
          <div className="absolute -bottom-8 -left-8 z-20 glass-effect p-lg rounded-xl shadow-2xl w-64 animate-bounce-slow">
            <div className="flex justify-between items-center mb-md">
              <span className="font-label-sm text-primary font-bold">QR PASS</span>
              <span className="material-symbols-outlined text-primary">qr_code_2</span>
            </div>
            <div className="bg-white p-sm rounded-lg mb-md">
              <img className="w-full aspect-square opacity-80" alt="QR code graphic" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCwyTHEQ_AcsaQO2JMIbjVZZL5OEs2BqmoHZY99JB8DKD0cyZi8TmdBZHPrAeIolu2GTZojZ_6iNDedoufJrBaOqoFvVAKNFKsiZk63tt1xQAz2I5KpUkdYYbgWNkr3gfGxpmjKVLIONmnKHLyIPDrAlWNn1VaDlGLPnBYQz55dZwl1o4XAPiRQ4u8nDmU_-92GocHpEOa68yhEehEJSKspUGLXv3adoQE7L5W8OwtjXLQo2wqs2z1CvR55QHtcr5tS9zi0knnCMLE" />
            </div>
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">{t('verifyAtGate')}</p>
              <p className="font-label-sm font-bold text-on-surface">{t('slot')}: 08:30 AM</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

