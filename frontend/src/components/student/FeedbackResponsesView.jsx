import React from 'react';
import StatusBadge from '../common/StatusBadge';
import CategoryBadge from '../common/CategoryBadge';
import EmptyState from '../common/EmptyState';
import { MessageSquare, Star, CheckCircle2, Building, Calendar, ArrowRight } from 'lucide-react';

export default function FeedbackResponsesView({
  complaints = [],
  onSelectComplaint,
}) {
  const resolvedOrWithRemarks = complaints.filter((c) => c.responses.length);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-[#24332D]">Departmental Responses</h2>
        <p className="text-xs sm:text-sm text-[#77847D]">
          Review official administrator remarks and action outcomes
        </p>
      </div>

      {resolvedOrWithRemarks.length === 0 ? (
        <EmptyState
          title="No responses recorded yet"
          description="Once department administrators review your complaints and post official remarks, they will appear here."
          icon={MessageSquare}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {resolvedOrWithRemarks.map((c) => {
            return (
              <div
                key={c.id}
                className="bg-white rounded-3xl border border-[#E5E9E4] p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-[#247653]/30 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-[#153F35] bg-[#F5F2E9] px-2.5 py-1 rounded-lg">
                      {c.id}
                    </span>
                    <StatusBadge status={c.status} size="xs" />
                  </div>

                  <h3 className="text-sm font-bold text-[#24332D] leading-snug">
                    {c.title}
                  </h3>

                  <div className="flex items-center gap-2 text-xs text-[#77847D]">
                    <Building size={14} className="text-[#247653]" />
                    <span className="font-semibold text-[#153F35]">{c.department}</span>
                  </div>

                  {/* Official Remarks */}
                  {c.remarks ? (
                    <div className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#E5E9E4] space-y-1">
                      <p className="text-[11px] font-bold text-[#77847D] uppercase tracking-wider flex items-center gap-1.5">
                        <MessageSquare size={13} className="text-[#247653]" />
                        Official Administrator Remarks
                      </p>
                      <p className="text-xs text-[#24332D] italic leading-relaxed">
                        "{c.remarks}"
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-[#77847D] italic">
                      Awaiting formal written comments from the coordinator.
                    </p>
                  )}

                  {/* Feedback Status / Stars */}
                </div>

                {/* Footer Buttons */}
                <div className="pt-3 border-t border-[#E5E9E4] flex items-center justify-between">
                  <button
                    onClick={() => onSelectComplaint(c)}
                    className="text-xs font-bold text-[#247653] hover:underline flex items-center gap-1"
                  >
                    View Details <ArrowRight size={13} />
                  </button>

                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
