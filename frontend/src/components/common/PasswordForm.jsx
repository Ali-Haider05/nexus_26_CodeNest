import React, { useId, useState } from 'react';
import { authService } from '../../services/authService';

const fields = [
  ['currentPassword', 'Current password', 'current-password'],
  ['newPassword', 'New password', 'new-password'],
  ['confirmation', 'Confirm password', 'new-password'],
];
const empty = { currentPassword: '', newPassword: '', confirmation: '' };

export default function PasswordForm() {
  const prefix = useId();
  const [values, setValues] = useState(empty);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function submit(event) {
    event.preventDefault();
    setError('');
    setSuccess('');
    const { currentPassword, newPassword, confirmation } = values;
    const size = new TextEncoder().encode(newPassword).length;
    if (size < 8 || size > 72) return setError('Use a new password between 8 and 72 bytes.');
    if (newPassword !== confirmation) return setError('The new passwords do not match.');

    setBusy(true);
    try {
      await authService.changePassword({ currentPassword, newPassword });
      setValues(empty);
      setSuccess('Password changed successfully.');
    } catch (error) {
      setError(error.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      {fields.map(([key, label, autoComplete]) => (
        <label key={key} htmlFor={prefix + key} className="block space-y-1 text-xs font-semibold">
          <span>{label}</span>
          <input id={prefix + key} type="password" autoComplete={autoComplete} required
            value={values[key]} onChange={(event) => setValues({ ...values, [key]: event.target.value })}
            className="block w-full rounded-xl border border-[#E5E9E4] p-3 text-sm" />
        </label>
      ))}
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      {success && <p role="status" className="text-sm text-[#166534]">{success}</p>}
      <button type="submit" disabled={busy} className="rounded-xl bg-[#247653] px-4 py-2 text-xs font-bold text-white disabled:opacity-50">
        {busy ? 'Changing password...' : 'Change password'}
      </button>
    </form>
  );
}
