import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Activity, 
  Lock, 
  Mail, 
  User, 
  Building2, 
  Stethoscope, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles, 
  HeartHandshake 
} from 'lucide-react';
import { useAuth, DEMO_USERS } from '../context/AuthContext';

export default function LoginPage() {
  const { login, register, switchDemoUser } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('adeyemi@perisense.health');
  const [loginPassword, setLoginPassword] = useState('password123');

  // Register form state
  const [regData, setRegData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    title: 'Dr.',
    role: 'Lead Obstetrician',
    department: 'Maternal-Fetal Medicine',
    clinic_name: 'PeriSense Care Center'
  });

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(loginEmail, loginPassword);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (regData.password !== regData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (regData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    try {
      await register({
        name: regData.name,
        email: regData.email,
        password: regData.password,
        title: regData.title,
        role: regData.role,
        department: regData.department,
        clinic_name: regData.clinic_name
      });
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = async (demo) => {
    setError('');
    setLoading(true);
    try {
      await switchDemoUser(demo);
    } catch (err) {
      setError(err.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f8f6] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* PeriSense Brand Logo */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#1f5f5b] text-white shadow-md mb-4">
          <Activity className="w-8 h-8" />
        </div>
        <span className="text-xs font-bold text-[#1f5f5b] tracking-widest uppercase block">
          PERISENSE CARE INTELLIGENCE
        </span>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mt-1">
          Clinician Portal
        </h1>
        <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
          Secure, AI-assisted maternal health risk screening and obstetric clinical decision support.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-6 shadow-xl rounded-3xl sm:px-10 border border-[#e2ede7]">
          
          {/* Quick 1-Click Demo Accounts Bar */}
          <div className="mb-6 p-4 bg-[#edf5f1] rounded-2xl border border-[#d6e7de]">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-[#1f5f5b] uppercase tracking-wider mb-2.5">
              <Sparkles className="w-4 h-4" />
              <span>1-Click Clinical Demo Access</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {DEMO_USERS.map((demo) => (
                <button
                  key={demo.id}
                  type="button"
                  disabled={loading}
                  onClick={() => handleDemoClick(demo)}
                  className="p-3 bg-white border border-[#cbe0d5] hover:border-[#1f5f5b] rounded-xl text-left transition-all shadow-2xs hover:shadow-xs group cursor-pointer disabled:opacity-60"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-900 group-hover:text-[#1f5f5b]">
                      {demo.name}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#1f5f5b] transition-transform group-hover:translate-x-0.5" />
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5">{demo.role}</p>
                  <p className="text-[10px] text-gray-400">{demo.email}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Switcher: Sign In vs Register */}
          <div className="flex rounded-xl bg-[#edf5f1] p-1 mb-6 border border-[#d8e6df]">
            <button
              type="button"
              onClick={() => { setIsRegister(false); setError(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                !isRegister
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsRegister(true); setError(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                isRegister
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Register Clinician
            </button>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* SIGN IN FORM */}
          {!isRegister ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Work Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="adeyemi@perisense.health"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#f2f7f4] border border-transparent focus:border-[#1f5f5b] focus:bg-white rounded-xl text-xs text-gray-900 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 bg-[#f2f7f4] border border-transparent focus:border-[#1f5f5b] focus:bg-white rounded-xl text-xs text-gray-900 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center text-gray-600">
                  <input type="checkbox" defaultChecked className="rounded border-gray-300 text-[#1f5f5b] focus:ring-[#1f5f5b] mr-2" />
                  Remember this device
                </label>
                <span className="text-gray-400 text-[11px]">JWT 24h Session</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#1f5f5b] hover:bg-[#164e4a] text-white font-semibold rounded-xl text-xs transition-colors flex items-center justify-center space-x-1.5 shadow-sm mt-4 cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Sign in to Care Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* REGISTER FORM */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={regData.name}
                    onChange={(e) => setRegData({ ...regData, name: e.target.value })}
                    placeholder="e.g. Dr. Ngozi Balogun"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#f2f7f4] border border-transparent focus:border-[#1f5f5b] focus:bg-white rounded-xl text-xs text-gray-900 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Title</label>
                  <select
                    value={regData.title}
                    onChange={(e) => setRegData({ ...regData, title: e.target.value })}
                    className="w-full px-3 py-2.5 bg-[#f2f7f4] border border-transparent rounded-xl text-xs text-gray-900 outline-none"
                  >
                    <option value="Dr.">Dr.</option>
                    <option value="Nurse">Nurse</option>
                    <option value="Midwife">Midwife</option>
                    <option value="Prof.">Prof.</option>
                    <option value="Specialist">Specialist</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Clinical Role</label>
                  <input
                    type="text"
                    required
                    value={regData.role}
                    onChange={(e) => setRegData({ ...regData, role: e.target.value })}
                    placeholder="Obstetrician"
                    className="w-full px-3 py-2.5 bg-[#f2f7f4] border border-transparent rounded-xl text-xs text-gray-900 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={regData.department}
                    onChange={(e) => setRegData({ ...regData, department: e.target.value })}
                    placeholder="Antenatal Clinic"
                    className="w-full px-3 py-2.5 bg-[#f2f7f4] border border-transparent rounded-xl text-xs text-gray-900 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Hospital / Clinic</label>
                  <input
                    type="text"
                    value={regData.clinic_name}
                    onChange={(e) => setRegData({ ...regData, clinic_name: e.target.value })}
                    placeholder="General Hospital"
                    className="w-full px-3 py-2.5 bg-[#f2f7f4] border border-transparent rounded-xl text-xs text-gray-900 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={regData.email}
                    onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                    placeholder="clinician@hospital.org"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#f2f7f4] border border-transparent focus:border-[#1f5f5b] focus:bg-white rounded-xl text-xs text-gray-900 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Password (min 8)</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={regData.password}
                    onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-3 py-2.5 bg-[#f2f7f4] border border-transparent focus:border-[#1f5f5b] focus:bg-white rounded-xl text-xs text-gray-900 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={regData.confirmPassword}
                    onChange={(e) => setRegData({ ...regData, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-3 py-2.5 bg-[#f2f7f4] border border-transparent focus:border-[#1f5f5b] focus:bg-white rounded-xl text-xs text-gray-900 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#1f5f5b] hover:bg-[#164e4a] text-white font-semibold rounded-xl text-xs transition-colors flex items-center justify-center space-x-1.5 shadow-sm mt-3 cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <span>Registering...</span>
                ) : (
                  <>
                    <span>Create Clinician Account & Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Security Assurance Footer */}
          <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
            <div className="flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-[#1f5f5b]" />
              <span>Decoupled PII & Salted PBKDF2</span>
            </div>
            <span>WHO & ACOG Protocols</span>
          </div>
        </div>
      </div>
    </div>
  );
}
