import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import {
  User,
  Mail,
  GraduationCap,
  Building,
  ShieldCheck,
  Calendar,
  Award,
  Camera,
  Upload,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

export default function StudentProfileView({ complaints = [] }) {
  const { currentUser, role, updateUser } = useAuth();
  const fileInputRef = useRef(null);

  // Profile picture upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');

  const total = complaints.length;
  const resolved = complaints.filter((c) => c.status === 'Resolved').length;

  const roleTitle =
    role === 'student'
      ? 'Verified University Student'
      : role === 'super_admin'
      ? 'Executive Super Administrator'
      : `${currentUser?.department || 'Departmental'} Administrator`;

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError('');
    setUploadSuccess('');

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Invalid file format. Please select a PNG, JPG, or WebP image.');
      return;
    }

    // Validate size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadError('Image size exceeds 5MB. Please choose a smaller photograph.');
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setIsModalOpen(true);
  };

  const handleCancelPreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsModalOpen(false);
    setUploadError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSaveProfilePicture = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadError('');

    try {
      // Calls backend-supported multipart upload API
      const updatedUser = await authService.updateProfilePicture(selectedFile);
      updateUser(updatedUser);
      setUploadSuccess('Profile picture updated successfully!');
      handleCancelPreview();
      setTimeout(() => setUploadSuccess(''), 4000);
    } catch (err) {
      setUploadError(err.message || 'Failed to upload profile picture to backend server.');
    } finally {
      setUploading(false);
    }
  };

  const currentAvatarUrl = currentUser?.avatar || currentUser?.profilePicture;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/jpg, image/webp"
        className="hidden"
      />

      {/* Upload Feedback Banners */}
      {uploadSuccess && (
        <div className="p-4 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] text-[#166534] text-xs font-bold flex items-center gap-2 animate-fade-in shadow-xs">
          <CheckCircle2 size={16} className="text-[#16834A]" />
          <span>{uploadSuccess}</span>
        </div>
      )}

      {uploadError && !isModalOpen && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <AlertCircle size={16} className="shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Profile Header */}
      <div className="bg-white rounded-3xl border border-[#E5E9E4] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          {/* Avatar with Animated Hover Overlay */}
          <div className="relative group shrink-0">
            <div className="w-28 h-28 rounded-3xl bg-[#247653] text-white flex items-center justify-center font-bold text-3xl shadow-md border-4 border-white overflow-hidden">
              {currentAvatarUrl ? (
                <img
                  src={currentAvatarUrl}
                  alt={currentUser?.name || 'Profile'}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                currentUser?.name?.charAt(0) || 'U'
              )}
            </div>

            {/* Hover Overlay Button */}
            <button
              type="button"
              onClick={handleAvatarClick}
              className="absolute inset-0 rounded-3xl bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-200 flex flex-col items-center justify-center text-white p-2 cursor-pointer backdrop-blur-[2px]"
              title="Click to select a new photograph"
            >
              <Camera size={22} className="mb-1 text-[#F18B38] animate-bounce" />
              <span className="text-[10px] font-bold text-center leading-tight">
                Change Photo
              </span>
            </button>
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
            <p className="text-[11px] text-[#247653] font-semibold pt-0.5">
              Hover over your photograph to upload a new profile picture
            </p>
          </div>
        </div>

        {/* Detailed Grid (Preserves exact existing user information) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 pt-6 border-t border-[#E5E9E4]">
          {role === 'student' && (
            <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#E5E9E4] space-y-1">
              <span className="text-[11px] font-bold text-[#77847D] uppercase tracking-wider flex items-center gap-1.5">
                <Award size={14} className="text-[#247653]" />
                Student Registration / Roll No
              </span>
              <p className="text-sm font-bold text-[#153F35] font-mono">
                {currentUser?.studentId || 'N/A'}
              </p>
            </div>
          )}

          <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#E5E9E4] space-y-1">
            <span className="text-[11px] font-bold text-[#77847D] uppercase tracking-wider flex items-center gap-1.5">
              <Mail size={14} className="text-[#247653]" />
              Institutional Email
            </span>
            <p className="text-sm font-bold text-[#24332D] truncate">
              {currentUser?.email || 'N/A'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#E5E9E4] space-y-1">
            <span className="text-[11px] font-bold text-[#77847D] uppercase tracking-wider flex items-center gap-1.5">
              <Building size={14} className="text-[#247653]" />
              {role === 'dept_admin' ? 'Assigned Department' : 'Academic Department'}
            </span>
            <p className="text-sm font-bold text-[#24332D]">
              {currentUser?.department || (role === 'super_admin' ? 'Central Administration' : 'General')}
            </p>
          </div>

          {role === 'student' && (
            <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#E5E9E4] space-y-1">
              <span className="text-[11px] font-bold text-[#77847D] uppercase tracking-wider flex items-center gap-1.5">
                <GraduationCap size={14} className="text-[#247653]" />
                Current Semester
              </span>
              <p className="text-sm font-bold text-[#24332D]">
                {currentUser?.semester || 'Active Semester'}
              </p>
            </div>
          )}

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

      {/* Image Preview & Save Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div
            className="bg-white rounded-3xl border border-[#E5E9E4] shadow-2xl w-full max-w-md overflow-hidden animate-slide-down"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4.5 border-b border-[#E5E9E4] bg-[#FAF9F5] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#247653]/10 text-[#247653] flex items-center justify-center">
                  <Camera size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#24332D]">Update Profile Picture</h3>
                  <p className="text-[11px] text-[#77847D]">Preview image before saving to backend</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCancelPreview}
                className="w-7 h-7 rounded-full hover:bg-[#E5E9E4] text-[#77847D] flex items-center justify-center transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {uploadError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* Circular Preview Container */}
              <div className="flex flex-col items-center justify-center py-2">
                <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-[#247653] shadow-md bg-gray-100 flex items-center justify-center">
                  {previewUrl && (
                    <img
                      src={previewUrl}
                      alt="Selected preview"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <p className="text-xs font-semibold text-[#24332D] mt-3">
                  {selectedFile?.name}
                </p>
                <p className="text-[11px] text-[#77847D]">
                  {(selectedFile?.size / 1024).toFixed(1)} KB • {selectedFile?.type}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#E5E9E4] text-[11px] text-[#77847D] text-center">
                This image will be uploaded directly through the backend user profile API.
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-[#E5E9E4] bg-[#FAF9F5] flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={handleCancelPreview}
                disabled={uploading}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#77847D] hover:bg-[#E5E9E4] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveProfilePicture}
                disabled={uploading}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#247653] hover:bg-[#194D40] text-xs font-bold text-white shadow-xs transition-colors"
              >
                {uploading ? (
                  <>
                    <RefreshCw size={13} className="animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={13} />
                    Save Profile Picture
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
