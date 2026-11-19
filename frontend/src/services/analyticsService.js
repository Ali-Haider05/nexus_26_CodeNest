// Analytics & Reporting Service
// Computes real metrics, department comparisons, and distribution charts from actual API data
// No hardcoded sample counts or fabricated trend records

import { DEPARTMENTS, CATEGORY_CONFIG } from '../constants/theme';

export const analyticsService = {
  // Compute overall or departmental stats strictly from actual complaints list
  getStats(complaints = [], department = null) {
    let list = Array.isArray(complaints) ? complaints : [];
    if (department && department !== 'all') {
      list = list.filter(
        (c) => c.department && c.department.toLowerCase() === department.toLowerCase()
      );
    }

    const total = list.length;
    const pending = list.filter((c) => c.status === 'Pending').length;
    const underReview = list.filter((c) => c.status === 'Under Review').length;
    const inProgress = list.filter((c) => c.status === 'In Progress').length;
    const resolved = list.filter((c) => c.status === 'Resolved').length;
    const rejected = list.filter((c) => c.status === 'Rejected').length;

    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

    // Real satisfaction ratings
    const rated = list.filter((c) => c.feedback && c.feedback.rating);
    const avgRating =
      rated.length > 0
        ? (rated.reduce((sum, c) => sum + Number(c.feedback.rating), 0) / rated.length).toFixed(1)
        : null;

    return {
      total,
      pending,
      underReview,
      inProgress,
      resolved,
      rejected,
      resolutionRate,
      avgRating,
      ratedCount: rated.length,
    };
  },

  // Required Bar Chart Data: Comparison of complaints received by different departments
  getDepartmentComparisonData(complaints = []) {
    const list = Array.isArray(complaints) ? complaints : [];

    return DEPARTMENTS.map((deptName) => {
      const deptComplaints = list.filter(
        (c) => c.department && c.department.toLowerCase() === deptName.toLowerCase()
      );
      const total = deptComplaints.length;
      const resolved = deptComplaints.filter((c) => c.status === 'Resolved').length;
      const pending = deptComplaints.filter((c) => c.status === 'Pending').length;
      const inProgress = deptComplaints.filter(
        (c) => c.status === 'In Progress' || c.status === 'Under Review'
      ).length;
      const rejected = deptComplaints.filter((c) => c.status === 'Rejected').length;

      let shortName = deptName;
      if (deptName.includes('Cafeteria')) shortName = 'Cafeteria';
      else if (deptName.includes('Library')) shortName = 'Library';
      else if (deptName.includes('Laboratory')) shortName = 'Labs & IT';
      else if (deptName.includes('Teaching')) shortName = 'Academics';

      return {
        department: deptName,
        shortName,
        total,
        resolved,
        pending,
        inProgress,
        rejected,
        fillColor:
          deptName.includes('Cafeteria')
            ? '#EA873B'
            : deptName.includes('Library')
            ? '#8662B8'
            : deptName.includes('Laboratory')
            ? '#397CC5'
            : '#248B83',
      };
    });
  },

  // Real Status Distribution for Donut / Pie Chart
  getStatusDistribution(complaints = [], department = null) {
    let list = Array.isArray(complaints) ? complaints : [];
    if (department && department !== 'all') {
      list = list.filter(
        (c) => c.department && c.department.toLowerCase() === department.toLowerCase()
      );
    }

    const statuses = [
      { name: 'Pending', count: 0, color: '#D97706' },
      { name: 'Under Review', count: 0, color: '#7C5CC4' },
      { name: 'In Progress', count: 0, color: '#2563EB' },
      { name: 'Resolved', count: 0, color: '#16834A' },
      { name: 'Rejected', count: 0, color: '#DC4545' },
    ];

    list.forEach((c) => {
      const target = statuses.find(
        (s) => c.status && s.name.toLowerCase() === c.status.toLowerCase()
      );
      if (target) target.count += 1;
    });

    return statuses;
  },

  // Real Category Distribution
  getCategoryDistribution(complaints = []) {
    const list = Array.isArray(complaints) ? complaints : [];
    return Object.keys(CATEGORY_CONFIG).map((catKey) => {
      const cfg = CATEGORY_CONFIG[catKey];
      const count = list.filter((c) => c.category === catKey).length;
      return {
        name: catKey,
        count,
        color: cfg.color,
      };
    });
  },

  // Dynamic trend computation from actual submission timestamps in complaints
  getTrends(complaints = []) {
    const list = Array.isArray(complaints) ? complaints : [];
    if (list.length === 0) return [];

    const monthMap = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    list.forEach((c) => {
      const date = c.createdAt || c.created_at;
      if (!date) return;
      const d = new Date(date);
      if (isNaN(d.getTime())) return;
      const key = `${months[d.getMonth()]} ${d.getFullYear()}`;
      if (!monthMap[key]) {
        monthMap[key] = { month: key, total: 0, resolved: 0, timestamp: d.getTime() };
      }
      monthMap[key].total += 1;
      if (c.status === 'Resolved') {
        monthMap[key].resolved += 1;
      }
    });

    return Object.values(monthMap).sort((a, b) => a.timestamp - b.timestamp);
  },
};
