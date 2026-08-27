# Student Placement Tracker

A simple full-stack app: **Node.js + Express** backend, **MySQL** database, and a plain **HTML/CSS/JS** frontend (no framework, no build step) served by the same Express server.

## What it does
- Students register, log in, browse open placement drives, and apply
- Admins (placement officers) add companies, open drives, and move applicants through statuses: Applied → Shortlisted → Selected / Rejected

## Folder structure
```
placement-tracker/
  backend/
    server.js          # starts Express, wires up routes, serves the frontend
    db.js               # MySQL connection pool
    schema.sql           # run this once to create the database + tables
    middleware/auth.js   # checks login token, checks admin role
    routes/
      auth.js            # register + login
      companies.js
      drives.js
      applications.js
    .env.example         # copy to .env and fill in your values
    package.json
  frontend/
    index.html            # login / register
    student-dashboard.html
    my-applications.html
    admin-dashboard.html
    applicants.html
    css/style.css
    js/api.js              # shared fetch() helper
```

## Run it locally

1. **Install MySQL** (if you don't have it) and start it.
2. **Create the database:**
   ```
   mysql -u root -p < backend/schema.sql
   ```
   This also seeds one admin login: `admin@placement.com` / `admin123`

   **If you already ran schema.sql before** (existing database), just run the small migration instead to add the new Saved Drives table:
   ```
   mysql -u root -p < backend/migration_add_saved_drives.sql
   ```
3. **Configure environment variables:**
   ```
   cd backend
   cp .env.example .env
   ```
   Edit `.env` with your real MySQL username/password and a random `JWT_SECRET`.
4. **Install dependencies and start the server:**
   ```
   npm install
   npm start
   ```
5. Open **http://localhost:5000** in your browser. Register a student account, or log in as admin with the seed account above.

## Deploying it (so you have a live link)

Because Express serves the frontend *and* the API from one server, you only need to deploy **one service** plus a MySQL database.

**Step 1 — Get a free hosted MySQL database.**
Options: [Railway](https://railway.app), [Aiven](https://aiven.io), or [Clever Cloud](https://www.clever-cloud.com) all have free/trial MySQL. Create one, then run your `schema.sql` against it (most give you a web console or connection string you can use with a MySQL client).

**Step 2 — Deploy the backend.**
Push this project to a GitHub repo, then deploy on [Render](https://render.com) (free tier) or [Railway](https://railway.app):
- Root directory: `backend`
- Build command: `npm install`
- Start command: `npm start`
- Add environment variables (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`) matching your hosted MySQL from Step 1.

That's it — Render/Railway will give you a live URL, and since Express serves the frontend too, that same URL is your whole website.

## Explaining it in your interview

- **Architecture:** one Express server exposes REST APIs under `/api/*` and also serves static frontend files — so it's one deployable unit, no CORS complexity.
- **Database:** 5 tables — `students`, `admins`, `companies`, `drives`, `applications`. `applications` is the link table connecting students to drives (many-to-many), and it's where the status is tracked.
- **Auth:** passwords are hashed with bcrypt before storing; login returns a JWT token that the frontend stores and sends back on every request; middleware checks that token and, for admin-only routes, checks the role inside it.
- **Frontend:** plain HTML/CSS/JS, no framework — each page calls the API with `fetch()` through a small shared helper (`api.js`) and renders the response into the page.
