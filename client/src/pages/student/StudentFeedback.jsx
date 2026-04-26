import React, { useState, useEffect } from 'react';
import { 
  ClipboardCheck, 
  MessageSquare, 
  Star, 
  Send, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

const StudentFeedback = () => {
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedForm, setSelectedForm] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState('all'); // all, pending, completed

  useEffect(() => {
    fetchEvaluations();
  }, []);

  const fetchEvaluations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/student/evaluations');
      setEvaluations(res.data);
    } catch (err) {
      toast.error('Failed to fetch evaluation forms');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedForm) return;

    // Basic validation
    const missing = selectedForm.questions.some(q => q.required && !answers[q.id]);
    if (missing) {
      toast.error('Please answer all required questions');
      return;
    }

    try {
      setSubmitting(true);
      await api.post(`/student/evaluations/${selectedForm.form_id}/respond`, { answers });
      toast.success('Feedback submitted successfully! Thank you.', {
        icon: '✨',
        style: {
          borderRadius: '1rem',
          background: '#1e293b',
          color: '#fff',
        }
      });
      setSelectedForm(null);
      setAnswers({});
      fetchEvaluations();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const filteredEvaluations = evaluations.filter(ev => {
    if (filter === 'pending') return !ev.has_responded;
    if (filter === 'completed') return ev.has_responded;
    return true;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium animate-pulse text-[10px] uppercase tracking-[0.2em]">Synchronizing Feedback Channel...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-3 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-100">
              <MessageSquare size={24} />
            </div>
            FACULTY FEEDBACK
          </h2>
          <p className="text-slate-500 mt-2 text-sm font-medium">Your insights help us maintain excellence in education.</p>
        </div>

        <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100">
          {['all', 'pending', 'completed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all ${
                filter === f 
                  ? 'bg-slate-900 text-white shadow-lg' 
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div>
        {!selectedForm ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {filteredEvaluations.length > 0 ? (
              filteredEvaluations.map((ev) => (
                <div 
                  key={ev.form_id}
                  className="group relative bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-100/50 transition-all duration-500 hover:-translate-y-2 overflow-hidden"
                >
                  {/* Status Badge */}
                  <div className="absolute top-6 right-6">
                    {ev.has_responded ? (
                      <div className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black tracking-widest uppercase border border-emerald-100">
                        <CheckCircle2 size={12} />
                        Completed
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 px-4 py-1.5 bg-amber-50 text-amber-600 rounded-full text-[9px] font-black tracking-widest uppercase border border-amber-100">
                        <Clock size={12} />
                        Pending
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-1">
                      <p className="text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em]">{ev.course_code} | {ev.section_name}</p>
                      <h3 className="text-xl font-bold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">{ev.title}</h3>
                      <p className="text-slate-500 text-xs font-medium">{ev.course_title}</p>
                    </div>

                    <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 group-hover:bg-indigo-50/50 group-hover:border-indigo-100 transition-colors">
                      <p className="text-slate-600 text-sm leading-relaxed line-clamp-2">{ev.description || 'Provide your valuable feedback for this course module.'}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex -space-x-2">
                         {[1,2,3].map(i => (
                           <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-slate-400">
                             <Star size={12} fill="currentColor" />
                           </div>
                         ))}
                      </div>
                      
                      {!ev.has_responded ? (
                        <button 
                          onClick={() => setSelectedForm(ev)}
                          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-600 group-hover:gap-3 transition-all"
                        >
                          Answer Now <ArrowRight size={14} />
                        </button>
                      ) : (
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          Response Submitted
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ClipboardCheck className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">No evaluations found</h3>
                <p className="text-slate-500 mt-2 text-sm">When faculty members publish feedback forms, they will appear here.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-4xl mx-auto animate-in fade-in zoom-in-95 duration-300">
            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden">
              <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <button 
                    onClick={() => setSelectedForm(null)}
                    className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 flex items-center gap-2 mb-4 transition-colors"
                  >
                    <ArrowRight size={14} className="rotate-180" /> Back to list
                  </button>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">{selectedForm.title}</h3>
                  <p className="text-slate-500 mt-2 text-sm font-medium">{selectedForm.course_title} ({selectedForm.course_code}) - {selectedForm.section_name}</p>
                </div>
                <div className="hidden sm:block p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
                  <Clock size={32} className="text-indigo-600" />
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-10 space-y-10">
                {selectedForm.questions.map((q, idx) => (
                  <div key={q.id} className="space-y-6 animate-in slide-in-from-left duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                    <div className="flex items-start gap-4">
                      <span className="flex-shrink-0 w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-black">
                        {idx + 1}
                      </span>
                      <label className="text-lg font-bold text-slate-800 pt-0.5">
                        {q.text || q.label} {q.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                    </div>

                    <div className="pl-12">
                      {q.type === 'rating' && (
                        <div className="flex items-center gap-4">
                          {[1, 2, 3, 4, 5].map((val) => (
                            <button
                              key={val}
                              type="button"
                              onClick={() => handleAnswerChange(q.id, val)}
                              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                                answers[q.id] === val
                                  ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200 scale-110'
                                  : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                              }`}
                            >
                              <span className="text-lg font-black">{val}</span>
                            </button>
                          ))}
                          <span className="ml-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                            {answers[q.id] ? (answers[q.id] <= 2 ? 'Needs Improvement' : answers[q.id] >= 4 ? 'Excellent' : 'Average') : 'Select Rating'}
                          </span>
                        </div>
                      )}

                      {q.type === 'text' && (
                        <textarea
                          placeholder="Share your thoughts here..."
                          className="w-full bg-slate-50 border-2 border-slate-100 rounded-[2rem] p-6 text-sm text-slate-700 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all min-h-[120px] resize-none"
                          value={answers[q.id] || ''}
                          onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        />
                      )}

                      {q.type === 'choice' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {q.options?.map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => handleAnswerChange(q.id, opt)}
                              className={`p-6 rounded-[1.5rem] text-left text-sm font-bold transition-all border-2 ${
                                answers[q.id] === opt
                                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-100'
                                  : 'bg-white text-slate-600 border-slate-100 hover:border-indigo-100 hover:bg-slate-50'
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                <div className="pt-10 flex flex-col sm:flex-row items-center gap-6 border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:w-auto px-12 py-5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3"
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send size={16} />
                    )}
                    {submitting ? 'Submitting...' : 'Submit Feedback'}
                  </button>
                  <p className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                    <AlertCircle size={14} />
                    Your response is stored securely
                  </p>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentFeedback;
