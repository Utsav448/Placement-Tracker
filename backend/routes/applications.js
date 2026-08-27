const express = require('express');
const router = express.Router();
const pool = require('../db');
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

// POST /api/applications -> a logged-in student applies to a drive
router.post('/', verifyToken, asyncHandler(async (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ message: 'Only students can apply.' });
  }

  const { drive_id } = req.body;
  if (!drive_id) return res.status(400).json({ message: 'drive_id is required.' });

  try {
    // Eligibility check: compare the student's CGPA against the drive's minimum.
    const [[student]] = await pool.query('SELECT cgpa FROM students WHERE id = ?', [req.user.id]);
    const [[drive]] = await pool.query('SELECT min_cgpa FROM drives WHERE id = ?', [drive_id]);

    if (!drive) return res.status(404).json({ message: 'Drive not found.' });

    if (Number(student.cgpa) < Number(drive.min_cgpa)) {
      return res.status(403).json({
        message: `You don't meet the eligibility criteria for this drive (requires ${drive.min_cgpa} CGPA, you have ${student.cgpa}).`
      });
    }

    // One-offer policy: most campuses don't let an already-placed student apply elsewhere.
    const [[alreadyPlaced]] = await pool.query(
      `SELECT applications.id FROM applications WHERE student_id = ? AND status = 'Selected' LIMIT 1`,
      [req.user.id]
    );
    if (alreadyPlaced) {
      return res.status(403).json({ message: 'You already have an offer. Further applications are not allowed under the one-offer policy.' });
    }

    await pool.query(
      'INSERT INTO applications (student_id, drive_id) VALUES (?, ?)',
      [req.user.id, drive_id]
    );
    res.status(201).json({ message: 'Applied successfully.' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'You already applied to this drive.' });
    }
    throw err;
  }
}));

// GET /api/applications/student/:id -> a student's own applications
router.get('/student/:id', verifyToken, asyncHandler(async (req, res) => {
  if (req.user.role === 'student' && req.user.id != req.params.id) {
    return res.status(403).json({ message: 'You can only view your own applications.' });
  }

  const [rows] = await pool.query(`
    SELECT applications.*, drives.role, drives.package_offered, drives.drive_date, companies.name AS company_name
    FROM applications
    JOIN drives ON applications.drive_id = drives.id
    JOIN companies ON drives.company_id = companies.id
    WHERE applications.student_id = ?
    ORDER BY applications.applied_on DESC
  `, [req.params.id]);

  res.json(rows);
}));

// GET /api/applications/drive/:id -> admin view: everyone who applied to one drive
router.get('/drive/:id', verifyToken, verifyAdmin, asyncHandler(async (req, res) => {
  const [rows] = await pool.query(`
    SELECT applications.*, students.name AS student_name, students.email, students.roll_no, students.cgpa, students.resume_link, drives.min_cgpa
    FROM applications
    JOIN students ON applications.student_id = students.id
    JOIN drives ON applications.drive_id = drives.id
    WHERE applications.drive_id = ?
    ORDER BY applications.applied_on ASC
  `, [req.params.id]);

  res.json(rows);
}));

// PUT /api/applications/:id/status -> admin moves a student between statuses
router.put('/:id/status', verifyToken, verifyAdmin, asyncHandler(async (req, res) => {
  const { status } = req.body;
  const allowed = ['Applied', 'Shortlisted', 'Selected', 'Rejected'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ message: 'Invalid status value.' });
  }

  await pool.query('UPDATE applications SET status = ? WHERE id = ?', [status, req.params.id]);
  res.json({ message: 'Status updated.' });
}));

// DELETE /api/applications/:id -> a student withdraws their own application
router.delete('/:id', verifyToken, asyncHandler(async (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ message: 'Only students can withdraw applications.' });
  }

  const [[application]] = await pool.query('SELECT * FROM applications WHERE id = ?', [req.params.id]);
  if (!application) return res.status(404).json({ message: 'Application not found.' });

  if (application.student_id !== req.user.id) {
    return res.status(403).json({ message: 'You can only withdraw your own application.' });
  }

  if (application.status !== 'Applied') {
    return res.status(400).json({ message: `Can't withdraw - you've already been marked "${application.status}" for this drive.` });
  }

  await pool.query('DELETE FROM applications WHERE id = ?', [req.params.id]);
  res.json({ message: 'Application withdrawn.' });
}));

module.exports = router;
