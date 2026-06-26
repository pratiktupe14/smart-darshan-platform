import React, { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useUser } from '../../context/UserContext';

export default function BookDarshan() {
  const { t, currentLanguage, setLanguage } = useLanguage();
  const { user } = useUser();

  const [persons, setPersons] = useState(1);
  const [visitors, setVisitors] = useState([{ name: '', age: '' }]);
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
    setPersons((prev) => {
      const nextVal = Math.max(1, Math.min(10, prev + change));
      setVisitors((prevVisitors) => {
        if (prevVisitors.length < nextVal) {
          return [...prevVisitors, ...Array.from({ length: nextVal - prevVisitors.length }, () => ({ name: '', age: '' }))];
        } else if (prevVisitors.length > nextVal) {
          return prevVisitors.slice(0, nextVal);
        }
        return prevVisitors;
      });
      return nextVal;
    });
  };

  const handleVisitorChange = (index, field, value) => {
    setVisitors((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleDateChange = (e) => {
    const val = e.target.value;
    if (!val) return;
    const parts = val.split('-');
    if (parts.length === 3) {
      const date = new Date(parts[0], parts[1] - 1, parts[2]);
      const day = date.getDay(); // 0 = Sunday, 1 = Monday, 2 = Tuesday
      if (day !== 0 && day !== 1 && day !== 2) {
        alert('Darshan booking is only allowed on Sunday, Monday, and Tuesday.');
        e.target.value = '';
      }
    }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const dateVal = e.target.darshan_date.value;
    if (dateVal) {
      const parts = dateVal.split('-');
      if (parts.length === 3) {
        const date = new Date(parts[0], parts[1] - 1, parts[2]);
        const day = date.getDay(); // 0 = Sunday, 1 = Monday, 2 = Tuesday
        if (day !== 0 && day !== 1 && day !== 2) {
          alert('Darshan booking is only allowed on Sunday, Monday, and Tuesday.');
          setIsSubmitting(false);
          return;
        }
      }
    }

    try {
      const payload = {
        fullName: e.target.full_name.value,
        mobile: e.target.mobile.value,
        placeCity: e.target.place_city.value,
        persons: persons,
        visitors: visitors,
        vehicleType: vehicleType,
        vehicleNumber: vehicleType !== 'none' ? e.target.vehicle_number.value : '',
        darshanDate: e.target.darshan_date.value,
        userId: user?._id || user?.id || undefined,
      };
      console.log('Sending booking request with payload:', payload);

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('Received response with status:', response.status);

      if (response.ok) {
        setShowSuccess(true);
        if (!user) {
          localStorage.setItem('guestMobile', payload.mobile);
        }
      } else {
        const errorData = await response.json().catch(() => null);
        console.error('Booking Error Response:', errorData);
        let errorMsg = errorData?.error || errorData?.message || 'Failed to book darshan. Please try again.';
        if (errorData?.details) {
          errorMsg += `\nDetails: ${errorData.details}`;
        }
        
        if (response.status === 400) {
          alert(`Validation Error: ${errorMsg}`);
        } else if (response.status === 401 || response.status === 403) {
          alert(`Authentication Error: ${errorMsg}`);
        } else {
          alert(`Database Error: ${errorMsg}`);
        }
      }
    } catch (error) {
      console.error('Network Error during booking request:', error);
      alert(`Network Error: ${error.message || 'An error occurred while connecting to the server.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="font-body-md text-on-background bg-[#FFF9F2] selection:bg-primary-container selection:text-on-primary-container min-h-screen flex flex-col">
      {/* TopNavBar */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-4 md:px-10 h-16 bg-surface dark:bg-background border-b border-outline-variant dark:border-outline">
        <div className="flex items-center gap-4">
          <Link to="/" className="font-headline-md text-headline-md font-bold text-primary dark:text-primary-fixed-dim">
            शिव अर्धः नारेश्वरी नाग ज्योतिर्लिंग श्री क्षेत्र बिलमाळ (तुलसिगड)
          </Link>
        </div>
        <nav className="hidden md:flex gap-8 items-center">
          <span className="font-label-md text-label-md text-primary font-bold border-b-2 border-primary cursor-default">{t('bookDarshan')}</span>
          <a className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors" href="#">{t('bookings')}</a>
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
            <option value="gu">GU</option>
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
            
            <div className="relative rounded-xl overflow-hidden shadow-lg w-full flex items-center justify-center bg-black/5">
              <img 
                className="w-full h-auto object-contain" 
                alt="Darshan Preview" 
                src="/guru-image.jpg"
              />
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
                      key={user?.fullName || 'name'}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 outline-none focus:border-primary transition-all soft-glow font-body-md" 
                      id="full_name" name="full_name" placeholder="E.g. Rajesh Kumar" required type="text"
                      defaultValue={user?.fullName || ''}
                    />
                  </div>
                  <div className="space-y-2 relative z-10">
                    <label className="font-label-md text-label-md text-on-surface-variant flex items-center gap-2" htmlFor="mobile">
                      <span className="material-symbols-outlined text-[18px]">smartphone</span> {t('mobile')}
                    </label>
                    <div className="flex gap-2">
                      <input 
                        key={user?.mobileNumber || user?.mobile || 'mobile'}
                        className="flex-1 min-w-0 bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 outline-none focus:border-primary transition-all soft-glow font-body-md" 
                        id="mobile" name="mobile" pattern="[0-9]{10}" placeholder="9876543210" required type="tel"
                        defaultValue={user?.mobileNumber || user?.mobile || ''}
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
                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 relative z-10 w-full mt-6">
                    <div className="space-y-4 w-full mx-auto text-center flex flex-col items-center">
                      <label className="font-label-md text-label-md text-on-surface-variant flex flex-col items-center gap-2 w-full" htmlFor="otp">
                        <span className="material-symbols-outlined text-primary text-[24px]">lock_open</span> 
                        <span className="font-bold text-on-surface text-lg">Enter Verification Code</span>
                        <span className="text-sm font-normal">We've sent a 6-digit code to your mobile</span>
                      </label>
                      <input 
                        className="w-full max-w-[200px] text-center tracking-[0.5em] font-bold text-2xl bg-white border border-outline-variant rounded-lg px-4 py-3 outline-none focus:border-primary transition-all soft-glow mx-auto block" 
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
                      key={user?.placeCityVillage || 'place'}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 outline-none focus:border-primary transition-all soft-glow font-body-md" 
                      id="place_city" name="place_city" placeholder="E.g. Mumbai" required type="text"
                      defaultValue={user?.placeCityVillage || ''}
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

                {/* Visitor Details Section */}
                <div className="space-y-4 pt-2 relative z-10">
                  <h3 className="font-bold text-on-surface text-base border-b border-outline-variant pb-2">Visitor Details</h3>
                  {Array.from({ length: persons }).map((_, index) => (
                    <div key={index} className="p-4 bg-surface-container-low border border-outline-variant rounded-lg space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[18px]">person</span>
                        <h4 className="font-bold text-sm text-primary">Visitor {index + 1}</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-2" htmlFor={`visitor_name_${index}`}>
                            Full Name
                          </label>
                          <input 
                            className="w-full bg-white border border-outline-variant rounded-lg px-4 py-2 outline-none focus:border-primary transition-all soft-glow font-body-md" 
                            id={`visitor_name_${index}`}
                            name={`visitor_name_${index}`}
                            placeholder="Full Name"
                            required
                            type="text"
                            value={visitors[index]?.name || ''}
                            onChange={(e) => handleVisitorChange(index, 'name', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-2" htmlFor={`visitor_age_${index}`}>
                            Age
                          </label>
                          <input 
                            className="w-full bg-white border border-outline-variant rounded-lg px-4 py-2 outline-none focus:border-primary transition-all soft-glow font-body-md" 
                            id={`visitor_age_${index}`}
                            name={`visitor_age_${index}`}
                            placeholder="Age"
                            required
                            type="number"
                            min="1"
                            max="120"
                            value={visitors[index]?.age || ''}
                            onChange={(e) => handleVisitorChange(index, 'age', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
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
                      onChange={handleDateChange}
                      onKeyDown={(e) => e.preventDefault()}
                    />
                  </div>
                  <p className="font-label-sm text-label-sm text-primary flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">info</span> Bookings are only allowed on Sundays, Mondays, and Tuesdays.
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
                  <div className="text-on-surface-variant font-body-md text-[16px] mb-8 max-w-[600px] w-full px-4 space-y-4">
                    <p>Your darshan booking has been successfully confirmed.</p>
                    <p>A digital pass with your QR code and booking details has been generated and sent to your registered mobile number.</p>
                    <p>Please carry your QR pass during your temple visit.</p>
                  </div>
                  <div className="p-4 border-2 border-dashed border-outline-variant rounded-xl mb-8 bg-white">
                    <div className="w-48 h-48 bg-surface-container-high flex items-center justify-center relative p-4 rounded-xl shadow-inner">
                      <QRCode 
                        value="TOKEN-SUCCESS-A001" 
                        size={160} 
                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
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
                      setVisitors([{ name: '', age: '' }]);
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
