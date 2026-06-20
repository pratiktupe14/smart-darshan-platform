import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

export default function OfflineVerification() {
  const { t } = useLanguage();
  const { showToast } = useOutletContext();

  // --- STATE ---
  const [entries, setEntries] = useState([
    { token: 'A1024', code: 'A1024-KM92', name: 'Manoj Deshmukh', mobile: '9876543210', village: 'Satara', persons: 4, vehicleType: 'None / Walk-in', vehicleNumber: '', time: '10:45 AM', status: 'Registered', date: '2024-05-24' },
    { token: 'A1023', code: 'A1023-PT84', name: 'Priya Sharma', mobile: '9812345678', village: 'Pune', persons: 2, vehicleType: 'Two Wheeler', vehicleNumber: 'MH12AB5678', time: '10:42 AM', status: 'In Queue', date: '2024-05-24' },
    { token: 'A1022', code: 'A1022-VY41', name: 'Suresh Kumar', mobile: '9988776655', village: 'Mumbai', persons: 1, vehicleType: 'Four Wheeler', vehicleNumber: 'MH02XY1122', time: '10:35 AM', status: 'Entered', date: '2024-05-24' },
  ]);

  // Selected devotee for verification card (default is Manoj Deshmukh / A1024)
  const [selectedToken, setSelectedToken] = useState('A1024');

  // Search input state
  const [searchQuery, setSearchQuery] = useState('');

  // Form input states
  const [formName, setFormName] = useState('');
  const [formMobile, setFormMobile] = useState('');
  const [formVillage, setFormVillage] = useState('');
  const [formPersons, setFormPersons] = useState(1);
  const [formVehicleType, setFormVehicleType] = useState('None / Walk-in');
  const [formVehicleNumber, setFormVehicleNumber] = useState('');
  const [formDate, setFormDate] = useState('2024-05-24');

  // Registered devotee to display in the pass modal
  const [registeredDevotee, setRegisteredDevotee] = useState(null);
  const [showPassModal, setShowPassModal] = useState(false);

  // Daily Statistics
  const [offlineCount, setOfflineCount] = useState(128);
  const [totalPersonsCount, setTotalPersonsCount] = useState(412);
  const [activeQueueCount, setActiveQueueCount] = useState(45);
  const [completedCount, setCompletedCount] = useState(380);

  // Computed values
  const currentDevotee = entries.find(item => item.token === selectedToken) || entries[0];

  // --- ACTIONS ---
  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const query = searchQuery.trim().toLowerCase();
    const found = entries.find(item => 
      item.token.toLowerCase().includes(query) || 
      item.mobile.includes(query) || 
      item.name.toLowerCase().includes(query)
    );

    if (found) {
      setSelectedToken(found.token);
      showToast(`Found visitor ${found.name} (${found.token})`);
    } else {
      showToast('Visitor not found in recent entries');
    }
  };

  const handleCreateToken = (e) => {
    e.preventDefault();
    if (!formName.trim() || !formMobile.trim()) {
      showToast('Please fill in Name and Mobile Number');
      return;
    }

    // Generate Token Number sequentially
    const allTokenNums = entries.map(item => {
      const clean = item.token.replace(/[^0-9]/g, '');
      return parseInt(clean);
    }).filter(num => !isNaN(num));
    const nextNum = allTokenNums.length > 0 ? Math.max(...allTokenNums) + 1 : 1025;
    const newTokenId = `A${String(nextNum).padStart(3, '0')}`;

    // Generate Unique Token Code
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomSuffix = '';
    for (let i = 0; i < 4; i++) {
      randomSuffix += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const uniqueCode = `${newTokenId}-${randomSuffix}`;

    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newDevotee = {
      token: newTokenId,
      code: uniqueCode,
      name: formName,
      mobile: formMobile,
      village: formVillage || 'N/A',
      persons: parseInt(formPersons) || 1,
      vehicleType: formVehicleType,
      vehicleNumber: formVehicleNumber,
      time: nowTime,
      status: 'Registered',
      date: formDate
    };

    setEntries(prev => [newDevotee, ...prev]);
    setSelectedToken(newTokenId);

    // Update stats
    setOfflineCount(prev => prev + 1);
    setTotalPersonsCount(prev => prev + (parseInt(formPersons) || 1));
    setActiveQueueCount(prev => prev + 1);

    // Open Digital Pass Modal
    setRegisteredDevotee(newDevotee);
    setShowPassModal(true);

    // Clear form inputs
    setFormName('');
    setFormMobile('');
    setFormVillage('');
    setFormPersons(1);
    setFormVehicleType('None / Walk-in');
    setFormVehicleNumber('');

    showToast(`Token ${newTokenId} generated successfully!`);
  };

  const handleMarkEntered = () => {
    if (!currentDevotee) return;
    if (currentDevotee.status === 'Entered') {
      showToast('Devotee has already entered the temple.');
      return;
    }

    // Update status in list
    setEntries(prev => prev.map(item => 
      item.token === currentDevotee.token ? { ...item, status: 'Entered' } : item
    ));

    // Update stats
    setActiveQueueCount(prev => Math.max(0, prev - 1));
    setCompletedCount(prev => prev + 1);

    showToast(`Marked ${currentDevotee.name} (${currentDevotee.token}) as Entered Temple`);
  };

  const handleMarkInQueue = () => {
    if (!currentDevotee) return;
    if (currentDevotee.status === 'In Queue') {
      showToast('Devotee is already in the queue.');
      return;
    }

    const oldStatus = currentDevotee.status;

    setEntries(prev => prev.map(item => 
      item.token === currentDevotee.token ? { ...item, status: 'In Queue' } : item
    ));

    if (oldStatus === 'Entered') {
      // Revert entry status
      setCompletedCount(prev => Math.max(0, prev - 1));
      setActiveQueueCount(prev => prev + 1);
    }

    showToast(`Marked ${currentDevotee.name} (${currentDevotee.token}) as In Queue`);
  };

  const handlePrintPass = (devotee) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      showToast('Popup blocker active. Please allow popups.');
      return;
    }
    const qrData = JSON.stringify(devotee);

    printWindow.document.write(`
      <html>
        <head>
          <title>Visitor Pass - ${devotee.token}</title>
          <style>
            body { font-family: 'Manrope', sans-serif; text-align: center; padding: 20px; background-color: #fff8f5; }
            .ticket {
              border: 2px solid #8f4e00;
              border-radius: 16px;
              padding: 24px;
              display: inline-block;
              max-width: 500px;
              background: white;
              box-shadow: 0 4px 12px rgba(143, 78, 0, 0.1);
              text-align: left;
            }
            .header {
              display: flex;
              justify-content: space-between;
              border-bottom: 2px dashed #dbc2b0;
              padding-bottom: 12px;
              margin-bottom: 16px;
            }
            .token { font-size: 28px; font-weight: 800; color: #8f4e00; }
            .grid {
              display: grid;
              grid-template-cols: 1fr 1fr;
              gap: 12px;
              margin-bottom: 16px;
            }
            .field-label { font-size: 11px; color: #554336; text-transform: uppercase; font-weight: bold; }
            .field-value { font-size: 14px; font-weight: 600; color: #1a1c1c; }
            .qr-sec {
              text-align: center;
              border-top: 2px dashed #dbc2b0;
              padding-top: 16px;
            }
            .qr-code { width: 150px; height: 150px; margin-bottom: 8px; }
            .code { font-family: monospace; font-weight: bold; font-size: 16px; letter-spacing: 2px; }
          </style>
        </head>
        <body>
          <div class="ticket">
            <div class="header">
              <div>
                <h2 style="margin: 0; color: #8f4e00;">TemplePortal Pass</h2>
                <span style="font-size: 11px; color: #554336;">OFFLINE VISITOR ENTRY</span>
              </div>
              <div class="token">#${devotee.token}</div>
            </div>
            <div class="grid">
              <div>
                <span class="field-label">Devotee Name</span>
                <div class="field-value">${devotee.name}</div>
              </div>
              <div>
                <span class="field-label">Mobile</span>
                <div class="field-value">${devotee.mobile}</div>
              </div>
              <div>
                <span class="field-label">Persons</span>
                <div class="field-value">${devotee.persons} (Adults)</div>
              </div>
              <div>
                <span class="field-label">Village/City</span>
                <div class="field-value">${devotee.village}</div>
              </div>
              <div>
                <span class="field-label">Vehicle</span>
                <div class="field-value">${devotee.vehicleType} (${devotee.vehicleNumber || 'N/A'})</div>
              </div>
              <div>
                <span class="field-label">Darshan Date</span>
                <div class="field-value">${devotee.date}</div>
              </div>
            </div>
            <div class="qr-sec">
              <img class="qr-code" src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}" />
              <div class="code">${devotee.code}</div>
              <p style="font-size: 12px; font-weight: bold; color: green; margin-top: 8px;">STATUS: ${devotee.status}</p>
            </div>
          </div>
          <script>window.print(); window.close();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
    showToast(`Triggered printing for Token ${devotee.token}`);
  };

  const handleDownloadPass = (devotee) => {
    const qrData = JSON.stringify(devotee);
    const htmlContent = `
      <html>
        <head>
          <title>Visitor Pass - ${devotee.token}</title>
          <style>
            body { font-family: sans-serif; display: flex; justify-content: center; padding: 40px; background: #fff8f5; }
            .card { border: 2px solid #8f4e00; border-radius: 12px; padding: 24px; background: white; max-width: 400px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
            h1 { color: #8f4e00; font-size: 32px; margin: 0 0 10px 0; border-bottom: 2px dashed #dbc2b0; padding-bottom: 8px; }
            p { margin: 8px 0; font-size: 14px; }
            .qr { text-align: center; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>Visitor Pass #${devotee.token}</h1>
            <p><strong>Devotee:</strong> ${devotee.name}</p>
            <p><strong>Mobile:</strong> ${devotee.mobile}</p>
            <p><strong>Date:</strong> ${devotee.date}</p>
            <p><strong>Persons:</strong> ${devotee.persons}</p>
            <p><strong>Vehicle:</strong> ${devotee.vehicleType} (${devotee.vehicleNumber || 'N/A'})</p>
            <p><strong>Code:</strong> ${devotee.code}</p>
            <div class="qr">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}" />
              <div style="font-weight: bold; margin-top: 5px;">${devotee.code}</div>
            </div>
          </div>
        </body>
      </html>
    `;
    const element = document.createElement("a");
    const file = new Blob([htmlContent], {type: 'text/html'});
    element.href = URL.createObjectURL(file);
    element.download = `VisitorPass_${devotee.token}.html`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    showToast(`Downloaded Pass for Token ${devotee.token}`);
  };

  // Capacity calculation
  const totalCompletedAndActive = completedCount + activeQueueCount;
  const capacityPercent = totalCompletedAndActive > 0 ? Math.round((completedCount / totalCompletedAndActive) * 100) : 82;

  // QR code url for devotee pass display
  const getQrUrl = (devotee) => {
    if (!devotee) return '';
    const qrData = JSON.stringify(devotee);
    return `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(qrData)}`;
  };

  return (
    <div className="p-container-padding-desktop space-y-stack-lg max-w-7xl mx-auto w-full animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-headline-lg font-headline-lg text-primary">{t('offlineVerificationTitle')}</h1>
        <p className="text-body-lg text-on-surface-variant">{t('offlineVerificationSubtitle')}</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-gutter">
        {/* Left Column: Registration and Search */}
        <div className="xl:col-span-8 space-y-stack-lg">
          {/* Search Visitor Card */}
          <div className="bento-card p-stack-md rounded-lg">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-primary">person_search</span>
              <h3 className="text-headline-md font-headline-md text-on-surface">{t('searchVisitor')}</h3>
            </div>
            <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
              <div className="space-y-1">
                <label className="text-label-sm font-label-sm text-on-surface-variant">{t('mobileOrToken')}</label>
                <input 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 text-body-md focus:ring-primary focus:border-primary outline-none" 
                  placeholder="e.g. 9876543210 or A1024" 
                  type="text"
                />
              </div>
              <button 
                type="submit"
                className="bg-[#82542b] text-white px-6 py-2 h-10 rounded-lg font-label-md flex items-center justify-center gap-2 hover:opacity-90 transition-opacity active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-[20px]">search</span>
                {t('search')}
              </button>
            </form>
          </div>

          {/* Entry Form Card */}
          <div className="bento-card p-stack-md rounded-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <span className="material-symbols-outlined text-[120px]">edit_note</span>
            </div>
            <div className="flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-primary">assignment</span>
              <h3 className="text-headline-md font-headline-md text-on-surface">{t('offlineVisitorForm')}</h3>
            </div>
            <form onSubmit={handleCreateToken} className="grid grid-cols-1 md:grid-cols-2 gap-stack-md">
              <div className="space-y-1">
                <label className="text-label-sm font-label-sm text-on-surface-variant">{t('fullName')}</label>
                <input 
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2.5 text-body-md focus:ring-primary focus:border-primary outline-none" 
                  placeholder="Enter devotee name" 
                  type="text" 
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-label-sm font-label-sm text-on-surface-variant">{t('mobileNumberRequired')}</label>
                <input 
                  value={formMobile}
                  onChange={(e) => setFormMobile(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2.5 text-body-md focus:ring-primary focus:border-primary outline-none" 
                  placeholder="10-digit mobile number" 
                  type="tel" 
                  pattern="[0-9]{10}"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-label-sm font-label-sm text-on-surface-variant">{t('placeVillage')}</label>
                <input 
                  value={formVillage}
                  onChange={(e) => setFormVillage(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2.5 text-body-md focus:ring-primary focus:border-primary outline-none" 
                  placeholder="Where are they from?" 
                  type="text"
                />
              </div>
              <div className="space-y-1">
                <label className="text-label-sm font-label-sm text-on-surface-variant">{t('numberOfPersons')}</label>
                <input 
                  value={formPersons}
                  onChange={(e) => setFormPersons(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2.5 text-body-md focus:ring-primary focus:border-primary outline-none" 
                  min="1" 
                  type="number"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-label-sm font-label-sm text-on-surface-variant">{t('vehicleType')}</label>
                <select 
                  value={formVehicleType}
                  onChange={(e) => setFormVehicleType(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2.5 text-body-md focus:ring-primary focus:border-primary outline-none"
                >
                  <option value="None / Walk-in">{t('noneWalkin') || 'None / Walk-in'}</option>
                  <option value="Two Wheeler">{t('twoWheeler')}</option>
                  <option value="Four Wheeler">{t('fourWheeler')}</option>
                  <option value="Bus/Coach">{t('bus') || 'Bus/Coach'}</option>
                </select>
              </div>
              <div className={`space-y-1 transition-all ${formVehicleType === 'None / Walk-in' ? 'opacity-50 pointer-events-none' : ''}`}>
                <label className="text-label-sm font-label-sm text-on-surface-variant">{t('vehicleNumber')}</label>
                <input 
                  value={formVehicleNumber}
                  onChange={(e) => setFormVehicleNumber(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2.5 text-body-md focus:ring-primary focus:border-primary outline-none uppercase" 
                  placeholder="e.g. GJ01AB1234" 
                  type="text"
                  required={formVehicleType !== 'None / Walk-in'}
                />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-label-sm font-label-sm text-on-surface-variant">{t('darshanDateLabel')}</label>
                <input 
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2.5 text-body-md focus:ring-primary focus:border-primary outline-none" 
                  type="date"
                />
              </div>
              <div className="md:col-span-2 pt-4">
                <button 
                  type="submit"
                  className="w-full bg-primary text-white py-4 rounded-lg font-headline-md text-headline-md shadow-lg hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                >
                  <span className="material-symbols-outlined">confirmation_number</span>
                  {t('generateToken')}
                </button>
              </div>
            </form>
          </div>

          {/* Recent Entries Table */}
          <div className="bento-card rounded-lg overflow-hidden">
            <div className="p-stack-md border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">history</span>
                <h3 className="text-headline-md font-headline-md text-on-surface">{t('recentOfflineEntries')}</h3>
              </div>
              <button className="text-primary font-label-md flex items-center gap-1 hover:underline text-xs">
                {t('viewAll')} <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low/50">
                    <th className="px-6 py-4 text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">{t('tokenNumber') || 'Token'}</th>
                    <th className="px-6 py-4 text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">{t('visitorName')}</th>
                    <th className="px-6 py-4 text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">{t('entryTime')}</th>
                    <th className="px-6 py-4 text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider">{t('status') || 'Status'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {entries.map((item) => (
                    <tr 
                      key={item.token}
                      onClick={() => setSelectedToken(item.token)}
                      className={`hover:bg-surface-container-low transition-colors cursor-pointer ${item.token === selectedToken ? 'bg-primary/5 font-semibold' : ''}`}
                    >
                      <td className="px-6 py-4 font-bold text-primary">{item.token}</td>
                      <td className="px-6 py-4 font-body-md text-on-surface">{item.name}</td>
                      <td className="px-6 py-4 text-body-md text-on-surface-variant">{item.time}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-label-sm font-label-sm ${
                          item.status === 'Registered' ? 'bg-[#ff9328]/20 text-[#663500] font-bold' :
                          item.status === 'In Queue' ? 'bg-[#00bbf7]/20 text-[#004760] font-bold' :
                          'bg-[#dcc2af]/30 text-[#554335] font-bold'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Verification & Stats */}
        <div className="xl:col-span-4 space-y-stack-lg">
          {/* Verification & Token Card */}
          {currentDevotee && (
            <div className="bento-card p-stack-md rounded-lg bg-surface-container-lowest border-primary border-2">
              <div className="flex flex-col items-center text-center py-6 border-b border-outline-variant mb-6">
                <span className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-widest mb-1">{t('currentGeneratedToken')}</span>
                <div className="text-[64px] font-display text-primary leading-none mb-4 font-extrabold">{currentDevotee.token}</div>
                <span className={`px-4 py-1.5 rounded-full text-label-md font-bold flex items-center gap-2 ${
                  currentDevotee.status === 'Registered' ? 'bg-[#ff9328]/20 text-[#663500]' :
                  currentDevotee.status === 'In Queue' ? 'bg-[#00bbf7]/20 text-[#004760]' :
                  'bg-[#dcc2af]/30 text-[#554335]'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${
                    currentDevotee.status === 'Registered' ? 'bg-primary' :
                    currentDevotee.status === 'In Queue' ? 'bg-[#004760]' :
                    'bg-[#897363]'
                  } animate-pulse`}></span>
                  {currentDevotee.status}
                </span>
              </div>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant text-body-md font-medium">{t('nameLabel') || 'Name'}</span>
                  <span className="font-bold text-on-surface">{currentDevotee.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant text-body-md font-medium">{t('mobile') || 'Mobile'}</span>
                  <span className="font-bold text-on-surface">{currentDevotee.mobile.substring(0,4)}*** ***</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant text-body-md font-medium">{t('persons')}</span>
                  <span className="font-bold text-on-surface">{currentDevotee.persons}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant text-body-md font-medium">{t('village') || 'Village'}</span>
                  <span className="font-bold text-on-surface">{currentDevotee.village}</span>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleMarkEntered}
                  className="w-full bg-primary text-white py-3 rounded-lg font-label-md flex items-center justify-center gap-2 hover:shadow-md transition-all active:scale-[0.98]"
                >
                  <span className="material-symbols-outlined">login</span>
                  {t('markEnteredTemple')}
                </button>
                <button 
                  onClick={handleMarkInQueue}
                  className="w-full bg-[#006688] text-white py-3 rounded-lg font-label-md flex items-center justify-center gap-2 hover:shadow-md transition-all active:scale-[0.98]"
                >
                  <span className="material-symbols-outlined">groups</span>
                  {t('markInQueue')}
                </button>
                <button 
                  onClick={() => handlePrintPass(currentDevotee)}
                  className="w-full bg-white border-2 border-[#82542b] text-[#82542b] py-3 rounded-lg font-label-md flex items-center justify-center gap-2 hover:bg-[#82542b]/5 transition-all active:scale-[0.98]"
                >
                  <span className="material-symbols-outlined">print</span>
                  {t('printToken')}
                </button>
              </div>
            </div>
          )}

          {/* Daily Statistics Card */}
          <div className="bento-card p-stack-md rounded-lg">
            <div className="flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-primary">insights</span>
              <h3 className="text-headline-md font-headline-md text-on-surface">{t('dailyStatistics')}</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant">
                <p className="text-label-sm font-label-sm text-on-surface-variant mb-1">{t('offlineVisitors')}</p>
                <p className="text-headline-md font-headline-md text-primary font-bold">{offlineCount}</p>
              </div>
              <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant">
                <p className="text-label-sm font-label-sm text-on-surface-variant mb-1">{t('totalPersons')}</p>
                <p className="text-headline-md font-headline-md text-primary font-bold">{totalPersonsCount}</p>
              </div>
              <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant">
                <p className="text-label-sm font-label-sm text-on-surface-variant mb-1">{t('activeQueue')}</p>
                <p className="text-headline-md font-headline-md text-[#006688] font-bold">{activeQueueCount}</p>
              </div>
              <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant">
                <p className="text-label-sm font-label-sm text-on-surface-variant mb-1">{t('completed')}</p>
                <p className="text-headline-md font-headline-md text-[#82542b] font-bold">{completedCount}</p>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-outline-variant">
              <div className="flex justify-between items-center mb-2">
                <span className="text-label-md font-label-md text-on-surface">{t('capacityUtilization')}</span>
                <span className="text-label-md font-label-md text-primary">{capacityPercent}%</span>
              </div>
              <div className="h-2 bg-surface-container-high rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-1000" 
                  style={{ width: `${capacityPercent}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- DIGITAL PASS OVERLAY MODAL --- */}
      {showPassModal && registeredDevotee && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[110] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-outline-variant animate-in fade-in zoom-in-95 duration-200 text-on-surface relative">
            
            {/* Modal Title and close */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2 text-primary">
                <span className="material-symbols-outlined">check_circle</span>
                {t('registrationConfirmed')}
              </h3>
              <button 
                onClick={() => setShowPassModal(false)}
                className="text-on-surface-variant hover:bg-surface-container rounded-full p-1.5 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Reusing existing pass design used for online bookings */}
            <div className="relative bg-white rounded-xl shadow-lg overflow-hidden flex flex-col lg:flex-row border border-outline-variant mb-8">
              {/* Ticket Main Body */}
              <div className="flex-grow p-6 bg-white">
                <div className="flex justify-between items-start mb-6 gap-4">
                  <div>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">{t('nameLabel') || 'Devotee Name'}</p>
                    <p className="text-lg font-bold text-on-surface">{registeredDevotee.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-wider mb-1">{t('tokenId')}</p>
                    <p className="text-xl font-bold text-primary">#{registeredDevotee.token}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-y-4 gap-x-4">
                  <div>
                    <p className="text-xs text-on-surface-variant mb-0.5">{t('mobile') || 'Mobile'}</p>
                    <p className="text-sm font-semibold">{registeredDevotee.mobile}</p>
                  </div>
                  <div>
                    <p className="text-xs text-on-surface-variant mb-0.5">{t('vehicleNumber') || 'Vehicle No.'}</p>
                    <p className="text-sm font-semibold">{registeredDevotee.vehicleNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-on-surface-variant mb-0.5">{t('persons')}</p>
                    <p className="text-sm font-semibold">{registeredDevotee.persons} (Adults)</p>
                  </div>
                  <div>
                    <p className="text-xs text-on-surface-variant mb-0.5">{t('darshanDateLabel')}</p>
                    <p className="text-sm font-semibold">{registeredDevotee.date}</p>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-dashed border-outline-variant flex gap-3">
                  {/* Action Buttons inside the pass */}
                  <button 
                    onClick={() => handlePrintPass(registeredDevotee)}
                    className="flex-grow h-10 bg-surface-container-high text-primary px-3 rounded-lg font-semibold flex items-center justify-center gap-1 hover:bg-surface-container-highest transition-colors text-xs active:scale-[0.98]"
                  >
                    <span className="material-symbols-outlined text-sm">print</span>
                    {t('printPass')}
                  </button>
                  <button 
                    onClick={() => handleDownloadPass(registeredDevotee)}
                    className="flex-grow h-10 bg-primary text-white px-3 rounded-lg font-semibold flex items-center justify-center gap-1 shadow-md hover:brightness-110 transition-all text-xs active:scale-[0.98]"
                  >
                    <span className="material-symbols-outlined text-sm">download</span>
                    {t('downloadPass')}
                  </button>
                </div>
              </div>
              
              {/* Ticket QR Section */}
              <div className="bg-surface-container-low p-6 flex flex-col items-center justify-center lg:min-w-[200px] border-t lg:border-t-0 lg:border-l border-dashed border-outline-variant">
                <div className="bg-white p-2 rounded-xl shadow-inner mb-2 border border-outline-variant">
                  <img 
                    className="w-28 h-28" 
                    alt="QR code" 
                    src={getQrUrl(registeredDevotee)} 
                  />
                </div>
                <p className="text-[10px] text-on-surface-variant text-center font-medium">{t('scanAtEntrance')}</p>
                <div className="mt-2 w-full">
                  <div className="h-10 flex items-center justify-center bg-white rounded-lg px-2 border border-outline-variant shadow-sm text-center">
                    <span className="font-mono text-xs font-bold tracking-wider">{registeredDevotee.code}</span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-outline-variant/30 w-full text-center">
                  <span className="text-[10px] uppercase font-bold text-[#ff9328] bg-[#ff9328]/10 px-2.5 py-1 rounded-full">
                    {registeredDevotee.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex gap-4 justify-end">
              <button 
                onClick={() => {
                  showToast(`Viewing pass #${registeredDevotee.token}`);
                }}
                className="px-5 py-2.5 border border-outline-variant rounded-lg hover:bg-surface-container text-xs font-bold text-on-surface-variant transition-colors"
              >
                {t('viewPassDetails')}
              </button>
              <button 
                onClick={() => {
                  setShowPassModal(false);
                }}
                className="px-5 py-2.5 bg-primary text-white rounded-lg hover:brightness-110 text-xs font-bold transition-all shadow-md"
              >
                {t('generateNewEntry')}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
