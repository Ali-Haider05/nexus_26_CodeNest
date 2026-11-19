import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Menu,
  GraduationCap,
  ShieldCheck,
  Building2,
} from 'lucide-react';

export default function Navbar({ onToggleSidebar }) {
  const { currentUser, role } = useAuth();

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

          {/* User Role Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F5F2E9] border border-[#E5E9E4] text-xs font-bold text-[#153F35] shadow-xs">
            <RoleIcon size={14} className="text-[#247653]" />
            <span className="max-w-[140px] truncate">{roleLabel}</span>
          </div>

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
    </header>
  );
}
