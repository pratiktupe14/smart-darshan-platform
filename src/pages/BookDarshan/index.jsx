import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

export default function BookDarshan() {
  const { t, currentLanguage, setLanguage } = useLanguage();

  const [persons, setPersons] = useState(1);
  const [vehicleType, setVehicleType] = useState('none');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [minDate, setMinDate] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setMinDate(today);
  }, []);

  const updatePersons = (change) => {
    setPersons((prev) => Math.max(1, Math.min(10, prev + change)));
  };

  const handleSendOTP = () => {
    const mobile = document.getElementById('mobile')?.value;
    if (mobile && mobile.length === 10) {
      setOtpSent(true);
      alert(`Success: OTP sent to ${mobile}.`);
    } else {
      alert('Error: Please enter a valid 10-digit mobile number first.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);
    }, 1500);
  };

  return (
    <div className="font-body-md text-on-background bg-[#FFF9F2] selection:bg-primary-container selection:text-on-primary-container min-h-screen flex flex-col">
      {/* TopNavBar */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 md:px-10 h-16 bg-surface dark:bg-background border-b border-outline-variant dark:border-outline">
        <div className="flex items-center gap-4">
          <Link to="/" className="font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed-dim">
            TemplePortal
          </Link>
        </div>
        <nav className="hidden md:flex gap-8 items-center">
          <Link to="/" className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors">{t('home')}</Link>
          <span className="font-label-md text-label-md text-primary font-bold border-b-2 border-primary cursor-default">{t('bookDarshan')}</span>
          <a className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors" href="#">{t('bookings')}</a>
          <a className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors" href="#">E-Prasad</a>
        </nav>
        <div className="flex items-center gap-4">
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
          <button className="material-symbols-outlined text-on-surface-variant p-2 hover:bg-surface-container-high rounded-full transition-all">notifications</button>
          <button className="material-symbols-outlined text-on-surface-variant p-2 hover:bg-surface-container-high rounded-full transition-all">account_circle</button>
        </div>
      </header>

      <main className="flex-1 pt-24 pb-16 px-4 md:px-10 max-w-[1440px] w-full mx-auto relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Welcome Column */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <span className="inline-block bg-primary-container/10 text-primary font-label-md text-label-md px-3 py-1 rounded-full">Secure Your Slot</span>
              <h1 className="font-display text-[48px] font-extrabold leading-tight text-on-surface tracking-tight">
                Experience a <span className="text-primary">Soulful</span> Journey.
              </h1>
            </div>
            
            <div className="relative rounded-xl overflow-hidden h-64 md:h-80 shadow-lg">
              <img 
                className="w-full h-full object-cover" 
                alt="Temple at golden hour" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAZHAdgxartigihM3jAQQvG0VuwDWm-5slSsUxnhnZLoBEMi8Cw1vsZFHPQpz2sPLs0s4SuB348S5PPZFLnLILEgyIobxBcmL6CcpEFgY6SNxz10FCejRcJM2FhXYvqrWjmtZS2G6fegZ3CJlCvXqrRoqVkJwUAsQUaNf9kM1wiJV_3KLYphFLegxSa6Y255OhHMVX0iKoYW-mjSPRcFHpNPueygZMR8Joef3n1ptnKupJ7b3QCMr9X991r0rwEJPBWysK65a4dwDY"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6">
                <p className="text-white font-headline-md text-headline-md">Shri Mahakaal Mandir</p>
                <p className="text-white/80 font-label-md text-label-md flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">location_on</span> Ujjain, Madhya Pradesh
                </p>
              </div>
            </div>
          </div>

          {/* Form Column */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-xl shadow-xl p-6 md:p-10 border border-outline-variant relative overflow-hidden">
              {/* Subtle Decorative Background Pattern */}
              <div className="absolute top-0 right-0 w-32 h-32 opacity-5 pointer-events-none">
                <svg fill="currentColor" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" fill="none" r="40" stroke="black" strokeWidth="1"></circle>
                  <path d="M50 10 L50 90 M10 50 L90 50" stroke="black" strokeWidth="1"></path>
                </svg>
              </div>
              
              <form className="space-y-6" id="darshanBookingForm" onSubmit={handleSubmit}>
                <div className="border-b border-outline-variant pb-4 mb-6 relative z-10">
                  <h2 className="font-headline-md text-[24px] font-bold text-on-surface">Darshan Registration</h2>
                  <p className="font-label-md text-label-md text-on-surface-variant">Fill in the details to generate your digital pass.</p>
                </div>
                
                {/* Personal Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                  <div className="space-y-2 group">
                    <label className="font-label-md text-label-md text-on-surface-variant flex items-center gap-2" htmlFor="full_name">
                      <span className="material-symbols-outlined text-[18px]">person</span> {t('nameLabel')}
                    </label>
                    <input 
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 outline-none focus:border-primary transition-all soft-glow font-body-md" 
                      id="full_name" name="full_name" placeholder="E.g. Rajesh Kumar" required type="text"
                    />
                  </div>
                  <div className="space-y-2 relative z-10">
                    <label className="font-label-md text-label-md text-on-surface-variant flex items-center gap-2" htmlFor="mobile">
                      <span className="material-symbols-outlined text-[18px]">smartphone</span> {t('mobile')}
                    </label>
                    <div className="flex gap-2">
                      <input 
                        className="flex-1 min-w-0 bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 outline-none focus:border-primary transition-all soft-glow font-body-md" 
                        id="mobile" name="mobile" pattern="[0-9]{10}" placeholder="9876543210" required type="tel"
                      />
                      <button 
                        className="bg-secondary-container text-on-secondary-container font-label-md text-label-md px-4 py-3 rounded-lg hover:bg-secondary-fixed-dim transition-all active:scale-95 whitespace-nowrap shrink-0" 
                        onClick={handleSendOTP} type="button"
                      >
                        Send OTP
                      </button>
                    </div>
                  </div>
                </div>

                {/* OTP Verification Block */}
                {otpSent && (
                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 relative z-10 animate-fade-in">
                    <div className="space-y-2 max-w-sm mx-auto text-center">
                      <label className="font-label-md text-label-md text-on-surface-variant flex flex-col items-center gap-2" htmlFor="otp">
                        <span className="material-symbols-outlined text-primary text-[24px]">lock_open</span> 
                        <span className="font-bold text-on-surface">Enter Verification Code</span>
                        <span className="text-xs font-normal">We've sent a 6-digit code to your mobile</span>
                      </label>
                      <input 
                        className="w-full text-center tracking-[0.5em] font-bold text-2xl bg-white border border-outline-variant rounded-lg px-4 py-3 outline-none focus:border-primary transition-all soft-glow" 
                        id="otp" name="otp" pattern="[0-9]{6}" placeholder="------" maxLength="6" required type="text"
                      />
                      <button 
                        type="button" 
                        className="w-full mt-4 bg-primary text-on-primary font-bold py-3 rounded-lg hover:bg-primary/90 transition-all active:scale-95 shadow-md"
                        onClick={() => alert('OTP Verified Successfully!')}
                      >
                        Verify OTP
                      </button>
                      <div className="pt-2">
                        <button type="button" className="text-primary text-sm font-bold hover:underline">
                          Resend OTP
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Location and Quantity */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                  <div className="space-y-2">
                    <label className="font-label-md text-label-md text-on-surface-variant flex items-center gap-2" htmlFor="place_city">
                      <span className="material-symbols-outlined text-[18px]">location_city</span> Place/City
                    </label>
                    <input 
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 outline-none focus:border-primary transition-all soft-glow font-body-md" 
                      id="place_city" name="place_city" placeholder="E.g. Mumbai" required type="text"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-label-md text-label-md text-on-surface-variant flex items-center gap-2" htmlFor="persons">
                      <span className="material-symbols-outlined text-[18px]">groups</span> {t('persons')}
                    </label>
                    <div className="flex items-center bg-surface-container-low border border-outline-variant rounded-lg overflow-hidden soft-glow">
                      <button className="p-3 hover:bg-surface-container-high transition-colors" onClick={() => updatePersons(-1)} type="button">
                        <span className="material-symbols-outlined">remove</span>
                      </button>
                      <input 
                        className="w-full bg-transparent border-none text-center outline-none focus:ring-0 font-body-md font-bold" 
                        id="persons" max="10" min="1" name="persons" readOnly type="number" value={persons}
                      />
                      <button className="p-3 hover:bg-surface-container-high transition-colors" onClick={() => updatePersons(1)} type="button">
                        <span className="material-symbols-outlined">add</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Vehicle Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                  <div className="space-y-2">
                    <label className="font-label-md text-label-md text-on-surface-variant flex items-center gap-2" htmlFor="vehicle_type">
                      <span className="material-symbols-outlined text-[18px]">commute</span> Vehicle Type
                    </label>
                    <select 
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 outline-none focus:border-primary transition-all soft-glow font-body-md appearance-none" 
                      id="vehicle_type" name="vehicle_type"
                      value={vehicleType}
                      onChange={(e) => setVehicleType(e.target.value)}
                    >
                      <option value="none">No Vehicle</option>
                      <option value="two_wheeler">Two Wheeler</option>
                      <option value="four_wheeler">Four Wheeler / SUV</option>
                      <option value="bus">Bus / Large Vehicle</option>
                    </select>
                  </div>
                  <div className={`space-y-2 transition-all duration-300 ${vehicleType === 'none' ? 'opacity-50 pointer-events-none' : ''}`}>
                    <label className="font-label-md text-label-md text-on-surface-variant flex items-center gap-2" htmlFor="vehicle_number">
                      <span className="material-symbols-outlined text-[18px]">badge</span> Vehicle Number
                    </label>
                    <input 
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 outline-none focus:border-primary transition-all soft-glow font-body-md uppercase" 
                      id="vehicle_number" name="vehicle_number" placeholder="MH 01 AB 1234" type="text"
                      required={vehicleType !== 'none'}
                    />
                  </div>
                </div>

                {/* Date Selection */}
                <div className="space-y-2 pt-2 relative z-10">
                  <label className="font-label-md text-label-md text-on-surface-variant flex items-center gap-2" htmlFor="darshan_date">
                    <span className="material-symbols-outlined text-[18px]">calendar_month</span> Preferred Darshan Date
                  </label>
                  <div className="relative">
                    <input 
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 outline-none focus:border-primary transition-all soft-glow font-body-md" 
                      id="darshan_date" name="darshan_date" required type="date" min={minDate}
                    />
                  </div>
                  <p className="font-label-sm text-label-sm text-primary flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">info</span> Slots are usually open for the next 30 days.
                  </p>
                </div>

                {/* Submit Button */}
                <div className="pt-6 relative z-10">
                  <button 
                    className="w-full bg-primary-container text-on-primary-container font-headline-md text-headline-md py-4 rounded-xl shadow-lg hover:shadow-xl hover:translate-y-[-2px] active:scale-[0.98] transition-all flex items-center justify-center gap-3 font-bold disabled:opacity-70 disabled:hover:translate-y-0" 
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="material-symbols-outlined animate-spin">sync</span> Processing...
                      </>
                    ) : (
                      <>
                        {t('bookDarshan')}
                        <span className="material-symbols-outlined">arrow_forward</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Success State Overlay */}
              {showSuccess && (
                <div className="absolute inset-0 bg-white z-20 flex flex-col items-center justify-center text-center p-8">
                  <div className="w-24 h-24 bg-primary-container/20 rounded-full flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-primary text-5xl">check_circle</span>
                  </div>
                  <h3 className="font-headline-lg text-[32px] font-bold text-on-surface mb-2">Booking Confirmed!</h3>
                  <p className="text-on-surface-variant font-body-md text-[16px] mb-8 max-w-md">
                    Your slot is reserved. A digital copy and SMS with the QR code have been sent to your mobile.
                  </p>
                  <div className="p-4 border-2 border-dashed border-outline-variant rounded-xl mb-8">
                    <div className="w-48 h-48 bg-surface-container-high flex items-center justify-center relative">
                      <img 
                        className="w-40 h-40" 
                        alt="QR Code" 
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDGC2JeFF-ghMLH61KV94ZWl7VhlqCSXEzyg7vV_XYLPLq9FKBk5f9jvjF-yqf0soeDhdX_B3C90Ie9bfHDO01Ni_CdxAaRcqAH1VhrNUtL82HjkmnxkA8wAqzOJ1ltpDI0JJYixWsflbTiiD_wqrX-ZWLRgJkoAuo4ddI9PqppTdkmemngoXzATA052GLlKXq6Dm0XovOhvjSaVDDFJinwu0z5S0Bee4u2fSxUEoP2VBZCc9vNYDn-ls5Z_lUBc7nA7NB2OR_TP0g"
                      />
                      <div className="absolute -top-3 -right-3 bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full font-label-sm text-[12px] font-bold shadow-md">
                        SCAN FOR ENTRY
                      </div>
                    </div>
                  </div>
                  <button 
                    className="font-label-md text-[14px] font-bold text-primary border-2 border-primary px-8 py-3 rounded-lg hover:bg-primary/5 transition-all" 
                    onClick={() => {
                      setShowSuccess(false);
                      setPersons(1);
                      setVehicleType('none');
                    }}
                  >
                    Book Another Visit
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>


    </div>
  );
}
