import { useState, useEffect } from 'react';
import usePageTitle from '../../hooks/usePageTitle';
import api from '../../services/api';
import { 
  CheckCircle2, XCircle, Clock, Info, 
  MessageSquare, User, BookOpen, Trash2, Edit, Plus,
  Check, X, AlertCircle, Search, Filter
} from 'lucide-react';
import { formatTime, formatDays } from '../../utils/timeFormat';

const CourseApprovals = () => {
  usePageTitle('Course Approvals');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [adminComment, setAdminComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [currentCourse, setCurrentCourse] = useState(null);
  const [loadingCurrent, setLoadingCurrent] = useState(false);
  const [toast, setToast] = useState({ show: false, type: '', msg: '' });

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/course-approvals?status=${activeTab}`);
      setRequests(res.data);
    } catch (err) {
      console.error("Failed to fetch requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [activeTab]);

  useEffect(() => {
    if (selectedRequest && selectedRequest.target_id) {
      fetchCurrentCourse();
    } else {
      setCurrentCourse(null);
    }
  }, [selectedRequest]);

  const fetchCurrentCourse = async () => {
    setLoadingCurrent(true);
    try {
      const res = await api.get(`/admin/courses/${selectedRequest.target_id}`);
      setCurrentCourse(res.data);
    } catch (err) {
      console.error("Failed to fetch current course:", err);
      setCurrentCourse(null);
    } finally {
      setLoadingCurrent(false);
    }
  };

  const showToast = (type, msg) => {
    setToast({ show: true, type, msg });
    setTimeout(() => setToast({ show: false, type: '', msg: '' }), 5000);
  };

  const handleAction = async (status) => {
    if (!selectedRequest) return;
    setSubmitting(true);
    try {
      await api.patch(`/admin/course-approvals/${selectedRequest.request_id}`, {
        status,
        adminComment
      });
      showToast('success', `Request ${status} successfully.`);
      setSelectedRequest(null);
      setAdminComment('');
      fetchRequests();
    } catch (err) {
      showToast('error', err.response?.data?.message || 'Action failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderComparisonField = (label, currentVal, proposedVal) => {
    const isDifferent = currentVal !== undefined && currentVal !== proposedVal;
    
    return (
      <div className="grid grid-cols-2 gap-4 py-3 border-b border-slate-50 last:border-0">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
          <p className={`text-sm ${isDifferent ? 'text-slate-500 line-through opacity-50' : 'text-slate-600 font-medium'}`}>
            {currentVal || <span className="italic text-slate-300">Not Set</span>}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">Proposed</p>
          <p className={`text-sm font-bold ${isDifferent ? 'text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded' : 'text-slate-600'}`}>
            {proposedVal || <span className="italic text-slate-300">Empty</span>}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Course Approvals</h1>
          <p className="text-slate-500 mt-1">Review and manage faculty course modification requests</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          {['pending', 'approved', 'rejected'].map((s) => (
            <button
              key={s}
              onClick={() => setActiveTab(s)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === s 
                ? 'bg-white text-indigo-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800">No {activeTab} requests</h3>
          <p className="text-slate-500 mt-1">Everything is up to date.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {requests.map((request) => (
            <div 
              key={request.request_id}
              className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:border-indigo-100 transition-all group"
            >
              <div className="flex justify-between items-start">
                <div className="flex gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                    request.request_type === 'COURSE_ADD' ? 'bg-emerald-50 text-emerald-600' :
                    request.request_type === 'COURSE_EDIT' ? 'bg-indigo-50 text-indigo-600' :
                    'bg-rose-50 text-rose-600'
                  }`}>
                    {request.request_type === 'COURSE_ADD' ? <Plus className="w-5 h-5" /> : 
                     request.request_type === 'COURSE_EDIT' ? <Edit className="w-5 h-5" /> : 
                     <X className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">
                      {request.request_data?.title || 'Unknown Course'}
                    </h3>
                    <div className="flex gap-3 mt-1 items-center">
                      <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-500 rounded uppercase">
                        {request.request_type.replace('COURSE_', '')}
                      </span>
                      <span className="text-sm text-slate-400">
                        Requested by <span className="text-slate-600 font-medium">{request.faculty_name}</span>
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-sm text-slate-400">
                        {new Date(request.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedRequest(request)}
                  className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-semibold text-sm hover:bg-indigo-600 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                >
                  {activeTab === 'pending' ? 'Review Request' : 'View Details'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Review Course Request</h2>
                <p className="text-sm text-slate-500">ID: {selectedRequest.request_id}</p>
              </div>
              <button 
                onClick={() => setSelectedRequest(null)}
                className="w-10 h-10 rounded-full hover:bg-white hover:shadow-md flex items-center justify-center text-slate-400 transition-all"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
              {/* Context */}
              <div className="flex items-center gap-4 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-xl text-indigo-600">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Requester</p>
                  <p className="text-slate-700 font-semibold">{selectedRequest.faculty_name}</p>
                  <p className="text-xs text-slate-400">Faculty Member</p>
                </div>
              </div>

              {/* Comparison Section */}
              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span>Changes Comparison</span>
                  <div className="h-[1px] flex-1 bg-slate-100"></div>
                </h3>
                
                <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                  <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase">Current System State</p>
                    <p className="text-xs font-bold text-indigo-400 uppercase">Proposed Changes</p>
                  </div>
                  <div className="p-4 space-y-1">
                    {renderComparisonField('Course Code', currentCourse?.course_code, selectedRequest.request_data?.course_code)}
                    {renderComparisonField('Course Title', currentCourse?.title, selectedRequest.request_data?.title)}
                    {renderComparisonField('Day(s) of Week', formatDays(currentCourse?.day_of_week), formatDays(selectedRequest.request_data?.day_of_week))}
                    {renderComparisonField('Start Time', formatTime(currentCourse?.start_time), formatTime(selectedRequest.request_data?.start_time))}
                    {renderComparisonField('End Time', formatTime(currentCourse?.end_time), formatTime(selectedRequest.request_data?.end_time))}
                    {renderComparisonField('Class Location', currentCourse?.room, selectedRequest.request_data?.room)}
                    {renderComparisonField('Department', currentCourse?.department, selectedRequest.request_data?.department)}
                    {renderComparisonField('Credit Hours', currentCourse?.credit_hours, selectedRequest.request_data?.credit_hours)}
                    {renderComparisonField('Max Seats', currentCourse?.max_seats, selectedRequest.request_data?.max_seats)}
                    {renderComparisonField('Description', currentCourse?.description, selectedRequest.request_data?.description)}
                  </div>
                </div>
              </div>

              {/* Status & History */}
              {selectedRequest.status !== 'pending' && (
                <div className="space-y-4">
                   <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <span>Review Outcome</span>
                    <div className="h-[1px] flex-1 bg-slate-100"></div>
                  </h3>
                  <div className={`p-4 rounded-2xl border ${
                    selectedRequest.status === 'approved' ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'
                  }`}>
                    <div className="flex justify-between items-center mb-2">
                      <span className={`text-xs font-bold uppercase px-2 py-1 rounded ${
                        selectedRequest.status === 'approved' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                      }`}>
                        {selectedRequest.status}
                      </span>
                      <span className="text-xs text-slate-400">
                        Reviewed by {selectedRequest.admin_name || 'Admin'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 italic">
                      "{selectedRequest.admin_comment || 'No administrative comment provided.'}"
                    </p>
                  </div>
                </div>
              )}

              {/* Admin Input */}
              {selectedRequest.status === 'pending' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <span>Administrative Action</span>
                    <div className="h-[1px] flex-1 bg-slate-100"></div>
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Administrative Comments</label>
                    <textarea
                      value={adminComment}
                      onChange={(e) => setAdminComment(e.target.value)}
                      placeholder="Provide reasoning for your decision (optional)..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 transition-all outline-none min-h-[100px]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            {selectedRequest.status === 'pending' && (
              <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3">
                <button
                  disabled={submitting}
                  onClick={() => handleAction('rejected')}
                  className="flex-1 px-6 py-4 bg-white border border-rose-200 text-rose-600 rounded-2xl font-bold text-sm hover:bg-rose-50 transition-all disabled:opacity-50"
                >
                  Reject Request
                </button>
                <button
                  disabled={submitting}
                  onClick={() => handleAction('approved')}
                  className="flex-1 px-6 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : 'Approve & Apply Changes'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseApprovals;
