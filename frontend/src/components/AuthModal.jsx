import React, { useState } from 'react';
import { X, Lock, Mail, User, ShieldCheck, UserCheck, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth, DEMO_USERS } from '../context/AuthContext';

export default function AuthModal() {
  const { isAuthModalOpen, setIsAuthModalOpen, login, register, switchUser, user } = useAuth();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('adeyemi@perisense.health');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('');
  const [title, setTitle] = useState('Dr.');
  const [role, setRole] = useState('Obstetrician');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegisterMode) {
        await register({ name, email, password, title, role });
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative fade-in">
        {/* Close Button if already logged in */}
        {user && (
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="absolute top-6 right-6 text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#1f5f5b] text-white flex items-center justify-center mx-auto mb-3 shadow-sm">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
            {isRegisterMode ? 'Register Clinician' : 'Clinician Portal'}
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            {isRegisterMode 
              ? 'Create your PeriSense healthcare credentials' 
              : 'Sign in to access maternal risk triage workspace'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Quick Demo Clinician Switcher */}
        {!isRegisterMode && (
          <div className="mb-5 p-3.5 bg-[#edf5f1] rounded-2xl border border-[#d8e5df]">
            <p className="text-[10px] font-bold text-[#1f5f5b] uppercase tracking-wider mb-2">
              Quick 1-Click Clinician Demo Accounts
            </p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_USERS.map((demo) => (
                <button
                  key={demo.id}
                  type="button"
                  onClick={() => {
                    switchUser(demo);
                    setIsAuthModalOpen(false);
                  }}
                  className="p-2.5 bg-white border border-[#cbe0d5] hover:border-[#1f5f5b] rounded-xl text-left transition-all group"
                >
                  <p className="text-xs font-bold text-gray-900 group-hover:text-[#1f5f5b]">{demo.name}</p>
                  <p className="text-[10px] text-gray-500">{demo.role.split(' ')[0]}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {isRegisterMode && (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Dr. Adeyemi"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#f2f7f4] border border-transparent focus:border-[#1f5f5b] focus:bg-white rounded-xl text-xs text-gray-900 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Title</label>
                  <select
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#f2f7f4] border border-transparent rounded-xl text-xs text-gray-900 outline-none"
                  >
                    <option value="Dr.">Dr.</option>
                    <option value="Nurse">Nurse</option>
                    <option value="Midwife">Midwife</option>
                    <option value="Prof.">Prof.</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Specialty</label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="Obstetrician"
                    className="w-full px-3 py-2.5 bg-[#f2f7f4] border border-transparent rounded-xl text-xs text-gray-900 outline-none"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="adeyemi@perisense.health"
                className="w-full pl-10 pr-4 py-2.5 bg-[#f2f7f4] border border-transparent focus:border-[#1f5f5b] focus:bg-white rounded-xl text-xs text-gray-900 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-[#f2f7f4] border border-transparent focus:border-[#1f5f5b] focus:bg-white rounded-xl text-xs text-gray-900 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#1f5f5b] hover:bg-[#164e4a] text-white font-semibold rounded-xl text-xs transition-colors flex items-center justify-center space-x-1.5 shadow-sm mt-2 cursor-pointer"
          >
            <span>{isRegisterMode ? 'Create Account' : 'Sign in to Workspace'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="text-center mt-4 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(!isRegisterMode);
              setError('');
            }}
            className="text-xs text-[#1f5f5b] font-semibold hover:underline"
          >
            {isRegisterMode ? 'Already have an account? Sign in' : 'New clinician? Register here'}
          </button>
        </div>
      </div>
    </div>
  );
}
