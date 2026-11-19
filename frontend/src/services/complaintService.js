import { api } from './api';

const path = '/api/complaints';
export const MAX_IMAGE_BYTES = 1499900;
export const STATUS_LABELS = {
  pending: 'Pending', in_progress: 'In Progress', resolved: 'Resolved', rejected: 'Rejected',
};
const statusValue = (label) => label.toLowerCase().replaceAll(' ', '_');

function normalize(complaint) {
  const responses = (complaint.responses || []).map((response) => ({
    ...response, adminName: response.admin_name, createdAt: response.created_at,
  }));
  return {
    ...complaint,
    id: String(complaint.id),
    status: STATUS_LABELS[complaint.status] || complaint.status,
    department: complaint.department_name,
    studentName: complaint.student_name,
    createdAt: complaint.created_at,
    updatedAt: complaint.updated_at,
    imageUrl: complaint.image_url,
    rejectionReason: complaint.reject_reason,
    responses,
    remarks: responses.at(-1)?.remark,
  };
}

function readImage(file) {
  if (file.size > MAX_IMAGE_BYTES) throw new Error('Choose an image smaller than 1.5 MB.');
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Could not read the attachment.'));
    reader.readAsDataURL(file);
  });
}

export const complaintService = {
  async getComplaints({ role, status, department_id, category, search } = {}) {
    if (role === 'student') return (await api.request(path + '/mine')).map(normalize);
    const query = new URLSearchParams();
    if (status && status !== 'all') query.set('status', statusValue(status));
    if (role === 'super_admin' && department_id && department_id !== 'all') query.set('department_id', department_id);
    if (category && category !== 'all') query.set('category', category);
    if (search?.trim()) query.set('search', search.trim());
    return (await api.request(path + (query.size ? '?' + query : ''))).map(normalize);
  },
  async getComplaintById(id) {
    return normalize(await api.request(path + '/' + encodeURIComponent(id)));
  },
  async createComplaint({ title, description, category, imageFile }) {
    const body = { title, description, category };
    if (imageFile) body.image_url = await readImage(imageFile);
    return normalize(await api.request(path, { method: 'POST', body }));
  },
  async updateComplaintStatus({ complaintId, status, remarks, rejectionReason }) {
    const remark = status === 'Rejected' ? rejectionReason?.trim() : remarks?.trim();
    if (status === 'Rejected' && !remark) throw new Error('A rejection reason is required.');
    return normalize(await api.request(path + '/' + encodeURIComponent(complaintId) + '/status', {
      method: 'PATCH', body: { status: statusValue(status), ...(remark && { remark }) },
    }));
  },
  submitFeedback(id, body) {
    return api.request(path + '/' + encodeURIComponent(id) + '/feedback', { method: 'POST', body });
  },
  respond(id, remark) {
    return api.request(path + '/' + encodeURIComponent(id) + '/respond', {
      method: 'POST', body: { remark },
    });
  },
};
