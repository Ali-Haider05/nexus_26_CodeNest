# CampusConnect frontend

React, Vite, Tailwind CSS, and Recharts.

Run locally from this directory:

    npm ci
    npm run dev

The dev server defaults to port 3000. The frontend uses the live Render API by default. For a different API, copy .env.example to .env and set VITE_API_URL. Vite exposes this URL to the browser, so do not put credentials in it.

Students can register, submit complaints with optional images up to about 1.5 MB, and track their complaints and department responses. Department admins can update statuses and send responses. Super admins can filter the registry across departments. The backend enforces ownership and roles.

Use npm run build for a production build.
