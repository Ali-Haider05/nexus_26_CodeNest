# CampusConnect API

The API base URL is [the Render service](https://nexus-26-codenest.onrender.com). Use JSON for request bodies unless a route has no body. Express accepts JSON bodies up to 5 MB. CSV is returned as a file.

Send `Authorization: Bearer <token>` for protected routes. The server verifies HS256 tokens. Tokens are valid for seven days and include `id`, `role`, and `department_id`. The three roles are `student`, `dept_admin`, and `super_admin`. **Any** in the access column means any signed-in role.

Application errors generally return `{ "message": "..." }`. The tables list route-level errors. Across the API, Express may also return `400` for malformed JSON, `413` for oversized JSON, and `500` for unexpected failures. Complaint and notification IDs in paths are positive PostgreSQL integers.

## Shared response types

| Name | JSON fields |
| --- | --- |
| User | `id`, `name`, `email`, `role`, `department_id`, `avatar_url`. Department and avatar can be null. |
| Complaint | `id`, `student_id`, `department_id`, `category`, `title`, `description`, `image_url`, `status`, `reject_reason`, `created_at`, `updated_at`. |
| Response summary | `remark`, `admin_name`, `created_at`. |
| Response row | `id`, `complaint_id`, `admin_id`, `remark`, `created_at`. |
| History entry | `id`, `complaint_id`, `status`, `note`, `changed_by`, `created_at`. A synthetic legacy entry has a null ID. |
| Feedback row | `id`, `complaint_id`, `student_id`, `department_id`, `rating`, `comment`, `created_at`. |
| Notification | `id`, `user_id`, `complaint_id`, `message`, `is_read`, `created_at`. Complaint ID can be null. |

Password hashes are never returned.

## Health and authentication

| Method and path | Access | Body or query | Success response | Route errors |
| --- | --- | --- | --- | --- |
| `GET /health` | Public | None | `200` with `{ status: "ok", database: "connected", time }`, where `time` is the database timestamp. | `500` with `{ status: "error", database: "disconnected" }`. |
| `POST /api/auth/register` | Public | `name`, `email`, `password`. The name must be non-empty, the email must have a valid format and the password must have at least eight characters and at most 72 UTF-8 bytes. | `201` with `{ token, user: User }`. Registration always creates a student. | `400` for invalid input, `409` when the email is already used. |
| `POST /api/auth/login` | Public | `email`, `password`. | `200` with `{ token, user: User }`. | `401` for incorrect or invalid credentials. |
| `GET /api/auth/me` | Any | None | `200` with User. | `401` for missing or invalid token or missing user. |
| `PATCH /api/auth/me/avatar` | Any | `avatar_url` as a base64 JPEG, PNG or WebP data URL up to 300,000 characters, or null to remove it. | `200` with the updated User. | `400` for invalid avatar input, `401` for missing or invalid token or missing user. |
| `PATCH /api/auth/password` | Any | `currentPassword`, `newPassword`. The new value must be 8 to 72 UTF-8 bytes. Confirmation is a frontend check. | `200` with `{ message: "Password updated successfully" }`. | `400` for an invalid new password, `401` for a missing or invalid token, wrong current password, missing user or concurrent password change. |

The server trims and lowercases email addresses for lookup and registration. The browser signs out by discarding its stored token.

## Complaints

The statuses are `pending`, `in_progress`, `resolved`, and `rejected`. For valid submission categories, see [Category routing](../README.md#category-routing).

| Method and path | Access | Body or query | Success response | Route errors |
| --- | --- | --- | --- | --- |
| `POST /api/complaints` | Student | `category`, `title`, `description`, and optional `image_url` string or null. A supplied string may be at most 2,000,000 characters. | `201` with Complaint. The server chooses the department, assigns the caller as the student and starts the complaint at `pending`. | `400` for invalid input or a missing department mapping in the database, `401`, `403` for other roles. |
| `GET /api/complaints/mine` | Student | None | `200` with an array of the caller's complaints, newest first, adding `department_name` and `responses` as an array of response summaries. | `401`, `403` for other roles. |
| `GET /api/complaints` | Department admin or super admin | Optional `status`, `category`, `search`, and super-admin-only `department_id`. | `200` with an array of complaints, newest first, adding `student_name` and `department_name`. Department admins see their department. | `400` for invalid filters, `401`, `403` for other roles. |
| `GET /api/complaints/export` | Any | Same query fields as the complaints list. | `200` with a CSV attachment. Students receive their own records, department admins their department's records and super admins all matching records. | `400` for invalid filters, `401`, `403` for disallowed roles. |
| `GET /api/complaints/:id` | Student owner, admin of the complaint's department or super admin | None | `200` with Complaint plus `student_name`, `department_name`, `responses`, `history`, and a `feedback` row when one exists. Responses and history are oldest first. Legacy complaints get a synthetic submission entry when there is no stored submission entry. | `401`, `403` outside the caller's access scope, `404` for an invalid or missing complaint ID. |
| `PATCH /api/complaints/:id/status` | Admin of the complaint's department | `status` is `in_progress`, `resolved`, or `rejected`. `remark` is optional except for rejection and must be non-empty when supplied. | `200` with updated Complaint. A supplied remark also creates a response. A true status change adds a history entry. For rejection, the remark becomes `reject_reason`. | `400` for invalid input or missing rejection reason, `401`, `403` for a disallowed role or department, `404` for an invalid or missing complaint ID. |
| `POST /api/complaints/:id/respond` | Admin of the complaint's department | Non-empty `remark`. | `201` with a response row. | `400` for invalid remark, `401`, `403` for a disallowed role or department, `404` for an invalid or missing complaint ID. |
| `POST /api/complaints/:id/feedback` | Student owner | Integer `rating` from 1 to 5. Optional `comment` string up to 1,000 characters or null. | `201` with a feedback row. The department is copied from the complaint. | `400` for invalid rating or comment, `401`, `403` for a disallowed role or owner, `404` for an invalid or missing complaint ID, `409` if feedback exists or the complaint is neither resolved nor rejected. |

List search matches title or description case-insensitively. Export search also matches complaint ID for students and department admins, and student name for department admins. Category and status are exact matches. `department_id` is ignored for callers who are not super admins. For super admins it must be a positive integer if supplied.

CSV sends `Content-Type: text/csv; charset=utf-8` and an attachment name of `complaints-report-YYYY-MM-DD.csv`. Its columns are ID, Title, Category, Department, Student Name, Status, Description, Reject Reason, Latest Remark, Created At and Updated At. The file begins with a UTF-8 byte order mark. It quotes every field, doubles internal quotes, replaces line breaks inside fields with spaces and protects potential formula cells with an apostrophe. Image data and password hashes are excluded.

## Notifications

| Method and path | Access | Body or query | Success response | Route errors |
| --- | --- | --- | --- | --- |
| `GET /api/notifications` | Any, own records | None | `200` with `{ notifications: Notification[], unread_count }`. The list includes up to 30 records, newest first. The count covers all the caller's unread notifications. | `401`. |
| `PATCH /api/notifications/read-all` | Any, own records | None | `200` with `{ updated_count }`, the number changed to read. | `401`. |
| `PATCH /api/notifications/:id/read` | Any, own record | None | `200` with the updated Notification. | `401`, `404` for an invalid ID, missing record or record belonging to someone else. |

Complaint creation and feedback notify the relevant department admins and super admins. Status changes and admin responses notify the student owner. Notifications are written in the same SQL statement as the activity that triggered them.

## Statistics and feedback reports

Both report types use the caller's department for a department admin and all departments for a super admin.

| Method and path | Access | Body or query | Success response | Route errors |
| --- | --- | --- | --- | --- |
| `GET /api/stats` | Department admin or super admin | None | `200` with `{ totals, byDepartment, byStatus, byCategory, recent }`. See fields below. | `401`, `403` for other roles. |
| `GET /api/stats/recurring` | Department admin or super admin | None | `200` with `{ recurring, byCategoryLast7Days }`. See fields below. | `401`, `403` for other roles. |
| `GET /api/feedback` | Department admin or super admin | None | `200` with `{ feedback, average_rating }`. Entries include `id`, `complaint_id`, `department_id`, `student_name`, `complaint_title`, `rating`, `comment`, and `created_at`. Entries are newest first. `average_rating` is a number or null when there are no ratings. | `401`, `403` for other roles. |

| Statistics key | Contents |
| --- | --- |
| `totals` | Numeric keys `total`, `pending`, `in_progress`, `resolved`, `rejected`. |
| `byDepartment` | Array of `{ department, count }` for visible departments, including zero counts. |
| `byStatus` | Array of `{ status, count }` for all four statuses, including zero counts. |
| `byCategory` | Array of `{ category, count }` for categories found in visible complaints. |
| `recent` | Up to five records with `id`, `title`, `status`, `department_name` and `created_at`. |
| `recurring` | Up to five groups of `{ category, title, count, latest_created_at }`, ordered by count then latest timestamp. Titles are trimmed and lowercased before grouping by category and title. |
| `byCategoryLast7Days` | Array of `{ category, count }` for the last seven days. Categories that appear only in older visible complaints have zero counts. |
