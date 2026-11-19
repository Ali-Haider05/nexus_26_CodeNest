import React, { useState } from 'react';
import StatusBadge from '../common/StatusBadge';
import CategoryBadge from '../common/CategoryBadge';
import ComplaintTimeline from '../common/ComplaintTimeline';
import EmptyState from '../common/EmptyState';
import { Search, Clock, ArrowRight, ShieldCheck, MessageSquare, AlertCircle } from 'lucide-react';

export default function ComplaintTrackingView({
  complaints = [],
  onSelectComplaint,
}) {
  const [selectedId, setSelectedId] = useState(complaints[0]?.id || null);

  const selectedComplaint = complaints.find((c) => c.id === selectedId) || complaints[0];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-[#24332D]">Real-Time Complaint Tracking</h2>
        <p className="text-xs sm:text-sm text-[#77847D]">
          Inspect step-by-step progress, investigation milestones, and official remarks from department administrators
        </p>
      </div>

      {complaints.length === 0 ? (
        <EmptyState
          title="No complaints available to track"
          description="Submit a complaint to view its live progress lifecycle."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Complaints Selector list (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-[#E5E9E4] p-4 shadow-xs space-y-3">
            <div className="px-2 py-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#77847D]">
                Select Complaint to Track
              </h3>
            </div>

            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {complaints.map((c) => {
                const isSelected = selectedComplaint?.id === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedId(c.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#247653] bg-[#ECFDF5]/60 ring-2 ring-[#247653]/15 shadow-xs'
                        : 'border-[#E5E9E4] bg-white hover:bg-[#FAF9F5]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="font-mono text-[11px] font-bold text-[#153F35]">
                        {c.id}
                      </span>
                      <StatusBadge status={c.status} size="xs" />
                    </div>

                    <h4 className="text-xs font-bold text-[#24332D] line-clamp-1 mb-1">
                      {c.title}
                    </h4>

                    <div className="flex items-center justify-between text-[11px] text-[#77847D]">
                      <span>{c.department.split(' ')[0]}</span>
                      <span>
                        {new Date(c.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Detailed Tracking Timeline and Remarks (8 cols) */}
          {selectedComplaint && (
            <div className="lg:col-span-8 bg-white rounded-3xl border border-[#E5E9E4] p-6 shadow-xs space-y-6">
              {/* Header Box */}
              <div className="border-b border-[#E5E9E4] pb-4">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-[#153F35] bg-[#F5F2E9] px-3 py-1 rounded-xl">
                      {selectedComplaint.id}
                    </span>
                    <StatusBadge status={selectedComplaint.status} size="sm" />
                  </div>

                  <span className="text-xs text-[#77847D] font-medium">
                    Updated:{' '}
                    {new Date(selectedComplaint.updatedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-[#24332D]">
                  {selectedComplaint.title}
                </h3>

                <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-[#77847D]">
                  <CategoryBadge category={selectedComplaint.category} />
                  <span>•</span>
                  <span>
                    Assigned Authority:{' '}
                    <strong className="text-[#153F35]">{selectedComplaint.department}</strong>
                  </span>
                </div>
              </div>

              {/* Progress & Remarks Timeline */}
              <div>
                <ComplaintTimeline
                  history={selectedComplaint.history || []}
                  currentStatus={selectedComplaint.status}
                />
              </div>

            </div>
          )}
        </div>
      )}
    </div>
  );
}
