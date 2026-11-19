import React, { useRef, useState } from 'react';
import NotificationBell from './NotificationBell';
import PasswordForm from '../common/PasswordForm';
import { useAuth } from '../../context/AuthContext';
import {
  Menu,
  KeyRound,
  X,
  GraduationCap,
  ShieldCheck,
  Building2,
} from 'lucide-react';

export default function Navbar({ onToggleSidebar, sidebarOpen, onOpenComplaint }) {
  const { currentUser, role } = useAuth();
  const dialog = useRef(null);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);

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
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Mobile Toggle & Campus Title */}
        <div className="flex items-center gap-1 sm:gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl text-[#24332D] hover:bg-[#F5F2E9] transition-colors"
            aria-label="Toggle Navigation"
            aria-controls="workspace-sidebar"
            aria-expanded={sidebarOpen}
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
        <div className="flex items-center gap-1 sm:gap-3">

          {/* User Role Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F5F2E9] border border-[#E5E9E4] text-xs font-bold text-[#153F35] shadow-xs">
            <RoleIcon size={14} className="text-[#247653]" />
            <span className="max-w-[140px] truncate">{roleLabel}</span>
          </div>

          <NotificationBell onOpenComplaint={onOpenComplaint} />
          {role !== 'student' && (
            <details className="relative">
              <summary aria-label="Account menu" title="Account menu" className="grid h-9 w-9 list-none cursor-pointer place-items-center rounded-xl text-[#153F35] hover:bg-[#F5F2E9] [&::-webkit-details-marker]:hidden">
                <KeyRound size={17} aria-hidden="true" />
              </summary>
              <div className="absolute right-0 z-40 mt-2 w-40 rounded-xl border border-[#E5E9E4] bg-white p-1 shadow-lg">
                <button type="button" className="w-full rounded-lg p-2 text-left text-xs font-semibold hover:bg-[#F5F2E9]"
                  onClick={(event) => {
                    event.currentTarget.closest('details').open = false;
                    setPasswordSaved(false);
                    setPasswordOpen(true);
                    dialog.current.showModal();
                  }}>Change password</button>
              </div>
            </details>
          )}
          {/* User Info & Avatar */}
          <div className="flex items-center gap-2 pl-2 border-l border-[#E5E9E4]">
            <div className="w-8 h-8 rounded-full bg-[#247653] text-white font-bold text-xs flex items-center justify-center shadow-xs overflow-hidden shrink-0 border border-[#A7F3D0]">
              {currentUser?.avatar_url ? (
                <img
                  src={currentUser.avatar_url}
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
      {passwordSaved && <p role="status" className="mt-2 text-right text-xs text-[#166534]">Password changed successfully.</p>}
      {role !== 'student' && (
        <dialog ref={dialog} onClose={() => setPasswordOpen(false)} aria-labelledby="admin-password-title"
          className="fixed inset-0 m-auto w-[min(26rem,calc(100%-2rem))] rounded-3xl border border-[#E5E9E4] bg-white p-6 shadow-2xl backdrop:bg-black/50">
          <div className="mb-4 flex items-center justify-between">
            <h2 id="admin-password-title" className="text-base font-bold text-[#24332D]">Change password</h2>
            <button type="button" aria-label="Close password form" onClick={() => dialog.current.close()} className="rounded-lg p-2 hover:bg-[#F5F2E9]"><X size={18} /></button>
          </div>
          {passwordOpen && <PasswordForm onCancel={() => dialog.current.close()} onSaved={() => {
            setPasswordSaved(true);
            dialog.current.close();
          }} />}
        </dialog>
      )}
    </header>
  );
}
