import { useLanguage } from "../../context/LanguageContext";
import React from 'react';
export default function Timeline() {
  const {
    t
  } = useLanguage();
  return <section className="py-xxl px-margin-mobile md:px-margin-desktop bg-surface">
      <div className="max-w-[80rem] mx-auto">
        <div className="text-center mb-xxl">
          <h2 className="font-section-title text-section-title text-on-surface mb-md">{t("yourJourneyToEnlightenment")}</h2>
          <p className="text-on-surface-variant font-body text-body max-w-[42rem] mx-auto">{t("fiveSimpleStepsToADivineAndHas")}</p>
        </div>
        <div className="relative pt-12 pb-24">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-outline-variant/30 hidden lg:block"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-xl relative">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center space-y-md">
              <div className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-lg relative z-10 shadow-lg border-4 border-surface">1</div>
              <h4 className="font-card-title text-card-title text-on-surface">{t("book")}</h4>
              <p className="font-caption text-caption text-on-surface-variant px-4">{t("chooseYourTempleAndSelectAnAva")}</p>
            </div>
            {/* Step 2 */}
            <div className="flex flex-col items-center text-center space-y-md">
              <div className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-lg relative z-10 shadow-lg border-4 border-surface">2</div>
              <h4 className="font-card-title text-card-title text-on-surface">{t("receivePass")}</h4>
              <p className="font-caption text-caption text-on-surface-variant px-4">{t("getYourDigitalQrTokenSentInsta")}</p>
            </div>
            {/* Step 3 */}
            <div className="flex flex-col items-center text-center space-y-md">
              <div className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-lg relative z-10 shadow-lg border-4 border-surface">3</div>
              <h4 className="font-card-title text-card-title text-on-surface">{t("verify")}</h4>
              <p className="font-caption text-caption text-on-surface-variant px-4">{t("showYourQrCodeAtTheSpecialized")}</p>
            </div>
            {/* Step 4 */}
            <div className="flex flex-col items-center text-center space-y-md">
              <div className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-lg relative z-10 shadow-lg border-4 border-surface">4</div>
              <h4 className="font-card-title text-card-title text-on-surface">{t("joinQueue")}</h4>
              <p className="font-caption text-caption text-on-surface-variant px-4">{t("moveIntoTheSmartmanagedQueueWi")}</p>
            </div>
            {/* Step 5 */}
            <div className="flex flex-col items-center text-center space-y-md">
              <div className="w-12 h-12 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-lg relative z-10 shadow-lg border-4 border-surface">5</div>
              <h4 className="font-card-title text-card-title text-on-surface">{t("completeDarshan")}</h4>
              <p className="font-caption text-caption text-on-surface-variant px-4">{t("experiencePeacefulSpiritualUni")}</p>
            </div>
          </div>
        </div>
      </div>
    </section>;
}