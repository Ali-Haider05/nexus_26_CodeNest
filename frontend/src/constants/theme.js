// CampusConnect Strict Design System & Constants
// Based on University Official Problem Statement & Design Guide

export const COLORS = {
  // Primary brand colours
  primaryBrand: '#153F35',      // Deep Forest Green
  secondaryGreen: '#247653',    // Emerald
  hoverActive: '#194D40',       // Dark Green
  mainBackground: '#F5F2E9',    // Warm Ivory
  cardBackground: '#FFFFFF',    // Pure White
  primaryAccent: '#F18B38',     // Vibrant Orange
  mainText: '#24332D',          // Charcoal
  secondaryText: '#77847D',      // Muted Grey
  borders: '#E5E9E4',           // Soft Grey
};

// Complaint Status Colours & Semantic Styles
export const STATUS_CONFIG = {
  Pending: {
    color: '#D97706',
    bg: '#FEF3C7',
    border: '#FDE68A',
    text: '#92400E',
    label: 'Pending',
    description: 'Waiting for departmental review',
  },
  'Under Review': {
    color: '#7C5CC4',
    bg: '#F3E8FF',
    border: '#E9D5FF',
    text: '#6B21A8',
    label: 'Under Review',
    description: 'Complaint is being assessed',
  },
  'In Progress': {
    color: '#2563EB',
    bg: '#EFF6FF',
    border: '#BFDBFE',
    text: '#1D4ED8',
    label: 'In Progress',
    description: 'Complaint is being investigated',
  },
  Resolved: {
    color: '#16834A',
    bg: '#ECFDF5',
    border: '#A7F3D0',
    text: '#166534',
    label: 'Resolved',
    description: 'Issue successfully resolved',
  },
  Rejected: {
    color: '#DC4545',
    bg: '#FEF2F2',
    border: '#FECACA',
    text: '#991B1B',
    label: 'Rejected',
    description: 'Complaint rejected',
  },
};

// Official 4 Categories and Backend Department Routing Mapping
export const CATEGORY_CONFIG = {
  Cafeteria: {
    id: 'Cafeteria',
    name: 'Cafeteria',
    color: '#EA873B',
    bg: '#FFF7ED',
    border: '#FFEDD5',
    text: '#9A3412',
    department: 'Cafeteria Administration',
    icon: 'UtensilsCrossed',
    description: 'Food quality, hygiene, pricing, staff service',
    examples: [
      'Poor food quality or hygiene',
      'High food prices',
      'Limited food variety',
      'Unprofessional staff behaviour or poor service'
    ]
  },
  Library: {
    id: 'Library',
    name: 'Library',
    color: '#8662B8',
    bg: '#FAF5FF',
    border: '#F3E8FF',
    text: '#581C87',
    department: 'Library Administration',
    icon: 'BookOpen',
    description: 'Books, study space, hours, librarian availability',
    examples: [
      'Insufficient or outdated books and learning resources',
      'Librarian availability or staff behaviour',
      'Library opening and closing hours',
      'Insufficient seating or study space'
    ]
  },
  'Laboratories & IT Facilities': {
    id: 'Laboratories & IT Facilities',
    name: 'Laboratories & IT Facilities',
    color: '#397CC5',
    bg: '#EFF6FF',
    border: '#DBEAFE',
    text: '#1E40AF',
    department: 'Laboratory / IT Administration',
    icon: 'Cpu',
    description: 'Computer labs, internet, projectors, software tools',
    examples: [
      'Non-functional computers',
      'Internet connectivity issues',
      'Projector or multimedia equipment problems',
      'Missing or unavailable software'
    ]
  },
  'Teaching & Academic Affairs': {
    id: 'Teaching & Academic Affairs',
    name: 'Teaching & Academic Affairs',
    color: '#248B83',
    bg: '#F0FDFA',
    border: '#CCFBF1',
    text: '#115E59',
    department: 'Teaching / Academic Administration',
    icon: 'GraduationCap',
    description: 'Lectures, course notes, teacher punctuality, classroom management',
    examples: [
      'Teachers arriving late to lectures',
      'Unavailability of lecture notes or learning materials',
      'Inadequate explanation of course topics',
      'Classroom management or discipline issues'
    ]
  }
};

export const DEPARTMENTS = [
  'Cafeteria Administration',
  'Library Administration',
  'Laboratory / IT Administration',
  'Teaching / Academic Administration'
];

export const PRIORITY_CONFIG = {
  Urgent: { label: 'Urgent', color: '#DC2626', bg: '#FEE2E2', text: '#991B1B' },
  High: { label: 'High', color: '#EA580C', bg: '#FFEDD5', text: '#9A3412' },
  Medium: { label: 'Medium', color: '#D97706', bg: '#FEF3C7', text: '#92400E' },
  Low: { label: 'Low', color: '#4B5563', bg: '#F3F4F6', text: '#374151' }
};

// Automatic Department Routing Helper
export function getDepartmentForCategory(categoryName) {
  if (CATEGORY_CONFIG[categoryName]) {
    return CATEGORY_CONFIG[categoryName].department;
  }
  return 'University General Administration';
}
