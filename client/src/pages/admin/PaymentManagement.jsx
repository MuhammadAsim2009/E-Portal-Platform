import { useState, useEffect } from 'react';
import { 
  Search, Filter, Download as DownloadIcon, MoreVertical, 
  CheckCircle, XCircle, Clock, DollarSign, User, Calendar,
  ChevronRight, ArrowUpDown, CreditCard, ChevronDown, CheckCircle2, Layers
} from 'lucide-react';
import api from '../../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Eye, Printer, X, FileText } from 'lucide-react';

const PaymentManagement = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  const fetchPayments = async () => {
    try {
      const res = await api.get('/admin/payments');
      setPayments(res.data);
    } catch (err) {
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    setActionLoading(id);
    try {
      await api.patch(`/admin/payments/${id}/status`, { status });
      setPayments(payments.map(p => p.payment_id === id ? { ...p, status } : p));
    } catch (err) {
      console.error('Error updating payment status:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleExportPDF = () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF();
      
      // Institutional Header
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 210, 30, 'F');
      
      doc.setFontSize(20);
      doc.setTextColor(255, 255, 255);
      doc.text('INSTITUTIONAL PAYMENT LEDGER', 14, 20);
      
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 27);

      const tableData = filteredPayments.map(p => [
        p.transaction_id || 'N/A',
        p.student_name,
        p.fee_type || 'General Fee',
        `Rs. ${parseFloat(p.amount_paid).toLocaleString()}`,
        new Date(p.payment_date).toLocaleDateString(),
        p.status.toUpperCase()
      ]);

      autoTable(doc, {
        startY: 40,
        head: [['TX ID', 'STUDENT', 'FEE TYPE', 'AMOUNT', 'DATE', 'STATUS']],
        body: tableData,
        headStyles: { fillColor: [15, 23, 42] },
        styles: { fontSize: 8 }
      });

      doc.save(`EPortal_Payments_${new Date().getTime()}.pdf`);
    } catch (err) {
      console.error('PDF Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrintInvoice = (payment) => {
    const printWindow = window.open('', '_blank');
    const content = `
      <html>
        <head>
          <title>Invoice - ${payment.transaction_id}</title>
          <style>
            @page { size: 80mm 200mm; margin: 0; }
            body { 
              width: 80mm; 
              padding: 10px; 
              font-family: 'Courier New', Courier, monospace; 
              font-size: 12px; 
              line-height: 1.4;
              color: #000;
            }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 1px dashed #000; padding-bottom: 10px; }
            .header h1 { font-size: 18px; margin: 0; }
            .row { display: flex; justify-content: space-between; margin-bottom: 5px; }
            .label { font-weight: bold; }
            .footer { margin-top: 20px; border-top: 1px dashed #000; padding-top: 10px; text-align: center; }
            .total { border-top: 2px solid #000; margin-top: 10px; padding-top: 5px; font-weight: bold; font-size: 14px; }
            .logo { font-size: 24px; font-weight: 900; letter-spacing: -1px; margin-bottom: 5px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">E-PORTAL</div>
            <div>INSTITUTIONAL FEE VOUCHER</div>
            <div>${new Date(payment.payment_date).toLocaleString()}</div>
          </div>
          
          <div class="row"><span class="label">TXID:</span> <span>${payment.transaction_id || 'N/A'}</span></div>
          <div class="row"><span class="label">STUDENT:</span> <span>${payment.student_name}</span></div>
          <div class="row"><span class="label">EMAIL:</span> <span>${payment.student_email}</span></div>
          <div class="row"><span class="label">SEMESTER:</span> <span>${payment.semester}</span></div>
          <div class="row"><span class="label">TYPE:</span> <span>${payment.fee_type || 'General Fee'}</span></div>
          <div class="row"><span class="label">METHOD:</span> <span>${payment.payment_method}</span></div>
          
          <div class="row total">
            <span>AMOUNT PAID:</span>
            <span>Rs. ${parseFloat(payment.amount_paid).toLocaleString()}</span>
          </div>

          <div class="footer">
            <div style="font-weight: bold">STATUS: ${payment.status.toUpperCase()}</div>
            <div style="margin-top: 10px">This is a computer generated receipt.</div>
            <div>Thank you for using E-Portal.</div>
          </div>

          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() { window.close(); };
            };
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(content);
    printWindow.document.close();
  };

  const statusColors = {
    pending: 'bg-amber-50 text-amber-600 border-amber-100',
    accepted: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    rejected: 'bg-rose-50 text-rose-600 border-rose-100'
  };

  const filteredPayments = payments.filter(p => {
    const matchesSearch = p.student_name.toLowerCase().includes(search.toLowerCase()) || 
                          p.transaction_id?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterStatus === 'all' || p.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (loading) return (
    <div className="p-12 flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <div className="w-12 h-12 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin" />
      <p className="text-slate-400 font-bold text-xs tracking-widest uppercase">Syncing Financial Stream...</p>
    </div>
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Financial Reconciliation</h1>
          <p className="text-slate-500 font-medium mt-1 flex items-center gap-2 text-sm">
            <CreditCard size={16} className="text-indigo-500" />
            Vesting and verification of student funds
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportPDF}
            disabled={isExporting}
            className="flex items-center gap-2.5 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold text-[13px] hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50"
          >
            {isExporting ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FileText size={16} />}
            {isExporting ? 'Exporting...' : 'Export Records (PDF)'}
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Pending Verification', value: payments.filter(p => p.status === 'pending').length, icon: Clock, color: 'indigo' },
          { label: 'Accepted Today', value: payments.filter(p => p.status === 'accepted' && new Date(p.payment_date).toDateString() === new Date().toDateString()).length, icon: CheckCircle2, color: 'emerald' },
          { label: 'Gross Revenue', value: `Rs ${payments.reduce((acc, curr) => acc + parseFloat(curr.amount_paid), 0).toLocaleString()}`, icon: CreditCard, color: 'violet' }
        ].map((stat, idx) => (
          <div key={idx} className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</span>
              <stat.icon size={18} className={`text-${stat.color}-500/50 group-hover:scale-110 transition-transform`} />
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight uppercase">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 flex flex-col md:flex-row items-center gap-4 shadow-sm">
        <div className="relative flex-1 group w-full">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search by student or TXID..."
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border-transparent border focus:border-indigo-500 rounded-2xl text-sm transition-all focus:bg-white focus:outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 p-1 bg-slate-50 rounded-2xl w-full md:w-auto">
          {['all', 'pending', 'accepted', 'rejected'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterStatus === s ? 'bg-white text-indigo-600 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Transaction & Student</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Fee Type</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Amount</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.length > 0 ? (
                filteredPayments.map((p) => (
                  <tr key={p.payment_id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center font-bold text-xs border border-slate-200 shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                          <CreditCard size={16} />
                        </div>
                        <div>
                          <div className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{p.student_name}</div>
                          <div className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider flex items-center gap-1.5 leading-none">
                            TXID: <span className="text-slate-500 font-mono tracking-normal lowercase">{p.transaction_id || 'n/a'}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-[11px] font-black text-slate-700 uppercase tracking-widest">{p.fee_type || 'General Fee'}</div>
                      <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{p.semester} - {p.payment_method}</div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="text-sm font-black text-slate-900 items-center justify-center flex tabular-nums">
                        Rs ${parseFloat(p.amount_paid).toLocaleString()}
                      </div>
                      <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Confirmed Yield</div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusColors[p.status] || 'bg-slate-100 text-slate-500'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {p.status === 'pending' && (
                          <>
                            <button 
                              disabled={actionLoading === p.payment_id}
                              onClick={() => handleStatusUpdate(p.payment_id, 'accepted')}
                              className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-all disabled:opacity-50 border border-emerald-100/50"
                              title="Accept Payment"
                            >
                              <CheckCircle size={16} />
                            </button>
                            <button 
                              disabled={actionLoading === p.payment_id}
                              onClick={() => handleStatusUpdate(p.payment_id, 'rejected')}
                              className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg transition-all disabled:opacity-50 border border-rose-100/50"
                              title="Reject Payment"
                            >
                              <XCircle size={16} />
                            </button>
                          </>
                        )}
                        {p.status === 'accepted' && (
                          <>
                            <button 
                              onClick={() => setSelectedPayment(p)}
                              className="p-2 bg-slate-50 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-all border border-slate-100"
                              title="See Invoice"
                            >
                              <Eye size={16} />
                            </button>
                            <button 
                              onClick={() => handlePrintInvoice(p)}
                              className="p-2 bg-slate-50 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-all border border-slate-100"
                              title="Print Invoice"
                            >
                              <Printer size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center">
                    <div className="text-slate-300 font-bold text-xs uppercase tracking-[0.2em] flex flex-col items-center gap-3">
                      <Layers size={32} className="opacity-20" />
                      There is no data to show
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Transaction Details</h3>
              <button onClick={() => setSelectedPayment(null)} className="p-2 hover:bg-white rounded-xl transition-all">
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            <div className="p-8 space-y-8">
              <div className="flex justify-center flex-col items-center gap-2">
                 <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100 rotate-3">
                    <CreditCard size={32} />
                 </div>
                 <div className="text-2xl font-black text-slate-900 mt-2 tracking-tight whitespace-nowrap overflow-hidden text-ellipsis w-full text-center">
                    Rs ${parseFloat(selectedPayment.amount_paid).toLocaleString()}
                 </div>
                 <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusColors[selectedPayment.status]}`}>
                    {selectedPayment.status}
                 </span>
              </div>

              <div className="grid grid-cols-2 gap-y-6 gap-x-8">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tx ID</p>
                  <p className="text-sm font-bold text-slate-900">{selectedPayment.transaction_id || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Date</p>
                  <p className="text-sm font-bold text-slate-900">{new Date(selectedPayment.payment_date).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Student</p>
                  <p className="text-sm font-bold text-slate-900">{selectedPayment.student_name}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Email</p>
                  <p className="text-sm font-bold text-slate-600">{selectedPayment.student_email}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Fee Component</p>
                  <p className="text-sm font-bold text-slate-900">{selectedPayment.fee_type || 'General Fee'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Channel</p>
                  <p className="text-sm font-bold text-slate-900">{selectedPayment.payment_method}</p>
                </div>
              </div>

              <div className="pt-6">
                <button 
                  onClick={() => handlePrintInvoice(selectedPayment)}
                  className="w-full flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl text-[13px] uppercase tracking-widest transition-all shadow-lg shadow-indigo-100 active:scale-[0.98]"
                >
                  <Printer size={18} />
                  Print Official Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentManagement;
