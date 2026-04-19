import usePageTitle from '../../hooks/usePageTitle';
import { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  Settings, Globe, Palette, Mail, Shield, Save, 
  RotateCcw, Eye, Trash2, Camera, Type, Layout, Image,
  Smartphone, BellRing, UserCheck, Languages, Clock, 
  Coins, MapPin, Phone, Mail as MailIcon, AlertTriangle,
  Lock, CheckCircle2, XCircle
} from 'lucide-react';
const TABS = [
  { id: 'general', label: 'General', icon: Globe },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'email', label: 'Email SMTP', icon: Mail },
  { id: 'security', label: 'Security', icon: Shield },
];
const SiteSettings = () => {
  usePageTitle('Site Settings');
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({});
  const [toast, setToast] = useState({ show: false, type: '', msg: '' });
  const [testEmail, setTestEmail] = useState('');
  const [testingEmail, setTestingEmail] = useState(false);
  useEffect(() => {
    fetchSettings();
  }, []);
  const fetchSettings = async () => {
    try {
      const res = await api.get('/admin/settings');
      setSettings(res.data);
    } catch (err) {
      showToast('error', 'Failed to synchronize institutional configuration.');
    } finally {
      setLoading(false);
    }
  };
  const showToast = (type, msg) => {
    setToast({ show: true, type, msg });
    setTimeout(() => setToast({ show: false, type: '', msg: '' }), 4000);
  };
  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.patch('/admin/settings', settings);
      setSettings(res.data);
      showToast('success', 'Institutional configuration updated successfully.');
    } catch (err) {
      showToast('error', 'Failed to commit changes to system state.');
    } finally {
      setSaving(false);
    }
  };
  const sendTestEmail = async () => {
    if (!testEmail) return showToast('error', 'Please provide a valid recipient address.');
    setTestingEmail(true);
    try {
      // We'll use the existing email service via a test endpoint if we add it, 
      // for now let's just simulate or add a route if needed. 
      // Actually let's just trigger a test call.
      await api.post('/admin/settings/test-email', { email: testEmail });
      showToast('success', 'Test dispatch successful. Verify your inbox.');
    } catch (err) {
      showToast('error', 'SMTP Relay failed. Check your configuration.');
    } finally {
      setTestingEmail(false);
    }
  };
  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
    </div>
  );
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            Site Settings <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] uppercase tracking-widest rounded-full border border-indigo-100">Super Admin</span>
          </h1>
          <p className="text-slate-500 font-medium mt-1">Configure global institutional governance and aesthetic tokens.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={fetchSettings}
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-slate-600 rounded-xl text-[12px] font-black uppercase tracking-widest border border-slate-200 hover:bg-slate-50 transition-all shadow-sm"
          >
            <RotateCcw size={16} /> Refresh
          </button>
          <button 
            form="settings-form"
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[12px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 disabled:opacity-50"
          >
            {saving ? <RotateCcw className="animate-spin" size={16} /> : <Save size={16} />}
            {saving ? 'Committing...' : 'Commit Changes'}
          </button>
        </div>
      </div>
      {/* Tabs Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-3 space-y-2">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl transition-all group ${
                activeTab === tab.id 
                  ? 'bg-slate-900 text-white shadow-xl shadow-slate-200 translate-x-1' 
                  : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'
              }`}
            >
              <div className={`p-2 rounded-xl transition-colors ${
                activeTab === tab.id ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-white'
              }`}>
                <tab.icon size={18} />
              </div>
              <span className="font-bold text-[13px] tracking-tight">{tab.label}</span>
            </button>
          ))}
        </div>
        {/* Content Area */}
        <div className="lg:col-span-9 bg-white border border-slate-200/60 rounded-[32px] shadow-sm overflow-hidden min-h-[600px] flex flex-col translate-y-0 hover:-translate-y-1 transition-all duration-500">
          <form id="settings-form" onSubmit={handleUpdate} className="flex-1 p-8 md:p-12 space-y-12">
            {/* Tab: General */}
            {activeTab === 'general' && (
              <div className="space-y-10 animate-in slide-in-from-right-4 duration-500">
                {/* Visual Branding Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 p-8 bg-slate-50 border border-slate-100 rounded-[32px]">
                   <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <Camera size={14} className="text-indigo-500" /> Portal Brand Logo
                      </label>
                      <div className="flex items-center gap-6">
                         <div className="w-24 h-24 bg-white border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center overflow-hidden relative group">
                            {settings.siteLogo ? (
                              <img src={settings.siteLogo} className="w-full h-full object-contain p-2" alt="Logo" />
                            ) : (
                              <Image className="text-slate-300" size={32} />
                            )}
                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" />
                            <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                               <Camera className="text-white" size={20} />
                            </div>
                         </div>
                         <div className="space-y-1">
                            <p className="text-[13px] font-bold text-slate-900">Institutional Identity</p>
                            <p className="text-[11px] font-medium text-slate-500">SVG, PNG or JPG. Max 500KB.</p>
                            <button type="button" className="text-[10px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-600 mt-2">Remove Asset</button>
                         </div>
                      </div>
                   </div>
                   <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <Smartphone size={14} className="text-amber-500" /> Browser Favicon
                      </label>
                      <div className="flex items-center gap-6">
                         <div className="w-16 h-16 bg-white border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center overflow-hidden relative group">
                            {settings.favicon ? (
                              <img src={settings.favicon} className="w-full h-full object-contain p-2" alt="Favicon" />
                            ) : (
                              <Eye className="text-slate-300" size={24} />
                            )}
                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" />
                         </div>
                         <div className="space-y-1">
                            <p className="text-[13px] font-bold text-slate-900">Tab Branding</p>
                            <p className="text-[11px] font-medium text-slate-500">ICO or PNG (32x32px).</p>
                             <button type="button" className="text-[10px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-600 mt-2">Replace Asset</button>
                         </div>
                      </div>
                   </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Portal Brand Name</label>
                    <input 
                      type="text"
                      value={settings.siteName || ''}
                      onChange={e => setSettings({...settings, siteName: e.target.value})}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-500/5 rounded-2xl text-[13px] font-bold text-slate-900"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Institutional Motto</label>
                    <input 
                      type="text"
                      value={settings.siteTagline || ''}
                      onChange={e => setSettings({...settings, siteTagline: e.target.value})}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-500/5 rounded-2xl text-[13px] font-bold text-slate-900"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Mission Statement / Description</label>
                    <textarea 
                      rows={3}
                      value={settings.siteDescription || ''}
                      onChange={e => setSettings({...settings, siteDescription: e.target.value})}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-500/5 rounded-2xl text-[13px] font-bold text-slate-900 resize-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                      <Languages size={12} /> Registry Language
                    </label>
                    <select 
                      value={settings.defaultLang || 'en'}
                      onChange={e => setSettings({...settings, defaultLang: e.target.value})}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] font-bold text-slate-900 appearance-none cursor-pointer"
                    >
                      <option value="en">English (US)</option>
                      <option value="ur">Urdu (Pakistan)</option>
                      <option value="ar">Arabic (Gulf)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-2">
                      <Coins size={12} /> System Currency
                    </label>
                    <select 
                      value={settings.currency || 'USD'}
                      onChange={e => setSettings({...settings, currency: e.target.value})}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] font-bold text-slate-900 appearance-none cursor-pointer"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="PKR">PKR (Rs.)</option>
                      <option value="EUR">EUR (€)</option>
                    </select>
                  </div>
                </div>
                <div className="pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-8">
                   {/* Contact Section */}
                   <div className="space-y-6">
                      <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
                         <MailIcon size={14} className="text-indigo-500" /> Contact Coordinates
                      </h4>
                      <div className="space-y-4">
                        <input 
                          type="email" placeholder="Institutional Email"
                          value={settings.contactEmail || ''}
                          onChange={e => setSettings({...settings, contactEmail: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl text-[12px] font-bold"
                        />
                        <input 
                          type="text" placeholder="Contact Phone"
                          value={settings.contactPhone || ''}
                          onChange={e => setSettings({...settings, contactPhone: e.target.value})}
                          className="w-full px-4 py-3 bg-slate-50/50 border border-slate-100 rounded-xl text-[12px] font-bold"
                        />
                      </div>
                   </div>
                   {/* Operation Status */}
                   <div className="space-y-6">
                      <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
                         <AlertTriangle size={14} className="text-amber-500" /> Availability Status
                      </h4>
                      <div className="space-y-4">
                        <label className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100 cursor-pointer">
                           <span className="text-[12px] font-bold text-slate-700">Allow New Registrations</span>
                           <input 
                             type="checkbox" 
                             checked={settings.allowReg || false}
                             onChange={e => setSettings({...settings, allowReg: e.target.checked})}
                             className="w-5 h-5 text-indigo-600 rounded-lg focus:ring-indigo-500 border-indigo-200"
                           />
                        </label>
                        <label className="flex items-center justify-between p-4 bg-rose-50/30 rounded-2xl border border-rose-100/50 cursor-pointer">
                           <span className="text-[12px] font-bold text-rose-700">Maintenance Protocol</span>
                           <input 
                             type="checkbox" 
                             checked={settings.maintenanceMode || false}
                             onChange={e => setSettings({...settings, maintenanceMode: e.target.checked})}
                             className="w-5 h-5 text-rose-600 rounded-lg focus:ring-rose-500 border-rose-200"
                           />
                        </label>
                      </div>
                   </div>
                </div>
              </div>
            )}
            {/* Tab: Appearance */}
            {activeTab === 'appearance' && (
              <div className="space-y-12 animate-in slide-in-from-right-4 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                   <div className="space-y-3 p-6 bg-slate-50 border border-slate-100 rounded-3xl">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-1">Primary Color</label>
                      <div className="flex items-center gap-4">
                        <input 
                          type="color" 
                          value={settings.colorPrimary || '#4f46e5'}
                          onChange={e => setSettings({...settings, colorPrimary: e.target.value})}
                          className="w-12 h-12 rounded-xl border-0 cursor-pointer p-0 overflow-hidden"
                        />
                        <span className="text-[13px] font-mono font-bold text-slate-600">{settings.colorPrimary || '#4f46e5'}</span>
                      </div>
                   </div>
                   <div className="space-y-3 p-6 bg-slate-50 border border-slate-100 rounded-3xl">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-1">Secondary Color</label>
                      <div className="flex items-center gap-4">
                        <input 
                          type="color" 
                          value={settings.colorSecondary || '#0f172a'}
                          onChange={e => setSettings({...settings, colorSecondary: e.target.value})}
                          className="w-12 h-12 rounded-xl border-0 cursor-pointer p-0 overflow-hidden"
                        />
                        <span className="text-[13px] font-mono font-bold text-slate-600">{settings.colorSecondary || '#0f172a'}</span>
                      </div>
                   </div>
                   <div className="space-y-3 p-6 bg-slate-50 border border-slate-100 rounded-3xl">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-1">Accent Token</label>
                      <div className="flex items-center gap-4">
                        <input 
                          type="color" 
                          value={settings.colorAccent || '#10b981'}
                          onChange={e => setSettings({...settings, colorAccent: e.target.value})}
                          className="w-12 h-12 rounded-xl border-0 cursor-pointer p-0 overflow-hidden"
                        />
                        <span className="text-[13px] font-mono font-bold text-slate-600">{settings.colorAccent || '#10b981'}</span>
                      </div>
                   </div>
                </div>
                <div className="space-y-6">
                  <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-900">Typography & Interface</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Institutional Font Family</label>
                        <select 
                          value={settings.fontFamily || 'Inter'}
                          onChange={e => setSettings({...settings, fontFamily: e.target.value})}
                          className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] font-bold"
                        >
                          <option value="Inter">Inter (Clean Modern)</option>
                          <option value="Poppins">Poppins (Soft Geometric)</option>
                          <option value="Roboto">Roboto (Technical)</option>
                        </select>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Sidebar Aesthetic</label>
                        <select 
                          value={settings.sidebarStyle || 'dark'}
                          onChange={e => setSettings({...settings, sidebarStyle: e.target.value})}
                          className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] font-bold"
                        >
                          <option value="light">Flat Light (High Contrast)</option>
                          <option value="dark">Sleek Dark (Command Center)</option>
                          <option value="gradient">Indigo Gradient (Vibrant)</option>
                        </select>
                     </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Custom CSS Architecture</label>
                  <textarea 
                    rows={6}
                    placeholder="/* Inject institutional override styles here... */"
                    value={settings.customCSS || ''}
                    onChange={e => setSettings({...settings, customCSS: e.target.value})}
                    className="w-full px-5 py-4 bg-slate-900 border border-slate-800 rounded-2xl text-[12px] font-mono text-emerald-400 resize-none shadow-inner"
                  />
                </div>
              </div>
            )}
            {/* Tab: Email */}
            {activeTab === 'email' && (
              <div className="space-y-12 animate-in slide-in-from-right-4 duration-500">
                <div className="p-8 bg-indigo-600 rounded-3xl text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
                   <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="space-y-2">
                        <h3 className="text-xl font-black">SMTP Communication Hub</h3>
                        <p className="opacity-80 text-sm font-medium">Configure institutional relay for automated bulletins and security alerts.</p>
                      </div>
                      <div className="flex flex-col gap-3 min-w-[240px]">
                        <input 
                          type="email" 
                          placeholder="Recipient address..."
                          value={testEmail}
                          onChange={e => setTestEmail(e.target.value)}
                          className="w-full px-4 py-2.5 bg-white/20 border border-white/30 rounded-xl text-sm placeholder:text-white/40 focus:bg-white/30 focus:outline-none"
                        />
                        <button 
                          type="button"
                          onClick={sendTestEmail}
                          disabled={testingEmail}
                          className="w-full py-2.5 bg-white text-indigo-600 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                        >
                          {testingEmail ? 'Relaying...' : 'Dispatch Test Alert'}
                        </button>
                      </div>
                   </div>
                   <Mail size={120} className="absolute -bottom-6 -right-6 text-white/5 rotate-12" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">SMTP Host Endpoint</label>
                    <input 
                      type="text"
                      placeholder="smtp.gmail.com"
                      value={settings.smtpHost || ''}
                      onChange={e => setSettings({...settings, smtpHost: e.target.value})}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">SMTP Port</label>
                    <input 
                      type="number"
                      placeholder="587"
                      value={settings.smtpPort || ''}
                      onChange={e => setSettings({...settings, smtpPort: e.target.value})}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Secure User Identifier</label>
                    <input 
                      type="text"
                      value={settings.smtpUser || ''}
                      onChange={e => setSettings({...settings, smtpUser: e.target.value})}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Encryption Token (Password)</label>
                    <input 
                      type="password"
                      value={settings.smtpPass || ''}
                      onChange={e => setSettings({...settings, smtpPass: e.target.value})}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] font-bold"
                    />
                  </div>
                   <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Verified Sender Name</label>
                    <input 
                      type="text"
                      value={settings.smtpFromName || ''}
                      onChange={e => setSettings({...settings, smtpFromName: e.target.value})}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Verified Sender Email</label>
                    <input 
                      type="email"
                      value={settings.smtpFromEmail || ''}
                      onChange={e => setSettings({...settings, smtpFromEmail: e.target.value})}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-[13px] font-bold"
                    />
                  </div>
                </div>
              </div>
            )}
            {/* Tab: Security */}
            {activeTab === 'security' && (
              <div className="space-y-12 animate-in slide-in-from-right-4 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="p-8 bg-rose-50 border border-rose-100 rounded-[32px] space-y-4">
                      <div className="w-12 h-12 bg-rose-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-rose-200">
                         <Lock size={24} />
                      </div>
                      <h3 className="text-xl font-black text-rose-900">Access Control</h3>
                      <p className="text-rose-600/70 text-sm font-bold">Configure password complexity and session timeouts for administrative users.</p>
                      <div className="space-y-4 pt-4">
                         <label className="flex items-center justify-between p-4 bg-white/50 rounded-2xl border border-rose-100 cursor-pointer">
                            <span className="text-[12px] font-black uppercase tracking-widest text-rose-800">Enforce MFA</span>
                            <input type="checkbox" className="w-5 h-5 text-rose-600 rounded-lg" checked />
                         </label>
                         <label className="flex items-center justify-between p-4 bg-white/50 rounded-2xl border border-rose-100 cursor-pointer">
                            <span className="text-[12px] font-black uppercase tracking-widest text-rose-800">IP Filtering</span>
                            <input type="checkbox" className="w-5 h-5 text-rose-600 rounded-lg" />
                         </label>
                      </div>
                   </div>
                   <div className="p-8 bg-emerald-50 border border-emerald-100 rounded-[32px] space-y-4">
                      <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                         <UserCheck size={24} />
                      </div>
                      <h3 className="text-xl font-black text-emerald-900">Session Integrity</h3>
                      <p className="text-emerald-600/70 text-sm font-bold">Manage persistent identity tokens and concurrent administrative access.</p>
                      <div className="space-y-4 pt-4">
                         <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-emerald-800">Session Expiry (Minutes)</label>
                           <input 
                             type="number" 
                             value={settings.sessionExpiry || 60}
                             onChange={e => setSettings({...settings, sessionExpiry: e.target.value})}
                             className="w-full px-4 py-3 bg-white/50 border border-emerald-100 rounded-xl text-[12px] font-bold"
                           />
                         </div>
                         <label className="flex items-center justify-between p-4 bg-white/50 rounded-2xl border border-emerald-100 cursor-pointer">
                            <span className="text-[12px] font-black uppercase tracking-widest text-emerald-800">Log Remote Access</span>
                            <input type="checkbox" className="w-5 h-5 text-emerald-600 rounded-lg" checked />
                         </label>
                      </div>
                   </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
      {/* Notifications Toast */}
      {toast.show && (
        <div className={`fixed bottom-8 right-8 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-8 duration-500 z-50 ${
          toast.type === 'success' ? 'bg-slate-900 border-l-4 border-emerald-500 text-white' : 'bg-white border border-rose-100 text-rose-600 shadow-rose-100'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="text-emerald-400" size={20} /> : <AlertTriangle className="text-rose-500" size={20} />}
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-0.5">{toast.type === 'success' ? 'State Committed' : 'Sync Error'}</span>
            <span className="text-[13px] font-bold tracking-tight">{toast.msg}</span>
          </div>
          <button onClick={() => setToast({show:false, type:'', msg:''})} className="ml-4 opacity-30 hover:opacity-100 transition-opacity">
            <RotateCcw size={14} />
          </button>
        </div>
      )}
    </div>
  );
};
export default SiteSettings;
