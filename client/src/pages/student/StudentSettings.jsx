import React, { useState } from 'react';
import { User, Settings, Save, Shield } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

const StudentSettings = ({ studentInfo }) => {
  const [formData, setFormData] = useState({
    contact_number: studentInfo?.contact_number || '',
    gender: studentInfo?.gender || '',
    date_of_birth: studentInfo?.date_of_birth ? new Date(studentInfo.date_of_birth).toISOString().split('T')[0] : '',
    cnic: studentInfo?.cnic || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

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
      await api.put('/student/settings', formData);
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

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
      {/* Profile Section */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-slate-100">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
            <Settings size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Profile Settings</h2>
            <p className="text-slate-500 font-medium">Update your personal information</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Read-only fields */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                Email Address <Shield size={12} className="text-amber-500" />
              </label>
              <input 
                type="email" 
                value={studentInfo?.email || ''} 
                disabled 
                className="w-full bg-slate-50 border-slate-200 text-slate-400 rounded-xl px-4 py-3 cursor-not-allowed border"
              />
              <p className="text-[10px] text-slate-400 font-medium italic">Email cannot be changed.</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                Current GPA <Shield size={12} className="text-amber-500" />
              </label>
              <input 
                type="text" 
                value={studentInfo?.gpa || 'N/A'} 
                disabled 
                className="w-full bg-slate-50 border-slate-200 text-slate-400 rounded-xl px-4 py-3 cursor-not-allowed border"
              />
              <p className="text-[10px] text-slate-400 font-medium italic">GPA is auto-calculated.</p>
            </div>

            {/* Editable fields */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-widest">
                Contact Number
              </label>
              <input 
                type="text" 
                name="contact_number"
                value={formData.contact_number}
                onChange={handleChange}
                className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                placeholder="e.g. +1 234 567 890"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-widest">
                CNIC
              </label>
              <input 
                type="text" 
                name="cnic"
                value={formData.cnic}
                onChange={handleChange}
                className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
                placeholder="00000-0000000-0"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-widest">
                Gender
              </label>
              <select 
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all appearance-none"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-widest">
                Date of Birth
              </label>
              <input 
                type="date" 
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleChange}
                className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="pt-8 mt-8 border-t border-slate-100 flex justify-end">
            <button 
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-200 uppercase tracking-widest text-xs"
            >
              {isSubmitting ? <span className="animate-spin text-xl">⟳</span> : <Save size={16} />}
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Password Section */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-slate-100">
          <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center">
            <Shield size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Security</h2>
            <p className="text-slate-500 font-medium">Manage your account password</p>
          </div>
        </div>

        <form onSubmit={handleSubmitPassword} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-widest">
                Current Password
              </label>
              <input 
                type="password" 
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                required
                className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>

            <div className="hidden md:block" />

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-widest">
                New Password
              </label>
              <input 
                type="password" 
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                required
                className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                placeholder="At least 6 characters"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-widest">
                Confirm New Password
              </label>
              <input 
                type="password" 
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                required
                className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="pt-8 mt-8 border-t border-slate-100 flex justify-end">
            <button 
              type="submit"
              disabled={isChangingPassword}
              className="flex items-center gap-2 px-6 py-3 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 disabled:opacity-50 transition-all shadow-lg shadow-rose-200 uppercase tracking-widest text-xs"
            >
              {isChangingPassword ? <span className="animate-spin text-xl">⟳</span> : <Shield size={16} />}
              {isChangingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentSettings;
