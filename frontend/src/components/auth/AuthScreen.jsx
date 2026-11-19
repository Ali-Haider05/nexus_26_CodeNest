import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LogIn,
  UserPlus,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Lock,
  Mail,
  User,
  GraduationCap,
  Building,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

export default function AuthScreen({ onLoginSuccess }) {
  const { login, register, sessionError } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'register'

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register form state (Student registration)
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [showWakeMessage, setShowWakeMessage] = useState(false);

  useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => setShowWakeMessage(true), 5000);
    return () => clearTimeout(timer);
  }, [loading]);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Handle Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!email.trim() || !password) {
      setError('Please enter both your university email address and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await login({ email: email.trim(), password });
      if (res.success && onLoginSuccess) {
        onLoginSuccess(res.user);
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setShowWakeMessage(false);
      setLoading(false);
    }
  };

  // Handle Student Registration
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!regName.trim() || !regEmail.trim() || !regPassword) {
      setError('Please complete all required fields.');
      return;
    }

    if (!regEmail.includes('@')) {
      setError('Please provide a valid institutional email address.');
      return;
    }

    if (regPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    try {
      const res = await register({
        name: regName.trim(),
        email: regEmail.trim(),
        password: regPassword,
      });
      if (res.success) {
        setSuccessMessage('Student registration successful! Entering portal...');
        setTimeout(() => {
          if (onLoginSuccess) onLoginSuccess(res.user);
        }, 800);
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setShowWakeMessage(false);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F2E9] flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 animate-fade-in">
      <div className="w-full max-w-lg">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-3xl bg-[#153F35] text-white font-extrabold text-2xl shadow-md mb-3 border-2 border-[#247653]/30">
            CC
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#153F35] tracking-tight">
            Campus<span className="text-[#F18B38]">Connect</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#77847D] mt-1 font-medium">
            Smart Campus Complaint & Feedback Management System
          </p>
        </div>

        {/* Main Auth Card */}
        <div className="bg-white rounded-3xl border border-[#E5E9E4] shadow-xl overflow-hidden">
          {/* Mode Tabs */}
          <div className="grid grid-cols-2 border-b border-[#E5E9E4] bg-[#FAF9F5] text-xs font-bold">
            <button
              onClick={() => {
                setMode('login');
                setError('');
                setSuccessMessage('');
              }}
              className={`py-3.5 transition-all text-center flex items-center justify-center gap-2 ${
                mode === 'login'
                  ? 'bg-white text-[#153F35] border-b-2 border-[#247653] shadow-xs'
                  : 'text-[#77847D] hover:text-[#24332D]'
              }`}
            >
              <LogIn size={15} />
              Portal Sign In
            </button>
            <button
              onClick={() => {
                setMode('register');
                setError('');
                setSuccessMessage('');
              }}
              className={`py-3.5 transition-all text-center flex items-center justify-center gap-2 ${
                mode === 'register'
                  ? 'bg-white text-[#153F35] border-b-2 border-[#247653] shadow-xs'
                  : 'text-[#77847D] hover:text-[#24332D]'
              }`}
            >
              <UserPlus size={15} />
              Student Registration
            </button>
          </div>

          <div className="p-6 sm:p-8 space-y-5">
            {(error || sessionError) && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error || sessionError}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3.5 rounded-xl bg-green-50 border border-green-200 text-green-700 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 size={16} className="shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {mode === 'login' ? (
              /* LOGIN FORM */
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#77847D] uppercase tracking-wider mb-1.5">
                    University Email Address
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-3.5 text-[#77847D]" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. your-id@biit.edu.pk"
                      className="w-full text-xs pl-10 pr-4 py-3 rounded-xl border border-[#E5E9E4] focus:outline-none focus:ring-2 focus:ring-[#247653]/20 focus:border-[#247653] bg-white font-medium text-[#24332D]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#77847D] uppercase tracking-wider mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-3.5 text-[#77847D]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full text-xs pl-10 pr-10 py-3 rounded-xl border border-[#E5E9E4] focus:outline-none focus:ring-2 focus:ring-[#247653]/20 focus:border-[#247653] bg-white font-medium text-[#24332D]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-[#77847D] hover:text-[#24332D]"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1 text-[#77847D]">
                  <span>Authorized Students & Department Staff</span>
                  <span className="font-semibold text-[#153F35]">Secure Authentication</span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-[#247653] hover:bg-[#194D40] text-white text-xs font-bold shadow-md transition-all hover:scale-[1.01] flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <RefreshCw size={14} className="animate-spin" /> Authenticating...
                    </span>
                  ) : (
                    <>
                      <LogIn size={15} />
                      Sign In to CampusConnect
                    </>
                  )}
                </button>
                {loading && showWakeMessage && (
                  <p role="status" className="text-center text-xs text-[#77847D]">
                    Server is waking up, please wait up to a minute...
                  </p>
                )}
              </form>
            ) : (
              /* STUDENT REGISTRATION FORM */
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#77847D] uppercase tracking-wider mb-1.5">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User size={15} className="absolute left-3.5 top-3.5 text-[#77847D]" />
                      <input
                        type="text"
                        required
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="e.g. Ayesha Khan"
                        className="w-full text-xs pl-10 pr-3 py-3 rounded-xl border border-[#E5E9E4] focus:outline-none focus:ring-2 focus:ring-[#247653]/20 focus:border-[#247653] bg-white text-[#24332D]"
                      />
                    </div>
                  </div>

                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#77847D] uppercase tracking-wider mb-1.5">
                      University Email *
                    </label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-3.5 top-3.5 text-[#77847D]" />
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="student@biit.edu.pk"
                        className="w-full text-xs pl-10 pr-3 py-3 rounded-xl border border-[#E5E9E4] focus:outline-none focus:ring-2 focus:ring-[#247653]/20 focus:border-[#247653] bg-white text-[#24332D]"
                      />
                    </div>
                  </div>

                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#77847D] uppercase tracking-wider mb-1.5">
                      Create Password *
                    </label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3.5 top-3.5 text-[#77847D]" />
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Min 8 characters"
                        className="w-full text-xs pl-10 pr-9 py-3 rounded-xl border border-[#E5E9E4] focus:outline-none focus:ring-2 focus:ring-[#247653]/20 focus:border-[#247653] bg-white text-[#24332D]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-3 top-3.5 text-[#77847D]"
                      >
                        {showRegPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#77847D] uppercase tracking-wider mb-1.5">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <Lock size={15} className="absolute left-3.5 top-3.5 text-[#77847D]" />
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className="w-full text-xs pl-10 pr-3 py-3 rounded-xl border border-[#E5E9E4] focus:outline-none focus:ring-2 focus:ring-[#247653]/20 focus:border-[#247653] bg-white text-[#24332D]"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-[#247653] hover:bg-[#194D40] text-white text-xs font-bold shadow-md transition-all hover:scale-[1.01] flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <RefreshCw size={14} className="animate-spin" /> Registering...
                    </span>
                  ) : (
                    <>
                      <UserPlus size={15} />
                      Complete Registration & Sign In
                    </>
                  )}
                </button>
                {loading && showWakeMessage && (
                  <p role="status" className="text-center text-xs text-[#77847D]">
                    Server is waking up, please wait up to a minute...
                  </p>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
