import React, { useState, useEffect } from 'react';
import { User, Settings, Save, Shield, Mail, Phone, MapPin } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import api from '../../services/api';
import usePageTitle from '../../hooks/usePageTitle';

const FacultySettings = () => {
  usePageTitle('Account Settings');
  const [facultyInfo, setFacultyInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    phone: '',
    address: '',
    bio: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/faculty/profile');
        setFacultyInfo(res.data);
        setFormData({
          phone: res.data?.phone || '',
          address: res.data?.address || '',
          bio: res.data?.bio || ''
        });
      } catch (error) {
        toast.error('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.put('/faculty/profile', formData);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitPassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error('New passwords do not match');
    }
    if (passwordData.newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }

    setIsChangingPassword(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toast.success('Password updated successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (loading) return (
    <div className="flex h-[400px] items-center justify-center">
      <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500 pb-12">
      <Toaster position="top-right" />
      
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Account Settings</h1>
        <p className="text-slate-500 font-medium">Manage your personal profile and institutional security credentials.</p>
      </div>

      {/* Profile Section */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200/60 overflow-hidden relative group">
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
          <User size={200} />
        </div>
        
        <div className="flex items-center gap-4 mb-10 pb-8 border-b border-slate-100">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
            <Settings size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Profile Information</h2>
            <p className="text-slate-500 font-medium">Update your contact and professional details</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Read-only fields */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 ml-1">
                Full Name <Shield size={12} className="text-amber-500" />
              </label>
              <input 
                type="text" 
                value={facultyInfo?.full_name || ''} 
                disabled 
                className="w-full bg-slate-50 border-slate-100 text-slate-400 rounded-2xl px-5 py-4 cursor-not-allowed border font-bold text-sm"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 ml-1">
                Email Address <Shield size={12} className="text-amber-500" />
              </label>
              <input 
                type="email" 
                value={facultyInfo?.email || ''} 
                disabled 
                className="w-full bg-slate-50 border-slate-100 text-slate-400 rounded-2xl px-5 py-4 cursor-not-allowed border font-bold text-sm"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 ml-1">
                Designation <Shield size={12} className="text-amber-500" />
              </label>
              <input 
                type="text" 
                value={facultyInfo?.designation || 'Faculty Member'} 
                disabled 
                className="w-full bg-slate-50 border-slate-100 text-slate-400 rounded-2xl px-5 py-4 cursor-not-allowed border font-bold text-sm"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2 ml-1">
                Department <Shield size={12} className="text-amber-500" />
              </label>
              <input 
                type="text" 
                value={facultyInfo?.department_name || 'Academic'} 
                disabled 
                className="w-full bg-slate-50 border-slate-100 text-slate-400 rounded-2xl px-5 py-4 cursor-not-allowed border font-bold text-sm"
              />
            </div>

            {/* Editable fields */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1">
                Contact Number
              </label>
              <div className="relative">
                <Phone size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-white border border-slate-200 text-slate-900 rounded-2xl pl-12 pr-5 py-4 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all font-bold text-sm outline-none"
                  placeholder="+92 300 1234567"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1">
                Mailing Address
              </label>
              <div className="relative">
                <MapPin size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full bg-white border border-slate-200 text-slate-900 rounded-2xl pl-12 pr-5 py-4 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all font-bold text-sm outline-none"
                  placeholder="Street, City, Country"
                />
              </div>
            </div>

            <div className="md:col-span-2 space-y-3">
              <label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] ml-1">
                Professional Bio
              </label>
              <textarea 
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                className="w-full bg-white border border-slate-200 text-slate-900 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all font-bold text-sm outline-none resize-none"
                placeholder="Write a brief introduction about your academic background and interests..."
              />
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 flex justify-end">
            <button 
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-xl shadow-indigo-100 uppercase tracking-widest text-[11px] active:scale-95"
            >
              {isSubmitting ? <span className="animate-spin text-xl">⟳</span> : <Save size={18} />}
              {isSubmitting ? 'Processing...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Password Section */}
      <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-800 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-12 opacity-[0.05] group-hover:opacity-[0.08] transition-opacity pointer-events-none text-white">
          <Shield size={200} />
        </div>

        <div className="flex items-center gap-4 mb-10 pb-8 border-b border-white/10">
          <div className="w-16 h-16 bg-white/10 text-white rounded-2xl flex items-center justify-center backdrop-blur-xl border border-white/20">
            <Shield size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Security Credentials</h2>
            <p className="text-slate-400 font-medium">Manage your portal access and authentication</p>
          </div>
        </div>

        <form onSubmit={handleSubmitPassword} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">
                Current Password
              </label>
              <input 
                type="password" 
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                required
                className="w-full bg-white/5 border border-white/10 text-white rounded-2xl px-5 py-4 focus:border-white/30 transition-all font-bold text-sm outline-none placeholder:text-slate-700"
                placeholder="••••••••"
              />
            </div>

            <div className="hidden md:block" />

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">
                New Security Key
              </label>
              <input 
                type="password" 
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                required
                className="w-full bg-white/5 border border-white/10 text-white rounded-2xl px-5 py-4 focus:border-white/30 transition-all font-bold text-sm outline-none placeholder:text-slate-700"
                placeholder="Min. 6 characters"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">
                Confirm Security Key
              </label>
              <input 
                type="password" 
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                required
                className="w-full bg-white/5 border border-white/10 text-white rounded-2xl px-5 py-4 focus:border-white/30 transition-all font-bold text-sm outline-none placeholder:text-slate-700"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 flex justify-end">
            <button 
              type="submit"
              disabled={isChangingPassword}
              className="flex items-center gap-3 px-8 py-4 bg-white text-slate-900 font-black rounded-2xl hover:bg-slate-100 disabled:opacity-50 transition-all shadow-xl uppercase tracking-widest text-[11px] active:scale-95"
            >
              {isChangingPassword ? <span className="animate-spin text-xl">⟳</span> : <Shield size={18} />}
              {isChangingPassword ? 'Updating...' : 'Update Credentials'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FacultySettings;
