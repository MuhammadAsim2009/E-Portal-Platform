import React from 'react';
import { 
  CheckCircle, AlertCircle, Download, CreditCard, 
  ChevronRight, Building, Smartphone, Wallet, 
  Mail, Phone, Clock 
} from 'lucide-react';

const StudentFinance = ({ 
  fees, 
  unpaidFees, 
  setShowPaymentModal, 
  handleDownloadReceipt,
  siteSettings = {}
}) => {
  const siteName = siteSettings?.siteName || 'E-Portal';
  const contactEmail = siteSettings?.contactEmail || 'finance@eportal.edu';
  const contactPhone = siteSettings?.contactPhone || '';

  // Parse multiline payment detail strings into display lines
  const parseDetails = (str) =>
    str ? str.split('\n').filter(Boolean) : [];

  const bankLines = parseDetails(siteSettings?.bankDetails);
  const easyLines = parseDetails(siteSettings?.easypaisaDetails);
  const jazzLines = parseDetails(siteSettings?.jazzcashDetails);

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500 pb-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Financial Ledger Table */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-base font-bold text-slate-900 tracking-tight uppercase">Financial Ledger</h2>
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-200 rounded-full">
              <div className="w-2 h-2 bg-emerald-500 rounded-full" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Statement</span>
            </div>
          </div>

          <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full">
              <thead>
                <tr className="text-left text-[10px] font-bold text-slate-400 border-b border-slate-100 uppercase tracking-[0.2em]">
                  <th className="pb-6">Description</th>
                  <th className="pb-6">Summary</th>
                  <th className="pb-6">Amount</th>
                  <th className="pb-6">Status</th>
                  <th className="pb-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {fees && fees.length > 0 ? fees.map((f) => (
                  <tr key={f.fee_id} className="group hover:bg-slate-50/50 transition-all">
                    <td className="py-6 pr-4">
                      <p className="font-bold text-slate-900 text-sm tracking-tight">{f.semester || 'Section Fee'}</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Ref: {f.fee_type || 'General'}</p>
                    </td>
                    <td className="py-6">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-medium text-slate-400 flex items-center gap-2">Base: <span className="text-slate-600">PKR {parseFloat(f.amount).toLocaleString()}</span></span>
                        {f.discount_amount > 0 && (
                          <span className="text-[10px] font-medium text-emerald-600 flex items-center gap-2">Disc: <span>-PKR {parseFloat(f.discount_amount).toLocaleString()}</span></span>
                        )}
                      </div>
                    </td>
                    <td className="py-6 font-bold text-slate-900 text-sm">PKR {parseFloat(f.net_amount || f.amount).toLocaleString()}</td>
                    <td className="py-6">
                      {f.status === 'paid' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-bold border border-emerald-100 uppercase tracking-wider">
                          <CheckCircle size={10} /> Settled
                        </span>
                      ) : f.status === 'waived' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-bold border border-indigo-100 uppercase tracking-wider">
                          Waived
                        </span>
                      ) : f.last_payment_status === 'pending' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 rounded-lg text-[9px] font-bold border border-amber-100 uppercase tracking-wider">
                          <Clock size={10} /> Verifying
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-600 rounded-lg text-[9px] font-bold border border-rose-100 uppercase tracking-wider">
                          <AlertCircle size={10} /> Unpaid
                        </span>
                      )}
                    </td>
                    <td className="py-6 text-right">
                      {f.status === 'paid' ? (
                        <button 
                          onClick={() => handleDownloadReceipt(f)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" 
                          title="Download Receipt"
                        >
                          <Download size={16} />
                        </button>
                      ) : (f.status === 'pending' && f.last_payment_status !== 'pending') && (
                        <button 
                          onClick={() => setShowPaymentModal(f)}
                          className="py-2 px-4 bg-slate-900 text-white rounded-xl text-[9px] font-bold tracking-widest hover:bg-indigo-600 transition-all shadow-md shadow-slate-100 uppercase"
                        >
                          Pay Now
                        </button>
                      )}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-slate-300 text-xs font-bold uppercase tracking-widest">
                      No fee records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">

          {/* Payment Methods Card */}
          <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl shadow-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-900/50">
                <CreditCard size={20} />
              </div>
              <h3 className="font-bold text-lg tracking-tight">Payment Channels</h3>
            </div>
            <p className="text-xs text-slate-400 font-medium mb-6 leading-relaxed opacity-80">
              Use any of the following channels to make your payment. Upload your receipt to confirm.
            </p>

            <div className="space-y-4">

              {/* Bank */}
              {bankLines.length > 0 && (
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 bg-blue-500/20 rounded-lg flex items-center justify-center border border-blue-500/30">
                      <Building size={12} className="text-blue-400" />
                    </div>
                    <span className="font-bold text-slate-200 tracking-tight text-xs">Bank Transfer</span>
                  </div>
                  <div className="space-y-1 pl-9">
                    {bankLines.map((line, i) => (
                      <p key={i} className="text-[10px] text-slate-400 font-mono leading-relaxed">{line}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* EasyPaisa */}
              {easyLines.length > 0 && (
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 bg-emerald-500/20 rounded-lg flex items-center justify-center border border-emerald-500/30">
                      <Smartphone size={12} className="text-emerald-400" />
                    </div>
                    <span className="font-bold text-slate-200 tracking-tight text-xs">EasyPaisa</span>
                  </div>
                  <div className="space-y-1 pl-9">
                    {easyLines.map((line, i) => (
                      <p key={i} className="text-[10px] text-slate-400 font-mono leading-relaxed">{line}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* JazzCash */}
              {jazzLines.length > 0 && (
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 bg-rose-500/20 rounded-lg flex items-center justify-center border border-rose-500/30">
                      <Wallet size={12} className="text-rose-400" />
                    </div>
                    <span className="font-bold text-slate-200 tracking-tight text-xs">JazzCash</span>
                  </div>
                  <div className="space-y-1 pl-9">
                    {jazzLines.map((line, i) => (
                      <p key={i} className="text-[10px] text-slate-400 font-mono leading-relaxed">{line}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Fallback if nothing configured */}
              {bankLines.length === 0 && easyLines.length === 0 && jazzLines.length === 0 && (
                <p className="text-[11px] text-slate-500 text-center py-4">
                  Payment details will appear here once configured by admin.
                </p>
              )}
            </div>
          </div>

          {/* Support Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Finance Support</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed mb-3">
              Having trouble with a transaction? Contact the finance department at {siteName}.
            </p>
            {contactEmail && (
              <a href={`mailto:${contactEmail}`} className="flex items-center gap-2 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors mb-2">
                <Mail size={12} />
                {contactEmail}
              </a>
            )}
            {contactPhone && (
              <div className="flex items-center gap-2 text-[11px] font-bold text-slate-700">
                <Phone size={12} />
                {contactPhone}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentFinance;
