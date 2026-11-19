import React, { useState } from 'react';
import StatusBadge from '../common/StatusBadge';
import CategoryBadge from '../common/CategoryBadge';
import ComplaintFeedback from '../student/ComplaintFeedback';
import ComplaintTimeline from '../common/ComplaintTimeline';
import { X, Calendar, User, Building, MessageSquare, ExternalLink, ShieldCheck } from 'lucide-react';

export default function ComplaintDetailsModal({
  complaint,
  isOpen,
  onClose,
  onResponse,
  onOpenUpdateStatus,
  currentUser,
}) {
  const [remark, setRemark] = useState('');
  const [responseError, setResponseError] = useState('');
  const [sending, setSending] = useState(false);
  if (!isOpen || !complaint) return null;

  const isAdmin = currentUser?.role === 'dept_admin';

  const formattedCreated = new Date(complaint.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div
        className="bg-white rounded-3xl border border-[#E5E9E4] shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-slide-down"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-[#E5E9E4] bg-[#FAF9F5] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold px-2.5 py-1 bg-white border border-[#E5E9E4] rounded-lg text-[#153F35]">
              {complaint.id}
            </span>
            <StatusBadge status={complaint.status} size="sm" />
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[#E5E9E4] text-[#77847D] flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Title & Metadata */}
          <div>
            <h2 className="text-xl font-bold text-[#24332D] leading-snug mb-3">
              {complaint.title}
            </h2>

            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-[#77847D] pt-1 border-t border-[#E5E9E4]/60">
              <span className="flex items-center gap-1.5 font-medium">
                <Calendar size={14} className="text-[#247653]" />
                Submitted: {formattedCreated}
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <User size={14} className="text-[#247653]" />
                Student: {complaint.studentName} ({complaint.studentRollNo || 'Student'})
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <Building size={14} className="text-[#247653]" />
                Routing: {complaint.department}
              </span>
            </div>
          </div>

          {/* Category & Department Routing Banner */}
          <div className="p-4 rounded-2xl bg-[#F5F2E9] border border-[#E5E9E4] flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-[#77847D] uppercase tracking-wider mb-1">
                Selected Category
              </p>
              <CategoryBadge category={complaint.category} />
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-[#77847D] uppercase tracking-wider mb-1">
                Responsible Authority
              </p>
              <span className="text-xs font-bold text-[#153F35] bg-white px-3 py-1.5 rounded-lg border border-[#E5E9E4] inline-block">
                {complaint.department}
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs font-bold text-[#77847D] uppercase tracking-wider mb-2">
              Student Grievance Description
            </h3>
            <div className="bg-[#FAF9F5] border border-[#E5E9E4] rounded-2xl p-4 text-sm text-[#24332D] leading-relaxed whitespace-pre-line">
              {complaint.description}
            </div>
          </div>

          {/* Supporting Image Attachment (if present) */}
          {(complaint.imageUrl || complaint.attachment || complaint.attachmentUrl || complaint.image) && (
            <div>
              <h3 className="text-xs font-bold text-[#77847D] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                Supporting Original Evidence / Photograph
              </h3>
              <div className="relative group rounded-2xl overflow-hidden border border-[#E5E9E4] max-h-72 bg-black/5">
                <img
                  src={complaint.imageUrl || complaint.attachment || complaint.attachmentUrl || complaint.image}
                  alt="Complaint original attachment"
                  className="w-full h-auto object-cover max-h-72"
                />
                <a
                  href={complaint.imageUrl || complaint.attachment || complaint.attachmentUrl || complaint.image}
                  target="_blank"
                  rel="noreferrer"
                  className="absolute bottom-3 right-3 bg-white/95 hover:bg-white text-xs font-semibold text-[#24332D] px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink size={13} />
                  View Original Photograph
                </a>
              </div>
            </div>
          )}

          {/* Current Official Remarks */}
          {complaint.responses.map((response, index) => (
            <div key={index} className="p-4 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0]">
              <div className="flex items-center gap-2 mb-1.5">
                <MessageSquare size={16} className="text-[#166534]" />
                <h4 className="text-xs font-bold text-[#166534] uppercase tracking-wider">
                  Official Departmental Response
                </h4>
              </div>
              <p className="text-sm font-medium text-[#166534] leading-relaxed">
                {response.remark}
              </p>
              <p className="text-xs mt-1">{response.adminName} ? {new Date(response.createdAt).toLocaleString()}</p>
            </div>
          ))}

          {/* Rejection Reason if Rejected */}
          {complaint.rejectionReason && (
            <div className="p-4 rounded-2xl bg-[#FEF2F2] border border-[#FECACA]">
              <h4 className="text-xs font-bold text-[#991B1B] uppercase tracking-wider mb-1">
                Rejection Reason
              </h4>
              <p className="text-sm font-medium text-[#991B1B]">
                {complaint.rejectionReason}
              </p>
            </div>
          )}

          {isAdmin && (
            <form className="space-y-2" onSubmit={async (event) => {
              event.preventDefault();
              if (!remark.trim()) return;
              setResponseError('');
              setSending(true);
              try { await onResponse(complaint.id, remark.trim()); setRemark(''); }
              catch (error) { setResponseError(error.message); }
              finally { setSending(false); }
            }}>
              <label className="block text-xs font-bold" htmlFor="complaint-response">Department response</label>
              <textarea id="complaint-response" className="w-full rounded-xl border p-3 text-sm" value={remark} onChange={(event) => setRemark(event.target.value)} required />
              {responseError && <p role="alert" className="text-sm text-red-700">{responseError}</p>}
              <button className="rounded-xl bg-[#247653] px-4 py-2 text-sm text-white" disabled={sending || !remark.trim()}>{sending ? "Sending?" : "Send response"}</button>
            </form>
          )}
          {currentUser?.role === 'student' && <ComplaintFeedback key={complaint.id} complaint={complaint} />}

          {/* Complete Status Timeline */}
          <div>
            <h3 className="text-xs font-bold text-[#77847D] uppercase tracking-wider mb-3">
              Complaint Lifecycle & Audit Trail
            </h3>
            <ComplaintTimeline complaint={complaint} />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-[#E5E9E4] bg-[#FAF9F5] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-[#77847D] hover:bg-[#E5E9E4] transition-colors"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <button
                onClick={() => {
                  onClose();
                  onOpenUpdateStatus(complaint);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#247653] hover:bg-[#194D40] text-white text-sm font-semibold shadow-xs transition-colors"
              >
                <ShieldCheck size={16} />
                Update Status & Remarks
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
