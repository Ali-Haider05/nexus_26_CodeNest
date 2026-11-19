CREATE TABLE IF NOT EXISTS departments (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'dept_admin', 'super_admin')),
  department_id INT REFERENCES departments(id),
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

CREATE TABLE IF NOT EXISTS complaints (
  id SERIAL PRIMARY KEY,
  student_id INT NOT NULL REFERENCES users(id),
  department_id INT NOT NULL REFERENCES departments(id),
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_progress', 'resolved', 'rejected')),
  reject_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS responses (
  id SERIAL PRIMARY KEY,
  complaint_id INT NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  admin_id INT NOT NULL REFERENCES users(id),
  remark TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS complaint_history (
  id SERIAL PRIMARY KEY,
  complaint_id INT NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  note TEXT,
  changed_by INT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  complaint_id INT REFERENCES complaints(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS feedback (
  id SERIAL PRIMARY KEY,
  complaint_id INT NOT NULL UNIQUE REFERENCES complaints(id) ON DELETE CASCADE,
  student_id INT NOT NULL REFERENCES users(id),
  department_id INT NOT NULL REFERENCES departments(id),
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
