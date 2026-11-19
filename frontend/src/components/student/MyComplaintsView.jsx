import React, { useState } from 'react';
import StatusBadge from '../common/StatusBadge';
import CategoryBadge from '../common/CategoryBadge';
import PriorityBadge from '../common/PriorityBadge';
import EmptyState from '../common/EmptyState';
import { Search, Filter, Eye, PlusCircle, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

export default function MyComplaintsView({
  complaints = [],
  onSelectComplaint,
  onNavigateSubmit,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const filtered = complaints.filter((c) => {
    const matchesSearch =
      searchTerm === '' ||
      c.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || (c.status && c.status.toLowerCase() === statusFilter.toLowerCase());

    const matchesCategory =
      categoryFilter === 'all' || c.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedList = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const statuses = ['all', 'Pending', 'Under Review', 'In Progress', 'Resolved', 'Rejected'];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Bar: Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#24332D]">My Submitted Complaints</h2>
          <p className="text-xs sm:text-sm text-[#77847D]">
            Track status updates, departmental notes, and resolutions for your grievances
          </p>
        </div>

        <button
          onClick={onNavigateSubmit}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#247653] hover:bg-[#194D40] text-white text-xs font-bold shadow-xs transition-colors shrink-0"
        >
          <PlusCircle size={16} />
          Lodge New Complaint
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white rounded-2xl border border-[#E5E9E4] p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search */}
          <div className="sm:col-span-2 relative">
            <Search size={16} className="absolute left-3.5 top-3.5 text-[#77847D]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by Complaint ID (e.g. CMP-2026), keywords, description..."
              className="w-full text-xs pl-10 pr-4 py-3 rounded-xl border border-[#E5E9E4] focus:outline-none focus:ring-2 focus:ring-[#247653]/20 focus:border-[#247653] bg-white text-[#24332D]"
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs font-semibold py-3 px-3.5 rounded-xl border border-[#E5E9E4] focus:outline-none focus:ring-2 focus:ring-[#247653]/20 focus:border-[#247653] bg-white text-[#24332D]"
            >
              <option value="all">All Categories</option>
              <option value="Cafeteria">Cafeteria</option>
              <option value="Library">Library</option>
              <option value="Laboratories & IT Facilities">Laboratories & IT Facilities</option>
              <option value="Teaching & Academic Affairs">Teaching & Academic Affairs</option>
            </select>
          </div>
        </div>

        {/* Quick Status Pill Bar */}
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
              {st === 'all' ? 'All Statuses' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Complaints List / Table */}
      {filtered.length === 0 ? (
        <EmptyState
          title="No complaints match your filters"
          description={
            searchTerm || statusFilter !== 'all' || categoryFilter !== 'all'
              ? 'Try adjusting your search criteria or resetting the filters.'
              : 'You have not lodged any campus complaints yet.'
          }
          actionLabel="Submit a Complaint"
          onAction={onNavigateSubmit}
        />
      ) : (
        <div className="bg-white rounded-3xl border border-[#E5E9E4] overflow-hidden shadow-xs">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF9F5] border-b border-[#E5E9E4] text-[11px] font-bold uppercase tracking-wider text-[#77847D]">
                  <th className="py-4 px-6">Complaint ID</th>
                  <th className="py-4 px-6">Subject / Title</th>
                  <th className="py-4 px-6">Category & Routing</th>
                  <th className="py-4 px-6">Submitted Date</th>
                  <th className="py-4 px-6">Priority</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E9E4]/70 text-xs">
                {paginatedList.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => onSelectComplaint(c)}
                    className="hover:bg-[#FAF9F5] cursor-pointer transition-colors group"
                  >
                    <td className="py-4 px-6 font-mono font-bold text-[#153F35]">
                      {c.id}
                    </td>
                    <td className="py-4 px-6 max-w-xs">
                      <p className="font-bold text-[#24332D] group-hover:text-[#247653] transition-colors truncate">
                        {c.title}
                      </p>
                      <p className="text-[11px] text-[#77847D] line-clamp-1 mt-0.5">
                        {c.description}
                      </p>
                    </td>
                    <td className="py-4 px-6">
                      <CategoryBadge category={c.category} />
                      <p className="text-[10px] text-[#77847D] font-medium mt-1 truncate">
                        {c.department}
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
                    <td className="py-4 px-6">
                      <PriorityBadge priority={c.priority} />
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectComplaint(c);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F5F2E9] hover:bg-[#247653] hover:text-white text-[#153F35] font-bold text-xs transition-colors"
                      >
                        <Eye size={13} />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-[#E5E9E4]">
            {paginatedList.map((c) => (
              <div
                key={c.id}
                onClick={() => onSelectComplaint(c)}
                className="p-4 hover:bg-[#FAF9F5] transition-colors space-y-2.5 cursor-pointer"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-[#153F35] bg-[#F5F2E9] px-2 py-0.5 rounded">
                    {c.id}
                  </span>
                  <StatusBadge status={c.status} size="xs" />
                </div>

                <h4 className="text-xs font-bold text-[#24332D] leading-snug">
                  {c.title}
                </h4>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <CategoryBadge category={c.category} />
                  <PriorityBadge priority={c.priority} />
                </div>

                <div className="flex items-center justify-between pt-1 text-[11px] text-[#77847D]">
                  <span>{c.department}</span>
                  <span>
                    {c.createdAt || c.created_at
                      ? new Date(c.createdAt || c.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })
                      : 'Recent'}
                  </span>
                </div>
              </div>
            ))}
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
