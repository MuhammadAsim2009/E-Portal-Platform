import usePageTitle from '../hooks/usePageTitle';
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShieldCheck, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';
import useAuthStore from '../store/authStore.js';
const MFAVerify = () => {
  usePageTitle('Two-Factor Verification');
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { verifyMFA, isAuthenticated, user } = useAuthStore();
  useEffect(() => {
    if (!userId) {
      navigate('/login');
    }
  }, [userId, navigate]);
  // If already authenticated during this flow, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      const dest = user.role === 'admin' ? '/admin/dashboard' : 
                   user.role === 'faculty' ? '/faculty/dashboard' : 
                   '/student/dashboard';
      navigate(dest, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);
  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    const newCode = [...code];
    newCode[index] = value.substring(value.length - 1);
    setCode(newCode);
    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`code-${index + 1}`).focus();
    }
  };
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      document.getElementById(`code-${index - 1}`).focus();
    }
  };
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const fullCode = code.join('');
    if (fullCode.length !== 6) return;
    setError('');
    setIsLoading(true);
    try {
      const result = await verifyMFA(userId, fullCode);
      if (!result.success) {
        setError(result.message);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  // Auto submit when all digits filled
  useEffect(() => {
    if (code.every(digit => digit !== '')) {
      handleSubmit();
    }
  }, [code]);
  return (
    <div className="flex min-h-screen bg-slate-50 font-sans items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 bg-primary-50 rounded-3xl flex items-center justify-center border border-primary-100 shadow-inner">
             <ShieldCheck className="w-10 h-10 text-primary-600" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Verify your identity
            </h2>
            <p className="text-slate-500 font-medium">
              We've sent a 6-digit code to your email.
            </p>
          </div>
        </div>
        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 space-y-8">
          {error && (
            <div className="p-4 bg-red-50/50 backdrop-blur-sm border border-red-200 rounded-2xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700 font-medium">{error}</p>
            </div>
          )}
          <div className="flex justify-between gap-2 sm:gap-4">
            {code.map((digit, index) => (
              <input
                key={index}
                id={`code-${index}`}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 focus:bg-white transition-all outline-none"
              />
            ))}
          </div>
          <button
            onClick={handleSubmit}
            disabled={isLoading || code.some(d => d === '')}
            className="w-full flex justify-center py-4 px-4 border border-transparent text-sm font-semibold rounded-2xl text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-900/10 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {isLoading ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <span className="flex items-center">
                Verify Code <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </button>
          <div className="text-center">
            <p className="text-sm font-medium text-slate-500">
              Didn't receive the code?{' '}
              <button className="text-primary-600 hover:text-primary-700 font-semibold transition-colors">
                Resend code
              </button>
            </p>
          </div>
        </div>
        <button 
          onClick={() => navigate('/login')}
          className="w-full text-center text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors"
        >
          Back to login
        </button>
      </div>
    </div>
  );
};
export default MFAVerify;
