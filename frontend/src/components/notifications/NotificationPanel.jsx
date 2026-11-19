import React from 'react';
import { Bell, CheckCheck, ExternalLink, Info, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function NotificationPanel({
  notifications = [],
  onClose,
  onNotificationClick,
  onMarkAllRead,
}) {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div
      className="absolute right-0 top-12 w-80 sm:w-96 bg-white rounded-2xl border border-[#E5E9E4] shadow-xl z-50 overflow-hidden animate-slide-down"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="px-4 py-3 bg-[#FAF9F5] border-b border-[#E5E9E4] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-[#247653]" />
          <h4 className="text-xs font-bold text-[#24332D] uppercase tracking-wider">
            Notifications ({unreadCount} unread)
          </h4>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllRead}
            className="text-[11px] font-semibold text-[#247653] hover:underline flex items-center gap-1"
          >
            <CheckCheck size={13} />
            Mark all read
          </button>
        )}
      </div>

      {/* List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-[#E5E9E4]/60">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#77847D]">
            <p>No notifications yet.</p>
          </div>
        ) : (
          notifications.map((notif) => {
            const timeAgo = new Date(notif.timestamp).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={notif.id}
                onClick={() => onNotificationClick(notif)}
                className={`p-3.5 hover:bg-[#F5F2E9] cursor-pointer transition-colors flex items-start gap-3 ${
                  !notif.read ? 'bg-[#ECFDF5]/50' : 'bg-white'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center mt-0.5 ${
                    notif.type === 'success'
                      ? 'bg-green-100 text-green-700'
                      : notif.type === 'error'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {notif.type === 'success' ? (
                    <CheckCircle2 size={14} />
                  ) : notif.type === 'error' ? (
                    <AlertTriangle size={14} />
                  ) : (
                    <Info size={14} />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <p className={`text-xs truncate ${!notif.read ? 'font-bold text-[#24332D]' : 'font-medium text-[#24332D]'}`}>
                      {notif.title}
                    </p>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-[#F18B38] shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-[#77847D] line-clamp-2 leading-relaxed">
                    {notif.message}
                  </p>
                  <span className="text-[10px] text-[#99A8A0] font-medium mt-1 block">
                    {timeAgo}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
