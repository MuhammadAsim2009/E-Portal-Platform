import usePageTitle from '../hooks/usePageTitle';
import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation, Navigate } from 'react-router-dom';
import { LogIn, Mail, Lock, AlertCircle, EyeOff, Eye } from 'lucide-react';
import useAuthStore from '../store/authStore.js';
const Login = () => {
  usePageTitle('Login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, user } = useAuthStore();
  // If already authenticated, redirect to the correct dashboard immediately
  useEffect(() => {
    if (isAuthenticated && user) {
      const dest = user.role === 'admin' ? '/admin/dashboard' : 
                   user.role === 'faculty' ? '/faculty/dashboard' : 
                   '/student/dashboard';
      // If they came from a valid location for their role, go there, otherwise go to dest
      const from = location.state?.from;
      const isAuthorizedForFrom = from && (
        (user.role === 'student' && from.pathname.startsWith('/student')) ||
        (user.role === 'admin' && from.pathname.startsWith('/admin')) ||
        (user.role === 'faculty' && from.pathname.startsWith('/faculty'))
      );
      navigate(isAuthorizedForFrom ? from : dest, { replace: true });
    }
  }, [isAuthenticated, user, navigate, location]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        // Redirection handled by useEffect
      } else if (result.mfaRequired) {
        navigate(`/mfa/verify?userId=${result.userId}`);
      } else {
        setError(result.message);
      }
    } catch (err) {
      if (err.message === 'MFA REQUIRED') {
        const mfaId = err.response?.data?.userId;
        navigate(`/mfa/verify?userId=${mfaId}`);
      } else {
        setError(err.message || 'Failed to login');
      }
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
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">E-Portal</h1>
          </div>
          <h2 className="text-5xl font-bold leading-tight mb-6 tracking-tight text-white/95 drop-shadow-lg">
            Welcome back to <br />
            your central hub.
          </h2>
          <p className="text-lg text-slate-200/90 max-w-md leading-relaxed font-light">
            Sign in securely to view your Dashboard, manage course enrollments, and check your academic standing all in one beautifully crafted UI.
          </p>
        </div>
      </div>
      {/* Right side: Modern Form */}
      <div className="flex flex-col justify-center w-full px-6 py-12 lg:w-1/2 sm:px-12 lg:px-24 xl:px-32 relative">
        <div className="w-full max-w-md mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Header section (visible mostly on mobile without the big banner, or as context on desktop) */}
          <div className="space-y-3">
            <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center mb-6 lg:hidden border border-primary-100">
               <LogIn className="w-6 h-6 text-primary-600" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Sign in to Portal
            </h2>
            <p className="text-slate-500 font-medium">
              Please enter your credentials to proceed.
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
                <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-500 transition-colors">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    className="block w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 text-slate-900 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all shadow-sm placeholder:text-slate-400 font-medium"
                    placeholder="name@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                    Password
                  </label>
                  <a href="#" className="text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors">
                    Forgot password?
                  </a>
                </div>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-500 transition-colors">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="block w-full pl-11 pr-12 py-3.5 bg-white border border-slate-200 text-slate-900 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all shadow-sm placeholder:text-slate-400 font-medium"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-slate-300 rounded focus:ring-offset-0 transition-colors cursor-pointer"
              />
              <label htmlFor="remember-me" className="ml-2.5 block text-sm font-medium text-slate-600 cursor-pointer">
                Remember me for 30 days
              </label>
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
                  Sign In
                  <span className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all ml-2">→</span>
                </span>
              )}
            </button>
          </form>
          <p className="text-center font-medium text-slate-500 text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
              Create one now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
export default Login;
