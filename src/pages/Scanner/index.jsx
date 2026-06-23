import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useUser } from '../../context/UserContext';
import jsQR from 'jsqr';

export default function Scanner() {
  const { t } = useLanguage();
  const { user } = useUser();
  const { counterId } = useParams();
  const context = useOutletContext();
  const showToast = context && context.showToast ? context.showToast : (msg) => alert(msg);

  // Dynamic titles/subtitles based on counterId
  let pageTitle = t('qrScannerTitle') || 'QR Scanner & Visitor Verification';
  let pageSubtitle = t('qrScannerSubtitle') || 'Scan devotee QR codes for instant darshan verification and real-time entry tracking.';

  if (counterId === '1') {
    pageTitle = 'Counter 1 – Temple Entry';
    pageSubtitle = 'Scan QR Code or Enter Token Number to verify devotee entry into the temple.';
  } else if (counterId === '2') {
    pageTitle = 'Counter 2 – Queue Management';
    pageSubtitle = 'Scan QR Code or Enter Token Number to mark devotee in queue.';
  } else if (counterId === '3') {
    pageTitle = 'Counter 3 – Darshan Completion';
    pageSubtitle = 'Scan QR Code or Enter Token Number to mark devotee darshan as completed.';
  }

  // Search input states
  const [searchToken, setSearchToken] = useState('');
  const [searchMobile, setSearchMobile] = useState('');
  const [searchVehicle, setSearchVehicle] = useState('');

  // Scanned devotee details state
  const [scannedDevotee, setScannedDevotee] = useState(null);

  // Camera state management
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isLoadingCamera, setIsLoadingCamera] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' (back) or 'user' (front)

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const activeStreamRef = useRef(null);
  const scanFrameRef = useRef(null);
  const lastScanTimeRef = useRef(0);

  // Dynamic recent scans list state
  const [recentScansList, setRecentScansList] = useState([
    { name: 'Anjali Sharma', persons: 4, gate: 'Gate 2', time: '09:42 AM', status: 'Verified' },
    { name: 'Vikram Mehta', persons: 1, gate: 'VIP Entry', time: '09:38 AM', status: 'Completed' },
    { name: 'Sunita Deshpande', persons: 2, gate: 'Gate 1', time: '09:35 AM', status: 'Waiting' },
    { name: 'Amit Patel', persons: 5, gate: 'Parking A', time: '09:31 AM', status: 'Verified' }
  ]);

  // Trigger scanner verification route
  const triggerVerification = async (queryVal) => {
    if (!queryVal || !queryVal.trim()) return;
    try {
      const res = await fetch('http://localhost:5000/api/bookings/verify-scanner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: queryVal.trim(),
          counterNumber: counterId ? parseInt(counterId) : undefined
        })
      });
      const data = await res.json();
      if (res.ok) {
        setScannedDevotee(data.booking);
        showToast(data.message);

        // Add to recent scans
        const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const statusMap = {
          'verified_entry': 'Verified',
          'in_queue': 'In Queue',
          'completed': 'Completed'
        };
        const newScan = {
          name: data.booking.fullName,
          persons: data.booking.persons,
          time: nowTime,
          status: statusMap[data.booking.verificationStatus] || 'Verified',
          gate: data.booking.gateNo || 'Gate 1'
        };
        setRecentScansList(prev => [newScan, ...prev.slice(0, 4)]);
      } else {
        setScannedDevotee(null); // Clear previous visitor data if search/validation fails
        showToast(data.error || 'Verification failed.');
      }
    } catch (err) {
      console.error(err);
      setScannedDevotee(null);
      showToast('Server Error during verification.');
    }
  };

  const handleCounterAction = async (counterNum) => {
    if (!scannedDevotee) return;
    try {
      console.log(`[Scanner] Sending counter action ${counterNum} for booking:`, scannedDevotee._id);
      const res = await fetch('http://localhost:5000/api/bookings/verify-scanner/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: scannedDevotee._id,
          counterNumber: counterNum,
          staffName: user?.fullName || 'Staff Member'
        })
      });
      const data = await res.json();
      if (res.ok) {
        setScannedDevotee(null); // Clear details for the next visitor
        setSearchToken('');
        setSearchMobile('');
        setSearchVehicle('');
        showToast(data.message);

        // Add to recent scans
        const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const statusMap = {
          'verified_entry': 'Verified',
          'in_queue': 'In Queue',
          'completed': 'Completed'
        };
        const newScan = {
          name: data.booking.fullName,
          persons: data.booking.persons,
          time: nowTime,
          status: statusMap[data.booking.verificationStatus] || 'Verified',
          gate: data.booking.gateNo || 'Gate 1'
        };
        setRecentScansList(prev => [newScan, ...prev.slice(0, 4)]);
      } else {
        showToast(data.error || 'Failed to update counter status.');
      }
    } catch (err) {
      console.error(err);
      showToast('Error sending counter action.');
    }
  };

  // Start video stream from camera
  const startCamera = async (mode = facingMode) => {
    setIsLoadingCamera(true);
    setCameraError(null);

    // Stop any existing stream
    if (activeStreamRef.current) {
      activeStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (scanFrameRef.current) {
      cancelAnimationFrame(scanFrameRef.current);
    }

    try {
      // Camera access requires HTTPS or localhost in modern browsers
      const constraints = {
        video: { 
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      activeStreamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true"); // required for iOS Safari
        await videoRef.current.play();
        setIsCameraActive(true);
        startScanningLoop();
      }
    } catch (err) {
      console.error("Camera access failed:", err);
      let errorMsg = "Camera access denied or device unavailable.";
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMsg = "Camera permission denied. Please allow camera access in browser settings.";
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMsg = "No camera hardware detected on this device.";
      }
      setCameraError(errorMsg);
      setIsCameraActive(false);
    } finally {
      setIsLoadingCamera(false);
    }
  };

  // Stop camera feed
  const stopCamera = () => {
    if (activeStreamRef.current) {
      activeStreamRef.current.getTracks().forEach(track => track.stop());
      activeStreamRef.current = null;
    }
    if (scanFrameRef.current) {
      cancelAnimationFrame(scanFrameRef.current);
    }
    setIsCameraActive(false);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Toggle front/rear camera
  const handleSwitchCamera = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // jsQR real-time processing loop
  const startScanningLoop = () => {
    const scanFrame = () => {
      if (!videoRef.current || videoRef.current.paused || videoRef.current.ended) {
        scanFrameRef.current = requestAnimationFrame(scanFrame);
        return;
      }

      if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          canvas.width = videoRef.current.videoWidth;
          canvas.height = videoRef.current.videoHeight;
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

          try {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: "dontInvert",
            });

            if (code && code.data) {
              const now = Date.now();
              // Prevent duplicate scanning triggers within a 3-second cooldown window
              if (now - lastScanTimeRef.current > 3000) {
                console.log("QR Code decoded:", code.data);
                triggerVerification(code.data);
                lastScanTimeRef.current = now;
              }
            }
          } catch (e) {
            console.error("Canvas read error:", e);
          }
        }
      }
      scanFrameRef.current = requestAnimationFrame(scanFrame);
    };
    scanFrameRef.current = requestAnimationFrame(scanFrame);
  };

  // Automatically start camera on mount and clean up on unmount
  useEffect(() => {
    startCamera('environment');

    return () => {
      if (activeStreamRef.current) {
        activeStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (scanFrameRef.current) {
        cancelAnimationFrame(scanFrameRef.current);
      }
    };
  }, []);

  const handleManualSearch = (e) => {
    e.preventDefault();
    if (searchToken.trim()) {
      triggerVerification(searchToken);
      setSearchToken('');
    } else if (searchMobile.trim()) {
      triggerVerification(searchMobile);
      setSearchMobile('');
    } else if (searchVehicle.trim()) {
      triggerVerification(searchVehicle);
      setSearchVehicle('');
    } else {
      showToast('Please enter at least one field to search.');
    }
  };

  const handleScanQrSimulated = () => {
    const queryVal = prompt("Simulate QR Code Scan: Please scan / enter the QR Code payload (or Booking ID):");
    if (queryVal && queryVal.trim()) {
      triggerVerification(queryVal);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full pb-20">
      {/* Page Header */}
      <section className="flex flex-col gap-1">
        <h2 className="text-2xl md:text-3xl font-bold text-on-surface">{pageTitle}</h2>
        <p className="text-on-surface-variant text-base max-w-2xl">{pageSubtitle}</p>
      </section>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Scanner & Manual Entry */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Scanner Card */}
          <div className="bg-white border border-outline-variant rounded-xl p-6 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-on-surface">{t('liveScanner')}</h3>
              <span className="flex items-center gap-2 text-xs font-semibold text-tertiary px-3 py-1 bg-tertiary/10 rounded-full">
                <span className={`w-2 h-2 rounded-full ${isCameraActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                {isCameraActive ? t('cameraActive') : 'Camera Stopped'}
              </span>
            </div>
            
            <div className="relative overflow-hidden bg-inverse-surface rounded-xl aspect-video md:aspect-[16/10] flex flex-col items-center justify-center border-4 border-surface-container">
              
              {/* Dynamic Camera Feed / Video Element */}
              <video 
                ref={videoRef}
                className={`absolute inset-0 w-full h-full object-cover z-0 ${isCameraActive ? 'block' : 'hidden'}`}
                playsInline
                muted
              />

              {/* Hidden Canvas for QR processing */}
              <canvas ref={canvasRef} className="hidden" />

              {/* Scanner Animation Line overlay */}
              {isCameraActive && (
                <div 
                  className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent left-0 z-10"
                  style={{
                    animation: 'scan 3s infinite linear',
                  }}
                ></div>
              )}
              <style dangerouslySetInnerHTML={{__html: `
                @keyframes scan {
                  0% { top: 0; }
                  50% { top: 100%; }
                  100% { top: 0; }
                }
              `}} />

              {/* Spinner/Loading State */}
              {isLoadingCamera && (
                <div className="absolute inset-0 flex items-center justify-center bg-inverse-surface/85 text-white z-20">
                  <div className="flex flex-col items-center gap-2">
                    <span className="material-symbols-outlined animate-spin text-3xl">sync</span>
                    <p className="text-sm font-semibold">Starting camera feed...</p>
                  </div>
                </div>
              )}

              {/* Camera Access Error / Inactive States */}
              {!isCameraActive && !isLoadingCamera && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-inverse-surface/90 text-white p-6 z-20 text-center gap-4">
                  {cameraError ? (
                    <>
                      <span className="material-symbols-outlined text-4xl text-error">videocam_off</span>
                      <p className="text-sm font-semibold max-w-sm text-red-400">{cameraError}</p>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-4xl text-primary/60">photo_camera</span>
                      <p className="text-sm font-semibold">Camera scanner is stopped.</p>
                    </>
                  )}
                  
                  <div className="flex flex-wrap gap-3 justify-center">
                    <button 
                      onClick={() => startCamera(facingMode)}
                      className="px-6 py-2.5 bg-primary text-on-primary rounded-full font-bold shadow-md hover:scale-[1.02] transition-all text-xs"
                    >
                      Start Camera
                    </button>
                    
                    <button 
                      onClick={handleScanQrSimulated}
                      className="px-6 py-2.5 bg-surface-container-highest text-on-surface font-bold rounded-full shadow-md hover:scale-[1.02] transition-all text-xs"
                    >
                      Simulate QR Scan
                    </button>
                  </div>
                </div>
              )}

              {/* Video control overlays */}
              {isCameraActive && (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3 z-30">
                  <button 
                    onClick={handleSwitchCamera}
                    className="px-4 py-2 bg-black/60 backdrop-blur-md text-white rounded-full text-xs font-bold flex items-center gap-1.5 hover:bg-black/80 transition-colors shadow"
                  >
                    <span className="material-symbols-outlined text-sm">switch_camera</span>
                    Switch Camera
                  </button>
                  <button 
                    onClick={stopCamera}
                    className="px-4 py-2 bg-black/60 backdrop-blur-md text-white rounded-full text-xs font-bold flex items-center gap-1.5 hover:bg-black/80 transition-colors shadow"
                  >
                    <span className="material-symbols-outlined text-sm">videocam_off</span>
                    Stop Camera
                  </button>
                  <button 
                    onClick={handleScanQrSimulated}
                    className="px-4 py-2 bg-black/60 backdrop-blur-md text-white rounded-full text-xs font-bold flex items-center gap-1.5 hover:bg-black/80 transition-colors shadow"
                  >
                    <span className="material-symbols-outlined text-sm">construction</span>
                    Simulate Scan
                  </button>
                </div>
              )}
            </div>

            {/* Manual Search Forms */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-on-surface-variant">{t('tokenNumber')}</label>
                <input 
                  className="px-4 py-2 border border-outline-variant rounded-lg bg-surface focus:border-primary outline-none transition-all" 
                  placeholder="T-5421" 
                  type="text" 
                  value={searchToken}
                  onChange={(e) => setSearchToken(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-on-surface-variant">{t('mobileNumber')}</label>
                <input 
                  className="px-4 py-2 border border-outline-variant rounded-lg bg-surface focus:border-primary outline-none transition-all" 
                  placeholder="+91 987..." 
                  type="tel" 
                  value={searchMobile}
                  onChange={(e) => setSearchMobile(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-on-surface-variant">{t('vehicleNumber')}</label>
                <input 
                  className="px-4 py-2 border border-outline-variant rounded-lg bg-surface focus:border-primary outline-none transition-all" 
                  placeholder="MH12 AB..." 
                  type="text" 
                  value={searchVehicle}
                  onChange={(e) => setSearchVehicle(e.target.value)}
                />
              </div>
            </div>
            <button 
              onClick={handleManualSearch}
              className="w-full mt-4 py-3 border border-primary text-primary font-bold rounded-lg hover:bg-primary/5 transition-colors"
            >
              {t('manualSearch')}
            </button>
          </div>

          {/* Verification Result Card */}
          {/* Verification Result Card */}
          {scannedDevotee ? (
            <div className="bg-white border-t-4 border-t-primary border-x border-b border-outline-variant rounded-xl p-6 shadow-md animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex gap-4">
                  <div className="h-16 w-16 rounded-xl overflow-hidden bg-surface-container shrink-0">
                    <img className="w-full h-full object-cover" alt="Devotee" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB4ZJvo6PMpOnAOfd5dJm8L6GSge3a9_Y7scJw3BMWOSimBGR-csaju_9rtYY1-TfK5hBYwSGIncGqgfxunq5d7c2lUshReI54VJQzTaCdEbAoOepYm-IqEKPWm-m2P3iDgpggDGAJKq2iD02FE7CjBen6F7_SK9ToNbcoINCDRIdPYcU1lIxBSgmpCTFEF3_iq4GgirKcexbLIVe4VKhNtYexhMNQ28tfVn0AIYyBqBnVigsUTBdfvw54GHffnx1v6x4jWs99H_Bo" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-on-surface">{scannedDevotee.fullName}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="bg-primary-container text-on-primary-container px-2 py-0.5 rounded text-xs font-semibold">{t('familyPass')}</span>
                      <span className="text-on-surface-variant text-sm font-semibold">{t('tokenNumber') || 'Token'}: #{scannedDevotee.tokenNumber || 'N/A'}</span>
                    </div>
                  </div>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-on-surface-variant text-xs font-semibold uppercase">{t('bookingTime')}</p>
                  <p className="font-bold text-on-surface">{new Date(scannedDevotee.darshanDate).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6 p-4 bg-surface-container-low rounded-lg">
                <div>
                  <p className="text-xs text-on-surface-variant">{t('phone') || 'Mobile Number'}</p>
                  <p className="font-bold text-on-surface">{scannedDevotee.mobile}</p>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant">Token Number</p>
                  <p className="font-bold text-on-surface">{scannedDevotee.tokenNumber || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant">QR Code</p>
                  <p className="font-bold text-on-surface select-all text-xs break-all">{scannedDevotee.qrCode || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant">Place / City / Village</p>
                  <p className="font-bold text-on-surface">{scannedDevotee.placeCity || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant">{t('vehicleType') || 'Vehicle Type'}</p>
                  <p className="font-bold text-on-surface capitalize">{(scannedDevotee.vehicleType || 'none').replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant">{t('vehicle') || 'Vehicle Number'}</p>
                  <p className="font-bold text-on-surface">{scannedDevotee.vehicleNumber || 'None'}</p>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant">{t('members') || 'Number of Persons'}</p>
                  <p className="font-bold text-on-surface">{scannedDevotee.persons}</p>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant">Current Status</p>
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold uppercase mt-1 ${
                    scannedDevotee.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    scannedDevotee.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    scannedDevotee.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {scannedDevotee.status}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant">Journey Tracker Status</p>
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold uppercase mt-1 ${
                    scannedDevotee.verificationStatus === 'none' ? 'bg-gray-100 text-gray-800' :
                    scannedDevotee.verificationStatus === 'verified_entry' ? 'bg-purple-100 text-purple-800' :
                    scannedDevotee.verificationStatus === 'in_queue' ? 'bg-orange-100 text-orange-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {(scannedDevotee.verificationStatus || 'none').replace('_', ' ')}
                  </span>
                </div>
                <div className="col-span-2 md:col-span-3">
                  <p className="text-xs text-on-surface-variant">Person Names &amp; Ages</p>
                  <p className="font-semibold text-on-surface text-sm mt-1">
                    {scannedDevotee.visitors && scannedDevotee.visitors.length > 0 ? (
                      <span className="flex flex-wrap gap-2">
                        {scannedDevotee.visitors.map((v, i) => (
                          <span key={i} className="px-2.5 py-1 bg-surface-container rounded-full text-xs font-medium border border-outline-variant text-on-surface">
                            {v.name} ({v.age} yrs)
                          </span>
                        ))}
                      </span>
                    ) : (
                      'No accompanying visitors (Self Only)'
                    )}
                  </p>
                </div>
              </div>

              {/* Counter Journey History Logs */}
              <div className="mt-6 border-t border-outline-variant pt-6">
                <h5 className="text-sm font-bold text-on-surface mb-3 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-base text-primary">history</span>
                  Journey Tracker History
                </h5>
                {scannedDevotee.counterHistory && scannedDevotee.counterHistory.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {scannedDevotee.counterHistory.map((history, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-surface-container-low border border-outline-variant rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                          {history.counterNumber}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-on-surface">
                            Counter {history.counterNumber}: {history.status}
                          </p>
                          <p className="text-[10px] text-on-surface-variant">
                            Updated by: <span className="font-semibold">{history.staffName}</span>
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[10px] text-on-surface-variant font-medium">
                            {new Date(history.timestamp).toLocaleDateString()}
                          </p>
                          <p className="text-xs font-bold text-on-surface">
                            {new Date(history.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-surface-container-low border border-outline-variant border-dashed rounded-lg text-center text-xs text-on-surface-variant">
                    No counter history recorded yet. Use the buttons below to log progress.
                  </div>
                )}
              </div>

              <div className="mt-8 flex flex-wrap gap-4">
                {(!counterId || counterId === '1') && (
                  <button 
                    disabled={scannedDevotee.verificationStatus !== 'none'}
                    onClick={() => handleCounterAction(1)}
                    className={`flex-1 min-w-[140px] py-3 bg-primary text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg hover:brightness-110 active:scale-95 transition-all ${
                      scannedDevotee.verificationStatus !== 'none' ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''
                    }`}
                  >
                    <span className="material-symbols-outlined">verified</span>
                    {t('verifyEntry') || 'Verify Entry'}
                  </button>
                )}
                {(!counterId || counterId === '2') && (
                  <button 
                    disabled={scannedDevotee.verificationStatus !== 'verified_entry'}
                    onClick={() => handleCounterAction(2)}
                    className={`flex-1 min-w-[140px] py-3 border-2 border-secondary text-secondary font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-secondary/5 active:scale-95 transition-all ${
                      scannedDevotee.verificationStatus !== 'verified_entry' ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''
                    }`}
                  >
                    <span className="material-symbols-outlined">hourglass_top</span>
                    {t('markInQueue') || 'Mark In Queue'}
                  </button>
                )}
                {(!counterId || counterId === '3') && (
                  <button 
                    disabled={scannedDevotee.verificationStatus !== 'in_queue'}
                    onClick={() => handleCounterAction(3)}
                    className={`flex-1 min-w-[140px] py-3 border-2 border-outline-variant text-on-surface-variant font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-surface-container-highest active:scale-95 transition-all ${
                      scannedDevotee.verificationStatus !== 'in_queue' ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''
                    }`}
                  >
                    <span className="material-symbols-outlined">check_circle</span>
                    Mark Darshan Completed
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white border border-outline-variant rounded-xl p-8 text-center text-on-surface-variant font-medium">
              <span className="material-symbols-outlined text-5xl text-primary/40 mb-3 block">qr_code_scanner</span>
              Please scan a devotee's QR code or search by Token/Mobile/Vehicle to verify entry status.
            </div>
          )}
        </div>

        {/* Right Column: Stats & Recent History */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border border-outline-variant p-4 rounded-xl hover:-translate-y-1 transition-transform shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <span className="material-symbols-outlined">group</span>
                </div>
                <p className="text-xs font-semibold text-on-surface-variant">{t('totalToday')}</p>
              </div>
              <p className="text-3xl font-bold text-primary">1,284</p>
              <div className="mt-2 h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                <div className="bg-primary h-full w-3/4 rounded-full"></div>
              </div>
            </div>
            <div className="bg-white border border-outline-variant p-4 rounded-xl hover:-translate-y-1 transition-transform shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-tertiary/10 rounded-lg text-tertiary">
                  <span className="material-symbols-outlined">church</span>
                </div>
                <p className="text-xs font-semibold text-on-surface-variant">{t('insideTemple')}</p>
              </div>
              <p className="text-3xl font-bold text-tertiary">412</p>
              <p className="text-[10px] text-tertiary mt-1 font-bold">Capacity: 60%</p>
            </div>
            <div className="bg-white border border-outline-variant p-4 rounded-xl hover:-translate-y-1 transition-transform shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-secondary/10 rounded-lg text-secondary">
                  <span className="material-symbols-outlined">hourglass_empty</span>
                </div>
                <p className="text-xs font-semibold text-on-surface-variant">{t('queueCount')}</p>
              </div>
              <p className="text-3xl font-bold text-secondary">85</p>
              <p className="text-[10px] text-on-surface-variant mt-1">Est. wait: 12 mins</p>
            </div>
            <div className="bg-white border border-outline-variant p-4 rounded-xl hover:-translate-y-1 transition-transform shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-error/10 rounded-lg text-error">
                  <span className="material-symbols-outlined">pending_actions</span>
                </div>
                <p className="text-xs font-semibold text-on-surface-variant">{t('pending')}</p>
              </div>
              <p className="text-3xl font-bold text-error">12</p>
              <p className="text-[10px] text-on-surface-variant mt-1">Requiring assistance</p>
            </div>
          </div>

          {/* Recent Scans List */}
          <div className="bg-white border border-outline-variant rounded-xl flex-1 flex flex-col overflow-hidden shadow-sm">
            <div className="p-6 border-b border-outline-variant flex justify-between items-center">
              <h3 className="text-xl font-bold text-on-surface">{t('recentScans')}</h3>
              <button className="text-primary font-semibold text-sm hover:underline">{t('viewAll')}</button>
            </div>
            <div className="flex-1 overflow-y-auto max-h-[500px]">
              <div className="divide-y divide-outline-variant">
                {recentScansList.map((scan, idx) => (
                  <div key={idx} className="p-4 flex items-center justify-between hover:bg-surface-container-low transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary-container/30 flex items-center justify-center text-secondary">
                        <span className="material-symbols-outlined">person</span>
                      </div>
                      <div>
                        <p className="font-bold text-on-surface text-sm">{scan.name}</p>
                        <p className="text-xs text-on-surface-variant">{scan.persons} {scan.persons === 1 ? 'Person' : 'People'} • {scan.gate}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-on-surface mb-1">{scan.time}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        scan.status === 'Verified' ? 'bg-primary-container/20 text-on-primary-container' :
                        scan.status === 'In Queue' || scan.status === 'Waiting' ? 'bg-surface-variant text-on-surface-variant' :
                        'bg-tertiary-container/20 text-on-tertiary-container'
                      }`}>
                        {scan.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
