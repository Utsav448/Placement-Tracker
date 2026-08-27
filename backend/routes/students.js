const express = require('express');
const router = express.Router();
const pool = require('../db');
const { verifyToken } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

// GET /api/students/me -> the logged-in student's own profile
router.get('/me', verifyToken, asyncHandler(async (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ message: 'Students only.' });
  }
  const [[student]] = await pool.query(
    'SELECT id, name, email, roll_no, branch, cgpa, resume_link FROM students WHERE id = ?',
    [req.user.id]
  );
  res.json(student);
}));

// PUT /api/students/me -> update just the resume link
router.put('/me', verifyToken, asyncHandler(async (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ message: 'Students only.' });
  }
  const { resume_link } = req.body;
  await pool.query('UPDATE students SET resume_link = ? WHERE id = ?', [resume_link || null, req.user.id]);
  res.json({ message: 'Profile updated.' });
}));

module.exports = router;
