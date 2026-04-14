import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, ShieldCheck, AlertCircle } from 'lucide-react';
import api from '../services/api.js';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student'
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await api.post('/auth/register', formData);
      if (response.status === 201) {
        navigate('/login', { state: { message: 'Registration successful! Please sign in.' } });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check your data.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4 py-12">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <div className="flex justify-center">
            <div className="bg-primary-600 p-3 rounded-xl shadow-lg shadow-primary-200">
              <UserPlus className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 tracking-tight">
            Join the E-Portal
          </h2>
          <p className="mt-2 text-center text-sm text-slate-500">
            Create your account to access university services.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 flex items-center gap-3 font-medium">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="h-5 w-5" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-slate-200 placeholder-slate-400 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1">
                University Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-slate-200 placeholder-slate-400 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="jdoe@university.edu"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label htmlFor="role" className="block text-sm font-semibold text-slate-700 mb-1">
                  Account Role
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <select
                    id="role"
                    name="role"
                    className="appearance-none block w-full pl-10 pr-8 py-3 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-white"
                    value={formData.role}
                    onChange={handleChange}
                  >
                    <option value="student">Student</option>
                    <option value="faculty">Faculty</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none block w-full pl-10 pr-3 py-3 border border-slate-200 placeholder-slate-400 text-slate-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all shadow-lg disabled:opacity-50"
            >
              {isLoading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                'Create Account'
              )}
            </button>
          </div>

          <p className="text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-primary-600 hover:text-primary-500 transition-colors">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
