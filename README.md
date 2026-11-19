# CampusConnect

CampusConnect is Team CodeNest's NEXUS'26 competition project. It gives students one place to file campus complaints and follow their progress. Department administrators handle complaints assigned to their department, and the super administrator can review complaints and reports across departments.

## Team and live links

**Team CodeNest**

- Syed Ali Haider (team leader)
- Wahab Qadeer

| Service | Link |
| --- | --- |
| Backend | [Render API](https://nexus-26-codenest.onrender.com) |
| Health check | [Database connectivity](https://nexus-26-codenest.onrender.com/health) |
| Frontend | [add Vercel URL] |

See the [API reference](docs/API.md) and [database reference](docs/DATABASE.md).

## Tech stack

| Technology | Why it is used |
| --- | --- |
| React | Builds the sign-in screens and role-based dashboards from reusable components. |
| Vite | Runs the frontend locally and builds the production assets. |
| Tailwind CSS | Styles the responsive screens and shared controls. |
| Recharts | Draws complaint charts, including department comparisons, status distribution and trends. |
| Node.js | Runs the backend JavaScript and seed script. |
| Express | Routes HTTP requests and applies authentication, authorization and request middleware. |
| PostgreSQL on Neon | Stores related complaint records with foreign keys and supports transactional updates and SQL reports. |
| JWT | Carries the signed user ID, role and department for authenticated requests. |
| bcryptjs | Hashes passwords and verifies submitted passwords against their stored hashes. |
| Render | Hosts the Express API separately from the browser app. |
| Vercel | Hosts the built frontend and uses the repository's SPA rewrite. |
| UptimeRobot | Can monitor the public health endpoint from outside the app. No monitor configuration is kept in this repository. |

## Architecture

The browser loads the React app and calls the Express API over HTTP. It reads the API address from `VITE_API_URL` and defaults to the live Render URL. Express enables CORS for the separate frontend origin and uses a `pg` connection pool to query Neon. Only the backend connects to the database.

For protected requests the browser sends a JWT as a Bearer token. The backend's `authenticate` middleware verifies the signature and expiry and reads the user ID, role and department. Routes that require a role use `authorize`. The route then applies its ownership or department check before returning or changing data. Detail routes first look up the record to check its owner or department. Lists, reports and exports apply the scope in the SQL query. SQL parameters carry request values separately from the query text.

~~~text
backend/
  server.js           Express setup, route mounts and health check
  db.js               PostgreSQL connection pool
  schema.sql          Database tables and constraints
  seed.js             Applies the schema and seeds departments and admins
  middleware/auth.js  JWT verification and role checks
  routes/             Auth, complaints, notifications, feedback and stats

frontend/
  index.html          SPA entry page
  vite.config.js      React, Tailwind CSS and development server setup
  vercel.json         SPA fallback to /index.html
  public/             Static public assets
  src/
    main.jsx          App bootstrap and silent health request
    App.jsx           Sign-in and dashboard selection
    context/          Authentication and session state
    services/         API client and auth, complaint and analytics helpers
    components/       Role views, layout, shared controls and modals
    constants/        Shared categories, departments and styles
    assets/           Imported assets
~~~

## Roles and features

| Role | What the user can do |
| --- | --- |
| Student | Register, sign in, submit a complaint with an optional image, search and filter their own complaints, read department responses, follow the dated tracking timeline, export their own complaints to CSV, and rate a resolved or rejected complaint once with an optional comment. The profile supports adding, replacing or removing a picture and opening the password form on demand. |
| Department Administrator | View and filter the department's queue, update statuses, provide a rejection reason, post responses, review departmental stats and recurring issues, read feedback and average ratings, and export complaints from their own department. The header account menu opens the password form on demand. |
| Super Administrator | Review complaints across departments, filter by department, category, status or search, view the department directory and analytics, review recurring issues and feedback across departments, and export matching complaints. The header account menu opens the password form on demand. |

All signed-in roles have a notification bell with an unread count, links to related complaints and a mark-all-as-read action. Complaint submissions and student feedback notify the relevant department administrators and super administrators. Status changes and administrative responses notify the student. The sidebar can collapse to icons, remembers the setting in browser storage and opens as a drawer on mobile.

The student profile resizes a selected picture to a 256 × 256 JPEG before upload. A saved picture appears in the profile, sidebar and header. The avatar API also accepts updates from other signed-in roles. There is a silent health request on app startup. Sign-in and registration display a wake-up message after five seconds and allow up to 60 seconds for a response. An early network failure is held until that minute has elapsed.

## Category routing

The server chooses the department from the selected category and looks it up in PostgreSQL. A `department_id` sent by the client during complaint creation is ignored.

| Student selects | Server assigns |
| --- | --- |
| Cafeteria | Cafeteria |
| Library | Library |
| Laboratories & IT Facilities | Laboratory / IT |
| Teaching & Academic Affairs | Teaching / Academic |

## Security

- Public registration always creates a `student` account. Administrator accounts come from the seed script.
- The API checks roles in addition to any controls shown in the browser. Department admins can only read and change complaints in their department. A direct complaint lookup outside that scope returns `403`. Student complaint detail and feedback routes also check ownership. Lists and reports are scoped to the caller.
- Passwords are stored as bcrypt hashes. The API never returns the hash. Password changes require the current password.
- Queries bind request values as SQL parameters. Complaint creation derives the student ID from the JWT and the department from the category.
- CSV exports use a UTF-8 byte order mark, quote all fields and prefix potential spreadsheet formulas with an apostrophe. Exports omit image data and password hashes.
- Runtime secrets are supplied through backend environment variables. Keep local `.env` files private and out of Git. Frontend Vite variables are visible in the browser and should contain public configuration only.

## Run locally

Use separate terminals for the backend and frontend. The following angle-bracket values are placeholders.

**Backend.** Create `backend/.env` with the following settings.

| Variable | Value to supply |
| --- | --- |
| `DATABASE_URL` | `<private PostgreSQL connection setting>` |
| `JWT_SECRET` | `<private signing value>` |
| `SEED_ADMIN_PASSWORD` | `<private seed credential>` |
| `PORT` | Optional local port. The backend defaults to 5000. |

In the backend directory, install dependencies, apply the schema and seed data, then start the server.

~~~sh
cd backend
npm install
npm run seed
npm start
~~~

The seed command applies `schema.sql` and adds missing departments and administrator accounts. It leaves existing seeded accounts in place.

**Frontend.** Create `frontend/.env` or copy `frontend/.env.example`. Set `VITE_API_URL` to `<local backend origin>` so the frontend uses your local API. If omitted, the app uses the live Render API.

~~~sh
cd frontend
npm install
npm run dev
~~~

Open the URL printed by Vite. The development port in the project configuration is 3000.

## Deployment

1. **Neon.** Create a PostgreSQL database. Put its private connection setting in your backend environment as `DATABASE_URL`. From `backend`, install dependencies and run `npm run seed` with `SEED_ADMIN_PASSWORD` set to apply the schema and add the four departments and five admins.
2. **Render.** Create a web service from the repository with root directory `backend`. Use `npm install` as the build command and `npm start` as the start command. Set `DATABASE_URL` and `JWT_SECRET` in the service environment. Open the public `/health` endpoint to check the database connection.
3. **Vercel.** Import the repository with root directory `frontend`. Set `VITE_API_URL` to the public Render origin. Build with `npm run build` and serve the `dist` output. The included `vercel.json` rewrites SPA paths to `/index.html`.
4. **Optional monitoring.** An UptimeRobot HTTP monitor can check the Render `/health` URL. Monitor setup is external to this repository.

## Demo accounts

The password is shared with the judges in the submission.

| Role | Email |
| --- | --- |
| Super Administrator | super@campusconnect.com |
| Cafeteria Administrator | cafeteria@campusconnect.com |
| Library Administrator | library@campusconnect.com |
| Laboratory / IT Administrator | lab@campusconnect.com |
| Teaching / Academic Administrator | teaching@campusconnect.com |

## Eight-function competition mapping

The official problem statement is not included in the repository. The following eight areas summarize the implemented functionality for the competition demonstration.

| # | Function | What CampusConnect implements |
| --- | --- | --- |
| 1 | Account access | Student registration, sign-in, JWT sessions and role-based dashboards. |
| 2 | Complaint submission | A category, title, description and optional image. |
| 3 | Department routing | A server-side map assigns complaints to one of four departments. |
| 4 | Department handling | Department queues, status changes, rejection reasons and written responses. |
| 5 | Student tracking | A personal complaint list, dated status history and in-app notifications. |
| 6 | Feedback and ratings | One rating per resolved or rejected complaint and scoped feedback reports for administrators. |
| 7 | Central oversight | The super administrator can review and filter complaints across departments. |
| 8 | Analytics and reporting | Scoped dashboards, recurring-issue counts and downloadable CSV reports. |

## Known limitations and future improvements

| Current limitation | Possible improvement |
| --- | --- |
| Complaint attachments and profile pictures are base64 data URLs stored as database text. | Store media in object storage and keep references in PostgreSQL. |
| In-app notifications refresh every 30 seconds while signed in. | Deliver live updates with server-sent events or WebSockets. |
| Free hosting can introduce a cold start. The app shows a wake-up message during a slow sign-in. | Use an always-on service if a predictable response time is needed. |

## Questions judges may ask

**Why PostgreSQL?** Complaints relate to students, departments, responses, history, notifications and feedback. Foreign keys enforce those relationships, and SQL handles the counts and reports.

**How does complaint routing work?** The server maps the submitted category to a department name, looks up that department and assigns its ID to the new complaint.

**How is department isolation enforced?** The server verifies the JWT, checks the role, and uses its department ID in complaint access checks and SQL filters. A department admin cannot expand that scope by sending a different department ID.

**How are passwords protected?** The backend hashes passwords with bcrypt and returns user fields without the hash. A password change verifies the current password before saving a new hash.

**How does login work?** The API checks the submitted email and password and returns a signed JWT with a seven-day expiry. The browser stores the token, sends it as a Bearer token and calls `/api/auth/me` when it restores the session after a refresh.
