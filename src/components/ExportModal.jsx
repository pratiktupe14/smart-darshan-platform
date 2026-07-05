import { useLanguage } from "../context/LanguageContext";
import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Chart from 'chart.js/auto';
export default function ExportModal({
  isOpen,
  onClose
}) {
  const {
    t
  } = useLanguage();
  const [dateRange, setDateRange] = useState('Last 7 Days');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showCustomDate, setShowCustomDate] = useState(false);
  const [exportFormat, setExportFormat] = useState('excel');
  const [selectedSections, setSelectedSections] = useState({
    bookings: true,
    queue: true,
    demographics: true,
    vip: false,
    qr: false,
    completion: false,
    parking: false,
    support: false,
    revenue: true,
    charts: true
  });
  const [selectedVisualizations, setSelectedVisualizations] = useState({
    bar: true,
    line: true,
    pie: false,
    area: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [progressText, setProgressText] = useState('Connecting to temple database...');
  const [progressStep, setProgressStep] = useState(1);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  useEffect(() => {
    if (!isOpen) {
      setError('');
      setLoading(false);
      setProgressStep(1);
    }
  }, [isOpen]);
  const toggleSection = id => setSelectedSections(prev => ({
    ...prev,
    [id]: !prev[id]
  }));
  const toggleVisualization = id => setSelectedVisualizations(prev => ({
    ...prev,
    [id]: !prev[id]
  }));
  const sectionsList = [{
    id: 'bookings',
    label: 'Bookings & Darshan'
  }, {
    id: 'queue',
    label: 'Queue Status'
  }, {
    id: 'demographics',
    label: 'Devotees Demographics'
  }, {
    id: 'vip',
    label: 'VIP Bookings'
  }, {
    id: 'qr',
    label: 'QR Verification Status'
  }, {
    id: 'completion',
    label: 'Darshan Completion Rate'
  }, {
    id: 'parking',
    label: 'Parking Management'
  }, {
    id: 'support',
    label: 'Support Requests'
  }, {
    id: 'revenue',
    label: 'Revenue Summary'
  }, {
    id: 'charts',
    label: 'Analytics Charts & Graphs'
  }];
  const visualizationsList = [{
    id: 'bar',
    label: 'Bar Charts (Volume)'
  }, {
    id: 'line',
    label: 'Line Graphs (Trends)'
  }, {
    id: 'pie',
    label: 'Pie/Donut Charts (Split)'
  }, {
    id: 'area',
    label: 'Area Map (Flow)'
  }];
  const getDateRangeParams = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let start = new Date(today);
    let end = new Date(today);
    switch (dateRange) {
      case 'Today':
        break;
      case 'Yesterday':
        start.setDate(today.getDate() - 1);
        end.setDate(today.getDate() - 1);
        break;
      case 'Last 7 Days':
        start.setDate(today.getDate() - 6);
        break;
      case 'Last 30 Days':
        start.setDate(today.getDate() - 29);
        break;
      case 'This Quarter':
        start = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1);
        break;
      case 'Custom':
        if (!startDate || !endDate) {
          throw new Error('Please select both start and end dates.');
        }
        start = new Date(startDate);
        end = new Date(endDate);
        break;
      default:
        start.setDate(today.getDate() - 6);
    }
    return {
      startDate: start.toISOString(),
      endDate: end.toISOString()
    };
  };
  const fetchReportData = async () => {
    setProgressText('Loading Sacred Data...');
    setProgressStep(1);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    try {
      const {
        startDate,
        endDate
      } = getDateRangeParams();
      const res = await fetch(`${API_URL}/reports/export?startDate=${startDate}&endDate=${endDate}`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!res.ok) {
        if (res.status === 500) throw new Error('Database connection failed or Internal Server Error');
        throw new Error('Export API unavailable or failed to fetch report data');
      }
      const data = await res.json();
      if (data.summary.totalBookings === 0 && data.summary.totalVIPs === 0 && data.summary.totalSupport === 0) {
        throw new Error('No data available for the selected date range.');
      }
      return data;
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        setError('Export request timed out. Database connection might be slow or failed.');
      } else {
        setError(err.message || 'An error occurred while fetching data.');
      }
      return null;
    }
  };
  const generateChartImage = (type, data, options) => {
    return new Promise((resolve, reject) => {
      let canvas, chart;
      try {
        canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 300;
        document.body.appendChild(canvas);
        chart = new Chart(canvas, {
          type,
          data,
          options: {
            ...options,
            animation: false,
            responsive: false,
            devicePixelRatio: 2
          },
          plugins: [{
            id: 'custom_canvas_background_color',
            beforeDraw: chart => {
              const ctx = chart.canvas.getContext('2d');
              ctx.save();
              ctx.globalCompositeOperation = 'destination-over';
              ctx.fillStyle = 'white';
              ctx.fillRect(0, 0, chart.width, chart.height);
              ctx.restore();
            }
          }]
        });
        setTimeout(() => {
          try {
            const imgBase64 = chart.toBase64Image();
            chart.destroy();
            canvas.remove();
            resolve(imgBase64);
          } catch (e) {
            if (chart) chart.destroy();
            if (canvas) canvas.remove();
            reject(e);
          }
        }, 100);
      } catch (err) {
        if (chart) chart.destroy();
        if (canvas) canvas.remove();
        reject(err);
      }
    });
  };
  const exportExcel = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchReportData();
      if (!data) return;
      setProgressText('Formatting Export File...');
      setProgressStep(3);
      const wb = XLSX.utils.book_new();
      if (selectedSections.bookings || selectedSections.queue || selectedSections.revenue) {
        const summaryData = [{
          Metric: 'Total Bookings',
          Value: data.summary.totalBookings
        }, {
          Metric: 'Completed Darshans',
          Value: data.summary.completedDarshans
        }, {
          Metric: 'Total VIPs',
          Value: data.summary.totalVIPs
        }, {
          Metric: 'Total Support Requests',
          Value: data.summary.totalSupport
        }, {
          Metric: 'Resolved Support Requests',
          Value: data.summary.resolvedSupport
        }, {
          Metric: 'Pending Queue',
          Value: data.summary.queueStatus?.pending || 0
        }, {
          Metric: 'In Queue',
          Value: data.summary.queueStatus?.inQueue || 0
        }];
        const summaryWS = XLSX.utils.json_to_sheet(summaryData);
        summaryWS['!cols'] = [{
          wch: 30
        }, {
          wch: 15
        }];
        XLSX.utils.book_append_sheet(wb, summaryWS, 'Summary');
      }
      if (selectedSections.bookings && data.bookings.length > 0) {
        const bookingsData = data.bookings.map(b => ({
          'Booking ID': b._id,
          'Full Name': b.fullName,
          'Mobile': b.mobile,
          'City': b.placeCity,
          'Persons': b.persons,
          'Vehicle Type': b.vehicleType,
          'Darshan Date': new Date(b.darshanDate).toLocaleDateString(),
          'Status': b.status,
          'Verification': b.verificationStatus
        }));
        const bookingsWS = XLSX.utils.json_to_sheet(bookingsData);
        XLSX.utils.book_append_sheet(wb, bookingsWS, 'Bookings');
      }
      if (selectedSections.vip && data.vipRequests.length > 0) {
        const vipData = data.vipRequests.map(v => ({
          'Token Number': v.tokenNumber,
          'Name': v.name,
          'Mobile': v.mobileNumber,
          'Category': v.category,
          'Persons': v.persons,
          'Expected Arrival': new Date(v.expectedArrivalTime).toLocaleString(),
          'Status': v.status
        }));
        const vipWS = XLSX.utils.json_to_sheet(vipData);
        XLSX.utils.book_append_sheet(wb, vipWS, 'VIP Requests');
      }
      if (selectedSections.support && data.supportRequests.length > 0) {
        const supportData = data.supportRequests.map(s => ({
          'Ticket ID': s.ticketId || s._id,
          'Name': s.fullName,
          'Subject': s.subject,
          'Status': s.status,
          'Date': new Date(s.createdAt).toLocaleDateString()
        }));
        const supportWS = XLSX.utils.json_to_sheet(supportData);
        XLSX.utils.book_append_sheet(wb, supportWS, 'Support Requests');
      }
      const fileName = `Samarth_Darshan_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
      onClose();
    } catch (err) {
      console.error(err);
      setError('Failed to generate Excel file.');
    } finally {
      setLoading(false);
    }
  };
  const exportPDF = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchReportData();
      if (!data) return;
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      setProgressText('Formatting Export File...');
      setProgressStep(2);
      doc.setFontSize(22);
      doc.setTextColor(152, 67, 0);
      doc.text('Samarth Darshan Portal', pageWidth / 2, 20, {
        align: 'center'
      });
      doc.setFontSize(16);
      doc.setTextColor(50, 50, 50);
      doc.text('Comprehensive Analytics Report', pageWidth / 2, 30, {
        align: 'center'
      });
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, pageWidth / 2, 40, {
        align: 'center'
      });
      doc.text(`Date Range: ${dateRange}`, pageWidth / 2, 45, {
        align: 'center'
      });
      if (selectedSections.bookings || selectedSections.queue || selectedSections.revenue) {
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('Summary Statistics', 14, 60);
        const summaryBody = [['Total Bookings', data.summary.totalBookings.toString()], ['Completed Darshans', data.summary.completedDarshans.toString()], ['Total VIPs', data.summary.totalVIPs.toString()], ['Total Support Requests', data.summary.totalSupport.toString()], ['Pending Queue', (data.summary.queueStatus?.pending || 0).toString()]];
        autoTable(doc, {
          startY: 65,
          head: [['Metric', 'Value']],
          body: summaryBody,
          theme: 'grid',
          headStyles: {
            fillColor: [152, 67, 0]
          }
        });
      }
      if (selectedSections.charts) {
        setProgressText('Generating Analytics Charts...');
        setProgressStep(2);
        let chartImages = [];
        if (selectedVisualizations.bar) {
          const dailyLabels = data.charts.dailyBookings.map(d => d.date);
          const dailyValues = data.charts.dailyBookings.map(d => d.count);
          const barChartImg = await generateChartImage('bar', {
            labels: dailyLabels.length ? dailyLabels : ['No Data'],
            datasets: [{
              label: 'Daily Bookings',
              data: dailyValues.length ? dailyValues : [0],
              backgroundColor: 'rgba(152, 67, 0, 0.7)'
            }]
          }, {
            plugins: {
              title: {
                display: true,
                text: 'Daily Bookings'
              }
            }
          });
          chartImages.push(barChartImg);
        }
        if (selectedVisualizations.line) {
          const monthlyLabels = data.charts.monthlyBookings.map(d => d.month);
          const monthlyValues = data.charts.monthlyBookings.map(d => d.count);
          const monthlyLineImg = await generateChartImage('line', {
            labels: monthlyLabels.length ? monthlyLabels : ['No Data'],
            datasets: [{
              label: 'Monthly Bookings',
              data: monthlyValues.length ? monthlyValues : [0],
              borderColor: '#984300',
              fill: false
            }]
          }, {
            plugins: {
              title: {
                display: true,
                text: 'Monthly Bookings'
              }
            }
          });
          chartImages.push(monthlyLineImg);
        }
        if (selectedVisualizations.pie) {
          const queueImg = await generateChartImage('pie', {
            labels: ['Pending', 'In Queue', 'Completed'],
            datasets: [{
              data: [data.summary.queueStatus?.pending || 0, data.summary.queueStatus?.inQueue || 0, data.summary.completedDarshans || 0],
              backgroundColor: ['#FF9933', '#3399FF', '#2D5A27']
            }]
          }, {
            plugins: {
              title: {
                display: true,
                text: 'Queue Status Distribution'
              }
            }
          });
          chartImages.push(queueImg);
          if (selectedSections.vip) {
            const vipImg = await generateChartImage('pie', {
              labels: ['Regular', 'VIP'],
              datasets: [{
                data: [data.charts.vipVsRegular.regular || 0, data.charts.vipVsRegular.vip || 0],
                backgroundColor: ['#984300', '#D4AF37']
              }]
            }, {
              plugins: {
                title: {
                  display: true,
                  text: 'VIP vs Regular Devotees'
                }
              }
            });
            chartImages.push(vipImg);
          }
        }
        if (chartImages.length > 0) {
          let finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 15 : 65;
          if (finalY > 200) {
            doc.addPage();
            finalY = 20;
          }
          doc.text('Data Visualizations', 14, finalY);
          chartImages.forEach((img, index) => {
            if (index % 2 === 0) {
              if (index > 0) finalY += 65;
              if (finalY > 220) {
                doc.addPage();
                finalY = 20;
              }
              doc.addImage(img, 'PNG', 14, finalY + 5, 80, 60);
            } else {
              doc.addImage(img, 'PNG', 110, finalY + 5, 80, 60);
            }
          });
        }
      }
      setProgressText('Formatting Export File...');
      setProgressStep(3);
      if (selectedSections.bookings && data.bookings.length > 0) {
        doc.addPage();
        doc.text('Recent Bookings', 14, 20);
        const bookingBody = data.bookings.slice(0, 50).map(b => [b.fullName, b.persons.toString(), new Date(b.darshanDate).toLocaleDateString(), b.status]);
        autoTable(doc, {
          startY: 25,
          head: [['Name', 'Persons', 'Date', 'Status']],
          body: bookingBody,
          theme: 'striped',
          headStyles: {
            fillColor: [152, 67, 0]
          }
        });
      }
      if (selectedSections.vip && data.vipRequests.length > 0) {
        const startY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 15 : 20;
        if (startY > 250) doc.addPage();
        doc.text('VIP Requests', 14, startY > 250 ? 20 : startY);
        const vipBody = data.vipRequests.map(v => [v.tokenNumber, v.name, v.category, v.status]);
        autoTable(doc, {
          startY: startY > 250 ? 25 : startY + 5,
          head: [['Token', 'Name', 'Category', 'Status']],
          body: vipBody,
          theme: 'striped',
          headStyles: {
            fillColor: [152, 67, 0]
          }
        });
      }
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, doc.internal.pageSize.height - 10, {
          align: 'center'
        });
      }
      const fileName = `Samarth_Darshan_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to generate PDF file.');
    } finally {
      setLoading(false);
    }
  };
  if (!isOpen) return null;
  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-background/40 backdrop-blur-[2px]">
      <div className="relative w-full max-w-6xl max-h-[95vh] bg-surface-container-lowest rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-outline-variant transition-all duration-300">
        
        {/* Header */}
        <div className="px-8 py-6 flex justify-between items-start border-b border-outline-variant bg-surface-container-low">
          <div>
            <h2 className="text-2xl font-extrabold text-on-surface tracking-tight">{t("exportReports")}</h2>
            <p className="text-sm text-on-surface-variant font-medium mt-1">{t("generateProfessionalReportsUsi")}</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors text-on-surface-variant">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row relative">
          
          {error && <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-red-50 text-red-700 px-4 py-3 rounded-lg shadow-lg flex items-start gap-2 border border-red-200">
              <span className="material-symbols-outlined text-[20px]">error</span>
              <p className="text-sm font-medium">{error}</p>
              <button onClick={() => setError('')} className="ml-4 hover:text-red-900"><span className="material-symbols-outlined text-sm">close</span></button>
            </div>}

          {/* Config Left Column */}
          <div className="flex-1 p-8 space-y-8 overflow-y-auto custom-scrollbar">
            
            {/* Export Format Selection */}
            <section>
              <h3 className="text-[11px] font-extrabold text-primary tracking-[0.1em] uppercase mb-4">{t("exportFormat")}</h3>
              <div className="grid grid-cols-2 gap-4">
                <label className="group cursor-pointer">
                  <input checked={exportFormat === 'excel'} onChange={() => setExportFormat('excel')} className="hidden peer" name="format" type="radio" value="excel" />
                  <div className="p-4 border-2 border-outline-variant rounded-xl peer-checked:border-primary peer-checked:bg-primary/5 transition-all flex items-center gap-4 hover:border-primary/50">
                    <div className="w-12 h-12 rounded-lg bg-[#217346]/10 flex items-center justify-center text-[#217346]">
                      <span className="material-symbols-outlined text-3xl">table_chart</span>
                    </div>
                    <div>
                      <div className="font-bold text-on-surface">{t("excelReport")}</div>
                      <div className="text-[11px] font-medium text-on-surface-variant">{t("xlsxFileFormat")}</div>
                    </div>
                    <div className="ml-auto opacity-0 peer-checked:opacity-100 text-primary">
                      <span className="material-symbols-outlined">check_circle</span>
                    </div>
                  </div>
                </label>
                <label className="group cursor-pointer">
                  <input checked={exportFormat === 'pdf'} onChange={() => setExportFormat('pdf')} className="hidden peer" name="format" type="radio" value="pdf" />
                  <div className="p-4 border-2 border-outline-variant rounded-xl peer-checked:border-primary peer-checked:bg-primary/5 transition-all flex items-center gap-4 hover:border-primary/50">
                    <div className="w-12 h-12 rounded-lg bg-[#E02424]/10 flex items-center justify-center text-[#E02424]">
                      <span className="material-symbols-outlined text-3xl">picture_as_pdf</span>
                    </div>
                    <div>
                      <div className="font-bold text-on-surface">{t("pdfDocument")}</div>
                      <div className="text-[11px] font-medium text-on-surface-variant">{t("readyForPrint")}</div>
                    </div>
                    <div className="ml-auto opacity-0 peer-checked:opacity-100 text-primary">
                      <span className="material-symbols-outlined">check_circle</span>
                    </div>
                  </div>
                </label>
              </div>
            </section>

            {/* Date Range */}
            <section>
              <h3 className="text-[11px] font-extrabold text-primary tracking-[0.1em] uppercase mb-4">{t("dateRange")}</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {['Today', 'Yesterday', 'Last 7 Days', 'Last 30 Days', 'This Quarter'].map(r => <button key={r} onClick={() => {
                setDateRange(r);
                setShowCustomDate(false);
              }} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${dateRange === r ? 'bg-primary text-white shadow-sm shadow-primary/20' : 'border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary'}`}>
                    {r}
                  </button>)}
              </div>
              
              <div onClick={() => {
              setDateRange('Custom');
              setShowCustomDate(true);
            }} className={`flex items-center gap-4 px-4 py-3.5 bg-surface-container-low rounded-xl border group hover:border-primary/50 transition-all cursor-pointer ${dateRange === 'Custom' ? 'border-primary' : 'border-outline-variant'}`}>
                <span className="material-symbols-outlined text-on-surface-variant">calendar_month</span>
                <span className="text-sm font-semibold">
                  {dateRange === 'Custom' && startDate && endDate ? `${startDate} to ${endDate}` : 'Custom Date Range'}
                </span>
                <button className="ml-auto text-primary font-extrabold text-[11px] uppercase tracking-wider">{t("change")}</button>
              </div>

              {showCustomDate && <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-on-surface-variant font-bold uppercase tracking-wider mb-2 block">{t("startDate")}</label>
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full p-3 bg-surface border border-outline-variant rounded-lg text-on-surface outline-none focus:border-primary text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-on-surface-variant font-bold uppercase tracking-wider mb-2 block">{t("endDate")}</label>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full p-3 bg-surface border border-outline-variant rounded-lg text-on-surface outline-none focus:border-primary text-sm" />
                  </div>
                </div>}
            </section>

            {/* Report Sections & Visualizations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <section>
                <h3 className="text-[11px] font-extrabold text-primary tracking-[0.1em] uppercase mb-4">{t("reportSections")}</h3>
                <div className="grid grid-cols-1 gap-y-3">
                  {sectionsList.map(s => <label key={s.id} className="flex items-center gap-3 cursor-pointer group">
                      <input type="checkbox" checked={selectedSections[s.id]} onChange={() => toggleSection(s.id)} className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary/20 transition-all" />
                      <span className="text-sm font-medium text-on-surface group-hover:text-primary transition-colors">{s.label}</span>
                    </label>)}
                </div>
              </section>

              <section>
                <h3 className="text-[11px] font-extrabold text-primary tracking-[0.1em] uppercase mb-4">{t("visualizations")}</h3>
                <div className="grid grid-cols-1 gap-y-3">
                  {visualizationsList.map(v => <label key={v.id} className="flex items-center gap-3 cursor-pointer group">
                      <input type="checkbox" checked={selectedVisualizations[v.id]} onChange={() => toggleVisualization(v.id)} className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary/20 transition-all" />
                      <span className="text-sm font-medium text-on-surface group-hover:text-primary transition-colors">{v.label}</span>
                    </label>)}
                </div>
              </section>
            </div>
          </div>

          {/* Preview Right Column */}
          <div className="w-full lg:w-[420px] bg-surface-container border-l border-outline-variant p-8 flex flex-col">
            <h3 className="text-[11px] font-extrabold text-primary tracking-[0.1em] uppercase mb-6">{t("reportPreview")}</h3>
            
            <div className="flex-1 bg-white shadow-2xl rounded-sm aspect-[1/1.4] w-full p-8 border border-outline-variant flex flex-col scale-100 transform origin-top hover:scale-[1.01] transition-transform duration-500 overflow-hidden relative">
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none rotate-[-35deg] text-6xl font-black whitespace-nowrap">{t("shreeDeviTemple")}</div>

              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary rounded flex items-center justify-center text-white font-extrabold text-sm">{t("sd")}</div>
                  <div>
                    <div className="text-[8px] font-black text-on-surface-variant/60 uppercase tracking-[0.1em]">{t("sacredOperations")}</div>
                    <div className="text-sm font-serif font-bold text-primary-variant leading-none">{t("sriDeviTemple")}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[8px] font-black text-primary uppercase">{t("performanceReport")}</div>
                  <div className="text-[8px] text-on-surface-variant">{t("selectedPeriod")}</div>
                </div>
              </div>

              <div className="h-[1px] w-full bg-primary/20 mb-6"></div>

              <div className="space-y-5 relative">
                <div className="space-y-2">
                  <div className="h-2 w-3/4 bg-surface-container rounded-full"></div>
                  <div className="h-2 w-full bg-surface-container-low rounded-full"></div>
                </div>

                {selectedSections.charts && <div className="h-32 bg-surface-container-lowest border border-outline-variant/30 rounded-lg flex items-end justify-center p-4 gap-2 overflow-hidden">
                    <div className="w-1/6 bg-primary/20 h-[60%] rounded-t-sm"></div>
                    <div className="w-1/6 bg-primary/40 h-[45%] rounded-t-sm"></div>
                    <div className="w-1/6 bg-primary/60 h-[80%] rounded-t-sm"></div>
                    <div className="w-1/6 bg-primary/30 h-[30%] rounded-t-sm"></div>
                    <div className="w-1/6 bg-primary h-[100%] rounded-t-sm"></div>
                    <div className="w-1/6 bg-primary/50 h-[65%] rounded-t-sm"></div>
                  </div>}

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-surface-container-low border border-outline-variant/30 rounded-lg text-center h-16"></div>
                  <div className="p-3 bg-surface-container-low border border-outline-variant/30 rounded-lg text-center h-16"></div>
                </div>

                <div className="space-y-2 mt-4">
                  <div className="h-1.5 w-full bg-surface-container-low rounded-full"></div>
                  <div className="h-1.5 w-5/6 bg-surface-container-low rounded-full"></div>
                  <div className="h-1.5 w-4/6 bg-surface-container-low rounded-full"></div>
                </div>
              </div>

              <div className="mt-auto pt-4 flex justify-between items-center text-[7px] text-on-surface-variant/40 font-bold border-t border-outline-variant/10">
                <div>{t("generatedByAdmin")}</div>
                <div>{t("page1Of12")}</div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-3">
              <button onClick={exportExcel} disabled={loading} className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border-2 border-[#217346] text-[#217346] font-extrabold text-sm hover:bg-[#217346] hover:text-white transition-all active:scale-[0.98] shadow-sm disabled:opacity-50">
                <span className="material-symbols-outlined text-xl">table_chart</span>{t("exportAsExcel")}</button>
              <button onClick={exportPDF} disabled={loading} className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border-2 border-[#E02424] text-[#E02424] font-extrabold text-sm hover:bg-[#E02424] hover:text-white transition-all active:scale-[0.98] shadow-sm disabled:opacity-50">
                <span className="material-symbols-outlined text-xl">picture_as_pdf</span>{t("exportAsPdf")}</button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-outline-variant bg-surface-container-low flex justify-between items-center relative z-10">
          <button onClick={() => {
          setExportFormat('excel');
          setDateRange('Last 7 Days');
          setSelectedSections({
            bookings: true,
            queue: true,
            demographics: true,
            vip: false,
            qr: false,
            completion: false,
            parking: false,
            support: false,
            revenue: true,
            charts: true
          });
          setSelectedVisualizations({
            bar: true,
            line: true,
            pie: false,
            area: false
          });
        }} className="text-on-surface-variant font-bold text-sm hover:text-on-surface transition-colors flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">restart_alt</span>{t("resetSettings")}</button>
          <div className="flex gap-4">
            <button onClick={onClose} className="px-6 py-2.5 rounded-xl font-bold text-on-surface-variant text-sm hover:bg-surface-container-high transition-all">
              Cancel
            </button>
            <button onClick={() => exportFormat === 'excel' ? exportExcel() : exportPDF()} disabled={loading} className="px-8 py-2.5 rounded-xl bg-primary text-white font-extrabold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50">{t("generateReport")}</button>
          </div>
        </div>

        {/* Generation Progress Overlay */}
        <div className={`absolute inset-0 bg-surface-container-lowest/95 backdrop-blur-xl z-20 flex flex-col items-center justify-center transition-opacity duration-500 ${loading ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
          <div className="w-full max-w-md p-8 text-center">
            <div className="mb-10 relative">
              <div className="w-24 h-24 border-4 border-outline-variant rounded-full mx-auto flex items-center justify-center bg-white shadow-xl">
                <span className="material-symbols-outlined text-5xl text-primary animate-pulse">analytics</span>
              </div>
              <div className="absolute inset-0 w-24 h-24 border-t-4 border-primary rounded-full animate-spin mx-auto"></div>
            </div>
            <h2 className="text-2xl font-extrabold text-on-surface mb-3 tracking-tight">{t("compilingReport")}</h2>
            <p className="text-sm font-medium text-on-surface-variant mb-10">{progressText}</p>
            
            <div className="w-full h-2.5 bg-surface-container rounded-full overflow-hidden mb-8 relative border border-outline-variant/30">
              <div className="absolute left-0 top-0 h-full bg-primary shimmer transition-all duration-700 ease-out" style={{
              width: `${progressStep * 33}%`
            }}></div>
            </div>
            
            <div className="text-left space-y-5 px-4 max-w-[280px] mx-auto">
              <div className={`flex items-center gap-4 transition-all duration-300 ${progressStep >= 1 ? 'opacity-100' : 'opacity-25'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black ${progressStep >= 1 ? 'bg-primary text-white' : 'bg-surface-container-highest text-on-surface-variant'}`}>1</div>
                <span className={`text-sm ${progressStep >= 1 ? 'font-extrabold' : 'font-bold'} text-on-surface`}>{t("loadingSacredData")}</span>
              </div>
              <div className={`flex items-center gap-4 transition-all duration-300 ${progressStep >= 2 ? 'opacity-100' : 'opacity-25'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black ${progressStep >= 2 ? 'bg-primary text-white' : 'bg-surface-container-highest text-on-surface-variant'}`}>2</div>
                <span className={`text-sm ${progressStep >= 2 ? 'font-extrabold' : 'font-bold'} text-on-surface`}>{t("generatingAnalyticsCharts")}</span>
              </div>
              <div className={`flex items-center gap-4 transition-all duration-300 ${progressStep >= 3 ? 'opacity-100' : 'opacity-25'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black ${progressStep >= 3 ? 'bg-primary text-white' : 'bg-surface-container-highest text-on-surface-variant'}`}>3</div>
                <span className={`text-sm ${progressStep >= 3 ? 'font-extrabold' : 'font-bold'} text-on-surface`}>{t("formattingExportFile")}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>;
}