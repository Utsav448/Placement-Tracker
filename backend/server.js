const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const companyRoutes = require('./routes/companies');
const driveRoutes = require('./routes/drives');
const applicationRoutes = require('./routes/applications');
const statsRoutes = require('./routes/stats');
const studentRoutes = require('./routes/students');
const savedRoutes = require('./routes/saved');

const app = express();

app.use(cors());
app.use(express.json()); // lets us read JSON sent from the frontend as req.body

// API routes - everything the frontend talks to
app.use('/api/auth', authRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/drives', driveRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/saved', savedRoutes);

// Serve the frontend (plain HTML/CSS/JS) from the same server.
// This means ONE deployment serves both the site and the API - no CORS headaches.
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// Central error handler - ANY error passed via next(err) from any route
// (through asyncHandler) lands here instead of crashing the whole server.
// This must be defined LAST, after all other app.use() and routes.
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Something went wrong on the server. Please try again.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Placement Tracker server running on port ${PORT}`);
});

// Last-resort safety net: if something still slips through uncaught,
// log it instead of letting the whole server process die.
process.on('unhandledRejection', (err) => {
  console.error('Unhandled promise rejection (server kept running):', err);
});
