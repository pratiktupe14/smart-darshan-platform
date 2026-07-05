import { useLanguage } from "../context/LanguageContext";
import React from 'react';
import { Link } from 'react-router-dom';
export default function Footer() {
  const {
    t
  } = useLanguage();
  return <footer className="bg-on-background text-on-primary-fixed pt-xxl pb-xl border-t border-outline-variant/20">
      <div className="max-w-[80rem] mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-xxl mb-xxl">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-lg">
              <span className="material-symbols-outlined text-primary-fixed text-3xl" style={{
              fontVariationSettings: "'FILL' 1"
            }}>
                temple_hindu
              </span>
              <span className="font-card-title text-card-title font-bold text-primary-fixed">{t("samarthDarshanPortal")}</span>
            </div>
            <p className="font-body text-sm text-surface-variant/80 leading-relaxed mb-xl">{t("modernizingSpiritualAdministra")}</p>
            <div className="flex gap-md">
              <a className="w-10 h-10 rounded-full bg-surface-container-low/10 flex items-center justify-center text-primary-fixed hover:bg-primary-fixed hover:text-on-primary-fixed transition-all" href="#">
                <span className="material-symbols-outlined text-xl">share</span>
              </a>
              <a className="w-10 h-10 rounded-full bg-surface-container-low/10 flex items-center justify-center text-primary-fixed hover:bg-primary-fixed hover:text-on-primary-fixed transition-all" href="#">
                <span className="material-symbols-outlined text-xl">public</span>
              </a>
            </div>
          </div>
          <div>
            <h5 className="text-primary-fixed font-bold mb-lg">{t("quickLinks")}</h5>
            <ul className="space-y-sm">
              <li><Link className="text-surface-variant/80 hover:text-tertiary-fixed-dim transition-all text-sm" to="#">{t("aboutUs")}</Link></li>
              <li><Link className="text-surface-variant/80 hover:text-tertiary-fixed-dim transition-all text-sm" to="#">{t("templeFeatures")}</Link></li>
              <li><Link className="text-surface-variant/80 hover:text-tertiary-fixed-dim transition-all text-sm" to="#">{t("liveQueueStatus")}</Link></li>
              <li><Link className="text-surface-variant/80 hover:text-tertiary-fixed-dim transition-all text-sm" to="#">{t("bookingHelp")}</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="text-primary-fixed font-bold mb-lg">Support</h5>
            <ul className="space-y-sm">
              <li><Link className="text-surface-variant/80 hover:text-tertiary-fixed-dim transition-all text-sm" to="#">{t("contactSupport")}</Link></li>
              <li><Link className="text-surface-variant/80 hover:text-tertiary-fixed-dim transition-all text-sm" to="#">{t("privacyPolicy")}</Link></li>
              <li><Link className="text-surface-variant/80 hover:text-tertiary-fixed-dim transition-all text-sm" to="#">{t("termsOfService")}</Link></li>
              <li><Link className="text-surface-variant/80 hover:text-tertiary-fixed-dim transition-all text-sm" to="#">{t("refundPolicy")}</Link></li>
            </ul>
          </div>
          <div>
            <h5 className="text-primary-fixed font-bold mb-lg">{t("contactInfo")}</h5>
            <ul className="space-y-md text-surface-variant/80 text-sm">
              <li className="flex gap-2">
                <span className="material-symbols-outlined text-primary-fixed text-sm">mail</span>
                <a href="mailto:pratiktupe58@gmail.com" className="hover:text-primary-fixed hover:underline transition-colors">{t("pratiktupe58gmailcom")}</a>
              </li>
              <li className="flex gap-2">
                <span className="material-symbols-outlined text-primary-fixed text-sm">call</span>
                <a href="tel:+918788562103" className="hover:text-primary-fixed hover:underline transition-colors">+91 8788562103</a>
              </li>
              <li className="flex gap-2">
                <span className="material-symbols-outlined text-primary-fixed text-sm">location_on</span>
                <a href="https://www.google.com/maps/place/ardhanareshwari+nag+jotirling/@20.6836728,73.7838213,17z/data=!3m1!4b1!4m6!3m5!1s0x3bde3de27d6c9e1d:0x42fcd5a79fa923be!8m2!3d20.6836728!4d73.7864016!16s%2Fg%2F11b7jjr46p?hl=en-IN&entry=ttu&g_ep=EgoyMDI2MDYyMy4wIKXMDSoASAFQAw%3D%3D" target="_blank" rel="noreferrer" className="hover:text-primary-fixed hover:underline transition-colors">{t("ardhanareshwariNagJotirling")}</a>
              </li>
            </ul>
          </div>
        </div> 
        <div className="pt-xl border-t border-outline-variant/10 flex flex-col md:flex-row justify-between items-center gap-md text-center md:text-left">
          <p className="font-label-sm text-label-sm text-surface-variant/60">{t("2024SamarthDarshanPortalAllRig")}</p>
          <div className="flex gap-xl">
            <a className="text-[10px] text-surface-variant/40 hover:text-primary-fixed uppercase tracking-widest" href="#">{t("designedForDevotion")}</a>
          </div>
        </div>
      </div>
    </footer>;
}