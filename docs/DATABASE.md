# CampusConnect database

CampusConnect uses PostgreSQL on Neon. [schema.sql](../backend/schema.sql) defines the seven tables. All `TIMESTAMP` columns use PostgreSQL timestamps without a time zone. A default supplies a value when a column is omitted. It does not make the column required.

## departments

Each complaint is assigned to a department. Department administrators also use this table for their assigned department.

| Column | Type | Constraints |
| --- | --- | --- |
| `id` | `SERIAL` | Primary key. |
| `name` | `TEXT` | Required and unique. |

The seed script adds Cafeteria, Library, Laboratory / IT, and Teaching / Academic.

## users

Stores student and administrator accounts.

| Column | Type | Constraints |
| --- | --- | --- |
| `id` | `SERIAL` | Primary key. |
| `name` | `TEXT` | Required. |
| `email` | `TEXT` | Required and unique. |
| `password_hash` | `TEXT` | Required. Stores a bcrypt hash. |
| `role` | `TEXT` | Required. Check allows `student`, `dept_admin`, or `super_admin`. |
| `department_id` | `INT` | Optional. References `departments.id`. |
| `created_at` | `TIMESTAMP` | Nullable. Defaults to `NOW()`. |
| `avatar_url` | `TEXT` | Optional. Added with a repeatable `ALTER TABLE`. The API accepts a supported base64 image data URL or null. |

Public registration sets the student role. The seed script creates department admins with a department and a super admin with no department.

## complaints

Stores the submitted complaint and its current state.

| Column | Type | Constraints |
| --- | --- | --- |
| `id` | `SERIAL` | Primary key. |
| `student_id` | `INT` | Required. References `users.id`. |
| `department_id` | `INT` | Required. References `departments.id`. |
| `category` | `TEXT` | Required. The API validates it against the routing map. |
| `title` | `TEXT` | Required. |
| `description` | `TEXT` | Required. |
| `image_url` | `TEXT` | Optional. The frontend submits an attachment as a base64 data URL. |
| `status` | `TEXT` | Required. Defaults to `pending`. Check allows `pending`, `in_progress`, `resolved`, or `rejected`. |
| `reject_reason` | `TEXT` | Optional. The status route requires a reason for rejection. |
| `created_at` | `TIMESTAMP` | Nullable. Defaults to `NOW()`. |
| `updated_at` | `TIMESTAMP` | Nullable. Defaults to `NOW()`. The status route sets it on updates. |

## responses

Stores remarks from department admins. A remark may come from a status update or a standalone response.

| Column | Type | Constraints |
| --- | --- | --- |
| `id` | `SERIAL` | Primary key. |
| `complaint_id` | `INT` | Required. References `complaints.id` with delete cascade. |
| `admin_id` | `INT` | Required. References `users.id`. |
| `remark` | `TEXT` | Required. |
| `created_at` | `TIMESTAMP` | Nullable. Defaults to `NOW()`. |

## complaint_history

Stores the initial submission and later status changes. For older complaints without a stored submission entry, the detail route derives a synthetic entry from the complaint record.

| Column | Type | Constraints |
| --- | --- | --- |
| `id` | `SERIAL` | Primary key. |
| `complaint_id` | `INT` | Required. References `complaints.id` with delete cascade. |
| `status` | `TEXT` | Required. Stores the status recorded by the complaint route. |
| `note` | `TEXT` | Optional. Stores the submission note or an administrator remark. |
| `changed_by` | `INT` | Optional. References `users.id`. |
| `created_at` | `TIMESTAMP` | Nullable. Defaults to `NOW()`. |

## notifications

Stores in-app notifications for individual users.

| Column | Type | Constraints |
| --- | --- | --- |
| `id` | `SERIAL` | Primary key. |
| `user_id` | `INT` | Required. References `users.id` with delete cascade. |
| `complaint_id` | `INT` | Optional. References `complaints.id` with delete cascade. |
| `message` | `TEXT` | Required. |
| `is_read` | `BOOLEAN` | Required. Defaults to `FALSE`. |
| `created_at` | `TIMESTAMP` | Nullable. Defaults to `NOW()`. |

## feedback

Stores one student rating per complaint. The API limits submission to the complaint owner when the complaint is resolved or rejected.

| Column | Type | Constraints |
| --- | --- | --- |
| `id` | `SERIAL` | Primary key. |
| `complaint_id` | `INT` | Required and unique. References `complaints.id` with delete cascade. |
| `student_id` | `INT` | Required. References `users.id`. |
| `department_id` | `INT` | Required. References `departments.id`. |
| `rating` | `INT` | Required. Check allows integers from 1 to 5. |
| `comment` | `TEXT` | Optional. The API limits it to 1,000 characters. |
| `created_at` | `TIMESTAMP` | Nullable. Defaults to `NOW()`. |

## Relationships

~~~text
departments  1 ---- 0..* users              (department_id, optional on user)
departments  1 ---- 0..* complaints         (department_id)
departments  1 ---- 0..* feedback           (department_id)

users        1 ---- 0..* complaints         (student_id)
users        1 ---- 0..* responses          (admin_id)
users        1 ---- 0..* complaint_history  (changed_by, optional on history entry)
users        1 ---- 0..* notifications      (user_id)
users        1 ---- 0..* feedback           (student_id)

complaints   1 ---- 0..* responses          (complaint_id)
complaints   1 ---- 0..* complaint_history  (complaint_id)
complaints   1 ---- 0..* notifications      (complaint_id, optional on notification)
complaints   1 ---- 0..1 feedback           (unique complaint_id)
~~~

Deleting a complaint cascades to its responses, history, notifications and feedback. Deleting a user cascades to that user's notifications. The other listed foreign keys use PostgreSQL's default delete behavior. The API enforces rules such as complaint ownership and department access. Those rules are separate from the foreign keys.

Stats, recurring issues and average ratings are calculated by queries. They have no separate tables.
