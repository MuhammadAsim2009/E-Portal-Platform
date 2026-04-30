import { Mail, Phone, MapPin, Send, MessageSquare, Clock, Loader2 } from 'lucide-react';
import { useState } from 'react';
import api from '../../services/api';
import usePageTitle from '../../hooks/usePageTitle';

export default function ContactPage() {
  usePageTitle('Contact');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    institution: '',
    subject: '',
    message: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/public/contact', formData);
      setSubmitted(true);
      setFormData({ name: '', email: '', institution: '', subject: '', message: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#0a0a0a]">

      {/* ── Hero ── */}
      <section className="relative pt-36 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_40%,transparent_100%)]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-blue-600/8 dark:bg-blue-500/8 blur-[120px] -z-10" />

        <div className="relative max-w-6xl mx-auto px-6 text-center">
          <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-4">Get in touch</p>
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-white tracking-tight leading-[1.05] mb-5">
            We'd love to hear from you.
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Have a question, need a demo, or want to talk about your institution's needs? Our team usually responds within a few hours.
          </p>
        </div>
      </section>

      {/* ── Main Content ── */}
      <section className="py-16 pb-28 bg-white dark:bg-[#0a0a0a]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">

            {/* Form — 3 cols */}
            <div className="lg:col-span-3">
              <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-2xl p-8">
                {submitted ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center space-y-5">
                    <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                      <MessageSquare size={28} className="text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Message received!</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs">
                      Thanks for reaching out. Someone from our team will get back to you within 24 hours.
                    </p>
                    <button onClick={() => setSubmitted(false)} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                      <div className="p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl text-rose-600 dark:text-rose-400 text-sm">
                        {error}
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <Field 
                        label="Full Name" 
                        type="text" 
                        placeholder="Your full name" 
                        required 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                      <Field 
                        label="Email Address" 
                        type="email" 
                        placeholder="you@institution.edu" 
                        required 
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                    <Field 
                      label="Institution Name" 
                      type="text" 
                      placeholder="Your institution or organization" 
                      value={formData.institution}
                      onChange={(e) => setFormData({...formData, institution: e.target.value})}
                    />
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        Subject <span className="text-slate-400 font-normal">(optional)</span>
                      </label>
                      <select 
                        value={formData.subject}
                        onChange={(e) => setFormData({...formData, subject: e.target.value})}
                        className="w-full h-11 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      >
                        <option value="">Select a topic</option>
                        <option>General inquiry</option>
                        <option>Demo request</option>
                        <option>Pricing & plans</option>
                        <option>Technical support</option>
                        <option>Partnership</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Message</label>
                      <textarea
                        rows={5}
                        required
                        value={formData.message}
                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none placeholder:text-slate-400 dark:placeholder:text-slate-600"
                        placeholder="Tell us how we can help..."
                      />
                    </div>
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="w-full h-11 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                    >
                      {loading ? <Loader2 className="animate-spin" size={15} /> : 'Send message'} <Send size={15} />
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Sidebar — 2 cols */}
            <div className="lg:col-span-2 space-y-5">

              {/* Contact Info Cards */}
              <InfoCard
                icon={<Mail size={18} className="text-blue-600 dark:text-blue-400" />}
                bg="bg-blue-50 dark:bg-blue-500/10"
                title="Email"
                value="support@e-portal.io"
                sub="We reply within a few hours"
              />
              <InfoCard
                icon={<Phone size={18} className="text-emerald-600 dark:text-emerald-400" />}
                bg="bg-emerald-50 dark:bg-emerald-500/10"
                title="Phone"
                value="+1 (888) 000-0000"
                sub="Mon–Fri, 9am to 6pm EST"
              />
              <InfoCard
                icon={<MapPin size={18} className="text-violet-600 dark:text-violet-400" />}
                bg="bg-violet-50 dark:bg-violet-500/10"
                title="Office"
                value="San Francisco, CA"
                sub="United States"
              />

              {/* Hours */}
              <div className="bg-slate-50 dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-2.5 mb-2">
                  <Clock size={16} className="text-slate-500 dark:text-slate-400" />
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Support Hours</h4>
                </div>
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Mon – Fri</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">9:00am – 8:00pm EST</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Sat – Sun</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">10:00am – 5:00pm EST</span>
                  </div>
                </div>
                <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Currently accepting inquiries
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Field({ label, type = 'text', placeholder, required, value, onChange }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full h-11 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 text-sm text-slate-700 dark:text-slate-300 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
      />
    </div>
  );
}

function InfoCard({ icon, bg, title, value, sub }) {
  return (
    <div className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-2xl p-5 flex items-start gap-4">
      <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">{title}</p>
        <p className="text-sm font-semibold text-slate-900 dark:text-white">{value}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{sub}</p>
      </div>
    </div>
  );
}
