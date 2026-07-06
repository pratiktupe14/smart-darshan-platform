import React, { useState, useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import { useLanguage } from '../../context/LanguageContext';
import DonationReceiptModal from './DonationReceiptModal';

export default function Donation() {
  const { user } = useUser();
  const { t } = useLanguage();

  const [amount, setAmount] = useState(501);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    mobile: user?.mobileNumber || '',
    email: user?.email || '',
    purpose: 'Temple Maintenance',
    panNumber: '',
    message: ''
  });
  
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [selectedDonation, setSelectedDonation] = useState(null);

  useEffect(() => {
    fetchDonations();
  }, [user]);

  const fetchDonations = async () => {
    if (!user?._id) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/donations/user/${user._id}`);
      if (res.ok) {
        const data = await res.json();
        setDonations(data);
      }
    } catch (err) {
      console.error('Error fetching donations:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDonate = async (e) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    
    setLoading(true);
    setSuccessMsg('');
    
    try {
      const payload = {
        userId: user?._id || 'guest',
        fullName: formData.fullName,
        mobile: formData.mobile,
        amount: amount,
        purpose: formData.purpose,
        panNumber: formData.panNumber,
        paymentMethod: paymentMethod
      };
      
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/donations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        const newDonation = await res.json();
        setSuccessMsg(`Donation successful! Receipt No: ${newDonation.receiptNumber}`);
        fetchDonations(); // Refresh history
      } else {
        alert('Failed to process donation.');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const getAmountButtonClass = (val) => {
    if (amount === val) {
      return "p-6 rounded-2xl border-2 border-primary bg-secondary-container text-on-secondary-container shadow-lg flex flex-col items-center justify-center gap-2 transform scale-105 ring-4 ring-primary/10 transition-all";
    }
    return "p-6 rounded-2xl border border-outline-variant bg-surface-container hover:bg-secondary-container/30 transition-all flex flex-col items-center justify-center gap-2 group cursor-pointer";
  };

  const getPaymentButtonClass = (method) => {
    if (paymentMethod === method) {
      return "p-3 border-2 border-primary bg-secondary-container rounded-xl flex flex-col items-center gap-1 hover:opacity-90 transition-all group";
    }
    return "p-3 border border-outline-variant rounded-xl flex flex-col items-center gap-1 hover:bg-secondary-container/20 transition-all group cursor-pointer";
  };

  return (
    <div className="p-4 md:p-8 bg-surface-container-lowest max-w-7xl mx-auto w-full">
      {/* Hero Section */}
      <section className="relative rounded-2xl overflow-hidden h-80 mb-8 shadow-[0_4px_20px_-5px_rgba(122,32,0,0.1)]">
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCu1DQoAOQ42aCyrnkqKq5F8h4E8-WBZ_g3VVUBBpYEyupo-wslJQsSF9mgQ6Rr-lBeHpuzgGuN_gAnr0WxVv7qiocRHj3U_PgO4VfmrJWvzQBy7Vnggpt6BSF36QwK9eRYvlnuDxwqah8zx101oKyRQZfW3bpigaqiVOHVIWha0X5nYu_F3OrhxOirFWP3988fO12O3F1YUHedkOy_b9QrBO2T9lHH2NfR7yny0h5NF4hFS_m1gg-e')" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-r from-on-primary-container/80 to-transparent flex items-center px-8 md:px-16">
          <div className="max-w-xl text-on-primary">
            <h2 className="text-2xl md:text-5xl font-bold mb-4 font-serif">Support the Temple</h2>
            <p className="text-base mb-8 opacity-90 leading-relaxed">
              Your contribution helps preserve the temple, support daily rituals, festivals, Annadan, and community services. Join us in our sacred mission.
            </p>
          </div>
        </div>
      </section>

      {successMsg && (
        <div className="mb-8 p-4 bg-green-100 text-green-800 rounded-xl border border-green-200 flex items-center gap-2">
          <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
          <span className="font-bold">{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Donation Selection */}
        <div className="lg:col-span-8 space-y-8">
          {/* Quick Donation Cards */}
          <div>
            <h3 className="text-2xl font-semibold text-primary mb-6 font-serif">Choose Offering Amount</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[101, 251, 501, 1001, 5001].map((val) => (
                <button 
                  key={val}
                  onClick={() => setAmount(val)} 
                  className={getAmountButtonClass(val)}
                  type="button"
                >
                  <span className="text-xl font-semibold text-primary">₹{val}</span>
                  {val === 501 && <span className="text-xs font-bold uppercase tracking-wider">Most Popular</span>}
                </button>
              ))}
              <div className="p-6 rounded-2xl border border-outline bg-surface-container-high hover:bg-surface-container-highest transition-all flex flex-col items-center justify-center gap-2 group border-dashed">
                <span className="material-symbols-outlined text-primary">edit</span>
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-transparent border-none text-center text-primary font-semibold p-0 focus:ring-0 mt-1"
                  placeholder="Custom"
                />
              </div>
            </div>
          </div>

          {/* Donation Form */}
          <div className="bg-surface-container-low p-8 rounded-2xl border border-outline-variant/30 shadow-sm">
            <h3 className="text-2xl font-semibold text-primary mb-8 font-serif">Personal Details</h3>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <label className="absolute -top-3 left-4 bg-surface-container-low px-2 text-xs font-bold uppercase tracking-wider text-primary">Full Name</label>
                <input 
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border border-outline rounded-lg p-4 focus:ring-1 focus:ring-primary outline-none text-on-surface" 
                  type="text" 
                />
              </div>
              <div className="relative">
                <label className="absolute -top-3 left-4 bg-surface-container-low px-2 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Mobile Number</label>
                <input 
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border border-outline rounded-lg p-4 focus:ring-1 focus:ring-primary outline-none" 
                  type="tel" 
                />
              </div>
              <div className="relative">
                <label className="absolute -top-3 left-4 bg-surface-container-low px-2 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Email Address</label>
                <input 
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border border-outline rounded-lg p-4 focus:ring-1 focus:ring-primary outline-none" 
                  type="email" 
                />
              </div>
              <div className="relative">
                <label className="absolute -top-3 left-4 bg-surface-container-low px-2 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Purpose of Donation</label>
                <select 
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border border-outline rounded-lg p-4 focus:ring-1 focus:ring-primary outline-none appearance-none"
                >
                  <option>Temple Maintenance</option>
                  <option>Annadan</option>
                  <option>Goshala</option>
                  <option>Festival Fund</option>
                  <option>General Fund</option>
                </select>
              </div>
              <div className="relative md:col-span-2">
                <label className="absolute -top-3 left-4 bg-surface-container-low px-2 text-xs font-bold uppercase tracking-wider text-on-surface-variant">PAN (For Tax Benefit)</label>
                <input 
                  name="panNumber"
                  value={formData.panNumber}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border border-outline rounded-lg p-4 focus:ring-1 focus:ring-primary outline-none" 
                  type="text" 
                />
              </div>
              <div className="relative md:col-span-2">
                <label className="absolute -top-3 left-4 bg-surface-container-low px-2 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Message / Blessing Request</label>
                <textarea 
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  className="w-full bg-transparent border border-outline rounded-lg p-4 focus:ring-1 focus:ring-primary outline-none" 
                  rows="3"
                ></textarea>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Payments & Checkout */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-surface p-6 rounded-2xl border-2 border-outline-variant shadow-xl lg:sticky lg:top-24">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-xl font-semibold text-primary">Summary</h4>
              <span className="bg-orange-100 text-orange-900 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Secure</span>
            </div>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center text-on-surface-variant">
                <span className="text-sm">Donation Amount</span>
                <span className="text-lg font-semibold text-on-surface">₹{amount}.00</span>
              </div>
              <div className="flex justify-between items-center text-on-surface-variant">
                <span className="text-sm">Processing Fee</span>
                <span className="text-sm">₹0.00</span>
              </div>
              <hr className="border-outline-variant" />
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">Total Payable</span>
                <span className="text-3xl font-bold text-primary">₹{amount}.00</span>
              </div>
            </div>
            
            <div className="space-y-4 mb-8">
              <h5 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant border-b border-outline-variant pb-2">PAYMENT METHOD</h5>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setPaymentMethod('UPI')} className={getPaymentButtonClass('UPI')} type="button">
                  <span className="material-symbols-outlined text-primary group-hover:scale-110">qr_code</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider">UPI / QR</span>
                </button>
                <button onClick={() => setPaymentMethod('CARD')} className={getPaymentButtonClass('CARD')} type="button">
                  <span className="material-symbols-outlined text-primary group-hover:scale-110" style={{fontVariationSettings: "'FILL' 1"}}>credit_card</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider">CARD</span>
                </button>
                <button onClick={() => setPaymentMethod('NET BANKING')} className={getPaymentButtonClass('NET BANKING')} type="button">
                  <span className="material-symbols-outlined text-primary group-hover:scale-110">account_balance</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider">NET BANKING</span>
                </button>
                <button onClick={() => setPaymentMethod('WALLET')} className={getPaymentButtonClass('WALLET')} type="button">
                  <span className="material-symbols-outlined text-primary group-hover:scale-110">payments</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider">WALLET</span>
                </button>
              </div>
            </div>
            
            <button 
              onClick={handleDonate}
              disabled={loading}
              className="w-full bg-primary text-white py-4 rounded-full text-lg font-semibold shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all mb-6 disabled:opacity-50"
            >
              {loading ? 'Processing...' : `Proceed to Pay ₹${amount}`}
            </button>
            <div className="flex justify-center items-center gap-4 opacity-50 grayscale hover:grayscale-0 transition-all">
              <span className="material-symbols-outlined text-2xl">verified_user</span>
              <span className="material-symbols-outlined text-2xl">lock</span>
              <span className="material-symbols-outlined text-2xl">security</span>
            </div>
          </div>
        </div>
      </div>

      {/* Donation History Section */}
      <section className="mt-16">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-semibold text-primary font-serif">Your Giving History</h3>
          <button className="text-primary text-xs font-bold uppercase tracking-wider flex items-center gap-2 hover:underline">
            Download All Reports
            <span className="material-symbols-outlined text-sm">download</span>
          </button>
        </div>
        <div className="bg-surface overflow-hidden rounded-2xl border border-outline-variant">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-surface-container-high">
                  <th className="p-4 text-xs font-bold uppercase tracking-wider border-b border-outline-variant">Receipt No</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider border-b border-outline-variant">Date</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider border-b border-outline-variant text-right">Amount</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider border-b border-outline-variant">Purpose</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider border-b border-outline-variant">Status</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider border-b border-outline-variant text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {donations.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-8 text-center text-on-surface-variant">
                      No donations found.
                    </td>
                  </tr>
                ) : (
                  donations.map((d) => (
                    <tr key={d._id} className="hover:bg-surface-container transition-colors border-b border-outline-variant/30 last:border-b-0">
                      <td className="p-4 text-primary font-bold">#{d.receiptNumber}</td>
                      <td className="p-4">{new Date(d.createdAt).toLocaleDateString()}</td>
                      <td className="p-4 text-right">₹{d.amount}.00</td>
                      <td className="p-4">
                        <span className="px-2 py-1 rounded-full bg-orange-100 text-orange-800 text-[10px] font-bold uppercase tracking-wider">
                          {d.purpose}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-green-700">
                          <span className="material-symbols-outlined text-sm" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
                          <span>{d.status}</span>
                        </div>
                      </td>
                      <td className="p-4 text-center space-x-2">
                        <button onClick={() => setSelectedDonation(d)} className="p-2 hover:bg-surface-container-highest rounded-full text-on-surface-variant" title="View">
                          <span className="material-symbols-outlined text-lg">visibility</span>
                        </button>
                        <button className="p-2 hover:bg-surface-container-highest rounded-full text-on-surface-variant" title="Download">
                          <span className="material-symbols-outlined text-lg">download</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
      
      {/* Mobile Sticky Footer Action */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 p-4 bg-surface border-t border-outline-variant z-40 flex items-center justify-between gap-4">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">TOTAL AMOUNT</span>
          <span className="text-xl font-semibold text-primary">₹{amount}.00</span>
        </div>
        <button 
          onClick={handleDonate}
          disabled={loading}
          className="flex-1 bg-primary text-white py-3 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg shadow-primary/20 disabled:opacity-50"
        >
          {loading ? 'PROCESSING...' : 'DONATE NOW'}
        </button>
      </div>

      {selectedDonation && (
        <DonationReceiptModal 
          donation={selectedDonation} 
          user={user} 
          onClose={() => setSelectedDonation(null)} 
        />
      )}
    </div>
  );
}
