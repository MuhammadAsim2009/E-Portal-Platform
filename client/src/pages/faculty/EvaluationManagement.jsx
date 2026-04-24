import React, { useState, useEffect } from 'react';
import {
  Plus,
  MessageSquare,
  BarChart2,
  Calendar,
  Users,
  Star,
  ChevronRight,
  Send,
  Loader2,
  CheckCircle2,
  Trash2,
  X
} from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import usePageTitle from '../../hooks/usePageTitle';

const EvaluationManagement = () => {
  usePageTitle('Feedback & Evaluations');
  const [courses, setCourses] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportData, setReportData] = useState([]);
  const [newForm, setNewForm] = useState({
    title: '',
    description: '',
    questions: [
      { id: 1, text: 'The course content was well-organized.', type: 'rating' },
      { id: 2, text: 'The instructor was clear and helpful.', type: 'rating' },
      { id: 3, text: 'Any other feedback?', type: 'text' }
    ]
  });

  const fetchReport = async (form) => {
    setSelectedReport(form);
    setShowReportModal(true);
    try {
      const res = await api.get(`/faculty/evaluations/${form.form_id}/responses`);
      setReportData(res.data.responses || []);
    } catch (err) {
      toast.error('Failed to load responses');
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await api.get('/faculty/courses');
      const courseData = Array.isArray(response.data) ? response.data : (response.data.courses || []);
      setCourses(courseData);
      if (courseData.length > 0) {
        setSelectedSection(courseData[0]);
        fetchEvaluations(courseData[0].section_id);
      }
    } catch (err) {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const fetchEvaluations = async (sectionId) => {
    try {
      const response = await api.get(`/faculty/sections/${sectionId}/evaluations`);
      setEvaluations(response.data.stats || []);
    } catch (err) {
      toast.error('Failed to load evaluations');
    }
  };

  const handleCreateEvaluation = async () => {
    if (!newForm.title) return toast.error('Please enter a title');

    try {
      await api.post(`/faculty/sections/${selectedSection.section_id}/evaluations`, newForm);
      toast.success('Evaluation form created successfully');
      setShowCreateModal(false);
      fetchEvaluations(selectedSection.section_id);
    } catch (err) {
      toast.error('Failed to create evaluation');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Feedback & Evaluations
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Create structured feedback forms and view student evaluations
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-200 dark:shadow-none"
        >
          <Plus className="w-4 h-4" />
          Create Form
        </button>
      </div>

      {/* Section Selector */}
      <div className="flex flex-wrap gap-2">
        {courses.map((course) => (
          <button
            key={course.section_id}
            onClick={() => {
              setSelectedSection(course);
              fetchEvaluations(course.section_id);
            }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedSection?.section_id === course.section_id
              ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 ring-1 ring-indigo-200 dark:ring-indigo-800'
              : 'bg-white text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
          >
            {course.course_code} - {course.section_name}
          </button>
        ))}
      </div>

      {/* Evaluations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {evaluations.map((evalForm) => (
          <div
            key={evalForm.form_id}
            className="group relative bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                  <BarChart2 className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  <Star className="w-4 h-4 fill-current" />
                  {evalForm.average_score ? Number(evalForm.average_score).toFixed(1) : 'N/A'}
                </div>
              </div>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 line-clamp-1">
                {evalForm.title}
              </h3>

              <div className="space-y-3">
                <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                  <Users className="w-4 h-4 mr-2" />
                  {evalForm.total_responses} Responses
                </div>
                <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                  <Calendar className="w-4 h-4 mr-2" />
                  Created {new Date(evalForm.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <button
                onClick={() => fetchReport(evalForm)}
                className="text-indigo-600 dark:text-indigo-400 text-sm font-semibold hover:underline flex items-center gap-1"
              >
                View Detailed Report
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {evaluations.length === 0 && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center bg-white dark:bg-slate-800 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
            <div className="p-4 bg-slate-50 dark:bg-slate-900/30 rounded-full mb-4">
              <MessageSquare className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No evaluations found</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-xs text-center mt-2">
              Get started by creating your first feedback form for this section.
            </p>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">New Evaluation Form</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto scrollbar-hide">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Form Title
                </label>
                <input
                  type="text"
                  placeholder="e.g., Mid-Term Course Feedback"
                  value={newForm.title}
                  onChange={(e) => setNewForm({ ...newForm, title: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  rows="3"
                  value={newForm.description}
                  onChange={(e) => setNewForm({ ...newForm, description: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-900 dark:text-white">Questions</h3>
                  <button
                    onClick={() => setNewForm({
                      ...newForm,
                      questions: [...newForm.questions, { id: Date.now(), text: '', type: 'rating' }]
                    })}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                  >
                    <Plus size={14} /> Add Question
                  </button>
                </div>
                <div className="space-y-3">
                  {newForm.questions.map((q, idx) => (
                    <div key={q.id} className="group flex gap-3 items-center bg-slate-50 dark:bg-slate-900/30 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50">
                      <span className="text-slate-400 font-mono text-xs w-4">{idx + 1}.</span>
                      <input
                        type="text"
                        value={q.text}
                        onChange={(e) => {
                          const updated = [...newForm.questions];
                          updated[idx].text = e.target.value;
                          setNewForm({ ...newForm, questions: updated });
                        }}
                        placeholder="Enter your question..."
                        className="flex-1 bg-transparent border-none p-0 focus:ring-0 text-sm font-medium text-slate-700 dark:text-slate-200"
                      />

                      <select
                        value={q.type}
                        onChange={(e) => {
                          const updated = [...newForm.questions];
                          updated[idx].type = e.target.value;
                          setNewForm({ ...newForm, questions: updated });
                        }}
                        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-[10px] font-bold uppercase text-slate-500 outline-none"
                      >
                        <option value="rating">Rating</option>
                        <option value="text">Text</option>
                      </select>

                      <button
                        onClick={() => {
                          const updated = newForm.questions.filter(item => item.id !== q.id);
                          setNewForm({ ...newForm, questions: updated });
                        }}
                        className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-slate-600 dark:text-slate-400 font-medium hover:text-slate-900 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateEvaluation}
                className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all font-semibold"
              >
                Publish Form
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{selectedReport?.title}</h2>
                <p className="text-sm text-slate-500">Student Feedback Details</p>
              </div>
              <button onClick={() => setShowReportModal(false)} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto scrollbar-hide">
              {reportData.length === 0 ? (
                <div className="text-center py-12 text-slate-400">No responses yet.</div>
              ) : (
                <div className="space-y-6">
                  {reportData.map((resp, idx) => (
                    <div key={resp.response_id} className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-bold text-slate-900 dark:text-white">{resp.student_name}</span>
                        <span className="text-xs text-slate-500">{new Date(resp.submitted_at).toLocaleDateString()}</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(resp.answers).map(([qId, val]) => (
                          <div key={qId} className="space-y-1">
                            <p className="text-[10px] font-black uppercase text-slate-400">Response</p>
                            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                              {(!isNaN(val) && val !== '' && val !== null) ? (
                                <span className="flex items-center gap-1 text-amber-500">
                                  {val} <Star size={12} fill="currentColor" />
                                </span>
                              ) : val}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvaluationManagement;
