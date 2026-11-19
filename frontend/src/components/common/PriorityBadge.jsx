import React from 'react';
import { PRIORITY_CONFIG } from '../../constants/theme';
import { AlertTriangle } from 'lucide-react';

export default function PriorityBadge({ priority = 'Medium' }) {
  const config = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.Medium;

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border"
      style={{
        backgroundColor: config.bg,
        color: config.text,
        borderColor: `${config.color}33`,
      }}
    >
      {priority === 'Urgent' && <AlertTriangle size={11} className="shrink-0 text-red-600 animate-pulse" />}
      <span>{config.label}</span>
    </span>
  );
}
