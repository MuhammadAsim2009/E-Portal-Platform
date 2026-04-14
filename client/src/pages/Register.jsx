import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, Eye, EyeOff, AlertCircle } from 'lucide-react';
import api from '../services/api.js';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student', // hardcoded as requested
  });
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="flex min-h-screen bg-slate-50 font-sans">
      
      {/* Left side: Premium Image Banner */}
      <div className="relative hidden w-full lg:block lg:w-1/2 overflow-hidden">
        <div className="absolute inset-0 bg-primary-900/40 z-10 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent z-20"></div>
        <img 
          src="/auth-bg.png" 
          alt="E-Portal Access" 
          className="absolute inset-0 object-cover w-full h-full scale-105"
        />
        <div className="absolute bottom-0 left-0 right-0 z-30 p-16 xl:p-24 text-white">
          <div className="flex items-center space-x-3 mb-8">
            <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl border border-white/30">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">E-Portal</h1>
          </div>
          <h2 className="text-5xl font-bold leading-tight mb-6 tracking-tight text-white/95 drop-shadow-lg">
            Kickstart your <br />
            academic journey.
          </h2>
          <p className="text-lg text-slate-200/90 max-w-md leading-relaxed font-light">
            Join the smartest platform designed to empower students with intelligent scheduling and seamless resource management.
          </p>
        </div>
      </div>

      {/* Right side: Modern Form */}
      <div className="flex flex-col justify-center w-full px-6 py-12 lg:w-1/2 sm:px-12 lg:px-24 xl:px-32 relative">
        <div className="w-full max-w-md mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          <div className="space-y-3">
            <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center mb-6 lg:hidden border border-primary-100">
               <UserPlus className="w-6 h-6 text-primary-600" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Create an account
            </h2>
            <p className="text-slate-500 font-medium">
              Enter your details to register as a new student.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="p-4 bg-red-50/50 backdrop-blur-sm border border-red-200 rounded-2xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            <div className="space-y-5">
              <div className="space-y-1.5">
                <label htmlFor="name" className="block text-sm font-semibold text-slate-700">
                  Full Name
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-500 transition-colors">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="block w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 text-slate-900 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all shadow-sm placeholder:text-slate-400 font-medium"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
                  University Email
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-500 transition-colors">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="block w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 text-slate-900 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all shadow-sm placeholder:text-slate-400 font-medium"
                    placeholder="jdoe@university.edu"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-500 transition-colors">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="block w-full pl-11 pr-12 py-3.5 bg-white border border-slate-200 text-slate-900 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all shadow-sm placeholder:text-slate-400 font-medium"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-4 px-4 border border-transparent text-sm font-semibold rounded-2xl text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-900/10 transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed group relative overflow-hidden"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <span className="relative z-10 flex items-center">
                  Get Started Now 
                  <span className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all ml-2">→</span>
                </span>
              )}
            </button>
          </form>

          <p className="text-center font-medium text-slate-500 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
              Sign in to your portal
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
