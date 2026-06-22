import React, { useEffect, useState } from 'react';
import QRCode from 'react-qr-code';
import { jsPDF } from 'jspdf';
import QRCodeBrowser from 'qrcode';
import { useLanguage } from '../../context/LanguageContext';
import { useUser } from '../../context/UserContext';

export default function MyPass() {
  const { t } = useLanguage();
  const { user } = useUser();
  const [activeBooking, setActiveBooking] = useState(null);
  const [passHistory, setPassHistory] = useState([]);
  const [queueInfo, setQueueInfo] = useState({
    currentServingToken: 'None',
    userTokenNumber: 'N/A',
    position: 0,
    estWait: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!user || (!user.mobile && !user._id)) return;
      try {
        const identifier = user._id || user.mobile;
        const res = await fetch(`http://localhost:5000/api/bookings/user/${identifier}`);
        if (res.ok) {
          const bookings = await res.json();
          const active = bookings.find(b => b.status === 'confirmed');
          const history = bookings.filter(b => b.status !== 'confirmed');
          
          setActiveBooking(active);
          setPassHistory(history);

          // Fetch queue status
          const qRes = await fetch(`http://localhost:5000/api/queue`);
          const queueList = await qRes.json();
          
          const currentServing = queueList.filter(q => q.status === 'serving');
          
          let userToken = null;
          let pos = 0;
          let waitingQueue = queueList.filter(q => q.status === 'waiting');
          if (active) {
              userToken = queueList.find(q => q.bookingId && q.bookingId._id === active._id);
              if (userToken && userToken.status === 'waiting') {
                  pos = waitingQueue.findIndex(q => q._id === userToken._id) + 1;
              }
          }
          
          setQueueInfo({
              currentServingToken: currentServing.length > 0 ? currentServing[0].tokenNumber : 'None',
              userTokenNumber: userToken ? userToken.tokenNumber : 'N/A',
              position: pos,
              estWait: pos * 2,
          });
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
    const timer = setInterval(fetchData, 10000);

    return () => clearInterval(timer);
  }, [user]);

  const downloadPDF = async () => {
    if (!activeBooking) {
      alert("No active booking found to download.");
      return;
    }
    
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      doc.setFontSize(24);
      doc.setTextColor(0, 0, 0);
      doc.text("Sri Meenakshi Temple", 105, 25, { align: "center" });
      
      doc.setFontSize(16);
      doc.setTextColor(100, 100, 100);
      doc.text("Darshan Digital Pass", 105, 35, { align: "center" });
      
      // Generate QR Code
      const qrData = JSON.stringify({ 
        token: queueInfo.userTokenNumber, 
        bookingId: activeBooking._id, 
        name: activeBooking.fullName, 
        mobile: activeBooking.mobile 
      });
      const qrImageURL = await QRCodeBrowser.toDataURL(qrData, { width: 200, margin: 1 });
      
      doc.addImage(qrImageURL, 'PNG', 75, 45, 60, 60);
      
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text(`Token Number: #${queueInfo.userTokenNumber}`, 105, 115, { align: "center" });
      
      // Divider
      doc.setLineWidth(0.5);
      doc.line(20, 125, 190, 125);
      
      // Details
      doc.setFontSize(12);
      const startY = 140;
      const lineHeight = 10;
      
      doc.setFont(undefined, 'bold');
      doc.text("Devotee Name:", 20, startY);
      doc.setFont(undefined, 'normal');
      doc.text(`${activeBooking.fullName || user?.fullName || 'N/A'}`, 60, startY);
      
      doc.setFont(undefined, 'bold');
      doc.text("Mobile Number:", 20, startY + lineHeight * 1);
      doc.setFont(undefined, 'normal');
      doc.text(`${activeBooking.mobile || user?.mobile || 'N/A'}`, 60, startY + lineHeight * 1);
      
      doc.setFont(undefined, 'bold');
      doc.text("Vehicle No:", 20, startY + lineHeight * 2);
      doc.setFont(undefined, 'normal');
      doc.text(`${activeBooking.vehicleNumber || 'None'}`, 60, startY + lineHeight * 2);
      
      doc.setFont(undefined, 'bold');
      doc.text("Vehicle Type:", 20, startY + lineHeight * 3);
      doc.setFont(undefined, 'normal');
      doc.text(`${activeBooking.vehicleType || 'None'}`, 60, startY + lineHeight * 3);
      
      doc.setFont(undefined, 'bold');
      doc.text("Persons:", 20, startY + lineHeight * 4);
      doc.setFont(undefined, 'normal');
      doc.text(`${activeBooking.persons || 1}`, 60, startY + lineHeight * 4);
      
      doc.setFont(undefined, 'bold');
      doc.text("Date & Time:", 20, startY + lineHeight * 5);
      doc.setFont(undefined, 'normal');
      doc.text(`${new Date(activeBooking.darshanDate).toLocaleString()}`, 60, startY + lineHeight * 5);
      
      doc.setFont(undefined, 'bold');
      doc.text("Darshan Status:", 20, startY + lineHeight * 6);
      doc.setFont(undefined, 'normal');
      doc.text(`${(activeBooking.status || 'Active').toUpperCase()}`, 60, startY + lineHeight * 6);
      
      // Footer
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text("Please present this QR code at the temple entry gate.", 105, 280, { align: "center" });
      
      doc.save(`Darshan_Pass_${activeBooking._id}.pdf`);
      alert("Success: Digital pass downloaded successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Error: Failed to generate PDF. Please try again.");
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 md:px-10 py-8 md:py-12 w-full">
      {/* Header Section */}
      <div className="mb-12">
        <h1 className="text-3xl md:text-5xl font-bold text-on-surface mb-2">{t('digitalPass')}</h1>
        <p className="text-on-surface-variant text-base">View and manage your active and previous darshan passes.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        {/* Active Pass Column */}
        <div className="lg:col-span-8 space-y-6 md:space-y-8">
          {/* Premium Ticket Card */}
          <div className="bg-surface-container-lowest rounded-xl premium-ticket-glow overflow-hidden border border-outline/10">
            <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8">
              {/* QR Code Section */}
              <div className="flex flex-col items-center justify-center space-y-4 shrink-0">
                <div className="bg-white p-4 rounded-xl border border-outline-variant shadow-sm w-48 h-48 flex items-center justify-center">
                  <QRCode 
                    value={activeBooking ? JSON.stringify({ token: queueInfo.userTokenNumber, bookingId: activeBooking._id, name: activeBooking.fullName, mobile: activeBooking.mobile }) : '{"token":"NONE"}'} 
                    size={160} 
                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                  />
                </div>
                <span className="bg-primary-container text-on-primary-container px-4 py-1 rounded-full text-xs font-bold">Active Pass</span>
                <div className="text-center">
                  <p className="text-sm text-on-surface-variant font-medium">{t('tokenId')}</p>
                  <p className="text-3xl text-primary font-bold">#{queueInfo.userTokenNumber}</p>
                </div>
              </div>
              
              {/* Ticket Details Section */}
              <div className="flex-grow space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold text-on-surface">Sri Meenakshi Temple</h2>
                    <p className="text-primary font-medium">Main Sanctum Darshan</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-on-surface-variant font-medium">Date & Time</p>
                    <p className="text-base font-bold">{activeBooking ? new Date(activeBooking.darshanDate).toLocaleDateString() : 'N/A'}</p>
                    <p className="text-base text-primary font-bold">{activeBooking ? new Date(activeBooking.darshanDate).toLocaleTimeString() : 'N/A'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                  <div>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-medium">{t('devoteeName')}</p>
                    <p className="text-base font-semibold">{activeBooking ? activeBooking.fullName : (user?.fullName || 'User')}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-medium">Email / Contact</p>
                    <p className="text-base font-semibold">{activeBooking ? activeBooking.mobile : (user?.mobileNumber || user?.mobile || 'N/A')}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-medium">Vehicle No</p>
                    <p className="text-base font-semibold">{activeBooking ? (activeBooking.vehicleNumber || 'None') : 'None'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-medium">{t('persons')}</p>
                    <p className="text-base font-semibold">{activeBooking ? activeBooking.persons : 0} Persons</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-medium">City</p>
                    <p className="text-base font-semibold">{activeBooking ? activeBooking.placeCity : 'N/A'}</p>
                  </div>
                </div>

                <div className="dash-line pt-6 border-t border-dashed border-outline-variant">
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={downloadPDF}
                      className="flex items-center gap-1 bg-primary text-on-primary px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-all shadow-md"
                    >
                      <span className="material-symbols-outlined text-[18px]">download</span>
                      Download PDF
                    </button>
                    <button className="flex items-center gap-1 border-2 border-primary text-primary px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/5 transition-all">
                      <span className="material-symbols-outlined text-[18px]">share</span>
                      Share
                    </button>
                    <button className="flex items-center gap-1 bg-black text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-all shadow-md">
                      <span className="material-symbols-outlined text-[18px]">wallet</span>
                      Add to Wallet
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pass History */}
          <section className="space-y-4">
            <h3 className="text-xl font-semibold text-on-surface">Pass History</h3>
            <div className="bg-surface-container-lowest rounded-xl border border-outline/10 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface-container-low border-b border-outline/10">
                  <tr>
                    <th className="px-6 py-4 text-sm font-medium text-on-surface-variant">Date</th>
                    <th className="px-6 py-4 text-sm font-medium text-on-surface-variant">Temple</th>
                    <th className="px-6 py-4 text-sm font-medium text-on-surface-variant text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline/5">
                  {passHistory.map(pass => (
                    <tr key={pass._id} className="hover:bg-surface-bright transition-colors cursor-pointer group">
                      <td className="px-6 py-4 text-on-surface-variant">{new Date(pass.darshanDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-on-surface">Sri Meenakshi Temple</td>
                      <td className="px-6 py-4 text-right">
                        <span className="bg-on-tertiary-container text-tertiary px-4 py-1 rounded-full text-xs font-bold inline-block capitalize">{pass.status}</span>
                      </td>
                    </tr>
                  ))}
                  {passHistory.length === 0 && (
                    <tr><td colSpan="3" className="px-6 py-4 text-center text-on-surface-variant">No previous passes found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Side Cards Column */}
        <div className="lg:col-span-4 space-y-6 md:space-y-8">
          {/* Queue Info Card */}
          <div className="bg-surface-container-lowest p-6 md:p-8 rounded-xl border border-outline/10 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-primary">groups</span>
              <h3 className="text-xl font-semibold text-on-surface">{t('liveQueue')}</h3>
            </div>
            
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-sm font-medium text-on-surface-variant">{t('currentToken')}</p>
                  <p className="text-3xl font-bold text-on-surface">{queueInfo.currentServingToken}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-on-surface-variant">{t('yourToken')}</p>
                  <p className="text-3xl font-bold text-primary">{queueInfo.userTokenNumber}</p>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="relative h-3 w-full bg-surface-container-high rounded-full overflow-hidden">
                <div className="absolute top-0 left-0 h-full bg-primary transition-all duration-1000" style={{ width: queueInfo.position === 0 ? (queueInfo.userTokenNumber !== 'N/A' ? '100%' : '0%') : `${Math.max(10, 100 - (queueInfo.position * 5))}%` }}></div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-outline/10">
                <div>
                  <p className="text-sm font-medium text-on-surface-variant">{t('queuePosition')}</p>
                  <p className="text-base font-bold text-primary">{queueInfo.position} away</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-on-surface-variant">{t('estWait')}</p>
                  <p className="text-base font-bold text-primary">{queueInfo.estWait} mins</p>
                </div>
              </div>
              
              <div className="bg-primary-fixed text-on-primary-fixed-variant p-4 rounded-lg flex gap-4 items-start">
                <span className="material-symbols-outlined">info</span>
                <p className="text-xs leading-relaxed font-medium">{queueInfo.position === 0 ? "Please proceed to the entry gate immediately. Your token is currently being called." : "Please wait for your token to be called."}</p>
              </div>
            </div>
          </div>

          {/* Temple Info Card */}
          <div className="bg-surface-container-lowest p-6 md:p-8 rounded-xl border border-outline/10 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-primary">location_on</span>
              <h3 className="text-xl font-semibold text-on-surface">Temple Location</h3>
            </div>
            
            <div className="space-y-4">
              <div className="rounded-xl overflow-hidden h-40 relative group cursor-pointer">
                <img 
                  className="w-full h-full object-cover" 
                  alt="Map" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuC5n-uotQottW_pWYMQVIMb0Binv8SC8W3L8bw4otbKMzWFAzGHvKqgflFNMHkVxE5sBzvyAVW8bjg-YilLHmn-_XBWcSeh1rFuMaOGGBvL-GEnRFod1bT5ggMT-k8ZdoxC2ZCREcbenkIbHi1D9TpKa1J-uEIH0KgX3QQUeOdvnjGynMsU8B_idF3eSzisjsw7HXtgRx93u2tufAKC8fXzQ7h3nVPazUDOhrlEiL73Kam6AFUX0urFZheYgLinSjdhbGoOyNnkGOY"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <button className="bg-surface px-4 py-2 rounded-lg text-xs font-semibold shadow-md opacity-0 group-hover:opacity-100 transition-opacity">View Map</button>
                </div>
              </div>
              
              <div>
                <p className="text-base font-semibold text-on-surface">Sri Meenakshi Temple</p>
                <p className="text-xs text-on-surface-variant leading-relaxed font-medium">Madurai Main Rd, Madurai, Tamil Nadu 625001, India</p>
              </div>
              
              <button className="w-full py-3 bg-surface-container border border-outline-variant text-on-surface rounded-xl text-base font-semibold hover:bg-surface-variant transition-colors flex items-center justify-center gap-2">
                <span className="material-symbols-outlined">directions</span>
                Open in Google Maps
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
