const express = require('express');
const router = express.Router();
const pool = require('../db');
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');

// GET /api/drives -> list all drives, with the company name joined in
router.get('/', verifyToken, asyncHandler(async (req, res) => {
  const [rows] = await pool.query(`
    SELECT drives.*, companies.name AS company_name
    FROM drives
    JOIN companies ON drives.company_id = companies.id
    ORDER BY drives.drive_date ASC
  `);
  res.json(rows);
}));

// GET /api/drives/:id -> a single drive's details
router.get('/:id', verifyToken, asyncHandler(async (req, res) => {
  const [rows] = await pool.query(`
    SELECT drives.*, companies.name AS company_name
    FROM drives
    JOIN companies ON drives.company_id = companies.id
    WHERE drives.id = ?
  `, [req.params.id]);

  if (rows.length === 0) return res.status(404).json({ message: 'Drive not found.' });
  res.json(rows[0]);
}));

// POST /api/drives -> only an admin can open a new drive
router.post('/', verifyToken, verifyAdmin, asyncHandler(async (req, res) => {
  const { company_id, role, package_offered, min_cgpa, drive_date } = req.body;
  if (!company_id || !role) {
    return res.status(400).json({ message: 'Company and role are required.' });
  }

  const [result] = await pool.query(
    'INSERT INTO drives (company_id, role, package_offered, min_cgpa, drive_date) VALUES (?, ?, ?, ?, ?)',
    [company_id, role, package_offered || null, min_cgpa || 0, drive_date || null]
  );
  res.status(201).json({ id: result.insertId });
}));

// PUT /api/drives/:id -> admin edits a drive (e.g. raises the CGPA cutoff, changes the package)
router.put('/:id', verifyToken, verifyAdmin, asyncHandler(async (req, res) => {
  const { role, package_offered, min_cgpa, drive_date } = req.body;
  if (!role) return res.status(400).json({ message: 'Role is required.' });

  await pool.query(
    'UPDATE drives SET role = ?, package_offered = ?, min_cgpa = ?, drive_date = ? WHERE id = ?',
    [role, package_offered || null, min_cgpa || 0, drive_date || null, req.params.id]
  );
  res.json({ message: 'Drive updated.' });
}));

// DELETE /api/drives/:id -> admin closes/removes a drive
// This also removes any applications and saves tied to it (ON DELETE CASCADE).
router.delete('/:id', verifyToken, verifyAdmin, asyncHandler(async (req, res) => {
  await pool.query('DELETE FROM drives WHERE id = ?', [req.params.id]);
  res.json({ message: 'Drive deleted.' });
}));

// PUT /api/drives/:id -> admin edits a drive (e.g. changing the CGPA cutoff)
router.put('/:id', verifyToken, verifyAdmin, asyncHandler(async (req, res) => {
  const { role, package_offered, min_cgpa, drive_date } = req.body;
  if (!role) return res.status(400).json({ message: 'Role is required.' });

  await pool.query(
    'UPDATE drives SET role = ?, package_offered = ?, min_cgpa = ?, drive_date = ? WHERE id = ?',
    [role, package_offered || null, min_cgpa || 0, drive_date || null, req.params.id]
  );
  res.json({ message: 'Drive updated.' });
}));

// DELETE /api/drives/:id -> admin closes/removes a drive
// Cascades: every application and saved-drive tied to this drive is deleted too.
router.delete('/:id', verifyToken, verifyAdmin, asyncHandler(async (req, res) => {
  await pool.query('DELETE FROM drives WHERE id = ?', [req.params.id]);
  res.json({ message: 'Drive deleted.' });
}));

module.exports = router;
