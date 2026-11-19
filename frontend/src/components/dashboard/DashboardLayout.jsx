import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { complaintService } from '../../services/complaintService';
import Navbar from '../layout/Navbar';
import Sidebar from '../layout/Sidebar';
import ComplaintDetailsModal from '../modals/ComplaintDetailsModal';
import UpdateStatusModal from '../modals/UpdateStatusModal';
import FeedbackModal from '../modals/FeedbackModal';

// Student Views
import StudentOverview from '../student/StudentOverview';
import ComplaintSubmitForm from '../student/ComplaintSubmitForm';
import MyComplaintsView from '../student/MyComplaintsView';
import ComplaintTrackingView from '../student/ComplaintTrackingView';
import FeedbackResponsesView from '../student/FeedbackResponsesView';
import StudentProfileView from '../student/StudentProfileView';

// Department Admin Views
import DepartmentOverview from '../admin/DepartmentOverview';
import AssignedComplaintsView from '../admin/AssignedComplaintsView';

// Super Admin Views
import SuperAdminOverview from '../superadmin/SuperAdminOverview';
import AllComplaintsView from '../superadmin/AllComplaintsView';
import DepartmentsDirectoryView from '../superadmin/DepartmentsDirectoryView';
import AnalyticsReportsView from '../superadmin/AnalyticsReportsView';
import ComplaintTrendsView from '../superadmin/ComplaintTrendsView';

