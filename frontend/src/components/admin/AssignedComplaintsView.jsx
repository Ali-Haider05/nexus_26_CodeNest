import React, { useState } from 'react';
import StatusBadge from '../common/StatusBadge';
import CategoryBadge from '../common/CategoryBadge';
import EmptyState from '../common/EmptyState';
import { Search, Filter, Eye, ShieldCheck, Calendar, User, ChevronLeft, ChevronRight } from 'lucide-react';

export default function AssignedComplaintsView({
  complaints = [],
  defaultStatus = 'all',
  onSelectComplaint,
  onOpenUpdateStatus,
  departmentName,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(defaultStatus);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const statuses = ['all', 'Pending', 'In Progress', 'Resolved', 'Rejected'];

  const filtered = complaints.filter((c) => {
    const matchesSearch =
      searchTerm === '' ||
      c.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.studentName && c.studentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.studentRollNo && c.studentRollNo.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === 'all' || (c.status && c.status.toLowerCase() === statusFilter.toLowerCase());

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedList = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#24332D]">
            Assigned Complaints Queue
          </h2>
          <p className="text-xs sm:text-sm text-[#77847D]">
            Exclusive triage and management for <strong className="text-[#153F35]">{departmentName}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-[#F5F2E9] border border-[#E5E9E4] text-[#153F35]">
            Showing {filtered.length} of {complaints.length} Records
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-[#E5E9E4] p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 relative">
            <Search size={16} className="absolute left-3.5 top-3.5 text-[#77847D]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by student name, ID, or keywords..."
              className="w-full text-xs pl-10 pr-4 py-3 rounded-xl border border-[#E5E9E4] focus:outline-none focus:ring-2 focus:ring-[#247653]/20 focus:border-[#247653] bg-white text-[#24332D]"
            />
          </div>

        </div>

        {/* Quick Status Pill Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 scrollbar-none text-xs">
          <span className="text-[11px] font-bold text-[#77847D] uppercase tracking-wider mr-1">
            Status:
          </span>
          {statuses.map((st) => (
            <button
              key={st}
              onClick={() => {
                setStatusFilter(st);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                statusFilter.toLowerCase() === st.toLowerCase()
                  ? 'bg-[#153F35] text-white shadow-xs'
                  : 'bg-[#F5F2E9] text-[#24332D] hover:bg-[#EAE5D8]'
              }`}
            >
              {st === 'all' ? 'All Complaints' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Complaints Table */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No assigned complaints found"
          description="There are currently no complaints in this category or matching your search criteria."
        />
      ) : (
        <div className="bg-white rounded-3xl border border-[#E5E9E4] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF9F5] border-b border-[#E5E9E4] text-[11px] font-bold uppercase tracking-wider text-[#77847D]">
                  <th className="py-4 px-6">ID</th>
                  <th className="py-4 px-6">Student Details</th>
                  <th className="py-4 px-6">Grievance Summary</th>
                  <th className="py-4 px-6">Date Received</th>
                  <th className="py-4 px-6">Current Status</th>
                  <th className="py-4 px-6 text-right">Administrative Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E9E4]/70 text-xs">
                {paginatedList.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-[#FAF9F5] transition-colors group"
                  >
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <span className="font-mono font-bold text-[#153F35]">
                          {c.id}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-6 whitespace-nowrap">
                      <p className="font-bold text-[#24332D]">{c.studentName || 'Student'}</p>
                      <p className="text-[11px] text-[#77847D] font-mono">
                        {c.studentRollNo || ''}
                      </p>
                    </td>

                    <td className="py-4 px-6 max-w-sm">
                      <p className="font-bold text-[#24332D] group-hover:text-[#247653] transition-colors line-clamp-1">
                        {c.title}
                      </p>
                      <p className="text-[11px] text-[#77847D] line-clamp-2 mt-0.5 leading-relaxed">
                        {c.description}
                      </p>
                      {c.remarks && (
                        <p className="text-[10px] text-[#166534] bg-[#ECFDF5] px-2 py-0.5 rounded border border-[#A7F3D0] inline-block mt-1 font-semibold truncate max-w-xs">
                          Latest Note: "{c.remarks}"
                        </p>
                      )}
                    </td>

                    <td className="py-4 px-6 text-[#77847D] whitespace-nowrap">
                      {c.createdAt || c.created_at
                        ? new Date(c.createdAt || c.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : 'Recent'}
                    </td>

                    <td className="py-4 px-6 whitespace-nowrap">
                      <StatusBadge status={c.status} />
                    </td>

                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onSelectComplaint(c)}
                          className="px-3 py-1.5 rounded-lg bg-[#F5F2E9] hover:bg-[#EAE5D8] text-xs font-bold text-[#153F35] transition-colors inline-flex items-center gap-1"
                        >
                          <Eye size={13} />
                          Details
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenUpdateStatus(c)}
                          className="px-3 py-1.5 rounded-lg bg-[#247653] hover:bg-[#194D40] text-xs font-bold text-white shadow-xs transition-colors inline-flex items-center gap-1"
                        >
                          <ShieldCheck size={13} />
                          Update
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {filtered.length > pageSize && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-[#E5E9E4] text-xs bg-[#FAF9F5]">
              <span className="text-[#77847D]">
                Showing {(currentPage - 1) * pageSize + 1} to{' '}
                {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} entries
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg border border-[#E5E9E4] bg-white hover:bg-[#F5F2E9] disabled:opacity-50 disabled:cursor-not-allowed font-medium text-[#24332D]"
                >
                  <ChevronLeft size={14} className="inline mr-1" />
                  Previous
                </button>
                <span className="px-3 py-1 font-bold text-[#153F35]">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-lg border border-[#E5E9E4] bg-white hover:bg-[#F5F2E9] disabled:opacity-50 disabled:cursor-not-allowed font-medium text-[#24332D]"
                >
                  Next
                  <ChevronRight size={14} className="inline ml-1" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
