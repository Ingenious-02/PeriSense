import React, { useState, useEffect } from 'react';
import { ChevronRight, CheckCheck, Bell, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

export default function NotificationsView({ onOpenPatientDetail, onOpenNewAssessment }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await api.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const handleItemClick = async (item) => {
    if (!item.is_read) {
      try {
        await api.markNotificationRead(item.id);
        setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, is_read: true } : n));
      } catch (err) {
        console.error('Error marking read:', err);
      }
    }
  };

  const getDotColor = (priority) => {
    if (priority === 'high') return 'bg-[#f43f5e]'; // Rose red dot
    if (priority === 'moderate') return 'bg-[#f43f5e]'; // Or amber
    return 'bg-[#1f5f5b]'; // Teal dot
  };

  return (
    <div className="space-y-6 fade-in max-w-6xl mx-auto">
      {/* Header (Matches Figure 4.16) */}
      <div>
        <span className="text-xs text-[#1f5f5b] font-medium block mb-1">
          Your care workspace
        </span>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-1">
          Notifications
        </h1>
        <p className="text-sm text-gray-500">
          Stay close to the moments that may need your attention.
        </p>
      </div>

      {/* Notifications Card Container (Figure 4.16) */}
      <div className="bg-white rounded-3xl border border-[#e5ece8] p-6 sm:p-8 shadow-xs">
        <div className="flex items-center justify-between mb-6 pb-2">
          <h2 className="text-base font-bold text-gray-900">Recent activity</h2>
          <button
            onClick={handleMarkAllRead}
            className="text-xs font-semibold text-[#1f5f5b] hover:text-[#164e4a] transition-colors cursor-pointer"
          >
            Mark all read
          </button>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center items-center text-gray-400">
            <RefreshCw className="w-6 h-6 animate-spin text-[#1f5f5b]" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-sm">
            No notifications yet.
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => handleItemClick(item)}
                className="p-4 bg-[#f8faf9] hover:bg-[#f2f7f4] rounded-2xl cursor-pointer flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center space-x-3.5">
                  {/* Priority Indicator Dot */}
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${getDotColor(item.priority)}`}></div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 group-hover:text-[#1f5f5b] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {item.subtitle}
                    </p>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-700 transition-colors shrink-0" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
