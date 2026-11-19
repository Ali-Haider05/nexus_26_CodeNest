import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { complaintService } from '../../services/complaintService';

export default function DownloadCSVReport({ filters, disabled }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function download() {
    setLoading(true);
    setError('');
    try {
      const { blob, filename } = await complaintService.exportComplaints(filters);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      setError(error.message || 'Could not download the report.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button type="button" disabled={loading || disabled} onClick={download} aria-busy={loading}
        className="inline-flex items-center gap-2 rounded-xl bg-[#153F35] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#194D40] disabled:opacity-50">
        <Download size={15} aria-hidden="true" />
        {loading ? 'Preparing CSV...' : 'Download CSV Report'}
      </button>
      {error && <p role="alert" className="mt-1 text-xs text-red-700">{error}</p>}
    </div>
  );
}
