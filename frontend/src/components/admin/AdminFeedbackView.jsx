import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';

export default function AdminFeedbackView() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    api.request('/api/feedback')
      .then((result) => { if (active) setData(result); })
      .catch((error) => { if (active) setError(error.message); });
    return () => { active = false; };
  }, [retry]);

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-extrabold text-[#24332D]">Feedback</h2>
      {error && <div role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
        {error}{' '}<button type="button" className="font-bold underline" onClick={() => { setError(''); setRetry(retry + 1); }}>Retry</button>
      </div>}
      {!data && !error && <p role="status" className="text-sm">Loading feedback...</p>}
      {data && (
        <div className="space-y-4 rounded-2xl border border-[#E5E9E4] bg-white p-4 shadow-xs">
          <p className="text-sm font-bold">Average rating: {data.average_rating == null ? 'No ratings yet' : data.average_rating.toFixed(1) + ' / 5'}</p>
          {data.feedback.length === 0 ? <p className="text-sm text-[#77847D]">No feedback received yet.</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF9F5] text-[#24332D]">
                  <tr>{['Student', 'Complaint', 'Rating', 'Comment', 'Date'].map((column) =>
                    <th key={column} scope="col" className="p-3">{column}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-[#E5E9E4]">
                  {data.feedback.map((entry) => (
                    <tr key={entry.id}>
                      <td className="p-3">{entry.student_name}</td>
                      <td className="p-3">{entry.complaint_title}</td>
                      <td className="whitespace-nowrap p-3">{entry.rating} / 5</td>
                      <td className="whitespace-pre-wrap break-words p-3">{entry.comment || 'No comment'}</td>
                      <td className="whitespace-nowrap p-3">{entry.created_at ? new Date(entry.created_at).toLocaleDateString() : ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
