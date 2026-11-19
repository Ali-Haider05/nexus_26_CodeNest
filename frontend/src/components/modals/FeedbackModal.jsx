import React, { useState } from 'react';
import { X, Star, Send, CheckCircle2 } from 'lucide-react';

export default function FeedbackModal({
  complaint,
  isOpen,
  onClose,
  onSubmit,
}) {
  if (!isOpen || !complaint) return null;

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
        complaintId: complaint.id,
        rating,
        comment: comment.trim(),
      });
      onClose();
    } catch (err) {
      alert(err.message || 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div
        className="bg-white rounded-3xl border border-[#E5E9E4] shadow-2xl w-full max-w-md overflow-hidden animate-slide-down"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-[#E5E9E4] bg-[#FAF9F5] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#F18B38]/10 text-[#F18B38] flex items-center justify-center">
              <Star size={18} className="fill-[#F18B38]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#24332D]">Resolution Feedback</h3>
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

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="text-center">
            <p className="text-xs font-semibold text-[#77847D] mb-1">
              How satisfied are you with the resolution of:
            </p>
            <p className="text-sm font-bold text-[#24332D] line-clamp-2">
              "{complaint.title}"
            </p>
          </div>

          {/* Star selector */}
          <div className="flex justify-center items-center gap-2 py-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                type="button"
                key={star}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="p-1 focus:outline-none transition-transform hover:scale-115"
              >
                <Star
                  size={32}
                  className={`transition-colors ${
                    (hoverRating || rating) >= star
                      ? 'text-[#F18B38] fill-[#F18B38]'
                      : 'text-[#E5E9E4]'
                  }`}
                />
              </button>
            ))}
          </div>

          <div className="text-center">
            <span className="text-xs font-bold text-[#247653] bg-[#ECFDF5] px-3 py-1 rounded-full border border-[#A7F3D0]">
              {rating === 5 && 'Outstanding Resolution'}
              {rating === 4 && 'Very Satisfied'}
              {rating === 3 && 'Acceptable / Neutral'}
              {rating === 2 && 'Needs Improvement'}
              {rating === 1 && 'Unsatisfactory'}
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#77847D] uppercase tracking-wider mb-1.5">
              Feedback Remarks / Comments (Optional)
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your thoughts on the promptness and quality of the departmental action taken..."
              className="w-full text-xs p-3 rounded-xl border border-[#E5E9E4] focus:outline-none focus:ring-2 focus:ring-[#247653]/20 focus:border-[#247653] bg-white"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#77847D] hover:bg-[#E5E9E4] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#247653] hover:bg-[#194D40] text-xs font-bold text-white shadow-xs transition-colors"
            >
              {submitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
