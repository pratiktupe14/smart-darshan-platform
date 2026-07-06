import React, { useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';

export default function DonationReceiptModal({ donation, onClose, user }) {
  const { t } = useLanguage();

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    // Prevent background scrolling
    document.body.style.overflow = 'hidden';
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [onClose]);

  if (!donation) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-on-surface/20 backdrop-blur-sm">
      {/* Modal Container */}
      <div className="bg-surface-container-lowest w-full max-w-[720px] rounded-xl overflow-hidden shadow-[0_10px_30px_-5px_rgba(122,32,0,0.15)] border border-outline-variant animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto custom-scrollbar">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-br from-primary to-primary-container p-8 relative">
          <div className="flex justify-between items-start text-on-primary relative z-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1 block">Donation Confirmation</span>
              <h2 className="text-3xl font-serif font-bold">Receipt #{donation.receiptNumber || 'SD-XXXX'}</h2>
            </div>
            <button 
              onClick={onClose}
              className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors text-white flex items-center justify-center"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          {/* Sacred Motif Overlay (CSS based) */}
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none p-4 z-0">
            <span className="material-symbols-outlined text-[120px]" style={{ fontVariationSettings: "'FILL' 1" }}>temple_hindu</span>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-8 space-y-10">
          
          {/* Donor Information Section */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
              <h3 className="text-xl font-bold text-primary">Donor Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Full Name</p>
                <p className="font-bold text-on-surface">{donation.fullName || user?.fullName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Mobile Number</p>
                <p className="font-bold text-on-surface">{donation.mobile || user?.mobileNumber || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Email Address</p>
                <p className="font-bold text-on-surface">{user?.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">PAN Number</p>
                <p className="font-bold text-on-surface">{donation.panNumber || 'Not provided'}</p>
              </div>
            </div>
          </section>
          
          <div className="h-px bg-outline-variant w-full"></div>
          
          {/* Donation Information Section */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>volunteer_activism</span>
              <h3 className="text-xl font-bold text-primary">Donation Information</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
              <div className="bg-surface p-4 rounded-lg border border-outline-variant/30 flex flex-col justify-center">
                <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Amount</p>
                <p className="text-3xl font-serif font-bold text-primary">₹ {donation.amount?.toLocaleString() || '0'}</p>
              </div>
              
              <div className="md:col-span-2 grid grid-cols-2 gap-y-6 gap-x-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Transaction ID</p>
                  <p className="font-bold text-on-surface">{donation._id?.substring(0, 10).toUpperCase() || 'TXN-N/A'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Purpose</p>
                  <p className="font-bold text-on-surface">{donation.purpose || 'General Fund'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Method</p>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-on-surface-variant text-sm">account_balance_wallet</span>
                    <span className="font-bold text-on-surface">{donation.paymentMethod || 'UPI'}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Status</p>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-bold uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
                    {donation.status || 'Confirmed'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex items-center gap-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">Date & Time</p>
                <p className="font-bold text-on-surface">
                  {donation.createdAt 
                    ? new Date(donation.createdAt).toLocaleString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit', hour12: true
                      }) 
                    : 'N/A'}
                </p>
              </div>
            </div>
          </section>

          {/* Action Footer */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end pt-4">
            <button 
              onClick={() => window.print()}
              className="flex-1 sm:flex-none border border-outline text-on-surface-variant px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-surface-container-high transition-colors"
            >
              <span className="material-symbols-outlined">print</span>
              Print
            </button>
            <button className="flex-1 sm:flex-none bg-primary text-white px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined">download</span>
              Download Receipt
            </button>
          </div>
        </div>

        {/* Footer Decorative Element */}
        <div className="h-2 w-full bg-gradient-to-r from-primary to-primary-container opacity-20"></div>
      </div>
    </div>
  );
}
