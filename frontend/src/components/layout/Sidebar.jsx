import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  Clock,
  MessageSquareQuote,
  User,
  LogOut,
  FolderKanban,
  AlertCircle,
  Wrench,
  CheckCircle2,
  XCircle,
  Building,
  BarChart3,
  TrendingUp,
  ShieldCheck,
  ChevronRight,
  X,
} from 'lucide-react';

export default function Sidebar({ activeTab, onSelectTab, isOpen, onClose }) {
  const { currentUser, role, logout } = useAuth();

  // Navigation items strictly mapped to the university problem statement
  const getNavItems = () => {
    if (role === 'student') {
      return [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'submit', label: 'Submit Complaint', icon: PlusCircle, highlight: true },
        { id: 'my-complaints', label: 'My Complaints', icon: FileText },
        { id: 'tracking', label: 'Complaint Tracking', icon: Clock },
        { id: 'feedback', label: 'Department Responses', icon: MessageSquareQuote },
        { id: 'profile', label: 'Profile', icon: User },
      ];
    } else if (role === 'dept_admin') {
      return [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'assigned', label: 'Assigned Complaints', icon: FolderKanban },
        { id: 'pending', label: 'Pending', icon: AlertCircle, badgeColor: '#D97706' },
        { id: 'in-progress', label: 'In Progress', icon: Wrench, badgeColor: '#2563EB' },
        { id: 'resolved', label: 'Resolved', icon: CheckCircle2, badgeColor: '#16834A' },
        { id: 'rejected', label: 'Rejected', icon: XCircle, badgeColor: '#DC4545' },
        { id: 'profile', label: 'Profile', icon: User },
      ];
    } else if (role === 'super_admin') {
      return [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'all-complaints', label: 'All Complaints', icon: FolderKanban },
        { id: 'departments', label: 'Departments', icon: Building },
        { id: 'analytics', label: 'Analytics & Reports', icon: BarChart3, highlight: true },
        { id: 'trends', label: 'Complaint Trends', icon: TrendingUp },
        { id: 'profile', label: 'Profile', icon: User },
      ];
    }
    return [];
  };

  const navItems = getNavItems();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#153F35] text-white flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } shadow-2xl lg:shadow-none border-r border-[#194D40]`}
      >
        {/* Brand header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-[#194D40]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#247653] to-[#194D40] flex items-center justify-center text-white font-extrabold text-lg shadow-sm border border-[#247653]/40">
              CC
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight text-white leading-tight">
                Campus<span className="text-[#F18B38]">Connect</span>
              </h1>
              <p className="text-[10px] text-[#A3B8B0] font-medium tracking-wide">
                Smart Campus Portal
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-[#A3B8B0] hover:text-white hover:bg-[#194D40]"
          >
            <X size={18} />
          </button>
        </div>

        {/* User Role Card in Sidebar */}
        <div className="p-4 mx-3 my-3 rounded-2xl bg-[#194D40]/60 border border-[#247653]/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#247653] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-inner">
              {currentUser?.avatar || currentUser?.profilePicture ? (
                <img
                  src={currentUser.avatar || currentUser.profilePicture}
                  alt={currentUser.name}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                currentUser?.name?.charAt(0) || 'U'
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate leading-tight">
                {currentUser?.name || 'Authorized User'}
              </p>
              <p className="text-[11px] text-[#F18B38] font-semibold truncate mt-0.5">
                {role === 'student'
                  ? `Roll: ${currentUser?.studentId || 'Student'}`
                  : role === 'super_admin'
                  ? 'Central Super Admin'
                  : currentUser?.department || 'Department Admin'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 px-3 py-2 overflow-y-auto space-y-1">
          <p className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-[#7E9A90]">
            {role === 'student'
              ? 'Student Workspace'
              : role === 'dept_admin'
              ? 'Department Management'
              : 'Enterprise System'}
          </p>

          {navItems.map((item) => {
            const IconComp = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                  isActive
                    ? 'bg-[#247653] text-white shadow-xs font-bold'
                    : 'text-[#D0DCD6] hover:bg-[#194D40] hover:text-white'
                } ${item.highlight && !isActive ? 'border border-[#F18B38]/30 text-[#F18B38]' : ''}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <IconComp
                    size={17}
                    className={`shrink-0 transition-transform group-hover:scale-110 ${
                      isActive
                        ? 'text-white'
                        : item.highlight
                        ? 'text-[#F18B38]'
                        : 'text-[#96ACA3]'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badgeColor ? (
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: item.badgeColor }}
                  />
                ) : (
                  isActive && <ChevronRight size={14} className="text-white/80 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom / Logout Action */}
        <div className="p-3 border-t border-[#194D40]">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#D0DCD6] hover:bg-[#DC4545]/20 hover:text-[#FECACA] transition-colors"
          >
            <LogOut size={16} className="text-[#A3B8B0]" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
