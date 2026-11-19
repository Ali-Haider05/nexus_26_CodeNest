import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Bell } from 'lucide-react';
import { api } from '../../services/api';

const path = '/api/notifications';

export default function NotificationBell({ onOpenComplaint }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const dropdown = useRef(null);
  const version = useRef(0);

  const refresh = useCallback(async () => {
    const request = ++version.current;
    try {
      const result = await api.request(path);
      if (request === version.current) {
        setData(result);
        setError('');
      }
    } catch (error) {
      if (request === version.current) setError(error.message);
    }
  }, []);

  useEffect(() => {
    const initial = setTimeout(refresh, 0);
    const timer = setInterval(refresh, 30000);
    const closeOutside = (event) => {
      if (dropdown.current && !dropdown.current.contains(event.target)) dropdown.current.open = false;
    };
    document.addEventListener('pointerdown', closeOutside);
    return () => {
      clearTimeout(initial);
      clearInterval(timer);
      document.removeEventListener('pointerdown', closeOutside);
    };
  }, [refresh]);

  async function markRead(notification) {
    setBusy(true);
    setError('');
    try {
      if (!notification || !notification.is_read) {
        const route = notification ? '/' + encodeURIComponent(notification.id) + '/read' : '/read-all';
        await api.request(path + route, { method: 'PATCH' });
      }
      if (notification?.complaint_id) {
        if (dropdown.current) dropdown.current.open = false;
        onOpenComplaint(notification.complaint_id);
      }
      await refresh();
    } catch (error) {
      version.current++;
      setError(error.message);
    } finally {
      setBusy(false);
    }
  }

  const unread = data?.unread_count ?? 0;
  return (
    <details ref={dropdown} className="relative" onToggle={(event) => { if (event.currentTarget.open) void refresh(); }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.currentTarget.open = false;
          event.currentTarget.querySelector('summary').focus();
        }
      }}>
      <summary aria-label={'Notifications, ' + unread + ' unread'} title="Notifications"
        className="relative grid h-9 w-9 cursor-pointer list-none place-items-center rounded-xl text-[#153F35] hover:bg-[#F5F2E9] [&::-webkit-details-marker]:hidden">
        <Bell size={19} aria-hidden="true" />
        {unread > 0 && <span aria-hidden="true" className="absolute -top-1 -right-1 rounded-full bg-[#F18B38] px-1.5 text-[10px] font-bold text-[#153F35]">{unread > 99 ? '99+' : unread}</span>}
      </summary>
      <div className="fixed right-4 top-14 z-40 mt-2 w-[min(19rem,calc(100vw-2rem))] sm:absolute sm:right-0 sm:top-auto rounded-2xl border border-[#E5E9E4] bg-white shadow-xl">
        <div className="flex items-center justify-between gap-2 border-b border-[#E5E9E4] p-3">
          <h2 className="text-sm font-bold">Notifications</h2>
          <button type="button" disabled={busy || !unread} onClick={() => markRead()}
            className="text-xs font-semibold text-[#247653] disabled:opacity-50">Mark all as read</button>
        </div>
        {error && <p role="alert" className="p-3 text-xs text-red-700">{error}</p>}
        {!data && !error && <p role="status" className="p-3 text-xs">Loading notifications...</p>}
        {data?.notifications.length === 0 && <p className="p-3 text-xs text-[#77847D]">No notifications yet.</p>}
        <ul className="max-h-80 divide-y divide-[#E5E9E4] overflow-y-auto">
          {data?.notifications.map((notification) => (
            <li key={notification.id}>
              <button type="button" disabled={busy} onClick={() => markRead(notification)}
                className={'w-full p-3 text-left text-xs hover:bg-[#F5F2E9] ' + (!notification.is_read ? 'bg-[#ECFDF5] font-semibold' : '')}>
                <span className="block break-words">{notification.message}</span>
                {notification.created_at && <time dateTime={notification.created_at} className="mt-1 block text-[11px] font-normal text-[#77847D]">{new Date(notification.created_at).toLocaleString()}</time>}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </details>
  );
}
