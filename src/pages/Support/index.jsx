import React, { useState, useEffect } from 'react';
import { useUser } from '../../context/UserContext';

export default function Support() {
  const { user } = useUser();
  const [formData, setFormData] = useState({
    fullName: '',
    mobileNumber: '',
    email: '',
    subject: '',
    message: ''
  });
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [templeName, setTempleName] = useState('शिव अर्धः नारेश्वरी नाग ज्योतिर्लिंग श्री क्षेत्र बिलमाळ (तुलसिगड)');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.fullName || '',
        mobileNumber: user.mobileNumber || '',
        email: user.email || ''
      }));
      fetchRequests();
      
      const intervalId = setInterval(() => {
        fetchRequests();
      }, 5000);
      
      return () => clearInterval(intervalId);
    }
  }, [user]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${API_URL}/settings`);
        if (res.ok) {
          const data = await res.json();
          if (data.templeName) {
            setTempleName(data.templeName);
          }
        }
      } catch (err) {
        console.error('Failed to fetch settings', err);
      }
    };
    fetchSettings();
  }, [API_URL]);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch(`${API_URL}/support/user`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch (err) {
      console.error('Failed to fetch requests', err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json'
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_URL}/support`, {
        method: 'POST',
        headers,
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        const data = await res.json();
        setSuccessMsg(`Your support request has been submitted successfully. Ticket ID: ${data.ticketId}`);
        setFormData({
          fullName: user?.fullName || '',
          mobileNumber: user?.mobileNumber || '',
          email: user?.email || '',
          subject: '',
          message: ''
        });
        if (token) fetchRequests();
      } else {
        setErrorMsg('Failed to submit support request. Please try again.');
      }
    } catch (err) {
      setErrorMsg('An error occurred. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Open':
        return <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-semibold border border-orange-200">Open</span>;
      case 'In Progress':
        return <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold border border-blue-200">In Progress</span>;
      case 'Resolved':
        return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold border border-green-200">Resolved</span>;
      case 'Closed':
        return <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold border border-gray-300">Closed</span>;
      default:
        return <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold border border-gray-200">{status}</span>;
    }
  };

  return (
    <main className="pt-8 pb-12 px-4 md:px-10 max-w-[1280px] mx-auto w-full">
      <div className="mb-12">
        <h1 className="text-3xl md:text-5xl font-bold text-primary mb-2">Support & Contact</h1>
        <p className="text-base text-on-surface-variant">Get help and contact the temple administration.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Temple Info & Form */}
        <div className="lg:col-span-5 space-y-8">
          <section className="bg-white rounded-xl p-8 shadow-[0_4px_20px_rgba(152,67,0,0.08)] border border-[rgba(86,67,57,0.05)]">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-primary">
              <span className="material-symbols-outlined">info</span>
              Temple Information
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-on-surface-variant mt-1">account_balance</span>
                <div>
                  <p className="font-semibold text-on-surface break-words whitespace-normal">{templeName}</p>
                  <p className="text-sm text-on-surface-variant">Pandharpur, Maharashtra 413304</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-on-surface-variant mt-1">call</span>
                <div>
                  <p className="font-semibold text-on-surface">Support Phone</p>
                  <p className="text-sm text-on-surface-variant">+91 12345 67890</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-on-surface-variant mt-1">mail</span>
                <div>
                  <p className="font-semibold text-on-surface">Email Address</p>
                  <p className="text-sm text-on-surface-variant">support@smartdarshan.com</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-on-surface-variant mt-1">schedule</span>
                <div>
                  <p className="font-semibold text-on-surface">Office Hours</p>
                  <p className="text-sm text-on-surface-variant">Mon - Sun: 6:00 AM - 9:00 PM</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-on-surface-variant mt-1">map</span>
                <a href="https://maps.google.com" target="_blank" rel="noreferrer" className="text-primary hover:underline text-sm font-semibold mt-1">
                  View on Google Maps
                </a>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Contact Form & History */}
        <div className="lg:col-span-7 space-y-8">
          <section className="bg-white rounded-xl p-8 shadow-[0_4px_20px_rgba(152,67,0,0.08)] border border-[rgba(86,67,57,0.05)]">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-primary">
              <span className="material-symbols-outlined">support_agent</span>
              Submit a Request
            </h2>
            
            {successMsg && (
              <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-6 flex items-start gap-3 border border-green-200">
                <span className="material-symbols-outlined text-green-500">check_circle</span>
                <p className="text-sm font-medium">{successMsg}</p>
              </div>
            )}
            
            {errorMsg && (
              <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 flex items-start gap-3 border border-red-200">
                <span className="material-symbols-outlined text-red-500">error</span>
                <p className="text-sm font-medium">{errorMsg}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-on-surface-variant">Full Name *</label>
                  <input 
                    required
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white rounded-lg border border-outline-variant text-on-surface outline-none focus:border-primary"
                    placeholder="Enter your name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-on-surface-variant">Mobile Number</label>
                  <input 
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white rounded-lg border border-outline-variant text-on-surface outline-none focus:border-primary"
                    placeholder="Enter mobile number"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-on-surface-variant">Email Address *</label>
                <input 
                  required
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white rounded-lg border border-outline-variant text-on-surface outline-none focus:border-primary"
                  placeholder="Enter your email"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-on-surface-variant">Subject *</label>
                <input 
                  required
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white rounded-lg border border-outline-variant text-on-surface outline-none focus:border-primary"
                  placeholder="Brief subject of your request"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-on-surface-variant">Message *</label>
                <textarea 
                  required
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 bg-white rounded-lg border border-outline-variant text-on-surface outline-none focus:border-primary resize-none"
                  placeholder="Describe your issue or question in detail..."
                />
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="w-full md:w-auto px-8 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-container transition-colors shadow-sm active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting...' : 'Submit Request'}
              </button>
            </form>
          </section>

          {user && (
            <section className="bg-white rounded-xl p-8 shadow-[0_4px_20px_rgba(152,67,0,0.08)] border border-[rgba(86,67,57,0.05)]">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-primary">
                <span className="material-symbols-outlined">history</span>
                Your Support Requests
              </h2>
              
              {requests.length === 0 ? (
                <div className="text-center py-8 text-on-surface-variant">
                  <span className="material-symbols-outlined text-4xl mb-2 opacity-50">inbox</span>
                  <p>You haven't submitted any support requests yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {requests.map(req => (
                    <div key={req._id} className="border border-outline-variant rounded-lg p-5 hover:bg-surface-container-lowest transition-colors">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-bold font-mono">
                              {req.ticketId}
                            </span>
                            <h3 className="font-semibold text-on-surface text-lg">{req.subject}</h3>
                          </div>
                          <p className="text-xs text-on-surface-variant">Submitted on {new Date(req.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                          {getStatusBadge(req.status)}
                        </div>
                      </div>
                      <div className="text-sm text-on-surface mb-3 whitespace-pre-wrap bg-surface-container-low p-3 rounded-md">
                        {req.message}
                      </div>
                      {req.adminReply && (
                        <div className="mt-4 border-t border-outline-variant pt-4">
                          <p className="text-xs font-bold text-primary mb-1 uppercase tracking-wider flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">admin_panel_settings</span>
                            Admin Reply
                          </p>
                          <div className="text-sm text-on-surface bg-primary/5 p-3 rounded-md border-l-4 border-primary">
                            {req.adminReply}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
