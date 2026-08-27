\# Student Placement Tracker



A placement tracker for campus recruitment - students can browse and apply to drives, admins can post drives and track applicants.



Built with Node.js/Express on the backend, MySQL for the database, and plain HTML/CSS/JS on the frontend (no framework).



\## Features



\- Student and admin login (separate roles)

\- Students can browse open drives, apply, save drives for later, and track their application status

\- CGPA eligibility check - can't apply if you don't meet the cutoff

\- One-offer rule - once selected somewhere, you can't apply to more drives

\- Admin can add/edit/delete companies and drives, view applicants per drive, update status

\- Basic placement stats (total students, drives, placement %)



\## Folder structure



backend/

server.js - Express app entry point

db.js - MySQL connection

schema.sql - database tables

middleware/ - auth check, error handling

routes/ - one file per resource (auth, companies, drives, applications, etc)

frontend/

\*.html - each page

css/style.css

js/api.js - fetch helper used by every page





\## Running it locally



1\. Install MySQL if you don't have it.

2\. Create the database:



mysql -u root -p < backend/schema.sql



&#x20;  This seeds an admin account: `admin@placement.com` / `admin123`



&#x20;  If you already have the DB set up and just need the newer saved\_drives table:



mysql -u root -p < backend/migration\_add\_saved\_drives.sql





3\. Set up env variables:



cd backend

cp .env.example .env



&#x20;  fill in your MySQL password and a JWT secret in `.env`



4\. Install and run:



npm install

npm start





5\. Open `http://localhost:5000`



\## Notes



\- Passwords are hashed with bcrypt before being stored.

\- Login returns a JWT token, stored in localStorage on the frontend, sent back on every API call.

\- Express serves both the API (`/api/\*`) and the frontend static files, so it's one deployable service.

