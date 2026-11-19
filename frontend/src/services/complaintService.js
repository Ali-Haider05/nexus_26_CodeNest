// Complaint Service
// Manages real HTTP communication with backend complaint endpoints
// Preserves exact student text without modification and supports original image uploads

import { api } from './api';
import { getDepartmentForCategory } from '../constants/theme';

export const complaintService = {
  // Fetch real complaints from backend API
  async getComplaints(filterParams = {}) {
    const { role, department, studentId, status, category, search, priority } = filterParams;

    const query = new URLSearchParams();
    if (status && status !== 'all') query.append('status', status);
    if (category && category !== 'all') query.append('category', category);
    if (department && department !== 'all') query.append('department', department);
    if (priority && priority !== 'all') query.append('priority', priority);
    if (search && search.trim()) query.append('search', search.trim());
    if (role === 'student' && studentId) query.append('studentId', studentId);

    const queryString = query.toString();
    const endpoint = queryString ? `/api/complaints?${queryString}` : '/api/complaints';

    const response = await api.request(endpoint);

    let list = [];
    if (Array.isArray(response)) {
      list = response;
    } else if (response && Array.isArray(response.complaints)) {
      list = response.complaints;
    } else if (response && Array.isArray(response.data)) {
      list = response.data;
    }

    // Role-based scoping safeguard (enforcing university rules)
    if (role === 'student' && studentId) {
      list = list.filter((c) => String(c.studentId) === String(studentId));
    } else if (role === 'dept_admin' && department) {
      list = list.filter(
        (c) => c.department && c.department.toLowerCase() === department.toLowerCase()
      );
    }

    // Sort newest first by submission date
    return list.sort((a, b) => new Date(b.createdAt || b.created_at || 0) - new Date(a.createdAt || a.created_at || 0));
  },

  // Get single complaint details
  async getComplaintById(complaintId) {
    const response = await api.request(`/api/complaints/${complaintId}`);
    return response.complaint || response.data || response;
  },

  // Submit student complaint preserving EXACT description and original image attachment
  async createComplaint(complaintData, currentUser) {
    const { title, description, category, priority, imageFile } = complaintData;

    // Automatic Routing:
    // Cafeteria -> Cafeteria Administration
    // Library -> Library Administration
    // Laboratories & IT Facilities -> Laboratory / IT Administration
    // Teaching & Academic Affairs -> Teaching / Academic Administration
    const assignedDepartment = getDepartmentForCategory(category);

    // CRITICAL REQUIREMENT:
    // "Do not automatically rewrite, expand, summarize, embellish, or generate additional text for student complaints.
    // The complaint description must be exactly what the student enters."
    const exactTitle = title.trim();
    const exactDescription = description; // PRESERVED EXACTLY AS ENTERED BY STUDENT

    if (imageFile instanceof File) {
      // Send as multipart/form-data with original device photograph
      const formData = new FormData();
      formData.append('title', exactTitle);
      formData.append('description', exactDescription);
      formData.append('category', category);
      formData.append('department', assignedDepartment);
      formData.append('priority', priority || 'Medium');
      formData.append('image', imageFile);
      formData.append('attachment', imageFile);
      if (currentUser?.id) formData.append('studentId', currentUser.id);
      if (currentUser?.name) formData.append('studentName', currentUser.name);
      if (currentUser?.studentId) formData.append('studentRollNo', currentUser.studentId);

      const response = await api.upload('/api/complaints', formData);
      return response.complaint || response.data || response;
    } else {
      // Send as standard JSON payload
      const payload = {
        title: exactTitle,
        description: exactDescription,
        category,
        department: assignedDepartment,
        priority: priority || 'Medium',
        imageUrl: null,
        studentId: currentUser?.id,
        studentName: currentUser?.name,
        studentRollNo: currentUser?.studentId,
      };

      const response = await api.request('/api/complaints', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return response.complaint || response.data || response;
    }
  },

  // Update complaint status & remarks by authorized administrator
  async updateComplaintStatus(updateData, adminUser) {
    const { complaintId, status, remarks, rejectionReason } = updateData;

    const payload = {
      status,
      remarks: remarks?.trim() || null,
      rejectionReason: status === 'Rejected' ? rejectionReason?.trim() : null,
      adminId: adminUser?.id,
      adminName: adminUser?.name,
      department: adminUser?.department,
    };

    const response = await api.request(`/api/complaints/${complaintId}/status`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });

    return response.complaint || response.data || response;
  },

  // Submit student satisfaction feedback for resolved complaints
  async submitFeedback(feedbackData, studentUser) {
    const { complaintId, rating, comment } = feedbackData;

    const payload = {
      rating,
      comment: comment?.trim() || '',
      studentId: studentUser?.id,
    };

    const response = await api.request(`/api/complaints/${complaintId}/feedback`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return response.complaint || response.data || response;
  },

  // Fetch real-time notifications for the user
  async getNotifications(userId) {
    try {
      const response = await api.request(`/api/notifications?userId=${userId}`);
      if (Array.isArray(response)) return response;
      if (response && Array.isArray(response.notifications)) return response.notifications;
      return [];
    } catch {
      return [];
    }
  },

  async markNotificationRead(notifId) {
    try {
      await api.request(`/api/notifications/${notifId}/read`, { method: 'PATCH' });
    } catch {
      // ignore
    }
    return true;
  },

  async markAllNotificationsRead(userId) {
    try {
      await api.request(`/api/notifications/read-all`, {
        method: 'POST',
        body: JSON.stringify({ userId }),
      });
    } catch {
      // ignore
    }
    return true;
  },
};
