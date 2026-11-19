import React from 'react';
import StatusBadge from '../common/StatusBadge';
import CategoryBadge from '../common/CategoryBadge';
import PriorityBadge from '../common/PriorityBadge';
import ComplaintTimeline from '../common/ComplaintTimeline';
import { X, Calendar, User, Building, MessageSquare, Star, ExternalLink, ShieldCheck } from 'lucide-react';

export default function ComplaintDetailsModal({
  complaint,
  isOpen,
  onClose,
  onOpenFeedback,
  onOpenUpdateStatus,
  currentUser,
}) {
  if (!isOpen || !complaint) return null;

  const isStudent = currentUser?.role === 'student';
  const isAdmin = currentUser?.role === 'dept_admin' || currentUser?.role === 'super_admin';
  const isResolved = complaint.status === 'Resolved';
  const hasFeedback = !!complaint.feedback;

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
            <PriorityBadge priority={complaint.priority} />
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
          {complaint.remarks && (
            <div className="p-4 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0]">
              <div className="flex items-center gap-2 mb-1.5">
                <MessageSquare size={16} className="text-[#166534]" />
                <h4 className="text-xs font-bold text-[#166534] uppercase tracking-wider">
                  Official Departmental Response
                </h4>
              </div>
              <p className="text-sm font-medium text-[#166534] leading-relaxed">
                "{complaint.remarks}"
              </p>
            </div>
          )}

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

          {/* Student Resolution Feedback */}
          {isResolved && (
            <div className="p-4 rounded-2xl bg-white border border-[#E5E9E4] shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-[#77847D] uppercase tracking-wider">
                  Student Resolution Feedback
                </h4>
                {isStudent && !hasFeedback && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenFeedback(complaint);
                    }}
                    className="text-xs font-bold text-[#247653] hover:underline flex items-center gap-1"
                  >
                    <Star size={13} className="text-[#F18B38]" />
                    Leave Feedback
                  </button>
                )}
              </div>

              {hasFeedback ? (
                <div className="bg-[#FAF9F5] p-3 rounded-xl border border-[#E5E9E4] space-y-1">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={15}
                        className={
                          star <= complaint.feedback.rating
                            ? 'text-[#F18B38] fill-[#F18B38]'
                            : 'text-[#E5E9E4]'
                        }
                      />
                    ))}
                    <span className="text-xs font-bold text-[#24332D] ml-1.5">
                      {complaint.feedback.rating} / 5 Stars
                    </span>
                  </div>
                  {complaint.feedback.comment && (
                    <p className="text-xs text-[#24332D] italic">
                      "{complaint.feedback.comment}"
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-xs text-[#77847D] italic">
                  No feedback rating submitted yet by student.
                </p>
              )}
            </div>
          )}

          {/* Complete Status Timeline */}
          <div>
            <h3 className="text-xs font-bold text-[#77847D] uppercase tracking-wider mb-3">
              Complaint Lifecycle & Audit Trail
            </h3>
            <ComplaintTimeline
              history={complaint.history || []}
              currentStatus={complaint.status}
            />
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
            {isStudent && isResolved && !hasFeedback && (
              <button
                onClick={() => {
                  onClose();
                  onOpenFeedback(complaint);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F18B38] hover:bg-[#d97728] text-white text-sm font-semibold shadow-xs transition-colors"
              >
                <Star size={15} />
                Rate Resolution
              </button>
            )}

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
