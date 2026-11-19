# CampusConnect — Smart Campus Complaint & Feedback Management System
### BIIT Software Engineering Society Application Development Competition

CampusConnect is a modern, responsive, university-grade web frontend built for the BIIT Software Engineering Society Application Development Competition. It provides an intuitive, high-efficiency interface for students to lodge campus grievances, upload original photographs, track real-time investigation progress, view departmental responses, and submit satisfaction feedback, while empowering Department Administrators and the Central Super Administrator with comprehensive complaint triage, auditing, and analytical reporting.

---

## 1. Technologies & Architecture

- **Framework**: React 19 + Vite 8
- **Styling**: Tailwind CSS v4 + Custom University Token Engine
- **Icons**: Lucide React
- **Data Visualization**: Recharts (Department Comparison Bar Charts, Donut Distribution, Longitudinal Trend lines)
- **State & Storage**: React Context API (`AuthContext`) + Clean Token/Session Storage
- **API Client**: Centralized Fetch API Client (`src/services/api.js`) with `FormData` multipart upload support, Bearer token authentication, timeout control, and 401/403 lifecycle handling.

---

## 2. University Design System & Color Palette

CampusConnect strictly adheres to the university's official design system:

| Role / Element | Color Name | HEX Code | Usage |
|---|---|---|---|
| Primary Brand | Deep Forest Green | `#153F35` | Sidebar, primary brand banners, headers |
| Secondary Green | Emerald | `#247653` | Primary action buttons, success accents |
| Hover / Active | Dark Green | `#194D40` | Hover states, active navigation pills |
| Main Background | Warm Ivory | `#F5F2E9` | Application viewport backdrop |
| Card Background | Pure White | `#FFFFFF` | Rounded cards (16px), modals, navbar |
| Primary Accent | Vibrant Orange | `#F18B38` | Call-to-actions, badges, important alerts |
| Main Text | Charcoal | `#24332D` | High contrast headings & body text |
| Secondary Text | Muted Grey | `#77847D` | Timestamps, metadata, labels |
| Borders | Soft Grey | `#E5E9E4` | Card & table borders |

### Complaint Status System
- **Pending**: `#D97706` (Waiting for departmental review)
- **Under Review**: `#7C5CC4` (Complaint is being assessed)
- **In Progress**: `#2563EB` (Complaint is being investigated)
- **Resolved**: `#16834A` (Issue successfully resolved)
- **Rejected**: `#DC4545` (Complaint rejected with mandatory reason)

### Official Categories & Automatic Department Routing
- **Cafeteria** (`#EA873B`) → **Cafeteria Administration**
- **Library** (`#8662B8`) → **Library Administration**
- **Laboratories & IT Facilities** (`#397CC5`) → **Laboratory / IT Administration**
- **Teaching & Academic Affairs** (`#248B83`) → **Teaching / Academic Administration**

---

## 3. Implemented Capabilities & Highlights

### 1. Profile Picture Upload & Update (`StudentProfileView.jsx`, `authService.js`)
- Displays current user avatar.
- On hover: reveals an animated camera overlay with "Change Photo".
- Opens device native file picker (`image/png`, `image/jpeg`, `image/webp`, max 5MB).
- Image preview dialog before saving, with Save and Cancel actions.
- Sends file via `multipart/form-data` to `POST /api/users/profile-picture`.
- Updates user avatar across Navbar, Sidebar, and Profile simultaneously upon successful response.

### 2. Original Complaint Text & Photograph Attachment (`ComplaintSubmitForm.jsx`, `complaintService.js`)
- **Preserves Student's Original Text**: Exactly what the student writes is submitted without AI modification, automatic rewriting, expansion, or summarization.
- **Original Device Photograph**: Drag-and-drop or file picker dropzone supporting PNG, JPG, WebP up to 10MB.
- Shows image preview, original filename, and file size with Replace/Remove controls.
- Transmits via `multipart/form-data` to `POST /api/complaints`.

### 3. Super Admin Application-Wide Access (`SuperAdminOverview.jsx`, `AllComplaintsView.jsx`)
- Complete centralized visibility of all complaints across all BIIT departments.
- Search by ID, title, and student.
- Filter by department, category, and status.
- Pagination for large complaint queues (10 per page).
- **Recent Campus Grievances (All Departments)**: Fully functional, real-time feed with search, status filters, and pagination.
- **Required Bar Chart (§4.3)**: Dynamic department complaint volume comparison.
- **CSV Report Export**: 1-click download of filtered grievances.

### 4. Departmental Administrator Workspace (`DepartmentOverview.jsx`, `AssignedComplaintsView.jsx`)
- Strictly shows complaints belonging to the administrator's assigned department (obtained from backend session).
- Filter by status (Pending, Under Review, In Progress, Resolved, Rejected).
- Status Update & Remarks Modal with mandatory rejection reason when rejecting.

### 5. Clean Data Architecture — No Dummy Data
- All hardcoded users, demo accounts, and fake mock complaints have been removed.
- All dashboards load actual data fetched from real backend APIs.
- Clean, professional empty states render when no complaints exist.

---

## 4. Backend Endpoints Contract

| Endpoint | Method | Payload / Format | Purpose |
|---|---|---|---|
| `/health` | `GET` | None | PostgreSQL connection health check |
| `/api/auth/login` | `POST` | JSON: `{ email, password }` | Authenticate user & return `{ token, user }` |
| `/api/auth/register` | `POST` | JSON: `{ name, email, studentId, department, password }` | Student registration |
| `/api/auth/logout` | `POST` | None | Invalidate session |
| `/api/users/profile-picture` | `POST` | `multipart/form-data` (`avatar` / `profilePicture`) | Update profile picture |
| `/api/complaints` | `GET` | Query params: `status`, `category`, `department`, `priority`, `search` | Fetch complaints |
| `/api/complaints` | `POST` | `multipart/form-data` or JSON: `{ title, description, category, department, priority, image }` | Submit original complaint |
| `/api/complaints/:id` | `GET` | None | Get single complaint audit details |
| `/api/complaints/:id/status` | `PATCH` | JSON: `{ status, remarks, rejectionReason, adminName }` | Triage complaint status |
| `/api/complaints/:id/feedback` | `POST` | JSON: `{ rating, comment, studentId }` | Student resolution review |
| `/api/notifications` | `GET` | Query: `userId` | User notifications feed |

---

## 5. How to Run & Build

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Start local Vite development server
npm run dev

# Run production build
npm run build

# Preview production build
npm run preview
```
