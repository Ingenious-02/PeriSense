import React from 'react';
import { 
  LayoutGrid, 
  Users, 
  ClipboardList, 
  Bell, 
  UserCheck, 
  Activity,
  Stethoscope
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, unreadCount = 0 }) {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutGrid },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'assessments', label: 'Assessments', icon: ClipboardList },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadCount },
    { id: 'profile', label: 'Profile', icon: UserCheck },
  ];

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-[#e5ece8] flex flex-col justify-between p-6 select-none shrink-0">
      <div>
        {/* Brand Logo Header */}
        <div className="flex items-center space-x-3 mb-10 pl-1 cursor-pointer" onClick={() => setActiveTab('overview')}>
          <div className="w-10 h-10 rounded-full bg-[#1f5f5b] flex items-center justify-center text-white shadow-sm">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-semibold text-lg text-gray-900 tracking-tight leading-none">PeriSense</h1>
            <span className="text-xs text-gray-500 font-normal">Care intelligence</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-[#e8f2ed] text-[#1f5f5b] font-semibold'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#1f5f5b]' : 'text-gray-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && item.badge > 0 ? (
                  <span className="w-5 h-5 bg-[#e11d48] text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Clinical Companion Widget (Matches Bottom Left of UI Screenshot) */}
      <div className="bg-[#eaf3ee] rounded-2xl p-4 border border-[#d6e5dd]">
        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#1f5f5b] mb-3 shadow-xs">
          <Stethoscope className="w-4 h-4" />
        </div>
        <h4 className="font-semibold text-gray-900 text-xs mb-1">Clinical companion</h4>
        <p className="text-[11px] text-gray-600 leading-relaxed">
          Support earlier conversations, not replace clinical judgment.
        </p>
      </div>
    </aside>
  );
}
