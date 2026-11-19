import React from 'react';

export default function StatCard({
  title,
  value,
  icon: Icon,
  color = '#247653',
  bgColor = '#ECFDF5',
  subtitle,
  onClick,
  active = false,
}) {
  return (
    <div
      onClick={onClick}
      className={`group relative overflow-hidden bg-white rounded-2xl p-5 border transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-md' : ''
      } ${
        active
          ? 'border-2 border-[#247653] shadow-md ring-2 ring-[#247653]/10'
          : 'border-[#E5E9E4] hover:border-[#CCD5CE] shadow-xs'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-[#77847D] uppercase tracking-wider">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold text-[#24332D] tracking-tight">{value}</h3>
          </div>
          {subtitle && (
            <p className="text-xs text-[#77847D] font-medium flex items-center gap-1 mt-1">
              {subtitle}
            </p>
          )}
        </div>

        {Icon && (
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
            style={{ backgroundColor: bgColor }}
          >
            <Icon size={22} style={{ color: color }} />
          </div>
        )}
      </div>

      {/* Subtle indicator bar */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1 transition-all opacity-80 group-hover:opacity-100"
        style={{ backgroundColor: color }}
      />
    </div>
  );
}
