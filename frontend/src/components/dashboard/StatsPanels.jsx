import React from 'react';
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { STATUS_LABELS } from '../../services/complaintService';
import { STATUS_CONFIG } from '../../constants/theme';

const panel = 'rounded-2xl border border-[#E5E9E4] bg-white p-5 shadow-xs';

export default function StatsPanels({ stats, recurring, error, showDepartmentChart }) {
  const statuses = stats.byStatus.map(({ status, count }) => ({ name: STATUS_LABELS[status], count }));
  return (
    <section className="mt-6 grid gap-4 sm:grid-cols-2" aria-label="Complaint analytics">
      {showDepartmentChart && <div className={panel}>
        <h2 className="font-bold">Complaints per department</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={stats.byDepartment}><XAxis dataKey="department" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="count" fill="#247653" /></BarChart>
        </ResponsiveContainer>
      </div>}
      <div className={panel}>
        <h2 className="font-bold">Complaint status distribution</h2>
        {stats.totals.total > 0 && <ResponsiveContainer width="100%" height={200}>
          <PieChart><Pie data={statuses} dataKey="count" nameKey="name" innerRadius={48} outerRadius={78}>
            {statuses.map(({ name }) => <Cell key={name} fill={STATUS_CONFIG[name].color} />)}
          </Pie><Tooltip /></PieChart>
        </ResponsiveContainer>}
        <ul className="flex flex-wrap gap-3 text-xs mt-2">
          {statuses.map(({ name, count }) => <li key={name}>{name} ({count})</li>)}
        </ul>
      </div>
      <div className={panel}>
        <h2 className="font-bold">Recurring issues</h2>
        {error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
        {recurring && (
          <>
            {recurring.recurring.length ? <ul className="mt-2 space-y-2 text-sm">
              {recurring.recurring.map(({ category, title, count, latest_created_at }) => (
                <li key={JSON.stringify([category, title])}><strong>{title}</strong> ? {category} ({count})
                  {latest_created_at && <small className="block text-[#77847D]">Latest: {new Date(latest_created_at).toLocaleDateString()}</small>}
                </li>
              ))}
            </ul> : <p className="mt-2 text-sm">No complaints to group yet.</p>}
            <h3 className="mt-4 font-semibold">Last 7 days</h3>
            <ul className="mt-2 text-sm">{recurring.byCategoryLast7Days.map(({ category, count }) => <li key={category}>{category} ({count})</li>)}</ul>
          </>
        )}
      </div>
    </section>
  );
}
