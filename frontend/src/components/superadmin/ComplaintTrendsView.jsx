import React from 'react';
import { analyticsService } from '../../services/analyticsService';
import { CATEGORY_CONFIG } from '../../constants/theme';
import EmptyState from '../common/EmptyState';
import { TrendingUp, AlertTriangle, CheckCircle2, Clock, ShieldAlert } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

export default function ComplaintTrendsView({ complaints = [] }) {
  const categoryData = analyticsService.getCategoryDistribution(complaints);

  if (complaints.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#24332D]">
            Campus Grievance Trends & Category Analysis
          </h2>
          <p className="text-xs sm:text-sm text-[#77847D]">
            Category breakdown and common grievance patterns
          </p>
        </div>
        <EmptyState
          title="No trend data available"
          description="Category distribution and trends will appear once complaints are received by departments."
          icon={TrendingUp}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-[#24332D]">
          Campus Grievance Trends & Category Analysis
        </h2>
        <p className="text-xs sm:text-sm text-[#77847D]">
          Volume distribution and patterns across official university complaint categories
        </p>
      </div>

      {/* Category Breakdown Chart */}
      <div className="bg-white rounded-3xl border border-[#E5E9E4] p-6 shadow-xs space-y-4">
        <div className="pb-3 border-b border-[#E5E9E4]">
          <h3 className="text-base font-bold text-[#24332D] flex items-center gap-2">
            <TrendingUp size={18} className="text-[#247653]" />
            Volume Distribution by Official Complaint Category
          </h3>
          <p className="text-xs text-[#77847D]">
            Relative grievance frequency per university sector
          </p>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={categoryData}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 100, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E9E4" />
              <XAxis type="number" allowDecimals={false} tick={{ fill: '#77847D', fontSize: 12 }} />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: '#24332D', fontSize: 12, fontWeight: 600 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #E5E9E4',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="count" name="Complaints" radius={[0, 6, 6, 0]}>
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Real Category Breakdown List */}
      <div className="bg-white rounded-3xl border border-[#E5E9E4] p-6 shadow-xs space-y-4">
        <div className="pb-3 border-b border-[#E5E9E4]">
          <h3 className="text-base font-bold text-[#24332D] flex items-center gap-2">
            <ShieldAlert size={18} className="text-[#247653]" />
            Category Operational Summary
          </h3>
          <p className="text-xs text-[#77847D]">
            Actual recorded complaints per department category
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {categoryData.map((cat) => {
            const config = CATEGORY_CONFIG[cat.name];
            return (
              <div
                key={cat.name}
                className="p-4 rounded-2xl border border-[#E5E9E4] bg-[#FAF9F5] space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#24332D]">{cat.name}</span>
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                  >
                    {cat.count} Complaints
                  </span>
                </div>
                <p className="text-[11px] text-[#77847D]">{config?.description}</p>
                <p className="text-[11px] font-semibold text-[#153F35]">
                  Routed to: {config?.department}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
