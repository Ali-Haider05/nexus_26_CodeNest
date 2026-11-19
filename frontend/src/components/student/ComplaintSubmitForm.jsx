import React, { useState, useRef } from 'react';
import { MAX_IMAGE_BYTES } from '../../services/complaintService';
import { CATEGORY_CONFIG, getDepartmentForCategory } from '../../constants/theme';
import {
  Send,
  Upload,
  AlertCircle,
  CheckCircle2,
  UtensilsCrossed,
  BookOpen,
  Cpu,
  GraduationCap,
  Sparkles,
  Image as ImageIcon,
  X,
  Building,
  RefreshCw,
  Paperclip,
} from 'lucide-react';

const categoryIcons = {
  Cafeteria: UtensilsCrossed,
  Library: BookOpen,
  'Laboratories & IT Facilities': Cpu,
  'Teaching & Academic Affairs': GraduationCap,
};

export default function ComplaintSubmitForm({ onSubmitSuccess, onCancel, currentUser }) {
  const fileInputRef = useRef(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Laboratories & IT Facilities');

  // Original image file upload state
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submittedId, setSubmittedId] = useState('');

  const selectedCategoryConfig = CATEGORY_CONFIG[category];
  const assignedDepartment = getDepartmentForCategory(category);

  // Handle device file selection
  const handleFileSelect = (file) => {
    setError('');
    if (!file) return;

    // Validate image format
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Unsupported file type. Please attach a PNG, JPG, or WebP photograph.');
      return;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      setError('Photograph size exceeds 1.5 MB. Please select a smaller image file.');
      return;
    }

    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(file);
    const preview = URL.createObjectURL(file);
    setImagePreview(preview);
  };

  const handleRemoveImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Please provide a complaint title.');
      return;
    }
    if (!description.trim()) {
      setError('Please enter your complaint description.');
      return;
    }

    setSubmitting(true);
    try {
      // PRESERVE STUDENT'S ORIGINAL TEXT:
      // Exact title and exact description without AI transformation or expansion.
      const result = await onSubmitSuccess({
        title: title.trim(),
        description: description, // EXACT STUDENT TEXT PRESERVED
        category,
        imageFile: imageFile || null, // ORIGINAL PHOTOGRAPH
      });

      setSuccess(true);
      setSubmittedId(result?.id || 'CMP-RECORDED');
      setTitle('');
      setDescription('');
      handleRemoveImage();
    } catch (err) {
      setError(err.message || 'Failed to submit complaint. Please verify your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-[#E5E9E4] text-center shadow-xs animate-fade-in max-w-xl mx-auto my-6">
        <div className="w-16 h-16 rounded-2xl bg-[#ECFDF5] text-[#16834A] flex items-center justify-center mx-auto mb-4 border border-[#A7F3D0]">
          <CheckCircle2 size={36} />
        </div>
        <h3 className="text-xl font-bold text-[#24332D] mb-2">
          Complaint Successfully Submitted!
        </h3>
        <p className="text-sm text-[#77847D] mb-4 leading-relaxed">
          Your complaint has been automatically routed to{' '}
          <span className="font-bold text-[#153F35]">{assignedDepartment}</span>.
        </p>
        <div className="bg-[#FAF9F5] border border-[#E5E9E4] rounded-2xl p-4 mb-6 text-xs text-[#24332D]">
          <p className="font-semibold text-[#77847D]">Reference ID:</p>
          <p className="font-mono text-base font-bold text-[#153F35] mt-0.5">{submittedId}</p>
        </div>
        <button
          onClick={() => setSuccess(false)}
          className="px-6 py-2.5 rounded-xl bg-[#247653] hover:bg-[#194D40] text-white text-xs font-bold shadow-xs transition-colors"
        >
          Submit Another Grievance
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#153F35] to-[#247653] text-white rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold backdrop-blur-xs">
            <Sparkles size={13} className="text-[#F18B38]" />
            Official Student Complaint Portal
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Lodge a Campus Complaint
          </h2>
          <p className="text-xs sm:text-sm text-[#D0DCD6] max-w-2xl leading-relaxed">
            Select the category below. Your complaint and any original photographs will be submitted directly to the responsible university department.
          </p>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-[#E5E9E4] p-6 sm:p-8 shadow-xs space-y-6">
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2 animate-fade-in">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 1. Category Selection */}
        <div>
          <label className="block text-xs font-bold text-[#77847D] uppercase tracking-wider mb-2">
            1. Select Complaint Category *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {Object.keys(CATEGORY_CONFIG).map((catKey) => {
              const cfg = CATEGORY_CONFIG[catKey];
              const IconComp = categoryIcons[catKey] || Cpu;
              const isSelected = category === catKey;

              return (
                <button
                  key={catKey}
                  type="button"
                  aria-label={cfg.name}
                  aria-pressed={isSelected}
                  onClick={() => setCategory(catKey)}
                  className={`p-4 rounded-2xl border-2 cursor-pointer text-left transition-all ${
                    isSelected
                      ? 'border-[#247653] bg-[#ECFDF5]/50 ring-2 ring-[#247653]/15 shadow-xs'
                      : 'border-[#E5E9E4] bg-white hover:border-[#CCD5CE] hover:bg-[#FAF9F5]'
                  }`}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center mb-2.5 transition-transform"
                    style={{ backgroundColor: cfg.bg }}
                  >
                    <IconComp size={18} style={{ color: cfg.color }} />
                  </div>
                  <h4 className="text-xs font-bold text-[#24332D] leading-tight mb-1">
                    {cfg.name}
                  </h4>
                  <p className="text-[11px] text-[#77847D] line-clamp-2 leading-snug">
                    {cfg.description}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Automatic Routing Notice Banner */}
          <div className="mt-3 p-3.5 rounded-2xl bg-[#F5F2E9] border border-[#E5E9E4] flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-[#24332D]">
              <Building size={16} className="text-[#247653] shrink-0" />
              <span>
                Automatic Department Routing:{' '}
                <strong className="text-[#153F35]">{assignedDepartment}</strong>
              </span>
            </div>
            <span className="text-[11px] text-[#77847D] hidden sm:inline">
              Backend Automated Routing
            </span>
          </div>
        </div>

        {/* Complaint title */}
        <div className="grid gap-4">
          <div >
            <label className="block text-xs font-bold text-[#77847D] uppercase tracking-wider mb-1.5">
              2. Complaint Title / Subject *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. My classroom fan is not working or Broken chair in Library"
              className="w-full text-xs font-semibold p-3.5 rounded-xl border border-[#E5E9E4] focus:outline-none focus:ring-2 focus:ring-[#247653]/20 focus:border-[#247653] bg-white text-[#24332D]"
            />
          </div>

        </div>

        {/* 3. Original Description (Preserved verbatim) */}
        <div>
          <label className="block text-xs font-bold text-[#77847D] uppercase tracking-wider mb-1.5">
            3. Detailed Description (Original Student Text) *
          </label>
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Write your exact complaint here. Your text is submitted directly without alteration or embellishment..."
            className="w-full text-xs p-3.5 rounded-xl border border-[#E5E9E4] focus:outline-none focus:ring-2 focus:ring-[#247653]/20 focus:border-[#247653] bg-white text-[#24332D] leading-relaxed"
          />
          <p className="text-[11px] text-[#77847D] mt-1">
            Note: Your complaint description will be submitted exactly as entered above.
          </p>
        </div>

        {/* 4. Original Image Attachment from Device */}
        <div>
          <label className="block text-xs font-bold text-[#77847D] uppercase tracking-wider mb-1.5">
            4. Supporting Photograph / Evidence Attachment (Optional)
          </label>

          {/* Hidden native file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => handleFileSelect(e.target.files?.[0])}
            accept="image/png, image/jpeg, image/jpg, image/webp"
            className="hidden"
          />

          {!imageFile ? (
            /* Upload dropzone */
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-[#247653] bg-[#ECFDF5]'
                  : 'border-[#E5E9E4] hover:border-[#247653] hover:bg-[#FAF9F5]'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-[#F5F2E9] text-[#247653] flex items-center justify-center mx-auto mb-3">
                <Upload size={22} />
              </div>
              <p className="text-xs font-bold text-[#24332D]">
                Click to browse or drag & drop a photo from your device
              </p>
              <p className="text-[11px] text-[#77847D] mt-1">
                Supports PNG, JPG, or WebP (up to 1.5 MB)
              </p>
            </div>
          ) : (
            /* Selected File Preview Box */
            <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#E5E9E4] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
                <div className="w-16 h-16 rounded-xl overflow-hidden border border-[#E5E9E4] bg-white shrink-0 shadow-2xs">
                  <img
                    src={imagePreview}
                    alt="Selected photograph"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-[#24332D] truncate">
                    {imageFile.name}
                  </p>
                  <p className="text-[11px] text-[#77847D]">
                    {(imageFile.size / 1024).toFixed(1)} KB • Original Device Photograph
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg border border-[#E5E9E4] bg-white hover:bg-[#F5F2E9] text-xs font-semibold text-[#24332D] transition-colors"
                >
                  Replace
                </button>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-xs font-semibold text-red-700 transition-colors flex items-center gap-1"
                >
                  <X size={13} />
                  Remove
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Verification Info */}
        <div className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#E5E9E4] text-xs text-[#77847D] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span>
            Authenticated Student:{' '}
            <strong className="text-[#24332D]">{currentUser?.name || 'Student'}</strong>{' '}
            {currentUser?.studentId ? `(${currentUser.studentId})` : ''}
          </span>
          <span className="font-semibold text-[#247653] flex items-center gap-1">
            <CheckCircle2 size={13} />
            Verified University Submission
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E5E9E4]">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-[#77847D] hover:bg-[#E5E9E4] transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#247653] hover:bg-[#194D40] text-xs font-bold text-white shadow-xs transition-colors"
          >
            {submitting ? (
              <span className="inline-flex items-center gap-2">
                <RefreshCw size={14} className="animate-spin" /> Submitting Original Complaint...
              </span>
            ) : (
              <>
                <Send size={15} />
                Submit Complaint to {assignedDepartment.split(' ')[0]}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
