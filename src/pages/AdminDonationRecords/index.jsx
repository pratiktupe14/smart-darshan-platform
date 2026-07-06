import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

export default function AdminDonationRecords() {
  const { t } = useLanguage();

  return (
    <main className="px-4 md:px-10 py-6 max-w-[1600px] mx-auto w-full">
      {/* Top Header */}
      <header className="flex justify-between items-center w-full border-b border-outline-variant pb-4 mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-primary">Donation Records</h2>
          <p className="text-sm md:text-base text-on-surface-variant mt-1">Oversee sanctuary contributions and financial devotion.</p>
        </div>
      </header>

      {/* Summary Cards Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Card 1 */}
        <div className="bg-white p-6 rounded-2xl border border-outline-variant shadow-sm flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <div className="p-3 rounded-xl bg-primary/10 text-primary">
              <span className="material-symbols-outlined filled-icon">payments</span>
            </div>
            <div className="flex items-center gap-1 text-sm font-bold text-green-600">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              12%
            </div>
          </div>
          <div className="mt-2">
            <p className="text-xs uppercase tracking-wider text-on-surface-variant font-bold mb-1">Total Donations</p>
            <p className="text-3xl font-bold text-on-surface">12,482</p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-6 rounded-2xl border border-outline-variant shadow-sm flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <div className="p-3 rounded-xl bg-primary/10 text-primary">
              <span className="material-symbols-outlined filled-icon">calendar_today</span>
            </div>
            <div className="flex items-center gap-1 text-sm font-bold text-green-600">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              5%
            </div>
          </div>
          <div className="mt-2">
            <p className="text-xs uppercase tracking-wider text-on-surface-variant font-bold mb-1">Today's Donations</p>
            <p className="text-3xl font-bold text-on-surface">156</p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-6 rounded-2xl border border-outline-variant shadow-sm flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <div className="p-3 rounded-xl bg-primary/10 text-primary">
              <span className="material-symbols-outlined filled-icon">event_note</span>
            </div>
            <div className="flex items-center gap-1 text-sm font-bold text-red-600">
              <span className="material-symbols-outlined text-sm">trending_down</span>
              2%
            </div>
          </div>
          <div className="mt-2">
            <p className="text-xs uppercase tracking-wider text-on-surface-variant font-bold mb-1">Monthly Donations</p>
            <p className="text-3xl font-bold text-on-surface">3,892</p>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-6 rounded-2xl border border-outline-variant shadow-sm flex flex-col gap-2">
          <div className="flex justify-between items-start">
            <div className="p-3 rounded-xl bg-primary/10 text-primary">
              <span className="material-symbols-outlined filled-icon">currency_rupee</span>
            </div>
            <div className="flex items-center gap-1 text-sm font-bold text-green-600">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              18%
            </div>
          </div>
          <div className="mt-2">
            <p className="text-xs uppercase tracking-wider text-on-surface-variant font-bold mb-1">Total Amount Collected</p>
            <p className="text-3xl font-bold text-on-surface">₹4.2M</p>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="bg-surface-container-low p-6 rounded-2xl border border-outline-variant mb-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
              <input 
                className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none text-sm" 
                placeholder="Search by Donor Name, Receipt or Transaction ID..." 
                type="text" 
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <button className="flex-1 md:flex-none px-6 py-3 bg-primary text-white rounded-xl font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-sm">filter_alt</span>
                Search
              </button>
              <button className="flex-1 md:flex-none px-6 py-3 border border-outline-variant text-on-surface-variant rounded-xl font-bold hover:bg-surface-container-highest transition-colors">
                Reset
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <select className="px-4 py-2.5 bg-white rounded-lg border border-outline-variant text-sm outline-none focus:border-primary">
              <option>Status</option>
              <option>Completed</option>
              <option>Pending</option>
              <option>Failed</option>
            </select>
            <select className="px-4 py-2.5 bg-white rounded-lg border border-outline-variant text-sm outline-none focus:border-primary">
              <option>Purpose</option>
              <option>Annadhanam</option>
              <option>Abhishekam</option>
              <option>Temple Construction</option>
            </select>
            <select className="px-4 py-2.5 bg-white rounded-lg border border-outline-variant text-sm outline-none focus:border-primary">
              <option>Method</option>
              <option>UPI</option>
              <option>Net Banking</option>
              <option>Cash</option>
              <option>Card</option>
            </select>
            <input className="px-4 py-2.5 bg-white rounded-lg border border-outline-variant text-sm outline-none focus:border-primary" type="date" />
            
            <div className="col-span-2 flex justify-end gap-2">
              <button className="flex-1 md:flex-none px-4 py-2.5 bg-secondary-container text-on-secondary-container rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-secondary-fixed transition-colors">
                <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
                Export PDF
              </button>
              <button className="flex-1 md:flex-none px-4 py-2.5 border border-secondary text-secondary rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-secondary-container hover:text-on-secondary-container transition-colors">
                <span className="material-symbols-outlined text-sm">table_view</span>
                Export Excel
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Donation Table */}
      <section className="bg-white rounded-2xl border border-outline-variant overflow-hidden mb-8 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="bg-surface-container-low text-on-surface-variant uppercase text-[10px] tracking-widest font-bold">
              <tr>
                <th className="px-6 py-4 border-b border-outline-variant">Receipt No</th>
                <th className="px-6 py-4 border-b border-outline-variant">Transaction ID</th>
                <th className="px-6 py-4 border-b border-outline-variant">Donor Name</th>
                <th className="px-6 py-4 border-b border-outline-variant">Amount</th>
                <th className="px-6 py-4 border-b border-outline-variant">Purpose</th>
                <th className="px-6 py-4 border-b border-outline-variant">Method</th>
                <th className="px-6 py-4 border-b border-outline-variant">Status</th>
                <th className="px-6 py-4 border-b border-outline-variant">Date/Time</th>
                <th className="px-6 py-4 border-b border-outline-variant text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {/* Table Row 1 */}
              <tr className="hover:bg-surface-container-low transition-colors group">
                <td className="px-6 py-4 border-b border-outline-variant font-bold text-primary">#RCPT-8821</td>
                <td className="px-6 py-4 border-b border-outline-variant font-mono text-xs">TXN902381230</td>
                <td className="px-6 py-4 border-b border-outline-variant">
                  <div className="flex flex-col">
                    <span className="font-bold text-on-surface">Rajesh Iyer</span>
                    <span className="text-xs text-on-surface-variant">+91 98765 43210</span>
                  </div>
                </td>
                <td className="px-6 py-4 border-b border-outline-variant font-bold">₹5,001.00</td>
                <td className="px-6 py-4 border-b border-outline-variant">
                  <span className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded uppercase">Annadhanam</span>
                </td>
                <td className="px-6 py-4 border-b border-outline-variant">
                  <div className="flex items-center gap-1 text-xs font-medium">
                    <span className="material-symbols-outlined text-sm">qr_code_2</span>
                    UPI
                  </div>
                </td>
                <td className="px-6 py-4 border-b border-outline-variant">
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded-full uppercase">Completed</span>
                </td>
                <td className="px-6 py-4 border-b border-outline-variant text-on-surface-variant text-xs">12 Oct 2023, 09:15 AM</td>
                <td className="px-6 py-4 border-b border-outline-variant text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 rounded bg-surface hover:text-primary transition-colors border border-outline-variant"><span className="material-symbols-outlined text-sm">visibility</span></button>
                    <button className="p-1.5 rounded bg-surface hover:text-primary transition-colors border border-outline-variant"><span className="material-symbols-outlined text-sm">download</span></button>
                    <button className="p-1.5 rounded bg-surface hover:text-primary transition-colors border border-outline-variant"><span className="material-symbols-outlined text-sm">print</span></button>
                  </div>
                </td>
              </tr>
              
              {/* Table Row 2 */}
              <tr className="hover:bg-surface-container-low transition-colors group">
                <td className="px-6 py-4 border-b border-outline-variant font-bold text-primary">#RCPT-8822</td>
                <td className="px-6 py-4 border-b border-outline-variant font-mono text-xs">TXN902381245</td>
                <td className="px-6 py-4 border-b border-outline-variant">
                  <div className="flex flex-col">
                    <span className="font-bold text-on-surface">Meera Deshmukh</span>
                    <span className="text-xs text-on-surface-variant">+91 91234 56789</span>
                  </div>
                </td>
                <td className="px-6 py-4 border-b border-outline-variant font-bold">₹11,000.00</td>
                <td className="px-6 py-4 border-b border-outline-variant">
                  <span className="px-2 py-1 bg-secondary/10 text-secondary text-[10px] font-bold rounded uppercase">Construction</span>
                </td>
                <td className="px-6 py-4 border-b border-outline-variant">
                  <div className="flex items-center gap-1 text-xs font-medium">
                    <span className="material-symbols-outlined text-sm">account_balance</span>
                    Bank Transfer
                  </div>
                </td>
                <td className="px-6 py-4 border-b border-outline-variant">
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-[10px] font-bold rounded-full uppercase">Pending</span>
                </td>
                <td className="px-6 py-4 border-b border-outline-variant text-on-surface-variant text-xs">12 Oct 2023, 10:30 AM</td>
                <td className="px-6 py-4 border-b border-outline-variant text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 rounded bg-surface hover:text-primary transition-colors border border-outline-variant"><span className="material-symbols-outlined text-sm">visibility</span></button>
                    <button className="p-1.5 rounded bg-surface hover:text-primary transition-colors border border-outline-variant"><span className="material-symbols-outlined text-sm">download</span></button>
                    <button className="p-1.5 rounded bg-surface hover:text-primary transition-colors border border-outline-variant"><span className="material-symbols-outlined text-sm">print</span></button>
                  </div>
                </td>
              </tr>

              {/* Table Row 3 */}
              <tr className="hover:bg-surface-container-low transition-colors group">
                <td className="px-6 py-4 border-b border-outline-variant font-bold text-primary">#RCPT-8823</td>
                <td className="px-6 py-4 border-b border-outline-variant font-mono text-xs">TXN902381266</td>
                <td className="px-6 py-4 border-b border-outline-variant">
                  <div className="flex flex-col">
                    <span className="font-bold text-on-surface">Amit Kulkarni</span>
                    <span className="text-xs text-on-surface-variant">+91 99887 76655</span>
                  </div>
                </td>
                <td className="px-6 py-4 border-b border-outline-variant font-bold">₹501.00</td>
                <td className="px-6 py-4 border-b border-outline-variant">
                  <span className="px-2 py-1 bg-orange-100 text-orange-700 text-[10px] font-bold rounded uppercase">Daily Pooja</span>
                </td>
                <td className="px-6 py-4 border-b border-outline-variant">
                  <div className="flex items-center gap-1 text-xs font-medium">
                    <span className="material-symbols-outlined text-sm">payments</span>
                    Cash
                  </div>
                </td>
                <td className="px-6 py-4 border-b border-outline-variant">
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded-full uppercase">Completed</span>
                </td>
                <td className="px-6 py-4 border-b border-outline-variant text-on-surface-variant text-xs">12 Oct 2023, 11:45 AM</td>
                <td className="px-6 py-4 border-b border-outline-variant text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 rounded bg-surface hover:text-primary transition-colors border border-outline-variant"><span className="material-symbols-outlined text-sm">visibility</span></button>
                    <button className="p-1.5 rounded bg-surface hover:text-primary transition-colors border border-outline-variant"><span className="material-symbols-outlined text-sm">download</span></button>
                    <button className="p-1.5 rounded bg-surface hover:text-primary transition-colors border border-outline-variant"><span className="material-symbols-outlined text-sm">print</span></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 bg-surface-container-low border-t border-outline-variant">
          <span className="text-sm text-on-surface-variant font-medium">Showing 1 to 10 of 2,482 entries</span>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 border border-outline-variant rounded-lg hover:bg-white transition-colors disabled:opacity-50 text-sm font-medium" disabled>Previous</button>
            <button className="px-3 py-1.5 bg-primary text-white rounded-lg font-bold text-sm">1</button>
            <button className="px-3 py-1.5 border border-outline-variant rounded-lg hover:bg-white transition-colors text-sm font-medium">2</button>
            <button className="px-3 py-1.5 border border-outline-variant rounded-lg hover:bg-white transition-colors text-sm font-medium">3</button>
            <button className="px-3 py-1.5 border border-outline-variant rounded-lg hover:bg-white transition-colors text-sm font-medium">Next</button>
          </div>
        </div>
      </section>

      {/* Analytics Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Donation Trends Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-outline-variant shadow-sm flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-lg font-bold text-on-surface">Donation Trends</h3>
              <p className="text-sm text-on-surface-variant mt-1">Visual tracking of daily and weekly contribution flows.</p>
            </div>
            <div className="flex gap-2 bg-surface-container-low p-1 rounded-lg border border-outline-variant">
              <button className="px-4 py-1.5 bg-white shadow-sm rounded text-xs font-bold text-primary">Daily</button>
              <button className="px-4 py-1.5 rounded text-xs font-medium text-on-surface-variant hover:text-primary transition-colors">Weekly</button>
            </div>
          </div>
          
          <div className="flex-1 flex items-center justify-center bg-surface-container-lowest rounded-xl border border-dashed border-outline-variant min-h-[200px]">
            <p className="text-on-surface-variant text-sm flex items-center gap-2">
              <span className="material-symbols-outlined">bar_chart</span>
              Chart Visualization Placeholder
            </p>
          </div>
        </div>
        
        {/* Top Purposes */}
        <div className="bg-white p-6 rounded-2xl border border-outline-variant shadow-sm flex flex-col">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-on-surface">Top Purposes</h3>
            <p className="text-sm text-on-surface-variant mt-1">Distribution of donations by category.</p>
          </div>
          <div className="flex-1 flex flex-col justify-center gap-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-bold">Annadhanam</span>
                <span className="text-on-surface-variant font-mono">45%</span>
              </div>
              <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: '45%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-bold">Temple Construction</span>
                <span className="text-on-surface-variant font-mono">30%</span>
              </div>
              <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
                <div className="h-full bg-secondary" style={{ width: '30%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-bold">Daily Pooja</span>
                <span className="text-on-surface-variant font-mono">15%</span>
              </div>
              <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
                <div className="h-full bg-tertiary" style={{ width: '15%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-bold">Others</span>
                <span className="text-on-surface-variant font-mono">10%</span>
              </div>
              <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
                <div className="h-full bg-outline-variant" style={{ width: '10%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
