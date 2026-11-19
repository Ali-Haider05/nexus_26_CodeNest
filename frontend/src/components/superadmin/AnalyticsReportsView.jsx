import React from 'react';
import { analyticsService } from '../../services/analyticsService';
import EmptyState from '../common/EmptyState';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { BarChart3, PieChart as PieIcon, TrendingUp, Award, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

export default function AnalyticsReportsView({ complaints = [] }) {
  const stats = analyticsService.getStats(complaints);
  const departmentData = analyticsService.getDepartmentComparisonData(complaints);
  const statusData = analyticsService.getStatusDistribution(complaints);
  const categoryData = analyticsService.getCategoryDistribution(complaints);
  const trendsData = analyticsService.getTrends(complaints);

  if (complaints.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#24332D]">
            Campus Analytics & Graphical Reports
          </h2>
          <p className="text-xs sm:text-sm text-[#77847D]">
            Institutional metrics and department comparisons
          </p>
        </div>
        <EmptyState
          title="No analytics data available"
          description="There are currently no complaints in the database to generate graphical reports. Charts will render dynamically as complaints are lodged and resolved across departments."
          icon={BarChart3}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-[#24332D]">
          Campus Analytics & Graphical Reports
        </h2>
        <p className="text-xs sm:text-sm text-[#77847D]">
          Official evaluation metrics, departmental volume comparison, status ratios, and longitudinal trends
        </p>
      </div>

      {/* Top High-Level Metrics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-[#E5E9E4] shadow-xs space-y-1">
          <p className="text-xs font-bold text-[#77847D] uppercase tracking-wider">
            Overall Campus Resolution
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-black text-[#16834A]">{stats.resolutionRate}%</h3>
            <span className="text-xs font-semibold text-[#77847D]">
              ({stats.resolved}/{stats.total} resolved)
            </span>
          </div>
          <div className="w-full bg-[#E5E9E4] h-2 rounded-full overflow-hidden mt-2">
            <div
              className="bg-[#16834A] h-full rounded-full transition-all duration-500"
              style={{ width: `${stats.resolutionRate}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E5E9E4] shadow-xs space-y-1">
          <p className="text-xs font-bold text-[#77847D] uppercase tracking-wider">
            Average Student Satisfaction
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-black text-[#F18B38]">
              {stats.avgRating ? `${stats.avgRating} / 5.0` : 'No ratings yet'}
            </h3>
            {stats.ratedCount > 0 && (
              <span className="text-xs font-semibold text-[#77847D]">
                ({stats.ratedCount} reviews)
              </span>
            )}
          </div>
          <p className="text-[11px] text-[#77847D] mt-1">Calculated from verified student feedback</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E5E9E4] shadow-xs space-y-1">
          <p className="text-xs font-bold text-[#77847D] uppercase tracking-wider">
            Active Backlog / In Queue
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-black text-[#D97706]">
              {stats.pending + stats.underReview + stats.inProgress}
            </h3>
            <span className="text-xs font-semibold text-[#77847D]">Complaints</span>
          </div>
          <p className="text-[11px] text-[#77847D] mt-1">Pending review or investigation</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#E5E9E4] shadow-xs space-y-1">
          <p className="text-xs font-bold text-[#77847D] uppercase tracking-wider">
            Total Handled Volume
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-black text-[#153F35]">{stats.total}</h3>
            <span className="text-xs font-semibold text-[#77847D]">Entries</span>
          </div>
          <p className="text-[11px] text-[#77847D] mt-1">All university departments combined</p>
        </div>
      </div>

      {/* 1. REQUIRED CHART: Bar Chart Comparison Across Departments */}
      <div className="bg-white rounded-3xl border border-[#E5E9E4] p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E9E4]">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider bg-[#ECFDF5] text-[#166534] px-2.5 py-0.5 rounded-full border border-[#A7F3D0] inline-block mb-1">
              Required Specification §4.3
            </span>
            <h3 className="text-base font-bold text-[#24332D]">
              Bar Chart: Comparison of Complaints Received by Different Departments
            </h3>
            <p className="text-xs text-[#77847D]">
              Total volume vs resolved vs pending breakdown across all university operational units
            </p>
          </div>
        </div>

        <div className="h-80 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={departmentData}
              margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E9E4" />
              <XAxis
                dataKey="shortName"
                tick={{ fill: '#24332D', fontSize: 13, fontWeight: 600 }}
                axisLine={{ stroke: '#E5E9E4' }}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: '#77847D', fontSize: 12 }}
                axisLine={{ stroke: '#E5E9E4' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #E5E9E4',
                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                  fontSize: '12px',
                }}
              />
              <Legend
                wrapperStyle={{ paddingTop: '10px', fontSize: '12px', fontWeight: 600 }}
              />
              <Bar dataKey="total" name="Total Complaints" fill="#153F35" radius={[6, 6, 0, 0]} />
              <Bar dataKey="resolved" name="Resolved" fill="#16834A" radius={[6, 6, 0, 0]} />
              <Bar dataKey="inProgress" name="In Progress" fill="#2563EB" radius={[6, 6, 0, 0]} />
              <Bar dataKey="pending" name="Pending Review" fill="#D97706" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Charts Grid: Status Distribution Donut + Monthly Trend Line */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution Pie / Donut */}
        <div className="bg-white rounded-3xl border border-[#E5E9E4] p-6 shadow-xs space-y-4">
          <div className="pb-3 border-b border-[#E5E9E4]">
            <h3 className="text-base font-bold text-[#24332D] flex items-center gap-2">
              <PieIcon size={18} className="text-[#247653]" />
              Complaint Status Distribution
            </h3>
            <p className="text-xs text-[#77847D]">
              Proportional distribution of current grievance stages
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData.filter((s) => s.count > 0)}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    border: '1px solid #E5E9E4',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 600 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Longitudinal Trends */}
        <div className="bg-white rounded-3xl border border-[#E5E9E4] p-6 shadow-xs space-y-4">
          <div className="pb-3 border-b border-[#E5E9E4]">
            <h3 className="text-base font-bold text-[#24332D] flex items-center gap-2">
              <TrendingUp size={18} className="text-[#247653]" />
              Longitudinal Submission & Resolution Timeline
            </h3>
            <p className="text-xs text-[#77847D]">
              Resolution velocity over time
            </p>
          </div>

          <div className="h-64 w-full">
            {trendsData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-[#77847D]">
                Insufficient chronological data
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={trendsData}
                  margin={{ top: 10, right: 20, left: -10, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E9E4" />
                  <XAxis dataKey="month" tick={{ fill: '#77847D', fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fill: '#77847D', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '12px',
                      border: '1px solid #E5E9E4',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 600 }} />
                  <Line
                    type="monotone"
                    dataKey="total"
                    name="Lodged Complaints"
                    stroke="#153F35"
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="resolved"
                    name="Resolved"
                    stroke="#16834A"
                    strokeWidth={2.5}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
