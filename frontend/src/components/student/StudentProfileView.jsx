import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Mail, ShieldCheck } from 'lucide-react';

export default function StudentProfileView({ complaints = [], department }) {
  const { currentUser, role } = useAuth();
  const total = complaints.length;
  const resolved = complaints.filter((c) => c.status === 'Resolved').length;

  const roleTitle =
    role === 'student'
      ? 'Verified University Student'
      : role === 'super_admin'
      ? 'Executive Super Administrator'
      : `${department || 'Departmental'} Administrator`;

  const currentAvatarUrl = currentUser?.avatar || currentUser?.profilePicture;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Profile Header */}
      <div className="bg-white rounded-3xl border border-[#E5E9E4] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          {/* Avatar with Animated Hover Overlay */}
          <div className="relative group shrink-0">
            <div className="w-28 h-28 rounded-3xl bg-[#247653] text-white flex items-center justify-center font-bold text-3xl shadow-md border-4 border-white overflow-hidden">
              {currentAvatarUrl ? (
                <img
                  src={currentAvatarUrl}
                  alt={currentUser?.name || 'Profile'}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                currentUser?.name?.charAt(0) || 'U'
              )}
            </div>


          </div>

          <div className="space-y-2 flex-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ECFDF5] text-[#166534] text-xs font-bold border border-[#A7F3D0]">
              <ShieldCheck size={14} />
              {roleTitle}
            </div>
            <h2 className="text-2xl font-extrabold text-[#24332D]">
              {currentUser?.name || 'University User'}
            </h2>
            <p className="text-xs text-[#77847D] font-medium">
              Institutional Account • CampusConnect System
            </p>
          </div>
        </div>

        {/* Detailed Grid (Preserves exact existing user information) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 pt-6 border-t border-[#E5E9E4]">

          <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#E5E9E4] space-y-1">
            <span className="text-[11px] font-bold text-[#77847D] uppercase tracking-wider flex items-center gap-1.5">
              <Mail size={14} className="text-[#247653]" />
              Institutional Email
            </span>
            <p className="text-sm font-bold text-[#24332D] truncate">
              {currentUser?.email || 'N/A'}
            </p>
          </div>

          {department && <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#E5E9E4]">
            <span className="text-xs font-bold">Assigned Department</span>
            <p className="text-sm">{department}</p>
          </div>}


          {role !== 'student' && (
            <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#E5E9E4] space-y-1">
              <span className="text-[11px] font-bold text-[#77847D] uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-[#247653]" />
                System Privileges
              </span>
              <p className="text-sm font-bold text-[#153F35]">
                {role === 'super_admin' ? 'University-Wide Central Access' : 'Departmental Queue Triage'}
              </p>
            </div>
          )}
        </div>

        {/* Complaints Activity Summary */}
        <div className="mt-6 p-4 rounded-2xl bg-[#F5F2E9] border border-[#E5E9E4] flex items-center justify-around text-center">
          <div>
            <p className="text-2xl font-extrabold text-[#153F35]">{total}</p>
            <p className="text-xs font-semibold text-[#77847D]">
              {role === 'student' ? 'Lodged Grievances' : 'Processed Complaints'}
            </p>
          </div>
          <div className="h-8 w-px bg-[#E5E9E4]" />
          <div>
            <p className="text-2xl font-extrabold text-[#16834A]">{resolved}</p>
            <p className="text-xs font-semibold text-[#77847D]">Resolved Issues</p>
          </div>
          <div className="h-8 w-px bg-[#E5E9E4]" />
          <div>
            <p className="text-2xl font-extrabold text-[#F18B38]">
              {total > 0 ? `${Math.round((resolved / total) * 100)}%` : '0%'}
            </p>
            <p className="text-xs font-semibold text-[#77847D]">Resolution Rate</p>
          </div>
        </div>
      </div>

    </div>
  );
}
