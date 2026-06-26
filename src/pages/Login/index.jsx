import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';

export default function Login() {
  const navigate = useNavigate();
  const { loginUser } = useUser();
  const [role, setRole] = useState('user');
  const [view, setView] = useState('mobile');
  const [loginMethod, setLoginMethod] = useState('email'); // 'mobile' or 'email'
  const [mobileNumber, setMobileNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  // Simple animation on load
  useEffect(() => {
    const elements = document.querySelectorAll('.stagger-in');
    elements.forEach((el, index) => {
      el.style.opacity = '0';
      el.style.animationDelay = `${index * 0.1}s`;
    });
  }, [view]);

  const handleMobileSubmit = () => {
    // In a real app, send OTP here
    setView('otp');
    setTimeout(() => {
      if (otpRefs[0].current) {
        otpRefs[0].current.focus();
      }
    }, 100);
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!emailAddress || !password || !fullName) {
      alert('Please enter your name, email and password.');
      return;
    }
    
    try {
      // Try register first
      let response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailAddress, password, fullName, role })
      });
      
      let data = await response.json();
      
      if (!response.ok && data.message === 'User already exists') {
        // Try login
        response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: emailAddress, password })
        });
        data = await response.json();
      }
      
      if (response.ok) {
        loginUser(data.user, data.user.role || role, data.token);
        
        if (data.user.role === 'admin') {
          navigate('/dashboard/admin');
        } else if (data.user.role === 'committee') {
          navigate('/dashboard/committee');
        } else {
          navigate('/dashboard');
        }
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred during login');
    }
  };

  const handleGoogleLogin = () => {
    alert('Redirecting to Google Sign-In...');
    handleVerifyOtp();
  };

  const handleOtpChange = (index, e) => {
    const value = e.target.value;
    if (value.length > 1) return; // Prevent multiple chars

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      otpRefs[index + 1].current.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs[index - 1].current.focus();
    }
  };

  const handleVerifyOtp = async () => {
    try {
      console.log('[Login] Verifying OTP for mobile:', mobileNumber);
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/mobile-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobileNumber, role })
      });
      if (res.ok) {
        const data = await res.json();
        console.log('[Login] Mobile login success. User data:', data);
        loginUser(data.user, data.user.role || role, data.token);
        
        if (data.user.role === 'admin') {
          navigate('/dashboard/admin');
        } else if (data.user.role === 'committee') {
          navigate('/dashboard/committee');
        } else {
          navigate('/dashboard');
        }
      } else {
        const errData = await res.json().catch(() => null);
        alert(errData?.message || 'Verification failed');
      }
    } catch (err) {
      console.error('[Login] Error during mobile verification:', err);
      alert('An error occurred during verification');
    }
  };

  return (
    <div className="bg-background min-h-screen flex flex-col font-body-md text-on-background selection:bg-primary-fixed selection:text-on-primary-fixed">
      <main className="flex-grow flex items-center justify-center min-h-screen p-4 md:p-8 lg:p-12 relative overflow-hidden bg-surface-container-lowest/50">
        <div className="w-full max-w-[1500px] flex flex-col md:flex-row items-center justify-evenly gap-8 lg:gap-16">
          
          {/* Desktop Image Container tightly wrapped */}
          <div className="hidden md:flex relative overflow-hidden rounded-[2rem] shadow-2xl border border-on-surface/10 w-full max-w-[800px] shrink">
            <img 
              alt="Ancient Indian Temple" 
              className="w-full h-auto object-contain block bg-black/5" 
              src="/temple-view.jpg"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10 pointer-events-none"></div>
            <div className="absolute inset-0 flex flex-col justify-end p-10 lg:p-14 z-20 pointer-events-none">
              <h2 className="text-white font-display text-[32px] lg:text-[40px] font-extrabold leading-tight mb-4 drop-shadow-lg">
                Welcome to<br/>शिव अर्धः नारेश्वरी नाग ज्योतिर्लिंग श्री क्षेत्र बिलमाळ (तुलसिगड)
              </h2>
              <p className="text-white/90 font-body-lg max-w-[28rem] drop-shadow-md">
                Experience the divine with our premium temple management solutions, designed for the modern spiritual era.
              </p>
            </div>
          </div>

          {/* Mobile Image Container tightly wrapped */}
          <div className="block md:hidden relative overflow-hidden rounded-2xl shadow-xl w-full border border-on-surface/10">
            <img 
              alt="Ancient Indian Temple" 
              className="w-full h-auto object-contain block bg-black/5" 
              src="/temple-view.jpg"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10 pointer-events-none"></div>
            <div className="absolute inset-0 flex items-end p-6 z-20 pointer-events-none">
              <h2 className="text-white font-headline-sm font-bold drop-shadow-md">Welcome to शिव अर्धः नारेश्वरी नाग ज्योतिर्लिंग श्री क्षेत्र बिलमाळ (तुलसिगड)</h2>
            </div>
          </div>

          <div className="w-full max-w-[480px] flex flex-col justify-center z-10 shrink-0">
            <div className="w-full">
            <header className="mb-stack-lg text-center stagger-in" style={{ opacity: 1 }}>
              <div className="inline-flex items-center justify-center p-3 bg-white rounded-xl shrine-glow mb-4">
                <span className="material-symbols-outlined text-[40px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                  temple_hindu
                </span>
              </div>
              <h1 className="font-headline-md text-headline-md font-extrabold text-primary tracking-tight">Samarth Darshan Portal</h1>
              <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest mt-1">Temple Management System</p>
            </header>

            <div className="bg-surface-container-lowest p-8 md:p-10 rounded-lg shrine-glow border border-outline-variant/30 stagger-in" style={{ opacity: 1 }}>
              {view === 'mobile' && (
                <div>
                  <h2 className="font-headline-md text-headline-md text-on-surface mb-6">Welcome to शिव अर्धः नारेश्वरी नाग ज्योतिर्लिंग श्री क्षेत्र बिलमाळ (तुलसिगड)</h2>
                  
                  {/* Role Selection Segmented Control */}
                  <div className="flex p-1 bg-surface-container-high rounded-lg mb-6">
                    <button 
                      className={`flex-1 py-2 font-label-md text-[13px] font-bold rounded-md transition-all ${role === 'user' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
                      onClick={() => setRole('user')}
                    >
                      User
                    </button>
                    <button 
                      className={`flex-1 py-2 font-label-md text-[13px] font-bold rounded-md transition-all ${role === 'committee' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
                      onClick={() => setRole('committee')}
                    >
                      Committee Member
                    </button>
                    <button 
                      className={`flex-1 py-2 font-label-md text-[13px] font-bold rounded-md transition-all ${role === 'admin' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
                      onClick={() => setRole('admin')}
                    >
                      Admin
                    </button>
                  </div>

                  {/* Login Method Segmented Control */}
                  <div className="flex p-1 bg-surface-container/50 rounded-lg mb-6 border border-outline-variant/30">
                    <button 
                      type="button"
                      className={`flex-1 py-1.5 font-label-md text-xs font-bold rounded-md transition-all ${loginMethod === 'mobile' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
                      onClick={() => setLoginMethod('mobile')}
                    >
                      Mobile Number
                    </button>
                    <button 
                      type="button"
                      className={`flex-1 py-1.5 font-label-md text-xs font-bold rounded-md transition-all ${loginMethod === 'email' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
                      onClick={() => setLoginMethod('email')}
                    >
                      Email Address
                    </button>
                  </div>

                  {loginMethod === 'mobile' ? (
                    <>
                      <p className="font-body-md text-body-md text-on-surface-variant mb-6">Enter your mobile number to login or create your account instantly.</p>
                      
                      <div className="space-y-6">
                        <div className="group">
                          <label className="block font-label-md text-label-md text-on-surface mb-2 ml-1" htmlFor="mobile">Mobile Number</label>
                          <div className="relative flex items-center">
                            <div className="absolute left-4 flex items-center gap-2 pr-3 border-r border-outline-variant/50">
                              <span className="text-on-surface font-semibold text-body-md">+91</span>
                              <span className="material-symbols-outlined text-[18px] text-on-surface-variant">keyboard_arrow_down</span>
                            </div>
                            <input 
                              className="w-full pl-24 pr-4 py-4 rounded-lg bg-surface border-outline-variant/50 border focus:border-primary focus:ring-4 focus:ring-primary-container/20 transition-all font-body-lg text-body-lg tracking-wider" 
                              id="mobile" 
                              maxLength="10" 
                              placeholder="98765 43210" 
                              type="tel"
                              value={mobileNumber}
                              onChange={(e) => setMobileNumber(e.target.value)}
                            />
                          </div>
                        </div>
                        
                        <button 
                          className="w-full py-4 bg-primary hover:bg-on-primary-fixed-variant text-white font-bold rounded-lg transition-all transform active:scale-[0.98] shadow-lg shadow-primary/20 flex items-center justify-center gap-2" 
                          onClick={handleMobileSubmit}
                        >
                          <span>Send OTP</span>
                          <span className="material-symbols-outlined">arrow_forward</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <form onSubmit={handleEmailSubmit} className="space-y-6">
                      <p className="font-body-md text-body-md text-on-surface-variant mb-6">Enter your name, email and password to log in or register.</p>
                      
                      <div className="group">
                        <label className="block font-label-md text-label-md text-on-surface mb-2 ml-1" htmlFor="name">Full Name</label>
                        <input 
                          className="w-full px-4 py-4 rounded-lg bg-surface border-outline-variant/50 border focus:border-primary focus:ring-4 focus:ring-primary-container/20 transition-all font-body-lg text-body-lg tracking-normal" 
                          id="name" 
                          placeholder="Your Name" 
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          required
                        />
                      </div>
                      
                      <div className="group">
                        <label className="block font-label-md text-label-md text-on-surface mb-2 ml-1" htmlFor="email">Email Address</label>
                        <input 
                          className="w-full px-4 py-4 rounded-lg bg-surface border-outline-variant/50 border focus:border-primary focus:ring-4 focus:ring-primary-container/20 transition-all font-body-lg text-body-lg tracking-normal" 
                          id="email" 
                          placeholder="yourname@example.com" 
                          type="email"
                          value={emailAddress}
                          onChange={(e) => setEmailAddress(e.target.value)}
                          required
                        />
                      </div>
                      
                      <div className="group">
                        <label className="block font-label-md text-label-md text-on-surface mb-2 ml-1" htmlFor="password">Password</label>
                        <input 
                          className="w-full px-4 py-4 rounded-lg bg-surface border-outline-variant/50 border focus:border-primary focus:ring-4 focus:ring-primary-container/20 transition-all font-body-lg text-body-lg tracking-normal" 
                          id="password" 
                          placeholder="••••••••" 
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>
                      
                      <button 
                        type="submit"
                        className="w-full py-4 bg-primary hover:bg-on-primary-fixed-variant text-white font-bold rounded-lg transition-all transform active:scale-[0.98] shadow-lg shadow-primary/20 flex items-center justify-center gap-2" 
                      >
                        <span>Login</span>
                        <span className="material-symbols-outlined">login</span>
                      </button>
                    </form>
                  )}

                  {/* Google Login Options */}
                  <div className="flex items-center my-6">
                    <div className="flex-grow border-t border-outline-variant/30"></div>
                    <span className="mx-4 text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest">Or continue with</span>
                    <div className="flex-grow border-t border-outline-variant/30"></div>
                  </div>

                  <button 
                    type="button" 
                    onClick={handleGoogleLogin}
                    className="w-full py-3.5 border border-outline-variant/50 hover:bg-surface-container-low text-on-surface font-bold rounded-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-3 shadow-sm hover:shadow-md"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Google</span>
                  </button>
                </div>
              )}

              {view === 'otp' && (
                <div>
                  <button 
                    className="mb-6 flex items-center text-primary font-bold gap-1 hover:underline transition-all" 
                    onClick={() => setView('mobile')}
                  >
                    <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                    <span className="font-label-md">Change Number</span>
                  </button>
                  
                  <h2 className="font-headline-md text-headline-md text-on-surface mb-2">Verify OTP</h2>
                  <p className="font-body-md text-body-md text-on-surface-variant mb-8">
                    We've sent a 6-digit code to <span className="text-on-surface font-bold">+91 {mobileNumber || '98765 43210'}</span>
                  </p>
                  
                  <div className="space-y-8">
                    <div className="flex justify-between gap-2 md:gap-3">
                      {otp.map((digit, index) => (
                        <input 
                          key={index}
                          ref={otpRefs[index]}
                          className="otp-input w-12 h-14 md:w-14 md:h-16 text-center text-headline-md font-bold rounded-lg border border-outline-variant/50 bg-surface text-on-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" 
                          maxLength="1" 
                          type="text"
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        />
                      ))}
                    </div>
                    
                    <div className="text-center">
                      <p className="font-label-md text-label-md text-on-surface-variant">Didn't receive the code?</p>
                      <button className="text-primary font-bold hover:underline mt-1">Resend OTP in 00:45</button>
                    </div>
                    
                    <button 
                      onClick={handleVerifyOtp}
                      className="w-full py-4 bg-primary hover:bg-on-primary-fixed-variant text-white font-bold rounded-lg transition-all transform active:scale-[0.98] shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                    >
                      <span>Verify & Continue</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-outline-variant/20">
                <p className="text-center font-label-sm text-label-sm text-on-surface-variant leading-relaxed">
                  By continuing, you agree to our <a className="text-primary hover:underline font-bold" href="#">Terms of Service</a> and <a className="text-primary hover:underline font-bold" href="#">Privacy Policy</a>. OTP will be sent for verification.
                </p>
              </div>
            </div>

            <div className="mt-8 text-center stagger-in" style={{ opacity: 1 }}>
              <Link className="inline-flex items-center gap-2 text-secondary font-bold hover:text-primary transition-colors py-2 px-4 rounded-full border border-secondary/20 hover:bg-primary/5" to="/">
                <span className="material-symbols-outlined text-[20px]">home</span>
                <span className="font-label-md">Back to Home</span>
              </Link>
            </div>
          </div>
        </div>
        </div>
      </main>
      
      <footer className="w-full py-stack-md px-container-mobile flex flex-col md:flex-row justify-between items-center gap-stack-sm bg-surface-container-low dark:bg-surface-container-lowest border-t border-outline-variant/10">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[20px]">shield</span>
          <span className="font-label-sm text-on-surface-variant text-label-sm">&nbsp; &nbsp; &nbsp; &nbsp;Secure 256-bit Encrypted Session</span>
        </div>
        <p className="font-label-sm text-label-sm text-on-surface-variant">© 2024 Samarth Darshan Portal. All rights reserved.</p>
        <div className="flex gap-4">
          <a className="text-on-surface-variant hover:text-primary transition-colors font-label-sm text-label-sm" href="#">Support</a>
          <a className="text-on-surface-variant hover:text-primary transition-colors font-label-sm text-label-sm" href="#">Terms</a>
        </div>
      </footer>
    </div>
  );
}
