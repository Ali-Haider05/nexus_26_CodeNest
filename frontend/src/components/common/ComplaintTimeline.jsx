import React from 'react';
import { Building2, CheckCircle2, FileText, Wrench, XCircle } from 'lucide-react';
import { STATUS_LABELS } from '../../services/complaintService';

export default function ComplaintTimeline({ complaint, includeResponses = false }) {
  const history = complaint.history || [];
  const submission = history.find((entry) => entry.status === 'pending')?.created_at ?? complaint.createdAt;
  const finalStatus = complaint.status === 'Rejected' ? 'rejected' : 'resolved';
  const steps = [
    { id: 'submitted', name: 'Submitted', date: submission, icon: FileText },
    { id: 'assigned', name: 'Assigned to ' + complaint.department, date: submission, icon: Building2 },
    { id: 'in_progress', name: 'In Progress', icon: Wrench },
    { id: finalStatus, name: STATUS_LABELS[finalStatus], icon: finalStatus === 'rejected' ? XCircle : CheckCircle2 },
  ];
  const current = complaint.status === 'Pending' ? 'assigned' :
    complaint.status === 'In Progress' ? 'in_progress' : finalStatus;
  const events = history.map((entry) => ({
    label: entry.status === 'pending' ? 'Submitted' : STATUS_LABELS[entry.status] || entry.status,
    date: entry.created_at, note: entry.note,
  }));
  if (includeResponses) {
    for (const response of complaint.responses || []) {
      const event = events.find((entry) => entry.note === response.remark && entry.date === response.createdAt);
      if (event && !event.actor) event.actor = response.adminName;
      else events.push({ label: 'Department response', date: response.createdAt, note: response.remark, actor: response.adminName });
    }
    events.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  }

  return (
    <div className="space-y-6">
      <ol aria-label="Complaint progress" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {steps.map(({ id, name, date, icon: Icon }) => {
          const active = current === id;
          const recorded = history.findLast((entry) => entry.status === id);
          const time = date ?? recorded?.created_at ?? (active ? complaint.updatedAt : null);
          return (
            <li key={id} aria-current={active ? 'step' : undefined}
              className={'flex flex-col items-center gap-1 rounded-xl p-2 text-center text-xs ' + (active ? 'bg-[#ECFDF5] font-bold text-[#153F35] ring-2 ring-[#247653]' : 'text-[#77847D]')}>
              <span className={'grid h-9 w-9 place-items-center rounded-full border ' + (active || date || recorded ? 'border-[#247653] bg-[#247653] text-white' : 'border-[#E5E9E4]')}>
                <Icon size={16} aria-hidden="true" />
              </span>
              <span>{name}</span>
              {time && <time dateTime={time} className="text-[11px] font-normal">{new Date(time).toLocaleString()}</time>}
            </li>
          );
        })}
      </ol>
      <div className="space-y-3 border-t border-[#E5E9E4] pt-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#77847D]">Activity &amp; Response History</h4>
        {events.length === 0 && <p className="text-sm text-[#77847D]">No status activity logged yet.</p>}
        {events.map(({ label, actor, date, note }, index) => (
          <div key={index} className="space-y-1 rounded-xl border border-[#E5E9E4] bg-[#FAF9F5] p-3 text-xs">
            <div className="flex flex-wrap justify-between gap-2">
              <span className="font-bold">{label}{actor ? ' ? ' + actor : ''}</span>
              {date && <time dateTime={date} className="text-[#77847D]">{new Date(date).toLocaleString()}</time>}
            </div>
            {note && <p className="whitespace-pre-wrap break-words rounded-lg bg-white p-2">{note}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
