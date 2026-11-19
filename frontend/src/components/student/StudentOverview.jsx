import React from 'react';
import StatCard from '../common/StatCard';
import StatusBadge from '../common/StatusBadge';
import CategoryBadge from '../common/CategoryBadge';
import {
  FileText,
  Clock,
  Wrench,
  CheckCircle2,
  PlusCircle,
  MessageSquare,
  ArrowRight,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

export default function StudentOverview({
  complaints = [],
  currentUser,
  onNavigate,
  onSelectComplaint,
}) {
  const total = complaints.length;
  const pending = complaints.filter((c) => c.status === 'Pending').length;
  const inProgress = complaints.filter(
    (c) => c.status === 'In Progress'
  ).length;
  const resolved = complaints.filter((c) => c.status === 'Resolved').length;

  const recentComplaints = complaints.slice(0, 4);
  const complaintsWithRemarks = complaints.filter((c) => c.remarks).slice(0, 3);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#153F35] via-[#194D40] to-[#247653] rounded-3xl p-6 sm:p-8 text-white shadow-xs relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold backdrop-blur-xs">
              <Sparkles size={13} className="text-[#F18B38]" />
              Welcome Back, {currentUser?.name?.split(' ')[0] || 'Student'}!
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Student Grievance & Resolution Portal
            </h1>
            <p className="text-xs sm:text-sm text-[#D0DCD6] max-w-xl leading-relaxed">
              Track your campus complaints, monitor real-time departmental investigations, and help improve university campus life.
            </p>
          </div>

          <button
            onClick={() => onNavigate('submit')}
            className="self-start md:self-auto inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#F18B38] hover:bg-[#d97728] text-white text-xs font-bold shadow-md transition-all hover:scale-105 shrink-0"
          >
            <PlusCircle size={18} />
            Submit New Complaint
          </button>
        </div>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Complaints"
          value={total}
          icon={FileText}
          color="#153F35"
          bgColor="#FAF9F5"
          subtitle="All submitted grievances"
          onClick={() => onNavigate('my-complaints')}
        />
        <StatCard
          title="Pending Review"
          value={pending}
          icon={Clock}
          color="#D97706"
          bgColor="#FEF3C7"
          subtitle="Awaiting initial department review"
          onClick={() => onNavigate('my-complaints')}
        />
        <StatCard
          title="In Progress"
          value={inProgress}
          icon={Wrench}
          color="#2563EB"
          bgColor="#EFF6FF"
          subtitle="Currently under investigation"
          onClick={() => onNavigate('tracking')}
        />
        <StatCard
          title="Resolved"
          value={resolved}
          icon={CheckCircle2}
          color="#16834A"
          bgColor="#ECFDF5"
          subtitle="Completed campus fixes"
          onClick={() => onNavigate('feedback')}
        />
      </div>

      {/* Two-column layout: Recent Complaints & Latest Departmental Responses */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Recent Complaints (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-[#E5E9E4] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5E9E4]">
            <div>
              <h3 className="text-base font-bold text-[#24332D]">Your Recent Complaints</h3>
              <p className="text-xs text-[#77847D]">Latest submissions from your account</p>
            </div>
            <button
              onClick={() => onNavigate('my-complaints')}
              className="text-xs font-bold text-[#247653] hover:underline flex items-center gap-1"
            >
              View All ({total})
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="space-y-3">
            {recentComplaints.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#77847D]">
                You have not submitted any complaints yet.
              </div>
            ) : (
              recentComplaints.map((c) => (
                <div
                  key={c.id}
                  onClick={() => onSelectComplaint(c)}
                  className="p-4 rounded-2xl border border-[#E5E9E4] hover:border-[#247653]/40 hover:bg-[#FAF9F5] cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-[#153F35] bg-[#F5F2E9] px-2 py-0.5 rounded">
                        {c.id}
                      </span>
                      <StatusBadge status={c.status} size="xs" />
                    </div>
                    <h4 className="text-xs font-bold text-[#24332D] group-hover:text-[#247653] transition-colors truncate">
                      {c.title}
                    </h4>
                    <p className="text-[11px] text-[#77847D]">
                      Routed to: <strong className="text-[#24332D]">{c.department}</strong> •{' '}
                      {new Date(c.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <CategoryBadge category={c.category} />
                    <ChevronRight size={16} className="text-[#99A8A0] group-hover:text-[#247653] transition-colors" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Latest Departmental Remarks / Responses (1 col) */}
        <div className="bg-white rounded-3xl border border-[#E5E9E4] p-6 shadow-xs space-y-4">
          <div className="pb-3 border-b border-[#E5E9E4]">
            <h3 className="text-base font-bold text-[#24332D] flex items-center gap-2">
              <MessageSquare size={18} className="text-[#247653]" />
              Department Remarks
            </h3>
            <p className="text-xs text-[#77847D]">Direct updates from assigned authorities</p>
          </div>

          <div className="space-y-3">
            {complaintsWithRemarks.length === 0 ? (
              <p className="text-xs text-[#77847D] italic p-4 text-center">
                No departmental responses received yet.
              </p>
            ) : (
              complaintsWithRemarks.map((c) => (
                <div
                  key={c.id}
                  onClick={() => onSelectComplaint(c)}
                  className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#E5E9E4] hover:border-[#247653]/30 cursor-pointer transition-all space-y-2"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-[#153F35]">{c.department}</span>
                    <span className="text-[#77847D] font-mono">{c.id}</span>
                  </div>
                  <p className="text-xs text-[#24332D] line-clamp-3 italic leading-relaxed bg-white p-2.5 rounded-xl border border-[#E5E9E4]">
                    "{c.remarks}"
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <StatusBadge status={c.status} size="xs" />
                    <span className="text-[10px] text-[#247653] font-bold hover:underline flex items-center gap-0.5">
                      View Audit Trail <ArrowRight size={10} />
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
