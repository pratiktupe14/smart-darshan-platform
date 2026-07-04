import React, { useState, useEffect } from 'react';
import { useUser } from '../../context/UserContext';

export default function AdminSupport() {
  const { user } = useUser();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [status, setStatus] = useState('');
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchRequests();
    
    const intervalId = setInterval(() => {
      fetchRequests();
    }, 5000);
    
    return () => clearInterval(intervalId);
  }, []);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/support/admin`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch (err) {
      console.error('Failed to fetch support requests', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedRequest) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/support/admin/${selectedRequest._id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ status, adminReply: replyText })
      });

      if (res.ok) {
        const updatedReq = await res.json();
        setRequests(requests.map(r => r._id === updatedReq._id ? { ...r, ...updatedReq } : r));
        setSelectedRequest(null);
        setReplyText('');
        setStatus('');
      }
    } catch (err) {
      console.error('Failed to update request', err);
    }
  };

  const openModal = (req) => {
    setSelectedRequest(req);
    setReplyText(req.adminReply || '');
    setStatus(req.status || 'Open');
  };

  const getStatusBadge = (s) => {
    switch (s) {
      case 'Open':
        return <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-semibold border border-orange-200">Open</span>;
      case 'In Progress':
        return <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold border border-blue-200">In Progress</span>;
      case 'Resolved':
        return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold border border-green-200">Resolved</span>;
      case 'Closed':
        return <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold border border-gray-300">Closed</span>;
      default:
        return <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold">{s}</span>;
    }
  };

  const filteredRequests = requests.filter(r => {
    const matchesFilter = filter === 'All' || r.status === filter;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
      (r.ticketId && r.ticketId.toLowerCase().includes(searchLower)) ||
      (r.fullName && r.fullName.toLowerCase().includes(searchLower)) ||
      (r.mobileNumber && r.mobileNumber.toLowerCase().includes(searchLower)) ||
      (r.subject && r.subject.toLowerCase().includes(searchLower));
    
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return <div className="p-8 text-center">Loading support requests...</div>;
  }

  return (
    <div className="p-6 md:p-10 max-w-[1400px] mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">Support Requests</h1>
          <p className="text-on-surface-variant">Manage and respond to user support inquiries.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
            <input 
              type="text" 
              placeholder="Search ID, Name, Subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 border border-outline-variant rounded-lg w-full sm:w-64 focus:border-primary outline-none text-sm"
            />
          </div>
          <div className="flex bg-surface-container-low rounded-lg p-1 border border-outline-variant">
            {['All', 'Open', 'In Progress', 'Resolved', 'Closed'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${filter === f ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-[0_4px_20px_rgba(152,67,0,0.08)] border border-[rgba(86,67,57,0.05)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container-lowest">
                <th className="py-4 px-6 text-sm font-semibold text-on-surface-variant">User Details</th>
                <th className="py-4 px-6 text-sm font-semibold text-on-surface-variant">Subject</th>
                <th className="py-4 px-6 text-sm font-semibold text-on-surface-variant">Date</th>
                <th className="py-4 px-6 text-sm font-semibold text-on-surface-variant">Status</th>
                <th className="py-4 px-6 text-sm font-semibold text-on-surface-variant text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-on-surface-variant">
                    No support requests found.
                  </td>
                </tr>
              ) : (
                filteredRequests.map(req => (
                  <tr key={req._id} className="border-b border-outline-variant/30 hover:bg-surface-container-lowest transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs font-bold font-mono">
                          {req.ticketId}
                        </span>
                        <p className="font-semibold text-on-surface">{req.fullName}</p>
                      </div>
                      <p className="text-xs text-on-surface-variant">{req.email}</p>
                      <p className="text-xs text-on-surface-variant">{req.mobileNumber}</p>
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-semibold text-on-surface max-w-[200px] truncate" title={req.subject}>{req.subject}</p>
                    </td>
                    <td className="py-4 px-6 text-sm text-on-surface-variant">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6">
                      {getStatusBadge(req.status)}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button 
                        onClick={() => openModal(req)}
                        className="text-primary hover:bg-primary/10 px-4 py-2 rounded-lg transition-colors font-semibold text-sm border border-primary/20"
                      >
                        View & Reply
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for replying */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-lowest rounded-t-2xl">
              <h2 className="text-xl font-bold text-primary">Respond to Request</h2>
              <button 
                onClick={() => setSelectedRequest(null)}
                className="text-on-surface-variant hover:text-error transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">User Info</p>
                  <p className="font-medium text-on-surface">{selectedRequest.fullName}</p>
                  <p className="text-sm text-on-surface-variant">{selectedRequest.email} | {selectedRequest.mobileNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">Date & Ticket ID</p>
                  <p className="font-medium text-on-surface">{new Date(selectedRequest.createdAt).toLocaleString()}</p>
                  <p className="text-sm text-primary font-mono">{selectedRequest.ticketId}</p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold mb-1">Subject</p>
                <p className="font-semibold text-lg text-on-surface">{selectedRequest.subject}</p>
              </div>

              <div className="mb-6">
                <p className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold mb-1">Message</p>
                <div className="bg-surface-container-low p-4 rounded-lg text-on-surface whitespace-pre-wrap text-sm border border-outline-variant/50">
                  {selectedRequest.message}
                </div>
              </div>

              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold mb-2 block">Update Status</label>
                  <select 
                    value={status} 
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full md:w-1/2 p-3 bg-white border border-outline-variant rounded-lg text-on-surface outline-none focus:border-primary"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold mb-2 block">Admin Reply</label>
                  <textarea 
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={4}
                    placeholder="Type your response here. This will be visible to the user..."
                    className="w-full p-4 bg-white border border-outline-variant rounded-lg text-on-surface outline-none focus:border-primary resize-none"
                  />
                </div>
                
                <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant">
                  <button 
                    type="button"
                    onClick={() => setSelectedRequest(null)}
                    className="px-6 py-2 rounded-lg font-semibold text-on-surface hover:bg-surface-container transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-6 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-container transition-colors active:scale-95"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
