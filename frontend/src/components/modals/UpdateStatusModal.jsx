import React, { useState } from 'react';
import { STATUS_CONFIG } from '../../constants/theme';
import { X, ShieldCheck, AlertCircle, Send, CheckCircle2 } from 'lucide-react';

export default function UpdateStatusModal({
  complaint,
  isOpen,
  onClose,
  onSubmit,
}) {
  const [selectedStatus, setSelectedStatus] = useState(complaint?.status === 'Pending' ? 'In Progress' : complaint?.status);
  const [remarks, setRemarks] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !complaint) return null;

  const statusOptions = ['In Progress', 'Resolved', 'Rejected'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (selectedStatus === 'Rejected' && !rejectionReason.trim()) {
      setError('Please provide a mandatory reason for rejecting this complaint.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        complaintId: complaint.id,
        status: selectedStatus,
        remarks: remarks.trim(),
        rejectionReason: selectedStatus === 'Rejected' ? rejectionReason.trim() : null,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update complaint status.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div
        className="bg-white rounded-3xl border border-[#E5E9E4] shadow-2xl w-full max-w-lg overflow-hidden animate-slide-down"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-[#E5E9E4] bg-[#FAF9F5] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#247653]/10 text-[#247653] flex items-center justify-center">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#24332D]">Update Complaint Status</h3>
              <p className="text-xs text-[#77847D] font-mono">{complaint.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-[#E5E9E4] text-[#77847D] flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Target Status Selector */}
          <div>
            <label className="block text-xs font-bold text-[#77847D] uppercase tracking-wider mb-2">
              Select New Status
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {statusOptions.map((st) => {
                const cfg = STATUS_CONFIG[st];
                const isSelected = selectedStatus === st;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setSelectedStatus(st)}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all text-left ${
                      isSelected
                        ? 'border-[#247653] bg-[#ECFDF5] text-[#153F35] ring-2 ring-[#247653]/20 shadow-xs'
                        : 'border-[#E5E9E4] bg-white text-[#77847D] hover:bg-[#F5F2E9]'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: cfg.color }}
                    />
                    <div className="truncate">
                      <div className="font-bold text-[#24332D]">{st}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Conditional Rejection Reason */}
          {selectedStatus === 'Rejected' && (
            <div className="space-y-1.5 p-3.5 rounded-2xl bg-red-50/70 border border-red-200">
              <label className="block text-xs font-bold text-red-800 uppercase tracking-wider">
                Rejection Reason (Required) *
              </label>
              <textarea
                required
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain clearly to the student why this complaint cannot be addressed..."
                className="w-full text-xs p-3 rounded-xl border border-red-200 focus:outline-none focus:ring-2 focus:ring-red-400 bg-white"
              />
              <p className="text-[11px] text-red-600">
                This explanation will be permanently recorded in the student audit timeline.
              </p>
            </div>
          )}

          {/* Official Departmental Remarks */}
          <div>
            <label className="block text-xs font-bold text-[#77847D] uppercase tracking-wider mb-1.5">
              Official Departmental Remarks & Action Taken
            </label>
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Dispatched technician for inspection; replaced projector bulb; issued warning to cafeteria vendor..."
              className="w-full text-xs p-3 rounded-xl border border-[#E5E9E4] focus:outline-none focus:ring-2 focus:ring-[#247653]/20 focus:border-[#247653] bg-white"
            />
            <p className="text-[11px] text-[#77847D] mt-1">
              Remarks are visible to the student and recorded in the audit trail.
            </p>
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-[#E5E9E4] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#77847D] hover:bg-[#E5E9E4] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-xs transition-colors ${
                selectedStatus === 'Rejected'
                  ? 'bg-[#DC4545] hover:bg-[#b91c1c]'
                  : selectedStatus === 'Resolved'
                  ? 'bg-[#16834A] hover:bg-[#15803d]'
                  : 'bg-[#247653] hover:bg-[#194D40]'
              }`}
            >
              {submitting ? (
                'Updating...'
              ) : (
                <>
                  <Send size={14} />
                  Confirm Status Update
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
