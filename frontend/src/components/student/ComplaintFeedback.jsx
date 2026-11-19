import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { complaintService } from '../../services/complaintService';

const ratings = [1, 2, 3, 4, 5];

export default function ComplaintFeedback({ complaint }) {
  const [submitted, setSubmitted] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const feedback = complaint.feedback || submitted;

  if (feedback) {
    return (
      <section className="space-y-2 rounded-2xl border border-[#E5E9E4] bg-[#FAF9F5] p-4">
        <h4 className="text-sm font-bold">Your feedback</h4>
        <p className="text-sm font-semibold">{feedback.rating} out of 5 stars</p>
        {feedback.comment && <p className="whitespace-pre-wrap break-words text-sm">{feedback.comment}</p>}
        {feedback.created_at && <time dateTime={feedback.created_at} className="text-xs text-[#77847D]">{new Date(feedback.created_at).toLocaleString()}</time>}
      </section>
    );
  }
  if (!['Resolved', 'Rejected'].includes(complaint.status)) return null;

  async function submit(event) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      setSubmitted(await complaintService.submitFeedback(complaint.id, { rating, comment: comment.trim() || null }));
    } catch (error) {
      if (error.status !== 409) {
        setError(error.message);
      } else {
        try {
          const latest = await complaintService.getComplaintById(complaint.id);
          if (latest.feedback) setSubmitted(latest.feedback);
          else setError(error.message);
        } catch (refreshError) {
          setError(refreshError.message);
        }
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-2xl border border-[#E5E9E4] bg-[#FAF9F5] p-4">
      <h4 className="text-sm font-bold">Give feedback</h4>
      <fieldset disabled={busy} className="flex gap-2">
        <legend className="mb-1 text-xs font-semibold">Rating</legend>
        {ratings.map((value) => (
          <label key={value} className="relative cursor-pointer rounded focus-within:ring-2 focus-within:ring-[#247653]">
            <input className="absolute inset-0 h-full w-full cursor-pointer opacity-0" type="radio" name="feedback-rating" aria-label={value + (value === 1 ? ' star' : ' stars')}
              checked={rating === value} onChange={() => setRating(value)} required />
            <Star size={23} aria-hidden="true" className={value <= rating ? 'pointer-events-none fill-[#F18B38] text-[#F18B38]' : 'pointer-events-none text-[#77847D]'} />
          </label>
        ))}
      </fieldset>
      <label className="block space-y-1 text-xs font-semibold">
        <span>Comment (optional)</span>
        <textarea rows={3} maxLength={1000} value={comment} onChange={(event) => setComment(event.target.value)}
          className="block w-full rounded-xl border border-[#E5E9E4] bg-white p-3 text-sm" />
      </label>
      {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
      <button type="submit" disabled={busy || !rating} className="rounded-xl bg-[#247653] px-4 py-2 text-xs font-bold text-white disabled:opacity-50">
        {busy ? 'Submitting...' : 'Submit feedback'}
      </button>
    </form>
  );
}