import LoadingSkeleton from '../common/LoadingSkeleton';
import { CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export default function DashboardLayout() {
  const { currentUser, role } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Complaints state
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  // Active Modals state
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [updateStatusComplaint, setUpdateStatusComplaint] = useState(null);
  const [isUpdateStatusOpen, setIsUpdateStatusOpen] = useState(false);
  const [feedbackComplaint, setFeedbackComplaint] = useState(null);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  // Toast notification state
  const [toast, setToast] = useState(null);

  // Reset to overview and fetch complaints when role or identity changes
  useEffect(() => {
    setActiveTab('overview');
    loadComplaints();
  }, [role, currentUser?.id, currentUser?.department]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadComplaints = async () => {
    setLoading(true);
    setFetchError('');
    try {
      const data = await complaintService.getComplaints({
        role,
        department: currentUser?.department,
        studentId: currentUser?.id,
      });
      setComplaints(data || []);
    } catch (err) {
      console.error('Failed to load complaints from backend:', err);
      setFetchError(err.message || 'Unable to connect to backend complaint API.');
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  // Complaint Submission Handler
  const handleComplaintSubmit = async (formData) => {
    const created = await complaintService.createComplaint(formData, currentUser);
    await loadComplaints();
    showToast(`Complaint ${created.id || 'record'} submitted successfully!`);
    return created;
  };

  // Status Update Handler
  const handleStatusUpdate = async (updateData) => {
    const updated = await complaintService.updateComplaintStatus(updateData, currentUser);
    await loadComplaints();
    showToast(`Complaint status updated to ${updated.status || updateData.status}.`);
    if (selectedComplaint && selectedComplaint.id === updated.id) {
      setSelectedComplaint(updated);
    }
    return updated;
  };

  // Student Feedback Handler
  const handleFeedbackSubmit = async (feedbackData) => {
    const updated = await complaintService.submitFeedback(feedbackData, currentUser);
    await loadComplaints();
    showToast('Thank you! Your feedback has been recorded.');
    if (selectedComplaint && selectedComplaint.id === updated.id) {
      setSelectedComplaint(updated);
    }
    return updated;
  };

  // Filter department handler from Directory
  const handleFilterDepartmentFromDirectory = (deptName) => {
    setActiveTab('all-complaints');
  };

  return (
    <div className="min-h-screen bg-[#F5F2E9] flex">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-down">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-2.5 text-xs font-bold text-white ${
              toast.type === 'error'
                ? 'bg-[#DC4545] border-red-400'
                : 'bg-[#153F35] border-[#247653]'
            }`}
          >
            {toast.type === 'error' ? (
              <AlertCircle size={16} className="text-red-200" />
            ) : (
              <CheckCircle2 size={16} className="text-[#A7F3D0]" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Navbar */}
        <Navbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onSelectComplaint={(c) => {
            setSelectedComplaint(c);
            setIsDetailsOpen(true);
          }}
        />

        {/* Page Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {fetchError && (
            <div className="p-4 mb-6 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold flex items-center justify-between gap-3 animate-fade-in">
              <div className="flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0 text-amber-600" />
                <span>Backend Notice: {fetchError}</span>
              </div>
              <button
                type="button"
                onClick={loadComplaints}
                className="px-3 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold flex items-center gap-1 transition-colors shrink-0"
              >
                <RefreshCw size={12} /> Retry
              </button>
            </div>
          )}

          {loading ? (
            <div className="space-y-6">
              <LoadingSkeleton count={4} type="card" />
              <LoadingSkeleton count={5} type="table" />
            </div>
          ) : (
            <>
              {/* STUDENT VIEWS */}
              {role === 'student' && (
                <>
                  {activeTab === 'overview' && (
                    <StudentOverview
                      complaints={complaints}
                      currentUser={currentUser}
                      onNavigate={setActiveTab}
                      onSelectComplaint={(c) => {
                        setSelectedComplaint(c);
                        setIsDetailsOpen(true);
                      }}
                    />
                  )}
                  {activeTab === 'submit' && (
                    <ComplaintSubmitForm
                      currentUser={currentUser}
                      onSubmitSuccess={handleComplaintSubmit}
                      onCancel={() => setActiveTab('overview')}
                    />
                  )}
                  {activeTab === 'my-complaints' && (
                    <MyComplaintsView
                      complaints={complaints}
                      onSelectComplaint={(c) => {
                        setSelectedComplaint(c);
                        setIsDetailsOpen(true);
                      }}
                      onNavigateSubmit={() => setActiveTab('submit')}
                    />
                  )}
                  {activeTab === 'tracking' && (
                    <ComplaintTrackingView
                      complaints={complaints}
                      onSelectComplaint={(c) => {
                        setSelectedComplaint(c);
                        setIsDetailsOpen(true);
                      }}
                      onOpenFeedback={(c) => {
                        setFeedbackComplaint(c);
                        setIsFeedbackOpen(true);
                      }}
                    />
                  )}
                  {activeTab === 'feedback' && (
                    <FeedbackResponsesView
                      complaints={complaints}
                      onSelectComplaint={(c) => {
                        setSelectedComplaint(c);
                        setIsDetailsOpen(true);
                      }}
                      onOpenFeedback={(c) => {
                        setFeedbackComplaint(c);
                        setIsFeedbackOpen(true);
                      }}
                    />
                  )}
                  {activeTab === 'profile' && (
                    <StudentProfileView complaints={complaints} />
                  )}
                </>
              )}

              {/* DEPARTMENTAL ADMIN VIEWS */}
              {role === 'dept_admin' && (
                <>
                  {activeTab === 'overview' && (
                    <DepartmentOverview
                      complaints={complaints}
                      currentUser={currentUser}
                      onNavigate={setActiveTab}
                      onSelectComplaint={(c) => {
                        setSelectedComplaint(c);
                        setIsDetailsOpen(true);
                      }}
                      onOpenUpdateStatus={(c) => {
                        setUpdateStatusComplaint(c);
                        setIsUpdateStatusOpen(true);
                      }}
                    />
                  )}
                  {activeTab === 'assigned' && (
                    <AssignedComplaintsView
                      complaints={complaints}
                      defaultStatus="all"
                      departmentName={currentUser?.department}
                      onSelectComplaint={(c) => {
                        setSelectedComplaint(c);
                        setIsDetailsOpen(true);
                      }}
                      onOpenUpdateStatus={(c) => {
                        setUpdateStatusComplaint(c);
                        setIsUpdateStatusOpen(true);
                      }}
                    />
                  )}
                  {activeTab === 'pending' && (
                    <AssignedComplaintsView
                      complaints={complaints}
                      defaultStatus="Pending"
                      departmentName={currentUser?.department}
                      onSelectComplaint={(c) => {
                        setSelectedComplaint(c);
                        setIsDetailsOpen(true);
                      }}
                      onOpenUpdateStatus={(c) => {
                        setUpdateStatusComplaint(c);
                        setIsUpdateStatusOpen(true);
                      }}
                    />
                  )}
                  {activeTab === 'in-progress' && (
                    <AssignedComplaintsView
                      complaints={complaints}
                      defaultStatus="In Progress"
                      departmentName={currentUser?.department}
                      onSelectComplaint={(c) => {
                        setSelectedComplaint(c);
                        setIsDetailsOpen(true);
                      }}
                      onOpenUpdateStatus={(c) => {
                        setUpdateStatusComplaint(c);
                        setIsUpdateStatusOpen(true);
                      }}
                    />
                  )}
                  {activeTab === 'resolved' && (
                    <AssignedComplaintsView
                      complaints={complaints}
                      defaultStatus="Resolved"
                      departmentName={currentUser?.department}
                      onSelectComplaint={(c) => {
                        setSelectedComplaint(c);
                        setIsDetailsOpen(true);
                      }}
                      onOpenUpdateStatus={(c) => {
                        setUpdateStatusComplaint(c);
                        setIsUpdateStatusOpen(true);
                      }}
                    />
                  )}
                  {activeTab === 'rejected' && (
                    <AssignedComplaintsView
                      complaints={complaints}
                      defaultStatus="Rejected"
                      departmentName={currentUser?.department}
                      onSelectComplaint={(c) => {
                        setSelectedComplaint(c);
                        setIsDetailsOpen(true);
                      }}
                      onOpenUpdateStatus={(c) => {
                        setUpdateStatusComplaint(c);
                        setIsUpdateStatusOpen(true);
                      }}
                    />
                  )}
                  {activeTab === 'profile' && (
                    <StudentProfileView complaints={complaints} />
                  )}
                </>
              )}

              {/* SUPER ADMIN VIEWS */}
              {role === 'super_admin' && (
                <>
                  {activeTab === 'overview' && (
                    <SuperAdminOverview
                      complaints={complaints}
                      onNavigate={setActiveTab}
                      onSelectComplaint={(c) => {
                        setSelectedComplaint(c);
                        setIsDetailsOpen(true);
                      }}
                      onRefresh={loadComplaints}
                    />
                  )}
                  {activeTab === 'all-complaints' && (
                    <AllComplaintsView
                      complaints={complaints}
                      onSelectComplaint={(c) => {
                        setSelectedComplaint(c);
                        setIsDetailsOpen(true);
                      }}
                      onOpenUpdateStatus={(c) => {
                        setUpdateStatusComplaint(c);
                        setIsUpdateStatusOpen(true);
                      }}
                    />
                  )}
                  {activeTab === 'departments' && (
                    <DepartmentsDirectoryView
                      complaints={complaints}
                      onFilterDepartment={handleFilterDepartmentFromDirectory}
                    />
                  )}
                  {activeTab === 'analytics' && (
                    <AnalyticsReportsView complaints={complaints} />
                  )}
                  {activeTab === 'trends' && (
                    <ComplaintTrendsView complaints={complaints} />
                  )}
                  {activeTab === 'profile' && (
                    <StudentProfileView complaints={complaints} />
                  )}
                </>
              )}
            </>
          )}
        </main>
      </div>

      {/* Modals */}
      <ComplaintDetailsModal
        complaint={selectedComplaint}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        currentUser={currentUser}
        onOpenFeedback={(c) => {
          setFeedbackComplaint(c);
          setIsFeedbackOpen(true);
        }}
        onOpenUpdateStatus={(c) => {
          setUpdateStatusComplaint(c);
          setIsUpdateStatusOpen(true);
        }}
      />

      <UpdateStatusModal
        complaint={updateStatusComplaint}
        isOpen={isUpdateStatusOpen}
        onClose={() => setIsUpdateStatusOpen(false)}
        onSubmit={handleStatusUpdate}
      />

      <FeedbackModal
        complaint={feedbackComplaint}
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        onSubmit={handleFeedbackSubmit}
      />
    </div>
  );
}
