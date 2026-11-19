import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import PasswordForm from '../common/PasswordForm';
import { Mail, ShieldCheck } from 'lucide-react';

async function resizeAvatar(file) {
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();

    // Center-crop the photo before resizing so it keeps its proportions.
    const size = Math.min(image.naturalWidth, image.naturalHeight);
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 256;
    const context = canvas.getContext('2d');
    context.fillStyle = '#fff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, (image.naturalWidth - size) / 2, (image.naturalHeight - size) / 2,
      size, size, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.8);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export default function StudentProfileView({ complaints = [], department }) {
  const { currentUser, role, updateAvatar } = useAuth();
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const total = complaints.length;
  const resolved = complaints.filter((c) => c.status === 'Resolved').length;

  const roleTitle =
    role === 'student'
      ? 'Student'
      : role === 'super_admin'
      ? 'Executive Super Administrator'
      : `${department || 'Departmental'} Administrator`;

  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const savedAvatar = currentUser?.avatar_url;
  const currentAvatarUrl = preview || savedAvatar;

  async function choosePhoto(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setMessage('');
    setError('');
    setPreview(null);
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Choose a JPG, PNG, or WebP image.');
      return;
    }

    setBusy(true);
    try {
      setPreview(await resizeAvatar(file));
    } catch {
      setError('Could not open this image. Choose another photo.');
    } finally {
      setBusy(false);
    }
  }

  async function savePhoto(avatarUrl) {
    setMessage('');
    setError('');
    setBusy(true);
    try {
      await updateAvatar(avatarUrl);
      setPreview(null);
      setMessage(avatarUrl ? 'Profile photo saved.' : 'Profile photo removed.');
    } catch (error) {
      setError(error.message || 'Could not update your profile photo.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Profile Header */}
      <div className="bg-white rounded-3xl border border-[#E5E9E4] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          {/* Current photo or upload preview */}
          <div className="relative group shrink-0">
            <div className="w-28 h-28 rounded-3xl bg-[#247653] text-white flex items-center justify-center font-bold text-3xl shadow-md border-4 border-white overflow-hidden">
              {currentAvatarUrl ? (
                <img
                  src={currentAvatarUrl}
                  alt={preview ? 'Profile photo preview' : currentUser?.name || 'Profile'}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                currentUser?.name?.charAt(0) || 'U'
              )}
            </div>


          </div>

          <div className="space-y-2 flex-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ECFDF5] text-[#166534] text-xs font-bold border border-[#A7F3D0]">
              <ShieldCheck size={14} />
              {roleTitle}
            </div>
            <h2 className="text-2xl font-extrabold text-[#24332D]">
              {currentUser?.name || 'University User'}
            </h2>
            <p className="text-xs text-[#77847D] font-medium">
              Institutional Account • CampusConnect System
            </p>
            {role === 'student' && (
              <div className="space-y-2">
                <label htmlFor="profile-photo" className="block text-xs font-semibold text-[#24332D]">Profile photo</label>
                <input id="profile-photo" type="file" accept="image/jpeg,image/png,image/webp"
                  className="max-w-full text-xs text-[#24332D] file:mr-2 file:rounded-lg file:bg-[#F5F2E9] file:px-3 file:py-2"
                  onChange={choosePhoto} disabled={busy} />
                <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
                  <button type="button" onClick={() => savePhoto(preview)} disabled={busy || !preview}
                    className="rounded-xl bg-[#247653] px-3 py-2 text-xs font-bold text-white disabled:opacity-50">Save</button>
                  <button type="button" onClick={() => savePhoto(null)} disabled={busy || !savedAvatar}
                    className="rounded-xl border border-[#E5E9E4] px-3 py-2 text-xs font-bold text-[#24332D] disabled:opacity-50">Remove photo</button>
                </div>
                {preview && <p className="text-xs text-[#77847D]">Photo preview. Select Save to apply it.</p>}
                {message && <p role="status" className="text-xs text-[#166534]">{message}</p>}
                {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
              </div>
            )}
          </div>
        </div>

        {/* Detailed Grid (Preserves exact existing user information) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 pt-6 border-t border-[#E5E9E4]">

          <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#E5E9E4] space-y-1">
            <span className="text-[11px] font-bold text-[#77847D] uppercase tracking-wider flex items-center gap-1.5">
              <Mail size={14} className="text-[#247653]" />
              Email
            </span>
            <p className="text-sm font-bold text-[#24332D] truncate">
              {currentUser?.email || 'N/A'}
            </p>
          </div>

          {department && <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#E5E9E4]">
            <span className="text-xs font-bold">Assigned Department</span>
            <p className="text-sm">{department}</p>
          </div>}


          {role !== 'student' && (
            <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#E5E9E4] space-y-1">
              <span className="text-[11px] font-bold text-[#77847D] uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-[#247653]" />
                System Privileges
              </span>
              <p className="text-sm font-bold text-[#153F35]">
                {role === 'super_admin' ? 'University-Wide Central Access' : 'Departmental Queue Triage'}
              </p>
            </div>
          )}
        </div>

        {/* Complaints Activity Summary */}
        <div className="mt-6 p-4 rounded-2xl bg-[#F5F2E9] border border-[#E5E9E4] flex items-center justify-around text-center">
          <div>
            <p className="text-2xl font-extrabold text-[#153F35]">{total}</p>
            <p className="text-xs font-semibold text-[#77847D]">
              {role === 'student' ? 'Lodged Grievances' : 'Processed Complaints'}
            </p>
          </div>
          <div className="h-8 w-px bg-[#E5E9E4]" />
          <div>
            <p className="text-2xl font-extrabold text-[#16834A]">{resolved}</p>
            <p className="text-xs font-semibold text-[#77847D]">Resolved Issues</p>
          </div>
          <div className="h-8 w-px bg-[#E5E9E4]" />
          <div>
            <p className="text-2xl font-extrabold text-[#F18B38]">
              {total > 0 ? `${Math.round((resolved / total) * 100)}%` : '0%'}
            </p>
            <p className="text-xs font-semibold text-[#77847D]">Resolution Rate</p>
          </div>
        </div>
      </div>

      {role === 'student' && (
        <section className="space-y-4 rounded-3xl border border-[#E5E9E4] bg-white p-6 shadow-xs">
          {passwordOpen ? (
            <PasswordForm onCancel={() => setPasswordOpen(false)} onSaved={() => { setPasswordOpen(false); setPasswordSaved(true); }} />
          ) : (
            <button type="button" className="rounded-xl bg-[#247653] px-4 py-2 text-xs font-bold text-white"
              onClick={() => { setPasswordSaved(false); setPasswordOpen(true); }}>Change Password</button>
          )}
          {passwordSaved && <p role="status" className="text-sm text-[#166534]">Password changed successfully.</p>}
        </section>
      )}
    </div>
  );
}
