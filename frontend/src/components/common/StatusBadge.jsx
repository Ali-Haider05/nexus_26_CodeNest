import React from 'react';
import { STATUS_CONFIG } from '../../constants/theme';
import { Clock, Wrench, CheckCircle2, XCircle } from 'lucide-react';

const icons = {
  Pending: Clock,
  'In Progress': Wrench,
  Resolved: CheckCircle2,
  Rejected: XCircle,
};

export default function StatusBadge({ status, size = 'sm' }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.Pending;
  const IconComponent = icons[status] || Clock;

  const sizeClasses =
    size === 'xs'
      ? 'px-2 py-0.5 text-xs font-medium gap-1'
      : size === 'lg'
      ? 'px-3.5 py-1.5 text-sm font-semibold gap-2'
      : 'px-2.5 py-1 text-xs font-semibold gap-1.5';

  return (
    <span
      className={`inline-flex items-center rounded-full border transition-all ${sizeClasses}`}
      style={{
        backgroundColor: config.bg,
        borderColor: config.border,
        color: config.text,
      }}
      title={config.description}
    >
      <IconComponent
        size={size === 'xs' ? 12 : size === 'lg' ? 16 : 13}
        style={{ color: config.color }}
        className="shrink-0"
      />
      <span>{config.label}</span>
    </span>
  );
}
