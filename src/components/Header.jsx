import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function Header() {
  const { t, currentLanguage, setLanguage } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-surface/80 backdrop-blur-md border-b border-on-surface/10 shadow-sm">
      <div className="max-w-[80rem] mx-auto px-margin-mobile md:px-margin-desktop h-20 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
            temple_hindu
          </span>
          <span className="font-hero-title text-card-title font-bold text-primary tracking-tight">
            Smart Darshan
          </span>
        </div>
        <nav className="hidden md:flex items-center gap-xl">
          <Link className="font-label-sm text-label-sm text-primary font-bold border-b-2 border-primary py-1" to="/">{t('home')}</Link>
          <Link className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors" to="#features">{t('features')}</Link>
          <Link className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors" to="#queue">{t('queueStatus')}</Link>
          <Link className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors" to="#contact">{t('contact')}</Link>
        </nav>
        <div className="flex items-center gap-md">
          <select 
            value={currentLanguage} 
            onChange={(e) => setLanguage(e.target.value)}
            className="hidden md:block font-label-sm text-label-sm bg-surface border border-on-surface/10 rounded-xl px-3 py-2 text-on-surface hover:border-primary focus:outline-none transition-all cursor-pointer"
            aria-label="Language Selector"
          >
            <option value="en">English</option>
            <option value="hi">हिंदी</option>
            <option value="mr">मराठी</option>
          </select>
          <Link className="hidden sm:block font-button text-button px-6 py-2.5 rounded-xl border-1.5 border-primary text-primary hover:bg-primary/5 transition-all text-center" to="/login">
            {t('login')}
          </Link>
          <Link className="hidden md:block font-button text-button px-6 py-3 rounded-xl bg-primary text-on-primary shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all" to="/dashboard/book">
            {t('bookDarshan')}
          </Link>
          <button 
            className="md:hidden p-2 text-on-surface hover:bg-surface-container-high rounded-full transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span className="material-symbols-outlined">{isMobileMenuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-surface border-b border-on-surface/10 shadow-lg flex flex-col p-4 gap-4 animate-in slide-in-from-top-2">
          <nav className="flex flex-col gap-4">
            <Link onClick={() => setIsMobileMenuOpen(false)} className="font-label-sm text-label-sm text-primary font-bold border-b-2 border-primary py-1 w-fit" to="/">{t('home')}</Link>
            <Link onClick={() => setIsMobileMenuOpen(false)} className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors" to="#features">{t('features')}</Link>
            <Link onClick={() => setIsMobileMenuOpen(false)} className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors" to="#queue">{t('queueStatus')}</Link>
            <Link onClick={() => setIsMobileMenuOpen(false)} className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors" to="#contact">{t('contact')}</Link>
          </nav>
          <div className="h-px bg-outline-variant/30 w-full my-2"></div>
          <div className="flex flex-col gap-3">
            <select 
              value={currentLanguage} 
              onChange={(e) => setLanguage(e.target.value)}
              className="font-label-sm text-label-sm bg-surface-container-lowest border border-on-surface/10 rounded-xl px-3 py-2 text-on-surface w-full"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी</option>
              <option value="mr">मराठी</option>
            </select>
            <Link onClick={() => setIsMobileMenuOpen(false)} className="font-button text-button w-full px-6 py-3 rounded-xl border-1.5 border-primary text-primary text-center" to="/login">
              {t('login')}
            </Link>
            <Link onClick={() => setIsMobileMenuOpen(false)} className="font-button text-button w-full px-6 py-3 rounded-xl bg-primary text-on-primary text-center" to="/dashboard/book">
              {t('bookDarshan')}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

