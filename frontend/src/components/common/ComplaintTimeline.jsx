import React from 'react';
import { STATUS_CONFIG } from '../../constants/theme';
import { CheckCircle2, Clock, Eye, Wrench, XCircle, FileText, ArrowRight } from 'lucide-react';

const stepIcons = {
  Submitted: FileText,
  'Under Review': Eye,
  'In Progress': Wrench,
  Resolved: CheckCircle2,
  Rejected: XCircle,
};

export default function ComplaintTimeline({ history = [], currentStatus = 'Pending' }) {
  // Canonical stages in life-cycle
  const isRejected = currentStatus === 'Rejected' || history.some((h) => h.status === 'Rejected');
  const stages = isRejected
    ? ['Submitted', 'Under Review', 'Rejected']
    : ['Submitted', 'Under Review', 'In Progress', 'Resolved'];

  const getStageIndex = (status) => {
    if (status === 'Submitted') return 0;
    if (status === 'Pending') return 0;
    if (status === 'Under Review') return 1;
    if (status === 'In Progress') return 2;
    if (status === 'Resolved' || status === 'Rejected') return isRejected ? 2 : 3;
    return 0;
  };

  const currentStageIndex = getStageIndex(currentStatus);

  return (
    <div className="space-y-6">
      {/* Visual Step Progress Bar */}
      <div className="relative flex items-center justify-between px-2 pt-2 pb-4">
        {/* Connector line behind circles */}
        <div className="absolute top-6 left-6 right-6 h-0.5 bg-[#E5E9E4] -z-0" />
        <div
          className="absolute top-6 left-6 h-0.5 bg-[#247653] transition-all duration-500 -z-0"
          style={{
            width: `${Math.min(100, (currentStageIndex / (stages.length - 1)) * 100)}%`,
          }}
        />

        {stages.map((stage, idx) => {
          const isCompleted = idx < currentStageIndex || (idx === currentStageIndex && (currentStatus === 'Resolved' || currentStatus === 'Rejected'));
          const isCurrent = idx === currentStageIndex && currentStatus !== 'Resolved' && currentStatus !== 'Rejected';
          const isPending = idx > currentStageIndex;

          const IconComp = stepIcons[stage] || Clock;
          const statusCfg = STATUS_CONFIG[stage] || { color: '#247653' };

          return (
            <div key={stage} className="flex flex-col items-center z-10">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all border-2 ${
                  isCompleted
                    ? 'bg-[#247653] border-[#247653] text-white shadow-xs'
                    : isCurrent
                    ? 'bg-white border-[#F18B38] text-[#F18B38] ring-4 ring-[#F18B38]/20 animate-pulse'
                    : 'bg-white border-[#E5E9E4] text-[#77847D]'
                }`}
              >
                <IconComp size={16} />
              </div>
              <span
                className={`mt-2 text-xs font-semibold whitespace-nowrap ${
                  isCurrent
                    ? 'text-[#F18B38]'
                    : isCompleted
                    ? 'text-[#24332D]'
                    : 'text-[#77847D]'
                }`}
              >
                {stage}
              </span>
            </div>
          );
        })}
      </div>

      {/* Detailed Chronological Event Log */}
      <div className="border-t border-[#E5E9E4] pt-4">
        <h4 className="text-xs font-bold text-[#77847D] uppercase tracking-wider mb-3">
          Activity & Response History
        </h4>
        <div className="space-y-4">
          {history.length === 0 ? (
            <p className="text-sm text-[#77847D] italic">No status activity logged yet.</p>
          ) : (
            history.map((event, idx) => {
              const statusCfg = STATUS_CONFIG[event.status] || STATUS_CONFIG.Pending;
              const formattedDate = new Date(event.timestamp).toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div key={idx} className="relative pl-6 pb-2 border-l-2 border-[#E5E9E4] last:border-l-transparent">
                  {/* Bullet */}
                  <div
                    className="absolute -left-[7px] top-1 w-3 h-3 rounded-full border-2 border-white"
                    style={{ backgroundColor: statusCfg.color }}
                  />

                  <div className="bg-[#FAF9F5] border border-[#E5E9E4] rounded-xl p-3.5 space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="px-2 py-0.5 rounded text-xs font-bold"
                          style={{
                            backgroundColor: statusCfg.bg,
                            color: statusCfg.text,
                            borderColor: statusCfg.border,
                          }}
                        >
                          {event.status}
                        </span>
                        <span className="text-xs font-semibold text-[#24332D]">
                          {event.actor}
                        </span>
                      </div>
                      <span className="text-xs text-[#77847D]">{formattedDate}</span>
                    </div>

                    {event.remarks && (
                      <p className="text-xs text-[#24332D] font-medium leading-relaxed bg-white p-2.5 rounded-lg border border-[#E5E9E4]">
                        "{event.remarks}"
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
