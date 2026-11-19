import React from 'react';
import { DEPARTMENTS } from '../../constants/theme';
import { analyticsService } from '../../services/analyticsService';
import { Building2, UtensilsCrossed, BookOpen, Cpu, GraduationCap, CheckCircle2, Clock, ArrowRight } from 'lucide-react';

const deptIcons = {
  'Cafeteria Administration': UtensilsCrossed,
  'Library Administration': BookOpen,
  'Laboratory / IT Administration': Cpu,
  'Teaching / Academic Administration': GraduationCap,
};

export default function DepartmentsDirectoryView({ complaints = [], onFilterDepartment }) {
  const departmentStats = analyticsService.getDepartmentComparisonData(complaints);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-[#24332D]">
          University Departments & Administration Directory
        </h2>
        <p className="text-xs sm:text-sm text-[#77847D]">
          Designated responsible departments mapped to automatic complaint routing with real-time operational metrics
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {DEPARTMENTS.map((deptName) => {
          const IconComp = deptIcons[deptName] || Building2;
          const stats = departmentStats.find((d) => d.department === deptName) || {
            total: 0,
            resolved: 0,
            pending: 0,
            inProgress: 0,
          };

          const resolutionRate =
            stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0;

          return (
            <div
              key={deptName}
              className="bg-white rounded-3xl border border-[#E5E9E4] p-6 shadow-xs space-y-5 hover:border-[#247653]/30 transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#ECFDF5] text-[#247653] flex items-center justify-center shrink-0 border border-[#A7F3D0]">
                      <IconComp size={24} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#24332D] leading-tight">
                        {deptName}
                      </h3>
                      <p className="text-xs text-[#77847D] mt-0.5">
                        CampusConnect Operational Unit
                      </p>
                    </div>
                  </div>
                </div>

                {/* Real Metrics from API */}
                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div className="p-2.5 rounded-xl bg-[#F5F2E9] border border-[#E5E9E4]">
                    <p className="text-lg font-black text-[#153F35]">{stats.total}</p>
                    <p className="text-[10px] font-semibold text-[#77847D]">Assigned</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0]">
                    <p className="text-lg font-black text-[#16834A]">{stats.resolved}</p>
                    <p className="text-[10px] font-semibold text-[#166534]">Resolved</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#FEF3C7] border border-[#FDE68A]">
                    <p className="text-lg font-black text-[#D97706]">{stats.pending}</p>
                    <p className="text-[10px] font-semibold text-[#92400E]">Pending</p>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="pt-3 border-t border-[#E5E9E4] flex items-center justify-between">
                <span className="text-xs font-bold text-[#16834A]">
                  {stats.total > 0 ? `${resolutionRate}% Resolution Rate` : 'Queue Empty'}
                </span>
                <button
                  type="button"
                  onClick={() => onFilterDepartment && onFilterDepartment(deptName)}
                  className="text-xs font-bold text-[#247653] hover:underline flex items-center gap-1"
                >
                  View Department Complaints <ArrowRight size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
