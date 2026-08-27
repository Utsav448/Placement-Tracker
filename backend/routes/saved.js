const express = require('express');
const router = express.Router();
const pool = require('../db');
const { verifyToken } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

// GET /api/saved -> the logged-in student's saved drives, with company + drive info
router.get('/', verifyToken, asyncHandler(async (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ message: 'Students only.' });
  }
  const [rows] = await pool.query(`
    SELECT saved_drives.id AS saved_id, drives.*, companies.name AS company_name
    FROM saved_drives
    JOIN drives ON saved_drives.drive_id = drives.id
    JOIN companies ON drives.company_id = companies.id
    WHERE saved_drives.student_id = ?
    ORDER BY saved_drives.saved_at DESC
  `, [req.user.id]);
  res.json(rows);
}));

// POST /api/saved -> save (bookmark) a drive
router.post('/', verifyToken, asyncHandler(async (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ message: 'Students only.' });
  }
  const { drive_id } = req.body;
  if (!drive_id) return res.status(400).json({ message: 'drive_id is required.' });

  try {
    await pool.query('INSERT INTO saved_drives (student_id, drive_id) VALUES (?, ?)', [req.user.id, drive_id]);
    res.status(201).json({ message: 'Saved.' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Already saved.' });
    }
    throw err; // let the central error handler deal with anything else
  }
}));

// DELETE /api/saved/:driveId -> remove a bookmark
router.delete('/:driveId', verifyToken, asyncHandler(async (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ message: 'Students only.' });
  }
  await pool.query('DELETE FROM saved_drives WHERE student_id = ? AND drive_id = ?', [req.user.id, req.params.driveId]);
  res.json({ message: 'Removed.' });
}));

module.exports = router;
