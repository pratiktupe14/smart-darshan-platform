import React, { useState } from 'react';

export default function VIPManagement() {
  const [statusMessage, setStatusMessage] = useState('Intermittent VIP Access Active');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState('');
  
  // VIP Registry State
  const [vipRegistry, setVipRegistry] = useState([]);

  React.useEffect(() => {
    const fetchVIPs = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/vip`);
        if (res.ok) {
          const data = await res.json();
          setVipRegistry(data.map(v => ({
            id: v._id,
            name: v.name,
            mobile: v.mobileNumber,
            date: new Date(v.expectedArrivalTime).toISOString().split('T')[0],
            persons: v.partySize,
            status: v.status.charAt(0).toUpperCase() + v.status.slice(1),
            category: 'VIP'
          })));
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchVIPs();
  }, []);

  // Recent Activities State
  const [activities, setActivities] = useState([
    { id: 1, text: 'VIP Amit Shah entry activated by Gate 2 Operator.', time: '10:30 AM', source: 'System Log', type: 'bolt' },
    { id: 2, text: 'Nirmala Sitharaman visit status updated to Completed.', time: '09:15 AM', source: 'Auto Updated', type: 'check' },
    { id: 3, text: 'New VIP booking added for Rajnath Singh (Platinum Category).', time: 'Yesterday, 06:45 PM', source: 'Admin Panel', type: 'add' }
  ]);

  // Add VIP Entry Form State
  const [form, setForm] = useState({
    name: '',
    mobile: '',
    vehicleNo: '',
    category: 'Gold',
    date: '',
    persons: '1',
    remarks: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleAddVIP = async (e) => {
    e.preventDefault();
    if (!form.name || !form.mobile || !form.date) {
      alert('Please fill in Name, Mobile Number, and Visit Date.');
      return;
    }

    try {
        const payload = {
            name: form.name,
            mobileNumber: form.mobile,
            vehicleNumber: form.vehicleNo,
            partySize: parseInt(form.persons, 10) || 1,
            expectedArrivalTime: form.date,
            specialRequests: form.remarks
        };
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/vip`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (res.ok) {
            const added = await res.json();
            const newVIP = {
              id: added._id,
              name: added.name,
              mobile: added.mobileNumber,
              date: new Date(added.expectedArrivalTime).toISOString().split('T')[0],
              persons: added.partySize,
              status: added.status.charAt(0).toUpperCase() + added.status.slice(1),
              category: form.category
            };

            setVipRegistry(prev => [newVIP, ...prev]);

            // Add activity log
            const now = new Date();
            const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const newActivity = {
              id: activities.length + 1,
              text: `New VIP booking added for ${form.name} (${form.category} Category).`,
              time: timeStr,
              source: 'Admin Panel',
              type: 'add'
            };
            setActivities(prev => [newActivity, ...prev]);

            // Reset Form
            setForm({
              name: '',
              mobile: '',
              vehicleNo: '',
              category: 'Gold',
              date: '',
              persons: '1',
              remarks: ''
            });

            alert('VIP Entry added successfully to registry!');
        }
    } catch (e) {
        console.error(e);
        alert('Failed to add VIP entry');
    }
  };

  const triggerQueueAction = (actionType) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let text = '';
    let status = '';

    if (actionType === 'activate') {
      text = 'VIP priority passage activated globally.';
      status = 'Exclusive VIP Entry Passage Active';
    } else if (actionType === 'end') {
      text = 'VIP priority passage terminated.';
      status = 'Normal queue flow restored';
    } else if (actionType === 'resume') {
      text = 'Normal queue routing resumed.';
      status = 'Intermittent VIP Access Active';
    }

    setStatusMessage(status);

    const newActivity = {
      id: activities.length + 1,
      text,
      time: timeStr,
      source: 'System Log',
      type: 'bolt'
    };
    setActivities(prev => [newActivity, ...prev]);
  };

  // Stats calculation
  const totalToday = vipRegistry.filter(v => v.date === new Date().toISOString().split('T')[0]).length;
  const activeCount = vipRegistry.filter(v => v.status === 'Active').length;
  const completedCount = vipRegistry.filter(v => v.status === 'Completed').length;
  const upcomingCount = vipRegistry.filter(v => v.status === 'Scheduled').length;

  // Filtering list
  const filteredVIPs = vipRegistry.filter(vip => {
    const matchesSearch = vip.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          vip.mobile.includes(searchQuery);
    const matchesDate = filterDate ? vip.date === filterDate : true;
    return matchesSearch && matchesDate;
  });

  return (
    <div className="px-4 md:px-10 py-8 max-w-[1600px] mx-auto w-full space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-outline-variant/30 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-on-surface">VIP Management</h1>
          <p className="text-on-surface-variant text-sm font-medium mt-1">
            Manage VIP visitors, priority darshan entries, and VIP queue access.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2.5 rounded-xl border border-secondary text-secondary font-bold text-sm hover:bg-secondary/5 transition-colors flex items-center gap-2 active:scale-95">
            <span className="material-symbols-outlined text-sm">download</span>
            Export List
          </button>
          <button className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-sm hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all flex items-center gap-2 active:scale-95">
            <span className="material-symbols-outlined text-sm">add</span>
            Add VIP Entry
          </button>
        </div>
      </div>

      {/* VIP Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stat Card 1 */}
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant flex items-center gap-4 transition-all hover:shadow-md">
          <div className="w-12 h-12 rounded-xl bg-primary-container/20 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined filled-icon" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">VIP Visitors Today</p>
            <h3 className="text-2xl font-bold text-on-surface">{totalToday || 156}</h3>
          </div>
        </div>
        {/* Stat Card 2 */}
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant flex items-center gap-4 transition-all hover:shadow-md">
          <div className="w-12 h-12 rounded-xl bg-tertiary-container/20 flex items-center justify-center text-tertiary">
            <span className="material-symbols-outlined">running_with_errors</span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Active VIP Entries</p>
            <h3 className="text-2xl font-bold text-on-surface">{activeCount || 12}</h3>
          </div>
        </div>
        {/* Stat Card 3 */}
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant flex items-center gap-4 transition-all hover:shadow-md">
          <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-green-700">
            <span className="material-symbols-outlined filled-icon" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Completed VIP Visits</p>
            <h3 className="text-2xl font-bold text-on-surface">{completedCount || 140}</h3>
          </div>
        </div>
        {/* Stat Card 4 */}
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant flex items-center gap-4 transition-all hover:shadow-md">
          <div className="w-12 h-12 rounded-xl bg-secondary-container/20 flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined">event</span>
          </div>
          <div>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Upcoming VIP Visits</p>
            <h3 className="text-2xl font-bold text-on-surface">{upcomingCount || 4}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Queue Control & Entry Form */}
        <div className="lg:col-span-4 space-y-6">
          {/* VIP Queue Control */}
          <div className="bg-surface-container-lowest rounded-xl border-t-2 border-primary border-x border-b border-outline-variant p-6 shadow-soft overflow-hidden relative">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-on-surface flex items-center">
                <span className="material-symbols-outlined mr-2 text-primary">traffic</span>
                Queue Control
              </h2>
              <div className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-[10px] font-bold text-green-700">LIVE</span>
              </div>
            </div>
            <div className="space-y-4">
              <button 
                onClick={() => triggerQueueAction('activate')}
                className="w-full flex items-center justify-center gap-2 py-4 bg-primary text-on-primary rounded-xl font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-md"
              >
                <span className="material-symbols-outlined">bolt</span>
                Activate VIP Entry
              </button>
              <button 
                onClick={() => triggerQueueAction('end')}
                className="w-full flex items-center justify-center gap-2 py-4 border-2 border-secondary text-secondary rounded-xl font-bold text-sm hover:bg-secondary/5 active:scale-[0.98] transition-all"
              >
                <span className="material-symbols-outlined">stop_circle</span>
                End VIP Entry
              </button>
              <button 
                onClick={() => triggerQueueAction('resume')}
                className="w-full flex items-center justify-center gap-2 py-3 text-on-surface-variant font-bold text-sm hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined">refresh</span>
                Resume Normal Queue
              </button>
            </div>
            <div className="mt-6 pt-6 border-t border-outline-variant/30 text-center">
              <p className="text-[10px] font-bold text-on-surface-variant mb-1 uppercase tracking-wider">CURRENT STATUS</p>
              <p className="text-sm font-bold text-primary">{statusMessage}</p>
            </div>
          </div>

          {/* Add VIP Entry Form */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-soft">
            <h2 className="text-lg font-bold text-on-surface mb-6 flex items-center">
              <span className="material-symbols-outlined mr-2 text-primary">person_add</span>
              Add VIP Entry
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
                    name="mobile"
                    value={form.mobile}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-xl border border-outline-variant focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm" 
                    placeholder="+91 98765 00000" 
                    type="tel"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-on-surface-variant">Vehicle No.</label>
                  <input 
                    name="vehicleNo"
                    value={form.vehicleNo}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-xl border border-outline-variant focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm" 
                    placeholder="AB 01 CD 2345" 
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
                    <option value="Gold">Gold</option>
                    <option value="Platinum">Platinum</option>
                    <option value="State Guest">State Guest</option>
                  </select>
                </div>
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
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface-variant">Remarks</label>
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
                Add VIP Entry
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: List and Activities */}
        <div className="lg:col-span-8 space-y-6">
          {/* Search & Filter Row */}
          <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant flex flex-col md:flex-row items-center gap-4">
            <div className="flex-1 relative w-full">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
              <input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-outline-variant focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-sm" 
                placeholder="Search by Name or Mobile..." 
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
                    <th className="px-6 py-4">VIP Name</th>
                    <th className="px-6 py-4">Mobile Number</th>
                    <th className="px-6 py-4">Visit Date</th>
                    <th className="px-6 py-4 text-center">Persons</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/30 text-sm">
                  {filteredVIPs.map((vip) => (
                    <tr key={vip.id} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-secondary-container/30 text-secondary flex items-center justify-center mr-3 font-bold text-[12px]">
                            {vip.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="font-bold text-on-surface">{vip.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-on-surface-variant">{vip.mobile}</td>
                      <td className="px-6 py-4 font-medium text-on-surface-variant">{vip.date}</td>
                      <td className="px-6 py-4 text-center font-bold">{vip.persons}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                          vip.status === 'Active' 
                            ? 'bg-primary-container/20 text-primary border-primary-container/40' 
                            : vip.status === 'Scheduled'
                            ? 'bg-surface-container-high text-on-surface-variant border-outline-variant/50'
                            : vip.status === 'Completed'
                            ? 'bg-green-100 text-green-700 border-green-200'
                            : 'bg-red-50 text-red-600 border-red-100'
                        }`}>
                          {vip.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button className="text-primary hover:underline font-bold text-xs">Details</button>
                      </td>
                    </tr>
                  ))}
                  {filteredVIPs.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center py-8 text-on-surface-variant font-medium">
                        No VIP registry entries match filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-outline-variant flex justify-between items-center bg-surface-container-low/30">
              <p className="text-xs text-on-surface-variant font-medium">
                Showing {filteredVIPs.length} of {vipRegistry.length} entries
              </p>
              <div className="flex gap-2">
                <button className="p-2 border border-outline-variant rounded-lg hover:bg-surface-container-high transition-colors active:scale-95">
                  <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                </button>
                <button className="p-2 border border-outline-variant rounded-lg hover:bg-surface-container-high transition-colors active:scale-95">
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
              </div>
            </div>
          </div>

          {/* Recent VIP Activities */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-soft">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-on-surface">Recent Activities</h2>
              <button className="text-xs font-bold text-primary hover:underline">View All</button>
            </div>
            <div className="space-y-6">
              {activities.map((activity) => (
                <div key={activity.id} className="flex gap-4">
                  <div className="mt-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      activity.type === 'bolt' 
                        ? 'bg-primary/10 text-primary' 
                        : activity.type === 'check'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-secondary-container/20 text-secondary'
                    }`}>
                      <span className="material-symbols-outlined text-[18px]">{activity.type}</span>
                    </div>
                  </div>
                  <div className="flex-1 pb-4 border-b border-outline-variant/30 last:border-0 last:pb-0">
                    <p className="text-sm text-on-surface leading-relaxed">
                      {activity.text}
                    </p>
                    <p className="text-[10px] text-on-surface-variant font-medium mt-1">
                      {activity.time} • {activity.source}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
