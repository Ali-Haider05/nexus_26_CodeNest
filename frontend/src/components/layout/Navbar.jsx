import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { complaintService } from '../../services/complaintService';
import NotificationPanel from '../notifications/NotificationPanel';
import {
  Bell,
  Menu,
  Server,
  Activity,
  GraduationCap,
  ShieldCheck,
  Building2,
  RefreshCw,
} from 'lucide-react';

export default function Navbar({ onToggleSidebar, onSelectComplaint }) {
  const { currentUser, role, backendStatus, checkHealth } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 15000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const loadNotifications = async () => {
    if (currentUser?.id) {
      try {
        const list = await complaintService.getNotifications(currentUser.id);
        setNotifications(list);
      } catch {
        // ignore notification fetch failure
      }
    }
  };

  const handleMarkAllRead = async () => {
    if (currentUser?.id) {
      await complaintService.markAllNotificationsRead(currentUser.id);
      loadNotifications();
    }
  };

  const handleNotificationClick = async (notif) => {
    await complaintService.markNotificationRead(notif.id);
    loadNotifications();
    setShowNotifications(false);
    if (notif.complaintId && onSelectComplaint) {
      try {
        const c = await complaintService.getComplaintById(notif.complaintId);
        onSelectComplaint(c);
      } catch {
        // ignore
      }
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const roleLabel =
    role === 'student'
      ? 'Student'
      : role === 'super_admin'
      ? 'Super Admin'
      : currentUser?.department || 'Department Admin';

  const RoleIcon =
    role === 'student'
      ? GraduationCap
      : role === 'super_admin'
      ? ShieldCheck
      : Building2;

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-[#E5E9E4] px-4 lg:px-6 py-3 shadow-xs">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Campus Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl text-[#24332D] hover:bg-[#F5F2E9] transition-colors"
            aria-label="Toggle Navigation"
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#153F35] flex items-center justify-center text-white font-bold text-base shadow-xs">
              C
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-[#153F35] text-base tracking-tight">
                  Campus<span className="text-[#F18B38]">Connect</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider bg-[#F5F2E9] text-[#247653] px-2 py-0.5 rounded border border-[#E5E9E4]">
                  BIIT Portal
                </span>
              </div>
              <p className="text-[10px] text-[#77847D] leading-none hidden md:block">
                Smart Campus Complaint & Feedback System
              </p>
            </div>
          </div>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Neon / Backend Integration Status */}
          <div
            onClick={checkHealth}
            title={
              backendStatus.isConnected
                ? 'Backend PostgreSQL server connected'
                : 'Connecting to Backend server'
            }
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer border transition-all hover:opacity-90"
            style={{
              backgroundColor: backendStatus.isConnected ? '#ECFDF5' : '#FFF7ED',
              borderColor: backendStatus.isConnected ? '#A7F3D0' : '#FFEDD5',
              color: backendStatus.isConnected ? '#166534' : '#9A3412',
            }}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                backendStatus.isConnected ? 'bg-[#16834A] animate-pulse' : 'bg-[#D97706]'
              }`}
            />
            <span className="text-[11px]">
              {backendStatus.isConnected ? 'Backend Live' : 'Backend Connecting'}
            </span>
          </div>

          {/* User Role Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F5F2E9] border border-[#E5E9E4] text-xs font-bold text-[#153F35] shadow-xs">
            <RoleIcon size={14} className="text-[#247653]" />
            <span className="max-w-[140px] truncate">{roleLabel}</span>
          </div>

          {/* Notifications Button */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl text-[#24332D] hover:bg-[#F5F2E9] border border-transparent hover:border-[#E5E9E4] transition-colors"
              aria-label="Notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#F18B38] text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowNotifications(false)}
                />
                <NotificationPanel
                  notifications={notifications}
                  onClose={() => setShowNotifications(false)}
                  onNotificationClick={handleNotificationClick}
                  onMarkAllRead={handleMarkAllRead}
                />
              </>
            )}
          </div>

          {/* User Info & Avatar */}
          <div className="flex items-center gap-2 pl-2 border-l border-[#E5E9E4]">
            <div className="w-8 h-8 rounded-full bg-[#247653] text-white font-bold text-xs flex items-center justify-center shadow-xs overflow-hidden shrink-0 border border-[#A7F3D0]">
              {currentUser?.avatar || currentUser?.profilePicture ? (
                <img
                  src={currentUser.avatar || currentUser.profilePicture}
                  alt={currentUser.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                currentUser?.name?.charAt(0) || 'U'
              )}
            </div>
            <div className="hidden xl:block text-left">
              <p className="text-xs font-bold text-[#24332D] leading-tight truncate max-w-[130px]">
                {currentUser?.name || 'User'}
              </p>
              <p className="text-[10px] text-[#77847D] leading-none truncate max-w-[130px]">
                {currentUser?.email}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
