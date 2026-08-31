import React, { useState } from 'react';
import { Search, Bell, LogIn, LogOut, RefreshCw, UserCheck, Shield } from 'lucide-react';
import { useAuth, DEMO_USERS } from '../context/AuthContext';

export default function TopHeader({ 
  onOpenSearch, 
  onOpenNotifications, 
  unreadCount = 0,
  onOpenAuth
}) {
  const { user, switchUser, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  // Formatted date matching screenshot (e.g. Wednesday, 26 August 2026)
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const userName = user ? user.name : 'Dr. Adeyemi';

  return (
    <header className="h-20 bg-white border-b border-[#e5ece8] px-8 flex items-center justify-between">
      {/* Date & Salutation */}
      <div>
        <p className="text-xs text-gray-500 font-normal">{formattedDate}</p>
        <h2 className="text-lg font-semibold text-gray-900 tracking-tight">
          Good morning, {userName}
        </h2>
      </div>

      {/* Action Controls */}
      <div className="flex items-center space-x-3">
        {/* Search Button */}
        <button
          onClick={onOpenSearch}
          title="Search patients and records"
          className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:border-gray-300 hover:bg-gray-50 transition-colors"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Notifications Button */}
        <button
          onClick={onOpenNotifications}
          title="View notifications"
          className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:border-gray-300 hover:bg-gray-50 transition-colors relative"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-[#e11d48] rounded-full ring-2 ring-white"></span>
          )}
        </button>

        {/* Clinician Profile Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center space-x-2 pl-2 pr-3 py-1.5 rounded-full border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-[#1f5f5b] text-white flex items-center justify-center text-xs font-semibold">
              {userName.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <span className="text-xs font-medium text-gray-700 hidden sm:inline">{userName}</span>
          </button>

          {showDropdown && (
            <div 
              className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#e5ece8] py-2 z-50 fade-in"
              onMouseLeave={() => setShowDropdown(false)}
            >
              <div className="px-4 py-2.5 border-b border-gray-100">
                <p className="text-xs font-semibold text-gray-900">{userName}</p>
                <p className="text-[11px] text-gray-500">{user?.role || 'Lead Obstetrician'}</p>
                <p className="text-[11px] text-gray-400">{user?.email || 'adeyemi@perisense.health'}</p>
              </div>

              <div className="px-3 py-1.5">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-2 mb-1">Switch Account</p>
                {DEMO_USERS.map((demo) => (
                  <button
                    key={demo.id}
                    onClick={() => {
                      switchUser(demo);
                      setShowDropdown(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      user?.email === demo.email ? 'bg-[#e8f2ed] text-[#1f5f5b] font-medium' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span>{demo.name} ({demo.role.split(' ')[0]})</span>
                    {user?.email === demo.email && <span className="text-[10px] font-bold text-[#1f5f5b]">Active</span>}
                  </button>
                ))}
              </div>

              <div className="border-t border-gray-100 mt-1 pt-1 px-3">
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    onOpenAuth();
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-gray-600 hover:bg-gray-50 flex items-center space-x-2"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Clinician Auth Portal</span>
                </button>
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    logout();
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-rose-600 hover:bg-rose-50 flex items-center space-x-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
