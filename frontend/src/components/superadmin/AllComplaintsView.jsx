import React, { useEffect, useState } from 'react';
import StatusBadge from '../common/StatusBadge';
import { complaintService } from '../../services/complaintService';
import EmptyState from '../common/EmptyState';
import { DEPARTMENTS, CATEGORY_CONFIG } from '../../constants/theme';
import { Search, Eye, Download, ChevronLeft, ChevronRight } from 'lucide-react';

export default function AllComplaintsView({
  complaints = [],
  onSelectComplaint,
  initialDepartment = "all",
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState(initialDepartment);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const selectedDepartment = complaints.find((complaint) => complaint.department === deptFilter)?.department_id;

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    const debounce = setTimeout(async () => {
      try {
        const rows = deptFilter !== 'all' && !selectedDepartment ? [] : await complaintService.getComplaints({
          role: 'super_admin', department_id: selectedDepartment, status: statusFilter,
          category: categoryFilter, search: searchTerm,
        });
        if (active) setFiltered(rows);
      } catch (err) {
        if (active) { setError(err.message); setFiltered([]); }
      } finally {
        if (active) setLoading(false);
      }
    }, 250);
    return () => { active = false; clearTimeout(debounce); };
  }, [searchTerm, statusFilter, deptFilter, selectedDepartment, categoryFilter]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedList = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Export CSV functionality
  const handleExportCSV = () => {
    if (filtered.length === 0) return;

    const headers = ['ID', 'Title', 'Category', 'Department', 'Student', 'Status', 'Created'];
    const rows = filtered.map((c) => [
      c.id,
      `"${(c.title || '').replace(/"/g, '""')}"`,
      c.category,
      c.department,
      `"${c.studentName || ''}"`,
      c.status,
      c.createdAt || c.created_at || '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CampusConnect_Complaints_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#24332D]">
            Master Complaints Registry
          </h2>
          <p className="text-xs sm:text-sm text-[#77847D]">
            Centralized database of all campus grievances across all academic and service departments
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={loading || filtered.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#153F35] hover:bg-[#194D40] text-white text-xs font-bold shadow-xs transition-colors shrink-0 disabled:opacity-50"
        >
          <Download size={15} />
          Export CSV Report ({filtered.length})
        </button>
      </div>

      {/* Multi-Filter Bar */}
      <div className="bg-white rounded-2xl border border-[#E5E9E4] p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-3.5 text-[#77847D]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search title or description..."
              className="w-full text-xs pl-10 pr-3.5 py-3 rounded-xl border border-[#E5E9E4] focus:outline-none focus:ring-2 focus:ring-[#247653]/20 focus:border-[#247653] bg-white text-[#24332D]"
            />
          </div>

          {/* Department Filter */}
          <div>
            <select
              aria-label="Filter by department"
              value={deptFilter}
              onChange={(e) => {
                setDeptFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs font-semibold py-3 px-3.5 rounded-xl border border-[#E5E9E4] focus:outline-none focus:ring-2 focus:ring-[#247653]/20 focus:border-[#247653] bg-white text-[#24332D]"
            >
              <option value="all">All Departments</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              aria-label="Filter by category"
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs font-semibold py-3 px-3.5 rounded-xl border border-[#E5E9E4] focus:outline-none focus:ring-2 focus:ring-[#247653]/20 focus:border-[#247653] bg-white text-[#24332D]"
            >
              <option value="all">All Categories</option>
              {Object.keys(CATEGORY_CONFIG).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              aria-label="Filter by status"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs font-semibold py-3 px-3.5 rounded-xl border border-[#E5E9E4] focus:outline-none focus:ring-2 focus:ring-[#247653]/20 focus:border-[#247653] bg-white text-[#24332D]"
            >
              <option value="all">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Table */}
      {loading ? <p role="status" className="text-sm">Loading complaints?</p> : error ? <p role="alert" className="text-sm text-red-700">{error}</p> : filtered.length === 0 ? (
        <EmptyState
          title="No complaints found"
          description={
            searchTerm || statusFilter !== 'all' || deptFilter !== 'all' || categoryFilter !== 'all'
              ? 'No complaints match your selected filters. Adjust your search criteria.'
              : 'The centralized registry has no complaints recorded in the database yet.'
          }
        />
      ) : (
        <div className="bg-white rounded-3xl border border-[#E5E9E4] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF9F5] border-b border-[#E5E9E4] text-[11px] font-bold uppercase tracking-wider text-[#77847D]">
                  <th className="py-4 px-6">ID</th>
                  <th className="py-4 px-6">Grievance Subject</th>
                  <th className="py-4 px-6">Department</th>
                  <th className="py-4 px-6">Student</th>
                  <th className="py-4 px-6">Date</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
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

                    <td className="py-4 px-6 max-w-xs">
                      <p className="font-bold text-[#24332D] group-hover:text-[#247653] transition-colors truncate">
                        {c.title}
                      </p>
                      <p className="text-[11px] text-[#77847D] line-clamp-1 mt-0.5">
                        {c.description}
                      </p>
                    </td>

                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className="text-xs font-semibold text-[#153F35] bg-[#F5F2E9] px-2.5 py-1 rounded-lg">
                        {c.department || 'Unassigned'}
                      </span>
                    </td>

                    <td className="py-4 px-6 whitespace-nowrap">
                      <p className="font-bold text-[#24332D]">{c.studentName || 'Student'}</p>
                      <p className="text-[11px] text-[#77847D] font-mono">
                        {c.studentRollNo || ''}
                      </p>
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
                          onClick={() => onSelectComplaint(c)}
                          className="px-3 py-1.5 rounded-lg bg-[#F5F2E9] hover:bg-[#247653] hover:text-white text-xs font-bold text-[#153F35] transition-colors inline-flex items-center gap-1"
                        >
                          <Eye size={13} />
                          Details
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
