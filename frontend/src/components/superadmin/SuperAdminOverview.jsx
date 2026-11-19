import React, { useState } from 'react';
import StatCard from '../common/StatCard';
import StatusBadge from '../common/StatusBadge';
import CategoryBadge from '../common/CategoryBadge';
import PriorityBadge from '../common/PriorityBadge';
import EmptyState from '../common/EmptyState';
import { analyticsService } from '../../services/analyticsService';
import { DEPARTMENTS, CATEGORY_CONFIG } from '../../constants/theme';
import {
  FolderKanban,
  Clock,
  Wrench,
  CheckCircle2,
  XCircle,
  Building,
  BarChart3,
  TrendingUp,
  ShieldCheck,
  ChevronRight,
  Eye,
  Search,
  Filter,
  RefreshCw,
  ChevronLeft,
  Calendar,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export default function SuperAdminOverview({
  complaints = [],
  onNavigate,
  onSelectComplaint,
  onRefresh,
}) {
  // Compute accurate metrics dynamically from real complaints
  const stats = analyticsService.getStats(complaints);
  const departmentData = analyticsService.getDepartmentComparisonData(complaints);

  // Recent Campus Grievances filtering and pagination state
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Filter real complaints for Recent Campus Grievances section
  const filteredGrievances = complaints.filter((c) => {
    const matchesSearch =
      searchTerm === '' ||
      c.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.studentName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept =
      deptFilter === 'all' ||
      (c.department && c.department.toLowerCase() === deptFilter.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (c.status && c.status.toLowerCase() === statusFilter.toLowerCase());

    return matchesSearch && matchesDept && matchesStatus;
  });

  const totalPages = Math.ceil(filteredGrievances.length / pageSize) || 1;
  const paginatedGrievances = filteredGrievances.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Super Admin Executive Banner */}
      <div className="bg-gradient-to-r from-[#153F35] via-[#194D40] to-[#247653] rounded-3xl p-6 sm:p-8 text-white shadow-xs relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold backdrop-blur-xs">
              <ShieldCheck size={14} className="text-[#F18B38]" />
              Central Campus Ombudsman & Executive Administration
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Institutional Grievance Intelligence
            </h1>
            <p className="text-xs sm:text-sm text-[#D0DCD6] max-w-2xl leading-relaxed">
              Cross-departmental oversight, complaint volume tracking, operational SLAs, and administrative performance indicators across all BIIT campus services.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('analytics')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F18B38] hover:bg-[#d97728] text-white text-xs font-bold shadow-xs transition-colors shrink-0"
            >
              <BarChart3 size={16} />
              Open Full Analytics
            </button>
          </div>
        </div>
      </div>

      {/* University-Wide Metric Counters (Real Data) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <StatCard
          title="Total Received"
          value={stats.total}
          icon={FolderKanban}
          color="#153F35"
          bgColor="#FAF9F5"
          subtitle="Across all departments"
          onClick={() => onNavigate('all-complaints')}
        />
        <StatCard
          title="Pending"
          value={stats.pending}
          icon={Clock}
          color="#D97706"
          bgColor="#FEF3C7"
          subtitle="Awaiting triage"
          onClick={() => onNavigate('all-complaints')}
        />
        <StatCard
          title="Under Review"
          value={stats.underReview}
          icon={Eye}
          color="#7C5CC4"
          bgColor="#F3E8FF"
          subtitle="Department assessment"
          onClick={() => onNavigate('all-complaints')}
        />
        <StatCard
          title="In Progress"
          value={stats.inProgress}
          icon={Wrench}
          color="#2563EB"
          bgColor="#EFF6FF"
          subtitle="Active investigation"
          onClick={() => onNavigate('all-complaints')}
        />
        <StatCard
          title="Resolved"
          value={stats.resolved}
          icon={CheckCircle2}
          color="#16834A"
          bgColor="#ECFDF5"
          subtitle={`${stats.resolutionRate}% resolution rate`}
          onClick={() => onNavigate('all-complaints')}
        />
        <StatCard
          title="Rejected"
          value={stats.rejected}
          icon={XCircle}
          color="#DC4545"
          bgColor="#FEF2F2"
          subtitle="Out of scope"
          onClick={() => onNavigate('all-complaints')}
        />
      </div>

      {/* Required Bar Chart: Comparison of complaints received by different departments */}
      <div className="bg-white rounded-3xl border border-[#E5E9E4] p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E9E4]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#ECFDF5] text-[#166534] text-[11px] font-bold border border-[#A7F3D0] mb-1">
              Required Specification §4.3
            </div>
            <h3 className="text-base font-bold text-[#24332D]">
              Department-Wise Complaint Volume Comparison
            </h3>
            <p className="text-xs text-[#77847D]">
              Real-time comparative breakdown of complaints across all university operational units
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-[#24332D] font-semibold">
              <span className="w-3 h-3 rounded-full bg-[#153F35]" /> Total
            </span>
            <span className="flex items-center gap-1.5 text-[#16834A] font-semibold">
              <span className="w-3 h-3 rounded-full bg-[#16834A]" /> Resolved
            </span>
            <span className="flex items-center gap-1.5 text-[#D97706] font-semibold">
              <span className="w-3 h-3 rounded-full bg-[#D97706]" /> Pending
            </span>
          </div>
        </div>

        {/* Recharts Bar Chart */}
        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={departmentData}
              margin={{ top: 10, right: 20, left: -10, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E9E4" />
              <XAxis
                dataKey="shortName"
                tick={{ fill: '#77847D', fontSize: 12, fontWeight: 600 }}
                axisLine={{ stroke: '#E5E9E4' }}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: '#77847D', fontSize: 12 }}
                axisLine={{ stroke: '#E5E9E4' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #E5E9E4',
                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="total" name="Total Complaints" fill="#153F35" radius={[6, 6, 0, 0]} />
              <Bar dataKey="resolved" name="Resolved" fill="#16834A" radius={[6, 6, 0, 0]} />
              <Bar dataKey="pending" name="Pending" fill="#D97706" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* FULLY FUNCTIONAL: Recent Campus Grievances (All Departments) Section */}
      <div className="bg-white rounded-3xl border border-[#E5E9E4] p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E9E4]">
          <div>
            <h3 className="text-base font-bold text-[#24332D]">
              Recent Campus Grievances (All Departments)
            </h3>
            <p className="text-xs text-[#77847D]">
              Real-time centralized feed of actual complaint submissions across all BIIT departments
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                className="px-3 py-1.5 rounded-lg border border-[#E5E9E4] bg-white hover:bg-[#FAF9F5] text-xs font-semibold text-[#24332D] flex items-center gap-1.5 transition-colors"
                title="Refresh complaints from backend"
              >
                <RefreshCw size={12} />
                Refresh
              </button>
            )}
            <button
              onClick={() => onNavigate('all-complaints')}
              className="text-xs font-bold text-[#247653] hover:underline flex items-center gap-1"
            >
              Master Registry ({complaints.length})
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Quick Search & Filtering within Recent Grievances */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-3 text-[#77847D]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by ID, title, or student..."
              className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-[#E5E9E4] focus:outline-none focus:ring-2 focus:ring-[#247653]/20 focus:border-[#247653] bg-white text-[#24332D]"
            />
          </div>

          <div>
            <select
              value={deptFilter}
              onChange={(e) => {
                setDeptFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs font-medium py-2.5 px-3 rounded-xl border border-[#E5E9E4] focus:outline-none focus:ring-2 focus:ring-[#247653]/20 focus:border-[#247653] bg-white text-[#24332D]"
            >
              <option value="all">All Departments</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs font-medium py-2.5 px-3 rounded-xl border border-[#E5E9E4] focus:outline-none focus:ring-2 focus:ring-[#247653]/20 focus:border-[#247653] bg-white text-[#24332D]"
            >
              <option value="all">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Under Review">Under Review</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Complaints Listing */}
        {filteredGrievances.length === 0 ? (
          <EmptyState
            title="No recent grievances found"
            description={
              searchTerm || deptFilter !== 'all' || statusFilter !== 'all'
                ? 'No complaints match your current search and filter settings.'
                : 'No complaints have been lodged yet across university departments.'
            }
          />
        ) : (
          <div className="divide-y divide-[#E5E9E4]">
            {paginatedGrievances.map((c) => {
              const formattedDate = c.createdAt || c.created_at
                ? new Date(c.createdAt || c.created_at).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Recent';

              return (
                <div
                  key={c.id}
                  onClick={() => onSelectComplaint(c)}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FAF9F5] rounded-xl px-2 cursor-pointer transition-colors group"
                >
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#153F35] bg-[#F5F2E9] px-2 py-0.5 rounded">
                        {c.id}
                      </span>
                      <StatusBadge status={c.status} size="xs" />
                      <PriorityBadge priority={c.priority} />
                      <span className="text-[11px] font-semibold text-[#153F35] bg-white px-2 py-0.5 rounded border border-[#E5E9E4]">
                        {c.department || 'General Administration'}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-[#24332D] group-hover:text-[#247653] transition-colors truncate">
                      {c.title}
                    </h4>

                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#77847D]">
                      {c.studentName && (
                        <span>
                          Student: <strong className="text-[#24332D]">{c.studentName}</strong>
                          {c.studentRollNo ? ` (${c.studentRollNo})` : ''}
                        </span>
                      )}
                      <span>•</span>
                      <span>Category: {c.category}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar size={11} className="text-[#247653]" />
                        {formattedDate}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectComplaint(c);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-[#F5F2E9] hover:bg-[#247653] hover:text-white text-xs font-bold text-[#153F35] transition-colors flex items-center gap-1"
                    >
                      <Eye size={13} />
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {filteredGrievances.length > pageSize && (
          <div className="flex items-center justify-between pt-4 border-t border-[#E5E9E4] text-xs">
            <span className="text-[#77847D]">
              Showing {(currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, filteredGrievances.length)} of{' '}
              {filteredGrievances.length} grievances
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1.5 rounded-lg border border-[#E5E9E4] bg-white hover:bg-[#F5F2E9] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="px-3 py-1 font-bold text-[#153F35]">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1.5 rounded-lg border border-[#E5E9E4] bg-white hover:bg-[#F5F2E9] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
