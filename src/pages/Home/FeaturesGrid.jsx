import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
export default function FeaturesGrid() {
  const {
    t
  } = useLanguage();
  return <section className="py-xxl bg-surface-container-low px-margin-mobile md:px-margin-desktop">
      <div className="max-w-[80rem] mx-auto">
        <div className="text-center mb-xxl">
          <h2 className="font-section-title text-section-title text-on-surface mb-md">{t('featuresTitle')}</h2>
          <p className="text-on-surface-variant font-body text-body max-w-[42rem] mx-auto">{t('featuresSub')}</p>
        </div>
        <div className="bento-grid">
          {/* Card 1 */}
          <div className="bg-surface p-lg rounded-xl shadow-sm border border-on-surface/5 hover:shadow-md transition-shadow group">
            <div className="w-12 h-12 bg-primary-fixed rounded-lg flex items-center justify-center mb-xl group-hover:bg-primary group-hover:text-on-primary transition-all">
              <span className="material-symbols-outlined">calendar_month</span>
            </div>
            <h3 className="font-card-title text-card-title text-on-surface mb-sm">{t('onlineBooking')}</h3>
            <p className="text-on-surface-variant font-body text-sm">{t('onlineBookingDesc')}</p>
          </div>
          {/* Card 2 */}
          <div className="bg-surface p-lg rounded-xl shadow-sm border border-on-surface/5 hover:shadow-md transition-shadow group">
            <div className="w-12 h-12 bg-tertiary-fixed rounded-lg flex items-center justify-center mb-xl group-hover:bg-tertiary group-hover:text-on-tertiary transition-all">
              <span className="material-symbols-outlined">qr_code_scanner</span>
            </div>
            <h3 className="font-card-title text-card-title text-on-surface mb-sm">{t('qrToken')}</h3>
            <p className="text-on-surface-variant font-body text-sm">{t('qrTokenDesc')}</p>
          </div>
          {/* Card 3 */}
          <div className="bg-surface p-lg rounded-xl shadow-sm border border-on-surface/5 hover:shadow-md transition-shadow group">
            <div className="w-12 h-12 bg-secondary-fixed rounded-lg flex items-center justify-center mb-xl group-hover:bg-secondary group-hover:text-on-secondary transition-all">
              <span className="material-symbols-outlined">reorder</span>
            </div>
            <h3 className="font-card-title text-card-title text-on-surface mb-sm">{t('liveTracking')}</h3>
            <p className="text-on-surface-variant font-body text-sm">{t('liveTrackingDesc')}</p>
          </div>
          {/* Card 4 */}
          <div className="bg-surface p-lg rounded-xl shadow-sm border border-on-surface/5 hover:shadow-md transition-shadow group">
            <div className="w-12 h-12 bg-primary-fixed rounded-lg flex items-center justify-center mb-xl group-hover:bg-primary group-hover:text-on-primary transition-all">
              <span className="material-symbols-outlined">stars</span>
            </div>
            <h3 className="font-card-title text-card-title text-on-surface mb-sm">{t('vipMgt')}</h3>
            <p className="text-on-surface-variant font-body text-sm">{t('vipMgtDesc')}</p>
          </div>
          {/* Card 5 */}
          <div className="bg-surface p-lg rounded-xl shadow-sm border border-on-surface/5 hover:shadow-md transition-shadow group">
            <div className="w-12 h-12 bg-tertiary-fixed rounded-lg flex items-center justify-center mb-xl group-hover:bg-tertiary group-hover:text-on-tertiary transition-all">
              <span className="material-symbols-outlined">smartphone</span>
            </div>
            <h3 className="font-card-title text-card-title text-on-surface mb-sm">{t('mobileFriendly')}</h3>
            <p className="text-on-surface-variant font-body text-sm">{t('mobileFriendlyDesc')}</p>
          </div>
          {/* Card 6 */}
          <div className="bg-surface p-lg rounded-xl shadow-sm border border-on-surface/5 hover:shadow-md transition-shadow group">
            <div className="w-12 h-12 bg-secondary-fixed rounded-lg flex items-center justify-center mb-xl group-hover:bg-secondary group-hover:text-on-secondary transition-all">
              <span className="material-symbols-outlined">{t("notificationsactive")}</span>
            </div>
            <h3 className="font-card-title text-card-title text-on-surface mb-sm">{t('realTimeUpdates')}</h3>
            <p className="text-on-surface-variant font-body text-sm">{t('realTimeUpdatesDesc')}</p>
          </div>
        </div>
      </div>
    </section>;
}