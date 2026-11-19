import React from 'react';

export default function LoadingSkeleton({ count = 3, type = 'card' }) {
  if (type === 'table') {
    return (
      <div className="bg-white rounded-2xl border border-[#E5E9E4] overflow-hidden p-4 space-y-4 animate-pulse">
        <div className="h-6 bg-[#E5E9E4]/60 rounded w-1/4" />
        <div className="space-y-3">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="flex items-center justify-between gap-4 py-3 border-b border-[#E5E9E4]/50 last:border-none">
              <div className="h-4 bg-[#E5E9E4]/60 rounded w-20" />
              <div className="h-4 bg-[#E5E9E4]/60 rounded w-1/3" />
              <div className="h-4 bg-[#E5E9E4]/60 rounded w-24" />
              <div className="h-4 bg-[#E5E9E4]/60 rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl p-5 border border-[#E5E9E4] space-y-3">
          <div className="flex justify-between items-center">
            <div className="h-4 bg-[#E5E9E4]/60 rounded w-24" />
            <div className="w-10 h-10 bg-[#E5E9E4]/60 rounded-xl" />
          </div>
          <div className="h-8 bg-[#E5E9E4]/70 rounded w-16" />
          <div className="h-3 bg-[#E5E9E4]/50 rounded w-32" />
        </div>
      ))}
    </div>
  );
}
