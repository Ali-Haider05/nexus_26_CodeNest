import React from 'react';
import StatCard from '../common/StatCard';
import StatusBadge from '../common/StatusBadge';
import CategoryBadge from '../common/CategoryBadge';
import PriorityBadge from '../common/PriorityBadge';
import {
  FolderKanban,
  Clock,
  Wrench,
  CheckCircle2,
  XCircle,
  Building,
  ShieldCheck,
  ChevronRight,
  Eye,
  TrendingUp,
} from 'lucide-react';

export default function DepartmentOverview({
  complaints = [],
  currentUser,
  onNavigate,
  onSelectComplaint,
  onOpenUpdateStatus,
}) {
  const deptName = currentUser?.department || 'Department Administration';

  const total = complaints.length;
  const pending = complaints.filter((c) => c.status === 'Pending').length;
  const underReview = complaints.filter((c) => c.status === 'Under Review').length;
  const inProgress = complaints.filter((c) => c.status === 'In Progress').length;
  const resolved = complaints.filter((c) => c.status === 'Resolved').length;
  const rejected = complaints.filter((c) => c.status === 'Rejected').length;

  const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
  const urgentCount = complaints.filter((c) => c.priority === 'Urgent' && c.status !== 'Resolved').length;

  const recentAssigned = complaints.slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Department Admin Banner */}
      <div className="bg-gradient-to-r from-[#153F35] via-[#194D40] to-[#247653] rounded-3xl p-6 sm:p-8 text-white shadow-xs relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold backdrop-blur-xs">
              <Building size={14} className="text-[#F18B38]" />
              {deptName}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Department Operations Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-[#D0DCD6] max-w-xl leading-relaxed">
              Assigned complaint queue, student grievances triage, investigation progress tracking, and resolution updates.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-4 border border-white/20 text-right self-start md:self-auto shrink-0">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#D0DCD6]">
              Resolution Rate
            </p>
            <p className="text-3xl font-black text-white">{resolutionRate}%</p>
            <p className="text-[11px] text-[#A7F3D0]">
              {resolved} of {total} resolved
            </p>
          </div>
        </div>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <StatCard
          title="Total Assigned"
          value={total}
          icon={FolderKanban}
          color="#153F35"
          bgColor="#FAF9F5"
          subtitle="All complaints"
          onClick={() => onNavigate('assigned')}
        />
        <StatCard
          title="Pending"
          value={pending}
          icon={Clock}
          color="#D97706"
          bgColor="#FEF3C7"
          subtitle="Awaiting triage"
          onClick={() => onNavigate('pending')}
        />
        <StatCard
          title="Under Review"
          value={underReview}
          icon={Eye}
          color="#7C5CC4"
          bgColor="#F3E8FF"
          subtitle="Assessing details"
          onClick={() => onNavigate('assigned')}
        />
        <StatCard
          title="In Progress"
          value={inProgress}
          icon={Wrench}
          color="#2563EB"
          bgColor="#EFF6FF"
          subtitle="Investigating"
          onClick={() => onNavigate('in-progress')}
        />
        <StatCard
          title="Resolved"
          value={resolved}
          icon={CheckCircle2}
          color="#16834A"
          bgColor="#ECFDF5"
          subtitle="Successfully closed"
          onClick={() => onNavigate('resolved')}
        />
        <StatCard
          title="Rejected"
          value={rejected}
          icon={XCircle}
          color="#DC4545"
          bgColor="#FEF2F2"
          subtitle="Out of scope"
          onClick={() => onNavigate('rejected')}
        />
      </div>

      {/* Urgent Alert Banner if any urgent complaints */}
      {urgentCount > 0 && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-between text-xs text-red-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
            <span className="font-bold">
              Action Required: {urgentCount} urgent complaint{urgentCount > 1 ? 's' : ''} in your queue requires immediate inspection!
            </span>
          </div>
          <button
            onClick={() => onNavigate('assigned')}
            className="font-bold underline text-red-900 hover:text-red-700"
          >
            Review Urgent
          </button>
        </div>
      )}

      {/* Recent Assigned Complaints Table */}
      <div className="bg-white rounded-3xl border border-[#E5E9E4] p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E9E4]">
          <div>
            <h3 className="text-base font-bold text-[#24332D]">
              Recent Assigned Complaints
            </h3>
            <p className="text-xs text-[#77847D]">
              Directly routed to {deptName}
            </p>
          </div>
          <button
            onClick={() => onNavigate('assigned')}
            className="text-xs font-bold text-[#247653] hover:underline flex items-center gap-1"
          >
            View Full Queue ({total})
            <ChevronRight size={14} />
          </button>
        </div>

        <div className="divide-y divide-[#E5E9E4]">
          {recentAssigned.length === 0 ? (
            <p className="text-xs text-[#77847D] py-6 text-center">
              No complaints currently assigned to this department.
            </p>
          ) : (
            recentAssigned.map((c) => (
              <div
                key={c.id}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FAF9F5] rounded-xl px-2 transition-colors"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#153F35]">
                      {c.id}
                    </span>
                    <StatusBadge status={c.status} size="xs" />
                    <PriorityBadge priority={c.priority} />
                  </div>
                  <h4 className="text-xs font-bold text-[#24332D] truncate">
                    {c.title}
                  </h4>
                  <p className="text-[11px] text-[#77847D]">
                    Reported by {c.studentName} ({c.studentRollNo}) •{' '}
                    {new Date(c.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onSelectComplaint(c)}
                    className="px-3 py-1.5 rounded-lg bg-[#F5F2E9] hover:bg-[#EAE5D8] text-xs font-bold text-[#153F35] transition-colors flex items-center gap-1"
                  >
                    <Eye size={13} />
                    Details
                  </button>
                  <button
                    onClick={() => onOpenUpdateStatus(c)}
                    className="px-3 py-1.5 rounded-lg bg-[#247653] hover:bg-[#194D40] text-xs font-bold text-white shadow-xs transition-colors flex items-center gap-1"
                  >
                    <ShieldCheck size={13} />
                    Action
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
