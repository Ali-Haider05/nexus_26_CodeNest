import React from 'react';
import { CATEGORY_CONFIG } from '../../constants/theme';
import { UtensilsCrossed, BookOpen, Cpu, GraduationCap, Layers } from 'lucide-react';

const categoryIcons = {
  Cafeteria: UtensilsCrossed,
  Library: BookOpen,
  'Laboratories & IT Facilities': Cpu,
  'Teaching & Academic Affairs': GraduationCap,
};

export default function CategoryBadge({ category, showDepartment = false }) {
  const config = CATEGORY_CONFIG[category] || {
    name: category,
    color: '#247653',
    bg: '#ECFDF5',
    border: '#A7F3D0',
    text: '#065F46',
    department: 'General Administration',
  };

  const IconComponent = categoryIcons[category] || Layers;

  return (
    <div className="inline-flex flex-col items-start gap-0.5">
      <span
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border transition-all"
        style={{
          backgroundColor: config.bg,
          borderColor: config.border,
          color: config.text,
        }}
      >
        <IconComponent size={13} style={{ color: config.color }} className="shrink-0" />
        <span>{config.name}</span>
      </span>
      {showDepartment && (
        <span className="text-[11px] text-[#77847D] pl-1 font-medium">
          Routed to: {config.department}
        </span>
      )}
    </div>
  );
}
