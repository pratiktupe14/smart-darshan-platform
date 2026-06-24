import React, { useState, useEffect } from 'react';

export default function VIPManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [vipRegistry, setVipRegistry] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [form, setForm] = useState({
    name: '',
    mobileNumber: '',
    category: 'VIP Devotee',
    date: '',
    persons: '1',
    idProof: '',
    priorityLevel: 'Medium',
    remarks: ''
  });

  const fetchVIPs = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/vip`);
      if (res.ok) {
        const data = await res.json();
        setVipRegistry(data);
      }
    } catch (err) {
      console.error('Failed to fetch VIPs', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVIPs();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAddVIP = async (e) => {
    e.preventDefault();
    if (!form.name || !form.mobileNumber || !form.date) {
      alert('Please fill in Name, Mobile Number, and Visit Date.');
      return;
    }

    try {
        const payload = {
            name: form.name,
            mobileNumber: form.mobileNumber,
            category: form.category,
            persons: parseInt(form.persons, 10) || 1,
            expectedArrivalTime: form.date,
            idProof: form.idProof,
            priorityLevel: form.priorityLevel,
            remarks: form.remarks
        };
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/vip`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (res.ok) {
            await fetchVIPs();
            setForm({
              name: '',
              mobileNumber: '',
              category: 'VIP Devotee',
              date: '',
              persons: '1',
              idProof: '',
              priorityLevel: 'Medium',
              remarks: ''
            });
            alert('VIP Entry generated successfully!');
        }
    } catch (e) {
        console.error(e);
        alert('Failed to add VIP entry');
    }
  };

  const handleCompleteDarshan = async (id) => {
    if (!window.confirm('Mark Darshan as Completed?')) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/vip/${id}/complete`, {
        method: 'PUT'
      });
      if (res.ok) {
        fetchVIPs();
      }
    } catch (e) {
      console.error(e);
      alert('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this VIP entry?')) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/vip/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchVIPs();
      }
    } catch (e) {
      console.error(e);
      alert('Failed to delete VIP');
    }
  };

  const handleView = (vip) => {
    alert(`VIP Details:\nToken: ${vip.tokenNumber}\nName: ${vip.name}\nStatus: ${vip.status}\nCategory: ${vip.category}\nMobile: ${vip.mobileNumber}\nPersons: ${vip.persons}\nVisit Date: ${new Date(vip.expectedArrivalTime).toLocaleDateString()}\nID Proof: ${vip.idProof || 'N/A'}\nPriority Level: ${vip.priorityLevel || 'N/A'}\nRemarks: ${vip.remarks || 'None'}`);
  };

  const handleEdit = (vip) => {
    const newName = window.prompt("Edit VIP Name:", vip.name);
    if (newName && newName !== vip.name) {
      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/vip/${vip._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName })
      }).then(() => fetchVIPs());
    }
  };

  // Stats calculation
  const todayStr = new Date().toISOString().split('T')[0];
  const totalVIPs = vipRegistry.length;
  const activePasses = vipRegistry.filter(v => v.status === 'Pass Generated').length;
  const completedDarshans = vipRegistry.filter(v => v.status === 'Darshan Completed').length;
  const todayVisits = vipRegistry.filter(v => {
    try {
      return new Date(v.expectedArrivalTime).toISOString().split('T')[0] === todayStr;
    } catch(e) { return false; }
  }).length;

  // Filtering list
  const filteredVIPs = vipRegistry.filter(vip => {
    const matchesSearch = (vip.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (vip.mobileNumber || '').includes(searchQuery) ||
                          (vip.tokenNumber || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDate = filterDate ? new Date(vip.expectedArrivalTime).toISOString().split('T')[0] === filterDate : true;
    return matchesSearch && matchesDate;
  });

  return (
    <div className="px-4 md:px-10 py-8 max-w-[1600px] mx-auto w-full space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-outline-variant/30 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-on-surface">VIP Management</h1>
          <p className="text-on-surface-variant text-sm font-medium mt-1">
            Manage VIP visitors, passes, and darshan completion.
          </p>
        </div>
      </div>

      {/* VIP Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stat Card 1 */}
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant flex items-center gap-4 transition-all hover:shadow-md">
          <div className="w-12 h-12 rounded-xl bg-primary-container/20 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined filled-icon" style={{ fontVariationSettings: "'FILL' 1" }}>groups</span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Total VIP Visitors</p>
            <h3 className="text-2xl font-bold text-on-surface">{totalVIPs}</h3>
          </div>
        </div>
        {/* Stat Card 2 */}
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant flex items-center gap-4 transition-all hover:shadow-md">
          <div className="w-12 h-12 rounded-xl bg-tertiary-container/20 flex items-center justify-center text-tertiary">
            <span className="material-symbols-outlined">confirmation_number</span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Active VIP Passes</p>
            <h3 className="text-2xl font-bold text-on-surface">{activePasses}</h3>
          </div>
        </div>
        {/* Stat Card 3 */}
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant flex items-center gap-4 transition-all hover:shadow-md">
          <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-green-700">
            <span className="material-symbols-outlined filled-icon" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Completed VIP Darshans</p>
            <h3 className="text-2xl font-bold text-on-surface">{completedDarshans}</h3>
          </div>
        </div>
        {/* Stat Card 4 */}
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant flex items-center gap-4 transition-all hover:shadow-md">
          <div className="w-12 h-12 rounded-xl bg-secondary-container/20 flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined">today</span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Today's VIP Visits</p>
            <h3 className="text-2xl font-bold text-on-surface">{todayVisits}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Entry Form */}
        <div className="lg:col-span-4 space-y-6">
          {/* Add VIP Entry Form */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-soft">
            <h2 className="text-lg font-bold text-on-surface mb-6 flex items-center">
              <span className="material-symbols-outlined mr-2 text-primary">person_add</span>
              Generate VIP Pass
            </h2>
            <form onSubmit={handleAddVIP} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant">VIP Name</label>
                <input 
                  name="name"
                  value={form.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-xl border border-outline-variant focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm" 
                  placeholder="Full name of the VIP" 
                  type="text"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant">Mobile Number</label>
                  <input 
                    name="mobileNumber"
                    value={form.mobileNumber}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-xl border border-outline-variant focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm" 
                    placeholder="+91 98765 00000" 
                    type="tel"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant">ID Proof (Optional)</label>
                  <input 
                    name="idProof"
                    value={form.idProof}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-xl border border-outline-variant focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm" 
                    placeholder="Aadhar / PAN" 
                    type="text"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant">VIP Category</label>
                  <select 
                    name="category"
                    value={form.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-xl border border-outline-variant focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm bg-transparent appearance-none"
                  >
                    <option value="Trustee">Trustee</option>
                    <option value="Donor">Donor</option>
                    <option value="Guest">Guest</option>
                    <option value="Special Guest">Special Guest</option>
                    <option value="VIP Devotee">VIP Devotee</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant">Priority Level</label>
                  <select 
                    name="priorityLevel"
                    value={form.priorityLevel}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-xl border border-outline-variant focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm bg-transparent appearance-none"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant">Visit Date</label>
                  <input 
                    name="date"
                    value={form.date}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-xl border border-outline-variant focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm" 
                    type="date"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant">Number of Persons</label>
                  <input 
                    name="persons"
                    value={form.persons}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-xl border border-outline-variant focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm" 
                    min="1" 
                    type="number"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant">Remarks / Notes</label>
                <textarea 
                  name="remarks"
                  value={form.remarks}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-xl border border-outline-variant focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm" 
                  placeholder="Special requirements or notes..." 
                  rows="2"
                ></textarea>
              </div>
              <button 
                type="submit"
                className="w-full py-3 bg-primary text-on-primary rounded-xl font-bold text-sm transition-all active:scale-[0.98] shadow-md hover:bg-primary/95 mt-2"
              >
                Generate VIP Pass
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: List */}
        <div className="lg:col-span-8 space-y-6">
          {/* Search & Filter Row */}
          <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant flex flex-col md:flex-row items-center gap-4">
            <div className="flex-1 relative w-full">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
              <input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-outline-variant focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm" 
                placeholder="Search by Name, Mobile or Token..." 
                type="text"
              />
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <input 
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-outline-variant focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm" 
                type="date"
              />
              <button 
                onClick={() => { setSearchQuery(''); setFilterDate(''); }}
                className="p-2.5 rounded-xl border border-outline-variant hover:bg-surface-container-high transition-colors text-xs font-bold"
                title="Clear Filters"
              >
                Clear
              </button>
            </div>
          </div>

          {/* VIP List Table */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-soft overflow-hidden">
            <div className="p-6 border-b border-outline-variant bg-white">
              <h2 className="text-lg font-bold text-on-surface">VIP Visitors Registry</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-surface-container-low text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">VIP Token</th>
                    <th className="px-6 py-4">VIP Details</th>
                    <th className="px-6 py-4">Visit Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Created Date</th>
                    <th className="px-6 py-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/30 text-sm">
                  {!isLoading && filteredVIPs.map((vip) => (
                    <tr key={vip._id} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-primary whitespace-nowrap">
                        {vip.tokenNumber}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-on-surface">{vip.name}</div>
                        <div className="text-xs text-on-surface-variant mt-0.5">{vip.category} • {vip.persons} Persons</div>
                        <div className="text-xs text-on-surface-variant mt-0.5">{vip.mobileNumber}</div>
                      </td>
                      <td className="px-6 py-4 font-medium text-on-surface-variant whitespace-nowrap">
                        {new Date(vip.expectedArrivalTime).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                          vip.status === 'Pass Generated' 
                            ? 'bg-primary-container/20 text-primary border-primary-container/40' 
                            : 'bg-green-100 text-green-700 border-green-200'
                        }`}>
                          {vip.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-on-surface-variant whitespace-nowrap">
                        {new Date(vip.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                         <div className="flex items-center justify-center gap-3">
                           <button onClick={() => handleView(vip)} className="text-secondary hover:text-secondary/80 font-bold text-xs" title="View Details">
                             <span className="material-symbols-outlined text-[18px]">visibility</span>
                           </button>
                           <button onClick={() => handleEdit(vip)} className="text-blue-600 hover:text-blue-800 font-bold text-xs" title="Edit VIP">
                             <span className="material-symbols-outlined text-[18px]">edit</span>
                           </button>
                           {vip.status === 'Pass Generated' && (
                             <button onClick={() => handleCompleteDarshan(vip._id)} className="text-green-600 hover:text-green-800 font-bold text-xs" title="Mark Darshan Completed">
                               <span className="material-symbols-outlined text-[18px]">check_circle</span>
                             </button>
                           )}
                           <button onClick={() => handleDelete(vip._id)} className="text-error hover:text-error/80 font-bold text-xs" title="Delete Entry">
                             <span className="material-symbols-outlined text-[18px]">delete</span>
                           </button>
                         </div>
                      </td>
                    </tr>
                  ))}
                  {!isLoading && filteredVIPs.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center py-12">
                         <div className="flex flex-col items-center justify-center text-on-surface-variant">
                           <span className="material-symbols-outlined text-4xl mb-2 opacity-50">search_off</span>
                           <p className="font-medium">No VIP Records Found</p>
                         </div>
                      </td>
                    </tr>
                  )}
                  {isLoading && (
                    <tr>
                      <td colSpan="6" className="text-center py-12">
                         <div className="flex flex-col items-center justify-center text-primary">
                           <span className="material-symbols-outlined text-4xl mb-2 animate-spin">sync</span>
                           <p className="font-medium text-sm">Loading records...</p>
                         </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-outline-variant flex justify-between items-center bg-surface-container-low/30">
              <p className="text-xs text-on-surface-variant font-medium">
                Showing {filteredVIPs.length} entries
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
