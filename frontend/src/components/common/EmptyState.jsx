import React from 'react';
import { Inbox, PlusCircle, RotateCcw } from 'lucide-react';

export default function EmptyState({
  title = 'No complaints found',
  description = 'There are no complaints matching your current filters or selected view.',
  actionLabel,
  onAction,
  icon: Icon = Inbox,
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-[#E5E9E4] shadow-xs">
      <div className="w-16 h-16 rounded-2xl bg-[#F5F2E9] flex items-center justify-center text-[#247653] mb-4 shadow-inner">
        <Icon size={32} className="stroke-[1.5]" />
      </div>
      <h3 className="text-base font-bold text-[#24332D] mb-1">{title}</h3>
      <p className="text-sm text-[#77847D] max-w-md mb-6 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#247653] hover:bg-[#194D40] text-white text-sm font-semibold shadow-xs transition-colors"
        >
          <PlusCircle size={16} />
          {actionLabel}
        </button>
      )}
    </div>
  );
}
